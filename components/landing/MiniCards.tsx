"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  mono: "'JetBrains Mono','SF Mono',Consolas,ui-monospace,monospace",
};

/* 1. MiniSchedule - Looping Optimizer Layouts */
export function MiniSchedule({ big = false }: { big?: boolean }) {
  const layouts = [
    [{ w: 30, x: 4, hot: true }, { w: 22, x: 38, hot: false }, { w: 18, x: 64, hot: false }],
    [{ w: 22, x: 4, hot: false }, { w: 30, x: 30, hot: true }, { w: 18, x: 66, hot: false }],
    [{ w: 18, x: 4, hot: false }, { w: 22, x: 26, hot: false }, { w: 30, x: 52, hot: true }],
  ];
  const algos = ["greedy", "dag-critical-path", "deadline-edf"];
  const [i, setI] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFlash(true);
      setI((v) => (v + 1) % layouts.length);
      setTimeout(() => setFlash(false), 600);
    }, 2800);
    return () => clearInterval(id);
  }, [layouts.length]);

  const H = big ? 64 : 38;
  const BH = big ? 46 : 24;

  return (
    <div className="s-mini flex flex-col justify-between h-full" style={big ? { fontSize: 12 } : undefined}>
      <div className="s-mini-head" style={big ? { fontSize: 10 } : undefined}>
        <span>TODAY · OPTIMIZED</span>
        <span className={`s-mini-live ${flash ? "s-mini-live-on" : ""}`}>● {algos[i]}</span>
      </div>
      <div style={{ position: "relative", height: H, marginTop: big ? 12 : 8, overflow: "hidden" }}>
        {[0, 25, 50, 75, 100].map((x) => (
          <span
            key={x}
            style={{
              position: "absolute",
              left: x + "%",
              top: 0,
              bottom: 0,
              borderLeft: `1px solid ${T.line}`,
            }}
          />
        ))}
        {layouts[i].map((b, k) => (
          <motion.span
            key={k}
            layout
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="s-mini-block"
            style={{
              left: b.x + "%",
              width: b.w + "%",
              height: BH,
              background: b.hot ? T.orange : T.card,
              border: `1px solid ${b.hot ? T.orange : T.line}`,
              color: b.hot ? "#FFF" : T.ink,
              top: (H - BH) / 2,
            }}
          />
        ))}
      </div>
      <div className="s-mini-foot" style={big ? { fontSize: 10, marginTop: 12 } : undefined}>
        <i style={{ background: T.olive }} /> actual · <i style={{ background: T.orange }} /> next up
      </div>
    </div>
  );
}

/* 2. MiniTasks - Looping Task Completion Toggle */
export function MiniTasks() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const items = [
    { p: "P5", id: "SY-0001", t: "Migrate scheduler", done: step >= 1 },
    { p: "P4", id: "SY-0002", t: "Gantt export view", done: step >= 2 },
    { p: "P3", id: "SY-0003", t: "Fix dep detector", done: step >= 3 },
  ];

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>WORKSPACE TASKS</span>
        <span className="text-[#5A684B] font-mono text-[9px]">{step}/3 completed</span>
      </div>
      <div className="space-y-1.5 my-auto" style={{ height: 68, overflow: "hidden" }}>
        {items.map((item, i) => (
          <div key={i} className="s-mini-row">
            <span
              className={`s-mini-check transition-all ${
                item.done ? "bg-[#5A684B] border-[#5A684B]" : "border-[#E2D9C6]"
              }`}
            />
            <span className={`s-mini-pri ${item.p === "P5" ? "text-[#C9662A]" : item.p === "P4" ? "text-[#5A684B]" : "text-[#8C867A]"}`}>
              {item.p}
            </span>
            <span
              className={`s-mini-title transition-colors ${
                item.done ? "line-through text-[#8C867A]" : "text-[#211F1A]"
              }`}
            >
              {item.t}
            </span>
          </div>
        ))}
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>SY-0001 — SY-0003</span>
        <span className="text-[#C9662A]">live table</span>
      </div>
    </div>
  );
}

