(() => {
  gsap.registerPlugin(ScrollTrigger);

  const IS_MOBILE = window.matchMedia("(max-width: 768px)").matches;
  const FRAME_DIR = IS_MOBILE ? "m/" : "d/";
  const SOURCE_FRAMES = 120;
  const FRAME_SCROLL_END = 0.92;

  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loader-bar");
  const loaderPercent = document.getElementById("loader-percent");
  const canvas = document.getElementById("canvas");
  const canvasWrap = document.getElementById("canvas-wrap");
  const scrollContainer = document.getElementById("scroll-container");
  const heroSection = document.querySelector(".hero-standalone");
  const overlay = document.getElementById("dark-overlay");
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });

  let frames = [];
  let currentFrame = -1;
  let bgColor = "#050408";
  let sectionDrivers = [];

  let targetFrameF = 0;
  let smoothFrameF = 0;
  let scrubRaf = 0;

  const lenis = new Lenis({
    duration: 1.35,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: IS_MOBILE ? 0.55 : 0.42,
    touchMultiplier: 0.85,
    syncTouch: true,
    syncTouchLerp: 0.08,
    lerp: 0.075,
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  function setProgress(loaded, total) {
    const p = Math.round((loaded / total) * 100);
    if (loaderBar) loaderBar.style.width = `${p}%`;
    if (loaderPercent) loaderPercent.textContent = `${p}%`;
  }

  function sampleBgColor(img) {
    const c = document.createElement("canvas");
    c.width = c.height = 4;
    const cx = c.getContext("2d");
    if (!cx) return bgColor;
    cx.drawImage(img, 0, 0, 4, 4);
    const d = cx.getImageData(1, 1, 1, 1).data;
    return `rgb(${d[0]},${d[1]},${d[2]})`;
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.25 : 1.75);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (currentFrame >= 0) drawFrame(currentFrame);
  }

  function nearestLoadedFrame(index) {
    if (frames[index]) return index;
    for (let d = 1; d < frames.length; d++) {
      if (index - d >= 0 && frames[index - d]) return index - d;
      if (index + d < frames.length && frames[index + d]) return index + d;
    }
    return -1;
  }

  function drawFrame(index) {
    const resolved = frames[index] ? index : nearestLoadedFrame(index);
    if (resolved < 0) return;
    const img = frames[resolved];
    if (!img) return;
    const cw = window.innerWidth;
    const ch = window.innerHeight;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const pad = IS_MOBILE ? 0.96 : 0.9;
    const scale = Math.max(cw / iw, ch / ih) * pad;
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    if (resolved % 16 === 0) bgColor = sampleBgColor(img);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);

    const g = ctx.createRadialGradient(
      cw * 0.5,
      ch * 0.5,
      Math.min(cw, ch) * 0.28,
      cw * 0.5,
      ch * 0.5,
      Math.max(cw, ch) * 0.72
    );
    g.addColorStop(0, "rgba(5,4,8,0)");
    g.addColorStop(0.75, "rgba(5,4,8,0.06)");
    g.addColorStop(1, "rgba(5,4,8,0.35)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, cw, ch);
  }

  function scrubLoop() {
    scrubRaf = 0;
    const ease = IS_MOBILE ? 0.22 : 0.16;
    smoothFrameF += (targetFrameF - smoothFrameF) * ease;

    if (Math.abs(targetFrameF - smoothFrameF) < 0.02) {
      smoothFrameF = targetFrameF;
    }

    const idx = Math.max(
      0,
      Math.min(frames.length - 1, Math.round(smoothFrameF))
    );
    if (idx !== currentFrame) {
      currentFrame = idx;
      drawFrame(idx);
    }

    if (smoothFrameF !== targetFrameF) {
      scrubRaf = requestAnimationFrame(scrubLoop);
    }
  }

  function setFrameTarget(index) {
    targetFrameF = index;
    if (!scrubRaf) scrubRaf = requestAnimationFrame(scrubLoop);
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  }

  async function preloadFrames() {
    frames = new Array(SOURCE_FRAMES).fill(null);
    let loaded = 0;
    const READY_AT = Math.min(IS_MOBILE ? 18 : 24, SOURCE_FRAMES);
    let unlocked = false;

    const loadOne = async (i) => {
      const path = `${FRAME_DIR}f_${String(i + 1).padStart(4, "0")}.webp`;
      frames[i] = await loadImage(path);
      loaded += 1;
      if (!unlocked) setProgress(loaded, READY_AT);
      else setProgress(SOURCE_FRAMES, SOURCE_FRAMES);
    };

    const first = READY_AT;
    await Promise.all(Array.from({ length: first }, (_, i) => loadOne(i)));
    if (frames[0]) {
      drawFrame(0);
      currentFrame = 0;
      smoothFrameF = 0;
      targetFrameF = 0;
    }
    unlocked = true;
    setProgress(SOURCE_FRAMES, SOURCE_FRAMES);

    const continueLoad = async () => {
      const batch = IS_MOBILE ? 8 : 16;
      for (let start = first; start < SOURCE_FRAMES; start += batch) {
        const end = Math.min(start + batch, SOURCE_FRAMES);
        await Promise.all(
          Array.from({ length: end - start }, (_, j) => loadOne(start + j))
        );
      }
    };
    continueLoad().catch(() => {});

    return frames.filter(Boolean).length >= Math.min(12, SOURCE_FRAMES);
  }

  function positionSections() {
    const totalH = scrollContainer.offsetHeight;
    document.querySelectorAll(".scroll-section").forEach((section) => {
      const enter = parseFloat(section.dataset.enter) / 100;
      const leave = parseFloat(section.dataset.leave) / 100;
      section.style.top = `${((enter + leave) / 2) * totalH}px`;
    });
  }

  function setupSectionDrivers() {
    sectionDrivers = [];
    document.querySelectorAll(".scroll-section").forEach((section) => {
      const type = section.dataset.animation;
      const persist = section.dataset.persist === "true";
      const enter = parseFloat(section.dataset.enter) / 100;
      const leave = parseFloat(section.dataset.leave) / 100;
      const children = section.querySelectorAll(
        ".section-heading, .section-body, .service-list li, .cta-button, .nebula-cta, .stat, .cta-row"
      );

      gsap.set(children, { clearProps: "all" });
      const tl = gsap.timeline({ paused: true });
      const from =
        type === "slide-left"
          ? { x: -48, opacity: 0 }
          : type === "slide-right"
            ? { x: 48, opacity: 0 }
            : type === "scale-up"
              ? { scale: 0.92, opacity: 0 }
              : { y: 32, opacity: 0 };

      tl.fromTo(
        children,
        { ...from },
        {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          stagger: 0.07,
          duration: 0.55,
          ease: "power2.out",
        }
      );

      sectionDrivers.push({ enter, leave, persist, tl, maxSeen: 0 });
    });
  }

  function syncSections(p) {
    sectionDrivers.forEach((d) => {
      const span = Math.max(d.leave - d.enter, 0.001);
      let local = (p - d.enter) / span;
      if (local < 0) local = 0;
      if (local > 1) local = 1;

      if (d.persist) {
        d.maxSeen = Math.max(d.maxSeen, local);
        d.tl.progress(d.maxSeen);
      } else if (p >= d.enter && p <= d.leave) {
        d.tl.progress(Math.min(1, local * 1.35));
      } else if (p < d.enter) {
        d.tl.progress(0);
      } else {
        d.tl.progress(Math.max(0, 1 - (p - d.leave) / 0.06));
      }
    });
  }

  function syncHero(p) {
    const heroFade = Math.max(0, 1 - p * 7);
    heroSection.style.opacity = String(heroFade);
    heroSection.style.pointerEvents = p > 0.14 ? "none" : "auto";
    canvasWrap.style.opacity = "1";
    canvasWrap.style.clipPath = "none";
  }

  function syncOverlay() {
    overlay.style.opacity = "0";
  }

  function syncMarquee(p) {
    document.querySelectorAll(".marquee-wrap").forEach((el) => {
      const enter = parseFloat(el.dataset.enter || "0") / 100;
      const leave = parseFloat(el.dataset.leave || "100") / 100;
      const speed = parseFloat(el.dataset.scrollSpeed) || -25;
      const text = el.querySelector(".marquee-text");
      let opacity = 0;
      if (p >= enter && p <= leave) opacity = 1;
      else if (p > enter - 0.04 && p < enter) opacity = (p - (enter - 0.04)) / 0.04;
      else if (p > leave && p < leave + 0.04) opacity = 1 - (p - leave) / 0.04;
      el.style.opacity = String(opacity);
      if (text) text.style.transform = `translate3d(${p * speed}%,0,0)`;
    });
  }

  function syncFrame(p) {
    const t = Math.min(1, Math.max(0, p / FRAME_SCROLL_END));
    const index = t * (frames.length - 1);
    setFrameTarget(index);
  }

  function initMasterScroll() {
    ScrollTrigger.create({
      trigger: scrollContainer,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        syncFrame(p);
        syncHero(p);
        syncOverlay(p);
        syncMarquee(p);
        syncSections(p);
      },
    });
  }

  function initNavScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href").slice(1);
        if (!id || id === "contact") return;
        e.preventDefault();

        if (id === "top") {
          lenis.scrollTo(0, { duration: 1.15 });
          return;
        }

        const target = document.getElementById(id);
        if (!target) return;

        const enter = parseFloat(target.dataset.enter || "0") / 100;
        const leave = parseFloat(target.dataset.leave || "100") / 100;
        const p = enter + (leave - enter) * 0.28;
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        const y = Math.max(0, Math.min(maxScroll, p * maxScroll));

        lenis.scrollTo(y, { duration: 1.2 });
      });
    });
  }

  function initProjectModal() {
    const modal = document.getElementById("project-modal");
    const openBtn = document.getElementById("start-project-btn");
    const navContact = document.getElementById("nav-contact-btn");
    const waContact = document.getElementById("contact-whatsapp-btn");
    const submitBtn = document.getElementById("project-submit");
    const brief = document.getElementById("project-brief");
    if (!modal || !submitBtn || !brief) return;

    const askStep = modal.querySelector('[data-step="ask"]');
    const doneStep = modal.querySelector('[data-step="done"]');
    const WA_NUMBER = "989304140872";

    const open = () => {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
      if (askStep) askStep.hidden = false;
      if (doneStep) doneStep.hidden = true;
      brief.value = "";
      setTimeout(() => brief.focus(), 50);
    };

    const close = () => {
      modal.hidden = true;
      document.body.style.overflow = "";
    };

    openBtn?.addEventListener("click", open);
    navContact?.addEventListener("click", (e) => {
      e.preventDefault();
      open();
    });
    waContact?.addEventListener("click", open);
    modal.querySelectorAll("[data-close-modal]").forEach((el) => {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) close();
    });

    submitBtn.addEventListener("click", () => {
      const text = brief.value.trim();
      if (!text) {
        brief.focus();
        brief.classList.add("is-invalid");
        return;
      }
      brief.classList.remove("is-invalid");

      const message =
        "سلام، از طریق سایت ENZO.DEV پیام می‌دهم.\n\n" +
        "مدل سایت مورد نظر:\n" +
        text;
      const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank", "noopener,noreferrer");

      if (askStep) askStep.hidden = true;
      if (doneStep) doneStep.hidden = false;
    });
  }

  function initCounters() {
    document.querySelectorAll(".stat-number").forEach((el) => {
      const target = parseFloat(el.dataset.value);
      const decimals = parseInt(el.dataset.decimals || "0", 10);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: "power1.out",
        snap: { val: decimals === 0 ? 1 : 0.01 },
        scrollTrigger: {
          trigger: el.closest(".scroll-section"),
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
        onUpdate: () => {
          el.textContent =
            decimals === 0 ? String(Math.round(obj.val)) : obj.val.toFixed(decimals);
        },
      });
    });
  }

  async function init() {
    resizeCanvas();
    window.addEventListener("resize", () => {
      resizeCanvas();
      positionSections();
      ScrollTrigger.refresh();
    });

    const ok = await preloadFrames();
    if (!ok) {
      loaderPercent.textContent = "فریم پیدا نشد";
      return;
    }

    loader.classList.add("is-done");
    window.scrollTo(0, 0);
    lenis.scrollTo(0, { immediate: true });

    positionSections();
    setupSectionDrivers();
    initCounters();
    initNavScroll();
    initProjectModal();
    initMasterScroll();
    ScrollTrigger.refresh();
  }

  init();
})();
