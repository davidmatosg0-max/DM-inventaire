# 📖 EJEMPLOS DE USO PRÁCTICOS - MEJORAS IMPLEMENTADAS

## Guía Rápida de Implementación

---

## 1. 🎯 SISTEMA DE PERMISOS

### Ejemplo 1: Proteger un Botón

```typescript
import { ProtectedButton } from './components/ProtectedComponent';
import { Trash2 } from 'lucide-react';

function ProductoItem({ producto, onEliminar }) {
  return (
    <div className="flex items-center gap-2">
      <span>{producto.nombre}</span>
      
      {/* Solo usuarios con permiso verán este botón */}
      <ProtectedButton 
        permisoRequerido="inventario_eliminar"
        variant="destructive"
        size="sm"
        onClick={() => onEliminar(producto.id)}
      >
        <Trash2 className="w-4 h-4" />
        Eliminar
      </ProtectedButton>
    </div>
  );
}
```

---

### Ejemplo 2: Proteger una Sección Completa

```typescript
import { ProtectedComponent } from './components/ProtectedComponent';

function ConfiguracionAvanzada() {
  return (
    <div>
      <h2>Configuración</h2>
      
      {/* Sección visible para todos */}
      <section>
        <h3>Preferencias Generales</h3>
        {/* ... */}
      </section>
      
      {/* Sección solo para administradores */}
      <ProtectedComponent permisoRequerido="configuracion_sistema">
        <section>
          <h3>Configuración del Sistema</h3>
          <p>Configuración sensible solo para administradores</p>
          {/* ... */}
        </section>
      </ProtectedComponent>
    </div>
  );
}
```

---

### Ejemplo 3: Proteger Página Completa

```typescript
import { withPermission } from './components/ProtectedComponent';
import { Configuracion } from './components/pages/Configuracion';

// Crear versión protegida
const ConfiguracionProtegida = withPermission(
  Configuracion, 
  'configuracion_ver'
);

// Usar en el router
function App() {
  return (
    <Routes>
      <Route path="/configuracion" element={<ConfiguracionProtegida />} />
    </Routes>
  );
}
```

---

### Ejemplo 4: Verificación en Lógica

```typescript
import { usePermisos } from '../stores/usePermisos';

function InventarioPage() {
  const { tienePermiso, tieneAlgunPermiso } = usePermisos();
  
  const handleAccion = () => {
    // Verificar antes de ejecutar acción
    if (!tienePermiso('inventario_editar')) {
      toast.error('No tienes permisos para editar');
      return;
    }
    
    // Ejecutar acción
    editarProducto();
  };
  
  // Verificar múltiples permisos
  const puedeGestionar = tieneAlgunPermiso([
    'inventario_crear',
    'inventario_editar',
    'inventario_eliminar'
  ]);
  
  return (
    <div>
      {puedeGestionar && (
        <Button onClick={handleAccion}>Gestionar</Button>
      )}
    </div>
  );
}
```

---

## 2. 🔔 SISTEMA DE NOTIFICACIONES

### Ejemplo 1: Notificación de Stock Crítico

```typescript
import { notificarStockCritico } from '../stores/useNotificaciones';

function actualizarStock(productoId: string, nuevaCantidad: number) {
  const producto = obtenerProducto(productoId);
  
  // Actualizar stock
  producto.stockActual = nuevaCantidad;
  guardarProducto(producto);
  
  // Verificar y notificar
  if (producto.stockActual <= producto.stockMinimo) {
    notificarStockCritico({
      nombre: producto.nombre,
      stockActual: producto.stockActual,
      stockMinimo: producto.stockMinimo,
    });
  }
}
```

---

### Ejemplo 2: Notificación de Caducidad Próxima

```typescript
import { notificarCaducidadProxima } from '../stores/useNotificaciones';

function verificarCaducidades() {
  const productos = obtenerProductos();
  const hoy = new Date();
  
  productos.forEach(producto => {
    if (producto.fechaVencimiento) {
      const fechaVenc = new Date(producto.fechaVencimiento);
      const diasRestantes = Math.floor(
        (fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (diasRestantes <= 15 && diasRestantes > 0) {
        notificarCaducidadProxima({
          nombre: producto.nombre,
          fechaVencimiento: fechaVenc,
          diasRestantes,
        });
      }
    }
  });
}

// Ejecutar cada hora
setInterval(verificarCaducidades, 60 * 60 * 1000);
```

---

### Ejemplo 3: Notificación Personalizada

