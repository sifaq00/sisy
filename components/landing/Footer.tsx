"use client";

export default function Footer() {
  return (
    <footer className="s-footer">
      <div className="s-container">
        <div className="s-footer-inner">
          <span className="s-logo flex items-center gap-2.5" style={{ fontSize: 20 }}>
            <div className="w-7 h-7 rounded-xl overflow-hidden border border-[#E2D9C6] bg-[#FFFDF7] shadow-2xs shrink-0 inline-block">
              <img
                src="/logo.png"
                alt="sisy"
                className="w-full h-full object-cover"
              />
            </div>
            <span>
              sisy<span className="s-logo-dot text-[#C9662A]">●</span>
            </span>
          </span>
          <span className="text-xs text-[#57534A]">Open Task & Schedule Optimizer for Everyone</span>
          <span className="text-xs text-[#8C867A]">© 2026 sisy — crafted for focused work & clarity</span>
        </div>
      </div>
    </footer>
  );
}
