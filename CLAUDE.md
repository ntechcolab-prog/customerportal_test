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
