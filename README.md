<p align="center">
  <img src="./public/llama.svg" alt="OllamaCode" width="96" />
</p>

<h1 align="center">OllamaCode — Chat Companion</h1>

<p align="center">
  Chat com múltiplas conversas, upload/preview de arquivos, Markdown com destaque de código e painel de configurações (tema, cores, preferências).
</p>

<p align="center">
  <a href="#destaques">Destaques</a> •
  <a href="#instalacao">Instalação</a> •
  <a href="#configuracao-supabase">Supabase</a> •
  <a href="#configuracoes">Configurações</a> •
  <a href="#debug">Debug</a> •
  <a href="#contribuicao">Contribuição</a>
</p>

---

## 🎯 Destaques

- Multi-conversas com agrupamento por data na sidebar
- Upload para bucket Supabase (`chat-files`) com preview/download/visualização de `.txt`
- Renderização de Markdown (GFM) com syntax highlighting (highlight.js)
- Painel de configurações: tema (light/dark/auto), cor primária, fonte, preferências de chat/IA
- Auto-rename de conversa baseado na primeira pergunta
- Layout responsivo com Tailwind CSS

---

## 🖼️ Visual (substitua pelos seus screenshots)
- Configurações (Appearance) — coloque em `/public/docs/settings.png`
  ![Configurações](./public/docs/settings.png)

- Chat com arquivo anexado — coloque em `/public/docs/file-preview.png`
  ![File preview](./public/docs/file-preview.png)

---

## 🚀 Instalação (rápido)

Requisitos:
- Node.js >= 16
- npm / pnpm / yarn
- Conta no Supabase

Passos:
```bash
# clonar
git clone https://github.com/<seu-usuario>/ollamacode.git
cd ollamacode

# instalar deps
npm install
# ou pnpm install

# rodar dev
npm run dev
