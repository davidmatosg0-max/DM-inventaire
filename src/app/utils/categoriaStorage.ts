// Utilidades para gestionar categorías en localStorage
import { categoriasIniciales, type Categoria, type Subcategoria } from '../data/configuracionData';

const STORAGE_KEY = 'banco_alimentos_categorias';

/**
 * Obtener categorías del localStorage, o las iniciales si no existen
 */
export function obtenerCategorias(): Categoria[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const categorias: Categoria[] = JSON.parse(stored);
      // Asegurar que valorMonetario y valorPorKg sean números válidos
      return categorias.map(cat => ({
        ...cat,
        valorMonetario: typeof cat.valorMonetario === 'number' ? cat.valorMonetario : parseFloat(cat.valorMonetario as any) || 0,
        valorPorKg: cat.valorMonetario || cat.valorPorKg || 0 // Sincronizar ambos campos
      }));
    } else {
      // Solo inicializar la primera vez
      guardarCategorias(categoriasIniciales);
      return categoriasIniciales;
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    return categoriasIniciales;
  }
}

/**
 * Guardar categorías en localStorage
 */
export function guardarCategorias(categorias: Categoria[]): void {
  try {
    // Sincronizar valorMonetario con valorPorKg antes de guardar
    const categoriasNormalizadas = categorias.map(cat => ({
      ...cat,
      valorPorKg: cat.valorMonetario || cat.valorPorKg || 0,
      valorMonetario: cat.valorMonetario || cat.valorPorKg || 0
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categoriasNormalizadas));
    // ELIMINADO: window.dispatchEvent para evitar actualizaciones de estado durante render
    // Los componentes deben escuchar cambios de storage o usar refreshKey/callbacks
  } catch (error) {
    console.error('Error al guardar categorías:', error);
  }
}

/**
 * Actualizar el peso unitario de una subcategoría específica
 * Si la subcategoría no tiene peso unitario, lo calcula y lo guarda
 */
export function actualizarPesoUnitarioSubcategoria(
  categoriaNombre: string,
  subcategoriaNombre: string,
  cantidad: number,
  pesoTotal: number,
  unidad?: string
): boolean {
  try {
    const categorias = obtenerCategorias();
    let actualizado = false;

    const categoriasActualizadas = categorias.map(cat => {
      // Buscar la categoría por nombre
      if (cat.nombre === categoriaNombre) {
        const subcategoriasActualizadas = cat.subcategorias?.map(sub => {
          // Buscar la subcategoría por nombre
          if (sub.nombre === subcategoriaNombre) {
            // Calcular peso unitario: peso total / cantidad
            const pesoUnitario = cantidad > 0 ? pesoTotal / cantidad : 0;
            
            // ✅ Guardar el peso específico por unidad en pesosUnidad
            // ❌ EXCLUIR PALETA (PLT) de la memorización automática
            if (unidad && pesoUnitario > 0 && unidad !== 'PLT') {
              const pesosUnidadActualizados = {
                ...(sub.pesosUnidad || {}),
                [unidad]: parseFloat(pesoUnitario.toFixed(3))
              };
              
              actualizado = true;
              console.log(`✅ Peso memorizado para \"${subcategoriaNombre}\" [${unidad}]: ${pesoUnitario.toFixed(3)} kg`);
              
              return {
                ...sub,
                pesosUnidad: pesosUnidadActualizados,
                unidad: unidad || sub.unidad, // Actualizar la unidad predeterminada
                pesoUnitario: sub.pesoUnitario || parseFloat(pesoUnitario.toFixed(3)) // Mantener o establecer pesoUnitario general
              };
            }
            
            // Actualizar SIEMPRE la unidad si se proporciona
            if (unidad && unidad !== sub.unidad) {
              actualizado = true;
              console.log(`✅ Unidad memorizada para \"${subcategoriaNombre}\": ${unidad}`);
            }
            
            // Solo actualizar peso unitario si NO tiene o si el nuevo es diferente
            if (!sub.pesoUnitario || sub.pesoUnitario === 0) {
              if (pesoUnitario > 0) {
                actualizado = true;
                console.log(`✅ Peso unitario memorizado para \"${subcategoriaNombre}\": ${pesoUnitario.toFixed(3)} kg`);
                
                return {
                  ...sub,
                  pesoUnitario: parseFloat(pesoUnitario.toFixed(3)), // Redondear a 3 decimales
                  unidad: unidad || sub.unidad // Guardar la unidad si se proporciona
                };
              }
            } else {
              // Ya tiene peso unitario, solo actualizar unidad si cambió
              if (unidad && unidad !== sub.unidad) {
                return {
                  ...sub,
                  unidad: unidad
                };
              }
              console.log(`ℹ️ Subcategoría \"${subcategoriaNombre}\" ya tiene peso unitario: ${sub.pesoUnitario} kg`);
            }
          }
          return sub;
        });

        return {
          ...cat,
          subcategorias: subcategoriasActualizadas
        };
      }
      return cat;
    });

    if (actualizado) {
      guardarCategorias(categoriasActualizadas);
      console.log(`💾 Categorías actualizadas en localStorage`);
    }

    return actualizado;
  } catch (error) {
    console.error('Error al actualizar peso unitario:', error);
    return false;
  }
}

/**
 * Obtener el peso unitario de una subcategoría
 */
export function obtenerPesoUnitario(
  categoriaNombre: string,
  subcategoriaNombre: string
): number | undefined {
  try {
    const categorias = obtenerCategorias();
    const categoria = categorias.find(cat => cat.nombre === categoriaNombre);
    
    if (categoria && categoria.subcategorias) {
      const subcategoria = categoria.subcategorias.find(sub => sub.nombre === subcategoriaNombre);
      return subcategoria?.pesoUnitario;
    }
    
    return undefined;
  } catch (error) {
    console.error('Error al obtener peso unitario:', error);
    return undefined;
  }
}

/**
 * Obtener datos completos de una subcategoría (peso unitario y unidad)
 */
export function obtenerDatosSubcategoria(
  categoriaNombre: string,
  subcategoriaNombre: string
): { pesoUnitario?: number; unidad?: string } | null {
  try {
    const categorias = obtenerCategorias();
    const categoria = categorias.find(cat => cat.nombre === categoriaNombre);
    
    if (categoria && categoria.subcategorias) {
      const subcategoria = categoria.subcategorias.find(sub => sub.nombre === subcategoriaNombre);
      if (subcategoria) {
        return {
          pesoUnitario: subcategoria.pesoUnitario,
          unidad: subcategoria.unidad
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener datos de subcategoría:', error);
    return null;
  }
}

/**
 * Obtener el peso unitario según la unidad especificada
 * Busca primero en pesosUnidad, luego en pesoUnitario como fallback
 */
export function obtenerPesoPorUnidad(
  categoriaNombre: string,
  subcategoriaNombre: string,
  unidad: string
): number | undefined {
  try {
    const categorias = obtenerCategorias();
    const categoria = categorias.find(cat => cat.nombre === categoriaNombre);
    
    if (categoria && categoria.subcategorias) {
      const subcategoria = categoria.subcategorias.find(sub => sub.nombre === subcategoriaNombre);
      if (subcategoria) {
        // Primero buscar en pesosUnidad
        if (subcategoria.pesosUnidad && subcategoria.pesosUnidad[unidad as keyof typeof subcategoria.pesosUnidad]) {
          return subcategoria.pesosUnidad[unidad as keyof typeof subcategoria.pesosUnidad];
        }
        // Si no existe, usar pesoUnitario como fallback
        return subcategoria.pesoUnitario;
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error al obtener peso por unidad:', error);
    return undefined;
  }
}

/**
 * Sincronizar categorías desde Configuración al localStorage
 */
export function sincronizarCategorias(categorias: Categoria[]): void {
  guardarCategorias(categorias);
}

/**
 * Añadir una nueva subcategoría a una categoría existente
 */
export function agregarSubcategoria(
  categoriaId: string,
  nuevaSubcategoria: Omit<Subcategoria, 'id'>
): Subcategoria | null {
  try {
    const categorias = obtenerCategorias();
    let subcategoriaCreada: Subcategoria | null = null;

    console.log('🔧 agregarSubcategoria - Datos recibidos:', JSON.stringify(nuevaSubcategoria, null, 2));

    const categoriasActualizadas = categorias.map(cat => {
      if (cat.id === categoriaId) {
        // ✅ Verificar duplicados: nombre + peso unitario
        const duplicado = cat.subcategorias?.find(sub => 
          sub.nombre.toLowerCase() === nuevaSubcategoria.nombre.toLowerCase() && 
          sub.pesoUnitario === nuevaSubcategoria.pesoUnitario
        );
        
        if (duplicado) {
          console.warn(`⚠️ Subcategoría duplicada detectada: "${nuevaSubcategoria.nombre}" con peso ${nuevaSubcategoria.pesoUnitario} kg`);
          return cat; // No agregar duplicado
        }

        // Generar ID único para la subcategoría
        const nuevoId = `${cat.id}-${Date.now()}`;
        const subcategoria: Subcategoria = {
          id: nuevoId,
          ...nuevaSubcategoria
        };

        console.log('🔧 Subcategoría creada con datos:', JSON.stringify(subcategoria, null, 2));
        subcategoriaCreada = subcategoria;

        return {
          ...cat,
          subcategorias: [...(cat.subcategorias || []), subcategoria]
        };
      }
      return cat;
    });

    if (subcategoriaCreada) {
      guardarCategorias(categoriasActualizadas);
      console.log(`✅ Subcategoría creada: ${subcategoriaCreada.nombre}`);
      console.log(`✅ Con unidad: "${subcategoriaCreada.unidad}"`);
    }

    return subcategoriaCreada;
  } catch (error) {
    console.error('Error al agregar subcategoría:', error);
    return null;
  }
}

/**
 * Agregar una nueva variante a una subcategoría
 */
export function agregarVariante(
  categoriaId: string,
  subcategoriaId: string,
  datosVariante: {
    nombre: string;
    codigo?: string;
    icono?: string;
    unidad?: string;
    valorPorKg?: number;
    pesoUnitario?: number;
    descripcion?: string;
  }
): { id: string; nombre: string } | null {
  try {
    const categorias = obtenerCategorias();
    let varianteCreada: { id: string; nombre: string } | null = null;

    const categoriasActualizadas = categorias.map(cat => {
      if (cat.id === categoriaId) {
        const subcategoriasActualizadas = cat.subcategorias?.map(sub => {
          if (sub.id === subcategoriaId) {
            const nuevaVariante = {
              id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              nombre: datosVariante.nombre.trim(),
              codigo: datosVariante.codigo?.trim() || '',
              icono: datosVariante.icono || '🏷️',
              activa: true,
              unidad: datosVariante.unidad || sub.unidad || '',
              valorPorKg: datosVariante.valorPorKg || undefined,
              pesoUnitario: datosVariante.pesoUnitario || undefined,
              descripcion: datosVariante.descripcion?.trim() || '',
            };

            varianteCreada = { id: nuevaVariante.id, nombre: nuevaVariante.nombre };
            console.log('🔧 Variante creada con datos:', JSON.stringify(nuevaVariante, null, 2));

            return {
              ...sub,
              variantes: [...(sub.variantes || []), nuevaVariante]
            };
          }
          return sub;
        });

        return {
          ...cat,
          subcategorias: subcategoriasActualizadas
        };
      }
      return cat;
    });

    if (varianteCreada) {
      guardarCategorias(categoriasActualizadas);
      console.log(`✅ Variante creada: ${varianteCreada.nombre}`);
      
      // Disparar evento de actualización
      window.dispatchEvent(new Event('categorias-actualizadas'));
    }

    return varianteCreada;
  } catch (error) {
    console.error('Error al agregar variante:', error);
    return null;
  }
}

/**
 * Actualizar el peso unitario de una variante específica
 * ⚠️ EXCEPCIÓN: NO memoriza si la unidad es PLT (paleta)
 */
export function actualizarPesoUnitarioVariante(
  categoriaNombre: string,
  subcategoriaNombre: string,
  varianteId: string,
  cantidad: number,
  pesoTotal: number,
  unidad?: string
): boolean {
  try {
    // ⚠️ EXCEPCIÓN PALETA: NO memorizar peso para PLT
    if (unidad === 'PLT') {
      console.log(`⚠️ Unidad PALETA - NO se memoriza peso para variante`);
      return false;
    }

    const categorias = obtenerCategorias();
    let actualizado = false;

    const categoriasActualizadas = categorias.map(cat => {
      if (cat.nombre === categoriaNombre) {
        const subcategoriasActualizadas = cat.subcategorias?.map(sub => {
          if (sub.nombre === subcategoriaNombre) {
            const variantesActualizadas = sub.variantes?.map(variante => {
              if (variante.id === varianteId) {
                const pesoUnitario = cantidad > 0 ? pesoTotal / cantidad : 0;
                
                if (pesoUnitario > 0) {
                  actualizado = true;
                  console.log(`✅ Peso memorizado para variante "${variante.nombre}": ${pesoUnitario.toFixed(3)} kg`);
                  
                  return {
                    ...variante,
                    pesoUnitario: parseFloat(pesoUnitario.toFixed(3)),
                    unidad: unidad || variante.unidad
                  };
                }
              }
              return variante;
            });

            return {
              ...sub,
              variantes: variantesActualizadas
            };
          }
          return sub;
        });

        return {
          ...cat,
          subcategorias: subcategoriasActualizadas
        };
      }
      return cat;
    });

    if (actualizado) {
      guardarCategorias(categoriasActualizadas);
      console.log(`💾 Peso de variante actualizado en localStorage`);
    }

    return actualizado;
  } catch (error) {
    console.error('Error al actualizar peso de variante:', error);
    return false;
  }
}

/**
 * Obtener el valor por kg de un producto
 * Busca en el siguiente orden: variante > subcategoría > categoría
 */
export function obtenerValorPorKg(
  categoriaNombre: string,
  subcategoriaNombre?: string,
  varianteId?: string
): number | undefined {
  try {
    const categorias = obtenerCategorias();
    const categoria = categorias.find(cat => cat.nombre === categoriaNombre);
    
    if (!categoria) return undefined;

    // Si hay subcategoría, buscar en ella
    if (subcategoriaNombre && categoria.subcategorias) {
      const subcategoria = categoria.subcategorias.find(sub => sub.nombre === subcategoriaNombre);
      
      if (subcategoria) {
        // Si hay variante, buscar en ella primero
        if (varianteId && subcategoria.variantes) {
          const variante = subcategoria.variantes.find(v => v.id === varianteId);
          if (variante?.valorPorKg) {
            return variante.valorPorKg;
          }
        }
        
        // Si la subcategoría tiene valor propio, usarlo
        if (subcategoria.valorPorKg) {
          return subcategoria.valorPorKg;
        }
      }
    }
    
    // Finalmente, usar el valor de la categoría (priorizar valorMonetario sobre valorPorKg)
    return categoria.valorMonetario || categoria.valorPorKg;
  } catch (error) {
    console.error('Error al obtener valor por kg:', error);
    return undefined;
  }
}

/**
 * Calcular el valor monetario total basado en el peso y valor por kg
 * @param peso - Peso total en kg
 * @param categoriaNombre - Nombre de la categoría
 * @param subcategoriaNombre - Nombre de la subcategoría (opcional)
 * @param varianteId - ID de la variante (opcional)
 * @returns Valor monetario calculado o undefined si no hay valorPorKg configurado
 */
export function calcularValorMonetario(
  peso: number,
  categoriaNombre: string,
  subcategoriaNombre?: string,
  varianteId?: string
): number | undefined {
  const valorPorKg = obtenerValorPorKg(categoriaNombre, subcategoriaNombre, varianteId);
  
  if (valorPorKg === undefined || peso <= 0) {
    return undefined;
  }
  
  return parseFloat((peso * valorPorKg).toFixed(2));
}

/**
 * Limpiar todas las categorías del localStorage
 */
export function limpiarCategorias(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Categorías limpiadas del localStorage');
  } catch (error) {
    console.error('Error al limpiar categorías:', error);
  }
}