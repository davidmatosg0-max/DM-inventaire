import React, { useRef } from 'react';
import { FileText, FileUp, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { DocumentAttachmentsPanel } from '../shared/DocumentAttachmentsPanel';
import { Button } from '../ui/button';

interface PanelDocumentosAdjuntosProps {
  documentos: string[];
  onChange: (documentos: string[]) => void;
  label: string;
  hint: string;
  inputId: string;
}

function formatearTamanoArchivo(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 Ko';
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

function estimarTamanoDataUrl(dataUrl: string): number {
  const partes = String(dataUrl || '').split(',', 2);
  const metadata = partes[0] || '';
  const contenido = partes[1] || '';

  if (!contenido) {
    return 0;
  }

  if (metadata.includes(';base64')) {
    const padding = (contenido.match(/=+$/) || [''])[0].length;
    return Math.max(0, Math.floor((contenido.length * 3) / 4) - padding);
  }

  try {
    return decodeURIComponent(contenido).length;
  } catch {
    return contenido.length;
  }
}

function convertirDataUrlABlob(dataUrl: string): Blob {
  const [metadata, data] = String(dataUrl || '').split(',', 2);

  if (!metadata || !data || !metadata.startsWith('data:')) {
    throw new Error('Document invalide');
  }

  const mimeType = metadata.slice(5).split(';', 1)[0] || 'application/octet-stream';

  if (metadata.includes(';base64')) {
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return new Blob([bytes], { type: mimeType });
  }

  return new Blob([decodeURIComponent(data)], { type: mimeType });
}

function obtenerMimeType(dataUrl: string): string {
  const metadata = String(dataUrl || '').split(',', 1)[0] || '';
  return metadata.startsWith('data:') ? metadata.slice(5).split(';', 1)[0] || 'application/octet-stream' : 'application/octet-stream';
}

function esDocumentoSoportado(file: File): boolean {
  return ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'].includes(file.type);
}

function obtenerExtensionDocumento(dataUrl: string): string {
  const mimeType = obtenerMimeType(dataUrl);

  switch (mimeType) {
    case 'application/pdf':
      return 'pdf';
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    default:
      return 'bin';
  }
}

function construirNombreDocumento(dataUrl: string, index: number): string {
  const extension = obtenerExtensionDocumento(dataUrl);
  const prefix = extension === 'pdf' ? 'document-transport' : 'image-transport';
  return `${prefix}-${index + 1}.${extension}`;
}

function esImagenDocumento(dataUrl: string): boolean {
  return obtenerMimeType(dataUrl).startsWith('image/');
}

export function PanelDocumentosAdjuntos({
  documentos,
  onChange,
  label,
  hint,
  inputId,
}: PanelDocumentosAdjuntosProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const documentosAdjuntos = Array.isArray(documentos) ? documentos : [];
  const totalTamano = documentosAdjuntos.reduce((total, documento) => total + estimarTamanoDataUrl(documento), 0);

  const handleDocumentosChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const archivosValidos = files.filter(esDocumentoSoportado);

    if (archivosValidos.length !== files.length) {
      toast.error('Seuls les PDF et les images JPG ou PNG sont acceptes.');
    }

    if (archivosValidos.length === 0) {
      event.target.value = '';
      return;
    }

    Promise.all(
      archivosValidos.map(
        (file) => new Promise<string | null>((resolve) => {
          const reader = new FileReader();

          reader.onloadend = () => {
            resolve(typeof reader.result === 'string' ? reader.result : null);
          };

          reader.onerror = () => {
            resolve(null);
          };

          reader.readAsDataURL(file);
        }),
      ),
    )
      .then((documentosCargados) => {
        const documentosValidos = documentosCargados.filter((documento): documento is string => Boolean(documento));

        if (documentosValidos.length === 0) {
          return;
        }

        onChange([...(documentosAdjuntos || []), ...documentosValidos]);
      })
      .finally(() => {
        event.target.value = '';
      });
  };

  const handleAbrirDocumento = (documento: string) => {
    let blobUrl = '';

    try {
      blobUrl = URL.createObjectURL(convertirDataUrlABlob(documento));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      toast.error('Impossible d\'ouvrir ce document.');
    }
  };

  const handleDescargarDocumento = (documento: string, index: number) => {
    let blobUrl = '';

    try {
      blobUrl = URL.createObjectURL(convertirDataUrlABlob(documento));
      const anchor = document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = construirNombreDocumento(documento, index);
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch {
      toast.error('Impossible de telecharger ce document.');
    }
  };

  const handleRetirerDocumento = (index: number) => {
    onChange(documentosAdjuntos.filter((_, currentIndex) => currentIndex !== index));
  };

  const items = documentosAdjuntos.map((documento, index) => ({
    id: `${obtenerMimeType(documento)}-${index}`,
    leading: esImagenDocumento(documento)
      ? <ImageIcon className="h-4 w-4 text-[#5d7185]" />
      : <FileText className="h-4 w-4 text-[#5d7185]" />,
    content: (
      <p className="truncate text-sm font-medium text-[#25313d]">{construirNombreDocumento(documento, index)}</p>
    ),
    note: (
      <span>
        Document disponible pour cette fiche • {formatearTamanoArchivo(estimarTamanoDataUrl(documento))}.
      </span>
    ),
    actions: (
      <>
        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => handleAbrirDocumento(documento)}>
          Ouvrir
        </Button>
        <Button type="button" variant="outline" className="rounded-2xl" onClick={() => handleDescargarDocumento(documento, index)}>
          Telecharger
        </Button>
        <Button type="button" variant="ghost" className="rounded-2xl" onClick={() => handleRetirerDocumento(index)}>
          Retirer
        </Button>
      </>
    ),
  }));

  return (
    <DocumentAttachmentsPanel
      title={label}
      titleIcon={<FileUp className="mr-1 inline h-3 w-3" />}
      summary={
        documentosAdjuntos.length > 0
          ? `${documentosAdjuntos.length} document(s) ajoute(s) • ${formatearTamanoArchivo(totalTamano)} utilises`
          : hint
      }
      primaryAction={
        <>
          <Button type="button" variant="outline" className="rounded-2xl" onClick={() => inputRef.current?.click()}>
            Ajouter des documents
          </Button>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="application/pdf,image/jpeg,image/jpg,image/png,.pdf,.jpg,.jpeg,.png"
            multiple
            className="hidden"
            onChange={handleDocumentosChange}
          />
        </>
      }
      items={items}
      emptyMessage="Aucun document ajoute pour cette fiche."
    />
  );
}