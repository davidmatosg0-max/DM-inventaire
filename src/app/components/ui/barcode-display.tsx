import React from 'react';
import Barcode from 'react-barcode';
import { Card } from './card';
import { Button } from './button';
import { Download, Printer, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { copiarAlPortapapeles } from '../../utils/clipboard';

interface BarcodeDisplayProps {
  value: string;
  format?: 'CODE128' | 'EAN13' | 'CODE39' | 'UPC';
  displayValue?: string;
  width?: number;
  height?: number;
  showControls?: boolean;
  label?: string;
  className?: string;
}

export function BarcodeDisplay({
  value,
  format = 'CODE128',
  displayValue,
  width = 2,
  height = 50,
  showControls = true,
  label,
  className = ''
}: BarcodeDisplayProps) {
  const [copied, setCopied] = React.useState(false);
  const barcodeRef = React.useRef<HTMLDivElement>(null);

  // Validar el código de barras según el formato
  const validateBarcode = (val: string, fmt: string): boolean => {
    if (!val || val.trim() === '') return false;
    
    switch (fmt) {
      case 'EAN13':
        // EAN13 debe tener exactamente 13 dígitos
        return /^\d{13}$/.test(val);
      case 'CODE128':
      case 'CODE39':
        // CODE128 y CODE39 no pueden estar vacíos
        return val.length > 0;
      case 'UPC':
        // UPC debe tener 12 dígitos
        return /^\d{12}$/.test(val);
      default:
        return val.length > 0;
    }
  };

  const isValid = validateBarcode(value, format);

  // Si el código no es válido, mostrar mensaje de error
  if (!isValid) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <p className="text-sm font-medium text-[#333333]">{label}</p>
        )}
        <Card className="p-4">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-[#DC3545]">
              Código de barras inválido para formato {format}
            </p>
            <p className="text-xs text-[#666666]">
              Valor: {value || '(vacío)'}
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await copiarAlPortapapeles(value);
      setCopied(true);
      toast.success('Código copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Error al copiar el código');
    }
  };

  const handleDownload = () => {
    if (!barcodeRef.current) return;

    const svg = barcodeRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `barcode-${value}.png`;
          link.click();
          URL.revokeObjectURL(url);
          toast.success('Código de barras descargado');
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    if (!barcodeRef.current) return;

    const printWindow = window.open('', '', 'width=600,height=400');
    if (!printWindow) return;

    const content = barcodeRef.current.innerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Código de Barras - ${displayValue || value}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .label {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .barcode-container {
              border: 1px solid #ddd;
              padding: 20px;
              background: white;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${label ? `<div class="label">${label}</div>` : ''}
          <div class="barcode-container">
            ${content}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <p className="text-sm font-medium text-[#333333]">{label}</p>
      )}
      <Card className="p-4">
        <div className="flex flex-col items-center gap-3">
          <div ref={barcodeRef} className="bg-white p-2">
            {(() => {
              try {
                return (
                  <Barcode
                    value={value}
                    format={format}
                    width={width}
                    height={height}
                    displayValue={true}
                    text={displayValue || value}
                    fontSize={14}
                    margin={5}
                    background="#ffffff"
                  />
                );
              } catch (error) {
                return (
                  <div className="p-4 text-center">
                    <p className="text-sm text-[#DC3545]">
                      Error al generar código de barras
                    </p>
                    <p className="text-xs text-[#666666] mt-1">
                      {error instanceof Error ? error.message : 'Error desconocido'}
                    </p>
                  </div>
                );
              }
            })()}
          </div>
          
          {showControls && (
            <div className="flex gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCopy}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                title="Descargar como imagen"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                title="Imprimir"
              >
                <Printer className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

interface BarcodeGridProps {
  items: Array<{
    value: string;
    label: string;
    format?: 'CODE128' | 'EAN13' | 'CODE39' | 'UPC';
  }>;
  columns?: number;
}

export function BarcodeGrid({ items, columns = 3 }: BarcodeGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {items.map((item, index) => (
        <BarcodeDisplay
          key={index}
          value={item.value}
          label={item.label}
          format={item.format}
          width={1.5}
          height={40}
        />
      ))}
    </div>
  );
}