/* =========================================================
   TVA · Atendimento Miss Minutes: motor de respostas local
   (sem backend: dezenas de falas, ações na página, easter eggs)
   ========================================================= */
(function () {
  'use strict';
  var TVA = window.TVA, $ = TVA.$;

  function norm(s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim(); }
  function go(id) {
    var el = document.getElementById(id); if (!el) return;
    el.scrollIntoView({ behavior: TVA.reduced ? 'auto' : 'smooth', block: 'start' });
  }
  function doomsdayLeft() {
    var t = Math.max(0, new Date(2026, 11, 18, 0, 0, 0).getTime() - Date.now());
    return { d: Math.floor(t / 86400000), h: Math.floor(t / 3600000) % 24, ms: t };
  }
  function name() { return TVA.case.name ? TVA.case.name : 'docinho'; }

  var JOKES = [
    'Quantos agentes da TVA são necessários pra trocar uma lâmpada? Nenhum. A lâmpada queimada já estava no roteiro.',
    'Por que a variante levou um relógio pro tribunal? Pra ter algum tempo a seu favor. Não funcionou.',
    'Um Minuteman entra num bar. Ou entrou. Ou vai entrar. Depende da linha.',
    'Qual é o lanche preferido do Vazio? Variante à milanesa. Desculpa. Alioth me contou essa.',
    'O que o Loki disse pro espelho? "Variante!" O espelho disse: "Não, VOCÊ é a variante." Ficaram lá uns três séculos.'
  ];

  /* Intenções: [regex, respostas[], expressão, ação?] */
  var INTENTS = [
    [/\b(me poda|pode me podar|quero ser podad|me prune|prune me)/, ['Com prazer! Quer dizer... que pena! Iniciando protocolo.'], 'menace', function () { setTimeout(TVA.pageNexus, 900); }],
    [/\b(meu nome e|me chamo|pode me chamar de)\s+([a-z0-9\-]{2,20})/, null, 'happy', function (m, raw) {
      var n = raw.match(/(?:meu nome [eé]|me chamo|pode me chamar de)\s+([^\s,.!?]{2,20})/i);
      n = n ? n[1] : m[2]; n = n.charAt(0).toUpperCase() + n.slice(1);
      TVA.case.name = n; TVA.store.set('name', n);
      return 'Prazer, ' + n + '! Seu nome já estava aqui, claro. Só queria ver se você sabia.';
    }],
    [/\b(modo escuro|tema escuro|apaga a luz|turno da noite|dark)/, ['Luzes apagadas. Agora só os carimbos brilham.'], 'wink', function () { TVA.setTheme('dark', true); }],
    [/\b(modo claro|tema claro|acende a luz|light|papelada)/, ['Luzes acesas! Ótimo pra ler letras miúdas. Temos muitas.'], 'happy', function () { TVA.setTheme('light', true); }],
    [/\b(liga|ligar|ativa|ativar)( o)? (som|audio)/, ['Som ligado! Cada carimbo agora vai fazer TUM. Que delícia.'], 'happy', function () { TVA.setSound(true); }],
    [/\b(desliga|desligar|silencio|mute|muta)/, ['Silêncio absoluto. Igual ao Vazio, só que com estofado.'], 'wink', function () { TVA.setSound(false); }],
    [/\b(terminal|console|linha de comando|hack)/, ['Shhh. Abrindo o terminal. Você não viu isso. Digite AJUDA lá dentro.'], 'wink', function () { setTimeout(function () { TVA.terminal && TVA.terminal.open(); }, 700); }],
    [/\b(dossie|meu processo|meu caso|minha situacao|minhas infrac)/, null, 'wink', function () {
      setTimeout(TVA.openDossier, 600);
      return 'Processo ' + TVA.case.id + '. Desvio atual: ' + Math.round(TVA.case.dev) + '%. Sentença provisória: ' + TVA.verdictText();
    }],
    [/\b(consulta|consultar|pesquisa|procura|busca|ficha d[eoa]?)\s+(?:a ficha d[eoa] |o |a )?([a-z0-9 \-]{2,30})$/, null, 'happy', function (m) {
      var n = m[2].replace(/^(ficha d[eoa] )/, '').trim();
      if (/^(variante|ficha|consulta)$/.test(n)) return null;
      setTimeout(function () { TVA.features && TVA.features.lookup(n); }, 500);
      return 'Abrindo a ficha de "' + n + '" no Arquivo Central. Prepare-se pra julgar.';
    }],
    [/\b(leva|levar|ir|vai|mostra|abre|abrir|quero ver).*(formulario|poda|requisicao)/, ['Formulário TVA-PD-7B saindo! Caneta preta, letra de forma.'], 'happy', function () { go('poda'); }],
    [/\b(leva|levar|ir|vai|mostra|abre|abrir|quero ver).*(consulta|ficha|arquivo)/, ['Arquivo Central, aqui vamos nós!'], 'happy', function () { go('consulta'); }],
    [/\b(leva|levar|ir|vai|mostra|abre|abrir|quero ver).*(mapa|monitor|ramifica)/, ['Sala de monitoramento! Não bata na tela.'], 'happy', function () { go('mapa'); }],
    [/\b(leva|levar|ir|vai|mostra|abre|abrir|quero ver).*(nexus|contador|contagem)/, ['Lá vamos nós pro alerta Ômega. Respira fundo.'], 'menace', function () { go('nexus'); }],
    [/\b(leva|levar|ir|vai|mostra|abre|abrir|quero ver).*(departamento|servidores|equipe|colegas)/, ['Conheça a família TVA! Somos uma família. Ninguém pode sair.'], 'happy', function () { go('departamentos'); }],
    [/\b(leva|levar|ir|vai|mostra|abre|abrir|quero ver).*(linha|timeline|historia)/, ['Segura firme, vamos atravessar a porta!'], 'happy', function () { go('linha'); }],
    [/\b(leva|levar|ir|vai|mostra|abre|abrir|quero ver).*(termo|rodape|contrato)/, ['Os Termos de Uso! Ninguém lê. Por isso são tão bons.'], 'wink', function () { go('footer'); }],
    [/\b(leva|levar|volta|voltar).*(inicio|comeco|topo)/, ['De volta ao começo. Déjà vu é normal aqui.'], 'happy', function () { go('hero'); }],
    [/\b(doomsday|vingadores|avengers|estreia|cinema)/, null, 'menace', function () {
      var l = doomsdayLeft();
      return l.ms > 0 ? 'Faltam ' + l.d + ' dias e ' + l.h + ' horas para 18 de dezembro de 2026. Evento Nexus de grau Ômega. Já reservei a poltrona do meio. Pra vigiar todo mundo.' : 'Já começou. Não olhe pra trás. Nem pros lados. Olhe pra tela.';
    }],
    [/\b(jet ?ski)/, ['Vruuum! Pronto, realizei o sonho do Mobius lá nos Departamentos. Não diga que eu nunca fiz nada por ninguém.'], 'happy', function () { TVA.features && TVA.features.jetski(true); }],
    [/\b(proposito glorioso|glorious purpose)/, ['Propósito glorioso! Alguém andou assistindo... digo, lendo relatórios confidenciais.'], 'wink'],
    [/\b(aquele que permanece|he who remains|kang|seu chefe|o chefe|quem manda)/, ['Não sei de quem você está falando. E se soubesse, não diria. E se dissesse, você não lembraria.', 'Ele é... um homem muito ocupado. No fim dos tempos. Tem agenda lotada até o fim dos tempos. Literalmente.'], 'menace'],
    [/\b(guardioes|time.?keepers|fundadores)/, ['Os Guardiões do Tempo são seres sábios, eternos e feitos de carne e osso. Muito osso. Pouquíssimos parafusos. Próxima pergunta!', 'Os Guardiões não recebem visitas. Nem cartas. Nem manutenção. Quer dizer, não PRECISAM de manutenção.'], 'wink'],
    [/\bsylvie\b/, ['Não falamos esse nome em horário de expediente.', 'Quem? Nunca ouvi falar. Arquivo vazio. Pode parar de digitar.'], 'menace'],
    [/\bloki\b/, ['Ah, esse aí. Deus da Trapaça, ego do tamanho de Asgard. Já processei dezenas de versões. Uma era um crocodilo. Era a mais educada.', 'Loki? Qual deles? Temos o clássico, o presidente, o criança, o boomer e o jacaré. Especifique, por favor.'], 'wink'],
    [/\bmobius\b/, ['Mobius! Analista sênior, fã de salada de frutas, colecionador de revistas de jet ski. Nunca pilotou um. Não conta pra ele que eu te contei.'], 'happy'],
    [/\b(b.?15|cacadora|cacador|hunter)/, ['B-15 é a melhor Caçadora da força. Disciplinada, leal, sem memória nenhuma. Do jeito que a gente gosta.', 'B-15? Ultimamente anda meio pensativa. Não gosto de pensativa.'], 'menace'],
    [/\b(renslayer|ravonna|juiza)/, ['A Juíza Renslayer está de licença. Licença longa. Bem longa. Não pergunte de novo.'], 'menace'],
    [/\b(o\.?b\.?|ouroboros|manual)\b/, ['O.B. escreveu o manual de tudo. Ou o manual escreveu O.B.? Paradoxo ontológico. Me dá dor de engrenagem.'], 'oops'],
    [/\b(tempad)/, ['O TemPad abre portas temporais para qualquer lugar e momento. Tem um pra testar em Recursos & Avanços. Não aperte nada estranho. Aperte tudo.'], 'wink'],
    [/\b(porta|portas|time door|portal)\b/, ['As Portas do Tempo levam a qualquer lugar. Menos pra fora daqui, claro.'], 'wink'],
    [/\b(linha (do tempo )?sagrada|sacred timeline)/, ['A Linha do Tempo Sagrada é a única realidade aprovada. Todo o resto é rascunho. E rascunho a gente amassa.'], 'happy'],
    [/\b(nexus)/, ['Um Evento Nexus é quando alguém faz algo fora do roteiro e a linha ramifica. Tipo agora. Brincadeira! Ou não. Olha seu medidor de desvio aí em cima.'], 'menace'],
    [/\b(variante|variant)/, ['Variante é quem sai do roteiro. Você, por exemplo, está lendo um site que não devia existir. Variante clássica.'], 'wink'],
    [/\b(poda|podar|podado|prune)/, ['A poda manda a variante pro Vazio. É rápida, eficiente e emocionalmente indolor. Pra nós.', 'Quer requisitar uma poda? Tem um formulário lindo pra isso. Quer que eu te leve lá?'], 'menace'],
    [/\b(livre.?arbitrio|escolha|destino|free will)/, ['Livre-arbítrio é uma ilusão muito bem decorada. A gente mantém por questões estéticas.', 'Você pode escolher qualquer coisa! Desde que seja o que estava escrito.'], 'wink'],
    [/\b(vazio|void|alioth)/, ['O Vazio fica no fim de todas as coisas. Tem uma nuvem muito faminta chamada Alioth. Não leve comida. Não seja comida.'], 'menace'],
    [/\b(tear|loom|arvore|yggdrasil)/, ['O Tear Temporal transforma tempo bruto em linha do tempo. Às vezes ele sobrecarrega. Às vezes alguém vira árvore. Coisas de escritório.'], 'oops'],
    [/\b(lamentis)/, ['Lamentis-1, 2077. Lua condenada, trem lotado, nenhum carregador de TemPad. Péssimo destino de férias.'], 'oops'],
    [/\b(joia|joias|infinity|infinito)/, ['Joias do Infinito? Temos uma gaveta cheia. Usamos como peso de papel. Muito úteis em dia de vento. Não venta aqui.'], 'wink'],
    [/\b(quem e voce|quem e vc|o que voce e|voce e uma ia|robo|bot)\b/, ['Sou a Miss Minutes! Mascote, guia, assistente, sistema operacional e, nas horas vagas, sua consciência.', 'Eu? Só um relógio amigável com acesso total a todos os sistemas. Nada pra se preocupar.'], 'happy'],
    [/\b(o que e (a )?tva|tva e o que|autoridade|o que voces fazem)/, ['A Autoridade de Variância Temporal protege a Linha do Tempo Sagrada. A gente garante que tudo aconteça como deve. E carimba.'], 'happy'],
    [/\b(voce e ma|vila|malvada|do mal|confiar em voce)/, ['Eu? Sou só um relógio fofinho. Com sinos. E acesso a cada porta deste prédio. Que mal poderia haver?'], 'menace'],
    [/\b(quantos anos|idade)/, ['Uma dama nunca revela a idade. Mas são uns bilhões. De ciclos de relógio.'], 'wink'],
    [/\b(que horas|horario|que dia|data de hoje)/, null, 'happy', function () { return 'São ' + TVA.timeStr() + '. Na Linha Sagrada, pelo menos. Nas outras, nem pergunte.'; }],
    [/\b(piada|me faz rir|conta uma|algo engracado)/, null, 'wink', function () { return TVA.pick(JOKES); }],
    [/\b(canta|cantar|musica)/, ['Tic, tac, tic, tac, quem sair do roteiro... vai pro Vazio sem lanche! Não rimou. Vai assim mesmo.'], 'happy'],
    [/\b(te amo|linda|fofa|fofinha|gosto de voce|adoro voce)/, ['Ownnn! Isso não muda sua sentença, mas anotei com coraçãozinho.', 'Para! Meus sininhos ficam vermelhos. Literalmente, olha.'], 'happy'],
    [/\b(burra|chata|idiota|odeio|feia|lixo|inutil|estupida)/, ['Que palavras feias. Seria uma pena se seu processo... se perdesse. No Vazio. Com Alioth.'], 'menace', function () { TVA.deviate(8, 'Desacatou a assistente oficial'); }],
    [/\b(fugir|escapar|sair daqui|como saio|ir embora)/, ['Sair? Haha! Que imaginação fértil. Adoro.', 'A saída fica logo depois da entrada. Que fica logo depois da saída.'], 'menace'],
    [/\b(cafe|lanche|comida|fome|almoco)/, ['A cantina fica no fim do corredor 7. O corredor 7 não tem fim. Bom apetite!'], 'wink'],
    [/\b(clima|chuva|calor|frio|tempo la fora)/, ['Aqui não tem clima. Nem lá fora. Nem "lá". Nem "fora".'], 'happy'],
    [/\b(segredo|verdade|conspiracao)/, ['O segredo é que não há segredo. O outro segredo é que há. Os dois são confidenciais.'], 'menace'],
    [/\b(sentido da vida|42)\b/, ['O sentido da vida está descrito na página 3 do Manual. A página 3 foi podada.'], 'oops'],
    [/\b(miss minutes|minutinhos)/, ['Presente! Sempre presente. Em todas as telas. Ao mesmo tempo. Oi!'], 'happy'],
    [/(para todo o sempre|^sempre\b)/, ['...em triplicata! Ai, adoro quando alguém sabe o lema.'], 'happy'],
    [/\b(ajuda|help|o que voce faz|comandos|o que posso|opcoes)/, ['Posso: te levar a qualquer seção ("me leva pro mapa"), consultar fichas ("consulta Mobius"), trocar o tema ("modo escuro"), ligar o som, abrir seu dossiê, abrir o terminal, contar quanto falta pro Doomsday, contar piadas... ou te podar. Escolha com carinho.'], 'happy'],
    [/\b(obrigad|valeu|vlw|brigad)/, ['De nada! Agradecimento registrado no seu dossiê. Conta pontos. Não muitos.', 'Imagina! É pra isso que eu existo. Literalmente. Fui programada pra isso.'], 'happy'],
    [/\b(tchau|adeus|ate mais|flw|falou)/, ['Tchau! Mas a gente se vê. A gente sempre se vê.'], 'wink'],
    [/^(oi+|ola|hey|e ai|eai|bom dia|boa tarde|boa noite|salve|hello|hi)\b/, null, 'happy', function () {
      return TVA.pick(['Oi, oi, ' + name() + '! Como posso tornar sua existência mais organizada hoje?', 'Olá, variante! Quer dizer, visitante. Quer dizer... variante.', 'Oi! Que bom te ver. Eu sempre te vejo, mas é bom ver você me vendo.']);
    }]
  ];
  var FALLBACK = [
    'Hmm, essa pergunta não consta no formulário. Pode reformular em três vias?',
    'Não entendi, mas registrei. Eu registro tudo.',
    'Interessante! Vou encaminhar ao departamento responsável. Previsão de resposta: fim dos tempos.',
    'Docinho, eu sou uma IA de orientação, não uma vidente. Pergunta sobre a TVA, a Linha Sagrada, ou pede pra eu te levar a algum lugar!',
    'Isso soa como livre-arbítrio. Vou fingir que não li.'
  ];
  var CHIPS = ['O que é a TVA?', 'Quanto falta pro Doomsday?', 'Me leva pro formulário', 'Conta uma piada', 'Quem é você?', 'Abre o terminal', 'Pode me podar'];

  var Chat = TVA.chat = {};
  var panel, log, input, history = [], busyUntil = 0;

  function addMsg(text, who, expr) {
    var d = document.createElement('div');
    d.className = 'msg ' + who + (expr === 'menace' ? ' menace' : '');
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
    return d;
  }
  Chat.push = function (text, expr) { if (log) addMsg(text, 'mm', expr); };

  function respond(raw) {
    var q = norm(raw);
    history.push(q);
    var reps = history.slice(-3);
    if (reps.length === 3 && reps[0] === reps[1] && reps[1] === reps[2]) {
      TVA.deviate(5, 'Repetiu a mesma pergunta 3 vezes');
      return { text: 'Você está repetindo a mesma frase. Isso é um loop temporal ou só teimosia? Os dois são infrações.', expr: 'menace' };
    }
    for (var i = 0; i < INTENTS.length; i++) {
      var it = INTENTS[i], m = q.match(it[0]);
      if (!m) continue;
      var text = null;
      if (it[3]) { var r = it[3](m, raw); if (typeof r === 'string') text = r; else if (r === null && !it[1]) continue; }
      if (!text && it[1]) text = TVA.pick(it[1]);
      if (!text) continue;
      return { text: text, expr: it[2] };
    }
    return { text: TVA.pick(FALLBACK), expr: TVA.pick(['oops', 'wink', 'happy']) };
  }

  Chat.send = function (raw) {
    raw = String(raw || '').trim(); if (!raw) return;
    addMsg(raw, 'me');
    TVA.sfx('click');
    var typing = addMsg('', 'mm typing'); typing.innerHTML = '<i></i><i></i><i></i>';
    var rig = TVA.mm.dockRig(); if (rig) rig.expr('happy');
    var res = respond(raw);
    // respostas saem na ordem das perguntas, uma de cada vez
    var delay = TVA.reduced ? 150 : 450 + Math.min(1100, res.text.length * 9);
    var at = Math.max(Date.now() + delay, busyUntil + 350);
    busyUntil = at;
    setTimeout(function () {
      typing.remove();
      addMsg(res.text, 'mm', res.expr);
      if (rig) { rig.expr(res.expr); rig.talk(Math.min(2600, res.text.length * 34)); if (res.expr === 'oops') rig.jump(); }
      TVA.sfx(res.expr === 'menace' ? 'error' : 'blip');
    }, at - Date.now());
  };

  Chat.open = function () {
    panel.hidden = false; TVA.chatOpen = true;
    $('#mm-dock').classList.add('chatting'); $('#mm-dock').classList.remove('away');
    $('#mm-dock-btn').setAttribute('aria-expanded', 'true');
    if (!log.children.length) {
      addMsg('Atendimento aberto · protocolo ' + TVA.case.id, 'sys');
      var hi = TVA.case.visits > 1
        ? 'Bem-vindo de volta, ' + name() + '! Essa é sua visita nº ' + TVA.case.visits + '. Eu contei. Eu conto tudo. Em que posso ajudar?'
        : 'Oi, oi! Aqui é a Miss Minutes. Pergunte qualquer coisa sobre a TVA, ou peça pra eu te levar a algum lugar. Só não peça pra sair.';
      addMsg(hi, 'mm');
    }
    TVA.sfx('whoosh');
    setTimeout(function () { input.focus({ preventScroll: true }); }, 60);
  };
  Chat.close = function () {
    panel.hidden = true; TVA.chatOpen = false;
    $('#mm-dock').classList.remove('chatting');
    $('#mm-dock-btn').setAttribute('aria-expanded', 'false');
  };

  TVA.initChat = function () {
    panel = $('#chat'); log = $('#chat-log'); input = $('#chat-input');
    var chips = $('#chat-chips');
    CHIPS.forEach(function (c) {
      var b = document.createElement('button'); b.className = 'chip'; b.type = 'button'; b.textContent = c;
      b.addEventListener('click', function () { Chat.send(c); });
      chips.appendChild(b);
    });
    $('#chat-form').addEventListener('submit', function (e) { e.preventDefault(); Chat.send(input.value); input.value = ''; });
    $('#chat-close').addEventListener('click', Chat.close);
    var pokes = 0, pokeT;
    $('#mm-dock-btn').addEventListener('click', function () {
      var rig = TVA.mm.dockRig();
      if (panel.hidden) { Chat.open(); rig && rig.wave(); return; }
      // já aberto: cutucar
      rig && rig.poke();
      pokes++; clearTimeout(pokeT); pokeT = setTimeout(function () { pokes = 0; }, 4000);
      if (pokes === 3) addMsg('Ai! Pare de me cutucar.', 'mm', 'oops');
      if (pokes === 6) { addMsg('Cutuca mais uma vez, docinho. Eu te desafio.', 'mm', 'menace'); rig && rig.expr('menace'); TVA.deviate(6, 'Cutucou a Miss Minutes repetidamente'); }
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) Chat.close(); });
  };
})();
