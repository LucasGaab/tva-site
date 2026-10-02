/* =========================================================
   TVA · boot: pré-carregamento e inicialização
   ========================================================= */
(function () {
  'use strict';
  var TVA = window.TVA, $ = TVA.$;
  document.body.classList.add('is-loading');

  var steps = [
    'Sincronizando com a Linha do Tempo Sagrada',
    'Abrindo Porta Temporal nº 7',
    'Despertando a Miss Minutes',
    'Carimbando seu processo',
    'Podando ramificações pendentes'
  ];
  var fill = $('#pre-fill'), status = $('#pre-status'), pct = 0, si = 0;

  function safe(name, fn) { try { fn(); } catch (e) { console.error('[TVA] falha em ' + name, e); } }

  safe('core', TVA.initCore);
  safe('minutes', TVA.initMinutes);
  safe('chat', TVA.initChat);
  safe('scene', TVA.initScene);
  safe('features', TVA.initFeatures);
  safe('terminal', TVA.initTerminal);

  var fontsReady = false, loaded = false;
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { fontsReady = true; });
  if (document.readyState === 'complete') loaded = true; else addEventListener('load', function () { loaded = true; });
  setTimeout(function () { fontsReady = true; loaded = true; }, 4500); // nunca prender o visitante

  var minTime = TVA.reduced ? 300 : 1900, t0 = performance.now();
  var timer = setInterval(function () {
    var el = performance.now() - t0;
    var cap = (fontsReady && loaded) ? 100 : 86;
    pct = Math.min(cap, pct + (cap - pct) * 0.12 + 0.6);
    fill.style.width = pct + '%';
    var want = Math.min(steps.length - 1, Math.floor(pct / 100 * steps.length));
    if (want !== si) { si = want; status.textContent = steps[si]; }
    if (pct >= 99.5 && el > minTime) { clearInterval(timer); finish(); }
  }, 60);

  function finish() {
    $('#preloader').classList.add('done');
    document.body.classList.remove('is-loading');
    document.body.classList.add('ready');
    document.documentElement.classList.add('smooth');
    TVA.ready = true;
    TVA.emit('ready');
    $('#hero').querySelectorAll('.reveal').forEach(function (el, i) { setTimeout(function () { el.classList.add('in'); }, 500 + i * 120); });
    setTimeout(function () {
      var c = TVA.case;
      if (c.visits > 1) TVA.mm.say('Bem-vindo de volta! Visita nº ' + c.visits + '. Senti sua falta. Mentira: eu estava te observando.', { expr: 'wink', wave: true });
      else TVA.mm.say('Oi, oi! Bem-vindo à TVA! Seu processo é o ' + c.id + '. Guarde bem. Eu guardo melhor.', { expr: 'happy', wave: true });
    }, 1700);
  }
})();
