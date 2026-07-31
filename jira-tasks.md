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

### CP-627 — `modals.css` + `forms.css`
- Não existem. Modais em ~46 páginas, forms em ~10 — fixes de scroll/footer/z-index estão inline.
- Consolidar tokens/base. (Ajuda a padronizar a CP-626.)

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
