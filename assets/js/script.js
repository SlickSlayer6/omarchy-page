import * as video from './modules/video.js';
import * as theme from './modules/theme.js';

document.addEventListener('DOMContentLoaded', () => {
  theme.ready();
  video.ready();
});
