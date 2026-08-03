/**
 * Light and dark, decided by the reader's own clock.
 *
 * The default mode is "auto": the page is light through the working day and dark
 * after dusk, judged from the visitor's local time — no server involvement, no
 * account, no setting to find. A reader who prefers one or the other can pin it,
 * and that choice is remembered.
 *
 * The logic lives in one small script rendered into the document head so it runs
 * before first paint. That is what prevents the white flash a themed page shows
 * when it decides its colours after rendering, which looks cheap and is the
 * single most common tell of a theme bolted on as an afterthought.
 */

export const THEME_STORAGE_KEY = "apex-theme";

/** Local hours during which "auto" resolves to light. Dusk-to-dawn is dark. */
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 19;

export type ThemeMode = "auto" | "light" | "dark";

/**
 * The pre-paint script. Kept dependency-free and defensive: a browser with
 * storage disabled still themes correctly, it simply cannot remember a manual
 * choice. Also re-evaluates on a timer and on tab focus so a page left open
 * through the evening follows the light down without a reload.
 */
export const THEME_INIT_SCRIPT = `
(function () {
  var KEY = ${JSON.stringify(THEME_STORAGE_KEY)};
  var DS = ${DAY_START_HOUR}, DE = ${DAY_END_HOUR};
  function resolve(mode) {
    if (mode === "light" || mode === "dark") return mode;
    var h = new Date().getHours();
    return (h >= DS && h < DE) ? "light" : "dark";
  }
  function apply(mode) {
    var theme = resolve(mode);
    var el = document.documentElement;
    el.setAttribute("data-theme", theme);
    el.setAttribute("data-theme-mode", mode);
    el.style.colorScheme = theme;
    return theme;
  }
  function current() {
    try { var m = localStorage.getItem(KEY); return (m === "light" || m === "dark" || m === "auto") ? m : "auto"; }
    catch (e) { return "auto"; }
  }
  window.__apexTheme = { apply: apply, resolve: resolve, current: current, KEY: KEY };
  apply(current());
  setInterval(function () { if (current() === "auto") apply("auto"); }, 300000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible" && current() === "auto") apply("auto");
  });
})();
`;
