"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
  type Variants,
  type Transition,
} from "motion/react";

// ─── Spring presets ───

export const springGentle: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 0.5,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
  mass: 0.4,
};

export const springBouncy: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 14,
  mass: 0.3,
};

// ─── Shared variants ───

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerSlower: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

// ─── Character reveal ───

export const charReveal: Variants = {
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
    hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
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

// ─── Animated number counter ───

export function AnimatedNumber({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const count = useMotionValue(0);
  const display = useTransform(count, (v) =>
    `${Math.round(v).toLocaleString()}${suffix}`
  );
  const [ran, setRan] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || ran) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRan(true);
          animate(count, value, {
            duration: 1.6,
            ease: [0.16, 1, 0.3, 1],
          });
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, ran, count]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

// ─── Scroll-linked bar fill ───

export function ScrollBar({
  width,
  className,
  delay = 0,
}: {
  width: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.i
      className={className}
      initial={{ width: "0%" }}
      whileInView={{ width }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay, ...springGentle }}
    />
  );
}
