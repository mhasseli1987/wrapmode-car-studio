/* WRAPMODE — ریل عمودی استودیو: یک take پیوسته، ۵ فصل + بوکه‌ی معرفی (v24 — پاک‌سازی و پایداری) */
(() => {
  "use strict";

  // ---------- پیکربندی ----------
  // ریل NEW SEASON: 1080×1920 عمودی، 30fps، ۱۵ ثانیه — استخراج ۱:۱ با سورس (۴۵۰ فریم @30fps)
  // (نسخهٔ قبلی ۲۴۰ فریم @16fps بود — نصف نم‌های زمانی سورس، همان پله‌پلهٔ اسکرول)
  // دسکتاپ frames6 = 1152×2048 q78 (~۵۲MB) / موبایل frames6m = 720×1280 q75 (~۳۲MB) — تقاضا-محور
  // 0-89 کارت تایتل NEW SEASON / 90-189 سامورایی موج روی BMW E46 / 191-266 آنیمه مجنتا روی E46
  // 268-352 سوپرای GR با لوری مسابقه‌ای / 354-448 کارت پایانی WRAPMODE (لوگو + Pick your wrap)
  // مرزها از scene-detect سورس (کات‌ها در ۲٫۹۷s / ۸٫۹۳s / ۱۱٫۸s) + بازبینی فریمی وایپ مورب
  // کپشن‌های سفیدِ پایینِ سورس با دیلوگو حین استخراج پاک شده‌اند
  const FRAME_DIR = isMobileEarly() ? "frames6m/" : "frames6/";
  function isMobileEarly() {
    // موبایل = فریم‌های ۷۲۰×۱۲۸۰ (سبک‌تر برای GPU گوشی) — بقیه با DPR و کش دیکد
    return window.matchMedia("(max-width: 768px)").matches;
  }
  const FRAME_COUNT = 450;
  const GRID_HOLD = 30;     // فریم هیرو: قاب تایتل NEW SEASON (t=1s — کارت از فریم ۰ کامل است)

  const CHAPTERS = [
    { from: 90,  to: 189 }, // سامورایی موج
    { from: 191, to: 266 }, // آنیمه مجنتا
    { from: 268, to: 352 }, // سوپرای GR
    { from: 354, to: 448 }, // کارت پایانی (بدون کپشن — لوگوی خودش حرف می‌زند)
  ];
  // سهم اسکرول هر فصل = متناسب با طول فریمی صحنه در سورس (سرعت اسکرول یکنواخت)
  const CH_WEIGHTS = [0.281, 0.213, 0.239, 0.267];
  const INTRO_END = 0.05;   // سهم هیروی ثابت (فریم تایتل)
  const CH_FADE = 0;        // گذرهای این ریل وایپ موربِ درونِ سورس‌اند — فید سیاه اضافه لازم نیست

  const WA_NUMBER = "989196828013"; // شماره واقعی سایت wrapmode.ir

  // ---------- ۵ طرح کالکشن (به ترتیب ریل جدید) ----------
  const DESIGNS = [
    { en: "SAMURAI WAVE",  fa: "سامورایی موج",   descFa: "موج بزرگ قرمز و فیروزه‌ای با سوارِ سامورایی؛ حس اوکی‌یوی ژاپن.", descEn: "Great red-and-teal wave with a samurai rider — ukiyo-e energy.", price: 70000000, img: "img/design-1.webp" },
    { en: "MAGENTA ANIME", fa: "آنیمه مجنتا",    descFa: "پرتره‌ی آنیمه‌ی مجنتا روی بدنه‌ی نقره‌ای؛ جسور، پرانرژی، دیده‌شدن.", descEn: "Magenta anime portrait over a silver body — bold and loud.", price: 70000000, img: "img/design-2.webp" },
    { en: "HAPPY HORSE",   fa: "هپی هورس ۱.۱",   descFa: "کمدی‌بوک سفید/مشکی با جوکر و تاج‌ها؛ امضای این کالکشن.",        descEn: "White/black comic splatter with clown and crowns — the signature.", price: 70000000, img: "img/design-3.webp" },
    { en: "NEON GRAFFITI", fa: "گرافیتی نئون",   descFa: "آرت گرافیتی چندرنگ روی بدنه‌ی قرمز، زیر نور نئون سبز.",        descEn: "Multicolour graffiti on red body under green neon light.", price: 70000000, img: "img/design-4.webp" },
    { en: "SAKURA NIGHT",  fa: "ساکورا شب",      descFa: "چاپ ساکورا و آنیمه‌ی صورتی روی بدنه‌ی مشکی؛ مه و گل‌ریزان.",    descEn: "Sakura anime print on black body — mist and falling petals.", price: 70000000, img: "img/design-5.webp" },
  ];

  // ---------- بیلینگوال ----------
  // نکته: سایت فعلاً فقط انگلیسی سرو می‌شود (سوییچ زبان حذف شده)، اما دیکشنری فارسی
  // به‌عنوان مرجع متن‌های اصلی و برای پیام واتساپ (گیرندهٔ فروشگاه) نگه داشته شده است.
  const I18N = {
    fa: {
      "nav.m1": "همه محصولات", "nav.m2": "انواع PPF", "nav.m3": "کاور رنگی", "nav.m4": "شیشه دودی برند SOLAR",
      "nav.m5": "ابزار نصب", "nav.m6": "لوازم لوکس", "nav.m7": "تماس با ما", "nav.m8": "درباره ما",
      "nav.cta1": "تماس مستقیم", "nav.cta2": "پیگیری سفارش",
      "hero.kicker": "CAR WRAP STUDIO",
      "hero.title": "کالکشن رپ. یک اسکرول.",
      "hero.sub": "فویل کست اورجینال، چاپ اختصاصی و نصب حرفه‌ای — پنج طرح فول‌بادی در یک روایت سینمایی.",
      "scroll": "اسکرول کنید",
      "col.kicker": "THE COLLECTION — 05",
      "col.title": "پنج طرح منتخب فول‌بادی",
      "col.sub": "قیمت تمام‌شده با چاپ و اجرای حرفه‌ای — انتخاب کنید و سفارش را در واتساپ نهایی کنید.",
      "stat1": "پروژه اجرا شده", "stat2": "سال سابقه تخصصی", "stat3": "فویل اورجینال",
      "cart.title": "سبد خرید", "cart.empty": "سبد خرید خالی است.", "cart.total": "جمع کل",
      "cart.order": "ادامه فرآیند خرید",
      "contact.title": "تماس با ورپ‌مود",
      "contact.body": "برای مشاوره، قیمت دقیق و رزرو نوبت از واتساپ در ارتباط باشید.",
      "contact.cta": "گفتگو در واتساپ", "contact.close": "بستن",
      _add: "افزودن", _added: "به سبد اضافه شد ✓", _toman: "تومان", _remove: "حذف",
    },
    en: {
      "nav.m1": "All Products", "nav.m2": "PPF Films", "nav.m3": "Color Wraps", "nav.m4": "SOLAR Window Tint",
      "nav.m5": "Installation Tools", "nav.m6": "Luxury Accessories", "nav.m7": "Contact Us", "nav.m8": "About Us",
      "nav.cta1": "Direct Contact", "nav.cta2": "Track Order",
      "hero.kicker": "CAR WRAP STUDIO",
      "hero.title": "The wrap collection. One scroll.",
      "hero.sub": "Original cast vinyl, custom prints and professional installation — five full-body designs in one cinematic scroll.",
      "scroll": "Scroll",
      "col.kicker": "THE COLLECTION — 05",
      "col.title": "Five full-body designs",
      "col.sub": "Final price including print and professional installation — pick one and order on WhatsApp.",
      "stat1": "Projects delivered", "stat2": "Years of craft", "stat3": "Original vinyl",
      "cart.title": "Your cart", "cart.empty": "Your cart is empty.", "cart.total": "Total",
      "cart.order": "Continue checkout",
      "contact.title": "Contact Wrapmode",
      "contact.body": "Reach us on WhatsApp for consultation, exact pricing and booking.",
      "contact.cta": "Chat on WhatsApp", "contact.close": "Close",
      _add: "Add", _added: "Added ✓", _toman: "Toman", _remove: "Remove",
    },
  };

  const lang = "en"; // سایت فقط انگلیسی است — سوییچ زبان حذف شد
  const t = (k) => (I18N[lang][k] !== undefined ? I18N[lang][k] : I18N.fa[k] || k);
  const faNum = (n) => n.toLocaleString(lang === "fa" ? "fa-IR" : "en-US");

  // ?nomotion — حالت تست: بدون lenis تا اسکرول برنامه‌ای دقیق باشد
  // let است نه const: اگر کاربر وسط کار تنظیم سیستم را عوض کند، همین متغیر به‌روز می‌شود
  let prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    new URLSearchParams(location.search).has("nomotion");

  // ---------- توکن‌های حرکت ----------
  // یک ریتم واحد برای همه‌ی ریویل‌ها (motion-consistency) — نه یک مدت‌زمانِ دلبخواهی برای هر گذر
  // ورودِ اسکرولی آرام است (اسکرول در دست کاربر است)، خروجِ کپشن کوتاه‌تر تا رابط «سنگین» نشود
  const MOTION = {
    revealY: 22,        // آفست کم → مثل «فید» خوانده می‌شود، نه اسلایدِ بلند
    revealDur: 0.6,     // ۴۰۰–۶۰۰ms؛ کوتاه‌تر از آن، اسکرول را بی‌قرار نشان می‌دهد
    revealEase: "power3.out", // ease-out برای ورود (slow-in/slow-out)
    stagger: 0.045,     // ۴۵ms بین آیتم‌های یک ردیف (MD: ۳۰–۵۰ms)
    rowStagger: 0.075,  // هر ردیفِ بعدی گرید کمی دیرتر
    countDur: 1.6,      // شمارنده‌ها کوتاه‌تر از ۲s قبلی — خواندن زودتر کامل می‌شود
  };
  const mobileMQ = window.matchMedia("(max-width: 768px)");
  const isMobile = () => mobileMQ.matches;

  const loader = document.getElementById("loader");
  const loaderFill = document.getElementById("loader-fill");
  const loaderPercent = document.getElementById("loader-percent");
  const canvas = document.getElementById("canvas");
  const canvasWrap = document.getElementById("canvas-wrap");
  // ارتفاع ویوپورتِ قفل‌شده: canvas-wrap با ۱۰۰lvh در CSS اندازه‌گیری می‌شود؛ جمع/باز شدن
  // نوار آدرس موبایل نباید نقشه‌ی اسکرول→فریم را وسط راه عوض کند («سینک نبودن» همین بود)
  const stableVh = () => (canvasWrap && canvasWrap.clientHeight) || window.innerHeight;
  const stage = document.getElementById("scrub-stage");
  const heroCopy = document.querySelector(".hero-copy");
  const scrollHint = document.getElementById("scroll-hint");
  const header = document.getElementById("site-header");
  const ctx = canvas ? canvas.getContext("2d", { alpha: false }) : null;

  // اگر بوم در دسترس نبود، سایت باید بدون کرش به محتوای متنی برگردد
  if (!canvas || !ctx || !canvasWrap || !stage) {
    document.documentElement.classList.add("no-webgl");
    if (loader) loader.classList.add("done");
    return;
  }

  // ---------- اسکرول نرم ----------
  // Lenis از CDN می‌آید؛ اگر بارگذاری نشده باشد باید بی‌صدا به اسکرول بومی برگردیم.
  // lerp (کمتر = نرم‌تر، بدون کشش اضافه) جایگزین duration+easing شد تا حس «درگ» از بین برود.
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== "undefined") {
    try {
      lenis = new Lenis({
        lerp: isMobile() ? 0.12 : 0.085,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: isMobile() ? 0.9 : 1,
        touchMultiplier: isMobile() ? 2 : 1.4,
        infinite: false,
      });
    } catch (e) {
      lenis = null;
    }
  }

  // ---------- بارگذاری فریم‌ها (دوفازی) ----------
  const frames = new Array(FRAME_COUNT).fill(null);
  const decodeSet = new WeakSet(); // باید قبل از اولین استفاده تعریف شود (idleDecodeStep / prefetchAround)
  let loaded = 0;
  // ?v=3: فریم‌ها با ۳۰فریم‌برثانیه و نام‌های هم‌پوشان بازتولید شدند — کش مرورگر کهنه را نمی‌سپارد
  const path = (i) => `${FRAME_DIR}f_${String(i + 1).padStart(4, "0")}.webp?v=3`;

  function updateLoader() {
    const p = Math.round((loaded / FRAME_COUNT) * 100);
    if (loaderFill) loaderFill.style.width = p + "%";
    if (loaderPercent) loaderPercent.textContent = p + "٪";
  }

  const requesting = new Set(); // درخواست در راه — از دانلود تکراری همان فریم جلوگیری می‌کند

  function loadOne(i) {
    if (frames[i] || requesting.has(i)) return Promise.resolve();
    requesting.add(i);
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        frames[i] = img; requesting.delete(i); loaded++; updateLoader();
        // دیکد بلافاصله پس از دانلود — کشیدنِ فریمِ سرد هرگز وسط اسکرول تپق نمی‌زند
        if (img.decode) { decodeSet.add(img); img.decode().catch(() => {}); }
        resolve();
      };
      img.onerror = () => { requesting.delete(i); loaded++; updateLoader(); resolve(); };
      img.src = path(i);
    });
  }

  const HERO_LAST = GRID_HOLD;        // فریم‌های هیرو (فید-این + قاب پایدار) باید قبل از رفع لودر باشند
  let loaderHidden = false;

  async function preload() {
    const firstJobs = [];
    // فقط قاب هیرو + چند فریم جلوتر — فریم‌های ۰ تا GRID_HOLD−۱ هرگز نمایش داده نمی‌شوند
    // (تایم‌لاین زیر INTRO_END روی GRID_HOLD قفل است) و بارگیری‌شان فقط لودر را کند می‌کند
    for (let i = GRID_HOLD; i <= HERO_LAST + 6; i++) firstJobs.push(loadOne(i));
    await Promise.all(firstJobs);
    hideLoader();
    drawFrame(GRID_HOLD);
    // بقیه‌ی فریم‌ها دیگر پشت‌سرهم دانلود نمی‌شوند — «پنجره‌ی دور بازیکن» در prefetchAround
    // تقاضا-محور می‌گیرد و حلقه‌ی idle فقط بیکاری‌ها را گرم می‌کند.
    // روی موبایل هم گرم می‌شود (فریم‌های ۷۲۰p سبک‌اند) — اسکرول سریعِ انگشتی
    // پنجره‌ی prefetch را از پشت سر می‌زند و بدون پیش‌بارگذاری «فریم دیررس» همان کجیِ محسوس است
    scheduleIdleDecode();
  }

  // گرم‌کردن تدریجی در بیکاری: چند فریم جلوترِ بازیکن را می‌خواند (نه به‌ترتیب خطی)،
  // پس هرگز پهنای باند را جلوی اسکرول کاربر نمی‌گیرد
  // شروع از GRID_HOLD: فریم‌های پیش از قاب هیرو در تایم‌لاین این ریل هرگز دیده نمی‌شوند
  let idleCursor = GRID_HOLD;
  function idleDecodeStep() {
    let sent = 0;
    while (idleCursor < FRAME_COUNT && sent < 4) {
      const i = idleCursor++;
      if (!frames[i] && !requesting.has(i)) { loadOne(i); sent++; }
    }
    if (idleCursor >= FRAME_COUNT) return;
    scheduleIdleDecode();
  }
  function scheduleIdleDecode() {
    if ("requestIdleCallback" in window) requestIdleCallback(idleDecodeStep, { timeout: 400 });
    else setTimeout(idleDecodeStep, 60);
  }

  function hideLoader() {
    if (loaderHidden) return;
    loaderHidden = true;
    if (loader) loader.classList.add("done");
  }

  // ---------- بوم ----------
  // ---------- کیفیت تطبیقی: فریم‌تایم بالا رفت → فقط DPR پایین می‌آید ----------
  // بلندِ بین‌فریمی هرگز خاموش نمی‌شود — خاموشی‌اش همان «پله‌پله» است
  let dprCap = 1.5;
  let ftAvg = 16.7;
  let warm = 0;

  // ابعاد واقعی بافر بوم را کش می‌کنیم؛ تغییر width/height بافر را ریست می‌کند و گران است
  let canvasW = 0;
  let canvasH = 0;

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap);
    const w = canvasWrap.clientWidth || window.innerWidth;
    const h = canvasWrap.clientHeight || window.innerHeight;
    const nextW = Math.floor(w * dpr);
    const nextH = Math.floor(h * dpr);
    if (nextW === canvasW && nextH === canvasH) return;
    canvasW = nextW;
    canvasH = nextH;
    canvas.width = nextW;
    canvas.height = nextH;
    // بعد از تغییر ابعاد، تنظیمات کانتکست ریست می‌شوند
    ctx.imageSmoothingEnabled = true;
    // موبایل: مقیاس ~۱:۱ است، «medium» غیرقابل‌تشخیص و محسوس ارزان‌تر
    ctx.imageSmoothingQuality = isMobile() ? "medium" : "high";
  }

  function nearestLoaded(i) {
    if (frames[i]) return i;
    for (let d = 1; d < FRAME_COUNT; d++) {
      if (frames[i - d] && i - d >= 0) return i - d;
      if (frames[i + d] && i + d < FRAME_COUNT) return i + d;
    }
    return GRID_HOLD;
  }

  function drawOne(img, zoom) {
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;
    // «همه‌طرف فیکس»: کاور واقعی روی هر نسبت‌صفحه — بدون زیرلایه‌ی بلور، بدون نوار
    const cover = Math.max(cw / iw, ch / ih);
    const z = zoom || 1;
    const dw = iw * cover * z, dh = ih * cover * z;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // منحنی نرمِ وارد/خروج (slow-in/slow-out) — گذرها خطی نباشند، چشم «تق» را نمی‌بیند
  const smooth01 = (u) => {
    const s = u < 0 ? 0 : u > 1 ? 1 : u;
    return s * s * (3 - 2 * s);
  };

  // فیدِ بین‌فصلی: خاموش در کلیپ ۰۰۷ (گذارها درون سورس دیمری‌اند) — فرمولِ CH_FADE برای کلیپ‌های بعدی می‌ماند
  function chapterFadeAlpha(fi) {
    if (CH_FADE <= 0) return 0;
    let a = 0;
    for (let k = 0; k < CHAPTERS.length; k++) {
      const c = CHAPTERS[k];
      if (k < CHAPTERS.length - 1) {
        const dout = c.to - fi;
        if (dout >= 0 && dout <= CH_FADE) a = Math.max(a, 1 - smooth01(dout / CH_FADE));
        if (fi > c.to && fi < CHAPTERS[k + 1].from) return 1; // گپ سورس بین دو فصل
      }
      const din = fi - c.from;
      if (din >= 0 && din <= CH_FADE) a = Math.max(a, 1 - smooth01(din / CH_FADE));
    }
    return Math.min(1, a);
  }

  // اسکراب خامه‌ای: بین دو فریم مجاور بلند می‌کنیم (24fps سورس → حرکت پیوسته 60fps)
  function drawFrame(fi, zoom) {
    if (!canvasW) resizeCanvas();
    const i0 = Math.max(0, Math.min(FRAME_COUNT - 1, Math.floor(fi)));
    const i1 = Math.min(FRAME_COUNT - 1, i0 + 1);
    const f = fi - i0;
    const img0 = frames[i0], img1 = frames[i1];
    if (img0 && img1 && f > 0.004 && f < 0.996) {
      // crossfade با smoothstep — گذر نرم بین فریم‌های ۲۴fps و حذف «پله»
      drawOne(img0, zoom);
      const s = f * f * (3 - 2 * f);
      ctx.globalAlpha = s;
      drawOne(img1, zoom);
      ctx.globalAlpha = 1;
    } else if (f > 0.5 && img1) {
      drawOne(img1, zoom);
    } else if (img0) {
      drawOne(img0, zoom);
    } else {
      const r = nearestLoaded(i0);
      if (frames[r]) drawOne(frames[r], zoom);
    }
    const fa = chapterFadeAlpha(fi);
    if (fa > 0.003) {
      ctx.globalAlpha = fa;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvasW, canvasH);
      ctx.globalAlpha = 1;
    }
  }

  // ---------- تایم‌لاین: یک take پیوسته، ۵ فصل ----------
  // خروجی idx اعشاری است — drawFrame بین دو فریم مجاور بلند می‌کند
  // local با خمیرِ ملایم slow-in/slow-out صاف می‌شود: دورِ مرز فصل‌ها (محل فید) حرکت آرام‌تر است
  const easeLocal = (u) => u * 0.55 + smooth01(u) * 0.45;
  function timelineAt(x) {
    if (x <= INTRO_END) return { idx: GRID_HOLD, cap: -1, local: 0 };
    const t = Math.min(1, (x - INTRO_END) / (1 - INTRO_END));
    let acc = 0;
    for (let k = 0; k < CHAPTERS.length; k++) {
      const w = CH_WEIGHTS[k];
      if (t <= acc + w || k === CHAPTERS.length - 1) {
        const local = Math.min(1, Math.max(0, (t - acc) / w));
        const c = CHAPTERS[k];
        return { idx: c.from + easeLocal(local) * (c.to - c.from), cap: k, local };
      }
      acc += w;
    }
    return { idx: CHAPTERS[CHAPTERS.length - 1].to, cap: CHAPTERS.length - 1, local: 1 };
  }

  // ---------- کپشن‌ها ----------
  let capDrivers = [];
  let scrubLen = 1;

  function measureStage() {
    scrubLen = Math.max(1, stage.offsetHeight - stableVh());
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
    // (همه با stableVh — مرکزِ بومِ قفل‌شده، نه ویوپورتِ لرزانِ موبایل)
    const vh = stableVh();
    const drop = isMobile() ? vh * 0.19 : 0;
    capDrivers.forEach((d, k) => {
      const range = ranges[k];
      if (!range) return;
      const [s, e] = range;
      const enter = s + (e - s) * 0.16;
      const isLast = k === CHAPTERS.length - 1;
      const leave = isLast ? 1.0 : s + (e - s) * 0.84;
      const mid = (enter + leave) / 2;
      d.el.style.top = `${mid * scrubLen + vh / 2 + drop}px`;
      d.enter = enter;
      d.leave = leave;
    });
  }

  function setupCaptions() {
    capDrivers = [...stage.querySelectorAll(".cap")].map((el) => {
      const kids = el.querySelectorAll(".cap-kicker, .cap-title");
      let tl = null;
      if (typeof gsap !== "undefined" && kids.length) {
        tl = gsap.timeline({ paused: true });
        tl.fromTo(kids, { opacity: 0, y: 12 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.55, ease: "power3.out" });
      }
      return {
        el,
        tl,
        enter: 0,
        leave: 1,
        _state: null,
        _drift: null,
      };
    });
    positionCaptions();
  }

  // syncCaptions فقط کپشن تحت تأثیر را دست می‌زند (نه هر ۵ تا در هر فریم)
  let lastCapState = null;

  function setCapState(d, state) {
    if (d._state === state) return;
    d._state = state;
    if (state === "in") {
      d.el.classList.add("is-in");
      if (d.tl) d.tl.play(0);
    } else {
      d.el.classList.remove("is-in");
      if (d.tl) d.tl.pause(0);
    }
  }

  function syncCaptions(x) {
    for (let i = 0; i < capDrivers.length; i++) {
      const d = capDrivers[i];
      let state;
      if (x < d.enter) state = "before";
      else if (x > d.leave) state = "after";
      else state = "in";

      setCapState(d, state);

      if (state === "in") {
        const span = Math.max(d.leave - d.enter, 0.001);
        const p = Math.min(1, (x - d.enter) / span);
        // دریفت مویی با خم آرام — کپشن مثل تایتل‌کارت فیلم بدون شتاب خطی بالا می‌رود
        // reduced-motion: دریفت صفر — هیچ حرکت اسکرول‌محوری نمی‌ماند، فقط فید
        const drift = prefersReducedMotion ? "0.0" : ((0.5 - smooth01(p)) * 26).toFixed(1);
        if (drift !== d._drift) {
          d._drift = drift;
          d.el.style.setProperty("--drift", `${drift}px`);
        }
      } else {
        const rest = prefersReducedMotion ? "0px" : state === "before" ? "13px" : "-13px";
        if (d._drift !== rest) {
          d._drift = rest;
          d.el.style.setProperty("--drift", rest);
        }
      }
    }
  }

  // ---------- هیرو / هدر ----------
  // فقط وقتی مقدار واقعاً عوض شده DOM را دست بزن (نوشتن مکرر style باعث ری‌استایل می‌شود)
  let lastHeroFade = -1;
  let lastHeaderScrolled = false;

  function syncHero(x) {
    // محویِ کپی با خم smoothstep — قطعِ تیزِ خطی در ابتدای اسکرول حس «پرش» می‌دهد
    const fade = 1 - smooth01(x * 18);
    if (fade !== lastHeroFade) {
      lastHeroFade = fade;
      const str = String(fade);
      const off = fade < 0.2;
      if (heroCopy) {
        heroCopy.style.opacity = str;
        heroCopy.style.pointerEvents = off ? "none" : "";
        heroCopy.querySelectorAll(".btn").forEach((b) => { b.style.pointerEvents = off ? "none" : "auto"; });
      }
      if (scrollHint) scrollHint.style.opacity = str;
    }

    const scrolled = window.scrollY > 40;
    if (scrolled !== lastHeaderScrolled) {
      lastHeaderScrolled = scrolled;
      if (header) header.classList.toggle("scrolled", scrolled);
    }
  }

  // ---------- حلقه‌ی رندر ----------
  let targetQ = 0;
  let smoothQ = 0;
  const ZOOM_OFF = 1;
  const MAX_DT = 1 / 30; // سقف گام زمانی تا پرش‌های طولانی باعث جهش نشوند

  // پنجره‌ی prefetch فقط وقتی جابه‌جا شود که فریم هدف عوض شده باشد (نه هر فریم)
  let lastPrefetchIdx = -999;

  function prefetchAround(idx) {
    if (Math.abs(idx - lastPrefetchIdx) < 4) return;
    lastPrefetchIdx = idx;
    for (let k = -6; k <= 22; k++) {
      const j = idx + k;
      if (j < 0 || j >= FRAME_COUNT) continue;
      const img = frames[j];
      if (!img) { loadOne(j); continue; }         // تقاضا-محور: فریمِ بازیکنِ نaloadیده فوراً دانلود می‌شود
      if (!decodeSet.has(img) && img.decode) {     // و دیکدش پیش از کشیدن
        decodeSet.add(img);
        img.decode().catch(() => {});
      }
    }
  }

  const progressEl = document.getElementById("progress");

  // آخرین مقدارهای نوشته‌شده روی DOM — از نوشتن تکراری جلوگیری می‌کند
  let lastProgressScale = -1;
  let lastVeil = -1;

  function render() {
    const { idx } = timelineAt(smoothQ);
    drawFrame(idx, ZOOM_OFF);

    // پرده‌ی تیره‌ی هیرو: فریم گرید عقب می‌نشیند تا کپی بخواند؛ با شروع اسکرول کنار می‌رود
    const veil = 0.44 * Math.max(0, 1 - smoothQ / (INTRO_END * 0.85));
    if (veil > 0.005) {
      if (veil !== lastVeil) {
        lastVeil = veil;
        ctx.fillStyle = `rgba(5,4,8,${veil.toFixed(3)})`;
      }
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      lastVeil = -1;
    }

    prefetchAround(Math.round(idx));
  }

  // طول اسکرول را کش می‌کنیم — خواندن scrollHeight هر فریم باعث layout thrash می‌شود
  let scrollMax = 1;

  function measureScroll() {
    scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    measureStage();
  }

  function syncProgress() {
    if (!progressEl) return;
    const s = Math.min(1, window.scrollY / scrollMax);
    if (s === lastProgressScale) return;
    lastProgressScale = s;
    progressEl.style.transform = `scaleX(${s.toFixed(4)})`;
  }

  // ---------- حلقه‌ی رندر (تک‌حلقه‌ای، مستقل از فریمریت) ----------
  let lastP = -1;
  let lastStepAt = 0;
  let lastTickAt = 0;
  let curVel = 0;
  let lastScrubbing = false;

  function startRenderLoop() {
    const hasGsap = typeof gsap !== "undefined" && gsap && gsap.ticker;
    if (hasGsap) {
      gsap.ticker.lagSmoothing(0);
      gsap.ticker.add((time) => { step(time * 1000); });
      return;
    }
    // بدون GSAP: حلقه‌ی rAF بومی
    const rafLoop = (t) => { step(t); requestAnimationFrame(rafLoop); };
    requestAnimationFrame(rafLoop);
  }

  function step(timeMs) {
    lastStepAt = performance.now();

    // ---- گام زمانی واقعی: مستقل از 60/120/144Hz ----
    if (!lastTickAt) lastTickAt = timeMs;
    let dt = (timeMs - lastTickAt) / 1000;
    lastTickAt = timeMs;
    if (!(dt > 0)) dt = 1 / 60;
    if (dt > MAX_DT) dt = MAX_DT;

    if (lenis) {
      try { lenis.raf(timeMs); }
      catch (e) { lenis = null; }
    }

    // x = پیشروی روی ریل اسکراب (نه کل سند) — با همان scrubLen که کپشن‌ها با آن چیده شده‌اند
    const x = scrubLen > 0 ? Math.min(1, Math.max(0, window.scrollY / scrubLen)) : 0;
    syncProgress();

    if (Math.abs(x - lastP) > 0.000004) {
      lastP = x;
      try {
        syncHero(x);
        syncCaptions(x);
        targetQ = x;
      } catch (e) { /* هیچ‌وقت رندر را نکشد */ }
    }

    const d = targetQ - smoothQ;

    // ---- میرایی نمایی مستقل از فریمریت ----
    // نرخ هدف: در ~0.28s به هدف برسد. فرمول: 1 - e^(-dt*k)
    const k = 9;
    const alpha = 1 - Math.exp(-dt * k);

    // سرعت را برای «کشش» نرم ردیابی می‌کنیم (بدون جهش)
    const vRaw = Math.abs(d);
    curVel += (vRaw - curVel) * Math.min(1, dt * 12);

    const moving = Math.abs(d) > 0.00002;
    if (moving) {
      smoothQ += d * alpha;
      render();
    } else if (smoothQ !== targetQ) {
      smoothQ = targetQ;
      render();
    }

    // ---- کلاس scrubbing فقط هنگام حرکت واقعی ----
    const scrubbing = curVel > 0.0004;
    if (scrubbing !== lastScrubbing) {
      lastScrubbing = scrubbing;
      document.body.classList.toggle("scrubbing", scrubbing);
    }

    // ---- کاهش کیفیت تطبیقی (فقط پس از گرم شدن) ----
    if (moving) {
      if (warm < 90) warm++;
      else {
        const dtMs = dt * 1000;
        ftAvg += (Math.min(Math.max(dtMs, 0), 60) - ftAvg) * 0.05;
        if (ftAvg > 24 && dprCap > 1) { dprCap = 1; resizeCanvas(); ftAvg = 16.7; }
      }
    }
  }

  // ---------- شمارنده‌ها ----------
  // settle خروجی: هم مسیر reduced-motion، هم تغییر زندهٔ تنظیم سیستم، هم سقوطِ GSAP
  let settleCounters = () => {};

  function initCounters() {
    const stats = document.getElementById("stats");
    if (!stats || typeof IntersectionObserver === "undefined") return;
    const numbers = [...stats.querySelectorAll(".stat-number")];
    // حالت نهایی، بی‌هیچ شمردنِ انیمیشنی — داده باید بی‌واسطه خوانده شود
    settleCounters = () => {
      numbers.forEach((el) => {
        el.textContent = faNum(parseFloat(el.dataset.value));
        el.dataset.done = "1";
      });
    };
    if (prefersReducedMotion || typeof gsap === "undefined") { settleCounters(); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        numbers.forEach((el) => {
          const target = parseFloat(el.dataset.value);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target, duration: MOTION.countDur, ease: "power1.out",
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
  let revealTargets = [];
  const REVEAL_SEL =
    "#collection .col-head, #collection .stat, #cards .card";

  // پرش بی‌واسطه به حالت نهایی — برای prefers-reduced-motion و تغییر زندهٔ تنظیم سیستم.
  // هرگز معکوس نمی‌شود: محتوا یک‌بار که دیده شد، دوباره پنهان نمی‌شود.
  function settleReveals() {
    if (revealIO) { revealIO.disconnect(); revealIO = null; }
    revealTargets.forEach((el) => {
      el.dataset.revealed = "1";
      if (typeof gsap !== "undefined") gsap.set(el, { clearProps: "opacity,transform" });
      else { el.style.opacity = ""; el.style.transform = ""; }
    });
  }

  // تأخیر ریویل را بر اساس جایگاه واقعی در گرید می‌چیند، نه i % 4.
  // روی موبایل یک‌ستونه، i % 4 ترتیبِ خواندن را به هم می‌ریخت (کارت پنجم بدون تأخیر می‌آمد).
  function assignRevealDelays() {
    const setDelay = (el, d) => { el.dataset.revDelay = String(d); };
    document.querySelectorAll("#collection .col-head").forEach((el) => setDelay(el, 0));
    document.querySelectorAll("#collection .stat").forEach((el, i) => setDelay(el, i * MOTION.stagger));

    const cardRows = []; // به ترتیب DOM = ترتیب ردیف‌ها
    document.querySelectorAll("#cards .card").forEach((el) => {
      // کوانتایز ۸px: کارت‌های هم‌ترازِ یک ردیف دقیقاً یک offsetTop می‌گیرند
      const top = Math.round(el.offsetTop / 8) * 8;
      let row = cardRows.find((r) => r.top === top);
      if (!row) { row = { top, items: 0 }; cardRows.push(row); }
      const delay = cardRows.indexOf(row) * MOTION.rowStagger + row.items * MOTION.stagger;
      setDelay(el, Number(delay.toFixed(3))); // رشتهی کوتاه: 0.225 نه 0.22499999999999998
      row.items++;
    });
  }

  function initReveals() {
    if (typeof IntersectionObserver === "undefined") return;
    if (typeof gsap === "undefined") return; // بدون GSAP محتوا پیش‌فرض دیده می‌شود — هیچ‌وقت نامرئی نمی‌ماند
    if (revealIO) revealIO.disconnect();

    revealTargets = [...document.querySelectorAll(REVEAL_SEL)];
    // prefers-reduced-motion: نه پنهان‌سازیِ اولیه، نه گذر — محتوا همان‌جا ایستاده است
    if (prefersReducedMotion) { settleReveals(); return; }

    assignRevealDelays();

    revealIO = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const el = en.target;
        if (!en.isIntersecting || el.dataset.revealed) return;
        el.dataset.revealed = "1";
        revealIO.unobserve(el);
        gsap.to(el, {
          opacity: 1, y: 0,
          duration: MOTION.revealDur,
          delay: parseFloat(el.dataset.revDelay) || 0,
          ease: MOTION.revealEase,
          clearProps: "transform", // کلاس hover کارت باید ترنسفورم خودش را داشته باشد
        });
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }); // ۱۵٪ دیده‌شدن: انیمیشن قبل از رسیدنِ کامل تمام می‌شود

    revealTargets.forEach((el) => {
      delete el.dataset.revealed;
      gsap.set(el, { opacity: 0, y: MOTION.revealY });
      revealIO.observe(el);
    });
  }

  // ---------- تغییر زندهٔ تنظیم حرکت ----------
  // اگر کاربر وسط جلسه reduced-motion را روشن کند، هر چیزی که در حرکت/پنهان است
  // بی‌واسطه به حالت نهایی می‌پرد و اسکرول نرم خاموش می‌شود.
  function initMotionPreference() {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => {
      if (!mq.matches || prefersReducedMotion) return;
      prefersReducedMotion = true;
      if (lenis) { try { lenis.destroy(); } catch (e) {} lenis = null; }
      settleReveals();
      settleCounters();
      capDrivers.forEach((d) => d.el.style.setProperty("--drift", "0px"));
      if (typeof gsap !== "undefined" && typeof gsap.globalTimeline !== "undefined") {
        gsap.globalTimeline.getChildren(true, true, true).forEach((tw) => tw.progress(1));
      }
    };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  // ---------- کالکشن ----------
  function renderCards() {
    const wrap = document.getElementById("cards");
    if (!wrap) return;
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
      img.width = 640;
      img.height = 400;
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
    try {
      const parsed = JSON.parse(localStorage.getItem("wrapmode-cart") || "[]");
      // اعتبارسنجی: فقط آیتم‌های معتبر با ایندکس طرح موجود
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (it) => it && Number.isInteger(it.car) && it.car >= 0 && it.car < DESIGNS.length && it.qty > 0
      );
    } catch (e) { return []; }
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
    if (!cartItemsEl || !cartDrawer) return;
    cartItemsEl.innerHTML = "";
    const count = cartState.reduce((s, it) => s + it.qty, 0);
    if (cartBadge) {
      cartBadge.hidden = count === 0;
      cartBadge.textContent = faNum(count);
    }
    if (cartEmptyEl) cartEmptyEl.style.display = cartState.length ? "none" : "block";

    cartState.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "cart-item";
      const info = document.createElement("div");
      info.className = "cart-item-info";
      const d = DESIGNS[item.car];
      if (!d) return;
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
      rm.setAttribute("aria-label", `${t("_remove")} — ${lang === "fa" ? d.fa : d.en}`);
      rm.addEventListener("click", () => { cartState.splice(idx, 1); saveCart(); renderCart(); });
      li.append(info, rm);
      cartItemsEl.append(li);
    });

    const total = cartState.reduce((s, it) => s + (DESIGNS[it.car] ? DESIGNS[it.car].price * it.qty : 0), 0);
    if (cartTotalEl) cartTotalEl.textContent = `${faNum(total)} ${t("_toman")}`;

    // همگام‌سازی دکمه‌های Add — طرحی که در سبد هست زرد می‌ماند («Added ✓»)
    document.querySelectorAll(".card-add").forEach((b) => {
      const inCart = cartState.some((it) => it.car === Number(b.dataset.design));
      b.classList.toggle("added", inCart);
      b.textContent = inCart ? t("_added") : t("_add");
    });

    // دکمهٔ زرد سبد = ادامهٔ خرید در سایت اصلی (با اقلام همین سبد)، نه واتساپ
    if (cartOrderBtn) cartOrderBtn.href = checkoutUrl();
  }

  function addToCart(btn, car) {
    const existing = cartState.find((it) => it.car === car);
    if (existing) existing.qty += 1;
    else cartState.push({ car, qty: 1 });
    saveCart();
    renderCart();
    // کشو باز نمی‌شود — فقط آیتم به سبدِ بالای صفحه اضافه می‌شود؛
    // وضعیت دکمه (زرد = در سبد) در renderCart همگام می‌شود
  }

  function openCart() {
    if (!cartDrawer) return;
    cartDrawer.hidden = false;
    requestAnimationFrame(() => cartDrawer.classList.add("open"));
    if (lenis) lenis.stop();
  }
  function closeCart() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove("open");
    if (lenis) lenis.start();
    setTimeout(() => { cartDrawer.hidden = true; }, 380);
  }

  // لینک ادامهٔ خرید در سایت اصلی: دو سایت cross-origin‌اند و localStorage بینشان
  // به اشتراک گذاشته نمی‌شود، پس اقلام از طریق پارامتر URL به سبد سایت اصلی می‌روند
  // (آنجا مشخصات کاربر و مراحل پرداخت تکمیل می‌شود).
  const CHECKOUT_BASE = "https://wrapmode.ir/cart/";
  function checkoutUrl() {
    const items = cartState
      .filter((it) => DESIGNS[it.car])
      .map((it) => `${DESIGNS[it.car].en}:${it.qty}`)
      .join(",");
    return items ? `${CHECKOUT_BASE}?items=${encodeURIComponent(items)}` : CHECKOUT_BASE;
  }

  function initCart() {
    // آیکون سبد هدر و دکمهٔ زرد داخل سبد، هر دو کاربر را به سبد سایت اصلی می‌فرستند
    const openBtn = document.getElementById("cart-open-btn");
    const closeBtn = document.getElementById("cart-close-btn");
    const backdrop = document.getElementById("cart-backdrop");
    if (openBtn) {
      openBtn.addEventListener("click", () => { window.location.href = checkoutUrl(); });
    }
    // دکمهٔ زرد داخل سبد لینک است (نه دکمه) تا وسط‌کلیک/بازکردن در تب نو هم کار کند؛
    // href آن در renderCart با اقلام همین سبد همگام می‌شود.
    if (closeBtn) closeBtn.addEventListener("click", closeCart);
    if (backdrop) backdrop.addEventListener("click", closeCart);
  }

  // ---------- تماس ----------
  function initContact() {
    const modal = document.getElementById("contact-modal");
    const openBtn = document.getElementById("nav-contact-btn");
    const mOpenBtn = document.getElementById("m-contact-btn");
    const closeBtn = document.getElementById("contact-close-btn");
    const waBtn = document.getElementById("contact-whatsapp-btn");
    const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("سلام، از سایت ورپ‌مود پیام می‌دهم.")}`;
    if (waBtn) waBtn.href = waUrl;
    if (!modal) return;
    const openModal = (e) => { e.preventDefault(); modal.hidden = false; };
    if (openBtn) openBtn.addEventListener("click", openModal);
    if (mOpenBtn) mOpenBtn.addEventListener("click", openModal);
    if (closeBtn) closeBtn.addEventListener("click", () => { modal.hidden = true; });
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.hidden = true; });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.hidden) modal.hidden = true;
    });

    // منوی همبرگری هدر (زیر ۱۰۲۴px مثل سایت اصلی)
    const menuBtn = document.getElementById("menu-toggle");
    const drawer = document.getElementById("head-drawer");
    if (menuBtn && drawer) {
      menuBtn.addEventListener("click", () => {
        const willOpen = drawer.hidden;
        drawer.hidden = !willOpen;
        menuBtn.setAttribute("aria-expanded", String(willOpen));
      });
      drawer.addEventListener("click", (e) => {
        if (e.target.closest("a")) {
          drawer.hidden = true;
          menuBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
  }

  // ---------- زبان ----------
  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const v = t(el.dataset.i18n);
      if (v) el.textContent = v;
    });
    if (progressEl) progressEl.style.transformOrigin = lang === "fa" ? "right" : "left";
    document.title = lang === "fa" ? "WRAPMODE — استودیو رپ خودرو" : "WRAPMODE — Car Wrap Studio";
    document.querySelectorAll(".stat-number").forEach((el) => {
      if (el.dataset.done) el.textContent = faNum(parseFloat(el.dataset.value));
    });
    renderCards();
    renderCart();
  }

  // ---------- ناوبری ----------
  function initNavScroll() {
    document.querySelectorAll('a[href="#collection"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const el = document.getElementById("collection");
        if (!el) return;
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
    if (prefersReducedMotion || typeof gsap === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const dot = document.getElementById("cursor");
    if (!dot) return;
    let mx = -100, my = -100, cx = -100, cy = -100, seen = false, lastT = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (!seen) { seen = true; cx = mx; cy = my; dot.style.opacity = "1"; }
    });
    document.addEventListener("mouseover", (e) => {
      const hot = e.target.closest("a, button");
      dot.style.transform = `translate(-50%, -50%) scale(${hot ? 2.4 : 1})`;
      dot.style.transition = "transform 0.18s ease";
    });
    gsap.ticker.add((time) => {
      // میرایی وابسته به زمان واقعی: روی ۱۲۰Hz همان حسِ ۶۰Hz (سرِ کشیده‌تر و نرم‌تر)
      let dt = lastT ? (time - lastT) : 1 / 60;
      if (dt > 1 / 30) dt = 1 / 30;
      lastT = time;
      const a = 1 - Math.exp(-dt * 14);
      cx += (mx - cx) * a;
      cy += (my - cy) * a;
      dot.style.left = cx + "px";
      dot.style.top = cy + "px";
    });
  }

  // ---------- راه‌اندازی ----------
  function boot() {
    applyLang();
    resizeCanvas();
    measureScroll();

    // resize با debounce سبک — تغییر ابعاد فقط یک‌بار در فریم بعد اعمال شود
    let resizeRaf = 0;
    const onResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        resizeCanvas();
        measureScroll();
        positionCaptions();
        render();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    // ارتفاع سند با لود فریم‌ها/فونت‌ها تغییر می‌کند → اندازه را کش‌شده نگه دار
    if (typeof ResizeObserver !== "undefined") {
      try {
        new ResizeObserver(() => {
          measureScroll();
          positionCaptions();
        }).observe(document.body);
      } catch (e) { /* ساکت */ }
    }

    setupCaptions();
    initCounters();
    initMotionPreference();
    startRenderLoop();
    initNavScroll();
    initCart();
    initContact();
    initCursor();
    // یک رندر اولیه تا فریم هیرو قبل از لود کامل کشیده شود
    render();
    preload();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
