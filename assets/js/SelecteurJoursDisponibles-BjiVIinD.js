import{r as o,j as e}from"./react-vendor-CmVymGNF.js";import{a2 as p,W as h}from"./index-CZXQ2HXa.js";import{S as m}from"./sun-T8arkONU.js";/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M16 14h.01",key:"1gbofw"}],["path",{d:"M8 18h.01",key:"lrp35t"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M16 18h.01",key:"kzsmim"}]],M=p("calendar-days",y);/**
 * @license lucide-react v0.487.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",key:"a7tn18"}]],u=p("moon",v),N=[{jour:"Lundi",short:"Lun"},{jour:"Mardi",short:"Mar"},{jour:"Mercredi",short:"Mer"},{jour:"Jeudi",short:"Jeu"},{jour:"Vendredi",short:"Ven"},{jour:"Samedi",short:"Sam"},{jour:"Dimanche",short:"Dim"}];function D({joursDisponibles:c,joursSelectionnes:x,onChange:n,label:w="Jours disponibles (Cliquez pour sélectionner l'horaire)",description:k="Sélectionnez les jours et horaires pendant lesquels vous êtes disponible.",showIcon:b=!0,className:f=""}){const a=o.useMemo(()=>x||c||[],[x,c]),d=o.useCallback((s,l)=>{const r=a.find(t=>t.jour===s);let i;r?r.horaire===l?i=a.filter(t=>t.jour!==s):i=a.map(t=>t.jour===s?{...t,horaire:l}:t):i=[...a,{jour:s,horaire:l}],n(i)},[a,n]),j=o.useCallback(s=>{s.preventDefault(),s.stopPropagation(),n([])},[n]),g=o.useCallback(s=>a.find(r=>r.jour===s)?.horaire||null,[a]);return e.jsxs("div",{className:f,children:[b&&e.jsxs("div",{className:"flex items-center gap-3 mb-5",children:[e.jsx("div",{className:"w-10 h-10 rounded-xl bg-gradient-to-br from-[#FFC107] to-[#FFA000] flex items-center justify-center",children:e.jsx(M,{className:"w-5 h-5 text-white"})}),e.jsx("h3",{className:"text-xl font-bold text-[#333333]",children:"Disponibilité"})]}),e.jsxs("div",{className:"mb-4",children:[e.jsx("h3",{className:"text-sm font-semibold text-[#333333] mb-1",children:"Jours et Horaires"}),e.jsx("p",{className:"text-xs text-[#666666]",children:"Cliquez sur AM, PM ou Journée complète"})]}),e.jsx("div",{className:"grid grid-cols-7 gap-2 mb-4",children:N.map(({jour:s,short:l})=>{const r=g(s),i=r!==null;return e.jsxs("div",{className:`
                rounded-lg border-2 p-2 transition-all
                ${i?"border-[#1a4d7a] bg-blue-50":"border-gray-200 bg-white"}
              `,children:[e.jsx("div",{className:`
                text-center text-xs font-bold mb-2 pb-1.5 border-b
                ${i?"text-[#1a4d7a] border-[#1a4d7a]/20":"text-gray-600 border-gray-200"}
              `,children:l}),e.jsxs("div",{className:"flex flex-col gap-1",children:[e.jsxs("button",{type:"button",onClick:t=>{t.preventDefault(),t.stopPropagation(),d(s,"AM")},className:`
                    w-full px-1.5 py-1 rounded text-[10px] font-bold transition-all
                    flex items-center justify-center gap-0.5
                    ${r==="AM"?"bg-red-500 text-white shadow-md":"bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"}
                  `,title:"Matin",children:[e.jsx(m,{className:"w-2.5 h-2.5"}),e.jsx("span",{children:"AM"})]}),e.jsxs("button",{type:"button",onClick:t=>{t.preventDefault(),t.stopPropagation(),d(s,"PM")},className:`
                    w-full px-1.5 py-1 rounded text-[10px] font-bold transition-all
                    flex items-center justify-center gap-0.5
                    ${r==="PM"?"bg-purple-500 text-white shadow-md":"bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600"}
                  `,title:"Après-midi",children:[e.jsx(u,{className:"w-2.5 h-2.5"}),e.jsx("span",{children:"PM"})]}),e.jsxs("button",{type:"button",onClick:t=>{t.preventDefault(),t.stopPropagation(),d(s,"AM/PM")},className:`
                    w-full px-1.5 py-1 rounded text-[10px] font-bold transition-all
                    flex items-center justify-center gap-0.5
                    ${r==="AM/PM"?"bg-amber-500 text-white shadow-md":"bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600"}
                  `,title:"Journée complète",children:[e.jsx(h,{className:"w-2.5 h-2.5"}),e.jsx("span",{className:"text-[9px]",children:"JOUR"})]})]})]},s)})}),e.jsxs("div",{className:"flex items-center gap-6 text-xs flex-wrap",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded bg-red-500 flex items-center justify-center",children:e.jsx(m,{className:"w-2 h-2 text-white"})}),e.jsx("span",{className:"text-gray-600 font-medium",children:"AM (Matin)"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded bg-purple-500 flex items-center justify-center",children:e.jsx(u,{className:"w-2 h-2 text-white"})}),e.jsx("span",{className:"text-gray-600 font-medium",children:"PM (Après-midi)"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("div",{className:"w-3 h-3 rounded bg-amber-500 flex items-center justify-center",children:e.jsx(h,{className:"w-2 h-2 text-white"})}),e.jsx("span",{className:"text-gray-600 font-medium",children:"Journée complète"})]}),e.jsx("button",{type:"button",onClick:j,className:"text-blue-600 hover:text-blue-700 hover:underline ml-auto cursor-pointer font-semibold",children:"Réinitialiser"})]})]})}export{u as M,D as S};
