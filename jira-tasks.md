# NETZSCH Customer Portal — Backlog

> Última atualização: 10/08 — UI-01, UI-02, CP-585 e CP-627 concluídas; FIG-01 em 4/13.
> Duas frentes: **Sprint do gerente** (HTML/CSS) e **Figma** (mocks & fluxos).

## 📋 Resumo do backlog

| ID | Item | Frente | Status | Notas |
|----|------|--------|--------|-------|
| CP-582 | Componente empty-state (`empty-states.css`) | HTML | ✅ Feito | referência: `orders` |
| CP-572 | Empty states + telas 404/500 | HTML | ✅ Feito | resíduo inline trivial em ~12 pgs |
| CP-627 | `modals.css` + `forms.css` | HTML | ✅ Feito | componentes + páginas aplicáveis; shop-product fora por decisão |
| CP-627b | Modais fase 2 (Service Request + Drawing/Milla) | HTML | 🟡 Extra | famílias próprias das telas de máquina (`.sr-modal-*`, `.drawing-*`/`.milla-*`) |
| CP-626 | Layout novo nas máquinas | HTML | 🔴 Pendente | AlphaZeta10, ProPhi, MasterMix45 |
| CP-585 | Skeleton no detalhe de máquina | HTML | ✅ Feito | zeta60/discus30/mastermix45 (classes .skel-machine-* no skeleton.css) |
| CP-586 | Skeleton no resto | HTML | 🟡 Extra | mapear o que falta |
| CP-584 | Contact Support | HTML | ✅ Existe | só revalidar |
| FIG-01 | Fluxos no Figma (Sections + Prototype) | Figma | 🚧 Em andamento | 4/13: Login, Registro, Orders, Quotes ✅; faltam 9 + índice |
| DOC-01 | `flows.md` (mapa de fluxos) | Docs | ✅ Feito | manter em sync c/ código+Figma |
| UI-01 | Padronizar ícones do botão "Track" | HTML | ✅ Feito | caminhão único em 16 botões/links (commit 87cc34a) |
| UI-02 | Padronizar steps de Orders e Quotes | HTML | ✅ Feito | steppers.css (fita chevron verde) em 4 telas; checkout-quote fora por decisão |

## ✅ Feito

### CP-582 — Componente reutilizável de empty state
- Criado `assets/empty-states.css` (icon + título + descrição + CTA), tokens em `:root`,
  variantes `--compact` / `--page` / `--accent`, contraste AAA.
- Aplicado em `pages/orders.html` como página de referência (CTA "Clear filters" funcional).
- Classes mantidas compatíveis → migrar as demais é só trocar o link + apagar o CSS inline.

## 🔜 Próximas (ordem sugerida)

### CP-572 — Empty states em todas as listagens + 404/500  ← COMEÇAR AMANHÃ
- Migrar para o componente CP-582 as 13 páginas restantes que já têm markup de empty state:
  quotes, contracts, machines, notifications, shop, wishlist, budget, services, help,
  lab-tests, admin-requests, admin-users, machine-spare-parts-results.
  (cada uma: linkar `empty-states.css` + remover o bloco `.empty-state*` inline)
- **Criar páginas 404 e 500** (não existem) usando a variante `.empty-state--page`, com ação de saída.

### CP-627 — `modals.css` + `forms.css`  ✅ FEITO (10/08)
> Core concluído: componentes criados e aplicados em todas as páginas aplicáveis. shop-product-*
> ficaram fora por decisão da Mariana (não são pendência). A "fase 2" (famílias próprias
> `.sr-modal-*` e `.drawing-*`/`.milla-*` das telas de máquina) foi separada em **CP-627b**.

- ✅ Criados `assets/modals.css` e `assets/forms.css` (tokenizados, drop-in) + focus-visible AAA no close.
- ✅ `admin-users.html` migrado como referência (modal + form) — provou os dois componentes.
- ✅ Drawer migrado: `orders`, `dashboard` (1:1), `contracts` + `lab-tests` (override `width:420px`).
- ⏭️ `order-detail` (drawer centralizado, sem slide, close 44px) e `checkout-confirmation`
  (backdrop blur + sombra -8px + easing spring + close 44px) NÃO migrados: variantes distintas, ficam inline.
