/**
 * OfertasDisponibles - Gestión de Ofertas desde Inventario a Cuisine
 * 
 * Este componente muestra y gestiona las ofertas de productos enviadas desde
 * el módulo de Inventario al departamento de Cuisine et Transformation.
 * 
 * FLUJO COMPLETO:
 * 1. Usuario en Inventario selecciona productos y hace clic en "Envoyer à Cuisine"
 * 2. Los productos se guardan con un número de envío (ENV-2024-XXX)
 * 3. Aparecen aquí como "ofertas pendientes"
 * 4. Chef de Cuisine puede:
 *    - Ver detalles de cada oferta
 *    - Modificar cantidades de productos
 *    - Eliminar productos que no necesita
 *    - Aceptar la oferta (se procesan los productos)
 *    - Rechazar la oferta (se cancela el envío)
 * 5. Al aceptar, los productos quedan disponibles para crear recetas o transformaciones
 * 
 * @param onOfertaAceptada - Callback opcional que se ejecuta al aceptar una oferta
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, ChefHat, CheckCircle, X, Edit, Trash2, AlertCircle, Calendar, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { mockProductos } from '../../data/mockData';
import { obtenerProductos } from '../../utils/productStorage';
import { 
  obtenerEnviosPendientes, 
  procesarEnvioCocina, 
  cancelarEnvioCocina,
  type EnvioCocina,
  type ProductoCocina 
} from '../../utils/recetaStorage';
import { agregarProductosDesdeOferta } from '../../utils/inventarioCocinaStorage';
import { formatQuantity } from '../../utils/formatUtils';
import { sortByTemperature } from '../../utils/temperatureSort';

interface OfertasDisponiblesProps {
  onOfertaAceptada?: () => void;
}

export function OfertasDisponibles({ onOfertaAceptada }: OfertasDisponiblesProps) {
  const { t } = useTranslation();
  const [enviosPendientes, setEnviosPendientes] = useState<EnvioCocina[]>([]);
  const [envioSeleccionado, setEnvioSeleccionado] = useState<EnvioCocina | null>(null);
  const [modalDetallesOpen, setModalDetallesOpen] = useState(false);
  const [productosModificados, setProductosModificados] = useState<ProductoCocina[]>([]);
  const [notasCocina, setNotasCocina] = useState('');
  const productosReales = obtenerProductos();
  const productosCatalogoMap = new Map(
    [
      ...productosReales,
      ...mockProductos.filter(mockProducto => !productosReales.some(producto => producto.id === mockProducto.id))
    ].map(producto => [producto.id, producto])
  );

  const ordenarProductosPorTemperatura = <T extends {
    productoId: string;
    productoNombre?: string;
    nombreProducto?: string;
    temperatura?: string;
    temperaturaAlmacenamiento?: string;
  }>(productos: T[]) => sortByTemperature(
    productos,
    producto => {
      const productoCatalogo = productosCatalogoMap.get(producto.productoId);
      return producto.temperaturaAlmacenamiento ||
        producto.temperatura ||
        productoCatalogo?.temperaturaAlmacenamiento ||
        (productoCatalogo as { temperatura?: string } | undefined)?.temperatura;
    },
    (a, b) => String(a.productoNombre || a.nombreProducto || '').localeCompare(
      String(b.productoNombre || b.nombreProducto || ''),
      'fr',
    )
  );

  useEffect(() => {
    cargarEnvios();
  }, []);

  const cargarEnvios = () => {
    const envios = obtenerEnviosPendientes();
    setEnviosPendientes(envios);
  };

  const handleVerDetalles = (envio: EnvioCocina) => {
    setEnvioSeleccionado(envio);
    setProductosModificados(ordenarProductosPorTemperatura(envio.productos));
    setNotasCocina('');
    setModalDetallesOpen(true);
  };

  const handleModificarCantidad = (index: number, nuevaCantidad: number) => {
    const nuevosProductos = [...productosModificados];
    if (nuevaCantidad > 0) {
      nuevosProductos[index] = {
        ...nuevosProductos[index],
        cantidad: nuevaCantidad
      };
      setProductosModificados(nuevosProductos);
    }
  };

  const handleEliminarProducto = (index: number) => {
    const nuevosProductos = productosModificados.filter((_, i) => i !== index);
    setProductosModificados(nuevosProductos);
    toast.success('Produit retiré de l\'offre');
  };

  const handleAceptarOferta = () => {
    if (!envioSeleccionado) return;

    if (productosModificados.length === 0) {
      toast.error('Vous devez garder au moins un produit');
      return;
    }

    // Primero agregar productos al inventario de cocina
    try {
      agregarProductosDesdeOferta(
        productosModificados,
        envioSeleccionado.numeroEnvio,
        'Chef Cuisine'
      );
    } catch (error) {
      console.error('Error al agregar productos al inventario:', error);
      toast.error('Erreur lors de l\'ajout des produits à l\'inventaire');
      return;
    }

    // Luego marcar el envío como procesado
    const exito = procesarEnvioCocina(envioSeleccionado.id, 'Chef Cuisine');

    if (exito) {
      toast.success(
        '✅ Offre acceptée avec succès!',
        {
          description: `${productosModificados.length} produit(s) ajouté(s) à l\'inventaire Cuisine`
        }
      );
      
      setModalDetallesOpen(false);
      setEnvioSeleccionado(null);
      cargarEnvios();
      onOfertaAceptada?.();
    } else {
      toast.error('Erreur lors du traitement de l\'offre');
    }
  };

  const handleRechazarOferta = () => {
    if (!envioSeleccionado) return;

    const exito = cancelarEnvioCocina(envioSeleccionado.id);

    if (exito) {
      toast.success('Offre refusée');
      setModalDetallesOpen(false);
      setEnvioSeleccionado(null);
      cargarEnvios();
    } else {
      toast.error('Erreur lors du refus de l\'offre');
    }
  };

  const calcularTotales = (productos: ProductoCocina[]) => {
    const totalItems = productos.reduce((sum, p) => sum + p.cantidad, 0);
    const totalKg = productos.reduce((sum, p) => {
      if (p.unidad === 'kg') {
        return sum + p.cantidad;
      }
      return sum + (p.cantidad * p.peso);
    }, 0);

    return { totalItems, totalKg };
  };

  const getTipoEnvioBadge = (tipo: string) => {
    switch (tipo) {
      case 'receta':
        return <Badge className="bg-[#4CAF50]">🍽️ Recette</Badge>;
      case 'transformacion':
        return <Badge className="bg-[#FF9800]">🔸 Transformation</Badge>;
      case 'inventario':
        return <Badge className="bg-[#1E73BE]">👨‍🍳 Inventaire</Badge>;
      default:
        return <Badge>{tipo}</Badge>;
    }
  };

  if (enviosPendientes.length === 0) {
    return (
      <Card className="border-2 border-dashed border-gray-300">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-600 mb-1">Aucune offre disponible</p>
              <p className="text-sm text-gray-500">
                Les produits envoyés depuis l'inventaire apparaîtront ici
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              📦 Offres Disponibles
            </h3>
            <p className="text-sm text-gray-600">
              {enviosPendientes.length} offre{enviosPendientes.length > 1 ? 's' : ''} en attente
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {enviosPendientes.map((envio) => {
            const totales = calcularTotales(envio.productos);
            
            return (
              <Card 
                key={envio.id}
                className="border-2 border-[#FF9800] hover:shadow-lg transition-all bg-gradient-to-r from-orange-50 to-yellow-50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg font-bold text-[#FF9800]">
                          {envio.numeroEnvio}
                        </CardTitle>
                        {getTipoEnvioBadge(envio.tipoEnvio)}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(envio.fechaEnvio).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {envio.usuarioEnvio}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Resumen */}
                    <div className="flex gap-4 p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Produits</p>
                        <p className="text-lg font-bold text-[#333333]">{envio.productos.length}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Quantité</p>
                        <p className="text-lg font-bold text-[#333333]">{totales.totalItems}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600">Poids</p>
                        <p className="text-lg font-bold text-[#333333]">{formatQuantity(totales.totalKg)} kg</p>
                      </div>
                    </div>

                    {/* Productos preview */}
                    <div className="bg-white rounded-lg border p-3">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Produits inclus:</p>
                      <div className="space-y-1">
                        {ordenarProductosPorTemperatura(envio.productos).slice(0, 3).map((producto, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span>{producto.icono}</span>
                            <span className="flex-1 text-gray-700">{producto.productoNombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {formatQuantity(producto.cantidad)} {producto.unidad}
                            </Badge>
                          </div>
                        ))}
                        {envio.productos.length > 3 && (
                          <p className="text-xs text-gray-500 italic">
                            ... et {envio.productos.length - 3} autre(s) produit(s)
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Notas */}
                    {envio.notas && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-blue-900 mb-1">Notes:</p>
                            <p className="text-sm text-blue-800">{envio.notas}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleVerDetalles(envio)}
                        className="flex-1 bg-[#FF9800] hover:bg-[#F57C00] text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Voir Détails & Modifier
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal de detalles */}
      <Dialog open={modalDetallesOpen} onOpenChange={setModalDetallesOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="ofertas-detalles-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <ChefHat className="w-6 h-6 text-[#FF9800]" />
              Détails de l'Offre
            </DialogTitle>
            <DialogDescription id="ofertas-detalles-description">
              Informations complètes sur les produits disponibles
            </DialogDescription>
          </DialogHeader>

          {envioSeleccionado && (
            <div className="space-y-4">
              {/* Info del envío */}
              <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-[#FF9800]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Type</p>
                      {getTipoEnvioBadge(envioSeleccionado.tipoEnvio)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Date</p>
                      <p className="font-semibold text-sm">
                        {new Date(envioSeleccionado.fechaEnvio).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Envoyé par</p>
                      <p className="font-semibold text-sm">{envioSeleccionado.usuarioEnvio}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Produits</p>
                      <p className="font-semibold text-sm">{productosModificados.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notas originales */}
              {envioSeleccionado.notas && (
                <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Notes de l'inventaire:</p>
                    <p className="text-sm text-blue-800">{envioSeleccionado.notas}</p>
                  </CardContent>
                </Card>
              )}

              {/* Lista de productos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[#333333]">Produits</h4>
                  <Badge className="bg-[#FF9800]">
                    {productosModificados.length} produit(s)
                  </Badge>
                </div>
                <div className="space-y-2">
                  {productosModificados.map((producto, index) => (
                    <Card key={index} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">{producto.icono}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{producto.productoNombre}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={producto.cantidad}
                              onChange={(e) => handleModificarCantidad(index, parseFloat(e.target.value) || 0)}
                              className="w-20 text-center"
                              min="0"
                              step="1"
                            />
                            <span className="text-sm font-medium">{producto.unidad}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEliminarProducto(index)}
                            className="text-red-600 hover:text-white hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-600">Produits</p>
                      <p className="text-2xl font-bold text-[#333333]">
                        {productosModificados.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Quantité totale</p>
                      <p className="text-2xl font-bold text-[#333333]">
                        {calcularTotales(productosModificados).totalItems}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Poids total</p>
                      <p className="text-2xl font-bold text-[#333333]">
                        {formatQuantity(calcularTotales(productosModificados).totalKg)} kg
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notas de cocina */}
              <div>
                <label className="block text-sm font-semibold text-[#333333] mb-2">
                  Notes de la cuisine (optionnel)
                </label>
                <Textarea
                  value={notasCocina}
                  onChange={(e) => setNotasCocina(e.target.value)}
                  placeholder="Ajoutez des observations ou instructions..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Advertencia si se eliminaron productos */}
              {productosModificados.length < envioSeleccionado.productos.length && (
                <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-orange-900">
                          Produits retirés: {envioSeleccionado.productos.length - productosModificados.length}
                        </p>
                        <p className="text-xs text-orange-800 mt-1">
                          Les produits retirés ne seront pas ajoutés à votre inventaire
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleRechazarOferta}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Refuser l'Offre
            </Button>
            <Button
              onClick={handleAceptarOferta}
              disabled={productosModificados.length === 0}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accepter l'Offre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}