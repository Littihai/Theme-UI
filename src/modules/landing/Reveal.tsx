import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";

/**
 * Scroll reveal: the block tips up out of the page (a short 3D turn and a rise) the first time it comes into view, and
 * stays. The look is the `.rv` classes in landing.css; with reduced motion it is simply there. `from` picks the side.
 */
export function Reveal({ children, delay = 0, from = "up", className = "", style }: {
  children: ReactNode;
  delay?: number;
  from?: "up" | "left" | "right";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setOn(true); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { setOn(true); io.disconnect(); }
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rv rv-${from}${on ? " in" : ""} ${className}`} style={{ ["--d" as string]: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/** Leans toward the pointer (a mouse only; touch and keyboard see it flat). The lean is two CSS variables on the wrapper. */
export function Tilt({ children, max = 6, className = "" }: { children: ReactNode; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${(-ny * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(nx * max * 2).toFixed(2)}deg`);
  };
  const leave = () => { ref.current?.style.setProperty("--rx", "0deg"); ref.current?.style.setProperty("--ry", "0deg"); };
  return <div ref={ref} className={`tilt ${className}`} onPointerMove={move} onPointerLeave={leave}>{children}</div>;
}
