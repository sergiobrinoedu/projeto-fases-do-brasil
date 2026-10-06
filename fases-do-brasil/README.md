# Fases do Brasil — Linha do Tempo 3D

Página educacional interativa sobre as fases da História do Brasil (1500 → hoje).

**Stack:** JavaScript/Node.js · Vite · Three.js · Bootstrap 5 · jQuery · Express (API) · MySQL · Prisma · Google Identity (login)

## Como rodar
```bash
cp .env.example .env                                   # (Windows: copy .env.example .env)
docker compose -f ../docker/docker-compose.yml up -d   # MySQL 8 em localhost:3307 (root / root)
npm install                                            # também roda `prisma generate`
npm run db:init                                        # cria o banco e as tabelas (pasta data/*.sql) + conteúdo das fases
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
| `/login` | Entrar / cadastrar (`?cadastro` abre o cadastro, `?next=/caminho` volta depois do login) |

Em produção, o servidor precisa devolver `index.html` para qualquer rota (o `npm start` já faz isso; em hospedagem estática configure o "fallback SPA").

## Fundo: ampulheta de areia
`src/view/SceneView.js` (Three.js). A areia desce conforme o tempo em que a pessoa está no site (`RUN_SECONDS`, padrão 120 s; só conta com a aba visível). Quando acaba, a ampulheta gira 180° e a areia volta a cair. O ponto da areia é guardado na sessão do navegador (recarregar não zera). Ajuste tempos e tamanhos nas constantes no topo do arquivo. Respeita `prefers-reduced-motion`.

## Linha do tempo horizontal com zoom
Layout baseado no SVG de referência: linha horizontal centralizada, cards alternando acima/abaixo, **data** junto ao ponto e **nome** da fase na ponta do card. O zoom é contínuo, como no Google Maps:
- **Períodos** (Colônia · Império · República) → **Fases** (11 cards clicáveis) → **Marcos** (destaques de cada fase).
- Ao aproximar, a camada atual "passa à frente" (cresce e some com transparência suave) e a seguinte vem de longe (zoom in); ao afastar acontece o contrário (zoom out).
- Controles: roda do mouse (zoom no cursor; no limite a página rola), pinça no celular, botões **＋ / −**, duplo clique, arrastar para navegar. Teclado/TV: ← → fase anterior/próxima · ↑ ↓ (ou + −) zoom · Home visão geral.
- Os cards mantêm o visual e o efeito 3D de antes. Parâmetros de escala em `src/view/TimelineView.js`; tamanhos em `.tl-stage` (`src/styles/main.css`).

## Progresso de leitura
"Próxima fase" marca a fase como lida (card esmaecido com a cor `#0e1216`, selo "Lida"), volta à linha do tempo e destaca a próxima ("Você está aqui"). Fases lidas continuam clicáveis. O progresso fica salvo no navegador (botão "Reiniciar progresso" na home).

## Login, cadastro e banco de dados
- **Banco:** MySQL (`instruções/datasetconfig.md` → usuário `root`, senha `root`). Os scripts de criação das tabelas estão em **`data/*.sql`** (um arquivo por assunto, executados em ordem por `npm run db:init`). `data/07_seed_conteudo.sql` é gerado de `src/infra/data/phases.data.js` (`npm run db:seed:gen`).
- **Prisma:** `prisma/schema.prisma` espelha as tabelas; o acesso ao banco fica nas camadas `server/models` (Prisma Client) e `server/services` (regras). Rotas em `server/routes`.
- **Conta do site:** nome, e-mail e senha (hash bcrypt) → tabela `users`. Sessão = cookie httpOnly + tabela `sessions` (guarda só o hash do token).
- **Conta Google:** botão oficial *Google Identity Services* no navegador; o servidor valida o token com a biblioteca open source `google-auth-library` e grava **nome e e-mail** em `users`. Defina `GOOGLE_CLIENT_ID` no `.env` (passo a passo no `.env.example`). Sem ele o botão aparece desativado.
- **Progresso:** logado, as fases lidas são salvas em `user_phase_read` / `user_journey` e acompanham o aluno em qualquer aparelho.
- **UX:** ícone de usuário na navbar → `/login`; botão **CADASTRE-SE** alterna entre as áreas Entrar/Cadastrar; logado, o ícone vira avatar com menu (*Minha conta* / *Sair*).

## Navegação
Mouse (hover = zoom + card 3D), toque (arrastar/pinça), teclado/controle de TV (← → fases · ↑ ↓ zoom · Enter abre · Esc fecha).

## Versionamento (Git)
Padrão de commit (já configurado em `.gitmessage`):
```
Version : 1.x.x
Add : ( o que foi adicionado )
Rem : ( o que foi removido )
Fix : ( correções )
```
Fluxo: `git add -A` → `git commit` (abre o template).