/* 3. MiniTimer - Looping Progress Stopwatch */
export function MiniTimer({ big = false }: { big?: boolean }) {
  const [s, setS] = useState(5772);

  useEffect(() => {
    const id = setInterval(() => {
      setS((v) => (v >= 10800 ? 3600 : v + 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (n: number) => String(n).padStart(2, "0");
  const progressPercent = Math.min((s / 10800) * 100, 100);

  return (
    <div className="s-mini flex flex-col justify-between h-full" style={{ textAlign: "center" }}>
      <div className="s-mini-head">
        <span>TIME TRACKER (SY-0001)</span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
          className="text-[#C9662A]"
        >
          ● ACTIVE
        </motion.span>
      </div>
      <div className="my-auto">
        <div
          style={{
            fontFamily: T.mono,
            fontSize: big ? 34 : 22,
            color: T.ink,
            letterSpacing: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmt(Math.floor(s / 3600))}:{fmt(Math.floor((s % 3600) / 60))}:{fmt(s % 60)}
        </div>
        <div style={{ fontSize: big ? 12 : 9.5, color: T.faint, marginTop: 2 }}>
          Migrate scheduler · plan 3h
        </div>
        <div
          style={{
            height: big ? 6 : 4,
            background: T.tint,
            borderRadius: 3,
            margin: "8px 4px 0",
            overflow: "hidden",
          }}
        >
          <motion.span
            style={{
              display: "block",
              width: `${progressPercent}%`,
              height: "100%",
              background: T.olive,
              borderRadius: 3,
            }}
          />
        </div>
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>planned 3h 00m</span>
        <span style={{ color: T.olive }}>actual {fmt(Math.floor(s / 3600))}h {fmt(Math.floor((s % 3600) / 60))}m</span>
      </div>
    </div>
  );
}

/* 4. MiniGantt - Looping Wave Timeline Animation */
export function MiniGantt() {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const bars = [
    { x: 0, w: 40 },
    { x: 25, w: 35 },
    { x: 50, w: 30 },
    { x: 70, w: 26 },
  ];

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>GANTT VIEW · WEEK 35</span>
        <span className="text-[#3D6B78]">4 tasks</span>
      </div>
      <div style={{ display: "grid", gap: 6, height: 48, overflow: "hidden" }} className="my-auto">
        {bars.map((b, i) => (
          <div key={i} style={{ position: "relative", height: 7 }}>
            <span
              style={{
                position: "absolute",
                left: b.x + "%",
                width: b.w + "%",
                top: 0,
                bottom: 0,
                border: `1px solid ${i === 0 ? T.orange : T.line}`,
                borderRadius: 3,
                backgroundColor: pulseIndex === i ? T.orange : i === 0 ? T.orange : i === 1 ? T.olive : "#3D6B78",
                transition: "background-color 0.25s ease",
              }}
            />
          </div>
        ))}
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>timeline workload</span>
        <span className="text-[#5A684B]">synced</span>
      </div>
    </div>
  );
}

/* 5. MiniDeps - Looping DAG Pulsing Signal Graph */
export function MiniDeps() {
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveNode((prev) => (prev + 1) % 4);
    }, 900);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>TASK DEPENDENCIES (DAG)</span>
        <span className="text-[#C9662A]">SY-000{activeNode + 1}</span>
      </div>
      <div className="my-auto" style={{ height: 48, overflow: "hidden" }}>
        <svg viewBox="0 0 140 46" style={{ width: "100%", height: "100%" }}>
          <line x1="28" y1="12" x2="68" y2="23" stroke={activeNode === 1 ? T.orange : T.faint} strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="28" y1="34" x2="68" y2="23" stroke={activeNode === 2 ? T.orange : T.faint} strokeWidth="1.2" strokeDasharray="3 2" />
          <line x1="76" y1="23" x2="114" y2="23" stroke={activeNode === 3 ? T.orange : T.line} strokeWidth="1.5" />
          
          <circle cx="24" cy="12" r={activeNode === 0 ? 5.5 : 4.5} fill={T.olive} />
          <circle cx="24" cy="34" r={activeNode === 1 ? 5.5 : 4.5} fill={T.olive} />
          <circle cx="72" cy="23" r={activeNode === 2 ? 5.5 : 4.5} fill={T.card} stroke={activeNode === 2 ? T.orange : T.ink} strokeWidth="1.5" />
          <circle cx="118" cy="23" r={activeNode === 3 ? 5.5 : 4.5} fill={T.orange} />
        </svg>
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>topological sort</span>
        <span className="text-[#5A684B]">no cycles</span>
      </div>
    </div>
  );
}

/* 6. MiniNotes - Looping Checklist Sync */
export function MiniNotes() {
  const [checked, setChecked] = useState([true, false, false]);

  useEffect(() => {
    const id = setInterval(() => {
      setChecked((prev) => {
        if (!prev[1]) return [true, true, false];
        if (!prev[2]) return [true, true, true];
        return [true, false, false];
      });
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>MARKDOWN NOTES · SY-0001</span>
        <span className="text-[#5A684B]">drawer editor</span>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 9, lineHeight: 1.8, color: T.inkSoft, height: 52, overflow: "hidden" }} className="my-auto">
        <div>## async queue</div>
        <div style={{ color: checked[0] ? T.olive : T.inkSoft }}>- [{checked[0] ? "x" : " "}] job schema</div>
        <div style={{ color: checked[1] ? T.olive : T.inkSoft }}>- [{checked[1] ? "x" : " "}] worker heartbeat</div>
        <div style={{ color: checked[2] ? T.olive : T.inkSoft }}>- [{checked[2] ? "x" : " "}] retry w/ backoff</div>
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>markdown preview</span>
        <span className="text-[#C9662A]">auto-saved</span>
      </div>
    </div>
  );
}

/* 7. MiniCLI - Looping Typing Terminal Commands */
export function MiniCLI() {
  const commands = [
    { cmd: "$ sisy optimize --algo greedy", res: "✓ 8 tasks scheduled · 0.41s" },
    { cmd: "$ sisy add 'ship v1' -p 5", res: "✓ SY-0005 created" },
    { cmd: "$ sisy time --start SY-0001", res: "✓ timer running · 00:00:01" },
  ];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1) % commands.length);
    }, 3000);
    return () => clearInterval(id);
  }, [commands.length]);

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>REST API & CLI</span>
        <span className="text-[#8FA07E]">/api/tasks</span>
      </div>
      <div className="s-mini-dark my-auto" style={{ padding: "8px 10px", fontSize: 9, lineHeight: 1.7, height: 50, overflow: "hidden" }}>
        <div style={{ color: "#8FA07E" }}>{commands[idx].cmd}</div>
        <div style={{ color: "#C7BFAF" }}>
          {commands[idx].res}
          <span className="s-caret">▌</span>
        </div>
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>REST endpoints ready</span>
        <span className="text-[#8FA07E]">200 OK</span>
      </div>
    </div>
  );
}

