import React, { useState } from 'react';
import { FileText, Download, Eye, EyeOff, ExternalLink, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileAttachmentProps {
  filename: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  fileContent?: string;
  className?: string;
}

export const FileAttachment = ({
  filename,
  fileType,
  fileSize,
  fileUrl,
  fileContent,
  className
}: FileAttachmentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Verificar se é arquivo de texto
  const isTextFile = () => {
    const textExtensions = ['txt', 'csv', 'json', 'py', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'md', 'xml', 'yml', 'yaml'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension && textExtensions.includes(extension);
  };

  // Verificar se é imagem
  const isImageFile = () => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    const extension = filename.split('.').pop()?.toLowerCase();
    return extension && imageExtensions.includes(extension);
  };

  // Obter ícone do arquivo
  const getFileIcon = () => {
    if (isImageFile()) {
      return <Image className="w-4 h-4" />;
    }
    if (isTextFile()) {
      return <FileText className="w-4 h-4" />;
    }
    return <File className="w-4 h-4" />;
  };

  // Obter cor baseada no tipo
  const getFileColor = () => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'json': return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'py': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      case 'js': case 'jsx': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'ts': case 'tsx': return 'text-blue-500 border-blue-500/30 bg-blue-500/10';
      case 'html': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'css': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'md': return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'webp': 
        return 'text-pink-400 border-pink-400/30 bg-pink-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  // Download do arquivo
  const handleDownload = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Abrir em nova aba
  const handleOpenExternal = () => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className={cn("border rounded-lg p-3 max-w-sm", getFileColor(), className)}>
      {/* Header do arquivo */}
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" title={filename}>
            {filename}
          </p>
          <p className="text-xs opacity-70">
            {formatFileSize(fileSize)} • {fileType || 'Arquivo'}
          </p>
        </div>
      </div>

      {/* Preview para imagens */}
      {isImageFile() && (
        <div className="mb-2">
          <img 
            src={fileUrl} 
            alt={filename}
            className="w-full max-h-32 object-cover rounded border border-current/20"
          />
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <button
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors disabled:opacity-50"
          title="Baixar arquivo"
        >
          <Download className="w-3 h-3" />
          {isLoading ? 'Baixando...' : 'Baixar'}
        </button>

        <button
          onClick={handleOpenExternal}
          className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
          title="Abrir em nova aba"
        >
          <ExternalLink className="w-3 h-3" />
          Abrir
        </button>

        {isTextFile() && fileContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Ocultar conteúdo' : 'Ver conteúdo'}
          >
            {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {isExpanded ? 'Ocultar' : 'Ver'}
          </button>
        )}
      </div>

      {/* Conteúdo expandido */}
      {isExpanded && isTextFile() && fileContent && (
        <div className="border-t border-current/20 pt-2 mt-2">
          <div className="bg-black/20 rounded p-2 max-h-40 overflow-y-auto">
            <pre className="text-xs whitespace-pre-wrap font-mono text-current/90">
              {fileContent}
            </pre>
          </div>
        </div>
      )}

      {/* Preview para arquivos pequenos */}
      {!isExpanded && isTextFile() && fileContent && fileContent.length < 100 && (
        <div className="text-xs opacity-70 bg-black/10 rounded p-2 mt-2">
          <p className="truncate">
            {fileContent.split('\n')[0]}...
          </p>
        </div>
      )}
    </div>
  );
};