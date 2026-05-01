/**
 * 🆘 CÓDIGO DE EMERGENCIA PARA BUSCAR A YVES
 * 
 * Copia y pega este código directamente en la consola del navegador (F12)
 */

export const codigoEmergenciaBuscarYves = `
// 🔍 BÚSQUEDA DE EMERGENCIA - YVES
console.log('%c🆘 BÚSQUEDA DE EMERGENCIA: YVES', 'background: red; color: white; font-size: 18px; padding: 10px; font-weight: bold');
console.log('==========================================');

let encontrado = false;
const resultados = [];

// 1️⃣ Buscar en módulo Bénévoles principal
const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
if (benevolesData) {
  const benevoles = JSON.parse(benevolesData);
  const yves = benevoles.filter(b => 
    (b.nom && b.nom.toLowerCase().includes('yves')) ||
    (b.prenom && b.prenom.toLowerCase().includes('yves')) ||
    (b.email && b.email.toLowerCase().includes('yves'))
  );
  
  if (yves.length > 0) {
    encontrado = true;
    console.log('%c✅ ENCONTRADO EN MÓDULO BÉNÉVOLES', 'color: green; font-size: 16px; font-weight: bold');
    console.log('Total encontrados:', yves.length);
    yves.forEach((b, idx) => {
      console.log(\`\\n📋 Registro \${idx + 1}:\`);
      console.log('  Nombre:', b.prenom, b.nom);
      console.log('  Email:', b.email);
      console.log('  Teléfono:', b.telephone);
      console.log('  Departamentos:', b.departement);
      console.log('  Statut:', b.statut);
      console.log('  ID:', b.id);
      console.log('  Datos completos:', b);
      resultados.push({ ubicacion: 'Módulo Bénévoles', datos: b });
    });
  }
}

// 2️⃣ Buscar en contactos de departamento
const contactosData = localStorage.getItem('banqueAlimentaire_contactosDepartamento');
if (contactosData) {
  const contactos = JSON.parse(contactosData);
  const yvesContactos = contactos.filter(c => 
    (c.nombre && c.nombre.toLowerCase().includes('yves')) ||
    (c.apellido && c.apellido.toLowerCase().includes('yves')) ||
    (c.nombreCompleto && c.nombreCompleto.toLowerCase().includes('yves')) ||
    (c.email && c.email.toLowerCase().includes('yves'))
  );
  
  if (yvesContactos.length > 0) {
    encontrado = true;
    console.log('\\n%c✅ ENCONTRADO EN CONTACTOS DEPARTAMENTO', 'color: green; font-size: 16px; font-weight: bold');
    console.log('Total encontrados:', yvesContactos.length);
    yvesContactos.forEach((c, idx) => {
      console.log(\`\\n📋 Contacto \${idx + 1}:\`);
      console.log('  Nombre:', c.nombreCompleto || \`\${c.nombre} \${c.apellido}\`);
      console.log('  Email:', c.email);
      console.log('  Teléfono:', c.telefono);
      console.log('  Departamento:', c.departamentoId);
      console.log('  Tipo:', c.tipo);
      console.log('  ID:', c.id);
      console.log('  Datos completos:', c);
      resultados.push({ ubicacion: 'Contactos Departamento', datos: c });
    });
  }
}

// 3️⃣ Buscar en usuarios
const usuariosData = localStorage.getItem('banqueAlimentaire_usuarios');
if (usuariosData) {
  const usuarios = JSON.parse(usuariosData);
  const yvesUsuario = usuarios.filter(u => 
    (u.nombre && u.nombre.toLowerCase().includes('yves')) ||
    (u.usuario && u.usuario.toLowerCase().includes('yves')) ||
    (u.email && u.email.toLowerCase().includes('yves'))
  );
  
  if (yvesUsuario.length > 0) {
    encontrado = true;
    console.log('\\n%c✅ ENCONTRADO EN USUARIOS', 'color: green; font-size: 16px; font-weight: bold');
    console.log('Total encontrados:', yvesUsuario.length);
    yvesUsuario.forEach((u, idx) => {
      console.log(\`\\n📋 Usuario \${idx + 1}:\`);
      console.log('  Nombre:', u.nombre);
      console.log('  Usuario:', u.usuario);
      console.log('  Email:', u.email);
      console.log('  Datos completos:', u);
      resultados.push({ ubicacion: 'Usuarios', datos: u });
    });
  }
}

// 4️⃣ Resultado final
console.log('\\n==========================================');
if (encontrado) {
  console.log('%c✅ YVES ENCONTRADO EN ' + resultados.length + ' UBICACIÓN(ES)', 'background: green; color: white; font-size: 16px; padding: 8px; font-weight: bold');
  console.log('\\n📊 RESUMEN:');
  resultados.forEach((r, idx) => {
    console.log(\`  \${idx + 1}. \${r.ubicacion}\`);
  });
  console.log('\\n💾 Datos guardados en la variable "resultados":');
  console.log(resultados);
} else {
  console.log('%c❌ YVES NO ENCONTRADO EN NINGUNA UBICACIÓN', 'background: red; color: white; font-size: 16px; padding: 8px; font-weight: bold');
  console.log('\\n💡 POSIBLES RAZONES:');
  console.log('  1. El nombre no es exactamente "Yves"');
  console.log('  2. Fue eliminado del sistema');
  console.log('  3. Nunca fue creado');
  console.log('\\n🔍 INTENTA BUSCAR CON OTRO CRITERIO:');
  console.log('  - Busca por apellido');
  console.log('  - Busca por email');
  console.log('  - Lista todos los voluntarios (ver siguiente comando)');
}
console.log('==========================================');

// 5️⃣ Listar TODOS los voluntarios para referencia
console.log('\\n%c📋 LISTADO COMPLETO DE TODOS LOS VOLUNTARIOS', 'background: blue; color: white; font-size: 14px; padding: 8px; font-weight: bold');
if (benevolesData) {
  const benevoles = JSON.parse(benevolesData);
  console.log(\`\\nTotal en módulo principal: \${benevoles.length}\`);
  benevoles.forEach((b, idx) => {
    console.log(\`  \${idx + 1}. \${b.prenom} \${b.nom} - \${b.email} - Statut: \${b.statut}\`);
  });
}

resultados; // Retornar resultados para que se puedan inspeccionar
`;
