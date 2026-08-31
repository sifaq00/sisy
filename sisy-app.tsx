import { useState, useEffect, useMemo, useRef } from "react";

/* ============================================================
   SISY — App dashboard
   Same design system as the landing page:
   cream ground, serif accents, olive/orange semantics,
   dark-ink pill actions, generous radii.
   ============================================================ */

const T = {
  bg: "#F5F0E4",
  card: "#FFFDF7",
  hover: "#F1EADA",
  tint: "#EAE2D0",
  line: "#E2D9C6",
  lineSoft: "#ECE5D4",
  ink: "#211F1A",
  dim: "#6E685C",
  faint: "#A29B8C",
  orange: "#C9662A",           // active / optimizer
  orangeSoft: "rgba(201,102,42,0.10)",
  olive: "#5A684B",            // tracked time, done
  oliveSoft: "rgba(90,104,75,0.12)",
  red: "#B23A34",
  amber: "#A87F1F",
  serif: "'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif",
  sans: "-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',Roboto,sans-serif",
  mono: "'JetBrains Mono','SF Mono',Consolas,ui-monospace,monospace",
};

/* ---------------- sample data ---------------- */

const seedTasks = [
  { id: "SY-0142", title: "Migrate scheduler to async queue", pri: 10, status: "active", planned: 180, actual: 96, due: "Today", deps: [], tags: ["core"], start: 9, len: 3, day: 0, span: 2,
    notes: "Queue must survive server restart. Persist pending jobs to SQLite `jobs` table before switching the worker loop.\n\n- [x] design job schema\n- [ ] worker heartbeat\n- [ ] retry with backoff" },
  { id: "SY-0139", title: "Gantt export to SVG", pri: 8, status: "todo", planned: 120, actual: 0, due: "Today", deps: ["SY-0142"], tags: ["ui"], start: 12.5, len: 2, day: 0, span: 1,
    notes: "Reuse the layout engine from the terminal gantt. Colors must come from the theme tokens, not hardcoded." },
  { id: "SY-0137", title: "Fix circular dependency false positive", pri: 9, status: "active", planned: 90, actual: 112, due: "Today", deps: [], tags: ["core", "bug"], start: 15, len: 1.5, day: 0, span: 1,
    notes: "Repro: A→B→C where C soft-depends on A via tag. Detector treats tag-links as hard edges. It shouldn't." },
  { id: "SY-0131", title: "WebSocket reconnect with backoff", pri: 7, status: "todo", planned: 60, actual: 0, due: "Tomorrow", deps: [], tags: ["server"], start: 16.5, len: 1, day: 1, span: 1, notes: "" },
  { id: "SY-0128", title: "Write API key rotation guide", pri: 4, status: "todo", planned: 45, actual: 0, due: "Fri", deps: ["SY-0131"], tags: ["docs"], start: 10, len: 1, day: 2, span: 1, notes: "" },
  { id: "SY-0126", title: "Monte Carlo optimizer: seed control", pri: 6, status: "todo", planned: 150, actual: 0, due: "Fri", deps: [], tags: ["optimizer"], start: 11, len: 2.5, day: 2, span: 2,
    notes: "Deterministic runs when SISY_SEED is set. Needed for optimizer benchmarks." },
  { id: "SY-0119", title: "Audit log viewer in TUI", pri: 5, status: "done", planned: 120, actual: 134, due: "Done", deps: [], tags: ["ui"], start: 9, len: 2, day: 3, span: 1, notes: "" },
  { id: "SY-0117", title: "Benchmark greedy vs genetic on 500 tasks", pri: 6, status: "done", planned: 90, actual: 71, due: "Done", deps: ["SY-0126"], tags: ["optimizer"], start: 13, len: 1.5, day: 3, span: 1, notes: "" },
];

const algorithms = ["greedy", "genetic", "monte carlo", "simulated annealing", "priority-first", "deadline-first", "shortest-first", "round robin", "hybrid"];

