# Customer Portal — Mapa de Fluxos

> **Fonte da verdade das jornadas do NETZSCH Customer Portal.**
> A numeração `00`–`12` casa entre este documento, o Figma de mocks
> (`PwX3Yv0B79GW2Thv9IMDjZ`) e o código (`pages/*.html`).
>
> **70 telas · 13 fluxos · 4 roles.**
> Última atualização: 2026-08-07 (America/Sao_Paulo).

## Legenda
- `tela` = arquivo em `pages/<tela>.html`.
- **Role** = perfil que acessa (Admin, Buyer, Approver, Technician). Controle real em `assets/role-guard.js`.
- 🔒 = fluxo restrito a certos perfis.
- Estado deslogado (fluxos 00–02) é anterior à escolha de role.

## Índice

| #  | Fluxo                     | Telas | Role                          |
|----|---------------------------|:-----:|-------------------------------|
| 00 | Público / Pré-login       | 3     | Deslogado                     |
| 01 | Login & Acesso            | 7     | Deslogado                     |
| 02 | Registro / Onboarding     | 14    | Deslogado                     |
| 03 | Dashboard / Home logado   | 3     | Todos (varia por role)        |
| 04 | Máquinas & Peças          | 9     | Todos                         |
| 05 | Loja / Shop               | 9     | Admin, Buyer, Technician¹     |
| 06 | Carrinho & Checkout       | 6     | Admin, Buyer                  |
| 07 | Pedidos / Orders          | 2     | Todos (varia por role)        |
| 08 | Cotações / Quotes         | 2     | Admin, Buyer, Approver        |
| 09 | Serviços & Contratos      | 7     | Todos (heterogêneo, ver card) |
| 10 | Orçamento / Budget        | 1     | 🔒 Buyer                      |
| 11 | Admin                     | 5     | 🔒 Admin                      |
| 12 | Suporte & Ajuda           | 2     | Todos                         |

¹ Technician vê a loja mas **não tem carrinho/checkout**; Approver não acessa a loja.

## Convenção de nomenclatura
- Mesmo prefixo `00_`–`12_` em **repo**, **Figma** (nome da Section/Flow) e **este arquivo**.
- Quando um fluxo muda no código ou no Figma, **atualizar este arquivo no mesmo commit**.

---

## 00 — Público / Pré-login
**Objetivo:** Apresentar o portal e servir os pontos de erro do sistema.
**Role:** Deslogado.
**Entrada:** URL raiz / link direto.
**Telas:** `home` · `404` · `500`
**Caminho principal:** `home` → **01 Login**.
**Estados / edge cases:** `404` (rota inexistente) · `500` (erro de servidor) — ambos com CTA de saída pro dashboard/home.
**Saída:** → **01 Login**.

---

## 01 — Login & Acesso
**Objetivo:** Autenticar o usuário e liberar o acesso ao portal.
**Role:** Deslogado (a escolha do perfil acontece aqui — dropdown de role no login para o protótipo).
**Entrada:** `home` → "Entrar" · ou URL protegida redireciona pra cá.
**Telas:** `login` · `login-sso` · `login-sso-domain` · `login-sso-corporate` · `forgot-password` · `verify-code` · `reset-password`
**Caminho principal:** `login` → (credenciais ok) → **03 Dashboard**.
**Ramais:**
- **Recuperação de senha:** `login` → `forgot-password` → `verify-code` → `reset-password` → `login`.
- **SSO corporativo:** `login` → `login-sso` → `login-sso-domain` → `login-sso-corporate` → **03 Dashboard**.
**Estados / edge cases:** credencial inválida · conta inexistente → CTA "Criar conta" leva ao **02 Registro**.
**Saída:** → **03 Dashboard**.

---

