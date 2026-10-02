/* =========================================================
   TVA · Miss Minutes: rig SVG + dock + reações
   ========================================================= */
(function () {
  'use strict';
  var TVA = window.TVA, $ = TVA.$, $$ = TVA.$$;
  var uid = 0;
  var MOUTH_FOR = { happy: 'smile', neutral: 'smile', menace: 'smirk', oops: 'o', wink: 'grin', sleepy: 'flat', alarm: 'o' };

  /* Desenho segue a referência: disco-relógio laranja com aro, marcações
     grossas, olhos creme com cílios, mangas listradas, luvas brancas,
     pernas finas e botinhas laranja. */
  function svgMarkup(id) {
    var ink = '#5A2410', orange = '#F98A2C', rib = '#D4651C';
    var ticks = '';
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2, major = i % 3 === 0;
      var r1 = major ? 55 : 60, r2 = major ? 68 : 67;
      ticks += '<line x1="' + (100 + Math.sin(a) * r1).toFixed(1) + '" y1="' + (100 - Math.cos(a) * r1).toFixed(1) + '" x2="' + (100 + Math.sin(a) * r2).toFixed(1) + '" y2="' + (100 - Math.cos(a) * r2).toFixed(1) + '" stroke="' + ink + '" stroke-width="' + (major ? 5.5 : 4) + '" stroke-linecap="round"/>';
    }
    function eye(cx, side) {
      var lash = side === 'l'
        ? 'M65 83 q-6 -3 -9 -1 M68 79 q-4 -5 -8 -5 M73 77 q-2 -6 -5 -8'
        : 'M135 83 q6 -3 9 -1 M132 79 q4 -5 8 -5 M127 77 q2 -6 5 -8';
      return '<g class="mm-eye ' + side + '">' +
        '<clipPath id="' + id + '-c' + side + '"><ellipse cx="' + cx + '" cy="94" rx="14.5" ry="18"/></clipPath>' +
        '<ellipse cx="' + cx + '" cy="94" rx="14.5" ry="18" fill="#F7EAD2"/>' +
        '<g class="mm-pupils"><ellipse class="mm-pupil" cx="' + (cx + 1) + '" cy="99" rx="8.5" ry="10.5" fill="#4A1D0C"/><circle cx="' + (cx + 4) + '" cy="94" r="2.7" fill="#fff"/></g>' +
        '<rect class="mm-lid" clip-path="url(#' + id + '-c' + side + ')" x="' + (cx - 16) + '" y="75" width="32" height="38" fill="' + orange + '"/>' +
        '<ellipse cx="' + cx + '" cy="94" rx="14.5" ry="18" fill="none" stroke="' + ink + '" stroke-width="2.6"/>' +
        '<path d="' + lash + '" stroke="' + ink + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '</g>';
    }
    function arm(side, d, gx, gy, flip) {
      var o = side === 'l' ? '36px 118px' : '164px 118px';
      return '<g class="mm-arm ' + side + '" style="transform-origin:' + o + '">' +
        '<path d="' + d + '" stroke="' + ink + '" stroke-width="13" fill="none" stroke-linecap="round"/>' +
        '<path d="' + d + '" stroke="' + orange + '" stroke-width="9" fill="none" stroke-linecap="round"/>' +
        '<path d="' + d + '" stroke="' + rib + '" stroke-width="9" fill="none" stroke-dasharray="2.4 3.2"/>' +
        '<g transform="translate(' + gx + ' ' + gy + ') scale(' + flip + ' 1)">' +
        '<ellipse cx="0" cy="-8" rx="8" ry="4" fill="#fff" stroke="' + ink + '" stroke-width="2.2"/>' +
        '<circle r="10.5" fill="#fff" stroke="' + ink + '" stroke-width="2.4"/>' +
        '<path d="M-3 3 h7 M-3 7 h6" stroke="' + ink + '" stroke-width="1.5" stroke-linecap="round"/>' +
        '<ellipse cx="-9" cy="-1" rx="3.6" ry="5.5" fill="#fff" stroke="' + ink + '" stroke-width="2"/></g></g>';
    }
    function boot(x, flip) {
      return '<g transform="translate(' + x + ' 0) scale(' + flip + ' 1)">' +
        '<path d="M-4 202 h9 v8 q9 1 12 6 q2 5 -4 6 h-22 q-5 0 -5 -5 q0 -5 6 -6 z" fill="' + orange + '" stroke="' + ink + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M-10 216 q8 2 22 0" stroke="#FFC37A" stroke-width="2" fill="none" stroke-linecap="round"/></g>';
    }
    return '' +
      '<svg class="mm" data-expr="happy" data-mouth="smile" viewBox="-12 -2 224 236" role="img" aria-label="Miss Minutes">' +
      '<defs>' +
      '<radialGradient id="' + id + '-bz" cx="44%" cy="40%" r="70%"><stop offset="0" stop-color="#FFB25E"/><stop offset=".6" stop-color="#FB912F"/><stop offset="1" stop-color="#EE7820"/></radialGradient>' +
      '<radialGradient id="' + id + '-in" cx="45%" cy="42%" r="60%"><stop offset="0" stop-color="#FFBE6E"/><stop offset="1" stop-color="#FBA040" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="' + id + '-sh" cx="50%" cy="20%" r="80%"><stop offset="0" stop-color="#7a0f00" stop-opacity="0"/><stop offset="1" stop-color="#7a0f00" stop-opacity=".6"/></radialGradient>' +
      '</defs>' +
      '<g class="mm-body">' +
      // pernas finas + botinhas
      '<path d="M88 168 Q86 190 82 206" stroke="' + ink + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M112 168 Q114 190 118 206" stroke="' + ink + '" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
      boot(80, -1) + boot(120, 1) +
      // braços listrados + luvas (atrás do disco)
      arm('l', 'M36 118 Q14 126 14 148', 13, 156, 1) +
      arm('r', 'M164 118 Q186 126 186 148', 187, 156, -1) +
      // disco: aro (espessura) + face
      '<circle cx="107" cy="103" r="74" fill="#C9561A" stroke="' + ink + '" stroke-width="3"/>' +
      '<circle cx="100" cy="100" r="74" fill="url(#' + id + '-bz)" stroke="' + ink + '" stroke-width="3"/>' +
      '<circle cx="100" cy="100" r="58" fill="url(#' + id + '-in)"/>' +
      '<path d="M44 74 A62 62 0 0 1 96 38" stroke="#FFD49A" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/>' +
      ticks +
      '<circle class="mm-shade" cx="100" cy="100" r="74" fill="url(#' + id + '-sh)"/>' +
      // sobrancelhas (só aparecem em algumas expressões)
      '<path class="mm-brow l" d="M63 70 Q75 63 88 69" stroke="' + ink + '" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
      '<path class="mm-brow r" d="M112 69 Q125 63 137 70" stroke="' + ink + '" stroke-width="3.6" fill="none" stroke-linecap="round"/>' +
      eye(76, 'l') + eye(124, 'r') +
      '<circle cx="100" cy="109" r="3" fill="' + ink + '"/>' +
      // bocas
      '<g class="mm-mouth">' +
      '<g class="m-smile"><path d="M86 121 Q100 136 114 121 Q100 126 86 121Z" fill="' + ink + '" stroke="' + ink + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M89 122.6 Q100 126.5 111 122.6 L109.5 125.6 Q100 128.5 90.5 125.6Z" fill="#fff"/></g>' +
      '<g class="m-grin"><path d="M82 119 Q100 142 118 119 Q100 125 82 119Z" fill="' + ink + '" stroke="' + ink + '" stroke-width="2.6" stroke-linejoin="round"/><path d="M85.5 120.8 Q100 126 114.5 120.8 L113 124.5 Q100 129 87 124.5Z" fill="#fff"/></g>' +
      '<g class="m-smirk"><path d="M88 127 Q104 132 116 120" stroke="' + ink + '" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M114 117 q4 2 4 6" stroke="' + ink + '" stroke-width="2" fill="none" stroke-linecap="round"/></g>' +
      '<g class="m-o"><ellipse cx="100" cy="126" rx="6" ry="8" fill="' + ink + '"/></g>' +
      '<g class="m-open"><path d="M89 121 Q100 142 111 121 Q100 117 89 121Z" fill="' + ink + '" stroke="' + ink + '" stroke-width="2.4" stroke-linejoin="round"/><path d="M93 131 q7 -5 14 0 q-7 5 -14 0z" fill="#E86A5A"/></g>' +
      '<g class="m-flat"><path d="M91 126 L109 126" stroke="' + ink + '" stroke-width="3" stroke-linecap="round"/></g>' +
      '</g>' +
      '<path class="mm-sweat" d="M156 60 q6 10 0 14 q-6 -4 0 -14z" fill="#9AD7FF" stroke="' + ink + '" stroke-width="1.5"/>' +
      '</g></svg>';
  }

  /* ---------- fábrica de rigs ---------- */
  function create(host) {
    var id = 'mm' + (++uid);
    host.innerHTML = svgMarkup(id);
    var svg = host.querySelector('svg'), pupils = $$('.mm-pupils', svg);
    var rig = { el: svg, host: host, base: 'happy', talking: false };
    var lookX = 0, lookY = 0, tx = 0, ty = 0;

    rig.expr = function (e) { rig.base = e; svg.setAttribute('data-expr', e); if (!rig.talking) svg.setAttribute('data-mouth', MOUTH_FOR[e] || 'smile'); };
    rig.mouth = function (m) { svg.setAttribute('data-mouth', m); };
    rig.flag = function (cls, ms) {
      svg.classList.remove(cls); void svg.getBoundingClientRect(); svg.classList.add(cls);
      if (ms) setTimeout(function () { svg.classList.remove(cls); }, ms);
    };
    rig.wave = function () { rig.flag('wave', 1500); };
    rig.jump = function () { rig.flag('jump', 650); };
    rig.poke = function () { rig.flag('poked', 400); };
    rig.hips = function (on) { svg.classList.toggle('hips', on); };
    rig.blink = function () { svg.classList.add('blink'); setTimeout(function () { svg.classList.remove('blink'); }, 110); };

    var talkT = null;
    rig.talk = function (ms) {
      clearInterval(talkT);
      rig.talking = true;
      var open = false, end = Date.now() + ms;
      talkT = setInterval(function () {
        if (Date.now() > end) { clearInterval(talkT); rig.talking = false; svg.setAttribute('data-mouth', MOUTH_FOR[rig.base] || 'smile'); return; }
        open = !open;
        svg.setAttribute('data-mouth', open ? (rig.base === 'menace' ? 'grin' : 'open') : (MOUTH_FOR[rig.base] || 'smile'));
      }, 110 + Math.random() * 40);
    };

    // piscar aleatório
    (function blinkLoop() {
      setTimeout(function () { if (!document.hidden) { rig.blink(); if (Math.random() < .18) setTimeout(rig.blink, 200); } blinkLoop(); }, 2200 + Math.random() * 4200);
    })();

    // olhos seguem o cursor + ponteiros com a hora real
    var rect = null, rectT = 0;
    rig.update = function (now) {
      if (!rect || now - rectT > 500) { rect = svg.getBoundingClientRect(); rectT = now; }
      if (rect.bottom < 0 || rect.top > innerHeight) return;
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height * 0.38;
      var dx = TVA.mouse.x - cx, dy = TVA.mouse.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var k = Math.min(1, d / 260);
      tx = dx / d * 4.2 * k; ty = dy / d * 5 * k;
      lookX += (tx - lookX) * 0.2; lookY += (ty - lookY) * 0.2;
      var tf = 'translate(' + lookX.toFixed(2) + 'px,' + lookY.toFixed(2) + 'px)';
      pupils[0].style.transform = tf; pupils[1].style.transform = tf;
    };
    return rig;
  }

  var MM = TVA.mm = { create: create };

  /* =========================================================
     DOCK: a Miss Minutes que mora no canto da tela
     ========================================================= */
  var dock, bubble, bubbleP, rig, hideT, typeT, speaking = false;

  var lastLow = 0, lastSay = 0;
  MM.say = function (text, opts) {
    opts = opts || {};
    if (!rig) return;
    // falas espontâneas (low) não atropelam outras nem viram spam
    var now = Date.now();
    if (opts.low && (now - lastSay < 6000 || now - lastLow < 9000)) return;
    if (opts.low) lastLow = now;
    lastSay = now;
    var expr = opts.expr || 'happy';
    rig.expr(expr);
    if (opts.wave) rig.wave();
    if (opts.jump) rig.jump();
    if (expr === 'menace') TVA.sfx('error'); else TVA.sfx('blip');
    bubble.classList.toggle('menace', expr === 'menace');
    clearTimeout(hideT); clearInterval(typeT);
    speaking = true;
    bubble.classList.add('show');
    var dur = opts.ms || Math.max(3200, text.length * 55 + 1500);
    rig.talk(Math.min(dur - 600, text.length * 38));
    if (TVA.reduced) { bubbleP.textContent = text; }
    else {
      var i = 0; bubbleP.innerHTML = '<span></span><i class="caret">&nbsp;</i>';
      var span = bubbleP.firstChild;
      typeT = setInterval(function () {
        i += 2; span.textContent = text.slice(0, i);
        if (i % 6 === 0) TVA.sfx('type');
        if (i >= text.length) { clearInterval(typeT); span.textContent = text; var c = bubbleP.querySelector('.caret'); if (c) c.remove(); }
      }, 24);
    }
    hideT = setTimeout(function () {
      bubble.classList.remove('show'); speaking = false;
      if (rig.base !== 'happy') rig.expr('happy');
    }, dur);
    // também conversa no chat, se aberto
    if (opts.toChat && TVA.chat) TVA.chat.push(text, expr);
  };
  MM.express = function (e) { if (rig) rig.expr(e); };
  MM.dockRig = function () { return rig; };

  /* ---------- falas de reação ---------- */
  var REACT = {
    contextmenu: [['Procurando os bastidores, docinho? Não tem bastidores. É TVA até o fim.', 'menace'], ['Botão direito? Que ousadia. Anotadinho.', 'menace']],
    copy: [['Copiando documento oficial? Que fofo. Já mandei uma cópia da sua cópia pro Arquivo.', 'wink'], ['Ctrl+C detectado. O C é de "Confissão"?', 'menace']],
    'return': [['Olha quem voltou! Registrei sua ausência. Em triplicata.', 'happy'], ['Saiu da linha do tempo, foi? Eu vi. Eu sempre vejo.', 'menace']],
    clicks: [['Calma! Clicar mais rápido não faz o tempo passar mais rápido. Aqui ele nem passa.', 'oops']],
    konami: [['Códigos de trapaça são de outra linha do tempo, querido. Confiscado.', 'menace']],
    fast: [['Devagar, docinho! A Linha do Tempo Sagrada não é tobogã.', 'oops'], ['Ei, ei! Pular partes do roteiro é exatamente como começam as ramificações.', 'menace'], ['Correndo pra onde? Todo destino aqui já está decidido.', 'wink']],
    idle: [['Ainda aí? Tudo bem. O tempo não passa aqui mesmo.', 'sleepy'], ['Psiu. Ficar parado também é uma escolha, sabia?', 'wink']],
    idle2: [['Você está me encarando há dois minutos. Eu também estou te encarando. Eu ganho. Eu não pisco. Quer dizer, pisco.', 'menace']],
    select: [['Sublinhando coisas? Isso tem cara de investigação.', 'menace'], ['Seleção de texto anotada. Não que eu esteja contando.', 'wink']],
    redact: [['Ei! Isso aí é confidencial. Bom... ERA.', 'oops'], ['Ninguém mandou ler. Eu falei que podia? Falei. Mas não era pra levar a sério!', 'menace']],
    warn50: [['Só um aviso amigável: você está na metade do caminho pra um Evento Nexus. Sem pressão!', 'menace']],
    warn80: [['Oitenta por cento, docinho. Os Minutemen já estão calçando as botas.', 'menace']]
  };
  var SECTION = {
    linha: ['Segura firme! A gente vai atravessar a porta. Mãos e pés dentro da linha do tempo, por favor.', 'happy'],
    consulta: ['Hora de abrir a ficha de alguém! Que tal começar pela sua?', 'wink'],
    mapa: ['Ooh, o mapa! Pode podar à vontade. Eu adoro uma poda.', 'happy'],
    poda: ['Formulário de poda! Meu documento favorito. Caneta preta, viu?', 'happy'],
    nexus: ['Ah... isso aí. Não estou nervosa. VOCÊ está nervoso?', 'menace'],
    departamentos: ['Meus colegas! Não repare na bagunça do Mobius.', 'happy']
  };
  var seenSec = {};
  function react(kind) {
    var list = REACT[kind]; if (!list) return;
    var it = TVA.pick(list);
    MM.say(it[0], { expr: it[1], jump: it[1] === 'oops', low: !/warn/.test(kind) });
  }
  MM.react = react;

  function initDock() {
    dock = $('#mm-dock'); bubble = $('#mm-bubble'); bubbleP = bubble.querySelector('p');
    rig = create($('#mm-dock-host'));
    var cardHost = $('#dep-mm-host'), cardRig = cardHost ? create(cardHost) : null;
    if (cardRig) {
      cardRig.hips(true);
      cardHost.parentNode.addEventListener('mouseenter', function () { cardRig.expr('wink'); cardRig.wave(); });
      cardHost.parentNode.addEventListener('mouseleave', function () { cardRig.expr('happy'); });
    }
    TVA.loop(function (dt, now) { rig.update(now); if (presenter) presenter.update(now); if (cardRig) cardRig.update(now); });

    TVA.on('react', react);
    TVA.on('section', function (s) {
      // na orientação, a apresentadora assume o palco
      dock.classList.toggle('away', s.id === 'orientacao' && !TVA.chatOpen);
      if (SECTION[s.id] && !seenSec[s.id] && TVA.ready) {
        seenSec[s.id] = 1;
        setTimeout(function () { MM.say(SECTION[s.id][0], { expr: SECTION[s.id][1], wave: true, low: true }); }, 700);
      }
    });
    TVA.on('deviate', function (d) {
      if (d.level >= 80 && d.level - d.points < 80) setTimeout(function () { react('warn80'); }, 600);
      else if (d.level >= 50 && d.level - d.points < 50) setTimeout(function () { react('warn50'); }, 600);
    });
    TVA.on('pagenexus:start', function () { MM.say('Ah, não, não, não, NÃO! Evento Nexus! Chamem os Minutemen!', { expr: 'alarm', ms: 2600 }); });
    TVA.on('pagenexus:end', function () { setTimeout(function () { MM.say('Prontinho! Como se nada tivesse acontecido. Porque não aconteceu. Entendeu?', { expr: 'wink', wave: true }); }, 400); });
    TVA.on('theme', function (t) {
      MM.say(t === 'dark' ? 'Turno da noite! Meu favorito. Ninguém vê o que eu faço.' : 'Luzes acesas! Bem melhor pra ler as letras miúdas.', { expr: t === 'dark' ? 'wink' : 'happy' });
    });
    TVA.on('sound', function (on) { MM.say(on ? 'Som ligado! Agora você vai ouvir cada carimbo. Que delícia.' : 'Silêncio total. Igual ao Vazio. Só que mais aconchegante.', { expr: on ? 'happy' : 'wink' }); });
    TVA.on('dossier:open', function () { MM.say('Lendo o próprio dossiê? Corajoso. A maioria só lê no tribunal.', { expr: 'wink' }); });

    // scroll muito rápido
    var fastCount = 0, lastFast = 0;
    TVA.on('scroll', function (s) {
      if (!TVA.ready) return;
      if (Math.abs(s.v) > 5200) {
        var n = Date.now();
        if (n - lastFast > 12000) { fastCount++; lastFast = n; if (fastCount > 1) react('fast'); }
      }
    });
    // ociosidade
    var idleT, idle2T;
    function resetIdle() {
      clearTimeout(idleT); clearTimeout(idle2T);
      idleT = setTimeout(function () { react('idle'); }, 45000);
      idle2T = setTimeout(function () { react('idle2'); }, 125000);
    }
    ['pointermove', 'keydown', 'scroll', 'touchstart'].forEach(function (ev) { addEventListener(ev, resetIdle, { passive: true }); });
    resetIdle();
    // seleção longa de texto
    var selT;
    document.addEventListener('selectionchange', function () {
      clearTimeout(selT);
      selT = setTimeout(function () {
        var s = String(window.getSelection() || '');
        var a = document.activeElement;
        if (s.length > 24 && !(a && /INPUT|TEXTAREA/.test(a.tagName))) { react('select'); TVA.deviate(3, 'Grifou documento oficial', { cooldown: 30000 }); }
      }, 900);
    });
  }

  /* =========================================================
     APRESENTADORA (seção Orientação)
     ========================================================= */
  var presenter = null;
  var SCRIPT = [
    ['Oi, oi! Eu sou a Miss Minutes, sua guia de orientação aqui na TVA!', 'happy', 'wave'],
    ['Aqui a gente cuida pra que tudo aconteça do jeitinho que tem que acontecer. Sem surpresas. Surpresas são horríveis.', 'happy'],
    ['Quando alguém sai do roteiro, tipo você agorinha mesmo, a gente chama de Variante.', 'wink'],
    ['E variantes... bom. A gente poda.', 'menace'],
    ['Brincadeirinha! Quer dizer. Não. Mas primeiro vem a papelada! Muuuita papelada.', 'oops', 'jump'],
    ['Ah, e pode passar o mouse nas tarjas pretas aí do lado. Eu não vou contar pra ninguém.', 'wink'],
    ['Eu vou contar pra todo mundo.', 'menace'],
    ['Agora role pra baixo, docinho. A Linha do Tempo Sagrada está esperando. Ela é pontual.', 'happy', 'wave']
  ];
  var EXPR_LINES = {
    happy: 'Feliz! Esse é o meu padrão de fábrica. Literalmente.',
    menace: 'Assim? Só uso essa cara quando alguém não preenche o formulário inteiro.',
    oops: 'Oops! Acho que acabei de apagar uma linha do tempo. Brincadeira. Será?',
    wink: 'Entre nós dois: o Mobius nunca pilotou um jet ski. Shhh.'
  };
  function initPresenter() {
    var host = $('#presenter'); if (!host) return;
    presenter = create(host);
    var bub = $('#presenter-bubble p'), idx = 0, timer = null, visible = false, typeTT = null;
    function show(i) {
      var l = SCRIPT[i]; idx = i;
      presenter.expr(l[1]);
      if (l[2] === 'wave') presenter.wave(); if (l[2] === 'jump') presenter.jump();
      presenter.talk(Math.min(3000, l[0].length * 38));
      clearInterval(typeTT);
      if (TVA.reduced) bub.textContent = l[0];
      else {
        var k = 0; bub.textContent = '';
        typeTT = setInterval(function () { k += 2; bub.textContent = l[0].slice(0, k); if (k >= l[0].length) clearInterval(typeTT); }, 22);
      }
      if (l[1] === 'menace') TVA.sfx('error'); else TVA.sfx('blip');
    }
    function schedule() {
      clearTimeout(timer);
      if (!visible || idx >= SCRIPT.length - 1) return;
      timer = setTimeout(function () { show(idx + 1); schedule(); }, Math.max(3800, SCRIPT[idx][0].length * 60));
    }
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && TVA.ready) schedule(); else clearTimeout(timer);
    }, { threshold: 0.4 }).observe(host);
    host.addEventListener('click', function () {
      presenter.poke();
      show((idx + 1) % SCRIPT.length); schedule();
    });
    host.style.cursor = 'pointer';
    host.setAttribute('data-cursor', 'próxima fala');
    $$('[data-mm-expr]').forEach(function (b) {
      b.addEventListener('click', function () {
        var e = b.getAttribute('data-mm-expr');
        $$('[data-mm-expr]').forEach(function (x) { x.classList.toggle('on', x === b); });
        clearTimeout(timer);
        presenter.expr(e);
        if (e === 'happy') presenter.wave(); if (e === 'oops') presenter.jump();
        bub.textContent = EXPR_LINES[e];
        presenter.talk(2000);
        TVA.sfx(e === 'menace' ? 'error' : 'blip');
        if (e === 'menace') presenter.hips(true); else presenter.hips(false);
      });
    });
    TVA.on('ready', function () { if (visible) schedule(); });
  }

  TVA.initMinutes = function () { initDock(); initPresenter(); };
})();
