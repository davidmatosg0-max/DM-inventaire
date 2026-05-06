interface PrintPopupOptions {
  width?: number;
  height?: number;
  name?: string;
  printDelayMs?: number;
  closeDelayMs?: number;
  closeOnFocus?: boolean;
}

function injectPrintScript(html: string, options: PrintPopupOptions): string {
  const printDelayMs = options.printDelayMs ?? 350;
  const closeDelayMs = options.closeDelayMs ?? 200;
  const closeOnFocus = options.closeOnFocus !== false;

  const script = `
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
        }, ${closeDelayMs});
      };

      window.addEventListener('afterprint', closeWindow, { once: true });

      ${closeOnFocus ? `window.addEventListener('focus', () => {
        if (printDispatched) {
          closeWindow();
        }
      }, { once: true });` : ''}

      window.addEventListener('load', () => {
        window.setTimeout(() => {
          printDispatched = true;
          window.print();
        }, ${printDelayMs});
      }, { once: true });
    })();
  </script>`;

  if (html.includes('</body>')) {
    return html.replace('</body>', `${script}\n</body>`);
  }

  if (html.includes('</html>')) {
    return html.replace('</html>', `${script}\n</html>`);
  }

  return `${html}${script}`;
}

function buildWindowFeatures(options: PrintPopupOptions): string {
  const width = options.width ?? 1024;
  const height = options.height ?? 768;
  return `width=${width},height=${height}`;
}

export function openPrintPopup(options: PrintPopupOptions = {}): Window {
  const printWindow = window.open('', options.name ?? '_blank', buildWindowFeatures(options));

  if (!printWindow) {
    throw new Error('El navegador bloqueó la ventana de impresión');
  }

  return printWindow;
}

export function writePrintPopupPlaceholder(printWindow: Window, message: string, title = 'Préparation impression...'): void {
  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 24px;
            color: #334155;
          }
        </style>
      </head>
      <body>${message}</body>
    </html>
  `);
  printWindow.document.close();
}

export function writeAutoPrintPopupContent(printWindow: Window, html: string, options: PrintPopupOptions = {}): void {
  const finalHtml = injectPrintScript(html, options);
  printWindow.document.open();
  printWindow.document.write(finalHtml);
  printWindow.document.close();
}

export function openAutoPrintPopup(html: string, options: PrintPopupOptions = {}): Window {
  const printWindow = openPrintPopup(options);
  writeAutoPrintPopupContent(printWindow, html, options);
  return printWindow;
}

export function waitForPrintPopupToClose(
  printWindow: Window,
  options: { timeoutMs?: number; pollMs?: number } = {}
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 45000;
  const pollMs = options.pollMs ?? 200;

  return new Promise((resolve) => {
    if (printWindow.closed) {
      resolve();
      return;
    }

    let settled = false;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
      resolve();
    };

    const intervalId = window.setInterval(() => {
      if (printWindow.closed) {
        finish();
      }
    }, pollMs);

    const timeoutId = window.setTimeout(() => {
      finish();
    }, timeoutMs);

    try {
      printWindow.addEventListener('beforeunload', finish, { once: true });
    } catch {
      // Algunos navegadores no exponen listeners fiables en popups de impresión.
    }
  });
}