## 02 — Registro / Onboarding
**Objetivo:** Cadastrar uma nova empresa/usuário B2B, passo a passo.
**Role:** Deslogado.
**Entrada:** `login` → "Criar conta".
**Telas (14):**
- Principal: `register-confirm-email` · `register-email-verification` · `register-account-information` · `register-company-details` · `register-company-address` · `register-localization-empty` · `register-submitted`
- Estados/variantes: `register-company-details-filled` · `register-company-details-department` · `register-company-address-filled` · `register-company-address-country-open` · `register-company-address-state` · `register-localization-dropdown` · `register-localization-language-selected`
**Caminho principal:** `confirm-email` → `email-verification` → `account-information` → `company-details` → `company-address` → `localization` → `submitted`.
**Estados / edge cases:** validação de cada passo · campos preenchidos (filled) · dropdowns abertos (department, country, state, language).
**Saída:** `submitted` → **01 Login**.

---

## 03 — Dashboard / Home logado
**Objetivo:** Visão geral pós-login (atalhos, pedidos recentes, avisos).
**Role:** Todos — **conteúdo varia por perfil** (cards diferentes p/ Admin, Buyer, Approver, Technician).
**Entrada:** pós-login · logo/Home no header.
**Telas:** `dashboard` · `notifications` · `profile`
**Caminho principal:** `dashboard` → qualquer fluxo pela navegação principal.
**Ramais:** sino → `notifications` · avatar → `profile` (e dropdown de perfil).
**Estados / edge cases:** dashboard por role · empty states · skeleton loading · badges de notificação.
**Saída:** hub central — leva a todos os outros fluxos.

---

## 04 — Máquinas & Peças
**Objetivo:** Consultar máquinas do cliente, peças de reposição e monitoramento.
**Role:** Todos.
**Entrada:** nav "Machines".
**Telas (9):** `machines` · `machine-zeta60` · `machine-discus30` · `machine-mastermix45` · `machine-alphazeta10` · `machine-prophi` · `machine-spare-parts-results` · `machine-subset-inlet-flange` · `production-monitoring`
**Caminho principal:** `machines` → `machine-<modelo>` → `machine-spare-parts-results` (peças) → `machine-subset-inlet-flange` (subconjunto).
**Ramais:**
- **Milla (IA):** "Ask Milla" a partir da máquina → busca de spare parts → `machine-spare-parts-results`.
- **Upsell ProPhi:** `machine-prophi` → `production-monitoring` (landing + request quote).
- Peça encontrada → adicionar ao carrinho (**06 Checkout**, se o role permitir).
**Estados / edge cases:** máquina sem peças (empty) · modais de Service Request · drawing/lightbox técnico.
**Saída:** → **06 Checkout** (peça) · **09 Serviços** (service request).

---

## 05 — Loja / Shop
**Objetivo:** Navegar e escolher produtos consumíveis (beads/mídia de moagem).
**Role:** Admin, Buyer, **Technician (vê, mas sem carrinho)** · Approver **não acessa**.
**Entrada:** nav "Shop".
**Telas (9):** `shop` · `shop-product-detail` · `shop-product-glassbeads` · `shop-product-steelbeads-micro` · `shop-product-steelbeads-q` · `shop-product-zetabeads-nano` · `shop-product-zetabeads-plus` · `shop-product-zs-beads` · `wishlist`
**Caminho principal:** `shop` → `shop-product-<tipo>` → adicionar ao carrinho → **06 Checkout**.
**Ramais:** coração → `wishlist` → mover pro carrinho.
**Estados / edge cases:** loja/wishlist vazias (empty) · seleção de tamanho/quantidade no produto · Approver e Technician têm o ícone de carrinho oculto.
**Saída:** → **06 Checkout**.

---

