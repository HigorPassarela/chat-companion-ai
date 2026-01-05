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
  ![Configurações](./src/hooks/useSettings.ts)

- Chat com arquivo anexado
  ![File preview](./src/hooks/useChat.ts)

---

## ✅ Pré-requisitos

- Node.js >= 16
- npm / pnpm / yarn
- Conta no [Supabase](https://supabase.com) (projeto criado)

---

## ⚙️ Instalação

1. Clone o repositório:
   ```bash
    git clone https://github.com/<seu-usuario>/chat-companion.git
    cd ollamacode
    code .
   ```

2. Instale as dependências:
   ```bash
    npm install
    # ou
    pnpm install
    # ou
    yarn
   ```

3. Crie o arquivo de ambiente .env.local:
   ```.env
    VITE_SUPABASE_URL=https://<SEU_PROJECT_ID>.supabase.co
    VITE_SUPABASE_ANON_KEY=<SUA_ANON_PUBLIC_KEY>

    SUPABASE_URL= https://<SEU_PROJECT_ID>.supabase.co
    SUPABASE_ANON_KEY= <SUA_ANON_PUBLIC_KEY>

    # Opcional: backend local
    VITE_BACKEND_URL=http://localhost:5000
   ```

## 🗄️ Supabase — Configuração (Banco e Storage)

1. Tabelas (SQL)
   Execute no SQL Editor do Supabase
   ```sql
    CREATE TABLE IF NOT EXISTS conversations (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Nova Conversa',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id BIGSERIAL PRIMARY KEY,
      conversation_id BIGINT REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user','assistant')),
      content TEXT,
      timestamp BIGINT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS files (
      id BIGSERIAL PRIMARY KEY,
      message_id BIGINT REFERENCES messages(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      file_type TEXT,
      file_size BIGINT,
      file_content TEXT,
      file_url TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(updated_at DESC);
   ```

2. Storage
  - Crie um bucket chamado (`chat-files`).
  - Para desenvolvimento, pode ser público. Em produção, criar políticas RLS apropriadas.

---

## 🧭 Como rodar em desenvolvimento
Frontend:
```bash
  npm run dev
  # ou pnpm dev / yarn dev
```

Abra (`http://localhost:3000`) (ou a porta indicada pelo Vite).

Se usar backend local (opcional), rode-o em (`VITE_BACKEND_URL`) (por exemplo 
(`http://localhost:5000`)).