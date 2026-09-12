import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const githubPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;
const xPattern = /^[A-Za-z0-9_]{1,15}$/;
const linkedinPattern = /^[A-Za-z0-9](?:[A-Za-z0-9-]{1,98}[A-Za-z0-9])?$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.json$/;
const maxFileBytes = 2048;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateName(value, label) {
  assert(typeof value === 'string', `${label} must be a string`);
  const trimmed = value.trim();
  assert(trimmed.length >= 2 && trimmed.length <= 120, `${label} must be between 2 and 120 characters`);
  assert(!/[\r\n\u0000-\u001f]/.test(trimmed), `${label} must be a single printable line`);
}

function validateOptionalHandle(value, pattern, label) {
  if (value === undefined) return;
  assert(typeof value === 'string' && pattern.test(value), `${label} is invalid`);
}

async function load(kind) {
  const directory = path.join(process.cwd(), 'signatories', kind);
  const entries = await readdir(directory, { withFileTypes: true });
  const signatures = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    assert(slugPattern.test(entry.name), `${kind}/${entry.name}: filename must be lowercase kebab-case`);
    const raw = await readFile(path.join(directory, entry.name), 'utf8');
    assert(Buffer.byteLength(raw, 'utf8') <= maxFileBytes, `${kind}/${entry.name}: signature file is too large`);
    const signature = JSON.parse(raw);
    assert(signature && typeof signature === 'object' && !Array.isArray(signature), `${kind}/${entry.name}: JSON object required`);
    signatures.push({ file: entry.name, ...signature });
  }

  return signatures;
}

function validateIndividual(signature) {
  const allowed = new Set(['file', 'name', 'github', 'linkedin', 'x']);
  for (const key of Object.keys(signature)) assert(allowed.has(key), `individuals/${signature.file}: unsupported field '${key}'`);
  validateName(signature.name, `individuals/${signature.file}: name`);
  assert(typeof signature.github === 'string' && githubPattern.test(signature.github), `individuals/${signature.file}: valid github username is required`);
  assert(signature.file === `${signature.github.toLowerCase()}.json`, `individuals/${signature.file}: filename must match github username in lowercase`);
  validateOptionalHandle(signature.linkedin, linkedinPattern, `individuals/${signature.file}: linkedin`);
  validateOptionalHandle(signature.x, xPattern, `individuals/${signature.file}: x`);
}

function validateOrganization(signature) {
  const allowed = new Set(['file', 'name', 'signedBy', 'github', 'linkedin', 'x']);
  for (const key of Object.keys(signature)) assert(allowed.has(key), `organizations/${signature.file}: unsupported field '${key}'`);
  validateName(signature.name, `organizations/${signature.file}: name`);
  assert(typeof signature.signedBy === 'string' && githubPattern.test(signature.signedBy), `organizations/${signature.file}: valid signedBy github username is required`);
  validateOptionalHandle(signature.github, githubPattern, `organizations/${signature.file}: github`);
  validateOptionalHandle(signature.linkedin, linkedinPattern, `organizations/${signature.file}: linkedin`);
  validateOptionalHandle(signature.x, xPattern, `organizations/${signature.file}: x`);
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
assertUnique(individuals, 'linkedin', 'Individual LinkedIn identity');
assertUnique(individuals, 'x', 'Individual X identity');
assertUnique(organizations, 'name', 'Organization name');
assertUnique(organizations, 'github', 'Organization GitHub identity');
assertUnique(organizations, 'linkedin', 'Organization LinkedIn identity');
assertUnique(organizations, 'x', 'Organization X identity');

console.log(`Validated ${individuals.length} individual and ${organizations.length} organization signatures.`);