## 06 — Carrinho & Checkout
**Objetivo:** Levar os itens do carrinho até a confirmação do pedido.
**Role:** Admin, Buyer. (Approver e Technician são **bloqueados** → redirecionam pro dashboard.)
**Entrada:** `shop`/`wishlist` → ícone do carrinho.
**Telas (6):** `checkout-cart` · `checkout` · `checkout-order-details` · `checkout-review` · `checkout-quote` · `checkout-confirmation`
**Caminho principal:** `checkout-cart` → `checkout` → `checkout-order-details` → `checkout-review` → `checkout-confirmation`.
**Ramais:** pedir cotação em vez de comprar → `checkout-quote` (→ **08 Quotes**).
**Estados / edge cases:** carrinho vazio · **alerta de Budget estourado** (fluxo 10) · shipment parcial · falha de pagamento.
**Saída:** `checkout-confirmation` → **07 Orders**.

---

## 07 — Pedidos / Orders
**Objetivo:** Acompanhar pedidos e (por role) aprová-los.
**Role:** Todos — **com variações fortes por perfil**:
- **Technician:** menu vira **"Requests"** (foco em solicitações de serviço, não compras).
- **Buyer:** vê o status de aprovação dos próprios pedidos (drawer de aprovação).
- **Approver:** sub-fluxo de **aprovação de pedidos** (aprovar/rejeitar com nota).
**Entrada:** nav "Orders" / "Requests".
**Telas (2):** `orders` · `order-detail`
**Caminho principal:** `orders` → `order-detail` → (Track / Reorder / Download).
**Ramais:** **Aprovação** (Approver/Buyer): `orders`/`order-detail` → aprovar → notifica solicitante.
**Estados / edge cases:** sem pedidos (empty) · skeleton · timeline de rastreio · shipment parcial.
**Saída:** → **04 Máquinas** (reorder) · **12 Suporte**.

---

## 08 — Cotações / Quotes
**Objetivo:** Consultar e acompanhar cotações solicitadas.
**Role:** Admin, Buyer, Approver. (Technician **bloqueado** — menu oculto.)
**Entrada:** nav "Quotes" · vindo de `checkout-quote` (**06**).
**Telas (2):** `quotes` · `quote-detail`
**Caminho principal:** `quotes` → `quote-detail` → (aceitar → vira pedido / **07 Orders**).
**Estados / edge cases:** sem cotações (empty) · cotação expirada · exportação PDF/CSV (backlog).
**Saída:** → **07 Orders** (cotação aceita).

---

## 09 — Serviços & Contratos
**Objetivo:** Abrir solicitações de serviço, ver contratos e testes de laboratório.
**Role:** **Heterogêneo** — acesso difere por sub-área:
- `services` / `service-request`: **Todos** (jornada principal do **Technician**).
- `contracts` / `contract-*-detail`: **só Admin** (Buyer, Approver, Technician bloqueados).
- `lab-tests`: **Admin e Technician** (Buyer e Approver bloqueados/menu oculto).
**Entrada:** nav "Services".
**Telas (7):** `services` · `service-request` · `service-request-submitted` · `contracts` · `contract-parts-detail` · `contract-service-detail` · `lab-tests`
**Caminho principal:**
- **Serviço:** `services` → `service-request` → `service-request-submitted`.
- **Contratos:** `contracts` → `contract-parts-detail` / `contract-service-detail`.
- **Lab:** `lab-tests` (lista + detalhe em drawer).
**Estados / edge cases:** validação do form de Service Request · empty states · técnico atribuído (Technician).
**Saída:** → **03 Dashboard** · **12 Suporte**.

---

## 10 — Orçamento / Budget 🔒
**Objetivo:** Acompanhar limite e consumo de orçamento da conta.
**Role:** **Só Buyer.** (Admin, Approver e Technician são bloqueados → dashboard.)
**Entrada:** nav "Budget" · card no dashboard do Buyer.
**Telas (1):** `budget`
**Caminho principal:** `budget` (limite, consumo, histórico).
**Ramais:** **alerta de budget** aparece no checkout (**06**) quando o pedido excede o limite.
**Estados / edge cases:** orçamento estourado · próximo do limite.
**Saída:** → **06 Checkout** (impacta a compra).

