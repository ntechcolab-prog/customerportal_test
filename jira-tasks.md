# NETZSCH Customer Portal — Sprint do gerente (status verificado no código)

> Última atualização: 30/07 — status conferido direto no código.

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

### CP-627 — `modals.css` + `forms.css`  🚧 EM ANDAMENTO
- ✅ Criados `assets/modals.css` e `assets/forms.css` (tokenizados, drop-in) + focus-visible AAA no close.
- ✅ `admin-users.html` migrado como referência (modal + form) — provou os dois componentes.
- ✅ Drawer migrado: `orders`, `dashboard` (1:1), `contracts` + `lab-tests` (override `width:420px`).
- ⏭️ `order-detail` (drawer centralizado, sem slide, close 44px) e `checkout-confirmation`
  (backdrop blur + sombra -8px + easing spring + close 44px) NÃO migrados: variantes distintas, ficam inline.
- ✅ Form migrado: `contact-support` e `service-request` (forms.css + override que preserva geometria própria
  — altura 40px, borda #b1b4b7, chevron #9ca3af, textarea 100px, field-group 20px). Validação agora nativa.
- 🟠 **Decisão de normalização pendente** — as outras 10 páginas de form NÃO são 1:1 e migrar = mudança visível:
  - `checkout-order-details`: input 44px, radius 12, borda rgba(0,0,0,.12) + hover, label weight 500.
  - `production-monitoring`: input 44px, box-shadow duplo, **foco #0b9c92** (verde-2, não #007167), label 500.
  - `service-request-submitted`: input 44px, radius 12, bg #fafbfc, label 14px/#1f2937.
  - `shop-product-*` (7 iguais): **NÃO é form** — é painel de config de produto (select 44px/radius 12,
    asterisco via `.form-label span`, estado `.form-select.selected` do JS). Migrar quebraria asterisco/estado.
  → Só migrar essas se você decidir **normalizar tudo p/ um visual único** (aceitar as mudanças). Aí converjo em lote.
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

### CP-585 — Skeleton nas páginas principais
- Dashboard ✅ e Orders ✅ já têm.
- Falta o **detalhe de máquina** (zeta60 / discus30 / mastermix45).

## Extras da sprint (se sobrar tempo)
- **CP-586** — Skeleton no resto (`skeleton.css` já em 16 páginas; mapear o que falta).
- **CP-584** — Contact Support: `pages/contact-support.html` **já existe**, só revalidar.
