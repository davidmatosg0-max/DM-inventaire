# Recrutement Functional Test

Script reutilizable para validar el flujo funcional completo del módulo Recrutement.

Comandos:

```powershell
npm run dev:recrutement
npm run test:recrutement
```

Qué valida:

- Crear una nueva candidatura
- Cambiar su estado a `Accepté`
- Suprimir el contacto creado
- Reasignar el candidato a `Transport`
- Borrar la candidatura de prueba

Notas:

- `npm run dev:recrutement` levanta Vite en `http://127.0.0.1:4173/`, que es la URL esperada por defecto.
- El script usa `--strictPort`, así que si `4173` está ocupado Vite fallará en vez de cambiar silenciosamente de puerto.
- Si quieres apuntar a otra URL, usa la variable `RECRUTEMENT_BASE_URL`.
- El script usa un candidato temporal con nombre e email únicos para no contaminar pruebas previas.