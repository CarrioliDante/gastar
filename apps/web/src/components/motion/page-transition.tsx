"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { springGentle } from "./presets";

export function PageTransition({
  children,
  id,
}: {
  children: ReactNode;
  id: string;
}) {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springGentle}
      style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}
    >
      {children}
    </motion.div>
  );
}

// ─── StaggerList — generic staggered list container ───

const staggerListItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springGentle,
  },
};

export function StaggerList({
  children,
  className,
  stagger = 0.04,
  delay = 0.05,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const vars: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={vars}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerListItem}>
      {children}
    </motion.div>
  );
}
