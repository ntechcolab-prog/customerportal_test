# NETZSCH Customer Portal

## Sobre o projeto
Recriação do NETZSCH Customer Portal em HTML/CSS puro, tela por tela a partir do Figma.

## Stack
- HTML + CSS puro (sem frameworks)
- Um arquivo por tela dentro de /pages
- Assets de imagem em /assets

## Como adicionar uma nova tela
1. No Claude.ai (claude.ai), abrir conversa com Figma MCP conectado
2. Selecionar a tela no Figma
3. Pedir: "recria essa tela em HTML"
4. Salvar o arquivo gerado em /pages/nome-da-tela.html

## Como fazer push no GitHub
Após criar ou editar qualquer arquivo, dizer ao Claude Code:
"faz push no git com a mensagem: [descrição do que mudou]"

O Claude Code irá executar:
git add .
git commit -m "mensagem"
git push

## Telas do projeto
- [x] home.html - Landing page (Home)
- [ ] login.html - Tela de login
- [ ] register.html - Tela de cadastro
- [ ] dashboard.html - Dashboard principal

## Convenções
- Nomes de arquivo em lowercase com hífens
- Cada tela é um arquivo HTML independente e completo
- Cores principais: #007167 (verde escuro), #0b9c92 (verde médio)

## Design Context

### Users
Compradores **B2B / procurement** corporativos da divisão NETZSCH G&D. Trabalham com pedidos, cotações, gestão de máquinas/peças e contratos. Contexto típico: escritório, sessões focadas e recorrentes, precisam **encontrar informação técnica precisa rapidamente** e confiar nos dados. Ferramenta de trabalho recorrente, não uso casual.

### Brand Personality
**Engenharia alemã: precisa, durável, confiável.** Interface deve transmitir **confiança industrial sólida** — séria, técnica, eficiente. Pouco ornamento, muito conteúdo. Tom respeitoso, direto, profissional. Sem cordialidade artificial nem empolgação forçada.

### Aesthetic Direction
- **Tema:** Light mode apenas (fidelidade 1:1 ao Figma read-only `5mKLIiMayratJcPbmFJMZl`).
- **Paleta:** Verdes NETZSCH (`#007167`, `#0b9c92`) sobre neutros sóbrios (`#3d4246`, `#5c5f62`, `#8b8e91`, `#d7d9db`, `#eaeaea`, branco). Sem cores acessórias vibrantes.
- **Tipografia:** Inter, hierarquia clara, pesos intencionais, sem decoração.
- **Layout:** Densidade controlada, espaçamento generoso onde ajuda leitura, alinhamento rígido.
- **NUNCA parecer:** SaaS genérico (gradientes neon, mascotes), ERP anos 2000 (densidade extrema sem hierarquia), e-commerce de varejo (banners promocionais, badges urgentes), playful/colorido (paletas vibrantes, animações bouncy).

### Accessibility
**WCAG AAA** como meta (cliente alemão, possível exigência EU/EAA). Em todas as telas:
- Contraste ≥ 7:1 (texto normal) / ≥ 4.5:1 (texto grande)
- Foco visível e navegação completa por teclado
- Labels explícitos e erros via `aria-describedby`
- `alt` significativo; ícones decorativos com `aria-hidden`
- Semântica correta (`<header>`, `<nav>`, `<main>`, headings ordenados)
- Respeitar `prefers-reduced-motion` em todas as animações
- Áreas clicáveis ≥ 44×44px

### Design Principles
1. **Precisão antes de delight.** Toda decisão serve à clareza da informação.
2. **Sobriedade industrial.** Verdes NETZSCH e neutros. Zero cor decorativa. Em dúvida: menos.
3. **Hierarquia tipográfica forte.** Inter carrega quase toda a hierarquia — não dependa de cor ou ornamento.
4. **AAA é requisito, não bônus.** Sem contraste/teclado/semântica/reduced-motion não é "pronto".
5. **Fidelidade ao Figma.** Implementar 1:1 sem reinterpretar. Em ambiguidade, escolher o mais sóbrio e mais acessível.
