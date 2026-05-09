# Frontend + Supabase en producción

Esta aplicación usa Vite.
Las variables VITE_* se inyectan au moment du build, no en tiempo de ejecución.

## Archivos de referencia

- .env.local.example
- .env.deploy.example
- SUPABASE_AUTH_SETUP.md

## Variables frontend necesarias

Usar estas variables en el hosting del frontend:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ENABLE_SUPABASE_AUTH=true

## Recomendación de hosting

La opción más simple para este proyecto con Supabase es Vercel o Netlify.
GitHub Pages sigue siendo posible, pero requiere que el build se haga con secretos disponibles en CI o en local antes del deploy.

## Vercel

Configurar en Project Settings > Environment Variables:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ENABLE_SUPABASE_AUTH

Build:

- Install command: npm install
- Build command: npm run build
- Output directory: dist

El archivo vercel.json ya está preparado para SPA y headers básicos.

## Netlify

Configurar en Site configuration > Environment variables:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ENABLE_SUPABASE_AUTH

Build:

- Build command: npm run build
- Publish directory: dist

El archivo netlify.toml ya está preparado para SPA y headers básicos.

## GitHub Pages

GitHub Pages no ofrece variables VITE_* en runtime.
Por eso hay dos opciones válidas:

1. Hacer el build en GitHub Actions con secrets y publicar dist.
2. Hacer el build en local con .env.local real y luego publicar dist.

Si se usa GitHub Pages, no subir nunca el archivo .env.local real al repositorio.

Secrets recomendados en GitHub:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- VITE_ENABLE_SUPABASE_AUTH

El workflow existente .github/workflows/deploy-pages.yml ya valida VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY antes del build.

## Activación completa recomendada

1. Crear el proyecto en Supabase.
2. Ejecutar npm run supabase:deploy:dry-run.
3. Ejecutar npm run supabase:deploy.
4. Configurar VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY y VITE_ENABLE_SUPABASE_AUTH en el hosting del frontend.
5. Ejecutar npm run build.
6. Publicar el frontend en Vercel o Netlify.

## Verificación final

1. La app carga sin pantalla en blanco.
2. El login acepta usuario o email si Supabase Auth está activo.
3. Los organismos, productos, entradas, movimientos y comandas persisten entre navegadores.
4. La gestión de usuarios funciona si la Edge Function admin-users ya está desplegada.
