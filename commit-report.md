# Relatório de Commits — NETZSCH Customer Portal

**Repositório:** `customerportal_test` · **Período:** desde 01/08/2026 (1º commit em 06/08) · **Gerado:** 13/08/2026

## Resumo

| Métrica | Valor |
|---|---|
| Commits | **78** |
| Dias ativos | 5 (06, 07, 10, 11, 13/08) |
| Autores | 2 |
| Commits hoje (13/08) | 28 |

## Por autor

| Autor | Commits | feat | fix | refactor | docs | chore |
|---|--:|--:|--:|--:|--:|--:|
| Mariana Libardi | **63** | 30 | 3 | 22 | 6 | 2 |
| ntechcolab | **15** | 4 | 1 | 2 | 2 | 6 |
| **Total** | **78** | 34 | 4 | 24 | 8 | 8 |

## Por tipo

- **feat** — 34
- **refactor** — 24
- **docs** — 8
- **chore** — 8
- **fix** — 4

## Commits por dia

### 13/08 — 28 commits
_Padronização das 5 máquinas no template hero-split + redesign da Production Monitoring_

- `02a3a27` **feat** — Production Monitoring: hero em 2 colunas com mockup de dashboard ao vivo (grafico de area SVG inline + tiles RPM/temp/efficiency); eyebrow NEW, stats com flex-wrap, mockup escondido no mobile _(Mariana Libardi)_
- `a125251` **feat** — Production Monitoring: form de demo vira modal (abre no 'Request a Demo', fecha ✕/overlay/Esc) em vez de secao no rodape; botoes no padrao do design system (btn-cta/btn-secondary + inversao no hero) _(Mariana Libardi)_
- `089d003` **refactor** — Production Monitoring: redesign enxuto e moderno (hero com stats embutidas, features compactas de 1 linha, form de 6->3 campos, remove secao Benefits) — menos scroll e menos leitura p/ decisao de demo _(Mariana Libardi)_
- `142af9a` **feat** — ProPhi: Production Monitoring vira acao (botao abaixo de Documents and Manuals, badge NEW) + modal com pitch/features/Learn More (substitui o banner) _(Mariana Libardi)_
- `2fd23e5` **refactor** — ProPhi: adota o padrao (clonado do template com dados proprios: SN 15202530-10, LINE 4 WET GRINDING, Agitator Bead Mill, specs tecnicas proprias) + preserva banner Production Monitoring + default de hourmeter (6.580h) _(Mariana Libardi)_
- `e49e5cf` **refactor** — AlphaZeta 10: adota o padrao (clonado do template Discus 30 com dados proprios: SN 80204882, WHITE PRODUCTION ONLY, warranty 2026-06-01); modais Milla/subset/SR/docs inclusos. Imagem placeholder = zeta60.png (sem asset dedicado) _(Mariana Libardi)_
- `a2577a9` **feat** — Machines: adiciona classe machine-title ao hero-machine-name (Discus/Zeta) p/ o modal de Documents exibir o nome da maquina _(Mariana Libardi)_
- `bcb5313` **refactor** — MasterMix 45: padroniza largura do card (.page padding 0 32px 32px, igual Discus/Zeta) — estava indo de ponta a ponta _(Mariana Libardi)_
- `3dfe5d7` **refactor** — MasterMix 45: alinha Select subset e Service Request ao padrao modal da Discus (porta subset-modal + sr-modal + JS, troca acoes p/ triggers, guarda JS antigo do dropdown) + mesmo sizing do hero _(Mariana Libardi)_
- `f7ae448` **refactor** — Machines: padroniza tamanho do hero (imagem 380->300px, card min-height 400->360px) p/ caber sem rolagem — Discus 30 + Zeta 60 _(Mariana Libardi)_
- `fe35870` **refactor** — MasterMix 45: adota o padrao da Discus 30 (reconstroi identity-bar+actions-grid como hero-card split; Line/Installed editaveis, acoes em lista, Machine Details acordeao, Hourmeter editavel; preserva dropdown de subset + link de SR; imagem correta) _(Mariana Libardi)_
- `b0893ca` **fix** — Discus 30: micro-fix mobile do rodape Machine Details (padding no toggle/content + ::before inset, em vez de no wrapper) apos virar acordeao full-width _(Mariana Libardi)_
- `bcf517b` **fix** — Zeta 60: corrige imagem do hero e do modal Service Request para machine-zeta60.png (estava usando a da Discus) _(Mariana Libardi)_
- `66872a3` **refactor** — Zeta 60: adota o padrao da Discus 30 (hero-card unico, Line/Installed editaveis, rodape Machine Details acordeao, Hourmeter editavel, dividers inset, espacamento, scroll-ao-abrir, Documents and Manuals) _(Mariana Libardi)_
- `67830f1` **feat** — Discus 30: Machine Details vira cabecalho de acordeao full-width (rotulo a esquerda + chevron a direita, hover na barra toda) pra nao ficar perdido _(Mariana Libardi)_
- `c399a6b` **feat** — Discus 30: divisorias do card recuadas das bordas (vertical via divider-v com margem, horizontal via ::before inset); Machine Details rola a pagina suavemente ao abrir _(Mariana Libardi)_
- `1734676` **feat** — Discus 30: Machine Details agora fica DENTRO do card (wrapper .hero-card unico; foto/info viram paineis internos), rodape com toggle + expansao dentro do container _(Mariana Libardi)_
- `97334dc` **feat** — Discus 30: move Machine Details p/ abaixo do hero (expande full-width sem empurrar o conteudo visivel) e torna o Hourmeter editavel no novo layout (linha na Machine Information, lapis verde + persistencia) _(Mariana Libardi)_
- `bf27728` **feat** — Discus 30: reduz espacamentos verticais do hero (margem topo, padding do card, gaps das acoes) para caber tudo na tela sem scroll _(Mariana Libardi)_
- `3d22dee` **refactor** — Discus 30: padroniza linha de producao + instalacao como linhas rotuladas editaveis abaixo do SN (editor .hero-meta generico); lapis de editar no verde NETZSCH _(Mariana Libardi)_
- `8002b6e` **feat** — Discus 30: data de instalacao vira linha propria abaixo do SN (Installed: dd/mm/aaaa), editavel via date picker com persistencia local _(Mariana Libardi)_
- `4fb7c68` **feat** — Torna a linha de producao editavel no layout hero (Discus 30/Zeta 60): botao de lapis no badge LINE, edicao inline + persistencia local _(Mariana Libardi)_
- `0e0e3f5` **refactor** — Remove botão 'Clear filters' do empty state da página Orders (padroniza com as demais) _(Mariana Libardi)_
- `3723245` **fix** — Centraliza empty state na visão de cards da página Machines (grid-column: 1/-1) _(Mariana Libardi)_
- `8075962` **refactor** — Padroniza empty state de busca nos componentes JS (modal Documents + filtro de docs do produto): badge+titulo+desc 'No results found'; corrige exibição do estado vazio no modal _(Mariana Libardi)_
- `1b22f7f` **refactor** — Padroniza empty state de busca/filtro: ícone único (documento), copy 'No results found' + 'Try adjusting your search or filters' (i18n EN/DE) em 11 páginas _(Mariana Libardi)_
- `1c1e899` **feat** — Documents modal: renomeia botão p/ 'Documents and Manuals' (Discus 30) e adiciona filtro de idioma (DE/PT/EN/ES) no padrão do portal _(Mariana Libardi)_
- `d75641d` **feat** — Destaca alerta de Partial Availability no checkout (barra de acento, contraste AAA, tipografia mais forte) _(Mariana Libardi)_

