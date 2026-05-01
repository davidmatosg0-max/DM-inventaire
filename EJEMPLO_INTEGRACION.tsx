/**
 * 📝 EJEMPLO DE INTEGRACIÓN - Sistema de Registro de Actividades
 * 
 * Este archivo muestra cómo integrar el sistema de registro de actividades
 * en diferentes módulos de la aplicación.
 * 
 * IMPORTANTE: Este es un archivo de ejemplo. No debe ser usado directamente.
 * Copia los ejemplos a tus módulos según necesites.
 */

import { registrarActividad } from './src/app/utils/actividadLogger';
import { toast } from 'sonner';

// ============================================================================
// EJEMPLO 1: MÓDULO DE INVENTARIO
// ============================================================================

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  unidad: string;
}

// Crear un nuevo producto
const crearProducto = async (producto: Producto) => {
  try {
    // 1. Realizar la operación principal
    const nuevoProducto = {
      ...producto,
      id: `prod-${Date.now()}`
    };
    
    // Guardar en localStorage o base de datos
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    productos.push(nuevoProducto);
    localStorage.setItem('productos', JSON.stringify(productos));
    
    // 2. ✅ REGISTRAR LA ACTIVIDAD
    registrarActividad(
      'Inventaire',
      'crear',
      `Produit "${producto.nombre}" créé avec code ${producto.codigo}`,
      {
        productoId: nuevoProducto.id,
        categoria: producto.categoria,
        stockInicial: producto.stock
      }
    );
    
    // 3. Notificar al usuario
    toast.success('Produit créé avec succès');
    
    return nuevoProducto;
  } catch (error) {
    console.error('Error al crear producto:', error);
    toast.error('Erreur lors de la création');
    throw error;
  }
};

// Modificar un producto existente
const modificarProducto = async (productoId: string, cambios: Partial<Producto>) => {
  try {
    // 1. Obtener producto actual
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const index = productos.findIndex((p: Producto) => p.id === productoId);
    
    if (index === -1) {
      throw new Error('Producto no encontrado');
    }
    
    const productoAnterior = productos[index];
    
    // 2. Aplicar cambios
    const productoActualizado = { ...productoAnterior, ...cambios };
    productos[index] = productoActualizado;
    localStorage.setItem('productos', JSON.stringify(productos));
    
    // 3. ✅ REGISTRAR LA ACTIVIDAD con detalles de los cambios
    let descripcionCambios = `Produit "${productoActualizado.nombre}" modifié - `;
    const detallesCambios: string[] = [];
    
    if (cambios.stock !== undefined) {
      detallesCambios.push(`Stock: ${productoAnterior.stock} → ${cambios.stock}`);
    }
    if (cambios.nombre) {
      detallesCambios.push(`Nom: "${productoAnterior.nombre}" → "${cambios.nombre}"`);
    }
    if (cambios.categoria) {
      detallesCambios.push(`Catégorie: "${productoAnterior.categoria}" → "${cambios.categoria}"`);
    }
    
    descripcionCambios += detallesCambios.join(', ');
    
    registrarActividad(
      'Inventaire',
      'modificar',
      descripcionCambios,
      {
        productoId,
        cambiosAplicados: cambios,
        valoresAnteriores: {
          stock: productoAnterior.stock,
          nombre: productoAnterior.nombre,
          categoria: productoAnterior.categoria
        }
      }
    );
    
    toast.success('Produit mis à jour');
    return productoActualizado;
  } catch (error) {
    console.error('Error al modificar producto:', error);
    toast.error('Erreur lors de la modification');
    throw error;
  }
};

// Eliminar un producto
const eliminarProducto = async (productoId: string) => {
  try {
    // 1. Obtener producto a eliminar
    const productos = JSON.parse(localStorage.getItem('productos') || '[]');
    const producto = productos.find((p: Producto) => p.id === productoId);
    
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    
    // 2. Eliminar del almacenamiento
    const productosFiltrados = productos.filter((p: Producto) => p.id !== productoId);
    localStorage.setItem('productos', JSON.stringify(productosFiltrados));
    
    // 3. ✅ REGISTRAR LA ACTIVIDAD
    registrarActividad(
      'Inventaire',
      'eliminar',
      `Produit "${producto.nombre}" (code: ${producto.codigo}) supprimé du système`,
      {
        productoId,
        productoEliminado: {
          nombre: producto.nombre,
          codigo: producto.codigo,
          categoria: producto.categoria,
          stockRestante: producto.stock
        }
      }
    );
    
    toast.success('Produit supprimé');
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    toast.error('Erreur lors de la suppression');
    throw error;
  }
};

