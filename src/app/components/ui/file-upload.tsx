import React, { useCallback, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, File, FileText, Image as ImageIcon, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './button';
import { cn } from './utils';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  url?: string;
}

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
  maxSize?: number | null; // in MB
  acceptedTypes?: string[];
}

export function FileUpload({ 
  files, 
  onFilesChange, 
  disabled = false,
  maxSize = null,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}: FileUploadProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputId = useId();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (type === 'application/pdf') {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || disabled) return;

    const newFiles: UploadedFile[] = [];
    const maxSizeBytes = typeof maxSize === 'number' && Number.isFinite(maxSize) && maxSize > 0
      ? maxSize * 1024 * 1024
      : null;

    Array.from(fileList).forEach((file) => {
      if (maxSizeBytes !== null && file.size > maxSizeBytes) {
        toast.error(t('comptoir.fileTooLarge'));
        return;
      }

      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        toast.error(t('comptoir.invalidFileType'));
        return;
      }

      const uploadedFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        url: URL.createObjectURL(file)
      };

      newFiles.push(uploadedFile);
    });

    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
  }, [files, onFilesChange, disabled, maxSize, acceptedTypes, t]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = '';
  }, [handleFiles]);

  const handleDelete = useCallback((fileId: string) => {
    const fileToDelete = files.find((file) => file.id === fileId);
    if (fileToDelete?.url?.startsWith('blob:')) {
      URL.revokeObjectURL(fileToDelete.url);
    }

    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const handleOpen = useCallback((file: UploadedFile) => {
    if (!file.url) {
      toast.error(t('comptoir.noDocuments'));
      return;
    }

    window.open(file.url, '_blank', 'noopener,noreferrer');
  }, [t]);

  const handleDownload = useCallback((file: UploadedFile) => {
    if (!file.url) {
      toast.error(t('comptoir.noDocuments'));
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = file.url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }, [t]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-3xl border border-[#e7eef5] bg-white p-4 shadow-sm transition-colors',
          isDragOver && !disabled ? 'border-[#1E73BE] bg-[#f0f7ff]' : '',
          disabled ? 'cursor-not-allowed bg-[#f8fafc]' : ''
        )}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl',
              disabled ? 'bg-[#eef2f6] text-[#9aa8b6]' : 'bg-[#eef6ff] text-[#1E73BE]'
            )}>
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#25313d]">{t('comptoir.dragDropFiles')}</p>
              <p className="mt-1 text-xs text-[#5d7185]">
                {files.length > 0
                  ? `${files.length} document(s) ajoute(s) • ${formatFileSize(totalSize)}`
                  : t('comptoir.supportedFormats')}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              disabled={disabled}
              onClick={() => {
                const input = document.getElementById(inputId) as HTMLInputElement | null;
                input?.click();
              }}
            >
              Ajouter des documents
            </Button>
            <p className="text-xs text-[#5d7185]">PDF, JPG, PNG, DOC, DOCX</p>
          </div>
        </div>
        <input
          type="file"
          id={inputId}
          multiple
          disabled={disabled}
          onChange={handleFileInput}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />
        <div className={cn(
          'mt-3 rounded-2xl border border-dashed p-4 text-center text-sm transition-colors',
          disabled ? 'border-[#dbe6f0] bg-[#fbfdff] text-[#8a9aab]' : 'border-[#dbe6f0] bg-[#fbfdff] text-[#5d7185]'
        )}>
          {t('comptoir.supportedFormats')}
        </div>
      </div>

      {files.length > 0 ? (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[#25313d]">{t('comptoir.attachedDocuments')}</h4>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="rounded-2xl border border-[#dbe6f0] bg-[#f8fbff] p-3"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-[#5d7185]">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#25313d]">{file.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#5d7185]">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => handleOpen(file)}>
                      Ouvrir
                    </Button>
                    <Button type="button" variant="outline" className="rounded-2xl" onClick={() => handleDownload(file)}>
                      <Download className="mr-1 h-4 w-4" />
                      Telecharger
                    </Button>
                    {!disabled ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-2xl text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleDelete(file.id)}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Retirer
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#dbe6f0] bg-[#fbfdff] p-4 text-sm text-[#5d7185]">
          {t('comptoir.noDocuments')}
        </div>
      )}
    </div>
  );
}
