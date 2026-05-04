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
import { PerfilOrganismoDialog } from '../organismos/PerfilOrganismoDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { generarClaveAcceso } from '../../utils/claveAcceso';
import { MapLink } from '../ui/map-link';
import { GestionDemandes } from '../liaison/GestionDemandes';
import { obtenirNombreNouvellesDemandes } from '../../utils/demandesStorage';
import { obtenerPersonasPorOrganismo } from '../../utils/personasResponsablesStorage';
import { SelecteurJoursDisponibles, type JourDisponible } from '../shared/SelecteurJoursDisponibles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { 
  obtenerOrganismos, 
  crearOrganismo, 
  actualizarOrganismo,
  migrarClavesDeAcceso,
  type Organismo,
  type IdiomaContactoOrganismo
} from '../../utils/organismosStorage';
import { 
  obtenerConfigEmail,
  enviarEmail as enviarEmailService
} from '../../utils/emailConfig';
import { copiarAlPortapapeles } from '../../utils/clipboard';
import { obtenerUsuarioSesion, esAdministradorLiaison } from '../../utils/sesionStorage';

// Tipos de organismos predefinidos
const getTiposOrganismo = (t: any) => [
  { id: '1', nombre: t('organisms.organismTypes.communityKitchen'), icono: '🍽️' },
  { id: '2', nombre: t('organisms.organismTypes.foundation'), icono: '🏛️' },
  { id: '3', nombre: t('organisms.organismTypes.ngo'), icono: '🤝' },
  { id: '4', nombre: t('organisms.organismTypes.shelter'), icono: '🏠' },
  { id: '5', nombre: t('organisms.organismTypes.dayCenter'), icono: '☀️' },
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

export function EmailOrganismos({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t } = useTranslation();
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

  // Estados para funcionalidades adicionales
  const [organismoDialogOpen, setOrganismoDialogOpen] = useState(false);
  const [perfilDialogOpen, setPerfilDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
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
  const [formOrganismo, setFormOrganismo] = useState({
    nombre: '',
    tipo: '',
    codigoPostal: '',
    direccion: '',
    quartier: '',
    responsable: '',
    beneficiarios: 0,
    telefono: '',
    email: '',
    frecuenciaCita: '',
    horaCita: '',
    participantePRS: false,
    regular: true,
    activo: true,
    personasServidas: 0,
    cantidadColaciones: 0,
    cantidadAlmuerzos: 0,
    porcentajeReparticion: 0,
    notas: '',
    notificaciones: true,
    logo: null as string | null,
    documentoPDF: null as string | null,
    contactosNotificacion: [{ nombre: '', email: '', cargo: '', joursDisponibles: [] as JourDisponible[] }],
    fechaInicioInactividad: '',
    fechaFinInactividad: ''
  });

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
            ${contenido}
            <div class="footer">
              <p>© ${new Date().getFullYear()} Banque Alimentaire - Système de Gestion</p>
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
      doc.text(`© ${new Date().getFullYear()} Banque Alimentaire - Page ${i}/${pageCount}`, 14, doc.internal.pageSize.height - 10);
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
    // Generar clave de acceso única
    const claveAcceso = generarClaveAcceso(formOrganismo.nombre);

    try {
      // Crear el organismo en el storage
      crearOrganismo({
        nombre: formOrganismo.nombre,
        tipo: formOrganismo.tipo,
        email: formOrganismo.email,
        telefono: formOrganismo.telefono,
        direccion: formOrganismo.direccion,
        codigoPostal: formOrganismo.codigoPostal,
        quartier: formOrganismo.quartier,
        zona: '',
        responsable: formOrganismo.responsable,
        beneficiarios: formOrganismo.beneficiarios,
        activo: formOrganismo.activo,
        regular: formOrganismo.regular,
        participantePRS: formOrganismo.participantePRS,
        frecuenciaCita: formOrganismo.frecuenciaCita,
        horaCita: formOrganismo.horaCita,
        personasServidas: formOrganismo.personasServidas,
        cantidadColaciones: formOrganismo.cantidadColaciones,
        cantidadAlmuerzos: formOrganismo.cantidadAlmuerzos,
        porcentajeReparticion: formOrganismo.porcentajeReparticion,
        notas: formOrganismo.notas,
        notificaciones: formOrganismo.notificaciones,
        logo: formOrganismo.logo,
        documentoPDF: formOrganismo.documentoPDF,
        claveAcceso: claveAcceso,
        contactosNotificacion: formOrganismo.contactosNotificacion
      });
      
      // Recargar la lista de organismos
      cargarOrganismos();
      
      console.log('Organismo creado con clave:', claveAcceso);
      
      // Guardar la clave generada y nombre para mostrar en el diálogo
      setClaveGenerada(claveAcceso);
      setNombreOrganismoCreado(formOrganismo.nombre);
      
      // Cerrar diálogo de creación
      setOrganismoDialogOpen(false);
      
      // Mostrar diálogo con la clave generada
      setClaveGeneradaDialog(true);
      
      // Resetear formulario
      setFormOrganismo({
        nombre: '',
        tipo: '',
        codigoPostal: '',
        direccion: '',
        quartier: '',
        responsable: '',
        beneficiarios: 0,
        telefono: '',
        email: '',
        frecuenciaCita: '',
        horaCita: '',
        participantePRS: false,
        regular: true,
        activo: true,
        personasServidas: 0,
        cantidadColaciones: 0,
        cantidadAlmuerzos: 0,
        porcentajeReparticion: 0,
        notas: '',
        notificaciones: true,
        logo: null,
        documentoPDF: null,
        contactosNotificacion: [{ nombre: '', email: '', cargo: '', joursDisponibles: [] }],
        fechaInicioInactividad: '',
        fechaFinInactividad: ''
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de l\'organisme');
    }
  };

  const handleGuardarCambios = () => {
    if (organismoSeleccionado && organismoSeleccionado.id) {
      try {
        // Actualizar el organismo en el storage
        actualizarOrganismo(organismoSeleccionado.id, {
          nombre: formOrganismo.nombre,
          tipo: formOrganismo.tipo,
          email: formOrganismo.email,
          telefono: formOrganismo.telefono,
          direccion: formOrganismo.direccion,
          codigoPostal: formOrganismo.codigoPostal,
          quartier: formOrganismo.quartier,
          responsable: formOrganismo.responsable,
          beneficiarios: formOrganismo.beneficiarios,
          activo: formOrganismo.activo,
          regular: formOrganismo.regular,
          participantePRS: formOrganismo.participantePRS,
          frecuenciaCita: formOrganismo.frecuenciaCita,
          horaCita: formOrganismo.horaCita,
          personasServidas: formOrganismo.personasServidas,
          cantidadColaciones: formOrganismo.cantidadColaciones,
          cantidadAlmuerzos: formOrganismo.cantidadAlmuerzos,
          porcentajeReparticion: formOrganismo.porcentajeReparticion,
          notas: formOrganismo.notas,
          notificaciones: formOrganismo.notificaciones,
          logo: formOrganismo.logo,
          documentoPDF: formOrganismo.documentoPDF,
          contactosNotificacion: formOrganismo.contactosNotificacion,
          fechaInicioInactividad: formOrganismo.fechaInicioInactividad,
          fechaFinInactividad: formOrganismo.fechaFinInactividad
        });
        
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
  };

  // Toggle organismo seleccionado
  const toggleOrganismo = (organismoId: string) => {
    setSelectedOrganismos(prev =>
      prev.includes(organismoId)
        ? prev.filter(id => id !== organismoId)
        : [...prev, organismoId]
    );
  };

  // Seleccionar/Deseleccionar todos
  const toggleSelectAll = () => {
    if (selectedOrganismos.length === organismos.length) {
      setSelectedOrganismos([]);
    } else {
      setSelectedOrganismos(organismos.map(o => o.id));
    }
  };

  // Enviar email
  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error(t('liaison.completeAllFields'));
      return;
    }

    // Verificar que haya un usuario en sesión
    if (!usuarioSesion) {
      toast.error('⚠️ Aucun utilisateur connecté. Veuillez vous connecter pour envoyer des emails.', {
        duration: 5000
      });
      return;
    }

    // Preparar destinatarios
    let destinatarios: string[] = [];
    if (emailType === 'individual' && currentRecipient) {
      destinatarios = [currentRecipient.email];
    } else {
      const organismosSeleccionados = organismos.filter(o => selectedOrganismos.includes(o.id));
      destinatarios = organismosSeleccionados.map(o => o.email);
    }

    if (destinatarios.length === 0) {
      toast.error(t('liaison.selectAtLeastOneOrganism'));
      return;
    }

    // Simular envío de email desde el usuario conectado
    try {
      if (emailType === 'individual') {
        toast.success(`✉️ Email envoyé avec succès à ${currentRecipient?.nombre}`, {
          description: `De: ${usuarioSesion.email}`,
          duration: 5000
        });
        console.log('Email individual enviado:', {
          de: usuarioSesion.email,
          nombreRemitente: `${usuarioSesion.nombre} ${usuarioSesion.apellido}`,
          destinatario: currentRecipient,
          asunto: emailSubject,
          mensaje: emailMessage,
          fecha: new Date().toISOString()
        });
      } else {
        toast.success(`✉️ Email envoyé avec succès à ${selectedOrganismos.length} organismes`, {
          description: `De: ${usuarioSesion.email}`,
          duration: 5000
        });
        console.log('Email grupal enviado:', {
          de: usuarioSesion.email,
          nombreRemitente: `${usuarioSesion.nombre} ${usuarioSesion.apellido}`,
          destinatarios: organismos.filter(o => selectedOrganismos.includes(o.id)),
          asunto: emailSubject,
          mensaje: emailMessage,
          fecha: new Date().toISOString()
        });
      }
    } catch (error) {
      toast.error('❌ Erreur lors de l\'envoi de l\'email');
      console.error('Error enviando email:', error);
    }

    closeEmailModal();
  };

  // Función para convertir organismo a formato compatible con PerfilOrganismoDialog
  const convertirOrganismoAFormulario = (org: Organismo) => {
    return {
      nombre: org.nombre,
      tipo: org.tipo,
      codigoPostal: org.codigoPostal || '',
      direccion: org.direccion,
      responsable: org.responsable,
      beneficiarios: org.beneficiarios,
      telefono: org.telefono,
      email: org.email,
      activo: org.activo,
      claveAcceso: org.claveAcceso || '',
      zona: (org as any).zona || '',
      frecuenciaCita: (org as any).frecuenciaCita || '',
      horaCita: (org as any).horaCita || '',
      participantePRS: (org as any).participantePRS || false,
      regular: (org as any).regular !== undefined ? (org as any).regular : true,
      personasServidas: (org as any).personasServidas || 0,
      cantidadColaciones: (org as any).cantidadColaciones || 0,
      cantidadAlmuerzos: (org as any).cantidadAlmuerzos || 0,
      porcentajeReparticion: (org as any).porcentajeReparticion || 0,
      notas: (org as any).notas || '',
      notificaciones: (org as any).notificaciones !== undefined ? (org as any).notificaciones : true,
      logo: (org as any).logo || null,
      documentoPDF: (org as any).documentoPDF || null,
      contactosNotificacion: (org as any).contactosNotificacion || [],
      fechaInicioInactividad: (org as any).fechaInicioInactividad || '',
      fechaFinInactividad: (org as any).fechaFinInactividad || ''
    };
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
    return <GestionDemandes />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo degradado moderno */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1a4d7a] via-[#2d5f8d] to-[#2d9561] -z-10" />
      
      {/* Patrón de puntos decorativo */}
      <div 
        className="fixed inset-0 opacity-10 -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      <div className="max-w-7xl mx-auto p-6">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-2xl border border-white/20 p-8 mb-6 relative overflow-hidden">
          {/* Efecto de brillo sutil */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]" />
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#1a4d7a] mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                  📋
                </div>
                {t('liaison.title')}
              </h1>
              <p className="text-gray-600 text-lg ml-[60px]">{t('liaison.subtitle')}</p>
              
              {/* Indicador de usuario conectado y permisos */}
              <div className="mt-4 flex flex-wrap gap-2 ml-[60px]">
                {usuarioSesion ? (
                  <>
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 text-green-700 px-4 py-2 rounded-xl text-sm shadow-sm backdrop-blur-sm">
                      <Mail className="w-4 h-4" />
                      <span className="font-medium">
                        {usuarioSesion.email}
                      </span>
                    </div>
                    {puedeGestionarOrganismos ? (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-blue-700 px-4 py-2 rounded-xl text-sm shadow-sm backdrop-blur-sm">
                        <span className="font-medium">✓ Administrateur Liaison</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/50 text-orange-700 px-4 py-2 rounded-xl text-sm shadow-sm backdrop-blur-sm">
                        <span className="font-medium">👁️ Accès lecture seule</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200/50 text-yellow-700 px-4 py-2 rounded-xl text-sm shadow-sm backdrop-blur-sm">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    <span className="font-medium">
                      Aucun utilisateur connecté
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setMostrarGestionDemandes(true)}
                className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <MessageSquare className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Demandes des Organismes</span>
                {nombreNouvellesDemandes > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
                    {nombreNouvellesDemandes}
                  </span>
                )}
              </button>
              <button
                onClick={() => openEmailModal('group')}
                className="group relative bg-gradient-to-r from-[#2d9561] to-green-700 hover:from-green-700 hover:to-[#2d9561] text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="text-xl relative z-10">✉️</span>
                <span className="relative z-10">{t('liaison.sendGroupEmail')}</span>
              </button>
              <button
                onClick={() => {
                  if (!puedeGestionarOrganismos) {
                    toast.error('⚠️ Accès refusé', {
                      description: 'Seuls les administrateurs de Liaison peuvent créer des organismes.'
                    });
                    return;
                  }
                  // Resetear formulario para nuevo organismo
                  setFormOrganismo({
                    nombre: '',
                    tipo: '',
                    codigoPostal: '',
                    direccion: '',
                    responsable: '',
                    beneficiarios: 0,
                    telefono: '',
                    email: '',
                    frecuenciaCita: '',
                    horaCita: '',
                    participantePRS: false,
                    regular: true,
                    activo: true,
                    personasServidas: 0,
                    cantidadColaciones: 0,
                    cantidadAlmuerzos: 0,
                    porcentajeReparticion: 0,
                    notas: '',
                    notificaciones: true,
                    logo: null,
                    documentoPDF: null,
                    contactosNotificacion: [{ nombre: '', email: '', cargo: '', joursDisponibles: [] }],
                    fechaInicioInactividad: '',
                    fechaFinInactividad: ''
                  });
                  setModoEdicion(false);
                  setOrganismoSeleccionado(null);
                  setOrganismoDialogOpen(true);
                }}
                disabled={!puedeGestionarOrganismos}
                className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg overflow-hidden ${
                  puedeGestionarOrganismos 
                    ? 'bg-gradient-to-r from-[#1a4d7a] to-blue-700 hover:from-blue-700 hover:to-[#1a4d7a] text-white hover:shadow-xl hover:scale-105 cursor-pointer' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                }`}
                title={!puedeGestionarOrganismos ? 'Seuls les administrateurs de Liaison peuvent créer des organismes' : ''}
              >
                {puedeGestionarOrganismos && (
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                )}
                <span className="text-xl relative z-10">➕</span>
                <span className="relative z-10">{t('liaison.newOrganism')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs para Liaison y Contactos */}
        <Tabs value={tabActual} onValueChange={(value) => setTabActual(value as 'liaison' | 'contactos')} className="space-y-6">
          <div className="card-glass rounded-2xl p-4 shadow-xl">
            <TabsList className="w-full grid grid-cols-2 bg-gray-100">
              <TabsTrigger value="liaison" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Liaison avec Organismes
              </TabsTrigger>
              <TabsTrigger value="contactos" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gestion des Contacts
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="liaison" className="space-y-6">
        {/* Estadísticas con glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#1a4d7a] to-blue-400" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#1a4d7a]/10 rounded-full blur-2xl group-hover:bg-[#1a4d7a]/20 transition-all duration-300" />
            <div className="relative">
              <div className="text-gray-600 text-sm mb-2 font-medium">{t('liaison.totalOrganisms')}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#1a4d7a] to-blue-600 bg-clip-text text-transparent">
                {totalOrganismos}
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2d9561] to-green-400" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2d9561]/10 rounded-full blur-2xl group-hover:bg-[#2d9561]/20 transition-all duration-300" />
            <div className="relative">
              <div className="text-gray-600 text-sm mb-2 font-medium">{t('liaison.activeOrganisms')}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-[#2d9561] to-green-600 bg-clip-text text-transparent">
                {organismosActivos}
              </div>
            </div>
          </div>
          <div className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-500 to-orange-400" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-300" />
            <div className="relative">
              <div className="text-gray-600 text-sm mb-2 font-medium">{t('liaison.totalBeneficiaries')}</div>
              <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {totalBeneficiarios}
              </div>
            </div>
          </div>
        </div>

        {/* Bouton Statistiques Détaillées con glassmorphism */}
        <div className="mb-6">
          <button
            onClick={() => setMostrarEstadisticas(!mostrarEstadisticas)}
            className="group relative w-full backdrop-blur-xl bg-gradient-to-r from-[#1a4d7a] via-purple-600 to-[#2d9561] hover:from-blue-700 hover:via-purple-700 hover:to-green-700 text-white px-6 py-5 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-2xl hover:scale-[1.02] overflow-hidden"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <TrendingUp className="w-6 h-6 relative z-10" />
            <span className="relative z-10">
              {mostrarEstadisticas ? '📊 Masquer les Statistiques Détaillées' : '📊 Voir les Statistiques Détaillées & Rapports'}
            </span>
          </button>
        </div>

        {/* Section Statistiques Détaillées con glassmorphism */}
        {mostrarEstadisticas && (
          <div className="mb-6 backdrop-blur-xl bg-white/95 rounded-2xl shadow-2xl border border-white/20 p-8" ref={estadisticasRef}>
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
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6 border border-purple-200">
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border-l-4 border-blue-600">
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
              <div className="bg-gray-50 p-6 rounded-lg">
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
              <div className="bg-gray-50 p-6 rounded-lg">
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
              <div className="bg-gray-50 p-6 rounded-lg">
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
              <div className="bg-gray-50 p-6 rounded-lg">
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
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
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
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-6 mb-6 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#1a4d7a]/10 rounded-full blur-2xl" />
          <input
            type="text"
            placeholder={t('liaison.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="relative z-10 w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a4d7a] focus:border-transparent bg-white/80 backdrop-blur-sm transition-all"
          />
        </div>

        {/* Grid de Organismos */}
        {filteredOrganismos.length === 0 ? (
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-12 text-center">
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
                      setOrganismoSeleccionado(org);
                      setPerfilDialogOpen(true);
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
                      setOrganismoSeleccionado(org);
                      // Cargar datos del organismo en el formulario
                      setFormOrganismo({
                        nombre: org.nombre,
                        tipo: org.tipo,
                        codigoPostal: org.codigoPostal || '',
                        direccion: org.direccion,
                        quartier: org.quartier || '',
                        responsable: org.responsable,
                        beneficiarios: org.beneficiarios,
                        telefono: org.telefono,
                        email: org.email,
                        frecuenciaCita: org.frecuenciaCita || '',
                        horaCita: org.horaCita || '',
                        participantePRS: org.participantePRS,
                        regular: org.regular,
                        activo: org.activo,
                        personasServidas: org.personasServidas,
                        cantidadColaciones: org.cantidadColaciones,
                        cantidadAlmuerzos: org.cantidadAlmuerzos,
                        porcentajeReparticion: org.porcentajeReparticion,
                        notas: org.notas || '',
                        notificaciones: org.notificaciones,
                        logo: org.logo || null,
                        documentoPDF: org.documentoPDF || null,
                        contactosNotificacion: org.contactosNotificacion && org.contactosNotificacion.length > 0 
                          ? org.contactosNotificacion.map(c => ({
                              nombre: c.nombre,
                              email: c.email,
                              cargo: c.cargo,
                              joursDisponibles: c.joursDisponibles || []
                            }))
                          : [{ nombre: '', email: '', cargo: '', joursDisponibles: [] }],
                        fechaInicioInactividad: '',
                        fechaFinInactividad: ''
                      });
                      setModoEdicion(true);
                      setOrganismoDialogOpen(true);
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
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">{t('liaison.selectOrganisms')}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="text-xs"
                  >
                    {selectedOrganismos.length === organismos.length
                      ? t('liaison.deselectAll')
                      : t('liaison.selectAll')}
                  </Button>
                </div>

                <div className="border rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                  {organismos.map((org) => (
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
                      </div>
                    </label>
                  ))}
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
      <Dialog open={organismoDialogOpen} onOpenChange={setOrganismoDialogOpen}>
        <DialogContent 
          className="!max-w-none !w-screen !h-screen !top-0 !left-0 !translate-x-0 !translate-y-0 !rounded-none overflow-y-auto p-0 m-0"
          aria-describedby="organismo-dialog-description"
        >
          <DialogHeader className="sticky top-0 z-10 bg-white border-b px-6 py-4 shadow-sm">
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
              {t('organisms.newOrganismForm')}
            </DialogTitle>
            <DialogDescription id="organismo-dialog-description">
              {t('organisms.formDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4 px-8">
            {/* Información Básica */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-[#333333] pb-2 border-b-2 border-[#1E73BE] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Building2 className="w-5 h-5 text-[#1E73BE]" />
                {t('organisms.basicInfo')}
              </h3>
              <div className="grid grid-cols-6 gap-4">
                {/* Campo de Logo */}
                <div className="col-span-6 space-y-3" style={{ 
                  backgroundColor: '#FFF0F0', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '3px solid #DC3545',
                  marginBottom: '12px'
                }}>
                  <Label className="text-[#DC3545] font-bold text-2xl flex items-center gap-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    🎨 {t('organisms.version.form.logoField.title')}
                    <Badge className="bg-[#DC3545] text-white text-sm px-3 py-1">
                      {t('organisms.version.form.logoField.badge')}
                    </Badge>
                  </Label>
                  
                  <div className="flex items-start gap-4">
                    {/* Vista previa del logo */}
                    <div className="flex-shrink-0">
                      {formOrganismo.logo ? (
                        <div className="relative w-32 h-32 border-2 border-[#1E73BE] rounded-lg overflow-hidden bg-white">
                          <img 
                            src={formOrganismo.logo} 
                            alt="Logo" 
                            className="w-full h-full object-contain p-2"
                          />
                          <button
                            type="button"
                            onClick={() => setFormOrganismo({ ...formOrganismo, logo: null })}
                            className="absolute top-1 right-1 bg-[#DC3545] text-white rounded-full p-1 hover:bg-[#c82333] transition-colors"
                            title="Supprimer le logo"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-32 h-32 border-2 border-dashed border-[#1E73BE] rounded-lg flex items-center justify-center bg-white">
                          <Upload className="w-8 h-8 text-[#1E73BE] opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Botón de carga */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <input
                          type="file"
                          id="logo-upload"
                          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormOrganismo({ ...formOrganismo, logo: reader.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {formOrganismo.logo ? 'Changer le logo' : 'Télécharger le logo'}
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-[#666666]">
                          📁 Formats acceptés: PNG, JPG, SVG
                        </p>
                        <p className="text-sm text-[#666666]">
                          📏 Taille recommandée: 500x500 pixels
                        </p>
                        <p className="text-xs text-[#1E73BE]">
                          💡 Le logo sera affiché sur les documents et rapports de l'organisme
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-3 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.organismName')} *</Label>
                  <Input 
                    placeholder={t('organisms.organismNamePlaceholder')} 
                    value={formOrganismo.nombre}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, nombre: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>
                
                <div className="col-span-3 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.type')} *</Label>
                  <Select 
                    value={formOrganismo.tipo}
                    onValueChange={(value) => setFormOrganismo({ ...formOrganismo, tipo: value })}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder={t('organisms.selectType')} />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposOrganismo.map(tipo => (
                        <SelectItem key={tipo.id} value={tipo.nombre} className="text-base">
                          {tipo.icono} {tipo.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* ⭐ CAMPO QUARTIER - ULTRA VISIBLE ⭐ */}
                <div className="col-span-6 space-y-3" style={{ 
                  backgroundColor: '#FFF9E6', 
                  padding: '20px', 
                  borderRadius: '12px', 
                  border: '4px solid #FFC107', 
                  boxShadow: '0 4px 20px rgba(255, 193, 7, 0.4)',
                  marginBottom: '8px'
                }}>
                  <Label className="text-[#333333] font-bold text-xl flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    🏘️ Quartier de Laval *
                    <Badge className="bg-[#FFC107] text-black">REQUIS</Badge>
                  </Label>
                  <Select 
                    value={formOrganismo.quartier || ''}
                    onValueChange={(value) => setFormOrganismo({ ...formOrganismo, quartier: value })}
                  >
                    <SelectTrigger className="bg-white h-14 text-lg border-2 border-[#FFC107]">
                      <SelectValue placeholder="⚠️ Sélectionnez un quartier de Laval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Auteuil">Auteuil</SelectItem>
                      <SelectItem value="Chomedey">Chomedey</SelectItem>
                      <SelectItem value="Duvernay">Duvernay</SelectItem>
                      <SelectItem value="Fabreville">Fabreville</SelectItem>
                      <SelectItem value="Laval-des-Rapides">Laval-des-Rapides</SelectItem>
                      <SelectItem value="Laval-Ouest">Laval-Ouest</SelectItem>
                      <SelectItem value="Laval-sur-le-Lac">Laval-sur-le-Lac</SelectItem>
                      <SelectItem value="Pont-Viau">Pont-Viau</SelectItem>
                      <SelectItem value="Sainte-Dorothée">Sainte-Dorothée</SelectItem>
                      <SelectItem value="Sainte-Rose">Sainte-Rose</SelectItem>
                      <SelectItem value="Saint-François">Saint-François</SelectItem>
                      <SelectItem value="Saint-Vincent-de-Paul">Saint-Vincent-de-Paul</SelectItem>
                      <SelectItem value="Vimont">Vimont</SelectItem>
                      <SelectItem value="Îles-Laval">Îles-Laval</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-[#666666] font-medium">
                    📍 Sélectionnez le quartier de Laval où se trouve l'organisme
                  </p>
                </div>

                <div className="col-span-4 space-y-2 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Label>{t('organisms.fullAddress')} *</Label>
                    <Badge className="bg-gradient-to-r from-[#1E73BE] to-[#4CAF50] text-white text-xs">
                      🔍 Auto-complétion intelligente
                    </Badge>
                  </div>
                  <AddressAutocomplete
                    onAddressSelect={(address) => {
                      setFormOrganismo({
                        ...formOrganismo,
                        direccion: address.street,
                        codigoPostal: address.postalCode,
                        quartier: address.quartier || ''
                      });
                      toast.success('📍 Adresse complétée automatiquement', {
                        description: `Code postal: ${address.postalCode} • Ville: ${address.city}${address.quartier ? ` • Quartier: ${address.quartier}` : ''}`
                      });
                    }}
                    disabled={false}
                    initialValue={formOrganismo.direccion}
                    initialQuartier={formOrganismo.quartier || ''}
                    label=""
                    placeholder="💡 Tapez le numéro civique et la rue (ex: 123 Boulevard Saint-Martin Est)"
                    required={true}
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="text-xs text-[#1E73BE] font-medium flex items-center gap-2">
                      <span className="text-base">ℹ️</span>
                      <span>
                        {t('organisms.addressHelp')} Le code postal sera automatiquement rempli lors de la sélection.
                      </span>
                    </p>
                  </div>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    {t('organisms.postalCode')} *
                    <Badge variant="outline" className="text-xs bg-blue-50 text-[#1E73BE] border-[#1E73BE]">
                      Auto
                    </Badge>
                  </Label>
                  <div className="relative">
                    <Input 
                      placeholder={t('organisms.postalCodePlaceholder')}
                      value={formOrganismo.codigoPostal}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, codigoPostal: e.target.value })}
                      readOnly
                      className="bg-blue-50 border-blue-200 font-medium h-11 text-base"
                    />
                    {formOrganismo.codigoPostal && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4CAF50]" />
                    )}
                  </div>
                  <p className="text-xs text-[#1E73BE] font-medium flex items-center gap-1">
                    ✨ {t('organisms.postalCodeAutoFill')}
                  </p>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.responsible')} *</Label>
                  {personasAutorizadas.length > 0 ? (
                    <Select 
                      value={formOrganismo.responsable}
                      onValueChange={(value) => setFormOrganismo({ ...formOrganismo, responsable: value })}
                    >
                      <SelectTrigger className="h-11 text-base">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-auto">
                        {personasAutorizadas.map(persona => (
                          <SelectItem key={persona.id} value={persona.nombreCompleto} className="text-base">
                            {persona.nombreCompleto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      placeholder={t('organisms.responsablePlaceholder')} 
                      value={formOrganismo.responsable}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, responsable: e.target.value })}
                      className="h-11 text-base"
                    />
                  )}
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.beneficiariesNumber')} *</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formOrganismo.beneficiarios || ''}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, beneficiarios: parseInt(e.target.value) || 0 })}
                    className="h-11 text-base"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.phone')} *</Label>
                  <Input 
                    placeholder="(514) 555-0100" 
                    value={formOrganismo.telefono}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, telefono: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.emailLabel')} *</Label>
                  <Input 
                    type="email" 
                    placeholder="contact@organisme.ca" 
                    value={formOrganismo.email}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, email: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>

                {/* Campo de Clave de Acceso */}
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    🔑 {t('organisms.accessKey')}
                  </Label>
                  {modoEdicion ? (
                    <div className="relative">
                      <Input 
                        value={organismoSeleccionado?.claveAcceso || 'No disponible'}
                        readOnly
                        className="h-11 text-base font-mono font-bold bg-green-50 border-green-300 text-green-700 pr-10"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (organismoSeleccionado?.claveAcceso) {
                            const exito = await copiarAlPortapapeles(organismoSeleccionado.claveAcceso);
                            if (exito) toast.success('✅ Clé copiée!');
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-green-100 rounded transition-colors"
                        title="Copier la clé"
                      >
                        <Copy className="w-4 h-4 text-green-700" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-11 flex items-center px-3 bg-blue-50 border border-blue-200 rounded-md">
                      <span className="text-sm text-blue-700 flex items-center gap-2">
                        <span className="animate-pulse">✨</span>
                        {t('organisms.accessKeyAutoGenerated')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Programación y Frecuencia */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-[#333333] pb-2 border-b-2 border-[#1E73BE] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Calendar className="w-5 h-5 text-[#1E73BE]" />
                {t('organisms.scheduling')}
              </h3>
              <div className="grid grid-cols-6 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.appointmentFrequency')} *</Label>
                  <Select 
                    value={formOrganismo.frecuenciaCita}
                    onValueChange={(value) => setFormOrganismo({ ...formOrganismo, frecuenciaCita: value })}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue placeholder={t('organisms.selectFrequency')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semanal" className="text-base">{t('organisms.weekly')}</SelectItem>
                      <SelectItem value="cada-dos-semanas" className="text-base">{t('organisms.biweekly')}</SelectItem>
                      <SelectItem value="mensual" className="text-base">{t('organisms.monthly')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.appointmentTime')}</Label>
                  <Input 
                    type="time" 
                    value={formOrganismo.horaCita}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, horaCita: e.target.value })}
                    className="h-11 text-base"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-sm font-medium">{t('organisms.organismType')}</Label>
                  <Select 
                    value={formOrganismo.regular ? 'regular' : 'eventual'}
                    onValueChange={(value) => setFormOrganismo({ ...formOrganismo, regular: value === 'regular' })}
                  >
                    <SelectTrigger className="h-11 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular" className="text-base">{t('organisms.regular')}</SelectItem>
                      <SelectItem value="eventual" className="text-base">{t('organisms.occasionalOrganism')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={() => setFormOrganismo({ ...formOrganismo, participantePRS: !formOrganismo.participantePRS })}
                    className={`h-8 text-xs w-full ${formOrganismo.participantePRS 
                      ? 'bg-[#4CAF50] hover:bg-[#45a049]' 
                      : 'bg-gray-400 hover:bg-gray-500'}`}
                  >
                    PRS: {formOrganismo.participantePRS ? '✓' : '✕'}
                  </Button>
                </div>
              </div>
              
              {/* Estado activo/inactivo y PRS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">
                      État: <span className={`font-semibold ${formOrganismo.activo ? 'text-[#4CAF50]' : 'text-[#DC3545]'}`}>
                        {formOrganismo.activo ? 'Actif' : 'Inactif'}
                      </span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setFormOrganismo({ ...formOrganismo, activo: !formOrganismo.activo })}
                    className={`h-10 text-sm px-4 ${formOrganismo.activo 
                      ? 'bg-[#4CAF50] hover:bg-[#45a049]' 
                      : 'bg-[#DC3545] hover:bg-[#c82333]'}`}
                  >
                    {formOrganismo.activo ? '✓ Actif' : '✕ Inactif'}
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg bg-gray-50">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">
                      Participant PRS: <span className={`font-semibold ${formOrganismo.participantePRS ? 'text-[#4CAF50]' : 'text-gray-500'}`}>
                        {formOrganismo.participantePRS ? 'Oui' : 'Non'}
                      </span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setFormOrganismo({ ...formOrganismo, participantePRS: !formOrganismo.participantePRS })}
                    className={`h-10 text-sm px-4 ${formOrganismo.participantePRS 
                      ? 'bg-[#4CAF50] hover:bg-[#45a049]' 
                      : 'bg-gray-400 hover:bg-gray-500'}`}
                  >
                    {formOrganismo.participantePRS ? '✓ Oui' : '✕ Non'}
                  </Button>
                </div>
              </div>

              {!formOrganismo.activo && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-700">{t('organisms.inactivityStartDate')} *</Label>
                    <Input 
                      type="date"
                      value={formOrganismo.fechaInicioInactividad || ''}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, fechaInicioInactividad: e.target.value })}
                      className="h-11 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-red-700">{t('organisms.inactivityEndDate')}</Label>
                    <Input 
                      type="date"
                      value={formOrganismo.fechaFinInactividad || ''}
                      onChange={(e) => setFormOrganismo({ ...formOrganismo, fechaFinInactividad: e.target.value })}
                      min={formOrganismo.fechaInicioInactividad || ''}
                      className="h-11 text-base"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Capacidad y Servicios */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-[#333333] pb-2 border-b-2 border-[#1E73BE] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <UserCheck className="w-5 h-5 text-[#1E73BE]" />
                {t('organisms.capacity')}
              </h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1E73BE]" />
                    {t('organisms.peopleServed')}
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formOrganismo.personasServidas || ''}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, personasServidas: parseInt(e.target.value) || 0 })}
                    onBlur={calcularPorcentajeAutomatico}
                    className="h-11 text-base font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-[#FFC107]" />
                    Collations
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formOrganismo.cantidadColaciones || ''}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, cantidadColaciones: parseInt(e.target.value) || 0 })}
                    onBlur={calcularPorcentajeAutomatico}
                    className="h-11 text-base font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-[#4CAF50]" />
                    Repas
                  </Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={formOrganismo.cantidadAlmuerzos || ''}
                    onChange={(e) => setFormOrganismo({ ...formOrganismo, cantidadAlmuerzos: parseInt(e.target.value) || 0 })}
                    onBlur={calcularPorcentajeAutomatico}
                    className="h-11 text-base font-medium"
                  />
                </div>
                <div className="flex items-end">
                  <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-3 text-center">
                    <p className="text-xs font-medium text-[#666666] mb-1">{t('organisms.distributionPercentage')}</p>
                    <div className="text-2xl font-bold text-[#1E73BE]">
                      {(formOrganismo.porcentajeReparticion || 0).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notas y Notificaciones */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-[#333333] pb-2 border-b-2 border-[#1E73BE] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <FileText className="w-5 h-5 text-[#1E73BE]" />
                Notes et Observations
              </h3>
              <Textarea 
                placeholder={t('organisms.notesPlaceholder')}
                rows={3}
                value={formOrganismo.notas}
                onChange={(e) => setFormOrganismo({ ...formOrganismo, notas: e.target.value })}
                className="text-base resize-none"
              />
              <div className="flex items-center gap-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <input 
                  type="checkbox"
                  id="notificaciones"
                  checked={formOrganismo.notificaciones}
                  onChange={(e) => setFormOrganismo({ ...formOrganismo, notificaciones: e.target.checked })}
                  className="w-5 h-5"
                />
                <Label htmlFor="notificaciones" className="mb-0 cursor-pointer text-sm font-medium flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#FFC107]" />
                  {t('organisms.enableNotifications')}
                </Label>
              </div>
            </div>

            {/* Contactos de notificación */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#1E73BE]">
                <h3 className="text-base font-semibold text-[#333333] flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Bell className="w-5 h-5 text-[#1E73BE]" />
                  Contacts de notification
                </h3>
                <Button 
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={agregarContacto}
                  className="h-9 text-sm px-3 text-[#4CAF50] border-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter Contact
                </Button>
              </div>
              <div className="space-y-3">
                {(formOrganismo.contactosNotificacion || []).map((contacto, index) => (
                  <div key={index} className="border-2 border-gray-300 rounded-lg p-3 bg-[#FAFAFA]">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-[#1E73BE] hover:bg-[#1E73BE] text-sm h-6 px-3">
                        Contact {index + 1}
                      </Badge>
                      {formOrganismo.contactosNotificacion && formOrganismo.contactosNotificacion.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => eliminarContacto(index)}
                          className="h-8 px-2 text-[#DC3545] hover:text-white hover:bg-[#DC3545]"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Supprimer
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Nom Complet</Label>
                        <Input 
                          placeholder="Jean Dupont" 
                          value={contacto.nombre}
                          onChange={(e) => actualizarContacto(index, 'nombre', e.target.value)}
                          className="h-10 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Email</Label>
                        <Input 
                          type="email"
                          placeholder="jean@example.com" 
                          value={contacto.email}
                          onChange={(e) => actualizarContacto(index, 'email', e.target.value)}
                          className="h-10 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Poste</Label>
                        <Select
                          value={contacto.cargo || ''}
                          onValueChange={(value) => actualizarContacto(index, 'cargo', value)}
                        >
                          <SelectTrigger className="h-10 text-base">
                            <SelectValue placeholder="Directeur" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Directeur">Directeur</SelectItem>
                            <SelectItem value="Coordinateur">Coordinateur</SelectItem>
                            <SelectItem value="Responsable">Responsable</SelectItem>
                            <SelectItem value="Chef d'équipe">Chef d'équipe</SelectItem>
                            <SelectItem value="Superviseur">Superviseur</SelectItem>
                            <SelectItem value="Assistant">Assistant</SelectItem>
                            <SelectItem value="Gestionnaire">Gestionnaire</SelectItem>
                            <SelectItem value="Administrateur">Administrateur</SelectItem>
                            <SelectItem value="Bénévole">Bénévole</SelectItem>
                            <SelectItem value="Volontaire">Volontaire</SelectItem>
                            <SelectItem value="Stagiaire">Stagiaire</SelectItem>
                            <SelectItem value="Conseiller">Conseiller</SelectItem>
                            <SelectItem value="Technicien">Technicien</SelectItem>
                            <SelectItem value="Spécialiste">Spécialiste</SelectItem>
                            <SelectItem value="Analyste">Analyste</SelectItem>
                            <SelectItem value="Autre">Autre</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {/* Selección múltiple de idiomas */}
                    <div className="mt-3 space-y-2">
                      <Label className="flex items-center gap-2 text-sm font-medium">
                        <Languages className="w-4 h-4 text-[#1E73BE]" />
                        Langues parlées
                      </Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { code: 'fr' as IdiomaContactoOrganismo, label: '🇫🇷 FR', color: '#1a4d7a' },
                          { code: 'en' as IdiomaContactoOrganismo, label: '🇬🇧 EN', color: '#2d9561' },
                          { code: 'es' as IdiomaContactoOrganismo, label: '🇪🇸 ES', color: '#8B5CF6' },
                          { code: 'ar' as IdiomaContactoOrganismo, label: '🇸🇦 AR', color: '#F59E0B' }
                        ].map((idioma) => (
                          <label
                            key={idioma.code}
                            className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50 transition-colors"
                            style={{
                              borderColor: contacto.idiomas?.includes(idioma.code) ? idioma.color : '#e5e7eb',
                              backgroundColor: contacto.idiomas?.includes(idioma.code) ? `${idioma.color}10` : 'transparent'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={contacto.idiomas?.includes(idioma.code) || false}
                              onChange={(e) => {
                                const currentIdiomas = contacto.idiomas || [];
                                const newIdiomas = e.target.checked
                                  ? [...currentIdiomas, idioma.code]
                                  : currentIdiomas.filter(i => i !== idioma.code);
                                actualizarContacto(index, 'idiomas', newIdiomas);
                              }}
                              className="w-3 h-3 rounded"
                              style={{ accentColor: idioma.color }}
                            />
                            <span className="text-xs font-medium">{idioma.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3">
                      <SelecteurJoursDisponibles
                        joursSelectionnes={contacto.joursDisponibles || []}
                        onChange={(jours) => actualizarContacto(index, 'joursDisponibles', jours)}
                        showIcon={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t-2">
              <Button variant="outline" onClick={() => {
                setOrganismoDialogOpen(false);
              }} className="h-10 text-base px-5">
                {t('liaison.cancel')}
              </Button>
              <Button
                onClick={() => {
                  if (modoEdicion) {
                    handleGuardarCambios();
                  } else {
                    handleCrearOrganismo();
                  }
                }}
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white h-10 text-base px-5"
              >
                <Plus className="w-5 h-5 mr-2" />
                {modoEdicion ? t('liaison.updateOrganism') : t('liaison.createOrganism')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogo de Perfil */}
      {organismoSeleccionado && (
        <PerfilOrganismoDialog
          open={perfilDialogOpen}
          onOpenChange={setPerfilDialogOpen}
          modoEdicion={false}
          setModoEdicion={() => {}}
          formOrganismo={convertirOrganismoAFormulario(organismoSeleccionado)}
          setFormOrganismo={() => {}}
          onGuardar={() => {}}
          calcularPorcentajeAutomatico={() => {}}
          agregarContacto={() => {}}
          eliminarContacto={() => {}}
          actualizarContacto={() => {}}
          historialDonaciones={historialDonaciones}
          historialPRS={historialPRS}
          organismoId={organismoSeleccionado.id.toString()}
        />
      )}

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