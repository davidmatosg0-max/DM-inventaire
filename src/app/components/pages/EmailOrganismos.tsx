import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Send, Mail, MapPin, Phone, Users, Plus, Edit, Eye, X, Upload, FileText, Bell, Calendar, Percent, UserCheck, UtensilsCrossed, Coffee, Clock, PackageCheck, History, Building2, Copy, Check, Printer, TrendingUp, BarChart3, PieChart, Download, FileSpreadsheet, ChevronDown, File, MessageSquare, Languages } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { createWorkbookFromRowSheets, saveWorkbook } from '../../utils/excelWorkbook';
import { openAutoPrintPopup } from '../../utils/printPopup';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { FormularioOrganismoCompacto } from '../organismos/FormularioOrganismoCompacto';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { generarClaveAccesoUnica } from '../../utils/claveAcceso';
import { MapLink } from '../ui/map-link';
import { GestionDemandes } from '../liaison/GestionDemandes';
import { obtenirNombreNouvellesDemandes } from '../../utils/demandesStorage';
import { type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { formatBrandingContactLine, normalizeBrandingPrintConfig } from '../../utils/brandingPrint';
import { useBranding } from '../../../hooks/useBranding';
import {
  construirPayloadOrganismo,
  convertirOrganismoAFormulario,
  crearFormularioOrganismoVacio,
  validarFormularioOrganismo,
} from '../../utils/organismoForm';
import { 
  obtenerOrganismos, 
  crearOrganismo, 
  actualizarOrganismo,
  migrarClavesDeAcceso,
  type Organismo,
  type ClasificacionOrganismo,
  type IdiomaContactoOrganismo
} from '../../utils/organismosStorage';
import { 
  obtenerConfigEmail,
  enviarEmail as enviarEmailService
} from '../../utils/emailConfig';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import { obtenerUsuarioSesion, esAdministradorLiaison } from '../../utils/sesionStorage';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleExecutiveStrip } from '../shared/ModuleExecutiveStrip';
import { ModuleSection } from '../shared/ModuleSection';

// Tipos de organismos predefinidos
const getTiposOrganismo = (t: any) => [
  { id: '1', nombre: t('organisms.organismTypes.communityKitchen'), icono: '🍽️' },
  { id: '2', nombre: t('organisms.organismTypes.foundation'), icono: '🏛️' },
  { id: '3', nombre: t('organisms.organismTypes.ngo'), icono: '🤝' },
  { id: '4', nombre: t('organisms.organismTypes.shelter'), icono: '🏠' },
  { id: '5', nombre: t('organisms.organismTypes.dayCenter'), icono: '☀️' },
  { id: '21', nombre: 'Collation', icono: '🥪' },
  { id: '6', nombre: t('organisms.organismTypes.school'), icono: '🎓' },
  { id: '7', nombre: t('organisms.organismTypes.daycare'), icono: '👶' },
  { id: '8', nombre: t('organisms.organismTypes.childrensHome'), icono: '👨‍👩‍👧‍👦' },
  { id: '9', nombre: t('organisms.organismTypes.seniorsHome'), icono: '👴' },
  { id: '10', nombre: t('organisms.organismTypes.rehabCenter'), icono: '💪' },
  { id: '11', nombre: t('organisms.organismTypes.hospital'), icono: '🏥' },
  { id: '12', nombre: t('organisms.organismTypes.church'), icono: '⛪' },
  { id: '13', nombre: t('organisms.organismTypes.civilAssociation'), icono: '📋' },
  { id: '14', nombre: t('organisms.organismTypes.communityCenter'), icono: '🏘️' },
  { id: '15', nombre: t('organisms.organismTypes.homelessShelter'), icono: '🛏️' },
  { id: '16', nombre: t('organisms.organismTypes.migrantCenter'), icono: '🌍' },
  { id: '17', nombre: t('organisms.organismTypes.womensHome'), icono: '👩' },
  { id: '18', nombre: t('organisms.organismTypes.disabilityCenter'), icono: '♿' },
  { id: '19', nombre: t('organisms.organismTypes.foodBank'), icono: '🛒' },
  { id: '20', nombre: t('organisms.organismTypes.other'), icono: '📌' }
];

const diasCitaOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const clasificacionOptions: Array<{ value: ClasificacionOrganismo; label: string }> = [
  { value: 'regular', label: 'Régulier' },
  { value: 'eventual', label: 'Éventuel' },
  { value: 'collation', label: 'Collation' },
];

