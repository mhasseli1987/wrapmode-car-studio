/* WRAPMODE — ریل عمودی استودیو: یک take پیوسته، ۵ فصل + بوکه‌ی معرفی (v23 — ریل ۰۰۶ بدون واترمارک) */
(() => {
  "use strict";

  // ---------- پیکربندی ----------
  // کلیپ: 720×1280 (۹:۱۶ عمودی)، ۲۴fps، ۲۴۱ فریم — ریل پنج‌طرحی جدید
  // 0-12 بوکه‌ی تاریک / 14-48 سامورایی موج / 50-96 آنیمه مجنتا / 100-144 هپی هورس / 148-188 گرافیتی نئون / 192-240 ساکورا شب
  // فریم‌های Enhance‌شده: حذف واترمارک (delogo) + Lanczos ۲× (1440×2560) + CAS 0.5 — بوم دسکتاپ downscale می‌نویسد، تیزتر
  const FRAME_DIR = "frames4/";
  const FRAME_COUNT = 241;
  const GRID_HOLD = 7;      // فریم بوکه‌ی معرفی (هیرو)

  const CHAPTERS = [
    { from: 14,  to: 48  }, // ۱ سامورایی موج
    { from: 50,  to: 96  }, // ۲ آنیمه مجنتا
    { from: 100, to: 144 }, // ۳ هپی هورس
    { from: 148, to: 188 }, // ۴ گرافیتی نئون
    { from: 192, to: 240 }, // ۵ ساکورا شب
  ];
  // سهم اسکرول هر فصل (جمع = ۱) — متناسب با طول هر طرح در ریل
  const CH_WEIGHTS = [0.16, 0.21, 0.21, 0.19, 0.23];
  const INTRO_END = 0.05;   // سهم هیروی ثابت (فریم بوکه)

  const WA_NUMBER = "989304140872";

  // ---------- ۵ طرح کالکشن (به ترتیب ریل جدید) ----------
  const DESIGNS = [
    { en: "SAMURAI WAVE",  fa: "سامورایی موج",   descFa: "موج بزرگ قرمز و فیروزه‌ای با سوارِ سامورایی؛ حس اوکی‌یوی ژاپن.", descEn: "Great red-and-teal wave with a samurai rider — ukiyo-e energy.", price: 45000000, img: "img/design-1.webp" },
    { en: "MAGENTA ANIME", fa: "آنیمه مجنتا",    descFa: "پرتره‌ی آنیمه‌ی مجنتا روی بدنه‌ی نقره‌ای؛ جسور، پرانرژی، دیده‌شدن.", descEn: "Magenta anime portrait over a silver body — bold and loud.", price: 42000000, img: "img/design-2.webp" },
    { en: "HAPPY HORSE",   fa: "هپی هورس ۱.۱",   descFa: "کمدی‌بوک سفید/مشکی با جوکر و تاج‌ها؛ امضای این کالکشن.",        descEn: "White/black comic splatter with clown and crowns — the signature.", price: 38000000, img: "img/design-3.webp" },
    { en: "NEON GRAFFITI", fa: "گرافیتی نئون",   descFa: "آرت گرافیتی چندرنگ روی بدنه‌ی قرمز، زیر نور نئون سبز.",        descEn: "Multicolour graffiti on red body under green neon light.", price: 32000000, img: "img/design-4.webp" },
    { en: "SAKURA NIGHT",  fa: "ساکورا شب",      descFa: "چاپ ساکورا و آنیمه‌ی صورتی روی بدنه‌ی مشکی؛ مه و گل‌ریزان.",    descEn: "Sakura anime print on black body — mist and falling petals.", price: 28000000, img: "img/design-5.webp" },
  ];

  // ---------- بیلینگوال ----------
  const I18N = {
    fa: {
      "nav.designs": "کالکشن", "nav.contact": "تماس", "nav.cart": "سبد",
      "hero.kicker": "CAR WRAP STUDIO",
      "hero.title": "کالکشن رپ. یک اسکرول.",
      "hero.sub": "فویل کست اورجینال، چاپ اختصاصی و نصب حرفه‌ای — پنج طرح فول‌بادی در یک روایت سینمایی.",
      "hero.cta1": "مشاهده کالکشن", "hero.cta2": "مشاوره واتساپ",
      "scroll": "اسکرول کنید",
      "cap1.title": "سامورایی موج — افسانه‌ی دریا",
      "cap2.title": "آنیمه مجنتا — همه‌ی نگاه‌ها",
      "cap3.title": "هپی هورس — یاغیِ کمدی",
      "cap4.title": "گرافیتی نئون — پس از تاریکی",
      "cap5.title": "ساکورا — شبِ گل‌ریزان",
      "col.kicker": "THE COLLECTION — 05",
      "col.title": "پنج طرح منتخب فول‌بادی",
      "col.sub": "قیمت تمام‌شده با چاپ و اجرای حرفه‌ای — انتخاب کنید و سفارش را در واتساپ نهایی کنید.",
      "stat1": "پروژه اجرا شده", "stat2": "سال سابقه تخصصی", "stat3": "فویل اورجینال",
      "foot.tag": "رپ کن. بران. نگاه‌ها را بچسبان.",
      "cart.title": "سبد خرید", "cart.empty": "سبد خرید خالی است.", "cart.total": "جمع کل",
      "cart.order": "ثبت سفارش در واتساپ",
      "contact.title": "تماس با ورپ‌مود",
      "contact.body": "برای مشاوره، قیمت دقیق و رزرو نوبت از واتساپ در ارتباط باشید.",
      "contact.cta": "گفتگو در واتساپ", "contact.close": "بستن",
      _add: "افزودن", _added: "به سبد اضافه شد ✓", _toman: "تومان", _remove: "حذف",
    },
    en: {
      "nav.designs": "Collection", "nav.contact": "Contact", "nav.cart": "Cart",
      "hero.kicker": "CAR WRAP STUDIO",
      "hero.title": "The wrap collection. One scroll.",
      "hero.sub": "Original cast vinyl, custom prints and professional installation — five full-body designs in one cinematic scroll.",
      "hero.cta1": "View the collection", "hero.cta2": "WhatsApp consultation",
      "scroll": "Scroll",
      "cap1.title": "Samurai wave — legend of the tide",
      "cap2.title": "Magenta anime — every eye on you",
      "cap3.title": "Happy Horse — the comic rebel",
      "cap4.title": "Neon graffiti — after dark",
      "cap5.title": "Sakura — night of falling petals",
      "col.kicker": "THE COLLECTION — 05",
      "col.title": "Five full-body designs",
      "col.sub": "Final price including print and professional installation — pick one and order on WhatsApp.",
      "stat1": "Projects delivered", "stat2": "Years of craft", "stat3": "Original vinyl",
      "foot.tag": "Wrap. Drive. Turn heads.",
      "cart.title": "Your cart", "cart.empty": "Your cart is empty.", "cart.total": "Total",
      "cart.order": "Checkout on WhatsApp",
      "contact.title": "Contact Wrapmode",
      "contact.body": "Reach us on WhatsApp for consultation, exact pricing and booking.",
      "contact.cta": "Chat on WhatsApp", "contact.close": "Close",
      _add: "Add", _added: "Added ✓", _toman: "Toman", _remove: "Remove",
    },
  };

  let lang = "fa";
  try { if (localStorage.getItem("wrapmode-lang") === "en") lang = "en"; } catch (e) {}
  const t = (k) => (I18N[lang][k] !== undefined ? I18N[lang][k] : I18N.fa[k] || k);
  const faNum = (n) => n.toLocaleString(lang === "fa" ? "fa-IR" : "en-US");

  // ?nomotion — حالت تست: بدون lenis تا اسکرول برنامه‌ای دقیق باشد
  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    new URLSearchParams(location.search).has("nomotion");
  const mobileMQ = window.matchMedia("(max-width: 768px)");
  const isMobile = () => mobileMQ.matches;

  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loader-fill");
  const loaderPercent = document.getElementById("loader-percent");
  const canvas = document.getElementById("canvas");
  const canvasWrap = document.getElementById("canvas-wrap");
  const stage = document.getElementById("scrub-stage");
  const heroCopy = document.querySelector(".hero-copy");
  const scrollHint = document.getElementById("scroll-hint");
  const header = document.getElementById("site-header");
  const ctx = canvas.getContext("2d", { alpha: false });

  // ---------- اسکرول نرم ----------
  let lenis = prefersReducedMotion
    ? null
    : new Lenis({
        duration: 1.35,
        easing: (x) => Math.min(1, 1.001 - Math.pow(2, -10 * x)),
        smoothWheel: true,
        wheelMultiplier: isMobile() ? 0.55 : 0.42,
        touchMultiplier: 1.6,
      });

  // ---------- بارگذاری فریم‌ها (دوفازی) ----------
  const frames = new Array(FRAME_COUNT).fill(null);
  let loaded = 0;
  const path = (i) => `${FRAME_DIR}f_${String(i + 1).padStart(4, "0")}.webp`;

  function updateLoader() {
    const p = Math.round((loaded / FRAME_COUNT) * 100);
    loaderFill.style.width = p + "%";
    loaderPercent.textContent = faNum(p) + "٪";
  }

  function loadOne(i) {
    if (frames[i]) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { frames[i] = img; loaded++; updateLoader(); resolve(); };
      img.onerror = () => { loaded++; updateLoader(); resolve(); };
      img.src = path(i);
    });
  }

  const READY_AT = Math.min(isMobile() ? 20 : 26, FRAME_COUNT);
  let loaderHidden = false;

  async function preload() {
    const firstJobs = [];
    for (let i = 0; i < READY_AT; i++) firstJobs.push(loadOne(i));
    await Promise.all(firstJobs);
    hideLoader();
    drawFrame(GRID_HOLD);
    const batch = isMobile() ? 10 : 20;
    for (let start = READY_AT; start < FRAME_COUNT; start += batch) {
      const end = Math.min(start + batch, FRAME_COUNT);
      const jobs = [];
      for (let i = start; i < end; i++) jobs.push(loadOne(i));
      await Promise.all(jobs);
    }
  }

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    loader.classList.add("done");
  }

  // ---------- بوم ----------
  let bgTint = "#0a0810";
  function sampleBg(i) {
    const img = frames[i];
    if (!img) return;
    try {
      const c = document.createElement("canvas");
      c.width = 2; c.height = 2;
      const cx = c.getContext("2d");
      cx.drawImage(img, 0, 0, 2, 2);
      const d = cx.getImageData(1, 1, 1, 1).data;
      bgTint = `rgb(${d[0]},${d[1]},${d[2]})`;
    } catch (e) { /* ساکت */ }
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 2 : 1.75);
    const w = canvasWrap.clientWidth || window.innerWidth;
    const h = canvasWrap.clientHeight || window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }

  function nearestLoaded(i) {
    if (frames[i]) return i;
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (frames[i - d] && i - d >= 0) return i - d;
      if (frames[i + d] && i + d < FRAME_COUNT) return i + d;
    }
    return GRID_HOLD;
  }

  // زیرلایه‌ی بلور ارزان: همان فریم در بوم ۴۸×۳۲ و بزرگ‌نمایی cover
  const tiny = document.createElement("canvas");
  tiny.width = 48; tiny.height = 32;
  const tinyCtx = tiny.getContext("2d");

  function drawOne(img, zoom) {
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const cover = Math.max(cw / iw, ch / ih);
    const contain = Math.min(cw / iw, ch / ih);
    const z = zoom || 1;

    if (cw >= ch || contain >= cover * 0.985) {
      // منظره‌ی افقی (یا نزدیک به نسبت خود کلیپ): کاور تمام‌صفحه، لبه تیز
      const dw = iw * cover * z, dh = ih * cover * z;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    } else {
      // پرتره: زیرلایه‌ی محو هم‌رنگ صحنه + تصویر وسط با بزرگ‌نمایی ملایم
      // (۱.۱۵ برابرِ contain ≈ حداکثر ۷٪ برش از هر طرف — ماشین هرگز کلیپ نمی‌شود)
      tinyCtx.drawImage(img, 0, 0, 48, 32);
      const c = Math.max(cw / 48, ch / 32);
      const bw = 48 * c, bh = 32 * c;
      ctx.drawImage(tiny, (cw - bw) / 2, (ch - bh) / 2, bw, bh);
      const scale = contain * 1.15 * z;
      const dw = iw * scale, dh = ih * scale;
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }
  }

  // اسکراب خامه‌ای: بین دو فریم مجاور بلند می‌کنیم (24fps سورس → حرکت پیوسته 60fps)
  function drawFrame(fi, zoom) {
    if (!canvas.width) resizeCanvas();
    const i0 = Math.max(0, Math.min(FRAME_COUNT - 1, Math.floor(fi)));
    const i1 = Math.min(FRAME_COUNT - 1, i0 + 1);
    const f = Math.min(1, Math.max(0, fi - i0));
    const img0 = frames[i0], img1 = frames[i1];
    if (img0 && img1 && f > 0.02) {
      drawOne(img0, zoom);
      ctx.globalAlpha = f;
      drawOne(img1, zoom);
      ctx.globalAlpha = 1;
    } else if (img0) {
      drawOne(img0, zoom);
    } else {
      const r = nearestLoaded(i0);
      if (frames[r]) drawOne(frames[r], zoom);
    }
  }

  // ---------- تایم‌لاین: یک take پیوسته، ۴ فصل ----------
  // خروجی idx اعشاری است — drawFrame بین دو فریم مجاور بلند می‌کند
  function timelineAt(x) {
    if (x <= INTRO_END) return { idx: GRID_HOLD };
    const t = Math.min(1, (x - INTRO_END) / (1 - INTRO_END));
    let acc = 0;
    for (let k = 0; k < CHAPTERS.length; k++) {
      const w = CH_WEIGHTS[k];
      if (t <= acc + w || k === CHAPTERS.length - 1) {
        const local = Math.min(1, Math.max(0, (t - acc) / w));
        const c = CHAPTERS[k];
        return { idx: c.from + local * (c.to - c.from), cap: k, local };
      }
      acc += w;
    }
    return { idx: CHAPTERS[CHAPTERS.length - 1].to, cap: CHAPTERS.length - 1, local: 1 };
  }

  // ---------- کپشن‌ها ----------
  let capDrivers = [];
  let scrubLen = 1;

  function measureStage() {
    scrubLen = Math.max(1, stage.offsetHeight - window.innerHeight);
  }

  function chapterRanges() {
    const ranges = [];
    let acc = 0;
    for (const w of CH_WEIGHTS) {
      ranges.push([INTRO_END + acc * (1 - INTRO_END), INTRO_END + (acc + w) * (1 - INTRO_END)]);
      acc += w;
    }
    return ranges;
  }

  function positionCaptions() {
    measureStage();
    const ranges = chapterRanges();
    // روی موبایل کپشن کمی پایین‌تر می‌نشیند تا روی کابین ماشین نیفتد
    const drop = isMobile() ? window.innerHeight * 0.19 : 0;
    capDrivers.forEach((d, k) => {
      const [s, e] = ranges[k];
      const enter = s + (e - s) * 0.16;
      const isLast = k === CHAPTERS.length - 1;
      const leave = isLast ? 1.0 : s + (e - s) * 0.84;
      const mid = (enter + leave) / 2;
      d.el.style.top = `${mid * scrubLen + window.innerHeight / 2 + drop}px`;
      d.enter = enter;
      d.leave = leave;
    });
  }

  function setupCaptions() {
    capDrivers = [...stage.querySelectorAll(".cap")].map((el) => {
      const kids = el.querySelectorAll(".cap-kicker, .cap-title");
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(kids, { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power2.out" });
      return { el, tl, enter: 0, leave: 1 };
    });
    positionCaptions();
  }

  function syncCaptions(x) {
    capDrivers.forEach((d) => {
      const span = Math.max(d.leave - d.enter, 0.001);
      if (x >= d.enter && x <= d.leave) {
        d.el.classList.add("is-in");
        const p = Math.min(1, (x - d.enter) / span);
        d.tl.progress(Math.min(1, p * 4));
        // دریفت مویی با پیشروی فصل — کپشن مثل تایتل‌کارت فیلم آرام بالا می‌رود
        d.el.style.setProperty("--drift", `${((0.5 - p) * 26).toFixed(1)}px`);
      } else if (x < d.enter) {
        d.el.classList.remove("is-in");
        d.tl.progress(0);
        d.el.style.setProperty("--drift", "13px");
      } else {
        d.el.classList.remove("is-in");
        d.tl.progress(Math.max(0, 1 - (x - d.leave) / 0.012));
        d.el.style.setProperty("--drift", "-13px");
      }
    });
  }

  // ---------- هیرو / هدر ----------
  function syncHero(x) {
    const fade = Math.max(0, 1 - x * 18);
    heroCopy.style.opacity = String(fade);
    heroCopy.style.pointerEvents = fade < 0.2 ? "none" : "";
    heroCopy.querySelectorAll(".btn").forEach((b) => { b.style.pointerEvents = fade < 0.2 ? "none" : "auto"; });
    scrollHint.style.opacity = String(fade);
    header.classList.toggle("scrolled", window.scrollY > 40);
  }

  // ---------- حلقه‌ی رندر ----------
  let targetQ = 0;
  let smoothQ = 0;
  const decodeSet = new WeakSet();

  function prefetchAround(idx) {
    for (let k = -10; k <= 14; k++) {
      const j = idx + k;
      if (j < 0 || j >= FRAME_COUNT) continue;
      const img = frames[j];
      if (img && !decodeSet.has(img) && img.decode) {
        decodeSet.add(img);
        img.decode().catch(() => {});
      }
    }
  }

  const progressEl = document.getElementById("progress");

  function render() {
    const { idx } = timelineAt(smoothQ);
    // زوم ریز سرعت‌محور: اسکرول تند = فریم کمی بزرگ‌تر (کشش)؛ توقف = آرام برمی‌گردد
    const vel = Math.abs(targetQ - smoothQ);
    const zoom = 1 + Math.min(vel * 1.1, 0.035);
    sampleBg(Math.round(idx) % 20 === 0 ? Math.round(idx) : -1);
    drawFrame(idx, zoom);
    // پرده‌ی تیره‌ی هیرو: فریم گرید عقب می‌نشیند تا کپی بخواند؛ با شروع اسکرول کنار می‌رود
    const veil = 0.44 * Math.max(0, 1 - smoothQ / (INTRO_END * 0.85));
    if (veil > 0.005) {
      ctx.fillStyle = `rgba(5,4,8,${veil.toFixed(3)})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    prefetchAround(Math.round(idx));
  }

  function syncProgress() {
    if (!progressEl) return;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progressEl.style.transform = `scaleX(${Math.min(1, window.scrollY / max).toFixed(4)})`;
  }

  let lastP = -1;
  let lastStepAt = 0;

  function startRenderLoop() {
    gsap.ticker.lagSmoothing(0);
    const step = (timeMs) => {
      lastStepAt = performance.now();
      if (lenis) {
        try { lenis.raf(timeMs); }
        catch (e) { lenis = null; }
      }
      const x = Math.min(1, Math.max(0, window.scrollY / scrubLen));
      syncProgress();
      if (Math.abs(x - lastP) > 0.000004) {
        lastP = x;
        try {
          syncHero(x);
          syncCaptions(x);
          targetQ = x;
        } catch (e) { /* هیچ‌وقت رندر را نکشد */ }
      }
      const ease = isMobile() ? 0.22 : 0.16;
      const d = targetQ - smoothQ;
      if (Math.abs(d) > 0.00004) {
        smoothQ += d * ease;
        try { render(); } catch (e) {}
      }
    };
    gsap.ticker.add((time) => { step(time * 1000); });
    // فال‌بک زمان‌محور برای وب‌ویوهای کند
    setInterval(() => {
      if (performance.now() - lastStepAt > 100) step(performance.now());
    }, 33);
  }

  // ---------- شمارنده‌ها ----------
  function initCounters() {
    const stats = document.getElementById("stats");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        stats.querySelectorAll(".stat-number").forEach((el) => {
          const target = parseFloat(el.dataset.value);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: 2, ease: "power1.out",
            onUpdate: () => { el.textContent = faNum(Math.round(obj.v)); },
            onComplete: () => { el.dataset.done = "1"; },
          });
        });
      });
    }, { threshold: 0.4 });
    io.observe(stats);
  }

  // ---------- ریویل اسکرولی کالکشن ----------
  let revealIO = null;
  function initReveals() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;
    if (revealIO) revealIO.disconnect();
    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting || en.target.dataset.revealed) return;
        en.target.dataset.revealed = "1";
        revealIO.unobserve(en.target);
        gsap.to(en.target, {
          opacity: 1, y: 0,
          duration: 0.65,
          delay: (parseFloat(en.target.dataset.revIdx) || 0) * 0.09,
          ease: "power2.out",
          clearProps: "transform",
        });
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    const targets = [
      ...document.querySelectorAll("#collection .col-head, #collection .stat"),
      ...document.querySelectorAll("#cards .card"),
    ];
    targets.forEach((el, i) => {
      delete el.dataset.revealed;
      gsap.set(el, { opacity: 0, y: 26 });
      el.dataset.revIdx = String(el.classList.contains("card") ? i % 4 : 0);
      revealIO.observe(el);
    });
  }

  // ---------- کالکشن ----------
  function renderCards() {
    const wrap = document.getElementById("cards");
    wrap.innerHTML = "";
    DESIGNS.forEach((d, i) => {
      const card = document.createElement("article");
      card.className = "card";
      const media = document.createElement("div");
      media.className = "card-media";
      const img = document.createElement("img");
      img.src = d.img;
      img.alt = lang === "fa" ? d.fa : d.en;
      img.loading = "lazy";
      media.appendChild(img);
      const body = document.createElement("div");
      body.className = "card-body";
      const en = document.createElement("span");
      en.className = "card-name-en";
      en.dir = "ltr";
      en.textContent = `DESIGN 0${i + 1} — ${d.en}`;
      const name = document.createElement("h3");
      name.className = "card-name";
      name.textContent = lang === "fa" ? d.fa : d.en;
      const desc = document.createElement("p");
      desc.className = "card-desc";
      desc.textContent = lang === "fa" ? d.descFa : d.descEn;
      const foot = document.createElement("div");
      foot.className = "card-foot";
      const price = document.createElement("div");
      price.className = "card-price";
      const strong = document.createElement("strong");
      strong.textContent = faNum(d.price);
      const unit = document.createElement("span");
      unit.textContent = t("_toman");
      price.append(strong, unit);
      const add = document.createElement("button");
      add.type = "button";
      add.className = "card-add";
      add.dataset.design = String(i);
      add.textContent = t("_add");
      add.addEventListener("click", () => addToCart(add, i));
      foot.append(price, add);
      body.append(en, name, desc, foot);
      card.append(media, body);
      wrap.appendChild(card);
    });
    initReveals();
  }

  // ---------- سبد خرید ----------
  const cartState = (() => {
    try { return JSON.parse(localStorage.getItem("wrapmode-cart") || "[]"); }
    catch (e) { return []; }
  })();
  const cartDrawer = document.getElementById("cart-drawer");
  const cartItemsEl = document.getElementById("cart-items");
  const cartEmptyEl = document.getElementById("cart-empty");
  const cartBadge = document.getElementById("cart-badge");
  const cartTotalEl = document.getElementById("cart-total-value");
  const cartOrderBtn = document.getElementById("cart-order-btn");

  function saveCart() {
    try { localStorage.setItem("wrapmode-cart", JSON.stringify(cartState)); } catch (e) {}
  }

  function renderCart() {
    cartItemsEl.innerHTML = "";
    const count = cartState.reduce((s, it) => s + it.qty, 0);
    cartBadge.hidden = count === 0;
    cartBadge.textContent = faNum(count);
    cartEmptyEl.style.display = cartState.length ? "none" : "block";

    cartState.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      const info = document.createElement("div");
      info.className = "cart-item-info";
      const d = DESIGNS[item.car];
      const name = document.createElement("span");
      name.className = "cart-item-name";
      name.textContent = `${lang === "fa" ? d.fa : d.en} × ${faNum(item.qty)}`;
      const price = document.createElement("span");
      price.className = "cart-item-price";
      price.textContent = `${faNum(d.price * item.qty)} ${t("_toman")}`;
      info.append(name, price);
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "cart-item-remove";
      rm.textContent = t("_remove");
      rm.setAttribute("aria-label", t("_remove"));
      rm.addEventListener("click", () => { cartState.splice(idx, 1); saveCart(); renderCart(); });
      li.append(info, rm);
      cartItemsEl.append(li);
    });

    const total = cartState.reduce((s, it) => s + DESIGNS[it.car].price * it.qty, 0);
    cartTotalEl.textContent = `${faNum(total)} ${t("_toman")}`;

    // پیام واتساپ همیشه فارسی می‌ماند (گیرنده‌ی فروشگاه)
    const lines = cartState.map((it) => {
      const d = DESIGNS[it.car];
      return `• ${d.fa} × ${it.qty.toLocaleString("fa-IR")} — ${(d.price * it.qty).toLocaleString("fa-IR")} تومان`;
    });
    const totalFa = total.toLocaleString("fa-IR");
    const msg = lines.length
      ? `سلام، سفارش از سایت ورپ‌مود:\n${lines.join("\n")}\nجمع: ${totalFa} تومان`
      : "سلام، می‌خواهم درباره رپ خودرو مشاوره بگیرم.";
    cartOrderBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  }

  function addToCart(btn, car) {
    const existing = cartState.find((it) => it.car === car);
    if (existing) existing.qty += 1;
    else cartState.push({ car, qty: 1 });
    saveCart();
    renderCart();
    btn.textContent = t("_added");
    btn.classList.add("added");
    setTimeout(() => {
      btn.textContent = t("_add");
      btn.classList.remove("added");
    }, 1600);
  }

  function openCart() {
    cartDrawer.hidden = false;
    requestAnimationFrame(() => cartDrawer.classList.add("open"));
    if (lenis) lenis.stop();
  }
  function closeCart() {
    cartDrawer.classList.remove("open");
    if (lenis) lenis.start();
    setTimeout(() => { cartDrawer.hidden = true; }, 380);
  }

  function initCart() {
    document.getElementById("cart-open-btn").addEventListener("click", openCart);
    document.getElementById("cart-close-btn").addEventListener("click", closeCart);
    document.getElementById("cart-backdrop").addEventListener("click", closeCart);
  }

  // ---------- تماس ----------
  function initContact() {
    const modal = document.getElementById("contact-modal");
    const openBtn = document.getElementById("nav-contact-btn");
    const closeBtn = document.getElementById("contact-close-btn");
    const waBtn = document.getElementById("contact-whatsapp-btn");
    const heroWa = document.getElementById("hero-wa-btn");
    const waFloat = document.getElementById("wa-float");
    const footWa = document.getElementById("foot-wa");
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("سلام، از سایت ورپ‌مود پیام می‌دهم.")}`;
    if (waBtn) waBtn.href = waUrl;
    if (heroWa) heroWa.href = waUrl;
    if (waFloat) waFloat.href = waUrl;
    if (footWa) footWa.href = waUrl;
    if (openBtn) openBtn.addEventListener("click", (e) => { e.preventDefault(); modal.hidden = false; });
    if (closeBtn) closeBtn.addEventListener("click", () => { modal.hidden = true; });
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
  }

  // ---------- زبان ----------
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      if (v) el.textContent = v;
    });
    document.getElementById("lang-toggle").textContent = lang === "fa" ? "EN" : "فا";
    if (progressEl) progressEl.style.transformOrigin = lang === "fa" ? "right" : "left";
    document.title = lang === "fa" ? "WRAPMODE — استودیو رپ خودرو" : "WRAPMODE — Car Wrap Studio";
    document.querySelectorAll(".stat-number").forEach((el) => {
      if (el.dataset.done) el.textContent = faNum(parseFloat(el.dataset.value));
    });
    renderCards();
    renderCart();
  }

  function initLang() {
    document.getElementById("lang-toggle").addEventListener("click", () => {
      lang = lang === "fa" ? "en" : "fa";
      try { localStorage.setItem("wrapmode-lang", lang); } catch (e) {}
      applyLang();
    });
  }

  // ---------- ناوبری ----------
  function initNavScroll() {
    document.querySelectorAll('a[href="#collection"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const el = document.getElementById("collection");
        if (lenis) lenis.scrollTo(el, { duration: 1.4, offset: -8 });
        else el.scrollIntoView({ behavior: "smooth" });
      });
    });
    document.querySelectorAll('a[href="#top"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  // ---------- کرسر سفارشی ----------
  function initCursor() {
    if (prefersReducedMotion || !window.matchMedia("(pointer: fine)").matches) return;
    const dot = document.getElementById("cursor");
    let mx = -100, my = -100, cx = -100, cy = -100, seen = false;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; cx = mx; cy = my; dot.style.opacity = "1"; }
    });
    document.addEventListener("mouseover", (e) => {
      const hot = e.target.closest("a, button");
      dot.style.transform = `translate(-50%, -50%) scale(${hot ? 2.4 : 1})`;
      dot.style.transition = "transform 0.18s ease";
    });
    gsap.ticker.add(() => {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      dot.style.left = cx + "px";
      dot.style.top = cy + "px";
    });
  }

  // ---------- راه‌اندازی ----------
  function boot() {
    applyLang();
    resizeCanvas();
    window.addEventListener("resize", () => {
      resizeCanvas();
      positionCaptions();
      render();
    });
    setupCaptions();
    initCounters();
    startRenderLoop();
    initNavScroll();
    initCart();
    initContact();
    initLang();
    initCursor();
    preload();
    sampleBg(GRID_HOLD);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
