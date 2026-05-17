"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  type Variants,
} from "motion/react";
import {
  AnimatedNumber,
  RevealText,
  RevealWords,
  fadeUp,
  scaleIn,
  staggerContainer,
  springGentle,
  springSnappy,
} from "@/components/animations";

const staggerSlow: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const ease = [0.16, 1, 0.3, 1] as const;

// ═══════════════════════════════════════════════════════════════
// Top Bar
// ═══════════════════════════════════════════════════════════════

function TopBar({
  scrolled,
  theme,
  toggleTheme,
}: {
  scrolled: boolean;
  theme: "light" | "dark";
  toggleTheme: () => void;
}) {
  const navItems = [
    { href: "#principios", label: "Principios" },
    { href: "#producto", label: "Producto" },
    { href: "#precios", label: "Precios" },
    { href: "#preguntas", label: "Preguntas" },
    { href: "#", label: "Workspace ↗" },
    { href: "#", label: "iPhone ↗" },
  ];

  return (
    <motion.header
      className={`topbar${scrolled ? " scrolled" : ""}`}
      id="topbar"
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...springGentle, delay: 0.05 }}
    >
      <div className="wrap row">
        <motion.a
          className="brand"
          href="#top"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.22, ...springGentle }}
        >
          <motion.span
            className="dot"
            animate={{ scale: [1, 1.28, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <span>gast.ar</span>
          <span className="v">v0.2 · beta</span>
        </motion.a>

        <nav className="nav">
          {navItems.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              initial={{ y: -14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22 + i * 0.05, ...springGentle }}
            >
              {item.label}
            </motion.a>
          ))}
        </nav>

        <motion.div
          className="top-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.4 }}
        >
          <motion.button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Modo"
            animate={{ rotate: theme === "dark" ? 180 : 0 }}
            transition={{ ...springSnappy }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.2" />
              <line x1="7" y1="1" x2="7" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="7" y1="11.5" x2="7" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="1" y1="7" x2="2.5" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="11.5" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </motion.button>
          <motion.a
            className="btn"
            href="#precios"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={springGentle}
          >
            <span>Empezar</span>
            <motion.span
              className="arrow"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              →
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </motion.header>
  );
}

// ═══════════════════════════════════════════════════════════════
// Hero
// ═══════════════════════════════════════════════════════════════

