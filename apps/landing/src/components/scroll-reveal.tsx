"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

type Direction = "up" | "down" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  className?: string;
  distance?: number;
  range?: [number, number];
}

export default function ScrollReveal({
  children,
  direction = "up",
  className,
  distance = 40,
  range = [0, 0.4] as [number, number],
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  const blur = useTransform(scrollYProgress, range, [6, 0]);

  const translateY =
    direction === "up"
      ? useTransform(scrollYProgress, range, [distance, -distance * 0.2])
      : direction === "down"
        ? useTransform(scrollYProgress, range, [-distance, distance * 0.2])
        : undefined;

  const translateX =
    direction === "left"
      ? useTransform(scrollYProgress, range, [distance, -distance * 0.2])
      : direction === "right"
        ? useTransform(scrollYProgress, range, [-distance, distance * 0.2])
        : undefined;

  const filterValue = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        opacity,
        filter: filterValue,
        y: translateY ?? 0,
        x: translateX ?? 0,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Scroll-linked scale + opacity reveal.
 */
export function ScrollScaleReveal({
  children,
  className,
  from = 0.92,
  range = [0, 0.5] as [number, number],
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  range?: [number, number];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const scale = useTransform(scrollYProgress, range, [from, 1]);
  const opacity = useTransform(scrollYProgress, range, [0, 1]);
  const blur = useTransform(scrollYProgress, range, [3, 0]);
  const filterValue = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        scale,
        opacity,
        filter: filterValue,
      }}
    >
      {children}
    </motion.div>
  );
}
