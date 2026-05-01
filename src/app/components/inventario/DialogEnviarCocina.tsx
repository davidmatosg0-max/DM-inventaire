import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChefHat, Package, Utensils, ArrowRight, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { enviarProductosACocina, type ProductoCocina } from '../../utils/recetaStorage';
import { formatQuantity } from '../../utils/formatUtils';

type CarritoItem = {
  productoId: string;
  cantidad: number;
};

interface DialogEnviarCocinaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrito: CarritoItem[];
  productos: any[];
  categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string }>;
  onEnvioCompletado: () => void;
}

type TipoEnvio = 'receta' | 'transformacion' | 'inventario';

export function DialogEnviarCocina({
  open,
  onOpenChange,
  carrito,
  productos,
  categoriasInfo,
  onEnvioCompletado
}: DialogEnviarCocinaProps) {
  const { t } = useTranslation();
  const [tipoEnvio, setTipoEnvio] = useState<TipoEnvio>('transformacion');
  const [notas, setNotas] = useState('');
  const [enviando, setEnviando] = useState(false);

  const usuarioActual = 'Usuario Sistema';

  // Calcular productos del envío
  const productosEnvio: ProductoCocina[] = carrito.map(item => {
    const producto = productos.find(p => p.id === item.productoId);
    const categoriaInfo = categoriasInfo[producto?.categoria || ''];
    
    return {
      productoId: item.productoId,
      productoNombre: producto?.nombre || '',
      productoCodigo: producto?.codigo || '',
      categoria: producto?.categoria || '',
      subcategoria: producto?.subcategoria || '',
      cantidad: item.cantidad,
      unidad: producto?.unidad || '',
      peso: producto?.peso || 0,
      icono: producto?.icono || categoriaInfo?.icono || '📦'
    };
  });

  // Calcular totales
  const totales = {
    totalProductos: productosEnvio.length,
    totalItems: productosEnvio.reduce((sum, p) => sum + p.cantidad, 0),
    totalKilos: productosEnvio.reduce((sum, p) => {
      if (p.unidad === 'kg') {
        return sum + p.cantidad;
      }
      return sum + (p.cantidad * p.peso);
    }, 0)
  };

  // Reiniciar formulario cuando se abre el diálogo
  React.useEffect(() => {
    if (open) {
      setTipoEnvio('transformacion');
      setNotas('');
      setEnviando(false);
    }
  }, [open]);

  const handleEnviar = async () => {
    if (carrito.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    setEnviando(true);

    try {
      const envioId = await enviarProductosACocina({
        productos: productosEnvio,
        tipoEnvio,
        notas,
        usuarioEnvio: usuarioActual
      });

      toast.success(
        tipoEnvio === 'receta' 
          ? '✅ Produits envoyés pour création de recette'
          : tipoEnvio === 'transformacion'
          ? '✅ Produits envoyés pour transformation'
          : '✅ Produits ajoutés à l\'inventaire Cuisine',
        {
          description: `${totales.totalProductos} produit(s) • ${formatQuantity(totales.totalKilos)} kg`
        }
      );

      onEnvioCompletado();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al enviar productos a cocina:', error);
      toast.error('Erreur lors de l\'envoi des produits');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="enviar-cocina-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ChefHat className="w-6 h-6 text-[#FF9800]" />
            Envoyer à Cuisine et Transformation
          </DialogTitle>
          <DialogDescription id="enviar-cocina-description">
            Sélectionnez le type d'envoi et les produits seront transférés au département Cuisine
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tipo de Envío */}
          <div>
            <Label className="text-base mb-3 block" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Type d'envoi
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card
                className={`cursor-pointer transition-all ${
                  tipoEnvio === 'transformacion'
                    ? 'ring-2 ring-[#FF9800] bg-orange-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setTipoEnvio('transformacion')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tipoEnvio === 'transformacion' ? 'bg-[#FF9800]' : 'bg-gray-200'
                    }`}>
                      <Package className={`w-5 h-5 ${
                        tipoEnvio === 'transformacion' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Transformation
                      </p>
                      <p className="text-xs text-gray-600">
                        Créer une transformation
                      </p>
                    </div>
                    {tipoEnvio === 'transformacion' && (
                      <CheckCircle className="w-5 h-5 text-[#FF9800]" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  tipoEnvio === 'receta'
                    ? 'ring-2 ring-[#4CAF50] bg-green-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setTipoEnvio('receta')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tipoEnvio === 'receta' ? 'bg-[#4CAF50]' : 'bg-gray-200'
                    }`}>
                      <Utensils className={`w-5 h-5 ${
                        tipoEnvio === 'receta' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Recette
                      </p>
                      <p className="text-xs text-gray-600">
                        Créer une recette
                      </p>
                    </div>
                    {tipoEnvio === 'receta' && (
                      <CheckCircle className="w-5 h-5 text-[#4CAF50]" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  tipoEnvio === 'inventario'
                    ? 'ring-2 ring-[#1E73BE] bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setTipoEnvio('inventario')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tipoEnvio === 'inventario' ? 'bg-[#1E73BE]' : 'bg-gray-200'
                    }`}>
                      <ChefHat className={`w-5 h-5 ${
                        tipoEnvio === 'inventario' ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Inventaire Cuisine
                      </p>
                      <p className="text-xs text-gray-600">
                        Ajouter à l'inventaire
                      </p>
                    </div>
                    {tipoEnvio === 'inventario' && (
                      <CheckCircle className="w-5 h-5 text-[#1E73BE]" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resumen de productos */}
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-[#FF9800]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-[#FF9800] mb-2 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Package className="w-5 h-5" />
                    Résumé de l'envoi
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Produits</p>
                      <p className="text-xl font-bold text-[#333333]">{totales.totalProductos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Quantité totale</p>
                      <p className="text-xl font-bold text-[#333333]">{totales.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Poids total</p>
                      <p className="text-xl font-bold text-[#333333]">{formatQuantity(totales.totalKilos)} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de productos */}
          <div>
            <Label className="text-base mb-3 block" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Produits à envoyer ({productosEnvio.length})
            </Label>
            <Card>
              <CardContent className="p-0">
                <div className="max-h-60 overflow-y-auto">
                  {productosEnvio.map((producto, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{producto.icono}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{producto.productoNombre}</p>
                          <p className="text-xs text-gray-600">
                            {producto.categoria}
                            {producto.subcategoria && ` › ${producto.subcategoria}`}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-[#1E73BE]">
                        {producto.cantidad} {producto.unidad}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notas */}
          <div>
            <Label htmlFor="notas" className="text-base mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              Notes (optionnel)
            </Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ajouter des instructions ou observations..."
              className="min-h-[80px]"
            />
          </div>

          {/* Información adicional según tipo */}
          <Card className={`border-l-4 ${
            tipoEnvio === 'transformacion' ? 'border-l-[#FF9800] bg-orange-50' :
            tipoEnvio === 'receta' ? 'border-l-[#4CAF50] bg-green-50' :
            'border-l-[#1E73BE] bg-blue-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className={`w-5 h-5 mt-0.5 ${
                  tipoEnvio === 'transformacion' ? 'text-[#FF9800]' :
                  tipoEnvio === 'receta' ? 'text-[#4CAF50]' :
                  'text-[#1E73BE]'
                }`} />
                <div className="flex-1">
                  <p className="font-semibold text-sm mb-1">
                    {tipoEnvio === 'transformacion' && 'Transformation'}
                    {tipoEnvio === 'receta' && 'Recette'}
                    {tipoEnvio === 'inventario' && 'Inventaire Cuisine'}
                  </p>
                  <p className="text-xs text-gray-700">
                    {tipoEnvio === 'transformacion' && 
                      'Les produits seront disponibles dans Cuisine pour créer une nouvelle transformation. Vous pourrez définir les étapes, temps de cuisson et produits finaux.'}
                    {tipoEnvio === 'receta' && 
                      'Les produits seront disponibles pour créer une nouvelle recette. Vous pourrez ajouter des instructions, portions et informations nutritionnelles.'}
                    {tipoEnvio === 'inventario' && 
                      'Les produits seront ajoutés directement à l\'inventaire du département Cuisine pour utilisation immédiate.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={enviando}
          >
            <X className="w-4 h-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleEnviar}
            disabled={enviando || carrito.length === 0}
            className={`${
              tipoEnvio === 'transformacion' ? 'bg-[#FF9800] hover:bg-[#F57C00]' :
              tipoEnvio === 'receta' ? 'bg-[#4CAF50] hover:bg-[#45a049]' :
              'bg-[#1E73BE] hover:bg-[#1557A0]'
            }`}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            {enviando ? 'Envoi en cours...' : 'Envoyer à Cuisine'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}