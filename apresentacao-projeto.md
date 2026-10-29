# NETZSCH G&D Customer Portal — Apresentação do Projeto

## O que é

Protótipo navegável do **NETZSCH Grinding & Dispersing Customer Portal** — um portal B2B para compradores corporativos da divisão G&D da NETZSCH.

O projeto é uma recriação fiel do design original (Figma read-only) em **HTML + CSS puro**, com deploy automático na Vercel. Cada push no GitHub atualiza a URL em tempo real.

**URL de acesso:** deploy na Vercel (pedir link atualizado à equipe)

---

## Por que existe

- O Figma original é **read-only** — não permite navegar entre telas, testar fluxos ou demonstrar para stakeholders
- O protótipo permite **clicar e navegar** como se fosse o produto real, sem precisar de backend
- Serve como **referência visual e funcional** para o time de desenvolvimento implementar
- Permite **validação com stakeholders** em tempo real — qualquer ajuste é visível na URL em minutos

---

## Números do projeto

| Métrica | Valor |
|---|---|
| Páginas implementadas | **67 telas** |
| Commits | **313+** |
| Fluxos completos | **15** |
| Perfis de usuário | **4** (Admin, Buyer, Approver, Technician) |
| Início do projeto | Março 2026 |
| Deploy | Automático via Vercel |

---

## Fluxos implementados

### Autenticação (9 telas)
Login, SSO (corporativo + domínio), esqueci senha, reset password, verificação de código

### Registro (14 telas)
Informações da conta, detalhes da empresa, endereço, localização, verificação de email, confirmação

### Dashboard (1 tela, 4 variações por role)
Visão geral com stat cards, AI Insights (Milla), Quick Actions, Recent Orders, Contracts Expiring

### Machines (7 telas)
Lista com grid/table view, filtros funcionais, detalhe de 5 máquinas (Discus 30, Zeta 60, MasterMix 45, Alpha Zeta 10, ProPhi), subconjuntos, busca de spare parts

### Shop (8 telas)
Catálogo com grid/table view, filtros por categoria, 6 páginas de produto (Cerabeads, Zetabeads Nano, Steelbeads Micro, ZS Beads, Steelbeads Q, ZetaBeads Plus, Glassbeads)

### Checkout (6 telas)
Carrinho, revisão, dados do pedido, confirmação, fluxo de quote, carrinho persistente via localStorage

### Orders (2 telas)
Lista com filtros funcionais (busca + status), detalhe do pedido com tracking drawer

### Quotes (2 telas)
Lista com filtros funcionais, detalhe da cotação

### Services (3 telas)
Lista com filtros (busca + status + tipo), formulário de service request, confirmação

### Contracts (3 telas)
Lista com filtros (tipo + status + busca), detalhe de Parts Contract (preços reais NETZSCH), detalhe de Service Contract (manutenção preventiva com timeline de visitas)

### Lab Tests (1 tela)
Lista com filtros (status + máquina + busca), drawer de detalhes

### Budget (1 tela)
Dashboard financeiro com gráficos e tabela de gastos por categoria, seletor de período

### Notifications (1 tela)
Lista com tabs por categoria (Approvals, Orders, Quotes, Services, Contracts), empty states

### Admin (5 telas)
Users (tabela com busca), Requests (tabela com busca), Roles (cards + tabela de permissões), Company Settings (seções expansíveis), Notifications (configuração por tipo)

### Outros
Help, Profile (dropdown), Wishlist (grid + table), Production Monitoring (upsell ProPhi)

---

## Sistema de perfis (Roles)

O protótipo simula 4 perfis de usuário com permissões distintas, selecionáveis via dropdown no login:

| Role | Menu visível | Acesso principal |
|---|---|---|
| **Administrator** | Tudo | CRUD completo |
| **Buyer** | Tudo exceto Admin | Cria orders, vê preços, shop, checkout |
| **Approver** | Sem Shop, sem Admin | Aprova/rejeita orders |
| **Technician** | Sem Shop, Quotes, Admin, carrinho | Services, Cases, Products (leitura) |

A troca de perfil é feita via `localStorage` e o script `role-guard.js` controla a navegação em todas as páginas.

---

## Stack técnica

| Item | Detalhe |
|---|---|
| Frontend | HTML + CSS puro (sem frameworks) |
| JavaScript | Vanilla JS (filtros, drawers, localStorage) |
| Estrutura | Um arquivo `.html` independente por tela em `/pages/` |
| Assets | Imagens e ícones em `/assets/` |
| Versionamento | Git + GitHub (`ntechcolab-prog/customerportal_test`) |
| Deploy | Vercel (automático a cada push no `main`) |
| Design source | Figma read-only via MCP |
| Acessibilidade | Meta WCAG AAA |

---

## Roteiro sugerido para demo (~10 min)

### Ato 1 — Visão geral (3 min)
1. Abrir o **login** → mostrar dropdown de roles → entrar como **Admin**
2. **Dashboard** → stat cards, AI Insights, Milla, Recent Orders
3. Mostrar a **navegação** completa no header

### Ato 2 — Fluxo principal (4 min)
4. **Machines** → clicar numa máquina → ver spare parts
5. **Shop** → produto → adicionar ao carrinho → **Checkout** → confirmação
6. **Orders** → abrir filtros → buscar → ver detalhe + tracking drawer
7. **Contracts** → detalhe de Parts (preços reais) vs Service (timeline de visitas)

### Ato 3 — Diferenciais (3 min)
8. Voltar ao **login** → trocar pra **Technician** → mostrar como o menu muda e páginas são bloqueadas
9. **Notifications** → tabs por categoria → empty state
10. **Admin** → Users, Roles (tabela de permissões), Company Settings
11. Mostrar **filtros com empty states** (digitar algo que não existe)

---

## Dados realistas

O protótipo usa dados baseados em documentos reais fornecidos pela NETZSCH:

- **Contratos de peças:** ~90 itens com preços negociados (desconto 8%), condições comerciais, vigência 12 meses
- **Contrato de manutenção preventiva:** 45+ pontos de inspeção, cronograma de visitas, valores hora, renovação automática
- **Máquinas:** modelos reais (Discus, Zeta, MasterMix, Alpha Zeta, ProPhi)
- **Produtos:** grinding beads reais do catálogo NETZSCH
- **Contatos:** account managers reais

---

## Backlog de melhorias

| Prioridade | Feature | Status |
|---|---|---|
| Alta | Empty states + validação | Feito |
| Alta | Responsividade (tablet) | Pendente |
| Média | Exportação PDF/CSV | Pendente |
| Média | Messaging/Chat | Pendente |
| Média | Multi-idioma | Pendente |
| Baixa | Onboarding tour | Pendente |
| Baixa | Comparação de produtos | Pendente |

---

## Contato

**Projeto:** techco.lab (ntechcolab)
**Repositório:** github.com/ntechcolab-prog/customerportal_test
