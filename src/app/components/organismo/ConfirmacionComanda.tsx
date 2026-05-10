import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, Edit2, Minus, Plus, Package, AlertCircle, Calendar, FileText, Box, Users, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { obtenerComandas, actualizarComanda } from '../../utils/comandaStorage';
import {
  NOTIFICACIONES_COMANDA_EVENT,
  obtenerNotificacionesPorOrganismo,
  obtenerNotificacionesNoLeidas,
  marcarNotificacionComoLeida,
} from '../../utils/notificacionStorage';
import { mockProductos } from '../../data/mockData';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerPersonasPorOrganismo, type PersonaResponsable } from '../../utils/personasResponsablesStorage';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import type { Comanda } from '../../types';
import { SimulacionRecepcionNotificacion } from './SimulacionRecepcionNotificacion';
import { useBranding } from '../../../hooks/useBranding';

interface ConfirmacionComandaProps {
  organismoId: string;
  organismo?: any;
}

export function ConfirmacionComanda({ organismoId, organismo }: ConfirmacionComandaProps) {
  const branding = useBranding();
  const { t } = useTranslation();
  const defaultLocale = 'fr-CA';
  type NotificacionOrganismo = ReturnType<typeof obtenerNotificacionesPorOrganismo>[number];

  const obtenerEtiquetaProducto = (producto: any, nombreProducto?: string) => {
    return nombreProducto || producto?.nombre || producto?.subcategoria || 'Produit introuvable';
  };

  const obtenerPoidsUnitaire = (producto: any) => {
    if (typeof producto?.pesoUnitario !== 'number' || producto.pesoUnitario <= 0) {
      return null;
    }

    return `Poids unitaire : ${formatQuantity(producto.pesoUnitario)} kg`;
  };

  const obtenerValorUnitario = (item: any, producto?: any) => {
    if (typeof item?.valorUnitario === 'number' && item.valorUnitario > 0) {
      return item.valorUnitario;
    }

    if (typeof producto?.valorUnitario === 'number' && producto.valorUnitario > 0) {
      return producto.valorUnitario;
    }

    return 0;
  };

  const [comandasPendientes, setComandasPendientes] = useState<Comanda[]>([]);
  const [comandaEnEdicion, setComandaEnEdicion] = useState<string | null>(null);
  const [cantidadesEditadas, setCantidadesEditadas] = useState<{ [key: string]: number }>({});
  const [personaRecogida, setPersonaRecogida] = useState<{ [key: string]: string }>({});
  const [telefonoRecogida, setTelefonoRecogida] = useState<{ [key: string]: string }>({});
  const [personasResponsables, setPersonasResponsables] = useState<PersonaResponsable[]>([]);
  const [ultimaNotificacion, setUltimaNotificacion] = useState<NotificacionOrganismo | null>(null);
  const [notificacionReciente, setNotificacionReciente] = useState(false);

  const cargarUltimaNotificacion = () => {
    const notificaciones = obtenerNotificacionesPorOrganismo(organismoId);
    const masReciente = [...notificaciones].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )[0] || null;
    setUltimaNotificacion(masReciente);
  };

  const cargarComandasPendientes = (marcarNotificacionesComoLeidas = false) => {
    const todasLasComandas = obtenerComandas();
    const pendientes = todasLasComandas.filter(
      c => c.organismoId === organismoId && c.estado === 'pendiente'
    );
    setComandasPendientes(pendientes);
    
    if (marcarNotificacionesComoLeidas) {
      const notificaciones = obtenerNotificacionesNoLeidas(organismoId);
      notificaciones.forEach(n => marcarNotificacionComoLeida(n.id));
    }

    cargarUltimaNotificacion();
  };

  useEffect(() => {
    cargarComandasPendientes(true);
    // Cargar personas responsables
    const personas = obtenerPersonasPorOrganismo(organismoId);
    setPersonasResponsables(personas);
  }, [organismoId]);

  useEffect(() => {
    const handleNuevaNotificacion = (event: Event) => {
      const customEvent = event as CustomEvent<{ organismoId?: string }>;
      if (customEvent.detail?.organismoId && customEvent.detail.organismoId !== organismoId) {
        return;
      }

      cargarComandasPendientes();

      if (customEvent.detail && 'leida' in customEvent.detail && customEvent.detail.leida === false) {
        setNotificacionReciente(true);
        toast.success('Nouvelle notification reçue', {
          description: 'La nouvelle commande est disponible dans votre portail organisme.',
          duration: 5000,
        });
      }
    };

    window.addEventListener(NOTIFICACIONES_COMANDA_EVENT, handleNuevaNotificacion as EventListener);

    return () => {
      window.removeEventListener(NOTIFICACIONES_COMANDA_EVENT, handleNuevaNotificacion as EventListener);
    };
  }, [organismoId]);

  const iniciarEdicion = (comanda: Comanda) => {
    setComandaEnEdicion(comanda.id);
    const cantidades: { [key: string]: number } = {};
    comanda.items.forEach(item => {
      cantidades[item.productoId] = item.cantidad;
    });
    setCantidadesEditadas(cantidades);
  };

  const cancelarEdicion = () => {
    setComandaEnEdicion(null);
    setCantidadesEditadas({});
    setPersonaRecogida({});
    setTelefonoRecogida({});
  };

  const actualizarCantidad = (productoId: string, nuevaCantidad: number, cantidadOriginal: number) => {
    nuevaCantidad = Math.round(nuevaCantidad);
    cantidadOriginal = Math.round(cantidadOriginal);
    // Solo permitir disminuir la cantidad
    if (nuevaCantidad > cantidadOriginal) {
      toast.error('Vous pouvez seulement réduire les quantités');
      return;
    }
    if (nuevaCantidad < 0) {
      nuevaCantidad = 0;
    }
    setCantidadesEditadas({
      ...cantidadesEditadas,
      [productoId]: nuevaCantidad
    });
  };

  const seleccionarPersona = (comandaId: string, personaId: string) => {
    if (personaId === 'manual') {
      // Limpiar para ingreso manual
      setPersonaRecogida({ ...personaRecogida, [comandaId]: '' });
      setTelefonoRecogida({ ...telefonoRecogida, [comandaId]: '' });
    } else {
      const persona = personasResponsables.find(p => p.id === personaId);
      if (persona) {
        setPersonaRecogida({ ...personaRecogida, [comandaId]: persona.nombreCompleto });
        setTelefonoRecogida({ ...telefonoRecogida, [comandaId]: persona.telefono });
      }
    }
  };

  const aceptarComanda = (comanda: Comanda) => {
    const comandaPersistida = obtenerComandas().find(
      c => (comanda.id && c.id === comanda.id) || c.numero === comanda.numero
    ) || comanda;

    // Validar que se haya ingresado persona de recogida
    const persona = personaRecogida[comanda.id];
    if (!persona || !persona.trim()) {
      toast.error('Personne de collecte obligatoire', {
        description: 'Veuillez indiquer qui récupérera la commande.',
        duration: 4000
      });
      return;
    }
    
    // Si hay cantidades editadas, usar esas; si no, usar las originales
    const modificacionesRealizadas = Object.keys(cantidadesEditadas).length > 0;
    
    const comandaActualizada: Comanda = {
      ...comandaPersistida,
      estado: 'confirmada',
      confirmadaPorOrganismo: true,
      fechaConfirmacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString()
    };

    if (modificacionesRealizadas) {
      // Actualizar cantidades con las editadas
      comandaActualizada.items = comandaPersistida.items.map(item => ({
        ...item,
        cantidad: cantidadesEditadas[item.productoId] !== undefined 
          ? cantidadesEditadas[item.productoId] 
          : item.cantidad
      }));

      // Registrar las modificaciones
      const todosLosProductos = obtenerProductos();
      const modificaciones = comandaPersistida.items
        .map(item => {
          const producto = todosLosProductos.find(p => p.id === item.productoId) || 
                          mockProductos.find(p => p.id === item.productoId);
          const cantidadNueva = cantidadesEditadas[item.productoId];
          if (cantidadNueva !== undefined && cantidadNueva !== item.cantidad) {
            return `${producto?.nombre || item.productoId}: ${formatQuantity(item.cantidad)} → ${formatQuantity(cantidadNueva)}`;
          }
          return null;
        })
        .filter(Boolean)
        .join('; ');

      if (modificaciones) {
        comandaActualizada.modificacionesOrganismo = modificaciones;
        comandaActualizada.observaciones = 
          (comandaActualizada.observaciones || '') + 
          `\n[Modifications de l'organisme] : ${modificaciones}`;
      }

      // Recalcular totales
      const todosLosProductos2 = obtenerProductos();
      const nuevoValorTotal = comandaActualizada.items.reduce((sum, item) => {
        const producto = todosLosProductos2.find(p => p.id === item.productoId) || 
                        mockProductos.find(p => p.id === item.productoId);
        return sum + (item.cantidad * obtenerValorUnitario(item, producto));
      }, 0);

      const nuevoPesoTotal = comandaActualizada.items.reduce((sum, item) => {
        const producto = todosLosProductos2.find(p => p.id === item.productoId) || 
                        mockProductos.find(p => p.id === item.productoId);
        if (producto?.unidad === 'kg') {
          return sum + item.cantidad;
        }
        return sum;
      }, 0);

      comandaActualizada.pesoTotal = nuevoPesoTotal;
      comandaActualizada.valorTotal = nuevoValorTotal;
    }
    
    // Agregar información de persona de recogida
    const infoRecogida = `\n[Personne qui récupérera] : ${persona}${telefonoRecogida[comanda.id] ? ` (Tél. : ${telefonoRecogida[comanda.id]})` : ''}`;
    comandaActualizada.observaciones = (comandaActualizada.observaciones || '') + infoRecogida;

    actualizarComanda(comandaActualizada);
    
    toast.success('Commande acceptée avec succès', {
      description: modificacionesRealizadas 
        ? 'Les quantités ont été ajustées selon vos modifications' 
        : 'La commande a été acceptée avec les quantités originales',
      duration: 5000
    });

    cancelarEdicion();
    cargarComandasPendientes();
  };

  const anularComanda = (comanda: Comanda) => {
    const comandaPersistida = obtenerComandas().find(
      c => (comanda.id && c.id === comanda.id) || c.numero === comanda.numero
    ) || comanda;

    const comandaActualizada: Comanda = {
      ...comandaPersistida,
      estado: 'anulada',
      confirmadaPorOrganismo: false,
      fechaConfirmacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString(),
      observaciones: (comanda.observaciones || '') + '\n[Refusée par l\'organisme]'
    };

    actualizarComanda(comandaActualizada);
    
    toast.success('Commande annulée', {
      description: `La commande a été refusée et ${branding.systemName} a été avisée`,
      duration: 4000
    });

    cancelarEdicion();
    cargarComandasPendientes();
  };

  if (comandasPendientes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      <Card className="border-l-4 border-l-[#FFC107] bg-[#FFF8E1]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <AlertCircle className="w-5 h-5" />
            Commandes en attente de confirmation ({comandasPendientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {organismo && comandasPendientes[0] && (
            <SimulacionRecepcionNotificacion
              organismo={organismo}
              comanda={comandasPendientes[0]}
              notificacion={ultimaNotificacion}
              destacada={notificacionReciente}
            />
          )}

          {comandasPendientes.map((comanda) => {
            const esEdicion = comandaEnEdicion === comanda.id;
            
            return (
              <Card key={comanda.id} className="border-2 border-[#FFC107]">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Commande {comanda.numero}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Livraison : {comanda.fechaEntrega ? new Date(comanda.fechaEntrega).toLocaleDateString(defaultLocale) : 'Non précisée'}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#1E73BE]">
                          <Package className="w-4 h-4" />
                          {formatQuantity(comanda.pesoTotal ? comanda.pesoTotal : comanda.items.reduce((sum: number, item: any) => sum + item.cantidad, 0))} kg
                        </span>
                        {comanda.valorTotal && (
                          <span className="flex items-center gap-1 font-semibold text-[#4CAF50]">
                            💰
                            Valeur : CAD$ {formatMoney(comanda.valorTotal || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className="bg-[#FFC107] text-gray-900">
                      En attente de confirmation
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {/* Tabla de productos */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead className="text-right">Quantité</TableHead>
                        <TableHead>Unité</TableHead>
                        {esEdicion && <TableHead className="text-center">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comanda.items.map((item) => {
                        const todosLosProductos = obtenerProductos();
                        const producto = todosLosProductos.find(p => p.id === item.productoId) || 
                                        mockProductos.find(p => p.id === item.productoId);
                        const cantidadMostrada = esEdicion 
                          ? (cantidadesEditadas[item.productoId] ?? Math.round(item.cantidad))
                          : Math.round(item.cantidad);
                        const cantidadModificada = esEdicion && cantidadesEditadas[item.productoId] !== undefined && cantidadesEditadas[item.productoId] !== item.cantidad;

                        return (
                          <TableRow key={item.productoId}>
                            <TableCell className="text-center">
                              {producto?.icono ? (
                                <span className="text-2xl">{producto.icono}</span>
                              ) : (
                                <Box className="w-6 h-6 text-gray-400 mx-auto" />
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{obtenerEtiquetaProducto(producto, item.nombreProducto)}</span>
                                {obtenerPoidsUnitaire(producto) && (
                                  <span className="text-xs text-gray-500 mt-0.5">
                                    {obtenerPoidsUnitaire(producto)}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-600">{producto?.codigo || '-'}</TableCell>
                            <TableCell className="text-right">
                              {esEdicion ? (
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-7 w-7 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                                    onClick={() => actualizarCantidad(item.productoId, cantidadMostrada - 1, item.cantidad)}
                                  >
                                    <Minus className="w-3 h-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={formatQuantity(cantidadMostrada)}
                                    onChange={(e) => actualizarCantidad(item.productoId, parseInt(e.target.value, 10) || 0, item.cantidad)}
                                    className={`w-20 h-7 text-center ${cantidadModificada ? 'border-[#4CAF50] border-2 font-bold' : ''}`}
                                    min="0"
                                    max={Math.round(item.cantidad)}
                                    step="1"
                                  />
                                  <span className="text-xs text-gray-500 w-16">(Max : {formatQuantity(item.cantidad)})</span>
                                </div>
                              ) : (
                                <span className="font-bold">{formatQuantity(cantidadMostrada)}</span>
                              )}
                            </TableCell>
                            <TableCell>{producto?.unidad || '-'}</TableCell>
                            {esEdicion && (
                              <TableCell className="text-center">
                                {cantidadModificada && (
                                  <Badge className="bg-[#4CAF50] text-white">
                                    Modifié
                                  </Badge>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {/* Observaciones */}
                  {comanda.observaciones && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-600 flex items-start gap-2">
                        <FileText className="w-4 h-4 mt-0.5" />
                        <span><strong>Observations :</strong> {comanda.observaciones}</span>
                      </p>
                    </div>
                  )}

                  {/* Información de Persona que Recogerá */}
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-[#1E73BE] rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-[#1E73BE] rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <Label className="font-bold text-[#333333] mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Personne qui récupérera <span className="text-[#DC3545]">*</span>
                        </Label>
                        <p className="text-sm text-[#666666] mb-3">
                          {personasResponsables.length > 0 
                            ? 'Sélectionnez une personne autorisée dans votre liste ou saisissez-la manuellement.'
                            : 'Indiquez le nom complet de la personne qui récupérera la commande à la date prévue.'}
                        </p>
                        <div className="space-y-3">
                          {/* Selector de persona si hay personas registradas */}
                          {personasResponsables.length > 0 && (
                            <div>
                              <Label className="text-xs text-[#666666] mb-1 block">
                                Sélectionner une personne autorisée :
                              </Label>
                              <Select onValueChange={(value) => seleccionarPersona(comanda.id, value)}>
                                <SelectTrigger className="border-[#1E73BE]">
                                  <SelectValue placeholder="Sélectionnez une personne ou saisissez-la manuellement" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px] overflow-y-auto">
                                  <SelectItem value="manual">✍️ Saisir manuellement</SelectItem>
                                  {personasResponsables.map(persona => (
                                    <SelectItem key={persona.id} value={persona.id}>
                                      <span>
                                        {persona.esPrincipal && '⭐ '}
                                        {persona.nombreCompleto}
                                        {persona.cargo && ` (${persona.cargo})`}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Input
                              type="text"
                              value={personaRecogida[comanda.id] || ''}
                              onChange={(e) => setPersonaRecogida({ ...personaRecogida, [comanda.id]: e.target.value })}
                              placeholder="Nom complet"
                              className="flex-1 border-[#1E73BE]"
                              required
                            />
                            {organismo && personasResponsables.length === 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setPersonaRecogida({ ...personaRecogida, [comanda.id]: organismo.responsable });
                                }}
                                className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white whitespace-nowrap"
                              >
                                Utiliser la personne responsable
                              </Button>
                            )}
                          </div>
                          <div>
                            <Label className="text-sm text-[#666666] mb-1 block flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              Téléphone de contact (optionnel)
                            </Label>
                            <Input
                              type="tel"
                              value={telefonoRecogida[comanda.id] || ''}
                              onChange={(e) => setTelefonoRecogida({ ...telefonoRecogida, [comanda.id]: e.target.value })}
                              placeholder="Ex. : (514) 555-0100"
                              className="max-w-xs border-[#1E73BE]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    {!esEdicion ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => iniciarEdicion(comanda)}
                          className="border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white"
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Modifier les quantités
                        </Button>
                        <Button
                          onClick={() => aceptarComanda(comanda)}
                          className="bg-[#4CAF50] hover:bg-[#45a049]"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accepter tout
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => anularComanda(comanda)}
                          className="bg-[#DC3545] hover:bg-[#c82333]"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Annuler
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={cancelarEdicion}
                        >
                          Annuler l'édition
                        </Button>
                        <Button
                          onClick={() => aceptarComanda(comanda)}
                          className="bg-[#4CAF50] hover:bg-[#45a049]"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmer les changements et accepter
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}