"use client";

import { useRef, useState, useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "motion/react";

export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  className,
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  decimals?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => {
    const fixed = v.toFixed(decimals);
    return `${prefix}${Number(fixed).toLocaleString("es-AR")}${suffix}`;
  });
  const [visible, setVisible] = useState(false);
  const prevValue = useRef(value);
  const animatedOnce = useRef(false);

  // Visibility detection (only needed for initial mount)
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);

  // Animate on value change (and initial reveal)
  useEffect(() => {
    if (!visible) return;

    const from = animatedOnce.current ? prevValue.current : 0;
    count.jump(from);

    const controls = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });

    prevValue.current = value;
    animatedOnce.current = true;

    return () => controls.stop();
  }, [value, visible, count]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
