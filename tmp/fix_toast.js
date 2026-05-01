// Script para corregir el toast
// Reemplazar la línea 904-907

const oldCode = `    toast.success(\`✅ \${t('configuration.productGeneratedAuto')}: "\${nombre}"\`, {
      description: \`📦 \${t('common.code')}: \${codigo} | 📂 \${t('configuration.category')}: \${categoria.nombre}\`,
      duration: 5000
    });`;

const newCode = `    // Construir descripción del toast con información completa
    let toastDescription = \`📦 \${t('common.code')}: \${codigo} | 📂 \${t('configuration.category')}: \${categoria.nombre}\`;
    if (subcategoria.pesoUnitario) {
      toastDescription += \` | ⚖️ \${t('configuration.unitWeight')}: \${subcategoria.pesoUnitario} kg\`;
    }
    
    toast.success(\`✅ \${t('configuration.productGeneratedAuto')}: "\${nombre}"\`, {
      description: toastDescription,
      duration: 5000
    });`;
