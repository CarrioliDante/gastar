"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";

type Direction = "up" | "down" | "left" | "right";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  className?: string;
  distance?: number;
  range?: [number, number]; // kept for API compat, unused
}

export function ScrollReveal({
  children,
  direction = "up",
  className,
  distance = 40,
}: ScrollRevealProps) {
  const initial =
    direction === "up"    ? { opacity: 0, y: distance } :
    direction === "down"  ? { opacity: 0, y: -distance } :
    direction === "left"  ? { opacity: 0, x: distance } :
                            { opacity: 0, x: -distance };

  const animate =
    direction === "up" || direction === "down"
      ? { opacity: 1, y: 0 }
      : { opacity: 1, x: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollScaleReveal({
  children,
  className,
  from = 0.92,
}: {
  children: ReactNode;
  className?: string;
  from?: number;
  range?: [number, number];
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: from }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