function HeroSection() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  // iPhone parallax — moves faster than copy on scroll
  const iphoneY = useTransform(scrollYProgress, [0, 1], [0, -160]);

  // Cursor-aware tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothX = useSpring(mouseX, { stiffness: 80, damping: 30, mass: 0.3 });
  const smoothY = useSpring(mouseY, { stiffness: 80, damping: 30, mass: 0.3 });
  const rotateX = useTransform(smoothY, [0, 1], [2, -2]);
  const rotateY = useTransform(smoothX, [0, 1], [-2, 2]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX.set((e.clientX - rect.left) / rect.width);
      mouseY.set((e.clientY - rect.top) / rect.height);
    },
    [mouseX, mouseY]
  );

  return (
    <section className="hero" ref={heroRef} onMouseMove={handleMouseMove}>
      <div className="wrap">
        <div className="hero-grid">
          {/* ── Copy ── */}
          <motion.div
            className="copy"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h2 className="hero-wordmark" variants={fadeUp}>
              gast<em>.ar</em>
            </motion.h2>

            <motion.span className="eyebrow" variants={fadeUp}>
              <motion.span
                className="dot"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              />
              Cuaderno calmo de finanzas · Buenos Aires
            </motion.span>

            <h1>
              <RevealText as="span" stagger={0.022} delay={0.1}>
                Finanzas
              </RevealText>
              <br />
              <RevealText as="span" stagger={0.022} delay={0.35}>
                en{" "}
              </RevealText>
              <em>
                <RevealText as="span" stagger={0.022} delay={0.55}>
                  silencio
                </RevealText>
              </em>
              .
            </h1>

            <motion.div variants={fadeUp}>
              <RevealWords className="lede" stagger={0.06} delay={0.8}>
                gast.ar es un cuaderno calmo para tu dinero. Sin notificaciones urgentes,
                sin colores estridentes, sin gamificación que te empuje a gastar más.
                Solo claridad — escrita como un editorial, no como un tablero.
              </RevealWords>
            </motion.div>

            <motion.div className="ctas" variants={fadeUp}>
              <motion.a
                className="btn"
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springGentle}
              >
                <span>Abrir workspace</span>
                <motion.span
                  className="arrow"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  →
                </motion.span>
              </motion.a>
              <motion.a
                className="btn ghost"
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springGentle}
              >
                <span>Ver app móvil</span>
              </motion.a>
              <span className="meta">sin tarjeta · 30 días</span>
            </motion.div>
          </motion.div>

          {/* ── iPhone mockup ── */}
          <motion.div
            className="iphone"
            aria-label="gast.ar en iPhone"
            initial={{ opacity: 0, scale: 0.86, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.5, ease }}
            style={{
              y: iphoneY,
              rotateX,
              rotateY,
              perspective: 800,
            }}
          >
            <motion.div
              style={{ width: "100%", height: "100%" }}
              animate={{ y: [0, -5, 0] }}
              transition={{
                y: { duration: 4.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 1.6 },
              }}
            >
              <div className="vol-extras"><i /><i /></div>
              <div className="screen">
                <div className="island" />
                <div className="status">
                  <span>9:41</span>
                  <span className="right">
                    <svg width="14" height="9" viewBox="0 0 14 9" fill="currentColor">
                      <rect x="0" y="5.5" width="2.4" height="3.5" rx="0.5" />
                      <rect x="3.6" y="3.7" width="2.4" height="5.3" rx="0.5" />
                      <rect x="7.2" y="1.8" width="2.4" height="7.2" rx="0.5" />
                      <rect x="10.8" y="0" width="2.4" height="9" rx="0.5" />
                    </svg>
                    <svg width="20" height="9" viewBox="0 0 20 9" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="0.5" y="0.5" width="17" height="8" rx="2" />
                      <rect x="2" y="2" width="14" height="5" rx="0.8" fill="currentColor" stroke="none" />
                      <path d="M18.5 3v3" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
                <div className="content">
                  <div className="lab">Jue · 14 Mayo</div>
                  <div className="greeting">Buen día, Tomás</div>

                  <div style={{ height: "12px" }} />
                  <div className="lab">Balance · 3 cuentas</div>
                  <div className="big">
                    <span className="c">AR$</span>
                    <span>1,284,640<span className="frac">.50</span></span>
                  </div>

                  <div className="hr" />

                  <div className="stats">
                    <div>
                      <div className="v">482,300</div>
                      <div className="l">Gastado · mayo</div>
                    </div>
                    <div>
                      <div className="v">78<span style={{ fontSize: "11px", color: "var(--faint)" }}>/100</span></div>
                      <div className="l">Pulso · tranquilo</div>
                    </div>
                  </div>

                  <div style={{ height: "12px" }} />

                  <div className="blocks-row">
                    <div className="blk">
                      <div className="top">
                        <svg width="11" height="11" viewBox="0 0 11 11"><rect x="1.5" y="1.5" width="8" height="8" stroke="currentColor" strokeWidth="1.1" fill="none" /></svg>
                        <span className="pct">77%</span>
                      </div>
                      <div className="name">Casa</div>
                      <div className="bar"><i style={{ width: "77%" }} /></div>
                    </div>
                    <div className="blk">
                      <div className="top">
                        <svg width="11" height="11" viewBox="0 0 11 11"><circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.1" fill="none" /></svg>
                        <span className="pct">63%</span>
                      </div>
                      <div className="name">Auto</div>
                      <div className="bar"><i style={{ width: "63%" }} /></div>
                    </div>
                    <div className="blk">
                      <div className="top">
                        <svg width="11" height="11" viewBox="0 0 11 11"><path d="M1.5 10 A 5.5 5.5 0 0 1 9.5 10" stroke="currentColor" strokeWidth="1.1" fill="none" /></svg>
                        <span className="pct">18%</span>
                      </div>
                      <div className="name">Japón</div>
                      <div className="bar"><i style={{ width: "18%" }} /></div>
                    </div>
                  </div>

                  <div className="section-head">
                    <span className="lab">Hoy · 4 mov</span>
                    <span className="link">Todo →</span>
                  </div>
                  <div className="tx">
                    <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.1" fill="none" /></svg>
                    <div className="n">Mercadolibre <small>APARTAMENTO · 14:22</small></div>
                    <div className="a">−8.4k</div>
                  </div>
                  <div className="tx">
                    <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.1" fill="none" /></svg>
                    <div className="n">Café Lattente <small>COMIDA · 09:48</small></div>
                    <div className="a">−3.2k</div>
                  </div>
                  <div className="tx">
                    <svg width="12" height="12" viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
                    <div className="n">Subte SUBE <small>TRANSPORTE · 08:12</small></div>
                    <div className="a">−1.1k</div>
                  </div>

                  <div className="upcoming">
                    <div className="dot" />
                    <div className="up-text">
                      <div className="up-title">Edenor · próximo viernes</div>
                      <div className="up-sub">RECURRENTE · APARTAMENTO</div>
                    </div>
                    <div className="up-amt">−16.8k</div>
                  </div>

                  <div className="tabbar">
                    <button className="active">
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <rect x="2" y="2" width="4" height="4" fill="currentColor" />
                        <rect x="8" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                        <rect x="2" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                        <rect x="8" y="8" width="4" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
                      </svg>
                    </button>
                    <button>
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <line x1="3" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        <line x1="3" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        <line x1="3" y1="11" x2="8" y2="11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                      </svg>
                    </button>
                    <div className="fab-pair">
                      <div className="fab">
                        <svg width="10" height="10" viewBox="0 0 10 10"><line x1="2" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                      </div>
                      <div className="fab alt">
                        <svg width="10" height="10" viewBox="0 0 10 10">
                          <line x1="2" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                          <line x1="5" y1="2" x2="5" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                        </svg>
                      </div>
                    </div>
                    <button>
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.1" fill="none" />
                        <rect x="7.5" y="2" width="4" height="4" stroke="currentColor" strokeWidth="1.1" fill="none" />
                        <path d="M2 12l2-3.4L6 12" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round" />
                        <circle cx="9.7" cy="9.7" r="2" stroke="currentColor" strokeWidth="1.1" fill="none" />
                      </svg>
                    </button>
                    <button>
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.1" fill="none" />
                        <path d="M7 7 L7 2.5 A 4.5 4.5 0 0 1 11 9 Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="home-bar" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats bar ── */}
        <motion.div
          className="hero-marquee"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerContainer}
        >
          {[
            { k: "3 seg", l: "Anotar un gasto" },
            { k: "0 ads", l: "Cero publicidad" },
            { k: "100%", l: "Local primero" },
            { k: "AR$ · USD", l: "Multimoneda" },
          ].map((s) => (
            <motion.div key={s.l} variants={fadeUp}>
              <div className="k tnum">{s.k}</div>
              <div className="l">{s.l}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// Principles
// ═══════════════════════════════════════════════════════════════

function PrinciplesSection() {
  return (
    <section id="principios">
      <div className="wrap">
        <motion.div
          className="sec-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <span className="eyebrow">
              <motion.span
                className="dot"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              01 · Principios
            </span>
          </motion.div>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Tres ideas que{" "}
            <em>
              <RevealText as="span" stagger={0.025} delay={0.3}>
                no negociamos
              </RevealText>
            </em>
            .
          </motion.h2>
        </motion.div>

        <motion.div
          className="principles"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerSlow}
        >
          {[
            {
              n: "P / 01",
              title: <>Editorial,<br />no <em>dashboard</em>.</>,
              text: "Tu dinero no es un panel de control de avión. Mostramos la información como una página de revista: jerarquía, tipografía, blanco. Sin carteles que parpadean, sin íconos de colores que compiten por tu atención.",
            },
            {
              n: "P / 02",
              title: <>Local <em>primero</em>.</>,
              text: "Todo se guarda primero en tu dispositivo. Sincronizar es opcional y cifrado. No vendemos tus datos, no los analizamos para anunciantes, no entrenamos modelos con ellos. Cifrado de extremo a extremo cuando elegís compartir.",
            },
            {
              n: "P / 03",
              title: <>Sin <em>slot machines</em>.</>,
              text: "Nada de notificaciones rojas, rachas de días o medallas. El éxito en gast.ar es ahorrar y dormir tranquilo, no abrir la app. Por eso reemplazamos métricas vacías por un solo número: el Pulso.",
            },
          ].map((p) => (
            <motion.div key={p.n} variants={fadeUp}>
              <span className="n">{p.n}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// Product / Showcase
// ═══════════════════════════════════════════════════════════════

function ProductSection() {
  const sparkRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sparkProgress } = useScroll({
    target: sparkRef,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(sparkProgress, [0.15, 0.55], [0, 1]);

  return (
    <section id="producto">
      <div className="wrap">
        <motion.div
          className="sec-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <span className="eyebrow">
              <motion.span
                className="dot"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              02 · Producto
            </span>
          </motion.div>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Una mirada{" "}
            <em>
              <RevealText as="span" stagger={0.025} delay={0.3}>
                silenciosa
              </RevealText>
            </em>
            <br />a todo lo que se mueve.
          </motion.h2>
        </motion.div>

        <motion.div
          className="showcase-stage"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={scaleIn}
        >
          <div className="frame">
            <div className="titlebar">
              <div className="traffic">
                <motion.span
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.span
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.3 }}
                />
                <motion.span
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.6 }}
                />
              </div>
              <div className="url">gast.ar / workspace / inicio</div>
              <div style={{ width: "36px" }} />
            </div>
            <div className="preview">
              <div className="top">
                <div>
                  <div className="eyebrow">Jueves · 14 mayo 2026</div>
                  <h4>Buen día, Tomás</h4>
                </div>
                <div className="eyebrow">Sincronizado · hace 2 min</div>
              </div>

              <div className="eyebrow">Balance total · 3 cuentas</div>
              <div className="balance" style={{ marginTop: "12px" }}>
                <span className="code">AR$</span>
                <span>
                  <AnimatedNumber value={1284640} className="tnum" />
                  <span className="frac">.50</span>
                </span>
              </div>

              <div className="hr" />

              <div className="row">
                <div className="stat">
                  <div className="v"><AnimatedNumber value={482300} /></div>
                  <div className="l">Gastado</div>
                </div>
                <div className="stat">
                  <div className="v"><AnimatedNumber value={117700} /></div>
                  <div className="l">Disponible</div>
                </div>
                <div className="stat">
                  <div className="v">
                    <AnimatedNumber value={78} />
                    <span style={{ fontSize: "13px", color: "var(--faint)" }}>/100</span>
                  </div>
                  <div className="l">Pulso · tranquilo</div>
                </div>
              </div>

              <div className="blocks" style={{ marginTop: "26px" }}>
                <div className="blk">
                  <div className="h">
                    <svg width="16" height="16" viewBox="0 0 16 16"><rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
                    <span className="mono" style={{ fontSize: "9px", color: "var(--faint)", letterSpacing: "0.06em" }}>77%</span>
                  </div>
                  <div className="t">Apartamento</div>
                  <div className="bar"><motion.i
                    initial={{ width: "0%" }}
                    whileInView={{ width: "77%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.6, ...springGentle }}
                  /></div>
                  <div className="m">184k / 240k</div>
                </div>
                <div className="blk">
                  <div className="h">
                    <svg width="16" height="16" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
                    <span className="mono" style={{ fontSize: "9px", color: "var(--faint)", letterSpacing: "0.06em" }}>63%</span>
                  </div>
                  <div className="t">Auto</div>
                  <div className="bar"><motion.i
                    initial={{ width: "0%" }}
                    whileInView={{ width: "63%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.75, ...springGentle }}
                  /></div>
                  <div className="m">56.4k / 90k</div>
                </div>
                <div className="blk">
                  <div className="h">
                    <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2 14 A 8 8 0 0 1 14 14" stroke="currentColor" strokeWidth="1.2" fill="none" /></svg>
                    <span className="mono" style={{ fontSize: "9px", color: "var(--faint)", letterSpacing: "0.06em" }}>18%</span>
                  </div>
                  <div className="t">Viaje Japón</div>
                  <div className="bar"><motion.i
                    initial={{ width: "0%" }}
                    whileInView={{ width: "18%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.9, ...springGentle }}
                  /></div>
                  <div className="m">320k / 1.8M</div>
                </div>
              </div>

              <div className="hr" style={{ marginTop: "22px" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div className="eyebrow">Tendencia · mayo</div>
                <span className="mono" style={{ fontSize: "9px", color: "var(--faint)", letterSpacing: "0.06em" }}>−7.5% vs mes anterior</span>
              </div>
              <div ref={sparkRef} style={{ position: "relative" }}>
                <svg className="spark" viewBox="0 0 300 40" preserveAspectRatio="none" style={{ marginTop: "10px" }}>
                  <motion.polyline
                    points="0,28 16,24 32,26 48,20 64,24 80,18 96,16 112,18 128,14 144,16 160,12 176,14 192,11 208,9 224,12 240,8 256,10 272,6 288,8 300,5"
                    fill="none" stroke="currentColor" strokeWidth="1.2"
                    style={{ pathLength }}
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// Features
// ═══════════════════════════════════════════════════════════════

function FeaturesSection() {
  const articles = [
    {
      num: "F / 01",
      title: <>Bloques de <em>vida</em>.</>,
      text: "Agrupá tus gastos por proyectos que sí importan: el apartamento, el auto, el viaje a Japón, el setup freelance. Cada bloque tiene su presupuesto, su tendencia y su propio Pulso.",
      demo: (
        <div className="demo-blocks">
          {[
            { icon: "rect", pct: "77%", t: "Apartamento", w: "77%", m: "184k / 240k" },
            { icon: "circle", pct: "63%", t: "Auto", w: "63%", m: "56.4k / 90k" },
            { icon: "arch", pct: "18%", t: "Viaje Japón", w: "18%", m: "320k / 1.8M" },
            { icon: "diamond", pct: "78%", t: "Freelance", w: "78%", m: "218k / 280k" },
          ].map((b, i) => (
            <div className="b" key={b.t}>
              <div className="g">
                {b.icon === "rect" && <svg width="18" height="18" viewBox="0 0 18 18"><rect x="2.5" y="2.5" width="13" height="13" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>}
                {b.icon === "circle" && <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>}
                {b.icon === "arch" && <svg width="18" height="18" viewBox="0 0 18 18"><path d="M2 16 A 8 8 0 0 1 16 16" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>}
                {b.icon === "diamond" && <svg width="18" height="18" viewBox="0 0 18 18"><rect x="3" y="3" width="12" height="12" transform="rotate(45 9 9)" stroke="currentColor" strokeWidth="1.3" fill="none" /></svg>}
                <span className="mono" style={{ fontSize: "9px", color: "var(--faint)", letterSpacing: "0.06em" }}>{b.pct}</span>
              </div>
              <div className="t">{b.t}</div>
              <div className="bar"><motion.i
                initial={{ width: "0%" }}
                whileInView={{ width: b.w }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.4 + i * 0.15, ...springGentle }}
              /></div>
              <div className="m">{b.m}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "F / 02",
      title: <>Captura en <em>3 segundos</em>.</>,
      text: "Anotá un gasto sin pensar. Widget en la pantalla principal, atajo en la pantalla de bloqueo, comando ⌘N en escritorio. Categoría sugerida automáticamente.",
      demo: (
        <div className="demo-capture">
          <div className="line">
            <span className="l">Monto</span>
            <span className="v amount">−AR$ 3,200</span>
            <span className="kbd">⌘↵</span>
          </div>
          <div className="line">
            <span className="l">Qué</span>
            <span className="v">Café Lattente</span>
          </div>
          <div className="line">
            <span className="l">Bloque</span>
            <span className="v" style={{ color: "var(--mute)" }}>Comida · sugerido</span>
            <span className="kbd">↹</span>
          </div>
        </div>
      ),
    },
    {
      num: "F / 03",
      title: <>Pulso <em>financiero</em>.</>,
      text: "Un solo número del 0 al 100 que resume tu mes. Sube cuando ahorrás, seguís tu plan y registrás a diario. Reemplaza dashboards llenos de KPIs por algo que sí podés sentir.",
      demo: (
        <div className="demo-pulso">
          <div className="num">78<small>/100</small></div>
          <div className="breakdown">
            {[
              { lbl: "Ahorro", w: "82%", v: "82" },
              { lbl: "Adherencia", w: "71%", v: "71" },
              { lbl: "Consistencia", w: "88%", v: "88" },
              { lbl: "Cuotas", w: "65%", v: "65" },
            ].map((r, i) => (
              <div className="row" key={r.lbl}>
                <span className="lbl">{r.lbl}</span>
                <span className="bar"><motion.i
                  initial={{ width: "0%" }}
                  whileInView={{ width: r.w }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.12, ...springGentle }}
                /></span>
                <span className="v">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: "F / 04",
      title: <>Lectura del <em>mes</em>.</>,
      text: "Cada lunes te llega tu semana en una página. Cada fin de mes, un editorial: patrones, tendencias, lo que cambió. Calmo, breve, sin alertas.",
      demo: (
        <div className="demo-reading">
          <div className="stat-row">
            <div>
              <div className="v">−7.5%</div>
              <div className="l">vs mes anterior</div>
            </div>
            <div>
              <div className="v">Mié</div>
              <div className="l">día de más gasto</div>
            </div>
            <div>
              <div className="v">13</div>
              <div className="l">días sin ocio</div>
            </div>
          </div>
          <svg className="spark" viewBox="0 0 300 40" preserveAspectRatio="none">
            <motion.polyline
              points="0,20 30,18 60,22 90,15 120,17 150,11 180,14 210,9 240,11 270,6 300,8"
              fill="none" stroke="currentColor" strokeWidth="1.2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
            />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <section id="features" style={{ paddingTop: "32px" }}>
      <div className="wrap">
        <motion.div
          className="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          {articles.map((a, i) => (
            <motion.article
              key={a.num}
              variants={fadeUp}
              transition={{ duration: 0.6, delay: i * 0.1, ease }}
            >
              <span className="num">{a.num}</span>
              <h3>{a.title}</h3>
              <p>{a.text}</p>
              <div className="demo">{a.demo}</div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// Quote
// ═══════════════════════════════════════════════════════════════

function QuoteSection() {
  const quoteRef = useRef<HTMLElement>(null);
  const { scrollYProgress: qp } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"],
  });
  const quoteY = useTransform(qp, [0, 1], [40, -24]);
  const quoteOpacity = useTransform(qp, [0, 0.35, 1], [0, 1, 1]);

  return (
    <section className="quote" ref={quoteRef}>
      <div className="wrap">
        <motion.blockquote
          style={{ y: quoteY, opacity: quoteOpacity }}
        >
          "La mejor app de finanzas es la que no necesitás abrir todos los días.
          gast.ar entendió eso antes que el resto."
        </motion.blockquote>
        <motion.cite
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.35, ease }}
        >
          Lucía Mendez · diseñadora · Buenos Aires
        </motion.cite>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// Pricing
// ═══════════════════════════════════════════════════════════════

function PricingSection() {
  const plans = [
    {
      name: "Plan / 01 · Apunte",
      tier: "Apunte",
      cost: "AR$ 0",
      period: "· para siempre",
      desc: "Lo básico para arrancar a anotar tus gastos. Sin cuentas conectadas, hasta 2 bloques.",
      features: [
        "Captura manual ilimitada",
        "2 bloques de vida",
        "Lectura mensual",
      ],
      crossed: [
        "Cuentas conectadas",
        "Sincronización entre dispositivos",
        "Pulso completo",
      ],
      cta: "Empezar gratis",
      ghost: true,
    },
    {
      name: "Plan / 02 · Tranquilo",
      tier: <><em>Tranquilo</em></>,
      cost: "AR$ 3.900",
      period: "· por mes",
      desc: "El plan para quien quiere ver su dinero entero. Bloques sin límite, Pulso, calendario, todo.",
      features: [
        "Captura manual + atajos",
        "Bloques ilimitados",
        "Pulso financiero completo",
        "Cuentas conectadas (MP · bancos · Wise)",
        "Sincronización móvil + escritorio",
        "Exportar a CSV / AFIP",
      ],
      crossed: [],
      cta: "Probar 30 días",
      ghost: false,
      featured: true,
    },
    {
      name: "Plan / 03 · Acompañado",
      tier: "Acompañado",
      cost: "AR$ 5.900",
      period: "· por mes",
      desc: "Compartido entre dos, con bloques propios y compartidos. Para parejas y convivientes.",
      features: [
        "Todo lo del plan Tranquilo",
        "2 usuarios + 1 workspace compartido",
        "Bloques privados y compartidos",
        "División justa automática",
        "Lectura conjunta del mes",
        "Soporte prioritario",
      ],
      crossed: [],
      cta: "Probar 30 días",
      ghost: true,
    },
  ];

  return (
    <section id="precios">
      <div className="wrap">
        <motion.div
          className="sec-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <span className="eyebrow">
              <motion.span
                className="dot"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              03 · Precios
            </span>
          </motion.div>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Pagás una vez por <em>mes</em>.<br />Nada más.
          </motion.h2>
        </motion.div>

        <motion.div
          className="prices"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerSlow}
        >
          {plans.map((p) => (
            <motion.div
              key={p.name}
              className={p.featured ? "featured" : ""}
              variants={p.featured ? scaleIn : fadeUp}
            >
              <div className="name">{p.name}</div>
              <div className="tier">{p.tier}</div>
              <div className="cost"><span>{p.cost}</span><small>{p.period}</small></div>
              <p className="desc">{p.desc}</p>
              <ul>
                {p.features.map((f) => <li key={f}>{f}</li>)}
                {p.crossed.map((f) => <li key={f} className="x">{f}</li>)}
              </ul>
              <motion.a
                className={`btn${p.ghost ? " ghost" : ""}`}
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={springGentle}
              >
                {p.cta}
              </motion.a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════════════════════

function FAQSection() {
  const items = [
    {
      q: "¿Mis datos están seguros? ¿Quién los ve?",
      a: "Cero personas en gast.ar ve tus movimientos. Local-first significa que los datos se guardan primero en tu dispositivo. Si activás sincronización, viajan cifrados extremo a extremo: nuestro servidor solo guarda blobs encriptados que ni nosotros podemos leer. No vendemos datos, no entrenamos modelos con ellos, no hay publicidad.",
    },
    {
      q: "¿Funciona si no tengo internet?",
      a: "Sí. La app entera funciona sin conexión, incluyendo capturas, búsqueda y reportes. La sincronización con cuentas bancarias (opcional) sí necesita internet, pero el resto vive 100% offline.",
    },
    {
      q: "¿Conecta con mi banco o con Mercado Pago?",
      a: "Hoy soportamos Mercado Pago, Galicia, Santander, BBVA, Brubank, Wise y Belo. Las conexiones son de solo lectura — gast.ar nunca puede mover plata. También podés importar resúmenes en PDF o CSV de cualquier banco.",
    },
    {
      q: "¿Hay app móvil además del workspace web?",
      a: "Sí — el workspace para escritorio (con teclado y comandos) y la app móvil para iPhone y Android. Ambas comparten datos y diseño. El móvil está optimizado para captura rápida y consultas; el escritorio, para entender y planificar.",
    },
    {
      q: "¿Por qué no hay notificaciones agresivas?",
      a: "Porque el éxito de gast.ar no se mide en cuántas veces lo abrís. Mandamos una sola notificación por semana — los lunes a la mañana, con tu resumen de los últimos 7 días. Si querés alertas adicionales (presupuesto excedido, cuotas próximas), las activás vos desde Ajustes.",
    },
    {
      q: "¿Puedo cancelar cuando quiera?",
      a: "Cuando quieras, sin penalidades. Si cancelás, mantenés acceso al plan Apunte gratis para siempre y podés exportar todos tus datos a CSV en cualquier momento. Sin retenciones, sin formularios oscuros.",
    },
  ];

  return (
    <section id="preguntas">
      <div className="wrap">
        <motion.div
          className="sec-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <span className="eyebrow">
              <motion.span
                className="dot"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              04 · Preguntas
            </span>
          </motion.div>
          <motion.h2 className="sec-title" variants={fadeUp}>
            Lo que <em>nos preguntan</em><br />antes de empezar.
          </motion.h2>
        </motion.div>

        <motion.div
          className="faq"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={staggerSlow}
        >
          {items.map((item) => (
            <motion.details key={item.q} variants={fadeUp}>
              <summary>
                <span>{item.q}</span>
                <span className="plus" />
              </summary>
              <div className="answer">{item.a}</div>
            </motion.details>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════
// Footer
// ═══════════════════════════════════════════════════════════════

function FooterSection() {
  const links = {
    Producto: ["Workspace", "App móvil", "Precios", "Preguntas"],
    Empresa: ["Manifiesto", "Notas", "Trabajá con nosotros", "Prensa"],
    Legal: ["Privacidad", "Términos", "Seguridad", "Cookies"],
  };

  return (
    <footer>
      <div className="wrap">
        <motion.div
          className="foot-top"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp}>
            <span className="eyebrow">
              <motion.span
                className="dot"
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              gast.ar · Buenos Aires
            </span>
            <p className="pitch" style={{ marginTop: "18px" }}>
              Una herramienta calma para tu dinero. Local primero, cifrada, sin notificaciones urgentes.
              Hecha en Buenos Aires por dos personas que querían dejar de mirar dashboards.
            </p>
          </motion.div>

          {Object.entries(links).map(([title, items]) => (
            <motion.div key={title} variants={fadeUp}>
              <h5>{title}</h5>
              <ul>
                {items.map((label) => (
                  <li key={label}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 3 }}
                      transition={{ duration: 0.2, ...springGentle }}
                    >
                      {label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        <motion.h2
          className="foot-wordmark"
          initial={{ opacity: 0, scale: 0.88, y: 32 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.9, ease }}
        >
          gast<em>.ar</em>
        </motion.h2>

        <motion.div
          className="foot-bottom"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span>© 2026 · gast.ar SAS · hecho con calma</span>
          <span>v0.2 · MAY 2026</span>
        </motion.div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function LandingPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // ── Scroll progress bar ──
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, mass: 0.5 });

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX }} />
      <TopBar scrolled={scrolled} theme={theme} toggleTheme={toggleTheme} />
      <main id="top">
        <HeroSection />
        <PrinciplesSection />
        <ProductSection />
        <FeaturesSection />
        <QuoteSection />
        <PricingSection />
        <FAQSection />
        <FooterSection />
      </main>
    </>
  );
}
