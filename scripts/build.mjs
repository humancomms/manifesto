import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist');
const pageSize = 200;

async function readSignatures(kind) {
  const directory = path.join(root, 'signatories', kind);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => entry.name);

  const signatures = [];
  for (const file of files) {
    const content = await readFile(path.join(directory, file), 'utf8');
    signatures.push(JSON.parse(content));
  }

  return signatures.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

async function writeSignaturePages(kind) {
  const signatures = await readSignatures(kind);
  const target = path.join(output, 'signatures', 'data', kind);
  const pages = Math.ceil(signatures.length / pageSize);
  await mkdir(target, { recursive: true });

  await writeFile(
    path.join(target, 'index.json'),
    JSON.stringify({ count: signatures.length, pages, pageSize }),
  );

  for (let index = 0; index < pages; index += 1) {
    const page = signatures.slice(index * pageSize, (index + 1) * pageSize);
    await writeFile(path.join(target, `page-${index + 1}.json`), JSON.stringify(page));
  }
}

await rm(output, { recursive: true, force: true });
await cp(path.join(root, 'site'), output, { recursive: true });
await writeFile(path.join(output, '.nojekyll'), '');
await writeFile(path.join(output, 'CNAME'), 'humancomms.org\n');
await writeSignaturePages('individuals');
await writeSignaturePages('organizations');

console.log('Built site in dist/');
