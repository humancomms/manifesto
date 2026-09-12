import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const githubPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateUrl(value, label) {
  if (value === undefined) return;
  assert(typeof value === 'string', `${label} must be a string`);
  const url = new URL(value);
  assert(url.protocol === 'https:' || url.protocol === 'http:', `${label} must use http or https`);
}

async function load(kind) {
  const directory = path.join(process.cwd(), 'signatories', kind);
  const entries = await readdir(directory, { withFileTypes: true });
  const signatures = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    assert(slugPattern.test(entry.name), `${kind}/${entry.name}: filename must be lowercase kebab-case`);
    const raw = await readFile(path.join(directory, entry.name), 'utf8');
    const signature = JSON.parse(raw);
    signatures.push({ file: entry.name, ...signature });
  }

  return signatures;
}

function validateIndividual(signature) {
  const allowed = new Set(['file', 'name', 'github', 'url']);
  for (const key of Object.keys(signature)) assert(allowed.has(key), `individuals/${signature.file}: unsupported field '${key}'`);
  assert(typeof signature.name === 'string' && signature.name.trim().length >= 2, `individuals/${signature.file}: name is required`);
  assert(typeof signature.github === 'string' && githubPattern.test(signature.github), `individuals/${signature.file}: valid github username is required`);
  validateUrl(signature.url, `individuals/${signature.file}: url`);
}

function validateOrganization(signature) {
  const allowed = new Set(['file', 'name', 'signedBy', 'url', 'github']);
  for (const key of Object.keys(signature)) assert(allowed.has(key), `organizations/${signature.file}: unsupported field '${key}'`);
  assert(typeof signature.name === 'string' && signature.name.trim().length >= 2, `organizations/${signature.file}: name is required`);
  assert(typeof signature.signedBy === 'string' && githubPattern.test(signature.signedBy), `organizations/${signature.file}: valid signedBy github username is required`);
  assert(typeof signature.url === 'string', `organizations/${signature.file}: url is required`);
  validateUrl(signature.url, `organizations/${signature.file}: url`);
  if (signature.github !== undefined) {
    assert(typeof signature.github === 'string' && githubPattern.test(signature.github), `organizations/${signature.file}: github must be a valid username or organization handle`);
  }
}

function assertUnique(signatures, key, label) {
  const seen = new Map();
  for (const signature of signatures) {
    const value = String(signature[key] ?? '').trim().toLowerCase();
    if (!value) continue;
    assert(!seen.has(value), `${label} '${signature[key]}' is duplicated in ${seen.get(value)} and ${signature.file}`);
    seen.set(value, signature.file);
  }
}

const individuals = await load('individuals');
const organizations = await load('organizations');
individuals.forEach(validateIndividual);
organizations.forEach(validateOrganization);
assertUnique(individuals, 'github', 'Individual github identity');
assertUnique(organizations, 'name', 'Organization name');
assertUnique(organizations, 'url', 'Organization url');

console.log(`Validated ${individuals.length} individual and ${organizations.length} organization signatures.`);
