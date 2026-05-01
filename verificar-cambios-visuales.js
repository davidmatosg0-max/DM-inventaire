/**
 * SCRIPT DE VERIFICACIÓN VISUAL - Cambios 15 Marzo 2026
 * 
 * CÓMO USAR:
 * 1. Abre la consola del navegador (F12)
 * 2. Copia y pega todo este código
 * 3. Presiona Enter
 * 4. Lee los resultados
 */

(function verificarCambiosVisuales() {
  console.clear();
  console.log('%c═══════════════════════════════════════════════════════', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  console.log('%c  🔍 VERIFICACIÓN DE CAMBIOS - 15 Marzo 2026', 'color: #1a4d7a; font-weight: bold; font-size: 16px;');
  console.log('%c═══════════════════════════════════════════════════════', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  console.log('');

  let resultados = {
    buildId: null,
    campoPoidsVisible: false,
    botonAnularVisible: false,
    timestampApp: false,
    errores: []
  };

  // 1. Verificar Build ID en HTML
  console.log('%c1️⃣  Verificando Build ID...', 'color: #2d9561; font-weight: bold;');
  const htmlComment = document.documentElement.outerHTML.match(/Build:\s*([\d-]+)/);
  if (htmlComment) {
    resultados.buildId = htmlComment[1];
    console.log(`   ✅ Build ID encontrado: ${resultados.buildId}`);
  } else {
    console.log('   ❌ Build ID no encontrado en HTML');
    resultados.errores.push('Build ID no encontrado');
  }
  console.log('');

  // 2. Verificar si estamos en la página de Inventario
  console.log('%c2️⃣  Verificando ubicación actual...', 'color: #2d9561; font-weight: bold;');
  const urlActual = window.location.href;
  console.log(`   📍 URL actual: ${urlActual}`);
  
  // Buscar elementos relacionados con los cambios
  const entradasTab = document.querySelector('[role="tab"]') || 
                      Array.from(document.querySelectorAll('button, div')).find(el => 
                        el.textContent.includes('Entradas') || el.textContent.includes('Entrées')
                      );
  
  if (entradasTab) {
    console.log('   ✅ Pestaña "Entradas" encontrada en el DOM');
  } else {
    console.log('   ℹ️  No estás en la vista de Inventario/Entradas');
    console.log('   💡 Navega a: Inventario → Entradas para ver los cambios');
  }
  console.log('');

  // 3. Buscar indicadores del campo Peso Unitario
  console.log('%c3️⃣  Buscando campo "Peso Unitario"...', 'color: #2d9561; font-weight: bold;');
  const labelPoids = Array.from(document.querySelectorAll('label')).find(label => 
    label.textContent.includes('⚖️') && label.textContent.includes('Poids unitaire')
  );
  
  if (labelPoids) {
    console.log('   ✅ Campo "⚖️ Poids unitaire" encontrado en el DOM');
    resultados.campoPoidsVisible = true;
    
    // Verificar estilos
    const input = labelPoids.nextElementSibling;
    if (input && input.tagName === 'INPUT') {
      const styles = window.getComputedStyle(input);
      const borderWidth = styles.borderWidth;
      const borderColor = styles.borderColor;
      console.log(`   📏 Borde del input: ${borderWidth}`);
      console.log(`   🎨 Color del borde: ${borderColor}`);
      
      if (borderWidth === '2px') {
        console.log('   ✅ Borde de 2px confirmado');
      } else {
        console.log('   ⚠️  Borde no es de 2px');
      }
    }
  } else {
    console.log('   ℹ️  Campo no visible (necesitas abrir el diálogo de crear subcategoría)');
    console.log('   💡 Para verlo: Ir a Inventario → Entradas → ➕ Nueva Entrada');
    console.log('                 → Seleccionar programa → Seleccionar categoría');
    console.log('                 → Clic en "Créer sous-catégorie"');
  }
  console.log('');

  // 4. Buscar botón Anular
  console.log('%c4️⃣  Buscando botón "Anular"...', 'color: #2d9561; font-weight: bold;');
  const botones = Array.from(document.querySelectorAll('button'));
  const botonAnular = botones.find(btn => {
    const texto = btn.textContent.toLowerCase();
    return texto.includes('anular') || texto.includes('annuler');
  });
  
  if (botonAnular) {
    console.log('   ✅ Botón "Anular" encontrado en el DOM');
    resultados.botonAnularVisible = true;
    
    // Verificar estilos
    const styles = window.getComputedStyle(botonAnular);
    const color = styles.color;
    const borderWidth = styles.borderWidth;
    const borderColor = styles.borderColor;
    
    console.log(`   🎨 Color del texto: ${color}`);
    console.log(`   📏 Borde: ${borderWidth}`);
    console.log(`   🎨 Color del borde: ${borderColor}`);
    
    // Verificar si es rojo
    if (color.includes('220, 53, 69') || color.includes('#DC3545') || borderColor.includes('220, 53, 69')) {
      console.log('   ✅ Color rojo confirmado (#DC3545)');
    } else {
      console.log('   ⚠️  El color podría no ser el correcto');
    }
    
    if (borderWidth.includes('2px')) {
      console.log('   ✅ Borde de 2px confirmado');
    }
    
    // Verificar icono
    const svg = botonAnular.querySelector('svg');
    if (svg) {
      console.log('   ✅ Icono SVG encontrado');
    }
  } else {
    console.log('   ℹ️  Botón no visible (puede que no haya entradas registradas)');
    console.log('   💡 Para verlo: Ir a Inventario → Entradas');
    console.log('                 Si hay entradas, verás botones "Editar" y "Anular"');
  }
  console.log('');

  // 5. Verificar versión del código
  console.log('%c5️⃣  Verificando versión del código...', 'color: #2d9561; font-weight: bold;');
  
  // Buscar scripts cargados
  const scripts = Array.from(document.querySelectorAll('script'));
  const scriptSrc = scripts.map(s => s.src).filter(src => src.includes('main') || src.includes('App'));
  
  if (scriptSrc.length > 0) {
    console.log(`   📦 Scripts encontrados: ${scriptSrc.length}`);
    scriptSrc.forEach(src => {
      const hash = src.match(/-([a-f0-9]+)\.js$/);
      if (hash) {
        console.log(`   🔑 Hash del bundle: ${hash[1]}`);
      }
    });
  }
  console.log('');

  // 6. Verificar localStorage
  console.log('%c6️⃣  Verificando datos en localStorage...', 'color: #2d9561; font-weight: bold;');
  try {
    const entradas = localStorage.getItem('entradas_inventario');
    const subcategorias = localStorage.getItem('productos');
    
    if (entradas) {
      const entradasParsed = JSON.parse(entradas);
      console.log(`   ✅ ${entradasParsed.length || 0} entradas en localStorage`);
    } else {
      console.log('   ℹ️  No hay entradas registradas aún');
    }
    
    if (subcategorias) {
      const subcatParsed = JSON.parse(subcategorias);
      const conPesoUnitario = subcatParsed.filter(s => s.pesoUnitario && s.pesoUnitario > 0);
      console.log(`   ✅ ${subcatParsed.length || 0} productos/subcategorías en localStorage`);
      console.log(`   📊 ${conPesoUnitario.length || 0} con peso unitario definido`);
    }
  } catch (error) {
    console.log(`   ⚠️  Error al leer localStorage: ${error.message}`);
  }
  console.log('');

  // RESUMEN FINAL
  console.log('%c═══════════════════════════════════════════════════════', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  console.log('%c  📊 RESUMEN DE VERIFICACIÓN', 'color: #1a4d7a; font-weight: bold; font-size: 16px;');
  console.log('%c═══════════════════════════════════════════════════════', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  console.log('');
  
  console.log(`%cBuild ID: ${resultados.buildId || 'No encontrado'}`, 
    resultados.buildId ? 'color: #2d9561;' : 'color: #DC3545;');
  
  console.log(`%cCampo Peso Unitario: ${resultados.campoPoidsVisible ? 'Visible ✅' : 'No visible (ver instrucciones arriba) ℹ️'}`,
    resultados.campoPoidsVisible ? 'color: #2d9561;' : 'color: #666;');
  
  console.log(`%cBotón Anular: ${resultados.botonAnularVisible ? 'Visible ✅' : 'No visible (ver instrucciones arriba) ℹ️'}`,
    resultados.botonAnularVisible ? 'color: #2d9561;' : 'color: #666;');
  
  console.log('');
  
  if (resultados.errores.length > 0) {
    console.log('%c⚠️  ERRORES ENCONTRADOS:', 'color: #DC3545; font-weight: bold;');
    resultados.errores.forEach(error => console.log(`   • ${error}`));
    console.log('');
  }

  // Instrucciones finales
  console.log('%c💡 INSTRUCCIONES:', 'color: #2d9561; font-weight: bold;');
  console.log('');
  console.log('1. Si Build ID es "15-03-2026-1835": ✅ Código actualizado');
  console.log('   Si es otro o no existe: Presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac)');
  console.log('');
  console.log('2. Para ver el campo Peso Unitario:');
  console.log('   Inventario → Entradas → ➕ → Programa → Categoría → "Créer sous-catégorie"');
  console.log('');
  console.log('3. Para ver el botón Anular:');
  console.log('   Inventario → Entradas → (verás botones en cada entrada)');
  console.log('');
  
  console.log('%c═══════════════════════════════════════════════════════', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  
  return resultados;
})();
