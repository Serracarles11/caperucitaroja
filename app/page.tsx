"use client";

import { Fragment, useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Stage = "intro" | "continuation";
type Chapter = {
  id: number;
  src: string;
  text: string;
};
type Chapter7OverlayPart = "hair" | "glasses";
type DragOffset = { x: number; y: number };

const CHAPTERS: Chapter[] = [
  { id: 1, src: "/video-capitulo1.mp4", text: "Caperucita se dirigia a casa de su madre." },
  { id: 2, src: "/capitulo2.mp4", text: "Caperucita llega a casa de su madre." },
  { id: 3, src: "/capitulo3.mp4", text: "Caperucita se va de casa de su madre." },
  { id: 4, src: "/capitulo4.mp4", text: "El lobo ve a Caperucita." },
  { id: 5, src: "/capitulo5.mp4", text: "Caperucita habla con el lobo." },
  { id: 6, src: "/capitulo6.mp4", text: "Caperucita llega a casa de su abuela" },
  { id: 7, src: "/imagen-lobo.png", text: "La abuela está rara." },
  { id: 8, src: "/capitulo8.png", text: "El cazador pilla a el lobo." },
];

export default function Home() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const introRef = useRef<HTMLVideoElement | null>(null);
  const continuationRef = useRef<HTMLVideoElement | null>(null);
  const titleSectionRefs = useRef<Array<HTMLElement | null>>([]);
  const titleOverlayRefs = useRef<Array<HTMLDivElement | null>>([]);
  const titleTextRefs = useRef<Array<HTMLDivElement | null>>([]);
  const videoSectionRefs = useRef<Array<HTMLElement | null>>([]);
  const chapterVideoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const chapter1AudioRef = useRef<HTMLAudioElement | null>(null);
  const chapter2ChimeneaAudioRef = useRef<HTMLAudioElement | null>(null);
  const chapter4Bosque2AudioRef = useRef<HTMLAudioElement | null>(null);
  const chapter2MadreLlevarRef = useRef<HTMLVideoElement | null>(null);
  const restartBtnIntroRef = useRef<HTMLButtonElement | null>(null);
  const restartBtnChapterRef = useRef<HTMLButtonElement | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [arbustoLleno, setArbustoLleno] = useState(true);
  const [introVideoEnded, setIntroVideoEnded] = useState(false);
  const [endedChapterIndex, setEndedChapterIndex] = useState<number | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [chapter8CaperucitaAlt, setChapter8CaperucitaAlt] = useState(false);
  const [chapter8AbuelaAlt, setChapter8AbuelaAlt] = useState(false);
  const [chapter7DragOffsets, setChapter7DragOffsets] = useState<Record<Chapter7OverlayPart, DragOffset>>({
    hair: { x: 0, y: 0 },
    glasses: { x: 0, y: 0 },
  });
  const [chapter2MadreLlevarDragOffset, setChapter2MadreLlevarDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [chapter2CaperucitaLlevarDragOffset, setChapter2CaperucitaLlevarDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [chapter3MadreAdiosDragOffset, setChapter3MadreAdiosDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [chapter5LoboIrDragOffset, setChapter5LoboIrDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  const [isChapter2MadreLlevarDragging, setIsChapter2MadreLlevarDragging] = useState(false);
  const [isChapter2CaperucitaLlevarDragging, setIsChapter2CaperucitaLlevarDragging] = useState(false);
  const [isChapter3MadreAdiosDragging, setIsChapter3MadreAdiosDragging] = useState(false);
  const [isChapter5LoboIrDragging, setIsChapter5LoboIrDragging] = useState(false);
  const [activeChapter7DragPart, setActiveChapter7DragPart] = useState<Chapter7OverlayPart | null>(null);
  const chapter7DragSessionRef = useRef<{
    part: Chapter7OverlayPart;
    pointerId: number;
    originX: number;
    originY: number;
  } | null>(null);
  const chapter2MadreLlevarDragSessionRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
  } | null>(null);
  const chapter2CaperucitaLlevarDragSessionRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
  } | null>(null);
  const chapter3MadreAdiosDragSessionRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
  } | null>(null);
  const chapter5LoboIrDragSessionRef = useRef<{
    pointerId: number;
    originX: number;
    originY: number;
  } | null>(null);

  const startChapter7OverlayDrag = useCallback(
    (part: Chapter7OverlayPart, event: ReactPointerEvent<HTMLImageElement>) => {
      event.preventDefault();
      const currentOffset = chapter7DragOffsets[part];
      chapter7DragSessionRef.current = {
        part,
        pointerId: event.pointerId,
        originX: event.clientX - currentOffset.x,
        originY: event.clientY - currentOffset.y,
      };
      setActiveChapter7DragPart(part);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [chapter7DragOffsets]
  );

  const getChapter7OverlayStyle = useCallback(
    (part: Chapter7OverlayPart) => {
      const baseOffset = part === "hair" ? { xPercent: -4, yPercent: -26 } : { xPercent: -5.5, yPercent: -8 };
      const dragOffset = chapter7DragOffsets[part];
      return {
        transform: `translate(calc(${baseOffset.xPercent}% + ${dragOffset.x}px), calc(${baseOffset.yPercent}% + ${dragOffset.y}px))`,
        transition: activeChapter7DragPart === part ? "none" : "transform 220ms ease-out",
      };
    },
    [activeChapter7DragPart, chapter7DragOffsets]
  );

  const startChapter2MadreLlevarDrag = useCallback((event: ReactPointerEvent<HTMLImageElement>) => {
    event.preventDefault();
    chapter2MadreLlevarDragSessionRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX - chapter2MadreLlevarDragOffset.x,
      originY: event.clientY - chapter2MadreLlevarDragOffset.y,
    };
    setIsChapter2MadreLlevarDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [chapter2MadreLlevarDragOffset.x, chapter2MadreLlevarDragOffset.y]);

  const startChapter2CaperucitaLlevarDrag = useCallback((event: ReactPointerEvent<HTMLImageElement>) => {
    event.preventDefault();
    chapter2CaperucitaLlevarDragSessionRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX - chapter2CaperucitaLlevarDragOffset.x,
      originY: event.clientY - chapter2CaperucitaLlevarDragOffset.y,
    };
    setIsChapter2CaperucitaLlevarDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [chapter2CaperucitaLlevarDragOffset.x, chapter2CaperucitaLlevarDragOffset.y]);

  const startChapter3MadreAdiosDrag = useCallback((event: ReactPointerEvent<HTMLImageElement>) => {
    event.preventDefault();
    chapter3MadreAdiosDragSessionRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX - chapter3MadreAdiosDragOffset.x,
      originY: event.clientY - chapter3MadreAdiosDragOffset.y,
    };
    setIsChapter3MadreAdiosDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [chapter3MadreAdiosDragOffset.x, chapter3MadreAdiosDragOffset.y]);

  const startChapter5LoboIrDrag = useCallback((event: ReactPointerEvent<HTMLImageElement>) => {
    event.preventDefault();
    chapter5LoboIrDragSessionRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX - chapter5LoboIrDragOffset.x,
      originY: event.clientY - chapter5LoboIrDragOffset.y,
    };
    setIsChapter5LoboIrDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [chapter5LoboIrDragOffset.x, chapter5LoboIrDragOffset.y]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const session = chapter7DragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      setChapter7DragOffsets((previous) => ({
        ...previous,
        [session.part]: {
          x: event.clientX - session.originX,
          y: event.clientY - session.originY,
        },
      }));
    };

    const finishDrag = (event: PointerEvent) => {
      const session = chapter7DragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      chapter7DragSessionRef.current = null;
      setActiveChapter7DragPart(null);
      setChapter7DragOffsets((previous) => ({
        ...previous,
        [session.part]: { x: 0, y: 0 },
      }));
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const session = chapter2MadreLlevarDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      setChapter2MadreLlevarDragOffset({
        x: event.clientX - session.originX,
        y: event.clientY - session.originY,
      });
    };

    const finishDrag = (event: PointerEvent) => {
      const session = chapter2MadreLlevarDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      chapter2MadreLlevarDragSessionRef.current = null;
      setIsChapter2MadreLlevarDragging(false);
      setChapter2MadreLlevarDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const session = chapter2CaperucitaLlevarDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      setChapter2CaperucitaLlevarDragOffset({
        x: event.clientX - session.originX,
        y: event.clientY - session.originY,
      });
    };

    const finishDrag = (event: PointerEvent) => {
      const session = chapter2CaperucitaLlevarDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      chapter2CaperucitaLlevarDragSessionRef.current = null;
      setIsChapter2CaperucitaLlevarDragging(false);
      setChapter2CaperucitaLlevarDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const session = chapter3MadreAdiosDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      setChapter3MadreAdiosDragOffset({
        x: event.clientX - session.originX,
        y: event.clientY - session.originY,
      });
    };

    const finishDrag = (event: PointerEvent) => {
      const session = chapter3MadreAdiosDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      chapter3MadreAdiosDragSessionRef.current = null;
      setIsChapter3MadreAdiosDragging(false);
      setChapter3MadreAdiosDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const session = chapter5LoboIrDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      setChapter5LoboIrDragOffset({
        x: event.clientX - session.originX,
        y: event.clientY - session.originY,
      });
    };

    const finishDrag = (event: PointerEvent) => {
      const session = chapter5LoboIrDragSessionRef.current;
      if (!session || event.pointerId !== session.pointerId) return;

      chapter5LoboIrDragSessionRef.current = null;
      setIsChapter5LoboIrDragging(false);
      setChapter5LoboIrDragOffset({ x: 0, y: 0 });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", finishDrag);
    window.addEventListener("pointercancel", finishDrag);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishDrag);
      window.removeEventListener("pointercancel", finishDrag);
    };
  }, []);

  const getChapterSyncedAudios = useCallback((chapterIndex: number) => {
    if (chapterIndex === 0) {
      return [chapter1AudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    if (chapterIndex === 2) {
      return [chapter1AudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    if (chapterIndex === 4) {
      return [chapter1AudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    if (chapterIndex === 3) {
      return [chapter4Bosque2AudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    if (chapterIndex === 1 || chapterIndex === 5 || chapterIndex === 6 || chapterIndex === 7) {
      return [chapter2ChimeneaAudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    return [];
  }, []);

  const getChapterManagedAudios = useCallback((chapterIndex: number) => getChapterSyncedAudios(chapterIndex), [getChapterSyncedAudios]);

  const getAllAudios = useCallback(
    () =>
      [
        chapter1AudioRef.current,
        chapter2ChimeneaAudioRef.current,
        chapter4Bosque2AudioRef.current,
      ].filter((audio): audio is HTMLAudioElement => audio !== null),
    []
  );

  const syncAndResumeChapterAudios = useCallback(
    (chapterIndex: number, video: HTMLVideoElement) => {
      const chapterSection = videoSectionRefs.current[chapterIndex];
      if (!chapterSection?.classList.contains("is-active") || video.paused) return;

      getChapterSyncedAudios(chapterIndex).forEach((audio) => {
        const drift = Math.abs(audio.currentTime - video.currentTime);
        if (drift > 0.2) {
          audio.currentTime = video.currentTime;
        }
        audio.muted = false;
        audio.playbackRate = video.playbackRate;
        if (audio.paused && !audio.ended) {
          audio.play().catch(() => {});
        }
      });
    },
    [getChapterSyncedAudios]
  );

  const unlockAudio = useCallback(() => {
    if (audioUnlocked) return;
    setAudioUnlocked(true);

    // Warm up audio elements so browsers allow future programmatic playback.
    getAllAudios().forEach((audio) => {
      audio.muted = true;
      audio.play().catch(() => {}).finally(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      });
    });

    const activeChapterIndex = videoSectionRefs.current.findIndex((section) =>
      section?.classList.contains("is-active")
    );
    if (activeChapterIndex < 0) return;
    const activeVideo = chapterVideoRefs.current[activeChapterIndex];
    if (!activeVideo) return;

    syncAndResumeChapterAudios(activeChapterIndex, activeVideo);
  }, [audioUnlocked, getAllAudios, syncAndResumeChapterAudios]);

  useEffect(() => {
    const continuation = continuationRef.current;
    if (stage === "continuation" && continuation) {
      continuation.currentTime = 0;
      continuation.play().catch(() => {});
    }
  }, [stage]);

  useEffect(() => {
    const handleFirstInteraction = () => unlockAudio();

    window.addEventListener("pointerdown", handleFirstInteraction, { once: true });
    window.addEventListener("keydown", handleFirstInteraction, { once: true });
    window.addEventListener("touchstart", handleFirstInteraction, { once: true });
    window.addEventListener("wheel", handleFirstInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("wheel", handleFirstInteraction);
    };
  }, [unlockAudio]);

  // GSAP ScrollTrigger for all chapter title sections (same animation pattern)
  useEffect(() => {
    const timelines: gsap.core.Timeline[] = [];

    CHAPTERS.forEach((_, chapterIndex) => {
      const section = titleSectionRefs.current[chapterIndex];
      const overlay = titleOverlayRefs.current[chapterIndex];
      const text = titleTextRefs.current[chapterIndex];
      if (!section || !overlay || !text) return;

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
      });

      timelines.push(tl);
    });

    return () => {
      timelines.forEach((timeline) => timeline.kill());
    };
  }, []);

  // Animate restart buttons with GSAP when they appear
  useEffect(() => {
    const btn = restartBtnIntroRef.current;
    if (!btn || !introVideoEnded) return;

    gsap.fromTo(btn, { autoAlpha: 0, scale: 0, rotation: -180 }, {
      autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)",
    });
    const pulse = gsap.to(btn, {
      scale: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6,
    });
    return () => { pulse.kill(); };
  }, [introVideoEnded]);

  useEffect(() => {
    const btn = restartBtnChapterRef.current;
    if (!btn || endedChapterIndex === null) return;

    gsap.fromTo(btn, { autoAlpha: 0, scale: 0, rotation: -180 }, {
      autoAlpha: 1, scale: 1, rotation: 0, duration: 0.6, ease: "back.out(1.7)",
    });
    const pulse = gsap.to(btn, {
      scale: 1.1, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.6,
    });
    return () => { pulse.kill(); };
  }, [endedChapterIndex, getChapterManagedAudios, getChapterSyncedAudios]);

  // Auto-restart intro video when section 1 scrolls into view
  useEffect(() => {
    const section1 = sectionRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target !== section1) return;

          setIntroVideoEnded(false);
          setStage("intro");
          setEndedChapterIndex(null);

          const video = introRef.current;
          if (video) {
            video.currentTime = 0;
            video.play().catch(() => {});
          }
        });
      },
      { threshold: 0.6 }
    );

    if (section1) observer.observe(section1);
    return () => observer.disconnect();
  }, []);

  // Auto-play chapter videos when their own section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const section = entry.target as HTMLElement;
          section.classList.toggle("is-active", entry.isIntersecting);

          const rawIndex = section.dataset.videoIndex;
          if (!rawIndex) return;
          const chapterIndex = Number(rawIndex);
          if (Number.isNaN(chapterIndex)) return;

          const video = chapterVideoRefs.current[chapterIndex];
          const chapter2MadreLlevar = chapter2MadreLlevarRef.current;
          const syncedAudios = getChapterSyncedAudios(chapterIndex);
          const managedAudios = getChapterManagedAudios(chapterIndex);
          if (!entry.isIntersecting) {
            video?.pause();
            if (chapterIndex === 1 && chapter2MadreLlevar) {
              chapter2MadreLlevar.pause();
              chapter2MadreLlevar.currentTime = 0;
            }
            managedAudios.forEach((audio) => audio.pause());
            return;
          }

          if (video) {
            // Restart chapter every time it becomes the active full-screen section.
            video.currentTime = 0;
            video.play().catch(() => {});
            managedAudios.forEach((audio) => {
              audio.pause();
              audio.currentTime = 0;
            });
            syncedAudios.forEach((audio) => {
              audio.pause();
              audio.currentTime = 0;
              audio.muted = false;
              audio.playbackRate = video.playbackRate;
              audio.play().catch(() => {});
            });
            syncAndResumeChapterAudios(chapterIndex, video);
            if (chapterIndex === 1 && chapter2MadreLlevar) {
              chapter2MadreLlevar.pause();
              chapter2MadreLlevar.currentTime = 0;
              chapter2MadreLlevar.play().catch(() => {});
            }
          } else {
            managedAudios.forEach((audio) => {
              audio.pause();
              audio.currentTime = 0;
            });
            syncedAudios.forEach((audio) => {
              audio.play().catch(() => {});
            });
          }
          // Keep the restart button for the chapter that just ended.
          // Only clear it when user navigates to a different chapter.
          setEndedChapterIndex((prev) => (prev !== null && prev !== chapterIndex ? null : prev));

        });
      },
      { threshold: 0.5 }
    );

    videoSectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [endedChapterIndex, getChapterManagedAudios, getChapterSyncedAudios, syncAndResumeChapterAudios]);

  return (
    <main className="bg-black text-white">
      <section
        ref={sectionRef}
        className="story-snap-section screen-h relative w-full overflow-hidden"
      >
        <div className="absolute inset-0 h-full w-full">
          <video
            ref={introRef}
            className={`absolute inset-0 h-full w-full object-contain bg-black transition-opacity duration-700 ease-in-out ${
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
            className={`absolute inset-0 h-full w-full object-contain bg-black transition-opacity duration-700 ease-in-out ${
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
        {introVideoEnded && (
          <button
            ref={restartBtnIntroRef}
            className="absolute left-4 top-4 z-30 invisible cursor-pointer sm:left-6 sm:top-6 md:left-8 md:top-8"
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
              className="h-16 w-16 drop-shadow-[0_0_16px_rgba(255,255,255,0.6)] sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            />
          </button>
        )}
      </section>

      {CHAPTERS.map((chapter, chapterIndex) => {
        const isImageChapter = chapter.src.toLowerCase().endsWith(".png");
        const chapter7OverlayScaleClass = chapter.id === 7 ? "scale-[0.25]" : "";
        const chapterBackgroundSrc =
          chapter.id === 7 && activeChapter7DragPart !== null ? "/imagen-lobo-enfadado.png" : chapter.src;
        return (
          <Fragment key={`chapter-${chapter.id}`}>
            <section
              ref={(element) => {
                titleSectionRefs.current[chapterIndex] = element;
              }}
              className="story-snap-section relative h-[300vh] bg-black"
            >
              <div className="screen-h sticky top-0 w-full overflow-hidden">
                <div
                  ref={(element) => {
                    titleOverlayRefs.current[chapterIndex] = element;
                  }}
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center invisible"
                >
                  <div className="absolute inset-0 backdrop-blur-md bg-black/40" />
                  <div
                    ref={(element) => {
                      titleTextRefs.current[chapterIndex] = element;
                    }}
                    className="relative z-10 invisible px-6 text-center sm:px-8 md:px-12 lg:px-16"
                  >

                    <h2 className="max-w-[92vw] text-2xl font-bold leading-tight sm:max-w-[85vw] sm:text-4xl md:max-w-4xl md:text-5xl lg:text-6xl xl:text-7xl">
                      {chapter.text}
                    </h2>
                  </div>
                </div>
              </div>
            </section>

            <section
              ref={(element) => {
                videoSectionRefs.current[chapterIndex] = element;
              }}
              data-video-index={chapterIndex}
              className="chapter-video-section story-snap-section relative h-[126vh] w-full bg-black md:h-[136vh] lg:h-[146vh] xl:h-[156vh]"
            >
                <div className="chapter-lock-panel screen-h sticky top-0 w-full overflow-hidden">
                {isImageChapter ? (
                  <img
                    src={chapterBackgroundSrc}
                    alt={chapter.text}
                    className="absolute inset-0 h-full w-full object-contain object-center bg-black"
                  />
                ) : (
                  <video
                    ref={(element) => {
                      chapterVideoRefs.current[chapterIndex] = element;
                    }}
                    className="absolute inset-0 h-full w-full object-contain bg-black"
                    src={chapter.src}
                    muted
                    playsInline
                    preload="auto"
                    onPlay={(event) => {
                      const video = event.currentTarget;
                      syncAndResumeChapterAudios(chapterIndex, video);
                    }}
                    onPause={() => {
                      getChapterManagedAudios(chapterIndex).forEach((audio) => audio.pause());
                    }}
                    onTimeUpdate={(event) => {
                      const video = event.currentTarget;
                      syncAndResumeChapterAudios(chapterIndex, video);
                    }}
                    onRateChange={(event) => {
                      getChapterSyncedAudios(chapterIndex).forEach((audio) => {
                        audio.playbackRate = event.currentTarget.playbackRate;
                      });
                    }}
                    onEnded={(event) => {
                      const video = event.currentTarget;
                      video.currentTime = video.duration;
                      video.pause();
                      getChapterManagedAudios(chapterIndex).forEach((audio) => {
                        audio.currentTime = 0;
                        audio.pause();
                      });
                      setEndedChapterIndex(chapterIndex);
                    }}
                  />
                )}

                {chapter.id === 7 && (
                  <div className="pointer-events-none absolute inset-0 z-10">
                    <div className="pointer-events-none absolute inset-0" style={getChapter7OverlayStyle("hair")}>
                      <img
                        src="/pelo.png"
                        alt="Pelo del lobo"
                        draggable={false}
                        onPointerDown={(event) => startChapter7OverlayDrag("hair", event)}
                        className={`pointer-events-auto absolute inset-0 h-full w-full select-none object-contain object-center ${chapter7OverlayScaleClass}`}
                        style={{
                          touchAction: "none",
                          cursor: activeChapter7DragPart === "hair" ? "grabbing" : "grab",
                        }}
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0" style={getChapter7OverlayStyle("glasses")}>
                      <img
                        src="/gafas.png"
                        alt="Gafas del lobo"
                        draggable={false}
                        onPointerDown={(event) => startChapter7OverlayDrag("glasses", event)}
                        className={`pointer-events-auto absolute inset-0 h-full w-full select-none object-contain object-center ${chapter7OverlayScaleClass}`}
                        style={{
                          touchAction: "none",
                          cursor: activeChapter7DragPart === "glasses" ? "grabbing" : "grab",
                        }}
                      />
                    </div>
                  </div>
                )}

                {chapter.id === 2 && (
                  <>
                    <video
                      ref={chapter2MadreLlevarRef}
                      src="/comentarios/madre-llevar.mov"
                      muted
                      playsInline
                      preload="auto"
                      className="pointer-events-none absolute left-2 top-[18%] z-20 w-[36vw] max-w-[22rem] min-w-[11rem] object-contain sm:left-4 sm:w-[28vw] md:left-6 md:w-[22vw] md:min-w-[8.5rem] lg:w-[20vw] lg:min-w-[11rem]"
                      onEnded={(event) => {
                        const overlay = event.currentTarget;
                        overlay.currentTime = overlay.duration;
                        overlay.pause();
                      }}
                    />
                    <img
                      src="/comentarios/caperucita-llevar.png"
                      alt="Caperucita llevar"
                      draggable={false}
                      onPointerDown={startChapter2CaperucitaLlevarDrag}
                      className="pointer-events-auto absolute left-32 top-[44%] z-20 w-[36vw] max-w-[22rem] min-w-[11rem] select-none object-contain sm:left-36 sm:w-[28vw] md:left-40 md:w-[22vw] md:min-w-[8.5rem] lg:left-44 lg:w-[20vw] lg:min-w-[11rem]"
                      style={{
                        transform: `translate(${chapter2CaperucitaLlevarDragOffset.x}px, ${chapter2CaperucitaLlevarDragOffset.y}px)`,
                        transition: isChapter2CaperucitaLlevarDragging ? "none" : "transform 200ms ease-out, filter 140ms ease-out",
                        filter: isChapter2CaperucitaLlevarDragging ? "brightness(0.72)" : "brightness(1)",
                        touchAction: "none",
                        cursor: isChapter2CaperucitaLlevarDragging ? "grabbing" : "grab",
                      }}
                    />
                    <img
                      src="/comentarios/madre-llevar.PNG"
                      alt="Madre llevar"
                      draggable={false}
                      onPointerDown={startChapter2MadreLlevarDrag}
                      className="pointer-events-auto absolute right-24 top-[6%] z-20 w-[36vw] max-w-[22rem] min-w-[11rem] select-none object-contain sm:right-28 sm:w-[28vw] md:right-32 md:w-[22vw] md:min-w-[8.5rem] lg:right-36 lg:w-[20vw] lg:min-w-[11rem]"
                      style={{
                        transform: `translate(${chapter2MadreLlevarDragOffset.x}px, ${chapter2MadreLlevarDragOffset.y}px)`,
                        transition: isChapter2MadreLlevarDragging ? "none" : "transform 200ms ease-out, filter 140ms ease-out",
                        filter: isChapter2MadreLlevarDragging ? "brightness(0.72)" : "brightness(1)",
                        touchAction: "none",
                        cursor: isChapter2MadreLlevarDragging ? "grabbing" : "grab",
                      }}
                    />
                  </>
                )}

                {chapter.id === 3 && (
                  <img
                    src="/comentarios/madre-adios.png"
                    alt="Bocadillo madre adios"
                    draggable={false}
                    onPointerDown={startChapter3MadreAdiosDrag}
                    className="pointer-events-auto absolute left-[65%] top-[42%] z-20 w-[18vw] max-w-[11rem] min-w-[6.5rem] select-none object-contain transition-[filter,transform] duration-200 ease-out sm:w-[16vw] md:w-[13vw] lg:w-[11vw]"
                    style={{
                      transform: `translate(calc(-50% + ${chapter3MadreAdiosDragOffset.x}px), ${chapter3MadreAdiosDragOffset.y}px)`,
                      transition: isChapter3MadreAdiosDragging ? "none" : "transform 200ms ease-out, filter 140ms ease-out",
                      filter: isChapter3MadreAdiosDragging ? "hue-rotate(-18deg) saturate(1.5) brightness(0.85)" : undefined,
                      touchAction: "none",
                      cursor: isChapter3MadreAdiosDragging ? "grabbing" : "grab",
                    }}
                  />
                )}

                {chapter.id === 5 && (
                  <img
                    src="/comentarios/lobo-ir.png"
                    alt="Lobo ir"
                    draggable={false}
                    onPointerDown={startChapter5LoboIrDrag}
                    className="pointer-events-auto absolute left-[76%] top-0 z-20 w-[42vw] max-w-[26rem] min-w-[14rem] select-none object-contain sm:w-[36vw] md:w-[26vw] md:min-w-[10rem] lg:w-[24vw] lg:min-w-[14rem]"
                    style={{
                      transform: `translate(calc(-50% + ${chapter5LoboIrDragOffset.x}px), ${chapter5LoboIrDragOffset.y}px)`,
                      transition: isChapter5LoboIrDragging ? "none" : "transform 200ms ease-out, filter 140ms ease-out",
                      filter: isChapter5LoboIrDragging ? "brightness(0.72)" : "brightness(1)",
                      touchAction: "none",
                      cursor: isChapter5LoboIrDragging ? "grabbing" : "grab",
                    }}
                  />
                )}

                {chapter.id === 6 && (
                  <img
                    src="/ultimocap.png"
                    alt="Ultimo capitulo"
                    className="pointer-events-none absolute left-[68%] bottom-[68%] z-20 w-[28vw] max-w-[18rem] min-w-[8rem] -translate-x-1/2 object-contain sm:w-[24vw] md:w-[20vw] lg:w-[16vw]"
                  />
                )}

                {chapter.id === 8 && (
                  <>
                    <img
                      src={chapter8AbuelaAlt ? "/abuela2.png" : "/abuela-final.png"}
                      alt="Abuela final"
                      draggable={false}
                      onClick={() => setChapter8AbuelaAlt((previous) => !previous)}
                      className="pointer-events-auto absolute left-[20%] bottom-[6%] z-20 w-[22vw] max-w-[14rem] min-w-[6rem] -translate-x-1/2 cursor-pointer object-contain sm:w-[20vw] md:w-[14vw] md:min-w-[5rem] lg:w-[16vw] lg:min-w-[6rem]"
                    />
                    <img
                      src={chapter8CaperucitaAlt ? "/caperucita2.png" : "/caperucita-final.png"}
                      alt="Caperucita final"
                      draggable={false}
                      onClick={() => setChapter8CaperucitaAlt((previous) => !previous)}
                      className="pointer-events-auto absolute left-[32%] bottom-[4%] z-20 w-[32vw] max-w-[20rem] min-w-[8.5rem] -translate-x-1/2 cursor-pointer object-contain sm:w-[28vw] md:w-[20vw] md:min-w-[7.5rem] lg:w-[20vw] lg:min-w-[8.5rem]"
                    />
                    <img
                      src="/lobo-final.png"
                      alt="Lobo final"
                      className="pointer-events-none absolute left-[62%] bottom-[4%] z-20 w-[34vw] max-w-[22rem] min-w-[10rem] -translate-x-1/2 object-contain sm:w-[30vw] md:w-[22vw] md:min-w-[8rem] lg:w-[22vw] lg:min-w-[10rem]"
                    />
                    <img
                      src="/cazador-final.png"
                      alt="Cazador final"
                      className="pointer-events-none absolute left-[77%] bottom-[6%] z-20 w-[30vw] max-w-[19rem] min-w-[8rem] -translate-x-1/2 object-contain sm:w-[26vw] md:w-[18vw] md:min-w-[6.5rem] lg:w-[18vw] lg:min-w-[8rem]"
                    />
                  </>
                )}

                {endedChapterIndex === chapterIndex && (
                  <button
                    ref={restartBtnChapterRef}
                    className="absolute left-4 top-4 z-30 invisible cursor-pointer sm:left-6 sm:top-6 md:left-8 md:top-8"
                    onClick={() => {
                      setEndedChapterIndex(null);
                      const video = chapterVideoRefs.current[chapterIndex];
                      if (!video) return;
                      video.pause();
                      video.currentTime = 0;
                      video.play().catch(() => {});
                      getChapterManagedAudios(chapterIndex).forEach((audio) => {
                        audio.pause();
                        audio.currentTime = 0;
                      });
                      getChapterSyncedAudios(chapterIndex).forEach((audio) => {
                        audio.muted = false;
                        audio.playbackRate = video.playbackRate;
                        audio.play().catch(() => {});
                      });
                    }}
                  >
                    <img
                      src="/boton-reinicio.png"
                      alt="Reiniciar video"
                      className="h-16 w-16 drop-shadow-[0_0_16px_rgba(255,255,255,0.6)] sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                    />
                  </button>
                )}

                {chapter.id === 1 && (
                  <button
                    onClick={() => setArbustoLleno((prev) => !prev)}
                    className="absolute -bottom-24 -right-6 z-20 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 sm:-bottom-28 sm:-right-8 md:-bottom-32 md:-right-10 lg:-bottom-40 lg:-right-12 xl:-bottom-48 xl:-right-14"
                  >
                    <img
                      src={arbustoLleno ? "/arbusto-lleno.png" : "/arbusto-agujero.png"}
                      alt={arbustoLleno ? "Arbusto lleno" : "Arbusto con agujero"}
                      className="h-[18rem] w-[18rem] object-contain drop-shadow-lg sm:h-[24rem] sm:w-[24rem] md:h-[30rem] md:w-[30rem] lg:h-[38rem] lg:w-[38rem] xl:h-[48rem] xl:w-[48rem]"
                    />
                  </button>
                )}
              </div>
            </section>
          </Fragment>
        );
      })}

      <audio
        ref={chapter1AudioRef}
        src="/sonido-bosque.mp3"
        preload="auto"
        aria-hidden="true"
      />
      <audio
        ref={chapter2ChimeneaAudioRef}
        src="/audios/sonido-chimenea.mp3"
        preload="auto"
        aria-hidden="true"
      />
      <audio
        ref={chapter4Bosque2AudioRef}
        src="/bosque2.mp3"
        preload="auto"
        aria-hidden="true"
      />
    </main>
  );
}

