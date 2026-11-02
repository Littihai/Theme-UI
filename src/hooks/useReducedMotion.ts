import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/** The motion choice in Settings wins over the system: "reduce" / "full" are on <html data-motion>, "auto" has none. */
function wantsReduced(): boolean {
  if (typeof window === "undefined") return false;
  const choice = document.documentElement.getAttribute("data-motion");
  if (choice === "reduce") return true;
  if (choice === "full") return false;
  return !!window.matchMedia?.(QUERY).matches;
}

/** True when animations should jump straight to the end state: the viewer asked for less motion here or in their system. */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(wantsReduced);
  useEffect(() => {
    const on = () => setReduce(wantsReduced());
    const mq = window.matchMedia?.(QUERY);
    mq?.addEventListener("change", on);
    // the Settings choice changes the attribute while the page is open
    const watch = new MutationObserver(on);
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-motion"] });
    on();
    return () => {
      mq?.removeEventListener("change", on);
      watch.disconnect();
    };
  }, []);
  return reduce;
}
