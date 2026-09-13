/**
 * SCRIPT DE MIGRACIÓN DE DATOS (JSON -> PostgreSQL con Prisma)
 * 
 * Este script procesa exportaciones de datos en formato JSON (procedentes de LocalStorage,
 * IndexedDB o Supabase `app_storage`) y las migra de forma estructurada y validada
 * hacia la base de datos PostgreSQL utilizando Prisma ORM.
 * 
 * Uso:
 *   npx ts-node scripts/migrate-json-to-prisma.ts ./path-to-backup.json
 */

import { PrismaClient, TemperaturaProducto, EstadoComanda, ModalidadDistribucion, TipoMovimiento } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JSONBackup {
  banco_alimentos_productos?: any[];
  organismos_banco_alimentos?: any[];
  banco_alimentos_comandas?: any[];
  banco_alimentos_movimientos?: any[];
  banque_alimentaire_usuarios?: any[];
  banqueAlimentaire_benevoles?: any[];
  registroActividades?: any[];
  [key: string]: any;
}

function mapTemperatura(tempStr?: string): TemperaturaProducto {
  if (!tempStr) return TemperaturaProducto.AMBIENTE;
  const lower = tempStr.toLowerCase();
  if (lower.includes('refriger')) return TemperaturaProducto.REFRIGERADO;
  if (lower.includes('congel')) return TemperaturaProducto.CONGELADO;
  return TemperaturaProducto.AMBIENTE;
}

function mapEstadoComanda(estadoStr?: string): EstadoComanda {
  if (!estadoStr) return EstadoComanda.PENDIENTE;
  const lower = estadoStr.toLowerCase();
  if (lower === 'confirmada') return EstadoComanda.CONFIRMADA;
  if (lower === 'en_preparacion' || lower === 'preparando') return EstadoComanda.EN_PREPARACION;
  if (lower === 'completada' || lower === 'preparada') return EstadoComanda.COMPLETADA;
  if (lower === 'entregada' || lower === 'en_transito') return EstadoComanda.ENTREGADA;
  if (lower === 'anulada' || lower === 'cancelada') return EstadoComanda.ANULADA;
  return EstadoComanda.PENDIENTE;
}

function mapModalidad(modalidadStr?: string): ModalidadDistribucion {
  if (modalidadStr === 'collation') return ModalidadDistribucion.COLLATION;
  if (modalidadStr === 'grupo') return ModalidadDistribucion.GRUPO;
  return ModalidadDistribucion.STANDARD;
}

function mapTipoMovimiento(tipoStr?: string): TipoMovimiento {
  if (!tipoStr) return TipoMovimiento.AJUSTE;
  const lower = tipoStr.toLowerCase();
  if (lower.includes('entrada')) return TipoMovimiento.ENTRADA;
  if (lower.includes('salida')) return TipoMovimiento.SALIDA;
  if (lower.includes('distribucion')) return TipoMovimiento.DISTRIBUCION;
  if (lower.includes('transform')) return TipoMovimiento.TRANSFORMACION;
  return TipoMovimiento.AJUSTE;
}

