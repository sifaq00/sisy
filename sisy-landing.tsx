import { useState, useEffect, useRef } from "react";

/* ============================================================
   SISY — Landing page v3
   Motion inventory:
   1. boulder scroll-progress line (brand signature)
   2. line-mask hero reveal
   3. 3D ring carousel, auto-rotating right → left
   4. infinite marquee
   5. alternating side reveals on feature rows
   6. self-optimizing schedule, live timer, typed terminal
   7. magnetic hero CTA
   Reduced-motion: everything lands static & visible.
   ============================================================ */

const T = {
  cream: "#F5F0E4",
  card: "#FFFDF7",
  tint: "#E9E1CF",
  olive: "#5A684B",
  ink: "#211F1A",
  inkSoft: "#57534A",
  faint: "#8C867A",
  line: "#E2D9C6",
  orange: "#C9662A",
  serif: "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif",
  sans: "-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif",
  mono: "'JetBrains Mono','SF Mono',Consolas,ui-monospace,monospace",
};

/* ---------- hooks ---------- */

function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function Reveal({ children, delay = 0, from = "up", className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref}
         className={`s-io s-io-${from} ${inView ? "s-io-in" : ""} ${className}`}
         style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* magnetic CTA: follows the cursor a few px, springs back */
function Magnetic({ children }) {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };
  const leave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return (
    <span ref={ref} className="s-magnet" onMouseMove={move} onMouseLeave={leave}>
      {children}
    </span>
  );
}

/* ---------- miniature product UI ---------- */

function MiniSchedule({ big = false }) {
  const layouts = [
    [{ w: 30, x: 4, hot: true }, { w: 22, x: 38 }, { w: 18, x: 64 }],
    [{ w: 22, x: 4 }, { w: 30, x: 30, hot: true }, { w: 18, x: 66 }],
    [{ w: 18, x: 4 }, { w: 22, x: 26 }, { w: 30, x: 52, hot: true }],
  ];
  const algos = ["genetic", "monte carlo", "greedy"];
  const [i, setI] = useState(0);
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setFlash(true);
      setI((v) => (v + 1) % layouts.length);
      setTimeout(() => setFlash(false), 700);
    }, 3400);
    return () => clearInterval(id);
  }, []);
  const H = big ? 64 : 34, BH = big ? 46 : 22;
  return (
    <div className="s-mini" style={big ? { fontSize: 12 } : null}>
      <div className="s-mini-head" style={big ? { fontSize: 10 } : null}>
        TODAY · OPTIMIZED
        <span className={`s-mini-live ${flash ? "s-mini-live-on" : ""}`}>● {algos[i]}</span>
      </div>
      <div style={{ position: "relative", height: H, marginTop: big ? 12 : 8 }}>
        {[0, 25, 50, 75, 100].map((x) => (
          <span key={x} style={{ position: "absolute", left: x + "%", top: 0, bottom: 0, borderLeft: `1px solid ${T.line}` }} />
        ))}
        {layouts[i].map((b, k) => (
          <span key={k} className="s-mini-block" style={{
            left: b.x + "%", width: b.w + "%", height: BH,
            background: b.hot ? T.orange : T.card,
            border: `1px solid ${b.hot ? T.orange : T.line}`,
            transitionDelay: `${k * 70}ms`,
          }} />
        ))}
      </div>
      <div className="s-mini-foot" style={big ? { fontSize: 10, marginTop: 12 } : null}>
        <i style={{ background: T.olive }} /> actual · <i style={{ background: T.orange }} /> next up
      </div>
    </div>
  );
}

function MiniTasks() {
  const rows = [["10", "Migrate scheduler", true], ["08", "Gantt export", false], ["06", "Fix dep detector", false]];
  return (
    <div className="s-mini">
      {rows.map(([p, t, on], i) => (
        <div key={i} className="s-mini-row">
          <span className="s-mini-check" style={{ background: on ? T.olive : "transparent", borderColor: on ? T.olive : T.line }} />
          <span className="s-mini-pri">{p}</span>
          <span className="s-mini-title" style={{ textDecoration: on ? "line-through" : "none", color: on ? T.faint : T.ink }}>{t}</span>
        </div>
      ))}
    </div>
  );
}

