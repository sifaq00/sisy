"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";
import { MiniTimer } from "./MiniCards";

export default function FeatureTracking() {
  return (
    <div className="s-feat s-feat-flip" id="tracking">
      <Reveal from="left" delay={120}>
        <div className="s-feat-media">
          <MiniTimer big />
        </div>
      </Reveal>
      <Reveal from="right">
        <div className="s-feat-text">
          <div className="s-eyebrow">THE MIRROR</div>
          <h2 className="s-h2">
            Honest time
            <br />
            tracking
          </h2>
          <p>
            Planned vs actual on every task, tracked automatically while you work. You see where the estimate broke
            — not just that it did.
          </p>
          <Link href="/app" className="s-textlink group inline-flex items-center gap-1.5">
            <span>View time ratio tracking</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
