# 📋 Datos de Ejemplo - Sistema Banque Alimentaire

Este documento describe todos los datos de ejemplo disponibles en el sistema para pruebas.

## 📍 Ubicación de los Datos
Archivo principal: `/src/app/data/mockData.ts`

---

## 👥 1. USUARIOS DEL SISTEMA (mockUsuarios)
**Total: 3 usuarios**

| ID | Nombre | Email | Rol | Estado |
|----|--------|-------|-----|--------|
| 1 | Marie Dubois | marie.dubois@banquealimentaire.org | Administrador | ✅ Activo |
| 2 | Jean Tremblay | jean.tremblay@banquealimentaire.org | Almacenista | ✅ Activo |
| 3 | Pierre Gagnon | pierre.gagnon@banquealimentaire.org | Transportista | ✅ Activo |

**Usuario Especial:**
- **David / Lettycia26** - Usuario desarrollador con acceso total (definido en `/src/hooks/useBranding.ts`)

---

## 📦 2. INVENTARIO

### Productos (mockProductos)
**Estado:** Base de datos VACÍA - Los productos se configuran desde el módulo "Configuración"

**Cómo agregar productos:**
1. Ir al módulo **Configuración**
2. Pestaña **Catálogo de Productos**
3. Crear categorías, subcategorías y productos

### Movimientos de Inventario (mockMovimientos)
**Total: 3 movimientos de ejemplo**

| ID | Tipo | Producto ID | Cantidad | Motivo | Fecha |
|----|------|-------------|----------|--------|-------|
| 1 | Entrada | 1 | 500 | Don de Metro Plus | 2025-01-02 |
| 2 | Salida | 2 | 150 | Commande #CMD-001 | 2025-01-02 |
| 3 | Entrada | 4 | 100 | Sauvetage PRS | 2025-01-03 |

---

## 📋 3. COMANDAS (mockComandas)
**Total: 5 comandas de ejemplo**

| Nº | Organismo | Estado | Fecha Entrega | Items | Observaciones |
|----|-----------|--------|---------------|-------|---------------|
| CMD-001 | Salle Communautaire Saint-Joseph | ✅ Entregada | 2025-01-01 | 5 | Entregada, todo OK |
| CMD-002 | Fondation Espoir | 🔄 En Preparación | 2025-01-10 | 12 | Grande commande |
| CMD-003 | Foyer pour Enfants La Paix | ⏳ Pendiente | 2025-01-08 | 7 | Foyer para niños |
| CMD-004 | Centre Communautaire Le Chêne | ✅ Completada | 2025-01-02 | 12 | Lista para entrega |
| CMD-005 | Salle Communautaire Saint-Joseph | 🔄 En Preparación | 2025-01-11 | 8 | Commande semanal |

---

## 🏢 4. ORGANISMOS (mockOrganismos)
**Total: 4 organismos de ejemplo**

| ID | Nombre | Tipo | Responsable | Beneficiarios | Estado | Participa PRS | Clave Acceso |
|----|--------|------|-------------|---------------|--------|---------------|--------------|
| 1 | Salle Communautaire Saint-Joseph | Salle à Manger | Anne Tremblay | 150 | ✅ Activo | ✅ Sí | CSJ-8K9M2P |
| 2 | Fondation Espoir | Fondation | Robert Bélanger | 200 | ❌ Inactivo | ✅ Sí | FES-3X7N5Q |
| 3 | Foyer pour Enfants La Paix | Foyer | Laura Gagnon | 80 | ✅ Activo | ❌ No | HLP-6T4R8W |
| 4 | Centre Communautaire Le Chêne | Centre Communautaire | Michel Dubois | 120 | ✅ Activo | ✅ Sí | CER-9Y2L5D |

