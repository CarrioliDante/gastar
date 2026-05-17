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

export function ScrollReveal({
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

  const y =
    direction === "up"
      ? useTransform(scrollYProgress, range, [distance, 0])
      : direction === "down"
        ? useTransform(scrollYProgress, range, [-distance, 0])
        : 0;

  const x =
    direction === "left"
      ? useTransform(scrollYProgress, range, [distance, 0])
      : direction === "right"
        ? useTransform(scrollYProgress, range, [-distance, 0])
        : 0;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, y, x }}
    >
      {children}
    </motion.div>
  );
}

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

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ scale, opacity }}
    >
      {children}
    </motion.div>
  );
}
