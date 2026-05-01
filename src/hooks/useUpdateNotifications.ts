import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

interface UpdateNotification {
  type: 'entrada' | 'salida' | 'comanda' | 'organismo' | 'usuario' | 'categoria' | 'producto' | 'benevole';
  action: 'crear' | 'actualizar' | 'eliminar';
  details: string;
  timestamp: number;
}

const STORAGE_KEYS = {
  ENTRADAS: 'banco_alimentos_entradas_inventario',
  PRODUCTOS: 'banco_alimentos_productos',
  COMANDAS: 'banco_alimentos_comandas',
  ORGANISMOS: 'banco_alimentos_organismos',
  USUARIOS: 'banco_alimentos_usuarios',
  CATEGORIAS: 'banco_alimentos_categorias',
  BENEVOLES: 'banco_alimentos_benevoles',
  MOVIMIENTOS: 'banco_alimentos_movimientos'
};

const getNotificationMessage = (notification: UpdateNotification): { title: string; description: string } => {
  const actionText = {
    crear: 'créé',
    actualizar: 'mis à jour',
    eliminar: 'supprimé'
  };

  const typeText = {
    entrada: 'Entrée d\'inventaire',
    salida: 'Sortie d\'inventaire',
    comanda: 'Commande',
    organismo: 'Organisme',
    usuario: 'Utilisateur',
    categoria: 'Catégorie',
    producto: 'Produit',
    benevole: 'Bénévole'
  };

  const title = `${typeText[notification.type]} ${actionText[notification.action]}`;
  const description = notification.details;

  return { title, description };
};

const getNotificationIcon = (type: UpdateNotification['type']): string => {
  const icons = {
    entrada: '📦',
    salida: '📤',
    comanda: '📋',
    organismo: '🏢',
    usuario: '👤',
    categoria: '🏷️',
    producto: '🍎',
    benevole: '🤝'
  };
  return icons[type] || '🔔';
};

export function useUpdateNotifications() {
  const previousDataRef = useRef<{ [key: string]: string }>({});
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Inicializar con los datos actuales (sin notificar)
    if (!isInitializedRef.current) {
      Object.values(STORAGE_KEYS).forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          previousDataRef.current[key] = data;
        }
      });
      isInitializedRef.current = true;
      return;
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;

      // Detectar cambios en las claves que nos interesan
      const keyName = Object.entries(STORAGE_KEYS).find(([_, value]) => value === e.key)?.[0];
      if (!keyName) return;

      try {
        const oldData = previousDataRef.current[e.key] ? JSON.parse(previousDataRef.current[e.key]) : [];
        const newData = JSON.parse(e.newValue);

        // Detectar si es una creación, actualización o eliminación
        let notification: UpdateNotification | null = null;

        if (Array.isArray(newData) && Array.isArray(oldData)) {
          // Detectar nueva entrada
          if (newData.length > oldData.length) {
            const nuevosItems = newData.filter((item: any) => 
              !oldData.some((old: any) => old.id === item.id)
            );
            
            if (nuevosItems.length > 0) {
              const item = nuevosItems[0];
              notification = {
                type: getNotificationType(keyName),
                action: 'crear',
                details: getItemDetails(item, keyName),
                timestamp: Date.now()
              };
            }
          }
          // Detectar eliminación
          else if (newData.length < oldData.length) {
            const itemsEliminados = oldData.filter((item: any) => 
              !newData.some((nuevo: any) => nuevo.id === item.id)
            );
            
            if (itemsEliminados.length > 0) {
              const item = itemsEliminados[0];
              notification = {
                type: getNotificationType(keyName),
                action: 'eliminar',
                details: getItemDetails(item, keyName),
                timestamp: Date.now()
              };
            }
          }
          // Detectar actualización
          else {
            const itemsActualizados = newData.filter((item: any) => {
              const oldItem = oldData.find((old: any) => old.id === item.id);
              return oldItem && JSON.stringify(oldItem) !== JSON.stringify(item);
            });
            
            if (itemsActualizados.length > 0) {
              const item = itemsActualizados[0];
              notification = {
                type: getNotificationType(keyName),
                action: 'actualizar',
                details: getItemDetails(item, keyName),
                timestamp: Date.now()
              };
            }
          }
        }

        // Mostrar notificación
        if (notification) {
          const { title, description } = getNotificationMessage(notification);
          const icon = getNotificationIcon(notification.type);
          
          // Determinar el color según el tipo de acción
          const actionColor = notification.action === 'crear' 
            ? 'success' 
            : notification.action === 'actualizar' 
            ? 'info' 
            : 'warning';
          
          // Notificación con estilo personalizado
          if (notification.action === 'crear') {
            toast.success(title, {
              description: `${icon} ${description}`,
              duration: 6000,
              position: 'top-right',
              style: {
                background: '#E8F5E9',
                border: '1px solid #4CAF50',
                color: '#2E7D32'
              }
            });
          } else if (notification.action === 'actualizar') {
            toast.info(title, {
              description: `${icon} ${description}`,
              duration: 5000,
              position: 'top-right',
              style: {
                background: '#E3F2FD',
                border: '1px solid #2196F3',
                color: '#1565C0'
              }
            });
          } else if (notification.action === 'eliminar') {
            toast.warning(title, {
              description: `${icon} ${description}`,
              duration: 5000,
              position: 'top-right',
              style: {
                background: '#FFF3E0',
                border: '1px solid #FF9800',
                color: '#E65100'
              }
            });
          }
        }

        // Actualizar referencia
        previousDataRef.current[e.key] = e.newValue;
      } catch (error) {
        console.error('Error al procesar cambio de storage:', error);
      }
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);

    // También escuchar cambios locales (misma pestaña)
    const checkForChanges = setInterval(() => {
      Object.values(STORAGE_KEYS).forEach(key => {
        const currentData = localStorage.getItem(key);
        if (currentData && currentData !== previousDataRef.current[key]) {
          handleStorageChange({
            key,
            newValue: currentData,
            oldValue: previousDataRef.current[key],
            storageArea: localStorage,
            url: window.location.href
          } as StorageEvent);
        }
      });
    }, 1000); // Verificar cada segundo

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkForChanges);
    };
  }, []);
}

