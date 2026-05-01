# Exportación Avanzada de Reportes - Mejora #7 Implementada

## 📋 Resumen

Se ha implementado un sistema completo de exportación avanzada de reportes con soporte para múltiples formatos (PDF, Excel, CSV, JSON), plantillas predefinidas, captura de gráficos, historial de reportes generados, y una interfaz integrada para configuración y gestión.

## 🎯 Objetivos Completados

### 1. **Utilidades de Exportación**
- ✅ Exportación a PDF con jsPDF
- ✅ Exportación a Excel (XLSX)
- ✅ Exportación a CSV
- ✅ Exportación a JSON
- ✅ Captura de gráficos con html2canvas
- ✅ Validación de datos
- ✅ Generación automática de nombres de archivo

### 2. **Generador de Reportes**
- ✅ Configuración visual de reportes
- ✅ Selector de formato (PDF/Excel/CSV/JSON)
- ✅ Personalización de título y subtítulo
- ✅ Opciones de orientación (vertical/horizontal)
- ✅ Inclusión opcional de gráficos
- ✅ Vista previa de configuración

### 3. **Plantillas Predefinidas**
- ✅ 8 plantillas pre-configuradas
- ✅ Categorías: Inventario, Pedidos, Organismos, Auditoría, Estadísticas
- ✅ Filtros sugeridos por plantilla
- ✅ Formato recomendado automático

### 4. **Historial de Reportes**
- ✅ Registro de reportes generados
- ✅ Búsqueda y filtros
- ✅ Regeneración de reportes
- ✅ Estadísticas de uso
- ✅ Gestión de historial

### 5. **Módulo Integrado**
- ✅ Interfaz con tabs (Generar/Plantillas/Historial)
- ✅ Diseño glassmorphism consistente
- ✅ Estadísticas en tiempo real
- ✅ Consejos contextuales

## 📁 Archivos Creados

### 1. `/src/app/utils/exportUtils.ts` (600+ líneas)

Utilidades completas para exportación de datos.

#### Funciones Principales

```typescript
// Exportación a CSV
exportToCSV(data: any[], columns: TableColumn[], options?: ExportOptions): Promise<void>

// Exportación a Excel
exportToExcel(data: any[], columns: TableColumn[], options?: ExportOptions): Promise<void>

// Exportación a PDF
exportToPDF(data: any[], columns: TableColumn[], options?: ExportOptions): Promise<void>

// Exportación a PDF con gráficos
exportToPDFWithCharts(
  data: any[], 
  columns: TableColumn[], 
  charts: ChartElement[], 
  options?: ExportOptions
): Promise<void>

// Exportación a JSON
exportToJSON(data: any, options?: ExportOptions): Promise<void>

// Exportación automática según formato
exportData(
  format: 'csv' | 'excel' | 'pdf' | 'json',
  data: any[],
  columns: TableColumn[],
  options?: ExportOptions
): Promise<void>
```

#### Funciones Helper

```typescript
// Validar datos antes de exportar
validateExportData(data: any[]): { isValid: boolean; errors: string[] }

// Sugerir mejor formato según tamaño
suggestExportFormat(dataSize: number): 'csv' | 'excel' | 'pdf'

// Generar nombre de archivo con timestamp
generateFilename(prefix: string, extension: string, includeTimestamp?: boolean): string

// Capturar gráfico como imagen
captureChart(chartId: string): Promise<string | null>
```

#### Interfaces de Tipos

```typescript
interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  includeDate?: boolean;
  includeCharts?: boolean;
  logo?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
}

interface TableColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

interface ChartElement {
  id: string;
  title?: string;
}
```

#### Plantillas Predefinidas

```typescript
// Columnas para inventario
INVENTORY_COLUMNS: TableColumn[]

// Columnas para pedidos
ORDERS_COLUMNS: TableColumn[]

// Columnas para auditoría
AUDIT_COLUMNS: TableColumn[]

// Columnas para organismos
ORGANISMS_COLUMNS: TableColumn[]
```

### 2. `/src/app/components/reports/ReportGenerator.tsx` (350+ líneas)

Componente para configurar y generar reportes.

#### Props

