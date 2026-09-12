const kind = document.body.dataset.signatureKind;
const list = document.querySelector('#signature-list');
const count = document.querySelector('#signature-count');
const empty = document.querySelector('#signature-empty');
const loadMore = document.querySelector('#load-more');

let page = 0;
let pageCount = 0;

function safeLink(url, label) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.textContent = label;
  anchor.rel = 'noopener noreferrer';
  return anchor;
}

function renderSignature(signature) {
  const item = document.createElement('li');
  const name = document.createElement('span');
  const detail = document.createElement('span');
  detail.className = 'detail';

  if (signature.url) {
    name.append(safeLink(signature.url, signature.name));
  } else {
    name.textContent = signature.name;
  }

  if (kind === 'individuals') {
    detail.append(safeLink(`https://github.com/${signature.github}`, `@${signature.github}`));
  } else {
    detail.textContent = `signed by @${signature.signedBy}`;
  }

  item.append(name, detail);
  list.append(item);
}

async function loadPage() {
  if (page >= pageCount) return;
  page += 1;
  const response = await fetch(`/signatures/data/${kind}/page-${page}.json`);
  if (!response.ok) throw new Error(`Unable to load ${kind} signatures`);
  const signatures = await response.json();
  signatures.forEach(renderSignature);
  loadMore.hidden = page >= pageCount;
}

async function init() {
  try {
    const response = await fetch(`/signatures/data/${kind}/index.json`);
    if (!response.ok) throw new Error(`Unable to load ${kind} index`);
    const index = await response.json();
    pageCount = index.pages;
    count.textContent = `${index.count.toLocaleString()} signed`;
    empty.hidden = index.count !== 0;
    loadMore.hidden = index.pages <= 1;
    if (index.pages > 0) await loadPage();
  } catch (error) {
    count.textContent = 'Unable to load signatures';
    console.error(error);
  }
}

loadMore.addEventListener('click', loadPage);
init();