// ============================================================================
// EJEMPLO 2: MÓDULO DE ORGANISMOS
// ============================================================================

interface Organismo {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
}

const crearOrganismo = async (organismo: Organismo) => {
  try {
    const nuevoOrganismo = {
      ...organismo,
      id: `org-${Date.now()}`
    };
    
    // Guardar...
    const organismos = JSON.parse(localStorage.getItem('organismos') || '[]');
    organismos.push(nuevoOrganismo);
    localStorage.setItem('organismos', JSON.stringify(organismos));
    
    // ✅ REGISTRAR ACTIVIDAD
    registrarActividad(
      'Organismes',
      'crear',
      `Nouvel organisme "${organismo.nombre}" enregistré - Contact: ${organismo.email}`,
      {
        organismoId: nuevoOrganismo.id,
        contacto: {
          email: organismo.email,
          telefono: organismo.telefono
        }
      }
    );
    
    toast.success('Organisme créé');
    return nuevoOrganismo;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ============================================================================
// EJEMPLO 3: MÓDULO DE COMANDAS
// ============================================================================

interface Comanda {
  id: string;
  numero: string;
  organismoId: string;
  organismoNombre: string;
  productos: any[];
  estado: 'pendiente' | 'preparada' | 'entregada';
  fecha: string;
}

const crearComanda = async (comanda: Omit<Comanda, 'id'>) => {
  try {
    const nuevaComanda: Comanda = {
      ...comanda,
      id: `cmd-${Date.now()}`
    };
    
    // Guardar...
    const comandas = JSON.parse(localStorage.getItem('comandas') || '[]');
    comandas.push(nuevaComanda);
    localStorage.setItem('comandas', JSON.stringify(comandas));
    
    // ✅ REGISTRAR ACTIVIDAD
    registrarActividad(
      'Commandes',
      'crear',
      `Commande #${comanda.numero} créée pour "${comanda.organismoNombre}" - ${comanda.productos.length} produits`,
      {
        comandaId: nuevaComanda.id,
        organismo: {
          id: comanda.organismoId,
          nombre: comanda.organismoNombre
        },
        cantidadProductos: comanda.productos.length
      }
    );
    
    toast.success('Commande créée');
    return nuevaComanda;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const cambiarEstadoComanda = async (comandaId: string, nuevoEstado: Comanda['estado']) => {
  try {
    const comandas = JSON.parse(localStorage.getItem('comandas') || '[]');
    const index = comandas.findIndex((c: Comanda) => c.id === comandaId);
    
    if (index === -1) throw new Error('Comanda no encontrada');
    
    const estadoAnterior = comandas[index].estado;
    comandas[index].estado = nuevoEstado;
    localStorage.setItem('comandas', JSON.stringify(comandas));
    
    // ✅ REGISTRAR ACTIVIDAD
    const estadosTraducidos: Record<string, string> = {
      'pendiente': 'En attente',
      'preparada': 'Préparée',
      'entregada': 'Livrée'
    };
    
    registrarActividad(
      'Commandes',
      'modificar',
      `Commande #${comandas[index].numero} - Statut changé: ${estadosTraducidos[estadoAnterior]} → ${estadosTraducidos[nuevoEstado]}`,
      {
        comandaId,
        estadoAnterior,
        estadoNuevo: nuevoEstado
      }
    );
    
    toast.success('Statut mis à jour');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ============================================================================
// EJEMPLO 4: MÓDULO DE USUARIOS
// ============================================================================

interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'administrador' | 'coordinador' | 'usuario';
  permisos: string[];
}

const crearUsuario = async (usuario: Omit<Usuario, 'id'>) => {
  try {
    const nuevoUsuario: Usuario = {
      ...usuario,
      id: `user-${Date.now()}`
    };
    
    // Guardar...
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // ✅ REGISTRAR ACTIVIDAD
    const rolesTraducidos: Record<string, string> = {
      'administrador': 'Administrateur',
      'coordinador': 'Coordinateur',
      'usuario': 'Utilisateur'
    };
    
    registrarActividad(
      'Utilisateurs',
      'crear',
      `Nouvel utilisateur "${usuario.nombre} ${usuario.apellido}" créé - Rôle: ${rolesTraducidos[usuario.rol]}`,
      {
        usuarioId: nuevoUsuario.id,
        email: usuario.email,
        rol: usuario.rol,
        permisos: usuario.permisos
      }
    );
    
    toast.success('Utilisateur créé');
    return nuevoUsuario;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const modificarPermisosUsuario = async (usuarioId: string, nuevosPermisos: string[]) => {
  try {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const index = usuarios.findIndex((u: Usuario) => u.id === usuarioId);
    
    if (index === -1) throw new Error('Usuario no encontrado');
    
    const permisosAnteriores = [...usuarios[index].permisos];
    usuarios[index].permisos = nuevosPermisos;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    // ✅ REGISTRAR ACTIVIDAD
    const permisosAgregados = nuevosPermisos.filter(p => !permisosAnteriores.includes(p));
    const permisosEliminados = permisosAnteriores.filter(p => !nuevosPermisos.includes(p));
    
    let descripcion = `Utilisateur "${usuarios[index].nombre} ${usuarios[index].apellido}" - Permissions modifiées`;
    
    if (permisosAgregados.length > 0) {
      descripcion += ` | Ajoutés: ${permisosAgregados.join(', ')}`;
    }
    if (permisosEliminados.length > 0) {
      descripcion += ` | Supprimés: ${permisosEliminados.join(', ')}`;
    }
    
    registrarActividad(
      'Utilisateurs',
      'modificar',
      descripcion,
      {
        usuarioId,
        permisosAnteriores,
        permisosNuevos: nuevosPermisos,
        permisosAgregados,
        permisosEliminados
      }
    );
    
    toast.success('Permissions mises à jour');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ============================================================================
// EJEMPLO 5: MÓDULO DE CATEGORÍAS (en Configuración)
// ============================================================================

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  valorMonetario: number;
  color: string;
  icono: string;
}

const crearCategoria = async (categoria: Omit<Categoria, 'id'>) => {
  try {
    const nuevaCategoria: Categoria = {
      ...categoria,
      id: `cat-${Date.now()}`
    };
    
    // Guardar...
    const categorias = JSON.parse(localStorage.getItem('categorias') || '[]');
    categorias.push(nuevaCategoria);
    localStorage.setItem('categorias', JSON.stringify(categorias));
    
    // ✅ REGISTRAR ACTIVIDAD
    registrarActividad(
      'Configuration - Catégories',
      'crear',
      `Nouvelle catégorie "${categoria.nombre}" créée - Valeur: ${categoria.valorMonetario} CAD$/kg`,
      {
        categoriaId: nuevaCategoria.id,
        valorMonetario: categoria.valorMonetario,
        icono: categoria.icono
      }
    );
    
    toast.success('Catégorie créée');
    return nuevaCategoria;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

// ============================================================================
// RESUMEN DE BUENAS PRÁCTICAS
// ============================================================================

/**
 * ✅ DO (Hacer):
 * 
 * 1. Registrar DESPUÉS del éxito de la operación
 * 2. Usar descripciones claras y específicas en francés
 * 3. Incluir información relevante (nombres, códigos, cantidades)
 * 4. Agregar detalles útiles en el parámetro 'detalles'
 * 5. Usar los módulos consistentemente ("Inventaire", "Organismes", etc.)
 * 
 * ❌ DON'T (No hacer):
 * 
 * 1. No registrar antes de que la operación sea exitosa
 * 2. No usar descripciones genéricas ("Producto modificado")
 * 3. No incluir datos sensibles (passwords, tokens)
 * 4. No olvidar registrar acciones importantes
 * 5. No usar módulos inconsistentes
 */

export {
  crearProducto,
  modificarProducto,
  eliminarProducto,
  crearOrganismo,
  crearComanda,
  cambiarEstadoComanda,
  crearUsuario,
  modificarPermisosUsuario,
  crearCategoria
};
