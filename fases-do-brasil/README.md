# Fases do Brasil — Linha do Tempo 3D

Página educacional interativa sobre as fases da História do Brasil (1500 → hoje).

**Stack:** JavaScript/Node.js · Vite · Three.js · Bootstrap 5 · jQuery · Express (API)

## Como rodar
```bash
npm install
npm run dev:all   # front (http://localhost:5173) + API (http://localhost:3001)
# ou apenas o front (usa dados locais se a API estiver offline):
npm run dev
# produção:
npm run build && npm start   # tudo em http://localhost:3001
```
Para abrir no celular/TV: use o endereço de rede mostrado pelo Vite (`Network: http://192.168.x.x:5173`).

## Arquitetura (`src/`)
| Pasta | Papel | Padrões |
|---|---|---|
| `domain/` | Entidades (`Phase`, `Period`) e contrato `PhaseRepository` | Entity, Factory (`fromDTO`), Repository (porta) |
| `infra/` | Dados, HTTP (jQuery.ajax), repositórios API/Local, `EventBus`, config | Repository (adaptadores), Observer/Pub-Sub, Singleton |
| `services/` | `PhaseService` (API com fallback local), `ArtService` (ilustrações SVG) | Service Layer, Strategy |
| `auth/` | `Session`, `AuthService`, `AuthGuard` (extensão futura de login/RBAC) | Singleton, Guard |
| `models/` | `TimelineModel` (estado observável) | Model (MVC), Observer |
| `view/` | Navbar de vidro, Timeline, Detalhe (zoom), Sobre, Cena 3D (ampulheta) | View (MVC) |
| `components/` | `PhaseCard`, `Gallery` (Bootstrap Carousel), `PeriodCard` | Component / Factory |
| `controller/` | App (composition root), Timeline, Detail, Nav, Scene | Controller (MVC), Dependency Injection |

API (`server/index.js`): `GET /api/timeline`, `/api/phases`, `/api/phases/:id`, `/api/periods`, `/api/site`, `/api/health`.

## Personalização
- **Textos/fases:** `src/infra/data/phases.data.js`
- **Fotos reais:** coloque em `public/images/` e liste em `images: ['/images/arquivo.jpg']` na fase. Sem fotos, o app gera ilustrações na paleta do projeto.
- **Equipe (Sobre nós):** `SITE.team.members` no mesmo arquivo.
- **Cores:** variáveis CSS no topo de `src/styles/main.css`.

## Rotas
| URL | View |
|---|---|
| `/` | Linha do tempo horizontal com zoom (Períodos → Fases → Marcos) |
| `/fase/:id` | Detalhe de uma fase (ex.: `/fase/era-vargas`) |
| `/sobre` | Sobre o projeto |
| `/equipe` | Sobre nós |

Em produção, o servidor precisa devolver `index.html` para qualquer rota (o `npm start` já faz isso; em hospedagem estática configure o "fallback SPA").

## Fundo: ampulheta de areia
`src/view/SceneView.js` (Three.js). Começa **centralizada**; conforme o zoom da linha do tempo (ou ao sair do início/abrir uma fase) ela **desliza girando para o canto superior direito** e fica ali. A areia **derrama conforme a pessoa lê e navega**: rolar, clicar, teclar e tocar liberam alguns segundos de areia (`ping`), ler uma fase aberta derrama continuamente e concluir uma fase dá um impulso extra (`addFlow`). Sem atividade o fio para. Com `RUN_SECONDS` (padrão 100 s) de atividade a areia acaba, a ampulheta gira 180° e recomeça. O ponto da areia é guardado na sessão (recarregar não zera). Respeita `prefers-reduced-motion`.

## Linha do tempo horizontal com zoom
Layout baseado no SVG de referência: linha horizontal centralizada, cards alternando acima/abaixo, **data** junto ao ponto e **nome** da fase na ponta do card. O zoom é contínuo, como no Google Maps:
- **Períodos** (Colônia · Império · República) → **Fases** (11 cards clicáveis) → **Marcos** (destaques de cada fase).
- Ao aproximar, a camada atual "passa à frente" (cresce e some com transparência suave) e a seguinte vem de longe (zoom in); ao afastar acontece o contrário (zoom out).
- Controles: roda do mouse (zoom no cursor; no limite a página rola), pinça no celular, botões **＋ / −**, duplo clique, arrastar para navegar. Teclado/TV: ← → fase anterior/próxima · ↑ ↓ (ou + −) zoom · Home visão geral.
- Os cards mantêm o visual e o efeito 3D de antes. Parâmetros de escala em `src/view/TimelineView.js`; tamanhos em `.tl-stage` (`src/styles/main.css`). O card de fase se ajusta à altura disponível (`--cw` calculado de `--stage-h`, `--gap` e `--pad-y`), então os cards de cima nunca são cortados; em telas baixas o cabeçalho fica compacto.

## Progresso de leitura
"Próxima fase" marca a fase como lida (card esmaecido com a cor `#0e1216`, selo "Lida"), volta à linha do tempo e destaca a próxima ("Você está aqui"). Fases lidas continuam clicáveis. O progresso fica salvo no navegador (botão "Reiniciar progresso" na home).

## Navegação
Mouse (hover = zoom + card 3D), toque (arrastar/pinça), teclado/controle de TV (← → fases · ↑ ↓ zoom · Enter abre · Esc fecha).

## Versionamento (Git)
Padrão de commit (já configurado em `.gitmessage`):
```
Versão : 1.x.x
Add : ( o que foi adicionado )
Rem : ( o que foi removido )
Fix : ( correções )
```
Fluxo: `git add -A` → `git commit` (abre o template).