```typescript
import { useNotificaciones } from '../stores/useNotificaciones';

function CrearComanda() {
  const { agregarNotificacion } = useNotificaciones();
  
  const handleCrearComanda = async (datos) => {
    try {
      const comanda = await crearComanda(datos);
      
      // Notificación de éxito
      agregarNotificacion({
        tipo: 'success',
        titulo: '✅ Comanda Creada',
        mensaje: `Comanda #${comanda.numero} para ${comanda.organismo.nombre}`,
        prioridad: 'media',
        categoria: 'comandas',
        datos: { comanda },
      });
      
    } catch (error) {
      // Notificación de error
      agregarNotificacion({
        tipo: 'error',
        titulo: '❌ Error al Crear Comanda',
        mensaje: error.message,
        prioridad: 'alta',
        categoria: 'sistema',
      });
    }
  };
  
  return <FormularioComanda onSubmit={handleCrearComanda} />;
}
```

---

### Ejemplo 4: Leer Notificaciones

```typescript
import { useNotificaciones } from '../stores/useNotificaciones';

function CentroNotificacionesCustom() {
  const { 
    notificaciones, 
    noLeidas, 
    marcarComoLeida,
    obtenerNoLeidas 
  } = useNotificaciones();
  
  const notificacionesNoLeidas = obtenerNoLeidas();
  
  return (
    <div>
      <h3>Notificaciones ({noLeidas})</h3>
      {notificacionesNoLeidas.map(notif => (
        <div 
          key={notif.id}
          onClick={() => marcarComoLeida(notif.id)}
        >
          <h4>{notif.titulo}</h4>
          <p>{notif.mensaje}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. 📊 EXPORTACIÓN PDF Y EXCEL

### Ejemplo 1: Exportar Inventario

```typescript
import { exportarInventarioPDF, exportarInventarioExcel } from '../utils/exportarPDF';
import { Button } from './ui/button';
import { FileText, Download } from 'lucide-react';

function InventarioExportar({ productos }) {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => exportarInventarioPDF(productos)}
        className="bg-[#DC3545]"
      >
        <FileText className="w-4 h-4 mr-2" />
        Exportar PDF
      </Button>
      
      <Button 
        onClick={() => exportarInventarioExcel(productos)}
        className="bg-[#4CAF50]"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar Excel
      </Button>
    </div>
  );
}
```

---

### Ejemplo 2: Exportar con Filtros

```typescript
function ReportesAvanzados() {
  const [productos, setProductos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('');
  
  const productosFiltrados = useMemo(() => {
    if (!filtroCategoria) return productos;
    return productos.filter(p => p.categoria === filtroCategoria);
  }, [productos, filtroCategoria]);
  
  const handleExportar = (formato: 'pdf' | 'excel') => {
    if (formato === 'pdf') {
      exportarInventarioPDF(productosFiltrados);
    } else {
      exportarInventarioExcel(productosFiltrados);
    }
    
    toast.success(`✅ ${productosFiltrados.length} productos exportados`);
  };
  
  return (
    <div>
      <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Todas</SelectItem>
          <SelectItem value="Cereales">Cereales</SelectItem>
          <SelectItem value="Legumbres">Legumbres</SelectItem>
        </SelectContent>
      </Select>
      
      <Button onClick={() => handleExportar('pdf')}>PDF</Button>
      <Button onClick={() => handleExportar('excel')}>Excel</Button>
    </div>
  );
}
```

---

### Ejemplo 3: Exportar Estadísticas Completas

```typescript
import { exportarEstadisticasExcel } from '../utils/exportarExcel';

function ReporteCompleto() {
  const handleGenerarReporteCompleto = () => {
    const datos = {
      resumen: {
        totalProductos: productos.length,
        totalStock: calcularStockTotal(),
        totalComandas: comandas.length,
        totalOrganismos: organismos.filter(o => o.activo).length,
        valorTotal: calcularValorTotal(),
        periodo: 'Enero 2026',
      },
      inventario: productos.map(p => ({
        Código: p.codigo,
        Producto: p.nombre,
        Stock: p.stockActual,
        Valor: `$${p.valorPorKg * p.stockActual}`,
      })),
      comandas: comandas.map(c => ({
        Número: c.numero,
        Organismo: c.organismo.nombre,
        Estado: c.estado,
        Fecha: formatearFecha(c.fecha),
      })),
      organismos: organismos.map(o => ({
        Nombre: o.nombre,
        Tipo: o.tipo,
        Beneficiarios: o.beneficiarios,
      })),
      periodo: 'Enero 2026',
    };
    
    exportarEstadisticasExcel(datos);
    toast.success('📊 Reporte completo generado con múltiples hojas');
  };
  
  return (
    <Button onClick={handleGenerarReporteCompleto}>
      Generar Reporte Completo
    </Button>
  );
}
```

---

## 4. ⚡ HOOKS DE OPTIMIZACIÓN

### Ejemplo 1: useDebounce para Búsqueda

```typescript
import { useDebounce } from '../hooks/useOptimizacion';
import { useState, useEffect } from 'react';

function BusquedaProductos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultados, setResultados] = useState([]);
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  useEffect(() => {
    if (debouncedSearch) {
      // Esta búsqueda solo se ejecuta 300ms después de que el usuario deja de escribir
      buscarProductos(debouncedSearch).then(setResultados);
    }
  }, [debouncedSearch]);
  
  return (
    <div>
      <Input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar productos..."
      />
      <div>
        {resultados.map(producto => (
          <div key={producto.id}>{producto.nombre}</div>
        ))}
      </div>
    </div>
  );
}
```

---

### Ejemplo 2: usePaginacion para Tablas Grandes

```typescript
import { usePaginacion } from '../hooks/useOptimizacion';

function TablaProductos({ productos }) {
  const {
    itemsPaginados,
    paginaActual,
    totalPaginas,
    siguiente,
    anterior,
    hayAnterior,
    haySiguiente,
  } = usePaginacion(productos, 20); // 20 items por página
  
  return (
    <div>
      <table>
        <tbody>
          {itemsPaginados.map(producto => (
            <tr key={producto.id}>
              <td>{producto.nombre}</td>
              <td>{producto.stock}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="flex items-center gap-2 justify-center mt-4">
        <Button 
          onClick={anterior} 
          disabled={!hayAnterior}
        >
          Anterior
        </Button>
        
        <span>
          Página {paginaActual} de {totalPaginas}
        </span>
        
        <Button 
          onClick={siguiente} 
          disabled={!haySiguiente}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
```

---

### Ejemplo 3: useFiltroOptimizado

```typescript
import { useFiltroOptimizado } from '../hooks/useOptimizacion';
import { useState } from 'react';

function ListaProductosFiltrada({ productos }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  
  const productosFiltrados = useFiltroOptimizado(
    productos,
    searchTerm,
    ['nombre', 'codigo', 'categoria'], // Campos de búsqueda
    (producto) => !soloDisponibles || producto.stockActual > 0 // Filtro adicional
  );
  
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar..."
        />
        <label>
          <input 
            type="checkbox"
            checked={soloDisponibles}
            onChange={(e) => setSoloDisponibles(e.target.checked)}
          />
          Solo disponibles
        </label>
      </div>
      
      <div>
        {productosFiltrados.length} productos encontrados
      </div>
      
      <div>
        {productosFiltrados.map(producto => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}
```

---

### Ejemplo 4: useOrdenamiento

```typescript
import { useOrdenamiento } from '../hooks/useOptimizacion';

function TablaOrdenable({ productos }) {
  const { itemsOrdenados, sortConfig, ordenarPor } = useOrdenamiento(
    productos,
    'nombre', // Campo por defecto
    'asc'     // Dirección por defecto
  );
  
  const getSortIcon = (campo: string) => {
    if (sortConfig.key !== campo) return '⇅';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };
  
  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => ordenarPor('nombre')}>
            Nombre {getSortIcon('nombre')}
          </th>
          <th onClick={() => ordenarPor('stockActual')}>
            Stock {getSortIcon('stockActual')}
          </th>
          <th onClick={() => ordenarPor('categoria')}>
            Categoría {getSortIcon('categoria')}
          </th>
        </tr>
      </thead>
      <tbody>
        {itemsOrdenados.map(producto => (
          <tr key={producto.id}>
            <td>{producto.nombre}</td>
            <td>{producto.stockActual}</td>
            <td>{producto.categoria}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 5. 🚀 LAZY LOADING

### Ejemplo 1: Lazy Load de Páginas en App.tsx

```typescript
import React, { Suspense } from 'react';
import { 
  LazyDashboard,
  LazyInventario,
  LazyComandas,
  PageLoadingFallback 
} from './utils/lazyLoad';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <LazyDashboard />
          </Suspense>
        );
      
      case 'inventario':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <LazyInventario />
          </Suspense>
        );
      
      case 'comandas':
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <LazyComandas />
          </Suspense>
        );
      
      default:
        return (
          <Suspense fallback={<PageLoadingFallback />}>
            <LazyDashboard />
          </Suspense>
        );
    }
  };
  
  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}