```typescript
interface ReportGeneratorProps {
  data: any[];                    // Datos a exportar
  columns: TableColumn[];         // Definición de columnas
  defaultTitle?: string;          // Título por defecto
  defaultFilename?: string;       // Nombre de archivo
  charts?: ChartElement[];        // Gráficos para incluir
  onExport?: (format: string) => void; // Callback al exportar
}
```

#### Características

- **Selector de Formato**: Tabs para PDF, Excel, CSV, JSON
- **Configuración por Formato**: Opciones específicas según formato
- **Validación en Tiempo Real**: Verifica datos antes de exportar
- **Sugerencias Inteligentes**: Recomienda formato según cantidad de datos
- **Feedback Visual**: Estados de carga y éxito
- **Traducciones Completas**: Soporte multiidioma

#### Hook Incluido

```typescript
const { generate, isGenerating } = useReportGenerator();

// Uso
const result = await generate('pdf', data, columns, options);
```

### 3. `/src/app/components/reports/ReportHistory.tsx` (350+ líneas)

Componente para gestionar historial de reportes.

#### Características

- **Persistencia**: Guarda en localStorage
- **Búsqueda**: Buscar por título o nombre de archivo
- **Filtros**: Por formato, módulo, fecha
- **Regeneración**: Volver a generar reportes previos
- **Estadísticas**: Resumen de uso por formato
- **Gestión**: Eliminar individual o todo el historial

#### Estructura de Registro

```typescript
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
```

#### Hook Incluido

```typescript
const { reports, addReport, clearHistory, reload } = useReportHistory();

// Agregar al historial
addReport({
  title: 'Reporte de Inventario',
  format: 'pdf',
  filename: 'inventario.pdf',
  recordCount: 150,
  module: 'Inventario',
  user: 'David'
});
```

### 4. `/src/app/components/reports/ReportTemplates.tsx` (400+ líneas)

Componente con plantillas predefinidas de reportes.

#### Plantillas Disponibles

1. **Inventario Completo**
   - Descripción: Reporte detallado de todo el inventario
   - Formato sugerido: Excel
   - Columnas: 10 (código, producto, categoría, stock, etc.)
   - Filtros: categoría, temperatura, stock

2. **Stock Bajo**
   - Descripción: Productos con stock por debajo del mínimo
   - Formato sugerido: PDF
   - Columnas: 7
   - Filtros: categoría

3. **Próximos a Vencer**
   - Descripción: Productos próximos a fecha de vencimiento
   - Formato sugerido: PDF
   - Columnas: 7
   - Filtros: días, categoría

4. **Pedidos Pendientes**
   - Descripción: Pedidos en estado pendiente o preparación
   - Formato sugerido: Excel
   - Columnas: 8
   - Filtros: estado, organismo, rango de fechas

5. **Pedidos Completados**
   - Descripción: Historial de pedidos entregados
   - Formato sugerido: Excel
   - Columnas: 8
   - Filtros: rango de fechas, organismo

6. **Organismos Activos**
   - Descripción: Listado de organismos beneficiarios
   - Formato sugerido: Excel
   - Columnas: 8
   - Filtros: tipo, estado

7. **Registro de Auditoría**
   - Descripción: Actividad del sistema y usuarios
   - Formato sugerido: CSV
   - Columnas: 7
   - Filtros: rango de fechas, módulo, usuario, severidad

8. **Estadísticas Mensuales**
   - Descripción: Resumen de actividad del mes
   - Formato sugerido: PDF
   - Columnas: 5
   - Filtros: mes, año

#### Categorización

```typescript
const categories = {
  inventory: [...],    // Plantillas de inventario
  orders: [...],       // Plantillas de pedidos
  organisms: [...],    // Plantillas de organismos
  audit: [...],        // Plantillas de auditoría
  statistics: [...]    // Plantillas de estadísticas
};
```

### 5. `/src/app/components/reports/ReportsModule.tsx` (300+ líneas)

Módulo principal que integra todo el sistema.

#### Props

```typescript
interface ReportsModuleProps {
  data?: any[];              // Datos iniciales
  columns?: TableColumn[];   // Columnas iniciales
  module?: string;           // Nombre del módulo
}
```

#### Estructura

