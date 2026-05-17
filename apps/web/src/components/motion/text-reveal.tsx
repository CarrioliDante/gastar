"use client";

import { type ReactNode } from "react";
import { motion, type Variants } from "motion/react";
import { springGentle } from "./presets";

// ─── Character reveal ───

const charReveal: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { ...springGentle },
  },
};

export function RevealText({
  children,
  as: Tag = "span",
  className,
  stagger = 0.018,
  delay = 0,
  spring = true,
}: {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "span" | "p" | "div";
  className?: string;
  stagger?: number;
  delay?: number;
  spring?: boolean;
}) {
  const text = typeof children === "string" ? children : String(children ?? "");
  const chars = Array.from(text);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };

  const charVariant: Variants = spring
    ? charReveal
    : {
        hidden: charReveal.hidden,
        visible: {
          ...charReveal.visible,
          transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
        },
      };

  return (
    <Tag className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={container}
        style={{ display: "inline" }}
      >
        {chars.map((char, i) => (
          <motion.span
            key={i}
            variants={charVariant}
            style={{
              display: "inline-block",
              whiteSpace: char === " " ? "pre" : undefined,
            }}
          >
            {char === " " ? " " : char}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}

// ─── Word reveal ───

export function RevealWords({
  children,
  className,
  stagger = 0.06,
  delay = 0.1,
}: {
  children: string;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const words = children.split(" ");

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const wordVariant: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springGentle,
    },
  };

  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={container}
      style={{ display: "inline" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={wordVariant}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}
