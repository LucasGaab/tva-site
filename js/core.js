/* =========================================================
   TVA · núcleo: estado, eventos, som, tema, cursor, desvio,
   dossiê, HUD de eras, reveal
   ========================================================= */
(function () {
  'use strict';

  var TVA = window.TVA = {};
  var $ = TVA.$ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = TVA.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  TVA.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  TVA.finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  TVA.mobile = window.innerWidth < 760;

  /* ---------- armazenamento seguro ---------- */
  TVA.store = {
    get: function (k, d) {
      try { var v = localStorage.getItem('tva.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) { try { localStorage.setItem('tva.' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- barramento de eventos ---------- */
  var handlers = {};
  TVA.on = function (ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); };
  TVA.emit = function (ev, data) { (handlers[ev] || []).forEach(function (fn) { try { fn(data); } catch (e) { console.error(e); } }); };

  /* ---------- utilidades ---------- */
  TVA.hash = function (str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  };
  TVA.rng = function (seed) {
    var s = seed >>> 0 || 1;
    return function () { s = (s + 0x6D2B79F5) >>> 0; var t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  };
  TVA.pick = function (arr, r) { return arr[Math.floor((r ? r() : Math.random()) * arr.length)]; };
  TVA.clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  TVA.lerp = function (a, b, t) { return a + (b - a) * t; };
  TVA.pad = function (n, l) { n = String(n); while (n.length < l) n = '0' + n; return n; };
  TVA.timeStr = function (d) { d = d || new Date(); return TVA.pad(d.getHours(), 2) + ':' + TVA.pad(d.getMinutes(), 2) + ':' + TVA.pad(d.getSeconds(), 2); };
  TVA.escape = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- toast ---------- */
  var toastEl, toastT;
  TVA.toast = function (html, ms) {
    toastEl = toastEl || $('#toast');
    toastEl.innerHTML = html;
    toastEl.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('show'); }, ms || 3200);
  };

  /* =========================================================
     SOM: tudo sintetizado em WebAudio, desligado por padrão
     ========================================================= */
  var Sound = TVA.sound = { on: false, ctx: null };
  function ctx() {
    if (!Sound.ctx) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      Sound.ctx = new AC();
      Sound.master = Sound.ctx.createGain();
      Sound.master.gain.value = 0.32;
      Sound.master.connect(Sound.ctx.destination);
    }
    if (Sound.ctx.state === 'suspended') Sound.ctx.resume();
    return Sound.ctx;
  }
  function tone(freq, dur, type, vol, slideTo, delay) {
    var c = ctx(); if (!c) return;
    var t = c.currentTime + (delay || 0);
    var o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.3, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(Sound.master);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol, filterFreq, delay) {
    var c = ctx(); if (!c) return;
    var t = c.currentTime + (delay || 0);
    var len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var s = c.createBufferSource(); s.buffer = buf;
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq || 1200;
    var g = c.createGain(); g.gain.value = vol || 0.3;
    s.connect(f); f.connect(g); g.connect(Sound.master); s.start(t);
  }
  var sfx = {
    tick: function () { tone(2200, 0.03, 'square', 0.05); },
    click: function () { tone(900, 0.05, 'triangle', 0.12, 500); },
    hover: function () { tone(1400, 0.025, 'sine', 0.04); },
    type: function () { tone(1200 + Math.random() * 500, 0.02, 'square', 0.025); },
    stamp: function () { noise(0.18, 0.7, 500); tone(90, 0.22, 'sine', 0.6, 45); },
    door: function () { tone(110, 1.1, 'sawtooth', 0.08, 440); tone(165, 1.1, 'sine', 0.12, 660); noise(1, 0.08, 2400); },
    whoosh: function () { noise(0.5, 0.18, 900); tone(300, 0.5, 'sine', 0.06, 80); },
    glitch: function () { for (var i = 0; i < 8; i++) tone(80 + Math.random() * 1600, 0.05, 'square', 0.07, null, i * 0.05); noise(0.4, 0.15, 4000); },
    blip: function () { tone(660, 0.07, 'sine', 0.14); tone(990, 0.09, 'sine', 0.12, null, 0.07); },
    error: function () { tone(220, 0.16, 'square', 0.1); tone(160, 0.22, 'square', 0.1, null, 0.14); },
    approve: function () { tone(523, 0.1, 'triangle', 0.15); tone(659, 0.1, 'triangle', 0.15, null, 0.1); tone(784, 0.2, 'triangle', 0.15, null, 0.2); },
    alarm: function () { for (var i = 0; i < 4; i++) tone(i % 2 ? 620 : 880, 0.14, 'square', 0.07, null, i * 0.15); },
    prune: function () { tone(880, 0.6, 'sawtooth', 0.08, 60); noise(0.6, 0.2, 1800); }
  };
  Sound.play = function (name) { if (Sound.on && sfx[name]) { try { sfx[name](); } catch (e) {} } };
  TVA.sfx = Sound.play;

  /* ---------- tema ---------- */
  TVA.setTheme = function (t, silent) {
    document.documentElement.setAttribute('data-theme', t);
    TVA.store.set('theme', t);
    try { localStorage.setItem('tva.theme', t); } catch (e) {}
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#120C08' : '#EFE5CF');
    TVA.theme = t;
    if (!silent) TVA.emit('theme', t);
  };
  TVA.theme = document.documentElement.getAttribute('data-theme') || 'dark';

  /* =========================================================
     PROCESSO DO VISITANTE + DESVIO (ideia ousada nº 1 e 2)
     ========================================================= */
  var Case = TVA.case = {};
  function initCase() {
    var id = TVA.store.get('case');
    if (!id) {
      var a = 'ABCDEFGHJKLMNPRSTUVWXZ';
      id = a[Math.floor(Math.random() * a.length)] + '-' + TVA.pad(Math.floor(Math.random() * 9999), 4) + '-' + a[Math.floor(Math.random() * a.length)] + Math.floor(Math.random() * 9);
      TVA.store.set('case', id);
      TVA.store.set('first', Date.now());
    }
    Case.id = id;
    Case.first = TVA.store.get('first', Date.now());
    Case.visits = TVA.store.get('visits', 0) + 1;
    TVA.store.set('visits', Case.visits);
    Case.log = TVA.store.get('log', []);
    Case.dev = TVA.store.get('dev', 0);
    Case.nexus = TVA.store.get('nexus', 0);
    Case.total = TVA.store.get('total', 0);
    Case.name = TVA.store.get('name', null);
  }
  initCase();

  var devLock = false, lastReason = {}, nexusRunning = false;
  /** Registra um ato de livre-arbítrio. */
  TVA.deviate = function (points, reason, opts) {
    opts = opts || {};
    if (nexusRunning) return;
    var now = Date.now();
    // mesma infração não pontua em rajada
    if (lastReason[reason] && now - lastReason[reason] < (opts.cooldown || 4000)) return;
    lastReason[reason] = now;
    Case.dev = TVA.clamp(Case.dev + points, 0, 100);
    Case.total += points;
    Case.log.unshift({ r: reason, p: points, t: now });
    if (Case.log.length > 40) Case.log.length = 40;
    TVA.store.set('dev', Case.dev); TVA.store.set('log', Case.log); TVA.store.set('total', Case.total);
    renderDeviation(true);
    renderDossier();
    TVA.emit('deviate', { points: points, reason: reason, level: Case.dev });
    if (Case.dev >= 100 && !devLock) { devLock = true; setTimeout(TVA.pageNexus, 500); }
  };

  function renderDeviation(bump) {
    var v = Math.round(Case.dev);
    $('#dev-fill').style.width = v + '%';
    $('#dev-val').textContent = v + '%';
    if (bump) {
      var b = $('#deviation-btn');
      b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    }
    renderVerdict();
  }

  /** A própria página sofre um Evento Nexus e é podada. */
  TVA.pageNexus = function () {
    if (nexusRunning) return;
    nexusRunning = true;
    Case.nexus++; TVA.store.set('nexus', Case.nexus);
    TVA.emit('pagenexus:start');
    TVA.sfx('glitch'); TVA.sfx('alarm');
    var dur = TVA.reduced ? 900 : 2400;
    if (!TVA.reduced) document.body.classList.add('nexus-glitch');
    else document.body.classList.add('nexus-glitch-lite');
    $('#nexus-overlay').style.display = 'block';
    setTimeout(function () {
      var w = $('#prune-wipe');
      w.classList.remove('go'); void w.offsetWidth; w.classList.add('go');
      setTimeout(function () { w.classList.remove('go'); }, 1600);
      TVA.sfx('prune');
      setTimeout(function () {
        document.body.classList.remove('nexus-glitch', 'nexus-glitch-lite');
        $('#nexus-overlay').style.display = '';
        Case.dev = 0; TVA.store.set('dev', 0);
        Case.log.unshift({ r: 'Página podada pelos Minutemen', p: 0, t: Date.now() });
        TVA.store.set('log', Case.log);
        renderDeviation(); renderDossier();
        TVA.emit('pagenexus:end');
      }, 560);
      setTimeout(function () { nexusRunning = false; devLock = false; }, 1600);
    }, dur);
  };

  /* ---------- sentença ---------- */
  function verdictText() {
    var t = Case.total, n = Case.nexus;
    if (n >= 3) return 'Reincidente. Você é praticamente uma ramificação ambulante. Encaminhar ao Vazio, com um lanche.';
    if (n >= 1) return 'Causou ' + n + ' Evento(s) Nexus. Podado e restaurado. Fingiremos que não aconteceu. Ninguém vai fingir.';
    if (t >= 60) return 'Comportamento altamente variante. Reset recomendado após o café.';
    if (t >= 25) return 'Pequenos desvios registrados. Advertência carimbada em três vias.';
    if (t > 0) return 'Desvio mínimo. Provavelmente um erro de digitação do universo.';
    return 'Nenhum desvio. Suspeito. Ninguém é tão obediente. Observação intensificada.';
  }
  function renderVerdict() { var el = $('#final-verdict'); if (el) el.textContent = verdictText(); }
  TVA.verdictText = verdictText;

  /* ---------- dossiê ---------- */
  function fmtDate(ts) { var d = new Date(ts); return TVA.pad(d.getDate(), 2) + '/' + TVA.pad(d.getMonth() + 1, 2) + '/' + d.getFullYear() + ' ' + TVA.pad(d.getHours(), 2) + ':' + TVA.pad(d.getMinutes(), 2); }
  function renderDossier() {
    $('#d-case').textContent = Case.id;
    $('#d-first').textContent = fmtDate(Case.first);
    $('#d-visits').textContent = Case.visits;
    $('#d-nexus').textContent = Case.nexus;
    $('#d-dev').textContent = Math.round(Case.dev) + '%';
    var ol = $('#d-log');
    if (!Case.log.length) { ol.innerHTML = '<li class="empty">Nenhuma. Ainda.</li>'; return; }
    ol.innerHTML = Case.log.slice(0, 25).map(function (e) {
      return '<li><span>' + TVA.escape(e.r) + '<br><time>' + fmtDate(e.t) + '</time></span><em>' + (e.p ? '+' + e.p : '✂') + '</em></li>';
    }).join('');
  }
  TVA.openDossier = function () {
    renderDossier();
    var d = $('#dossier'); d.hidden = false;
    TVA.sfx('whoosh');
    TVA.emit('dossier:open');
    setTimeout(function () { $('#dossier-close').focus(); }, 50);
  };
  TVA.closeDossier = function () { $('#dossier').hidden = true; };
  TVA.resetCase = function () {
    Case.log = []; Case.dev = 0; Case.total = 0; Case.nexus = 0;
    ['log', 'dev', 'total', 'nexus'].forEach(function (k) { TVA.store.set(k, k === 'log' ? [] : 0); });
    renderDeviation(); renderDossier();
  };

  /* ---------- posição do ponteiro (mouse e toque) ---------- */
  TVA.mouse = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, active: false };
  addEventListener('pointermove', function (e) {
    var m = TVA.mouse; m.x = e.clientX; m.y = e.clientY; m.active = true;
    m.nx = m.x / innerWidth * 2 - 1; m.ny = m.y / innerHeight * 2 - 1;
  }, { passive: true });

  /* =========================================================
     CURSOR RELÓGIO
     ========================================================= */
  function initCursor() {
    if (!TVA.finePointer) return;
    document.documentElement.classList.add('has-cursor');
    var c = $('#cursor'), label = $('.c-label', c), hH = $('.c-hand.h', c), hM = $('.c-hand.m', c);
    var x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, ang = 0, lastX = x;
    addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; if (!c._live) { c._live = 1; cx = x; cy = y; lastX = x; c.classList.add('live'); } }, { passive: true });
    addEventListener('pointerdown', function () { c.classList.add('down'); });
    addEventListener('pointerup', function () { c.classList.remove('down'); });
    document.addEventListener('pointerover', function (e) {
      var t = e.target.closest('a, button, [data-cursor], label, select, [role="button"], .redact, .k2');
      var txt = e.target.closest('input[type="text"], input[type="number"], textarea');
      c.classList.toggle('text', !!txt);
      if (t && !txt) {
        c.classList.add('hover');
        var l = t.getAttribute('data-cursor');
        label.textContent = l || '';
        label.classList.toggle('show', !!l);
        if (t !== c._last) { TVA.sfx('hover'); c._last = t; }
      } else { c.classList.remove('hover'); label.classList.remove('show'); c._last = null; }
    });
    document.documentElement.addEventListener('pointerleave', function () { c.classList.remove('live'); c._live = 0; });
    TVA.loop(function (dt) {
      cx += (x - cx) * 0.28; cy += (y - cy) * 0.28;
      ang += (x - lastX) * 0.9 + dt * 6; lastX = x;
      c.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      hM.style.transform = 'rotate(' + ang + 'deg)';
      hH.style.transform = 'rotate(' + (ang / 12) + 'deg)';
    });
  }

  /* =========================================================
     LOOP CENTRAL
     ========================================================= */
  var loops = [], last = performance.now(), running = true;
  TVA.loop = function (fn) { loops.push(fn); };
  function frame(now) {
    var dt = Math.max(0, Math.min(0.05, (now - last) / 1000)); last = now;
    for (var i = 0; i < loops.length; i++) loops[i](dt, now);
    if (running) requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; }
    else { running = true; last = performance.now(); requestAnimationFrame(frame); }
  });

  /* =========================================================
     SCROLL: progresso, velocidade, eras, nav ativa
     ========================================================= */
  var scrollState = TVA.scroll = { y: 0, v: 0, dir: 1, max: 1 };
  var sections = [], currentSec = null, yearEl, nameEl;
  function initScroll() {
    sections = $$('main > section');
    yearEl = $('#era-chip-year'); nameEl = $('#era-chip-name');
    var lastY = scrollY, lastT = performance.now(), topbar = $('#topbar'), navLinks = $$('.nav a');
    var backtrack = 0;
    function onScroll() {
      var y = scrollY, now = performance.now(), dtt = Math.max(16, now - lastT);
      scrollState.v = (y - lastY) / dtt * 1000;
      scrollState.dir = y >= lastY ? 1 : -1;
      if (y < lastY - 2) backtrack += lastY - y; else backtrack = Math.max(0, backtrack - (y - lastY) * 0.5);
      if (backtrack > innerHeight * 4) { backtrack = 0; TVA.deviate(4, 'Voltou no tempo sem autorização (rolagem reversa)', { cooldown: 20000 }); }
      scrollState.y = y; scrollState.max = document.documentElement.scrollHeight - innerHeight;
      lastY = y; lastT = now;
      topbar.classList.toggle('hide', y > 300 && scrollState.dir > 0 && Math.abs(scrollState.v) > 60 && !$('#nav').classList.contains('open'));
      if (y < 300) topbar.classList.remove('hide');
      // seção atual: a que cobre o meio da tela
      var mid = innerHeight * 0.5, found = null;
      for (var i = 0; i < sections.length; i++) {
        var r = sections[i].getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { found = sections[i]; break; }
      }
      if (found && found !== currentSec) enterSection(found, currentSec);
      navLinks.forEach(function (a) { a.classList.toggle('active', found && a.getAttribute('href') === '#' + found.id); });
      TVA.emit('scroll', scrollState);
    }
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', function () { TVA.mobile = innerWidth < 760; onScroll(); });
    onScroll();
  }
  function enterSection(sec, prev) {
    currentSec = sec;
    document.body.setAttribute('data-sec', sec.id);
    var cinema = sec.classList.contains('cinema') || sec.classList.contains('cinema-soft');
    if (sec.id !== 'linha') setEra(sec.getAttribute('data-year'), sec.getAttribute('data-era'));
    var prevCinema = prev && (prev.classList.contains('cinema') || prev.classList.contains('cinema-soft'));
    if (prev && !TVA.reduced && TVA.ready && (cinema !== prevCinema) && (sec.id === 'linha' || sec.id === 'nexus' || prev.id === 'linha')) {
      var f = $('#era-flash');
      f.classList.remove('go'); void f.offsetWidth; f.classList.add('go');
      clearTimeout(f._t); f._t = setTimeout(function () { f.classList.remove('go'); }, 760);
      TVA.sfx('whoosh');
    }
    TVA.emit('section', { id: sec.id, prev: prev && prev.id, cinema: cinema });
  }
  var scrambleT = null;
  TVA.setEra = setEra;
  function setEra(year, name) {
    if (!yearEl) return;
    if (name) nameEl.textContent = name;
    if (yearEl.dataset.target === year) return;
    var chip = $('.era-chip'); chip.classList.remove('flip'); void chip.offsetWidth; chip.classList.add('flip');
    yearEl.dataset.target = year;
    clearInterval(scrambleT);
    if (TVA.reduced) { yearEl.textContent = year; return; }
    var n = 0, chars = '0123456789∞#Ω';
    scrambleT = setInterval(function () {
      n++;
      if (n > 9) { yearEl.textContent = year; clearInterval(scrambleT); return; }
      var s = ''; for (var i = 0; i < Math.max(4, year.length); i++) s += chars[Math.floor(Math.random() * chars.length)];
      yearEl.textContent = s;
      if (n % 2) TVA.sfx('tick');
    }, 45);
  }

  /* ---------- reveal ---------- */
  function initReveal() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---------- controles do topo ---------- */
  function initTop() {
    $('#theme-btn').addEventListener('click', function () {
      TVA.setTheme(TVA.theme === 'dark' ? 'light' : 'dark');
      TVA.sfx('click');
    });
    var sb = $('#sound-btn');
    function syncSound() {
      sb.setAttribute('aria-pressed', Sound.on ? 'true' : 'false');
      sb.setAttribute('aria-label', Sound.on ? 'Desligar sons' : 'Ligar sons');
    }
    sb.addEventListener('click', function () {
      Sound.on = !Sound.on;
      if (Sound.on) { ctx(); Sound.play('blip'); }
      syncSound();
      TVA.emit('sound', Sound.on);
    });
    TVA.setSound = function (v) { Sound.on = v; if (v) ctx(); syncSound(); };
    $('#deviation-btn').addEventListener('click', TVA.openDossier);
    $('#open-dossier').addEventListener('click', TVA.openDossier);
    $('#dossier-close').addEventListener('click', TVA.closeDossier);
    $('#d-clear').addEventListener('click', function () {
      TVA.resetCase();
      TVA.toast('Esquecimento concedido. <b>Isso também foi anotado.</b>');
      TVA.deviate(5, 'Pediu para ser esquecido');
    });
    var menu = $('#menu-btn'), nav = $('#nav');
    menu.addEventListener('click', function () {
      var open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menu.setAttribute('aria-expanded', open);
    });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); TVA.sfx('click'); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { TVA.closeDossier(); nav.classList.remove('open'); }
    });
  }

  /* ---------- desvios passivos (livre-arbítrio detectado) ---------- */
  function initWatchers() {
    document.addEventListener('contextmenu', function () { TVA.deviate(8, 'Tentou espiar os bastidores (botão direito)'); TVA.emit('react', 'contextmenu'); });
    document.addEventListener('copy', function () { TVA.deviate(10, 'Copiou documento da TVA sem autorização'); TVA.emit('react', 'copy'); });
    var hiddenAt = 0;
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > 4000) { TVA.deviate(5, 'Abandonou a linha do tempo (saiu da aba)', { cooldown: 15000 }); TVA.emit('react', 'return'); }
    });
    var clicks = [];
    document.addEventListener('click', function () {
      var n = Date.now(); clicks.push(n); clicks = clicks.filter(function (t) { return n - t < 1500; });
      if (clicks.length >= 7) { clicks = []; TVA.deviate(6, 'Cliques compulsivos (ansiedade temporal)'); TVA.emit('react', 'clicks'); }
    });
    // konami
    var seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], pos = 0;
    document.addEventListener('keydown', function (e) {
      pos = (e.key === seq[pos] || e.key.toLowerCase() === seq[pos]) ? pos + 1 : (e.key === seq[0] ? 1 : 0);
      if (pos === seq.length) { pos = 0; TVA.deviate(30, 'Usou um código secreto de outra linha do tempo'); TVA.emit('react', 'konami'); }
    });
  }

  /* ---------- boot ---------- */
  TVA.initCore = function () {
    $('#pre-case').textContent = Case.id;
    renderDeviation(); renderDossier();
    initTop(); initCursor(); initScroll(); initReveal(); initWatchers();
    requestAnimationFrame(frame);
    setInterval(function () { var c = $('#hero-clock'); if (c) c.textContent = TVA.timeStr(); }, 1000);
  };
})();
