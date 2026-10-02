# TVA · Autoridade de Variância Temporal (site de fã fictício)

Site institucional fictício da TVA (série *Loki*). Projeto estático, sem build.

## Rodar
Abra `index.html` direto no navegador ou sirva a pasta:

```bash
python -m http.server 5173
```

## Estrutura
- `index.html`: marcação de todas as seções
- `css/base.css`: tokens, temas claro/escuro, topo, cursor, transições
- `css/sections.css`: seções (hero, orientação, linha do tempo, consulta, mapa, poda, nexus, departamentos, rodapé)
- `css/widgets.css`: Miss Minutes, chat, dossiê, terminal
- `js/core.js`: estado, eventos, sons WebAudio, cursor, desvio/dossiê, eras
- `js/minutes.js`: rig SVG da Miss Minutes, dock e reações
- `js/chat.js`: motor de respostas local
- `js/scene.js`: cena three.js (hall, Time Door, Linha Sagrada → árvore)
- `js/features.js`: consulta de variante, mapa, formulário de poda, contagem, easter eggs
- `js/terminal.js`: terminal CRT escondido

## Segredos
- Terminal: tecla **`** (crase) ou **~**, o parafuso no rodapé, ou "abre o terminal" no chat. Digite `ajuda`.
- Código Konami, tarjas pretas da orientação, distintivo da B-15 (3 cliques), cabeça do Guardião do meio, pasta da Renslayer, TemPad (`1893`, `1985`, `2077`, `2026`...).
- Chat: "me poda", "modo escuro", "consulta loki", "jet ski", "propósito glorioso".

Documentos: `REFERENCIAS.md` (pesquisa), `CONCEITO.md` (direção), `AUTOCRITICA.md` (revisão).