- **Tab "Generar"**: ReportGenerator + panel lateral
- **Tab "Plantillas"**: ReportTemplates
- **Tab "Historial"**: ReportHistory

#### Características

- **Glassmorphism**: Diseño consistente con el resto del sistema
- **Estadísticas Rápidas**: Registros, columnas, formato sugerido
- **Panel Lateral**: Info de plantilla activa, consejos, atajos
- **Integración Completa**: Comunicación entre componentes

## 💡 Ejemplos de Uso

### Ejemplo 1: Exportación Básica

```typescript
import { exportToPDF, INVENTORY_COLUMNS } from '../utils/exportUtils';

const data = [
  {
    code: 'INV-001',
    name: 'Arroz Blanco',
    category: 'Granos',
    stock: 150,
    unit: 'kg',
    weight: 150,
    value: 300
  },
  // ... más productos
];

// Exportar a PDF
await exportToPDF(data, INVENTORY_COLUMNS, {
  title: 'Inventario Completo',
  subtitle: 'Febrero 2026',
  filename: 'inventario-febrero-2026'
});
```

### Ejemplo 2: Exportación con Gráficos

```typescript
import { exportToPDFWithCharts } from '../utils/exportUtils';

const charts = [
  { id: 'chart-inventory-trend', title: 'Tendencia de Inventario' },
  { id: 'chart-category-breakdown', title: 'Distribución por Categoría' }
];

await exportToPDFWithCharts(data, columns, charts, {
  title: 'Reporte de Inventario con Gráficos',
  orientation: 'landscape'
});
```

### Ejemplo 3: Exportación Automática

```typescript
import { exportData, suggestExportFormat } from '../utils/exportUtils';

const format = suggestExportFormat(data.length);
// Retorna 'pdf' si <100, 'excel' si <1000, 'csv' si >=1000

await exportData(format, data, columns, {
  title: 'Reporte Automático',
  includeDate: true
});
```

### Ejemplo 4: Usando ReportGenerator

```typescript
import { ReportGenerator } from './components/reports/ReportGenerator';
import { ORDERS_COLUMNS } from './utils/exportUtils';

function OrdersReport() {
  const orders = useOrdersData();
  
  return (
    <ReportGenerator
      data={orders}
      columns={ORDERS_COLUMNS}
      defaultTitle="Reporte de Pedidos"
      defaultFilename="pedidos"
      onExport={(format) => {
        console.log(`Reporte exportado en formato ${format}`);
      }}
    />
  );
}
```

### Ejemplo 5: Usando ReportsModule Completo

```typescript
import { ReportsModule } from './components/reports/ReportsModule';

function InventoryReports() {
  const inventory = useInventoryData();
  const columns = INVENTORY_COLUMNS;
  
  return (
    <ReportsModule
      data={inventory}
      columns={columns}
      module="Inventario"
    />
  );
}
```

### Ejemplo 6: Columnas Personalizadas

```typescript
import { formatCurrency, formatDate } from './utils/formatUtils';

const customColumns: TableColumn[] = [
  {
    header: 'Fecha',
    key: 'date',
    width: 100,
    format: (value) => formatDate(value)
  },
  {
    header: 'Monto',
    key: 'amount',
    width: 90,
    align: 'right',
    format: (value) => formatCurrency(value)
  },
  {
    header: 'Estado',
    key: 'status',
    width: 80,
    align: 'center',
    format: (value) => value === 'active' ? 'Activo' : 'Inactivo'
  }
];
```

### Ejemplo 7: Hook de Generación

```typescript
import { useReportGenerator } from './components/reports/ReportGenerator';

function QuickExport() {
  const { generate, isGenerating } = useReportGenerator();
  
  const handleExport = async () => {
    const result = await generate('excel', data, columns, {
      title: 'Exportación Rápida',
      filename: 'export-quick'
    });
    
    if (result.success) {
      toast.success('¡Exportado!');
    } else {
      toast.error('Error al exportar');
    }
  };
  
  return (
    <Button onClick={handleExport} disabled={isGenerating}>
      {isGenerating ? 'Exportando...' : 'Exportar a Excel'}
    </Button>
  );
}
```

### Ejemplo 8: Gestión de Historial

