# OllamaCode — Chat Companion

<p align="center">
  <img src="./public/llama.svg" alt="OllamaCode" width="96" />
</p>

<h3 align="center">Chat com múltiplas conversas, upload/preview de arquivos, Markdown com destaque de código e painel de configurações</h3>

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

- Multi-conversas com agrupamento por data na sidebar
- Upload para bucket Supabase (`chat-files`) com preview/download/visualização de `.txt`
- Renderização Markdown (GFM) com syntax highlighting (highlight.js)
- Painel de configurações (tema light/dark/auto, cor primária, tamanho de fonte, preferências de chat/IA)
- Auto-rename de conversa com base na primeira mensagem
- Layout responsivo com Tailwind CSS

---

## 📸 Screenshots (substitua imagens em `/public/docs/`)

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
```bash
git clone https://github.com/<seu-usuario>/ollamacode.git
cd ollamacode
Instale dependências:
bash
Copiar código
npm install
# ou
pnpm install
# ou
yarn
Crie arquivo de ambiente .env.local:
env
Copiar código
VITE_SUPABASE_URL=https://<SEU_PROJECT_ID>.supabase.co
VITE_SUPABASE_ANON_KEY=<SUA_ANON_PUBLIC_KEY>
VITE_BACKEND_URL=http://localhost:5000   # opcional, se usar backend local
🗄️ Supabase — Configuração (Banco e Storage)
1) Tabelas (SQL)
Copie e execute no SQL Editor do Supabase:

sql
Copiar código
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
2) Storage
Crie um bucket com nome chat-files.
Para desenvolvimento pode ser público. Em produção, defina políticas RLS apropriadas.
Exemplo de políticas (SQL Editor) — ajuste conforme autenticação:

sql
Copiar código
-- Exemplo: Policies podem variar conforme seu modelo de auth
-- Atenção: revise antes de aplicar em produção
🧭 Como rodar em desenvolvimento
bash
Copiar código
# frontend
npm run dev
# backend (se aplicável)
# python server ou node server conforme setup
Abra http://localhost:3000 (ou porta indicada pelo Vite).

📁 Estrutura principal do projeto
css
Copiar código
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
  docs/
    settings.png
    file-preview.png
🔌 Principais hooks e responsabilidades
useConversations — lista e gerencia conversas (create/update/delete)
useChat — envia mensagens, salva no Supabase, faz upload de arquivos, processa streaming de resposta
useSettings — armazena preferências no localStorage e fornece update/reset/export/import
useDarkMode — aplica html classes (dark / light / auto) e persiste escolha
🎨 Configurações (Settings) — como o tema é aplicado
Ao alterar o tema no modal, a UI é atualizada imediatamente chamando useDarkMode.setTheme(...).
Cores primárias (HEX) são convertidas para HSL via util e aplicadas às CSS variables do :root (ex.: --primary).
tailwind.config.ts está com darkMode: ['class'] (usamos classes dark/light no <html>).
📝 Markdown & Syntax Highlight
Renderizamos Markdown com:
react-markdown
remark-gfm
rehype-raw + rehype-sanitize (segurança)
rehype-highlight (highlight.js)
Dependências:
bash
Copiar código
npm install react-markdown remark-gfm rehype-raw rehype-sanitize rehype-highlight highlight.js
Importe o estilo do highlight em ChatMessage:
ts
Copiar código
import 'highlight.js/styles/github-dark.css';
🛠️ Debug & Troubleshooting
Tema não muda:
Verifique se useDarkMode está instalado e chamado no app root.
Confirme document.documentElement.classList tem dark ou light.
tailwind.config.ts deve ter darkMode: ['class'].
Upload: Bucket not found:
Verifique nome do bucket (chat-files) e se existe no Storage.
Erros 401/403 no Supabase:
Confira VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
Markdown / Highlight não funcionam:
Verifique instalação de rehype-highlight e import do CSS.
🧩 Boas práticas de segurança
Nunca coloque service_role no frontend.
Sanitizar HTML (usamos rehype-sanitize).
Defina políticas RLS no Supabase para proteger dados por usuário.
Defina limites de upload no cliente e no storage.
♻️ Export / Import de configurações
O modal de configurações permite exportar (.json) e importar preferências.
Isso facilita backup e sincronização manual.
🤝 Contribuição
Fork → branch feature → PR
Use commits pequenos e descritivos
Atualize README se adicionar funcionalidades
📜 License
MIT © Seu Nome

Se quiser eu:

gero badges (ci, coverage) e GIFs demonstrativos,
crio CHANGELOG.md inicial,
adapto o README com screenshots reais do seu projeto.