### 11/08 — 6 commits
_Modais de carrinho / preços (estilo Apple) e aviso de produto indisponível_

- `e558a99` **feat** — Modal Glassbeads no padrão: ícones nos botões + título consistente _(Mariana Libardi)_
- `f1ef66b` **feat** — Modal do carrinho: só o Cenário A (preço alterado) _(Mariana Libardi)_
- `2c1169d` **refactor** — Refina modal de preços do carrinho _(Mariana Libardi)_
- `60c5fdb` **refactor** — Moderniza modal de preços do carrinho (estilo Apple) _(Mariana Libardi)_
- `4c4f895` **feat** — Modal indisponível: cores para verde NETZSCH + gatilho do carrinho no ZetaBeads Plus _(Mariana Libardi)_
- `9eedd4d` **refactor** — Modal de produto indisponível (Glassbeads): aviso no Add to Cart + revisão do carrinho _(Mariana Libardi)_

### 10/08 — 15 commits
_Skeleton nas máquinas, steppers.css, ícone Track e machine-modals.css_

- `94c5315` **docs** — docs: CP-627b parcial — drawing+SR extraídos, Milla adiado (risco de cascata) _(ntechcolab)_
- `164207a` **refactor** — refactor: extrai Service Request modal p/ machine-modals.css (CP-627b) _(ntechcolab)_
- `23ab423` **refactor** — refactor: extrai drawing lightbox p/ machine-modals.css (CP-627b) _(ntechcolab)_
- `0626462` **chore** — chore: marca CP-627 (modals.css+forms.css) como concluída; separa fase 2 em CP-627b _(ntechcolab)_
- `0a08055` **chore** — chore: atualiza cabeçalho do backlog (CP-585 + FIG-01 4/13) _(ntechcolab)_
- `600f8d6` **docs** — docs: FIG-01 avança para 4/13 — fluxos Orders e Quotes no Figma (Sections + prototype) _(ntechcolab)_
- `b6c346d` **chore** — chore: marca CP-585 (skeleton detalhe de máquina) como concluída no backlog _(ntechcolab)_
- `5dcb96d` **feat** — feat: replica skeleton loading em discus30 e mastermix45 (CP-585) _(ntechcolab)_
- `efada57` **feat** — feat: skeleton loading no detalhe de máquina — zeta60 (CP-585) _(ntechcolab)_
- `12264df` **chore** — chore: atualiza data do backlog (10/08) _(ntechcolab)_
- `3acc59b` **chore** — chore: marca UI-02 (padronização stepper) como concluída no backlog _(ntechcolab)_
- `1d2caf9` **feat** — feat: migra stepper do service-request-submitted para steppers.css (UI-02) _(ntechcolab)_
- `ae6437c` **feat** — feat: cria steppers.css e padroniza stepper de Orders/Quotes (UI-02) _(ntechcolab)_
- `e9aaee1` **chore** — chore: marca UI-01 (padronização ícone Track) como concluída no backlog _(ntechcolab)_
- `87cc34a` **fix** — fix: padroniza ícone dos botões Track para o caminhão em todas as telas (UI-01) _(ntechcolab)_