- ✅ Form migrado: `contact-support` e `service-request` (forms.css + override que preserva geometria própria
  — altura 40px, borda #b1b4b7, chevron #9ca3af, textarea 100px, field-group 20px). Validação agora nativa.
- ✅ **Normalizados (Mariana validou 1 a 1 na URL):** `checkout-order-details`, `production-monitoring`
  (foco #0b9c92→#007167), `service-request-submitted`. Convergidos ao padrão (42px, radius 10, borda #d1d5db),
  preservando estrutura/campos específicos (label solto, read-only, radios, espaçamento).
- ❌ **shop-product-\* (7 páginas) — mantidas no visual original** (Mariana **não** curtiu a normalização do painel
  de produto). NÃO migrar: o "Order Information" segue com select 44px/radius 12/hover próprios. Decisão registrada.
- ⏭️ **Passo 2 = Opção B (decidido):** modais de confirmação (`wishlist`, `login`) ficam inline.
  NÃO criar `.modal--confirm`. Arquétipo de confirmação fora do sistema por ora.
- Adição de `<link>` é **não-destrutiva**: o link fica no `<head>` antes do `<style>` inline,
  então o inline vence até ser removido. Migrar uma página = linkar + apagar o inline redundante.

**Levantamento (o projeto tem várias famílias convivendo — triar por ARQUÉTIPO, não por nome de classe):**

Modais — 4 arquétipos distintos que reusam nomes de classe com valores diferentes:
1. **Form/detalhe** (`.modal` 480px, header/body/footer) — admin-users, mastermix45. → **coberto** por modals.css.
2. **Confirmação** (`.modal`/`.modal-box` centralizado, padding 32px, `.modal-actions` center, botões-pílula) —
   wishlist, login (logout). → NÃO migrar direto: precisa de um modifier `.modal--confirm` (decisão pendente) ou manter override inline.
3. **Service Request** (`.sr-modal-*`, wrapper 680px, close fora do card, estados form/success) — zeta60, discus30. → família própria, fase 2.
4. **Drawing/Milla** (`.drawing-lightbox`, `.milla-modal`) — lightbox de imagem / IA. → família própria, fase 2.

Estados de "aberto" cobertos pelo componente: `.visible`, `.is-open`, `.open` (overlay) e `.show`, `.open` (drawer).

Drawer lateral (quick view / tracking) — arquétipo único, **coberto**: orders, dashboard, order-detail, contracts, lab-tests, checkout-confirmation (chrome do drawer; timeline/seções ficam inline por serem específicas).

Forms — 3 convenções:
- **A) Auth** (`.field`/`.field-input`/`.field-label` 14/500/#6b7280, borda 1.5px, radius 12) — login/register/forgot/reset.
  Família visual distinta → migrar só se aceitar convergência; hoje o componente NÃO restyla a auth.
- **B) Admin/modal** (`.form-group`/`.form-label`/`.form-input` 42px, borda 1px #d1d5db, radius 10) → **canônico** em forms.css.
- **C) Contact** (`.field-group`/`.field-label` bloco + `.form-input`/`.form-textarea`/`.subject-select` 40px, borda #b1b4b7) →
   migrável; converge p/ 42px + borda #d1d5db (normalização intencional — validar visual na 1ª migração).

**Convergências decididas nos tokens:** input 42px / borda `#d1d5db` / radius 10 · erro `#d93025` (mesmo do form-validation.js) ·
required `#c73e20` · foco `0 0 0 3px rgba(0,113,103,.1)`. Validação (`.error`/`.field-error.visible`/`.valid`) agora é nativa (o form-validation.js parava de injetar fallback).

**Próximas migrações (ordem sugerida, uma por commit, validando na URL):**
- Forms admin/modal (match perfeito): demais páginas com `.form-group`/`.form-input` iguais ao admin.
- Modais de formulário/detalhe (`.modal` 480px) em outras páginas que sigam o arquétipo do admin.
- Contact-support (aceitar convergência 40→42px + borda #b1b4b7→#d1d5db).
- Decidir `.modal--confirm` para o arquétipo de confirmação (wishlist/login).
- Fase 2 (famílias próprias): `.sr-modal-*` (Service Request), `.drawing-*`/`.milla-*`.

### CP-626 — Layout novo nas máquinas
- **AlphaZeta 10** e **ProPhi** ainda no layout antigo (sem accordion/modais, ~1900 linhas).
- **MasterMix 45** parcial (accordion 1, modais 7) → finalizar.
- Portar o fix de scroll do Service Request que ficou só na Zeta 60.
- Referência: `machine-zeta60.html` e `machine-discus30.html`.

### CP-585 — Skeleton nas páginas principais  ✅ FEITO (10/08)
- Dashboard ✅ e Orders ✅ já tinham.
- Detalhe de máquina ✅: `machine-zeta60`, `machine-discus30` (hero-split) e `machine-mastermix45`
  (layout próprio: identity-bar + actions-grid). Classes reutilizáveis `.skel-machine-*` +
  `.skel-actions-grid` no `skeleton.css`; `.page` vira `page-content` + `data-skeleton-stagger`.
- Commits `efada57` (zeta60 ref) + `5dcb96d` (discus30/mastermix45).

## Extras da sprint (se sobrar tempo)
- **CP-586** — Skeleton no resto (`skeleton.css` já em 16 páginas; mapear o que falta).
- **CP-584** — Contact Support: `pages/contact-support.html` **já existe**, só revalidar.

## 🎨 Figma — Fluxos & Documentação

### FIG-01 — Fluxos navegáveis no Figma (Sections + Prototype)  🚧 EM ANDAMENTO
Arquivo de mocks `PwX3Yv0B79GW2Thv9IMDjZ`. Para cada um dos 13 fluxos (numeração `00–12` do `flows.md`):
- **Section nomeada** no canvas envolvendo as telas do fluxo.
- **Prototype flow** navegável (ponto de partida + conexões clicáveis). Connectors do FigJam são
  bloqueados no design → usar Prototype nativo.
- ✅ **Feitos:** `01 Login` (+ Login SSO) e `02 Registro` (pág. Auth & Registration) · `07 Orders` e
  `08 Quotes` (pág. Orders & Quotes — 2 Sections `📦 Fluxo — Orders` / `📄 Fluxo — Quotes`, prototype list↔detail).
- ⏳ **Faltam 9:** 00 Público · 03 Dashboard · 04 Máquinas · 05 Shop · 06 Checkout ·
  09 Serviços · 10 Budget · 11 Admin · 12 Suporte.
- **Padrão consolidado:** Section branca por fluxo, frames em linha (passo 1540px, padding 80 / topo 130),
  reação `ON_CLICK NAVIGATE` (DISSOLVE 0.3 EASE_OUT) no frame inteiro, `page.flowStartingPoints` por fluxo.
- **IDs das páginas:** ver [[figma-mocks-do-customer-portal]] (0:1 DS · 7:2 Auth · 7:3 Home · 7:4 Machines · 7:5 Shop · 7:6 Orders&Quotes · 7:7 Services · 7:8 Admin · 7:9 Profile/Help).
- **Página "🗺️ Índice de Fluxos"** (capa) listando os 13 com link pra cada Section.

### DOC-01 — `flows.md` (mapa de fluxos)  ✅ FEITO
- 13 flow cards + matriz `fluxo × role` (fiel ao `assets/role-guard.js`). Versionado no repo.
- **Regra:** quando um fluxo mudar no código/Figma, atualizar o `flows.md` **no mesmo commit**.

## 🎯 Padronização / UI consistency

### UI-01 — Padronizar ícones do botão "Track"  ✅ FEITO (10/08)
- Divergência confirmada: 4 ícones diferentes. Canônico = caminhão de entrega (viewBox 24, stroke 1.8,
  rodas preenchidas) já usado em `dashboard` e `orders` (13x).
- Substituídos: `order-detail` (caminhão de proporção diferente), `checkout-confirmation` (ícone de pacote)
  e `contact-support` (quick-link "Track Orders" que usava sacola). Total: **16 ícones idênticos**.
- O botão Download PDF do `order-detail` mantém o próprio ícone (correto). Commit `87cc34a`.

### UI-02 — Padronizar steps de Orders e Quotes  ✅ FEITO (10/08)
- Design canônico decidido: **fita chevron**, etapa ativa no verde da marca **#007167**
  (antes #4e98aa, fora da paleta), altura unificada **40px**, responsivo e acessível (`role=list/listitem`).
- Componente único em **`assets/steppers.css`**; CSS inline removido das telas.
- Aplicado em: `order-detail`, `quote-detail`, `checkout-confirmation` (convertido do Design B de
  círculos numerados) e `service-request-submitted`. Commits `ae6437c` + `1d2caf9`.
- **Fora do escopo por decisão:** `checkout-quote` (segue no Design B de círculos numerados) e o
  wizard de cadastro (`register-*`, `.progress`+dots/bar — componente distinto e intencional).
