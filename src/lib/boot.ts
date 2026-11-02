/**
 * Ends the loading screen from index.html (#boot). The bar there only creeps toward the end; this is what
 * fills it — from wherever it had got to, so it never jumps back — and then fades the screen out.
 * Safe to call more than once.
 */
export function finishBoot() {
  const boot = document.getElementById("boot");
  if (!boot || boot.dataset.done) return;
  boot.dataset.done = "1";

  const fill = boot.querySelector<HTMLElement>(".boot-fill");
  if (fill) {
    fill.style.width = getComputedStyle(fill).width; // freeze it where the creep had reached
    fill.style.animation = "none";
    void fill.offsetWidth;                            // commit that, so the next change is animated from it
    fill.style.transition = "width 0.25s ease-out";
    fill.style.width = "100%";
  }
  window.setTimeout(() => {
    boot.classList.add("boot-out");
    window.setTimeout(() => boot.remove(), 300);
  }, 320);
}