```typescript
import { useReportHistory } from './components/reports/ReportHistory';

function ReportManager() {
  const { reports, addReport, clearHistory } = useReportHistory();
  
  const handleNewReport = async () => {
    await exportToPDF(data, columns, options);
    
    // Agregar al historial
    addReport({
      title: 'Mi Reporte',
      format: 'pdf',
      filename: 'mi-reporte.pdf',
      recordCount: data.length,
      module: 'Inventario',
      user: 'David'
    });
  };
  
  return (
    <div>
      <Button onClick={handleNewReport}>Generar Reporte</Button>
      <p>{reports.length} reportes en historial</p>
    </div>
  );
}
```

## 📊 Formatos Soportados

### PDF
**Ventajas:**
- ✅ Formato universal
- ✅ Incluye gráficos e imágenes
- ✅ Diseño profesional
- ✅ Tablas con autoTable
- ✅ Orientación vertical u horizontal

**Ideal para:**
- Reportes ejecutivos
- Presentaciones
- Archivos finales

**Opciones:**
```typescript
{
  orientation: 'portrait' | 'landscape',
  pageSize: 'a4' | 'letter' | 'legal',
  includeCharts: true,
  logo: 'data:image/png;base64,...'
}
```

### Excel (XLSX)
**Ventajas:**
- ✅ Análisis de datos
- ✅ Fórmulas y cálculos
- ✅ Formato de tabla
- ✅ Anchos de columna ajustados

**Ideal para:**
- Análisis detallado
- Manipulación de datos
- Importación a otros sistemas

**Características:**
- Título y subtítulo
- Fecha de generación
- Formato de celdas
- Columnas auto-ajustadas

### CSV
**Ventajas:**
- ✅ Ligero y rápido
- ✅ Compatible universalmente
- ✅ Fácil de importar
- ✅ Ideal para grandes volúmenes

**Ideal para:**
- Grandes cantidades de datos (>1000 registros)
- Importación a bases de datos
- Procesamiento automatizado

**Nota:**
- No soporta gráficos
- Formato simple de texto

### JSON
**Ventajas:**
- ✅ Formato estructurado
- ✅ Fácil de parsear
- ✅ Ideal para APIs
- ✅ Preserva tipos de datos

**Ideal para:**
- Integración con APIs
- Desarrollo y debugging
- Backup de datos

**Estructura:**
```json
{
  "generatedAt": "2026-02-23T14:30:00Z",
  "title": "Reporte de Inventario",
  "data": [
    { "code": "INV-001", "name": "Producto 1", ... },
    { "code": "INV-002", "name": "Producto 2", ... }
  ]
}
```

## 🎨 Características Visuales

### Diseño Glassmorphism

```css
backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl
```

### Colores por Formato

- **PDF**: Rojo (`bg-red-100 text-red-700`)
- **Excel**: Verde (`bg-green-100 text-green-700`)
- **JSON**: Morado (`bg-purple-100 text-purple-700`)
- **CSV**: Azul (`bg-blue-100 text-blue-700`)

### Íconos

- **PDF**: `<FileText />`
- **Excel/CSV**: `<FileSpreadsheet />`
- **JSON**: `<FileJson />`
- **Exportar**: `<Download />`
- **Historial**: `<Clock />`
- **Plantillas**: `<Layout />`

### Animaciones

- Blob animado en fondo
- Transiciones suaves
- Loading spinners
- Success checkmarks

## 📈 Optimización de Performance

### Validación de Datos

```typescript
const validation = validateExportData(data);
if (!validation.isValid) {
  toast.error(validation.errors.join(', '));
  return;
}
```

### Sugerencia de Formato

```typescript
const suggestedFormat = suggestExportFormat(data.length);
// < 100 registros: PDF
// < 1000 registros: Excel
// >= 1000 registros: CSV
```

### Generación de Nombres

```typescript
const filename = generateFilename('inventario', 'pdf', true);
// inventario_2026-02-23T14-30-00.pdf
```

### Captura de Gráficos

```typescript
const chartImage = await captureChart('chart-id');
// Retorna base64 image data URL
```

## 🔧 Configuración Avanzada

### Formateo de Columnas