### 07/08 — 26 commits
_CP-627 (modals.css + forms.css), Select subset com resultados estilo Milla, e flows.md_

- `0354492` **refactor** — backlog: adiciona UI-01 (padronizar ícones do botão Track) + UI-02 (padronizar steps de Orders/Quotes) _(Mariana Libardi)_
- `55f687e` **feat** — zeta60/discus30: Select subset — header é o seletor desde o início (sem lista, sem default) _(Mariana Libardi)_
- `2e165ff` **feat** — zeta60/discus30: header verde vira seletor de subset (dropdown no lugar) _(Mariana Libardi)_
- `2551265` **feat** — zeta60/discus30: liga o coração (favoritos) no modal de subset _(Mariana Libardi)_
- `92dd2ab` **feat** — zeta60/discus30: zoom do desenho no modal de subset (lightbox próprio) _(Mariana Libardi)_
- `eb9a99e` **feat** — zeta60/discus30: resultado do subset no estilo Milla (header verde + tabela + carrinho) _(Mariana Libardi)_
- `92fe87b` **feat** — zeta60/discus30: subset abre resultados DENTRO do modal (sem redirect) _(Mariana Libardi)_
- `a8b7608` **feat** — zeta60/discus30: 'Select subset' como card de ação + modal próprio _(Mariana Libardi)_
- `b924bbd` **chore** — Revert "zeta60/discus30: adiciona 'Select subset' abaixo da Milla" _(Mariana Libardi)_
- `ccfba0a` **feat** — zeta60/discus30: adiciona 'Select subset' abaixo da Milla _(Mariana Libardi)_
- `2a31922` **docs** — docs: backlog — adiciona FIG-01 (fluxos no Figma) + DOC-01 (flows.md) + tabela-resumo _(Mariana Libardi)_
- `d7845e2` **docs** — docs: cria flows.md — mapa dos 13 fluxos + matriz por role _(Mariana Libardi)_
- `1333f05` **docs** — docs: CP-627 — passo 1 fechado (5 forms normalizados, shop-product mantidas) _(Mariana Libardi)_
- `43fb87b` **chore** — Revert "CP-627 #4: shop-product-detail normaliza select de tamanho p/ forms.css" _(Mariana Libardi)_
- `dc8de25` **refactor** — CP-627 #4: shop-product-detail normaliza select de tamanho p/ forms.css _(Mariana Libardi)_
- `3624b50` **refactor** — CP-627 #3: service-request-submitted normaliza form p/ forms.css _(Mariana Libardi)_
- `00d53d4` **refactor** — CP-627 #2: production-monitoring normaliza form p/ forms.css _(Mariana Libardi)_
- `84aa75e` **refactor** — CP-627 #1: checkout-order-details normaliza form p/ forms.css _(Mariana Libardi)_
- `66c24f4` **docs** — docs: CP-627 — 2 forms migrados + decisão passo 2 (Opção B) + normalização pendente _(Mariana Libardi)_
- `64eb8ab` **feat** — CP-627: contact-support e service-request usam forms.css _(Mariana Libardi)_
- `70f0878` **docs** — docs: CP-627 — drawer lote feito (5 páginas), 2 variantes anotadas _(Mariana Libardi)_
- `460a5ff` **refactor** — CP-627: migra drawer de dashboard/contracts/lab-tests p/ modals.css _(Mariana Libardi)_
- `8a9fa16` **feat** — CP-627: orders usa modals.css para o chrome do drawer (2ª referência) _(Mariana Libardi)_
- `9975e70` **docs** — docs: CP-627 em andamento — plano de migração triado por arquétipo _(Mariana Libardi)_
- `bfe4b12` **feat** — CP-627: admin-users usa modals.css + forms.css (página de referência) _(Mariana Libardi)_
- `a04c23e` **feat** — CP-627: cria forms.css + modals.css (componentes reutilizáveis, drop-in) _(Mariana Libardi)_

### 06/08 — 3 commits
_empty-states.css em 12 páginas, telas 404/500 e mock da home pré-login_

- `c7923f2` **feat** — Adiciona mock vetorial (SVG) da home/landing pré-login _(Mariana Libardi)_
- `16ef374` **feat** — Adiciona telas 404 e 500 com empty-state--page _(Mariana Libardi)_
- `b3ee95f` **refactor** — Padroniza empty states: aplica empty-states.css em 12 páginas _(Mariana Libardi)_

---
_Relatório automático a partir do `git log`. Tipos inferidos das mensagens de commit._