function MiniTimer({ big = false }) {
  const [s, setS] = useState(5772);
  useEffect(() => {
    const id = setInterval(() => setS((v) => v + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (n) => String(n).padStart(2, "0");
  return (
    <div className="s-mini" style={{ textAlign: "center", paddingTop: big ? 20 : 14 }}>
      <div style={{ fontFamily: T.mono, fontSize: big ? 34 : 22, color: T.ink, letterSpacing: 1, fontVariantNumeric: "tabular-nums" }}>
        {fmt(Math.floor(s / 3600))}:{fmt(Math.floor((s % 3600) / 60))}:{fmt(s % 60)}
      </div>
      <div style={{ fontSize: big ? 12 : 10, color: T.faint, marginTop: 4 }}>Migrate scheduler · plan 3h</div>
      <div style={{ height: big ? 6 : 4, background: T.tint, borderRadius: 3, margin: "12px 8px 4px", overflow: "hidden" }}>
        <span style={{ display: "block", width: Math.min((s / 10800) * 100, 100) + "%", height: "100%", background: T.olive, borderRadius: 3, transition: "width 1s linear" }} />
      </div>
      {big && (
        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 8px 0", fontFamily: T.mono, fontSize: 10, color: T.faint }}>
          <span>planned 3h 00m</span>
          <span style={{ color: T.olive }}>actual 1h 36m</span>
        </div>
      )}
    </div>
  );
}

function MiniGantt() {
  const bars = [[0, 40], [25, 35], [50, 30], [70, 26]];
  return (
    <div className="s-mini">
      <div className="s-mini-head">WEEK 35</div>
      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        {bars.map(([x, w], i) => (
          <div key={i} style={{ position: "relative", height: 8 }}>
            <span style={{ position: "absolute", left: x + "%", width: w + "%", top: 0, bottom: 0, background: i === 0 ? T.orange : T.tint, border: `1px solid ${i === 0 ? T.orange : T.line}`, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniDeps() {
  return (
    <div className="s-mini">
      <div className="s-mini-head">DEPENDENCIES</div>
      <svg viewBox="0 0 140 56" style={{ width: "100%", marginTop: 6 }}>
        <line x1="28" y1="14" x2="68" y2="28" stroke={T.faint} strokeWidth="1" strokeDasharray="3 2" />
        <line x1="28" y1="44" x2="68" y2="28" stroke={T.faint} strokeWidth="1" strokeDasharray="3 2" />
        <line x1="76" y1="28" x2="114" y2="28" stroke={T.orange} strokeWidth="1.2" />
        <circle cx="24" cy="14" r="5" fill={T.olive} />
        <circle cx="24" cy="44" r="5" fill={T.olive} />
        <circle cx="72" cy="28" r="5" fill={T.card} stroke={T.ink} />
        <circle cx="118" cy="28" r="5" fill={T.orange} />
      </svg>
      <div className="s-mini-foot">no cycles detected</div>
    </div>
  );
}

function MiniNotes() {
  return (
    <div className="s-mini">
      <div className="s-mini-head">NOTES · SY-0142</div>
      <div style={{ marginTop: 7, fontFamily: T.mono, fontSize: 9, lineHeight: 1.9, color: T.inkSoft }}>
        <div>## async queue</div>
        <div style={{ color: T.olive }}>- [x] job schema</div>
        <div>- [ ] worker heartbeat</div>
        <div>- [ ] retry w/ backoff</div>
      </div>
    </div>
  );
}

function MiniCLI() {
  return (
    <div className="s-mini s-mini-dark">
      <div style={{ color: "#8FA07E" }}>$ sisy optimize --algo genetic</div>
      <div style={{ color: "#C7BFAF" }}>✓ 8 tasks rescheduled · 0.41s<span className="s-caret">▌</span></div>
    </div>
  );
}

function MiniWs() {
  return (
    <div className="s-mini">
      <div className="s-mini-head">LIVE · WEBSOCKET</div>
      <div style={{ marginTop: 7, fontFamily: T.mono, fontSize: 9, lineHeight: 1.9, color: T.inkSoft }}>
        <div><span style={{ color: T.olive }}>▲</span> SY-0137 → done</div>
        <div><span style={{ color: T.orange }}>▲</span> timer started</div>
        <div><span style={{ color: T.faint }}>▲</span> schedule updated</div>
        <div><span style={{ color: T.olive }}>▲</span> SY-0139 unblocked</div>
      </div>
    </div>
  );
}

function MiniAudit() {
  const rows = [
    ["12:41", "SY-0137 status → done", T.olive],
    ["12:38", "timer stopped · 1h 52m", T.inkSoft],
    ["11:02", "priority 8 → 10", T.orange],
    ["09:14", "SY-0143 created", T.inkSoft],
  ];
  return (
    <div className="s-mini">
      <div className="s-mini-head">AUDIT LOG</div>
      <div style={{ marginTop: 7, fontFamily: T.mono, fontSize: 9, lineHeight: 2 }}>
        {rows.map(([t, m, c], i) => (
          <div key={i}><span style={{ color: T.faint }}>{t}</span> <span style={{ color: c }}>{m}</span></div>
        ))}
      </div>
    </div>
  );
}

function MiniHeat() {
  const cells = [0,1,2,0,3,1,2,3,0,1, 2,3,1,0,2,3,3,1,0,2, 1,0,3,2,1,3,0,2,3,1];
  const shades = ["transparent", "rgba(90,104,75,0.25)", "rgba(90,104,75,0.55)", T.olive];
  return (
    <div className="s-mini">
      <div className="s-mini-head">LAST 30 DAYS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4, marginTop: 9 }}>
        {cells.map((c, i) => (
          <span key={i} style={{ aspectRatio: "1", borderRadius: 3, border: `1px solid ${T.line}`, background: shades[c] }} />
        ))}
      </div>
      <div className="s-mini-foot">tracked time per day</div>
    </div>
  );
}

function MiniBench() {
  const rows = [["genetic", 92, "0.41s", true], ["monte carlo", 74, "0.33s", false], ["annealing", 61, "0.27s", false], ["greedy", 22, "0.09s", false]];
  return (
    <div className="s-mini">
      <div className="s-mini-head">BENCHMARK · 500 TASKS</div>
      <div style={{ marginTop: 9, display: "grid", gap: 7 }}>
        {rows.map(([a, w, t, hot]) => (
          <div key={a} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 8.5 }}>
            <span style={{ width: 62, color: T.inkSoft, flexShrink: 0 }}>{a}</span>
            <span style={{ flex: 1, height: 5, background: T.tint, borderRadius: 3, overflow: "hidden" }}>
              <span style={{ display: "block", width: w + "%", height: "100%", background: hot ? T.orange : T.olive, borderRadius: 3 }} />
            </span>
            <span style={{ color: T.faint }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniPri() {
  const rows = [["P10", 2, T.orange], ["P8–9", 3, T.orange], ["P5–7", 5, "#B08968"], ["P1–4", 4, T.faint]];
  return (
    <div className="s-mini">
      <div className="s-mini-head">PRIORITY SPREAD</div>
      <div style={{ marginTop: 9, display: "grid", gap: 7 }}>
        {rows.map(([l, n, c]) => (
          <div key={l} style={{ display: "flex", alignItems: "center", gap: 7, fontFamily: T.mono, fontSize: 8.5 }}>
            <span style={{ width: 34, color: T.inkSoft }}>{l}</span>
            <span style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: n }).map((_, i) => (
                <i key={i} style={{ width: 9, height: 9, borderRadius: 3, background: c, fontStyle: "normal", display: "block" }} />
              ))}
            </span>
            <span style={{ color: T.faint }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- landscape scenes ---------- */

/* Sisyphus hills — layered, muted, calm. Parallax via scrollY. */
function Scene({ scrollY }) {
  const p = (k) => ({ transform: `translateY(${Math.min(scrollY * k, 60)}px)` });
  return (
    <div className="s-scene" aria-hidden="true">
      {/* sun */}
      <div className="s-sun" style={p(0.03)} />
      {/* clouds */}
      <div className="s-cloud s-cloud-a" />
      <div className="s-cloud s-cloud-b" />
      {/* hills, far → near */}
      <svg className="s-hill" style={p(0.05)} viewBox="0 0 1440 420" preserveAspectRatio="none">
        <path d="M0,300 C240,255 480,285 720,250 C960,215 1200,265 1440,225 L1440,420 L0,420 Z" fill="#ECE4CD" />
      </svg>
      <svg className="s-hill" style={p(0.09)} viewBox="0 0 1440 420" preserveAspectRatio="none">
        <path d="M0,340 C210,298 500,332 760,300 C1020,268 1250,315 1440,288 L1440,420 L0,420 Z" fill="#E2D6B8" />
      </svg>
      <svg className="s-hill" style={p(0.14)} viewBox="0 0 1440 420" preserveAspectRatio="none">
        <path d="M0,382 C260,342 520,372 800,346 C1080,320 1290,358 1440,338 L1440,420 L0,420 Z" fill="#D5C9A6" />
        {/* the boulder, partway up the near hill */}
        <path d="M120,378 C260,352 420,362 560,349" stroke="#B8AC89" strokeWidth="1.5" strokeDasharray="1 7" fill="none" strokeLinecap="round" />
        <circle cx="378" cy="352" r="7" fill="#C9662A" />
        <circle cx="376" cy="350" r="1.8" fill="#F5F0E4" opacity="0.75" />
      </svg>
      {/* fade into page */}
      <div className="s-scene-fade" />
    </div>
  );
}

/* Night variant for the CTA band. */
function SceneNight() {
  return (
    <div className="s-night" aria-hidden="true">
      <div className="s-moon" />
      <span className="s-star" style={{ left: "16%", top: "22%" }} />
      <span className="s-star" style={{ left: "30%", top: "12%", animationDelay: "1.2s" }} />
      <span className="s-star" style={{ left: "70%", top: "16%", animationDelay: "0.6s" }} />
      <span className="s-star" style={{ left: "84%", top: "30%", animationDelay: "1.8s" }} />
      <svg className="s-night-hill" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0,140 C260,105 560,135 820,110 C1080,85 1280,120 1440,100 L1440,200 L0,200 Z" fill="#1B1A14" />
        <path d="M0,175 C300,150 640,172 940,152 C1180,138 1340,160 1440,150 L1440,200 L0,200 Z" fill="#141310" />
        <circle cx="1050" cy="106" r="5" fill="#C9662A" opacity="0.85" />
      </svg>
    </div>
  );
}

/* ---------- typed terminal (proof section) ---------- */

function TypedTerminal() {
  const [ref, inView] = useInView(0.4);
  const [n, setN] = useState(0);
  const lines = [
    ["$ sisy --version", "#8FA07E"],
    ["sisy 1.0.0 · MIT licensed · open source", "#C7BFAF"],
    ["$ sisy stats", "#8FA07E"],
    ["9 scheduling algorithms · 5 packages on PyPI", "#C7BFAF"],
    ["1 shared API — the CLI, TUI and web read the same data", "#C7BFAF"],
    ["871 commits, built in public. read the code before you trust it.", "#C7BFAF"],
  ];
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setN(lines.length); return; }
    const id = setInterval(() => setN((v) => {
      if (v >= lines.length) { clearInterval(id); return v; }
      return v + 1;
    }), 380);
    return () => clearInterval(id);
  }, [inView]);
  return (
    <div ref={ref} className="s-term">
      <div className="s-term-bar"><i /><i /><i /></div>
      <div className="s-term-body">
        {lines.slice(0, n).map(([l, c], i) => (
          <div key={i} className="s-term-line" style={{ color: c }}>{l}</div>
        ))}
        <span className="s-caret" style={{ color: "#8FA07E" }}>▌</span>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function SisyLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 8);
      setScrollY(window.scrollY);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? window.scrollY / max : 0);
    };
    window.addEventListener("scroll", h, { passive: true });
    const t = setTimeout(() => setLoaded(true), 60);
    return () => { window.removeEventListener("scroll", h); clearTimeout(t); };
  }, []);

  const ringCards = [
    <MiniSchedule key="s" />, <MiniTasks key="t" />, <MiniTimer key="ti" />, <MiniCLI key="c" />,
    <MiniGantt key="g" />, <MiniDeps key="d" />, <MiniNotes key="n" />, <MiniWs key="w" />,
    <MiniAudit key="a" />, <MiniHeat key="h" />, <MiniBench key="b" />, <MiniPri key="p" />,
  ];

  const marquee = ["9 scheduling algorithms", "planned vs actual", "no team chat", "MIT licensed",
    "works offline", "SQLite on your disk", "CLI · TUI · Web", "dependencies that hold"];

  return (
    <div className={`s-root ${loaded ? "s-loaded" : ""}`}>
      <style>{css}</style>

      {/* boulder scroll progress — the sisyphus signature */}
      <div className="s-progress" aria-hidden="true">
        <div className="s-progress-line" />
        <div className="s-boulder" style={{ left: `calc(${(progress * 100).toFixed(2)}% - 5px)`,
                                            transform: `rotate(${(progress * 720).toFixed(0)}deg)` }} />
      </div>

      {/* nav */}
      <nav className={`s-nav ${scrolled ? "s-nav-scrolled" : ""}`}>
        <div className="s-nav-links">
          <a href="#optimizer">Optimizer</a>
          <a href="#tracking">Tracking</a>
          <a href="#open">Open source</a>
        </div>
        <div className="s-logo">sisy<span className="s-logo-dot">●</span></div>
        <div className="s-nav-right">
          <a href="#docs">Docs</a>
          <a href="#github">GitHub</a>
          <button className="s-pill">Get started <span className="s-pill-arrow">→</span></button>
        </div>
      </nav>

      {/* hero + carousel over the hills */}
      <div className="s-heroband">
        <Scene scrollY={scrollY} />

        <header className="s-hero">
          <h1 className="s-h1">
            <span className="s-mask"><span className="s-mask-in s-h1-serif" style={{ "--d": "80ms" }}>The boulder rolls back.</span></span>
            <span className="s-mask"><span className="s-mask-in s-h1-sans" style={{ "--d": "220ms" }}>Push it smarter.</span></span>
          </h1>
          <p className="s-sub s-in" style={{ "--d": "420ms" }}>
            sisy is a task manager with a schedule optimizer.<br />
            Your tasks won't finish themselves — but they can be in the right order.
          </p>
          <div className="s-in" style={{ "--d": "540ms" }}>
            <Magnetic>
              <button className="s-pill s-pill-lg">Start for free <span className="s-pill-arrow">→</span></button>
            </Magnetic>
          </div>
        </header>

        {/* 3D ring carousel — rotates right → left, pause on hover */}
        <div className="s-stage s-in" style={{ "--d": "700ms" }} aria-hidden="true">
          <div className="s-ring-tilt">
            <div className="s-ring">
              {ringCards.map((c, i) => (
                <div key={i} className="s-ring-card" style={{ "--i": i }}>{c}</div>
              ))}
            </div>
          </div>
          <div className="s-stage-fade s-stage-fade-l" />
          <div className="s-stage-fade s-stage-fade-r" />
        </div>
      </div>

      {/* marquee divider */}
      <div className="s-marquee" aria-hidden="true">
        <div className="s-marquee-track">
          {[0, 1].map((dup) => (
            <div key={dup} className="s-marquee-group">
              {marquee.map((m) => (
                <span key={m + dup} className="s-marquee-item">{m}<i>●</i></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* feature: optimizer */}
      <section className="s-feat-wrap" id="optimizer">
        <div className="s-feat">
          <Reveal from="left">
            <div className="s-feat-text">
              <div className="s-eyebrow">THE CORE</div>
              <h2 className="s-h2">The optimizer is<br />the product</h2>
              <p>Pick an algorithm — greedy to genetic — press one button, and your day is reordered around priorities, deadlines, and dependencies. Deterministic runs, benchmarkable results.</p>
              <a className="s-textlink" href="#docs">How the nine algorithms differ →</a>
            </div>
          </Reveal>
          <Reveal from="right" delay={120}>
            <div className="s-feat-media">
              <MiniSchedule big />
            </div>
          </Reveal>
        </div>

        {/* feature: tracking */}
        <div className="s-feat s-feat-flip" id="tracking">
          <Reveal from="left" delay={120}>
            <div className="s-feat-media">
              <MiniTimer big />
            </div>
          </Reveal>
          <Reveal from="right">
            <div className="s-feat-text">
              <div className="s-eyebrow">THE MIRROR</div>
              <h2 className="s-h2">Honest time<br />tracking</h2>
              <p>Planned vs actual on every task, tracked automatically while you work. You see where the estimate broke — not just that it did. Estimates get better because the data is in front of you.</p>
              <a className="s-textlink" href="#docs">Planned vs actual, explained →</a>
            </div>
          </Reveal>
        </div>

        {/* feature: terminal-born */}
        <div className="s-feat">
          <Reveal from="left">
            <div className="s-feat-text">
              <div className="s-eyebrow">THE HERITAGE</div>
              <h2 className="s-h2">Terminal-born,<br />web-grown</h2>
              <p>Full CLI and TUI ship alongside the web app. Same server, same SQLite file, live over WebSocket — close the browser mid-task and keep working from the terminal. Nothing to sync.</p>
              <a className="s-textlink" href="#docs">Install the CLI →</a>
            </div>
          </Reveal>
          <Reveal from="right" delay={120}>
            <div className="s-feat-media s-feat-media-dark">
              <div className="s-mini s-mini-dark" style={{ fontSize: 11, lineHeight: 2 }}>
                <div style={{ color: "#8FA07E" }}>$ sisy add "ship v1" --priority 10</div>
                <div style={{ color: "#C7BFAF" }}>✓ SY-0143 created</div>
                <div style={{ color: "#8FA07E" }}>$ sisy tui</div>
                <div style={{ color: "#C7BFAF" }}>launching… same tasks, zero sync<span className="s-caret">▌</span></div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* proof — typed terminal instead of stat tiles */}
      <section className="s-proof" id="open">
        <Reveal>
          <div className="s-eyebrow" style={{ textAlign: "center" }}>NO TESTIMONIALS</div>
          <h2 className="s-h2" style={{ textAlign: "center" }}>Just the repo.</h2>
        </Reveal>
        <Reveal delay={140}>
          <TypedTerminal />
        </Reveal>
      </section>

      {/* CTA band */}
      <Reveal>
        <section className="s-cta">
          <SceneNight />
          <div className="s-cta-inner">
            <h2 className="s-cta-h">
              <span className="s-h1-serif" style={{ color: "#D8D2C2" }}>Same boulder tomorrow.</span><br />
              <span style={{ color: "#F5F0E4" }}>Better order today.</span>
            </h2>
            <Magnetic>
              <button className="s-pill s-pill-light">Get started for free <span className="s-pill-arrow">→</span></button>
            </Magnetic>
            <div className="s-cta-note">Self-hostable · works offline · your data stays in SQLite</div>
          </div>
        </section>
      </Reveal>

      <footer className="s-footer">
        <span className="s-logo" style={{ fontSize: 15 }}>sisy<span className="s-logo-dot">●</span></span>
        <span>Docs · GitHub · Changelog · X</span>
        <span style={{ color: T.faint }}>© 2026 — built in public from Bali</span>
      </footer>
    </div>
  );
}

/* ---------- styles ---------- */

const css = `
* { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; }
.s-root {
  background: ${T.cream}; color: ${T.ink};
  font-family: ${T.sans}; overflow-x: hidden; min-height: 100vh;
}
a { color: inherit; text-decoration: none; }
button { font-family: inherit; cursor: pointer; }
button:focus-visible, a:focus-visible { outline: 2px solid ${T.orange}; outline-offset: 2px; border-radius: 4px; }

/* ===== boulder scroll progress ===== */
.s-progress { position: fixed; top: 0; left: 0; right: 0; height: 12px; z-index: 40; pointer-events: none; }
.s-progress-line { position: absolute; top: 5px; left: 0; right: 0; border-top: 1px solid ${T.line}; }
.s-boulder {
  position: absolute; top: 1px; width: 10px; height: 10px; border-radius: 50%;
  background: ${T.orange};
}
.s-boulder::after {
  content: ""; position: absolute; top: 2px; left: 2px; width: 3px; height: 3px;
  border-radius: 50%; background: rgba(245,240,228,0.7);
}

/* ===== hero band + landscape ===== */
.s-heroband { position: relative; }
.s-heroband .s-hero, .s-heroband .s-stage { position: relative; z-index: 2; }

.s-scene { position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; }
.s-hill { position: absolute; left: -2%; right: -2%; bottom: -8px; width: 104%; height: 62%; }
.s-sun {
  position: absolute; top: 9%; right: 14%; width: 92px; height: 92px; border-radius: 50%;
  background: radial-gradient(circle, rgba(224,167,84,0.5), rgba(224,167,84,0.16) 55%, transparent 72%);
}
.s-cloud {
  position: absolute; height: 26px; border-radius: 999px;
  background: rgba(255,253,247,0.75); filter: blur(10px);
}
.s-cloud-a { top: 16%; left: -140px; width: 180px; animation: sDrift 90s linear infinite; }
.s-cloud-b { top: 27%; left: -220px; width: 130px; animation: sDrift 120s linear infinite; animation-delay: -45s; }
@keyframes sDrift { to { transform: translateX(calc(100vw + 320px)); } }
.s-scene-fade {
  position: absolute; left: 0; right: 0; bottom: 0; height: 90px;
  background: linear-gradient(to bottom, transparent, ${T.cream});
}

/* ===== motion primitives ===== */
.s-in { opacity: 0; transform: translateY(16px); }
.s-loaded .s-in {
  animation: sFadeUp 0.7s cubic-bezier(0.22, 0.9, 0.3, 1) forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes sFadeUp { to { opacity: 1; transform: translateY(0); } }

/* line-mask reveal for headline */
.s-mask { display: block; overflow: hidden; padding-bottom: 0.08em; }
.s-mask-in { display: block; transform: translateY(112%); }
.s-loaded .s-mask-in {
  animation: sMaskUp 0.85s cubic-bezier(0.2, 0.85, 0.2, 1) forwards;
  animation-delay: var(--d, 0ms);
}
@keyframes sMaskUp { to { transform: translateY(0); } }

/* scroll reveals with direction */
.s-io { opacity: 0; transition: opacity 0.75s cubic-bezier(0.22,0.9,0.3,1), transform 0.75s cubic-bezier(0.22,0.9,0.3,1); }
.s-io-up { transform: translateY(24px); }
.s-io-left { transform: translateX(-32px); }
.s-io-right { transform: translateX(32px); }
.s-io-in { opacity: 1; transform: translate(0,0); }

.s-magnet { display: inline-block; transition: transform 0.25s cubic-bezier(0.22,0.9,0.3,1); }

/* ===== nav ===== */
.s-nav {
  position: sticky; top: 0; z-index: 20;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding: 20px 40px 16px; transition: background 0.25s, box-shadow 0.25s;
}
.s-nav-scrolled { background: rgba(245,240,228,0.92); backdrop-filter: blur(8px); box-shadow: 0 1px 0 ${T.line}; }
.s-nav-links { display: flex; gap: 22px; font-size: 13.5px; color: ${T.inkSoft}; }
.s-nav-links a, .s-nav-right a { position: relative; transition: color 0.15s; }
.s-nav-links a:hover, .s-nav-right a:hover { color: ${T.ink}; }
.s-nav-links a::after, .s-nav-right a::after {
  content: ""; position: absolute; left: 0; right: 100%; bottom: -3px;
  border-bottom: 1.5px solid ${T.orange}; transition: right 0.25s cubic-bezier(0.22,0.9,0.3,1);
}
.s-nav-links a:hover::after, .s-nav-right a:hover::after { right: 0; }
.s-logo { font-family: ${T.serif}; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; text-align: center; }
.s-logo-dot { color: ${T.orange}; font-size: 11px; vertical-align: super; margin-left: 1px; display: inline-block; }
.s-logo:hover .s-logo-dot { animation: sRoll 0.9s cubic-bezier(0.3,0.8,0.3,1); }
@keyframes sRoll {
  0% { transform: translateX(0) rotate(0); }
  50% { transform: translateX(6px) rotate(180deg); }
  100% { transform: translateX(0) rotate(360deg); }
}
.s-nav-right { display: flex; gap: 22px; align-items: center; justify-content: flex-end; font-size: 13.5px; color: ${T.inkSoft}; }

.s-pill {
  background: ${T.ink}; color: ${T.cream}; border: none; border-radius: 999px;
  padding: 9px 18px; font-size: 13px; font-weight: 600;
  display: inline-flex; align-items: center; gap: 8px;
  transition: transform 0.18s cubic-bezier(0.22,0.9,0.3,1), box-shadow 0.18s;
}
.s-pill:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(40,34,22,0.18); }
.s-pill:active { transform: translateY(0); }
.s-pill-arrow {
  background: ${T.cream}; color: ${T.ink}; border-radius: 50%;
  width: 18px; height: 18px; display: grid; place-items: center; font-size: 11px;
  transition: transform 0.18s cubic-bezier(0.22,0.9,0.3,1);
}
.s-pill:hover .s-pill-arrow { transform: translateX(3px); }
.s-pill-lg { padding: 13px 26px; font-size: 15px; margin-top: 28px; }
.s-pill-light { background: ${T.cream}; color: ${T.ink}; }
.s-pill-light .s-pill-arrow { background: ${T.ink}; color: ${T.cream}; }

/* ===== hero ===== */
.s-hero { text-align: center; padding: 60px 24px 0; max-width: 1080px; margin: 0 auto; }
.s-h1 { line-height: 1.06; letter-spacing: -0.5px; }
.s-h1-serif { font-family: ${T.serif}; font-weight: 400; font-size: clamp(30px, 5vw, 52px); color: ${T.ink}; }
.s-h1-sans { font-weight: 800; font-size: clamp(34px, 5.6vw, 58px); letter-spacing: -1.5px; }
.s-sub { margin-top: 18px; font-size: 15.5px; line-height: 1.6; color: ${T.inkSoft}; }

/* ===== 3D ring carousel ===== */
.s-stage {
  --R: 540px;
  position: relative; height: 330px; margin-top: 70px;
  perspective: 1900px; perspective-origin: 50% 26%;
}
.s-ring-tilt { position: absolute; inset: 0; transform-style: preserve-3d; transform: rotateX(-5deg); }
.s-ring {
  position: absolute; inset: 0; transform-style: preserve-3d;
  animation: sSpin 44s linear infinite;
}
.s-stage:hover .s-ring { animation-play-state: paused; }
@keyframes sSpin { to { transform: rotateY(-360deg); } }
.s-ring-card {
  position: absolute; left: 50%; top: 34px;
  width: 254px; margin-left: -127px;
  transform: rotateY(calc(var(--i) * 30deg)) translateZ(var(--R));
  backface-visibility: hidden;
  background: ${T.card}; border: 1px solid ${T.line}; border-radius: 18px;
  padding: 16px; box-shadow: 0 22px 48px rgba(60,50,30,0.11);
}
.s-ring-card .s-mini { font-size: 11px; }
.s-ring-card .s-mini-head { font-size: 9.5px; }
.s-ring-card .s-mini-dark { font-size: 10.5px; }
.s-stage-fade {
  position: absolute; top: 0; bottom: 0; width: 16%; z-index: 5; pointer-events: none;
}
.s-stage-fade-l { left: 0; background: linear-gradient(to right, rgba(245,240,228,0.85), transparent); }
.s-stage-fade-r { right: 0; background: linear-gradient(to left, rgba(245,240,228,0.85), transparent); }

/* ===== marquee ===== */
.s-marquee {
  margin-top: 40px; border-top: 1px solid ${T.line}; border-bottom: 1px solid ${T.line};
  overflow: hidden; padding: 13px 0;
  -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}
.s-marquee-track { display: flex; width: max-content; animation: sMarquee 32s linear infinite; }
.s-marquee:hover .s-marquee-track { animation-play-state: paused; }
@keyframes sMarquee { to { transform: translateX(-50%); } }
.s-marquee-group { display: flex; }
.s-marquee-item {
  font-family: ${T.mono}; font-size: 11.5px; letter-spacing: 0.6px; color: ${T.inkSoft};
  display: inline-flex; align-items: center; white-space: nowrap;
}
.s-marquee-item i { color: ${T.orange}; font-style: normal; font-size: 6px; margin: 0 22px; }

/* ===== feature rows ===== */
.s-feat-wrap { max-width: 1000px; margin: 0 auto; padding: 40px 24px 0; }
.s-feat {
  display: grid; grid-template-columns: 1fr 1.05fr; gap: 56px; align-items: center;
  padding: 72px 0; text-align: left;
}
.s-feat + .s-feat { border-top: 1px solid ${T.line}; }
.s-eyebrow { font-family: ${T.mono}; font-size: 10px; letter-spacing: 2px; color: ${T.orange}; margin-bottom: 14px; }
.s-h2 { font-weight: 800; font-size: clamp(26px, 3.4vw, 38px); letter-spacing: -1px; line-height: 1.12; }
.s-feat-text p { margin-top: 16px; font-size: 14.5px; line-height: 1.7; color: ${T.inkSoft}; max-width: 400px; }
.s-textlink {
  display: inline-block; margin-top: 18px; font-size: 13.5px; font-weight: 600;
  border-bottom: 1.5px solid ${T.orange}; padding-bottom: 2px;
  transition: transform 0.18s cubic-bezier(0.22,0.9,0.3,1);
}
.s-textlink:hover { transform: translateX(3px); }
.s-feat-media {
  background: ${T.card}; border: 1px solid ${T.line}; border-radius: 20px;
  padding: 24px; box-shadow: 0 18px 44px rgba(60,50,30,0.08);
}
.s-feat-media-dark { background: #23211B; border-color: #23211B; }

/* ===== mini components ===== */
.s-mini { font-family: ${T.mono}; font-size: 10px; }
.s-mini-head { font-size: 8.5px; letter-spacing: 1.2px; color: ${T.faint}; display: flex; justify-content: space-between; }
.s-mini-live { color: ${T.orange}; opacity: 0; transition: opacity 0.3s; letter-spacing: 0.4px; }
.s-mini-live-on { opacity: 1; }
.s-mini-block {
  position: absolute; top: 5px; border-radius: 5px;
  transition: left 0.55s cubic-bezier(0.3, 0.9, 0.3, 1), width 0.55s cubic-bezier(0.3, 0.9, 0.3, 1);
}
.s-mini-foot { margin-top: 8px; font-size: 8.5px; color: ${T.faint}; }
.s-mini-foot i { display: inline-block; width: 8px; height: 3px; border-radius: 2px; margin: 0 3px; vertical-align: middle; }
.s-mini-row { display: flex; align-items: center; gap: 7px; padding: 5px 2px; border-bottom: 1px solid ${T.line}; }
.s-mini-row:last-child { border-bottom: none; }
.s-mini-check { width: 11px; height: 11px; border-radius: 3px; border: 1px solid; flex-shrink: 0; }
.s-mini-pri { color: ${T.orange}; font-size: 9px; }
.s-mini-title { font-family: ${T.sans}; font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s-mini-dark { background: #23211B; border-radius: 10px; padding: 10px 12px; font-size: 9.5px; line-height: 1.8; }
.s-caret { animation: sBlink 1.1s steps(1) infinite; margin-left: 2px; }
@keyframes sBlink { 50% { opacity: 0; } }

/* ===== proof terminal ===== */
.s-proof { max-width: 660px; margin: 0 auto; padding: 90px 24px 0; }
.s-term {
  margin-top: 36px; background: #23211B; border-radius: 16px; overflow: hidden;
  box-shadow: 0 24px 56px rgba(50,40,20,0.18);
}
.s-term-bar { display: flex; gap: 6px; padding: 12px 14px; border-bottom: 1px solid rgba(245,240,228,0.08); }
.s-term-bar i { width: 9px; height: 9px; border-radius: 50%; background: rgba(245,240,228,0.18); }
.s-term-body { padding: 16px 18px 18px; font-family: ${T.mono}; font-size: 12px; line-height: 2; min-height: 176px; }
.s-term-line { animation: sTermIn 0.25s ease-out; }
@keyframes sTermIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

/* ===== CTA ===== */
.s-cta {
  position: relative; overflow: hidden;
  margin: 100px 24px 24px; padding: 80px 24px 110px; text-align: center;
  background: #23211B; border-radius: 28px;
}
.s-cta-inner { position: relative; z-index: 2; }
.s-night { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.s-night-hill { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 42%; }
.s-moon {
  position: absolute; top: 14%; left: 12%; width: 54px; height: 54px; border-radius: 50%;
  background: radial-gradient(circle at 38% 35%, rgba(216,210,194,0.55), rgba(216,210,194,0.12) 60%, transparent 75%);
}
.s-star { position: absolute; width: 2.5px; height: 2.5px; border-radius: 50%; background: rgba(216,210,194,0.7); animation: sTwinkle 3.2s ease-in-out infinite; }
@keyframes sTwinkle { 50% { opacity: 0.15; } }
.s-cta-h { font-size: clamp(26px, 3.6vw, 42px); font-weight: 800; letter-spacing: -1px; line-height: 1.2; }
.s-cta .s-magnet { margin-top: 30px; }
.s-cta-note { margin-top: 18px; font-family: ${T.mono}; font-size: 11px; color: #8C867A; }

/* ===== footer ===== */
.s-footer {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
  padding: 26px 40px 34px; font-size: 12.5px; color: ${T.inkSoft};
}

@media (max-width: 860px) {
  .s-nav { padding: 16px 18px 12px; grid-template-columns: auto 1fr auto; }
  .s-nav-links { display: none; }
  .s-logo { text-align: left; }
  .s-stage { --R: 330px; height: 250px; perspective: 1200px; }
  .s-ring-card { width: 176px; margin-left: -88px; padding: 12px; }
  .s-feat { grid-template-columns: 1fr; gap: 28px; padding: 52px 0; }
  .s-feat-flip > .s-io:first-child { order: 2; }
}

/* ===== reduced motion ===== */
@media (prefers-reduced-motion: reduce) {
  .s-in, .s-mask-in { opacity: 1 !important; transform: none !important; animation: none !important; }
  .s-io { opacity: 1; transform: none; transition: none; }
  .s-ring { animation: none; }
  .s-marquee-track { animation: none; }
  .s-mini-block { transition: none; }
  .s-caret { animation: none; }
  .s-term-line { animation: none; }
  .s-pill, .s-textlink, .s-magnet { transition: none; }
  .s-boulder { transform: none !important; }
  .s-cloud, .s-star { animation: none; }
  .s-hill, .s-sun { transform: none !important; }
}
`;
