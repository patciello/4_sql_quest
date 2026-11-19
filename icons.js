'use strict';
/* SQL Quest — ícones de linha (24×24, traço 1.75) que substituem os emojis da interface.
   ic('map', 18)  → string <svg>;  icoOf('🌱') → ícone para o emoji legado das trilhas;  hydrateIcons(root) → troca <i data-ic="map"></i>. */

const ICON_PATHS = {
  sprout: '<path d="M7 20h10"/><path d="M12 20v-9"/><path d="M12 11c0-3-2-5-6-5 0 3 2 5 6 5z"/><path d="M12 13c0-3 2-5 6-5 0 3-2 5-6 5z"/>',
  rocket: '<path d="M5 15c-1 1-2 4-2 6 2 0 5-1 6-2"/><path d="M14 4c3-1 6-1 7-1 0 1 0 4-1 7l-6 6-5-5z"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  flame: '<path d="M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-4-1-6 1-10z"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  pencil: '<path d="M4 20l1-5L16 4l4 4L9 19z"/><path d="M14 6l4 4"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4"/><path d="M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 13v4"/><path d="M8 20h8"/><path d="M10 17h4"/>',
  graduation: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5"/>',
  library: '<path d="M5 4v16"/><path d="M9 4v16"/><path d="M13 5l4-1 3 15-4 1z"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5"/>',
  database: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
  map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  file: '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6M10 17h6"/>',
  package: '<path d="M12 3l8 4v10l-8 4-8-4V7z"/><path d="M4 7l8 4 8-4M12 11v10"/>',
  book: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  play: '<path d="M7 4l13 8-13 8z"/>',
  lightbulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  'check-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  'x-circle': '<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7"/><path d="M12 17h.01"/>',
  code: '<path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 5l-4 14"/>',
  brain: '<path d="M12 5a3 3 0 0 0-5.5 1.5A3.5 3.5 0 0 0 5 13a3.5 3.5 0 0 0 3 5 3 3 0 0 0 4 1z"/><path d="M12 5a3 3 0 0 1 5.5 1.5A3.5 3.5 0 0 1 19 13a3.5 3.5 0 0 1-3 5 3 3 0 0 1-4 1"/><path d="M12 5v14"/>',
  pin: '<path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8 15h8"/>',
  alert: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
};

const ic = (name, size = 18) =>
  `<svg class="i" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ''}</svg>`;

/* emoji legado (campo `icon` das trilhas em content*.js e roadmap.js) → ícone de linha */
const EMOJI_ICON = {'🌱': 'sprout', '🚀': 'rocket', '🔥': 'flame', '🔗': 'link', '✏': 'pencil', '🏆': 'trophy', '🎓': 'graduation', '📚': 'library', '🎬': 'film'};
function icoOf(e, size = 16) {
  e = String(e || '').replace(/️/g, '');
  const k = e.match(/^(\d)⃣/);
  if (k) return `<span class="num" aria-hidden="true">${k[1]}</span>`;
  return EMOJI_ICON[e] ? ic(EMOJI_ICON[e], size) : '';
}

function hydrateIcons(root = document) {
  root.querySelectorAll('i[data-ic]').forEach(el => { el.outerHTML = ic(el.dataset.ic, +el.dataset.size || 16); });
}
