"use client";

import { useState, useEffect, useRef } from "react";
import { motion, Variants } from "framer-motion";

export function useInView(threshold = 0.2): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView];
}

const revealVariants: Record<string, Variants> = {
  up: {
    hidden: { opacity: 0, y: 36 },
    visible: { opacity: 1, y: 0 },
  },
  left: {
    hidden: { opacity: 0, x: -44 },
    visible: { opacity: 1, x: 0 },
  },
  right: {
    hidden: { opacity: 0, x: 44 },
    visible: { opacity: 1, x: 0 },
  },
};

export function Reveal({
  children,
  delay = 0,
  from = "up",
  className = "",
  once = false, // false so animations trigger on scroll up and down with Framer Motion
}: {
  children: React.ReactNode;
  delay?: number;
  from?: "up" | "left" | "right";
  className?: string;
  once?: boolean;
}) {
  const selectedVariant = revealVariants[from] || revealVariants.up;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 0.2 }}
      variants={selectedVariant}
      transition={{
        duration: 0.65,
        delay: delay / 1000,
        ease: [0.22, 0.9, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
