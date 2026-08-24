"use client";

import { useEffect, useRef, useState } from "react";

const scenes = [
  {
    label: "Origin",
    kicker: "01 · The leaf begins",
    title: "Before it becomes tea.",
    body: "High in the mountains, mist settles slowly on the youngest leaves. Flavour begins with water, stone and the quiet of morning.",
    note: "Elevation · 1,400 m",
    still: "/media/stills/01-valley.webp",
  },
  {
    label: "Harvest",
    kicker: "02 · The first touch",
    title: "Gathered only at dawn.",
    body: "Hands choose the tender tips — two leaves and a bud. Everything else is left to grow until the mist returns.",
    note: "Hand-picked",
    still: "/media/stills/02-harvest.webp",
  },
  {
    label: "Air",
    kicker: "03 · The house of warm air",
    title: "Time becomes fragrance.",
    body: "Across woven bamboo trays, each leaf releases moisture, softens and reveals the first trace of its future character.",
    note: "Slow withering",
    still: "/media/stills/03-drying-house.webp",
  },
  {
    label: "Fire",
    kicker: "04 · Fire and form",
    title: "Fire remembers the hands.",
    body: "Copper, charcoal and the steady movement of the maker stop oxidation, folding aroma into every leaf.",
    note: "Hand-roasted",
    still: "/media/stills/04-fire-and-form.webp",
  },
  {
    label: "Passage",
    kicker: "05 · Across the mountains",
    title: "A quiet road to water.",
    body: "Tea leaves the workshop by the same path that carries rain, cedar and mountain air into the valley.",
    note: "Stone · forest · water",
    still: "/media/stills/05-mountain-road.webp",
  },
  {
    label: "Cup",
    kicker: "06 · The quiet ceremony",
    title: "The whole valley, in one cup.",
    body: "The mountains return in the steam above dark water. The journey ends where it began: in mist and stillness.",
    note: "Water · 82 °C",
    still: "/media/stills/06-tea-ceremony.webp",
  },
];

const clips = [
  "/media/video/01-valley-to-harvest.mp4",
  "/media/video/02-harvest-to-drying-house.mp4",
  "/media/video/03-drying-to-roasting.mp4",
  "/media/video/04-roasting-to-road.mp4",
  "/media/video/05-road-to-ceremony.mp4",
];

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

export function TeaJourney() {
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const current = useRef(clips.map(() => 0));
  const targets = useRef(clips.map(() => 0));
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    const urls: string[] = [];
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!reduceMotion) {
      Promise.all(
        clips.map(async (clip, index) => {
          const response = await fetch(clip);
          if (!response.ok) throw new Error(`Unable to load ${clip}`);
          const url = URL.createObjectURL(await response.blob());
          urls.push(url);
          const video = videoRefs.current[index];
          if (video && !disposed) {
            video.src = url;
            video.load();
          }
        }),
      )
        .then(() => !disposed && setReady(true))
        .catch(() => !disposed && setReady(true));
    } else {
      setReady(true);
    }

    const read = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll) : 0;
      const exact = progress * clips.length;
      const segment = Math.min(clips.length - 1, Math.floor(exact));
      const local =
        segment === clips.length - 1 ? clamp(exact - segment) : exact - segment;

      targets.current = targets.current.map((_, index) => {
        if (index < segment) return 1;
        if (index === segment) return local;
        return 0;
      });

      const fade = clamp((local - 0.9) / 0.1);
      videoRefs.current.forEach((video, index) => {
        if (!video) return;
        let opacity = 0;
        if (index === segment) opacity = 1 - fade;
        if (index === segment + 1) opacity = fade;
        video.style.opacity = String(opacity);
      });

      const nextActive = Math.min(scenes.length - 1, Math.round(exact));
      if (nextActive !== activeRef.current) {
        activeRef.current = nextActive;
        setActive(nextActive);
      }
      document.documentElement.style.setProperty(
        "--journey-progress",
        progress.toFixed(4),
      );
    };

    let rafId = 0;
    const animate = () => {
      videoRefs.current.forEach((video, index) => {
        if (!video || !Number.isFinite(video.duration) || video.seeking) return;
        const desired = targets.current[index];
        current.current[index] += (desired - current.current[index]) * 0.16;
        const time = clamp(current.current[index], 0, 0.998) * video.duration;
        if (Math.abs(video.currentTime - time) > 0.012) {
          try {
            video.currentTime = time;
          } catch {
            // The still poster remains visible until the browser can seek.
          }
        }
      });
      rafId = requestAnimationFrame(animate);
    };

    read();
    animate();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const jumpTo = (index: number) => {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: (index / (scenes.length - 1)) * maxScroll,
      behavior: "smooth",
    });
  };

  return (
    <main className="journey-track" aria-label="The journey of a tea leaf">
      <section className="journey-shell">
        <div className="journey-stage" aria-hidden="true">
          <img className="journey-poster" src={scenes[active].still} alt="" />
          {clips.map((clip, index) => (
            <video
              key={clip}
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              className="journey-film"
              muted
              playsInline
              preload={index < 2 ? "auto" : "metadata"}
              poster={scenes[index].still}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="journey-shade" aria-hidden="true" />

        <header className="journey-topbar">
          <div className="journey-brand">
            <span className="journey-brand-mark" aria-hidden="true" />
            <span>The Way of the Leaf</span>
          </div>
          <div className="journey-meta">
            <span>Mountain tea · one harvest</span>
            <span>{ready ? "Scroll slowly" : "Preparing the journey…"}</span>
          </div>
        </header>

        <div className="journey-copy-layer">
          {scenes.map((scene, index) => (
            <article
              className={`journey-copy ${active === index ? "is-active" : ""}`}
              key={scene.label}
              aria-hidden={active !== index}
            >
              <div className="journey-kicker">{scene.kicker}</div>
              <h1 className="journey-title">{scene.title}</h1>
              <p className="journey-body">{scene.body}</p>
              <span className="journey-note">{scene.note}</span>
              {index === scenes.length - 1 && (
                <button
                  className="journey-restart"
                  type="button"
                  onClick={() => jumpTo(0)}
                >
                  Begin again
                </button>
              )}
            </article>
          ))}
        </div>

        <nav className="journey-rail" aria-label="Journey chapters">
          {scenes.map((scene, index) => (
            <button
              className={`journey-dot ${active === index ? "is-active" : ""}`}
              type="button"
              key={scene.label}
              onClick={() => jumpTo(index)}
              aria-label={`Go to chapter: ${scene.label}`}
              aria-current={active === index ? "step" : undefined}
            >
              <span className="journey-dot-label">{scene.label}</span>
            </button>
          ))}
        </nav>

        <footer className="journey-footer">
          <div className="journey-scroll">
            <i aria-hidden="true" />
            <span>Scroll controls the camera</span>
          </div>
          <div className="journey-progress" aria-hidden="true" />
          <span>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(scenes.length).padStart(2, "0")}
          </span>
        </footer>
      </section>
    </main>
  );
}
