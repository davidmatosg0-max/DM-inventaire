import{Q as b}from"./browser-63KU28Fv.js";import{f as m}from"./formatUtils-CF2cE4Lz.js";async function u(e){const i={foodBank:e.translations?.foodBank||"BANQUE ALIMENTAIRE",productLabel:e.translations?.productLabel||"Étiquette du Produit",quantity:e.translations?.quantity||"QUANTITÉ",temperature:e.translations?.temperature||"TEMPÉRATURE",lot:e.translations?.lot||"LOT",expiryDate:e.translations?.expiryDate||"DATE D'EXPIRATION",weight:e.translations?.weight||"POIDS",program:e.translations?.program||"PROGRAMME",donor:e.translations?.donor||"DONATEUR",entryDate:e.translations?.entryDate||"DATE D'ENTRÉE",systemFooter:e.translations?.systemFooter||"Système de Gestion des Stocks",ambient:e.translations?.ambient||"Ambiant",refrigerated:e.translations?.refrigerated||"Réfrigéré",frozen:e.translations?.frozen||"Congelé",packagingDetails:e.translations?.packagingDetails||"Détails de l'empaquetage"},l=e.pesoTotal||0,t=`BANCO-ALIMENTOS-${e.id}-${e.nombreProducto}-${m(l)}kg`;let n="";try{n=await b.toDataURL(t,{width:140,margin:1,errorCorrectionLevel:"H",color:{dark:"#1E73BE",light:"#FFFFFF"}})}catch(o){console.error("Error generando QR:",o)}const s={ambiente:{icon:"🌡️",text:i.ambient,color:"#FFC107"},refrigerado:{icon:"❄️",text:i.refrigerated,color:"#1E73BE"},congelado:{icon:"🧊",text:i.frozen,color:"#0288D1"}},r=s[e.temperatura]||s.ambiente,p=o=>o?new Date(o).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}):"",d=o=>o?new Date(o).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}):new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${i.productLabel} - ${e.id}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0.3in 0.4in;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background: white;
      padding: 0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
    }
    
    .etiqueta-container {
      width: 100%;
      max-width: 7.5in;
      margin: 0 auto;
      border: 3px solid #1E73BE;
      border-radius: 8px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* HEADER - Compacto */
    .etiqueta-header {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      border-bottom: 3px solid #FFC107;
    }
    
    .etiqueta-header-logo {
      width: 50px;
      height: 50px;
      object-fit: contain;
      border-radius: 50%;
      background: white;
      padding: 4px;
    }
    
    .etiqueta-header h1 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 22px;
      color: white;
      margin: 0;
      letter-spacing: 0.8px;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    /* QR SECTION */
    .qr-section {
      background: white;
      padding: 10px 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-bottom: 2px solid #E0E0E0;
    }
    
    .qr-code-wrapper {
      border: 2px solid #1E73BE;
      border-radius: 6px;
      padding: 6px;
      background: white;
      display: inline-block;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .qr-code-wrapper img {
      display: block;
      width: 110px;
      height: 110px;
    }
    
    /* PRODUCTO SECTION - MUY DESTACADO */
    .producto-section {
      background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
      padding: 16px 16px;
      text-align: center;
      border-bottom: 3px solid #1E73BE;
    }
    
    .producto-icono {
      font-size: 36px;
      margin-bottom: 6px;
      line-height: 1;
    }
    
    .producto-nombre {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 26px;
      color: #1E73BE;
      margin: 6px 0;
      line-height: 1.2;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    /* DONADOR SECTION - MUY DESTACADO */
    .donador-section {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      padding: 14px 16px;
      text-align: center;
      border-top: 3px solid #FFC107;
      border-bottom: 3px solid #FFC107;
    }
    
    .donador-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 4px;
    }
    
    .donador-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 22px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      line-height: 1.2;
    }
    
    /* PESO SECTION - DESTACADO */
    .peso-section {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      padding: 12px 16px;
      text-align: center;
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.15);
    }
    
    .peso-section h3 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: white;
      margin: 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      letter-spacing: 0.4px;
    }
    
    /* CANTIDAD Y TEMPERATURA GRID */
    .cantidad-temp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 12px 16px;
      background: white;
      border-bottom: 2px solid #E0E0E0;
    }
    
    .grid-item {
      background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
      border-left: 4px solid #1E73BE;
      padding: 10px 10px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .grid-item-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 9px;
      color: #1E73BE;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
      display: block;
    }
    
    .grid-item-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: #333333;
      line-height: 1.2;
    }
    
    .temperature-badge {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 4px 8px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 600;
      background: white;
      border: 2px solid ${r.color};
      color: ${r.color};
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }
    
    /* INFO FIELDS - DESTACADOS */
    .info-fields {
      padding: 10px 16px 12px 16px;
      background: white;
    }
    
    .info-field {
      background: linear-gradient(135deg, #FAFAFA 0%, #F5F5F5 100%);
      border-left: 4px solid #1E73BE;
      padding: 10px 12px;
      margin-bottom: 8px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .info-field:last-child {
      margin-bottom: 0;
    }
    
    .info-field-label {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 9px;
      color: #1E73BE;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-bottom: 4px;
      display: block;
    }
    
    .info-field-value {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 16px;
      color: #333333;
      line-height: 1.2;
    }
    
    /* PRINT BUTTONS */
    .print-buttons {
      display: flex;
      gap: 12px;
      justify-content: center;
      padding: 20px 16px;
      background: white;
    }
    
    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .btn-print {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .btn-print:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    .btn-close {
      background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
      color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }
    
    .btn-close:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    
    @media print {
      body {
        padding: 0;
        display: block;
      }
      
      .etiqueta-container {
        box-shadow: none;
        max-width: none;
        width: 100%;
        margin: 0;
      }
      
      .print-buttons {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="etiqueta-container">
    <!-- HEADER -->
    <div class="etiqueta-header">
      ${e.systemLogo?`<img src="${e.systemLogo}" alt="Logo" class="etiqueta-header-logo">`:"🏦"}
      <h1>${e.systemName||i.foodBank}</h1>
    </div>
    
    <!-- QR SECTION -->
    <div class="qr-section">
      <div class="qr-code-wrapper">
        <img src="${n}" alt="QR Code">
      </div>
    </div>
    
    <!-- PRODUCTO SECTION - MUY DESTACADO -->
    <div class="producto-section">
      ${e.productoIcono?`<div class="producto-icono">${e.productoIcono}</div>`:""}
      <div class="producto-nombre">
        ${e.subcategoria||e.nombreProducto}
      </div>
    </div>
    
    <!-- DONADOR SECTION - MUY DESTACADO -->
    ${e.donadorNombre?`
      <div class="donador-section">
        <div class="donador-label">🏢 ${i.donor}</div>
        <div class="donador-value">${e.donadorNombre}</div>
      </div>
    `:""}
    
    <!-- PESO SECTION - DESTACADO -->
    <div class="peso-section">
      <h3>${m(e.pesoTotal||0)} kg</h3>
    </div>
    
    <!-- CANTIDAD Y TEMPERATURA GRID -->
    <div class="cantidad-temp-grid">
      <div class="grid-item">
        <span class="grid-item-label">📦 ${i.quantity}</span>
        <div class="grid-item-value">${e.cantidad} ${e.unidad}</div>
      </div>
      <div class="grid-item">
        <span class="grid-item-label">🌡️ ${i.temperature}</span>
        <div class="grid-item-value">
          <span class="temperature-badge">
            ${r.icon} ${r.text}
          </span>
        </div>
      </div>
    </div>
    
    <!-- INFO FIELDS - DESTACADOS -->
    <div class="info-fields">
      ${e.lote?`
        <div class="info-field">
          <span class="info-field-label">LOT</span>
          <div class="info-field-value">${e.lote}</div>
        </div>
      `:""}
      ${e.fechaCaducidad?`
        <div class="info-field">
          <span class="info-field-label">DATE D'EXPIRATION</span>
          <div class="info-field-value">${p(e.fechaCaducidad)}</div>
        </div>
      `:""}
      ${e.detallesEmpaque?`
        <div class="info-field">
          <span class="info-field-label">DÉTAILS DE L'EMBALLAGE</span>
          <div class="info-field-value">${e.detallesEmpaque}</div>
        </div>
      `:""}
      ${e.programa?`
        <div class="info-field">
          <span class="info-field-label">PROGRAMME</span>
          <div class="info-field-value">${e.programa}</div>
        </div>
      `:""}
      ${e.fechaEntrada?`
        <div class="info-field">
          <span class="info-field-label">DATE D'ENTRÉE</span>
          <div class="info-field-value">${d(e.fechaEntrada)}</div>
        </div>
      `:""}
    </div>
  </div>
  
  <!-- PRINT BUTTONS -->
  <div class="print-buttons">
    <button class="btn btn-print" onclick="handlePrint()">
      🖨️ Imprimer l'étiquette
    </button>
    <button class="btn btn-close" onclick="window.close()">
      ✖ Fermer
    </button>
  </div>
  
  <script>
    function handlePrint() {
      window.print();
    }
  <\/script>
</body>
</html>
  `.trim()}async function w(e,i=!1){const l=await u(e),t=document.createElement("iframe");t.style.position="absolute",t.style.left="-9999px",t.style.top="-9999px",t.style.width="8.5in",t.style.height="11in",t.style.border="none",document.body.appendChild(t);const n=t.contentDocument||t.contentWindow?.document;if(!n)throw document.body.removeChild(t),new Error("No se pudo crear el documento de impresión");return n.open(),n.write(l),n.close(),new Promise((s,r)=>{const p=()=>new Promise(o=>{const a=n.querySelectorAll("img");if(a.length===0){o();return}let c=0;const x=a.length,g=()=>{c++,c===x&&o()};a.forEach(f=>{f.complete?g():(f.onload=g,f.onerror=g)}),setTimeout(()=>{o()},500)}),d=async()=>{try{await p(),t.contentWindow?.focus(),t.contentWindow?.print(),s();const o=()=>{document.body.contains(t)&&document.body.removeChild(t)};t.contentWindow&&(t.contentWindow.onafterprint=o),setTimeout(()=>{document.body.contains(t)&&document.body.removeChild(t)},3e4)}catch(o){console.error("Error en impresión:",o),document.body.contains(t)&&document.body.removeChild(t),r(o)}};n.readyState==="complete"?d():t.onload=d,t.onerror=()=>{document.body.contains(t)&&document.body.removeChild(t),r(new Error("Error al cargar el iframe"))}})}export{w as p};
