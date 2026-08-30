const THEMES = ['catppuccin', 'tokyo-night', 'nord', 'everforest', 'retro-82'];
const STORAGE = 'omarchy-homepage-theme';

function allowed(name) {
  return THEMES.includes(name);
}

function boot() {
  let theme = 'catppuccin';

  try {
    const fromUrl = new URLSearchParams(location.search).get('theme');
    if (allowed(fromUrl)) {
      theme = fromUrl;
    } else {
      const stored = localStorage.getItem(STORAGE);
      if (allowed(stored)) theme = stored;
    }
  } catch {
    // private mode, file://, etc.
  }

  document.documentElement.dataset.theme = theme;
  return theme;
}

function desktopSrc(theme) {
  return new URL(`../../images/desktop/${theme}.webp`, import.meta.url).href;
}

function apply(theme, persist = true) {
  if (!allowed(theme)) return;

  document.documentElement.dataset.theme = theme;

  const img = document.querySelector('[data-desktop]');
  if (img) {
    img.src = desktopSrc(theme);
    img.alt = `Omarchy desktop · ${theme}`;
  }

  for (const caption of document.querySelectorAll('[data-theme-name]')) {
    caption.textContent = theme;
  }

  const color = document.querySelector('meta[name="theme-color"]');
  if (color) {
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim();
    if (bg) color.setAttribute('content', bg);
  }

  for (const button of document.querySelectorAll('[data-theme-set]')) {
    const on = button.dataset.themeSet === theme;
    button.setAttribute('aria-checked', on ? 'true' : 'false');
    button.tabIndex = on ? 0 : -1;
  }

  if (persist) {
    try {
      localStorage.setItem(STORAGE, theme);
    } catch {
      // ignore
    }
  }
}

function preload() {
  for (const theme of THEMES) {
    const image = new Image();
    image.src = desktopSrc(theme);
  }
}

function ready() {
  const current = document.documentElement.dataset.theme || boot();
  apply(current, false);

  const buttons = [...document.querySelectorAll('[data-theme-set]')];

  for (const button of buttons) {
    button.addEventListener('click', () => apply(button.dataset.themeSet));
    button.addEventListener('keydown', (event) => {
      const currentIndex = buttons.indexOf(button);
      let nextIndex;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % buttons.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = buttons.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      const next = buttons[nextIndex];
      apply(next.dataset.themeSet);
      next.focus();
    });
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload);
  } else {
    setTimeout(preload, 200);
  }
}

export { boot, ready };
