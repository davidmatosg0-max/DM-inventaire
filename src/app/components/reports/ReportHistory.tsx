/**
 * Historial de Reportes
 * 
 * Componente para visualizar, gestionar y regenerar reportes previos.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FileText,
  FileSpreadsheet,
  FileJson,
  Download,
  Trash2,
  Clock,
  Filter,
  Search,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { formatDate, formatDateTime, formatDateRelative, formatFileSize } from '../utils/formatUtils';
import { toast } from 'sonner';

interface ReportRecord {
  id: string;
  title: string;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filename: string;
  generatedAt: Date;
  size?: number;
  recordCount: number;
  module: string;
  user: string;
  params?: Record<string, any>;
}

interface ReportHistoryProps {
  onRegenerate?: (report: ReportRecord) => void;
}

export function ReportHistory({ onRegenerate }: ReportHistoryProps) {
  const { t } = useTranslation();
  
  // Estado
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  
  // Cargar historial desde localStorage
  useEffect(() => {
    loadReportHistory();
  }, []);
  
  const loadReportHistory = () => {
    try {
      const stored = localStorage.getItem('report_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        setReports(parsed.map((r: any) => ({
          ...r,
          generatedAt: new Date(r.generatedAt)
        })));
      }
    } catch (error) {
      console.error('Error loading report history:', error);
    }
  };
  
  // Guardar reporte en historial
  const saveReportToHistory = (report: Omit<ReportRecord, 'id' | 'generatedAt'>) => {
    const newReport: ReportRecord = {
      ...report,
      id: `report_${Date.now()}`,
      generatedAt: new Date()
    };
    
    const updated = [newReport, ...reports].slice(0, 50); // Mantener últimos 50
    setReports(updated);
    
    try {
      localStorage.setItem('report_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving report history:', error);
    }
  };
  
  // Eliminar reporte
  const handleDelete = (reportId: string) => {
    const updated = reports.filter(r => r.id !== reportId);
    setReports(updated);
    
    try {
      localStorage.setItem('report_history', JSON.stringify(updated));
      toast.success(t('reports.reportDeleted', 'Rapport supprimé de l\'historique'));
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error(t('reports.deleteError', 'Erreur lors de la suppression du rapport'));
    }
  };
  
  // Limpiar todo el historial
  const handleClearAll = () => {
    if (confirm(t('reports.confirmClearAll', 'Voulez-vous supprimer tout l\'historique des rapports ?'))) {
      setReports([]);
      localStorage.removeItem('report_history');
      toast.success(t('reports.historyCleared', 'Historique supprimé'));
    }
  };
  
  // Regenerar reporte
  const handleRegenerate = (report: ReportRecord) => {
    if (onRegenerate) {
      onRegenerate(report);
      toast.success(t('reports.regenerating', 'Régénération du rapport...'));
    }
  };
  
  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = filterFormat === 'all' || report.format === filterFormat;
    const matchesModule = filterModule === 'all' || report.module === filterModule;
    
    return matchesSearch && matchesFormat && matchesModule;
  });
  
  // Obtener módulos únicos
  const uniqueModules = Array.from(new Set(reports.map(r => r.module)));
  
  // Icono según formato
  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'json':
        return <FileJson className="w-4 h-4" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };
  
  // Color del badge según formato
  const getFormatColor = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'bg-red-100 text-red-700';
      case 'excel':
        return 'bg-green-100 text-green-700';
      case 'json':
        return 'bg-purple-100 text-purple-700';
      case 'csv':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#1a4d7a]" />
              {t('reports.history', 'Historique des rapports')}
            </CardTitle>
            <CardDescription>
              {t('reports.historyDescription', 'Rapports générés récemment')}
            </CardDescription>
          </div>
          
          {reports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('reports.clearAll', 'Tout effacer')}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={t('reports.searchReports', 'Rechercher des rapports...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterFormat}
            onChange={(e) => setFilterFormat(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">{t('reports.allFormats', 'Tous les formats')}</option>
            <option value="pdf">PDF</option>
            <option value="excel">Excel</option>
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
          
          {uniqueModules.length > 0 && (
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t('reports.allModules', 'Tous les modules')}</option>
              {uniqueModules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          )}
        </div>
        
        {/* Lista de reportes */}
        {filteredReports.length > 0 ? (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Info del reporte */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded ${getFormatColor(report.format)}`}>
                          {getFormatIcon(report.format)}
                        </div>
                        <h4 className="font-medium text-gray-900 truncate">
                          {report.title}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {report.module}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 truncate">
                        {report.filename}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateRelative(report.generatedAt)}
                        </span>
                        <span>{report.recordCount} enregistrements</span>
                        {report.size && (
                          <span>{formatFileSize(report.size)}</span>
                        )}
                        <span>{report.user}</span>
                      </div>
                    </div>
                    
                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      {onRegenerate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRegenerate(report)}
                          title={t('reports.regenerate', 'Régénérer')}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                        className="text-red-600 hover:text-red-700"
                        title={t('reports.delete', 'Supprimer')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">
              {searchQuery || filterFormat !== 'all' || filterModule !== 'all'
                ? t('reports.noMatchingReports', 'Aucun rapport correspondant trouvé')
                : t('reports.noReports', 'Aucun rapport généré pour le moment')}
            </p>
          </div>
        )}
        
        {/* Estadísticas */}
        {reports.length > 0 && (
          <div className="pt-4 border-t">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-[#1a4d7a]">{reports.length}</p>
                <p className="text-xs text-gray-500">{t('reports.totalReports', 'Total')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.format === 'excel').length}
                </p>
                <p className="text-xs text-gray-500">Excel</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.format === 'pdf').length}
                </p>
                <p className="text-xs text-gray-500">PDF</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {reports.filter(r => r.format === 'csv').length}
                </p>
                <p className="text-xs text-gray-500">CSV</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Hook para gestionar historial de reportes
export function useReportHistory() {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('report_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        setReports(parsed.map((r: any) => ({
          ...r,
          generatedAt: new Date(r.generatedAt)
        })));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };
  
  const addReport = (report: Omit<ReportRecord, 'id' | 'generatedAt'>) => {
    const newReport: ReportRecord = {
      ...report,
      id: `report_${Date.now()}`,
      generatedAt: new Date()
    };
    
    const updated = [newReport, ...reports].slice(0, 50);
    setReports(updated);
    
    try {
      localStorage.setItem('report_history', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };
  
  const clearHistory = () => {
    setReports([]);
    localStorage.removeItem('report_history');
  };
  
  return {
    reports,
    addReport,
    clearHistory,
    reload: loadHistory
  };
}
