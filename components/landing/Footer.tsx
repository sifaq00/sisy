"use client";

export default function Footer() {
  return (
    <footer className="s-footer">
      <div className="s-container">
        <div className="s-footer-inner">
          <span className="s-logo" style={{ fontSize: 16 }}>
            sisy<span className="s-logo-dot">●</span>
          </span>
          <span className="text-xs text-[#57534A]">Single-user Task System</span>
          <span className="text-xs text-[#8C867A]">© 2026 sisy — built for peak productivity</span>
        </div>
      </div>
    </footer>
  );
}
