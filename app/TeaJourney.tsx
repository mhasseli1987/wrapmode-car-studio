"use client";

import { useEffect, useRef, useState } from "react";

const scenes = [
  {
    label: "Car 01",
    kicker: "01 · The first reveal",
    title: "Where the film begins.",
    body: "The studio opens on the first car — a wrapped silhouette under low violet light. Scroll, and the camera starts to move.",
    note: "Stage 01 · Studio floor",
    still: "/media/stills/car-1.svg",
  },
  {
    label: "Car 02",
    kicker: "02 · Continuous move",
    title: "One motion, no cuts.",
    body: "The camera glides past the first car and settles on the second. Same light, same world — a single unbroken move.",
    note: "Stage 02 · Continuous shot",
    still: "/media/stills/car-2.svg",
  },
  {
    label: "Car 03",
    kicker: "03 · The camera turns",
    title: "Around the third form.",
    body: "The journey curves around the third car as its wrap catches the rim light — texture you can almost touch.",
    note: "Stage 03 · Orbit pass",
    still: "/media/stills/car-3.svg",
  },
  {
    label: "Car 04",
    kicker: "04 · The final frame",
    title: "The collection, complete.",
    body: "The camera lands on the last car and holds. Four cars, one continuous journey — the way Wrapmode sees every wrap.",
    note: "Stage 04 · Hero hold",
    still: "/media/stills/car-4.svg",
  },
];

// Placeholder paths — real rendered transitions (car 1→2, 2→3, 3→4) replace these files later.
const clips = [
  "/media/video/car-1-to-2.mp4",
  "/media/video/car-2-to-3.mp4",
  "/media/video/car-3-to-4.mp4",
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

    // Timeline: hold(car1) · clip1 · hold(car2) · clip2 · hold(car3) · clip3 · hold(car4)
    // Even units are holds on a car, odd units scrub the transition clip.
    const unitCount = scenes.length + clips.length;

    const read = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? clamp(window.scrollY / maxScroll) : 0;
      const exact = progress * unitCount;
      const unit = Math.min(unitCount - 1, Math.floor(exact));
      const local = unit === unitCount - 1 ? clamp(exact - unit) : exact - unit;
      const isHold = unit % 2 === 0;
      const holdScene = unit / 2;
      const clipIndex = (unit - 1) / 2;

      targets.current = targets.current.map((_, index) => {
        if (isHold) return index < holdScene ? 1 : 0;
        if (index < clipIndex) return 1;
        if (index === clipIndex) return local;
        return 0;
      });

      const fade = clamp((local - 0.9) / 0.1);
      videoRefs.current.forEach((video, index) => {
        if (!video) return;
        let opacity = 0;
        if (isHold) {
          if (index === holdScene - 1) opacity = 1;
        } else {
          if (index === clipIndex) opacity = 1 - fade;
          if (index === clipIndex + 1) opacity = fade;
        }
        video.style.opacity = String(opacity);
      });

      const nextActive = isHold
        ? holdScene
        : Math.min(scenes.length - 1, local < 0.5 ? clipIndex : clipIndex + 1);
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
    // Centre of the hold unit for scene `index` on the hold/clip timeline.
    window.scrollTo({
      top: ((2 * index + 0.5) / (scenes.length + clips.length)) * maxScroll,
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
