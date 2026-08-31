"use client";

import Link from "next/link";
import { Reveal } from "./Reveal";
import { MiniSchedule } from "./MiniCards";

export default function FeatureOptimizer() {
  return (
    <div className="s-feat" id="optimizer">
      <Reveal from="left">
        <div className="s-feat-text">
          <div className="s-eyebrow">THE CORE</div>
          <h2 className="s-h2">
            The optimizer is
            <br />
            the product
          </h2>
          <p>
            Pick an algorithm — greedy to genetic — press one button, and your day is reordered around priorities,
            deadlines, and dependencies.
          </p>
          <Link href="/app" className="s-textlink group inline-flex items-center gap-1.5">
            <span>Try optimizing your day</span>
            <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </Reveal>
      <Reveal from="right" delay={120}>
        <div className="s-feat-media">
          <MiniSchedule big />
        </div>
      </Reveal>
    </div>
  );
}
