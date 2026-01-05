# OllamaCode - Chat Companion

<p align="center">
  <img src="./public/llama.svg" alt="OllamaCode" width="96" />
</p>

**Chat com múltiplas conversas, upload/preview de arquivos, Markdown com destaque de código e painel de
configurações.**

<p align="center">
  <a href="#destaques">Destaques</a> •
  <a href="#instalacao">Instalação</a> •
  <a href="#supabase">Supabase</a> •
  <a href="#configuracoes">Configurações</a> •
  <a href="#debug">Debug</a> •
  <a href="#contribuicao">Contribuição</a>
</p>

---

## 🎯 Destaques

- Multi-conversas com agrupamento por data na sidebar.
- Upload para bucket Supabase (`chat-files`) com preview, download e visualização de `.txt`.
- Renderização Markdown (GFM) com syntax highlighting (highlighting.js).
- Painel de configurações: tema (dark/light/auto), cor primária, tamanho da fonte, preferências de chat/IA.
- Auto-rename de conversa com base na primeira mensagem.
- Layout responsivo com Tailwind CSS.

---

## 📸 Screenshots (substitua com seus próprios)
- Configurações
  ![Configurações](./public/docs/settings.png)

- Chat com arquivo anexado
  ![File preview](./public/docs/file-preview.png)

---

## ✅ Pré-requisitos

- Node.js >= 16
- npm / pnpm / yarn
- Conta no [Supabase](https://supabase.com) (projeto criado)

---

## ⚙️ Instalação

1. Clone o repositório:
   ```
    git clone https://github/<seu-usuario>/ollamacode.git
    cd ollamacode
    code .
   ```