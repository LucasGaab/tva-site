/* =========================================================
   TVA · terminal CRT escondido
   Abre com a tecla ` (crase) ou ~, pelo parafuso do rodapé,
   ou pedindo à Miss Minutes.
   ========================================================= */
(function () {
  'use strict';
  var TVA = window.TVA, $ = TVA.$;
  var T = TVA.terminal = {};
  var root, out, input, hist = [], hi = 0, booted = false;

  function esc(s) { return TVA.escape(s); }
  function print(html, cls) {
    var d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d); out.scrollTop = out.scrollHeight;
    TVA.sfx('type');
  }
  function slow(lines, done) {
    var i = 0;
    (function next() {
      if (i >= lines.length) { if (done) done(); return; }
      var l = lines[i++]; print(l[0], l[1]);
      setTimeout(next, TVA.reduced ? 0 : (l[2] || 70));
    })();
  }

  var FILES = {
    'manual_vol1.txt': 'MANUAL DO SERVIDOR · VOL. 1 DE 1.000\n§1. Tudo o que acontece já aconteceu.\n§2. Se não aconteceu, preencha o formulário TVA-PD-7B.\n§3. Não discuta com o §1.\n§4. Autor: O.B. (ou Victor Timely) (ou O.B.)',
    'linha_sagrada.log': '[∞] status: ESTÁVEL\n[∞] ramificações podadas hoje: 1.204.556\n[∞] ramificações não podadas: <span class="err">1</span> (você)\n[∞] carga do Tear: 97,3%',
    'variantes.db': 'registros: 8.946.112.004\nconsulta mais frequente: "loki"\nsegunda mais frequente: "loki de novo"',
    'cardapio_cantina.txt': 'SEGUNDA: sopa de ontem\nTERÇA: sopa de amanhã\nQUARTA: sopa de uma linha paralela\nQUINTA–DOMINGO: não existem neste calendário',
    'guardioes.cfg': null,
    'renslayer.pdf': 'ERRO: arquivo corrompido. Ou podado. Ou ambos.'
  };

  var CMDS = {
    ajuda: function () {
      print([
        '<span class="hot">COMANDOS DISPONÍVEIS</span>',
        '  ajuda            esta lista',
        '  status           estado da Linha do Tempo Sagrada',
        '  quemsou          seu processo',
        '  ls / cat <arq>   arquivos da sua mesa',
        '  podar <nome>     requisição sumária de poda',
        '  consultar <nome> abre a ficha de uma variante',
        '  nexus            simula o contador chegando a zero',
        '  tempad <ano>     viagem (simulada) no tempo',
        '  tear             diagnóstico do Tear Temporal',
        '  guardioes        falar com os Guardiões do Tempo',
        '  jetski           ???',
        '  tema <claro|escuro>   som <on|off>',
        '  dossie   data   limpar   sair',
        '<span class="dim">Há comandos não listados. Há sempre comandos não listados.</span>'
      ].join('\n'));
    },
    status: function () {
      var c = TVA.case;
      print('LINHA DO TEMPO SAGRADA ........ <span class="hot">ESTÁVEL*</span>\nRAMIFICAÇÕES ATIVAS ........... 0 (oficialmente)\nDESVIO DO VISITANTE ........... ' + Math.round(c.dev) + '%\nEVENTOS NEXUS CAUSADOS ........ ' + c.nexus + '\n<span class="dim">* a definição de "estável" foi atualizada 4.817 vezes</span>');
    },
    quemsou: function () {
      var c = TVA.case;
      print('PROCESSO .......... <span class="hot">' + c.id + '</span>\nNOME .............. ' + esc(c.name || 'não informado (suspeito)') + '\nVISITAS ........... ' + c.visits + '\nSENTENÇA .......... ' + esc(TVA.verdictText()));
    },
    ls: function () { print(Object.keys(FILES).join('    ')); },
    cat: function (a) {
      var f = a[0];
      if (!f) return print('uso: cat &lt;arquivo&gt;', 'err');
      if (!(f in FILES)) return print('cat: ' + esc(f) + ': arquivo não existe nesta linha do tempo', 'err');
      if (FILES[f] === null) { TVA.deviate(6, 'Tentou ler configuração dos Guardiões'); return print('ACESSO NEGADO. Seu nível: VISITANTE. Nível exigido: ALGUÉM QUE NÃO EXISTE.', 'err'); }
      print(FILES[f]);
    },
    podar: function (a) {
      var n = a.join(' ');
      if (!n) return print('uso: podar &lt;nome&gt;', 'err');
      if (/miss|minutes/i.test(n)) { TVA.deviate(10, 'Tentou podar a Miss Minutes via terminal'); TVA.mm.say('Pelo terminal? Sério? Que covardia.', { expr: 'menace' }); return print('ERRO: alvo protegido. Remetente sinalizado.', 'err'); }
      slow([['Localizando "' + esc(n) + '"...', 'dim', 300], ['Abrindo Time Door...', 'dim', 400], ['Minutemen despachados...', 'dim', 400], ['<span class="hot">PODADO.</span> ' + esc(n) + ' foi enviado ao Vazio. Alioth agradece.', null]]);
      TVA.sfx('prune');
    },
    consultar: function (a) {
      var n = a.join(' '); if (!n) return print('uso: consultar &lt;nome&gt;', 'err');
      print('Abrindo ficha de ' + esc(n) + ' no Arquivo Central...');
      setTimeout(function () { T.close(); TVA.features.lookup(n); document.getElementById('consulta').scrollIntoView({ behavior: TVA.reduced ? 'auto' : 'smooth' }); }, 600);
    },
    nexus: function () {
      print('<span class="err">SIMULANDO CONTAGEM ZERO...</span>');
      setTimeout(function () { T.close(); TVA.features.simulateZero(8000); }, 600);
    },
    tempad: function (a) {
      var y = parseInt(a[0], 10);
      if (isNaN(y)) return print('uso: tempad &lt;ano&gt;', 'err');
      slow([['Calibrando TemPad para ' + y + '...', 'dim', 300], ['Bateria: 3% (Lamentis feelings)', 'dim', 300], ['Porta aberta. Porta fechada. Você não foi. Viagens via terminal são simbólicas.', null]]);
      TVA.sfx('door');
    },
    tear: function () {
      slow([['DIAGNÓSTICO DO TEAR TEMPORAL', 'hot'], ['  throughput ......... 97,3%', null, 120], ['  multiplicador ...... instalado (fita adesiva)', null, 120], ['  risco de árvore .... <span class="err">ALTO</span>', null, 120], ['  recomendação ....... não olhe diretamente para o Tear', 'dim']]);
    },
    guardioes: function () {
      slow([['Conectando à sala dos Guardiões...', 'dim', 500], ['...', 'dim', 600], ['RESPOSTA: "bip."', null, 500], ['<span class="dim">Isso foi uma voz orgânica e sábia. Definitivamente não um bip.</span>']]);
    },
    jetski: function () { print('Iniciando sonho do servidor A-01...'); setTimeout(function () { T.close(); TVA.features.jetski(); }, 500); },
    tema: function (a) {
      var t = a[0] === 'claro' ? 'light' : a[0] === 'escuro' ? 'dark' : (TVA.theme === 'dark' ? 'light' : 'dark');
      TVA.setTheme(t); print('Tema: ' + (t === 'dark' ? 'Turno da Noite' : 'Papelada'));
    },
    som: function (a) { var on = a[0] ? /on|liga|sim/.test(a[0]) : !TVA.sound.on; TVA.setSound(on); print('Som: ' + (on ? 'LIGADO' : 'DESLIGADO')); },
    dossie: function () { T.close(); TVA.openDossier(); },
    data: function () { print(new Date().toLocaleString('pt-BR') + ' · Linha Sagrada, fuso eterno'); },
    limpar: function () { out.innerHTML = ''; },
    sair: function () { T.close(); },
    historico: function () { print(hist.map(function (h, i) { return (i + 1) + '  ' + esc(h); }).join('\n') || '(vazio)'); },
    sudo: function () { TVA.deviate(8, 'Tentou usar sudo na TVA'); print('sudo: você não está no arquivo sudoers. Este incidente será reportado.\n<span class="dim">(Foi reportado. Para a Miss Minutes. Ela está rindo.)</span>', 'err'); },
    'livre-arbitrio': function () { print('livre-arbitrio: comando não encontrado', 'err'); },
    'aquele-que-permanece': function () {
      TVA.deviate(15, 'Invocou Aquele Que Permanece no terminal');
      slow([['...', 'dim', 700], ['Você não deveria saber esse comando.', 'err', 700], ['Mas já que sabe: tudo isto existe porque alguém escolheu. Inclusive você.', null, 900], ['Esta mensagem será esquecida.', 'dim']]);
    },
    'proposito-glorioso': function () { print('Propósito glorioso confirmado. Árvore em crescimento. 🌳\n<span class="dim">(o terminal não deveria suportar emoji. ele suporta agora.)</span>'); },
    eco: function (a) { print(esc(a.join(' '))); }
  };
  var ALIAS = { help: 'ajuda', '?': 'ajuda', whoami: 'quemsou', 'quem': 'quemsou', prune: 'podar', clear: 'limpar', cls: 'limpar', exit: 'sair', quit: 'sair', theme: 'tema', sound: 'som', date: 'data', history: 'historico', loom: 'tear', keepers: 'guardioes', guardiões: 'guardioes', dossiê: 'dossie', lookup: 'consultar', echo: 'eco', 'free-will': 'livre-arbitrio', 'he-who-remains': 'aquele-que-permanece', 'glorious-purpose': 'proposito-glorioso', 'jet-ski': 'jetski' };

  function run(line) {
    line = line.trim(); if (!line) return;
    hist.push(line); hi = hist.length;
    print('<span class="dim">TVA://&gt; </span>' + esc(line));
    var low = line.toLowerCase().replace(/aquele que permanece/, 'aquele-que-permanece').replace(/prop[oó]sito glorioso/, 'proposito-glorioso').replace(/livre[ -]arb[ií]trio/, 'livre-arbitrio').replace(/he who remains/, 'he-who-remains');
    if (/^rm\s+-rf/.test(low)) { TVA.deviate(10, 'Tentou apagar o tempo (rm -rf)'); return print('Permissão negada. Apagar tudo é trabalho exclusivo do Alioth.', 'err'); }
    if (/^(oi|ola|olá)\b/.test(low)) return print('Olá. Este terminal não conversa. A Miss Minutes conversa. O terminal julga.');
    var parts = low.split(/\s+/), cmd = parts.shift();
    cmd = ALIAS[cmd] || cmd;
    var orig = line.split(/\s+/).slice(1);
    if (CMDS[cmd]) CMDS[cmd](cmd === 'tema' || cmd === 'som' ? parts : orig);
    else { print(esc(cmd) + ': comando não encontrado. Digite AJUDA.', 'err'); TVA.sfx('error'); }
  }

  T.open = function () {
    if (!root.hidden) return;
    root.hidden = false;
    TVA.sfx('glitch');
    if (!booted) {
      booted = true;
      TVA.deviate(10, 'Acessou o terminal restrito da TVA');
      slow([
        ['TVA OS · MÓDULO DE TERMINAL · REV. ∞', 'hot', 200],
        ['(c) Recursos & Avanços. Montado com fita adesiva e fé.', 'dim', 120],
        ['Verificando credenciais........ <span class="err">NENHUMA</span>', null, 300],
        ['Concedendo acesso mesmo assim.. OK (isso será anotado)', null, 200],
        ['Processo detectado: ' + TVA.case.id, null, 120],
        ['Digite <span class="hot">ajuda</span> para ver os comandos. ESC para sair.', null]
      ]);
      TVA.mm.say('Ei! Quem deixou você entrar aí? Ah, fui eu. Não toca em nada.', { expr: 'oops' });
    }
    setTimeout(function () { input.focus(); }, 50);
  };
  T.close = function () { root.hidden = true; };

  TVA.initTerminal = function () {
    root = $('#terminal'); out = $('#term-out'); input = $('#term-input');
    $('#term-form').addEventListener('submit', function (e) { e.preventDefault(); run(input.value); input.value = ''; });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); hi = Math.max(0, hi - 1); input.value = hist[hi] || ''; }
      if (e.key === 'ArrowDown') { e.preventDefault(); hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; }
      if (e.key === 'Escape') T.close();
      if (e.key === 'Tab') {
        e.preventDefault();
        var v = input.value.toLowerCase(), m = Object.keys(CMDS).filter(function (c) { return c.indexOf(v) === 0; });
        if (m.length === 1) input.value = m[0] + ' ';
        else if (m.length > 1) print(m.join('  '), 'dim');
      }
    });
    root.addEventListener('click', function (e) { if (e.target === root) T.close(); else input.focus(); });
    document.addEventListener('keydown', function (e) {
      var a = document.activeElement, typing = a && (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable);
      if (!typing && (e.key === '`' || e.key === '~' || e.code === 'Backquote')) { e.preventDefault(); root.hidden ? T.open() : T.close(); }
    });
  };
})();
