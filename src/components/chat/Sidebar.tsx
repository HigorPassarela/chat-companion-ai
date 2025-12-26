import { useState } from "react";
import { Trash2, Edit2, Check, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number) => void;
  onRenameConversation: (id: number, newTitle: string) => void;
  loading: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  loading,
  isOpen,
  onClose,
}: SidebarProps) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Agrupar conversas por data
  const groupConversationsByDate = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const groups: {
      [key: string]: Conversation[];
    } = {
      Hoje: [],
      Ontem: [],
      "Últimos 7 dias": [],
      "Últimos 30 dias": [],
      Anteriores: [],
    };

    conversations.forEach((conv) => {
      const convDate = new Date(conv.updated_at);
      const convDateOnly = new Date(
        convDate.getFullYear(),
        convDate.getMonth(),
        convDate.getDate()
      );

      if (convDateOnly.getTime() === today.getTime()) {
        groups["Hoje"].push(conv);
      } else if (convDateOnly.getTime() === yesterday.getTime()) {
        groups["Ontem"].push(conv);
      } else if (convDate >= lastWeek) {
        groups["Últimos 7 dias"].push(conv);
      } else if (convDate >= lastMonth) {
        groups["Últimos 30 dias"].push(conv);
      } else {
        groups["Anteriores"].push(conv);
      }
    });

    // Remover grupos vazios
    return Object.entries(groups).filter(([_, convs]) => convs.length > 0);
  };

  const handleStartEdit = (id: number, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameConversation(editingId, editTitle.trim());
      setEditingId(null);
      setEditTitle("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar esta conversa?")) {
      onDeleteConversation(id);
    }
  };

  const groupedConversations = groupConversationsByDate();

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // 👇 CORREÇÃO: Remover lg:static para permitir esconder em todas as telas
          "fixed inset-y-0 left-0 z-50",
          "w-[260px] bg-sidebar border-r border-sidebar-border",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          // 👇 CORREÇÃO: Aplicar translate em todas as telas
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header - Botão New Chat */}
        <div className="p-3 border-b border-sidebar-border">
          <button
            onClick={onNewConversation}
            disabled={loading}
            className={cn(
              "w-full px-4 py-3 rounded-lg",
              "bg-transparent border border-sidebar-border",
              "text-sm text-sidebar-foreground font-medium",
              "flex items-center gap-3",
              "hover:bg-sidebar-accent transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "active:scale-[0.98]"
            )}
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Lista de conversas com scroll */}
        <div className="flex-1 overflow-y-auto px-2 py-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : groupedConversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-muted-foreground">
                Nenhuma conversa ainda
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Clique em "New Chat" para começar
              </p>
            </div>
          ) : (
            groupedConversations.map(([groupName, convs]) => (
              <div key={groupName} className="mb-4">
                {/* Título do grupo */}
                <div className="px-3 py-2">
                  <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {groupName}
                  </h3>
                </div>

                {/* Conversas do grupo */}
                <div className="space-y-1">
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      className={cn(
                        "group relative rounded-lg transition-all duration-200",
                        currentConversationId === conv.id
                          ? "bg-sidebar-accent"
                          : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      {editingId === conv.id ? (
                        // Modo de edição
                        <div className="flex items-center gap-2 px-3 py-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="flex-1 bg-background text-sm text-foreground px-2 py-1 rounded border border-sidebar-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                          >
                            <Check className="w-4 h-4 text-green-500" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 hover:bg-sidebar-accent rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </button>
                        </div>
                      ) : (
                        // Modo normal
                        <div className="flex items-center">
                          <button
                            onClick={() => onSelectConversation(conv.id)}
                            className="flex-1 px-3 py-2.5 text-left flex items-center gap-3 min-w-0"
                          >
                            <span className="text-base flex-shrink-0">💬</span>
                            <span className="text-sm text-sidebar-foreground truncate">
                              {conv.title}
                            </span>
                          </button>

                          {/* Menu de ações (aparece no hover) */}
                          <div
                            className={cn(
                              "flex items-center gap-1 pr-2",
                              "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            )}
                          >
                            <button
                              onClick={() =>
                                handleStartEdit(conv.id, conv.title)
                              }
                              className="p-1.5 hover:bg-background rounded transition-colors"
                              title="Renomear"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button
                              onClick={() => handleDelete(conv.id)}
                              className="p-1.5 hover:bg-background rounded transition-colors"
                              title="Deletar"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-destructive/70 hover:text-destructive" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-3 space-y-2">
          {/* Botão Upgrade */}
          <button className="w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-between group">
            <span>Upgrade to Plus</span>
            <span className="bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold group-hover:scale-110 transition-transform">
              NEW
            </span>
          </button>

          {/* User info */}
          <div className="px-4 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors flex items-center gap-3 cursor-pointer">
            <span className="text-base">👤</span>
            <span className="text-sm text-sidebar-foreground truncate">
              Usuário
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};