/* ---------------- helpers ---------------- */

const fmtMin = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60 ? (m % 60) + "m" : ""}`.trim() : `${m}m`);
const hourLabel = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`;

const statusMeta = {
  active: { label: "ACTIVE", color: T.orange },
  todo: { label: "TODO", color: T.dim },
  done: { label: "DONE", color: T.olive },
};

function Dot({ color, pulse }) {
  return <span className={`a-dot ${pulse ? "a-pulse" : ""}`} style={{ background: color }} />;
}

function PriCell({ p }) {
  const hot = p >= 9, warm = p >= 6;
  return (
    <span style={{ fontFamily: T.mono, fontSize: 12, color: hot ? T.orange : warm ? T.amber : T.faint }}>
      {String(p).padStart(2, "0")}
    </span>
  );
}

function Tag({ children }) {
  return <span className="a-tag">{children}</span>;
}

/* ---------------- schedule strip ---------------- */

function ScheduleStrip({ tasks, optimizing, onSelect, selectedId }) {
  const dayTasks = tasks.filter((t) => t.day === 0 && t.status !== "done");
  const H0 = 8, H1 = 19;
  const pct = (h) => ((h - H0) / (H1 - H0)) * 100;
  const now = 13.6;

  return (
    <div className="a-strip">
      <div className="a-strip-head">
        <span className="a-eyebrow">TODAY · OPTIMIZED SCHEDULE</span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>
          {dayTasks.length} blocks · {fmtMin(dayTasks.reduce((a, t) => a + t.planned, 0))} planned
        </span>
      </div>

      <div className="a-strip-track">
        {Array.from({ length: H1 - H0 + 1 }, (_, i) => H0 + i).map((h) => (
          <div key={h} className="a-hour" style={{ left: pct(h) + "%" }}>
            <span>{hourLabel(h)}</span>
          </div>
        ))}

        <div className="a-now" style={{ left: pct(now) + "%" }}><span>NOW</span></div>

        {dayTasks.map((t, i) => {
          const sel = t.id === selectedId;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="a-block"
              style={{
                left: pct(t.start) + "%",
                width: pct(t.start + t.len) - pct(t.start) + "%",
                borderColor: sel ? T.orange : T.line,
                background: sel ? T.orangeSoft : T.card,
                transitionDelay: optimizing ? `${i * 60}ms` : "0ms",
              }}
            >
              <span className="a-block-id">{t.id}</span>
              <span className="a-block-title">{t.title}</span>
              {t.actual > 0 && (
                <span className="a-block-actual"
                  style={{ width: Math.min((t.actual / t.planned) * 100, 100) + "%",
                           background: t.actual > t.planned ? T.red : T.olive }} />
              )}
            </button>
          );
        })}
      </div>

      <div className="a-strip-legend">
        <span><i style={{ background: T.olive }} /> actual time</span>
        <span><i style={{ background: T.red }} /> over plan</span>
        <span style={{ marginLeft: "auto", color: T.faint }}>drag to reschedule · click for detail</span>
      </div>
    </div>
  );
}

/* ---------------- task table ---------------- */

