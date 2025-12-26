import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarToggle = ({ isOpen, onToggle }: SidebarToggleProps) => {
  return (
    <>
      {/* ===== BOTÃO MOBILE (Hamburguer) ===== */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-4 left-4 z-50",
          "p-2.5 rounded-lg",
          "bg-sidebar/95 backdrop-blur-sm",
          "hover:bg-sidebar-accent",
          "border border-sidebar-border",
          "transition-all duration-200",
          "shadow-lg hover:shadow-xl",
          "lg:hidden", // Esconde em desktop
          "active:scale-95"
        )}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
      >
        <div className="relative w-5 h-5">
          {/* Ícone Menu - Aparece quando fechado */}
          <Menu
            className={cn(
              "absolute inset-0 text-sidebar-foreground transition-all duration-200",
              isOpen 
                ? "opacity-0 rotate-90 scale-0" 
                : "opacity-100 rotate-0 scale-100"
            )}
          />
          {/* Ícone X - Aparece quando aberto */}
          <X
            className={cn(
              "absolute inset-0 text-sidebar-foreground transition-all duration-200",
              isOpen 
                ? "opacity-100 rotate-0 scale-100" 
                : "opacity-0 -rotate-90 scale-0"
            )}
          />
        </div>
      </button>

      {/* ===== BOTÃO DESKTOP (Seta) ===== */}
      <button
        onClick={onToggle}
        className={cn(
          "hidden lg:flex", // Mostra apenas em desktop
          "fixed top-4 z-50",
          "p-2.5 rounded-lg",
          "bg-sidebar/95 backdrop-blur-sm",
          "hover:bg-sidebar-accent",
          "border border-sidebar-border",
          "transition-all duration-300 ease-in-out",
          "shadow-lg hover:shadow-xl",
          "active:scale-95",
          "items-center justify-center"
        )}
        style={{
          left: isOpen ? "252px" : "16px", // 260px (sidebar) - 8px (ajuste)
        }}
        aria-label={isOpen ? "Recolher sidebar" : "Expandir sidebar"}
      >
        <div className="relative w-5 h-5">
          {/* Seta Esquerda - Quando aberto */}
          <ChevronLeft
            className={cn(
              "absolute inset-0 text-sidebar-foreground transition-all duration-300",
              isOpen 
                ? "opacity-100 rotate-0 scale-100" 
                : "opacity-0 rotate-180 scale-0"
            )}
          />
          {/* Seta Direita - Quando fechado */}
          <ChevronRight
            className={cn(
              "absolute inset-0 text-sidebar-foreground transition-all duration-300",
              isOpen 
                ? "opacity-0 -rotate-180 scale-0" 
                : "opacity-100 rotate-0 scale-100"
            )}
          />
        </div>
      </button>
    </>
  );
};