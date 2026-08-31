/* WRAPMODE — تک‌کلیپ اسکرولی (۸ طرح، سرعت یکنواخت) */
(() => {
  "use strict";

  // ---------- پیکربندی ----------
  const FRAME_DIR = "frames1/";
  const FRAME_COUNT = 305;

  const DESIGNS = [
    { label: "فول‌بادی — آنیمه ساکورا (سفید)", price: 38000000 },
    { label: "فول‌بادی — آنیمه شب (مشکی)", price: 42000000 },
    { label: "فول‌بادی — گرافیتی خیابانی آبی", price: 32000000 },
    { label: "فول‌بادی — لیوری ریسینگ نارنجی", price: 28000000 },
    { label: "فول‌بادی — آرت کارتون قرمز", price: 26000000 },
    { label: "فول‌بادی — آرت کارتون سفید", price: 25000000 },
    { label: "فول‌بادی — استریپ ریسینگ سفید/نارنجی", price: 24000000 },
    { label: "فول‌بادی — لیوری طوسی/طلایی (پرچم‌دار)", price: 45000000 },
  ];

  // سگمنت‌های پایدار هر طرح (بازه‌ی بدون دیپِ کراس‌فید) — ایندکس صفرِ مبنا
  const SEGMENTS = [
    { from: 0,   hold: 31  }, // ۱ ساکورا سفید
    { from: 40,  hold: 66  }, // ۲ آنیمه شب
    { from: 76,  hold: 103 }, // ۳ گرافیتی آبی
    { from: 113, hold: 139 }, // ۴ ریسینگ نارنجی
    { from: 149, hold: 175 }, // ۵ کارتون قرمز
    { from: 185, hold: 211 }, // ۶ کارتون سفید
    { from: 221, hold: 264 }, // ۷ استریپ
    { from: 274, hold: 304 }, // ۸ پرچم‌دار
  ];
  const INTRO_END = 0.03;   // سهم کارت معرفی
  const HOLD_FRAC = 0.38;   // سهم توقف روی فریم آخر + کارت از هر سگمنت
  const BLEND_FRAC = 0.10;  // محوی ورود به اسکراب هر طرح
  // فریم‌های ۴۰ تا ۲۱۲ در سورس لترباکس ۷۲۰×۴۰۴ دارند (طرح‌های ۲ تا ۶) → پر کردن بالا/پایین با آینه‌ی تیز
  const BAND = { lo: 40, hi: 212, y0: 436, y1: 840 };

  function timelineAt(t) {
    const n = SEGMENTS.length;
    const span = 1 / n;
    if (t <= 0) return { idx: 0, blend: 0, blendIdx: 0 };
    const k = Math.min(n - 1, Math.floor(t / span));
    const local = (t - k * span) / span;
    const seg = SEGMENTS[k];
    const scrubEnd = 1 - HOLD_FRAC;
    if (local < scrubEnd) {
      const q = local / scrubEnd;
      const idx = Math.round(seg.from + q * (seg.hold - seg.from));
      let blend = 0, blendIdx = 0;
      if (k > 0 && local < BLEND_FRAC) {
        blend = 1 - local / BLEND_FRAC;
        blendIdx = SEGMENTS[k - 1].hold;
      }
      return { idx, blend, blendIdx };
    }
    return { idx: seg.hold, blend: 0, blendIdx: 0 }; // توقف روی فریم آخر + کارت
  }

  const WA_NUMBER = "989304140872";
  // ?nomotion — حالت تست: بدون lenis تا اسکرول برنامه‌ای دقیق باشد
  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    new URLSearchParams(location.search).has("nomotion");
  const mobileMQ = window.matchMedia("(max-width: 768px)");
  const isMobile = () => mobileMQ.matches;

  const loader = document.getElementById("loader");
  const loaderPercent = document.getElementById("loader-percent");
  const canvas = document.getElementById("canvas");
  const canvasWrap = document.getElementById("canvas-wrap");
  const scrollContainer = document.getElementById("scroll-container");
  const heroSection = document.querySelector(".hero-standalone");
  const overlay = document.getElementById("dark-overlay");
  const ctx = canvas.getContext("2d", { alpha: false });

  const faNum = (n) => n.toLocaleString("fa-IR");

  // ---------- اسکرول نرم ----------
  let lenis = prefersReducedMotion
    ? null
    : new Lenis({
        duration: 1.35,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
    // فاز ۱: شروع کلیپ برای اولین رنگ
    const firstJobs = [];
    for (let i = 0; i < READY_AT; i++) firstJobs.push(loadOne(i));
    await Promise.all(firstJobs);

    hideLoader();
    drawFrame(0);

    // فاز ۲: بقیه دسته‌ای
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
    return 0;
  }

  function drawImageCover(i) {
    const resolved = frames[i] ? i : nearestLoaded(i);
    const img = frames[resolved];
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;

    // سگمنت لترباکس: باند اصلی تمام‌پهنا (کمی بالاتر از مرکز تا جا برای کارت باشد)
    // + بالا/پایین با بازتاب تیز خود صحنه و محو نرم (بدون بلور، بدون نوار سیاه)
    if (resolved >= BAND.lo && resolved <= BAND.hi) {
      const bh = BAND.y1 - BAND.y0;
      const s = cw / iw;
      const dh = bh * s;
      const y0 = Math.round((ch - dh) * 0.4);
      ctx.drawImage(img, 0, BAND.y0, iw, bh, 0, y0, cw, dh);
      drawMirror(resolved, img, -1, y0, y0, cw);
      drawMirror(resolved, img, 1, y0 + dh, ch - y0 - dh, cw);
      return;
    }

    // کاور واقعی: پر شدن کامل از هر ۴ طرف با لبه‌ی تیز
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // بازتاب تیز از لبه‌ی باند به بیرون؛ بالا فقط نوار پس‌زمینه (تا ماشین وارونه دیده نشود)،
  // پایین فقط ناحیه‌ی کف (مثل انعکاس زیر ماشین) — باقیمانده با محو نرمِ رنگ لبه پر می‌شود
  const mirrorEdgeCache = new Map();

  function drawMirror(idx, img, dir, seamY, avail, cw) {
    if (avail <= 1) return;
    const bh = BAND.y1 - BAND.y0;
    const iw = img.naturalWidth || img.width;
    const s = cw / iw;
    const maxSrc = Math.round(bh * (dir < 0 ? 0.19 : 0.32));
    const srcH = Math.min(maxSrc, Math.ceil(avail / s));
    const H = srcH * s;
    const sy = dir < 0 ? BAND.y0 : BAND.y1 - srcH;
    ctx.save();
    ctx.translate(0, dir < 0 ? seamY : seamY + H);
    ctx.scale(1, -1);
    ctx.drawImage(img, 0, sy, iw, srcH, 0, 0, cw, H);
    ctx.restore();

    const drawn = Math.min(H, avail);
    if (drawn >= avail - 1) return;
    // محو نرم از رنگ ردیف انتهایی بازتاب به تیره‌تر — ادامه‌ی طبیعی فضا
    const key = idx + ":" + dir;
    let rgb = mirrorEdgeCache.get(key);
    if (!rgb) {
      try {
        const t = document.createElement("canvas");
        t.width = 1; t.height = 1;
        const tcx = t.getContext("2d");
        tcx.drawImage(img, 0, dir < 0 ? BAND.y0 + srcH : sy, iw, 1, 0, 0, 1, 1);
        rgb = [...tcx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      } catch (e) { rgb = [10, 8, 16]; }
      mirrorEdgeCache.set(key, rgb);
    }
    const g0 = ctx.createLinearGradient(0, dir < 0 ? seamY - drawn : seamY + drawn, 0, dir < 0 ? seamY - avail : seamY + avail);
    g0.addColorStop(0, `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
    g0.addColorStop(1, `rgb(${(rgb[0] * 0.3) | 0},${(rgb[1] * 0.3) | 0},${(rgb[2] * 0.3) | 0})`);
    ctx.fillStyle = g0;
    ctx.fillRect(0, dir < 0 ? seamY - avail : seamY + drawn, cw, avail - drawn);
  }

  function drawFrame(i, blendIdx, blend) {
    if (!canvas.width) resizeCanvas();
    ctx.fillStyle = bgTint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawImageCover(i);
    if (blend > 0.01) {
      ctx.globalAlpha = blend;
      drawImageCover(blendIdx);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- هموارسازی فریم (رندر پیوسته) ----------
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

  function render() {
    const { idx, blend, blendIdx } = timelineAt(smoothQ); // اسکراب یکنواخت → توقف روی فریم آخر
    sampleBg(idx % 20 === 0 ? idx : -1);
    drawFrame(idx, blendIdx, blend);
    prefetchAround(idx);
  }

  let lastP = -1;

  let lastStepAt = 0;

  function startRenderLoop() {
    gsap.ticker.lagSmoothing(0);
    const step = (timeMs) => {
      lastStepAt = performance.now();
      if (lenis) {
        try { lenis.raf(timeMs); }
        catch (e) { lenis = null; } // یک خطای lenis نباید کل رندر را بکشد
      }
      const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / maxS));
      if (Math.abs(p - lastP) > 0.000004) {
        lastP = p;
        try {
          syncHero(p);
          syncOverlay();
          syncSections(p);
          syncCounters(p);
          targetQ = Math.min(1, Math.max(0, (p - INTRO_END) / (1 - INTRO_END)));
        } catch (e) { /* سکشن‌ها هرگز نباید رندر را متوقف کنند */ }
      }
      const ease = isMobile() ? 0.22 : 0.16;
      const d = targetQ - smoothQ;
      if (Math.abs(d) > 0.00004) {
        smoothQ += d * ease;
        try { render(); } catch (e) {}
      }
    };
    gsap.ticker.add((time) => { step(time * 1000); });
    // اگر rAF کند یا متوقف شود (وب‌ویو throttled)، تیک جایگزین زمان‌محور خودش قدم می‌زند
    setInterval(() => {
      if (performance.now() - lastStepAt > 100) step(performance.now());
    }, 33);
  }

  // ---------- سکشن‌ها ----------
  function positionSections() {
    // هدف: وقتی p = وسط زون است، مرکز سکشن دقیقاً وسط ویوپورت باشد
    const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const cTop = scrollContainer.offsetTop;
    document.querySelectorAll(".scroll-section").forEach((section) => {
      const mid = (parseFloat(section.dataset.enter) + parseFloat(section.dataset.leave)) / 200;
      section.style.top = `${mid * maxS + window.innerHeight / 2 - cTop}px`;
    });
  }

  function setupSectionDrivers() {
    window._sectionDrivers = [];
    document.querySelectorAll(".scroll-section").forEach((section) => {
      const persist = section.dataset.persist === "true";
      const enter = parseFloat(section.dataset.enter) / 100;
      const leave = parseFloat(section.dataset.leave) / 100;
      const children = section.querySelectorAll(
        ".section-label, .section-heading, .section-body, .spec-list li, .price-row, .cta-row, .scroll-hint, .stat"
      );

      gsap.set(children, { clearProps: "all" });
      const tl = gsap.timeline({ paused: true });
      // کارت کاملاً ثابت می‌ماند — فقط محو شدن، بدون حرکت
      tl.fromTo(
        children,
        { opacity: 0 },
        { opacity: 1, stagger: 0.06, duration: 0.4, ease: "power1.out" }
      );

      window._sectionDrivers.push({ section, enter, leave, persist, tl, maxSeen: 0 });
    });
  }

  function syncSections(p) {
    window._sectionDrivers.forEach((d) => {
      const span = Math.max(d.leave - d.enter, 0.001);
      let local = (p - d.enter) / span;
      if (local < 0) local = 0;
      if (local > 1) local = 1;

      if (d.persist) {
        d.maxSeen = Math.max(d.maxSeen, local);
        d.tl.progress(d.maxSeen);
        if (d.maxSeen > 0.02) d.section.classList.add("is-in");
      } else if (p >= d.enter && p <= d.leave) {
        d.section.classList.add("is-in");
        d.tl.progress(Math.min(1, local * 4)); // سریع ظاهر می‌شود و تا آخر زون کاملاً ثابت می‌ماند
      } else if (p < d.enter) {
        d.section.classList.remove("is-in");
        d.tl.progress(0);
      } else {
        d.section.classList.remove("is-in");
        d.tl.progress(Math.max(0, 1 - (p - d.leave) / 0.008));
      }
    });
  }

  // ---------- شمارنده‌ها ----------
  function setupCounters() {
    document.querySelectorAll(".stat-number").forEach((el) => {
      const target = parseFloat(el.dataset.value);
      const dec = parseInt(el.dataset.decimals || "0", 10);
      const obj = { v: 0 };
      const fmt = (v) => faNum(dec ? v.toFixed(dec) : Math.round(v));
      el.textContent = fmt(0);
      const driver = { el, obj, target, fmt, played: false };
      el._counter = driver;
    });
  }

  function syncCounters(p) {
    document.querySelectorAll(".stat-number").forEach((el) => {
      const c = el._counter;
      if (!c) return;
      if (p > 0.93 && !c.played) {
        c.played = true;
        gsap.to(c.obj, {
          v: c.target,
          duration: 2,
          ease: "power1.out",
          onUpdate: () => { c.el.textContent = c.fmt(c.obj.v); },
        });
      }
    });
  }

  // ---------- هیرو / اورلی ----------
  function syncHero(p) {
    const heroFade = Math.max(0, 1 - p * 33); // تا شروع اسکرولِ طرح ۱ محو می‌شود
    heroSection.style.opacity = String(heroFade);
    heroSection.style.pointerEvents = p > 0.04 ? "none" : "auto";
    canvasWrap.style.opacity = "1";
  }

  function syncOverlay() { overlay.style.opacity = "0"; }

  // ---------- ناوبری ----------
  function initNavScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href").slice(1);
        if (!id || id === "top" || link.target === "_blank") return;
        if (link.id === "nav-contact-btn") return;
        e.preventDefault();
        const target = document.getElementById(id);
        if (!target) return;
        const enter = parseFloat(target.dataset.enter || "0") / 100;
        const leave = parseFloat(target.dataset.leave || "100") / 100;
        const pr = enter + (leave - enter) * 0.28;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (lenis) lenis.scrollTo(pr * maxScroll, { duration: 1.2 });
        else window.scrollTo({ top: pr * maxScroll, behavior: "smooth" });
      });
    });
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
      const name = document.createElement("span");
      name.className = "cart-item-name";
      name.textContent = `${DESIGNS[item.car].label} × ${faNum(item.qty)}`;
      const price = document.createElement("span");
      price.className = "cart-item-price";
      price.textContent = faNum(DESIGNS[item.car].price * item.qty) + " تومان";
      info.append(name, price);
      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "cart-item-remove";
      rm.textContent = "حذف";
      rm.setAttribute("aria-label", "حذف از سبد");
      rm.addEventListener("click", () => { cartState.splice(idx, 1); saveCart(); renderCart(); });
      li.append(info, rm);
      cartItemsEl.append(li);
    });

    const total = cartState.reduce((s, it) => s + DESIGNS[it.car].price * it.qty, 0);
    cartTotalEl.textContent = faNum(total) + " تومان";

    const lines = cartState.map((it) =>
      `• ${DESIGNS[it.car].label} × ${faNum(it.qty)} — ${faNum(DESIGNS[it.car].price * it.qty)} تومان`
    );
    const msg = lines.length
      ? `سلام، سفارش از سایت ورپ‌مود:\n${lines.join("\n")}\nجمع: ${faNum(total)} تومان`
      : "سلام، می‌خواهم درباره رپ خودرو مشاوره بگیرم.";
    cartOrderBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
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
    document.getElementById("final-cart-btn").addEventListener("click", openCart);

    document.querySelectorAll(".add-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const car = parseInt(btn.dataset.design, 10);
        const existing = cartState.find((it) => it.car === car);
        if (existing) existing.qty += 1;
        else cartState.push({ car, qty: 1 });
        saveCart();
        renderCart();
        const original = btn.textContent;
        btn.textContent = "به سبد اضافه شد ✓";
        btn.classList.add("added");
        setTimeout(() => { btn.textContent = original; btn.classList.remove("added"); }, 1600);
      });
    });
    renderCart();
  }

  // ---------- تماس ----------
  function initContact() {
    const modal = document.getElementById("contact-modal");
    const openBtn = document.getElementById("nav-contact-btn");
    const closeBtn = document.getElementById("contact-close-btn");
    const waBtn = document.getElementById("contact-whatsapp-btn");
    const heroWa = document.getElementById("hero-wa-btn");
    const waFloat = document.getElementById("wa-float");
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("سلام، از سایت ورپ‌مود پیام می‌دهم.")}`;
    if (waBtn) waBtn.href = waUrl;
    if (heroWa) heroWa.href = waUrl;
    if (waFloat) waFloat.href = waUrl;
    if (openBtn) openBtn.addEventListener("click", (e) => { e.preventDefault(); modal.hidden = false; });
    if (closeBtn) closeBtn.addEventListener("click", () => { modal.hidden = true; });
    if (modal) modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
  }

  // ---------- راه‌اندازی ----------
  function boot() {
    resizeCanvas();
    window.addEventListener("resize", () => {
      resizeCanvas();
      positionSections();
      render();
    });
    setupSectionDrivers();
    setupCounters();
    positionSections();
    startRenderLoop();
    initNavScroll();
    initCart();
    initContact();
    preload();
    sampleBg(0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
