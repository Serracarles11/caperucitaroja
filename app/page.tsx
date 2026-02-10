"use client";

import { useEffect, useRef, useState } from "react";

type Stage = "intro" | "continuation";

const SNAP_DELAY_MS = 900;
const TOUCH_SWIPE_THRESHOLD = 24;

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const nextSectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLVideoElement | null>(null);
  const continuationRef = useRef<HTMLVideoElement | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const isSnappingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const continuation = continuationRef.current;
    if (stage === "continuation" && continuation) {
      continuation.currentTime = 0;
      continuation.play().catch(() => {});
    }
  }, [stage]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const isSectionActive = () => {
      const rect = section.getBoundingClientRect();
      return rect.top >= -1 && rect.bottom >= window.innerHeight - 1;
    };

    const snapToNext = () => {
      const next = nextSectionRef.current;
      if (!next || isSnappingRef.current) return;
      isSnappingRef.current = true;
      next.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => {
        isSnappingRef.current = false;
      }, SNAP_DELAY_MS);
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;
      if (!isSectionActive()) return;
      event.preventDefault();
      snapToNext();
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const endY = event.changedTouches[0]?.clientY ?? null;
      touchStartYRef.current = null;
      if (startY === null || endY === null) return;
      const delta = startY - endY;
      if (delta < TOUCH_SWIPE_THRESHOLD) return;
      if (!isSectionActive()) return;
      event.preventDefault();
      snapToNext();
    };

    section.addEventListener("wheel", handleWheel, { passive: false });
    section.addEventListener("touchstart", handleTouchStart, { passive: true });
    section.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      section.removeEventListener("wheel", handleWheel);
      section.removeEventListener("touchstart", handleTouchStart);
      section.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <main className="bg-black text-white">
      <section
        ref={sectionRef}
        className="relative h-screen w-full overflow-hidden"
      >
        <div className="absolute inset-0 h-full w-full">
          <video
            ref={introRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              stage === "intro" ? "opacity-100" : "opacity-0"
            }`}
            src="/video-inicio.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={(event) => {
              const video = event.currentTarget;
              video.currentTime = video.duration;
              video.pause();
              setStage("continuation");
            }}
          />
          <video
            ref={continuationRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out ${
              stage === "continuation" ? "opacity-100" : "opacity-0"
            }`}
            src="/continuacion-video-inicio.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={(event) => {
              const video = event.currentTarget;
              video.currentTime = video.duration;
              video.pause();
            }}
          />
        </div>
        <div className="pointer-events-none relative z-10 flex h-full w-full items-end p-8 md:p-16">
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-6xl">
            Caperucita Roja
          </h1>
        </div>
      </section>

      <section
        ref={nextSectionRef}
        className="flex min-h-screen items-center justify-center bg-zinc-950"
      >
        <p className="text-lg text-zinc-200">Siguiente sección</p>
      </section>
    </main>
  );
}
