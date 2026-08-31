import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import SisyLanding from "./sisy-landing.jsx";
import SisyApp from "./sisy-app.jsx";

function Switcher() {
  const [page, setPage] = useState("landing"); // landing | app
  return (
    <div>
      <div style={{
        position: "fixed", top: 12, left: "50%", transform: "translate(-50%,0)",
        zIndex: 100, display: "flex", gap: 6, padding: 6,
        background: "#211F1A", borderRadius: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)"
      }}>
        <button onClick={() => setPage("landing")} style={{
          padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
          fontWeight: 600, fontSize: 13,
          background: page === "landing" ? "#F5F0E4" : "transparent",
          color: page === "landing" ? "#211F1A" : "#F5F0E4"
        }}>Landing</button>
        <button onClick={() => setPage("app")} style={{
          padding: "7px 16px", borderRadius: 999, border: "none", cursor: "pointer",
          fontWeight: 600, fontSize: 13,
          background: page === "app" ? "#F5F0E4" : "transparent",
          color: page === "app" ? "#211F1A" : "#F5F0E4"
        }}>App</button>
      </div>
      {page === "landing" ? <SisyLanding /> : <SisyApp />}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Switcher />);
