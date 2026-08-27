/* WRAPMODE — scroll studio (مدل enzo.dev) */
(() => {
  "use strict";

  // ---------- پیکربندی ----------
  const CARS = [
    { dir: "frames6/car1/", count: 51, fit: "cover", label: "رپ کامل بدنه — نسخه ۰۱", price: 48500000 },
    { dir: "frames7/car2/", count: 106, fit: "cover", label: "رپ کامل بدنه — نسخه ۰۲", price: 52000000 },
    { dir: "frames5/car3/", count: 151, label: "رپ کامل بدنه — نسخه ۰۳", price: 45000000 },
    { dir: "frames5/car4/", count: 151, label: "رپ کامل بدنه — نسخه ۰۴", price: 60000000 },
  ];
  const TOTAL_FRAMES = CARS.reduce((s, c) => s + c.count, 0);

  const INTRO_END = 0.03;      // سهم هیرو
  const TIMELINE_END = 0.97;   // پایان بلوک ماشین چهارم
  const FRAME_PART = 0.70;     // سهم چرخش فریم‌ها در هر بلوک (باقی: نگه‌داشتن + کارت)
  const XF_LOCAL = 0.068;      // پهنای کراس‌فید (واحد محلی بلوک)

  const WA_NUMBER = "989304140872";
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  const frames = CARS.map((c) => new Array(c.count).fill(null));
  let loaded = 0;
  const path = (car, i) => `${CARS[car].dir}f_${String(i + 1).padStart(4, "0")}.webp`;

  function updateLoader() {
    const p = Math.round((loaded / TOTAL_FRAMES) * 100);
    loaderPercent.textContent = faNum(p) + "٪";
  }

  function loadOne(car, i) {
    if (frames[car][i]) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { frames[car][i] = img; loaded++; updateLoader(); resolve(); };
      img.onerror = () => { loaded++; updateLoader(); resolve(); };
      img.src = path(car, i);
    });
  }

  const READY_AT = Math.min(isMobile() ? 18 : 24, CARS[0].count);
  let loaderHidden = false;

  async function preload() {
    // فاز ۱: اول کار اول + شروع بقیه ماشین‌ها
    const firstJobs = [];
    for (let i = 0; i < READY_AT; i++) firstJobs.push(loadOne(0, i));
    for (let c = 1; c < CARS.length; c++)
      for (let i = 0; i < 8; i++) firstJobs.push(loadOne(c, i));
    await Promise.all(firstJobs);

    hideLoader();
    drawFrame(0, 0, null, 0, 0, 0, 0); // اولین رنگ

    // فاز ۲: بقیه به‌صورت دسته‌ای موازی بین ماشین‌ها
    const batch = isMobile() ? 8 : 16;
    const maxCount = Math.max(...CARS.map((c) => c.count));
    for (let start = READY_AT; start < maxCount; start += batch) {
      const jobs = [];
      const end = Math.min(start + batch, maxCount);
      for (let c = 0; c < CARS.length; c++)
        for (let i = start; i < end && i < CARS[c].count; i++) jobs.push(loadOne(c, i));
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
  function sampleBg(car, i) {
    const img = frames[car][i];
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
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile() ? 1.75 : 1.5);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }

  function nearestLoaded(car, i) {
    if (frames[car][i]) return i;
    const count = CARS[car].count;
    for (let d = 1; d < count; d++) {
      if (frames[car][i - d] && i - d >= 0) return i - d;
      if (frames[car][i + d] && i + d < count) return i + d;
    }
    return 0;
  }

  function drawImageCover(car, i, alpha, sx, sy) {
    const resolved = frames[car][i] ? i : nearestLoaded(car, i);
    const img = frames[car][resolved];
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const pad = isMobile() ? 0.9 : 0.92;
    const isCover = CARS[car].fit === "cover";
    // cover: فریم کل صفحه را می‌پوشاند (برش اضافی) — contain: کل فریم داخل صفحه
    const scale = isCover
      ? Math.max(cw / iw, ch / ih)
      : Math.min(cw / iw, ch / ih) * pad;
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2 + sx * cw;
    const dy = (ch - dh) / 2 + sy * ch;
    if (alpha < 1) ctx.globalAlpha = alpha;
    if (!isCover) {
      // پرکردن تمام‌صفحه: نسخه‌ی بسیار کوچک فریم → بزرگ‌شده = پس‌زمینه‌ی نرم همرنگ
      const b = bgBlur(img);
      ctx.drawImage(b, -cw * 0.04, -ch * 0.04, cw * 1.08, ch * 1.08);
      drawContainSoft(img, dx, dy, dw, dh, 1);
    } else {
      ctx.drawImage(img, dx, dy, dw, dh);
    }
    if (alpha < 1) ctx.globalAlpha = 1;
  }

  const bgCanvas = document.createElement("canvas");
  bgCanvas.width = 20; bgCanvas.height = 36;
  const bgCtx = bgCanvas.getContext("2d");
  function bgBlur(img) {
    try {
      bgCtx.drawImage(img, 0, 0, 20, 36);
    } catch (e) { /* ساکت */ }
    return bgCanvas;
  }

  function drawFrame(car, i, nextCar, nextI, mix, sx, sy) {
    if (!canvas.width) resizeCanvas();
    ctx.fillStyle = bgTint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawImageCover(car, i, 1, sx, sy);
    if (nextCar !== null && mix > 0) drawImageCover(nextCar, nextI, mix, sx, sy);
  }

  // بافر و ماسک آلفا برای محوشدن لبه‌های فریم‌های contain در پس‌زمینه‌ی پرشده
  const edgeCanvas = document.createElement("canvas");
  const edgeCtx = edgeCanvas.getContext("2d");
  const maskCanvas = document.createElement("canvas");
  const maskCtx = maskCanvas.getContext("2d");
  function buildMask(w, h) {
    if (maskCanvas.width === w && maskCanvas.height === h) return;
    maskCanvas.width = w; maskCanvas.height = h;
    maskCtx.clearRect(0, 0, w, h);
    const fx = Math.max(24, w * 0.10), fy = Math.max(24, h * 0.10);
    const gx = maskCtx.createLinearGradient(0, 0, w, 0);
    gx.addColorStop(0, "rgba(0,0,0,0)");
    gx.addColorStop(fx / w, "rgba(0,0,0,1)");
    gx.addColorStop(1 - fx / w, "rgba(0,0,0,1)");
    gx.addColorStop(1, "rgba(0,0,0,0)");
    maskCtx.fillStyle = gx; maskCtx.fillRect(0, 0, w, h);
    maskCtx.globalCompositeOperation = "destination-in";
    const gy = maskCtx.createLinearGradient(0, 0, 0, h);
    gy.addColorStop(0, "rgba(0,0,0,0)");
    gy.addColorStop(fy / h, "rgba(0,0,0,1)");
    gy.addColorStop(1 - fy / h, "rgba(0,0,0,1)");
    gy.addColorStop(1, "rgba(0,0,0,0)");
    maskCtx.fillStyle = gy; maskCtx.fillRect(0, 0, w, h);
    maskCtx.globalCompositeOperation = "source-over";
  }

  function drawContainSoft(img, dx, dy, dw, dh, alpha) {
    const w = canvas.width, h = canvas.height;
    buildMask(w, h);
    if (edgeCanvas.width !== w || edgeCanvas.height !== h) { edgeCanvas.width = w; edgeCanvas.height = h; }
    edgeCtx.clearRect(0, 0, w, h);
    edgeCtx.drawImage(img, dx, dy, dw, dh);
    edgeCtx.globalCompositeOperation = "destination-in";
    edgeCtx.drawImage(maskCanvas, 0, 0);
    edgeCtx.globalCompositeOperation = "source-over";
    if (alpha < 1) ctx.globalAlpha = alpha;
    ctx.drawImage(edgeCanvas, 0, 0);
    if (alpha < 1) ctx.globalAlpha = 1;
  }

  // ---------- خط زمانی ۴ ماشین ----------
  function timelineAt(q) {
    // q در [۰,۱] روی کل مسیر ماشین‌ها
    const pos = q * CARS.length;
    const car = Math.min(CARS.length - 1, Math.floor(pos));
    const local = pos - car;
    const t = Math.min(1, Math.max(0, local / FRAME_PART));
    const idx = t * (CARS[car].count - 1);

    // کراس‌فید به ماشین بعدی در انتهای بلوک
    if (car < CARS.length - 1 && local > 1 - XF_LOCAL) {
      const mix = (local - (1 - XF_LOCAL)) / XF_LOCAL;
      const nt = Math.min(1, (mix * 0.1) / FRAME_PART);
      return { car, idx, nextCar: car + 1, nextIdx: nt * (CARS[car + 1].count - 1), mix };
    }
    // کراس‌فید از ماشین قبلی در ابتدای بلوک
    if (car > 0 && local < XF_LOCAL * 0.5) {
      const mix = 1 - local / (XF_LOCAL * 0.5);
      const prevLocal = 1 - (XF_LOCAL * 0.5 - local) / XF_LOCAL;
      const pt = Math.min(1, prevLocal / FRAME_PART);
      return { car: car - 1, idx: pt * (CARS[car - 1].count - 1), nextCar: car, nextIdx: idx, mix };
    }
    return { car, idx, nextCar: null, nextIdx: 0, mix: 0 };
  }

  // ---------- جابه‌جایی ماشین هنگام نمایش کارت ----------
  let cardZones = [];
  function setupCardZones() {
    cardZones = [];
    document.querySelectorAll(".scroll-section.car-card").forEach((section) => {
      const enter = parseFloat(section.dataset.enter) / 100;
      const leave = parseFloat(section.dataset.leave) / 100;
      const persist = section.dataset.persist === "true";
      const inner = section.querySelector(".section-inner");
      let dir = 0;
      if (inner && !isMobile()) {
        const r = inner.getBoundingClientRect();
        const cardLeft = r.left + r.width / 2 < window.innerWidth / 2;
        dir = cardLeft ? 1 : -1; // کارت سمت چپ → ماشین به راست می‌رود
      }
      cardZones.push({ enter, leave, dir, persist });
    });
  }

  const smoothstep = (s) => { s = Math.min(1, Math.max(0, s)); return s * s * (3 - 2 * s); };

  function cardShift(p) {
    let x = 0, mag = 0;
    for (const z of cardZones) {
      let s;
      if (p < z.enter) s = 0;
      else if (p <= z.leave) s = smoothstep((p - z.enter) / ((z.leave - z.enter) * 0.24));
      else s = z.persist ? 1 : 1 - smoothstep((p - z.leave) / 0.02);
      x += z.dir * s;
      mag += Math.abs(s);
    }
    x = Math.min(1, Math.max(-1, x));
    mag = Math.min(1, mag);
    if (isMobile()) return { sx: 0, sy: -0.13 * mag }; // موبایل: ماشین بالا می‌رود
    return { sx: 0.13 * x, sy: 0 }; // دسکتاپ: ماشین به سمت خالی صفحه
  }

  // ---------- هموارسازی فریم (رندر پیوسته) ----------
  let targetQ = 0;
  let smoothQ = 0;
  const decodeSet = new WeakSet();

  function prefetchAround(car, idx) {
    for (let k = -10; k <= 14; k++) {
      const i = idx + k;
      if (i < 0 || i >= CARS[car].count) continue;
      const img = frames[car][i];
      if (img && !decodeSet.has(img) && img.decode) {
        decodeSet.add(img);
        img.decode().catch(() => {});
      }
    }
  }

  function render() {
    const at = timelineAt(Math.min(0.99999, Math.max(0, smoothQ)));
    const idx = Math.floor(at.idx);
    const sh = cardShift(lastP);
    if (idx % 20 === 0) sampleBg(at.car, idx);
    drawFrame(at.car, idx, at.nextCar, Math.floor(at.nextIdx), at.mix, sh.sx, sh.sy);
    prefetchAround(at.car, idx);
    if (at.nextCar !== null) prefetchAround(at.nextCar, Math.floor(at.nextIdx));
  }

  let lastP = -1;

  function startRenderLoop() {
    gsap.ticker.lagSmoothing(0);
    let rafTicked = false;
    const step = (timeMs) => {
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
          targetQ = Math.min(1, Math.max(0, (p - INTRO_END) / (TIMELINE_END - INTRO_END)));
        } catch (e) { /* سکشن‌ها هرگز نباید رندر را متوقف کنند */ }
      }
      const ease = isMobile() ? 0.22 : 0.16;
      const d = targetQ - smoothQ;
      if (Math.abs(d) > 0.00004) {
        smoothQ += d * ease;
        try { render(); } catch (e) {}
      }
    };
    gsap.ticker.add((time) => { rafTicked = true; step(time * 1000); });
    // اگر requestAnimationFrame در محیط اجرا نشود (وب‌ویوهای پس‌زمینه)، تیک جایگزین:
    setInterval(() => { if (rafTicked) rafTicked = false; else step(performance.now()); }, 33);
  }

  // ---------- سکشن‌ها ----------
  let sectionDrivers = [];
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
    sectionDrivers = [];
    document.querySelectorAll(".scroll-section").forEach((section) => {
      const type = section.dataset.animation;
      const persist = section.dataset.persist === "true";
      const enter = parseFloat(section.dataset.enter) / 100;
      const leave = parseFloat(section.dataset.leave) / 100;
      const children = section.querySelectorAll(
        ".section-label, .section-heading, .section-body, .spec-list li, .price-row, .cta-row, .scroll-hint, .stat"
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
        { x: 0, y: 0, scale: 1, opacity: 1, stagger: 0.07, duration: 0.55, ease: "power2.out" }
      );

      sectionDrivers.push({ section, enter, leave, persist, tl, maxSeen: 0 });
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
        if (d.maxSeen > 0.02) d.section.classList.add("is-in");
      } else if (p >= d.enter && p <= d.leave) {
        d.section.classList.add("is-in");
        d.tl.progress(Math.min(1, local * 1.35));
      } else if (p < d.enter) {
        d.section.classList.remove("is-in");
        d.tl.progress(0);
      } else {
        d.section.classList.remove("is-in");
        d.tl.progress(Math.max(0, 1 - (p - d.leave) / 0.03));
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

  // ---------- هیرو / اورلی / نوار ----------
  function syncHero(p) {
    const heroFade = Math.max(0, 1 - p * 7);
    heroSection.style.opacity = String(heroFade);
    heroSection.style.pointerEvents = p > 0.14 ? "none" : "auto";
    canvasWrap.style.opacity = "1";
  }

  function syncOverlay() { overlay.style.opacity = "0"; }

  // ---------- ناوبری ----------
  function initNavScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const id = link.getAttribute("href").slice(1);
        if (!id || id === "top" || link.target === "_blank") return;
        e.preventDefault();
        if (id.startsWith("car-")) {
          const section = document.getElementById(id);
          const enter = parseFloat(section?.dataset.enter || "20") / 100;
          const leave = parseFloat(section?.dataset.leave || "24") / 100;
          const p = (enter + leave) / 2; // مرکز زون کارت همان طرح
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const y = p * maxScroll;
          if (lenis) lenis.scrollTo(y, { duration: 1.4 });
          else window.scrollTo({ top: y, behavior: "smooth" });
          return;
        }
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
      name.textContent = `${CARS[item.car].label} × ${faNum(item.qty)}`;
      const price = document.createElement("span");
      price.className = "cart-item-price";
      price.textContent = faNum(CARS[item.car].price * item.qty) + " تومان";
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

    const total = cartState.reduce((s, it) => s + CARS[it.car].price * it.qty, 0);
    cartTotalEl.textContent = faNum(total) + " تومان";

    const lines = cartState.map((it) =>
      `• ${CARS[it.car].label} × ${faNum(it.qty)} — ${faNum(CARS[it.car].price * it.qty)} تومان`
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
        const car = parseInt(btn.dataset.car, 10);
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
      setupCardZones();
      render();
    });
    setupSectionDrivers();
    setupCounters();
    positionSections();
    setupCardZones();
    startRenderLoop();
    initNavScroll();
    initCart();
    initContact();
    preload();
    sampleBg(0, 0);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
