import QRCode from 'qrcode';

export const QR_BRAND_LABEL = 'DM';

type QRDataUrlOptions = Parameters<typeof QRCode.toDataURL>[1];

async function applyQrCenterBadge(dataUrl: string, badgeLabel: string, badgeScale: number = 0.22) {
  if (typeof window === 'undefined') {
    return dataUrl;
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const qrImage = new Image();
    qrImage.onload = () => resolve(qrImage);
    qrImage.onerror = () => reject(new Error('No se pudo cargar el QR para aplicar la marca DM.'));
    qrImage.src = dataUrl;
  });

  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    return dataUrl;
  }

  context.drawImage(image, 0, 0, width, height);

  const safeBadgeScale = Math.min(0.22, Math.max(0.12, badgeScale));
  const badgeSize = Math.max(18, Math.round(Math.min(width, height) * safeBadgeScale));
  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = badgeSize / 2;
  const innerRadius = outerRadius - 2;
  const fontSize = Math.max(8, Number((badgeSize * 0.31).toFixed(2)));

  context.save();
  context.beginPath();
  context.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  context.fillStyle = 'rgba(255,255,255,0.92)';
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = 'rgba(203,213,225,0.95)';
  context.stroke();

  context.beginPath();
  context.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  context.lineWidth = 1;
  context.strokeStyle = 'rgba(241,245,249,0.95)';
  context.stroke();

  context.fillStyle = '#475569';
  context.font = `500 ${fontSize}px Montserrat, Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(badgeLabel, centerX, centerY + fontSize * 0.03);
  context.restore();

  return canvas.toDataURL('image/png');
}

export async function generateBrandedQrDataUrl(
  value: string,
  options?: QRDataUrlOptions,
  badgeLabel: string = QR_BRAND_LABEL,
  badgeScale?: number,
) {
  const dataUrl = await QRCode.toDataURL(value, options);
  return applyQrCenterBadge(dataUrl, badgeLabel, badgeScale);
}