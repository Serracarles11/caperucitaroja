"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Stage = "intro" | "continuation";
type Chapter = {
  id: number;
  src: string;
  text: string;
};

const CHAPTERS: Chapter[] = [
  { id: 1, src: "/video-capitulo1.mp4", text: "caperucita se dirigia a casa de su madre" },
  { id: 2, src: "/capitulo2.mp4", text: "capitulo 2" },
  { id: 3, src: "/capitulo3.mp4", text: "capitulo 3" },
  { id: 4, src: "/capitulo4.mp4", text: "capitulo 4" },
  { id: 5, src: "/capitulo5.mp4", text: "capitulo 5" },
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
  const chapter1NarradorAudioRef = useRef<HTMLAudioElement | null>(null);
  const chapter2ChimeneaAudioRef = useRef<HTMLAudioElement | null>(null);
  const chapter2MadreAudioRef = useRef<HTMLAudioElement | null>(null);
  const chapter2HijaAudioRef = useRef<HTMLAudioElement | null>(null);
  const chapterTextOverlayRefs = useRef<Array<HTMLDivElement | null>>([]);
  const restartBtnIntroRef = useRef<HTMLButtonElement | null>(null);
  const restartBtnChapterRef = useRef<HTMLButtonElement | null>(null);
  const textAnimationPlayedRef = useRef<boolean[]>(CHAPTERS.map(() => false));
  const [stage, setStage] = useState<Stage>("intro");
  const [arbustoLleno, setArbustoLleno] = useState(true);
  const [introVideoEnded, setIntroVideoEnded] = useState(false);
  const [endedChapterIndex, setEndedChapterIndex] = useState<number | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const getChapterSyncedAudios = useCallback((chapterIndex: number) => {
    if (chapterIndex === 0) {
      return [chapter1AudioRef.current, chapter1NarradorAudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    if (chapterIndex === 1) {
      return [chapter2ChimeneaAudioRef.current, chapter2MadreAudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    return [];
  }, []);

  const getChapterManagedAudios = useCallback((chapterIndex: number) => {
    if (chapterIndex === 1) {
      return [chapter2ChimeneaAudioRef.current, chapter2MadreAudioRef.current, chapter2HijaAudioRef.current].filter(
        (audio): audio is HTMLAudioElement => audio !== null
      );
    }
    return getChapterSyncedAudios(chapterIndex);
  }, [getChapterSyncedAudios]);

  const getAllAudios = useCallback(
    () =>
      [
        chapter1AudioRef.current,
        chapter1NarradorAudioRef.current,
        chapter2ChimeneaAudioRef.current,
        chapter2MadreAudioRef.current,
        chapter2HijaAudioRef.current,
      ].filter((audio): audio is HTMLAudioElement => audio !== null),
    []
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

    getChapterSyncedAudios(activeChapterIndex).forEach((audio) => {
      audio.currentTime = activeVideo.currentTime;
      audio.playbackRate = activeVideo.playbackRate;
      audio.play().catch(() => {});
    });
  }, [audioUnlocked, getAllAudios, getChapterSyncedAudios]);

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
          const syncedAudios = getChapterSyncedAudios(chapterIndex);
          const managedAudios = getChapterManagedAudios(chapterIndex);
          if (!entry.isIntersecting) {
            video?.pause();
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

          const text = chapterTextOverlayRefs.current[chapterIndex];
          if (text && !textAnimationPlayedRef.current[chapterIndex]) {
            gsap.fromTo(
              text,
              { autoAlpha: 0, y: -14 },
              { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }
            );
            textAnimationPlayedRef.current[chapterIndex] = true;
          }

        });
      },
      { threshold: 0.5 }
    );

    videoSectionRefs.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [endedChapterIndex, getChapterManagedAudios, getChapterSyncedAudios]);

  return (
    <main className="bg-black text-white">
      {!audioUnlocked && (
        <button
          onClick={unlockAudio}
          className="fixed right-4 top-4 z-40 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-amber-100 ring-1 ring-amber-200/40 backdrop-blur hover:bg-black/85"
        >
          Activar sonido
        </button>
      )}

      <section
        ref={sectionRef}
        className="story-snap-section screen-h relative w-full overflow-hidden"
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
        <div className="pointer-events-none relative z-10 flex h-full w-full items-end p-6 sm:p-8 md:p-12 lg:p-16 xl:p-20">
          <h1 className="max-w-[14ch] text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Caperucita Roja
          </h1>
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
                    <p className="mb-3 text-xs uppercase tracking-[0.22em] text-zinc-400 sm:mb-4 sm:text-sm sm:tracking-[0.3em]">
                      {`Capitulo ${chapter.id}`}
                    </p>
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
                <video
                  ref={(element) => {
                    chapterVideoRefs.current[chapterIndex] = element;
                  }}
                  className="absolute inset-0 min-h-full min-w-full object-cover"
                  style={{ width: "100%", height: "100%" }}
                  src={chapter.src}
                  muted
                  playsInline
                  preload="auto"
                  onPlay={(event) => {
                    const video = event.currentTarget;
                    getChapterSyncedAudios(chapterIndex).forEach((audio) => {
                      const drift = Math.abs(audio.currentTime - video.currentTime);
                      if (drift > 0.2) {
                        audio.currentTime = video.currentTime;
                      }
                      audio.muted = false;
                      audio.playbackRate = video.playbackRate;
                      audio.play().catch(() => {});
                    });
                  }}
                  onPause={() => {
                    getChapterManagedAudios(chapterIndex).forEach((audio) => audio.pause());
                  }}
                  onTimeUpdate={(event) => {
                    const video = event.currentTarget;
                    getChapterSyncedAudios(chapterIndex).forEach((audio) => {
                      const drift = Math.abs(audio.currentTime - video.currentTime);
                      if (drift > 0.2) {
                        audio.currentTime = video.currentTime;
                      }
                    });
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

                <div
                  ref={(element) => {
                    chapterTextOverlayRefs.current[chapterIndex] = element;
                  }}
                  className="pointer-events-none absolute right-3 top-3 z-20 max-w-[84vw] text-right sm:right-5 sm:top-5 sm:max-w-[72vw] md:right-8 md:top-8 md:max-w-[30rem] lg:max-w-[34rem]"
                >
                  <p className="font-serif text-sm leading-relaxed text-amber-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-base md:text-xl lg:text-2xl">
                    {chapter.text}
                  </p>
                </div>

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
        ref={chapter1NarradorAudioRef}
        src="/audios/narrador-cap1.mp3"
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
        ref={chapter2MadreAudioRef}
        src="/audios/madre-cap2.mp3"
        preload="auto"
        onEnded={() => {
          const video = chapterVideoRefs.current[1];
          const chapter2Section = videoSectionRefs.current[1];
          const hija = chapter2HijaAudioRef.current;
          if (!video || !chapter2Section || !hija) return;
          if (video.paused || !chapter2Section.classList.contains("is-active")) return;
          hija.pause();
          hija.currentTime = 0;
          hija.playbackRate = video.playbackRate;
          hija.play().catch(() => {});
        }}
        aria-hidden="true"
      />
      <audio
        ref={chapter2HijaAudioRef}
        src="/audios/hija-cap2.mp3"
        preload="auto"
        aria-hidden="true"
      />
    </main>
  );
}