async function migrateBackupData(backupFilePath: string) {
  console.log(`🚀 Iniciando proceso de migración desde: ${backupFilePath}`);

  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ El archivo de backup no existe en la ruta: ${backupFilePath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(backupFilePath, 'utf-8');
  const backup: JSONBackup = JSON.parse(rawContent);

  // 1. Migrar Usuarios
  if (backup.banque_alimentaire_usuarios && Array.isArray(backup.banque_alimentaire_usuarios)) {
    console.log(`📦 Migrando ${backup.banque_alimentaire_usuarios.length} usuarios...`);
    for (const u of backup.banque_alimentaire_usuarios) {
      if (!u.email) continue;
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          nombre: u.nombre || u.name || 'Usuario',
          activo: u.activo !== false,
          departamento: u.departamento,
          telefono: u.telefono,
        },
        create: {
          id: u.id,
          nombre: u.nombre || u.name || 'Usuario',
          email: u.email,
          passwordHash: u.passwordHash || null,
          activo: u.activo !== false,
          departamento: u.departamento,
          telefono: u.telefono,
        },
      });
    }
    console.log('✅ Usuarios migrados');
  }

  // 2. Migrar Productos
  if (backup.banco_alimentos_productos && Array.isArray(backup.banco_alimentos_productos)) {
    console.log(`📦 Migrando ${backup.banco_alimentos_productos.length} productos...`);
    for (const p of backup.banco_alimentos_productos) {
      if (!p.id || !p.codigo) continue;
      
      // Asegurar categoría
      let categoriaId: string | undefined = undefined;
      if (p.categoria) {
        const cat = await prisma.category.upsert({
          where: { nombre: p.categoria },
          update: {},
          create: { nombre: p.categoria },
        });
        categoriaId = cat.id;
      }

      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          codigo: p.codigo,
          nombre: p.nombre,
          categoriaId,
          categoriaNombre: p.categoria || 'Sin categoría',
          subcategoria: p.subcategoria,
          unidad: p.unidad || 'kg',
          stockActual: Number(p.stockActual || p.stock || 0),
          stockMinimo: Number(p.stockMinimo || 0),
          ubicacion: p.ubicacion || p.localizacion,
          temperatura: mapTemperatura(p.temperatura),
          esPRS: Boolean(p.esPRS),
          activo: p.activo !== false,
        },
        create: {
          id: p.id,
          codigo: p.codigo,
          nombre: p.nombre,
          categoriaId,
          categoriaNombre: p.categoria || 'Sin categoría',
          subcategoria: p.subcategoria,
          unidad: p.unidad || 'kg',
          stockActual: Number(p.stockActual || p.stock || 0),
          stockMinimo: Number(p.stockMinimo || 0),
          ubicacion: p.ubicacion || p.localizacion,
          temperatura: mapTemperatura(p.temperatura),
          esPRS: Boolean(p.esPRS),
          activo: p.activo !== false,
        },
      });
    }
    console.log('✅ Productos migrados');
  }

  // 3. Migrar Organismos
  if (backup.organismos_banco_alimentos && Array.isArray(backup.organismos_banco_alimentos)) {
    console.log(`📦 Migrando ${backup.organismos_banco_alimentos.length} organismos...`);
    for (const org of backup.organismos_banco_alimentos) {
      if (!org.id || !org.nombre) continue;
      await prisma.organisme.upsert({
        where: { id: org.id },
        update: {
          nombre: org.nombre,
          tipo: org.tipo,
          responsable: org.responsable,
          email: org.email || null,
          telefono: org.telefono,
          direccion: org.direccion,
          ciudad: org.ciudad,
          codigoPostal: org.codigoPostal,
          beneficiarios: Number(org.beneficiarios || 0),
          activo: org.activo !== false,
        },
        create: {
          id: org.id,
          nombre: org.nombre,
          tipo: org.tipo,
          responsable: org.responsable,
          email: org.email || null,
          telefono: org.telefono,
          direccion: org.direccion,
          ciudad: org.ciudad,
          codigoPostal: org.codigoPostal,
          beneficiarios: Number(org.beneficiarios || 0),
          activo: org.activo !== false,
        },
      });
    }
    console.log('✅ Organismos migrados');
  }

  // 4. Migrar Comandas
  if (backup.banco_alimentos_comandas && Array.isArray(backup.banco_alimentos_comandas)) {
    console.log(`📦 Migrando ${backup.banco_alimentos_comandas.length} comandas...`);
    for (const cmd of backup.banco_alimentos_comandas) {
      if (!cmd.id || !cmd.organismoId) continue;
      
      const numero = cmd.numero || cmd.numeroComanda || `CMD-${cmd.id.slice(0, 8)}`;
      
      const order = await prisma.order.upsert({
        where: { id: cmd.id },
        update: {
          numero,
          modalidadDistribucion: mapModalidad(cmd.modalidadDistribucion),
          organismoId: cmd.organismoId,
          nombreOrganismo: cmd.nombreOrganismo || 'Organismo',
          estado: mapEstadoComanda(cmd.estado),
          observaciones: cmd.observaciones,
        },
        create: {
          id: cmd.id,
          numero,
          modalidadDistribucion: mapModalidad(cmd.modalidadDistribucion),
          organismoId: cmd.organismoId,
          nombreOrganismo: cmd.nombreOrganismo || 'Organismo',
          estado: mapEstadoComanda(cmd.estado),
          observaciones: cmd.observaciones,
        },
      });

      // Migrar items de comanda
      if (cmd.items && Array.isArray(cmd.items)) {
        await prisma.orderItem.deleteMany({ where: { comandaId: order.id } });
        for (const item of cmd.items) {
          if (!item.productoId) continue;
          await prisma.orderItem.create({
            data: {
              comandaId: order.id,
              productoId: item.productoId,
              nombreProducto: item.nombreProducto || item.productoNombre || 'Producto',
              cantidad: Number(item.cantidad || 0),
              cantidadPreparada: item.cantidadPreparada ? Number(item.cantidadPreparada) : null,
              unidad: item.unidad || 'kg',
              temperatura: mapTemperatura(item.temperatura),
            },
          });
        }
      }
    }
    console.log('✅ Comandas e items migrados');
  }

  // Registrar estado de la migración
  await prisma.appStorageMigration.create({
    data: {
      storageKey: path.basename(backupFilePath),
      registros: Object.keys(backup).length,
      estado: 'completado',
    },
  });

  console.log('🎉 ¡Migración de datos JSON a PostgreSQL completada con éxito!');
}

const inputPath = process.argv[2] || './backup.json';
migrateBackupData(inputPath)
  .catch((e) => {
    console.error('❌ Error en la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
