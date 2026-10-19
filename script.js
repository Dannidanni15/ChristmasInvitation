/* ==========================================================
   Open House Navideño · Mishelle ♥ Dereck
   ========================================================== */
(() => {
  "use strict";

  const EVENT = {
    title: "Open House Navideño 🎄 con Mishelle",
    place: "Hogar de Damas",
    description: "Open House navideño en el Hogar de Damas. Vestimenta: elegante. ¡Te espero! ❤",
    start: new Date(2026, 9, 23, 18, 30, 0), // viernes 23 de octubre, 6:30 p.m. (hora local)
    durationHours: 3,
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, val); } catch { /* sin almacenamiento */ } },
  };

  /* ---------- Ramita de pino (agujas generadas) ---------- */
  function buildSprig() {
    const symbol = $("#sprig");
    if (!symbol) return;
    const ns = "http://www.w3.org/2000/svg";
    const stemY = (x) => 20 - Math.sin((x / 110) * Math.PI) * 2.5;
    const layers = [
      { color: "#173326", width: 1.5, spread: 1, offset: 0 },
      { color: "#2c5240", width: 1.3, spread: .85, offset: 1.6 },
      { color: "#4d7a5f", width: 1, spread: .6, offset: 3 },
    ];
    let html = `<path d="M0 20 Q55 15 108 19" stroke="#3b2a1e" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
    layers.forEach((layer) => {
      let d = "";
      for (let x = layer.offset; x < 102; x += 3.1) {
        const t = x / 105;
        const len = (13 - t * 7) * layer.spread;
        const y = stemY(x);
        const ang = 0.75 + rand(-0.12, 0.12);
        d += `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(ang) * len).toFixed(1)} ${(-Math.sin(ang) * len).toFixed(1)}`;
        d += `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(ang) * len).toFixed(1)} ${(Math.sin(ang) * len).toFixed(1)}`;
      }
      html += `<path d="${d}" stroke="${layer.color}" stroke-width="${layer.width}" stroke-linecap="round" fill="none"/>`;
    });
    // el SVG <symbol> necesita parsearse en el namespace SVG
    const tmp = document.createElementNS(ns, "svg");
    tmp.innerHTML = html;
    while (tmp.firstChild) symbol.appendChild(tmp.firstChild);
  }

  /* ---------- Bokeh ---------- */
  function buildBokeh() {
    const layer = $(".bokeh");
    const colors = ["rgba(255,217,152,.9)", "rgba(227,207,159,.8)", "rgba(232,196,192,.7)", "rgba(255,190,140,.75)", "rgba(180,70,90,.6)"];
    const count = window.innerWidth < 600 ? 14 : 22;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      const size = rand(30, 130);
      s.style.cssText = `
        left:${rand(-5, 95)}%; top:${rand(-5, 95)}%;
        width:${size}px; height:${size}px;
        --c:${colors[i % colors.length]};
        --b:${rand(1, 6).toFixed(1)}px;
        --o:${rand(.18, .5).toFixed(2)};
        --t:${rand(10, 22).toFixed(1)}s;
        --delay:${(-rand(0, 20)).toFixed(1)}s;
        --dx:${rand(-40, 40).toFixed(0)}px; --dy:${rand(-60, 20).toFixed(0)}px;`;
      frag.appendChild(s);
    }
    layer.appendChild(frag);
  }

  /* ---------- Nieve ---------- */
  const snow = (() => {
    const canvas = $("#snow");
    const ctx = canvas.getContext("2d");
    let flakes = [];
    let w = 0, h = 0, dpr = 1, raf = 0, running = false, last = 0;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(Math.min(130, Math.max(45, (w * h) / 9000)));
      while (flakes.length < target) flakes.push(makeFlake(true));
      flakes.length = target;
    }

    function makeFlake(anywhere) {
      const r = Math.random() < .85 ? rand(.8, 2.2) : rand(2.4, 3.6);
      return {
        x: rand(0, w),
        y: anywhere ? rand(-h, h) : rand(-40, -10),
        r,
        vy: r * rand(9, 15),
        sway: rand(.4, 1.4),
        phase: rand(0, Math.PI * 2),
        o: rand(.35, .9),
      };
    }

    function frame(now) {
      const dt = Math.min(.05, (now - last) / 1000 || 0);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      for (const f of flakes) {
        f.phase += dt * f.sway;
        f.y += f.vy * dt;
        f.x += Math.sin(f.phase) * f.sway * 12 * dt;
        if (f.y > h + 8) Object.assign(f, makeFlake(false));
        ctx.globalAlpha = f.o;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      canvas.style.display = "";
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
      canvas.style.display = "none";
    }

    resize();
    let resizeT;
    window.addEventListener("resize", () => {
      clearTimeout(resizeT);
      resizeT = setTimeout(resize, 150);
    });

    return { start, stop, get running() { return running; } };
  })();

  let snowWanted = !reduceMotion;
  if (snowWanted) snow.start(); else snow.stop();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) snow.stop();
    else if (snowWanted) snow.start();
  });

  /* ---------- Destellos y corazones al tocar ---------- */
  const sparkLayer = $(".sparkle-layer");
  const SPARK_GLYPHS = ["✦", "✧", "♥\uFE0E", "✦", "♥\uFE0E", "·"];
  const SPARK_COLORS = ["#e3cf9f", "#ffd998", "#e8c4c0", "#f3b3b8", "#fff4dc"];

  function burst(x, y, { count = 9, spread = 70, hearts = false, sizeMax = 20 } = {}) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
      const el = document.createElement("span");
      el.className = "spark";
      el.textContent = hearts ? "♥\uFE0E" : SPARK_GLYPHS[i % SPARK_GLYPHS.length];
      const angle = rand(0, Math.PI * 2);
      const dist = rand(spread * .4, spread);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
      el.style.setProperty("--ty", `${Math.sin(angle) * dist - (hearts ? 40 : 15)}px`);
      el.style.setProperty("--r", `${rand(-60, 60)}deg`);
      el.style.setProperty("--s", `${rand(10, sizeMax)}px`);
      el.style.setProperty("--dur", `${rand(.8, 1.4)}s`);
      el.style.setProperty("--c", hearts
        ? ["#e8c4c0", "#d49a97", "#f3b3b8", "#c9a96e", "#b5465c"][i % 5]
        : SPARK_COLORS[i % SPARK_COLORS.length]);
      el.addEventListener("animationend", () => el.remove(), { once: true });
      sparkLayer.appendChild(el);
    }
  }

  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".lightbox, .controls")) return;
    burst(e.clientX, e.clientY, { count: 7, spread: 55, sizeMax: 18 });
  }, { passive: true });

  /* ---------- Sobre ---------- */
  const intro = $("#intro");
  const page = $("#page");
  const controls = $("#controls");
  let opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;
    const sealRect = $("#seal").getBoundingClientRect();
    burst(sealRect.left + sealRect.width / 2, sealRect.top + sealRect.height / 2, { count: 18, spread: 120, sizeMax: 22 });

    const speed = reduceMotion ? .25 : 1;
    intro.classList.add("is-opening");
    setTimeout(() => intro.classList.add("is-flap-back"), 450 * speed);
    setTimeout(() => {
      intro.classList.add("is-gone");
      document.body.classList.remove("is-locked");
      document.body.classList.add("is-open");
      page.removeAttribute("aria-hidden");
      controls.hidden = false;
      window.scrollTo(0, 0);
    }, 2300 * speed);
    setTimeout(() => intro.remove(), 3400 * speed);
  }

  $("#seal").addEventListener("click", openEnvelope);
  $("#envelope").addEventListener("click", (e) => {
    if (!e.target.closest("#seal")) openEnvelope();
  });

  /* ---------- Revelado al hacer scroll ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .18, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el) => revealObserver.observe(el));

  /* ---------- Máquina de escribir ---------- */
  const tw = $("#typewriter");
  const twText = tw.dataset.text;
  if (reduceMotion) {
    tw.textContent = twText;
  } else {
    const twObserver = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      twObserver.disconnect();
      const textNode = document.createTextNode("");
      const caret = document.createElement("span");
      caret.className = "caret";
      caret.setAttribute("aria-hidden", "true");
      tw.append(textNode, caret);
      let i = 0;
      const type = () => {
        textNode.data = twText.slice(0, ++i);
        if (i < twText.length) {
          const ch = twText[i - 1];
          setTimeout(type, ch === "," ? 380 : ch === " " ? 70 : rand(45, 95));
        } else {
          setTimeout(() => caret.remove(), 2600);
        }
      };
      setTimeout(type, 500);
    }, { threshold: .6 });
    twObserver.observe(tw);
  }

  /* ---------- Cuenta regresiva ---------- */
  const cdEls = {
    days: $('[data-unit="days"]'),
    hours: $('[data-unit="hours"]'),
    minutes: $('[data-unit="minutes"]'),
    seconds: $('[data-unit="seconds"]'),
  };
  const pad = (n) => String(n).padStart(2, "0");
  let cdTimer;

  function tickCountdown() {
    const diff = EVENT.start - Date.now();
    if (diff <= 0) {
      clearInterval(cdTimer);
      $("#countdown").hidden = true;
      $("#countdown-done").hidden = false;
      return;
    }
    const s = Math.floor(diff / 1000);
    const values = {
      days: Math.floor(s / 86400),
      hours: Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60,
    };
    for (const [unit, el] of Object.entries(cdEls)) {
      const v = pad(values[unit]);
      if (el.textContent !== v) {
        el.textContent = v;
        const orn = el.closest(".ornament");
        orn.classList.remove("is-tick");
        void orn.offsetWidth;
        orn.classList.add("is-tick");
      }
    }
  }
  tickCountdown();
  cdTimer = setInterval(tickCountdown, 1000);

  /* ---------- Lightbox ---------- */
  const polaroids = $$(".polaroid");
  const lb = $("#lightbox");
  const lbImg = $("img", lb);
  const lbCap = $("figcaption", lb);
  let lbIndex = 0;
  let lastFocus = null;

  function showPhoto(i) {
    lbIndex = (i + polaroids.length) % polaroids.length;
    const p = polaroids[lbIndex];
    const small = $("img", p);
    lbImg.src = small.getAttribute("src").replace(".jpg", "-grande.jpg");
    lbImg.alt = small.alt;
    lbCap.textContent = $("span", p).textContent;
  }

  function openLightbox(i) {
    lastFocus = document.activeElement;
    showPhoto(i);
    lb.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => lb.classList.add("is-open")));
    document.body.classList.add("is-locked");
    $(".lightbox__close", lb).focus({ preventScroll: true });
  }

  function closeLightbox() {
    lb.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    setTimeout(() => { lb.hidden = true; lbImg.removeAttribute("src"); }, reduceMotion ? 0 : 450);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  polaroids.forEach((p, i) => p.addEventListener("click", () => openLightbox(i)));
  $(".lightbox__close", lb).addEventListener("click", closeLightbox);
  $(".lightbox__nav--prev", lb).addEventListener("click", (e) => { e.stopPropagation(); showPhoto(lbIndex - 1); });
  $(".lightbox__nav--next", lb).addEventListener("click", (e) => { e.stopPropagation(); showPhoto(lbIndex + 1); });
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) {
      if (!opened && (e.key === "Enter" || e.key === " ") && document.activeElement === document.body) openEnvelope();
      return;
    }
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPhoto(lbIndex - 1);
    if (e.key === "ArrowRight") showPhoto(lbIndex + 1);
  });

  let touchX = null;
  lb.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showPhoto(lbIndex + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Confirmar asistencia ---------- */
  const rsvpBtn = $("#rsvp-btn");
  const rsvpMsg = $("#rsvp-msg");

  function setConfirmed(animate) {
    rsvpBtn.classList.add("is-confirmed");
    $(".btn__label", rsvpBtn).textContent = "¡Confirmado!";
    rsvpMsg.textContent = "¡Te espero! ❤️";
    rsvpMsg.classList.add("is-shown");
    if (!animate) return;
    rsvpBtn.classList.remove("is-pop");
    void rsvpBtn.offsetWidth;
    rsvpBtn.classList.add("is-pop");
    const r = rsvpBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    burst(cx, cy, { count: 26, spread: 170, hearts: true, sizeMax: 28 });
    setTimeout(() => burst(cx, cy - 20, { count: 14, spread: 120, sizeMax: 18 }), 220);
    setTimeout(() => burst(cx, cy, { count: 16, spread: 210, hearts: true, sizeMax: 22 }), 450);
  }

  if (store.get("rsvp-dereck") === "si") setConfirmed(false);
  rsvpBtn.addEventListener("click", () => {
    store.set("rsvp-dereck", "si");
    setConfirmed(true);
  });

  /* ---------- Calendario ---------- */
  const end = new Date(EVENT.start.getTime() + EVENT.durationHours * 3600 * 1000);
  const fmtLocal = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const fmtUTC = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const icsEscape = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

  $("#ics-btn").addEventListener("click", () => {
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Mishelle y Dereck//Open House Navideño//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:open-house-navideno-20261023-${Date.now()}@mishelle-dereck`,
      `DTSTAMP:${fmtUTC(new Date())}`,
      `DTSTART:${fmtLocal(EVENT.start)}`,
      `DTEND:${fmtLocal(end)}`,
      `SUMMARY:${icsEscape(EVENT.title)}`,
      `LOCATION:${icsEscape(EVENT.place)}`,
      `DESCRIPTION:${icsEscape(EVENT.description)}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT3H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Hoy es el Open House navideño ✨",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "open-house-navideno.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  });

  const gcal = new URL("https://calendar.google.com/calendar/render");
  gcal.searchParams.set("action", "TEMPLATE");
  gcal.searchParams.set("text", EVENT.title);
  gcal.searchParams.set("dates", `${fmtLocal(EVENT.start)}/${fmtLocal(end)}`);
  gcal.searchParams.set("details", EVENT.description);
  gcal.searchParams.set("location", EVENT.place);
  $("#gcal-link").href = gcal.toString();

  /* ---------- Controles: nieve ---------- */
  const snowBtn = $("#snow-toggle");
  const syncSnowBtn = () => {
    snowBtn.setAttribute("aria-pressed", String(snowWanted));
    snowBtn.setAttribute("aria-label", snowWanted ? "Desactivar nieve" : "Activar nieve");
  };
  syncSnowBtn();
  snowBtn.addEventListener("click", () => {
    snowWanted = !snowWanted;
    snowWanted ? snow.start() : snow.stop();
    syncSnowBtn();
  });

  /* ---------- Música: caja musical "Noche de paz" (Web Audio) ---------- */
  const music = (() => {
    // [nota MIDI, duración en corcheas] — 6/8
    const MELODY = [
      [67, 3], [69, 1], [67, 2], [64, 6],
      [67, 3], [69, 1], [67, 2], [64, 6],
      [74, 4], [74, 2], [71, 6],
      [72, 4], [72, 2], [67, 6],
      [69, 4], [69, 2], [72, 3], [71, 1], [69, 2],
      [67, 3], [69, 1], [67, 2], [64, 6],
      [69, 4], [69, 2], [72, 3], [71, 1], [69, 2],
      [67, 3], [69, 1], [67, 2], [64, 6],
      [74, 4], [74, 2], [77, 3], [74, 1], [71, 2],
      [72, 6], [76, 6],
      [72, 3], [67, 1], [64, 2], [67, 3], [65, 1], [62, 2],
      [60, 12],
    ];
    const CHORDS = "C C C C G G C C F F C C F F C C G G C C C G C C".split(" ");
    const BASS = { C: [48, 55], F: [41, 48], G: [43, 50] };
    const EIGHTH = .34;
    const LOOP_EIGHTHS = 24 * 6 + 6; // 24 compases + respiro

    let ctx = null, master = null, timer = 0, playing = false;
    let loopStart = 0;
    let events = [];
    let cursor = 0;

    const freq = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function buildEvents() {
      events = [];
      let t = 0;
      for (const [note, dur] of MELODY) {
        events.push({ at: t, note: note + 12, kind: "bell" });
        t += dur;
      }
      CHORDS.forEach((ch, bar) => {
        const [root, fifth] = BASS[ch];
        events.push({ at: bar * 6, note: root, kind: "bass" });
        events.push({ at: bar * 6 + 3, note: fifth, kind: "bass" });
      });
      events.sort((a, b) => a.at - b.at);
    }

    function setup() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0;
      const delay = ctx.createDelay();
      delay.delayTime.value = EIGHTH * 1.5;
      const feedback = ctx.createGain();
      feedback.gain.value = .28;
      const wet = ctx.createGain();
      wet.gain.value = .32;
      const tone = ctx.createBiquadFilter();
      tone.type = "lowpass";
      tone.frequency.value = 3200;
      master.connect(tone);
      tone.connect(ctx.destination);
      master.connect(delay);
      delay.connect(feedback);
      feedback.connect(delay);
      delay.connect(wet);
      wet.connect(tone);
      buildEvents();
    }

    function note(time, midi, kind) {
      const f = freq(midi);
      const env = ctx.createGain();
      env.connect(master);
      const partials = kind === "bell"
        ? [[1, .22, "sine"], [2, .07, "sine"], [3.01, .025, "triangle"], [4.2, .01, "sine"]]
        : [[1, .14, "sine"], [2, .025, "triangle"]];
      const decay = kind === "bell" ? 2.2 : 2.6;
      env.gain.setValueAtTime(0, time);
      env.gain.linearRampToValueAtTime(1, time + (kind === "bell" ? .006 : .04));
      env.gain.exponentialRampToValueAtTime(.001, time + decay);
      partials.forEach(([mult, gain, type]) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.value = f * mult;
        g.gain.value = gain;
        o.connect(g);
        g.connect(env);
        o.start(time);
        o.stop(time + decay + .05);
      });
    }

    function schedule() {
      const ahead = ctx.currentTime + .4;
      while (true) {
        if (cursor >= events.length) {
          cursor = 0;
          loopStart += LOOP_EIGHTHS * EIGHTH;
        }
        const ev = events[cursor];
        const at = loopStart + ev.at * EIGHTH;
        if (at > ahead) break;
        if (at >= ctx.currentTime - .02) note(at, ev.note, ev.kind);
        cursor++;
      }
    }

    function play() {
      if (!ctx) setup();
      ctx.resume();
      playing = true;
      cursor = 0;
      loopStart = ctx.currentTime + .15;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(.55, ctx.currentTime + 1.2);
      schedule();
      timer = setInterval(schedule, 120);
    }

    function pause() {
      playing = false;
      clearInterval(timer);
      if (!ctx) return;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + .6);
      setTimeout(() => { if (!playing) ctx.suspend(); }, 700);
    }

    return { toggle() { playing ? pause() : play(); return playing; }, pause, get playing() { return playing; } };
  })();

  const musicBtn = $("#music-toggle");
  musicBtn.addEventListener("click", () => {
    const on = music.toggle();
    musicBtn.setAttribute("aria-pressed", String(on));
    musicBtn.setAttribute("aria-label", on ? "Pausar música" : "Activar música navideña");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && music.playing) {
      music.pause();
      musicBtn.setAttribute("aria-pressed", "false");
      musicBtn.setAttribute("aria-label", "Activar música navideña");
    }
  });

  /* ---------- Inicio ---------- */
  buildSprig();
  buildBokeh();
})();