**Portal de Organismos:**
- Clave de ejemplo: **CAC-456ABC** (Centre d'Aide Communautaire Exemple)

---

## 🚚 5. TRANSPORTE

### Vehículos (mockVehiculos)
**Total: 5 vehículos**

| ID | Tipo | Marca | Modelo | Placa | Capacidad | Estado | Conductor |
|----|------|-------|--------|-------|-----------|--------|-----------|
| 1 | Camion | Mercedes-Benz | Actros 2546 | ABC-123 | 10,000 kg | ✅ Disponible | Pierre Gagnon |
| 2 | Camioneta | Ford | Transit Custom | XYZ-456 | 1,500 kg | 🔄 En Uso | Pierre Gagnon |
| 3 | Refrigerado | Isuzu | NQR 75L | DEF-789 | 4,500 kg | ✅ Disponible | - |
| 4 | Furgoneta | Renault | Master L3H2 | GHI-321 | 2,000 kg | 🔧 Mantenimiento | - |
| 5 | Camion | Volvo | FH16 | JKL-654 | 12,000 kg | ❌ Fuera Servicio | - |

### Rutas (mockRutas)
**Total: 4 rutas de ejemplo**

| ID | Nombre | Fecha | Vehículo | Estado | Paradas |
|----|--------|-------|----------|--------|---------|
| 1 | Ruta Centro - Zona Norte | 2025-01-06 | ABC-123 | 📅 Planificada | 2 |
| 2 | Ruta Express - Zona Este | 2025-01-04 | XYZ-456 | 🚚 En Curso | 1 |
| 3 | Ruta Completa - Semana 1 | 2025-01-02 | ABC-123 | ✅ Completada | 2 |
| 4 | Ruta PRS - Productos Perecederos | 2025-01-07 | DEF-789 | 📅 Planificada | 3 |

### Transportes (mockTransportes)
**Total: 3 registros de transporte**

| ID | Comanda | Vehículo | Conductor | Estado | Destino |
|----|---------|----------|-----------|--------|---------|
| 1 | CMD-001 | ABC-123 | Pierre Gagnon | ✅ Entregado | Salle Saint-Joseph |
| 2 | CMD-002 | XYZ-456 | Luc Morin | 🚚 En Ruta | Fondation Espoir |
| 3 | CMD-003 | DEF-789 | Pierre Gagnon | ⏳ Pendiente | Foyer La Paix |

---

## 👨‍💼 6. USUARIOS INTERNOS / CONTACTOS (mockUsuariosInternos)
**Total: 12 usuarios internos**

### 🙋 Bénévoles (4)
| ID | Nombre | Departamento | Horas/Semana | Fecha Ingreso |
|----|--------|--------------|--------------|---------------|
| BDV-2024-001 | Sophie Martin | Cocina | 8 | 2024-01-10 |
| BDV-2024-002 | Luc Morin | Transporte | 12 | 2024-04-20 |
| BDV-2024-003 | Isabelle Côté | Almacén | 10 | 2024-05-10 |
| PTC-2024-001 | Pierre Gagnon | Oficina | 20 | 2024-03-15 |

### 👔 Empleados (2)
| ID | Nombre | Puesto | Departamento | Fecha Ingreso |
|----|--------|--------|--------------|---------------|
| EMP-2024-001 | Jean Tremblay | Coordinador de Almacén | Almacén | 2023-06-15 |
| EMP-2024-002 | Claire Lefebvre | Directora Administrativa | Administración | 2023-09-01 |

### 📚 Programa (1)
| ID | Nombre | Departamento | Programa | Fecha Ingreso |
|----|--------|--------------|----------|---------------|
| PRG-2024-001 | Marie Dubois | Ayuda Alimentaria | Formación Profesional | 2024-02-01 |

### 🎁 Donadores (3)
| ID | Nombre | Empresa | Tipo | Fecha Ingreso |
|----|--------|---------|------|---------------|
| DON-2024-001 | Supermarchés Metro | Metro Plus Laval | Supermarché | 2023-03-10 |
| DON-2024-002 | IGA Laval | IGA Extra | Supermarché | 2023-05-20 |
| DON-2024-003 | Boulangerie Le Fournil | Le Fournil Artisan | Boulangerie | 2024-01-15 |

### 🛒 Vendedores (2)
| ID | Nombre | Empresa | Tipo | Fecha Ingreso |
|----|--------|---------|------|---------------|
| VND-2024-001 | Distribution Alimentaire QC | Dist-Alim QC Inc. | Distributeur en gros | 2023-08-10 |
| VND-2024-002 | Aliments Secs Laval | Aliments Secs Laval | Fournisseur alimentaire | 2024-02-05 |

---

## 🎴 7. ID DIGITALES (mockIDsDigitales)
**Total: 3 IDs digitales de beneficiarios**

| ID | Beneficiario | Nº ID | Organismo | Estado | Vigencia |
|----|--------------|-------|-----------|--------|----------|
| 1 | Pedro López | BA-2024-001 | Salle Saint-Joseph | ✅ Activo | Hasta 2025-06-01 |
| 2 | María Fernández | BA-2024-002 | Salle Saint-Joseph | ✅ Activo | Hasta 2025-06-15 |
| 3 | José Ramírez | BA-2024-003 | Fondation Espoir | ✅ Activo | Hasta 2025-07-01 |

---

## 🚨 8. PROGRAMA PRS (mockRegistrosPRS)
**Total: 5 registros de rescate**

| ID | Fecha | Supermercado | Responsable | Total (kg) | Productos | Valor Estimado |
|----|-------|--------------|-------------|------------|-----------|----------------|
| 1 | 2025-01-02 | Metro Plus | Carlos Rodríguez | 125.5 | 45 | CAD$ 450.75 |
| 2 | 2025-01-03 | IGA Extra Laval | Marie Lafontaine | 98.3 | 38 | CAD$ 380.20 |
| 3 | 2025-01-04 | Walmart Supercentre | Sophie Bergeron | 156.8 | 52 | CAD$ 520.15 |
| 4 | 2025-01-05 | Costco Wholesale | Linda Gagnon | 210.2 | 68 | CAD$ 680.50 |
| 5 | 2025-01-06 | Provigo Le Marché | Alain Côté | 87.5 | 32 | CAD$ 320.80 |

---

## 📊 9. REPORTES
Los reportes se generan dinámicamente basándose en los datos anteriores.

**Tipos de reportes disponibles:**
- 📈 Resumen de Inventario
- 📋 Estado de Comandas
- 🚚 Eficiencia de Transporte
- 👥 Actividad de Usuarios
- 🏢 Servicios a Organismos
- 🎁 Donaciones Recibidas
- 🚨 Impacto PRS

---

## 🎨 10. ESTILO Y BRANDING

### Colores del Sistema
- **Primario (Azul marino):** `#1a4d7a`
- **Secundario (Verde elegante):** `#2d9561`
- **Peligro:** `#c23934`
- **Advertencia:** `#FFC107`

### Tipografías
- **Títulos:** Montserrat Bold/Medium
- **Texto:** Roboto Regular

### Idiomas Soportados
- 🇪🇸 Español
- 🇫🇷 Francés (por defecto)
- 🇬🇧 Inglés
- 🇸🇦 Árabe (con RTL)

### Moneda
- **CAD$** (Dólar Canadiense)

---

## 🔐 11. ACCESOS Y CREDENCIALES DE PRUEBA

### Usuario Desarrollador
- **Usuario:** David
- **Contraseña:** Lettycia26
- **Rol:** Acceso Total

### Portal de Organismos
- **Clave de ejemplo:** CAC-456ABC
- **Organismo:** Centre d'Aide Communautaire Exemple

---

## 🛠️ 12. CÓMO USAR LOS DATOS

### Para agregar más datos de ejemplo:
1. Editar `/src/app/data/mockData.ts`
2. Agregar nuevos objetos a los arrays correspondientes
3. Guardar y recargar la aplicación

### Para limpiar datos:
1. Abrir `/src/app/data/mockData.ts`
2. Vaciar el array correspondiente: `export const mockXXX = [];`
3. Guardar

### Para resetear el sistema:
1. Ir a **Configuración** → **Datos del Sistema**
2. Usar la opción "Resetear Base de Datos"
3. Confirmar la acción

---

## 📝 NOTAS IMPORTANTES

1. **Productos Vacíos:** La base de productos está intencionalmente vacía para que puedas configurarlos desde el módulo Configuración.

2. **Datos Persistentes:** Los datos de ejemplo se cargan al iniciar la aplicación pero se almacenan en localStorage, por lo que las modificaciones persisten entre sesiones.

3. **Módulo Comptoir:** Tiene su propia configuración de datos de ejemplo específica para beneficiarios y demandes d'aide.

4. **IDs Consecutivos:** Los IDs están diseñados para ser únicos y secuenciales para facilitar las pruebas.

5. **Fechas Realistas:** Todas las fechas están configuradas para enero de 2025 para simular un entorno actual.

---

## 📞 SOPORTE

Si necesitas agregar más datos de ejemplo o modificar los existentes, edita el archivo:
**`/src/app/data/mockData.ts`**

¡Todos los módulos del sistema tienen datos de ejemplo listos para pruebas! 🎉
