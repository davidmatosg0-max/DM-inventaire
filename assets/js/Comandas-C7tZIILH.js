const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./GuiaPermisoCamara-Cs636Oca.js","./react-vendor-CmVymGNF.js","./camera-BjaayhAd.js","./index-Dyd20qEu.js","./i18n-vendor-BBIw8LEr.js","./ui-vendor-diR8f5pA.js","./utils-vendor-V93zgBl7.js","../index-U5IjMUlY.css","./index-2SlHBN_i.js"])))=>i.map(i=>d[i]);
import{r as d,j as e}from"./react-vendor-CmVymGNF.js";import{C as Z,c as ee}from"./card-lgwQ9pjG.js";import{G as ms,z as Fe,B as y,a9 as Gs,F as Qs,h as te,t as b,L as ye,x as xs,I as _e,V as Vs,X as Qe,aa as we,J as Us,ad as Ce,$ as Hs,aj as Ws,ak as je,al as as,am as Be,ai as us,u as Ys,W as ue,w as Js,H as Ks,E as Pe,k as ts,l as rs,m as os,n as ns,p as $,U as Xs,C as Zs,M as ea,an as is,ag as se}from"./index-Dyd20qEu.js";import{D as Ae,b as Se,c as De,d as ke,e as Oe}from"./dialog-CNPPzmbc.js";import{T as hs,a as ps,b as Te,c as k,d as gs,e as O}from"./table-Df7aLUMV.js";import{a as Ge,m as sa}from"./mockData-EVDosvtz.js";import{C as ls}from"./checkbox-BfWggCgE.js";import{T as aa,a as ta,b as ze,c as Ie}from"./tabs-CSlVt_OC.js";import{M as ra,B as oa}from"./ModeloComanda-G5w9d9JA.js";import{A as na}from"./AlertaComandasUrgentes-Cn7IdOCR.js";import{E as ia,a as la}from"./jspdf.plugin.autotable-nQNpG9DT.js";import{c as da}from"./distributionValue-DnW3nsDB.js";import{f as q,a as ae,c as he}from"./formatUtils-CF2cE4Lz.js";import{s as fs}from"./temperatureSort-BMfZlDBj.js";import{P as Ee}from"./printer-CxVB6nVG.js";import{Q as ca}from"./browser-63KU28Fv.js";import{T as ma}from"./textarea-BsJjyXzf.js";import{S as xa}from"./send-BVLjT9Wc.js";import{C as Me}from"./circle-help-yzp-1iQt.js";import{C as ua}from"./circle-x-Cov12mFA.js";import{C as qe}from"./camera-BjaayhAd.js";import{a as ha}from"./searchUtils-1gX0SsW3.js";import{o as pa,a as ga,r as fa,m as ba,b as va}from"./ofertaStorage-DBuUnHWD.js";import{O as ja}from"./OfertasDisponibles-C8PUuDTr.js";import{u as Na}from"./i18n-vendor-BBIw8LEr.js";import{F as Ne}from"./file-check-Bgw0Jy1M.js";import{U as ds}from"./utensils-BaIUJiJI.js";import"./ui-vendor-diR8f5pA.js";import"./utils-vendor-V93zgBl7.js";import"./index-CIkwtrwz.js";import"./clipboard-CfUd8LX3.js";import"./copy-CD5N2VFg.js";import"./external-link-EqeV6yqR.js";import"./circle-check-BdaLfdMT.js";import"./personasResponsablesStorage-Z1akBaa8.js";import"./thermometer-CbxZJAN5.js";import"./sun-CCg_amH9.js";import"./excel-zip-n3Pgozwg.js";import"./categoriaStorage-SPzxyxEK.js";import"./recetaStorage-9y1r6ul3.js";import"./user-BJHnuf71.js";function Le(s,x){return new Date(s).toLocaleDateString(x||"fr",{year:"numeric",month:"2-digit",day:"2-digit"})}function ya({open:s,onOpenChange:x,comandas:i,currentLocale:f}){const c=d.useMemo(()=>{const n=ms(),l=[...n,...Ge.filter(p=>!n.some(m=>m.id===p.id))],h=new Map(l.map(p=>[p.id,p])),D=new Map;i.forEach(p=>{(p.items||[]).forEach(m=>{const B=Number(m.cantidadAceptada||m.cantidadPreparada||m.cantidad||0);if(B<=0)return;const T=h.get(m.productoId),_=da(T,B),P=m.nombreProducto||m.productoNombre||T?.nombre||m.productoId,v=m.unidad||T?.unidad||"unidad",z=m.icono||T?.icono||"📦",re=m.temperaturaAlmacenamiento||m.temperatura||T?.temperaturaAlmacenamiento||T?.temperatura,G=p.numero||p.numeroComanda||p.id,R=p.nombreOrganismo||"Sin organismo",Q=p.fechaEntrega||p.fecha,N=D.get(m.productoId);if(N){N.cantidadTotal+=B,N.pesoTotal+=_.pesoTotal,N.valorTotal+=_.valorTotal,N.organismos.includes(R)||N.organismos.push(R),N.comandas.includes(G)||N.comandas.push(G),new Date(Q)>new Date(N.ultimaFecha)&&(N.ultimaFecha=Q);return}D.set(m.productoId,{productoId:m.productoId,nombreProducto:P,unidad:v,icono:z,cantidadTotal:B,pesoTotal:_.pesoTotal,valorTotal:_.valorTotal,organismos:[R],comandas:[G],ultimaFecha:Q,temperatura:re})})});const L=fs(Array.from(D.values()),p=>p.temperatura,(p,m)=>m.cantidadTotal-p.cantidadTotal);return{productos:L,totalComandas:i.length,totalProductos:L.length,totalCantidad:L.reduce((p,m)=>p+m.cantidadTotal,0),totalPeso:L.reduce((p,m)=>p+m.pesoTotal,0),totalValor:L.reduce((p,m)=>p+m.valorTotal,0)}},[i]),E=()=>{if(c.productos.length===0){b.error("Aucun produit distribué à imprimer");return}const n=window.open("","_blank","width=1200,height=800");if(!n){b.error("Impossible d’ouvrir la fenêtre d’impression");return}const l=c.productos.map(h=>`
      <tr>
        <td>${h.icono} ${h.nombreProducto}</td>
        <td style="text-align:center;">${q(h.cantidadTotal)} ${h.unidad}</td>
        <td style="text-align:center;">${q(h.pesoTotal)} kg</td>
        <td style="text-align:right;">CAD$ ${ae(h.valorTotal)}</td>
        <td>${h.organismos.join(", ")}</td>
        <td style="text-align:center;">${h.comandas.length}</td>
        <td style="text-align:center;">${Le(h.ultimaFecha,f)}</td>
      </tr>
    `).join("");n.document.write(`
      <html>
        <head>
          <title>Liste Produits Distribués</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1f2937; }
            h1 { margin: 0 0 8px; color: #1E73BE; }
            p { margin: 0 0 16px; }
            .resume { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
            .card { border: 1px solid #dbe3ea; border-radius: 12px; padding: 12px; background: #f8fbff; }
            .label { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
            .value { font-size: 20px; font-weight: 700; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #dbe3ea; padding: 10px; font-size: 12px; vertical-align: top; }
            th { background: #1E73BE; color: white; text-align: left; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Liste des produits distribués</h1>
          <p>Comandes incluses: ${c.totalComandas} | Produits: ${c.totalProductos} | Généré le: ${new Date().toLocaleDateString(f||"fr")}</p>
          <div class="resume">
            <div class="card"><div class="label">Quantité totale</div><div class="value">${q(c.totalCantidad)}</div></div>
            <div class="card"><div class="label">Poids total</div><div class="value">${q(c.totalPeso)} kg</div></div>
            <div class="card"><div class="label">Valeur totale</div><div class="value">CAD$ ${ae(c.totalValor)}</div></div>
            <div class="card"><div class="label">Produits distincts</div><div class="value">${c.totalProductos}</div></div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Poids</th>
                <th>Valeur</th>
                <th>Organismes</th>
                <th>Comandes</th>
                <th>Dernière date</th>
              </tr>
            </thead>
            <tbody>${l}</tbody>
          </table>
        </body>
      </html>
    `),n.document.close(),n.focus(),n.print()},A=()=>{if(c.productos.length===0){b.error("Aucun produit distribué à exporter");return}const n=new ia({orientation:"landscape"});n.setFontSize(18),n.text("Liste des produits distribués",14,18),n.setFontSize(10),n.text(`Comandes incluses: ${c.totalComandas} | Généré le: ${new Date().toLocaleDateString(f||"fr")}`,14,26),n.text(`Quantité: ${q(c.totalCantidad)} | Poids: ${q(c.totalPeso)} kg | Valeur: CAD$ ${ae(c.totalValor)}`,14,32),la(n,{startY:38,head:[["Produit","Quantité","Poids","Valeur","Organismes","Comandes","Dernière date"]],body:c.productos.map(l=>[`${l.icono} ${l.nombreProducto}`,`${q(l.cantidadTotal)} ${l.unidad}`,`${q(l.pesoTotal)} kg`,`CAD$ ${ae(l.valorTotal)}`,l.organismos.join(", "),String(l.comandas.length),Le(l.ultimaFecha,f)]),theme:"grid",styles:{fontSize:8,cellPadding:3,valign:"middle"},headStyles:{fillColor:[30,115,190],textColor:255,fontStyle:"bold"},columnStyles:{0:{cellWidth:52},1:{cellWidth:26,halign:"center"},2:{cellWidth:24,halign:"center"},3:{cellWidth:26,halign:"right"},4:{cellWidth:72},5:{cellWidth:20,halign:"center"},6:{cellWidth:24,halign:"center"}}}),n.save(`Liste_Produits_Distribues_${Date.now()}.pdf`)};return e.jsx(Ae,{open:s,onOpenChange:x,children:e.jsxs(Se,{className:"max-w-6xl max-h-[90vh] overflow-y-auto","aria-describedby":"liste-produits-distribues-description",children:[e.jsxs(De,{children:[e.jsxs(ke,{className:"flex items-center gap-2",style:{fontFamily:"Montserrat, sans-serif"},children:[e.jsx(Fe,{className:"w-5 h-5 text-[#1E73BE]"}),"Liste des produits distribués"]}),e.jsx(Oe,{id:"liste-produits-distribues-description",children:"Résumé consolidé des produits présents dans les commandes filtrées."})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex flex-wrap gap-2 justify-end",children:[e.jsxs(y,{variant:"outline",onClick:E,disabled:c.productos.length===0,children:[e.jsx(Ee,{className:"w-4 h-4 mr-2"}),"Imprimer"]}),e.jsxs(y,{onClick:A,disabled:c.productos.length===0,className:"bg-[#1E73BE] hover:bg-[#175a95]",children:[e.jsx(Gs,{className:"w-4 h-4 mr-2"}),"PDF"]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-3",children:[e.jsx(Z,{children:e.jsxs(ee,{className:"pt-6",children:[e.jsx("p",{className:"text-sm text-[#666666]",children:"Comandes incluses"}),e.jsx("p",{className:"text-2xl font-bold text-[#1E73BE]",children:c.totalComandas})]})}),e.jsx(Z,{children:e.jsxs(ee,{className:"pt-6",children:[e.jsx("p",{className:"text-sm text-[#666666]",children:"Produits distincts"}),e.jsx("p",{className:"text-2xl font-bold text-[#2E7D32]",children:c.totalProductos})]})}),e.jsx(Z,{children:e.jsxs(ee,{className:"pt-6",children:[e.jsx("p",{className:"text-sm text-[#666666]",children:"Quantité totale"}),e.jsx("p",{className:"text-2xl font-bold text-[#F57C00]",children:q(c.totalCantidad)})]})}),e.jsx(Z,{children:e.jsxs(ee,{className:"pt-6",children:[e.jsx("p",{className:"text-sm text-[#666666]",children:"Valeur totale"}),e.jsxs("p",{className:"text-2xl font-bold text-[#FFC107]",children:["CAD$ ",ae(c.totalValor)]})]})})]}),c.productos.length===0?e.jsxs("div",{className:"rounded-xl border border-dashed border-gray-300 p-8 text-center text-[#666666]",children:[e.jsx(Qs,{className:"w-10 h-10 mx-auto mb-3 opacity-50"}),"Aucune commande avec produits distribués dans le filtre actuel."]}):e.jsx("div",{className:"rounded-xl border bg-white",children:e.jsxs(hs,{children:[e.jsx(ps,{children:e.jsxs(Te,{children:[e.jsx(k,{children:"Produit"}),e.jsx(k,{className:"text-center",children:"Quantité"}),e.jsx(k,{className:"text-center",children:"Poids"}),e.jsx(k,{className:"text-right",children:"Valeur"}),e.jsx(k,{children:"Organismes"}),e.jsx(k,{className:"text-center",children:"Comandes"}),e.jsx(k,{className:"text-center",children:"Dernière date"})]})}),e.jsx(gs,{children:c.productos.map(n=>e.jsxs(Te,{children:[e.jsx(O,{children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xl",children:n.icono}),e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-[#333333]",children:n.nombreProducto}),e.jsx("p",{className:"text-xs text-[#666666]",children:n.productoId})]})]})}),e.jsxs(O,{className:"text-center font-semibold",children:[q(n.cantidadTotal)," ",n.unidad]}),e.jsxs(O,{className:"text-center",children:[q(n.pesoTotal)," kg"]}),e.jsxs(O,{className:"text-right font-semibold text-[#2E7D32]",children:["CAD$ ",ae(n.valorTotal)]}),e.jsx(O,{children:e.jsxs("div",{className:"flex flex-wrap gap-1",children:[n.organismos.slice(0,2).map(l=>e.jsx(te,{variant:"outline",className:"text-xs",children:l},`${n.productoId}-${l}`)),n.organismos.length>2&&e.jsxs(te,{variant:"secondary",className:"text-xs",children:["+",n.organismos.length-2]})]})}),e.jsx(O,{className:"text-center",children:n.comandas.length}),e.jsx(O,{className:"text-center",children:Le(n.ultimaFecha,f)})]},n.productoId))})]})})]})]})})}async function wa(s){const x={foodBank:s.translations?.foodBank||"BANQUE ALIMENTAIRE",orderLabel:s.translations?.orderLabel||"Étiquette de Commande",orderNumber:s.translations?.orderNumber||"N° Commande",deliveryDate:s.translations?.deliveryDate||"Livraison",status:s.translations?.status||"Statut",products:s.translations?.products||"Produits",articles:s.translations?.articles||"articles",recipient:s.translations?.recipient||"Organisme Destinataire",name:s.translations?.name||"Nom",type:s.translations?.type||"Type",address:s.translations?.address||"Adresse",responsible:s.translations?.responsible||"Responsable",phone:s.translations?.phone||"Téléphone",observations:s.translations?.observations||"Observations",deliveredBy:s.translations?.deliveredBy||"Remis par",receivedBy:s.translations?.receivedBy||"Reçu par",nameAndSignature:s.translations?.nameAndSignature||"Nom et signature",printedOn:s.translations?.printedOn||"Imprimé le",systemFooter:s.translations?.systemFooter||"Système de Gestion des Commandes",pending:s.translations?.pending||"EN ATTENTE",inPreparation:s.translations?.inPreparation||"EN PRÉPARATION",ready:s.translations?.ready||"PRÊTE",delivered:s.translations?.delivered||"LIVRÉE",cancelled:s.translations?.cancelled||"ANNULÉE"},i=JSON.stringify({comanda:s.numeroComanda,organismo:s.organismoNombre,fecha:s.fechaEntrega,items:s.items.length});let f="";try{f=await ca.toDataURL(i,{width:140,margin:1,errorCorrectionLevel:"H",color:{dark:"#1E73BE",light:"#FFFFFF"}})}catch(l){console.error("Error generando QR:",l)}const c={pendiente:{label:x.pending,color:"#FFC107"},en_preparacion:{label:x.inPreparation,color:"#1E73BE"},completada:{label:x.ready,color:"#4CAF50"},entregada:{label:x.delivered,color:"#4CAF50"},anulada:{label:x.cancelled,color:"#DC3545"}},E=c[s.estado]||c.pendiente;s.items.reduce((l,h)=>l+(h.peso||0)*h.cantidad,0);const A=l=>new Date(l).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}),n=l=>l.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${x.orderLabel} - ${s.numeroComanda}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: 0.4in 0.5in;
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
      border-radius: 10px;
      overflow: hidden;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* HEADER */
    .etiqueta-header {
      background: white;
      padding: 12px 16px;
      text-align: center;
      border-bottom: 3px solid #1E73BE;
    }
    
    .etiqueta-header h1 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 24px;
      color: #1E73BE;
      margin: 0 0 2px 0;
      letter-spacing: 0.5px;
    }
    
    .etiqueta-header p {
      font-family: 'Roboto', sans-serif;
      font-size: 12px;
      color: #666666;
      margin: 0;
    }
    
    /* GRID SUPERIOR - QR + PRODUCTOS */
    .grid-superior {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 12px 16px;
      background: #FAFAFA;
    }
    
    .qr-section {
      background: white;
      border: 2px solid #1E73BE;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .qr-section img {
      width: 120px;
      height: 120px;
      display: block;
    }
    
    .qr-id {
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 10px;
      color: #1E73BE;
      margin-top: 6px;
    }
    
    .productos-box {
      background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
      border: 2px solid #4CAF50;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    
    .productos-box .icon {
      font-size: 28px;
      margin-bottom: 4px;
    }
    
    .productos-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .productos-box .number {
      font-family: 'Montserrat', sans-serif;
      font-size: 48px;
      font-weight: 700;
      color: #4CAF50;
      line-height: 1;
    }
    
    .productos-box .sublabel {
      font-family: 'Roboto', sans-serif;
      font-size: 11px;
      color: #666666;
      font-weight: 500;
    }
    
    /* GRID COMANDA + ESTADO */
    .grid-comanda {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      padding: 0 16px 12px 16px;
      background: #FAFAFA;
    }
    
    .comanda-box {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      border-radius: 6px;
      padding: 12px;
      text-align: center;
    }
    
    .comanda-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.9);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .comanda-box .number {
      font-family: 'Montserrat', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: white;
      letter-spacing: 1px;
    }
    
    .estado-box {
      background: white;
      border: 2px solid #E0E0E0;
      border-radius: 6px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .estado-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    
    .estado-badge {
      font-family: 'Montserrat', sans-serif;
      font-size: 13px;
      font-weight: 700;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      background: ${E.color};
    }
    
    /* FECHA ENTREGA */
    .fecha-entrega-section {
      background: linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%);
      border-top: 3px solid #FFC107;
      border-bottom: 3px solid #FFC107;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .fecha-entrega-section .icon {
      font-size: 24px;
    }
    
    .fecha-entrega-section .content {
      flex: 1;
    }
    
    .fecha-entrega-section .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 9px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .fecha-entrega-section .fecha {
      font-family: 'Montserrat', sans-serif;
      font-size: 20px;
      font-weight: 700;
      color: #333333;
    }
    
    .fecha-entrega-section .hora {
      font-family: 'Roboto', sans-serif;
      font-size: 11px;
      color: #666666;
      font-weight: 500;
    }
    
    /* ORGANISMO */
    .organismo-section {
      background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
      border-bottom: 2px solid #1E73BE;
      padding: 10px 16px;
    }
    
    .organismo-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: #1E73BE;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .organismo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    
    .organismo-field {
      background: white;
      border-left: 3px solid #1E73BE;
      padding: 6px 8px;
      border-radius: 3px;
    }
    
    .organismo-field.full {
      grid-column: span 2;
    }
    
    .organismo-field .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 600;
      color: #666666;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    
    .organismo-field .value {
      font-family: 'Roboto', sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: #333333;
    }
    
    .organismo-field .value.highlight {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      color: #1E73BE;
      font-size: 12px;
    }
    
    /* LISTA DE PRODUCTOS */
    .productos-list-section {
      display: none; /* Ocultar lista detallada */
    }
    
    /* PESO TOTAL */
    .peso-section {
      display: none; /* Ocultar peso total */
    }
    
    /* OBSERVACIONES */
    .observaciones-section {
      display: none; /* Ocultar observaciones */
    }
    
    /* FIRMAS */
    .firmas-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 10px 16px;
      background: white;
      border-bottom: 1px solid #E0E0E0;
    }
    
    .firma-box {
      border-top: 2px solid #E0E0E0;
      padding-top: 6px;
    }
    
    .firma-box .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 600;
      color: #666666;
      margin-bottom: 3px;
    }
    
    .firma-line {
      border-bottom: 2px dashed #999999;
      height: 30px;
      margin-bottom: 2px;
    }
    
    .firma-box .sublabel {
      font-family: 'Roboto', sans-serif;
      font-size: 7px;
      color: #999999;
      font-style: italic;
      text-align: center;
    }
    
    /* FOOTER */
    .etiqueta-footer {
      background: white;
      padding: 8px 16px;
      text-align: center;
      border-top: 1px solid #E0E0E0;
    }
    
    .etiqueta-footer p {
      font-family: 'Roboto', sans-serif;
      font-size: 9px;
      color: #999999;
      margin: 0 0 2px 0;
    }
    
    .etiqueta-footer .timestamp {
      font-size: 8px;
      color: #BBBBBB;
    }
    
    /* PRINT BUTTONS (HIDDEN - Auto-print activated) */
    .print-buttons {
      display: none;
    }
    
    .btn {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-family: 'Montserrat', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .btn-print {
      background: linear-gradient(135deg, #1E73BE 0%, #1565C0 100%);
      color: white;
    }
    
    .btn-print:hover {
      background: linear-gradient(135deg, #1565C0 0%, #0d47a1 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(30, 115, 190, 0.3);
    }
    
    .btn-close {
      background: linear-gradient(135deg, #DC3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-close:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
    }
    
    @media print {
      body {
        padding: 0;
        display: block;
      }
      
      .print-buttons {
        display: none !important;
      }
      
      .etiqueta-container {
        box-shadow: none;
        max-width: none;
        width: 100%;
        margin: 0;
      }
    }
  </style>
</head>
<body>
  <div class="etiqueta-container">
    <!-- HEADER -->
    <div class="etiqueta-header">
      <h1>🏦 ${x.foodBank}</h1>
      <p>${x.orderLabel}</p>
    </div>
    
    <!-- GRID SUPERIOR: QR + PRODUCTOS -->
    <div class="grid-superior">
      <!-- QR Code -->
      <div class="qr-section">
        <img src="${f}" alt="QR Code" />
        <div class="qr-id">${s.numeroComanda}</div>
      </div>
      
      <!-- Productos -->
      <div class="productos-box">
        <div class="icon">📦</div>
        <div class="label">${x.products}</div>
        <div class="number">${s.items.length}</div>
        <div class="sublabel">${x.articles}</div>
      </div>
    </div>
    
    <!-- GRID COMANDA + ESTADO -->
    <div class="grid-comanda">
      <!-- Número de Comanda -->
      <div class="comanda-box">
        <div class="label">${x.orderNumber}</div>
        <div class="number">${s.numeroComanda}</div>
      </div>
      
      <!-- Estado -->
      <div class="estado-box">
        <div class="label">${x.status}</div>
        <div class="estado-badge">${E.label}</div>
      </div>
    </div>
    
    <!-- FECHA ENTREGA -->
    <div class="fecha-entrega-section">
      <div class="icon">📅</div>
      <div class="content">
        <div class="label">${x.deliveryDate}</div>
        <div class="fecha">${A(s.fechaEntrega)}</div>
        ${s.horaCita?`<div class="hora">${s.horaCita}</div>`:""}
      </div>
    </div>
    
    <!-- ORGANISMO -->
    <div class="organismo-section">
      <div class="organismo-title">
        <span>👤</span>
        <span>${x.recipient}</span>
      </div>
      <div class="organismo-grid">
        <div class="organismo-field full">
          <div class="label">${x.name}</div>
          <div class="value highlight">${s.organismoNombre}</div>
        </div>
        ${s.organismoTipo?`
          <div class="organismo-field">
            <div class="label">${x.type}</div>
            <div class="value">${s.organismoTipo}</div>
          </div>
        `:""}
        ${s.organismoResponsable?`
          <div class="organismo-field">
            <div class="label">${x.responsible}</div>
            <div class="value">${s.organismoResponsable}</div>
          </div>
        `:""}
        ${s.organismoDireccion?`
          <div class="organismo-field full">
            <div class="label">${x.address}</div>
            <div class="value">${s.organismoDireccion}</div>
          </div>
        `:""}
        ${s.organismoTelefono?`
          <div class="organismo-field">
            <div class="label">${x.phone}</div>
            <div class="value">${s.organismoTelefono}</div>
          </div>
        `:""}
      </div>
    </div>
    
    <!-- FIRMAS -->
    <div class="firmas-section">
      <div class="firma-box">
        <div class="label">${x.deliveredBy}:</div>
        <div class="firma-line"></div>
        <div class="sublabel">${x.nameAndSignature}</div>
      </div>
      <div class="firma-box">
        <div class="label">${x.receivedBy}:</div>
        <div class="firma-line" style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;font-weight:600;color:#333333;">${s.organismoResponsable||""}</div>
        <div class="sublabel">${x.nameAndSignature}</div>
      </div>
    </div>
    
    <!-- FOOTER -->
    <div class="etiqueta-footer">
      <p>${x.systemFooter}</p>
      <p class="timestamp">${x.printedOn}: ${n(new Date)}</p>
    </div>
  </div>
  
  <!-- PRINT BUTTONS (HIDDEN - Auto-print activated) -->
  <div class="print-buttons" style="display: none;">
    <button class="btn btn-print" onclick="handlePrint()">
      🖨️ Imprimer l'étiquette
    </button>
    <button class="btn btn-close" onclick="window.close()">
      ✖ Fermer
    </button>
  </div>
  
  <script>
    console.log('🖨️ Etiqueta de Comanda - Impresión automática activada');
    
    function handlePrint() {
      console.log('📝 Iniciando impresión de comanda...');
      window.print();
      
      // Cerrar la ventana después de que termine la impresión
      window.addEventListener('afterprint', function() {
        console.log('✅ Impresión completada - Cerrando ventana...');
        window.close();
      });
    }
    
    // Iniciar impresión automáticamente cuando la página cargue
    window.onload = function() {
      console.log('📄 Página cargada - Iniciando impresión automática...');
      // Pequeño delay para asegurar que todo esté renderizado
      setTimeout(function() {
        handlePrint();
      }, 500);
    };
  <\/script>
</body>
</html>
  `.trim()}async function Ca(s){const x=await wa(s),i=document.createElement("iframe");i.style.position="absolute",i.style.width="0",i.style.height="0",i.style.border="none",i.style.visibility="hidden",document.body.appendChild(i);const f=i.contentWindow?.document;if(!f)throw document.body.removeChild(i),new Error("No se pudo acceder al documento del iframe");f.open(),f.write(x),f.close(),i.onload=()=>{try{i.contentWindow?.focus(),i.contentWindow?.print(),setTimeout(()=>{document.body.removeChild(i)},1e3)}catch(c){console.error("Error al imprimir:",c),document.body.removeChild(i)}}}function Ea({open:s,onOpenChange:x,comanda:i,organismo:f,onConfirmar:c}){const[E,A]=d.useState(""),[n,l]=d.useState(""),[h,D]=d.useState(""),L=()=>{if(!E){b.error("Por favor, seleccione una nueva fecha");return}if(!n){b.error("Por favor, seleccione una hora");return}if(!h.trim()){b.error("Por favor, indique el motivo del cambio");return}c(E,n,h),A(""),l(""),D(""),x(!1),b.success(`Propuesta de nueva fecha enviada al organismo ${f?.nombre}`)},p=new Date(i?.fechaEntrega);return e.jsx(Ae,{open:s,onOpenChange:x,children:e.jsxs(Se,{className:"max-w-2xl","aria-describedby":"proponer-fecha-description",children:[e.jsxs(De,{children:[e.jsx(ke,{style:{fontFamily:"Montserrat, sans-serif",fontSize:"1.5rem"},children:"Proponer Nueva Fecha de Recogida"}),e.jsx(Oe,{id:"proponer-fecha-description",className:"text-[#666666]",children:"Sugiera una nueva fecha y hora para la recogida de la comanda"})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Comanda:"}),e.jsx("p",{className:"font-bold text-[#1E73BE]",children:i?.id})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Organismo:"}),e.jsx("p",{className:"font-bold text-[#333333]",children:f?.nombre})]}),e.jsxs("div",{className:"col-span-2",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Fecha Original de Recogida:"}),e.jsxs("p",{className:"font-bold text-[#DC3545]",children:[p.toLocaleDateString("es-ES",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),f?.horaCita&&` a las ${f.horaCita}`]})]})]})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(ye,{className:"flex items-center gap-2",children:[e.jsx(xs,{className:"w-4 h-4 text-[#1E73BE]"}),"Nueva Fecha Propuesta *"]}),e.jsx(_e,{type:"date",value:E,onChange:m=>A(m.target.value),min:new Date().toISOString().split("T")[0],className:"text-base"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(ye,{className:"flex items-center gap-2",children:[e.jsx(Vs,{className:"w-4 h-4 text-[#1E73BE]"}),"Hora Propuesta *"]}),e.jsx(_e,{type:"time",value:n,onChange:m=>l(m.target.value),className:"text-base"})]})]}),E&&n&&e.jsxs("div",{className:"bg-green-50 border border-green-200 rounded-lg p-4",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Nueva fecha propuesta:"}),e.jsxs("p",{className:"font-bold text-[#4CAF50]",style:{fontSize:"1.1rem"},children:[new Date(E).toLocaleDateString("es-ES",{weekday:"long",year:"numeric",month:"long",day:"numeric"})," a las ",n]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(ye,{children:"Motivo del Cambio de Fecha *"}),e.jsx(ma,{rows:4,value:h,onChange:m=>D(m.target.value),placeholder:"Explique el motivo por el cual se propone cambiar la fecha de recogida (ej: problemas de inventario, ajuste de horarios, disponibilidad del personal, etc.)",className:"resize-none"}),e.jsx("p",{className:"text-xs text-[#666666]",children:"Este mensaje se enviará al organismo junto con la propuesta de nueva fecha"})]})]}),e.jsx("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4",children:e.jsxs("p",{className:"text-sm text-[#666666] flex items-start gap-2",children:[e.jsx("span",{className:"text-[#FFC107] font-bold",children:"ℹ️"}),e.jsx("span",{children:"El organismo recibirá una notificación con la nueva fecha propuesta y podrá aceptarla o contactar con la Banque Alimentaire para coordinar otra fecha. La comanda quedará en estado pendiente hasta que se confirme la nueva fecha."})]})}),e.jsxs("div",{className:"flex justify-end gap-3 pt-4 border-t",children:[e.jsxs(y,{variant:"outline",onClick:()=>{A(""),l(""),D(""),x(!1)},children:[e.jsx(Qe,{className:"w-4 h-4 mr-2"}),"Cancelar"]}),e.jsxs(y,{onClick:L,className:"bg-[#1E73BE] hover:bg-[#1557A0]",disabled:!E||!n||!h.trim(),children:[e.jsx(xa,{className:"w-4 h-4 mr-2"}),"Enviar Propuesta"]})]})]})]})})}const Fa=d.lazy(async()=>({default:(await us(()=>import("./GuiaPermisoCamara-Cs636Oca.js"),__vite__mapDeps([0,1,2,3,4,5,6,7]),import.meta.url)).GuiaPermisoCamara})),cs=()=>us(()=>import("./index-2SlHBN_i.js"),__vite__mapDeps([8,1]),import.meta.url);function Aa({onScanSuccess:s,onClose:x,autoStartCamera:i=!1}){const[f,c]=d.useState(i?"camara":null),[E,A]=d.useState(!1),[n,l]=d.useState(null),[h,D]=d.useState(null),[L,p]=d.useState(!1),m=d.useRef(null),B=d.useRef(null),T=d.useRef(null),_=d.useRef(!1);d.useEffect(()=>()=>{N(),P()},[]),d.useEffect(()=>{!i||_.current||(_.current=!0,z())},[i]);const P=()=>{if(B.current)try{B.current.getTracks().forEach(g=>g.stop()),B.current=null}catch{}},v=()=>{l(null),c("preparandoCamara")},z=async()=>{if(l(null),c("camara"),!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){l("browser_not_supported");return}try{let g;try{g=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}}),B.current=g}catch(j){console.log("⚠️ Permiso de cámara requerido"),j.name==="NotAllowedError"||j.message?.includes("Permission denied")?(l("permission_denied"),setTimeout(()=>p(!0),500)):j.name==="NotFoundError"?l("camera_not_found"):j.name==="NotReadableError"?l("camera_in_use"):j.name==="OverconstrainedError"?l("camera_constraints"):j.name==="SecurityError"?l("security_error"):l("unknown_error");return}P(),await new Promise(j=>setTimeout(j,200)),await N();const C="qr-reader-camera",{Html5Qrcode:H}=await cs(),le=new H(C);m.current=le;const I=await H.getCameras();if(!I||I.length===0){l("camera_not_found");return}let W=I[0];const Y=I.find(j=>j.label.toLowerCase().includes("back")||j.label.toLowerCase().includes("rear")||j.label.toLowerCase().includes("trasera")||j.label.toLowerCase().includes("arrière")||j.label.toLowerCase().includes("environment"));Y?(W=Y,console.log("✓ Cámara trasera seleccionada:",Y.label)):console.log("→ Usando cámara:",W.label),await le.start(W.id,{fps:10,qrbox:{width:250,height:250},aspectRatio:1,videoConstraints:{facingMode:{ideal:"environment"}}},j=>{re(j)},j=>{}),A(!0),l(null)}catch(g){console.error("Error inesperado al iniciar escáner:",g),l("unknown_error")}},re=async g=>{await N(),A(!1);try{const C=JSON.parse(g);D(C)}catch{D({text:g})}},G=g=>{h&&s(h,g)},R=async()=>{D(null),l(null),await z()},Q=async g=>{const C=g.target.files?.[0];if(C){c("archivo"),l(null);try{await N(),await new Promise(Y=>setTimeout(Y,100));const H="qr-reader-file",{Html5Qrcode:le}=await cs(),I=new le(H);m.current=I;const W=await I.scanFile(C,!0);re(W)}catch(H){console.error("Error al escanear archivo:",H),l("qr_not_found_in_image")}finally{await N()}}},N=async()=>{if(m.current)try{const g=m.current;await g.getState()===2&&await g.stop(),await g.clear()}catch{}finally{m.current=null}P()},oe=async()=>{await N(),x()},ne=()=>{T.current?.click()},ie=async()=>{if(await N(),l(null),A(!1),i){D(null),await z();return}c(null)},pe=g=>{const C={permission_denied:{title:"Accès à la caméra refusé",description:"Vous avez bloqué l'accès à la caméra. Pour utiliser le scanner, vous devez autoriser l'accès dans les paramètres de votre navigateur.",showGuide:!0},camera_not_found:{title:"Aucune caméra trouvée",description:"Aucune caméra n'a été détectée sur cet appareil. Veuillez vérifier que votre caméra est connectée et fonctionne correctement.",showGuide:!1},camera_in_use:{title:"Caméra déjà utilisée",description:"La caméra est utilisée par une autre application. Fermez les autres applications utilisant la caméra et réessayez.",showGuide:!1},camera_constraints:{title:"Caméra non compatible",description:"Les paramètres de la caméra ne sont pas compatibles avec votre appareil.",showGuide:!1},security_error:{title:"Erreur de sécurité",description:"Accès à la caméra bloqué pour des raisons de sécurité. Assurez-vous d'utiliser HTTPS ou localhost.",showGuide:!1},browser_not_supported:{title:"Navigateur non supporté",description:"Votre navigateur ne supporte pas l'accès à la caméra. Veuillez utiliser un navigateur moderne (Chrome, Firefox, Safari).",showGuide:!1},qr_not_found_in_image:{title:"QR non trouvé",description:"Aucun code QR n'a été trouvé dans l'image. Veuillez essayer une autre image avec un code QR bien visible et de bonne qualité.",showGuide:!1},unknown_error:{title:"Erreur inconnue",description:"Une erreur inattendue s'est produite lors de l'accès à la caméra.",showGuide:!1}};return C[g]||C.unknown_error},Ve=()=>{if(!n)return null;const g=pe(n),C=n==="permission_denied";return e.jsxs("div",{className:"text-center py-8",children:[e.jsx(Be,{className:`w-20 h-20 mx-auto mb-4 ${C?"text-[#DC3545]":"text-[#FFC107]"}`}),e.jsx("h3",{className:"text-2xl font-bold text-[#333] mb-3",style:{fontFamily:"Montserrat"},children:g.title}),e.jsx("p",{className:"text-gray-700 mb-6 max-w-md mx-auto",children:g.description}),C&&e.jsxs("div",{className:"bg-red-50 border-2 border-[#DC3545] rounded-lg p-5 mb-6 max-w-md mx-auto text-left",children:[e.jsxs("h4",{className:"font-bold text-[#DC3545] mb-3 flex items-center gap-2",children:[e.jsx(as,{className:"w-5 h-5"}),"Comment débloquer l'accès:"]}),e.jsxs("ol",{className:"space-y-2 text-sm text-gray-700",children:[e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"1."}),e.jsx("span",{children:"Regardez dans la barre d'adresse de votre navigateur"})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"2."}),e.jsxs("span",{children:["Cliquez sur l'icône ",e.jsx("strong",{children:"🔒"})," ou ",e.jsx("strong",{children:"🛡️"})]})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"3."}),e.jsxs("span",{children:['Trouvez "Caméra" et changez à ',e.jsx("strong",{className:"text-[#4CAF50]",children:'"Autoriser"'})]})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"4."}),e.jsx("span",{children:"Rechargez la page (F5) et réessayez"})]})]})]}),e.jsxs("div",{className:"space-y-3 max-w-md mx-auto",children:[g.showGuide&&e.jsxs("button",{onClick:()=>p(!0),className:"w-full px-6 py-3 bg-[#1E73BE] text-white rounded-lg hover:bg-[#1557A0] transition-colors font-bold flex items-center justify-center gap-2 text-lg",style:{fontFamily:"Montserrat"},children:[e.jsx(Me,{className:"w-5 h-5"}),"Guide complet avec images"]}),e.jsxs("div",{className:`${g.showGuide?"border-t-2 border-gray-200 pt-4 mt-4":""}`,children:[e.jsx("p",{className:"text-sm font-semibold text-gray-700 mb-3",children:"Alternative sans caméra:"}),e.jsxs("button",{onClick:ne,className:"w-full px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-bold flex items-center justify-center gap-2",style:{fontFamily:"Montserrat"},children:[e.jsx(je,{className:"w-5 h-5"}),"Télécharger une image du QR"]}),e.jsx("p",{className:"text-xs text-gray-500 mt-2",children:"✓ Fonctionne sans autorisation de caméra"})]}),e.jsxs("div",{className:"flex gap-3 mt-4",children:[!C&&e.jsx("button",{onClick:v,className:"flex-1 px-6 py-2 border-2 border-[#1E73BE] text-[#1E73BE] rounded-lg hover:bg-[#1E73BE] hover:text-white transition-colors font-medium",children:"Réessayer"}),e.jsx("button",{onClick:ie,className:"flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Retour"})]})]})]})};return e.jsxs(e.Fragment,{children:[L&&e.jsx(d.Suspense,{fallback:null,children:e.jsx(Fa,{onClose:()=>p(!1)})}),e.jsx("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden max-h-[95vh] overflow-y-auto",children:[e.jsxs("div",{className:"bg-[#1E73BE] text-white p-4 flex items-center justify-between sticky top-0 z-10",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(we,{className:"w-6 h-6"}),e.jsx("h2",{className:"font-bold text-xl",style:{fontFamily:"Montserrat"},children:"Scanner Code QR"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:()=>p(!0),className:"hover:bg-white/20 p-2 rounded-lg transition-colors",title:"Aide: Comment autoriser la caméra",children:e.jsx(Me,{className:"w-5 h-5"})}),e.jsx("button",{onClick:oe,className:"hover:bg-white/20 p-2 rounded-lg transition-colors",children:e.jsx(Qe,{className:"w-5 h-5"})})]})]}),e.jsxs("div",{className:"p-6",children:[e.jsx("input",{ref:T,type:"file","data-testid":"orders-qr-file-input",accept:"image/*",onChange:Q,className:"hidden"}),h?e.jsxs("div",{className:"py-6",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx(Us,{className:"w-16 h-16 text-[#4CAF50] mx-auto mb-4"}),e.jsx("p",{className:"text-[#4CAF50] font-bold text-xl mb-2",children:"Code QR scanné avec succès!"}),e.jsx("p",{className:"text-gray-600 text-sm",children:"Choisissez l'action à effectuer"})]}),e.jsxs("div",{className:"bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto",children:[h.comanda&&e.jsxs("div",{className:"mb-2",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"N° Commande: "}),e.jsx("span",{className:"text-[#1E73BE] font-black text-lg",children:h.comanda})]}),h.organismo&&e.jsxs("div",{className:"mb-2",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Organisme: "}),e.jsx("span",{className:"text-[#333]",children:h.organismo})]}),h.fecha&&e.jsxs("div",{className:"mb-2",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Date: "}),e.jsx("span",{className:"text-[#333]",children:h.fecha})]}),h.items!==void 0&&e.jsxs("div",{className:"mb-2",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Articles: "}),e.jsx("span",{className:"text-[#4CAF50] font-bold",children:h.items})]}),h.text&&!h.comanda&&e.jsxs("div",{className:"mb-2",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Données: "}),e.jsx("span",{className:"text-[#333] text-sm break-all",children:h.text})]})]}),e.jsxs("div",{className:"max-w-md mx-auto space-y-3 mb-6",children:[e.jsx("h3",{className:"font-bold text-[#333] text-center mb-4",style:{fontFamily:"Montserrat"},children:"Que souhaitez-vous faire?"}),e.jsxs("button",{onClick:()=>G("ver_detalles"),className:"w-full group border-2 border-[#1E73BE] hover:bg-[#1E73BE] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3",children:[e.jsx(Ce,{className:"w-6 h-6 text-[#1E73BE] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white transition-colors",children:"Voir les détails"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/80 transition-colors",children:"Consulter toutes les informations de la commande"})]})]}),e.jsxs("button",{onClick:()=>G("marcar_entregado"),className:"w-full group border-2 border-[#4CAF50] hover:bg-[#4CAF50] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3",children:[e.jsx(Fe,{className:"w-6 h-6 text-[#4CAF50] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white transition-colors",children:"Marquer comme livré"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/80 transition-colors",children:"Confirmer la livraison de cette commande"})]})]}),e.jsxs("button",{onClick:()=>G("gestionar_transporte"),className:"w-full group border-2 border-[#FFC107] hover:bg-[#FFC107] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3",children:[e.jsx(Hs,{className:"w-6 h-6 text-[#FFC107] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white transition-colors",children:"Gérer le transport"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/80 transition-colors",children:"Assigner ou modifier les informations de transport"})]})]}),e.jsxs("button",{onClick:()=>G("modificar"),className:"w-full group border-2 border-[#666] hover:bg-[#666] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3",children:[e.jsx(Ws,{className:"w-6 h-6 text-[#666] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white transition-colors",children:"Modifier la commande"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/80 transition-colors",children:"Éditer les détails ou articles de la commande"})]})]}),e.jsxs("button",{onClick:()=>G("cancelar"),className:"w-full group border-2 border-[#DC3545] hover:bg-[#DC3545] rounded-lg p-4 transition-all hover:shadow-lg flex items-center gap-3",children:[e.jsx(ua,{className:"w-6 h-6 text-[#DC3545] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white transition-colors",children:"Annuler la commande"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/80 transition-colors",children:"Annuler ou supprimer cette commande"})]})]})]}),e.jsxs("div",{className:"flex justify-center gap-3 pt-4 border-t border-gray-200",children:[e.jsxs("button",{onClick:R,className:"px-6 py-2 border-2 border-[#1E73BE] text-[#1E73BE] rounded-lg hover:bg-[#1E73BE] hover:text-white transition-colors font-medium flex items-center gap-2",children:[e.jsx(we,{className:"w-4 h-4"}),"Scanner un autre QR"]}),e.jsx("button",{onClick:oe,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Fermer"})]})]}):f===null?e.jsxs("div",{className:"py-6",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx(we,{className:"w-16 h-16 text-[#1E73BE] mx-auto mb-3"}),e.jsx("h3",{className:"text-lg font-bold text-[#333] mb-2",style:{fontFamily:"Montserrat"},children:"Choisissez une méthode de scan"}),e.jsx("p",{className:"text-gray-600 text-sm",children:"Scannez avec votre caméra ou téléchargez une image"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:v,className:"group border-2 border-[#1E73BE] hover:bg-[#1E73BE] rounded-xl p-6 transition-all hover:shadow-lg",children:[e.jsx(qe,{className:"w-12 h-12 text-[#1E73BE] group-hover:text-white mx-auto mb-3 transition-colors"}),e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white mb-2 transition-colors",style:{fontFamily:"Montserrat"},children:"Scanner avec Caméra"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/90 transition-colors",children:"Utilisez la caméra de votre appareil"})]}),e.jsxs("button",{onClick:ne,className:"group border-2 border-[#4CAF50] hover:bg-[#4CAF50] rounded-xl p-6 transition-all hover:shadow-lg",children:[e.jsx(je,{className:"w-12 h-12 text-[#4CAF50] group-hover:text-white mx-auto mb-3 transition-colors"}),e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white mb-2 transition-colors",style:{fontFamily:"Montserrat"},children:"Télécharger Image"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/90 transition-colors",children:"Sélectionnez une image avec QR"})]})]}),e.jsx("div",{className:"mt-6 text-center",children:e.jsx("button",{onClick:oe,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Annuler"})})]}):f==="preparandoCamara"?e.jsxs("div",{className:"py-6",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx(as,{className:"w-20 h-20 text-[#1E73BE] mx-auto mb-4"}),e.jsx("h3",{className:"text-xl font-bold text-[#333] mb-3",style:{fontFamily:"Montserrat"},children:"Autorisation de la caméra requise"}),e.jsx("p",{className:"text-gray-600 max-w-md mx-auto",children:"Pour scanner les codes QR, nous avons besoin d'accéder à votre caméra. Votre navigateur va vous demander l'autorisation."})]}),e.jsxs("div",{className:"bg-blue-50 border-2 border-[#1E73BE] rounded-lg p-5 mb-6 max-w-md mx-auto",children:[e.jsxs("h4",{className:"font-bold text-[#1E73BE] mb-3 flex items-center gap-2",style:{fontFamily:"Montserrat"},children:[e.jsx(Be,{className:"w-5 h-5"}),"Ce que vous devez faire:"]}),e.jsxs("ol",{className:"space-y-2 text-sm text-gray-700",children:[e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#1E73BE] flex-shrink-0",children:"1."}),e.jsxs("span",{children:["Cliquez sur ",e.jsx("span",{className:"font-bold",children:'"Activer la caméra"'})," ci-dessous"]})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#1E73BE] flex-shrink-0",children:"2."}),e.jsx("span",{children:"Une notification apparaîtra en haut"})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#1E73BE] flex-shrink-0",children:"3."}),e.jsxs("span",{children:["Cliquez sur ",e.jsx("span",{className:"font-bold text-[#4CAF50]",children:'"Autoriser"'})]})]})]})]}),e.jsxs("div",{className:"flex flex-col items-center gap-3",children:[e.jsxs("button",{onClick:z,className:"w-full max-w-md px-8 py-4 bg-[#1E73BE] text-white rounded-lg hover:bg-[#1557A0] transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3",style:{fontFamily:"Montserrat"},children:[e.jsx(qe,{className:"w-6 h-6"}),"Activer la caméra maintenant"]}),e.jsxs("button",{onClick:()=>p(!0),className:"text-[#1E73BE] hover:underline text-sm font-medium flex items-center gap-1",children:[e.jsx(Me,{className:"w-4 h-4"}),"Besoin d'aide?"]}),e.jsxs("div",{className:"mt-4 pt-4 border-t border-gray-200 w-full max-w-md",children:[e.jsx("p",{className:"text-sm text-gray-600 text-center mb-3",children:"Vous préférez ne pas utiliser la caméra?"}),e.jsxs("button",{onClick:ne,className:"w-full px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-medium flex items-center justify-center gap-2",children:[e.jsx(je,{className:"w-5 h-5"}),"Télécharger une image"]})]}),e.jsx("button",{onClick:ie,className:"mt-2 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Retour"})]})]}):f==="camara"?e.jsx("div",{children:n?Ve():e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-4 text-center",children:[e.jsx(qe,{className:"w-12 h-12 text-[#1E73BE] mx-auto mb-3 animate-pulse"}),e.jsx("p",{className:"text-gray-700 font-medium mb-2",children:"Positionnez le code QR devant la caméra"}),e.jsx("p",{className:"text-gray-500 text-sm",children:"Le scanner détectera automatiquement le code"})]}),e.jsxs("div",{className:"relative rounded-lg overflow-hidden border-4 border-[#1E73BE] bg-black",children:[e.jsx("div",{id:"qr-reader-camera",className:"w-full min-h-[300px]"}),E&&e.jsx("div",{className:"absolute top-4 left-1/2 transform -translate-x-1/2 z-10",children:e.jsxs("div",{className:"bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2",children:[e.jsx("div",{className:"w-2 h-2 bg-white rounded-full animate-pulse"}),"Scan en cours..."]})})]}),e.jsxs("div",{className:"mt-4 flex justify-center gap-4",children:[e.jsx("button",{onClick:ie,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:i?"Redémarrer":"Retour"}),e.jsx("button",{onClick:oe,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Annuler"})]})]})}):e.jsxs("div",{className:"text-center py-8",children:[e.jsx("div",{id:"qr-reader-file",className:"hidden"}),n?e.jsxs(e.Fragment,{children:[e.jsx(Be,{className:"w-16 h-16 text-[#DC3545] mx-auto mb-4"}),e.jsx("h3",{className:"text-lg font-bold text-[#333] mb-3",style:{fontFamily:"Montserrat"},children:pe(n).title}),e.jsx("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto",children:e.jsx("p",{className:"text-sm text-gray-700",children:pe(n).description})}),e.jsxs("div",{className:"flex justify-center gap-4",children:[e.jsx("button",{onClick:ne,className:"px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-medium",children:"Essayer une autre image"}),e.jsx("button",{onClick:ie,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:i?"Retour caméra":"Retour"})]})]}):e.jsxs(e.Fragment,{children:[e.jsx(je,{className:"w-16 h-16 text-[#4CAF50] mx-auto mb-4 animate-pulse"}),e.jsx("p",{className:"text-gray-700 font-medium mb-4",children:"Analyse de l'image en cours..."})]})]})]})]})})]})}function bt(){const{t:s,i18n:x}=Na(),i=Ys(),f=x.language||"fr",c=(a,t)=>new Date(a).toLocaleDateString(f,t),E=s("orders.searchByNumber"),[A,n]=d.useState(""),[l,h]=d.useState(!1),[D,L]=d.useState(!1),[p,m]=d.useState(!1),[B,T]=d.useState(!1),[_,P]=d.useState(!1),[v,z]=d.useState(null),[re,G]=d.useState([]),[R,Q]=d.useState([]),[N,oe]=d.useState([{productoId:"",cantidad:1,nombreProducto:"",unidad:""}]),[ne,ie]=d.useState(""),[pe,Ve]=d.useState(""),[g,C]=d.useState(""),[H,le]=d.useState({}),[I,W]=d.useState("todos"),[Y,j]=d.useState("comandas"),[bs,Ue]=d.useState(!1),[He,vs]=d.useState(null),[js,ge]=d.useState(!1),[Ns,Re]=d.useState(!1),[S,ys]=d.useState(null),[fe,ws]=d.useState(null),[J,Cs]=d.useState("todos"),[Sa,Da]=d.useState(null),[ka,de]=d.useState(0),We=pa(),Es=[...ue(),...sa.filter(a=>!ue().some(t=>t.id===a.id))],Ye=ms(),Fs=new Map([...Ye,...Ge.filter(a=>!Ye.some(t=>t.id===a.id))].map(a=>[a.id,a])),K=a=>a&&(a.nombreOrganismo||a.organismoNombre)||"",ce=a=>{if(!a)return null;const t=K(a);return Es.find(o=>o.id===a.organismoId||t!==""&&o.nombre===t)||null},[X,As]=d.useState([]),$e=()=>{const a=ea();return As(a),a};d.useEffect(()=>{$e()},[]),d.useEffect(()=>{localStorage.getItem("comandas-tab-activo")==="ofertas-cocina"&&(j("ofertas-cocina"),localStorage.removeItem("comandas-tab-activo"))},[]);const Je=a=>{const t={pendiente:{bg:"bg-[#FFC107]",text:s("orders.pending")},en_preparacion:{bg:"bg-[#1E73BE]",text:s("orders.inPreparation")},completada:{bg:"bg-[#4CAF50]",text:s("orders.completed")},entregada:{bg:"bg-[#2E7D32]",text:s("orders.delivered")},anulada:{bg:"bg-[#DC3545]",text:s("orders.cancelled")}}[a]||{bg:"bg-gray-500",text:a};return e.jsx(te,{className:`${t.bg} hover:${t.bg}`,children:t.text})};Ge.filter(a=>a.nombre.toLowerCase().includes(g.toLowerCase())||a.categoria?.toLowerCase().includes(g.toLowerCase()));const Ss=a=>{if(!v)return;try{const u={...v,estado:a};is(u);const r=$e().find(M=>M.id===u.id)||u;z(r)}catch(u){console.error(u);return}const o={pendiente:s("orders.pending"),en_preparacion:s("orders.inPreparation"),completada:s("orders.completed"),entregada:s("orders.delivered"),anulada:s("orders.cancelled")}[a]||a;v&&se("Commandes","modificar",`Commande N° ${v.numero||v.id} - État changé à "${o}"`,{comandaId:v.id,nuevoEstado:a,organismo:K(v)}),b.success(`${s("orders.statusChangedTo")} ${o}`)},Ds=a=>{console.log("Items aceptados:",a),b.success(s("orders.orderAccepted")),P(!1)},ks=()=>{if(v)try{const a={...v,estado:"anulada"};is(a),$e(),z(a)}catch(a){console.error(a);return}v&&se("Commandes","eliminar",`Commande N° ${v.numero||v.id} annulée - Organisme: ${K(v)}`,{comandaId:v.id,organismo:K(v)}),b.success(s("orders.orderCancelled")),P(!1)},be=X.filter(a=>a.estado==="pendiente"||a.estado==="completada"),Os=a=>{Q(t=>t.includes(a)?t.filter(o=>o!==a):[...t,a])},Ts=()=>{R.length===be.length?Q([]):Q(be.map(a=>a.id))},Rs=()=>{if(R.length===0){b.error(s("orders.noOrdersSelected"));return}b.success(e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsx("span",{className:"font-semibold",children:s("orders.sendNotifications")}),e.jsxs("span",{className:"text-sm text-[#666666]",children:[R.length," ",s("organisms.name"),R.length!==1?"s":""]})]}),{duration:5e3}),m(!1),Q([])},$s=a=>{console.log("QR escaneado:",a);const t=X.find(o=>o.numero&&o.numero===a.comanda||o.id===a.comanda);t?(z(t),P(!0),ge(!1),b.success(e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:s("orders.qrFound")}),e.jsxs("p",{className:"text-sm text-[#666666]",children:["N° ",a.comanda]})]}),{duration:3e3})):(ge(!1),b.error(e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:s("orders.qrNotFound")}),e.jsxs("p",{className:"text-sm text-[#666666]",children:["N° ",a.comanda||a.text]})]}),{duration:3e3}))},Bs=(a,t,o)=>{ga(a,t)?(se("Commandes","modificar",`Demande d'offre acceptée - Organisme: ${o}`,{ofertaId:a,solicitudId:t,organismoNombre:o}),b.success(s("orders.requestAcceptedSuccess",{organism:o})),de(w=>w+1)):b.error(s("orders.errors.acceptError"))},Ps=(a,t,o,u)=>{if(!u||u.trim()===""){b.error(s("orders.errors.rejectReasonRequired"));return}fa(a,t,u)?(se("Commandes","modificar",`Demande d'offre refusée - Organisme: ${o} - Motif: ${u}`,{ofertaId:a,solicitudId:t,organismoNombre:o,motivo:u}),b.success(s("orders.requestRejectedSuccess",{organism:o})),de(r=>r+1)):b.error(s("orders.errors.rejectError"))},zs=(a,t,o)=>{ba(a,t)?(se("Commandes","modificar",`Offre livrée - Organisme: ${o}`,{ofertaId:a,solicitudId:t,organismoNombre:o}),b.success(s("orders.requestDeliveredSuccess",{organism:o})),de(w=>w+1)):b.error(s("orders.markDeliveredOnlyAcceptedError"))},Is=(a,t,o)=>{va(a,t)?(se("Commandes","eliminar",`Demande d'offre annulée - Organisme: ${o}`,{ofertaId:a,solicitudId:t,organismoNombre:o}),b.success(s("orders.requestCancelledSuccess",{organism:o})),de(w=>w+1)):b.error(s("orders.cancelRequestError"))},Ke=async(a,t)=>{const o={numeroComanda:a.numero||a.numeroComanda||a.id,fechaEntrega:a.fechaEntrega,estado:a.estado||"pendiente",observaciones:a.observaciones,items:(a.items||[]).map(u=>({nombre:u.nombreProducto||u.productoNombre||s("common.product"),icono:u.icono,cantidad:u.cantidad,unidad:u.unidad,peso:u.peso})),organismoNombre:t?.nombre||s("orders.withoutOrganism"),organismoTipo:t?.tipo,organismoDireccion:t?.direccion,organismoResponsable:t?.responsable,organismoTelefono:t?.telefono,horaCita:t?.horaCita,translations:{foodBank:s("common.foodBank")||"BANQUE ALIMENTAIRE",orderLabel:s("commands.orderLabel")||"Étiquette de Commande",orderNumber:s("commands.orderNumber")||"N° Commande",deliveryDate:s("commands.deliveryDate")||"Livraison",status:s("commands.status")||"Statut",products:s("commands.products")||"Produits",articles:s("commands.articles")||"articles",recipient:s("commands.recipient")||"Organisme Destinataire",name:s("common.name")||"Nom",type:s("common.type")||"Type",address:s("common.address")||"Adresse",responsible:s("common.responsible")||"Responsable",phone:s("common.phone")||"Téléphone",observations:s("common.observations")||"Observations",deliveredBy:s("commands.deliveredBy")||"Remis par",receivedBy:s("commands.receivedBy")||"Reçu par",nameAndSignature:s("commands.nameAndSignature")||"Nom et signature",printedOn:s("common.printedOn")||"Imprimé le",systemFooter:s("commands.systemFooter")||"Système de Gestion des Commandes",pending:s("commands.pending")||"EN ATTENTE",inPreparation:s("commands.inPreparation")||"EN PRÉPARATION",ready:s("commands.ready")||"PRÊTE",delivered:s("commands.delivered")||"LIVRÉE",cancelled:s("commands.cancelled")||"ANNULÉE"}};try{await Ca(o),b.success(s("orders.printLabelSuccess"))}catch(u){console.error("Error al imprimir etiqueta:",u),b.error(s("orders.printLabelError"))}},Xe=(a,t)=>{const o=ue().find(w=>w.id===a.organismoId||w.nombre===a.organismoNombre),u=a.productosAceptados.map(w=>{const r=t.productos.find(M=>M.productoId===w.productoId);return{productoId:w.productoId,nombreProducto:r?.productoNombre||s("common.product"),cantidad:w.cantidadAceptada,unidad:r?.unidad||s("orders.units")}});return{id:`SOL-${a.id}`,numeroComanda:`SOL-${a.id}`,organismoId:o?.id||"",fechaCreacion:a.fechaSolicitud,fechaEntrega:a.fechaSolicitud,estado:"completada",items:u,observaciones:a.observaciones||""}},Ze=a=>{const t={pendiente:{bg:"bg-[#FFC107]",text:s("orders.requestPending")},aceptada:{bg:"bg-[#4CAF50]",text:s("orders.requestAccepted")},entregada:{bg:"bg-[#1E73BE]",text:s("orders.requestDelivered")},rechazada:{bg:"bg-[#DC3545]",text:s("orders.requestRejected")},anulada:{bg:"bg-[#666666]",text:s("orders.requestCancelled")}}[a]||{bg:"bg-gray-500",text:a};return e.jsx(te,{className:`${t.bg} hover:${t.bg}`,children:t.text})},es=X.filter(a=>{const t=ce(a),o=ha([a.id,a.numero||"",t?.nombre||K(a)],A),u=I==="todos"||a.estado===I;return o&&u}),Ms=X.length,ss=es.filter(a=>a.estado!=="anulada"),qs=X.filter(a=>a.estado!=="anulada"&&a.estado!=="entregada").length,Ls=X.filter(a=>a.estado==="pendiente").length,_s=X.filter(a=>a.estado==="entregada").length;if(_&&v){const a=ce(v);return e.jsx(ra,{comanda:v,organismo:a,mostrar:_,onCerrar:()=>P(!1),onCambiarEstado:Ss,onAceptarComanda:Ds,onAnularComanda:ks})}return e.jsxs("div",{className:"min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 relative overflow-hidden",style:{fontFamily:"Roboto, sans-serif",background:"linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)"},children:[e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse",style:{backgroundColor:i.primaryColor}}),e.jsx("div",{className:"absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse",style:{backgroundColor:i.secondaryColor}}),e.jsx("div",{className:"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl",style:{backgroundColor:i.primaryColor}})]}),e.jsxs("div",{className:"relative z-10 space-y-4 sm:space-y-6",children:[e.jsx(na,{}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60",children:e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[i.logo?e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center overflow-hidden shadow-lg border-2",style:{borderColor:i.primaryColor},children:e.jsx("img",{src:i.logo,alt:"Logo",className:"h-full w-full",style:{objectFit:"cover",objectPosition:"center"}})}):e.jsx("div",{className:"h-12 w-12 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center text-white shadow-lg",style:{backgroundColor:i.primaryColor},children:e.jsx(Ne,{className:"w-6 h-6 sm:w-7 sm:h-7"})}),e.jsxs("div",{children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("h1",{className:"text-xl sm:text-2xl md:text-3xl font-bold tracking-tight",style:{fontFamily:"Montserrat, sans-serif",color:i.primaryColor},children:s("orders.title")}),e.jsx(Js,{className:"w-5 h-5 sm:w-6 sm:h-6 animate-pulse",style:{color:i.secondaryColor}})]}),e.jsx("p",{className:"text-xs sm:text-sm text-[#666666] mt-1",children:s("orders.subtitle")})]})]}),e.jsxs("div",{className:"flex gap-2 flex-wrap",children:[e.jsx(y,{size:"icon",onClick:()=>ge(!0),className:"text-white transition-all duration-300 hover:scale-105",style:{background:"linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)",boxShadow:"0 4px 15px rgba(147, 51, 234, 0.4)"},title:s("orders.scanQrTitle"),children:e.jsx(we,{className:"w-4 h-4"})}),e.jsx(y,{onClick:()=>m(!0),size:"icon",title:s("orders.notifyPendingOrders"),className:"text-[#333333] transition-all duration-300 hover:scale-105",style:{background:"linear-gradient(135deg, #FFC107 0%, #E6AC00 100%)",boxShadow:"0 4px 15px rgba(255, 193, 7, 0.4)"},children:e.jsx(Ks,{className:"w-4 h-4"})})]})]})}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-4 gap-4",children:[e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl",style:{borderLeftColor:i.primaryColor,boxShadow:`0 4px 15px ${i.primaryColor}20`},children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:s("orders.totalOrders")}),e.jsx("p",{className:"font-bold text-2xl",style:{color:i.primaryColor},children:Ms})]}),e.jsx(Ne,{className:"w-10 h-10 sm:w-12 sm:h-12 opacity-20",style:{color:i.primaryColor}})]})}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl",style:{borderLeftColor:i.secondaryColor,boxShadow:`0 4px 15px ${i.secondaryColor}20`},children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:s("orders.activeOrders")}),e.jsx("p",{className:"font-bold text-2xl",style:{color:i.secondaryColor},children:qs})]}),e.jsx(Ce,{className:"w-10 h-10 sm:w-12 sm:h-12 opacity-20",style:{color:i.secondaryColor}})]})}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#FFC107] transition-all duration-300 hover:scale-105 hover:shadow-2xl",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:s("orders.pendingOrders")}),e.jsx("p",{className:"font-bold text-2xl text-[#FFC107]",children:Ls})]}),e.jsx(Ee,{className:"w-10 h-10 sm:w-12 sm:h-12 text-[#FFC107] opacity-20"})]})}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#2E7D32] transition-all duration-300 hover:scale-105 hover:shadow-2xl",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666]",children:s("orders.completedOrders")}),e.jsx("p",{className:"font-bold text-2xl text-[#2E7D32]",children:_s})]}),e.jsx(Ne,{className:"w-10 h-10 sm:w-12 sm:h-12 text-[#2E7D32] opacity-20"})]})})]}),e.jsx("div",{className:"backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border border-white/60",children:e.jsxs(aa,{value:Y,onValueChange:j,children:[e.jsx("div",{className:"p-4 sm:p-6",children:e.jsxs(ta,{className:"grid w-full grid-cols-3",children:[e.jsxs(ze,{value:"comandas",className:"flex items-center gap-2",children:[e.jsx(Fe,{className:"w-4 h-4"}),s("orders.title")]}),e.jsxs(ze,{value:"ofertas",className:"flex items-center gap-2",children:[e.jsx(Pe,{className:"w-4 h-4"}),s("orders.offersRequestsTab")]}),e.jsxs(ze,{value:"ofertas-cocina",className:"flex items-center gap-2",children:[e.jsx(ds,{className:"w-4 h-4"}),s("orders.kitchenOffersTab")]})]})}),e.jsxs(Ie,{value:"comandas",className:"p-4 sm:p-6 pt-0 space-y-4",children:["\\n            ",e.jsxs("div",{className:"flex gap-4 items-center",children:[e.jsx("div",{className:"flex-1",children:e.jsx(_e,{placeholder:E,value:A,onChange:a=>n(a.target.value),className:"w-full"})}),e.jsxs(ts,{value:I,onValueChange:W,children:[e.jsx(rs,{className:"w-[200px]",children:e.jsx(os,{placeholder:s("orders.filterByStatus")})}),e.jsxs(ns,{children:[e.jsx($,{value:"todos",children:s("orders.allStatuses")}),e.jsx($,{value:"pendiente",children:s("orders.pending")}),e.jsx($,{value:"en_preparacion",children:s("orders.inPreparation")}),e.jsx($,{value:"completada",children:s("orders.completed")}),e.jsx($,{value:"entregada",children:s("orders.delivered")}),e.jsx($,{value:"anulada",children:s("orders.cancelled")})]})]}),e.jsxs(y,{variant:"outline",onClick:()=>T(!0),disabled:ss.length===0,className:"whitespace-nowrap",children:[e.jsx(Fe,{className:"w-4 h-4 mr-2"}),"Liste produits distribués"]})]}),e.jsx(Z,{children:e.jsx(ee,{className:"pt-6",children:e.jsxs(hs,{children:[e.jsx(ps,{children:e.jsxs(Te,{children:[e.jsx(k,{children:s("orders.orderNumber")}),e.jsx(k,{children:s("orders.organism")}),e.jsx(k,{children:s("orders.deliveryDate")}),e.jsx(k,{children:s("orders.products")}),e.jsx(k,{children:s("orders.status")}),e.jsx(k,{children:s("common.actions")})]})}),e.jsx(gs,{children:es.map(a=>{const t=ce(a);return e.jsxs(Te,{children:[e.jsx(O,{className:"font-medium",children:a.numero||a.id}),e.jsx(O,{children:t?.nombre||K(a)||s("orders.withoutOrganism")}),e.jsx(O,{children:c(a.fechaEntrega)}),e.jsxs(O,{children:[a.items?.length||0," ",s("inventory.products")]}),e.jsx(O,{children:Je(a.estado)}),e.jsx(O,{children:e.jsxs("div",{className:"flex gap-1",children:[e.jsx(y,{variant:"ghost",size:"sm",onClick:()=>{z(a),P(!0)},title:s("orders.viewOrder"),children:e.jsx(Ce,{className:"w-4 h-4"})}),e.jsx(y,{variant:"ghost",size:"sm",onClick:()=>{const o=ce(a);Ke(a,o)},title:s("orders.printLabelTitle"),className:"text-[#1E73BE] hover:text-[#1E73BE]",children:e.jsx(Ee,{className:"w-4 h-4"})})]})})]},a.id)})})]})})})]}),e.jsxs(Ie,{value:"ofertas",className:"p-4 sm:p-6 pt-0 space-y-4",children:[e.jsx("div",{className:"flex gap-4",children:e.jsxs(ts,{value:J,onValueChange:Cs,children:[e.jsx(rs,{className:"w-[250px]",children:e.jsx(os,{placeholder:s("orders.offerStatusFilter")})}),e.jsxs(ns,{children:[e.jsx($,{value:"todos",children:s("orders.allOffers")}),e.jsx($,{value:"pendientes",children:s("orders.pending")}),e.jsx($,{value:"con_solicitudes",children:s("orders.withRequests")}),e.jsx($,{value:"entregadas",children:s("orders.deliveredOffers")}),e.jsx($,{value:"activas",children:s("orders.activeOffers")}),e.jsx($,{value:"expiradas",children:s("orders.expiredOffers")})]})]})}),e.jsxs("div",{className:"space-y-4",children:[We.filter(a=>J==="todos"?!0:J==="pendientes"?(a.solicitudes?.length||0)===0&&a.activa:J==="con_solicitudes"?(a.solicitudes?.length||0)>0:J==="entregadas"?(a.solicitudes||[]).some(t=>t.estado==="entregada"):J==="activas"?a.activa&&new Date(a.fechaExpiracion)>new Date:J==="expiradas"?!a.activa||new Date(a.fechaExpiracion)<new Date:!0).map(a=>{const t=a.solicitudes?.length||0,o=new Date(a.fechaExpiracion),u=o<new Date,w=Math.ceil((o.getTime()-new Date().getTime())/(1e3*60*60*24));return e.jsx(Z,{className:u?"opacity-60":"",children:e.jsx(ee,{className:"pt-6",children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx(Pe,{className:"w-5 h-5 text-[#FFC107]"}),e.jsx("h3",{className:"font-bold text-[#333333]",style:{fontFamily:"Montserrat, sans-serif",fontSize:"1.1rem"},children:a.titulo})]}),e.jsx("p",{className:"text-xs text-[#666666] mb-1",children:a.numeroOferta}),a.descripcion&&e.jsx("p",{className:"text-sm text-[#666666]",children:a.descripcion})]}),e.jsxs("div",{className:"flex flex-col gap-2 items-end",children:[e.jsx(te,{className:u?"bg-[#DC3545]":w<=3?"bg-[#FFC107]":"bg-[#4CAF50]",children:u?s("orders.expired"):s("orders.expiresOn",{date:c(a.fechaExpiracion)})}),t>0&&e.jsxs(te,{className:"bg-[#1E73BE]",children:[t," ",s(t===1?"orders.requestCountSingular":"orders.requestCountPlural")]})]})]}),e.jsxs("div",{className:"bg-gray-50 rounded-lg p-4",children:[e.jsx("h4",{className:"font-semibold text-[#333333] mb-3",style:{fontFamily:"Montserrat, sans-serif"},children:s("orders.offeredProducts")}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3",children:fs(a.productos,r=>{const M=Fs.get(r.productoId);return r.temperaturaAlmacenamiento||r.temperatura||M?.temperaturaAlmacenamiento||M?.temperatura},(r,M)=>String(r.productoNombre||"").localeCompare(String(M.productoNombre||""),f)).map((r,M)=>{const ve=r.cantidadOfrecida-r.cantidadDisponible,me=r.cantidadDisponible/r.cantidadOfrecida*100;return e.jsxs("div",{className:"bg-white border rounded-lg p-3",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("span",{className:"text-2xl",children:r.icono}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium text-sm text-[#333333]",children:r.productoNombre}),e.jsx("p",{className:"text-xs text-[#666666]",children:r.categoria})]})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between text-xs",children:[e.jsx("span",{className:"text-[#666666]",children:s("orders.available")}),e.jsxs("span",{className:"font-semibold text-[#4CAF50]",children:[r.cantidadDisponible," / ",r.cantidadOfrecida," ",r.unidad]})]}),ve>0&&e.jsxs("div",{className:"flex justify-between text-xs",children:[e.jsx("span",{className:"text-[#666666]",children:s("orders.reserved")}),e.jsxs("span",{className:"font-semibold text-[#FFC107]",children:[ve," ",r.unidad]})]}),e.jsx("div",{className:"w-full bg-gray-200 rounded-full h-2 mt-2",children:e.jsx("div",{className:"h-2 rounded-full transition-all",style:{width:`${me}%`,backgroundColor:me>50?"#4CAF50":me>20?"#FFC107":"#DC3545"}})})]})]},`${a.id}-producto-${r.productoId}-${M}`)})})]}),t>0&&e.jsxs("div",{className:"border-t pt-4",children:[e.jsxs("h4",{className:"font-semibold text-[#333333] mb-3 flex items-center gap-2",style:{fontFamily:"Montserrat, sans-serif"},children:[e.jsx(Xs,{className:"w-4 h-4 text-[#1E73BE]"}),s("orders.requestsReceived")," (",t,")"]}),e.jsx("div",{className:"space-y-2",children:a.solicitudes?.map((r,M)=>{const ve=r.productosAceptados.reduce((F,U)=>{const V=a.productos.find(xe=>xe.productoId===U.productoId);return F+(V?.peso||0)*U.cantidadAceptada},0),me=r.productosAceptados.reduce((F,U)=>{const V=a.productos.find(xe=>xe.productoId===U.productoId);return F+(V?.valorUnitario||0)*(V?.peso||0)*U.cantidadAceptada},0);return e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:[e.jsxs("div",{className:"flex items-start justify-between mb-3",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-semibold text-[#333333]",children:r.organismoNombre}),e.jsx("p",{className:"text-xs text-[#666666]",children:c(r.fechaSolicitud,{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})})]}),e.jsx("div",{className:"flex items-center gap-2",children:Ze(r.estado)})]}),r.estado==="pendiente"&&e.jsxs("div",{className:"flex gap-2 mb-3",children:[e.jsxs(y,{size:"sm",className:"flex-1 bg-[#4CAF50] hover:bg-[#45A049]",onClick:()=>Bs(a.id,r.id,r.organismoNombre),children:[e.jsx(Zs,{className:"w-4 h-4 mr-1"}),s("orders.accept")]}),e.jsxs(y,{size:"sm",variant:"destructive",className:"flex-1",onClick:()=>{const F=prompt(s("orders.rejectReasonPrompt"));F&&Ps(a.id,r.id,r.organismoNombre,F)},children:[e.jsx(Qe,{className:"w-4 h-4 mr-1"}),s("orders.reject")]})]}),r.estado==="aceptada"&&e.jsxs("div",{className:"flex gap-2 mb-3",children:[e.jsxs(y,{size:"sm",variant:"outline",className:"flex-1 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white",onClick:()=>{ys(r),ws(a),Re(!0)},children:[e.jsx(Ce,{className:"w-4 h-4 mr-1"}),s("orders.view")]}),e.jsxs(y,{size:"sm",variant:"outline",className:"flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white",onClick:()=>{const F=Xe(r,a),U=ue().find(V=>V.id===F.organismoId);Ke(F,U)},children:[e.jsx(Ee,{className:"w-4 h-4 mr-1"}),s("orders.print")]}),e.jsxs(y,{size:"sm",variant:"outline",className:"flex-1 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-white",onClick:()=>{const F=Xe(r,a);vs(F),Ue(!0)},children:[e.jsx(xs,{className:"w-4 h-4 mr-1"}),s("orders.proposeDate")]}),e.jsxs(y,{size:"sm",className:"flex-1 bg-[#1E73BE] hover:bg-[#175a95]",onClick:()=>zs(a.id,r.id,r.organismoNombre),children:[e.jsx(Ne,{className:"w-4 h-4 mr-1"}),s("orders.markDelivered")]})]}),r.estado==="aceptada"&&e.jsx("div",{className:"flex gap-2 mb-3",children:e.jsxs(y,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>Is(a.id,r.id,r.organismoNombre),children:[e.jsx(oa,{className:"w-4 h-4 mr-1"}),s("orders.cancelOrder")]})}),r.estado==="entregada"&&e.jsx("div",{className:"bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-sm text-green-800",children:r.fechaActualizacion?s("orders.offerDeliveredOn",{date:c(r.fechaActualizacion,{year:"numeric",month:"long",day:"numeric"})}):s("orders.offerDeliveredWithoutDate")}),e.jsxs("div",{className:"bg-white rounded-lg p-3 mb-3",children:[e.jsx("p",{className:"text-xs font-semibold text-[#666666] mb-2",children:s("orders.requestedProducts")}),e.jsx("div",{className:"space-y-1",children:r.productosAceptados.map((F,U)=>{const V=a.productos.find(xe=>xe.productoId===F.productoId);return e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{children:V?.icono}),e.jsx("span",{className:"text-[#333333]",children:V?.productoNombre})]}),e.jsxs("span",{className:"font-semibold text-[#1E73BE]",children:[F.cantidadAceptada," ",V?.unidad]})]},`${r.id}-prod-${F.productoId}-${U}`)})})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 mb-3",children:[e.jsxs("div",{className:"bg-white rounded p-2 text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:s("orders.products")}),e.jsx("p",{className:"font-bold text-[#1E73BE]",children:r.productosAceptados.length})]}),e.jsxs("div",{className:"bg-white rounded p-2 text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:s("orders.totalWeight")}),e.jsxs("p",{className:"font-bold text-[#4CAF50]",children:[Math.round(ve)," kg"]})]}),e.jsxs("div",{className:"bg-white rounded p-2 text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:s("orders.value")}),e.jsxs("p",{className:"font-bold text-[#FFC107]",children:["CAD$ ",he(me)]})]})]}),r.observaciones&&e.jsxs("div",{className:"bg-yellow-50 border border-[#FFC107] rounded p-3",children:[e.jsx("p",{className:"text-xs font-semibold text-[#666666] mb-1",children:s("orders.detailsLabel")}),e.jsx("p",{className:"text-sm text-[#333333]",children:r.observaciones})]})]},`${a.id}-solicitud-${r.id}`)})})]}),t===0&&!u&&e.jsx("div",{className:"text-center py-4 text-[#666666]",children:e.jsx("p",{className:"text-sm",children:s("orders.noRequestsYet")})})]})})},a.id)}),We.length===0&&e.jsx(Z,{children:e.jsx(ee,{className:"pt-6",children:e.jsxs("div",{className:"text-center py-8 text-[#666666]",children:[e.jsx(Pe,{className:"w-16 h-16 mx-auto mb-4 opacity-20"}),e.jsx("p",{className:"font-semibold mb-2",children:s("orders.noOffersCreated")}),e.jsx("p",{className:"text-sm",children:s("orders.specialOffersAppearHere")})]})})})]})]}),e.jsx(Ie,{value:"ofertas-cocina",className:"p-4 sm:p-6 pt-0 space-y-4",children:e.jsxs("div",{className:"bg-white rounded-lg border p-6",children:[e.jsxs("h3",{className:"text-lg font-semibold text-[#333333] mb-4 flex items-center gap-2",children:[e.jsx(ds,{className:"w-5 h-5 text-[#FF9800]"}),s("orders.kitchenOffersTitle")]}),e.jsx("p",{className:"text-sm text-[#666666] mb-4",children:s("orders.kitchenOffersDescription")}),e.jsx(ja,{onOfertaAceptada:()=>{de(a=>a+1)}})]})})]})}),e.jsx(Ae,{open:p,onOpenChange:m,children:e.jsxs(Se,{className:"max-w-2xl","aria-describedby":"notificacion-dialog-description",children:[e.jsxs(De,{children:[e.jsx(ke,{children:s("orders.notifyPendingOrders")}),e.jsx(Oe,{id:"notificacion-dialog-description",children:s("orders.notifyOrdersDescription")})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-[#666666]",children:s("orders.selectOrdersToNotify")}),e.jsxs("div",{className:"flex items-center gap-2 mb-4",children:[e.jsx(ls,{checked:R.length===be.length,onCheckedChange:Ts}),e.jsx(ye,{children:s("inventory.selectAll")})]}),e.jsx("div",{className:"space-y-2 max-h-[400px] overflow-y-auto",children:be.map(a=>{const t=ce(a);return e.jsxs("div",{className:"flex items-center gap-2 p-3 border rounded",children:[e.jsx(ls,{checked:R.includes(a.id),onCheckedChange:()=>Os(a.id)}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:a.id}),e.jsx("p",{className:"text-sm text-[#666666]",children:t?.nombre||K(a)||s("orders.withoutOrganism")})]}),Je(a.estado)]},a.id)})}),e.jsxs("div",{className:"flex justify-end gap-2",children:[e.jsx(y,{variant:"outline",onClick:()=>m(!1),children:s("common.cancel")}),e.jsx(y,{onClick:Rs,className:"bg-[#1E73BE] hover:bg-[#1557A0]",children:s("orders.sendNotifications")})]})]})]})}),e.jsx(ya,{open:B,onOpenChange:T,comandas:ss,currentLocale:f}),e.jsx(Ea,{open:bs,onOpenChange:Ue,comanda:He,organismo:ue().find(a=>a.id===He?.organismoId),onConfirmar:(a,t,o)=>{console.log("Nueva fecha propuesta:",{nuevaFecha:a,nuevaHora:t,motivo:o})}}),e.jsx(Ae,{open:Ns,onOpenChange:Re,children:e.jsxs(Se,{className:"max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin","aria-describedby":"ver-solicitud-description",children:[e.jsxs(De,{children:[e.jsx(ke,{style:{fontFamily:"Montserrat, sans-serif",fontSize:"1.5rem"},children:s("orders.requestDialogTitle")}),e.jsx(Oe,{id:"solicitud-dialog-description",children:s("orders.requestDialogDescription")})]}),S&&fe&&e.jsxs("div",{className:"space-y-4 py-4",children:[e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:[e.jsx("h3",{className:"font-bold text-[#333333] mb-2",style:{fontFamily:"Montserrat, sans-serif"},children:s("orders.organism")}),e.jsx("p",{className:"text-lg font-semibold text-[#1E73BE]",children:S.organismoNombre}),e.jsx("p",{className:"text-sm text-[#666666] mt-1",children:s("orders.requestMadeOn",{date:c(S.fechaSolicitud,{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})})}),e.jsx("div",{className:"mt-2",children:Ze(S.estado)}),S.estado==="entregada"&&S.fechaActualizacion&&e.jsx("p",{className:"text-sm text-[#1E73BE] mt-2 font-medium",children:s("orders.deliveryRecordedOn",{date:c(S.fechaActualizacion,{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})})})]}),e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsxs("h3",{className:"font-bold text-[#333333] mb-3",style:{fontFamily:"Montserrat, sans-serif"},children:[s("orders.requestedProductsTitle")," (",S.productosAceptados.length,")"]}),e.jsx("div",{className:"space-y-2",children:S.productosAceptados.map((a,t)=>{const o=fe.productos.find(r=>r.productoId===a.productoId),u=(o?.peso||0)*a.cantidadAceptada,w=(o?.valorUnitario||0)*u;return e.jsxs("div",{className:"bg-gray-50 rounded p-3",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-2xl",children:o?.icono}),e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold text-[#333333]",children:o?.productoNombre}),e.jsx("p",{className:"text-xs text-[#666666]",children:o?.categoria})]})]}),e.jsxs("span",{className:"text-lg font-bold text-[#1E73BE]",children:[a.cantidadAceptada," ",o?.unidad]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 mt-2",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:s("orders.totalWeight")}),e.jsxs("p",{className:"font-semibold text-[#4CAF50]",children:[Math.round(u)," kg"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:s("orders.valuePerKg")}),e.jsxs("p",{className:"font-semibold text-[#FFC107]",children:["CAD$ ",he(o?.valorUnitario||0)]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:s("orders.valueTotal")}),e.jsxs("p",{className:"font-semibold text-[#FFC107]",children:["CAD$ ",he(w)]})]})]})]},`detalle-prod-${a.productoId}-${t}`)})})]}),e.jsxs("div",{className:"bg-green-50 border-2 border-[#4CAF50] rounded-lg p-4",children:[e.jsx("h3",{className:"font-bold text-[#333333] mb-3",style:{fontFamily:"Montserrat, sans-serif"},children:s("orders.totals")}),e.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:s("orders.totalProductsLabel")}),e.jsx("p",{className:"text-2xl font-bold text-[#1E73BE]",children:S.productosAceptados.length})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:s("orders.totalWeight")}),e.jsxs("p",{className:"text-2xl font-bold text-[#4CAF50]",children:[he(S.productosAceptados.reduce((a,t)=>{const o=fe.productos.find(u=>u.productoId===t.productoId);return a+(o?.peso||0)*t.cantidadAceptada},0))," kg"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:s("orders.valueTotal")}),e.jsxs("p",{className:"text-2xl font-bold text-[#FFC107]",children:["CAD$ ",he(S.productosAceptados.reduce((a,t)=>{const o=fe.productos.find(u=>u.productoId===t.productoId);return a+(o?.valorUnitario||0)*(o?.peso||0)*t.cantidadAceptada},0))]})]})]})]}),S.observaciones&&e.jsxs("div",{className:"bg-yellow-50 border border-[#FFC107] rounded-lg p-4",children:[e.jsx("h3",{className:"font-bold text-[#333333] mb-2",style:{fontFamily:"Montserrat, sans-serif"},children:s("orders.detailsAndObservations")}),e.jsx("p",{className:"text-sm text-[#333333] whitespace-pre-wrap",children:S.observaciones})]}),e.jsx("div",{className:"flex justify-end",children:e.jsx(y,{variant:"outline",onClick:()=>Re(!1),className:"min-w-[120px]",children:s("common.close")})})]})]})}),js&&e.jsx(Aa,{autoStartCamera:!0,onScanSuccess:$s,onClose:()=>ge(!1)})]})]})}export{bt as Comandas};
