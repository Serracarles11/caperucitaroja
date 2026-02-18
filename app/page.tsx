"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Stage = "intro" | "continuation";

const SNAP_DELAY_MS = 900;
const TOUCH_SWIPE_THRESHOLD = 24;

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const nextSectionRef = useRef<HTMLElement | null>(null);
  const chapter2SectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLVideoElement | null>(null);
  const continuationRef = useRef<HTMLVideoElement | null>(null);
  const chapterOverlayRef = useRef<HTMLDivElement | null>(null);
  const chapterTextRef = useRef<HTMLDivElement | null>(null);
  const chapter2OverlayRef = useRef<HTMLDivElement | null>(null);
  const chapter2TextRef = useRef<HTMLDivElement | null>(null);
  const chapterVideoRef = useRef<HTMLVideoElement | null>(null);
  const chapter2VideoRef = useRef<HTMLVideoElement | null>(null);
  const videoSectionRef = useRef<HTMLElement | null>(null);
  const chapter2VideoSectionRef = useRef<HTMLElement | null>(null);
  const restartBtnIntroRef = useRef<HTMLButtonElement | null>(null);
  const restartBtnChapterRef = useRef<HTMLButtonElement | null>(null);
  const restartBtnChapter2Ref = useRef<HTMLButtonElement | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [chapterDismissed, setChapterDismissed] = useState(false);
  const [chapter2Dismissed, setChapter2Dismissed] = useState(false);
  const [arbustoLleno, setArbustoLleno] = useState(true);
  const [introVideoEnded, setIntroVideoEnded] = useState(false);
  const [chapterVideoEnded, setChapterVideoEnded] = useState(false);
  const [chapter2VideoEnded, setChapter2VideoEnded] = useState(false);
  const isSnappingRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const continuation = continuationRef.current;
    if (stage === "continuation" && continuation) {
      continuation.currentTime = 0;
      continuation.play().catch(() => {});
    }
  }, [stage]);

  // Scroll snap for section 1
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

  // GSAP ScrollTrigger for chapter 1 title overlay
  useEffect(() => {
    const overlay = chapterOverlayRef.current;
    const text = chapterTextRef.current;
    const section = nextSectionRef.current;
    if (!overlay || !text || !section) return;

    // Timeline: enter (fade in + scale) → stay → exit (slide right + fade out)
    // pin is not needed because content is already sticky via CSS
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",       // starts when section reaches the top
        end: "bottom bottom",   // ends at the bottom of the 300vh section
        scrub: 0.5,
      },
    });

    // Phase 1: Fade in overlay + text (0% → 30% of scroll range)
    tl.fromTo(
      overlay,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
      0
    );
    tl.fromTo(
      text,
      { autoAlpha: 0, scale: 0.85, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0
    );

    // Phase 2: Hold (30% → 60%)
    tl.to(overlay, { autoAlpha: 1, duration: 0.3 });
    tl.to(text, { autoAlpha: 1, duration: 0.3 }, "<");

    // Phase 3: Exit — text slides right + fades, then overlay fades
    tl.to(text, {
      x: 300,
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
    });
    tl.to(overlay, {
      autoAlpha: 0,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        setChapterDismissed(true);
      },
    });

    return () => tl.kill();
  }, []);

  // GSAP ScrollTrigger for chapter 2 title overlay
  useEffect(() => {
    if (!chapterDismissed) return;

    const overlay = chapter2OverlayRef.current;
    const text = chapter2TextRef.current;
    const section = chapter2SectionRef.current;
    if (!overlay || !text || !section) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
      },
    });

    tl.fromTo(
      overlay,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
      0
    );
    tl.fromTo(
      text,
      { autoAlpha: 0, scale: 0.85, y: 30 },
      { autoAlpha: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" },
      0
    );

    tl.to(overlay, { autoAlpha: 1, duration: 0.3 });
    tl.to(text, { autoAlpha: 1, duration: 0.3 }, "<");

    tl.to(text, {
      x: 300,
      autoAlpha: 0,
      duration: 0.25,
      ease: "power2.in",
    });
    tl.to(overlay, {
      autoAlpha: 0,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => {
        setChapter2Dismissed(true);
      },
    });

    return () => tl.kill();
  }, [chapterDismissed]);

  // Animate restart buttons with GSAP when they appear
  useEffect(() => {
    const btn = restartBtnIntroRef.current;
    if (!btn || !introVideoEnded) return;

    // Entrance animation
    gsap.fromTo(btn, { autoAlpha: 0, scale: 0, rotation: -180 }, {
      autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)",
    });
    // Looping pulse
    const pulse = gsap.to(btn, {
      scale: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6,
    });
    return () => { pulse.kill(); };
  }, [introVideoEnded]);

  useEffect(() => {
    const btn = restartBtnChapterRef.current;
    if (!btn || !chapterVideoEnded) return;

    gsap.fromTo(btn, { autoAlpha: 0, scale: 0, rotation: -180 }, {
      autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)",
    });
    const pulse = gsap.to(btn, {
      scale: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6,
    });
    return () => { pulse.kill(); };
  }, [chapterVideoEnded]);

  useEffect(() => {
    const btn = restartBtnChapter2Ref.current;
    if (!btn || !chapter2VideoEnded) return;

    gsap.fromTo(btn, { autoAlpha: 0, scale: 0, rotation: -180 }, {
      autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)",
    });
    const pulse = gsap.to(btn, {
      scale: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6,
    });
    return () => { pulse.kill(); };
  }, [chapter2VideoEnded]);

  // Auto-restart videos when their section scrolls into view
  useEffect(() => {
    const section1 = sectionRef.current;
    const section3 = videoSectionRef.current;
    const section5 = chapter2VideoSectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // Section 1 entered view — restart intro video
          if (entry.target === section1) {
            setIntroVideoEnded(false);
            setStage("intro");
            const video = introRef.current;
            if (video) {
              video.currentTime = 0;
              video.play().catch(() => {});
            }
          }

          // Section 3 entered view — restart chapter video
          if (entry.target === section3) {
            setChapterVideoEnded(false);
            const video = chapterVideoRef.current;
            if (video) {
              video.currentTime = 0;
              video.play().catch(() => {});
            }
          }

          // Section 5 entered view — restart chapter 2 video
          if (entry.target === section5) {
            setChapter2VideoEnded(false);
            const video = chapter2VideoRef.current;
            if (video) {
              video.currentTime = 0;
              video.play().catch(() => {});
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    if (section1) observer.observe(section1);
    if (section3) observer.observe(section3);
    if (section5) observer.observe(section5);

    return () => observer.disconnect();
  }, [chapterDismissed, chapter2Dismissed]); // re-run when section3/section5 mount

  // Scroll to video section and play when chapter title is dismissed
  useEffect(() => {
    if (!chapterDismissed) return;
    // Wait for the section to render
    requestAnimationFrame(() => {
      const section = videoSectionRef.current;
      const video = chapterVideoRef.current;
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
  }, [chapterDismissed]);

  // Scroll to chapter 2 video section and play when chapter 2 title is dismissed
  useEffect(() => {
    if (!chapter2Dismissed) return;
    requestAnimationFrame(() => {
      const section = chapter2VideoSectionRef.current;
      const video = chapter2VideoRef.current;
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
      if (video) {
        setChapter2VideoEnded(false);
        video.currentTime = 0;
        video.play().catch(() => {});
      }
    });
  }, [chapter2Dismissed]);

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
              setIntroVideoEnded(true);
            }}
          />
        </div>
        <div className="pointer-events-none relative z-10 flex h-full w-full items-end p-8 md:p-16">
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight md:text-6xl">
            Caperucita Roja
          </h1>
        </div>

        {/* Restart button — intro/continuation video */}
        {introVideoEnded && (
          <button
            ref={restartBtnIntroRef}
            className="absolute top-6 left-6 z-30 invisible cursor-pointer"
            onClick={() => {
              setIntroVideoEnded(false);
              setStage("intro");
              const video = introRef.current;
              if (video) {
                video.currentTime = 0;
                video.play().catch(() => {});
              }
            }}
          >
            <img
              src="/boton-reinicio.png"
              alt="Reiniciar video"
              className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_16px_rgba(255,255,255,0.6)]"
            />
          </button>
        )}
      </section>

      {/* Section 2 — chapter title animation (scroll-driven) */}
      <section
        ref={nextSectionRef}
        className="relative h-[300vh] bg-black"
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {/* Chapter title overlay */}
          <div
            ref={chapterOverlayRef}
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center invisible"
          >
            {/* Blur backdrop */}
            <div className="absolute inset-0 backdrop-blur-md bg-black/40" />

            {/* Chapter text */}
            <div
              ref={chapterTextRef}
              className="relative z-10 text-center px-8 invisible"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-400 mb-4">
                Capítulo 1
              </p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
                Caperucita se dirigía a casa de su abuela
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Chapter 1 video + interactive elements (appears after chapter title) */}
      {chapterDismissed && (
        <section ref={videoSectionRef} className="relative h-screen w-full overflow-hidden bg-black">
          <video
            ref={chapterVideoRef}
            className="absolute inset-0 min-h-full min-w-full object-cover"
            style={{ width: "100%", height: "100%" }}
            src="/video-capitulo1.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={(event) => {
              const video = event.currentTarget;
              video.currentTime = video.duration;
              video.pause();
              setChapterVideoEnded(true);
            }}
          />

          {/* Restart button — chapter 1 video */}
          {chapterVideoEnded && (
            <button
              ref={restartBtnChapterRef}
              className="absolute top-6 left-6 z-30 invisible cursor-pointer"
              onClick={() => {
                setChapterVideoEnded(false);
                const video = chapterVideoRef.current;
                if (video) {
                  video.currentTime = 0;
                  video.play().catch(() => {});
                }
              }}
            >
              <img
                src="/boton-reinicio.png"
                alt="Reiniciar video"
                className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_16px_rgba(255,255,255,0.6)]"
              />
            </button>
          )}

          {/* Arbusto interactivo — abajo a la derecha */}
          <button
            onClick={() => setArbustoLleno((prev) => !prev)}
            className="absolute -bottom-36 -right-8 md:-bottom-48 md:-right-12 z-20 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
          >
            <img
              src={arbustoLleno ? "/arbusto-lleno.png" : "/arbusto-agujero.png"}
              alt={arbustoLleno ? "Arbusto lleno" : "Arbusto con agujero"}
              className="w-[30rem] h-[30rem] md:w-[44rem] md:h-[44rem] lg:w-[56rem] lg:h-[56rem] object-contain drop-shadow-lg"
            />
          </button>
        </section>
      )}

      {/* Section 4 — chapter 2 title animation (scroll-driven) */}
      {chapterDismissed && (
        <section
          ref={chapter2SectionRef}
          className="relative h-[300vh] bg-black"
        >
          <div className="sticky top-0 h-screen w-full overflow-hidden">
            <div
              ref={chapter2OverlayRef}
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center invisible"
            >
              <div className="absolute inset-0 backdrop-blur-md bg-black/40" />

              <div
                ref={chapter2TextRef}
                className="relative z-10 text-center px-8 invisible"
              >
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-400 mb-4">
                  Capítulo 2
                </p>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl">
                  Caperucita llego a casa de su madre
                </h2>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section 5 — Chapter 2 video with same effects */}
      {chapter2Dismissed && (
        <section ref={chapter2VideoSectionRef} className="relative h-screen w-full overflow-hidden bg-black">
          <video
            ref={chapter2VideoRef}
            className="absolute inset-0 min-h-full min-w-full object-cover"
            style={{ width: "100%", height: "100%" }}
            src="/capitulo2.mp4"
            muted
            playsInline
            preload="auto"
            onEnded={(event) => {
              const video = event.currentTarget;
              video.currentTime = video.duration;
              video.pause();
              setChapter2VideoEnded(true);
            }}
          />

          {/* Restart button — chapter 2 video */}
          {chapter2VideoEnded && (
            <button
              ref={restartBtnChapter2Ref}
              className="absolute top-6 left-6 z-30 invisible cursor-pointer"
              onClick={() => {
                setChapter2VideoEnded(false);
                const video = chapter2VideoRef.current;
                if (video) {
                  video.currentTime = 0;
                  video.play().catch(() => {});
                }
              }}
            >
              <img
                src="/boton-reinicio.png"
                alt="Reiniciar video"
                className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_16px_rgba(255,255,255,0.6)]"
              />
            </button>
          )}
        </section>
      )}
    </main>
  );
}
