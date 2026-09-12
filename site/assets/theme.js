(() => {
  const root = document.documentElement;
  const key = 'humancomms-theme';
  const systemTheme = () => matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  let theme;
  try { theme = localStorage.getItem(key); } catch {}
  if (theme !== 'light' && theme !== 'dark') theme = systemTheme();

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-toggle');
    if (!button) return;
    const icon = button.querySelector('span');

    const sync = () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      icon.textContent = root.dataset.theme === 'dark' ? '☀' : '☾';
      button.setAttribute('aria-label', `Switch to ${next} theme`);
      button.title = `Switch to ${next} theme`;
    };

    button.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      root.style.colorScheme = next;
      try { localStorage.setItem(key, next); } catch {}
      sync();
    });

    sync();
  });
})();
