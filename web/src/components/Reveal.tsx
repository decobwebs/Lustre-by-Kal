"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* One watcher for the whole page                                      */
/* ------------------------------------------------------------------ */

const waiting = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;
let sweeping = false;

function release(el: Element) {
  waiting.get(el)?.();
  waiting.delete(el);
  observer?.unobserve(el);
}

/**
 * Scrolling can skip straight past a block — a jump to the bottom, a link to an
 * anchor, a restored position — and then it never "comes into view" at all.
 * This sweep catches anything the page has already moved past.
 */
function sweep() {
  if (sweeping) return;
  sweeping = true;
  requestAnimationFrame(() => {
    sweeping = false;
    for (const el of [...waiting.keys()]) {
      const box = el.getBoundingClientRect();
      if (box.top < window.innerHeight * 0.95) release(el);
    }
  });
}

function watch(el: Element, show: () => void) {
  if (typeof IntersectionObserver === "undefined") {
    show();
    return () => {};
  }
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) release(entry.target);
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep, { passive: true });
  }
  waiting.set(el, show);
  observer.observe(el);
  return () => {
    waiting.delete(el);
    observer?.unobserve(el);
  };
}

/* ------------------------------------------------------------------ */

/**
 * Eases a block into view as it is scrolled to.
 *
 * Nothing is hidden until the script is running, so if it never runs the page
 * still reads normally. Anything already on screen at load appears at once.
 */
export function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"ready" | "armed" | "in">("ready");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) {
      setState("in");
      return;
    }
    setState("armed");
    return watch(node, () => setState("in"));
  }, []);

  const classes = state === "ready" ? className : `${className} reveal ${state === "in" ? "is-in" : ""}`.trim();

  return (
    <Tag ref={ref} className={classes} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Tag>
  );
}
