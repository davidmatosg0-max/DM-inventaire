# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión de Banque Alimentaire!

---

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [Cómo Contribuir](#cómo-contribuir)
3. [Reportar Bugs](#reportar-bugs)
4. [Sugerir Mejoras](#sugerir-mejoras)
5. [Pull Requests](#pull-requests)
6. [Estándares de Código](#estándares-de-código)
7. [Estructura del Proyecto](#estructura-del-proyecto)
8. [Configuración del Entorno](#configuración-del-entorno)

---

## 📜 Código de Conducta

Este proyecto se adhiere a un código de conducta. Al participar, se espera que mantengas este código.

### Nuestros Valores
- **Respeto**: Trata a todos con respeto
- **Colaboración**: Trabaja en conjunto de manera constructiva
- **Inclusión**: Da la bienvenida a todas las perspectivas
- **Profesionalismo**: Mantén un ambiente profesional

---

## 🤔 Cómo Contribuir

### Formas de Contribuir

- 🐛 **Reportar bugs**
- 💡 **Sugerir nuevas features**
- 📝 **Mejorar documentación**
- 🔧 **Arreglar bugs**
- ✨ **Implementar features**
- 🌍 **Agregar traducciones**
- 🎨 **Mejorar diseño/UX**
- 🧪 **Escribir tests**

---

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca** en issues existentes
2. **Verifica** en última versión
3. **Prueba** en modo incógnito (sin extensiones)

### Template de Bug Report

```markdown
## Descripción del Bug
[Descripción clara y concisa]

## Pasos para Reproducir
1. Ir a '...'
2. Click en '...'
3. Ver error

## Comportamiento Esperado
[Qué debería pasar]

## Comportamiento Actual
[Qué está pasando]

## Screenshots
[Si aplica]

## Entorno
- OS: [e.g. Windows 10, macOS 12]
- Navegador: [e.g. Chrome 120, Firefox 115]
- Versión: [e.g. 2.1.0]

## Información Adicional
[Cualquier contexto adicional]
```

---

## 💡 Sugerir Mejoras

### Template de Feature Request

```markdown
## Problema a Resolver
[Qué problema resuelve esta feature]

## Solución Propuesta
[Cómo debería funcionar]

## Alternativas Consideradas
[Otras soluciones que consideraste]

## Información Adicional
[Mockups, ejemplos, etc.]
```

---

## 🔀 Pull Requests

### Proceso

1. **Fork** el repositorio
2. **Crea** una rama desde `main`:
   ```bash
   git checkout -b feature/nueva-feature
   # o
   git checkout -b fix/correccion-bug
   ```
3. **Desarrolla** tu cambio
4. **Commitea** siguiendo [Conventional Commits](#conventional-commits)
5. **Push** a tu fork
6. **Abre** un Pull Request

### Template de Pull Request

```markdown
## Descripción
[Descripción de los cambios]

## Tipo de Cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva feature (cambio que agrega funcionalidad)
- [ ] Breaking change (fix o feature que rompe funcionalidad existente)
- [ ] Documentación
- [ ] Refactor
- [ ] Performance
- [ ] Tests

## ¿Cómo se ha Probado?
[Describe las pruebas realizadas]

## Checklist
- [ ] Mi código sigue los estándares del proyecto
- [ ] He realizado self-review de mi código
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests (si aplica)
- [ ] Todos los tests pasan
- [ ] He actualizado CHANGELOG.md

## Screenshots (si aplica)
[Screenshots de cambios UI]
```

---

## 📝 Estándares de Código

### TypeScript

```typescript
// ✅ Bueno
interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

function obtenerUsuario(id: string): Usuario | null {
  // Implementación
}

// ❌ Malo
function obtenerUsuario(id: any): any {
  // Implementación
}
```

### React Components

```typescript
// ✅ Bueno - Componente funcional con TypeScript
interface Props {
  titulo: string;
  onClose: () => void;
}

export function Modal({ titulo, onClose }: Props) {
  return (
    <div>
      <h2>{titulo}</h2>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}

// ❌ Malo - Sin tipos
export function Modal({ titulo, onClose }) {
  return (
    <div>
      <h2>{titulo}</h2>
      <button onClick={onClose}>Cerrar</button>
    </div>
  );
}
```

### Naming Conventions

```typescript
// ✅ Componentes: PascalCase
export function DashboardMetricas() {}

// ✅ Variables: camelCase
const nombreUsuario = 'Juan';

// ✅ Constantes: UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';

// ✅ Interfaces: PascalCase con I prefix (opcional)
interface IUsuario {}
// o sin prefix (preferido en este proyecto)
interface Usuario {}

// ✅ Types: PascalCase
type EstadoComanda = 'pendiente' | 'procesando' | 'completada';
```

### Conventional Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: agregar exportación a Excel en reportes"
git commit -m "feat(inventario): agregar filtro por categoría"

# Fixes
git commit -m "fix: corregir cálculo de totales en dashboard"
git commit -m "fix(comandas): resolver error al guardar nueva comanda"

# Docs
git commit -m "docs: actualizar README con instrucciones de deploy"

# Style
git commit -m "style: aplicar formato consistente a componentes"

# Refactor
git commit -m "refactor: simplificar lógica de autenticación"

# Performance
git commit -m "perf: optimizar carga de lista de productos"

# Tests
git commit -m "test: agregar tests para módulo de transporte"

# Chore
git commit -m "chore: actualizar dependencias"

# Breaking change
git commit -m "feat!: cambiar estructura de datos de organismos"
```

### Estructura de Archivos

```
src/
├── app/
│   ├── components/
│   │   ├── pages/          # Páginas completas
│   │   ├── ui/             # Componentes UI reutilizables
│   │   └── [Feature]/      # Componentes específicos de feature
│   ├── data/               # Data estática
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript types
│   └── utils/              # Utilidades
├── i18n/                   # Internacionalización
├── styles/                 # Estilos globales
└── contexts/               # React contexts
```

### Estilos con Tailwind

```tsx
// ✅ Bueno - Classes organizadas y legibles
<div className="
  flex items-center justify-between
  px-6 py-4
  bg-white/90 backdrop-blur-xl
  rounded-xl shadow-lg
  border border-gray-200/50
">

// ✅ Uso de clsx para condicionales
import { clsx } from 'clsx';

<button className={clsx(
  'px-4 py-2 rounded-lg',
  isActive ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
)}>

// ❌ Evitar - Inline styles
<div style={{ padding: '1rem', backgroundColor: 'white' }}>
```

---

## 🏗️ Estructura del Proyecto

### Componentes

```
components/
├── pages/              # Páginas completas (Dashboard, Inventario, etc.)
├── ui/                 # Componentes UI base (Button, Dialog, etc.)
├── Layout.tsx          # Layout principal
└── ErrorBoundary.tsx   # Error boundary global
```

### Utils

```
utils/
├── logger.ts           # Sistema de logging
├── *Storage.ts         # Funciones de localStorage
└── export*.ts          # Funciones de exportación
```

### Stores (Zustand)

```typescript
// Ejemplo de store
import { create } from 'zustand';

interface AuthStore {
  isAuthenticated: boolean;
  user: Usuario | null;
  login: (credentials: Credentials) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  user: null,
  login: (credentials) => {
    // Implementación
    set({ isAuthenticated: true, user: /* ... */ });
  },
  logout: () => {
    set({ isAuthenticated: false, user: null });
  }
}));
```

---

## ⚙️ Configuración del Entorno

### Requisitos

- Node.js 18+
- npm o pnpm

### Setup

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/banque-alimentaire.git
cd banque-alimentaire

# 2. Instalar dependencias
npm install

# 3. Copiar variables de entorno
cp .env.example .env.local

# 4. Iniciar desarrollo
npm run dev

# 5. Abrir navegador
# http://localhost:5173
```

### Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build
npm run deploy       # Deploy a GitHub Pages
```

---

## 🧪 Tests

### Escribir Tests

```typescript
// Ejemplo de test (cuando se implemente testing)
import { render, screen } from '@testing-library/react';
import { Dashboard } from './Dashboard';

describe('Dashboard', () => {
  it('debería renderizar el título', () => {
    render(<Dashboard />);
    expect(screen.getByText('Tableau de Bord')).toBeInTheDocument();
  });
});
```

### Ejecutar Tests

```bash
npm run test         # (Cuando se implemente)
npm run test:watch   # (Cuando se implemente)
```

---

## 🌍 Internacionalización

### Agregar Traducciones

1. Editar archivos en `/src/i18n/locales/`
2. Agregar keys en los 4 idiomas (fr, es, en, ar)

```json
// fr.json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  }
}
```

### Usar Traducciones

```typescript
import { useTranslation } from 'react-i18next';

function MiComponente() {
  const { t } = useTranslation();
  
  return <button>{t('common.save')}</button>;
}
```

---

## 📚 Recursos

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite](https://vitejs.dev/guide/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🙋 Preguntas

Si tienes preguntas:

1. Revisa la documentación
2. Busca en issues cerrados
3. Abre un nuevo issue con la etiqueta `question`
4. Contacta al equipo: dev@banquealimentaire.ca

---

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la misma licencia del proyecto.

---

**¡Gracias por contribuir!** 🎉
