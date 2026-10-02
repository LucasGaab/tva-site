# CONCEITO — "Para todo o sempre, em triplicata."

## Conceito central: **o visitante é o processo**

O site não *fala sobre* a TVA. Ele **é** o portal de atendimento da TVA, e quem entra já é um caso em andamento.
No primeiro segundo o visitante recebe um **número de processo**. Cada gesto de livre-arbítrio
(clicar com o botão direito, copiar texto, sair da aba, discordar dos termos, cutucar a Miss Minutes) vira um **desvio registrado**.
A página inteira é uma linha do tempo: o scroll atravessa uma Time Door, percorre a Linha do Tempo Sagrada
por eras e termina no fim dos tempos, onde as linhas viram árvore.

A estética segue a **dissonância** que a pesquisa revelou: monumentalidade brutalista fria (tipografia gigante, grid rígido,
concreto, escala opressora) revestida de **calor mid-century** (papel creme, mostarda, couro, laranja de Time Door).
Acolhedor demais para ser tão ameaçador. Igual à Miss Minutes.

### Direções consideradas
| Direção | Ideia | Por que não / por que sim |
|---|---|---|
| A. "Museu TVA" | Tour institucional por salas 3D | Bonito, mas passivo. O visitante só assiste. |
| B. "Terminal CRT total" | Site inteiro como sistema operacional retrô | Forte, mas monocórdio e cansativo; perde o calor do papel. |
| **C. "Você é o processo"** ✅ | Site institucional + o visitante como caso vivo, com consequências | **Escolhida.** Une storytelling (scroll = tempo), interatividade com significado (cada ação gera desvio) e o humor burocrático da série. Integra todas as features num único fio narrativo em vez de uma lista de widgets. |

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `--paper` | `#EFE5CF` | fundo claro (papel de formulário) |
| `--paper-2` | `#E4D6B8` | cartões, fichas |
| `--ink` | `#2A1D14` | texto principal (tinta marrom) |
| `--bureau` | `#3B2A1E` | madeira / couro |
| `--night` | `#120C08` | fundo escuro (turno da noite) |
| `--night-2` | `#1E150F` | superfícies escuras |
| `--door` | `#FF7A1A` | laranja Time Door (assinatura) |
| `--amber` | `#FFB000` | fósforo CRT |
| `--mustard` | `#D9A441` | acento mid-century |
| `--rust` | `#A6371F` | carimbo NEGADO, ameaça |
| `--teal` | `#2F6F6A` | acento raro (carpete) |
| `--approved` | `#3F6B35` | carimbo APROVADO |
| `--sacred` | `#F2B84B` | Linha Sagrada |
| `--branch` | `#FF4D2E` | ramificações |

## Tipografia
- **Archivo** (variável, eixo de largura 62–125): display monumental. Expandida para "super graphics", condensada para etiquetas.
- **Instrument Serif** itálico: a voz institucional "elegante" (citações, subtítulos).
- **Courier Prime**: papelada, formulários, fichas datilografadas.
- **VT323**: telas CRT, terminal, contadores.

## Sistema de animação
- **Um relógio só:** um `requestAnimationFrame` central alimenta three.js, a Miss Minutes e os canvases. Tudo pausa fora da tela ou com a aba oculta.
- **Curvas:** `cubic-bezier(.2,.8,.2,1)` (burocracia que desliza), `steps()` para CRT, "overshoot" para carimbos (impacto + tremor).
- **Scroll → tempo:** progresso normalizado por seção dirige a câmera 3D, o HUD de ano (contador embaralhado) e as transições de era (faixas de "salto temporal").
- **Mouse:** parallax da câmera, linhas do tempo que se curvam em direção ao cursor, olhos da Miss Minutes.
- **prefers-reduced-motion:** câmera faz cortes em vez de voos, sem partículas em deriva, sem glitch, sem tremor; tudo continua funcional.

## Seções
0. **Pré-carregamento**: "Sincronizando com a Linha do Tempo Sagrada" + atribuição do nº de processo.
1. **Hero**: Time Door 3D em hall brutalista, título monumental.
2. **Orientação**: Miss Minutes apresenta a TVA; "Nossa história (versão oficial)" com tarjas de censura que revelam a verdade.
3. **A Linha do Tempo Sagrada** (seção cinematográfica fixa, 6 eras): a câmera atravessa a porta e viaja pela linha até o Tear e a Árvore.
4. **Consulta de Variante**: ficha com nível de ameaça, crime, gráfico de ramificação e sentença.
5. **Mapa das Linhas**: canvas vivo; ramificações nascem, você poda; carga do Tear.
6. **Formulário de Poda**: carimbo APROVADO/NEGADO + protocolo.
7. **Evento Nexus**: contagem até Vingadores: Doomsday (18/12/2026), com glitch no zero.
8. **Departamentos**: Análise (Mobius/jet ski), Recursos & Avanços (O.B./TemPad), Caçadores (B-15), Juízes (Renslayer), Guardiões.
9. **Rodapé**: Termos de Uso sobre livre-arbítrio (o "não aceito" não funciona).
- **Transversais:** dock da Miss Minutes com chat, dossiê do visitante, terminal CRT escondido, cursor relógio, sons sintetizados (desligados por padrão), tema claro "Papelada" / escuro "Turno da Noite".

## As 3 ideias ousadas (executadas)
1. **Dossiê vivo.** Nº de processo persistente; um medidor de **Desvio** no topo enche a cada ato de livre-arbítrio; um dossiê lateral lista as infrações com data e hora; a sentença final do rodapé depende do seu comportamento.
2. **A própria página sofre um Evento Nexus.** Quando o medidor estoura, o layout racha (RGB split, fatias deslocadas), uma ramificação vermelha nasce na linha 3D e os Minutemen **podam a página**: uma varredura laranja reinicia tudo e a Miss Minutes finge que nada aconteceu.
3. **Miss Minutes como sistema operacional.** Ela não é um widget de chat: comenta o scroll rápido, a ociosidade, a saída da aba, o texto copiado, as ações nos formulários; e o chat **controla a página** ("me leva pro formulário", "modo escuro", "me poda", "abre o terminal").

## Tecnologia
Projeto estático, sem build (abre direto do disco ou por qualquer servidor). Única biblioteca: **three.js r128** via cdnjs (versão fixa, build UMD).
Fontes via Google Fonts com fallbacks de sistema. Zero imagens: tudo em SVG, CSS, Canvas 2D e WebGL. Sons via WebAudio sintetizado.