/* 8. MiniWs - Looping Realtime Event Feed */
export function MiniWs() {
  const [events, setEvents] = useState([
    { id: 1, text: "SY-0001 → completed", color: T.olive },
    { id: 2, text: "timer started on SY-0002", color: T.orange },
    { id: 3, text: "live cloud sync connected", color: T.olive },
  ]);

  useEffect(() => {
    const allEvents = [
      { text: "SY-0003 status → in_progress", color: T.orange },
      { text: "schedule re-optimized (greedy)", color: T.inkSoft },
      { text: "cloud sync 14ms", color: T.olive },
      { text: "timer +45m logged", color: T.inkSoft },
      { text: "SY-0004 created", color: T.olive },
    ];
    let counter = 0;
    const id = setInterval(() => {
      const next = allEvents[counter % allEvents.length];
      counter++;
      setEvents((prev) => [
        { id: Date.now(), text: next.text, color: next.color },
        prev[0],
        prev[1],
      ]);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>REALTIME EVENT BUS</span>
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#5A684B]"
        >
          ● 14ms
        </motion.span>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 9, lineHeight: 1.8, color: T.inkSoft, height: 54, overflow: "hidden" }} className="my-auto">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 3).map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
            >
              <span style={{ color: ev.color }}>▲</span> {ev.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>postgres realtime</span>
        <span className="text-[#5A684B]">subscribed</span>
      </div>
    </div>
  );
}

/* 9. MiniAudit - Looping Audit Ledger */
export function MiniAudit() {
  const [timeOffset, setTimeOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTimeOffset((v) => (v + 1) % 60);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const rows = [
    { t: `12:${String(41 + (timeOffset % 5)).padStart(2, "0")}`, m: "SY-0001 status → done", c: T.olive },
    { t: "12:38", m: "timer stopped · 1h 52m", c: T.inkSoft },
    { t: "11:02", m: "priority P4 → P5", c: T.orange },
  ];

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>AUDIT LOG (SHORTCUT L)</span>
        <span className="text-[#8C867A]">event #24</span>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 9, lineHeight: 1.9, height: 54, overflow: "hidden" }} className="my-auto">
        {rows.map((r, i) => (
          <div key={i} className="flex justify-between">
            <span style={{ color: T.faint }}>{r.t}</span>
            <span style={{ color: r.c }}>{r.m}</span>
          </div>
        ))}
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>immutable ledger</span>
        <span className="text-[#C9662A]">audit ok</span>
      </div>
    </div>
  );
}

/* 10. MiniHeat - Looping Shimmer Heatmap */
export function MiniHeat() {
  const [activeCol, setActiveCol] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveCol((prev) => (prev + 1) % 10);
    }, 400);
    return () => clearInterval(id);
  }, []);

  const cells = [0, 1, 2, 0, 3, 1, 2, 3, 0, 1, 2, 3, 1, 0, 2, 3, 3, 1, 0, 2, 1, 0, 3, 2, 1, 3, 0, 2, 3, 1];
  const shades = ["transparent", "rgba(90,104,75,0.25)", "rgba(90,104,75,0.55)", T.olive];

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>FOCUS CONSISTENCY</span>
        <span className="text-[#5A684B]">92% consistency</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 3.5, height: 48, overflow: "hidden" }} className="my-auto">
        {cells.map((c, i) => {
          const col = i % 10;
          const isShimmer = col === activeCol;
          return (
            <span
              key={i}
              style={{
                aspectRatio: "1",
                borderRadius: 2.5,
                border: `1px solid ${isShimmer ? T.orange : T.line}`,
                background: shades[c],
                transition: "border-color 0.2s ease",
              }}
            />
          );
        })}
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>tracked time / day</span>
        <span className="text-[#5A684B]">48.5h total</span>
      </div>
    </div>
  );
}

