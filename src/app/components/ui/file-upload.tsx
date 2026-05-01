import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileText, File, Image as ImageIcon } from 'lucide-react';
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
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function FileUpload({ 
  files, 
  onFilesChange, 
  disabled = false,
  maxSize = 10,
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}: FileUploadProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);

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
    const maxSizeBytes = maxSize * 1024 * 1024;

    Array.from(fileList).forEach((file) => {
      // Validate file size
      if (file.size > maxSizeBytes) {
        alert(t('comptoir.fileTooLarge'));
        return;
      }

      // Validate file type
      if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        alert(t('comptoir.invalidFileType'));
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
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const handleDelete = useCallback((fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
  }, [files, onFilesChange]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragOver && !disabled ? 'border-[#1E73BE] bg-blue-50' : 'border-gray-300',
          disabled ? 'bg-[#F4F4F4] cursor-not-allowed' : 'cursor-pointer hover:border-[#1E73BE]'
        )}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          disabled={disabled}
          onChange={handleFileInput}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className={cn(
            'flex flex-col items-center gap-2',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <Upload className={cn(
            'h-10 w-10',
            disabled ? 'text-gray-400' : 'text-[#1E73BE]'
          )} />
          <div>
            <p className="font-medium text-gray-700">{t('comptoir.dragDropFiles')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('comptoir.supportedFormats')}</p>
          </div>
        </label>
      </div>

      {/* Files List */}
      {files.length > 0 ? (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-700">{t('comptoir.attachedDocuments')}</h4>
          <div className="border rounded-lg divide-y">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{formatDate(file.uploadDate)}</span>
                  </div>
                </div>
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">{t('comptoir.noDocuments')}</p>
      )}
    </div>
  );
}
