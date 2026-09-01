"use client";

export default function Footer() {
  return (
    <footer className="s-footer">
      <div className="s-container">
        <div className="s-footer-inner">
          <span className="s-logo flex items-center gap-2" style={{ fontSize: 16 }}>
            <img
              src="/logo.png"
              alt="sisy"
              className="w-[22px] h-[22px] border border-[#C9662A] object-cover shrink-0 rounded-none shadow-2xs inline-block"
            />
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