/* 11. MiniBench - Looping Benchmark Races */
export function MiniBench() {
  const [animState, setAnimState] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimState((prev) => (prev + 1) % 2);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const rows = [
    { a: "dag-critical", w: animState === 0 ? 94 : 90, t: animState === 0 ? "0.38s" : "0.35s", hot: true },
    { a: "deadline-edf", w: animState === 0 ? 76 : 72, t: animState === 0 ? "0.29s" : "0.27s", hot: false },
    { a: "greedy", w: animState === 0 ? 22 : 25, t: animState === 0 ? "0.09s" : "0.11s", hot: false },
  ];

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>SCHEDULER BENCHMARK</span>
        <span className="text-[#C9662A]">dag-critical #1</span>
      </div>
      <div style={{ display: "grid", gap: 5.5, height: 50, overflow: "hidden" }} className="my-auto">
        {rows.map((r) => (
          <div key={r.a} style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 8.5 }}>
            <span style={{ width: 66, color: T.inkSoft, flexShrink: 0 }}>{r.a}</span>
            <span style={{ flex: 1, height: 5, background: T.tint, borderRadius: 3, overflow: "hidden" }}>
              <motion.span
                animate={{ width: `${r.w}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{
                  display: "block",
                  height: "100%",
                  background: r.hot ? T.orange : T.olive,
                  borderRadius: 3,
                }}
              />
            </span>
            <span style={{ color: T.faint }}>{r.t}</span>
          </div>
        ))}
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>500 tasks sorted</span>
        <span className="text-[#5A684B]">sub-second</span>
      </div>
    </div>
  );
}

/* 12. MiniPri - Looping Priority Balance Pulse */
export function MiniPri() {
  const [activePri, setActivePri] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActivePri((prev) => (prev + 1) % 4);
    }, 1100);
    return () => clearInterval(id);
  }, []);

  const rows = [
    { l: "P5", n: 2, c: T.orange },
    { l: "P4", n: 3, c: T.olive },
    { l: "P3", n: 5, c: "#3D6B78" },
    { l: "P1–2", n: 4, c: T.faint },
  ];

  return (
    <div className="s-mini flex flex-col justify-between h-full">
      <div className="s-mini-head">
        <span>PRIORITY SPREAD (P5–P1)</span>
        <span className="text-[#C9662A]">14 tasks</span>
      </div>
      <div style={{ display: "grid", gap: 5, height: 50, overflow: "hidden" }} className="my-auto">
        {rows.map((r, idx) => (
          <div key={r.l} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 8.5 }}>
            <span style={{ width: 32, color: idx === activePri ? T.orange : T.inkSoft, fontWeight: idx === activePri ? "bold" : "normal" }}>
              {r.l}
            </span>
            <span style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: r.n }).map((_, i) => (
                <i
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2.5,
                    background: r.c,
                    fontStyle: "normal",
                    display: "block",
                    opacity: idx === activePri ? 1 : 0.8,
                    transition: "opacity 0.2s ease",
                  }}
                />
              ))}
            </span>
            <span style={{ color: T.faint, marginLeft: "auto" }}>{r.n}</span>
          </div>
        ))}
      </div>
      <div className="s-mini-foot flex justify-between">
        <span>workload distribution</span>
        <span className="text-[#5A684B]">balanced</span>
      </div>
    </div>
  );
}
