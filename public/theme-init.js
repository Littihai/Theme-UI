// The localStorage prefix of this app: must match STORAGE_PREFIX in src/constants/brand.ts.
var PREFIX = "app";

// Applies the saved theme before the first paint, so people who chose dark mode
// never see a white flash while the app bundle loads. Kept as a tiny classic
// script (not inline) because the CSP only allows scripts from 'self'.
// The React side (ThemeProvider) owns the preference after this.
(function () {
  try {
    var pref = localStorage.getItem(PREFIX + ".theme");
    var dark =
      pref === "dark" ||
      (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
  } catch (e) {
    /* storage blocked — stay on the light default */
  }
})();

// Text size (S / M / L): set before first paint so the page does not jump when the app loads.
(function () {
  try {
    var size = localStorage.getItem(PREFIX + ".fontSize");
    if (size === "s" || size === "l") document.documentElement.setAttribute("data-size", size);
  } catch (e) {
    /* storage blocked — medium */
  }
})();

// Language: the loading screen shows its words in the saved language. Same rule as I18nProvider (saved choice, else the
// default of src/constants/brand.ts: keep DEFAULT_LANG and the fallback below in step).
(function () {
  try {
    var lang = localStorage.getItem(PREFIX + ".lang");
    document.documentElement.setAttribute("lang", lang === "th" ? "th" : "en");
  } catch (e) {
    document.documentElement.setAttribute("lang", "en");
  }
})();

// Customize choices (accent, contrast, motion, font, grey base, corner radius, menu layout, page width, sticky bars, edge
// styles): each one is an attribute on <html>, set before first paint so the page does not jump when the app loads.
// The keys, attributes and allowed values must match CHOICES in src/lib/appearance.ts (a default has no attribute).
(function () {
  var CHOICES = [
    ["accent", "data-accent", "steel|teal|green|violet|rose|amber|indigo|azure|slate", "steel"],
    ["contrast", "data-contrast", "standard|high", "standard"],
    ["motion", "data-motion", "auto|reduce|full", "auto"],
    ["font", "data-font", "inter|plex|sarabun|system", "inter"],
    ["base", "data-base", "slate|gray|zinc|neutral|stone", "slate"],
    ["radius", "data-radius", "none|sm|md|lg|xl", "sm"],
    ["nav", "data-nav", "top|side|rail", "top"],
    ["container", "data-container", "narrow|standard|wide|fluid", "standard"],
    ["sticky", "data-sticky", "header|all|none", "header"],
    ["navStyle", "data-nav-style", "attached|floating", "attached"],
    ["panelStyle", "data-panel-style", "attached|floating", "attached"],
  ];
  try {
    var root = document.documentElement;
    for (var i = 0; i < CHOICES.length; i++) {
      var c = CHOICES[i];
      var v = localStorage.getItem(PREFIX + "." + c[0]);
      if (v && v !== c[3] && new RegExp("^(" + c[2] + ")$").test(v)) root.setAttribute(c[1], v);
    }
  } catch (e) {
    /* storage blocked — the defaults */
  }
})();
