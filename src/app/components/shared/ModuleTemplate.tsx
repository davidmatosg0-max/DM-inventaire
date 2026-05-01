/**
 * PLANTILLA DE MÓDULO ESTANDARIZADO
 * 
 * Este es un ejemplo de cómo debe estructurarse un módulo
 * siguiendo los estándares de diseño de la Banque Alimentaire.
 * 
 * Copia esta plantilla para crear nuevos módulos o actualizar existentes.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus, TrendingUp, Search, Filter } from 'lucide-react';
import {
  ModuleContainer,
  ModuleHeader,
  ModuleSection,
  StatCard,
  ModuleTable,
  ModuleCardList,
} from './index';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

/**
 * Ejemplo de módulo con diseño estandarizado
 */
export function ModuleTemplate() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Datos de ejemplo
  const statsData = [
    {
      icon: Package,
      title: 'Total de Productos',
      value: '1,234',
      iconColor: '#1a4d7a',
      borderColor: '#1a4d7a',
      valueColor: '#1a4d7a',
      trendIcon: TrendingUp,
      trendColor: '#10b981',
      badge: { text: '100 activos', variant: 'primary' as const },
    },
    {
      icon: Package,
      title: 'Stock Bajo',
      value: '23',
      iconColor: '#c23934',
      borderColor: '#c23934',
      valueColor: '#c23934',
      badge: { text: 'Requiere atención', variant: 'danger' as const },
    },
    {
      icon: Package,
      title: 'Valor Total',
      value: 'CAD$ 45,678',
      iconColor: '#2d9561',
      borderColor: '#2d9561',
      valueColor: '#2d9561',
      trendIcon: TrendingUp,
      badge: { text: '+12% este mes', variant: 'success' as const },
    },
    {
      icon: Package,
      title: 'Movimientos',
      value: '156',
      iconColor: '#e8a419',
      borderColor: '#e8a419',
      valueColor: '#e8a419',
      badge: { text: 'Esta semana', variant: 'warning' as const },
    },
  ];

  const tableData = [
    { id: '1', nombre: 'Producto A', categoria: 'Alimentos', stock: 100, estado: 'Activo' },
    { id: '2', nombre: 'Producto B', categoria: 'Bebidas', stock: 45, estado: 'Activo' },
    { id: '3', nombre: 'Producto C', categoria: 'Alimentos', stock: 12, estado: 'Stock Bajo' },
  ];

  const tableColumns = [
    {
      key: 'nombre',
      header: 'Nombre',
      render: (item: typeof tableData[0]) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.nombre}</span>
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
    },
    {
      key: 'stock',
      header: 'Stock',
      className: 'text-right font-semibold',
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (item: typeof tableData[0]) => (
        <Badge variant={item.estado === 'Activo' ? 'default' : 'destructive'}>
          {item.estado}
        </Badge>
      ),
    },
  ];

  return (
    <ModuleContainer>
      {/* 1. ENCABEZADO DEL MÓDULO */}
      <ModuleHeader
        icon={Package}
        title="Mi Módulo"
        description="Descripción breve del módulo y su funcionalidad"
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Agregar Nuevo
            </Button>
          </>
        }
      />

      {/* 2. TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            iconColor={stat.iconColor}
            borderColor={stat.borderColor}
            valueColor={stat.valueColor}
            trendIcon={stat.trendIcon}
            trendColor={stat.trendColor}
            badge={stat.badge}
          />
        ))}
      </div>

      {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
      <ModuleSection
        title="Búsqueda y Filtros"
        icon={Search}
        variant="glass"
      >
        <div className="flex gap-3">
          <Input
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avanzados
          </Button>
        </div>
      </ModuleSection>

      {/* 4. TABLA DE DATOS */}
      <ModuleSection
        title="Lista de Productos"
        description="Visualiza y gestiona todos los productos del inventario"
        icon={Package}
        variant="glass"
        actions={
          <Button variant="outline" size="sm">
            Exportar
          </Button>
        }
      >
        <ModuleTable
          data={tableData}
          columns={tableColumns}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => console.log('Click en:', item)}
          hoverable
          striped
        />
      </ModuleSection>

      {/* 5. LISTA CON TARJETAS */}
      <ModuleSection
        title="Vista de Tarjetas"
        description="Visualización alternativa en formato de tarjetas"
        icon={Package}
      >
        <ModuleCardList
          data={tableData}
          columns={3}
          gap="md"
          keyExtractor={(item) => item.id}
          emptyMessage="No hay productos disponibles"
          emptyIcon={<Package className="w-16 h-16" />}
          renderCard={(item) => (
            <Card className="shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{item.nombre}</span>
                  <Badge variant={item.estado === 'Activo' ? 'default' : 'destructive'}>
                    {item.estado}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Categoría:</span>
                    <span className="font-medium">{item.categoria}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stock:</span>
                    <span className="font-semibold text-primary">{item.stock}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        />
      </ModuleSection>

      {/* 6. SECCIÓN ADICIONAL CON GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModuleSection
          title="Sección Izquierda"
          icon={Package}
          variant="glass"
        >
          <p className="text-sm text-muted-foreground">
            Contenido de la sección izquierda con efecto glassmorphism
          </p>
        </ModuleSection>

        <ModuleSection
          title="Sección Derecha"
          icon={Package}
        >
          <p className="text-sm text-muted-foreground">
            Contenido de la sección derecha con diseño estándar
          </p>
        </ModuleSection>
      </div>
    </ModuleContainer>
  );
}
