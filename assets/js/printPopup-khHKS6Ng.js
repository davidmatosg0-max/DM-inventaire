function d(e,t){const n=t.printDelayMs??350,i=t.closeDelayMs??200,r=t.closeOnFocus!==!1,o=`
  <script>
    (() => {
      let printDispatched = false;
      let closeScheduled = false;

      const closeWindow = () => {
        if (closeScheduled) {
          return;
        }

        closeScheduled = true;
        window.setTimeout(() => {
          window.close();
        }, ${i});
      };

      window.addEventListener('afterprint', closeWindow, { once: true });

      ${r?`window.addEventListener('focus', () => {
        if (printDispatched) {
          closeWindow();
        }
      }, { once: true });`:""}

      window.addEventListener('load', () => {
        window.setTimeout(() => {
          printDispatched = true;
          window.print();
        }, ${n});
      }, { once: true });
    })();
  <\/script>`;return e.includes("</body>")?e.replace("</body>",`${o}
</body>`):e.includes("</html>")?e.replace("</html>",`${o}
</html>`):`${e}${o}`}function u(e){const t=e.width??1024,n=e.height??768;return`width=${t},height=${n}`}function a(e={}){const t=window.open("",e.name??"_blank",u(e));if(!t)throw new Error("El navegador bloqueó la ventana de impresión");return t}function p(e,t,n="Préparation impression..."){e.document.open(),e.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${n}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 24px;
            color: #334155;
          }
        </style>
      </head>
      <body>${t}</body>
    </html>
  `),e.document.close()}function w(e,t,n={}){const i=d(t,n);e.document.open(),e.document.write(i),e.document.close()}function f(e,t={}){const n=a(t);return w(n,e,t),n}function h(e,t={}){const n=t.timeoutMs??45e3,i=t.pollMs??200;return new Promise(r=>{if(e.closed){r();return}let o=!1;const c=()=>{o||(o=!0,window.clearInterval(s),window.clearTimeout(l),r())},s=window.setInterval(()=>{e.closed&&c()},i),l=window.setTimeout(()=>{c()},n);try{e.addEventListener("beforeunload",c,{once:!0})}catch{}})}export{a,p as b,w as c,f as o,h as w};