export function EmailOrganismos({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t } = useTranslation();
  const branding = useBranding();
  const brandingPrint = normalizeBrandingPrintConfig(branding);
  const nombreSistemaImpresion = brandingPrint.systemName;
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const tiposOrganismo = getTiposOrganismo(t);
  
  // Cargar organismos desde el storage
  const [organismos, setOrganismos] = useState<Organismo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrganismos, setFilteredOrganismos] = useState<Organismo[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailType, setEmailType] = useState<'individual' | 'group'>('individual');
  const [selectedOrganismos, setSelectedOrganismos] = useState<string[]>([]);
  const [currentRecipient, setCurrentRecipient] = useState<Organismo | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedDiaCitaFilter, setSelectedDiaCitaFilter] = useState<'all' | string>('all');
  const [selectedClasificacionFilter, setSelectedClasificacionFilter] = useState<'all' | ClasificacionOrganismo>('all');

  // Estados para funcionalidades adicionales
  const [organismoDialogOpen, setOrganismoDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoVisualizacion, setModoVisualizacion] = useState(false);
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState<any>(null);
  const [claveGeneradaDialog, setClaveGeneradaDialog] = useState(false);
  const [claveGenerada, setClaveGenerada] = useState('');
  const [nombreOrganismoCreado, setNombreOrganismoCreado] = useState('');
  const [tabActual, setTabActual] = useState<'liaison' | 'contactos'>('liaison');
  
  // Cargar organismos al montar el componente
  useEffect(() => {
    // Ejecutar migración de claves de acceso
    migrarClavesDeAcceso();
    cargarOrganismos();
  }, []);

  // 🔔 Escuchar cambios en organismos desde otros módulos
  useEffect(() => {
    const handleOrganismoChange = () => {
      console.log('🔄 [EmailOrganismos] Recargando debido a cambio en otro módulo...');
      cargarOrganismos();
    };

    window.addEventListener('organismo:changed', handleOrganismoChange);
    
    return () => {
      window.removeEventListener('organismo:changed', handleOrganismoChange);
    };
  }, []);

  const cargarOrganismos = () => {
    const organismosActuales = obtenerOrganismos();
    setOrganismos(organismosActuales);
    setFilteredOrganismos(organismosActuales);
  };
  
  // Estado del formulario de organismo
  const [formOrganismo, setFormOrganismo] = useState(crearFormularioOrganismoVacio());

  // Estado para personas autorizadas
  const [personasAutorizadas, setPersonasAutorizadas] = useState<any[]>([]);

  // Obtener usuario en sesión
  const usuarioSesion = obtenerUsuarioSesion();
  
  // Verificar permisos del usuario
  const puedeGestionarOrganismos = esAdministradorLiaison();
  
  // Verificar configuración de email (ya no se usa para mostrar estado, solo el usuario conectado)
  const emailConfig = obtenerConfigEmail();

  // Referencia para impresión
  const estadisticasRef = useRef<HTMLDivElement>(null);
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);
  
  // Estados para filtros de fecha
  const [fechaInicio, setFechaInicio] = useState('2024-01-01');
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<'6mois' | '3mois' | '1mois' | 'personalizado'>('6mois');
  
  // Estado para el menú de descargas
  const [menuDescargasAbierto, setMenuDescargasAbierto] = useState(false);
  
  // Estado para mostrar gestión de demandes
  const [mostrarGestionDemandes, setMostrarGestionDemandes] = useState(false);
  const [nombreNouvellesDemandes, setNombreNouvellesDemandes] = useState(0);

  // Datos mock para historial
  const historialDonaciones = [
    { id: 1, fecha: '2024-01-15', productos: 'Riz, Haricots, Huile', cantidad: '150 kg', valorMonetario: '$2,450' },
    { id: 2, fecha: '2024-01-08', productos: 'Lait, Céréales, Sucre', cantidad: '200 kg', valorMonetario: '$3,800' },
    { id: 3, fecha: '2024-01-01', productos: 'Pâtes, Thon, Légumes', cantidad: '180 kg', valorMonetario: '$2,950' },
  ];

  const historialPRS = [
    { id: 1, fecha: '2024-01-20', tipoServicio: 'Distribution régulière', beneficiarios: 120, responsable: 'Juan Perez' },
    { id: 2, fecha: '2024-01-13', tipoServicio: 'Distribution spéciale', beneficiarios: 95, responsable: 'Maria Lopez' },
    { id: 3, fecha: '2024-01-06', tipoServicio: 'Distribution régulière', beneficiarios: 110, responsable: 'Juan Perez' },
  ];

  // Datos para gráficos de crecimiento
  const dataCrecimientoAccreditacion = [
    { mes: 'Jan', demandes: 12, approuvees: 10, rejetees: 2 },
    { mes: 'Fév', demandes: 18, approuvees: 15, rejetees: 3 },
    { mes: 'Mar', demandes: 25, approuvees: 22, rejetees: 3 },
    { mes: 'Avr', demandes: 32, approuvees: 28, rejetees: 4 },
    { mes: 'Mai', demandes: 38, approuvees: 35, rejetees: 3 },
    { mes: 'Jun', demandes: 45, approuvees: 40, rejetees: 5 },
  ];

  const dataCrecimientoOrganismes = [
    { mes: 'Jan', total: 45, actifs: 42, inactifs: 3 },
    { mes: 'Fév', total: 52, actifs: 48, inactifs: 4 },
    { mes: 'Mar', total: 61, actifs: 56, inactifs: 5 },
    { mes: 'Avr', total: 68, actifs: 63, inactifs: 5 },
    { mes: 'Mai', total: 75, actifs: 70, inactifs: 5 },
    { mes: 'Jun', total: 82, actifs: 76, inactifs: 6 },
  ];

  const dataTypesOrganismes = [
    { name: 'Cuisines Communautaires', value: 25, color: '#1E73BE' },
    { name: 'Fondations', value: 18, color: '#4CAF50' },
    { name: 'ONG', value: 15, color: '#FFC107' },
    { name: 'Refuges', value: 12, color: '#DC3545' },
    { name: 'Autres', value: 12, color: '#9C27B0' },
  ];

  // Función de impresión
  const imprimirEstadisticas = () => {
    const contenido = estadisticasRef.current?.innerHTML || '';

    try {
      openAutoPrintPopup(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Statistiques Liaison - ${new Date().toLocaleDateString('fr-FR')}</title>
            <style>
              body { 
                font-family: 'Roboto', sans-serif; 
                padding: 20px;
                color: #333;
              }
              h1 { 
                color: #1E73BE; 
                font-family: 'Montserrat', sans-serif;
                border-bottom: 3px solid #1E73BE;
                padding-bottom: 10px;
              }
              h2 { 
                color: #4CAF50; 
                font-family: 'Montserrat', sans-serif;
                margin-top: 30px;
              }
              .stat-card {
                display: inline-block;
                padding: 15px;
                margin: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                min-width: 200px;
              }
              .stat-value {
                font-size: 32px;
                font-weight: bold;
                color: #1E73BE;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
              }
              th {
                background-color: #f4f4f4;
                font-weight: bold;
              }
              .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
              }
              @media print {
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <h1>📊 Rapport Statistique - Module Liaison</h1>
            <p><strong>Date du rapport:</strong> ${new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Période analysée:</strong> ${new Date(fechaInicio).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })} - ${new Date(fechaFin).toLocaleDateString('fr-FR', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}</p>
            ${brandingContactLine ? `<p><strong>Coordonnées:</strong> ${brandingContactLine}</p>` : ''}
            ${contenido}
            <div class="footer">
              <p>© ${new Date().getFullYear()} ${nombreSistemaImpresion} - Système de Gestion</p>
              ${brandingContactLine ? `<p>${brandingContactLine}</p>` : ''}
            </div>
          </body>
        </html>
      `, { width: 800, height: 600, printDelayMs: 250 });
    } catch (error) {
      toast.error('Impossible d’ouvrir la fenêtre d’impression');
    }
  };

  // Función para descargar en PDF
  const descargarPDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(30, 115, 190);
    doc.text('Rapport Statistique - Module Liaison', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    doc.text(`Période: ${new Date(fechaInicio).toLocaleDateString('fr-FR')} - ${new Date(fechaFin).toLocaleDateString('fr-FR')}`, 14, 36);
    
    // Résumé statistique
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Résumé Statistique', 14, 48);
    
    const statsData = [
      ['Indicateur', 'Valeur', 'Évolution'],
      ['Demandes ce mois', '45', '+18%'],
      ['Approuvées', '40', '88.9%'],
      ['En attente', '8', '-'],
      ['Croissance annuelle', '+82%', 'vs année dernière']
    ];
    
    doc.autoTable({
      startY: 52,
      head: [statsData[0]],
      body: statsData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [30, 115, 190] },
      margin: { left: 14, right: 14 }
    });
    
    // Données de croissance des demandes
    doc.setFontSize(14);
    doc.text('Croissance des Demandes d\'Accréditation', 14, doc.lastAutoTable.finalY + 15);
    
    const demandesData = [
      ['Mois', 'Demandes', 'Approuvées', 'Rejetées'],
      ...dataCrecimientoAccreditacion.map(d => [d.mes, d.demandes.toString(), d.approuvees.toString(), d.rejetees.toString()])
    ];
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [demandesData[0]],
      body: demandesData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [76, 175, 80] },
      margin: { left: 14, right: 14 }
    });
    
    // Données de croissance des organismes
    doc.addPage();
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Croissance des Organismes', 14, 22);
    
    const organismesData = [
      ['Mois', 'Total', 'Actifs', 'Inactifs'],
      ...dataCrecimientoOrganismes.map(d => [d.mes, d.total.toString(), d.actifs.toString(), d.inactifs.toString()])
    ];
    
    doc.autoTable({
      startY: 26,
      head: [organismesData[0]],
      body: organismesData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [30, 115, 190] },
      margin: { left: 14, right: 14 }
    });
    
    // Répartition par type
    doc.setFontSize(14);
    doc.text('Répartition par Type d\'Organisme', 14, doc.lastAutoTable.finalY + 15);
    
    const typesData = [
      ['Type', 'Nombre'],
      ...dataTypesOrganismes.map(d => [d.name, d.value.toString()])
    ];
    
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [typesData[0]],
      body: typesData.slice(1),
      theme: 'grid',
      headStyles: { fillColor: [156, 39, 176] },
      margin: { left: 14, right: 14 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`© ${new Date().getFullYear()} ${nombreSistemaImpresion} - Page ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 10);
      if (brandingContactLine) {
        doc.text(brandingContactLine, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
      }
    }
    
    doc.save(`Statistiques_Liaison_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('📄 Rapport PDF téléchargé avec succès!');
    setMenuDescargasAbierto(false);
  };

  // Función para descargar en Excel
  const descargarExcel = async () => {
    // Hoja 1: Résumé
    const resumeData = [
      ['RAPPORT STATISTIQUE - MODULE LIAISON'],
      [`Date du rapport: ${new Date().toLocaleDateString('fr-FR')}`],
      [`Période: ${new Date(fechaInicio).toLocaleDateString('fr-FR')} - ${new Date(fechaFin).toLocaleDateString('fr-FR')}`],
      [],
      ['Indicateur', 'Valeur', 'Évolution'],
      ['Demandes ce mois', 45, '+18%'],
      ['Approuvées', 40, '88.9%'],
      ['En attente', 8, '-'],
      ['Croissance annuelle', '+82%', 'vs année dernière']
    ];

    // Hoja 2: Demandes d'accréditation
    const demandesData = [
      ['Mois', 'Demandes totales', 'Approuvées', 'Rejetées'],
      ...dataCrecimientoAccreditacion.map(d => [d.mes, d.demandes, d.approuvees, d.rejetees])
    ];

    // Hoja 3: Organismes
    const organismesData = [
      ['Mois', 'Total', 'Actifs', 'Inactifs'],
      ...dataCrecimientoOrganismes.map(d => [d.mes, d.total, d.actifs, d.inactifs])
    ];

    // Hoja 4: Types d'organismes
    const typesData = [
      ['Type d\'Organisme', 'Nombre'],
      ...dataTypesOrganismes.map(d => [d.name, d.value])
    ];

    const workbook = createWorkbookFromRowSheets([
      { name: 'Résumé', rows: resumeData },
      { name: 'Demandes Accréditation', rows: demandesData },
      { name: 'Organismes', rows: organismesData },
      { name: 'Types Organismes', rows: typesData },
    ]);

    await saveWorkbook(workbook, `Statistiques_Liaison_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('📊 Rapport Excel téléchargé avec succès!');
    setMenuDescargasAbierto(false);
  };

  // Función para descargar en CSV
  const descargarCSV = () => {
    let csvContent = 'RAPPORT STATISTIQUE - MODULE LIAISON\n';
    csvContent += `Date du rapport,${new Date().toLocaleDateString('fr-FR')}\n`;
    csvContent += `Période,${new Date(fechaInicio).toLocaleDateString('fr-FR')} - ${new Date(fechaFin).toLocaleDateString('fr-FR')}\n\n`;
    
    // Résumé
    csvContent += 'RÉSUMÉ STATISTIQUE\n';
    csvContent += 'Indicateur,Valeur,Évolution\n';
    csvContent += 'Demandes ce mois,45,+18%\n';
    csvContent += 'Approuvées,40,88.9%\n';
    csvContent += 'En attente,8,-\n';
    csvContent += 'Croissance annuelle,+82%,vs année dernière\n\n';
    
    // Demandes d'accréditation
    csvContent += 'CROISSANCE DES DEMANDES D\'ACCRÉDITATION\n';
    csvContent += 'Mois,Demandes totales,Approuvées,Rejetées\n';
    dataCrecimientoAccreditacion.forEach(d => {
      csvContent += `${d.mes},${d.demandes},${d.approuvees},${d.rejetees}\n`;
    });
    csvContent += '\n';
    
    // Organismes
    csvContent += 'CROISSANCE DES ORGANISMES\n';
    csvContent += 'Mois,Total,Actifs,Inactifs\n';
    dataCrecimientoOrganismes.forEach(d => {
      csvContent += `${d.mes},${d.total},${d.actifs},${d.inactifs}\n`;
    });
    csvContent += '\n';
    
    // Types
    csvContent += 'RÉPARTITION PAR TYPE D\'ORGANISME\n';
    csvContent += 'Type,Nombre\n';
    dataTypesOrganismes.forEach(d => {
      csvContent += `${d.name},${d.value}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `Statistiques_Liaison_${new Date().toISOString().split('T')[0]}.csv`);
    toast.success('📑 Rapport CSV téléchargé avec succès!');
    setMenuDescargasAbierto(false);
  };

  // Función para aplicar filtros de período predefinidos
  const aplicarPeriodo = (periodo: '6mois' | '3mois' | '1mois' | 'personalizado') => {
    setPeriodoSeleccionado(periodo);
    const hoy = new Date();
    let nuevaFechaInicio = new Date();

    if (periodo === '6mois') {
      nuevaFechaInicio.setMonth(hoy.getMonth() - 6);
      toast.success('📊 Filtre appliqué: 6 derniers mois');
    } else if (periodo === '3mois') {
      nuevaFechaInicio.setMonth(hoy.getMonth() - 3);
      toast.success('📊 Filtre appliqué: 3 derniers mois');
    } else if (periodo === '1mois') {
      nuevaFechaInicio.setMonth(hoy.getMonth() - 1);
      toast.success('📊 Filtre appliqué: 1 dernier mois');
    } else {
      // Para 'personalizado', no cambiar las fechas
      toast.info('📅 Mode personnalisé activé');
      return;
    }

    setFechaInicio(nuevaFechaInicio.toISOString().split('T')[0]);
    setFechaFin(hoy.toISOString().split('T')[0]);
  };

  // Filtrar datos según el rango de fechas
  const filtrarDatosPorFecha = () => {
    // Aquí podrías filtrar los datos reales según las fechas
    // Por ahora, los datos mock se mantienen igual
    // En producción, harías una llamada al backend con fechaInicio y fechaFin
    return {
      dataCrecimientoAccreditacion,
      dataCrecimientoOrganismes,
      dataTypesOrganismes
    };
  };

  const datosFiltrados = filtrarDatosPorFecha();

  // Cálculo automático del porcentaje de repartición
  const calcularPorcentajeAutomatico = () => {
    const { personasServidas, cantidadColaciones, cantidadAlmuerzos } = formOrganismo;
    const totalServicios = personasServidas + cantidadColaciones + cantidadAlmuerzos;
    
    if (totalServicios > 0) {
      // Fórmula: base de 1000 servicios = 100%
      const porcentaje = Math.min((totalServicios / 1000) * 100, 100);
      setFormOrganismo({ ...formOrganismo, porcentajeReparticion: parseFloat(porcentaje.toFixed(2)) });
    }
  };

  const agregarContacto = () => {
    setFormOrganismo({
      ...formOrganismo,
      contactosNotificacion: [...(formOrganismo.contactosNotificacion || []), { nombre: '', email: '', cargo: '', joursDisponibles: [] }]
    });
  };

  const eliminarContacto = (index: number) => {
    const nuevosContactos = (formOrganismo.contactosNotificacion || []).filter((_, i) => i !== index);
    setFormOrganismo({ ...formOrganismo, contactosNotificacion: nuevosContactos });
  };

  const actualizarContacto = (index: number, campo: string, valor: string | JourDisponible[]) => {
    const nuevosContactos = [...(formOrganismo.contactosNotificacion || [])];
    if (nuevosContactos[index]) {
      nuevosContactos[index] = { ...nuevosContactos[index], [campo]: valor };
      setFormOrganismo({ ...formOrganismo, contactosNotificacion: nuevosContactos });
    }
  };

  const handleCrearOrganismo = () => {
    const errorValidacion = validarFormularioOrganismo(formOrganismo);
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }

    // Generar clave de acceso única
    const claveAcceso = generarClaveAccesoUnica(formOrganismo.nombre, organismos.map(org => org.claveAcceso || ''));
    const payloadOrganismo = construirPayloadOrganismo(formOrganismo);

    try {
      // Crear el organismo en el storage
      const nuevoOrganismo = crearOrganismo({
        ...payloadOrganismo,
        claveAcceso: claveAcceso,
      });
      
      // Recargar la lista de organismos
      cargarOrganismos();
      
      console.log('Organismo creado con clave:', nuevoOrganismo.claveAcceso);
      
      // Guardar la clave generada y nombre para mostrar en el diálogo
      setClaveGenerada(nuevoOrganismo.claveAcceso || claveAcceso);
      setNombreOrganismoCreado(formOrganismo.nombre);
      
      // Cerrar diálogo de creación
      setOrganismoDialogOpen(false);
      
      // Mostrar diálogo con la clave generada
      setClaveGeneradaDialog(true);
      setModoVisualizacion(false);
      
      // Resetear formulario
      setFormOrganismo(crearFormularioOrganismoVacio());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de l\'organisme');
    }
  };

  const handleGuardarCambios = () => {
    const errorValidacion = validarFormularioOrganismo(formOrganismo);
    if (errorValidacion) {
      toast.error(errorValidacion);
      return;
    }

    if (organismoSeleccionado && organismoSeleccionado.id) {
      try {
        const payloadOrganismo = construirPayloadOrganismo(formOrganismo);
        // Actualizar el organismo en el storage
        actualizarOrganismo(organismoSeleccionado.id, payloadOrganismo);

        // Recargar la lista de organismos
        cargarOrganismos();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde des modifications');
        return;
      }
    }
    
    toast.success(t('organisms.changesSaved'));
    setOrganismoDialogOpen(false);
    setModoEdicion(false);
    setModoVisualizacion(false);
  };

  // Estadísticas
  const totalOrganismos = organismos.length;
  const organismosActivos = organismos.filter(o => o.activo).length;
  const totalBeneficiarios = organismos.reduce((sum, o) => sum + o.beneficiarios, 0);

  // Filtrar organismos
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrganismos(organismos);
    } else {
      const filtered = organismos.filter(org =>
        org.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrganismos(filtered);
    }
  }, [searchTerm, organismos]);

  // Abrir modal
  const openEmailModal = (type: 'individual' | 'group', organismoId?: string) => {
    setEmailType(type);
    setEmailSubject('');
    setEmailMessage('');
    setSelectedOrganismos([]);

    if (type === 'individual' && organismoId) {
      const recipient = organismos.find(o => o.id === organismoId);
      setCurrentRecipient(recipient || null);
    } else {
      setCurrentRecipient(null);
    }

    setIsModalOpen(true);
  };

  // Cerrar modal
  const closeEmailModal = () => {
    setIsModalOpen(false);
    setCurrentRecipient(null);
    setSelectedOrganismos([]);
    setEmailSubject('');
    setEmailMessage('');
    setSelectedDiaCitaFilter('all');
    setSelectedClasificacionFilter('all');
  };

  const getClasificacionOrganismo = (organismo: Organismo): ClasificacionOrganismo => (
    organismo.clasificacionOrganismo || (organismo.regular ? 'regular' : 'eventual')
  );

  const organismosFiltradosModal = organismos.filter((organismo) => {
    const coincideDiaCita = selectedDiaCitaFilter === 'all'
      ? true
      : (organismo.diaCita || '').trim() === selectedDiaCitaFilter;
    const coincideClasificacion = selectedClasificacionFilter === 'all'
      ? true
      : getClasificacionOrganismo(organismo) === selectedClasificacionFilter;

    return coincideDiaCita && coincideClasificacion;
  });

  const todosLosOrganismosFiltradosSeleccionados = (
    organismosFiltradosModal.length > 0
    && organismosFiltradosModal.every((organismo) => selectedOrganismos.includes(organismo.id))
  );

  const toggleOrganismo = (organismoId: string) => {
    setSelectedOrganismos((prev) => (
      prev.includes(organismoId)
        ? prev.filter((id) => id !== organismoId)
        : [...prev, organismoId]
    ));
  };

  const toggleSelectAll = () => {
    setSelectedOrganismos((prev) => (
      todosLosOrganismosFiltradosSeleccionados
        ? prev.filter((id) => !organismosFiltradosModal.some((organismo) => organismo.id === id))
        : Array.from(new Set([
            ...prev,
            ...organismosFiltradosModal.map((organismo) => organismo.id),
          ]))
    ));
  };

  const sendEmail = async () => {
    if (!emailConfig || !emailConfig.isConfigured) {
      toast.error('Configuration email requise', {
        description: 'Veuillez configurer un compte email avant l\'envoi.',
      });
      return;
    }

    let destinatarios: string[] = [];

    if (emailType === 'individual') {
      if (!currentRecipient?.email) {
        toast.error('Aucun destinataire valide selectionne.');
        return;
      }

      destinatarios = [currentRecipient.email];
    } else {
      destinatarios = organismos
        .filter((organismo) => selectedOrganismos.includes(organismo.id) && organismo.email)
        .map((organismo) => organismo.email);

      if (destinatarios.length === 0) {
        toast.error('Selectionnez au moins un organisme avec une adresse email valide.');
        return;
      }
    }

    try {
      const resultado = await enviarEmailService(destinatarios, emailSubject, emailMessage, emailConfig);

      if (!resultado.exito) {
        toast.error('Erreur lors de l\'envoi de l\'email', {
          description: resultado.mensaje,
        });
        return;
      }

      toast.success('Email envoye avec succes', {
        description: resultado.mensaje,
        duration: 5000,
      });

      if (emailType === 'individual' && currentRecipient) {
        console.log('Email individual enviado:', {
          de: usuarioSesion?.email,
          nombreRemitente: usuarioSesion ? `${usuarioSesion.nombre} ${usuarioSesion.apellido}` : emailConfig.email,
          destinatario: currentRecipient,
          asunto: emailSubject,
          mensaje: emailMessage,
          fecha: new Date().toISOString(),
        });
      } else {
        console.log('Email grupal enviado:', {
          de: usuarioSesion?.email,
          nombreRemitente: usuarioSesion ? `${usuarioSesion.nombre} ${usuarioSesion.apellido}` : emailConfig.email,
          destinatarios: organismos.filter((organismo) => selectedOrganismos.includes(organismo.id)),
          asunto: emailSubject,
          mensaje: emailMessage,
          fecha: new Date().toISOString(),
        });
      }

      closeEmailModal();
    } catch (error) {
      toast.error('❌ Erreur lors de l\'envoi de l\'email');
      console.error('Error enviando email:', error);
    }
  };

  const handleVerPerfil = (organismo: Organismo) => {
    setOrganismoSeleccionado(organismo);
    setFormOrganismo(convertirOrganismoAFormulario(organismo));
    setModoEdicion(false);
    setModoVisualizacion(true);
    setOrganismoDialogOpen(true);
  };

  const handleEditarPerfil = (organismo: Organismo) => {
    setOrganismoSeleccionado(organismo);
    setFormOrganismo(convertirOrganismoAFormulario(organismo));
    setModoEdicion(true);
    setModoVisualizacion(false);
    setOrganismoDialogOpen(true);
  };

  // Validar botón de envío
  const canSend = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) return false;
    if (emailType === 'individual') return currentRecipient !== null;
    return selectedOrganismos.length > 0;
  };

  // useEffect para cerrar el menú de descargas al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (menuDescargasAbierto && !target.closest('.relative')) {
        setMenuDescargasAbierto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuDescargasAbierto]);
  
  // useEffect para actualizar contador de nouvelles demandes
  useEffect(() => {
    const actualizarContador = () => {
      const count = obtenirNombreNouvellesDemandes();
      setNombreNouvellesDemandes(count);
    };
    
    actualizarContador();
    const interval = setInterval(actualizarContador, 10000); // Actualizar cada 10 segundos
    
    return () => clearInterval(interval);
  }, []);
  
  // Si mostrar gestión demandes, renderizar ese componente
  if (mostrarGestionDemandes) {
    return <GestionDemandes onBack={() => setMostrarGestionDemandes(false)} />;
  }

  const liaisonExecutiveMetrics = [
    {
      id: 'active-tab',
      label: t('liaison.executive.metrics.activeView'),
      value: tabActual === 'liaison' ? t('nav.liaison') : t('nav.contacts'),
      helper: tabActual === 'liaison'
        ? t('liaison.executive.metrics.liaisonHelper')
        : t('liaison.executive.metrics.contactsHelper'),
      icon: <Building2 className="h-4 w-4" />,
      accentColor: branding.primaryColor,
    },
    {
      id: 'requests',
      label: t('liaison.executive.metrics.newRequests'),
      value: nombreNouvellesDemandes,
      helper: nombreNouvellesDemandes > 0
        ? t('liaison.executive.metrics.newRequestsPending')
        : t('liaison.executive.metrics.newRequestsClear'),
      icon: <MessageSquare className="h-4 w-4" />,
      accentColor: '#7c3aed',
    },
    {
      id: 'stats-panel',
      label: t('liaison.executive.metrics.stats'),
      value: mostrarEstadisticas ? t('liaison.executive.metrics.visible') : t('liaison.executive.metrics.hidden'),
      helper: t('liaison.executive.metrics.statsHelper'),
      icon: <BarChart3 className="h-4 w-4" />,
      accentColor: branding.secondaryColor,
    },
    {
      id: 'access-level',
      label: t('liaison.executive.metrics.accessLevel'),
      value: puedeGestionarOrganismos ? t('liaison.executive.metrics.administration') : t('liaison.executive.metrics.readOnly'),
      helper: puedeGestionarOrganismos
        ? t('liaison.executive.metrics.administrationHelper')
        : t('liaison.executive.metrics.readOnlyHelper'),
      icon: <Users className="h-4 w-4" />,
      accentColor: puedeGestionarOrganismos ? '#16a34a' : '#f97316',
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <ModulePageHeader
          title={t('liaison.title')}
          subtitle={t('liaison.subtitle')}
          icon={<Building2 className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
          accentColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
          actions={(
            <>
              <Button
                onClick={() => setMostrarGestionDemandes(true)}
                className="relative gap-2 rounded-xl text-white shadow-lg hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' }}
              >
                <MessageSquare className="h-4 w-4" />
                <span>{t('liaison.organismRequests')}</span>
                {nombreNouvellesDemandes > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg">
                    {nombreNouvellesDemandes}
                  </span>
                )}
              </Button>

              <Button
                onClick={() => openEmailModal('group')}
                className="gap-2 rounded-xl text-white shadow-lg hover:shadow-xl"
                style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
              >
                <Mail className="h-4 w-4" />
                <span>{t('liaison.sendGroupEmail')}</span>
              </Button>

              <Button
                onClick={() => {
                  if (!puedeGestionarOrganismos) {
                    toast.error(t('liaison.accessDenied'), {
                      description: t('liaison.accessDeniedDescription')
                    });
                    return;
                  }
                  setFormOrganismo(crearFormularioOrganismoVacio());
                  setModoEdicion(false);
                  setModoVisualizacion(false);
                  setOrganismoSeleccionado(null);
                  setOrganismoDialogOpen(true);
                }}
                disabled={!puedeGestionarOrganismos}
                className="gap-2 rounded-xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                style={puedeGestionarOrganismos ? { background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`, color: '#ffffff' } : undefined}
                title={!puedeGestionarOrganismos ? t('liaison.onlyLiaisonAdmins') : ''}
              >
                <Plus className="h-4 w-4" />
                <span>{t('liaison.newOrganism')}</span>
              </Button>
            </>
          )}
        />

        <ModuleExecutiveStrip
          eyebrow={t('liaison.executive.eyebrow')}
          title={t('liaison.executive.title')}
          description={t('liaison.executive.description')}
          accentColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
          metrics={liaisonExecutiveMetrics}
          actions={(
            <>
              <Button variant="outline" onClick={() => setTabActual('liaison')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                <Building2 className="mr-2 h-4 w-4" />
                {t('nav.liaison')}
              </Button>
              <Button variant="outline" onClick={() => setTabActual('contactos')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                <Users className="mr-2 h-4 w-4" />
                {t('nav.contacts')}
              </Button>
              <Button variant="outline" onClick={() => setMostrarEstadisticas((current) => !current)} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
                <BarChart3 className="mr-2 h-4 w-4" />
                {mostrarEstadisticas ? t('liaison.hideStats') : t('liaison.showStats')}
              </Button>
              <Button onClick={() => openEmailModal('group')} className="text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}>
                <Mail className="mr-2 h-4 w-4" />
                {t('liaison.groupEmail')}
              </Button>
            </>
          )}
        />

        <div className="flex flex-wrap gap-2">
          {usuarioSesion ? (
            <>
              <div className="inline-flex items-center gap-2 rounded-xl border border-green-200/60 bg-green-50/90 px-4 py-2 text-sm text-green-700 shadow-sm">
                <Mail className="h-4 w-4" />
                <span className="font-medium">{usuarioSesion.email}</span>
              </div>
              {puedeGestionarOrganismos ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200/60 bg-blue-50/90 px-4 py-2 text-sm text-blue-700 shadow-sm">
                  <span className="font-medium">{t('liaison.liaisonAdministrator')}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-xl border border-orange-200/60 bg-orange-50/90 px-4 py-2 text-sm text-orange-700 shadow-sm">
                  <span className="font-medium">{t('liaison.readOnlyAccess')}</span>
                </div>
              )}
            </>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-yellow-200/60 bg-yellow-50/90 px-4 py-2 text-sm text-yellow-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
              <span className="font-medium">{t('liaison.noConnectedUser')}</span>
            </div>
          )}
        </div>

        <ModuleStatsGrid defaultLayout="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ModuleStatCard
            label={t('liaison.totalOrganisms')}
            value={totalOrganismos}
            icon={<Building2 className="h-4 w-4 text-white" />}
            accentColor={branding.primaryColor}
          />
          <ModuleStatCard
            label={t('liaison.activeOrganisms')}
            value={organismosActivos}
            icon={<Check className="h-4 w-4 text-white" />}
            accentColor={branding.secondaryColor}
          />
          <ModuleStatCard
            label={t('liaison.totalBeneficiaries')}
            value={totalBeneficiarios}
            icon={<Users className="h-4 w-4 text-white" />}
            accentColor="#f97316"
            valueColor="#f97316"
          />
        </ModuleStatsGrid>

        {/* Tabs para Liaison y Contactos */}
        <Tabs value={tabActual} onValueChange={(value) => setTabActual(value as 'liaison' | 'contactos')} className="overflow-visible">
          <ModuleControlSurface>
            <ModuleControlSurfaceTabs>
              <TabsList className="app-compact-tabs-grid w-full gap-1 bg-transparent p-0" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                <TabsTrigger value="liaison" className="app-compact-tab-trigger flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Liaison avec Organismes
                </TabsTrigger>
                <TabsTrigger value="contactos" className="app-compact-tab-trigger flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Gestion des Contacts
                </TabsTrigger>
              </TabsList>
            </ModuleControlSurfaceTabs>
            <ModuleControlSurfaceBody className="space-y-6">

              <TabsContent value="liaison" className="space-y-6">
                <ModuleSection
                  title="Statistiques et rapports"
                  description="Accédez à la vue détaillée des tendances, exports et indicateurs de croissance de Liaison."
                  icon={TrendingUp}
                  variant="glass"
                  actions={(
                    <Button
                      type="button"
                      onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
                      className="gap-2 text-white shadow-lg hover:shadow-xl"
                      style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}
                    >
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        {mostrarEstadisticas ? 'Masquer les statistiques détaillées' : 'Voir les statistiques détaillées'}
                      </span>
                    </Button>
                  )}
                  contentClassName="pt-0"
                >
                  <div className="flex flex-wrap gap-2 text-sm text-[#5d7185]">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 shadow-sm">
                      <BarChart3 className="h-4 w-4" style={{ color: branding.primaryColor }} />
                      <span>Tendances, exports et croissance</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-1 shadow-sm">
                      <Calendar className="h-4 w-4" style={{ color: branding.secondaryColor }} />
                      <span>Filtres par période</span>
                    </div>
                  </div>
                </ModuleSection>

                {mostrarEstadisticas && (
                  <div className="card-glass rounded-[28px] border border-white/75 p-5 shadow-[0_28px_68px_-42px_rgba(15,45,71,0.3)] sm:p-7" ref={estadisticasRef}>
            {/* Header avec boutons d'actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                📊 Statistiques & Rapports de Croissance
              </h2>
              
              {/* Boutons d'action */}
              <div className="flex flex-wrap gap-2">
                {/* Bouton Imprimer */}
                <button
                  onClick={imprimirEstadisticas}
                  className="group relative bg-gradient-to-r from-[#1a4d7a] to-blue-700 hover:from-blue-700 hover:to-[#1a4d7a] text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Printer className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">Imprimer</span>
                </button>
                
                {/* Menú desplegable de descargas */}
                <div className="relative">
                  <button
                    onClick={() => setMenuDescargasAbierto(!menuDescargasAbierto)}
                    className="group relative bg-gradient-to-r from-[#2d9561] to-green-700 hover:from-green-700 hover:to-[#2d9561] text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 overflow-hidden"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <Download className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Télécharger</span>
                    <ChevronDown className={`w-4 h-4 transition-transform relative z-10 ${menuDescargasAbierto ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Menú dropdown */}
                  {menuDescargasAbierto && (
                    <>
                      {/* Backdrop */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setMenuDescargasAbierto(false)}
                      />
                      
                      {/* Menu */}
                      <div 
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                        style={{ fontFamily: 'Roboto, sans-serif' }}
                      >
                        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3">
                          <h3 className="text-white font-bold text-sm flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Options de Téléchargement
                          </h3>
                        </div>
                        
                        <div className="py-2">
                          <button
                            onClick={descargarPDF}
                            className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-all group border-b border-gray-100"
                          >
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                              <FileText className="w-5 h-5 text-red-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-red-600 transition-colors">Format PDF</div>
                              <div className="text-xs text-gray-500">Rapport professionnel imprimable</div>
                            </div>
                          </button>
                          
                          <button
                            onClick={descargarExcel}
                            className="w-full px-4 py-3 text-left hover:bg-green-50 flex items-center gap-3 transition-all group border-b border-gray-100"
                          >
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                              <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">Format Excel</div>
                              <div className="text-xs text-gray-500">4 feuilles éditables (.xlsx)</div>
                            </div>
                          </button>
                          
                          <button
                            onClick={descargarCSV}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                              <File className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Format CSV</div>
                              <div className="text-xs text-gray-500">Données brutes tabulaires</div>
                            </div>
                          </button>
                        </div>
                        
                        <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                          <p className="text-xs text-gray-600 text-center">
                            💾 Les fichiers incluent la période sélectionnée
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Filtres de période */}
            <div className="rounded-[24px] border border-white/75 bg-[linear-gradient(135deg,rgba(248,250,252,0.98)_0%,rgba(240,249,255,0.96)_100%)] p-6 mb-6 shadow-[0_18px_36px_-34px_rgba(15,45,71,0.2)]">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Calendar className="w-5 h-5 text-purple-600" />
                Filtrer par Période
              </h3>
              
              {/* Boutons de période prédéfinie */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => aplicarPeriodo('1mois')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodoSeleccionado === '1mois'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-300'
                  }`}
                >
                  1 Mois
                </button>
                <button
                  onClick={() => aplicarPeriodo('3mois')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodoSeleccionado === '3mois'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-300'
                  }`}
                >
                  3 Mois
                </button>
                <button
                  onClick={() => aplicarPeriodo('6mois')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodoSeleccionado === '6mois'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-300'
                  }`}
                >
                  6 Mois
                </button>
                <button
                  onClick={() => {
                    setPeriodoSeleccionado('personalizado');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodoSeleccionado === 'personalizado'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-purple-100 border border-gray-300'
                  }`}
                >
                  📅 Personnalisé
                </button>
              </div>

              {/* Selectores de fecha personalizados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 Date de Début
                  </label>
                  <input
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => {
                      setFechaInicio(e.target.value);
                      setPeriodoSeleccionado('personalizado');
                    }}
                    max={fechaFin}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 Date de Fin
                  </label>
                  <input
                    type="date"
                    value={fechaFin}
                    onChange={(e) => {
                      setFechaFin(e.target.value);
                      setPeriodoSeleccionado('personalizado');
                    }}
                    min={fechaInicio}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    style={{ fontFamily: 'Roboto, sans-serif' }}
                  />
                </div>
              </div>

              {/* Información de la période sélectionnée */}
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-purple-600">📅 Période sélectionnée:</span>{' '}
                  {new Date(fechaInicio).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' '}-{' '}
                  {new Date(fechaFin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' '}
                  <span className="text-gray-500">
                    ({Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24))} jours)
                  </span>
                </p>
                <button
                  onClick={() => {
                    aplicarPeriodo('6mois');
                  }}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                >
                  🔄 Réinitialiser
                </button>
              </div>
            </div>

            {/* Indicateur de données à exporter */}
            <div className="rounded-[22px] border border-white/80 bg-[linear-gradient(135deg,rgba(239,246,255,0.96)_0%,rgba(250,245,255,0.94)_100%)] p-4 mb-6 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Données Prêtes pour Export
                    </h4>
                    <p className="text-sm text-gray-600">
                      {dataCrecimientoAccreditacion.length + dataCrecimientoOrganismes.length} séries de données • {dataTypesOrganismes.length} catégories
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="px-3 py-1.5 bg-white rounded-full border border-blue-200">
                    <span className="font-medium text-blue-600">📊 {dataCrecimientoAccreditacion.length * 3} points de données</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé des statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="stat-card bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
                <div className="text-sm text-gray-600 mb-1">Demandes ce mois</div>
                <div className="stat-value text-2xl font-bold text-blue-600">45</div>
                <div className="text-xs text-green-600 mt-1">↑ 18% vs mois dernier</div>
              </div>
              <div className="stat-card bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
                <div className="text-sm text-gray-600 mb-1">Approuvées</div>
                <div className="stat-value text-2xl font-bold text-green-600">40</div>
                <div className="text-xs text-green-600 mt-1">Taux: 88.9%</div>
              </div>
              <div className="stat-card bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <div className="text-sm text-gray-600 mb-1">En attente</div>
                <div className="stat-value text-2xl font-bold text-orange-500">8</div>
                <div className="text-xs text-gray-500 mt-1">Traitement en cours</div>
              </div>
              <div className="stat-card bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                <div className="text-sm text-gray-600 mb-1">Croissance annuelle</div>
                <div className="stat-value text-2xl font-bold text-purple-600">+82%</div>
                <div className="text-xs text-purple-600 mt-1">vs année dernière</div>
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Graphique 1: Croissance des demandes d'accréditation */}
              <div className="rounded-[22px] border border-white/75 bg-white/78 p-6 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Croissance des Demandes d'Accréditation
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={datosFiltrados.dataCrecimientoAccreditacion}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="demandes" stroke="#1E73BE" strokeWidth={2} name="Demandes totales" />
                    <Line type="monotone" dataKey="approuvees" stroke="#4CAF50" strokeWidth={2} name="Approuvées" />
                    <Line type="monotone" dataKey="rejetees" stroke="#DC3545" strokeWidth={2} name="Rejetées" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique 2: Croissance des organismes */}
              <div className="rounded-[22px] border border-white/75 bg-white/78 p-6 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Croissance des Organismes
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosFiltrados.dataCrecimientoOrganismes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#1E73BE" name="Total" />
                    <Bar dataKey="actifs" fill="#4CAF50" name="Actifs" />
                    <Bar dataKey="inactifs" fill="#DC3545" name="Inactifs" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Graphique 3: Répartition par type */}
              <div className="rounded-[22px] border border-white/75 bg-white/78 p-6 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Répartition par Type d'Organisme
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={datosFiltrados.dataTypesOrganismes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {datosFiltrados.dataTypesOrganismes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>

              {/* Tableau de rapport */}
              <div className="rounded-[22px] border border-white/75 bg-white/78 p-6 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.22)]">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <FileText className="w-5 h-5 text-orange-600" />
                  Rapport Mensuel
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-2 px-2">Indicateur</th>
                      <th className="text-right py-2 px-2">Valeur</th>
                      <th className="text-right py-2 px-2">Évolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-2">Nouveaux organismes</td>
                      <td className="text-right py-2 px-2 font-bold">7</td>
                      <td className="text-right py-2 px-2 text-green-600">+12%</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-2">Demandes traitées</td>
                      <td className="text-right py-2 px-2 font-bold">45</td>
                      <td className="text-right py-2 px-2 text-green-600">+18%</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-2">Taux d'approbation</td>
                      <td className="text-right py-2 px-2 font-bold">88.9%</td>
                      <td className="text-right py-2 px-2 text-green-600">+3.2%</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-2">Bénéficiaires ajoutés</td>
                      <td className="text-right py-2 px-2 font-bold">2,450</td>
                      <td className="text-right py-2 px-2 text-green-600">+25%</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">Emails envoyés</td>
                      <td className="text-right py-2 px-2 font-bold">156</td>
                      <td className="text-right py-2 px-2 text-green-600">+8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analyses et recommandations */}
            <div className="rounded-[24px] border border-white/80 bg-[linear-gradient(135deg,rgba(239,246,255,0.95)_0%,rgba(255,255,255,0.95)_100%)] p-6 shadow-[0_18px_36px_-30px_rgba(15,45,71,0.2)]">
              <h3 className="text-lg font-bold text-gray-900 mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                💡 Analyses et Recommandations
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Croissance soutenue:</strong> Le nombre de demandes d'accréditation augmente de 18% par mois en moyenne</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span><strong>Taux d'approbation élevé:</strong> 88.9% des demandes sont approuvées, indiquant une bonne qualité des candidatures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">⚠</span>
                  <span><strong>Attention:</strong> 8 demandes en attente nécessitent un traitement prioritaire</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">→</span>
                  <span><strong>Recommandation:</strong> Considérer l'embauche d'un coordinateur supplémentaire pour gérer la croissance</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Búsqueda con glassmorphism */}
        <div className="card-glass rounded-[26px] border border-white/75 p-6 mb-6 relative overflow-hidden shadow-[0_20px_44px_-34px_rgba(15,45,71,0.24)]">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#1a4d7a]/10 rounded-full blur-2xl" />
          <Input
            type="text"
            placeholder={t('liaison.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative z-10 w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d7a] focus:border-transparent bg-white/88 backdrop-blur-sm transition-all"
          />
        </div>

        {/* Grid de Organismos */}
        {filteredOrganismos.length === 0 ? (
          <div className="card-glass rounded-[26px] border border-white/75 p-12 text-center shadow-[0_20px_44px_-34px_rgba(15,45,71,0.24)]">
            <p className="text-xl text-gray-600 mb-2">{t('liaison.noOrganismsFound')}</p>
            <p className="text-gray-500">{t('liaison.tryOtherSearchTerms')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrganismos.map((org) => (
              <div
                key={org.id}
                className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden"
              >
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-[#1a4d7a]/10 to-[#2d9561]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 flex-1">
                    {/* Logo del organismo */}
                    {org.logo && (
                      <div className="flex-shrink-0 w-16 h-16 border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <img 
                          src={org.logo} 
                          alt={`Logo ${org.nombre}`}
                          className="w-full h-full object-contain p-1"
                        />
                      </div>
                    )}
                    <div className="flex-1 relative z-10">
                      <h3 className="text-xl font-semibold text-[#1a4d7a] mb-2">{org.nombre}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-gradient-to-r from-[#1a4d7a] to-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
                          {org.tipo}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="relative z-10 bg-gradient-to-r from-[#2d9561] to-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
                    {t('liaison.active')}
                  </span>
                </div>

                <div className="relative z-10 space-y-2 mb-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0 text-[#1a4d7a]" />
                    <MapLink 
                      direccion={org.direccion} 
                      variant="inline"
                      showIcon={false}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      <strong>{org.responsable}</strong> • {org.beneficiarios} {t('liaison.beneficiaries')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{org.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{org.email}</span>
                  </div>
                  {org.claveAcceso && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🔑</span>
                      <span className="text-sm font-mono font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        {org.claveAcceso}
                      </span>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const exito = await copiarAlPortapapeles(org.claveAcceso || '');
                          if (exito) toast.success('✅ Clé copiée!');
                        }}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copier la clé"
                      >
                        <Copy className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="relative z-10 flex gap-2 pt-4 border-t border-gray-200/50">
                  <button
                    onClick={() => openEmailModal('individual', org.id)}
                    className="group bg-gradient-to-r from-[#2d9561] to-green-700 hover:from-green-700 hover:to-[#2d9561] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105"
                  >
                    <span>✉️</span>
                    {t('liaison.email')}
                  </button>
                  <button
                    onClick={() => {
                      handleVerPerfil(org);
                    }}
                    className="flex-1 border border-gray-300/50 hover:bg-white/80 backdrop-blur-sm text-gray-700 hover:text-[#1a4d7a] px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:border-[#1a4d7a]/30"
                  >
                    <span>👁️</span>
                    {t('liaison.viewProfile')}
                  </button>
                  <button
                    onClick={() => {
                      if (!puedeGestionarOrganismos) {
                        toast.error('⚠️ Accès refusé', {
                          description: 'Seuls les administrateurs de Liaison peuvent modifier des organismes.'
                        });
                        return;
                      }
                      handleEditarPerfil(org);
                    }}
                    disabled={!puedeGestionarOrganismos}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      puedeGestionarOrganismos
                        ? 'border border-gray-300/50 hover:bg-white/80 backdrop-blur-sm text-gray-700 hover:text-[#1a4d7a] cursor-pointer hover:scale-105 hover:border-[#1a4d7a]/30 shadow-sm hover:shadow-md'
                        : 'border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                    title={!puedeGestionarOrganismos ? 'Seuls les administrateurs de Liaison peuvent modifier des organismes' : ''}
                  >
                    <span>✏️</span>
                    {t('liaison.edit')}
                  </button>
                </div>
              </div>
            ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="contactos" className="space-y-6">
                <GestionContactosDepartamento 
                  departamentoId="4"
                  departamentoNombre="Liaison"
                />
              </TabsContent>
            </ModuleControlSurfaceBody>
          </ModuleControlSurface>
        </Tabs>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin"
          aria-describedby="email-modal-description"
        >
          <DialogHeader>
            <DialogTitle className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#4CAF50]" />
                {emailType === 'individual'
                  ? `${t('liaison.sendEmailTo')} ${currentRecipient?.nombre}`
                  : t('liaison.sendGroupEmailTitle')}
              </div>
            </DialogTitle>
            <DialogDescription id="email-modal-description">
              {emailType === 'individual' 
                ? t('liaison.emailModalIndividualDescription') 
                : t('liaison.emailModalGroupDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Destinatario Individual */}
            {emailType === 'individual' && currentRecipient && (
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-sm font-medium text-[#333333]">{currentRecipient.nombre}</p>
                <p className="text-sm text-[#666666]">{currentRecipient.email}</p>
              </div>
            )}

            {/* Selección Grupal */}
            {emailType === 'group' && (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_minmax(0,220px)_1fr] sm:items-end">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#333333]">Filtrer par jour de rendez-vous</Label>
                    <Select value={selectedDiaCitaFilter} onValueChange={setSelectedDiaCitaFilter}>
                      <SelectTrigger className="h-10 rounded-lg border-gray-200 bg-white">
                        <SelectValue placeholder="Tous les jours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les jours</SelectItem>
                        {diasCitaOptions.map((dia) => (
                          <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#333333]">Filtrer par classification</Label>
                    <Select value={selectedClasificacionFilter} onValueChange={(value) => setSelectedClasificacionFilter(value as 'all' | ClasificacionOrganismo)}>
                      <SelectTrigger className="h-10 rounded-lg border-gray-200 bg-white">
                        <SelectValue placeholder="Toutes les classifications" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les classifications</SelectItem>
                        {clasificacionOptions.map((clasificacion) => (
                          <SelectItem key={clasificacion.value} value={clasificacion.value}>{clasificacion.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-[#666666] sm:pb-2">
                    {organismosFiltradosModal.length} organisme(s) correspondent aux filtres sélectionnés.
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{t('liaison.selectOrganisms')}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="text-xs"
                  >
                    {todosLosOrganismosFiltradosSeleccionados
                      ? t('liaison.deselectAll')
                      : t('liaison.selectAll')}
                  </Button>
                </div>

                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {organismosFiltradosModal.length > 0 ? organismosFiltradosModal.map((org) => (
                    <label
                      key={org.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOrganismos.includes(org.id)}
                        onChange={() => toggleOrganismo(org.id)}
                        className="w-4 h-4"
                      />
                      {org.logo && (
                        <div className="flex-shrink-0 w-10 h-10 border border-gray-200 rounded overflow-hidden bg-white">
                          <img 
                            src={org.logo} 
                            alt={`Logo ${org.nombre}`}
                            className="w-full h-full object-contain p-0.5"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{org.nombre}</p>
                        <p className="text-xs text-[#666666]">{org.email}</p>
                        <p className="text-xs text-[#8a8a8a]">Jour de rendez-vous: {org.diaCita || 'Non défini'}</p>
                        <p className="text-xs text-[#8a8a8a]">Classification: {clasificacionOptions.find((item) => item.value === getClasificacionOrganismo(org))?.label || 'Non définie'}</p>
                      </div>
                    </label>
                  )) : (
                    <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-sm text-[#666666]">
                      Aucun organisme ne correspond aux filtres sélectionnés.
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-[#1E73BE] font-medium">
                    {selectedOrganismos.length} {t('liaison.organismsSelected')}
                  </p>
                </div>
              </div>
            )}

            {/* Formulario */}
            <div className="space-y-2">
              <Label>{t('liaison.subject')}</Label>
              <Input
                placeholder={t('liaison.subjectPlaceholder')}
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('liaison.message')}</Label>
              <Textarea
                placeholder={t('liaison.messagePlaceholder')}
                rows={8}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="resize-none"
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-[#666666]">
                  {t('liaison.demoSystemWarning')}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={closeEmailModal}
            >
              {t('liaison.cancel')}
            </Button>
            <Button
              onClick={sendEmail}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
              disabled={!canSend()}
            >
              <Send className="w-4 h-4 mr-2" />
              {t('liaison.sendEmail')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogo de Organismo */}
      <FormularioOrganismoCompacto
        abierto={organismoDialogOpen}
        onCerrar={() => {
          setOrganismoDialogOpen(false);
          setModoEdicion(false);
          setModoVisualizacion(false);
        }}
        formulario={formOrganismo}
        setFormulario={setFormOrganismo}
        modoEdicion={modoEdicion}
        modoVisualizacion={modoVisualizacion}
        onGuardar={modoEdicion ? handleGuardarCambios : handleCrearOrganismo}
        tiposOrganismo={tiposOrganismo}
      />

      {/* Diálogo de Clave Generada */}
      <Dialog open={claveGeneradaDialog} onOpenChange={setClaveGeneradaDialog}>
        <DialogContent className="max-w-md" aria-describedby="clave-generada-description">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#4CAF50] flex items-center gap-2">
              <Check className="w-6 h-6" />
              Organisme Créé avec Succès!
            </DialogTitle>
            <DialogDescription id="clave-generada-description">
              L'organisme a été enregistré et une clé d'accès unique a été générée
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Información del organismo */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Nom de l'organisme:</p>
              <p className="text-lg font-semibold text-gray-900">{nombreOrganismoCreado}</p>
            </div>

            {/* Clave de acceso */}
            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm font-medium text-gray-700">Clé d'Accès Unique:</p>
                </div>
                <button
                  onClick={async () => {
                    const exito = await copiarAlPortapapeles(claveGenerada);
                    if (exito) toast.success('✅ Clé copiée dans le presse-papiers!');
                  }}
                  className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                  title="Copier la clé"
                >
                  <Copy className="w-4 h-4 text-green-700" />
                </button>
              </div>
              
              <div className="bg-white border-2 border-green-400 rounded-lg p-4 text-center">
                <p className="text-3xl font-mono font-bold text-green-700 tracking-wider">
                  {claveGenerada}
                </p>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-2">
                📋 Important - Gardez cette clé en sécurité
              </p>
              <ul className="text-xs text-yellow-700 space-y-1.5 ml-4">
                <li>• Cette clé permet à l'organisme d'accéder au module Comptoir</li>
                <li>• Partagez-la uniquement avec les responsables autorisés</li>
                <li>• Vous pouvez toujours la consulter dans le profil de l'organisme</li>
                <li>• La clé est unique et ne peut pas être modifiée</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={async () => {
                const exito = await copiarAlPortapapeles(claveGenerada);
                if (exito) toast.success('✅ Clé copiée!');
              }}
              className="flex-1 border-green-500 text-green-700 hover:bg-green-50"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copier la Clé
            </Button>
            <Button
              onClick={() => {
                setClaveGeneradaDialog(false);
                toast.success(`✨ Organisme "${nombreOrganismoCreado}" créé avec succès!`);
              }}
              className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Terminer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}