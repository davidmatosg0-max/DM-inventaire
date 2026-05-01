import QRCode from 'qrcode';

const outputs = [
  {
    file: 'tmp/qr-comandas-smoke.png',
    data: JSON.stringify({ comanda: 'SMOKE-001', organismo: 'Organisme Test' }),
  },
  {
    file: 'tmp/qr-inventario-smoke.png',
    data: JSON.stringify({ producto: 'Produit Smoke', categoria: 'Tests' }),
  },
];

for (const output of outputs) {
  await QRCode.toFile(output.file, output.data, { width: 300, margin: 1 });
}

console.log('QR smoke files generated');
