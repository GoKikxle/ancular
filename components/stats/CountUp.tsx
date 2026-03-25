"use client";

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

type Props = {
  value: number;
  className?: string;
};

function CountUpInner({ value, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const mv = useMotionValue(0);

  useEffect(() => {
    mv.set(0);
    if (ref.current) ref.current.textContent = "0";
    const controls = animate(mv, value, {
      duration: 0.82,
      ease: [0.25, 0.46, 0.45, 1],
    });
    return () => controls.stop();
  }, [value, mv]);

  useMotionValueEvent(mv, "change", (v) => {
    if (ref.current) ref.current.textContent = String(Math.round(v));
  });

  return <span ref={ref} className={className} />;
}

/**
 * Smooth count-up on mount; respects reduced motion.
 */
export function CountUp(props: Props) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) {
    return <span className={props.className}>{props.value}</span>;
  }
  return <CountUpInner {...props} />;
}
