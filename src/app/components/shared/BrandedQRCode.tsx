import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

type BrandedQRCodeProps = React.ComponentProps<typeof QRCodeSVG> & {
  badgeLabel?: string;
  containerClassName?: string;
};

export function BrandedQRCode({
  badgeLabel = 'DM',
  containerClassName,
  size = 128,
  ...qrProps
}: BrandedQRCodeProps) {
  const badgeSize = Math.max(22, Math.round(size * 0.22));
  const fontSize = Math.max(8, Number((badgeSize * 0.31).toFixed(2)));

  return (
    <div className={containerClassName || 'relative inline-flex items-center justify-center'}>
      <QRCodeSVG {...qrProps} size={size} />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <div
          className="relative flex items-center justify-center rounded-full border border-slate-300/80 bg-white/90"
          style={{
            width: badgeSize,
            height: badgeSize,
            boxShadow: '0 3px 10px rgba(15,23,42,0.08)',
          }}
        >
          <div className="absolute inset-[2px] rounded-full border border-slate-100/90" />
          <span
            className="relative pl-[0.08em] font-medium tracking-[0.08em] text-slate-600"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: `${fontSize}px`,
            }}
          >
            {badgeLabel}
          </span>
        </div>
      </div>
    </div>
  );
}