function TaskTable({ tasks, onSelect, selectedId, onToggle }) {
  return (
    <table className="a-table">
      <thead>
        <tr>
          <th style={{ width: 36 }}></th>
          <th style={{ width: 48 }}>PRI</th>
          <th style={{ width: 88 }}>ID</th>
          <th>TASK</th>
          <th style={{ width: 90 }}>STATUS</th>
          <th style={{ width: 80 }}>PLANNED</th>
          <th style={{ width: 80 }}>ACTUAL</th>
          <th style={{ width: 90 }}>DUE</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => {
          const s = statusMeta[t.status];
          const over = t.actual > t.planned && t.planned > 0;
          return (
            <tr key={t.id} className={t.id === selectedId ? "a-row-sel" : ""} onClick={() => onSelect(t.id)}>
              <td>
                <button
                  className="a-check"
                  aria-label={t.status === "done" ? "Mark as todo" : "Mark as done"}
                  onClick={(e) => { e.stopPropagation(); onToggle(t.id); }}
                  style={{ borderColor: t.status === "done" ? T.olive : T.line,
                           background: t.status === "done" ? T.olive : "transparent",
                           color: "#FFFDF7" }}
                >
                  {t.status === "done" ? "✓" : ""}
                </button>
              </td>
              <td><PriCell p={t.pri} /></td>
              <td><span className="a-id">{t.id}</span></td>
              <td>
                <span style={{ color: t.status === "done" ? T.faint : T.ink,
                               textDecoration: t.status === "done" ? "line-through" : "none" }}>
                  {t.title}
                </span>
                <span style={{ marginLeft: 8 }}>
                  {t.tags.map((g) => <Tag key={g}>{g}</Tag>)}
                  {t.deps.length > 0 && (
                    <span className="a-dep" title={`blocked by ${t.deps.join(", ")}`}>⬑ {t.deps.length}</span>
                  )}
                </span>
              </td>
              <td><span style={{ fontFamily: T.mono, fontSize: 11, color: s.color }}><Dot color={s.color} pulse={t.status === "active"} /> {s.label}</span></td>
              <td><span className="a-num">{fmtMin(t.planned)}</span></td>
              <td><span className="a-num" style={{ color: over ? T.red : t.actual ? T.olive : T.faint }}>{t.actual ? fmtMin(t.actual) : "—"}</span></td>
              <td><span className="a-num" style={{ color: t.due === "Today" ? T.amber : T.faint }}>{t.due}</span></td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ---------------- gantt ---------------- */

function Gantt({ tasks, onSelect, selectedId }) {
  const days = ["Mon 24", "Tue 25", "Wed 26", "Thu 27", "Fri 28"];
  return (
    <div className="a-gantt">
      <div className="a-gantt-head">
        <div className="a-gantt-label" />
        {days.map((d) => <div key={d} className="a-gantt-day">{d}</div>)}
      </div>
      {tasks.map((t) => (
        <div key={t.id} className="a-gantt-row" onClick={() => onSelect(t.id)}>
          <div className="a-gantt-label">
            <span className="a-id">{t.id}</span>
            <span className="a-gantt-title">{t.title}</span>
          </div>
          <div className="a-gantt-track">
            <div className="a-gantt-bar"
              style={{
                left: (t.day / 5) * 100 + "%",
                width: (t.span / 5) * 100 + "%",
                background: t.id === selectedId ? T.orange : t.status === "done" ? T.oliveSoft : T.tint,
                borderColor: t.id === selectedId ? T.orange : T.line,
              }}
            >
              {t.actual > 0 && (
                <span style={{ position: "absolute", left: 0, top: 0, bottom: 0,
                               width: Math.min((t.actual / t.planned) * 100, 100) + "%",
                               background: "rgba(90,104,75,0.25)", borderRight: `1px solid ${T.olive}` }} />
              )}
            </div>
            {t.deps.map((d) => {
              const dep = tasks.find((x) => x.id === d);
              if (!dep) return null;
              return (
                <span key={d} className="a-gantt-dep"
                  style={{ left: ((dep.day + dep.span) / 5) * 100 + "%",
                           width: Math.max((t.day - dep.day - dep.span) / 5, 0.004) * 100 + "%" }} />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- detail drawer ---------------- */

function Drawer({ task, onClose, onToggle }) {
  if (!task) return null;
  const s = statusMeta[task.status];
  return (
    <aside className="a-drawer">
      <div className="a-drawer-top">
        <span className="a-id" style={{ fontSize: 12 }}>{task.id}</span>
        <button className="a-x" onClick={onClose} aria-label="Close detail">✕</button>
      </div>
      <h2 className="a-drawer-title">{task.title}</h2>

      <div className="a-drawer-grid">
        <div><label>Status</label><span style={{ color: s.color, fontFamily: T.mono, fontSize: 12 }}><Dot color={s.color} pulse={task.status === "active"} /> {s.label}</span></div>
        <div><label>Priority</label><PriCell p={task.pri} /></div>
        <div><label>Planned</label><span className="a-num">{fmtMin(task.planned)}</span></div>
        <div><label>Actual</label><span className="a-num" style={{ color: task.actual > task.planned ? T.red : T.olive }}>{task.actual ? fmtMin(task.actual) : "—"}</span></div>
      </div>

      {task.deps.length > 0 && (
        <div className="a-drawer-sec">
          <label>Blocked by</label>
          {task.deps.map((d) => <div key={d} className="a-deprow"><span className="a-id">{d}</span></div>)}
        </div>
      )}

      <div className="a-drawer-sec" style={{ flex: 1 }}>
        <label>Notes</label>
        {task.notes ? (
          <pre className="a-notes">{task.notes}</pre>
        ) : (
          <div className="a-empty">No notes yet. Press <kbd>E</kbd> to write one.</div>
        )}
      </div>

      <div className="a-drawer-actions">
        <button className="a-btn a-btn-ghost" onClick={() => onToggle(task.id)}>
          {task.status === "done" ? "Reopen task" : "Mark as done"}
        </button>
        <button className="a-btn a-btn-primary">Start timer →</button>
      </div>
    </aside>
  );
}

/* ---------------- command palette ---------------- */

function Palette({ open, onClose }) {
  const ref = useRef(null);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  if (!open) return null;
  const cmds = [
    ["add", "Add task", "A"],
    ["optimize", "Optimize schedule", "O"],
    ["gantt", "Open gantt view", "G"],
    ["timer", "Start timer on active task", "T"],
    ["audit", "Show audit log", "L"],
  ];
  return (
    <div className="a-overlay" onClick={onClose}>
      <div className="a-palette" onClick={(e) => e.stopPropagation()}>
        <input ref={ref} placeholder="Type a command…" className="a-palette-input" onKeyDown={(e) => e.key === "Escape" && onClose()} />
        {cmds.map(([k, label, key]) => (
          <button key={k} className="a-palette-row" onClick={onClose}>
            <span>{label}</span>
            <kbd>{key}</kbd>
          </button>
        ))}
        <div className="a-palette-foot">sisy 1.0.0 · connected · api-key ok</div>
      </div>
    </div>
  );
}

/* ---------------- app ---------------- */

export default function SisyApp() {
  const [tasks, setTasks] = useState(seedTasks);
  const [tab, setTab] = useState("tasks");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [algo, setAlgo] = useState("genetic");
  const [optimizing, setOptimizing] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen((v) => !v); }
      if (e.key === "Escape") { setPaletteOpen(false); setSelectedId(null); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return tasks;
    return tasks.filter((t) => (t.title + t.id + t.tags.join(" ")).toLowerCase().includes(s));
  }, [tasks, q]);

  const selected = tasks.find((t) => t.id === selectedId) || null;

  const toggle = (id) =>
    setTasks((ts) => ts.map((t) => t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t));

  const optimize = () => {
    setOptimizing(true);
    setToast(`Running ${algo} optimizer…`);
    setTimeout(() => {
      setTasks((ts) => {
        const today = ts.filter((t) => t.day === 0 && t.status !== "done").sort((a, b) => b.pri - a.pri);
        let cursor = 9;
        const placed = new Map();
        today.forEach((t) => { placed.set(t.id, cursor); cursor += t.len + 0.5; });
        return ts.map((t) => (placed.has(t.id) ? { ...t, start: placed.get(t.id) } : t));
      });
      setOptimizing(false);
      setToast(`Schedule optimized · ${algo} · 0.41s`);
      setTimeout(() => setToast(null), 2600);
    }, 700);
  };

  const activeCount = tasks.filter((t) => t.status === "active").length;

  return (
    <div className="a-root">
      <style>{css}</style>

      {/* sidebar */}
      <nav className="a-side">
        <div className="a-logo">sisy<span className="a-logo-dot">●</span></div>
        {[["tasks", "Tasks"], ["gantt", "Gantt"], ["time", "Time"]].map(([k, label]) => (
          <button key={k} className={`a-nav ${tab === k ? "a-nav-on" : ""}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="a-nav" onClick={() => setPaletteOpen(true)}>
          Command <kbd className="a-kbd">⌘K</kbd>
        </button>
        <div className="a-side-foot"><Dot color={T.olive} pulse /> server connected</div>
      </nav>

      {/* main */}
      <main className="a-main">
        <header className="a-top">
          <div>
            <div className="a-eyebrow">FRI · AUG 28</div>
            <h1 className="a-h1">Today</h1>
          </div>
          <div className="a-top-right">
            <input className="a-search" placeholder="Filter tasks…  /" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="a-select" value={algo} onChange={(e) => setAlgo(e.target.value)} aria-label="Optimizer algorithm">
              {algorithms.map((a) => <option key={a}>{a}</option>)}
            </select>
            <button className="a-btn a-btn-primary" onClick={optimize} disabled={optimizing}>
              {optimizing ? "Optimizing…" : "Optimize →"}
            </button>
          </div>
        </header>

        <div className="a-stats">
          <span><b className="a-num" style={{ color: T.orange }}>{activeCount}</b> active</span>
          <span><b className="a-num">{tasks.filter((t) => t.status === "todo").length}</b> queued</span>
          <span><b className="a-num" style={{ color: T.olive }}>{tasks.filter((t) => t.status === "done").length}</b> done</span>
          <span style={{ marginLeft: "auto", color: T.faint, fontFamily: T.mono, fontSize: 11 }}>
            tracked today · <span style={{ color: T.olive }}>3h 28m</span> of 7h 30m planned
          </span>
        </div>

        <ScheduleStrip tasks={tasks} optimizing={optimizing} onSelect={setSelectedId} selectedId={selectedId} />

        <div className="a-panel">
          {tab === "tasks" && <TaskTable tasks={filtered} onSelect={setSelectedId} selectedId={selectedId} onToggle={toggle} />}
          {tab === "gantt" && <Gantt tasks={filtered} onSelect={setSelectedId} selectedId={selectedId} />}
          {tab === "time" && (
            <div className="a-time">
              {tasks.filter((t) => t.actual > 0).map((t) => {
                const r = t.actual / t.planned;
                return (
                  <div key={t.id} className="a-time-row" onClick={() => setSelectedId(t.id)}>
                    <span className="a-id">{t.id}</span>
                    <span className="a-time-title">{t.title}</span>
                    <div className="a-time-bar">
                      <span style={{ width: Math.min(r, 1) * 100 + "%", background: r > 1 ? T.red : T.olive }} />
                    </div>
                    <span className="a-num" style={{ color: r > 1 ? T.red : T.olive }}>
                      {fmtMin(t.actual)} / {fmtMin(t.planned)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Drawer task={selected} onClose={() => setSelectedId(null)} onToggle={toggle} />
      <Palette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {toast && <div className="a-toast">{toast}</div>}
    </div>
  );
}

/* ---------------- styles ---------------- */

const css = `
* { box-sizing: border-box; margin: 0; }
.a-root {
  display: flex; height: 100vh; width: 100%;
  background: ${T.bg}; color: ${T.ink};
  font-family: ${T.sans}; font-size: 14px; overflow: hidden;
}
button { font-family: inherit; cursor: pointer; }
button:focus-visible, input:focus-visible, select:focus-visible {
  outline: 2px solid ${T.orange}; outline-offset: 1px;
}

/* sidebar */
.a-side {
  width: 172px; flex-shrink: 0; display: flex; flex-direction: column;
  border-right: 1px solid ${T.line}; padding: 18px 12px; gap: 2px;
}
.a-logo {
  font-family: ${T.serif}; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;
  padding: 2px 10px 20px;
}
.a-logo-dot { color: ${T.orange}; font-size: 10px; vertical-align: super; margin-left: 1px; }
.a-nav {
  text-align: left; padding: 8px 12px; border: none; border-radius: 10px;
  background: transparent; color: ${T.dim}; font-size: 13.5px;
  display: flex; align-items: center; justify-content: space-between;
}
.a-nav:hover { background: ${T.hover}; color: ${T.ink}; }
.a-nav-on { background: ${T.ink}; color: ${T.bg}; }
.a-nav-on:hover { background: ${T.ink}; color: ${T.bg}; }
.a-kbd, kbd {
  font-family: ${T.mono}; font-size: 10px; color: ${T.faint};
  border: 1px solid ${T.line}; border-radius: 5px; padding: 1px 4px; background: ${T.card};
}
.a-nav-on .a-kbd { color: ${T.bg}; border-color: rgba(245,240,228,0.3); background: transparent; }
.a-side-foot {
  font-family: ${T.mono}; font-size: 10px; color: ${T.faint};
  padding: 10px 10px 0; display: flex; align-items: center; gap: 6px;
}

/* main */
.a-main { flex: 1; display: flex; flex-direction: column; overflow: auto; padding: 22px 26px; min-width: 0; }
.a-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.a-eyebrow { font-family: ${T.mono}; font-size: 10px; letter-spacing: 1.5px; color: ${T.faint}; }
.a-h1 { font-family: ${T.serif}; font-size: 26px; font-weight: 650; letter-spacing: -0.4px; margin-top: 2px; }
.a-top-right { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.a-search {
  background: ${T.card}; border: 1px solid ${T.line}; border-radius: 999px;
  color: ${T.ink}; padding: 8px 14px; font-size: 13px; width: 190px;
}
.a-search::placeholder { color: ${T.faint}; }
.a-select {
  background: ${T.card}; border: 1px solid ${T.line}; border-radius: 999px;
  color: ${T.dim}; padding: 8px 10px; font-size: 12px; font-family: ${T.mono};
}
.a-btn { border-radius: 999px; padding: 8px 16px; font-size: 13px; font-weight: 600; border: 1px solid transparent; transition: transform 0.15s; }
.a-btn:hover { transform: translateY(-1px); }
.a-btn-primary { background: ${T.ink}; color: ${T.bg}; }
.a-btn-primary:disabled { opacity: 0.6; cursor: default; transform: none; }
.a-btn-ghost { background: transparent; border-color: ${T.line}; color: ${T.dim}; }
.a-btn-ghost:hover { color: ${T.ink}; border-color: ${T.faint}; }

.a-stats {
  display: flex; gap: 18px; align-items: baseline;
  margin: 14px 0 12px; font-size: 12px; color: ${T.dim}; flex-wrap: wrap;
}
.a-stats b { font-weight: 600; margin-right: 4px; }
.a-num { font-family: ${T.mono}; font-size: 12px; }

/* schedule strip */
.a-strip {
  border: 1px solid ${T.line}; border-radius: 18px; background: ${T.card};
  padding: 14px 16px 12px; margin-bottom: 16px;
  box-shadow: 0 6px 20px rgba(70,58,36,0.05);
}
.a-strip-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; }
.a-strip-track { position: relative; height: 74px; }
.a-hour { position: absolute; top: 0; bottom: 14px; border-left: 1px solid ${T.lineSoft}; }
.a-hour span {
  position: absolute; bottom: -14px; left: -14px;
  font-family: ${T.mono}; font-size: 9px; color: ${T.faint};
}
.a-now { position: absolute; top: -4px; bottom: 10px; border-left: 1.5px solid ${T.orange}; z-index: 3; }
.a-now span {
  position: absolute; top: -4px; left: 4px;
  font-family: ${T.mono}; font-size: 9px; color: ${T.orange}; letter-spacing: 1px;
}
.a-block {
  position: absolute; top: 10px; height: 42px;
  border: 1px solid; border-radius: 10px;
  padding: 5px 9px; text-align: left; overflow: hidden;
  transition: left 0.5s cubic-bezier(0.3, 0.9, 0.3, 1), background 0.15s, border-color 0.15s;
  z-index: 2;
}
.a-block:hover { background: ${T.hover}; }
.a-block-id { display: block; font-family: ${T.mono}; font-size: 9px; color: ${T.faint}; }
.a-block-title {
  display: block; font-size: 11px; color: ${T.ink};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.a-block-actual { position: absolute; left: 0; bottom: 0; height: 3px; }
.a-strip-legend {
  display: flex; gap: 16px; margin-top: 18px;
  font-family: ${T.mono}; font-size: 10px; color: ${T.dim};
}
.a-strip-legend i { display: inline-block; width: 10px; height: 3px; border-radius: 2px; margin-right: 5px; vertical-align: middle; }

/* table */
.a-panel {
  border: 1px solid ${T.line}; border-radius: 18px; background: ${T.card}; overflow: hidden;
  box-shadow: 0 6px 20px rgba(70,58,36,0.05);
}
.a-table { width: 100%; border-collapse: collapse; }
.a-table th {
  font-family: ${T.mono}; font-size: 10px; letter-spacing: 1px; color: ${T.faint};
  text-align: left; padding: 11px 13px; border-bottom: 1px solid ${T.line}; font-weight: 500;
}
.a-table td { padding: 10px 13px; border-bottom: 1px solid ${T.lineSoft}; }
.a-table tbody tr { cursor: pointer; }
.a-table tbody tr:hover { background: ${T.hover}; }
.a-table tbody tr:last-child td { border-bottom: none; }
.a-row-sel { background: ${T.orangeSoft} !important; }
.a-id { font-family: ${T.mono}; font-size: 11px; color: ${T.dim}; }
.a-check {
  width: 17px; height: 17px; border-radius: 6px; border: 1.5px solid;
  font-size: 10px; line-height: 1; display: grid; place-items: center; background: none; padding: 0;
}
.a-tag {
  font-family: ${T.mono}; font-size: 9.5px; color: ${T.dim};
  border: 1px solid ${T.line}; border-radius: 999px; padding: 1px 7px; margin-right: 4px;
  background: ${T.bg};
}
.a-dep { font-family: ${T.mono}; font-size: 10px; color: ${T.amber}; }
.a-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
@keyframes apulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
.a-pulse { animation: apulse 1.6s ease-in-out infinite; }

/* gantt */
.a-gantt { padding: 6px 0; }
.a-gantt-head { display: flex; border-bottom: 1px solid ${T.line}; padding-bottom: 6px; }
.a-gantt-day { flex: 1; font-family: ${T.mono}; font-size: 10px; color: ${T.faint}; text-align: center; }
.a-gantt-row { display: flex; align-items: center; padding: 7px 0; cursor: pointer; }
.a-gantt-row:hover { background: ${T.hover}; }
.a-gantt-label { width: 300px; flex-shrink: 0; padding: 0 13px; display: flex; gap: 10px; align-items: baseline; overflow: hidden; }
.a-gantt-title { font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: ${T.dim}; }
.a-gantt-track { position: relative; flex: 1; height: 20px; margin-right: 13px; }
.a-gantt-bar { position: absolute; top: 2px; bottom: 2px; border-radius: 6px; border: 1px solid; overflow: hidden; }
.a-gantt-dep { position: absolute; top: 50%; border-top: 1px dashed ${T.amber}; opacity: 0.7; }

/* time */
.a-time { padding: 8px 0; }
.a-time-row { display: flex; align-items: center; gap: 14px; padding: 10px 15px; cursor: pointer; }
.a-time-row:hover { background: ${T.hover}; }
.a-time-title { flex-shrink: 0; width: 260px; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.a-time-bar { flex: 1; height: 6px; background: ${T.tint}; border-radius: 4px; overflow: hidden; display: flex; }
.a-time-bar span { display: block; height: 100%; border-radius: 4px; }

/* drawer */
.a-drawer {
  width: 340px; flex-shrink: 0; border-left: 1px solid ${T.line};
  background: ${T.card}; padding: 20px; display: flex; flex-direction: column; gap: 16px;
  overflow-y: auto;
}
.a-drawer-top { display: flex; justify-content: space-between; align-items: center; }
.a-x { background: none; border: none; color: ${T.faint}; font-size: 13px; padding: 4px; }
.a-x:hover { color: ${T.ink}; }
.a-drawer-title { font-family: ${T.serif}; font-size: 18px; font-weight: 650; letter-spacing: -0.2px; line-height: 1.35; }
.a-drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 8px; }
.a-drawer-grid label, .a-drawer-sec label {
  display: block; font-family: ${T.mono}; font-size: 9.5px; letter-spacing: 1px;
  color: ${T.faint}; margin-bottom: 4px; text-transform: uppercase;
}
.a-deprow { padding: 6px 0; border-bottom: 1px solid ${T.lineSoft}; }
.a-notes {
  font-family: ${T.mono}; font-size: 11.5px; line-height: 1.65; color: ${T.dim};
  white-space: pre-wrap; background: ${T.bg}; border: 1px solid ${T.lineSoft};
  border-radius: 12px; padding: 12px;
}
.a-empty { font-size: 12px; color: ${T.faint}; padding: 12px 0; }
.a-drawer-actions { display: flex; gap: 8px; }
.a-drawer-actions .a-btn { flex: 1; font-size: 12px; }

/* palette */
.a-overlay {
  position: fixed; inset: 0; background: rgba(40,34,22,0.35); backdrop-filter: blur(2px);
  display: flex; align-items: flex-start; justify-content: center; padding-top: 14vh; z-index: 50;
}
.a-palette {
  width: 440px; max-width: 92vw; background: ${T.card};
  border: 1px solid ${T.line}; border-radius: 18px; overflow: hidden;
  box-shadow: 0 24px 60px rgba(60,48,26,0.25);
}
.a-palette-input {
  width: 100%; background: transparent; border: none; border-bottom: 1px solid ${T.line};
  color: ${T.ink}; padding: 14px 18px; font-size: 14px;
}
.a-palette-row {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  background: none; border: none; color: ${T.dim}; padding: 10px 18px; font-size: 13px;
}
.a-palette-row:hover { background: ${T.hover}; color: ${T.ink}; }
.a-palette-foot {
  font-family: ${T.mono}; font-size: 10px; color: ${T.faint};
  padding: 8px 18px; border-top: 1px solid ${T.lineSoft};
}

/* toast */
.a-toast {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
  background: ${T.ink}; border-radius: 999px;
  padding: 10px 18px; font-family: ${T.mono}; font-size: 12px; color: ${T.bg};
  box-shadow: 0 8px 30px rgba(50,40,20,0.3); z-index: 60;
}

@media (max-width: 900px) {
  .a-side { width: 58px; }
  .a-side .a-nav, .a-logo, .a-side-foot { display: none; }
  .a-drawer { position: fixed; right: 0; top: 0; bottom: 0; z-index: 40; box-shadow: -12px 0 40px rgba(60,48,26,0.2); }
  .a-gantt-label { width: 160px; }
}
@media (prefers-reduced-motion: reduce) {
  .a-block, .a-btn { transition: none; }
  .a-pulse { animation: none; }
}
`;
