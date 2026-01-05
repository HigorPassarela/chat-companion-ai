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
    git clone https://github.com/<seu-usuario>/chat-companion.git chat-companion-ai
    cd chat-companion-ai
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
  
  - Crie um bucket chamado `chat-files`.
  - Para desenvolvimento, pode ser público. Em produção, criar políticas RLS apropriadas.

---

## 🧭 Como rodar em desenvolvimento
Frontend:
```bash
  npm run dev
  # ou pnpm dev / yarn dev
```

Abra (`http://localhost:3000`) (ou a porta indicada pelo Vite).

Se usar backend local (opcional), rode-o em `VITE_BACKEND_URL` (por exemplo 
`http://localhost:5000`).

---

## 📁 Estrutura principal do projeto (resumida)
```css
  src/
  components/
    chat/
      Sidebar.tsx
      ChatHeader.tsx
      ChatMessage.tsx
      ChatInput.tsx
      FileAttachment.tsx
    settings/
      SettingsModal.tsx
  hooks/
    useChat.ts
    useConversations.ts
    useSettings.ts
    useDarkMode.ts
  lib/
    supabase.ts
    color.ts
  pages/
    index.tsx
  styles/
    index.css
public/
  llama.svg
```

---

## 🔌 Principais hooks e responsabilidades

- `useConversations` -- lista e gerencia conversas (create/update/delete).
- `useChat` -- envia mensagens, salva no Supabase, faz upload de arquivos, processa
streaming de resposta.
- `useSettings` -- armazena preferências (localStorage) e expõe update/export/import/reset.
- `useDarkMode` -- aplica `html` classes (`dark`/`light`/`auto`) e persiste a escolha.

---

## 🎨 Configurações (Settings) — como o tema é aplicado

- Ao alterar o tema no modal, o app chama `useDarkMode.setTheme(...)` para aplicar
imediatamente.
- Cores primárias (HEX) são convertidas para HSL e aplicadas às CSS variables do `:root` (ex.:
`--primary`).
- `tailwind.config.ts` está configurado com `darkMode: ['class']` para usar classes `dark`/`light`.

---

## 📝 Markdown & Syntax Highlight
Renderizamos Markdown com:

- `react-markdown`
- `remark-gfm`
- `rehype-raw` + `rehype-sanitize` (para segurança)
- `rehype-highlight` (highlight.js)

Instalação (caso ainda não tenha):
```bash
  npm install react-markdown remark-gfm rehype-raw rehype-sanitize rehype-highlight highlight.js
```

No componente `ChatMessage` importamos um tema do highlight.js, por exemplo:
```ts
  import 'highlight.js/styles/github-dark.css';
```

---

## 🛠️ Debug & Troubleshooting

- ## Tema não muda:
  - Verifique se `useDarkMode` está inicializando no root (Index) e que o `<html>` tem class `dark` ou `light`.
  - `tailwind.config.ts` deve ter `darkMode: ['class']`.
- ## Upload: Bucket not found:
  - Verifique se o bucket `chat-files` existe no Supabase Storage.
- ## Erros 401/403 no Supabase:
  - Confira `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- ## Markdown / Highlight não aparecem:
  - Verifique instalação de `rehype-highlight` e import do CSS do highlight.js.

---

## 🔒 Boas práticas de segurança

- Não colocar `service_role` key no frontend.
- Usar `rehype-sanitize` quando aceitam HTML vindo da IA.
- Implementar políticas RLS quando houver autenticação por usuário.
- Limitar tipos e tamanhos de arquivos no upload.

---

## ♻️ Export / Import de configurações

- O modal de configurações permite exportar (`.json`) e importar preferências do usuário (backup/restore).

---

## 🤝 Contribuição

1. Fork -> branch feature -> PR.
2. Use commits claros e descritivos.
3. Atualize README quando adicionar funcionalidades relevantes.

---

## 📜 License

MIT © Higor Passarela

---