```typescript
const columns: TableColumn[] = [
  {
    header: 'Precio',
    key: 'price',
    width: 90,
    align: 'right',
    format: (value) => formatCurrency(value)
  },
  {
    header: 'Cantidad',
    key: 'quantity',
    width: 70,
    align: 'right',
    format: (value) => formatNumber(value, 2)
  }
];
```

### Logo Personalizado

```typescript
// Convertir imagen a base64
const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANS...';

await exportToPDF(data, columns, {
  logo: logoBase64,
  title: 'Mi Empresa',
  subtitle: 'Reporte Mensual'
});
```

### Orientación y Tamaño

```typescript
await exportToPDF(data, columns, {
  orientation: 'landscape',  // Horizontal
  pageSize: 'letter'         // Carta (en lugar de A4)
});
```

## 📝 Traducciones

Traducciones agregadas en los 4 idiomas (FR, ES, EN, AR):

```json
{
  "reports": {
    "title": "Centro de Reportes",
    "generateReport": "Generar Reporte",
    "templates": "Plantillas",
    "history": "Historial",
    "export": "Exportar",
    "exportSuccess": "Reporte exportado exitosamente",
    "exportError": "Error al exportar el reporte",
    "noDataToExport": "No hay datos para exportar"
  }
}
```

## 🚀 Integración con Módulos Existentes

### En Módulo de Inventario

```typescript
import { ReportsModule } from './components/reports/ReportsModule';
import { INVENTORY_COLUMNS } from './utils/exportUtils';

function InventoryModule() {
  const inventory = useInventoryStore();
  
  return (
    <div>
      {/* ... contenido del inventario ... */}
      
      {/* Sección de reportes */}
      <ReportsModule
        data={inventory.products}
        columns={INVENTORY_COLUMNS}
        module="Inventario"
      />
    </div>
  );
}
```

### En Módulo de Pedidos

```typescript
import { ReportGenerator } from './components/reports/ReportGenerator';
import { ORDERS_COLUMNS } from './utils/exportUtils';

function OrdersList() {
  const orders = useOrdersData();
  
  const handleExportOrders = () => {
    // Lógica adicional si se necesita
  };
  
  return (
    <div>
      <h2>Listado de Pedidos</h2>
      
      <ReportGenerator
        data={orders}
        columns={ORDERS_COLUMNS}
        defaultTitle="Reporte de Pedidos"
        onExport={handleExportOrders}
      />
    </div>
  );
}
```

### En Módulo de Auditoría

```typescript
import { exportData, AUDIT_COLUMNS } from './utils/exportUtils';

function AuditLogs() {
  const logs = useAuditLogs();
  
  const handleQuickExport = async (format: 'csv' | 'json') => {
    await exportData(format, logs, AUDIT_COLUMNS, {
      title: 'Registro de Auditoría',
      includeDate: true
    });
  };
  
  return (
    <div>
      {/* ... logs ... */}
      
      <div className="flex gap-2">
        <Button onClick={() => handleQuickExport('csv')}>
          Exportar CSV
        </Button>
        <Button onClick={() => handleQuickExport('json')}>
          Exportar JSON
        </Button>
      </div>
    </div>
  );
}
```

## 🎉 Conclusión

El sistema de exportación avanzada implementado proporciona:

1. ✅ **4 Formatos**: PDF, Excel, CSV, JSON
2. ✅ **8 Plantillas**: Predefinidas y optimizadas
3. ✅ **Historial**: Gestión de reportes generados
4. ✅ **Gráficos**: Captura e inclusión en PDF
5. ✅ **Validación**: Verificación de datos
6. ✅ **Sugerencias**: Formato recomendado automático
7. ✅ **Personalización**: Títulos, logos, orientación
8. ✅ **Multiidioma**: Traducciones completas

Este sistema permite generar reportes profesionales con configuración avanzada y gestión completa del historial, mejorando significativamente las capacidades de análisis y documentación del sistema Banque Alimentaire.

**Estado**: ✅ Implementado y Funcional  
**Próxima Mejora**: Sistema de Backup/Restauración (Mejora #8)

---

*Última actualización: Febrero 23, 2026*
*Sistema implementado con soporte completo para exportación avanzada de reportes*
