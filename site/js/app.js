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

  const INTRO_END = 0.03;    // سهم هیرو
  const TIMELINE_END = 0.97; // پایان کلیپ

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
    // کاور واقعی: پر شدن کامل از هر ۴ طرف با لبه‌ی تیز — بدون بلور و ماسک نرم
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    const dx = (cw - dw) / 2, dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function drawFrame(i) {
    if (!canvas.width) resizeCanvas();
    ctx.fillStyle = bgTint;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawImageCover(i);
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
    const idx = Math.round(smoothQ * (FRAME_COUNT - 1)); // سرعت یکنواخت
    sampleBg(idx % 20 === 0 ? idx : -1);
    drawFrame(idx);
    prefetchAround(idx);
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

  // ---------- هیرو / اورلی ----------
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
