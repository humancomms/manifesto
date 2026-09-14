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
    const nav = document.querySelector('.site-nav');
    const mark = nav?.querySelector('.site-mark');

    if (nav && mark && !nav.querySelector('.menu-toggle')) {
      const menu = document.createElement('div');
      menu.className = 'nav-menu';
      menu.id = 'site-menu';

      [...nav.children]
        .filter((child) => child !== mark)
        .forEach((child) => menu.append(child));

      nav.append(menu);

      const menuButton = document.createElement('button');
      menuButton.type = 'button';
      menuButton.className = 'menu-toggle';
      menuButton.setAttribute('aria-controls', menu.id);
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open menu');
      menuButton.innerHTML = '<span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
      mark.insertAdjacentElement('afterend', menuButton);

      const closeMenu = () => {
        nav.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open menu');
      };

      menuButton.addEventListener('click', () => {
        const open = !nav.classList.contains('is-open');
        nav.classList.toggle('is-open', open);
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      });

      nav.addEventListener('click', (event) => {
        if (event.target.closest('a') && matchMedia('(max-width: 760px)').matches) closeMenu();
      });

      addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeMenu();
      });

      const mobile = matchMedia('(max-width: 760px)');
      mobile.addEventListener?.('change', (event) => {
        if (!event.matches) closeMenu();
      });
    }

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
