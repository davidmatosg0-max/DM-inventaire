/**
 * Generador de Reportes Avanzado
 * 
 * Componente para configurar y exportar reportes con múltiples formatos
 * y opciones de personalización.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
  Settings,
  Calendar,
  Filter,
  Eye,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import {
  exportData,
  generateFilename,
  validateExportData,
  suggestExportFormat,
  type ExportOptions,
  type TableColumn
} from '../utils/exportUtils';

interface ReportGeneratorProps {
  data: any[];
  columns: TableColumn[];
  defaultTitle?: string;
  defaultFilename?: string;
  charts?: Array<{ id: string; title: string }>;
  onExport?: (format: string) => void;
}

export function ReportGenerator({
  data,
  columns,
  defaultTitle,
  defaultFilename,
  charts = [],
  onExport
}: ReportGeneratorProps) {
  const { t } = useTranslation();
  
  // Estado
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf' | 'json'>('pdf');
  const [title, setTitle] = useState(defaultTitle ?? t('reports.defaultReportTitle', 'Rapport'));
  const [subtitle, setSubtitle] = useState('');
  const [filename, setFilename] = useState(defaultFilename ?? t('reports.defaultReportFilename', 'rapport'));
  const [includeDate, setIncludeDate] = useState(true);
  const [includeCharts, setIncludeCharts] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  // Validar datos
  const validation = validateExportData(data);
  const suggestedFormat = suggestExportFormat(data.length);
  
  // Manejar exportación
  const handleExport = async () => {
    if (!validation.isValid) {
      toast.error(t('reports.noDataToExport', 'Aucune donnée à exporter'));
      return;
    }
    
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      const options: ExportOptions = {
        filename: generateFilename(filename, format),
        title,
        subtitle,
        includeDate,
        includeCharts,
        orientation
      };
      
      await exportData(format, data, columns, options);
      
      setExportSuccess(true);
      toast.success(
        t('reports.exportSuccess', 'Rapport exporté avec succès'),
        {
          description: t('reports.exportedFileDescription', 'Fichier : {{filename}}', {
            filename: generateFilename(filename, format)
          })
        }
      );
      
      // Callback
      if (onExport) {
        onExport(format);
      }
      
      // Resetear éxito después de 3 segundos
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error(
        t('reports.exportError', 'Erreur lors de l\'exportation du rapport'),
        {
          description: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      );
    } finally {
      setIsExporting(false);
    }
  };
  
  // Icono según formato
  const getFormatIcon = (fmt: string) => {
    switch (fmt) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'json':
        return <FileJson className="w-5 h-5" />;
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-[#1a4d7a]" />
              {t('reports.generateReport', 'Générer un rapport')}
            </CardTitle>
            <CardDescription>
              {t('reports.configureExport', 'Configurez les options d\'exportation')}
            </CardDescription>
          </div>
          
          {/* Indicador de datos */}
          <div className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">{data.length}</span>{' '}
            {t('reports.records', 'enregistrements')}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Validación */}
        {!validation.isValid && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              {validation.errors.join(', ')}
            </p>
          </div>
        )}
        
        <Tabs value={format} onValueChange={(v) => setFormat(v as any)}>
          {/* Selector de formato */}
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="pdf" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="excel" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </TabsTrigger>
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="w-4 h-4" />
              JSON
            </TabsTrigger>
          </TabsList>
          
          {/* Configuración PDF */}
          <TabsContent value="pdf" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('reports.title', 'Titre')}</Label>
                <Label htmlFor="title">{t('reports.reportTitleLabel', 'Titre')}</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('reports.titlePlaceholder', 'Titre du rapport')}
                />
              </div>
              
              <div className="space-y-2">
                  <Label htmlFor="subtitle">{t('reports.reportSubtitleLabel', 'Sous-titre')}</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={t('reports.subtitlePlaceholder', 'Sous-titre facultatif')}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="orientation">{t('reports.orientation', 'Orientation')}</Label>
              <Select value={orientation} onValueChange={(v: any) => setOrientation(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portrait">
                    {t('reports.portrait', 'Portrait')}
                  </SelectItem>
                  <SelectItem value="landscape">
                    {t('reports.landscape', 'Paysage')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {charts.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={includeCharts}
                  onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                />
                <Label htmlFor="includeCharts" className="cursor-pointer">
                  {t('reports.includeCharts', 'Inclure les graphiques')} ({charts.length})
                </Label>
              </div>
            )}
          </TabsContent>
          
          {/* Configuración Excel */}
          <TabsContent value="excel" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title-excel">{t('reports.reportTitleLabel', 'Titre')}</Label>
                <Input
                  id="title-excel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('reports.titlePlaceholder', 'Titre du rapport')}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subtitle-excel">{t('reports.reportSubtitleLabel', 'Sous-titre')}</Label>
                <Input
                  id="subtitle-excel"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder={t('reports.subtitlePlaceholder', 'Sous-titre facultatif')}
                />
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                ℹ️ {t('reports.excelNote', 'Le fichier Excel inclura un format de tableau et des largeurs de colonnes ajustées')}
              </p>
            </div>
          </TabsContent>
          
          {/* Configuración CSV */}
          <TabsContent value="csv" className="space-y-4 mt-4">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ {t('reports.csvNote', 'Le format CSV est idéal pour importer des données dans d\'autres applications')}
              </p>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-700">
                ⚠️ {t('reports.csvWarning', 'Les graphiques ne sont pas inclus dans les fichiers CSV')}
              </p>
            </div>
          </TabsContent>
          
          {/* Configuración JSON */}
          <TabsContent value="json" className="space-y-4 mt-4">
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-700">
                🔧 {t('reports.jsonNote', 'Le format JSON est utile pour l\'intégration avec des API et le développement')}
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Opciones comunes */}
        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="filename">{t('reports.filename', 'Nom du fichier')}</Label>
            <Input
              id="filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder={t('reports.filenamePlaceholder', 'nom-du-fichier')}
            />
            <p className="text-xs text-gray-500">
              {t('reports.filenameNote', 'La date et l\'extension seront ajoutées automatiquement')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeDate"
              checked={includeDate}
              onCheckedChange={(checked) => setIncludeDate(checked as boolean)}
            />
            <Label htmlFor="includeDate" className="cursor-pointer">
              {t('reports.includeDate', 'Inclure la date de génération')}
            </Label>
          </div>
        </div>
        
        {/* Sugerencia de formato */}
        {suggestedFormat !== format && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 {t('reports.suggestedFormat', 'Format suggéré pour')} {data.length} {t('reports.records', 'enregistrements')}: <strong>{suggestedFormat.toUpperCase()}</strong>
            </p>
          </div>
        )}
        
        {/* Botón de exportación */}
        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            disabled={!validation.isValid || isExporting}
            className="flex-1 bg-[#1a4d7a] hover:bg-[#153d61]"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('reports.exporting', 'Exportation...')}
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {t('reports.exported', 'Exporté !')}
              </>
            ) : (
              <>
                {getFormatIcon(format)}
                <span className="ml-2">
                  {t('reports.export', 'Exporter')} {format.toUpperCase()}
                </span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Hook para generar reportes programáticamente
 */
export function useReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generate = async (
    format: 'csv' | 'excel' | 'pdf' | 'json',
    data: any[],
    columns: TableColumn[],
    options?: ExportOptions
  ) => {
    setIsGenerating(true);
    
    try {
      await exportData(format, data, columns, options);
      return { success: true };
    } catch (error) {
      console.error('Error generating report:', error);
      return { success: false, error };
    } finally {
      setIsGenerating(false);
    }
  };
  
  return {
    generate,
    isGenerating
  };
}
