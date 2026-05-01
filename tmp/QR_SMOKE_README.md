# QR Smoke Test

Script reutilizable para validar los escáneres QR de Inventario y Comandas sin tocar código productivo.

Comandos:

```powershell
node tmp/qr-smoke-playwright.cjs
node tmp/qr-smoke-playwright.cjs --module=inventory
node tmp/qr-smoke-playwright.cjs --module=comandas
node tmp/qr-smoke-playwright.cjs --with-camera
node tmp/qr-smoke-playwright.cjs --headful --browser=msedge
```

Qué valida por defecto:

- Apertura del modal QR
- Apertura y cierre de la guía de permisos
- Lectura de un PNG QR de prueba por archivo
- Cierre correcto del modal

Notas:

- Si faltan los PNG de prueba, el script los genera automáticamente usando `tmp/generate-qr-smoke.mjs`.
- `--with-camera` ejecuta una sonda informativa del flujo de cámara. En headless puede no detectar señal útil aunque el flujo real funcione en navegador normal.