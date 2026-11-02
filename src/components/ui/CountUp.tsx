import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * A number that counts up to its value (the "Count Up" idea from React Bits, without the animation library).
 *
 * It starts at 0 when first shown and, when the value changes later, continues from what is on screen. With
 * "reduce motion" it just shows the number. Screen readers get the final number once (the counting digits are
 * hidden from them), so they never hear 1, 7, 23, 41…
 */
export function CountUp({ to, ms = 900 }: { to: number; ms?: number }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(reduce ? to : 0);
  const current = useRef(reduce ? to : 0);

  useEffect(() => {
    if (reduce || current.current === to) {
      current.current = to;
      setShown(to);
      return;
    }
    const from = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);   // fast at first, settles gently
      current.current = Math.round(from + (to - from) * eased);
      setShown(current.current);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms, reduce]);

  return (
    <>
      <span aria-hidden="true" style={{ fontVariantNumeric: "tabular-nums" }}>{shown.toLocaleString()}</span>
      <span className="sr-only">{to.toLocaleString()}</span>
    </>
  );
}
