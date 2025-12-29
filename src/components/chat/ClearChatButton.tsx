import { Trash2 } from "lucide-react";
import { useState } from "react";

interface ClearChatButtonProps {
  onClear: () => void;
  disabled?: boolean;
}

export const ClearChatButton = ({ onClear, disabled }: ClearChatButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = () => {
    if (showConfirm) {
      onClear();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
      // Auto-cancelar após 3 segundos
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-medium transition-all
        flex items-center gap-2
        ${showConfirm 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
      title={showConfirm ? "Clique novamente para confirmar" : "Limpar conversa"}
    >
      <Trash2 className="w-4 h-4" />
      <span>{showConfirm ? "Confirmar exclusão?" : "Limpar"}</span>
    </button>
  );
};