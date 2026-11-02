/**
 * Stops the page behind an overlay from scrolling. Overlays can overlap (the phone
 * nav drawer is still open when Settings opens over it), so locks are counted:
 * the page scrolls again only when the last one is released, whatever the order.
 * Returns the release function.
 *
 * The lock goes on <html>, not only on <body>: global.css gives <html> its own
 * `overflow-y: scroll` (so the scrollbar is always there and the layout never
 * shifts), and once the root has an overflow of its own the body's overflow is no
 * longer passed on to the viewport — `body { overflow: hidden }` alone did nothing.
 * `scrollbar-gutter: stable` keeps the gutter while hidden, so nothing jumps.
 */
let count = 0;
let savedHtml = "";
let savedBody = "";

export function lockPageScroll(): () => void {
  if (count++ === 0) {
    savedHtml = document.documentElement.style.overflow;
    savedBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--count === 0) {
      document.documentElement.style.overflow = savedHtml;
      document.body.style.overflow = savedBody;
    }
  };
}

