/* =========================================================
   TVA · features: tarjas, Consulta de Variante, Mapa das
   Linhas, Formulário de Poda, Evento Nexus, Departamentos,
   Termos de Uso
   ========================================================= */
(function () {
  'use strict';
  var TVA = window.TVA, $ = TVA.$, $$ = TVA.$$;
  var F = TVA.features = {};
  function say(t, o) { TVA.mm.say(t, o); }
  function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim(); }

  /* ======================= TARJAS DE CENSURA ======================= */
  function initRedactions() {
    var opened = 0;
    $$('.redact').forEach(function (el) {
      var cover = el.textContent;
      function open() {
        if (el.classList.contains('open')) return;
        el.classList.add('open'); el.textContent = el.dataset.truth;
        opened++;
        TVA.sfx('glitch');
        TVA.deviate(4, 'Leu trecho censurado: "' + el.dataset.truth.slice(0, 32) + '…"', { cooldown: 100 });
        if (opened === 1) TVA.mm.react('redact');
        if (opened === 3) setTimeout(function () { say('Leu tudo, né? Tudo bem. Amanhã você não vai lembrar de nada mesmo.', { expr: 'menace' }); }, 1200);
        setTimeout(function () { el.classList.remove('open'); el.textContent = cover; }, 5200);
      }
      el.addEventListener('mouseenter', open);
      el.addEventListener('click', open);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
  }

  /* ======================= CONSULTA DE VARIANTE ======================= */
  var CRIMES = [
    'Chegou 4 minutos atrasado ao próprio destino', 'Escolheu o caminho alternativo no GPS', 'Respondeu "tanto faz" a uma pergunta existencial',
    'Comeu a sobremesa antes do almoço, contrariando o roteiro', 'Desviou o olhar no momento canônico de um espirro', 'Sobreviveu a algo que não devia',
    'Disse "e se…" em voz alta', 'Leu o final do livro primeiro', 'Trocou de fila no banco. Duas vezes.', 'Não assistiu aos créditos finais',
    'Mandou "kkk" numa conversa onde o roteiro previa "rs"', 'Acordou antes do despertador', 'Aprendeu algo que não estava no currículo',
    'Usou a escada em vez do elevador previsto', 'Pensou por conta própria (reincidente)', 'Deixou uma planta viva que deveria ter morrido'
  ];
  var LINES = { sagrada: 'Sagrada (alegadamente)', ramo: 'Ramificação não autorizada', vazio: 'O Vazio', ns: 'Desconhecida (suspeito)' };
  var THREAT = ['Inofensivo', 'Irritante', 'Preocupante', 'Perigoso', 'ÔMEGA'];
  var SENT = [
    ['Advertência verbal com sorriso. Volte ao roteiro.', 'ADVERTIR'],
    ['Reset de linha e reintegração com carimbo.', 'RESETAR'],
    ['Encaminhar ao Time Theater para revisão de vida inteira.', 'REVISAR'],
    ['Poda imediata. Sem direito a lanche.', 'PODAR'],
    ['Poda imediata. Duas vezes, por garantia.', 'PODAR ×2']
  ];
  var SPECIAL = {
    'loki': { code: 'L-1130', crime: 'Fuga com o Tesseract; dezenas de variantes; ego multiversal', threat: 5, sent: ['Investigação conjunta com o Agente Mobius. Jet ski não incluso.', 'RECRUTAR'], line: 'Todas, aparentemente', when: '2012 · Nova York', mm: ['Ah. Você de novo. Ou outro você.', 'menace'] },
    'sylvie': { code: 'L-1190', crime: 'Existir. Depois, fugir. Depois, invadir o fim dos tempos', threat: 5, sent: ['Arquivo selado por ordem superior.', 'SELADO'], when: '1190 · Asgard', mm: ['Esse arquivo é confidencial. Por que você tem esse nome?', 'menace'] },
    'mobius': { code: 'A-0001', crime: 'Posse ilegal de revistas de jet ski em horário de expediente', threat: 1, sent: ['Advertência. E uma salada de frutas.', 'ADVERTIR'], when: 'Desconhecido · memória apagada', mm: ['Ownn, o Mobius! Ele nem sabe que tem ficha.', 'wink'] },
    'miss minutes': { code: 'IA-0000', crime: 'Nenhum. Ela escreveu esta ficha.', threat: 1, sent: ['Funcionária exemplar. Promoção recomendada (por ela mesma).', 'ELOGIAR'], when: 'Sempre', mm: ['Eu? Ficha impecável. Fui eu que preenchi.', 'wink'] },
    'aquele que permanece': { code: '█-████', crime: '████████████████████', threat: 5, sent: ['ACESSO NEGADO. Esta consulta será esquecida.', 'NEGADO'], when: '████ · Fim dos Tempos', mm: ['Não. Não, não. Fecha isso agora, docinho.', 'menace'], redacted: true },
    'b-15': { code: 'C-0015', crime: 'Lembrar de coisas (em investigação)', threat: 3, sent: ['Reavaliação psicológica e um dia de folga (negado).', 'REVISAR'], when: 'Antes da TVA · dado apagado', mm: ['Ela anda pensativa. Não gosto de pensativa.', 'menace'] },
    'renslayer': { code: 'J-0000', crime: 'Fundação não declarada de agência temporal', threat: 4, sent: ['Processo arquivado. Ré em paradeiro desconhecido.', 'ARQUIVAR'], when: 'Séc. 31', mm: ['Eu falei que era pra não perguntar dela.', 'menace'] },
    'ouroboros': { code: 'R-0B00', crime: 'Escrever um manual de algo que ainda não existia', threat: 2, sent: ['Paradoxo ontológico. Arquivar no arquivo do arquivo.', 'ARQUIVAR'], when: '1893 · ou antes · ou depois', mm: ['O.B.! Ele consertou meu relógio uma vez. Eu acho.', 'happy'] },
    'thanos': { code: 'T-0001', crime: 'Estalar os dedos sem autorização', threat: 5, sent: ['Fora da nossa jurisdição. Isso é coisa da linha principal.', 'IGNORAR'], when: '2018', mm: ['Esse aí é problema da Linha Sagrada mesmo. Deixa quieto.', 'oops'] }
  };
  var ALIAS = { 'he who remains': 'aquele que permanece', 'kang': 'aquele que permanece', 'o.b.': 'ouroboros', 'ob': 'ouroboros', 'o.b': 'ouroboros', 'b15': 'b-15', 'ravonna': 'renslayer', 'ravonna renslayer': 'renslayer', 'mobius m. mobius': 'mobius', 'loki laufeyson': 'loki', 'miss minutos': 'miss minutes' };

  function photoSVG(r, special) {
    var horns = special === 'loki' || special === 'sylvie' || r() < 0.12;
    var hair = Math.floor(r() * 4), skin = TVA.pick(['#C69A75', '#8D5E3C', '#E2BC96', '#A87652', '#5E3B26'], r);
    var lines = ''; for (var i = 0; i < 7; i++) lines += '<line x1="0" x2="92" y1="' + (12 + i * 14) + '" y2="' + (12 + i * 14) + '" stroke="currentColor" stroke-opacity=".15"/>';
    var hairP = ['M30 44 Q46 18 62 44', 'M28 50 Q30 20 46 22 Q64 20 64 50 Q60 34 46 32 Q34 34 28 50Z', 'M30 40 Q46 30 62 40 L62 34 Q46 22 30 34Z', ''][hair];
    var hornP = horns ? '<path d="M34 30 Q22 12 30 2 Q32 18 40 26Z M58 30 Q70 12 62 2 Q60 18 52 26Z" fill="#D9A441" stroke="#2A1D14" stroke-width="1.5"/>' : '';
    if (special === 'aquele que permanece') return '<svg viewBox="0 0 92 112">' + lines + '<rect x="14" y="16" width="64" height="80" fill="#000"/><text x="46" y="62" fill="#FF4D2E" font-family="VT323" font-size="16" text-anchor="middle">CENSURADO</text></svg>';
    return '<svg viewBox="0 0 92 112">' + lines +
      '<path d="M12 112 Q14 80 46 76 Q78 80 80 112Z" fill="#3B2A1E"/>' +
      '<ellipse cx="46" cy="50" rx="17" ry="21" fill="' + skin + '"/>' +
      (hairP ? '<path d="' + hairP + '" fill="#2A1D14"/>' : '') + hornP +
      '<rect x="22" y="96" width="48" height="12" fill="#EFE5CF" stroke="#2A1D14"/><text x="46" y="105" font-family="VT323" font-size="10" text-anchor="middle" fill="#2A1D14">TVA·' + Math.floor(r() * 9000 + 1000) + '</text></svg>';
  }

  function drawChart(canvas, r, threat, pruned) {
    var c = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    var col = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#2A1D14';
    var divX = 0.18 + r() * 0.4, dir = r() < 0.5 ? -1 : 1, amp = (0.13 + threat * 0.05) / 2.2;
    var start = performance.now(), dur = TVA.reduced ? 1 : 1100;
    function y0(x) { return H * 0.55 + Math.sin(x / W * 9) * 4; }
    (function frame(now) {
      var p = Math.min(1, (now - start) / dur);
      c.clearRect(0, 0, W, H);
      // grade
      c.strokeStyle = col; c.globalAlpha = 0.12; c.lineWidth = 1;
      for (var gx = 0; gx <= W; gx += W / 12) { c.beginPath(); c.moveTo(gx, 10); c.lineTo(gx, H - 18); c.stroke(); }
      c.globalAlpha = 0.6; c.font = '15px VT323, monospace'; c.fillStyle = col;
      c.fillText('LINHA SAGRADA', 6, y0(0) - 10);
      // linha sagrada
      c.globalAlpha = 1; c.strokeStyle = '#D9A441'; c.lineWidth = 3;
      c.beginPath(); for (var x = 0; x <= W * p; x += 4) { var yy = y0(x); x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke();
      // ramificação
      var bx = divX * W;
      if (W * p > bx) {
        var len = (W * p - bx);
        c.strokeStyle = '#FF4D2E'; c.lineWidth = 2.5; c.setLineDash([]);
        c.beginPath(); c.moveTo(bx, y0(bx));
        for (var s = 0; s <= len; s += 4) { var t = s / (W - bx); c.lineTo(bx + s, y0(bx + s) + dir * Math.pow(t, 1.3) * H * amp * 2.2 + Math.sin(s * 0.08) * 2); }
        c.stroke();
        c.fillStyle = '#FF4D2E'; c.beginPath(); c.arc(bx, y0(bx), 5, 0, 7); c.fill();
        c.font = '14px VT323, monospace'; c.fillText('EVENTO NEXUS', bx + 8, y0(bx) + (dir > 0 ? -10 : 18));
        if (p >= 1 && pruned) {
          var ex = W - 18, ey = y0(ex) + dir * H * amp * 2.2;
          c.strokeStyle = '#FF4D2E'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(ex - 8, ey - 8); c.lineTo(ex + 8, ey + 8); c.moveTo(ex + 8, ey - 8); c.lineTo(ex - 8, ey + 8); c.stroke();
        }
      }
      c.globalAlpha = 0.55; c.fillStyle = col; c.font = '13px VT323, monospace';
      ['-∞', '1000', '1893', '1985', '2077', '+∞'].forEach(function (l, i) { c.fillText(l, i * (W - 30) / 5 + 2, H - 4); });
      c.globalAlpha = 1;
      if (p < 1) requestAnimationFrame(frame);
    })(start);
  }

  F.lookup = function (rawName, line) {
    var name = String(rawName || '').trim().slice(0, 40);
    if (!name) return;
    $('#lookup-name').value = name;
    if (line) $('#lookup-line').value = line;
    line = $('#lookup-line').value;
    var key = norm(name); key = ALIAS[key] || key;
    var sp = SPECIAL[key];
    var r = TVA.rng(TVA.hash(key + '|' + line));
    var threat = sp ? sp.threat : Math.min(5, 1 + Math.floor(r() * 4 + (line === 'ramo' ? 1 : 0) + (line === 'vazio' ? 0.6 : 0)));
    var sentence = sp ? sp.sent : SENT[threat - 1];
    var me = TVA.case.name && norm(TVA.case.name) === key;
    var year = Math.floor(r() * 4200 - 1400);
    var code = sp ? sp.code : (name.replace(/[^a-z]/gi, '').charAt(0).toUpperCase() || 'X') + '-' + TVA.pad(Math.floor(r() * 9999), 4);

    var ficha = $('#ficha');
    $('.ficha-empty', ficha).hidden = true;
    var body = $('.ficha-body', ficha);
    body.hidden = false;
    body.style.animation = 'none'; void body.offsetWidth; body.style.animation = '';
    $('#f-name').textContent = sp && sp.redacted ? '█████ ███ ████████' : name;
    $('#f-code').textContent = 'Nº ' + code + (me ? ' · VOCÊ' : '');
    $('#f-crime').textContent = sp ? sp.crime : TVA.pick(CRIMES, r);
    $('#f-when').textContent = sp ? sp.when : (year < 0 ? Math.abs(year) + ' a.C.' : year) + ' · ' + TVA.pick(['terça-feira', 'feriado', 'madrugada', 'horário comercial', 'dia de chuva'], r);
    $('#f-line').textContent = sp && sp.line ? sp.line : LINES[line];
    $('#f-photo').innerHTML = photoSVG(r, key);
    var bars = $$('#f-threat i');
    bars.forEach(function (b, i) { b.classList.remove('on'); void b.offsetWidth; b.classList.toggle('on', i < threat); });
    $('#f-threat-label').textContent = THREAT[threat - 1];
    $('#f-prob').textContent = (threat * 17 + Math.floor(r() * 14)) + ',' + Math.floor(r() * 99) + '%';
    $('#f-sentence').textContent = sentence[0];
    var st = $('#f-stamp');
    st.textContent = sentence[1];
    st.style.color = /PODAR|NEGADO|SELADO/.test(sentence[1]) ? 'var(--rust)' : (/RECRUTAR|ELOGIAR/.test(sentence[1]) ? 'var(--approved)' : 'var(--teal)');
    st.classList.remove('hit'); void st.offsetWidth;
    setTimeout(function () { st.classList.add('hit'); TVA.sfx('stamp'); }, TVA.reduced ? 0 : 1100);
    drawChart($('#f-chart'), r, threat, /PODAR/.test(sentence[1]));
    TVA.sfx('blip');

    if (sp && sp.mm) say(sp.mm[0], { expr: sp.mm[1] });
    else if (me) { say('Consultando a própria ficha? Que coragem! Anotei duas vezes.', { expr: 'wink' }); TVA.deviate(3, 'Consultou a própria ficha'); }
    else if (threat >= 4) say('Ih. ' + THREAT[threat - 1] + '. Eu não chegaria perto dessa pessoa. Mas eu sou um relógio.', { expr: 'menace' });
    else if (threat === 1) say('Inofensivo! Que tédio. Próximo!', { expr: 'happy' });
    if (key === 'aquele que permanece') TVA.deviate(12, 'Consultou arquivo proibido');
  };

  function initLookup() {
    $('#lookup-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var n = $('#lookup-name').value.trim();
      if (!n) { $('#lookup-name').focus(); say('Um nome, docinho. A gente não consulta o vazio. Quer dizer, consulta, mas é outro formulário.', { expr: 'oops' }); return; }
      F.lookup(n);
      if (innerWidth < 900) $('#ficha').scrollIntoView({ behavior: TVA.reduced ? 'auto' : 'smooth', block: 'start' });
    });
  }

  /* ======================= MAPA DAS LINHAS ======================= */
  function initMap() {
    var cv = $('#map-canvas'), ctx = cv.getContext('2d'), screen = $('.crt-screen');
    var W = 0, H = 0, dpr = 1, visible = false;
    var offset = 0, speed = 38, branches = [], spawnT = 1.5, pruned = 0, escaped = 0, overT = 0, autoT = 0, hover = null, sweep = -1;
    var mouse = { x: -999, y: -999, in: false };
    var elActive = $('#m-active'), elPruned = $('#m-pruned'), elLoad = $('#m-load'), elLoom = $('#m-loom');
    var auto = $('#m-auto');
    function resize() {
      var r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0b0703'; ctx.fillRect(0, 0, W, H);
    }
    function lineY(wx) { return H * 0.56 + Math.sin(wx * 0.006) * H * 0.05 + Math.sin(wx * 0.017) * H * 0.015; }
    function spawn(wx, parent, dir) {
      if (branches.length > 70) return;
      var b = { wx: wx, dir: dir || (Math.random() < 0.5 ? -1 : 1), len: 0, max: 120 + Math.random() * 260, grow: 30 + Math.random() * 40,
        curve: 0.6 + Math.random() * 0.9, wob: Math.random() * 10, state: 'grow', t: 0, parent: parent || null, children: 0, by: 0 };
      if (parent) { var pt = pointAt(parent, parent.len * (0.5 + Math.random() * 0.5)); b.wx = pt.wx; b.by = pt.y - lineY(pt.wx); b.max *= 0.6; }
      branches.push(b);
      TVA.sfx('tick');
      return b;
    }
    function pointAt(b, s) {
      var wx = b.wx + s;
      var base = b.parent ? (lineY(wx) + b.by) : lineY(wx);
      return { wx: wx, y: base + b.dir * Math.pow(s / 100, b.curve + 0.6) * 60 * (b.parent ? 0.7 : 1) + Math.sin(s * 0.05 + b.wob) * 3 };
    }
    function prune(b, silent) {
      if (b.state === 'prune') return;
      b.state = 'prune'; b.t = 0; pruned++;
      branches.forEach(function (c) { if (c.parent === b) prune(c, true); });
      if (!silent) TVA.sfx('prune');
    }
    function load() {
      var sum = 0; branches.forEach(function (b) { if (b.state !== 'prune') sum += b.len; });
      return Math.min(1.25, sum / 3200 + escaped * 0.04);
    }
    function nearest(mx, my) {
      var best = null, bd = 16 * 16;
      branches.forEach(function (b) {
        if (b.state === 'prune') return;
        for (var s = 0; s <= b.len; s += 6) {
          var p = pointAt(b, s), sx = p.wx - offset, dx = sx - mx, dy = p.y - my, d = dx * dx + dy * dy;
          if (d < bd) { bd = d; best = b; }
        }
      });
      return best;
    }
    cv.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.in = true; });
    cv.addEventListener('pointerleave', function () { mouse.in = false; hover = null; cv.removeAttribute('data-cursor'); });
    cv.addEventListener('click', function (e) {
      var r = cv.getBoundingClientRect(), b = nearest(e.clientX - r.left, e.clientY - r.top);
      if (b) {
        prune(b);
        if (pruned === 1) say('Isso! Podinha caprichada. Viu como é terapêutico?', { expr: 'happy' });
        if (pruned === 25) say('Vinte e cinco podas! Você daria um ótimo Minuteman. Quer o uniforme?', { expr: 'wink', jump: true });
      } else {
        // clique no vazio: cria ramificação (livre-arbítrio!)
        spawn(offset + (e.clientX - r.left), null, (e.clientY - r.top) < lineY(offset + e.clientX - r.left) ? -1 : 1);
        TVA.deviate(2, 'Criou ramificação no monitor oficial', { cooldown: 8000 });
      }
    });
    $('#m-spawn').addEventListener('click', function () {
      for (var i = 0; i < 4; i++) spawn(offset + W * (0.3 + Math.random() * 0.6));
      TVA.sfx('glitch');
      TVA.deviate(3, 'Provocou Evento Nexus no monitor', { cooldown: 6000 });
    });
    $('#m-reset').addEventListener('click', function () {
      sweep = 0; TVA.sfx('prune'); escaped = 0;
      say('Reset em massa! Varre, varre, varre. Ninguém viu nada.', { expr: 'wink' });
    });
    auto.addEventListener('change', function () {
      if (auto.checked) say('Minutemen automáticos ativados. Agora eu nem preciso de você. Brincadeira. Preciso. Pra vigiar.', { expr: 'happy' });
    });

    var overloadWarned = false;
    function step(dt) {
      offset += speed * dt;
      spawnT -= dt * (1 + load() * 1.5);
      if (spawnT <= 0) { spawnT = 0.9 + Math.random() * 1.8; spawn(offset + W * (0.55 + Math.random() * 0.45)); }
      if (auto.checked) {
        autoT -= dt;
        if (autoT <= 0) {
          autoT = 0.7;
          var oldest = null; branches.forEach(function (b) { if (b.state !== 'prune' && (!oldest || b.wx < oldest.wx)) oldest = b; });
          if (oldest) prune(oldest);
        }
      }
      if (sweep >= 0) {
        sweep += dt * W * 1.4;
        branches.forEach(function (b) { if (b.state !== 'prune' && b.wx - offset < sweep) prune(b, true); });
        if (sweep > W) sweep = -1;
      }
      for (var i = branches.length - 1; i >= 0; i--) {
        var b = branches[i];
        if (b.state === 'grow') {
          b.len = Math.min(b.max, b.len + b.grow * dt);
          if (b.len > 70 && !b.parent && b.children < 2 && Math.random() < dt * 0.25) { b.children++; spawn(0, b, Math.random() < 0.5 ? b.dir : -b.dir); }
        } else if (b.state === 'prune') {
          b.t += dt; b.len = Math.max(0, b.len * (1 - dt * 5) - 60 * dt);
          if (b.len <= 0.5) branches.splice(i, 1);
          continue;
        }
        if (b.wx + b.len - offset < -20) { branches.splice(i, 1); if (!b.parent) escaped++; }
      }
      if (escaped > 0) escaped = Math.max(0, escaped - dt * 0.02);
      var L = load();
      if (L >= 1) {
        overT += dt; screen.classList.add('overload');
        if (!overloadWarned) { overloadWarned = true; say('O Tear está sobrecarregando! Poda, poda, PODA!', { expr: 'alarm' }); TVA.sfx('alarm'); }
        if (overT > 6) { overT = 0; sweep = 0; escaped = 0; say('Tarde demais. O Tear fez um reset sozinho. Isso vai pro seu dossiê.', { expr: 'menace' }); TVA.deviate(8, 'Deixou o Tear Temporal sobrecarregar'); }
      } else { overT = 0; screen.classList.remove('overload'); if (L < 0.7) overloadWarned = false; }
      hover = mouse.in ? nearest(mouse.x, mouse.y) : null;
      if (hover) cv.setAttribute('data-cursor', 'podar'); else cv.removeAttribute('data-cursor');
      cv.style.cursor = TVA.finePointer ? 'none' : (hover ? 'pointer' : 'crosshair');
    }
    function draw() {
      // persistência de fósforo
      ctx.fillStyle = 'rgba(11,7,3,0.34)'; ctx.fillRect(0, 0, W, H);
      // grade
      ctx.strokeStyle = 'rgba(255,176,0,0.07)'; ctx.lineWidth = 1;
      var gs = 48, gx0 = -(offset % gs);
      ctx.beginPath();
      for (var gx = gx0; gx < W; gx += gs) { ctx.moveTo(gx, 0); ctx.lineTo(gx, H); }
      for (var gy = 0; gy < H; gy += gs) { ctx.moveTo(0, gy); ctx.lineTo(W, gy); }
      ctx.stroke();
      // anos
      ctx.fillStyle = 'rgba(255,176,0,0.45)'; ctx.font = '15px VT323, monospace';
      var yStep = 240, ys0 = Math.floor(offset / yStep) * yStep;
      for (var yx = ys0; yx < offset + W + yStep; yx += yStep) ctx.fillText(String(1400 + Math.floor(yx / yStep) * 37), yx - offset + 4, H - 10);
      // linha sagrada (dupla passada = brilho barato)
      function sacred(w, a) {
        ctx.strokeStyle = 'rgba(255,186,60,' + a + ')'; ctx.lineWidth = w; ctx.beginPath();
        for (var x = 0; x <= W; x += 6) {
          var wx = x + offset, y = lineY(wx);
          if (mouse.in) { var dx = x - mouse.x, dy = y - mouse.y, d2 = dx * dx + dy * dy; y += (dy > 0 ? 1 : -1) * 18 * Math.exp(-d2 / 1800); }
          x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      sacred(9, 0.08); sacred(4, 0.25); sacred(1.6, 0.95);
      // ramificações
      branches.forEach(function (b) {
        var pr = b.state === 'prune', hv = b === hover;
        var col = pr ? 'rgba(255,230,170,' + Math.max(0, 1 - b.t * 2) + ')' : (hv ? 'rgba(255,240,200,1)' : 'rgba(255,77,46,0.95)');
        ctx.strokeStyle = col; ctx.lineWidth = hv ? 3 : 1.8; ctx.beginPath();
        for (var s = 0; s <= b.len; s += 5) { var p = pointAt(b, s); s ? ctx.lineTo(p.wx - offset, p.y) : ctx.moveTo(p.wx - offset, p.y); }
        ctx.stroke();
        var tip = pointAt(b, b.len);
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(tip.wx - offset, tip.y, pr ? 4 + b.t * 30 : 2.6, 0, 7);
        pr ? (ctx.strokeStyle = col, ctx.lineWidth = 1.5, ctx.stroke()) : ctx.fill();
        if (!b.parent && !pr) { var o = pointAt(b, 0); ctx.fillStyle = 'rgba(255,77,46,.9)'; ctx.fillRect(o.wx - offset - 3, o.y - 3, 6, 6); }
      });
      if (sweep >= 0) {
        ctx.fillStyle = 'rgba(255,122,26,0.18)'; ctx.fillRect(0, 0, sweep, H);
        ctx.fillStyle = 'rgba(255,200,120,0.9)'; ctx.fillRect(sweep - 2, 0, 3, H);
      }
      if (mouse.in && !hover) {
        ctx.strokeStyle = 'rgba(255,176,0,.35)'; ctx.setLineDash([3, 4]); ctx.beginPath();
        ctx.moveTo(mouse.x, 0); ctx.lineTo(mouse.x, H); ctx.stroke(); ctx.setLineDash([]);
      }
      var active = branches.filter(function (b) { return b.state !== 'prune'; }).length, L = load();
      elActive.textContent = active; elPruned.textContent = pruned;
      elLoad.textContent = Math.round(L * 100) + '%'; elLoom.style.width = Math.min(100, L * 100) + '%';
    }
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.05 }).observe(cv);
    addEventListener('resize', resize);
    resize();
    // população inicial
    for (var i = 0; i < 4; i++) { var b = spawn(W * (0.15 + i * 0.22)); if (b) b.len = 60 + Math.random() * 80; }
    TVA.loop(function (dt) { if (!visible) return; if (W < 2) resize(); step(TVA.reduced ? dt * 0.5 : dt); draw(); });
  }

  /* ======================= FORMULÁRIO DE PODA ======================= */
  var URG = ['Baixa (quando der)', 'Normal (próximo milênio)', 'Moderada (até o fim dos tempos)', 'Alta (ontem)', 'Crítica (antes de acontecer)'];
  function initPrune() {
    var form = $('#prune-form'), urg = $('#pf-urg'), out = $('#pf-urg-out');
    urg.addEventListener('input', function () { out.textContent = URG[urg.value - 1]; TVA.sfx('tick'); });
    form.addEventListener('reset', function () {
      setTimeout(function () {
        out.textContent = URG[2];
        $$('.field.invalid', form).forEach(function (f) { f.classList.remove('invalid'); });
        var ink = $('#stamp-ink'); ink.className = 'stamp-ink'; ink.innerHTML = '';
        $('.r-empty').hidden = false; $('.r-body').hidden = true;
      });
      say('Rasgou o formulário? Tudo bem. Temos mais 40 milhões no estoque.', { expr: 'wink' });
      TVA.sfx('whoosh');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#pf-variant').value.trim(), line = $('#pf-line').value, year = $('#pf-year').value, why = $('#pf-why').value.trim();
      var crimes = $$('input[name="crime"]:checked', form).map(function (c) { return c.value; });
      var signed = $('#pf-sign').checked;
      var errs = [];
      function mark(el, bad) { var f = el.closest('.field'); f.classList.toggle('invalid', bad); if (bad) errs.push(f); }
      mark($('#pf-variant'), !v);
      mark($('#pf-line'), !line);
      mark($('.crimes legend'), !crimes.length);
      mark($('#pf-why'), why.split(/\s+/).filter(Boolean).length < 3);
      var key = norm(v), ok, reason;
      if (errs.length) { ok = false; reason = 'Formulário incompleto (' + errs.length + ' campo' + (errs.length > 1 ? 's' : '') + ')'; }
      else if (/miss minutes|minutos/.test(key)) { ok = false; reason = 'Requisição contra servidora essencial. Remetente anotado.'; TVA.deviate(10, 'Tentou podar a Miss Minutes'); }
      else if (/^mobius/.test(key)) { ok = false; reason = 'Analista protegido por sindicato (e por amizade).'; }
      else if (/^(eu|eu mesmo|eu mesma|mim)$/.test(key) || (TVA.case.name && norm(TVA.case.name) === key)) { ok = true; reason = 'Auto-poda aprovada. Que iniciativa admirável!'; }
      else if (!signed) { ok = false; reason = 'Declaração ausente: livre-arbítrio presumido.'; TVA.deviate(5, 'Admitiu agir por livre-arbítrio (formulário)'); }
      else { ok = TVA.hash(key + why.length) % 5 !== 0; reason = ok ? 'Encaminhado aos Minutemen. Previsão: imediata.' : 'Negado por excesso de entusiasmo. Tente com menos vontade.'; }

      var proto = 'TVA-PD-' + (year || '0000').toString().slice(-4).padStart(4, '0') + '-' + (TVA.hash(v + Date.now()) % 0xffff).toString(16).toUpperCase().padStart(4, '0') + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + Math.floor(Math.random() * 90 + 10);

      // carimbo
      var tool = $('#stamp-tool'), ink = $('#stamp-ink');
      tool.classList.remove('drop'); ink.className = 'stamp-ink'; void tool.offsetWidth;
      ink.innerHTML = (ok ? 'APROVADO' : 'NEGADO') + '<small>' + proto + '</small>';
      tool.classList.add('drop'); ink.classList.add(ok ? 'ok' : 'no', 'hit');
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      setTimeout(function () { TVA.sfx('stamp'); setTimeout(function () { TVA.sfx(ok ? 'approve' : 'error'); }, 200); }, TVA.reduced ? 0 : 380);

      // comprovante
      setTimeout(function () {
        $('.r-empty').hidden = true;
        var rb = $('.r-body'); rb.hidden = false; rb.style.animation = 'none'; void rb.offsetWidth; rb.style.animation = '';
        $('#r-proto').textContent = proto;
        var rows = [['Variante', v || '—'], ['Linha', line || '—'], ['Ano', year || '—'], ['Crimes', crimes.length || '0'], ['Urgência', URG[urg.value - 1].split(' ')[0]], ['Data', new Date().toLocaleDateString('pt-BR')], ['Hora', TVA.timeStr()]];
        $('#r-dl').innerHTML = rows.map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + TVA.escape(r[1]) + '</dd></div>'; }).join('');
        var vd = $('#r-verdict'); vd.className = 'r-verdict ' + (ok ? 'ok' : 'no'); vd.textContent = (ok ? 'APROVADO · ' : 'NEGADO · ') + reason;
        var bc = '', x = 0, rr = TVA.rng(TVA.hash(proto));
        while (x < 200) { var w = 1 + Math.floor(rr() * 3); if (rr() > 0.4) bc += '<rect x="' + x + '" y="0" width="' + w + '" height="40" fill="#2a2420"/>'; x += w + 1; }
        $('#r-barcode').innerHTML = bc;
      }, TVA.reduced ? 0 : 900);

      setTimeout(function () {
        if (ok) say(TVA.pick(['Aprovado! Ai, eu amo quando a burocracia funciona.', 'Carimbado! Os Minutemen já estão a caminho. Eles adoram uma caminhada.']), { expr: 'happy', jump: true });
        else if (errs.length) say('Negado! Faltou preencher coisa. A papelada é sagrada, docinho.', { expr: 'menace' });
        else say(TVA.pick(['Negado. Não fique triste. Fique em conformidade.', 'Ooops! Negado. Mas o carimbo ficou lindo, né?']), { expr: 'oops' });
      }, 1300);
    });
  }

  /* ======================= EVENTO NEXUS (contagem) ======================= */
  var TARGET = new Date(2026, 11, 18, 0, 0, 0).getTime();
  var simUntil = 0;
  F.simulateZero = function (ms) { simUntil = Date.now() + (ms || 7000); document.getElementById('nexus').scrollIntoView({ behavior: TVA.reduced ? 'auto' : 'smooth' }); };
  function initCountdown() {
    var els = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') }, sec = $('#nexus'), status = $('#nexus-status');
    var prev = {}, wasZero = null;
    function set(k, v) { if (prev[k] !== v) { els[k].textContent = v; els[k].classList.remove('tick'); void els[k].offsetWidth; els[k].classList.add('tick'); prev[k] = v; } }
    function tick() {
      var diff = TARGET - Date.now(), zero = diff <= 0 || Date.now() < simUntil;
      if (zero) { set('d', '000'); set('h', '00'); set('m', '00'); set('s', '00'); }
      else {
        var s = Math.floor(diff / 1000);
        set('d', TVA.pad(Math.floor(s / 86400), 3)); set('h', TVA.pad(Math.floor(s / 3600) % 24, 2)); set('m', TVA.pad(Math.floor(s / 60) % 60, 2)); set('s', TVA.pad(s % 60, 2));
      }
      if (zero !== wasZero) {
        sec.classList.toggle('zero', zero);
        status.innerHTML = zero ? '<b>EVENTO NEXUS EM ANDAMENTO</b> · A Linha Sagrada está ramificando. Bom filme.' : 'Probabilidade de ramificação: <b>99,98%</b> · Recomendação: não sair de casa. Exceto para o cinema.';
        if (zero && wasZero !== null) { TVA.sfx('glitch'); TVA.sfx('alarm'); say('ZERO! Ai, ai, ai! Todo mundo pro Hall C!', { expr: 'alarm' }); TVA.emit('pagenexus:start'); setTimeout(function () { TVA.emit('pagenexus:end'); }, 2600); }
        wasZero = zero;
      }
    }
    tick(); setInterval(tick, 1000);
  }

  /* ======================= DEPARTAMENTOS ======================= */
  F.jetski = function (fromChat) {
    var art = $('.art-mobius');
    if (art.classList.contains('ride')) return;
    if (!fromChat) document.getElementById('dep-mobius').scrollIntoView({ behavior: 'smooth', block: 'center' });
    art.classList.add('ride'); TVA.sfx('whoosh');
    setTimeout(function () { art.classList.remove('ride'); }, 2900);
    if (!fromChat) say('Vruuuum! Ele nunca vai saber que foi tão fácil. Não conta pra ele.', { expr: 'wink' });
  };
  function initDeps() {
    $$('[data-egg]').forEach(function (b) {
      b.addEventListener('click', function () {
        var egg = b.dataset.egg;
        if (egg === 'jetski') F.jetski(true), say('Vruuuum! Ele nunca vai saber que foi tão fácil. Não conta pra ele.', { expr: 'wink' });
        if (egg === 'chat') TVA.chat.open();
        if (egg === 'rens') {
          var art = $('.art-rens'), open = !art.classList.contains('open');
          art.classList.toggle('open', open);
          $('.rens-status').textContent = open ? 'PODADA*' : 'ATIVA';
          $('.rens-where').textContent = open ? 'desconhecido · *ou não' : 'Gabinete 1';
          $('.rens-tag').textContent = open ? 'cargo: ███████' : 'cargo sob revisão';
          b.textContent = open ? 'Fechar a pasta e fingir que não viu' : 'Abrir a pasta mesmo assim';
          if (open) { say('Eu falei pra não abrir. Eu falei. Tá no seu dossiê agora.', { expr: 'menace' }); TVA.deviate(5, 'Abriu pasta funcional restrita (Renslayer)'); TVA.sfx('error'); }
        }
      });
    });
    // TemPad
    var disp = $('#tp-display'), door = $('#tp-door'), buf = '';
    var DEST = {
      1858: 'Chicago, antes da Feira. Cuidado com inventores carismáticos.', 1893: 'Feira Mundial de Chicago! Leve um manual. Ou escreva um.',
      1985: 'Oshkosh, Wisconsin. Feira renascentista. Saia antes da carroça de doces.', 2050: 'Haven Hills. Traga guarda-chuva. Traga um bunker.',
      2077: 'Lamentis-1. Leve carregador extra. Sério.', 2012: 'Nova York. Alguém vai derrubar um Tesseract. Desvie.',
      2026: 'Dezembro de 2026? Evento Nexus de grau Ômega. Pipoca por sua conta.', 0: 'Ano zero? O Vazio aceita reservas.', 9999: 'Fim dos Tempos. Bata antes de entrar no castelo.'
    };
    $$('.tp-keys button').forEach(function (k) {
      k.addEventListener('click', function () {
        var v = k.dataset.k; TVA.sfx('tick');
        if (v === 'C') { buf = ''; disp.textContent = 'TEMPAD OK'; return; }
        if (v === 'GO') {
          if (!buf) { disp.textContent = 'ERRO: SEM DESTINO'; TVA.sfx('error'); return; }
          var y = parseInt(buf, 10);
          disp.textContent = '→ ' + TVA.pad(y, 4);
          door.classList.remove('open'); void door.offsetWidth; door.classList.add('open'); TVA.sfx('door');
          say(DEST[y] || ('Ano ' + y + '. Destino aprovado. Volte antes do jantar, que é servido no ano 0001.'), { expr: DEST[y] ? 'wink' : 'happy' });
          if (!DEST[y]) TVA.deviate(2, 'Viagem recreativa via TemPad para ' + y, { cooldown: 6000 });
          buf = ''; return;
        }
        if (buf.length >= 4) buf = '';
        buf += v; disp.textContent = 'ANO: ' + buf + '_';
      });
    });
    // B-15
    var badge = $('#badge-b15'), hits = 0;
    function hitBadge() {
      hits++; badge.classList.remove('hit'); void badge.offsetWidth; badge.classList.add('hit'); TVA.sfx('click');
      if (hits === 3) {
        $('.art-b15').classList.add('remember');
        say('B-15! Volte ao trabalho. Isso aí não é seu. Quer dizer, era. Não é mais.', { expr: 'menace' });
        TVA.deviate(4, 'Despertou memória de servidora (B-15)');
        setTimeout(function () { $('.art-b15').classList.remove('remember'); hits = 0; }, 5200);
      }
    }
    badge.addEventListener('click', hitBadge);
    badge.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hitBadge(); } });
    // Guardiões
    var k2 = $('#keepers-svg .k2');
    k2.setAttribute('data-cursor', 'não clique');
    k2.addEventListener('click', function () {
      var art = $('.art-keepers'); if (art.classList.contains('broken')) return;
      art.classList.add('broken'); TVA.sfx('stamp'); TVA.sfx('glitch');
      say('Isso... era decorativo! Os Guardiões verdadeiros estão em outra sala. Uma sala bem orgânica. Bem carne e osso.', { expr: 'oops', jump: true });
      TVA.deviate(12, 'Decapitou um Guardião do Tempo');
      setTimeout(function () { art.classList.remove('broken'); }, 7000);
    });
  }

  /* ======================= TERMOS DE USO ======================= */
  function initTerms() {
    var box = $('#agree'), msg = $('#agree-msg'), tries = 0;
    var M = ['Sua discordância foi registrada e indeferida.', 'Discordância não encontrada no roteiro.', 'Tentativa nº 3. Livre-arbítrio é decorativo, lembra? (cláusula 1.1)', 'A caixa prefere ficar marcada. Respeite a caixa.'];
    box.addEventListener('change', function () {
      if (box.checked) return;
      tries++;
      TVA.deviate(4, 'Tentou discordar dos Termos de Uso', { cooldown: 500 });
      TVA.sfx('error');
      setTimeout(function () { box.checked = true; TVA.sfx('stamp'); }, 450);
      if (tries <= M.length) msg.textContent = M[tries - 1];
      if (tries === 2) say('Discordar? Que gracinha. Eu desmarco, você remarca. Quer dizer, eu remarco.', { expr: 'menace' });
      if (tries >= 5) {
        box.disabled = true;
        msg.textContent = 'Opção de discordar removida para sua conveniência.';
        say('Pronto, tirei essa opção. Agora ninguém se estressa. Viu como o livre-arbítrio só atrapalha?', { expr: 'wink' });
      }
    });
    $('#screw').addEventListener('click', function () { TVA.terminal && TVA.terminal.open(); });
  }

  TVA.initFeatures = function () {
    initRedactions(); initLookup(); initMap(); initPrune(); initCountdown(); initDeps(); initTerms();
  };
})();
