/* ===== Base común de los minijuegos (se incrusta en cada plantilla) =====
   Expone window.MJ. Cada juego llama a MJ.iniciar({...}) y usa MJ.hud, MJ.flash, MJ.fin, MJ.sfx... */
const MJ = (function () {
  'use strict';
  const D = DATOS;
  const T = D.textos;
  const TEMA = D.tema || {};
  const JUEGO = D.juego;
  const CLAVE = 'juego-estudio:' + (D.meta.id || D.meta.titulo);
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const azar = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const fmt = (n) => Number(n).toLocaleString(D.meta.idioma || 'es');
  const reducido = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esTactil = () => window.matchMedia && matchMedia('(pointer: coarse)').matches;
  const moneda = T.moneda || T.puntos;

  const ICON = {
    estrella: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z"/></svg>',
    sonido: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/></svg>',
    mudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
    pausa: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',
  };

  // ---------- Tema ----------
  const svgUrl = (svg) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  function patron(tipo, color) {
    if (tipo === 'puntos') return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22"><circle cx="11" cy="11" r="1.4" fill="${color}"/></svg>`);
    if (tipo === 'rejilla') return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36"><path d="M36 0H0v36" fill="none" stroke="${color}" stroke-width=".8"/></svg>`);
    if (tipo === 'ondas') return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="80" height="20"><path d="M0 10q20-12 40 0t40 0" fill="none" stroke="${color}" stroke-width="1"/></svg>`);
    let d = '';
    for (let k = 0; k < 6; k++) {
      d += 'M0 30 ';
      for (let x = 0; x <= 120; x += 3) d += `L${x} ${(30 + Math.sin((x / 120) * Math.PI * 4 + k * 1.05) * 18 * Math.cos((x / 120) * Math.PI * 2 + k * .4)).toFixed(2)} `;
    }
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="60"><path d="${d}" fill="none" stroke="${color}" stroke-width=".7"/></svg>`);
  }
  function aplicarTema() {
    const c = TEMA.colores || {};
    const r = document.documentElement.style;
    const mapa = { fondo: '--shell', superficie: '--papel', texto: '--tinta', textoSuave: '--tinta-suave', textoClaro: '--claro', acento: '--acento', oro: '--oro', acierto: '--acierto', fallo: '--fallo' };
    for (const [k, v] of Object.entries(c)) if (mapa[k]) r.setProperty(mapa[k], v);
    const f = TEMA.fuentes || {};
    if (f.display) r.setProperty('--f-display', f.display);
    if (f.texto) r.setProperty('--f-texto', f.texto);
    if (f.mono) r.setProperty('--f-mono', f.mono);
    if (TEMA.googleFonts) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = TEMA.googleFonts; document.head.appendChild(l); }
    const tipo = (TEMA.motivo && TEMA.motivo.patron) || 'guilloche';
    r.setProperty('--patron', patron(tipo, c.textoClaro || '#efe3c6'));
    r.setProperty('--grano', svgUrl('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .9 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>'));
    document.documentElement.lang = D.meta.idioma || 'es';
    document.title = JUEGO.titulo;
  }
  const color = (nombre) => getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();

  // ---------- Sonido ----------
  // Dos canales: EFECTOS (misma preferencia que el examen) y MÚSICA/AMBIENTE. Todo pasa por WebAudio
  // para poder controlar el volumen también en iOS. Los efectos y el ambiente se sintetizan; la música
  // puede ser una grabación incrustada (JUEGO.sonido.musica.src).
  const CLAVE_SONIDO = CLAVE + ':sonido';
  const CLAVE_MUSICA = CLAVE + ':musica';
  let sonidoOn = true, musicaOn = true;
  try { sonidoOn = localStorage.getItem(CLAVE_SONIDO) !== 'off'; musicaOn = localStorage.getItem(CLAVE_MUSICA) !== 'off'; } catch (e) {}
  const CFG_SONIDO = JUEGO.sonido || {};
  const PRESETS = {
    // ambiente: multitud | viento | naturaleza | pulsos | ninguno ; perc: caja | marco | tabor | madera | electronica
    revolucion: { ambiente: 'multitud', campanas: true, perc: 'caja', metal: 'sawtooth', fanfarria: [392, 523, 659, 784], trompeta: [147, 110] },
    antiguedad: { ambiente: 'viento', campanas: false, perc: 'marco', metal: 'triangle', fanfarria: [294, 370, 440, 587], trompeta: [196, 147] },
    medieval: { ambiente: 'multitud', campanas: true, perc: 'tabor', metal: 'square', fanfarria: [294, 440, 523, 587], trompeta: [147, 131] },
    naturaleza: { ambiente: 'naturaleza', campanas: false, perc: 'madera', metal: 'sine', fanfarria: [523, 659, 784, 1047], trompeta: [220, 165] },
    tecnologia: { ambiente: 'pulsos', campanas: false, perc: 'electronica', metal: 'square', fanfarria: [440, 554, 659, 880], trompeta: [110, 82] },
  };
  const P = PRESETS[CFG_SONIDO.preset] || PRESETS.revolucion;
  let ctx = null, gEfectos = null, gFondo = null;
  function contexto() {
    try {
      if (!ctx) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        gEfectos = ctx.createGain(); gEfectos.gain.value = sonidoOn ? 1 : 0; gEfectos.connect(ctx.destination);
        gFondo = ctx.createGain(); gFondo.gain.value = musicaOn ? 1 : 0; gFondo.connect(ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { return null; }
    return ctx;
  }
  const audio = () => (sonidoOn ? contexto() : null);
  let ruidoBuf = null;
  function ruido() {
    const c = contexto(); if (!c) return null;
    if (!ruidoBuf) { const n = c.sampleRate * 2; ruidoBuf = c.createBuffer(1, n, c.sampleRate); const d = ruidoBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
    return ruidoBuf;
  }
  function tono(f, t0, dur, tipo, vol, destino, fFin) {
    const c = audio(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = tipo || 'triangle'; o.frequency.setValueAtTime(f, t);
    if (fFin) o.frequency.exponentialRampToValueAtTime(fFin, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol || .16, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    let salida = g;
    if (tipo === 'sawtooth' || tipo === 'square') { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1800; g.connect(fl); salida = fl; }
    o.connect(g); salida.connect(destino || gEfectos); o.start(t); o.stop(t + dur + .05);
  }
  function rafaga(t0, dur, filtro, freq, vol, q, destino) {
    const c = audio(); if (!c) return;
    const s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), t = c.currentTime + t0;
    s.buffer = ruido(); fl.type = filtro; fl.frequency.value = freq; fl.Q.value = q || .8;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(fl).connect(g).connect(destino || gEfectos); s.start(t, Math.random()); s.stop(t + dur + .05);
  }
  function golpe(vol) { rafaga(0, .12, 'lowpass', 900, vol || .5); }
  function percusion(t0, fuerte) {
    const v = fuerte ? 1 : .6;
    if (P.perc === 'caja') { rafaga(t0, .09, 'highpass', 1800, .35 * v); tono(190, t0, .06, 'triangle', .08 * v); }
    else if (P.perc === 'marco') { tono(95, t0, .25, 'sine', .3 * v, null, 60); rafaga(t0, .05, 'bandpass', 800, .12 * v); }
    else if (P.perc === 'tabor') { tono(140, t0, .15, 'sine', .22 * v, null, 90); rafaga(t0, .07, 'bandpass', 1500, .2 * v); }
    else if (P.perc === 'madera') { tono(620, t0, .05, 'sine', .18 * v); rafaga(t0, .03, 'bandpass', 2500, .12 * v); }
    else { tono(60, t0, .18, 'sine', .35 * v, null, 40); rafaga(t0, .04, 'highpass', 5000, .1 * v); }
  }
  function campana(t0, f, vol, destino) {
    [1, 2.01, 2.43, 3.0, 4.1].forEach((m, i) => tono(f * m, t0, 2.6 - i * .35, 'sine', (vol || .06) / (i + 1), destino));
  }
  // Redoble en bucle (suspense al elegir)
  let redobleT = 0, redobleN = 0;
  function redoble(on) {
    clearInterval(redobleT); redobleT = 0;
    if (!on || !audio()) return;
    redobleN = 0;
    redobleT = setInterval(() => { redobleN++; const cresc = Math.min(1, .35 + redobleN / 80); rafaga(0, .05, P.perc === 'electronica' ? 'highpass' : 'bandpass', P.perc === 'caja' ? 2200 : 900, .16 * cresc, 1.2); }, 48);
  }
  const sfx = {
    acierto: () => { tono(659, 0, .16); tono(988, .09, .28); },
    fallo: () => { golpe(.45); tono(196, .03, .3, 'sawtooth', .07); },
    moneda: () => { tono(1319, 0, .08, 'square', .05); tono(1760, .06, .14, 'square', .05); },
    paso: () => tono(440, 0, .04, 'sine', .04),
    golpe: () => golpe(.6),
    tic: () => tono(880, 0, .05, 'sine', .05),
    cuenta: (fin) => tono(fin ? 880 : 523, 0, fin ? .35 : .15, 'triangle', .14),
    victoria: () => [523, 659, 784, 1047].forEach((f, i) => tono(f, i * .1, .45, 'triangle', .14)),
    derrota: () => [392, 330, 262].forEach((f, i) => tono(f, i * .14, .4, 'triangle', .12)),
    // Efectos temáticos
    adoquin: (alt) => rafaga(0, .045, 'bandpass', alt ? 1700 : 1300, .09, 2.5),
    madera: () => { rafaga(0, .18, 'lowpass', 420, .7); tono(120, 0, .16, 'sine', .25, null, 70); },
    canon: () => { rafaga(0, 1.1, 'lowpass', 160, .9, .5); tono(70, 0, .8, 'sine', .35, null, 35); },
    fanfarria: () => P.fanfarria.forEach((f, i) => tono(f, .18 + i * .09, i === 3 ? .5 : .14, P.metal, .1)),
    trompeta: () => { tono(P.trompeta[0], 0, .7, P.metal === 'sine' ? 'triangle' : P.metal, .12, null, P.trompeta[1]); percusion(0, true); },
    aclamacion: () => { rafaga(0, 2.4, 'bandpass', 900, .5, .6); rafaga(.3, 2.2, 'bandpass', 1400, .35, .7); if (P.campanas) { campana(.1, 392, .07); campana(.9, 330, .07); } sfx.fanfarria(); },
    tamborLento: () => [0, .7, 1.4].forEach((t) => percusion(t, true)),
    percusion: (fuerte) => percusion(0, fuerte),
  };

  // Ambiente sintetizado (canal música/ambiente)
  let amb = null, campanasT = 0;
  function ambienteIniciar() {
    const c = contexto(); if (!c || amb || P.ambiente === 'ninguno') return;
    amb = { nodos: [] };
    const g = c.createGain(); g.gain.value = .0001; g.connect(gFondo); amb.g = g;
    const lazo = (filtro, f, q, vol) => {
      const s = c.createBufferSource(); s.buffer = ruido(); s.loop = true;
      const fl = c.createBiquadFilter(); fl.type = filtro; fl.frequency.value = f; fl.Q.value = q;
      const gg = c.createGain(); gg.gain.value = vol;
      s.connect(fl).connect(gg).connect(g); s.start(); amb.nodos.push(s); return { fl, gg };
    };
    const lfo = (param, frec, prof) => { const o = c.createOscillator(), og = c.createGain(); o.frequency.value = frec; og.gain.value = prof; o.connect(og).connect(param); o.start(); amb.nodos.push(o); };
    if (P.ambiente === 'multitud') { const a = lazo('bandpass', 520, .6, .9); lfo(a.gg.gain, .35, .35); lfo(a.fl.frequency, .13, 120); const b = lazo('bandpass', 1100, 1.2, .35); lfo(b.gg.gain, .7, .2); }
    else if (P.ambiente === 'viento') { const a = lazo('lowpass', 400, .5, 1); lfo(a.fl.frequency, .08, 250); lfo(a.gg.gain, .11, .4); }
    else if (P.ambiente === 'naturaleza') { const a = lazo('highpass', 2500, .3, .25); lfo(a.gg.gain, .2, .15); }
    else if (P.ambiente === 'pulsos') { const o = c.createOscillator(); o.frequency.value = 55; const og = c.createGain(); og.gain.value = .25; o.connect(og).connect(g); o.start(); amb.nodos.push(o); lfo(og.gain, 2, .2); }
    // Sonidos ocasionales: campanas lejanas o pájaros
    const ocasional = () => {
      if (!amb || !musicaOn) return;
      if (P.campanas) { campanaFondo(); }
      else if (P.ambiente === 'naturaleza') [0, .15, .3].forEach((t) => tonoFondo(2200 + Math.random() * 1200, t, .12, 'sine', .04, 3200));
    };
    campanasT = setInterval(ocasional, 14000 + Math.random() * 6000);
  }
  function tonoFondo(f, t0, dur, tipo, vol, fFin) {
    const c = contexto(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + t0;
    o.type = tipo; o.frequency.setValueAtTime(f, t); if (fFin) o.frequency.exponentialRampToValueAtTime(fFin, t + dur);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g).connect(gFondo); o.start(t); o.stop(t + dur + .05);
  }
  function campanaFondo() { [0, 1.1, 2.2].forEach((t, i) => [1, 2.01, 2.43, 3].forEach((m, k) => tonoFondo((i % 2 ? 311 : 349) * m, t, 2.4 - k * .4, 'sine', .035 / (k + 1)))); }
  function ambienteParar() {
    clearInterval(campanasT);
    if (!amb) return;
    amb.nodos.forEach((n) => { try { n.stop(); } catch (e) {} });
    try { amb.g.disconnect(); } catch (e) {}
    amb = null;
  }
  function ambienteIntensidad(x) { if (amb && ctx) amb.g.gain.setTargetAtTime(.02 + Math.max(0, Math.min(1, x)) * .1, ctx.currentTime, .4); }

  // Música grabada (canal música/ambiente)
  let musEl = null, musGain = null, musRate = 1, atenuada = false;
  function musicaPreparar() {
    const m = CFG_SONIDO.musica;
    if (musEl || !m || !m.src) return;
    musEl = new Audio(); musEl.src = m.src; musEl.loop = true; musEl.preload = 'auto';
    musEl.preservesPitch = true; musEl.mozPreservesPitch = true; musEl.webkitPreservesPitch = true;
    const c = contexto();
    try { const srcN = c.createMediaElementSource(musEl); musGain = c.createGain(); musGain.gain.value = CFG_SONIDO.volumenMusica || .55; srcN.connect(musGain).connect(gFondo); }
    catch (e) { musGain = null; musEl.volume = musicaOn ? .55 : 0; }
  }
  function fondoIniciar() {
    contexto(); musicaPreparar(); ambienteIniciar();
    if (musEl) { musEl.currentTime = 0; musEl.playbackRate = musRate = 1; if (musicaOn) musEl.play().catch(() => {}); }
    atenuar(false);
  }
  function fondoPausar() { if (musEl) musEl.pause(); if (ctx && gFondo) gFondo.gain.setTargetAtTime(0, ctx.currentTime, .05); redoble(false); }
  function fondoReanudar() { if (musEl && musicaOn) musEl.play().catch(() => {}); if (ctx && gFondo) gFondo.gain.setTargetAtTime(musicaOn ? 1 : 0, ctx.currentTime, .1); }
  function fondoParar() { if (musEl) musEl.pause(); ambienteParar(); redoble(false); }
  function tempo(r) { if (!musEl || Math.abs(r - musRate) < .01) return; musRate = r; try { musEl.playbackRate = r; } catch (e) {} }
  function atenuar(on) {
    atenuada = on;
    const base = CFG_SONIDO.volumenMusica || .55;
    if (musGain && ctx) musGain.gain.setTargetAtTime(on ? base * .3 : base, ctx.currentTime, .25);
    else if (musEl) musEl.volume = musicaOn ? (on ? .2 : .55) : 0;
  }
  const hayFondo = () => !!(CFG_SONIDO.musica && CFG_SONIDO.musica.src) || (CFG_SONIDO.preset && P.ambiente !== 'ninguno');

  const ICON_MUSICA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>';
  const ICON_MUSICA_NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/><path d="M3 3l18 18"/></svg>';
  function pintarSonido() {
    const b = $('#mjSonido');
    if (b) {
      b.innerHTML = sonidoOn ? ICON.sonido : ICON.mudo;
      b.setAttribute('aria-pressed', String(sonidoOn));
      b.setAttribute('aria-label', sonidoOn ? T.silenciar : T.activarSonido);
      b.title = b.getAttribute('aria-label');
    }
    const m = $('#mjMusica');
    if (m) {
      m.innerHTML = musicaOn ? ICON_MUSICA : ICON_MUSICA_NO;
      m.setAttribute('aria-pressed', String(musicaOn));
      m.setAttribute('aria-label', musicaOn ? (T.silenciarMusica || 'Música') : (T.activarMusica || 'Música'));
      m.title = m.getAttribute('aria-label');
    }
  }
  function alternarEfectos() {
    sonidoOn = !sonidoOn;
    try { localStorage.setItem(CLAVE_SONIDO, sonidoOn ? 'on' : 'off'); } catch (e) {}
    const c = contexto(); if (c && gEfectos) gEfectos.gain.setTargetAtTime(sonidoOn ? 1 : 0, c.currentTime, .05);
    if (!sonidoOn) redoble(false);
    pintarSonido(); if (sonidoOn) sfx.tic();
  }
  function alternarMusica() {
    musicaOn = !musicaOn;
    try { localStorage.setItem(CLAVE_MUSICA, musicaOn ? 'on' : 'off'); } catch (e) {}
    const c = contexto(); if (c && gFondo && estado !== 'pausa') gFondo.gain.setTargetAtTime(musicaOn ? 1 : 0, c.currentTime, .05);
    if (musEl) { if (musicaOn && estado === 'jugando') musEl.play().catch(() => {}); else if (!musicaOn) musEl.pause(); if (!musGain) musEl.volume = musicaOn ? .55 : 0; }
    pintarSonido();
  }
  const sonido = {
    fondoIniciar, fondoPausar, fondoReanudar, fondoParar, tempo, atenuar, redoble, ambienteIntensidad,
    estado: () => ({
      efectosOn: sonidoOn, musicaOn, hayFondo: hayFondo(), redoble: !!redobleT, atenuada, ambiente: !!amb,
      musica: musEl ? { pausada: musEl.paused, rate: musEl.playbackRate, src: musEl.src.slice(0, 22), ganancia: musGain ? +musGain.gain.value.toFixed(3) : null } : null,
      gFondo: gFondo ? +gFondo.gain.value.toFixed(3) : null, gEfectos: gEfectos ? +gEfectos.gain.value.toFixed(3) : null,
    }),
  };

  // ---------- Sello de lacre ----------
  let sid = 0;
  function sello(texto, centro, col, cls) {
    const id = 'mjs' + (++sid);
    let borde = '';
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, rr = i % 2 ? 46 : 49.5; borde += `${(60 + Math.cos(a) * rr).toFixed(1)},${(60 + Math.sin(a) * rr).toFixed(1)} `; }
    const t = esc(String(texto).toUpperCase());
    return `<svg viewBox="0 0 120 120" class="${cls || ''}" aria-hidden="true"><defs><radialGradient id="${id}g" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient><path id="${id}p" d="M60 60 m-33 0 a33 33 0 1 1 66 0 a33 33 0 1 1 -66 0"/></defs>
      <polygon points="${borde}" fill="${col || 'var(--acento)'}"/><polygon points="${borde}" fill="url(#${id}g)"/>
      <circle cx="60" cy="60" r="39" fill="none" stroke="rgba(0,0,0,.3)" stroke-width="1.2"/>
      <text font-family="DM Mono, monospace" font-size="8.2" letter-spacing="1.6" fill="rgba(255,255,255,.85)"><textPath href="#${id}p" startOffset="50%" text-anchor="middle">${t} · ${t}</textPath></text>
      <text x="60" y="60" text-anchor="middle" dominant-baseline="central" font-size="26" font-family="Bodoni Moda, Georgia, serif" font-weight="700" fill="rgba(255,255,255,.92)">${esc(centro)}</text></svg>`;
  }
  const monograma = () => (TEMA.motivo && TEMA.motivo.monograma) || D.meta.titulo.slice(0, 2);
  const selloTexto = () => (TEMA.motivo && TEMA.motivo.sello) || D.meta.titulo;

  // ---------- Estructura ----------
  let opciones = {};
  let estado = 'intro'; // intro | cuenta | jugando | pausa | fin
  const hudVals = {};
  function montar() {
    document.body.insertAdjacentHTML('afterbegin', `
      <header class="mj-top">
        <div class="mj-titulo"><b>${esc(JUEGO.titulo)}</b><span class="eyebrow">${esc(D.meta.titulo)}</span></div>
        <div class="mj-hud" id="mjHud"></div>
        <button class="mj-icon" id="mjPausa" aria-label="${esc(T.pausa)}" title="${esc(T.pausa)}">${ICON.pausa}</button>
        ${hayFondo() ? '<button class="mj-icon" id="mjMusica"></button>' : ''}
        <button class="mj-icon" id="mjSonido"></button>
      </header>`);
    document.body.insertAdjacentHTML('beforeend', `
      <div class="mj-capa" id="mjCapa" role="dialog" aria-modal="true"></div>
      <div class="mj-flash" id="mjFlash" aria-live="polite"></div>`);
    $('#mjSonido').addEventListener('click', alternarEfectos);
    if ($('#mjMusica')) $('#mjMusica').addEventListener('click', alternarMusica);
    $('#mjPausa').addEventListener('click', () => (estado === 'pausa' ? reanudar() : pausar()));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { if (estado === 'jugando') pausar(); else if (estado === 'pausa') reanudar(); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && estado === 'jugando') pausar(); });
    pintarSonido();
  }
  function hud(defs) {
    $('#mjHud').innerHTML = defs.map((d) => `<div class="mj-dato"><small>${esc(d.etiqueta)}</small><b id="mjh-${d.id}">${esc(d.valor != null ? d.valor : '')}</b></div>`).join('');
  }
  function hudSet(id, v) { if (hudVals[id] === v) return; hudVals[id] = v; const el = $('#mjh-' + id); if (el) el.textContent = v; }

  function capa(html) { const c = $('#mjCapa'); c.innerHTML = html; c.classList.add('ver'); return c; }
  function cerrarCapa() { $('#mjCapa').classList.remove('ver'); }

  function creditoMusica() {
    const m = CFG_SONIDO.musica;
    return m && m.src ? `<p style="font-size:.74rem">♪ ${esc(T.musica || 'Música')}: ${esc(m.titulo)} · ${esc(m.interprete || '')}${m.anio ? ' (' + esc(m.anio) + ')' : ''} · ${esc(m.licencia)}</p>` : '';
  }
  function intro() {
    estado = 'intro';
    const tactil = esTactil();
    const ins = JUEGO.instrucciones || {};
    const lista = (tactil ? ins.tactil : ins.teclado) || ins.tactil || [];
    const otra = tactil ? null : ins.tactil;
    const rec = record();
    const c = capa(`<div class="mj-carta">
      ${sello(selloTexto(), monograma(), 'var(--acento)', 'mj-sello')}
      <span class="eyebrow">${esc(D.meta.titulo)}</span>
      <h2>${esc(JUEGO.titulo)}</h2>
      <p>${esc(JUEGO.subtitulo || '')}</p>
      <ul class="mj-controles">${lista.map(([k, t]) => `<li><i>${esc(k)}</i><span>${esc(t)}</span></li>`).join('')}</ul>
      ${otra && otra.length ? `<p style="font-size:.8rem">${esc(T.tambienTactil)}</p>` : ''}
      ${rec ? `<p class="num" style="font-size:.85rem">${esc(T.record)}: ${fmt(rec.record)} ${esc(T.puntos)}</p>` : ''}
      <div class="mj-acciones"><button class="btn" id="mjJugar">${esc(T.jugar)} →</button></div>
      ${creditoMusica()}
    </div>`);
    const b = $('#mjJugar', c); b.focus({ preventScroll: true });
    b.addEventListener('click', () => { contexto(); fondoIniciar(); cuentaAtras(); });
  }
  function cuentaAtras() {
    estado = 'cuenta';
    opciones.preparar && opciones.preparar();
    let n = 3;
    const paso = () => {
      if (n === 0) { cerrarCapa(); estado = 'jugando'; opciones.empezar && opciones.empezar(); return; }
      capa(`<div class="mj-cuenta" aria-live="assertive">${n}</div>`);
      sfx.cuenta(n === 1); n--;
      setTimeout(paso, reducido() ? 250 : 750);
    };
    paso();
  }
  function pausar() {
    if (estado !== 'jugando') return;
    estado = 'pausa';
    opciones.pausar && opciones.pausar();
    fondoPausar();
    const c = capa(`<div class="mj-carta"><span class="eyebrow">${esc(JUEGO.titulo)}</span><h2>${esc(T.pausa)}</h2>
      <div class="mj-acciones"><button class="btn" id="mjSeguir">${esc(T.continuar)}</button><button class="btn fantasma" id="mjReiniciar">${esc(T.reiniciar)}</button></div></div>`);
    $('#mjSeguir', c).addEventListener('click', reanudar);
    $('#mjReiniciar', c).addEventListener('click', () => { cerrarCapa(); fondoIniciar(); cuentaAtras(); });
    $('#mjSeguir', c).focus({ preventScroll: true });
  }
  function reanudar() {
    if (estado !== 'pausa') return;
    cerrarCapa(); estado = 'jugando';
    fondoReanudar();
    opciones.reanudar && opciones.reanudar();
  }

  let flashT = 0;
  function flash(texto, ok) {
    const f = $('#mjFlash');
    f.textContent = texto; f.className = 'mj-flash ' + (ok ? 'ok' : 'ko');
    void f.offsetWidth; f.classList.add('ver');
    clearTimeout(flashT); flashT = setTimeout(() => f.classList.remove('ver'), 950);
  }

  // ---------- Récord y premio ----------
  const CLAVE_MJ = CLAVE + ':minijuegos';
  function leerTodo() { try { return JSON.parse(localStorage.getItem(CLAVE_MJ) || '{}'); } catch (e) { return {}; } }
  function record() { return leerTodo()[JUEGO.id] || null; }
  function premio(puntos) {
    const p = JUEGO.premio || {};
    const objetivo = p.objetivo || 1000, tope = p.tope || 300;
    const frac = Math.max(0, Math.min(1, puntos / objetivo));
    return { lliures: Math.round(tope * frac), estrellas: puntos <= 0 ? 0 : frac >= .9 ? 3 : frac >= .6 ? 2 : frac >= .3 ? 1 : 0 };
  }
  function fin(r) {
    if (estado === 'fin') return;
    estado = 'fin';
    opciones.pausar && opciones.pausar();
    const puntos = Math.max(0, Math.round(r.puntos || 0));
    const { lliures, estrellas } = premio(puntos);
    const todo = leerTodo();
    const prev = todo[JUEGO.id] || { record: 0, mejorLliures: 0, partidas: 0 };
    const nuevoRecord = puntos > prev.record;
    todo[JUEGO.id] = { record: Math.max(prev.record, puntos), mejorLliures: Math.max(prev.mejorLliures, lliures), partidas: prev.partidas + 1 };
    try { localStorage.setItem(CLAVE_MJ, JSON.stringify(todo)); } catch (e) {}
    const resultado = { tipo: 'minijuego', id: JUEGO.id, puntos, lliures, estrellas, victoria: !!r.victoria };
    window.__mjResultado = resultado;
    try { if (window.parent && window.parent !== window) window.parent.postMessage(resultado, '*'); } catch (e) {}
    window.dispatchEvent(new CustomEvent('minijuego-fin', { detail: resultado }));
    fondoParar();
    if (opciones.sonidoFin) opciones.sonidoFin(!!r.victoria); else (r.victoria ? sfx.victoria : sfx.derrota)();
    const embebido = window.parent && window.parent !== window;
    const c = capa(`<div class="mj-carta">
      <span class="eyebrow">${esc(JUEGO.titulo)}</span>
      <h2>${esc(r.titulo || (r.victoria ? T.victoria : T.finPartida))}</h2>
      ${r.mensaje ? `<p>${esc(r.mensaje)}</p>` : ''}
      <div class="mj-estrellas">${[0, 1, 2].map((i) => ICON.estrella.replace('<svg', `<svg class="${i < estrellas ? '' : 'off'}"`)).join('')}</div>
      <div class="mj-resumen">${(r.resumen || []).concat([[T.puntos, fmt(puntos)], [T.record, fmt(Math.max(prev.record, puntos))]]).map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
      <div class="mj-billete"><span class="eyebrow">${esc(T.guanyes)}</span><span><b>+${fmt(lliures)}</b> <em>${esc(moneda)}</em></span></div>
      ${nuevoRecord && prev.partidas ? `<p style="color:var(--acento);font-family:var(--f-display);font-size:1.15rem">${esc(T.nuevoRecord)}</p>` : ''}
      <div class="mj-acciones"><button class="btn" id="mjRepetir">↻ ${esc(T.repetir)}</button>${embebido ? `<button class="btn fantasma" id="mjVolver">${esc(T.volver)}</button>` : ''}</div>
      ${creditoMusica()}
    </div>`);
    $('#mjRepetir', c).addEventListener('click', () => { cerrarCapa(); fondoIniciar(); cuentaAtras(); });
    if ($('#mjVolver', c)) $('#mjVolver', c).addEventListener('click', () => window.parent.postMessage({ tipo: 'minijuego-cerrar', id: JUEGO.id }, '*'));
    $('#mjRepetir', c).focus({ preventScroll: true });
    return resultado;
  }

  // ---------- Gestos ----------
  // Deslizar o tocar dentro de un elemento. onDir('izq'|'der'|'arriba'|'abajo'), onToque(x, y, rect)
  function gestos(el, { onDir, onToque, umbral = 28 }) {
    let x0 = 0, y0 = 0, t0 = 0, activo = false, disparado = false;
    el.addEventListener('pointerdown', (e) => { activo = true; disparado = false; x0 = e.clientX; y0 = e.clientY; t0 = performance.now(); try { el.setPointerCapture(e.pointerId); } catch (_) {} });
    el.addEventListener('pointermove', (e) => {
      if (!activo || disparado) return;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.max(Math.abs(dx), Math.abs(dy)) >= umbral) { disparado = true; onDir && onDir(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'der' : 'izq') : (dy > 0 ? 'abajo' : 'arriba')); }
    });
    const soltar = (e) => {
      if (!activo) return; activo = false;
      if (!disparado && performance.now() - t0 < 500 && onToque) { const r = el.getBoundingClientRect(); onToque(e.clientX - r.left, e.clientY - r.top, r); }
    };
    el.addEventListener('pointerup', soltar);
    el.addEventListener('pointercancel', () => { activo = false; });
  }

  function iniciar(o) {
    opciones = o || {};
    aplicarTema();
    montar();
    intro();
    window.__minijuego = Object.assign(window.__minijuego || {}, { estado: () => estado, pausar, reanudar });
  }

  return { iniciar, hud, hudSet, flash, fin, sfx, sonido, sello, gestos, azar, esc, fmt, color, reducido, esTactil, estado: () => estado, pausar, reanudar, T, JUEGO, D, moneda };
})();
