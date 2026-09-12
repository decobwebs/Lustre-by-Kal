"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { hamperGallery, photos, type Hamper } from "@/content/catalogue";

/** Every frame holds the whole gallery stacked up; only one is visible at a time. */
function Frame({ gallery, index, priority, className }: { gallery: ReturnType<typeof hamperGallery>; index: number; priority?: boolean; className?: string }) {
  return (
    <div className={`rotator-frame ${className ?? ""}`}>
      {gallery.map((key, i) => {
        const photo = photos[key];
        return (
          <Image
            key={key}
            src={photo.src}
            alt=""
            fill
            // One size for every frame, so each photo is downloaded once and reused.
            sizes="(min-width: 1024px) 380px, 50vw"
            placeholder="blur"
            priority={priority && i === 0}
            className={`rotator-photo ${i === index ? "is-showing" : ""}`}
          />
        );
      })}
    </div>
  );
}

/**
 * The hamper visual on cards: a large frame with two smaller ones, cycling
 * through every photo of that hamper. Stops on hover, on focus within the card,
 * when the tab is hidden, and for visitors who prefer less motion.
 */
export function PhotoRotator({ hamper, offset = 0, priority = false }: { hamper: Hamper; offset?: number; priority?: boolean }) {
  const gallery = hamperGallery(hamper);
  const [index, setIndex] = useState(offset % gallery.length);
  const [running, setRunning] = useState(true);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!running || still.matches) return;

    // Each card advances on its own rhythm so the three never flip together.
    const every = 3600 + offset * 450;
    const tick = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      setIndex((current) => (current + 1) % gallery.length);
    }, every);
    return () => window.clearInterval(tick);
  }, [running, offset, gallery.length]);

  const total = gallery.length;
  const at = ((index % total) + total) % total;

  return (
    <div
      ref={holder}
      className="rotator"
      onMouseEnter={() => setRunning(false)}
      onMouseLeave={() => setRunning(true)}
      onFocusCapture={() => setRunning(false)}
      onBlurCapture={() => setRunning(true)}
      aria-hidden="true"
    >
      <Frame gallery={gallery} index={at} priority={priority} className="rotator-big" />
      <Frame gallery={gallery} index={(at + 1) % total} />
      <Frame gallery={gallery} index={(at + 2) % total} />
      <div className="rotator-progress">
        <span key={at} className={running ? "is-filling" : ""} style={{ animationDuration: `${3600 + offset * 450}ms` }} />
      </div>
    </div>
  );
}