function getNotificationType(keyName: string): UpdateNotification['type'] {
  const typeMap: { [key: string]: UpdateNotification['type'] } = {
    ENTRADAS: 'entrada',
    PRODUCTOS: 'producto',
    COMANDAS: 'comanda',
    ORGANISMOS: 'organismo',
    USUARIOS: 'usuario',
    CATEGORIAS: 'categoria',
    BENEVOLES: 'benevole',
    MOVIMIENTOS: 'salida'
  };
  return typeMap[keyName] || 'entrada';
}

function getItemDetails(item: any, keyName: string): string {
  // Personalizar el mensaje según el tipo
  switch (keyName) {
    case 'ENTRADAS':
      return `${item.nombreProducto || 'Produit'} - ${item.cantidad || 0} ${item.unidad || 'unités'} - ${item.donadorNombre || 'Donateur inconnu'}`;
    
    case 'PRODUCTOS':
      return `${item.nombre || 'Produit'} - ${item.categoria || 'Catégorie inconnue'}`;
    
    case 'COMANDAS':
      return `Commande #${item.numeroComanda || item.id?.substring(0, 8)} - ${item.organismoNombre || 'Organisme'}`;
    
    case 'ORGANISMOS':
      return `${item.nombre || 'Organisme'} - ${item.direccion?.calle || 'Adresse inconnue'}`;
    
    case 'USUARIOS':
      return `${item.nombre || 'Utilisateur'} - ${item.rol || 'Rôle inconnu'}`;
    
    case 'CATEGORIAS':
      return `${item.nombre || 'Catégorie'} - ${item.valorMonetario ? item.valorMonetario + ' CAD$/kg' : ''}`;
    
    case 'BENEVOLES':
      return `${item.prenom || ''} ${item.nom || 'Bénévole'} - ${item.statut || 'Statut inconnu'}`;
    
    case 'MOVIMIENTOS':
      return `${item.tipo || 'Mouvement'} - ${item.cantidad || 0} unités`;
    
    default:
      return item.nombre || item.id || 'Élément modifié';
  }
}