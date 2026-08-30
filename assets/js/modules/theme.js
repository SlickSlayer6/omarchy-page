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

  for (const button of document.querySelectorAll('[data-theme-set]')) {
    button.addEventListener('click', () => apply(button.dataset.themeSet));
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(preload);
  } else {
    setTimeout(preload, 200);
  }
}

export { boot, ready };
