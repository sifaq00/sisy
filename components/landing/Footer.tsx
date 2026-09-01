"use client";

export default function Footer() {
  return (
    <footer className="s-footer">
      <div className="s-container">
        <div className="s-footer-inner">
          <span className="s-logo flex items-center gap-2" style={{ fontSize: 16 }}>
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#E2D9C6] bg-white shadow-2xs shrink-0 inline-block">
              <img src="/logo.png" alt="sisy" className="w-full h-full object-cover" />
            </div>
            <span>
              sisy<span className="s-logo-dot">●</span>
            </span>
          </span>
          <span className="text-xs text-[#57534A]">Open Task & Schedule Optimizer for Everyone</span>
          <span className="text-xs text-[#8C867A]">© 2026 sisy — crafted for focused work & clarity</span>
        </div>
      </div>
    </footer>
  );
}