```

---

### Ejemplo 2: Lazy Load de Diálogos Pesados

```typescript
import { lazy, Suspense } from 'react';
import { LoadingFallback } from '../utils/lazyLoad';

// Lazy load de diálogo pesado
const DialogDistribuirProductos = lazy(
  () => import('./inventario/DialogDistribuirProductos')
);

function Inventario() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setDialogOpen(true)}>
        Distribuir Productos
      </Button>
      
      {dialogOpen && (
        <Suspense fallback={<LoadingFallback mensaje="Cargando..." />}>
          <DialogDistribuirProductos
            open={dialogOpen}
            onOpenChange={setDialogOpen}
          />
        </Suspense>
      )}
    </div>
  );
}
```

---

## 6. 🎨 ANIMACIONES CON MOTION

### Ejemplo 1: Animación de Lista

```typescript
import { motion, AnimatePresence } from 'motion/react';

function ListaAnimada({ items }) {
  return (
    <AnimatePresence>
      {items.map(item => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-4 rounded-lg shadow mb-2"
        >
          {item.nombre}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

---

### Ejemplo 2: Animación de Entrada de Modal

```typescript
import { motion } from 'motion/react';
import { Dialog, DialogContent } from './ui/dialog';

function DialogAnimado({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent asChild>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
        >
          <h2>Contenido del Modal</h2>
          {/* ... */}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 7. 🔄 INTEGRACIÓN COMPLETA

### Ejemplo: Página Completa Optimizada

```typescript
import React, { Suspense } from 'react';
import { useDebounce, usePaginacion, useFiltroOptimizado } from '../hooks/useOptimizacion';
import { usePermisos } from '../stores/usePermisos';
import { ProtectedComponent } from '../components/ProtectedComponent';
import { exportarInventarioPDF, exportarInventarioExcel } from '../utils/exportarPDF';
import { notificarSistema } from '../stores/useNotificaciones';
import { LoadingFallback } from '../utils/lazyLoad';

function InventarioOptimizado() {
  // Estado
  const [productos, setProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Optimización
  const debouncedSearch = useDebounce(searchTerm, 300);
  const productosFiltrados = useFiltroOptimizado(
    productos,
    debouncedSearch,
    ['nombre', 'codigo']
  );
  const { itemsPaginados, paginaActual, totalPaginas, siguiente, anterior } =
    usePaginacion(productosFiltrados, 20);
  
  // Permisos
  const { tienePermiso } = usePermisos();
  
  // Cargar datos
  useEffect(() => {
    cargarProductos().then(data => {
      setProductos(data);
      setLoading(false);
    });
  }, []);
  
  // Exportar
  const handleExportar = (formato: 'pdf' | 'excel') => {
    if (formato === 'pdf') {
      exportarInventarioPDF(productosFiltrados);
    } else {
      exportarInventarioExcel(productosFiltrados);
    }
    
    notificarSistema(
      'Exportación Exitosa',
      `${productosFiltrados.length} productos exportados`,
      'baja'
    );
  };
  
  if (loading) {
    return <LoadingFallback mensaje="Cargando inventario..." />;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar productos..."
          className="max-w-md"
        />
        
        <ProtectedComponent permisoRequerido="inventario_exportar">
          <div className="flex gap-2">
            <Button onClick={() => handleExportar('pdf')}>
              PDF
            </Button>
            <Button onClick={() => handleExportar('excel')}>
              Excel
            </Button>
          </div>
        </ProtectedComponent>
      </div>
      
      <div>
        {itemsPaginados.map(producto => (
          <ProductoCard key={producto.id} producto={producto} />
        ))}
      </div>
      
      <div className="flex justify-center gap-2">
        <Button onClick={anterior}>Anterior</Button>
        <span>Página {paginaActual} de {totalPaginas}</span>
        <Button onClick={siguiente}>Siguiente</Button>
      </div>
    </div>
  );
}
```

---

## 💡 CONSEJOS FINALES

1. **Permisos:** Siempre verifica permisos antes de operaciones sensibles
2. **Notificaciones:** Usa el tipo y prioridad apropiados
3. **Exportaciones:** Filtra datos antes de exportar para mejores reportes
4. **Optimización:** Usa hooks de optimización en componentes con muchos datos
5. **Lazy Loading:** Aplica a rutas y diálogos pesados, no a componentes pequeños

---

**¡Todo listo para usar!** 🚀
