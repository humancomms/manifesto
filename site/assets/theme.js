(() => {
  const storageKey = 'humancomms-theme';
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let manual = false;

  const systemTheme = () => media.matches ? 'dark' : 'light';

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }

  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      manual = true;
      applyTheme(stored);
    } else {
      applyTheme(systemTheme());
    }
  } catch {
    applyTheme(systemTheme());
  }

  function createToggle() {
    const nav = document.querySelector('.nav-links');
    if (!nav || nav.querySelector('.theme-toggle')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.innerHTML = '<svg class="theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.5 8.5 0 1 0 20.2 15.3Z"/></svg><svg class="theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/></svg>';

    function syncLabel() {
      const current = document.documentElement.dataset.theme || systemTheme();
      const target = current === 'dark' ? 'light' : 'dark';
      button.setAttribute('aria-label', `Switch to ${target} theme`);
      button.title = `Switch to ${target} theme`;
    }

    button.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme || systemTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      manual = true;
      applyTheme(next);
      try { localStorage.setItem(storageKey, next); } catch {}
      syncLabel();
    });

    syncLabel();
    nav.append(button);
  }

  media.addEventListener?.('change', () => {
    if (!manual) applyTheme(systemTheme());
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', createToggle, { once: true });
  else createToggle();
})();
