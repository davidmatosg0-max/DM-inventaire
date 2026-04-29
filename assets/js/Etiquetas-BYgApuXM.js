import{j as e,r as d}from"./react-vendor-CmVymGNF.js";import{u as Ge,G as Re,E as X,w as We,B as p,L as j,k as E,l as k,m as S,n as q,p as u,I,P as pe,ab as ee,z as ue,aj as He,v as ge,C as Je,ad as Qe,h as be,t as h}from"./index-Dyd20qEu.js";import{D as U,a as Z,b as B,c as O,d as V,e as G}from"./dialog-CNPPzmbc.js";import{T as Ye,a as Ke,b as je,c as fe}from"./tabs-CSlVt_OC.js";import{C as ve}from"./checkbox-BfWggCgE.js";import{B as _e,g as se,a as Xe}from"./barcode-Cv8S3Abq.js";import{p as es}from"./StandardProductLabel-Ddt6RNip.js";import{a as ss}from"./mockData-EVDosvtz.js";import{o as as}from"./categoriaStorage-SPzxyxEK.js";import{u as os}from"./i18n-vendor-BBIw8LEr.js";import{G as ts}from"./grid-3x3-CSRrdeeT.js";import{L as ls}from"./list-BYL1RvY-.js";import{C as is}from"./copy-CD5N2VFg.js";import{P as rs}from"./printer-CxVB6nVG.js";import"./ui-vendor-diR8f5pA.js";import"./utils-vendor-V93zgBl7.js";import"./chart-vendor-fBg51pco.js";import"./browser-63KU28Fv.js";import"./formatUtils-CF2cE4Lz.js";function ns({datos:a,tamano:o="mediana",formato:n="CODE128"}){const m={pequena:{width:"6cm",height:"4cm",barcodeWidth:1.2,barcodeHeight:30},mediana:{width:"10cm",height:"6cm",barcodeWidth:1.8,barcodeHeight:45},grande:{width:"14cm",height:"8cm",barcodeWidth:2.5,barcodeHeight:60}}[o];return e.jsxs("div",{className:"etiqueta-imprimible bg-white border-2 border-gray-800 flex flex-col items-center justify-between p-4",style:{width:m.width,height:m.height,pageBreakAfter:"always",pageBreakInside:"avoid",fontFamily:"Arial, sans-serif"},children:[e.jsxs("div",{className:"w-full text-center border-b-2 border-gray-300 pb-2",children:[e.jsxs("div",{className:"flex items-center justify-center gap-2 mb-1",children:[a.icono&&e.jsx("span",{className:"text-2xl",children:a.icono}),e.jsx("h3",{className:"font-bold text-lg uppercase tracking-wide",children:a.titulo})]}),a.subtitulo&&e.jsx("p",{className:"text-xs text-gray-600 font-medium",children:a.subtitulo})]}),e.jsx("div",{className:"flex-1 flex items-center justify-center w-full py-2",children:e.jsx(_e,{value:a.codigo,format:n,width:m.barcodeWidth,height:m.barcodeHeight,displayValue:!0,fontSize:o==="pequena"?12:o==="mediana"?14:16,margin:0,background:"#ffffff",lineColor:"#000000"})}),e.jsx("div",{className:"w-full border-t-2 border-gray-300 pt-2",children:e.jsxs("div",{className:"grid grid-cols-2 gap-2 text-xs",children:[a.categoria&&e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Categoría:"}),e.jsx("p",{className:"truncate",children:a.categoria})]}),a.lote&&e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:"Lote:"}),e.jsx("p",{className:"truncate",children:a.lote})]}),a.fechaVencimiento&&e.jsxs("div",{className:"col-span-2",children:[e.jsx("span",{className:"font-semibold",children:"Vencimiento:"}),e.jsx("p",{className:"font-bold text-red-600",children:a.fechaVencimiento})]}),a.descripcion&&e.jsx("div",{className:"col-span-2",children:e.jsx("p",{className:"text-gray-600 text-[10px] truncate",children:a.descripcion})})]})}),e.jsx("div",{className:"w-full text-center mt-2 pt-2 border-t border-gray-200",children:e.jsx("p",{className:"text-[8px] text-gray-400",children:"Banque Alimentaire - Système de Gestion"})})]})}function cs({etiquetas:a,tamano:o="mediana",formato:n="CODE128",columnas:v=2}){return e.jsx("div",{className:"grid gap-4 p-4",style:{gridTemplateColumns:`repeat(${v}, 1fr)`},children:a.map((m,w)=>e.jsx(ns,{datos:m,tamano:o,formato:n},w))})}const ds=()=>{const a=localStorage.getItem("zonasAlmacen");if(a)try{return JSON.parse(a)}catch(o){console.error("Error al cargar zonas:",o)}return[{zona:"A",tipo:"Estantería",cantidad:10},{zona:"B",tipo:"Estantería",cantidad:10},{zona:"C",tipo:"Cámara Fría",cantidad:5},{zona:"D",tipo:"Almacén Seco",cantidad:8},{zona:"E",tipo:"Congelador",cantidad:4}]},ae=a=>{localStorage.setItem("zonasAlmacen",JSON.stringify(a))},R={"Alimentos Secos":{icono:"🍚",color:"#FFC107"},Conservas:{icono:"🥫",color:"#4CAF50"},Lácteos:{icono:"🥛",color:"#1E73BE"},"Frutas y Verduras":{icono:"🥬",color:"#4CAF50"},Proteínas:{icono:"🥩",color:"#DC3545"},Panadería:{icono:"🍞",color:"#FFA726"},Bebidas:{icono:"🧃",color:"#29B6F6"},"Aceites y Condimentos":{icono:"🫒",color:"#66BB6A"}};function qs(){const{t:a}=os(),o=Ge(),[n,v]=d.useState([]),[m,w]=d.useState([]),[W,ye]=d.useState(!1),[Ce,oe]=d.useState(!1),[Ne,H]=d.useState(!1),[we,ze]=d.useState("ubicacion"),[g,$e]=d.useState("mediana"),[J,Ee]=d.useState("CODE128"),[Q,ke]=d.useState(2),[y,te]=d.useState(""),[A,le]=d.useState(""),[ie,re]=d.useState(""),[D,ne]=d.useState(""),[C,ce]=d.useState(""),[F,de]=d.useState(1),[Se,P]=d.useState(!1),[qe,Y]=d.useState(!1),[z,L]=d.useState(null),[c,N]=d.useState({zona:"",tipo:"Estantería",cantidad:10}),[b,K]=d.useState(ds()),[me,Ae]=d.useState(0),xe=d.useMemo(()=>Re(),[me]),M=d.useMemo(()=>{const s=as(),t=xe.map(l=>{let f="📦";const $=s.find(x=>x.nombre===l.categoria),r=$?.subcategorias?.find(x=>x.nombre===l.subcategoria);return r?.icono&&r.icono.trim()!==""?f=r.icono:$?.icono&&$.icono.trim()!==""?f=$.icono:R[l.categoria]?.icono&&(f=R[l.categoria].icono),{id:l.id,codigo:l.codigo,nombre:l.nombre,categoria:l.categoria,subcategoria:l.subcategoria,unidad:l.unidad,stockActual:l.stockActual,stockMinimo:l.stockMinimo,ubicacion:l.ubicacion,lote:l.lote||"",fechaVencimiento:l.fechaVencimiento||"",esPRS:l.esPRS,foto:"",icono:f,peso:l.peso,pesoRegistrado:l.pesoRegistrado,pesoUnitario:l.pesoUnitario||l.peso,varianteId:l.varianteId}}),i=ss.filter(l=>!t.some(f=>f.id===l.id));return[...t,...i]},[xe,me]);d.useEffect(()=>{const s=()=>{console.log("🔄 Categorías actualizadas - Recargando etiquetas..."),Ae(t=>t+1)};return window.addEventListener("categorias-actualizadas",s),()=>{window.removeEventListener("categorias-actualizadas",s)}},[]);const Fe=()=>{if(!y||!A){h.error(a("labels.completeAllFields"));return}const s=`${y}${A}`,t=se(s),i=b.find(f=>f.zona===y),l={tipo:"ubicacion",titulo:"UBICACIÓN",codigo:t,subtitulo:s,descripcion:ie||`${i?.tipo} - Zona ${y}`,icono:"📍"};v([...n,l]),h.success(a("labels.locationLabelCreated")),T()},De=()=>{if(!D){h.error(a("inventory.selectProduct"));return}const s=M.find(f=>f.id===D);if(!s)return;const t=Xe(s.id),i=R[s.categoria],l={tipo:"producto",titulo:s.nombre,codigo:t,subtitulo:`${a("labels.code")}: ${s.codigo}`,categoria:s.categoria,lote:s.lote,fechaVencimiento:s.fechaVencimiento,icono:s.icono||i?.icono||"📦"};v([...n,l]),h.success(a("labels.productLabelCreated")),T()},Pe=()=>{if(!C||F<1){h.error(a("labels.completeAllFields"));return}const s=b.find(i=>i.zona===C),t=[];for(let i=1;i<=F;i++){const l=`${C}${i}`,f=se(l);t.push({tipo:"ubicacion",titulo:"UBICACIÓN",codigo:f,subtitulo:l,descripcion:`${s?.tipo} - Zona ${C}`,icono:"📍"})}v([...n,...t]),h.success(`${F} ${a("labels.labelsCreated")}`),H(!1),ce(""),de(1)},Ie=()=>{if(!c.zona.trim()){h.error("El código de zona es requerido");return}if(b.some(t=>t.zona.toUpperCase()===c.zona.toUpperCase())){h.error("Ya existe una zona con ese código");return}const s=[...b,{zona:c.zona.toUpperCase(),tipo:c.tipo,cantidad:c.cantidad}];s.sort((t,i)=>t.zona.localeCompare(i.zona)),K(s),ae(s),h.success(`Zone ${c.zona.toUpperCase()} créée avec succès`),P(!1),N({zona:"",tipo:"Estantería",cantidad:10})},Le=s=>{const t=b.find(i=>i.zona===s);t&&(N({zona:t.zona,tipo:t.tipo,cantidad:t.cantidad}),L(s),Y(!1),P(!0))},Me=()=>{if(!c.zona.trim()){h.error("El código de zona es requerido");return}if(z&&c.zona.toUpperCase()!==z&&b.some(t=>t.zona.toUpperCase()===c.zona.toUpperCase())){h.error("Ya existe una zona con ese código");return}const s=b.map(t=>t.zona===z?{zona:c.zona.toUpperCase(),tipo:c.tipo,cantidad:c.cantidad}:t);s.sort((t,i)=>t.zona.localeCompare(i.zona)),K(s),ae(s),h.success(`Zone ${c.zona.toUpperCase()} modifiée avec succès`),P(!1),L(null),N({zona:"",tipo:"Estantería",cantidad:10})},Te=s=>{if(confirm(`¿Está seguro que desea eliminar la zona ${s}? Esta acción no se puede deshacer.`)){const t=b.filter(i=>i.zona!==s);K(t),ae(t),h.success(`Zone ${s} supprimée avec succès`)}},T=()=>{te(""),le(""),re(""),ne(""),oe(!1)},he=s=>{w(t=>t.includes(s)?t.filter(i=>i!==s):[...t,s])},Ue=()=>{m.length===n.length?w([]):w(n.map((s,t)=>t))},Ze=()=>{v(s=>s.filter((t,i)=>!m.includes(i))),w([]),h.success(a("labels.labelsDeleted"))},Be=()=>{const s=m.map(t=>({...n[t]}));v([...n,...s]),w([]),h.success(`${s.length} ${a("labels.labelsDuplicated")}`)},Oe=async()=>{const s=m.length>0?m.map(r=>n[r]):n;if(s.length===0){h.error(a("labels.noLabelsToPrint"));return}const t=s.filter(r=>r.tipo==="producto"),i=s.filter(r=>r.tipo!=="producto");if(t.length>0&&(t.forEach(r=>{const x=M.find(_=>_.nombre===r.titulo);if(x){const _={id:x.id,nombreProducto:x.nombre,productoIcono:x.icono,categoria:x.categoria,subcategoria:x.subcategoria,cantidad:x.stockActual||1,unidad:x.unidad,pesoTotal:(x.pesoUnitario||x.peso||0)*(x.stockActual||1),pesoUnidad:x.pesoUnitario||x.peso,temperatura:"ambiente",lote:x.lote,fechaCaducidad:x.fechaVencimiento,fechaEntrada:new Date().toISOString(),translations:{foodBank:a("labels.foodBank")||"BANQUE ALIMENTAIRE",productLabel:a("labels.productLabel")||"Étiquette du Produit",quantity:a("labels.quantity")||"QUANTITÉ",temperature:a("labels.temperature")||"TEMPÉRATURE",lot:a("labels.lot")||"LOT",expiryDate:a("labels.expiryDate")||"DATE D'EXPIRATION",weight:a("labels.weight")||"POIDS",program:a("labels.program")||"PROGRAMME",donor:a("labels.donor")||"DONATEUR",entryDate:a("labels.entryDate")||"DATE D'ENTRÉE",systemFooter:a("labels.systemFooter")||"Système de Gestion des Stocks",ambient:a("labels.ambient")||"Ambiant",refrigerated:a("labels.refrigerated")||"Réfrigéré",frozen:a("labels.frozen")||"Congelé"}};es(_).catch(Ve=>{console.error("Error al imprimir etiqueta:",Ve),h.error(`Error al imprimir ${x.nombre}`)})}}),h.success(`${t.length} ${a("labels.productLabels")} ${a("labels.printed")}`)),i.length===0)return;const l=window.open("","","width=800,height=600");if(!l){h.error(a("labels.couldNotOpenPrintWindow"));return}const $={pequena:{width:"6cm",height:"4cm"},mediana:{width:"10cm",height:"6cm"},grande:{width:"14cm",height:"8cm"}}[g];l.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Impression d'Étiquettes - Banque Alimentaire</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            @page {
              size: A4;
              margin: 1cm;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
            }
            
            .grid-etiquetas {
              display: grid;
              grid-template-columns: repeat(${Q}, 1fr);
              gap: 0.5cm;
              padding: 0.5cm;
            }
            
            .etiqueta {
              width: ${$.width};
              height: ${$.height};
              border: 2px solid #000;
              padding: 8px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              page-break-inside: avoid;
              background: white;
            }
            
            .etiqueta-header {
              text-align: center;
              border-bottom: 2px solid #ccc;
              padding-bottom: 4px;
              margin-bottom: 4px;
            }
            
            .etiqueta-titulo {
              font-weight: bold;
              font-size: ${g==="pequena"?"12px":g==="mediana"?"14px":"16px"};
              text-transform: uppercase;
              letter-spacing: 1px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            }
            
            .etiqueta-subtitulo {
              font-size: ${g==="pequena"?"9px":g==="mediana"?"10px":"12px"};
              color: #666;
              font-weight: 500;
            }
            
            .etiqueta-barcode {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 4px 0;
            }
            
            .etiqueta-footer {
              border-top: 2px solid #ccc;
              padding-top: 4px;
              font-size: ${g==="pequena"?"8px":g==="mediana"?"9px":"10px"};
            }
            
            .etiqueta-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 4px;
            }
            
            .etiqueta-info-item {
              font-size: ${g==="pequena"?"8px":g==="mediana"?"9px":"10px"};
            }
            
            .etiqueta-info-label {
              font-weight: bold;
            }
            
            .etiqueta-vencimiento {
              color: #dc3545;
              font-weight: bold;
            }
            
            .etiqueta-pie {
              text-align: center;
              margin-top: 4px;
              padding-top: 4px;
              border-top: 1px solid #e0e0e0;
              font-size: 7px;
              color: #999;
            }
            
            @media print {
              body {
                background: white;
              }
              
              .grid-etiquetas {
                page-break-after: avoid;
              }
              
              .etiqueta {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="grid-etiquetas">
            ${i.map(r=>`
              <div class="etiqueta">
                <div class="etiqueta-header">
                  <div class="etiqueta-titulo">
                    ${r.icono?`<span>${r.icono}</span>`:""}
                    <span>${r.titulo}</span>
                  </div>
                  ${r.subtitulo?`<div class="etiqueta-subtitulo">${r.subtitulo}</div>`:""}
                </div>
                
                <div class="etiqueta-barcode">
                  <svg id="barcode-${r.codigo}"></svg>
                </div>
                
                <div class="etiqueta-footer">
                  <div class="etiqueta-info">
                    ${r.categoria?`
                      <div class="etiqueta-info-item">
                        <span class="etiqueta-info-label">Categoría:</span>
                        <div>${r.categoria}</div>
                      </div>
                    `:""}
                    ${r.lote?`
                      <div class="etiqueta-info-item">
                        <span class="etiqueta-info-label">Lote:</span>
                        <div>${r.lote}</div>
                      </div>
                    `:""}
                    ${r.fechaVencimiento?`
                      <div class="etiqueta-info-item" style="grid-column: span 2;">
                        <span class="etiqueta-info-label">Vencimiento:</span>
                        <div class="etiqueta-vencimiento">${r.fechaVencimiento}</div>
                      </div>
                    `:""}
                    ${r.descripcion?`
                      <div class="etiqueta-info-item" style="grid-column: span 2; font-size: 8px; color: #666;">
                        ${r.descripcion}
                      </div>
                    `:""}
                  </div>
                  <div class="etiqueta-pie">
                    Banque Alimentaire - Système d'Inventaire
                  </div>
                </div>
              </div>
            `).join("")}
          </div>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"><\/script>
          <script>
            window.onload = function() {
              ${i.map(r=>`
                JsBarcode("#barcode-${r.codigo}", "${r.codigo}", {
                  format: "${J}",
                  width: ${g==="pequena"?1.2:g==="mediana"?1.8:2.5},
                  height: ${g==="pequena"?30:g==="mediana"?45:60},
                  displayValue: true,
                  fontSize: ${g==="pequena"?12:g==="mediana"?14:16},
                  margin: 0
                });
              `).join("")}
              
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `),l.document.close(),h.success(`Imprimiendo ${i.length} etiquetas`)};return e.jsxs("div",{className:"min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 relative overflow-hidden",style:{fontFamily:"Roboto, sans-serif",background:"linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)"},children:[e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse",style:{backgroundColor:o.primaryColor}}),e.jsx("div",{className:"absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse",style:{backgroundColor:o.secondaryColor}}),e.jsx("div",{className:"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl",style:{backgroundColor:o.primaryColor}})]}),e.jsxs("div",{className:"relative z-10 space-y-4 sm:space-y-6",children:[e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60",children:e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[o.logo?e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg border-2",style:{borderColor:o.primaryColor},children:e.jsx("img",{src:o.logo,alt:"Logo",className:"h-full w-full",style:{objectFit:"cover",objectPosition:"center"}})}):e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-white shadow-lg",style:{backgroundColor:o.primaryColor},children:e.jsx(X,{className:"w-6 h-6 sm:w-7 sm:h-7"})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h1",{className:"text-xl sm:text-2xl md:text-3xl font-bold tracking-tight",style:{fontFamily:"Montserrat, sans-serif",color:o.primaryColor},children:a("labels.title")}),e.jsx(We,{className:"w-5 h-5 sm:w-6 sm:h-6 animate-pulse",style:{color:o.secondaryColor}})]}),e.jsx("p",{className:"text-xs sm:text-sm text-[#666666] mt-1",children:a("labels.subtitle")})]})]}),e.jsxs("div",{className:"flex gap-2 w-full sm:w-auto",children:[e.jsxs(U,{open:Ne,onOpenChange:H,children:[e.jsx(Z,{asChild:!0,children:e.jsxs(p,{variant:"outline",className:"flex-1 sm:flex-none bg-white hover:shadow-lg transition-all duration-300",style:{fontFamily:"Montserrat, sans-serif",fontWeight:500},children:[e.jsx(ts,{className:"w-4 h-4 mr-2"}),a("labels.massGeneration")]})}),e.jsxs(B,{"aria-describedby":"mass-generation-description",children:[e.jsxs(O,{children:[e.jsx(V,{style:{fontFamily:"Montserrat, sans-serif",fontWeight:600},children:a("labels.generateMassLocations")}),e.jsx(G,{id:"mass-generation-description",children:a("labels.massGenerationDescription")})]}),e.jsxs("div",{className:"space-y-4 py-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.zone")}),e.jsxs(E,{value:C,onValueChange:ce,children:[e.jsx(k,{children:e.jsx(S,{placeholder:a("labels.selectZoneMessage")})}),e.jsx(q,{children:b.map(s=>e.jsxs(u,{value:s.zona,children:[a("labels.zone")," ",s.zona," - ",s.tipo," (",a("labels.max"),". ",s.cantidad,")"]},s.zona))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.labelQuantity")}),e.jsx(I,{type:"number",min:"1",max:b.find(s=>s.zona===C)?.cantidad||10,value:F,onChange:s=>de(parseInt(s.target.value)||1)}),e.jsxs("p",{className:"text-xs text-[#666666]",children:[a("labels.willGenerate")," ",C,"1 ",a("labels.until")," ",C,F]})]}),e.jsxs("div",{className:"flex justify-end gap-2 pt-4",children:[e.jsx(p,{variant:"outline",onClick:()=>H(!1),children:a("common.cancel")}),e.jsxs(p,{onClick:Pe,className:"text-white",style:{background:`linear-gradient(135deg, ${o.secondaryColor} 0%, ${o.secondaryColor}dd 100%)`,boxShadow:`0 4px 15px ${o.secondaryColor}40`},children:[a("labels.generate")," ",F," ",a("labels.labels")]})]})]})]})]}),e.jsxs(U,{open:Ce,onOpenChange:oe,children:[e.jsx(Z,{asChild:!0,children:e.jsxs(p,{className:"flex-1 sm:flex-none text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl",style:{fontFamily:"Montserrat, sans-serif",fontWeight:500,background:`linear-gradient(135deg, ${o.primaryColor} 0%, ${o.primaryColor}dd 100%)`,boxShadow:`0 4px 15px ${o.primaryColor}40`},children:[e.jsx(pe,{className:"w-4 h-4 mr-2"}),a("labels.newLabel")]})}),e.jsxs(B,{className:"max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin","aria-describedby":"new-label-description",children:[e.jsxs(O,{children:[e.jsx(V,{style:{fontFamily:"Montserrat, sans-serif",fontWeight:600},children:a("labels.createNewLabel")}),e.jsx(G,{id:"new-label-description",children:a("labels.selectLabelType")})]}),e.jsxs(Ye,{value:we,onValueChange:s=>ze(s),children:[e.jsxs(Ke,{className:"grid w-full grid-cols-2",children:[e.jsxs(je,{value:"ubicacion",children:[e.jsx(ee,{className:"w-4 h-4 mr-2"}),a("labels.location")]}),e.jsxs(je,{value:"producto",children:[e.jsx(ue,{className:"w-4 h-4 mr-2"}),a("labels.product")]})]}),e.jsxs(fe,{value:"ubicacion",className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx(j,{children:a("labels.zone")}),e.jsxs("div",{className:"flex gap-1",children:[e.jsxs(U,{open:Se,onOpenChange:s=>{P(s),s||(L(null),N({zona:"",tipo:"Estantería",cantidad:10}))},children:[e.jsx(Z,{asChild:!0,children:e.jsxs(p,{variant:"ghost",size:"sm",className:"h-7 px-2",style:{color:o.secondaryColor},children:[e.jsx(pe,{className:"w-3 h-3 mr-1"}),"Nouvelle zone"]})}),e.jsxs(B,{"aria-describedby":"zone-form-description",children:[e.jsxs(O,{children:[e.jsx(V,{style:{fontFamily:"Montserrat, sans-serif",fontWeight:600},children:z?"Modifier la zone":"Créer une nouvelle zone"}),e.jsx(G,{id:"zone-form-description",children:z?"Modifier les détails de la zone":"Ajouter une nouvelle zone d'entreposage"})]}),e.jsxs("div",{className:"space-y-4 py-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:"Code de la zone"}),e.jsx(I,{placeholder:"Ex: F, G, H...",value:c.zona,onChange:s=>N({...c,zona:s.target.value.toUpperCase()}),maxLength:2}),e.jsx("p",{className:"text-xs text-[#666666]",children:"Utiliser 1-2 caractères (A-Z)"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:"Type d'emplacement"}),e.jsxs(E,{value:c.tipo,onValueChange:s=>N({...c,tipo:s}),children:[e.jsx(k,{children:e.jsx(S,{})}),e.jsxs(q,{children:[e.jsx(u,{value:"Estantería",children:"Étagère"}),e.jsx(u,{value:"Cámara Fría",children:"Chambre froide"}),e.jsx(u,{value:"Congelador",children:"Congélateur"}),e.jsx(u,{value:"Almacén Seco",children:"Entrepôt sec"}),e.jsx(u,{value:"Zona de Carga",children:"Zone de chargement"}),e.jsx(u,{value:"Área de Clasificación",children:"Zone de tri"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:"Capacité maximum d'emplacements"}),e.jsx(I,{type:"number",min:"1",max:"999",value:c.cantidad,onChange:s=>N({...c,cantidad:parseInt(s.target.value)||1})}),e.jsx("p",{className:"text-xs text-[#666666]",children:"Nombre maximum d'emplacements dans cette zone"})]}),c.zona&&e.jsxs("div",{className:"p-4 rounded-lg border-2",style:{backgroundColor:`${o.secondaryColor}10`,borderColor:`${o.secondaryColor}30`},children:[e.jsx("p",{className:"text-sm text-[#666666] mb-2",children:"Aperçu:"}),e.jsxs("p",{className:"font-bold text-lg",style:{color:o.secondaryColor},children:["Zone ",c.zona," - ",c.tipo]}),e.jsxs("p",{className:"text-xs text-[#666666]",children:["Emplacements: ",c.zona,"1 à ",c.zona,c.cantidad]})]}),e.jsxs("div",{className:"flex justify-end gap-2 pt-4",children:[e.jsx(p,{variant:"outline",onClick:()=>{P(!1),L(null),N({zona:"",tipo:"Estantería",cantidad:10})},children:a("common.cancel")}),e.jsx(p,{onClick:z?Me:Ie,className:"text-white",style:{background:`linear-gradient(135deg, ${o.secondaryColor} 0%, ${o.secondaryColor}dd 100%)`,boxShadow:`0 4px 15px ${o.secondaryColor}40`},children:z?"Enregistrer":"Créer la zone"})]})]})]})]}),e.jsxs(U,{open:qe,onOpenChange:Y,children:[e.jsx(Z,{asChild:!0,children:e.jsxs(p,{variant:"ghost",size:"sm",className:"h-7 px-2",style:{color:o.primaryColor},children:[e.jsx(ls,{className:"w-3 h-3 mr-1"}),"Gérer"]})}),e.jsxs(B,{className:"max-w-2xl","aria-describedby":"manage-zones-description",children:[e.jsxs(O,{children:[e.jsx(V,{style:{fontFamily:"Montserrat, sans-serif",fontWeight:600},children:"Gérer les zones d'entreposage"}),e.jsxs(G,{id:"manage-zones-description",children:[b.length," zone",b.length!==1?"s":""," disponible",b.length!==1?"s":""]})]}),e.jsx("div",{className:"space-y-2 py-4 max-h-[500px] overflow-y-auto",children:b.length===0?e.jsxs("div",{className:"text-center py-8 text-[#999999]",children:[e.jsx(ee,{className:"w-12 h-12 mx-auto mb-3 opacity-50"}),e.jsx("p",{children:"Aucune zone créée"}),e.jsx("p",{className:"text-sm",children:'Cliquez sur "Nouvelle zone" pour commencer'})]}):b.map(s=>e.jsxs("div",{className:"flex items-center justify-between p-4 rounded-lg border hover:shadow-md transition-shadow",style:{borderColor:"#e9ecef"},children:[e.jsx("div",{className:"flex-1",children:e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl",style:{background:`linear-gradient(135deg, ${o.primaryColor} 0%, ${o.primaryColor}dd 100%)`},children:s.zona}),e.jsxs("div",{children:[e.jsxs("p",{className:"font-semibold text-[#333333]",style:{fontFamily:"Montserrat, sans-serif"},children:["Zone ",s.zona]}),e.jsx("p",{className:"text-sm text-[#666666]",children:s.tipo}),e.jsxs("p",{className:"text-xs text-[#999999]",children:[s.cantidad," emplacement",s.cantidad!==1?"s":""," (",s.zona,"1 à ",s.zona,s.cantidad,")"]})]})]})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsxs(p,{variant:"ghost",size:"sm",onClick:()=>Le(s.zona),style:{color:o.secondaryColor},children:[e.jsx(He,{className:"w-4 h-4 mr-1"}),"Modifier"]}),e.jsxs(p,{variant:"ghost",size:"sm",onClick:()=>Te(s.zona),className:"text-red-600 hover:text-red-700 hover:bg-red-50",children:[e.jsx(ge,{className:"w-4 h-4 mr-1"}),"Supprimer"]})]})]},s.zona))}),e.jsx("div",{className:"flex justify-end pt-4 border-t",children:e.jsx(p,{variant:"outline",onClick:()=>Y(!1),children:"Fermer"})})]})]})]})]}),e.jsxs(E,{value:y,onValueChange:te,children:[e.jsx(k,{children:e.jsx(S,{placeholder:a("labels.selectZone")})}),e.jsx(q,{children:b.map(s=>e.jsxs(u,{value:s.zona,children:[a("labels.zone")," ",s.zona," - ",s.tipo]},s.zona))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.number")}),e.jsx(I,{type:"number",min:"1",placeholder:"1",value:A,onChange:s=>le(s.target.value)})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.descriptionOptional")}),e.jsx(I,{placeholder:a("labels.descriptionPlaceholder"),value:ie,onChange:s=>re(s.target.value)})]}),y&&A&&e.jsxs("div",{className:"p-4 rounded-lg border-2",style:{backgroundColor:`${o.primaryColor}10`,borderColor:`${o.primaryColor}30`},children:[e.jsxs("p",{className:"text-sm text-[#666666] mb-2",children:[a("labels.preview"),":"]}),e.jsxs("p",{className:"font-bold text-lg",style:{color:o.primaryColor},children:[y,A]}),e.jsxs("p",{className:"text-xs text-[#666666]",children:[a("labels.code"),": ",se(`${y}${A}`)]})]}),e.jsxs("div",{className:"flex justify-end gap-2 pt-4",children:[e.jsx(p,{variant:"outline",onClick:T,children:a("common.cancel")}),e.jsx(p,{onClick:Fe,className:"text-white",style:{background:`linear-gradient(135deg, ${o.secondaryColor} 0%, ${o.secondaryColor}dd 100%)`,boxShadow:`0 4px 15px ${o.secondaryColor}40`},children:a("labels.createLabel")})]})]}),e.jsxs(fe,{value:"producto",className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.product")}),e.jsxs(E,{value:D,onValueChange:ne,children:[e.jsx(k,{children:e.jsx(S,{placeholder:a("labels.selectProduct")})}),e.jsx(q,{children:M.map(s=>e.jsxs(u,{value:s.id,children:[s.nombre," (",s.codigo,")"]},s.id))})]})]}),D&&(()=>{const s=M.find(t=>t.id===D);return s?e.jsxs("div",{className:"p-4 rounded-lg space-y-2 border-2",style:{backgroundColor:`${o.primaryColor}10`,borderColor:`${o.primaryColor}30`},children:[e.jsxs("p",{className:"text-sm text-[#666666]",children:[a("labels.preview"),":"]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("span",{className:"text-3xl",children:s.icono||R[s.categoria]?.icono||"📦"}),e.jsxs("div",{children:[e.jsx("p",{className:"font-bold text-lg",children:s.nombre}),e.jsxs("p",{className:"text-sm text-[#666666]",children:[a("labels.code"),": ",s.codigo]}),e.jsxs("p",{className:"text-xs text-[#666666]",children:[a("labels.category"),": ",s.categoria]}),s.lote&&e.jsxs("p",{className:"text-xs text-[#666666]",children:[a("labels.lot"),": ",s.lote]})]})]})]}):null})(),e.jsxs("div",{className:"flex justify-end gap-2 pt-4",children:[e.jsx(p,{variant:"outline",onClick:T,children:a("common.cancel")}),e.jsx(p,{onClick:De,className:"text-white",style:{background:`linear-gradient(135deg, ${o.secondaryColor} 0%, ${o.secondaryColor}dd 100%)`,boxShadow:`0 4px 15px ${o.secondaryColor}40`},children:a("labels.createLabel")})]})]})]})]})]})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",children:[e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl",style:{borderLeftColor:o.primaryColor,boxShadow:`0 4px 15px ${o.primaryColor}20`},children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:a("labels.totalLabels")}),e.jsx("p",{className:"font-bold text-2xl",style:{color:o.primaryColor},children:n.length})]}),e.jsx(X,{className:"w-10 h-10 opacity-20",style:{color:o.primaryColor}})]})}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl",style:{borderLeftColor:o.secondaryColor,boxShadow:`0 4px 15px ${o.secondaryColor}20`},children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:a("labels.locations")}),e.jsx("p",{className:"font-bold text-2xl",style:{color:o.secondaryColor},children:n.filter(s=>s.tipo==="ubicacion").length})]}),e.jsx(ee,{className:"w-10 h-10 opacity-20",style:{color:o.secondaryColor}})]})}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#FFC107] transition-all duration-300 hover:scale-105 hover:shadow-2xl",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:a("labels.products")}),e.jsx("p",{className:"font-bold text-2xl text-[#FFC107]",children:n.filter(s=>s.tipo==="producto").length})]}),e.jsx(ue,{className:"w-10 h-10 text-[#FFC107] opacity-20"})]})}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#DC3545] transition-all duration-300 hover:scale-105 hover:shadow-2xl",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:a("labels.selected")}),e.jsx("p",{className:"font-bold text-2xl text-[#DC3545]",children:m.length})]}),e.jsx(Je,{className:"w-10 h-10 text-[#DC3545] opacity-20"})]})})]}),e.jsxs("div",{className:"backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-bold mb-4",style:{fontFamily:"Montserrat, sans-serif",color:o.primaryColor},children:a("labels.printConfiguration")}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.labelSize")}),e.jsxs(E,{value:g,onValueChange:s=>$e(s),children:[e.jsx(k,{children:e.jsx(S,{})}),e.jsxs(q,{children:[e.jsxs(u,{value:"pequena",children:[a("labels.small")," (6x4 cm)"]}),e.jsxs(u,{value:"mediana",children:[a("labels.medium")," (10x6 cm)"]}),e.jsxs(u,{value:"grande",children:[a("labels.large")," (14x8 cm)"]})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.codeFormat")}),e.jsxs(E,{value:J,onValueChange:s=>Ee(s),children:[e.jsx(k,{children:e.jsx(S,{})}),e.jsxs(q,{children:[e.jsx(u,{value:"CODE128",children:"CODE128"}),e.jsx(u,{value:"EAN13",children:"EAN-13"}),e.jsx(u,{value:"CODE39",children:"CODE39"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:a("labels.printColumns")}),e.jsxs(E,{value:Q.toString(),onValueChange:s=>ke(parseInt(s)),children:[e.jsx(k,{children:e.jsx(S,{})}),e.jsxs(q,{children:[e.jsxs(u,{value:"1",children:["1 ",a("labels.column")]}),e.jsxs(u,{value:"2",children:["2 ",a("labels.columns")]}),e.jsxs(u,{value:"3",children:["3 ",a("labels.columns")]}),e.jsxs(u,{value:"4",children:["4 ",a("labels.columns")]})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(j,{children:" "}),e.jsxs(p,{onClick:()=>ye(!W),variant:"outline",className:"w-full",children:[e.jsx(Qe,{className:"w-4 h-4 mr-2"}),a(W?"labels.hide":"labels.viewPreview")]})]})]})]}),n.length>0&&e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60",children:e.jsxs("div",{className:"flex flex-wrap items-center gap-3",children:[e.jsx(ve,{id:"select-all",checked:m.length===n.length,onCheckedChange:Ue}),e.jsxs(j,{htmlFor:"select-all",className:"cursor-pointer font-medium",children:[a("labels.selectAll")," (",n.length,")"]}),m.length>0&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"h-6 w-px bg-gray-300 mx-2"}),e.jsxs(be,{className:"text-white",style:{backgroundColor:o.primaryColor},children:[m.length," ",a("labels.selected")]}),e.jsxs(p,{variant:"outline",size:"sm",onClick:Be,children:[e.jsx(is,{className:"w-4 h-4 mr-1"}),a("labels.duplicate")]}),e.jsxs(p,{variant:"outline",size:"sm",onClick:Ze,className:"text-[#DC3545] border-[#DC3545] hover:bg-red-50",children:[e.jsx(ge,{className:"w-4 h-4 mr-1"}),a("labels.delete")]})]}),e.jsx("div",{className:"flex-1"}),e.jsxs(p,{onClick:Oe,className:"text-white",style:{fontFamily:"Montserrat, sans-serif",fontWeight:500,background:`linear-gradient(135deg, ${o.secondaryColor} 0%, ${o.secondaryColor}dd 100%)`,boxShadow:`0 4px 15px ${o.secondaryColor}40`},children:[e.jsx(rs,{className:"w-4 h-4 mr-2"}),a("labels.print")," ",m.length>0?`${m.length} `:a("labels.printAll")]})]})}),W&&n.length>0&&e.jsxs("div",{className:"backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60",children:[e.jsx("h2",{className:"text-lg sm:text-xl font-bold mb-4",style:{fontFamily:"Montserrat, sans-serif",color:o.primaryColor},children:a("labels.previewLabels")}),e.jsx(cs,{etiquetas:m.length>0?m.map(s=>n[s]):n,tamano:g,formato:J,columnas:Q})]}),e.jsxs("div",{className:"backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60",children:[e.jsxs("h2",{className:"text-lg sm:text-xl font-bold mb-4",style:{fontFamily:"Montserrat, sans-serif",color:o.primaryColor},children:[a("labels.createdLabels")," (",n.length,")"]}),n.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(X,{className:"w-16 h-16 text-[#CCCCCC] mx-auto mb-4"}),e.jsx("p",{className:"text-[#666666] mb-2",children:a("labels.noLabelsCreated")}),e.jsx("p",{className:"text-sm text-[#999999]",children:a("labels.createFirstLabel")})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",children:n.map((s,t)=>e.jsx("div",{className:`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${m.includes(t)?"bg-blue-50":""}`,style:{borderColor:m.includes(t)?o.primaryColor:"#e5e7eb"},onClick:()=>he(t),children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(ve,{checked:m.includes(t),onCheckedChange:()=>he(t),onClick:i=>i.stopPropagation()}),e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("span",{className:"text-2xl",children:s.icono}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-bold text-sm",children:s.titulo}),s.subtitulo&&e.jsx("p",{className:"text-xs text-[#666666]",children:s.subtitulo})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(be,{variant:"outline",className:"text-xs",children:s.tipo==="ubicacion"?"📍 Ubicación":"📦 Producto"}),e.jsx("p",{className:"text-xs font-mono bg-gray-100 px-2 py-1 rounded",children:s.codigo}),s.descripcion&&e.jsx("p",{className:"text-xs text-[#666666] line-clamp-2",children:s.descripcion})]})]})]})},t))})]})]})]})}export{qs as Etiquetas};
