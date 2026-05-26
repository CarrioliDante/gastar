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
          <span className="dot anim-dot-pulse" style={{ animationDelay: "1s" }} />
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
            href="#"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={springGentle}
          >
            <span>Empezar</span>
            <span className="arrow anim-arrow-nudge">→</span>
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
              <span className="dot anim-dot-pulse-fast" style={{ animationDelay: "0.8s" }} />
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
                gast.ar es un cuaderno calmo para tu dinero. Cuotas, recurrentes, bloques, metas y dólar — todo en un solo lugar, sin notificaciones urgentes ni colores estridentes.
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
                <span className="arrow anim-arrow-nudge">→</span>
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
              <span className="meta">gratis · sin restricciones</span>
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
            <div className="anim-float-y" style={{ width: "100%", height: "100%", animationDelay: "1.6s" }}>
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
                      <div className="v">−7.5%</div>
                      <div className="l">vs mes anterior</div>
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
                        <rect x="1.5" y="1.5" width="4.5" height="4.5" rx="0.8" fill="currentColor" />
                        <rect x="8" y="1.5" width="4.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1" fill="none" />
                        <rect x="1.5" y="8" width="4.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1" fill="none" />
                        <rect x="8" y="8" width="4.5" height="4.5" rx="0.8" stroke="currentColor" strokeWidth="1" fill="none" />
                      </svg>
                      <span className="tab-label">Inicio</span>
                    </button>
                    <button>
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <line x1="3" y1="4.5" x2="11" y2="4.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        <line x1="3" y1="7.5" x2="11" y2="7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                        <line x1="3" y1="10.5" x2="8" y2="10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                      </svg>
                      <span className="tab-label">Movim.</span>
                    </button>
                    <div className="fab">
                      <svg width="10" height="10" viewBox="0 0 10 10">
                        <line x1="2" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <button>
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <circle cx="4" cy="4" r="2" stroke="currentColor" strokeWidth="1.1" fill="none" />
                        <rect x="8" y="2" width="4" height="4" rx="0.8" stroke="currentColor" strokeWidth="1.1" fill="none" />
                        <path d="M2 12l2-3.4L6 12" stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinejoin="round" />
                        <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.1" fill="none" />
                      </svg>
                      <span className="tab-label">Bloques</span>
                    </button>
                    <button>
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <rect x="2" y="8" width="2.5" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
                        <rect x="5.5" y="5" width="2.5" height="7" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
                        <rect x="9" y="6.5" width="2.5" height="5.5" rx="0.5" stroke="currentColor" strokeWidth="1" fill="none" />
                      </svg>
                      <span className="tab-label">Lectura</span>
                    </button>
                  </div>
                </div>
                <div className="home-bar" />
              </div>
            </div>
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
            { k: "AR$·USD", l: "Cuotas incluidas" },
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
              <span className="dot anim-dot-pulse-fast" />
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
              title: <>Tu dinero, <em>tuyo</em>.</>,
              text: "No vendemos tus datos, no los analizamos para anunciantes, no entrenamos modelos con ellos. Tu historial financiero es tuyo y de nadie más. Sin publicidad, sin rastreo de comportamiento, sin sorpresas.",
            },
            {
              n: "P / 03",
              title: <>Sin <em>slot machines</em>.</>,
              text: "Nada de notificaciones rojas, rachas de días o medallas. El éxito en gast.ar es ahorrar y dormir tranquilo, no abrir la app. Por eso no hay badges, puntos ni ninguna mecánica que te empuje a gastar más.",
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
              <span className="dot anim-dot-pulse-fast" />
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
                <span className="anim-traffic-1" />
                <span className="anim-traffic-2" />
                <span className="anim-traffic-3" />
              </div>
              <div className="url">gast.ar / inicio</div>
              <div style={{ width: "36px" }} />
            </div>
            <div style={{ display: "flex", overflow: "hidden" }}>
              {/* ── Sidebar ── */}
              <div style={{
                width: 148, flexShrink: 0,
                background: "var(--surf)",
                borderRight: "1px solid var(--hair)",
                display: "flex", flexDirection: "column",
                padding: "10px 8px",
                gap: 1,
              }}>
                {/* Logo */}
                <div style={{ padding: "4px 8px 10px", marginBottom: 4, borderBottom: "1px solid var(--hair)", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
                    <rect width="32" height="32" rx="7" fill="var(--ink)" />
                    <circle cx="16" cy="16" r="5.12" fill="var(--bg)" />
                  </svg>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 500, fontFamily: "'Inter Tight', sans-serif", color: "var(--ink)" }}>gast</span>
                    <em style={{ fontSize: 11, fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic", color: "var(--ink)", letterSpacing: "-0.03em" }}>.ar</em>
                    <div className="mono" style={{ fontSize: 8, color: "var(--faint)", letterSpacing: "0.06em", marginTop: 1 }}>Personal</div>
                  </div>
                </div>
                {/* Main nav */}
                {[
                  { label: "Inicio", active: true },
                  { label: "Movimientos", active: false },
                  { label: "Bloques", active: false },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: "5px 8px", borderRadius: 6, fontSize: 11,
                    background: item.active ? "var(--paper)" : "transparent",
                    color: item.active ? "var(--ink)" : "var(--mute)",
                    fontWeight: item.active ? 500 : 400,
                    letterSpacing: "-0.005em",
                  }}>
                    {item.label}
                  </div>
                ))}
                {/* Section: Compromisos */}
                <div className="mono" style={{ padding: "10px 8px 4px", fontSize: 8, color: "var(--faint)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Compromisos
                </div>
                {["Cuotas", "Recurrentes", "Calendario"].map((label) => (
                  <div key={label} style={{ padding: "5px 8px", borderRadius: 6, fontSize: 11, color: "var(--mute)", letterSpacing: "-0.005em" }}>
                    {label}
                  </div>
                ))}
                {/* Section: Crecimiento */}
                <div className="mono" style={{ padding: "10px 8px 4px", fontSize: 8, color: "var(--faint)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                  Crecimiento
                </div>
                {["Ahorro", "Dólar", "Lectura"].map((label) => (
                  <div key={label} style={{ padding: "5px 8px", borderRadius: 6, fontSize: 11, color: "var(--mute)", letterSpacing: "-0.005em" }}>
                    {label}
                  </div>
                ))}
              </div>

              {/* ── Main content ── */}
              <div className="preview" style={{ flex: 1, minWidth: 0 }}>
              <div className="top">
                <div>
                  <div className="eyebrow">Jueves · 14 mayo 2026</div>
                  <h4>Buen día, Tomás</h4>
                </div>
                <div className="eyebrow">
                  <span style={{ padding: "3px 8px", borderRadius: 99, border: "1px solid var(--hair)", fontSize: 9 }}>mes</span>
                </div>
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
                  <div className="v">−7.5%</div>
                  <div className="l">vs mes anterior</div>
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
            </div>{/* end flex body */}
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
      text: "Agrupá tus gastos por proyectos que sí importan: el apartamento, el auto, el viaje a Japón, el setup freelance. Cada bloque tiene su presupuesto, su barra de progreso y su historial propio.",
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
      text: "Anotá un gasto sin pensar. Formulario minimal desde web o móvil, con categoría sugerida. Dos toques y listo — sin formularios de 8 campos, sin seleccionar moneda, sin navegar menús.",
      demo: (
        <div className="demo-capture">
          <div className="line">
            <span className="l">Monto</span>
            <span className="v amount">−AR$ 3,200</span>
          </div>
          <div className="line">
            <span className="l">Qué</span>
            <span className="v">Café Lattente</span>
          </div>
          <div className="line">
            <span className="l">Categoría</span>
            <span className="v" style={{ color: "var(--mute)" }}>Comida · sugerido</span>
          </div>
        </div>
      ),
    },
    {
      num: "F / 03",
      title: <>Cuotas sin <em>dolor</em>.</>,
      text: "En Argentina las compras en cuotas son la norma. gast.ar lo entiende: registrá una compra en 12 cuotas y el sistema sabe cuánto pagaste, cuánto falta y cuándo vence cada una. Con categoría propia para filtrarlas.",
      demo: (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { name: "MacBook Pro", paid: 9, total: 12, monthly: "58.4k" },
            { name: "Smart TV", paid: 3, total: 6, monthly: "42.1k" },
            { name: "Heladera", paid: 1, total: 18, monthly: "24.6k" },
          ].map((c, i) => (
            <div key={c.name} style={{
              padding: "10px 0",
              borderBottom: i < 2 ? "1px solid var(--hair)" : "none",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "baseline" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.005em" }}>{c.name}</span>
                <span className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.06em" }}>
                  {c.paid}/{c.total} · ${c.monthly}/mes
                </span>
              </div>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: c.total }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: 0.4 + i * 0.1 + j * 0.04 }}
                    style={{
                      flex: 1, height: 2, borderRadius: 99,
                      background: j < c.paid ? "var(--ink)" : "var(--hair2)",
                      willChange: "opacity",
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: "F / 04",
      title: <>El mapa de tu <em>año</em>.</>,
      text: "21 semanas de gastos, día a día, en un mapa de calor. Patrones que no verías en una lista: los miércoles gastás más, agosto fue tranquilo, diciembre te pasa factura. Se construye solo con tu historia.",
      demo: (
        <div>
          <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
            {[
              { v: "Mié", l: "día pico" },
              { v: "−7.5%", l: "vs anterior" },
              { v: "21", l: "semanas" },
            ].map((s) => (
              <div key={s.l}>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontWeight: 500, fontSize: 18, letterSpacing: "-0.03em", color: "var(--ink)" }}>{s.v}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--mute)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} style={{ display: "flex", gap: 3, marginBottom: 3 }}>
              {Array.from({ length: 21 }).map((_, col) => {
                const val = Math.abs(Math.sin((row + 1) * 1.3 + col * 0.7));
                const alpha = col < 3 ? 0.05 : val > 0.72 ? 0.82 : val > 0.48 ? 0.48 : val > 0.24 ? 0.22 : 0.07;
                return (
                  <motion.div
                    key={col}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: 0.2 + col * 0.02 + row * 0.015 }}
                    style={{ width: 10, height: 10, borderRadius: 2, background: `rgba(0,0,0,${alpha})`, willChange: "transform, opacity" }}
                  />
                );
              })}
            </div>
          ))}
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
// FAQ
// ═══════════════════════════════════════════════════════════════

function FAQSection() {
  const items = [
    {
      q: "¿Mis datos están seguros? ¿Quién los ve?",
      a: "Cero personas en gast.ar ve tus movimientos. Los datos se guardan en Supabase, una base de datos cifrada con acceso restringido a tu cuenta. No vendemos datos, no los analizamos para anunciantes, no entrenamos modelos con ellos. Podés exportar todo a CSV en cualquier momento.",
    },
    {
      q: "¿Funciona si no tengo internet?",
      a: "El workspace web necesita conexión para funcionar. La app móvil muestra tus últimos datos mientras estás sin señal y sincroniza automáticamente en cuanto volvés a conectarte.",
    },
    {
      q: "¿Conecta con mi banco o con Mercado Pago?",
      a: "Hoy el ingreso de datos es manual o por importación de extractos CSV (Mercado Pago, BBVA, Galicia). Las conexiones bancarias en tiempo real son roadmap — queremos hacerlo bien antes de lanzarlo.",
    },
    {
      q: "¿Hay app móvil además del workspace web?",
      a: "Sí — el workspace para escritorio (con teclado y comandos) y la app móvil para iPhone y Android. Ambas comparten datos y diseño. El móvil está optimizado para captura rápida y consultas; el escritorio, para entender y planificar.",
    },
    {
      q: "¿Por qué no hay notificaciones agresivas?",
      a: "Porque el éxito de gast.ar no se mide en cuántas veces lo abrís. Por ahora la app es silenciosa por diseño — no mandamos notificaciones. Las alertas opcionales (presupuesto excedido, cuotas próximas) son roadmap.",
    },
    {
      q: "¿Puedo exportar mis datos?",
      a: "Sí, siempre. Podés exportar todos tus movimientos a CSV desde Configuración en cualquier momento. Tu historial financiero es tuyo — no hay lock-in.",
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
              <span className="dot anim-dot-pulse-fast" />
              03 · Preguntas
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
    Producto: ["Workspace", "App móvil", "Preguntas"],
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
              <span className="dot anim-dot-pulse-fast" />
              gast.ar · Buenos Aires
            </span>
            <p className="pitch" style={{ marginTop: "18px" }}>
              Una herramienta calma para tu dinero. Sin publicidad, sin rastreo, sin notificaciones urgentes.
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
      <p style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9, textTransform: "uppercase", letterSpacing: "0.22em",
        color: "var(--whisper)", textAlign: "center", margin: "0 0 20px",
        userSelect: "none",
      }}>
        Hecho en Argentina
      </p>
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
        <FAQSection />
        <FooterSection />
      </main>
    </>
  );
}
