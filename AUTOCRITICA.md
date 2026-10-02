# AUTOCRÍTICA — Fase 4

Avaliei o site rodando no navegador (desktop 1280–1920px, mobile 375px, temas claro e escuro), como diretor de arte.
Abaixo estão os 7 pontos mais fracos, uma revisão dedicada de bugs visuais e o que foi corrigido.

## Os 7 pontos mais fracos (todos corrigidos)

| # | Problema | Tipo | Correção |
|---|---|---|---|
| 1 | **Hero disputado.** A Time Door ficava atrás da vírgula de "SEMPRE,". A protagonista 3D competia com o título. | composição | Câmera reenquadrada (porta no terço direito) e título limitado a 62vw. No mobile, a porta sobe para cima do título. |
| 2 | **Linha do tempo vazia.** Fios finos demais, a linha saía pela borda e boa parte da tela ficava morta. | genérico | Fios mais densos e brilhantes, falso *bloom* com névoa luminosa, câmera alinhada à curva, portais de era e **anos monumentais em 3D** (só o ano da era atual aparece). |
| 3 | **Transição de era barulhenta.** Seis faixas varriam a tela a cada troca de seção. Pareciam bug (relatado pelo usuário: "várias listras"). | quebrado | Faixas removidas. Agora é um "salto temporal" suave, só de opacidade, que dispara apenas ao entrar ou sair das cenas cinematográficas. |
| 4 | **Miss Minutes falando demais.** O balão cobria formulários e o comprovante e encavalava falas. | polimento | Limite de frequência para falas espontâneas (6–9s), balão menor, e o balão some no mobile durante a linha do tempo. |
| 5 | **HUD de era sobreposto ao conteúdo.** O contador grande no canto cobria a apresentadora, o CRT e os cards. | quebrado | HUD removido. A era virou um chip no topo, de largura estável (números tabulares). |
| 6 | **Carimbo ilegível no turno da noite.** `mix-blend: screen` apagava o NEGADO/APROVADO. | polimento | Mistura normal, cores clareadas e brilho de tinta. |
| 7 | **Card da Miss Minutes genérico e órfão.** Só texto, e sozinho numa linha com duas colunas vazias. | genérico | Virou um banner de largura total com a própria personagem animada (mãos na cintura, acena ao passar o mouse). |

## Revisão de bugs visuais (a pedido do usuário)

| Bug | Causa | Correção |
|---|---|---|
| Listras ao navegar | Transição de era com 6 faixas animadas, que podiam congelar no meio quando a aba perdia foco | Substituída por um fade radial único, com limpeza automática da classe |
| Time Door nunca abria após trocar de aba | Delta de quadro negativo (`rAF` x `performance.now()`) fazia a abertura regredir abaixo de zero | `dt` limitado a ≥ 0 e abertura com clamp |
| Botões do topo cortados em 1280–1340px | O chip de era + nav estouravam a largura | Menu hambúrguer a partir de 1340px e nome da era oculto entre 1341–1520px, com reticências |
| Página mais larga que a tela no mobile (layout de 465px num celular de 375px) | Alerta do CRT com `nowrap` e tela CRT com `min-height` forçando a largura | Quebra de linha no alerta, sem min-height no mobile, `overflow-x: clip` como rede de segurança |
| Retângulos escuros atrás do título do hero | `text-shadow` recortado pelo `overflow: hidden` das linhas animadas | Sombras removidas |
| Ficha vazia e ficha preenchida aparecendo juntas | `display: grid` vencia o atributo `hidden` | Regra global `[hidden] { display: none !important }` |
| Gráfico de ramificação saindo do canvas | Amplitude proporcional à ameaça sem limite | Amplitude limitada à altura útil |
| Anos 3D de outras eras visíveis ao mesmo tempo (1893 no card, 1985 na tela) | Todos os rótulos ficavam acesos | Visibilidade por distância da câmera |
| Cursor customizado parado no centro antes do primeiro movimento | Posição inicial fixa | Cursor só aparece após o primeiro `pointermove` |
| Jet ski "vazando" na borda do card do Mobius | Posição inicial fora do quadro | Jet ski estacionado e balançando; sai pela direita no easter egg |
| Respostas do chat fora de ordem | Atrasos independentes por mensagem | Fila sequencial de respostas |
| Faixa de "varredura" da poda podia ficar presa | Classe de animação nunca removida | Remoção automática ao fim |

## Redesenho da Miss Minutes (feedback do usuário)

Redesenhada para seguir a referência enviada: disco laranja com aro visível (espessura de moeda), gradiente central mais claro,
12 marcações grossas marrons, olhos creme grandes com pupilas marrons e cílios, nariz de ponto, sorriso com dentes, mangas listradas,
luvas brancas, pernas finas e botinhas laranja. O rig continua animado: piscar, olhos seguindo o cursor, falas sincronizadas com a boca,
expressões feliz, ameaçadora (pálpebras baixas, sobrancelhas e sombra vermelha, mãos na cintura), "oops" (tremida e gota de suor),
piscadinha e alarme.

## Limitações conhecidas
- O chat é um motor local (não há backend para a Claude API).
- three.js r128 (última build UMD no cdnjs, versão fixa). As versões novas só existem como ES modules, que quebram ao abrir o `index.html` direto do disco.
