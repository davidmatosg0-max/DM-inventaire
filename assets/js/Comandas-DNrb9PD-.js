const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/js/GuiaPermisoCamara-DeRUzuWp.js","assets/js/react-vendor-CmVymGNF.js","assets/js/camera-D5t0YcuV.js","assets/js/index-CZXQ2HXa.js","assets/js/i18n-vendor-BBIw8LEr.js","assets/js/ui-vendor-BZUPWYkl.js","assets/js/utils-vendor-C8hlzdwo.js","assets/index-DIgkQV2k.css","assets/js/index-2SlHBN_i.js"])))=>i.map(i=>d[i]);
import{R as et,j as e,r as x,b as pr}from"./react-vendor-CmVymGNF.js";import{C as tt,c as st}from"./card-CP9xmX1Q.js";import{a2 as xr,u as kt,n as ur,o as xs,X as lt,aJ as hr,an as gr,aK as fr,C as Ot,P as he,aI as br,l as Jt,L as Oe,I as dt,W as us,B as F,G as f,ar as it,A as vr,aL as rt,aq as Ie,a0 as jr,aE as Nr,aM as at,aN as Zt,aA as hs,M as qe,K as Xt,ao as jt,z as es,T as Ae,q as ts,r as ss,s as rs,t as as,v as Z,w as ue,Y as yr,aO as ot,au as ce,aP as wr,aQ as Cr,aR as Er,aS as Ar,aT as Sr,aU as Fr}from"./index-CZXQ2HXa.js";import{D as Me,b as Le,c as Ge,d as Ve,e as Ue}from"./dialog-fYgDxGDd.js";import{m as $t,a as $r}from"./mockData-B-sM_Rd6.js";import{C as Nt}from"./checkbox-CIuV7BB6.js";import{T as _r,a as kr,b as os,c as ns}from"./tabs-N4QgCCCL.js";import{r as Or,a as Pr,B as Dr,f as zr,M as Br}from"./ModeloComanda-BJcfMB6U.js";import{A as Rr}from"./AlertaComandasUrgentes-7H2X88Hp.js";import{s as gs,b as fs,C as qr,a as Pt,n as yt}from"./temperatureSort-BUGROA4t.js";import{f as ve,a as nt,c as je}from"./formatUtils-Cpwesy1K.js";import{g as Dt}from"./brandedQr-DX2qkgjf.js";import{a as Tr,b as Ir,c as Mr,o as Lr}from"./printPopup-khHKS6Ng.js";import{u as bs}from"./i18n-vendor-BBIw8LEr.js";import{P as Qe}from"./printer-k15DDpxJ.js";import{P as Gr}from"./phone-5PXPayOh.js";import{r as Vr,c as is,L as Ur}from"./ListaProductosDistribuidosDialog-jWPCwy61.js";import{r as wt,o as Qr}from"./comandaDistributionMode-BDDcU9xQ.js";import{T as Hr}from"./textarea-zMVm1JWb.js";import{S as Yr}from"./send-Dmm8Utc2.js";import{n as vs,a as js}from"./barcode-lp-IlHNO.js";import{C as Ct}from"./circle-help-Bz7Q1sQs.js";import{C as Kr}from"./circle-x-Cle_P0v9.js";import{C as Et}from"./camera-D5t0YcuV.js";import{f as Wr}from"./searchUtils-DN3EcFb5.js";import{o as Jr,a as Zr,r as Xr,m as ea,b as ta,c as sa,d as ra,e as aa}from"./ofertaStorage-CQ4BUoeD.js";import{u as oa}from"./useCompactViewport-Dv7eXx1B.js";import{c as na}from"./organismoAccessLinks-COv1Z12f.js";import{e as ia}from"./organismoEmailNotifications-B25192AO.js";import{c as ds,g as ls}from"./notificacionStorage-JQDINGT3.js";import{M as da,a as la,b as Te}from"./ModulePageHeader-BQAZX2sf.js";import{M as ca,a as ma,b as cs}from"./ModuleControlSurface-B-FmkOl7.js";import{M as pa}from"./ModuleExecutiveStrip-BIgGPDx-.js";import{F as Ne}from"./file-check-BOUSDQq9.js";import{B as At}from"./ban-BxrPrbKS.js";import{L as xa}from"./layout-grid-BeAaVm1A.js";import{P as ua}from"./pen-pT64jJyS.js";import"./ui-vendor-BZUPWYkl.js";import"./utils-vendor-C8hlzdwo.js";import"./table-CidyMPc3.js";import"./quantity-input-z3F3BPAq.js";import"./clipboard-CfUd8LX3.js";import"./copy-CErz7xZq.js";import"./external-link-BlFCJu4m.js";import"./circle-check-CT8g-SPG.js";import"./personasResponsablesStorage-Z1akBaa8.js";import"./thermometer-BPq9_Wql.js";import"./sun-T8arkONU.js";import"./jspdf.plugin.autotable-BGIqrY1A.js";import"./excel-zip-n3Pgozwg.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ha=[["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M21 9H3",key:"1338ky"}],["path",{d:"M21 15H3",key:"9uk58r"}]],ga=xr("rows-3",ha),ms={pendiente:"En attente",confirmada:"Acceptée",en_preparacion:"En préparation",completada:"Prête",entregada:"Livrée",anulada:"Annulée"};function ye(t){return typeof t=="number"&&Number.isFinite(t)?t:0}function $(...t){for(const c of t)if(typeof c=="string"&&c.trim()!=="")return c.trim();return"-"}function St(t){return t?zr(t):"-"}function we(t,c,i=!1){if(typeof t!="string"||t.trim()==="")return"-";const n=new Date(t);return Number.isNaN(n.getTime())?t:n.toLocaleString(c,i?{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"}:{year:"numeric",month:"2-digit",day:"2-digit"})}function Ft(t,c){return typeof t?.valorUnitario=="number"&&Number.isFinite(t.valorUnitario)&&t.valorUnitario>0?t.valorUnitario:typeof t?.producto?.valorUnitario=="number"&&Number.isFinite(t.producto.valorUnitario)&&t.producto.valorUnitario>0?t.producto.valorUnitario:typeof c?.valorUnitario=="number"&&Number.isFinite(c.valorUnitario)&&c.valorUnitario>0?c.valorUnitario:0}function p(t){return String(t??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}async function fa(t){let c="";try{c=await Dt(t.qrData,{width:220,...Pt})}catch(N){console.error("Erreur lors de la génération du QR de la commande :",N)}let i="";const n=t.items.length===0?`
      <tr>
        <td colspan="7" class="empty">Aucun produit enregistré dans cette commande.</td>
      </tr>
    `:t.items.map(N=>{const L=N.grupoTemperatura!==i;return i=N.grupoTemperatura,`
        ${L?`<tr class="group-row"><td colspan="7">${p(N.grupoTemperatura)}</td></tr>`:""}
        <tr>
          <td>${p(N.nombre)}</td>
          <td>${p(N.temperatura)}</td>
          <td class="right">${p(N.cantidad)}</td>
          <td>${p(N.unidad)}</td>
          <td class="right">${p(N.peso)}</td>
          <td class="right">${p(N.valor)}</td>
          <td>${p(N.observaciones)}</td>
        </tr>
      `}).join("");return`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${p(t.title)}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.45cm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #1f2937;
            font-family: Arial, Helvetica, sans-serif;
          }

          body {
            padding: 18px;
          }

          .sheet {
            width: 100%;
          }

          .header {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            border-bottom: 4px solid #1E73BE;
            padding-bottom: 14px;
          }

          .brand-panel {
            display: inline-flex;
            flex-direction: column;
            gap: 4px;
            padding: 14px 16px;
            border: 1px solid #d7e3ef;
            border-radius: 18px;
            background: linear-gradient(135deg, #f7fbff 0%, #eef6fb 48%, #f6fbf7 100%);
            box-shadow: 0 12px 30px rgba(15, 45, 71, 0.08);
            margin-bottom: 14px;
          }

          .brand-name {
            font-family: Montserrat, Arial, Helvetica, sans-serif;
            font-size: 32px;
            line-height: 1.1;
            font-weight: 700;
            color: #1E73BE;
            margin: 0;
          }

          .brand-subtitle {
            font-size: 18px;
            font-weight: 600;
            color: #475569;
            margin: 0;
          }

          .brand-contact {
            font-size: 15px;
            color: #64748b;
            margin: 0;
          }

          .document-title {
            font-size: 28px;
            margin: 0 0 10px;
            font-family: Arial, Helvetica, sans-serif;
          }

          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 18px;
            font-size: 13px;
          }

          .meta strong,
          .card strong,
          .signature-title {
            color: #111827;
          }

          .qr-box {
            min-width: 148px;
            border: 1px solid #cbd5e1;
            border-radius: 14px;
            padding: 10px;
            text-align: center;
            background: white;
          }

          .qr-box img {
            display: block;
            width: 128px;
            height: 128px;
            margin: 0 auto 6px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .card {
            border: 1px solid #dbe3ea;
            border-radius: 14px;
            padding: 14px;
            page-break-inside: avoid;
          }

          .card-title {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin: 0 0 10px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 16px;
          }

          .summary-card {
            background: #f8fafc;
            border-radius: 14px;
            padding: 12px;
            page-break-inside: avoid;
          }

          .summary-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 700;
          }

          .summary-value {
            margin-top: 8px;
            font-size: 24px;
            font-weight: 700;
            color: #111827;
          }

          .section-title {
            margin: 18px 0 10px;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #1E73BE;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #dbe3ea;
            border-radius: 14px;
            overflow: hidden;
          }

          th, td {
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 12px;
            font-size: 12px;
            vertical-align: top;
          }

          th {
            background: #f8fafc;
            color: #475569;
            text-align: left;
            font-weight: 700;
          }

          .group-row td {
            background: #eaf4ff;
            color: #1E73BE;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          td.right,
          th.right {
            text-align: right;
          }

          .empty {
            text-align: center;
            color: #64748b;
            padding: 20px 12px;
          }

          .footer-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .signature-line {
            margin-top: 32px;
            border-bottom: 1px solid #94a3b8;
          }

          .signature-name {
            margin-top: 8px;
            font-size: 12px;
          }

          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div>
              <div class="brand-panel">
                <p class="brand-name">${p(t.systemName)}</p>
                <p class="brand-subtitle">Système de gestion des commandes</p>
                ${t.systemAddress?`<p class="brand-contact">${p(t.systemAddress)}</p>`:""}
                ${t.systemPhone?`<p class="brand-contact">${p(t.systemPhone)}</p>`:""}
              </div>
              <h1 class="document-title">${p(t.title)}</h1>
              <div class="meta">
                <div><strong>N°:</strong> ${p(t.numeroComanda)}</div>
                <div><strong>Statut:</strong> ${p(t.statusLabel)}</div>
                <div><strong>Livraison:</strong> ${p(t.fechaEntrega)}</div>
                <div><strong>Imprimé:</strong> ${p(we(new Date().toISOString(),t.locale,!0))}</div>
              </div>
            </div>
            <div class="qr-box">
              ${c?`<img src="${c}" alt="QR de la comanda" />`:""}
              <strong>${p(t.numeroComanda)}</strong>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Organisme</div>
              <div><strong>Nom:</strong> ${p(t.organismoNombre)}</div>
              <div><strong>Type:</strong> ${p(t.organismoTipo)}</div>
              <div><strong>Adresse:</strong> ${p(t.organismoDireccion)}</div>
              <div><strong>Téléphone:</strong> ${p(t.organismoTelefono)}</div>
              <div><strong>Courriel:</strong> ${p(t.organismoEmail)}</div>
              <div><strong>Responsable:</strong> ${p(t.responsableRecogida)}</div>
            </div>

            <div class="card">
              <div class="card-title">Détails de la commande</div>
              <div><strong>Créée:</strong> ${p(t.fechaCreacion)}</div>
              <div><strong>Livraison:</strong> ${p(t.fechaEntrega)}</div>
              <div><strong>Heure prévue:</strong> ${p(t.horaPrevista)}</div>
              <div><strong>Préparée par:</strong> ${p(t.preparadoPor)}</div>
              <div><strong>Priorité:</strong> ${p(t.prioridad)}</div>
              <div><strong>Type:</strong> ${p(t.tipo)}</div>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Articles</div>
              <div class="summary-value">${p(t.totalItems)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Unités</div>
              <div class="summary-value">${p(t.totalUnidades)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Poids estimé</div>
              <div class="summary-value">${p(t.totalPeso)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Valeur estimée</div>
              <div class="summary-value">${p(t.totalValor)}</div>
            </div>
          </div>

          <div class="section-title">Détail des produits</div>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Temp.</th>
                <th class="right">Qté</th>
                <th>Unité</th>
                <th class="right">Poids</th>
                <th class="right">Valeur</th>
                <th>Observations</th>
              </tr>
            </thead>
            <tbody>
              ${n}
            </tbody>
          </table>

          <div class="footer-grid">
            <div class="card">
              <div class="card-title">Observations générales</div>
              <div>${p(t.observaciones)}</div>
            </div>
            <div class="card">
              <div class="card-title">Validation et signatures</div>
              <div class="signature-title">Préparée par</div>
              <div class="signature-line"></div>
              <div class="signature-name">${p(t.preparadoPor)}</div>
              <div class="signature-title" style="margin-top: 18px;">Reçue par</div>
              <div class="signature-line"></div>
              <div class="signature-name">${p(t.responsableRecogida)}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `}async function ba(t){let c="";try{c=await Dt(t.qrData,{width:220,...Pt})}catch(N){console.error("Erreur lors de la génération du QR de la fiche de préparation :",N)}let i="";const n=t.items.length===0?`
      <tr>
        <td colspan="7" class="empty">Aucun produit enregistré dans cette commande.</td>
      </tr>
    `:t.items.map(N=>{const L=N.grupoTemperatura!==i;return i=N.grupoTemperatura,`
        ${L?`<tr class="group-row"><td colspan="7">${p(N.grupoTemperatura)}</td></tr>`:""}
        <tr>
          <td>${p(N.nombre)}</td>
          <td>${p(N.temperatura)}</td>
          <td class="right">${p(N.cantidad)}</td>
          <td>${p(N.unidad)}</td>
          <td class="blank">&nbsp;</td>
          <td class="check">[ ]</td>
          <td class="blank">&nbsp;</td>
        </tr>
      `}).join("");return`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${p(t.title)}</title>
        <style>
          @page {
            size: letter portrait;
            margin: 0.45cm;
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #1f2937;
            font-family: Arial, Helvetica, sans-serif;
          }

          body {
            padding: 18px;
          }

          .sheet {
            width: 100%;
          }

          .header {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            border-bottom: 4px solid #1E73BE;
            padding-bottom: 14px;
          }

          .eyebrow {
            display: none;
          }

          .brand-panel {
            display: inline-flex;
            flex-direction: column;
            gap: 4px;
            padding: 14px 16px;
            border: 1px solid #d7e3ef;
            border-radius: 18px;
            background: linear-gradient(135deg, #f7fbff 0%, #eef6fb 48%, #f6fbf7 100%);
            box-shadow: 0 12px 30px rgba(15, 45, 71, 0.08);
            margin-bottom: 14px;
          }

          .brand-name {
            font-family: Montserrat, Arial, Helvetica, sans-serif;
            font-size: 32px;
            line-height: 1.1;
            font-weight: 700;
            color: #1E73BE;
            margin: 0;
          }

          .brand-subtitle {
            font-size: 18px;
            font-weight: 600;
            color: #475569;
            margin: 0;
          }

          .brand-contact {
            font-size: 15px;
            color: #64748b;
            margin: 0;
          }

          h1 {
            font-size: 28px;
            margin: 0 0 10px;
          }

          .meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px 18px;
            font-size: 13px;
          }

          .qr-box {
            min-width: 148px;
            border: 1px solid #cbd5e1;
            border-radius: 14px;
            padding: 10px;
            text-align: center;
            background: white;
          }

          .qr-box img {
            display: block;
            width: 128px;
            height: 128px;
            margin: 0 auto 6px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .card {
            border: 1px solid #dbe3ea;
            border-radius: 14px;
            padding: 14px;
            page-break-inside: avoid;
          }

          .card-title,
          .section-title {
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #1E73BE;
            margin: 0 0 10px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 16px;
          }

          .summary-card {
            background: #f8fafc;
            border-radius: 14px;
            padding: 12px;
            page-break-inside: avoid;
          }

          .summary-label {
            font-size: 11px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 700;
          }

          .summary-value {
            margin-top: 8px;
            font-size: 20px;
            font-weight: 700;
            color: #111827;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #dbe3ea;
            border-radius: 14px;
            overflow: hidden;
            margin-top: 10px;
          }

          th, td {
            border-bottom: 1px solid #e5e7eb;
            padding: 10px 12px;
            font-size: 12px;
            vertical-align: top;
          }

          th {
            background: #f8fafc;
            color: #475569;
            text-align: left;
            font-weight: 700;
          }

          .group-row td {
            background: #eaf4ff;
            color: #1E73BE;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          td.right,
          th.right {
            text-align: right;
          }

          .check {
            text-align: center;
            font-weight: 700;
            letter-spacing: 0.08em;
          }

          .blank {
            min-width: 110px;
          }

          .empty {
            text-align: center;
            color: #64748b;
            padding: 20px 12px;
          }

          .footer-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            margin-top: 16px;
          }

          .signature-line {
            margin-top: 40px;
            border-bottom: 1px solid #94a3b8;
          }

          .signature-name {
            margin-top: 8px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="header">
            <div>
              <div class="brand-panel">
                <p class="brand-name">${p(t.systemName)}</p>
                <p class="brand-subtitle">Système de gestion des commandes</p>
                ${t.systemAddress?`<p class="brand-contact">${p(t.systemAddress)}</p>`:""}
                ${t.systemPhone?`<p class="brand-contact">${p(t.systemPhone)}</p>`:""}
              </div>
              <h1>${p(t.title)}</h1>
              <div class="meta">
                <div><strong>N°:</strong> ${p(t.numeroComanda)}</div>
                <div><strong>Statut:</strong> ${p(t.statusLabel)}</div>
                <div><strong>Livraison:</strong> ${p(t.fechaEntrega)}</div>
                <div><strong>Imprimé:</strong> ${p(we(new Date().toISOString(),t.locale,!0))}</div>
              </div>
            </div>
            <div class="qr-box">
              ${c?`<img src="${c}" alt="QR de la comanda" />`:""}
              <strong>${p(t.numeroComanda)}</strong>
            </div>
          </div>

          <div class="grid">
            <div class="card">
              <div class="card-title">Organisme</div>
              <div><strong>Nom:</strong> ${p(t.organismoNombre)}</div>
              <div><strong>Adresse:</strong> ${p(t.organismoDireccion)}</div>
              <div><strong>Téléphone:</strong> ${p(t.organismoTelefono)}</div>
              <div><strong>Responsable:</strong> ${p(t.responsableRecogida)}</div>
            </div>

            <div class="card">
              <div class="card-title">Consignes de préparation</div>
              <div><strong>Créée:</strong> ${p(t.fechaCreacion)}</div>
              <div><strong>Livraison:</strong> ${p(t.fechaEntrega)}</div>
              <div><strong>Heure prévue:</strong> ${p(t.horaPrevista)}</div>
              <div><strong>Préparée par:</strong> ${p(t.preparadoPor)}</div>
              <div><strong>Priorité:</strong> ${p(t.prioridad)}</div>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card">
              <div class="summary-label">Articles</div>
              <div class="summary-value">${p(t.totalItems)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Unités</div>
              <div class="summary-value">${p(t.totalUnidades)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Poids estimé</div>
              <div class="summary-value">${p(t.totalPeso)}</div>
            </div>
            <div class="summary-card">
              <div class="summary-label">Heure prévue</div>
              <div class="summary-value">${p(t.horaPrevista)}</div>
            </div>
          </div>

          <div class="section-title">Fiche de préparation manuelle</div>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Temp.</th>
                <th class="right">Qté demandée</th>
                <th>Unité</th>
                <th class="right">Qté préparée</th>
                <th>Vérifié</th>
                <th>Notes préparation</th>
              </tr>
            </thead>
            <tbody>
              ${n}
            </tbody>
          </table>

          <div class="footer-grid">
            <div class="card">
              <div class="card-title">Instructions et observations</div>
              <div>${p(t.observaciones)}</div>
              <div style="margin-top: 18px;"><strong>Rappel:</strong> inscrire manuellement les quantités réellement préparées et cocher chaque ligne vérifiée.</div>
            </div>
            <div class="card">
              <div class="card-title">Validation de préparation</div>
              <div><strong>Préparée par</strong></div>
              <div class="signature-line"></div>
              <div class="signature-name">${p(t.preparadoPor)}</div>
              <div style="margin-top: 18px;"><strong>Vérifiée par</strong></div>
              <div class="signature-line"></div>
              <div class="signature-name">______________________________</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `}function va({comanda:t,organismo:c,onClose:i}){const{t:n,i18n:N}=bs(),L=kt(),B=N.language||"fr-CA",z=ur(L),E=z.systemName,g=Array.isArray(t?.items)?t.items:[],R=et.useMemo(()=>xs(),[]),Q=et.useMemo(()=>new Map([...R,...$t.filter(k=>!R.some(w=>w.id===k.id))].map(k=>[k.id,k])),[R]),U=et.useMemo(()=>{const k=g.map(w=>{const _=Q.get(w?.productoId),H=Or(w,_),Y=Pr(w,_);return{item:w,product:_,temperatura:H,temperaturaOriginalEntrada:Y,grupoTemperatura:St(H)}});return gs(k,w=>w.temperatura,(w,_)=>String(w.item?.nombreProducto||w.item?.productoNombre||w.product?.nombre||"").localeCompare(String(_.item?.nombreProducto||_.item?.productoNombre||_.product?.nombre||""),"fr"))},[g,Q]),G=$(t?.numero,t?.numeroComanda,t?.id),A=t?.fechaEntrega||t?.fecha,W=t?.fechaCreacion||t?.fecha,ge=$(c?.responsable,t?.organismoResponsable,t?.nombreOrganismo),fe=$(t?.preparadoPor,t?.usuarioCreacion,t?.creadoPor,"Non attribué"),ae=g.reduce((k,w)=>k+ye(w?.cantidad),0),V=g.reduce((k,w)=>k+ye(w?.peso)*Math.max(ye(w?.cantidad),1),0),me=U.reduce((k,w)=>{const _=ye(w.item?.cantidad);return k+Ft(w.item,w.product)*_},0),Se=fs({numeroComanda:G,organismo:$(c?.nombre,t?.nombreOrganismo),fecha:A,fechaEntrega:A,items:g.length,organismoId:c?.id}),T=t?.estado==="en_preparacion",Fe=async()=>{let k;try{k=Tr({width:1024,height:768,printDelayMs:350})}catch{console.error("Le navigateur a bloqué la fenêtre d’impression");return}i?.(),Ir(k,"Préparation de la commande pour impression...");try{const w=U.map(Y=>{const{item:K,product:D}=Y,X=ye(K?.cantidad),J=ye(K?.peso),oe=Ft(K,D),te=X*oe;return{nombre:$(K?.nombreProducto,K?.productoNombre,D?.nombre),temperatura:St(Y.temperaturaOriginalEntrada||Y.temperatura),cantidad:ve(X),unidad:$(K?.unidad,"u"),peso:J>0?`${ve(J)} kg`:"-",valor:te>0?`CAD$ ${nt(te)}`:"-",observaciones:$(K?.observaciones),grupoTemperatura:Y.grupoTemperatura}}),_={systemName:E,systemPhone:z.phone,systemAddress:z.address,numeroComanda:G,locale:B,title:T?`Fiche de preparation ${G}`:`Comanda ${G}`,statusLabel:ms[t?.estado]||$(t?.estado),organismoNombre:$(c?.nombre,t?.nombreOrganismo),organismoTipo:$(c?.tipo),organismoDireccion:$(c?.direccion),organismoTelefono:$(c?.telefono),organismoEmail:$(c?.email),responsableRecogida:ge,fechaCreacion:we(W,B,!0),fechaEntrega:we(A,B),horaPrevista:$(t?.horaRecogida,c?.horaCita,"À convenir"),preparadoPor:fe,prioridad:$(t?.prioridad,"Normale"),tipo:$(t?.tipo,"Standard"),totalItems:g.length,totalUnidades:ve(ae),totalPeso:`${ve(V)} kg`,totalValor:`CAD$ ${nt(me)}`,observaciones:$(t?.observaciones,"Aucune observation supplémentaire."),qrData:Se,items:w},H=T?await ba(_):await fa(_);Mr(k,H,{width:1024,height:768,printDelayMs:350})}catch(w){console.error("Erreur lors de la préparation de l’impression de la commande :",w),k.document.open(),k.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
          <head><meta charset="UTF-8" /><title>Erreur impression</title></head>
          <body style="font-family: Arial, Helvetica, sans-serif; padding: 24px; color: #991b1b;">
            Impossible de préparer la commande pour impression.
          </body>
        </html>
      `),k.document.close()}};return e.jsxs(e.Fragment,{children:[e.jsx("style",{children:`
        @media print {
          @page {
            size: letter portrait;
            margin: 0.45cm;
          }

          html,
          body {
            background: white !important;
          }
          
          #compact-order-print {
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }

          .min-h-screen {
            min-height: auto !important;
          }
          
          .no-print {
            display: none !important;
          }

          tr,
          td,
          th,
          .summary-card,
          .detail-card {
            page-break-inside: avoid;
          }

          .print-table {
            font-size: 10px !important;
          }

          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }
        }
      `}),e.jsx("div",{className:"min-h-screen bg-slate-100 p-4 print:bg-white print:p-0",children:e.jsxs("div",{className:"mx-auto max-w-5xl space-y-4",children:[e.jsxs("div",{className:"no-print flex justify-end gap-2",children:[e.jsxs("button",{onClick:Fe,className:"flex items-center gap-2 rounded-lg bg-[#2E7D32] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256628]",children:[e.jsx(Qe,{className:"h-4 w-4"}),n("orders.printOrder")]}),i&&e.jsxs("button",{onClick:i,className:"flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50",children:[e.jsx(lt,{className:"h-4 w-4"}),n("common.close","Fermer")]})]}),e.jsxs("div",{id:"compact-order-print",className:"bg-white shadow-2xl print:shadow-none",children:[e.jsx("div",{className:"border-b-4 border-[#1E73BE] px-5 py-4",children:e.jsxs("div",{className:"flex items-start justify-between gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"inline-flex flex-col gap-1 rounded-[24px] border border-[#d7e3ef] bg-[linear-gradient(135deg,#f7fbff_0%,#eef6fb_48%,#f6fbf7_100%)] px-4 py-3 shadow-[0_18px_42px_-36px_rgba(15,45,71,0.35)]",children:[e.jsx("p",{className:"text-[2rem] font-bold leading-none text-[#1E73BE]",style:{fontFamily:"Montserrat, sans-serif",letterSpacing:"-0.03em"},children:E}),e.jsx("p",{className:"text-[1.05rem] font-semibold text-[#475569]",children:"Système de gestion des commandes"}),e.jsx("p",{className:"text-sm text-[#64748b]",children:z.address||"Laval, Québec, Canada"}),z.phone&&e.jsx("p",{className:"text-sm text-[#64748b]",children:z.phone})]}),e.jsx("div",{children:e.jsx("h1",{className:"text-2xl font-bold text-slate-900",style:{fontFamily:"Montserrat, sans-serif"},children:T?"Fiche de préparation manuelle":n("orders.printOrder")})}),e.jsxs("div",{className:"grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-700",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"N°:"})," ",G]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Statut:"})," ",ms[t?.estado]||$(t?.estado)]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Livraison:"})," ",we(A,B)]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Imprimé:"})," ",we(new Date().toISOString(),B,!0)]})]})]}),e.jsx("div",{className:"rounded-xl border border-slate-200 bg-white p-2",children:e.jsx(Dr,{value:Se,size:112,level:qr,includeMargin:!0})})]})}),e.jsxs("div",{className:"grid gap-4 px-5 py-4 md:grid-cols-2",children:[e.jsxs("section",{className:"detail-card rounded-xl border border-slate-200 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-[#1E73BE]",children:[e.jsx(hr,{className:"h-4 w-4"}),e.jsx("h2",{className:"text-sm font-bold uppercase tracking-wide",children:"Organisme"})]}),e.jsxs("div",{className:"space-y-2 text-sm text-slate-700",children:[e.jsx("p",{className:"text-base font-bold text-slate-900",children:$(c?.nombre,t?.nombreOrganismo)}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Type:"})," ",$(c?.tipo)]}),e.jsxs("p",{className:"flex items-start gap-2",children:[e.jsx(gr,{className:"mt-0.5 h-4 w-4 text-slate-400"}),e.jsx("span",{children:$(c?.direccion)})]}),e.jsxs("p",{className:"flex items-center gap-2",children:[e.jsx(Gr,{className:"h-4 w-4 text-slate-400"}),e.jsx("span",{children:$(c?.telefono)})]}),e.jsxs("p",{className:"flex items-center gap-2",children:[e.jsx(fr,{className:"h-4 w-4 text-slate-400"}),e.jsx("span",{children:$(c?.email)})]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Responsable:"})," ",ge]})]})]}),e.jsxs("section",{className:"detail-card rounded-xl border border-slate-200 p-4",children:[e.jsxs("div",{className:"mb-3 flex items-center gap-2 text-[#2E7D32]",children:[e.jsx(Ot,{className:"h-4 w-4"}),e.jsx("h2",{className:"text-sm font-bold uppercase tracking-wide",children:T?"Consignes de préparation":"Détails de la commande"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700",children:[e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Créée:"})," ",we(W,B,!0)]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Livraison:"})," ",we(A,B)]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Heure prévue:"})," ",$(t?.horaRecogida,c?.horaCita,"À convenir")]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Préparée par:"})," ",fe]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Priorité:"})," ",$(t?.prioridad,"Normale")]}),e.jsxs("p",{children:[e.jsx("span",{className:"font-semibold",children:"Type:"})," ",$(t?.tipo,"Standard")]})]})]})]}),e.jsxs("div",{className:"grid gap-3 px-5 pb-4 md:grid-cols-4",children:[e.jsxs("div",{className:"summary-card rounded-xl bg-slate-50 p-3",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wide text-slate-500",children:"Articles"}),e.jsx("p",{className:"mt-1 text-2xl font-bold text-slate-900",children:g.length})]}),e.jsxs("div",{className:"summary-card rounded-xl bg-slate-50 p-3",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wide text-slate-500",children:"Unités"}),e.jsx("p",{className:"mt-1 text-2xl font-bold text-slate-900",children:ve(ae)})]}),e.jsxs("div",{className:"summary-card rounded-xl bg-slate-50 p-3",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wide text-slate-500",children:"Poids estimé"}),e.jsxs("p",{className:"mt-1 text-2xl font-bold text-slate-900",children:[ve(V)," kg"]})]}),e.jsxs("div",{className:"summary-card rounded-xl bg-slate-50 p-3",children:[e.jsx("p",{className:"text-xs font-semibold uppercase tracking-wide text-slate-500",children:T?"Heure prévue":"Valeur estimée"}),e.jsx("p",{className:"mt-1 text-2xl font-bold text-slate-900",children:T?$(t?.horaRecogida,c?.horaCita,"À convenir"):`CAD$ ${nt(me)}`})]})]}),e.jsxs("div",{className:"px-5 pb-4",children:[e.jsxs("div",{className:"mb-2 flex items-center gap-2 text-[#1E73BE]",children:[e.jsx(he,{className:"h-4 w-4"}),e.jsx("h2",{className:"text-sm font-bold uppercase tracking-wide",children:T?"Fiche de préparation manuelle":"Détail des produits"})]}),e.jsx("div",{className:"overflow-hidden rounded-xl border border-slate-200",children:e.jsxs("table",{className:"w-full border-collapse text-left text-sm",children:[e.jsx("thead",{className:"bg-slate-50 text-slate-600",children:e.jsxs("tr",{children:[e.jsx("th",{className:"px-3 py-2 font-semibold",children:"Produit"}),e.jsx("th",{className:"px-3 py-2 font-semibold",children:"Temp."}),e.jsx("th",{className:"px-3 py-2 text-right font-semibold",children:"Qté"}),e.jsx("th",{className:"px-3 py-2 font-semibold",children:"Unité"}),T?e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-3 py-2 text-right font-semibold",children:"Qté préparée"}),e.jsx("th",{className:"px-3 py-2 font-semibold",children:"Vérifié"}),e.jsx("th",{className:"px-3 py-2 font-semibold",children:"Notes préparation"})]}):e.jsxs(e.Fragment,{children:[e.jsx("th",{className:"px-3 py-2 text-right font-semibold",children:"Poids"}),e.jsx("th",{className:"px-3 py-2 text-right font-semibold",children:"Valeur"}),e.jsx("th",{className:"px-3 py-2 font-semibold",children:"Observations"})]})]})}),e.jsx("tbody",{children:g.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:7,className:"px-3 py-6 text-center text-sm text-slate-500",children:"Aucun produit enregistré dans cette commande."})}):U.map((k,w)=>{const{item:_,product:H}=k,Y=ye(_?.cantidad),K=ye(_?.peso),D=Ft(_,H),X=Y*D,J=w>0?U[w-1]?.grupoTemperatura:null,oe=k.grupoTemperatura!==J;return e.jsxs(et.Fragment,{children:[oe&&e.jsx("tr",{className:"border-t border-slate-200 bg-[#EAF4FF]",children:e.jsx("td",{colSpan:7,className:"px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#1E73BE] print-table",children:k.grupoTemperatura})}),e.jsxs("tr",{className:"border-t border-slate-200 align-top",children:[e.jsx("td",{className:"px-3 py-2 font-medium text-slate-900 print-table",children:$(_?.nombreProducto,_?.productoNombre,H?.nombre)}),e.jsx("td",{className:"px-3 py-2 text-slate-600 print-table",children:St(k.temperaturaOriginalEntrada||k.temperatura)}),e.jsx("td",{className:"px-3 py-2 text-right text-slate-700 print-table",children:ve(Y)}),e.jsx("td",{className:"px-3 py-2 text-slate-700 print-table",children:$(_?.unidad,"u")}),T?e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-3 py-2 text-right text-slate-700 print-table",children:"__________"}),e.jsx("td",{className:"px-3 py-2 text-slate-700 print-table",children:"[ ]"}),e.jsx("td",{className:"px-3 py-2 text-slate-600 print-table",children:"________________________"})]}):e.jsxs(e.Fragment,{children:[e.jsx("td",{className:"px-3 py-2 text-right text-slate-700 print-table",children:K>0?`${ve(K)} kg`:"-"}),e.jsx("td",{className:"px-3 py-2 text-right text-slate-700 print-table",children:X>0?`CAD$ ${nt(X)}`:"-"}),e.jsx("td",{className:"px-3 py-2 text-slate-600 print-table",children:$(_?.observaciones)})]})]})]},`${_?.productoId||_?.nombreProducto||"item"}-${w}`)})})]})})]}),e.jsxs("div",{className:"grid gap-4 border-t border-slate-200 px-5 py-4 md:grid-cols-2",children:[e.jsxs("section",{className:"detail-card rounded-xl border border-slate-200 p-4",children:[e.jsx("h2",{className:"mb-2 text-sm font-bold uppercase tracking-wide text-slate-700",children:T?"Instructions et observations":"Observations générales"}),e.jsx("p",{className:"min-h-[72px] text-sm text-slate-700",children:$(t?.observaciones,T?"Inscrire manuellement les quantités preparées et noter toute substitution.":"Aucune observation supplémentaire.")})]}),e.jsxs("section",{className:"detail-card rounded-xl border border-slate-200 p-4",children:[e.jsx("h2",{className:"mb-2 text-sm font-bold uppercase tracking-wide text-slate-700",children:T?"Validation de préparation":"Validation et signatures"}),e.jsxs("div",{className:"grid grid-cols-2 gap-4 text-sm text-slate-700",children:[e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold",children:"Préparée par"}),e.jsx("div",{className:"mt-6 border-b border-slate-300"}),e.jsx("p",{className:"mt-2",children:fe})]}),e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold",children:T?"Vérifiée par":"Reçue par"}),e.jsx("div",{className:"mt-6 border-b border-slate-300"}),e.jsx("p",{className:"mt-2",children:T?"______________________________":ge})]})]})]})]})]})]})})]})}async function ja(t){const c=br(),i=c.systemName,n={foodBank:t.translations?.foodBank||i,brandSubtitle:t.translations?.brandSubtitle||"Système de gestion des commandes",orderLabel:t.translations?.orderLabel||"Étiquette de Commande",orderNumber:t.translations?.orderNumber||"N° Commande",deliveryDate:t.translations?.deliveryDate||"Livraison",status:t.translations?.status||"Statut",products:t.translations?.products||"Produits",articles:t.translations?.articles||"articles",productDetailsTitle:t.translations?.productDetailsTitle||"",recipient:t.translations?.recipient||"Organisme Destinataire",name:t.translations?.name||"Nom",type:t.translations?.type||"Type",address:t.translations?.address||"Adresse",responsible:t.translations?.responsible||"Responsable",phone:t.translations?.phone||"Téléphone",observations:t.translations?.observations||"Observations",deliveredBy:t.translations?.deliveredBy||"Remis par",receivedBy:t.translations?.receivedBy||"Reçu par",nameAndSignature:t.translations?.nameAndSignature||"Nom et signature",printedOn:t.translations?.printedOn||"Imprimé le",systemFooter:t.translations?.systemFooter||"Système de Gestion des Commandes",pending:t.translations?.pending||"EN ATTENTE",confirmed:t.translations?.confirmed||"ACCEPTÉE",inPreparation:t.translations?.inPreparation||"EN PRÉPARATION",ready:t.translations?.ready||"PRÊTE",delivered:t.translations?.delivered||"LIVRÉE",cancelled:t.translations?.cancelled||"ANNULÉE"},N=fs({numeroComanda:t.numeroComanda,organismo:t.organismoNombre,fecha:t.fechaEntrega,items:t.items.length});let L="";try{L=await Dt(N,{width:180,...Pt})}catch(A){console.error("Error generando QR:",A)}const B={pendiente:{label:n.pending,color:"#FFC107"},confirmada:{label:n.confirmed,color:"#7E57C2"},en_preparacion:{label:n.inPreparation,color:"#1E73BE"},completada:{label:n.ready,color:"#4CAF50"},entregada:{label:n.delivered,color:"#4CAF50"},anulada:{label:n.cancelled,color:"#DC3545"}},z=B[t.estado]||B.pendiente,E=!!n.productDetailsTitle,g=t.items.slice(0,E?3:4),R=Math.max(0,t.items.length-g.length),Q=n.productDetailsTitle?`
        <div class="details-title">${n.productDetailsTitle}</div>
        <div class="details-list">
          ${g.map(A=>`
            <div class="product-line">
              <span class="product-name">${A.icono?`${A.icono} `:""}${A.nombre}</span>
              <span class="product-qty">${A.cantidad} ${A.unidad}</span>
            </div>
          `).join("")}
          ${R>0?`
            <div class="product-more">+${R} article${R>1?"s":""}</div>
          `:""}
        </div>
    `:"";t.items.reduce((A,W)=>A+(W.peso||0)*W.cantidad,0);const U=A=>new Date(A).toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"}),G=A=>A.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});return`
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${n.orderLabel} - ${t.numeroComanda}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700&family=Roboto:wght@400;500&display=swap" rel="stylesheet">
  <style>
    @page {
      size: letter;
      margin: ${E?"0.28in 0.35in":"0.4in 0.5in"};
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

    .etiqueta-container.compact-print {
      border-width: 2px;
    }
    
    /* HEADER */
    .etiqueta-header {
      background: white;
      padding: 14px 16px;
      border-bottom: 3px solid #1E73BE;
    }

    .brand-panel {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 14px 16px;
      border: 1px solid #d7e3ef;
      border-radius: 18px;
      background: linear-gradient(135deg, #f7fbff 0%, #eef6fb 48%, #f6fbf7 100%);
      box-shadow: 0 12px 30px rgba(15, 45, 71, 0.08);
      text-align: left;
    }
    
    .etiqueta-header h1 {
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 32px;
      color: #1E73BE;
      margin: 0;
      letter-spacing: 0;
    }
    
    .etiqueta-header p {
      font-family: 'Roboto', sans-serif;
      font-size: 15px;
      color: #64748b;
      margin: 0;
    }

    .etiqueta-header .brand-subtitle {
      font-size: 18px;
      font-weight: 600;
      color: #475569;
    }

    .etiqueta-header .document-label {
      margin-top: 8px;
      font-size: 12px;
      color: #7c8a99;
      font-weight: 600;
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

    .productos-box .details-title {
      font-family: 'Montserrat', sans-serif;
      font-size: 8px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #2E7D32;
      margin-top: 6px;
      margin-bottom: 4px;
    }

    .productos-box .details-list {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding-top: 4px;
      border-top: 1px solid rgba(76, 175, 80, 0.24);
    }

    .productos-box .product-line {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 6px;
      font-family: 'Roboto', sans-serif;
      font-size: 9px;
      color: #334155;
    }

    .productos-box .product-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .productos-box .product-qty {
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }

    .productos-box .product-more {
      font-family: 'Roboto', sans-serif;
      font-size: 8px;
      color: #64748b;
      text-align: right;
      margin-top: 1px;
    }

    .etiqueta-container.compact-print .etiqueta-header {
      padding: 10px 12px;
    }

    .etiqueta-container.compact-print .brand-panel {
      gap: 2px;
      padding: 10px 12px;
      border-radius: 14px;
      box-shadow: 0 8px 18px rgba(15, 45, 71, 0.06);
    }

    .etiqueta-container.compact-print .etiqueta-header h1 {
      font-size: 26px;
    }

    .etiqueta-container.compact-print .etiqueta-header p {
      font-size: 12px;
    }

    .etiqueta-container.compact-print .etiqueta-header .brand-subtitle {
      font-size: 15px;
    }

    .etiqueta-container.compact-print .etiqueta-header .document-label {
      margin-top: 6px;
      font-size: 11px;
    }

    .etiqueta-container.compact-print .grid-superior,
    .etiqueta-container.compact-print .grid-comanda {
      gap: 8px;
      padding-left: 12px;
      padding-right: 12px;
    }

    .etiqueta-container.compact-print .grid-superior {
      padding-top: 8px;
      padding-bottom: 8px;
      align-items: stretch;
    }

    .etiqueta-container.compact-print .grid-comanda {
      padding-bottom: 8px;
    }

    .etiqueta-container.compact-print .qr-section {
      padding: 8px;
    }

    .etiqueta-container.compact-print .qr-section img {
      width: 98px;
      height: 98px;
    }

    .etiqueta-container.compact-print .qr-id {
      font-size: 9px;
      margin-top: 4px;
    }

    .etiqueta-container.compact-print .productos-box {
      align-items: flex-start;
      justify-content: flex-start;
      text-align: left;
      padding: 8px 10px;
    }

    .etiqueta-container.compact-print .productos-box .icon {
      font-size: 22px;
      margin-bottom: 2px;
    }

    .etiqueta-container.compact-print .productos-box .label {
      font-size: 8px;
      margin-bottom: 2px;
    }

    .etiqueta-container.compact-print .productos-box .number {
      font-size: 28px;
      line-height: 0.95;
    }

    .etiqueta-container.compact-print .productos-box .sublabel {
      font-size: 9px;
    }

    .etiqueta-container.compact-print .comanda-box,
    .etiqueta-container.compact-print .estado-box {
      padding: 10px;
    }

    .etiqueta-container.compact-print .comanda-box .number {
      font-size: 22px;
    }

    .etiqueta-container.compact-print .estado-badge {
      font-size: 11px;
      padding: 5px 10px;
    }

    .etiqueta-container.compact-print .fecha-entrega-section,
    .etiqueta-container.compact-print .organismo-section,
    .etiqueta-container.compact-print .firmas-section,
    .etiqueta-container.compact-print .etiqueta-footer {
      padding-left: 12px;
      padding-right: 12px;
    }

    .etiqueta-container.compact-print .fecha-entrega-section {
      padding-top: 8px;
      padding-bottom: 8px;
      gap: 8px;
    }

    .etiqueta-container.compact-print .fecha-entrega-section .icon {
      font-size: 20px;
    }

    .etiqueta-container.compact-print .fecha-entrega-section .fecha {
      font-size: 17px;
    }

    .etiqueta-container.compact-print .organismo-section {
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .etiqueta-container.compact-print .organismo-title {
      margin-bottom: 6px;
    }

    .etiqueta-container.compact-print .organismo-grid {
      gap: 5px;
    }

    .etiqueta-container.compact-print .organismo-field {
      padding: 5px 7px;
    }

    .etiqueta-container.compact-print .organismo-field .value {
      font-size: 10px;
    }

    .etiqueta-container.compact-print .organismo-field .value.highlight {
      font-size: 11px;
    }

    .etiqueta-container.compact-print .firmas-section {
      gap: 8px;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .etiqueta-container.compact-print .firma-line {
      height: 22px;
    }

    .etiqueta-container.compact-print .etiqueta-footer {
      padding-top: 6px;
      padding-bottom: 6px;
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
      background: ${z.color};
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
  <div class="etiqueta-container${E?" compact-print":""}">
    <!-- HEADER -->
    <div class="etiqueta-header">
      <div class="brand-panel">
        <h1>${n.foodBank}</h1>
        <p class="brand-subtitle">${n.brandSubtitle}</p>
        ${c.address?`<p>${c.address}</p>`:""}
        ${c.phone?`<p>${c.phone}</p>`:""}
      </div>
      <p class="document-label">${n.orderLabel}</p>
    </div>
    
    <!-- GRID SUPERIOR: QR + PRODUCTOS -->
    <div class="grid-superior">
      <!-- QR Code -->
      <div class="qr-section">
        <img src="${L}" alt="QR Code" />
        <div class="qr-id">${t.numeroComanda}</div>
      </div>
      
      <!-- Productos -->
      <div class="productos-box">
        <div class="icon">📦</div>
        <div class="label">${n.products}</div>
        <div class="number">${t.items.length}</div>
        <div class="sublabel">${n.articles}</div>
        ${Q}
      </div>
    </div>
    
    <!-- GRID COMANDA + ESTADO -->
    <div class="grid-comanda">
      <!-- Número de Comanda -->
      <div class="comanda-box">
        <div class="label">${n.orderNumber}</div>
        <div class="number">${t.numeroComanda}</div>
      </div>
      
      <!-- Estado -->
      <div class="estado-box">
        <div class="label">${n.status}</div>
        <div class="estado-badge">${z.label}</div>
      </div>
    </div>
    
    <!-- FECHA ENTREGA -->
    <div class="fecha-entrega-section">
      <div class="icon">📅</div>
      <div class="content">
        <div class="label">${n.deliveryDate}</div>
        <div class="fecha">${U(t.fechaEntrega)}</div>
        ${t.horaCita?`<div class="hora">${t.horaCita}</div>`:""}
      </div>
    </div>
    
    <!-- ORGANISMO -->
    <div class="organismo-section">
      <div class="organismo-title">
        <span>👤</span>
        <span>${n.recipient}</span>
      </div>
      <div class="organismo-grid">
        <div class="organismo-field full">
          <div class="label">${n.name}</div>
          <div class="value highlight">${t.organismoNombre}</div>
        </div>
        ${t.organismoTipo?`
          <div class="organismo-field">
            <div class="label">${n.type}</div>
            <div class="value">${t.organismoTipo}</div>
          </div>
        `:""}
        ${t.organismoResponsable?`
          <div class="organismo-field">
            <div class="label">${n.responsible}</div>
            <div class="value">${t.organismoResponsable}</div>
          </div>
        `:""}
        ${t.organismoDireccion?`
          <div class="organismo-field full">
            <div class="label">${n.address}</div>
            <div class="value">${t.organismoDireccion}</div>
          </div>
        `:""}
        ${t.organismoTelefono?`
          <div class="organismo-field">
            <div class="label">${n.phone}</div>
            <div class="value">${t.organismoTelefono}</div>
          </div>
        `:""}
      </div>
    </div>
    
    <!-- FIRMAS -->
    <div class="firmas-section">
      <div class="firma-box">
        <div class="label">${n.deliveredBy}:</div>
        <div class="firma-line"></div>
        <div class="sublabel">${n.nameAndSignature}</div>
      </div>
      <div class="firma-box">
        <div class="label">${n.receivedBy}:</div>
        <div class="firma-line" style="display:flex;align-items:flex-end;justify-content:center;padding-bottom:4px;font-weight:600;color:#333333;">${t.organismoResponsable||""}</div>
        <div class="sublabel">${n.nameAndSignature}</div>
      </div>
    </div>
    
    <!-- FOOTER -->
    <div class="etiqueta-footer">
      <p>${n.systemFooter}</p>
      ${Jt(c)?`<p>${Jt(c)}</p>`:""}
      <p class="timestamp">${n.printedOn}: ${G(new Date)}</p>
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
  
</body>
</html>
  `.trim()}async function Na(t){const c=await ja(t);Lr(c,{width:900,height:1100,printDelayMs:500})}function ya({open:t,onOpenChange:c,comanda:i,organismo:n,onConfirmar:N}){const L=kt(),[B,z]=x.useState(""),[E,g]=x.useState(""),[R,Q]=x.useState(""),U=()=>{if(!B){f.error("Veuillez sélectionner une nouvelle date");return}if(!E){f.error("Veuillez sélectionner une heure");return}if(!R.trim()){f.error("Veuillez indiquer le motif du changement");return}N(B,E,R),z(""),g(""),Q(""),c(!1),f.success(`Proposition de nouvelle date envoyée à l'organisme ${n?.nombre}`)},G=new Date(i?.fechaEntrega);return e.jsx(Me,{open:t,onOpenChange:c,children:e.jsxs(Le,{className:"max-w-2xl","aria-describedby":"proponer-fecha-description",children:[e.jsxs(Ge,{children:[e.jsx(Ve,{style:{fontFamily:"Montserrat, sans-serif",fontSize:"1.5rem"},children:"Proposer une nouvelle date de collecte"}),e.jsx(Ue,{id:"proponer-fecha-description",className:"text-[#666666]",children:"Suggérez une nouvelle date et une nouvelle heure pour la collecte de la commande"})]}),e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Commande :"}),e.jsx("p",{className:"font-bold text-[#1E73BE]",children:i?.id})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Organisme :"}),e.jsx("p",{className:"font-bold text-[#333333]",children:n?.nombre})]}),e.jsxs("div",{className:"col-span-2",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Date originale de collecte :"}),e.jsxs("p",{className:"font-bold text-[#DC3545]",children:[G.toLocaleDateString("fr-CA",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),n?.horaCita&&` à ${n.horaCita}`]})]})]})}),e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsxs(Oe,{className:"flex items-center gap-2",children:[e.jsx(Ot,{className:"w-4 h-4 text-[#1E73BE]"}),"Nouvelle date proposée *"]}),e.jsx(dt,{type:"date",value:B,onChange:A=>z(A.target.value),min:new Date().toISOString().split("T")[0],className:"text-base"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs(Oe,{className:"flex items-center gap-2",children:[e.jsx(us,{className:"w-4 h-4 text-[#1E73BE]"}),"Heure proposée *"]}),e.jsx(dt,{type:"time",value:E,onChange:A=>g(A.target.value),className:"text-base"})]})]}),B&&E&&e.jsxs("div",{className:"bg-green-50 border border-green-200 rounded-lg p-4",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:"Nouvelle date proposée :"}),e.jsxs("p",{className:"font-bold text-[#4CAF50]",style:{fontSize:"1.1rem"},children:[new Date(B).toLocaleDateString("fr-CA",{weekday:"long",year:"numeric",month:"long",day:"numeric"})," à ",E]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(Oe,{children:"Motif du changement de date *"}),e.jsx(Hr,{rows:4,value:R,onChange:A=>Q(A.target.value),placeholder:"Expliquez le motif de la proposition de changement de date de collecte (ex. : problème d'inventaire, ajustement d'horaire, disponibilité du personnel, etc.)",className:"resize-none"}),e.jsx("p",{className:"text-xs text-[#666666]",children:"Ce message sera envoyé à l'organisme avec la proposition de nouvelle date"})]})]}),e.jsx("div",{className:"bg-yellow-50 border border-yellow-200 rounded-lg p-4",children:e.jsxs("p",{className:"text-sm text-[#666666] flex items-start gap-2",children:[e.jsx("span",{className:"text-[#FFC107] font-bold",children:"ℹ️"}),e.jsxs("span",{children:["L'organisme recevra une notification avec la nouvelle date proposée et pourra l'accepter ou contacter",L.systemName," pour coordonner une autre date. La commande restera en attente jusqu'à la confirmation de la nouvelle date."]})]})}),e.jsxs("div",{className:"flex justify-end gap-3 pt-4 border-t",children:[e.jsxs(F,{variant:"outline",onClick:()=>{z(""),g(""),Q(""),c(!1)},children:[e.jsx(lt,{className:"w-4 h-4 mr-2"}),"Annuler"]}),e.jsxs(F,{onClick:U,className:"bg-[#1E73BE] hover:bg-[#1557A0]",disabled:!B||!E||!R.trim(),children:[e.jsx(Yr,{className:"w-4 h-4 mr-2"}),"Envoyer la proposition"]})]})]})]})})}const wa=x.lazy(async()=>({default:(await hs(()=>import("./GuiaPermisoCamara-DeRUzuWp.js"),__vite__mapDeps([0,1,2,3,4,5,6,7]))).GuiaPermisoCamara})),ps=()=>hs(()=>import("./index-2SlHBN_i.js"),__vite__mapDeps([8,1]));function Ca({onScanSuccess:t,onClose:c,autoStartCamera:i=!1}){const[n,N]=x.useState(i?"camara":null),[L,B]=x.useState(!1),[z,E]=x.useState(null),[g,R]=x.useState(null),[Q,U]=x.useState(!1),G=x.useRef(null),A=x.useRef(null),W=x.useRef(null),ge=x.useRef(!1),fe=typeof g?.tipo=="string"?g.tipo:"",ae=vs(g),V=js(g),me=fe==="ubicacion"||!!ae?.ubicacion,Se=fe==="producto"||!!(g?.codigo||g?.producto||g?.nombre||V),T=me||Se;x.useEffect(()=>()=>{D(),Fe()},[]),x.useEffect(()=>{!i||ge.current||(ge.current=!0,w())},[i]);const Fe=()=>{if(A.current)try{A.current.getTracks().forEach(j=>j.stop()),A.current=null}catch{}},k=()=>{E(null),N("preparandoCamara")},w=async()=>{if(E(null),N("camara"),!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){E("browser_not_supported");return}try{let j;try{j=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}}),A.current=j}catch(q){console.log("⚠️ Autorisation de la caméra requise"),q.name==="NotAllowedError"||q.message?.includes("Permission denied")?E("permission_denied"):q.name==="NotFoundError"?E("camera_not_found"):q.name==="NotReadableError"?E("camera_in_use"):q.name==="OverconstrainedError"?E("camera_constraints"):q.name==="SecurityError"?E("security_error"):E("unknown_error");return}Fe(),await new Promise(q=>setTimeout(q,200)),await D();const I="qr-reader-camera",{Html5Qrcode:be}=await ps(),se=new be(I);G.current=se;const ee=await be.getCameras();if(!ee||ee.length===0){E("camera_not_found");return}let pe=ee[0];const ne=ee.find(q=>q.label.toLowerCase().includes("back")||q.label.toLowerCase().includes("rear")||q.label.toLowerCase().includes("trasera")||q.label.toLowerCase().includes("arrière")||q.label.toLowerCase().includes("environment"));ne?(pe=ne,console.log("✓ Caméra arrière sélectionnée :",ne.label)):console.log("→ Caméra utilisée :",pe.label),await se.start(pe.id,{fps:12,qrbox:(q,ct)=>{const Pe=Math.max(180,Math.floor(Math.min(q,ct)*.72));return{width:Pe,height:Pe}}},q=>{_(q)},q=>{}),B(!0),E(null)}catch(j){console.error("Erreur inattendue au démarrage du scanner :",j),E("unknown_error")}},_=async j=>{await D(),B(!1);try{const I=JSON.parse(j);R(I)}catch{R({text:j})}},H=j=>{g&&t(g,j==="agregar_o_modificar_ubicacion_producto"?"localizar_productos":j)},Y=async()=>{R(null),E(null),await w()},K=async j=>{const I=j.target.files?.[0];if(I){N("archivo"),E(null);try{await D(),await new Promise(ne=>setTimeout(ne,100));const be="qr-reader-file",{Html5Qrcode:se}=await ps(),ee=new se(be);G.current=ee;const pe=await ee.scanFile(I,!0);_(pe)}catch(be){console.error("Erreur lors du scan du fichier :",be),E("qr_not_found_in_image")}finally{await D()}}},D=async()=>{if(G.current)try{const j=G.current;await j.getState()===2&&await j.stop(),await j.clear()}catch{}finally{G.current=null}Fe()},X=async()=>{await D(),c()},J=()=>{W.current?.click()},oe=async()=>{if(await D(),E(null),B(!1),i){R(null),await w();return}N(null)},te=j=>{const I={permission_denied:{title:"Accès à la caméra refusé",description:"Vous avez bloqué l'accès à la caméra. Pour utiliser le scanner, vous devez autoriser l'accès dans les paramètres de votre navigateur.",showGuide:!0},camera_not_found:{title:"Aucune caméra trouvée",description:"Aucune caméra n'a été détectée sur cet appareil. Veuillez vérifier que votre caméra est connectée et fonctionne correctement.",showGuide:!1},camera_in_use:{title:"Caméra déjà utilisée",description:"La caméra est utilisée par une autre application. Fermez les autres applications utilisant la caméra et réessayez.",showGuide:!1},camera_constraints:{title:"Caméra non compatible",description:"Les paramètres de la caméra ne sont pas compatibles avec votre appareil.",showGuide:!1},security_error:{title:"Erreur de sécurité",description:"Accès à la caméra bloqué pour des raisons de sécurité. Assurez-vous d'utiliser HTTPS ou localhost.",showGuide:!1},browser_not_supported:{title:"Navigateur non supporté",description:"Votre navigateur ne supporte pas l'accès à la caméra. Veuillez utiliser un navigateur moderne (Chrome, Firefox, Safari).",showGuide:!1},qr_not_found_in_image:{title:"QR non trouvé",description:"Aucun code QR n'a été trouvé dans l'image. Veuillez essayer une autre image avec un code QR bien visible et de bonne qualité.",showGuide:!1},unknown_error:{title:"Erreur inconnue",description:"Une erreur inattendue s'est produite lors de l'accès à la caméra.",showGuide:!1}};return I[j]||I.unknown_error},S=()=>{if(!z)return null;const j=te(z),I=z==="permission_denied";return e.jsxs("div",{className:"text-center py-8",children:[e.jsx(rt,{className:`w-20 h-20 mx-auto mb-4 ${I?"text-[#DC3545]":"text-[#FFC107]"}`}),e.jsx("h3",{className:"text-2xl font-bold text-[#333] mb-3",style:{fontFamily:"Montserrat"},children:j.title}),e.jsx("p",{className:"text-gray-700 mb-6 max-w-md mx-auto",children:j.description}),I&&e.jsxs("div",{className:"bg-red-50 border-2 border-[#DC3545] rounded-lg p-5 mb-6 max-w-md mx-auto text-left",children:[e.jsxs("h4",{className:"font-bold text-[#DC3545] mb-3 flex items-center gap-2",children:[e.jsx(Zt,{className:"w-5 h-5"}),"Comment débloquer l'accès:"]}),e.jsxs("ol",{className:"space-y-2 text-sm text-gray-700",children:[e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"1."}),e.jsx("span",{children:"Regardez dans la barre d'adresse de votre navigateur"})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"2."}),e.jsxs("span",{children:["Cliquez sur l'icône ",e.jsx("strong",{children:"🔒"})," ou ",e.jsx("strong",{children:"🛡️"})]})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"3."}),e.jsxs("span",{children:['Trouvez "Caméra" et changez à ',e.jsx("strong",{className:"text-[#4CAF50]",children:'"Autoriser"'})]})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#DC3545]",children:"4."}),e.jsxs("span",{children:["Revenez ici puis cliquez sur ",e.jsx("strong",{children:"Réessayer"})]})]})]})]}),e.jsxs("div",{className:"space-y-3 max-w-md mx-auto",children:[j.showGuide&&e.jsxs("button",{onClick:()=>U(!0),className:"w-full px-6 py-3 bg-[#1E73BE] text-white rounded-lg hover:bg-[#1557A0] transition-colors font-bold flex items-center justify-center gap-2 text-lg",style:{fontFamily:"Montserrat"},children:[e.jsx(Ct,{className:"w-5 h-5"}),"Guide complet avec images"]}),e.jsxs("div",{className:`${j.showGuide?"border-t-2 border-gray-200 pt-4 mt-4":""}`,children:[e.jsx("p",{className:"text-sm font-semibold text-gray-700 mb-3",children:"Alternative sans caméra:"}),e.jsxs("button",{onClick:J,className:"w-full px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-bold flex items-center justify-center gap-2",style:{fontFamily:"Montserrat"},children:[e.jsx(at,{className:"w-5 h-5"}),"Télécharger une image du QR"]}),e.jsx("p",{className:"text-xs text-gray-500 mt-2",children:"✓ Fonctionne sans autorisation de caméra"})]}),e.jsxs("div",{className:"flex gap-3 mt-4",children:[e.jsx("button",{onClick:k,className:"flex-1 px-6 py-2 border-2 border-[#1E73BE] text-[#1E73BE] rounded-lg hover:bg-[#1E73BE] hover:text-white transition-colors font-medium",children:"Réessayer"}),e.jsx("button",{onClick:oe,className:"flex-1 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Retour"})]})]})]})};return e.jsxs(e.Fragment,{children:[Q&&e.jsx(x.Suspense,{fallback:null,children:e.jsx(wa,{onClose:()=>U(!1)})}),e.jsx("div",{className:"fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4",children:e.jsxs("div",{className:"bg-white rounded-xl shadow-2xl max-w-[640px] w-full h-[min(80vh,640px)] overflow-hidden flex flex-col",children:[e.jsxs("div",{className:"bg-[#1E73BE] text-white p-4 flex items-center justify-between sticky top-0 z-10",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(it,{className:"w-6 h-6"}),e.jsx("h2",{className:"font-bold text-xl",style:{fontFamily:"Montserrat"},children:"Scanner Code QR"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("button",{onClick:()=>U(!0),className:"hover:bg-white/20 p-2 rounded-lg transition-colors",title:"Aide: Comment autoriser la caméra",children:e.jsx(Ct,{className:"w-5 h-5"})}),e.jsx("button",{onClick:X,className:"hover:bg-white/20 p-2 rounded-lg transition-colors",children:e.jsx(lt,{className:"w-5 h-5"})})]})]}),e.jsxs("div",{className:"flex-1 min-h-0 p-4 md:p-5",children:[e.jsx("input",{ref:W,type:"file","data-testid":"orders-qr-file-input",accept:"image/*",onChange:K,className:"hidden"}),g?e.jsxs("div",{className:"flex h-full min-h-0 flex-col",children:[e.jsxs("div",{className:"mb-3 shrink-0 text-center",children:[e.jsx(vr,{className:"mx-auto mb-2 h-10 w-10 text-[#4CAF50]"}),e.jsx("p",{className:"mb-1 text-lg font-bold text-[#4CAF50]",children:"Code QR scanné avec succès!"}),e.jsx("p",{className:"text-gray-600 text-sm",children:T?"Ce QR a été lu correctement, mais ses actions appartiennent au module Inventaire.":"Choisissez l'action à effectuer pour cette commande."})]}),e.jsxs("div",{className:"grid min-h-0 flex-1 gap-3 overflow-y-auto pr-1 lg:grid-cols-[minmax(220px,0.78fr)_minmax(0,1.22fr)]",children:[e.jsx("div",{className:"rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm shadow-sm",children:me?e.jsxs(e.Fragment,{children:[(ae?.codigo||g?.codigo)&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Code: "}),e.jsx("span",{className:"text-[#333] font-mono",children:ae?.codigo||g?.codigo})]}),(ae?.ubicacion||g?.ubicacion||g?.text)&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Emplacement: "}),e.jsx("span",{className:"text-[#1E73BE] font-black text-lg",children:ae?.ubicacion||g?.ubicacion||g?.text})]})]}):Se?e.jsxs(e.Fragment,{children:[(V?.producto||V?.nombre)&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Produit: "}),e.jsx("span",{className:"text-[#1E73BE] font-black text-lg",children:V?.producto||V?.nombre})]}),V?.codigo&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Code: "}),e.jsx("span",{className:"text-[#333] font-mono",children:V.codigo})]}),V?.ubicacion&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Emplacement: "}),e.jsx("span",{className:"text-[#333]",children:V.ubicacion})]}),g.text&&!V?.producto&&!V?.nombre&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Données: "}),e.jsx("span",{className:"text-[#333] text-sm break-all",children:g.text})]})]}):e.jsxs(e.Fragment,{children:[g.comanda&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"N° Commande: "}),e.jsx("span",{className:"text-[#1E73BE] font-black text-lg",children:g.comanda})]}),g.organismo&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Organisme: "}),e.jsx("span",{className:"text-[#333]",children:g.organismo})]}),g.fecha&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Date: "}),e.jsx("span",{className:"text-[#333]",children:g.fecha})]}),g.items!==void 0&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Articles: "}),e.jsx("span",{className:"text-[#4CAF50] font-bold",children:g.items})]}),g.text&&!g.comanda&&e.jsxs("div",{className:"mb-1.5",children:[e.jsx("span",{className:"font-bold text-[#666]",children:"Données: "}),e.jsx("span",{className:"text-[#333] text-sm break-all",children:g.text})]})]})}),e.jsxs("div",{className:"min-h-0",children:[e.jsx("h3",{className:"mb-3 text-center text-lg font-bold text-[#333]",style:{fontFamily:"Montserrat"},children:T?"QR d'un autre module":"Que souhaitez-vous faire?"}),e.jsx("div",{className:"grid gap-2 sm:grid-cols-2",children:T?e.jsx("div",{className:"sm:col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left shadow-sm",children:e.jsxs("div",{className:"flex items-start gap-2.5",children:[e.jsx(rt,{className:"mt-0.5 h-5 w-5 shrink-0 text-amber-600"}),e.jsxs("div",{className:"space-y-1.5",children:[e.jsx("h4",{className:"text-[15px] font-bold leading-5 text-amber-900",children:me?"QR d'emplacement détecté":"QR de produit détecté"}),e.jsx("p",{className:"text-xs leading-4 text-amber-900/90",children:"Ce QR est informatif dans Commandes."}),e.jsx("p",{className:"text-xs leading-4 text-amber-900/80",children:me?"Pour gérer l'emplacement, ouvrez Inventaire.":"Pour gérer le produit, ouvrez Inventaire."})]})]})}):e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:()=>H("ver_detalles"),className:"w-full group flex items-start gap-2.5 rounded-xl border-2 border-[#1E73BE] p-3 text-left transition-all hover:bg-[#1E73BE] hover:shadow-lg",children:[e.jsx(Ie,{className:"h-5 w-5 text-[#1E73BE] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"text-[15px] font-bold leading-5 text-[#333] group-hover:text-white transition-colors",children:"Voir les détails"}),e.jsx("p",{className:"mt-1 text-xs leading-4 text-gray-600 group-hover:text-white/80 transition-colors",children:"Ouvrir la commande."})]})]}),e.jsxs("button",{onClick:()=>H("marcar_entregado"),className:"w-full group flex items-start gap-2.5 rounded-xl border-2 border-[#4CAF50] p-3 text-left transition-all hover:bg-[#4CAF50] hover:shadow-lg",children:[e.jsx(he,{className:"h-5 w-5 text-[#4CAF50] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"text-[15px] font-bold leading-5 text-[#333] group-hover:text-white transition-colors",children:"Marquer comme livré"}),e.jsx("p",{className:"mt-1 text-xs leading-4 text-gray-600 group-hover:text-white/80 transition-colors",children:"Confirmer la livraison."})]})]}),e.jsxs("button",{onClick:()=>H("gestionar_transporte"),className:"w-full group flex items-start gap-2.5 rounded-xl border-2 border-[#FFC107] p-3 text-left transition-all hover:bg-[#FFC107] hover:shadow-lg",children:[e.jsx(jr,{className:"h-5 w-5 text-[#FFC107] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"text-[15px] font-bold leading-5 text-[#333] group-hover:text-white transition-colors",children:"Gérer le transport"}),e.jsx("p",{className:"mt-1 text-xs leading-4 text-gray-600 group-hover:text-white/80 transition-colors",children:"Modifier le transport."})]})]}),e.jsxs("button",{onClick:()=>H("modificar"),className:"w-full group flex items-start gap-2.5 rounded-xl border-2 border-[#666] p-3 text-left transition-all hover:bg-[#666] hover:shadow-lg",children:[e.jsx(Nr,{className:"h-5 w-5 text-[#666] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"text-[15px] font-bold leading-5 text-[#333] group-hover:text-white transition-colors",children:"Modifier la commande"}),e.jsx("p",{className:"mt-1 text-xs leading-4 text-gray-600 group-hover:text-white/80 transition-colors",children:"Éditer la commande."})]})]}),e.jsxs("button",{onClick:()=>H("cancelar"),className:"w-full group flex items-start gap-2.5 rounded-xl border-2 border-[#DC3545] p-3 text-left transition-all hover:bg-[#DC3545] hover:shadow-lg",children:[e.jsx(Kr,{className:"h-5 w-5 text-[#DC3545] group-hover:text-white transition-colors"}),e.jsxs("div",{className:"flex-1 text-left",children:[e.jsx("h4",{className:"text-[15px] font-bold leading-5 text-[#333] group-hover:text-white transition-colors",children:"Annuler la commande"}),e.jsx("p",{className:"mt-1 text-xs leading-4 text-gray-600 group-hover:text-white/80 transition-colors",children:"Annuler la commande."})]})]})]})})]})]}),e.jsxs("div",{className:"mt-3 flex shrink-0 flex-wrap justify-center gap-2 pt-3 border-t border-gray-200",children:[e.jsxs("button",{onClick:Y,className:"flex items-center gap-2 rounded-lg border-2 border-[#1E73BE] px-4 py-2 text-sm font-medium text-[#1E73BE] transition-colors hover:bg-[#1E73BE] hover:text-white",children:[e.jsx(it,{className:"w-4 h-4"}),"Scanner un autre QR"]}),e.jsx("button",{onClick:X,className:"rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50",children:"Fermer"})]})]}):n===null?e.jsxs("div",{className:"h-full flex flex-col justify-center",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx(it,{className:"w-16 h-16 text-[#1E73BE] mx-auto mb-3"}),e.jsx("h3",{className:"text-lg font-bold text-[#333] mb-2",style:{fontFamily:"Montserrat"},children:"Choisissez une méthode de scan"}),e.jsx("p",{className:"text-gray-600 text-sm",children:"Scannez avec votre caméra ou téléchargez une image"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("button",{onClick:k,className:"group border-2 border-[#1E73BE] hover:bg-[#1E73BE] rounded-xl p-6 transition-all hover:shadow-lg",children:[e.jsx(Et,{className:"w-12 h-12 text-[#1E73BE] group-hover:text-white mx-auto mb-3 transition-colors"}),e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white mb-2 transition-colors",style:{fontFamily:"Montserrat"},children:"Scanner avec Caméra"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/90 transition-colors",children:"Utilisez la caméra de votre appareil"})]}),e.jsxs("button",{onClick:J,className:"group border-2 border-[#4CAF50] hover:bg-[#4CAF50] rounded-xl p-6 transition-all hover:shadow-lg",children:[e.jsx(at,{className:"w-12 h-12 text-[#4CAF50] group-hover:text-white mx-auto mb-3 transition-colors"}),e.jsx("h4",{className:"font-bold text-[#333] group-hover:text-white mb-2 transition-colors",style:{fontFamily:"Montserrat"},children:"Télécharger Image"}),e.jsx("p",{className:"text-sm text-gray-600 group-hover:text-white/90 transition-colors",children:"Sélectionnez une image avec QR"})]})]}),e.jsx("div",{className:"mt-6 text-center",children:e.jsx("button",{onClick:X,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Annuler"})})]}):n==="preparandoCamara"?e.jsxs("div",{className:"h-full flex flex-col justify-center",children:[e.jsxs("div",{className:"text-center mb-6",children:[e.jsx(Zt,{className:"w-20 h-20 text-[#1E73BE] mx-auto mb-4"}),e.jsx("h3",{className:"text-xl font-bold text-[#333] mb-3",style:{fontFamily:"Montserrat"},children:"Autorisation de la caméra requise"}),e.jsx("p",{className:"text-gray-600 max-w-md mx-auto",children:"Pour scanner les codes QR, nous avons besoin d'accéder à votre caméra. Votre navigateur va vous demander l'autorisation."})]}),e.jsxs("div",{className:"bg-blue-50 border-2 border-[#1E73BE] rounded-lg p-5 mb-6 max-w-md mx-auto",children:[e.jsxs("h4",{className:"font-bold text-[#1E73BE] mb-3 flex items-center gap-2",style:{fontFamily:"Montserrat"},children:[e.jsx(rt,{className:"w-5 h-5"}),"Ce que vous devez faire:"]}),e.jsxs("ol",{className:"space-y-2 text-sm text-gray-700",children:[e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#1E73BE] flex-shrink-0",children:"1."}),e.jsxs("span",{children:["Cliquez sur ",e.jsx("span",{className:"font-bold",children:'"Activer la caméra"'})," ci-dessous"]})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#1E73BE] flex-shrink-0",children:"2."}),e.jsx("span",{children:"Une notification apparaîtra en haut"})]}),e.jsxs("li",{className:"flex gap-2",children:[e.jsx("span",{className:"font-bold text-[#1E73BE] flex-shrink-0",children:"3."}),e.jsxs("span",{children:["Cliquez sur ",e.jsx("span",{className:"font-bold text-[#4CAF50]",children:'"Autoriser"'})]})]})]})]}),e.jsxs("div",{className:"flex flex-col items-center gap-3",children:[e.jsxs("button",{onClick:w,className:"w-full max-w-md px-8 py-4 bg-[#1E73BE] text-white rounded-lg hover:bg-[#1557A0] transition-all font-bold text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-3",style:{fontFamily:"Montserrat"},children:[e.jsx(Et,{className:"w-6 h-6"}),"Activer la caméra maintenant"]}),e.jsxs("button",{onClick:()=>U(!0),className:"text-[#1E73BE] hover:underline text-sm font-medium flex items-center gap-1",children:[e.jsx(Ct,{className:"w-4 h-4"}),"Besoin d'aide?"]}),e.jsxs("div",{className:"mt-4 pt-4 border-t border-gray-200 w-full max-w-md",children:[e.jsx("p",{className:"text-sm text-gray-600 text-center mb-3",children:"Vous préférez ne pas utiliser la caméra?"}),e.jsxs("button",{onClick:J,className:"w-full px-6 py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-medium flex items-center justify-center gap-2",children:[e.jsx(at,{className:"w-5 h-5"}),"Télécharger une image"]})]}),e.jsx("button",{onClick:oe,className:"mt-2 px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Retour"})]})]}):n==="camara"?e.jsx("div",{className:"h-full flex flex-col justify-center",children:z?S():e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"mb-4 text-center",children:[e.jsx(Et,{className:"w-12 h-12 text-[#1E73BE] mx-auto mb-3 animate-pulse"}),e.jsx("p",{className:"text-gray-700 font-medium mb-2",children:"Positionnez le code QR devant la caméra"}),e.jsx("p",{className:"text-gray-500 text-sm",children:"Le scanner détectera automatiquement le code"})]}),e.jsxs("div",{className:"relative rounded-lg overflow-hidden border-4 border-[#1E73BE] bg-black",children:[e.jsx("div",{id:"qr-reader-camera",className:"h-[min(44vh,340px)] w-full"}),L&&e.jsx("div",{className:"absolute top-4 left-1/2 transform -translate-x-1/2 z-10",children:e.jsxs("div",{className:"bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2",children:[e.jsx("div",{className:"w-2 h-2 bg-white rounded-full animate-pulse"}),"Scan en cours..."]})})]}),e.jsxs("div",{className:"mt-4 flex justify-center gap-4",children:[e.jsx("button",{onClick:oe,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:i?"Redémarrer":"Retour"}),e.jsx("button",{onClick:X,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:"Annuler"})]})]})}):e.jsxs("div",{className:"h-full flex flex-col justify-center text-center py-8",children:[e.jsx("div",{id:"qr-reader-file",className:"hidden"}),z?e.jsxs(e.Fragment,{children:[e.jsx(rt,{className:"w-16 h-16 text-[#DC3545] mx-auto mb-4"}),e.jsx("h3",{className:"text-lg font-bold text-[#333] mb-3",style:{fontFamily:"Montserrat"},children:te(z).title}),e.jsx("div",{className:"bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto",children:e.jsx("p",{className:"text-sm text-gray-700",children:te(z).description})}),e.jsxs("div",{className:"flex justify-center gap-4",children:[e.jsx("button",{onClick:J,className:"px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45A049] transition-colors font-medium",children:"Essayer une autre image"}),e.jsx("button",{onClick:oe,className:"px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",children:i?"Retour caméra":"Retour"})]})]}):e.jsxs(e.Fragment,{children:[e.jsx(at,{className:"w-16 h-16 text-[#4CAF50] mx-auto mb-4 animate-pulse"}),e.jsx("p",{className:"text-gray-700 font-medium mb-4",children:"Analyse de l'image en cours..."})]})]})]})]})})]})}const _t="borrador_comanda_grupo",Ea="brouillons_preparation_comandes";function Aa(){if(typeof window>"u")return null;try{const t=localStorage.getItem(_t);if(!t)return null;const c=JSON.parse(t);return{selectedOrganismos:Array.isArray(c.selectedOrganismos)?c.selectedOrganismos.filter(Boolean):[],grupoItems:Array.isArray(c.grupoItems)?c.grupoItems.map(i=>({productoId:String(i?.productoId||"").trim(),cantidad:Number(i?.cantidad||0),nombreProducto:String(i?.nombreProducto||"").trim(),unidad:String(i?.unidad||"").trim()})).filter(i=>i.productoId||i.nombreProducto):[],fechaEntregaGrupo:String(c.fechaEntregaGrupo||""),observacionesGrupo:String(c.observacionesGrupo||""),cantidadesInventario:c.cantidadesInventario&&typeof c.cantidadesInventario=="object"?Object.fromEntries(Object.entries(c.cantidadesInventario).map(([i,n])=>[i,Number(n||0)])):{}}}catch{return null}}function Sa(t){if(!(typeof window>"u"))try{const c={selectedOrganismos:Array.from(new Set(t.selectedOrganismos.filter(Boolean))),grupoItems:t.grupoItems.map(n=>({productoId:String(n.productoId||"").trim(),cantidad:Number(n.cantidad||0),nombreProducto:String(n.nombreProducto||"").trim(),unidad:String(n.unidad||"").trim()})).filter(n=>n.productoId&&n.cantidad>0),fechaEntregaGrupo:String(t.fechaEntregaGrupo||""),observacionesGrupo:String(t.observacionesGrupo||""),cantidadesInventario:Object.fromEntries(Object.entries(t.cantidadesInventario||{}).filter(([,n])=>Number(n)>0))};if(!(c.selectedOrganismos.length>0||c.grupoItems.length>0||!!c.fechaEntregaGrupo||!!c.observacionesGrupo||Object.keys(c.cantidadesInventario).length>0)){localStorage.removeItem(_t);return}localStorage.setItem(_t,JSON.stringify(c))}catch{}}function $o(){const{t,i18n:c}=bs(),i=c.getFixedT("fr"),n=kt(),[N,L]=x.useState("comandas"),{isCompactViewport:B,viewportZoom:z}=oa({deps:[N],resolveZoom:({height:s,isCompact:a})=>{const r=a&&N==="comandas",o=a&&N==="ofertas";return s<600?r?.56:o?.5:.38:s<700?r?.66:o?.6:.52:a?r?.84:o?.82:.78:1}}),E=c.language||"fr",g=s=>{if(/^\d{4}-\d{2}-\d{2}$/.test(s)){const[a,r,o]=s.split("-").map(Number);return new Date(a,r-1,o)}return new Date(s)},R=(s,a)=>g(s).toLocaleDateString(E,a),Q=(s,a)=>g(s).toLocaleDateString("fr",a),U=s=>s?s.replace(/^Solicitud desde el portal del organismo\.\s*/i,"Demande soumise depuis le portail de l’organisme. ").replace(/Total:\s*(\d+)\s+productos?,\s*/i,(a,r)=>{const l=Number(r)===1?"produit":"produits";return`Total : ${r} ${l}, `}).replace(/Fecha de recogida:\s*/i,"Date de collecte : ").replace(/Persona que recogerá:\s*/i,"Personne qui récupérera : ").replace(/\(Tel:\s*/i,"(Tél. : "):"",G=s=>{if(typeof window>"u"||!s)return{};try{const a=localStorage.getItem(Ea);if(!a)return{};const o=JSON.parse(a)?.[s];return o&&typeof o=="object"?o:{}}catch{return{}}},A=(s,a)=>{if(typeof s?.lineaId=="string"&&s.lineaId.trim())return`linea-${s.lineaId.trim()}`;if(s?.id)return`item-${String(s.id)}`;const r=String(s?.temperatura||"").trim(),o=r==="refrigerado"||r==="Réfrigéré"?"refrigerado":r==="congelado"||r==="Congelé"?"congelado":"ambiente",l=String(s?.productoCodigo||s?.codigo||"").trim(),m=String(s?.unidad||"").trim();return`item-${String(s?.productoId||"")}-${l}-${o}-${m}-${a}`},W=s=>{if(typeof s=="number")return Number.isFinite(s)?s:0;if(typeof s=="string"){const a=s.replace(",",".").trim(),r=Number(a);return Number.isFinite(r)?r:0}return 0},ge=s=>{if(s.estado!=="en_preparacion")return 0;const a=Array.isArray(s.items)?s.items:[],r=a.length,o=G(s.id),l=a.reduce((u,y,v)=>{const C=A(y,v);return u+(o[C]?1:0)},0);if(r>0&&l>0)return Math.max(0,Math.min(100,l/r*100));const m=a.reduce((u,y)=>u+Math.max(0,W(y.cantidad)),0);if(m<=0)return 0;const h=a.reduce((u,y)=>{const v=Math.max(0,W(y.cantidad)),C=Math.max(0,W(y.cantidadPreparada));return v<=0||C<=0?u:u+Math.min(C,v)},0),d=a.reduce((u,y,v)=>{const C=A(y,v);return o[C]?u+Math.max(0,W(y.cantidad)):u},0),P=Math.max(h,d);return Number.isFinite(P)?Math.max(0,Math.min(100,P/m*100)):0},fe=s=>{const a=g(s);if(Number.isNaN(a.getTime()))return"";const r=a.getFullYear(),o=String(a.getMonth()+1).padStart(2,"0"),l=String(a.getDate()).padStart(2,"0");return`${r}-${o}-${l}`},ae=t("orders.searchByNumber"),[V,me]=x.useState(""),[Se,T]=x.useState(!1),[Fe,k]=x.useState(!1),[w,_]=x.useState(!1),[H,Y]=x.useState(!1),[K,D]=x.useState(!1),[X,J]=x.useState(!1),[oe,te]=x.useState(!1),[S,j]=x.useState(null),[I,be]=x.useState([]),[se,ee]=x.useState([]),[pe,ne]=x.useState(!1),[q,ct]=x.useState([{productoId:"",cantidad:1,nombreProducto:"",unidad:""}]),[Pe,Ns]=x.useState(""),[zt,ys]=x.useState(""),[Bt,Fa]=x.useState(""),[Rt,ws]=x.useState({}),[De,Cs]=x.useState("todos"),[$e,qt]=x.useState(!1),[Es,mt]=x.useState(!1),[Tt,It]=x.useState(null),[As,ie]=x.useState(!1),[Ss,He]=x.useState(!1),[M,Fs]=x.useState(null),[Ye,$s]=x.useState(null),[Ce,_s]=x.useState("todos"),[$a,_a]=x.useState(null),[de,Ke]=x.useState(null),[ks,We]=x.useState(!1),[Os,Je]=x.useState(!1),[ze,pt]=x.useState(""),[ka,Ee]=x.useState(0);x.useEffect(()=>{const s=Aa();s&&(be(s.selectedOrganismos),ct(s.grupoItems.length>0?s.grupoItems:[{productoId:"",cantidad:1,nombreProducto:"",unidad:""}]),Ns(s.fechaEntregaGrupo),ys(s.observacionesGrupo),ws(s.cantidadesInventario))},[]),x.useEffect(()=>{Sa({selectedOrganismos:I,grupoItems:q,fechaEntregaGrupo:Pe,observacionesGrupo:zt,cantidadesInventario:Rt})},[I,q,Pe,zt,Rt]);const Ps=Jr(),Ds=[...qe(),...$r.filter(s=>!qe().some(a=>a.id===s.id))],Mt=xs(),Lt=new Map([...Mt,...$t.filter(s=>!Mt.some(a=>a.id===s.id))].map(s=>[s.id,s])),Gt=Array.from(Lt.values()),Be=s=>typeof s=="string"?s.trim().toLowerCase():"",xe=s=>s&&(s.nombreOrganismo||s.organismoNombre)||"",le=s=>{if(!s)return null;const a=xe(s);return Ds.find(r=>r.id===s.organismoId||a!==""&&r.nombre===a)||null},[re,Vt]=x.useState([]),_e=()=>{const s=Xt();return Vt(s),s},zs=()=>{D(!1),te(!1)};x.useEffect(()=>{_e()},[]);const Bs=s=>{const r=yt(s)?.comanda;return r&&re.find(o=>o.numero&&o.numero===r||o.numeroComanda&&o.numeroComanda===r||o.id===r)||null},Rs=s=>{const a=js(s);if(!a)return null;const r=[a.id,a.codigo,a.producto,a.nombre].map(Be).filter(Boolean);if(r.length===0)return null;const o=Gt.find(h=>[h.id,h.codigo,h.nombre].map(Be).filter(Boolean).some(P=>r.includes(P)));if(o)return o;const l=r.find(h=>h.includes("banco-alimentos-"));return l&&Gt.map(h=>{const d=Be(h.id),P=Be(h.codigo),u=Be(h.nombre);let y=0;return d&&l.includes(d)&&(y+=4),P.length>=5&&l.includes(P)&&(y+=3),u.length>=6&&l.includes(u)&&(y+=2),{producto:h,score:y}}).filter(h=>h.score>0).sort((h,d)=>d.score-h.score)[0]?.producto||null},qs=(s,a)=>{te(!1),j(s),D(!0),ie(!1),f.success(e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:t("orders.qrFound")}),e.jsxs("p",{className:"text-sm text-[#666666]",children:["N° ",a]})]}),{duration:3e3})},Ts=s=>s.numero||s.numeroComanda||s.id,Ut=(s,a)=>{const r={...s,estado:a};return ot(r),_e().find(l=>l.id===r.id)||r},Qt=(s,a="ver_detalles",r=Ts(s))=>{switch(a){case"marcar_entregado":{ie(!1);try{const o=Ut(s,"entregada");j(o),D(!0),f.success(`${t("orders.statusChangedTo")} ${t("orders.delivered")}`)}catch(o){console.error("Error al marcar comanda entregada desde QR:",o)}return}case"gestionar_transporte":ie(!1),It(s),mt(!0),f.info("Gestion de livraison ouverte pour cette commande");return;case"modificar":ie(!1),te(!1),j(s),D(!0),f.info(`Commande N° ${r} ouverte pour modification`);return;case"modificar_grupo":ie(!1),te(!0),j(s),D(!0),f.info("Distribution de groupe ouverte directement pour modifier la date");return;case"cancelar":{ie(!1);try{const o=Ut(s,"anulada");j(o),D(!0),f.success(t("orders.orderCancelled"))}catch(o){console.error("Error al anular comanda desde QR:",o)}return}case"ver_detalles":default:qs(s,r)}};x.useEffect(()=>{const s=Vr();if(!s||s.targetPage!=="comandas"||s.qrType!=="comanda")return;const r=yt(s.rawData)?.comanda,o=re.length>0?re:Xt();if(o.length===0)return;const l=o.find(m=>m.numero&&m.numero===r||m.numeroComanda&&m.numeroComanda===r||m.id===r)||null;if(!r||!l){is(),f.error(e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:t("orders.qrNotFound")}),e.jsx("p",{className:"text-sm text-[#666666]",children:r?`N° ${r}`:t("common.error")})]}),{duration:3e3});return}is(),Qt(l,s.action,r)},[re,t]),x.useEffect(()=>{localStorage.getItem("comandas-tab-activo")==="ofertas-cocina"&&(L("ofertas"),localStorage.removeItem("comandas-tab-activo"))},[]);const xt=s=>{const a={pendiente:{bg:"bg-[#FFC107]",text:t("orders.pending")},confirmada:{bg:"bg-[#7E57C2]",text:"Acceptée"},en_preparacion:{bg:"bg-[#1E73BE]",text:t("orders.inPreparation")},completada:{bg:"bg-[#4CAF50]",text:t("orders.completed")},entregada:{bg:"bg-[#2E7D32]",text:t("orders.delivered")},anulada:{bg:"bg-[#DC3545]",text:t("orders.cancelled")}}[s]||{bg:"bg-gray-500",text:s};return e.jsx(ue,{className:`${a.bg} hover:${a.bg}`,children:a.text})},ut=s=>{const a=wt(s);return a!=="collation"?null:e.jsx(ue,{className:"border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]",children:Qr(a)})},Is=[{key:"pendiente",label:t("orders.pending"),description:"Commandes en attente de validation ou de réponse.",icon:us,accent:"#FFC107",soft:"linear-gradient(135deg, rgba(255, 193, 7, 0.18) 0%, rgba(255, 243, 205, 0.85) 100%)",border:"rgba(255, 193, 7, 0.35)"},{key:"confirmada",label:"Acceptée",description:"Commandes confirmées par les organismes et prêtes pour le suivi.",icon:jt,accent:"#7E57C2",soft:"linear-gradient(135deg, rgba(126, 87, 194, 0.16) 0%, rgba(245, 240, 255, 0.95) 100%)",border:"rgba(126, 87, 194, 0.28)"},{key:"en_preparacion",label:t("orders.inPreparation"),description:"Commandes en cours de préparation logistique.",icon:he,accent:"#1E73BE",soft:"linear-gradient(135deg, rgba(30, 115, 190, 0.14) 0%, rgba(233, 245, 255, 0.95) 100%)",border:"rgba(30, 115, 190, 0.22)"},{key:"completada",label:t("orders.completed"),description:"Commandes préparées et clôturées côté opération.",icon:Ne,accent:"#4CAF50",soft:"linear-gradient(135deg, rgba(76, 175, 80, 0.16) 0%, rgba(237, 247, 237, 0.95) 100%)",border:"rgba(76, 175, 80, 0.24)"},{key:"entregada",label:t("orders.delivered"),description:"Commandes livrées et visibles dans l’historique final.",icon:Ne,accent:"#2E7D32",soft:"linear-gradient(135deg, rgba(46, 125, 50, 0.16) 0%, rgba(232, 245, 233, 0.98) 100%)",border:"rgba(46, 125, 50, 0.25)"},{key:"anulada",label:t("orders.cancelled"),description:"Commandes annulées, conservées pour traçabilité.",icon:At,accent:"#DC3545",soft:"linear-gradient(135deg, rgba(220, 53, 69, 0.14) 0%, rgba(253, 237, 239, 0.98) 100%)",border:"rgba(220, 53, 69, 0.22)"}],Ms=s=>{const a=s.reduce((m,h)=>m+(h.items?.length||0),0),r=s.reduce((m,h)=>m+(h.items||[]).reduce((d,P)=>d+Number(P.cantidad||0),0),0),o=new Set(s.map(m=>le(m)?.nombre||xe(m)).filter(Boolean)).size,l=s.map(m=>m.fechaEntrega).filter(m=>!!m).sort((m,h)=>new Date(m).getTime()-new Date(h).getTime())[0]||null;return{totalCommandes:s.length,totalProduits:a,totalArticles:r,organismes:o,prochaineLivraison:l}};$t.filter(s=>s.nombre.toLowerCase().includes(Bt.toLowerCase())||s.categoria?.toLowerCase().includes(Bt.toLowerCase()));const Ls=s=>{if(!S)return;if(!wr(S.estado,s)){f.error(`Transition de statut invalide: ${S.estado} → ${s}`);return}try{const o={...S,estado:s};ot(o);const m=_e().find(h=>h.id===o.id)||o;j(m)}catch(o){console.error(o);return}const r={pendiente:t("orders.pending"),confirmada:"Acceptée",en_preparacion:t("orders.inPreparation"),completada:t("orders.completed"),entregada:t("orders.delivered"),anulada:t("orders.cancelled")}[s]||s;if(S&&ce("Commandes","modificar",`Commande N° ${S.numero||S.id} - État changé à "${r}"`,{comandaId:S.id,nuevoEstado:s,organismo:xe(S)}),f.success(`${t("orders.statusChangedTo")} ${r}`),S){const o=le(S),l=S.numero||S.id,m=S.estado;if(o){try{const h=ds(S.id,l,o.id,s,o.claveAcceso);ls(h)}catch(h){console.error("No se pudo guardar la notificación in-app de cambio de estado:",h)}o.notificaciones&&(async()=>{try{const h=await ia({organismo:o,numeroComanda:l,estadoAnterior:m,estadoNuevo:s});h.enviado?f.success(`Organisme notifié par courriel (${h.destinatarios.length})`):(h.motivo==="graph_error"||h.motivo==="graph_no_configurado")&&f.error("Échec de la notification par courriel à l'organisme",{description:h.error||"Microsoft Graph indisponible."})}catch(h){console.error("Error enviando email de cambio de estado:",h)}})()}}},Gs=(s,a)=>{const r=new Map;return a.forEach(o=>{const l=o?.productoId;if(!l)return;const m=r.get(l)||[];m.push(o),r.set(l,m)}),s.map(o=>{const m=(r.get(o.productoId)||[]).shift();if(!m)return o;const h=Number(m.cantidadAceptada??m.cantidad??o.cantidad);return{...o,cantidad:h,cantidadAceptada:h}})},Vs=(s,a)=>{const r=a||S;if(r)try{const o=Gs(r.items||[],s),l=o.reduce((P,u)=>P+Number(u.cantidadAceptada??u.cantidad??0),0),m={...r,estado:l>0?"confirmada":"anulada",items:o,fechaConfirmacion:l>0?new Date().toISOString():void 0,fechaModificacion:new Date().toISOString()};ot(m);const d=_e().find(P=>P.id===m.id)||m;j(d),f.success(l>0?t("orders.orderAccepted"):t("orders.orderCancelled"),{description:l>0?"Les quantités acceptées ont été confirmées.":"Aucune quantité acceptée, la commande a été annulée automatiquement."}),D(!1)}catch(o){console.error("Error al aceptar la comanda:",o),f.error("Impossible de valider cette commande.")}},Us=()=>{if(S)try{const s={...S,estado:"anulada"};ot(s),_e(),j(s)}catch(s){console.error(s);return}S&&ce("Commandes","eliminar",`Commande N° ${S.numero||S.id} annulée - Organisme: ${xe(S)}`,{comandaId:S.id,organismo:xe(S)}),f.success(t("orders.orderCancelled")),D(!1)},Re=re.filter(s=>s.estado==="pendiente"),Qs=s=>{ee(a=>a.includes(s)?a.filter(r=>r!==s):[...a,s])},Hs=()=>{se.length===Re.length?ee([]):ee(Re.map(s=>s.id))},Ys=()=>{if(se.length===0){f.error(t("orders.noOrdersSelected"));return}if(!pe){f.error("Veuillez confirmer la vérification avant l'envoi.");return}const s=Cr();if(!String(s?.email||"").trim()){f.error("Aucun expéditeur connecté",{description:"Connectez-vous avec un utilisateur ayant une adresse email valide."});return}const r=Re.filter(u=>se.includes(u.id)),o=[],l=[],m=r.reduce((u,y)=>{const v=le(y);if(!v)return u;if(v.notificaciones===!1)return o.includes(v.nombre)||o.push(v.nombre),u;const C=Array.from(new Set([v.email,...(v.contactosNotificacion||[]).map(O=>O.email)].map(O=>String(O||"").trim()).filter(Boolean)));if(C.length===0)return l.includes(v.nombre)||l.push(v.nombre),u;const b=u.find(O=>O.organismo.id===v.id);return b?(b.comandas.push(y),b.destinatarios=Array.from(new Set([...b.destinatarios,...C]))):u.push({organismo:v,comandas:[y],destinatarios:C}),u},[]);if(m.reduce((u,y)=>u+y.destinatarios.length,0),m.length===0){const u=[];o.length>0&&u.push(`Notifications désactivées : ${o.join(", ")}`),l.length>0&&u.push(`Sans adresse courriel : ${l.join(", ")}`),f.error("Aucun organisme éligible aux notifications.",{description:u.join(" | ")||void 0});return}const h=(u,y)=>{const v=na(u.claveAcceso),C=y.map(b=>`• ${b.numero||b.id} - ${b.items.length} article(s)`).join(`
`);return[`Bonjour ${u.nombre},`,"",`Vos ${y.length} commande(s) en attente sont prêtes à être consultées :`,C,"",`Accès direct à votre portail organisme : ${v}`,"","Veuillez vérifier les détails et confirmer la réception dans le portail.","","Merci,","Équipe de gestion"].join(`
`)},d=async(u,y,v)=>{if(!Er())return{ok:!1,error:"Supabase auth disabled in frontend configuration."};const C=Ar();if(!C)return{ok:!1,error:"Supabase client is not configured (check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)."};const{data:{session:b}}=await C.auth.getSession();if(!b?.access_token)return{ok:!1,error:"No authenticated session token available."};const O=await fetch(Sr("send-graph-mail"),{method:"POST",headers:{Authorization:`Bearer ${b.access_token}`,apikey:Fr(),"Content-Type":"application/json"},body:JSON.stringify({to:u,subject:y,body:v})});return O.ok?{ok:!0}:{ok:!1,error:(await O.json().catch(()=>null))?.error||`send-graph-mail returned ${O.status}`}},P=m.map(({organismo:u,comandas:y,destinatarios:v},C)=>{const b=`${t("orders.notifyPendingOrders")} - ${u.nombre}`,O=h(u,y);return{index:C,organismo:u,comandas:y,asunto:b,cuerpo:O,destinatarios:v}});if(P.length===0){f.error("Aucun organisme sélectionné avec une adresse email valide.");return}(async()=>{const u=[],y=[];let v=0;for(const C of P)try{const b=await d(C.destinatarios,C.asunto,C.cuerpo);b.ok?v+=1:(u.push(C),b.error&&y.push(`${C.organismo.nombre}: ${b.error}`))}catch(b){u.push(C);const O=b instanceof Error?b.message:"Unexpected error";y.push(`${C.organismo.nombre}: ${O}`)}if(v>0&&(f.success(t("orders.pendingNotificationsSentAutomatically",{organizations:v})),P.filter(b=>!u.includes(b)).forEach(b=>{b.comandas.forEach(O=>{try{const Xe=ds(O.id,O.numero||O.id,b.organismo.id,"pendiente",b.organismo.claveAcceso);ls({...Xe,mensaje:`Rappel : commande ${O.numero||O.id} en attente de confirmation`})}catch(Xe){console.error("No se pudo guardar notificación in-app de rappel:",Xe)}});try{ce("Commandes","enviar",`Rappel envoyé à ${b.organismo.nombre} (${b.comandas.length} commande(s), ${b.destinatarios.length} destinataire(s))`,{organismoId:b.organismo.id,organismoNombre:b.organismo.nombre,comandasIds:b.comandas.map(O=>O.id),destinatarios:b.destinatarios})}catch(O){console.error("No se pudo registrar actividad de notificación:",O)}})),u.length===0){_(!1),ee([]),ne(!1);return}f.error(t("orders.pendingNotificationsAutomaticFailed",{organizations:u.length}),{description:y.length>0?y.slice(0,2).join(" | "):void 0})})()},Ks=(s,a)=>{console.log("QR escaneado:",s,"Acción:",a);const r=vs(s)?.ubicacion;if(r){ie(!1),f.info(`Emplacement ${r} détecté. Vous restez dans le module Commandes.`);return}const l=yt(s)?.comanda;if(l){const h=Bs(s);if(h){Qt(h,a,l);return}}if(Rs(s)){ie(!1),f.info("Produit détecté. Aucune redirection automatique vers Inventaire depuis Commandes.");return}if(!l){f.error(e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:t("orders.qrNotFound")}),e.jsx("p",{className:"text-sm text-[#666666]",children:typeof s=="string"?s:t("common.error")})]}),{duration:3e3});return}f.error(e.jsxs("div",{children:[e.jsx("span",{className:"font-semibold",children:t("orders.qrNotFound")}),e.jsxs("p",{className:"text-sm text-[#666666]",children:["N° ",l]})]}),{duration:3e3})},Ws=(s,a,r)=>{Zr(s,a)?(ce("Commandes","modificar",`Demande d'offre acceptée - Organisme: ${r}`,{ofertaId:s,solicitudId:a,organismoNombre:r}),f.success(t("orders.requestAcceptedSuccess",{organism:r})),Ee(l=>l+1)):f.error(t("orders.errors.acceptError"))},Js=(s,a,r,o)=>{if(!o||o.trim()===""){f.error(t("orders.errors.rejectReasonRequired"));return}Xr(s,a,o)?(ce("Commandes","modificar",`Demande d'offre refusée - Organisme: ${r} - Motif: ${o}`,{ofertaId:s,solicitudId:a,organismoNombre:r,motivo:o}),f.success(t("orders.requestRejectedSuccess",{organism:r})),Ee(m=>m+1)):f.error(t("orders.errors.rejectError"))},Zs=(s,a,r)=>{ta(s,a)?(ce("Commandes","modificar",`Offre livrée - Organisme: ${r}`,{ofertaId:s,solicitudId:a,organismoNombre:r}),f.success(t("orders.requestDeliveredSuccess",{organism:r})),Ee(l=>l+1)):f.error("Seules les demandes en préparation peuvent être marquées comme livrées.")},Xs=(s,a,r)=>{ea(s,a)?(ce("Commandes","modificar",`Offre en préparation - Organisme: ${r}`,{ofertaId:s,solicitudId:a,organismoNombre:r}),f.success(`Demande de ${r} passée en préparation.`),Ee(l=>l+1)):f.error("Seules les demandes acceptées peuvent passer en préparation.")},er=(s,a,r)=>{sa(s,a)?(ce("Commandes","eliminar",`Demande d'offre annulée - Organisme: ${r}`,{ofertaId:s,solicitudId:a,organismoNombre:r}),f.success(t("orders.requestCancelledSuccess",{organism:r})),Ee(l=>l+1)):f.error(t("orders.cancelRequestError"))},tr=s=>{Ke(s),pt(fe(s.fechaExpiracion)),We(!0)},sr=()=>{if(!de||!ze){f.error("Veuillez sélectionner une date de caducité valide.");return}const s=new Date(ze),a=new Date;if(a.setHours(0,0,0,0),Number.isNaN(s.getTime())||s<a){f.error("La nouvelle date de caducité doit être aujourd’hui ou dans le futur.");return}if(!ra(de.id,ze)){f.error("Impossible de mettre à jour la date de caducité de l’offre.");return}ce("Commandes","modificar",`Date de caducité d'offre modifiée - Offre: ${de.numeroOferta}`,{ofertaId:de.id,numeroOferta:de.numeroOferta,nuevaFechaCaducidadOferta:ze}),f.success("Date de caducité de l’offre mise à jour."),We(!1),Ke(null),pt(""),Ee(o=>o+1)},rr=s=>{Ke(s),Je(!0)},ar=()=>{if(!de)return;if(!aa(de.id)){f.error("Impossible d’annuler l’offre sélectionnée.");return}ce("Commandes","eliminar",`Offre annulée - Offre: ${de.numeroOferta}`,{ofertaId:de.id,numeroOferta:de.numeroOferta}),f.success("Offre annulée avec succès."),Je(!1),Ke(null),Ee(a=>a+1)},ht=async(s,a)=>{const r=s.numero||s.numeroComanda||s.id,o=r.startsWith("SOL-"),l={numeroComanda:r,fechaEntrega:s.fechaEntrega,estado:s.estado||"pendiente",observaciones:s.observaciones,items:(s.items||[]).map(m=>({nombre:m.nombreProducto||m.productoNombre||t("common.product"),icono:m.icono,cantidad:m.cantidad,unidad:m.unidad,peso:m.peso})),organismoNombre:a?.nombre||t("orders.withoutOrganism"),organismoTipo:a?.tipo,organismoDireccion:a?.direccion,organismoResponsable:a?.responsable,organismoTelefono:a?.telefono,horaCita:a?.horaCita,translations:{foodBank:n.systemName?.trim()||t("common.foodBank")||"DM INVENTAIRE",brandSubtitle:o?"Système de gestion des offres":"Système de gestion des commandes",orderLabel:o?"Étiquette d'Offre":t("commands.orderLabel")||"Étiquette de Commande",orderNumber:o?"N° Offre":t("commands.orderNumber")||"N° Commande",deliveryDate:o?"Date de demande":t("commands.deliveryDate")||"Livraison",status:o?"Statut":t("commands.status")||"Statut",products:o?"Produits":t("commands.products")||"Produits",articles:o?"articles":t("commands.articles")||"articles",productDetailsTitle:o?"Produits demandés":"",recipient:o?"Organisme demandeur":t("commands.recipient")||"Organisme Destinataire",name:o?"Nom":t("common.name")||"Nom",type:o?"Type":t("common.type")||"Type",address:o?"Adresse":t("common.address")||"Adresse",responsible:o?"Responsable":t("common.responsible")||"Responsable",phone:o?"Téléphone":t("common.phone")||"Téléphone",observations:o?"Observations":t("common.observations")||"Observations",deliveredBy:o?"Préparé par":t("commands.deliveredBy")||"Remis par",receivedBy:o?"Reçu par":t("commands.receivedBy")||"Reçu par",nameAndSignature:o?"Nom et signature":t("commands.nameAndSignature")||"Nom et signature",printedOn:o?"Imprimé le":t("common.printedOn")||"Imprimé le",systemFooter:o?"Système de Gestion des Offres":t("commands.systemFooter")||"Système de Gestion des Commandes",pending:o?"EN ATTENTE":t("commands.pending")||"EN ATTENTE",confirmed:"ACCEPTÉE",inPreparation:o?"EN PRÉPARATION":t("commands.inPreparation")||"EN PRÉPARATION",ready:o?"PRÊTE":t("commands.ready")||"PRÊTE",delivered:o?"LIVRÉE":t("commands.delivered")||"LIVRÉE",cancelled:o?"ANNULÉE":t("commands.cancelled")||"ANNULÉE"}};try{pr.flushSync(()=>{D(!1),J(!1),He(!1),j(null)}),await new Promise(m=>{window.requestAnimationFrame(()=>m())}),await Na(l),f.success(t("orders.printLabelSuccess"))}catch(m){console.error("Error al imprimir etiqueta:",m),f.error(t("orders.printLabelError"))}},gt=s=>{j(s),D(!1),J(!0)},Ht=(s,a)=>{const r=qe().find(l=>l.id===s.organismoId||l.nombre===s.organismoNombre),o=s.productosAceptados.map(l=>{const m=a.productos.find(h=>h.productoId===l.productoId);return{productoId:l.productoId,nombreProducto:m?.productoNombre||t("common.product"),cantidad:l.cantidadAceptada,unidad:m?.unidad||t("orders.units")}});return{id:`SOL-${s.id}`,numeroComanda:`SOL-${s.id}`,organismoId:r?.id||"",fechaCreacion:s.fechaSolicitud,fechaEntrega:s.fechaSolicitud,estado:s.estado==="entregada"?"entregada":s.estado==="en_preparacion"?"en_preparacion":"confirmada",preparadoPor:s.preparadoPor,items:o,observaciones:s.observaciones||""}},Yt=s=>{const a={pendiente:{bg:"bg-[#FFC107]",text:t("orders.requestPending")},aceptada:{bg:"bg-[#4CAF50]",text:t("orders.requestAccepted")},en_preparacion:{bg:"bg-[#1E73BE]",text:"En préparation"},entregada:{bg:"bg-[#1E73BE]",text:t("orders.requestDelivered")},rechazada:{bg:"bg-[#DC3545]",text:t("orders.requestRejected")},anulada:{bg:"bg-[#666666]",text:t("orders.requestCancelled")}}[s]||{bg:"bg-gray-500",text:s};return e.jsx(ue,{className:`${a.bg} hover:${a.bg}`,children:a.text})},ft=re.filter(s=>{const a=le(s),r=Wr([s.id,s.numero||"",a?.nombre||xe(s)],V),o=De==="todos"||s.estado===De;return r&&o}),or=re.length,Ze=ft.filter(s=>s.estado!=="anulada"),nr=re.filter(s=>s.estado!=="anulada"&&s.estado!=="entregada"&&s.estado!=="confirmada").length,bt=re.filter(s=>s.estado==="pendiente").length,ir=re.filter(s=>s.estado==="confirmada").length,dr=re.filter(s=>s.estado==="entregada").length,Kt=Is.filter(s=>De==="todos"||s.key===De).map(s=>({...s,comandas:ft.filter(a=>a.estado===s.key)})).map(s=>({...s,metricas:Ms(s.comandas)})),ke=Ps.filter(s=>Ce==="todos"?!0:Ce==="pendientes"?(s.solicitudes?.length||0)===0&&s.activa:Ce==="con_solicitudes"?(s.solicitudes?.length||0)>0:Ce==="entregadas"?(s.solicitudes||[]).some(a=>a.estado==="entregada"):Ce==="activas"?s.activa&&new Date(s.fechaExpiracion)>new Date:Ce==="expiradas"?!s.activa||new Date(s.fechaExpiracion)<new Date:!0),vt=ke.filter(s=>(s.solicitudes?.length||0)>0).length,lr=ke.filter(s=>!s.activa||new Date(s.fechaExpiracion)<new Date).length,Wt=ke.reduce((s,a)=>s+(a.solicitudes?.length||0),0),cr={comandas:t("nav.orders"),ofertas:t("nav.offers")},mr=[{id:"active-view",label:t("orders.executive.metrics.activeView"),value:cr[N]||t("nav.orders"),helper:t(N==="comandas"?"orders.executive.metrics.ordersHelper":"orders.executive.metrics.offersHelper"),icon:e.jsx(Ne,{className:"h-4 w-4"}),accentColor:n.primaryColor},{id:"pending-orders",label:t("orders.executive.metrics.pending"),value:bt,helper:bt>0?t("orders.executive.metrics.pendingBusy"):t("orders.executive.metrics.pendingClear"),icon:e.jsx(es,{className:"h-4 w-4"}),accentColor:"#f59e0b"},{id:"distributed-list",label:t("orders.executive.metrics.distributable"),value:Ze.length,helper:t("orders.executive.metrics.distributableHelper"),icon:e.jsx(he,{className:"h-4 w-4"}),accentColor:n.secondaryColor},{id:"offers-demand",label:t("orders.executive.metrics.offerRequests"),value:Wt,helper:vt>0?t("orders.executive.metrics.offerRequestsActive",{count:vt}):t("orders.executive.metrics.offerRequestsIdle"),icon:e.jsx(Ae,{className:"h-4 w-4"}),accentColor:"#7c3aed"}];if(X&&S){const s=le(S);return e.jsx(va,{comanda:S,organismo:s,onClose:()=>{J(!1),j(null)}})}if(K&&S){const s=le(S);return e.jsx(Br,{comanda:S,organismo:s,mostrar:K,onCerrar:zs,onAbrirImpresionCompacta:()=>gt(S),onCambiarEstado:Ls,onAceptarComanda:Vs,onAnularComanda:Us,onComandaActualizada:a=>{j(a),Vt(r=>r.map(o=>o.id===a.id?a:o))},abrirEdicionGrupoInicial:oe})}return e.jsxs("div",{className:"min-h-[calc(100vh-56px)] p-2 sm:p-2.5 lg:p-3.5 space-y-2.5 sm:space-y-3 relative overflow-hidden",style:{fontFamily:"Roboto, sans-serif",background:"linear-gradient(135deg, #1a4d7a15 0%, #2d956110 100%)",...z<1?{zoom:z}:{}},children:[e.jsxs("div",{className:"absolute inset-0 overflow-hidden pointer-events-none",children:[e.jsx("div",{className:"absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse",style:{backgroundColor:n.primaryColor}}),e.jsx("div",{className:"absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse",style:{backgroundColor:n.secondaryColor}}),e.jsx("div",{className:"absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl",style:{backgroundColor:n.primaryColor}})]}),e.jsxs("div",{className:"relative z-10 space-y-2 sm:space-y-3",children:[e.jsx(Rr,{}),e.jsx(da,{title:t("orders.title"),subtitle:t("orders.subtitle"),icon:e.jsx(Ne,{className:"h-6 w-6 text-white sm:h-7 sm:w-7"}),accentColor:n.primaryColor,secondaryColor:n.secondaryColor,compact:!0,showExperienceChips:!1,showContextChips:!1}),e.jsx(pa,{eyebrow:t("orders.executive.eyebrow"),title:t("orders.executive.title"),description:t("orders.executive.description"),accentColor:n.primaryColor,secondaryColor:n.secondaryColor,metrics:mr,compact:!0,actions:e.jsxs(e.Fragment,{children:[e.jsxs(F,{variant:"outline",onClick:()=>L("comandas"),className:"border-white/70 bg-white/82 text-[#16324f] hover:bg-white",children:[e.jsx(Ne,{className:"mr-2 h-4 w-4"}),t("orders.executive.actions.orders")]}),N!=="comandas"&&e.jsxs(F,{variant:"outline",onClick:()=>Y(!0),disabled:Ze.length===0,className:"border-white/70 bg-white/82 text-[#16324f] hover:bg-white disabled:bg-white/60",children:[e.jsx(he,{className:"mr-2 h-4 w-4"}),t("orders.executive.actions.distributedList")]}),e.jsxs(F,{variant:"outline",onClick:()=>{ne(!1),_(!0)},className:"border-white/70 bg-white/82 text-[#16324f] hover:bg-white",children:[e.jsx(es,{className:"mr-2 h-4 w-4"}),t("orders.executive.actions.notifications")]}),e.jsxs(F,{variant:"outline",onClick:()=>L("ofertas"),className:"border-white/70 bg-white/82 text-[#16324f] hover:bg-white",children:[e.jsx(Ae,{className:"mr-2 h-4 w-4"}),t("orders.executive.actions.offers")]}),e.jsxs(F,{onClick:()=>ie(!0),className:"text-white shadow-lg",style:{background:`linear-gradient(135deg, ${n.primaryColor} 0%, ${n.secondaryColor} 100%)`},children:[e.jsx(it,{className:"mr-2 h-4 w-4"}),t("orders.executive.actions.qrScanner")]})]})}),e.jsxs(la,{compact:B,compactLayout:"grid grid-cols-5 gap-1.5",defaultLayout:"grid grid-cols-1 md:grid-cols-5 gap-4",children:[e.jsx(Te,{label:t("orders.totalOrders"),value:or,icon:e.jsx(Ne,{className:"h-4 w-4 text-white sm:h-5 sm:w-5"}),accentColor:n.primaryColor,compact:!0,showPriorityView:!1}),e.jsx(Te,{label:t("orders.activeOrders"),value:nr,icon:e.jsx(Ie,{className:"h-4 w-4 text-white sm:h-5 sm:w-5"}),accentColor:n.secondaryColor,compact:!0,showPriorityView:!1}),e.jsx(Te,{label:t("orders.pendingOrders"),value:bt,icon:e.jsx(Qe,{className:"h-4 w-4 text-white sm:h-5 sm:w-5"}),accentColor:"#FFC107",valueColor:"#FFC107",compact:!0,showPriorityView:!1}),e.jsx(Te,{label:t("orders.acceptedOrders"),value:ir,icon:e.jsx(jt,{className:"h-4 w-4 text-white sm:h-5 sm:w-5"}),accentColor:"#7E57C2",valueColor:"#7E57C2",compact:!0,showPriorityView:!1}),e.jsx(Te,{label:t("orders.completedOrders"),value:dr,icon:e.jsx(Ne,{className:"h-4 w-4 text-white sm:h-5 sm:w-5"}),accentColor:"#2E7D32",valueColor:"#2E7D32",compact:!0,showPriorityView:!1})]}),e.jsx(ca,{children:e.jsxs(_r,{value:N,onValueChange:L,children:[e.jsx(ma,{children:e.jsxs(kr,{className:"app-compact-tabs-grid w-full gap-1 bg-transparent p-0",children:[e.jsxs(os,{value:"comandas",className:"app-compact-tab-trigger flex items-center gap-2 min-h-8 px-2 py-1.5 text-[11px]",children:[e.jsx(he,{className:"w-4 h-4"}),t("orders.title")]}),e.jsxs(os,{value:"ofertas",className:"app-compact-tab-trigger flex items-center gap-2 min-h-8 px-2 py-1.5 text-[11px]",children:[e.jsx(Ae,{className:"w-4 h-4"}),t("orders.offersRequestsTab")]})]})}),e.jsx(ns,{value:"comandas",className:"mt-0",children:e.jsxs(cs,{className:"space-y-2.5",children:[e.jsxs("div",{className:"app-compact-filters",children:[e.jsx("div",{className:"flex-1",children:e.jsx(dt,{placeholder:ae,value:V,onChange:s=>me(s.target.value),className:"w-full"})}),e.jsxs(ts,{value:De,onValueChange:Cs,children:[e.jsx(ss,{className:"w-[180px] h-9 text-xs",children:e.jsx(rs,{placeholder:t("orders.filterByStatus")})}),e.jsxs(as,{children:[e.jsx(Z,{value:"todos",children:t("orders.allStatuses")}),e.jsx(Z,{value:"pendiente",children:t("orders.pending")}),e.jsx(Z,{value:"confirmada",children:"Acceptée"}),e.jsx(Z,{value:"en_preparacion",children:t("orders.inPreparation")}),e.jsx(Z,{value:"completada",children:t("orders.completed")}),e.jsx(Z,{value:"entregada",children:t("orders.delivered")}),e.jsx(Z,{value:"anulada",children:t("orders.cancelled")})]})]}),e.jsxs(F,{variant:"outline",onClick:()=>Y(!0),disabled:Ze.length===0,className:"whitespace-nowrap h-9 text-xs",children:[e.jsx(he,{className:"w-4 h-4 mr-2"}),"Liste de distributions"]})]}),e.jsx(tt,{className:"overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl",children:e.jsxs(st,{className:"pt-3 space-y-2.5",children:[e.jsxs("div",{className:"flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-sm sm:text-base font-semibold",style:{fontFamily:"Montserrat, sans-serif",color:n.primaryColor},children:"Vue compacte par état des commandes"}),e.jsx("p",{className:"text-[11px] sm:text-xs text-[#666666]",children:"Tous les états visibles dans une lecture plus dense, sans perdre les détails opérationnels."})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-1",children:[e.jsxs("div",{className:"flex items-center rounded-full border border-[#dbe4ee] bg-white p-0.5 shadow-sm",children:[e.jsxs(F,{type:"button",variant:"ghost",size:"sm",onClick:()=>qt(!0),className:`h-7 rounded-full px-2.5 text-[11px] ${$e?"bg-[#1E73BE] text-white hover:bg-[#1E73BE] hover:text-white":"text-[#516071] hover:bg-[#f8fafc]"}`,children:[e.jsx(ga,{className:"mr-1.5 h-3.5 w-3.5"}),"Compact"]}),e.jsxs(F,{type:"button",variant:"ghost",size:"sm",onClick:()=>qt(!1),className:`h-7 rounded-full px-2.5 text-[11px] ${$e?"text-[#516071] hover:bg-[#f8fafc]":"bg-[#0f172a] text-white hover:bg-[#0f172a] hover:text-white"}`,children:[e.jsx(xa,{className:"mr-1.5 h-3.5 w-3.5"}),"Confort"]})]}),Kt.map(s=>e.jsxs("div",{className:"rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm",style:{color:s.accent,background:s.soft,border:`1px solid ${s.border}`},children:[s.label,": ",s.comandas.length]},`resume-${s.key}`))]})]}),ft.length===0?e.jsxs("div",{className:"rounded-[24px] border border-dashed border-[#d0d7de] bg-[#f8fafc]/90 p-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]",children:[e.jsx(he,{className:"mx-auto mb-3 h-10 w-10 text-[#9aa4b2]"}),e.jsx("p",{className:"text-sm font-medium text-[#334155]",children:"Aucune commande ne correspond aux filtres actuels."}),e.jsx("p",{className:"mt-1 text-xs text-[#64748b]",children:"Essayez une autre recherche ou changez le statut sélectionné."})]}):e.jsx("div",{className:"grid gap-3 lg:gap-4",style:{gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))"},children:Kt.map(s=>{const a=s.icon;return e.jsxs("div",{className:"overflow-hidden rounded-[26px] border border-white/75 shadow-[0_24px_56px_-38px_rgba(15,45,71,0.24)] backdrop-blur-xl",style:{background:"rgba(255, 255, 255, 0.92)",borderColor:s.border,boxShadow:`0 24px 56px -38px ${s.accent}35`},children:[e.jsxs("div",{className:"border-b px-3.5 py-3",style:{background:s.soft,borderColor:s.border},children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"flex items-start gap-2.5",children:[e.jsx("div",{className:"flex h-9 w-9 items-center justify-center rounded-xl shadow-sm",style:{backgroundColor:s.accent},children:e.jsx(a,{className:"h-4 w-4 text-white"})}),e.jsxs("div",{children:[e.jsx("h3",{className:"text-sm font-semibold text-[#1f2937]",children:s.label}),e.jsx("p",{className:"mt-0.5 text-[11px] leading-4 text-[#5b6472]",children:s.description})]})]}),e.jsx("div",{className:"rounded-full px-2.5 py-1 text-xs font-semibold",style:{color:s.accent,backgroundColor:"rgba(255, 255, 255, 0.8)"},children:s.metricas.totalCommandes})]}),e.jsxs("div",{className:`mt-3 grid ${$e?"grid-cols-4 gap-1":"grid-cols-2 gap-1.5"}`,children:[e.jsxs("div",{className:"rounded-lg bg-white/70 px-2.5 py-2",children:[e.jsx("p",{className:"text-[10px] uppercase tracking-[0.14em] text-[#6b7280]",children:"Articles"}),e.jsx("p",{className:"mt-0.5 text-xs font-semibold text-[#111827]",children:je(s.metricas.totalArticles)})]}),e.jsxs("div",{className:"rounded-lg bg-white/70 px-2.5 py-2",children:[e.jsx("p",{className:"text-[10px] uppercase tracking-[0.14em] text-[#6b7280]",children:"Organismes"}),e.jsx("p",{className:"mt-0.5 text-xs font-semibold text-[#111827]",children:je(s.metricas.organismes)})]}),e.jsxs("div",{className:"rounded-lg bg-white/70 px-2.5 py-2",children:[e.jsx("p",{className:"text-[10px] uppercase tracking-[0.14em] text-[#6b7280]",children:"Produits"}),e.jsx("p",{className:"mt-0.5 text-xs font-semibold text-[#111827]",children:je(s.metricas.totalProduits)})]}),e.jsxs("div",{className:"rounded-lg bg-white/70 px-2.5 py-2",children:[e.jsx("p",{className:"text-[10px] uppercase tracking-[0.14em] text-[#6b7280]",children:"Prochaine"}),e.jsx("p",{className:"mt-0.5 text-xs font-semibold text-[#111827]",children:s.metricas.prochaineLivraison?R(s.metricas.prochaineLivraison):"--"})]})]})]}),e.jsx("div",{className:`max-h-[60vh] overflow-y-auto p-3 ${$e?"space-y-1.5":"space-y-2"}`,children:s.comandas.length===0?e.jsx("div",{className:"rounded-xl border border-dashed p-4 text-center text-xs text-[#7b8794]",children:"Aucun élément dans cet état."}):s.comandas.map(r=>{const o=le(r),l=r.fechaEntrega?R(r.fechaEntrega):"",m=o?.horaCita||"",h=l&&m?`${l} • ${m}`:l||m||"--",d=ge(r),P=r.estado==="en_preparacion"&&d<100;return e.jsx("div",{className:`rounded-[22px] border border-white/75 bg-white/92 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_-30px_rgba(15,23,42,0.18)] ${$e?"p-2.5":"p-3"}`,style:{boxShadow:"0 14px 30px -28px rgba(15, 23, 42, 0.16)"},children:$e?e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("div",{className:"flex flex-wrap items-center gap-1.5",children:[e.jsx("p",{className:"truncate text-[13px] font-bold leading-5 text-[#0f172a]",children:o?.nombre||xe(r)||t("orders.withoutOrganism")}),e.jsx("span",{className:"rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#475569]",children:r.numero||r.id})]}),e.jsxs("div",{className:"mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#64748b]",children:[e.jsx("span",{children:h}),e.jsx("span",{className:"text-[#cbd5e1]",children:"•"}),e.jsxs("span",{children:[r.items?.length||0," ",t("inventory.products")]})]}),P&&e.jsxs("div",{className:"mt-2 flex items-center gap-2 text-[11px] font-semibold text-[#1E73BE]",children:[e.jsxs("span",{className:"rounded-full bg-[#edf5ff] px-2 py-0.5",children:["Préparation ",Math.round(d),"%"]}),e.jsx("div",{className:"h-1.5 flex-1 overflow-hidden rounded-full bg-[#e2e8f0]",children:e.jsx("div",{className:"h-full rounded-full bg-[#1E73BE] transition-all duration-300",style:{width:`${d}%`}})})]}),r.preparadoPor&&["en_preparacion","completada","entregada"].includes(r.estado)&&e.jsxs("p",{className:"mt-1 text-[11px] font-medium text-[#0f766e]",children:["Préparée par : ",r.preparadoPor]})]}),e.jsx("div",{className:"shrink-0",children:xt(r.estado)})]}),(r.grupoDistribucionAnclada||r.fechaCaducidadGrupo||wt(r)==="collation")&&e.jsxs("div",{className:"mt-2 flex flex-wrap gap-1",children:[ut(r),r.grupoDistribucionAnclada&&e.jsx(ue,{className:"border border-[#1E73BE]/20 bg-[#EAF4FF] text-[#1E73BE] hover:bg-[#EAF4FF]",children:"Distribution ancrée"}),r.fechaCaducidadGrupo&&e.jsxs(ue,{className:"border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]",children:["Péremption: ",R(r.fechaCaducidadGrupo)]})]}),e.jsxs("div",{className:"mt-2 flex items-center justify-end gap-1",children:[e.jsx(F,{variant:"ghost",size:"sm",onClick:()=>{j(r),D(!0)},title:t("orders.viewOrder"),className:"h-7 px-2 text-[11px] text-[#334155] hover:bg-[#f8fafc]",children:e.jsx(Ie,{className:"h-3.5 w-3.5"})}),e.jsx(F,{variant:"ghost",size:"sm",onClick:()=>gt(r),title:t("orders.printOrder"),className:"h-7 px-2 text-[11px] text-[#2E7D32] hover:bg-[#eef8ef] hover:text-[#2E7D32]",children:e.jsx(Qe,{className:"h-3.5 w-3.5"})}),e.jsx(F,{variant:"ghost",size:"sm",onClick:()=>{const u=le(r);ht(r,u)},title:t("orders.printLabelTitle"),className:"h-7 px-2 text-[11px] text-[#1E73BE] hover:bg-[#edf5ff] hover:text-[#1E73BE]",children:e.jsx(Ae,{className:"h-3.5 w-3.5"})})]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"flex items-start justify-between gap-2",children:[e.jsxs("div",{className:"min-w-0 space-y-0.5",children:[e.jsx("p",{className:"whitespace-normal break-words text-sm font-bold leading-5 text-[#0f172a]",children:o?.nombre||xe(r)||t("orders.withoutOrganism")}),e.jsx("div",{className:"flex items-center gap-1.5 text-[11px] text-[#64748b]",children:e.jsx("span",{className:"rounded-full bg-[#f1f5f9] px-2 py-0.5 font-semibold tracking-wide text-[#475569]",children:r.numero||r.id})}),(r.grupoDistribucionAnclada||r.fechaCaducidadGrupo||wt(r)==="collation")&&e.jsxs("div",{className:"mt-2 flex flex-wrap gap-1.5",children:[ut(r),r.grupoDistribucionAnclada&&e.jsx(ue,{className:"border border-[#1E73BE]/20 bg-[#EAF4FF] text-[#1E73BE] hover:bg-[#EAF4FF]",children:"Distribution ancrée"}),r.fechaCaducidadGrupo&&e.jsxs(ue,{className:"border border-[#F59E0B]/20 bg-[#FFF7E8] text-[#B45309] hover:bg-[#FFF7E8]",children:["Péremption: ",R(r.fechaCaducidadGrupo)]})]})]}),xt(r.estado)]}),e.jsxs("div",{className:"mt-3 grid grid-cols-2 gap-2 text-xs",children:[e.jsxs("div",{className:"rounded-lg bg-[#f8fafc] px-2.5 py-2",children:[e.jsx("p",{className:"text-[10px] uppercase tracking-wide text-[#64748b]",children:"Rendez-vous"}),e.jsx("p",{className:"mt-0.5 font-medium text-[#1e293b]",children:h})]}),e.jsxs("div",{className:"rounded-lg bg-[#f8fafc] px-2.5 py-2",children:[e.jsx("p",{className:"text-[10px] uppercase tracking-wide text-[#64748b]",children:"Produits"}),e.jsxs("p",{className:"mt-0.5 font-medium text-[#1e293b]",children:[r.items?.length||0," ",t("inventory.products")]})]})]}),r.estado==="en_preparacion"&&d<100&&e.jsxs("div",{className:"mt-2 rounded-lg border border-[#dbeafe] bg-[#eff6ff] px-2.5 py-2 text-xs text-[#1E73BE]",children:[e.jsxs("div",{className:"flex items-center justify-between gap-2",children:[e.jsx("span",{className:"font-semibold",children:"Préparation en cours"}),e.jsxs("span",{className:"font-bold",children:[Math.round(d),"%"]})]}),e.jsx("div",{className:"mt-1 h-1.5 overflow-hidden rounded-full bg-white/80",children:e.jsx("div",{className:"h-full rounded-full bg-[#1E73BE] transition-all duration-300",style:{width:`${d}%`}})})]}),r.preparadoPor&&["en_preparacion","completada","entregada"].includes(r.estado)&&e.jsxs("div",{className:"mt-2 rounded-lg bg-[#ecfeff] px-2.5 py-2 text-xs text-[#0f766e]",children:[e.jsx("span",{className:"font-semibold",children:"Préparée par :"})," ",r.preparadoPor]}),e.jsxs("div",{className:"mt-3 flex flex-wrap gap-1.5",children:[e.jsxs(F,{variant:"outline",size:"sm",onClick:()=>{j(r),D(!0)},title:t("orders.viewOrder"),className:"h-8 border-[#dbe4ee] bg-white px-2.5 text-[11px] hover:bg-[#f8fafc]",children:[e.jsx(Ie,{className:"mr-1.5 h-3.5 w-3.5"}),"Ouvrir"]}),e.jsxs(F,{variant:"outline",size:"sm",onClick:()=>gt(r),title:t("orders.printOrder"),className:"h-8 border-[#dbe4ee] bg-white px-2.5 text-[11px] text-[#2E7D32] hover:bg-[#eef8ef] hover:text-[#2E7D32]",children:[e.jsx(Qe,{className:"mr-1.5 h-3.5 w-3.5"}),"Imprimer"]}),e.jsxs(F,{variant:"outline",size:"sm",onClick:()=>{const u=le(r);ht(r,u)},title:t("orders.printLabelTitle"),className:"h-8 border-[#dbe4ee] bg-white px-2.5 text-[11px] text-[#1E73BE] hover:bg-[#edf5ff] hover:text-[#1E73BE]",children:[e.jsx(Ae,{className:"mr-1.5 h-3.5 w-3.5"}),"Étiquette"]})]})]})},r.id)})})]},s.key)})})]})})]})}),e.jsx(ns,{value:"ofertas",className:"mt-0",children:e.jsxs(cs,{className:"space-y-4",children:[e.jsx(tt,{className:"overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl",children:e.jsxs(st,{className:"pt-4 space-y-3",children:[e.jsxs("div",{className:"flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between",children:[e.jsxs("div",{children:[e.jsx("h2",{className:"text-base sm:text-lg font-semibold",style:{fontFamily:"Montserrat, sans-serif",color:n.primaryColor},children:"Vue compacte des offres et demandes"}),e.jsx("p",{className:"text-xs sm:text-sm text-[#666666]",children:"Suivi harmonisé des offres actives, des demandes reçues et des échéances sans changer de contexte."})]}),e.jsx("div",{className:"app-compact-filters",children:e.jsxs(ts,{value:Ce,onValueChange:_s,children:[e.jsx(ss,{className:"w-[250px] h-9 text-xs",children:e.jsx(rs,{placeholder:i("orders.offerStatusFilter")})}),e.jsxs(as,{children:[e.jsx(Z,{value:"todos",children:i("orders.allOffers")}),e.jsx(Z,{value:"pendientes",children:i("orders.pending")}),e.jsx(Z,{value:"con_solicitudes",children:i("orders.withRequests")}),e.jsx(Z,{value:"entregadas",children:i("orders.deliveredOffers")}),e.jsx(Z,{value:"activas",children:i("orders.activeOffers")}),e.jsx(Z,{value:"expiradas",children:i("orders.expiredOffers")})]})]})})]}),e.jsxs("div",{className:"flex flex-wrap items-center gap-1.5",children:[e.jsxs("div",{className:"rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm",style:{color:n.primaryColor,background:`${n.primaryColor}15`,border:`1px solid ${n.primaryColor}30`},children:["Offres visibles: ",ke.length]}),e.jsxs("div",{className:"rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm",style:{color:n.secondaryColor,background:`${n.secondaryColor}15`,border:`1px solid ${n.secondaryColor}30`},children:["Avec demandes: ",vt]}),e.jsxs("div",{className:"rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm",style:{color:"#b45309",background:"#fff7e8",border:"1px solid #fcd34d"},children:["Demandes: ",Wt]}),e.jsxs("div",{className:"rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm",style:{color:"#b91c1c",background:"#fef2f2",border:"1px solid #fecaca"},children:["Expirées: ",lr]})]})]})}),e.jsxs("div",{className:"space-y-4",children:[ke.map(s=>{const a=s.solicitudes?.length||0,r=new Date(s.fechaExpiracion),o=s.estado==="anulada",l=!o&&(!s.activa||r<new Date),m=o||l,h=Math.ceil((r.getTime()-new Date().getTime())/(1e3*60*60*24));return e.jsx(tt,{className:`overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl ${m?"opacity-70":""}`,children:e.jsx(st,{className:"pt-5",children:e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsxs("div",{className:"flex-1",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-2",children:[e.jsx(Ae,{className:"w-5 h-5 text-[#FFC107]"}),e.jsx("h3",{className:"font-bold text-[#333333]",style:{fontFamily:"Montserrat, sans-serif",fontSize:"1.1rem"},children:s.titulo})]}),e.jsx("p",{className:"text-xs text-[#666666] mb-1",children:s.numeroOferta}),s.descripcion&&e.jsx("p",{className:"text-sm text-[#666666]",children:s.descripcion})]}),e.jsxs("div",{className:"flex flex-col gap-2 items-end",children:[e.jsx(ue,{className:o?"bg-[#64748b]":l?"bg-[#DC3545]":h<=3?"bg-[#FFC107]":"bg-[#4CAF50]",children:o?"Annulée":l?i("orders.expired"):i("orders.expiresOn",{date:Q(s.fechaExpiracion)})}),a>0&&e.jsxs(ue,{className:"bg-[#1E73BE]",children:[a," ",i(a===1?"orders.requestCountSingular":"orders.requestCountPlural")]})]})]}),e.jsxs("div",{className:"flex flex-wrap gap-2 border-t border-[#e5edf5] pt-4",children:[!o&&e.jsxs(F,{size:"sm",variant:"outline",className:"border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white",onClick:()=>tr(s),children:[e.jsx(ua,{className:"w-4 h-4 mr-1"}),"Modifier l'échéance"]}),!o&&e.jsxs(F,{size:"sm",variant:"outline",className:"border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white",onClick:()=>rr(s),children:[e.jsx(At,{className:"w-4 h-4 mr-1"}),"Annuler l'offre"]})]}),e.jsxs("div",{className:"rounded-[22px] border border-white/75 bg-[#f8fbff]/92 p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.16)]",children:[e.jsx("h4",{className:"font-semibold text-[#333333] mb-3",style:{fontFamily:"Montserrat, sans-serif"},children:i("orders.offeredProducts")}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-3",children:gs(s.productos,d=>{const P=Lt.get(d.productoId);return d.temperaturaAlmacenamiento||d.temperatura||P?.temperaturaAlmacenamiento||P?.temperatura},(d,P)=>String(d.productoNombre||"").localeCompare(String(P.productoNombre||""),E)).map((d,P)=>{const u=d.cantidadOfrecida-d.cantidadDisponible,y=d.cantidadDisponible/d.cantidadOfrecida*100;return e.jsxs("div",{className:"rounded-[20px] border border-white/80 bg-white/92 p-3 shadow-[0_14px_30px_-26px_rgba(15,45,71,0.14)]",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[e.jsx("span",{className:"text-2xl",children:d.icono}),e.jsx("div",{className:"flex-1",children:e.jsx("p",{className:"font-medium text-sm text-[#333333]",children:d.productoNombre})})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsxs("div",{className:"flex justify-between text-xs",children:[e.jsx("span",{className:"text-[#666666]",children:i("orders.available")}),e.jsxs("span",{className:"font-semibold text-[#4CAF50]",children:[d.cantidadDisponible," / ",d.cantidadOfrecida," ",d.unidad]})]}),u>0&&e.jsxs("div",{className:"flex justify-between text-xs",children:[e.jsx("span",{className:"text-[#666666]",children:i("orders.reserved")}),e.jsxs("span",{className:"font-semibold text-[#FFC107]",children:[u," ",d.unidad]})]}),e.jsx("div",{className:"w-full bg-gray-200 rounded-full h-2 mt-2",children:e.jsx("div",{className:"h-2 rounded-full transition-all",style:{width:`${y}%`,backgroundColor:y>50?"#4CAF50":y>20?"#FFC107":"#DC3545"}})})]})]},`${s.id}-producto-${d.productoId}-${P}`)})})]}),a>0&&e.jsxs("div",{className:"border-t border-[#e5edf5] pt-4",children:[e.jsxs("h4",{className:"font-semibold text-[#333333] mb-3 flex items-center gap-2",style:{fontFamily:"Montserrat, sans-serif"},children:[e.jsx(yr,{className:"w-4 h-4 text-[#1E73BE]"}),i("orders.requestsReceived")," (",a,")"]}),e.jsx("div",{className:"space-y-2",children:s.solicitudes?.map((d,P)=>{const u=d.productosAceptados.reduce((v,C)=>{const b=s.productos.find(O=>O.productoId===C.productoId);return v+(b?.peso||0)*C.cantidadAceptada},0),y=d.productosAceptados.reduce((v,C)=>{const b=s.productos.find(O=>O.productoId===C.productoId);return v+(b?.valorUnitario||0)*(b?.peso||0)*C.cantidadAceptada},0);return e.jsxs("div",{className:"rounded-xl border border-[#cfe2ff] bg-[#eff6ff] p-4 shadow-sm",children:[e.jsxs("div",{className:"flex items-start justify-between mb-3",children:[e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-semibold text-[#333333]",children:d.organismoNombre}),e.jsx("p",{className:"text-xs text-[#666666]",children:Q(d.fechaSolicitud,{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}),d.preparadoPor&&(d.estado==="en_preparacion"||d.estado==="entregada")&&e.jsxs("p",{className:"mt-1 text-xs font-medium text-[#0f766e]",children:["Préparée par : ",d.preparadoPor]})]}),e.jsx("div",{className:"flex items-center gap-2",children:Yt(d.estado)})]}),d.estado==="pendiente"&&e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2 mb-3",children:[e.jsxs(F,{size:"sm",className:"flex-1 bg-[#4CAF50] hover:bg-[#45A049]",disabled:m,onClick:()=>Ws(s.id,d.id,d.organismoNombre),children:[e.jsx(jt,{className:"w-4 h-4 mr-1"}),i("orders.accept")]}),e.jsxs(F,{size:"sm",variant:"destructive",className:"flex-1",onClick:()=>{const v=prompt(t("orders.rejectReasonPrompt"));v&&Js(s.id,d.id,d.organismoNombre,v)},children:[e.jsx(lt,{className:"w-4 h-4 mr-1"}),i("orders.reject")]})]}),(d.estado==="aceptada"||d.estado==="en_preparacion")&&e.jsxs("div",{className:"flex flex-col sm:flex-row gap-2 mb-3",children:[e.jsxs(F,{size:"sm",variant:"outline",className:"flex-1 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white",onClick:()=>{Fs(d),$s(s),He(!0)},children:[e.jsx(Ie,{className:"w-4 h-4 mr-1"}),i("orders.view")]}),e.jsxs(F,{size:"sm",variant:"outline",className:"flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white",onClick:()=>{const v=Ht(d,s),C=qe().find(b=>b.id===v.organismoId);ht(v,C)},children:[e.jsx(Qe,{className:"w-4 h-4 mr-1"}),i("orders.print")]}),e.jsxs(F,{size:"sm",variant:"outline",className:"flex-1 border-[#FFC107] text-[#FFC107] hover:bg-[#FFC107] hover:text-white",onClick:()=>{const v=Ht(d,s);It(v),mt(!0)},children:[e.jsx(Ot,{className:"w-4 h-4 mr-1"}),i("orders.proposeDate")]}),d.estado==="aceptada"&&e.jsxs(F,{size:"sm",className:"flex-1 bg-[#1E73BE] hover:bg-[#175a95]",onClick:()=>Xs(s.id,d.id,d.organismoNombre),children:[e.jsx(he,{className:"w-4 h-4 mr-1"}),"En préparation"]}),d.estado==="en_preparacion"&&e.jsxs(F,{size:"sm",className:"flex-1 bg-[#0f766e] hover:bg-[#115e59]",onClick:()=>Zs(s.id,d.id,d.organismoNombre),children:[e.jsx(Ne,{className:"w-4 h-4 mr-1"}),i("orders.markDelivered")]})]}),(d.estado==="aceptada"||d.estado==="en_preparacion")&&e.jsx("div",{className:"flex flex-col sm:flex-row gap-2 mb-3",children:e.jsxs(F,{size:"sm",variant:"outline",className:"flex-1",onClick:()=>er(s.id,d.id,d.organismoNombre),children:[e.jsx(At,{className:"w-4 h-4 mr-1"}),i("orders.cancelOrder")]})}),d.estado==="entregada"&&e.jsx("div",{className:"bg-green-50 border border-green-200 rounded-lg p-3 mb-3 text-sm text-green-800",children:d.fechaActualizacion?t("orders.offerDeliveredOn",{date:R(d.fechaActualizacion,{year:"numeric",month:"long",day:"numeric"})}):t("orders.offerDeliveredWithoutDate")}),e.jsxs("div",{className:"rounded-lg border border-white/80 bg-white p-3 mb-3",children:[e.jsx("p",{className:"text-xs font-semibold text-[#666666] mb-2",children:i("orders.requestedProducts")}),e.jsx("div",{className:"space-y-1",children:d.productosAceptados.map((v,C)=>{const b=s.productos.find(O=>O.productoId===v.productoId);return e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{children:b?.icono}),e.jsx("span",{className:"text-[#333333]",children:b?.productoNombre})]}),e.jsxs("span",{className:"font-semibold text-[#1E73BE]",children:[v.cantidadAceptada," ",b?.unidad]})]},`${d.id}-prod-${v.productoId}-${C}`)})})]}),e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3",children:[e.jsxs("div",{className:"rounded-lg bg-white p-2 text-center shadow-sm",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:i("orders.products")}),e.jsx("p",{className:"font-bold text-[#1E73BE]",children:d.productosAceptados.length})]}),e.jsxs("div",{className:"rounded-lg bg-white p-2 text-center shadow-sm",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:i("orders.totalWeight")}),e.jsxs("p",{className:"font-bold text-[#4CAF50]",children:[Math.round(u)," kg"]})]}),e.jsxs("div",{className:"rounded-lg bg-white p-2 text-center shadow-sm",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:i("orders.value")}),e.jsxs("p",{className:"font-bold text-[#FFC107]",children:["CAD$ ",je(y)]})]})]}),d.observaciones&&e.jsxs("div",{className:"bg-yellow-50 border border-[#FFC107] rounded p-3",children:[e.jsx("p",{className:"text-xs font-semibold text-[#666666] mb-1",children:i("orders.detailsLabel")}),e.jsx("p",{className:"text-sm text-[#333333]",children:U(d.observaciones)})]})]},`${s.id}-solicitud-${d.id}`)})})]}),a===0&&!m&&e.jsx("div",{className:"text-center py-4 text-[#666666]",children:e.jsx("p",{className:"text-sm",children:i("orders.noRequestsYet")})})]})})},s.id)}),ke.length===0&&e.jsx(tt,{className:"overflow-hidden border-white/75 bg-white/88 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl",children:e.jsx(st,{className:"pt-6",children:e.jsxs("div",{className:"text-center py-8 text-[#666666]",children:[e.jsx(Ae,{className:"w-16 h-16 mx-auto mb-4 opacity-20"}),e.jsx("p",{className:"font-semibold mb-2",children:"Aucune offre ne correspond au filtre actuel."}),e.jsx("p",{className:"text-sm",children:"Changez le statut sélectionné ou créez une nouvelle offre pour alimenter cette vue."})]})})})]})]})})]})}),e.jsx(Me,{open:w,onOpenChange:_,children:e.jsxs(Le,{className:"app-dialog-comfort max-w-2xl","aria-describedby":"notificacion-dialog-description",children:[e.jsxs(Ge,{children:[e.jsx(Ve,{children:t("orders.notifyPendingOrders")}),e.jsx(Ue,{id:"notificacion-dialog-description",children:t("orders.notifyOrdersDescription")})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-sm text-[#666666]",children:t("orders.selectOrdersToNotify")}),e.jsxs("div",{className:"flex items-center gap-2 mb-4",children:[e.jsx(Nt,{checked:se.length===Re.length,onCheckedChange:Hs}),e.jsx(Oe,{children:t("inventory.selectAll")})]}),e.jsx("div",{className:"space-y-2 max-h-[400px] overflow-y-auto",children:Re.map(s=>{const a=le(s);return e.jsxs("div",{className:"flex items-center gap-2 p-3 border rounded",children:[e.jsx(Nt,{checked:se.includes(s.id),onCheckedChange:()=>Qs(s.id)}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:s.id}),e.jsx("p",{className:"text-sm text-[#666666]",children:a?.nombre||xe(s)||t("orders.withoutOrganism")}),ut(s)]}),xt(s.estado)]},s.id)})}),e.jsx("div",{className:"rounded-lg border border-[#1E73BE]/25 bg-[#EAF3FF] p-3",children:e.jsxs("div",{className:"flex items-start gap-2",children:[e.jsx(Nt,{id:"verification-notifications",checked:pe,onCheckedChange:s=>ne(!!s)}),e.jsxs("div",{children:[e.jsx(Oe,{htmlFor:"verification-notifications",className:"cursor-pointer font-medium text-[#1A4D7A]",children:"J’ai vérifié les destinataires. Les courriels seront envoyés automatiquement via Microsoft Graph."}),e.jsx("p",{className:"mt-1 text-xs text-[#4B647A]",children:"Les organismes ayant désactivé les notifications seront ignorés. Cette confirmation est obligatoire."})]})]})}),e.jsxs("div",{className:"app-compact-actions justify-end",children:[e.jsx(F,{variant:"outline",onClick:()=>{_(!1),ne(!1)},children:t("common.cancel")}),e.jsx(F,{onClick:Ys,disabled:!pe||se.length===0,className:"bg-[#1E73BE] hover:bg-[#1557A0]",children:t("orders.sendNotifications")})]})]})]})}),e.jsx(Ur,{open:H,onOpenChange:Y,comandas:Ze,currentLocale:E,onDistribucionesActualizadas:_e}),e.jsx(ya,{open:Es,onOpenChange:mt,comanda:Tt,organismo:qe().find(s=>s.id===Tt?.organismoId),onConfirmar:(s,a,r)=>{console.log("Nueva fecha propuesta:",{nuevaFecha:s,nuevaHora:a,motivo:r})}}),e.jsx(Me,{open:Ss,onOpenChange:He,children:e.jsxs(Le,{className:"app-dialog-comfort max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin","aria-describedby":"ver-solicitud-description",children:[e.jsxs(Ge,{children:[e.jsx(Ve,{style:{fontFamily:"Montserrat, sans-serif",fontSize:"1.5rem"},children:i("orders.requestDialogTitle")}),e.jsx(Ue,{id:"solicitud-dialog-description",children:i("orders.requestDialogDescription")})]}),M&&Ye&&e.jsxs("div",{className:"space-y-4 py-4",children:[e.jsxs("div",{className:"bg-blue-50 border border-blue-200 rounded-lg p-4",children:[e.jsx("h3",{className:"font-bold text-[#333333] mb-2",style:{fontFamily:"Montserrat, sans-serif"},children:i("orders.organism")}),e.jsx("p",{className:"text-lg font-semibold text-[#1E73BE]",children:M.organismoNombre}),e.jsx("p",{className:"text-sm text-[#666666] mt-1",children:i("orders.requestMadeOn",{date:Q(M.fechaSolicitud,{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})})}),e.jsx("div",{className:"mt-2",children:Yt(M.estado)}),M.preparadoPor&&(M.estado==="en_preparacion"||M.estado==="entregada")&&e.jsxs("p",{className:"text-sm text-[#0f766e] mt-2 font-medium",children:["Préparée par : ",M.preparadoPor]}),M.estado==="entregada"&&M.fechaActualizacion&&e.jsx("p",{className:"text-sm text-[#1E73BE] mt-2 font-medium",children:i("orders.deliveryRecordedOn",{date:Q(M.fechaActualizacion,{weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})})})]}),e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsxs("h3",{className:"font-bold text-[#333333] mb-3",style:{fontFamily:"Montserrat, sans-serif"},children:[i("orders.requestedProductsTitle")," (",M.productosAceptados.length,")"]}),e.jsx("div",{className:"space-y-2",children:M.productosAceptados.map((s,a)=>{const r=Ye.productos.find(m=>m.productoId===s.productoId),o=(r?.peso||0)*s.cantidadAceptada,l=(r?.valorUnitario||0)*o;return e.jsxs("div",{className:"bg-gray-50 rounded p-3",children:[e.jsxs("div",{className:"flex items-center justify-between mb-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-2xl",children:r?.icono}),e.jsx("div",{children:e.jsx("p",{className:"font-semibold text-[#333333]",children:r?.productoNombre})})]}),e.jsxs("span",{className:"text-lg font-bold text-[#1E73BE]",children:[s.cantidadAceptada," ",r?.unidad]})]}),e.jsxs("div",{className:"grid grid-cols-3 gap-2 mt-2",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:i("orders.totalWeight")}),e.jsxs("p",{className:"font-semibold text-[#4CAF50]",children:[Math.round(o)," kg"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:i("orders.valuePerKg")}),e.jsxs("p",{className:"font-semibold text-[#FFC107]",children:["CAD$ ",je(r?.valorUnitario||0)]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xs text-[#666666]",children:i("orders.valueTotal")}),e.jsxs("p",{className:"font-semibold text-[#FFC107]",children:["CAD$ ",je(l)]})]})]})]},`detalle-prod-${s.productoId}-${a}`)})})]}),e.jsxs("div",{className:"bg-green-50 border-2 border-[#4CAF50] rounded-lg p-4",children:[e.jsx("h3",{className:"font-bold text-[#333333] mb-3",style:{fontFamily:"Montserrat, sans-serif"},children:i("orders.totals")}),e.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:i("orders.totalProductsLabel")}),e.jsx("p",{className:"text-2xl font-bold text-[#1E73BE]",children:M.productosAceptados.length})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:i("orders.totalWeight")}),e.jsxs("p",{className:"text-2xl font-bold text-[#4CAF50]",children:[je(M.productosAceptados.reduce((s,a)=>{const r=Ye.productos.find(o=>o.productoId===a.productoId);return s+(r?.peso||0)*a.cantidadAceptada},0))," kg"]})]}),e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-sm text-[#666666] mb-1",children:i("orders.valueTotal")}),e.jsxs("p",{className:"text-2xl font-bold text-[#FFC107]",children:["CAD$ ",je(M.productosAceptados.reduce((s,a)=>{const r=Ye.productos.find(o=>o.productoId===a.productoId);return s+(r?.valorUnitario||0)*(r?.peso||0)*a.cantidadAceptada},0))]})]})]})]}),M.observaciones&&e.jsxs("div",{className:"bg-yellow-50 border border-[#FFC107] rounded-lg p-4",children:[e.jsx("h3",{className:"font-bold text-[#333333] mb-2",style:{fontFamily:"Montserrat, sans-serif"},children:i("orders.detailsAndObservations")}),e.jsx("p",{className:"text-sm text-[#333333] whitespace-pre-wrap",children:U(M.observaciones)})]}),e.jsx("div",{className:"flex justify-end",children:e.jsx(F,{variant:"outline",onClick:()=>He(!1),className:"min-w-[120px]",children:i("common.close")})})]})]})}),e.jsx(Me,{open:ks,onOpenChange:We,children:e.jsxs(Le,{className:"app-dialog-comfort max-w-md","aria-describedby":"editar-caducidad-oferta-description",children:[e.jsxs(Ge,{children:[e.jsx(Ve,{children:"Modifier la date de caducité"}),e.jsx(Ue,{id:"editar-caducidad-oferta-description",children:"Ajustez l’échéance de l’offre pour prolonger sa disponibilité administrative."})]}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(Oe,{htmlFor:"oferta-nueva-caducidad",children:"Nouvelle date de caducité"}),e.jsx(dt,{id:"oferta-nueva-caducidad",type:"date",value:ze,onChange:s=>pt(s.target.value)})]}),e.jsxs("div",{className:"flex justify-end gap-2 pt-2",children:[e.jsx(F,{variant:"outline",onClick:()=>We(!1),children:t("common.cancel")}),e.jsx(F,{onClick:sr,className:"bg-[#1E73BE] hover:bg-[#175a95]",children:"Enregistrer"})]})]})]})}),e.jsx(Me,{open:Os,onOpenChange:Je,children:e.jsxs(Le,{className:"app-dialog-comfort max-w-md","aria-describedby":"anular-oferta-description",children:[e.jsxs(Ge,{children:[e.jsx(Ve,{children:"Annuler l'offre"}),e.jsx(Ue,{id:"anular-oferta-description",children:"Cette action rendra l’offre invisible pour les organismes et annulera les demandes encore en attente."})]}),e.jsxs("div",{className:"space-y-4 py-2",children:[e.jsx("div",{className:"rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b]",children:"Les demandes déjà acceptées restent historiques et ne seront pas supprimées automatiquement."}),e.jsxs("div",{className:"flex justify-end gap-2 pt-2",children:[e.jsx(F,{variant:"outline",onClick:()=>Je(!1),children:t("common.cancel")}),e.jsx(F,{variant:"destructive",onClick:ar,children:"Confirmer l'annulation"})]})]})]})}),As&&e.jsx(Ca,{autoStartCamera:!0,onScanSuccess:Ks,onClose:()=>ie(!1)})]})]})}export{$o as Comandas};