---

## 11 — Admin 🔒
**Objetivo:** Administrar a conta corporativa (usuários, papéis, empresa, solicitações).
**Role:** **Só Admin.** (Todos os outros perfis são bloqueados.)
**Entrada:** nav "Admin" · link no dropdown de perfil (só Admin).
**Telas (5):** `admin-users` · `admin-roles` · `admin-company` · `admin-requests` · `admin-notifications`
**Caminho principal:** `admin-users` → `admin-roles` (gestão de usuários e papéis).
**Ramais:** `admin-company` (dados da empresa) · `admin-requests` (solicitações de acesso) · `admin-notifications` (avisos administrativos).
**Estados / edge cases:** modais de criar/editar usuário · empty states · aprovação de solicitações.
**Saída:** → **03 Dashboard**.

---

## 12 — Suporte & Ajuda
**Objetivo:** Tirar dúvidas e abrir chamados de suporte.
**Role:** Todos.
**Entrada:** header "Help" / link no dropdown de perfil.
**Telas (2):** `help` · `contact-support`
**Caminho principal:** `help` (FAQ/central) → `contact-support` (form de ticket).
**Estados / edge cases:** validação do form de ticket · anexos · empty (sem resultados na busca de ajuda).
**Saída:** ticket enviado → **03 Dashboard**.

---

## Matriz — Fluxo × Role
Baseada em `assets/role-guard.js` (bloqueios e menus reais).
✓ = acessa · ~ = acessa com variação por perfil · — = bloqueado/oculto.

| # | Fluxo               | Admin | Buyer | Approver | Technician |
|---|---------------------|:-----:|:-----:|:--------:|:----------:|
| 03 | Dashboard          | ~     | ~     | ~        | ~          |
| 04 | Máquinas & Peças   | ✓     | ✓     | ✓        | ✓          |
| 05 | Loja / Shop        | ✓     | ✓     | —        | ~ (sem carrinho) |
| 06 | Carrinho & Checkout| ✓     | ✓     | —        | —          |
| 07 | Pedidos / Orders   | ✓     | ~ (aprovação) | ~ (aprova) | ~ ("Requests") |
| 08 | Cotações / Quotes  | ✓     | ✓     | ✓        | —          |
| 09a | Services / SR      | ✓     | ✓     | ✓        | ~ (jornada principal) |
| 09b | Contratos         | ✓     | —     | —        | —          |
| 09c | Lab Tests         | ✓     | —     | —        | ✓          |
| 10 | Orçamento / Budget | —     | ✓     | —        | —          |
| 11 | Admin              | ✓     | —     | —        | —          |
| 12 | Suporte & Ajuda    | ✓     | ✓     | ✓        | ✓          |

**Resumo dos ajustes de navegação por role:**
- **Admin:** tudo, **exceto Budget**.
- **Buyer:** sem Lab Tests, sem Contratos. Tem Budget e Checkout.
- **Approver:** sem Shop, sem Checkout, sem Budget, sem Lab Tests, sem Contratos, sem carrinho. Foco em **aprovar pedidos**.
- **Technician:** Orders vira **"Requests"**, sem Quotes, sem Checkout, sem carrinho. Foco em **Service Requests** e **Lab Tests**.

---

## Elementos transversais (valem em vários fluxos)
- **Milla (IA):** assistente do portal. "Ask Milla" a partir das máquinas abre a busca de spare parts (**04**).
- **Header / navegação global:** logo (→ Dashboard), nav tabs (por role), busca, carrinho (quando aplicável), sino de notificações, avatar/perfil.
- **Notificações:** badge no sino + página `notifications` (**03**).
- **i18n:** todo o portal é bilíngue **EN/DE**.
- **Estados sistêmicos:** empty states, skeleton loading, validação de formulários, responsividade (hamburger no mobile) — aplicados de forma consistente em todos os fluxos.
