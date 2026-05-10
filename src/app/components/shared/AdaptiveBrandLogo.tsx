import React, { useEffect, useState } from 'react';

type LogoShape = 'round' | 'square';

interface AdaptiveBrandLogoProps {
  src: string;
  alt: string;
  wrapperClassName?: string;
  containerClassName?: string;
  imageClassName?: string;
  backgroundClassName?: string;
  borderWidthClassName?: string;
  shadowClassName?: string;
  squareRadiusClassName?: string;
  glowClassName?: string;
  glowColor?: string;
  containerStyle?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  onClick?: () => void;
  title?: string;
}

const CANVAS_SIZE = 32;
const CORNER_ALPHA_THRESHOLD = 40;

function getAverageCornerAlpha(data: Uint8ClampedArray, startX: number, startY: number) {
  let alphaTotal = 0;

  for (let offsetY = 0; offsetY < 3; offsetY += 1) {
    for (let offsetX = 0; offsetX < 3; offsetX += 1) {
      const pixelIndex = ((startY + offsetY) * CANVAS_SIZE + (startX + offsetX)) * 4 + 3;
      alphaTotal += data[pixelIndex] ?? 255;
    }
  }

  return alphaTotal / 9;
}

function detectLogoShape(src: string): Promise<LogoShape> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const largestSide = Math.max(image.naturalWidth, image.naturalHeight, 1);
      const aspectDelta = Math.abs(image.naturalWidth - image.naturalHeight) / largestSide;

      if (aspectDelta > 0.16) {
        resolve('square');
        return;
      }

      try {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          resolve('square');
          return;
        }

        context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        context.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const { data } = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const cornerAlphas = [
          getAverageCornerAlpha(data, 0, 0),
          getAverageCornerAlpha(data, CANVAS_SIZE - 3, 0),
          getAverageCornerAlpha(data, 0, CANVAS_SIZE - 3),
          getAverageCornerAlpha(data, CANVAS_SIZE - 3, CANVAS_SIZE - 3),
        ];

        resolve(cornerAlphas.every((alpha) => alpha < CORNER_ALPHA_THRESHOLD) ? 'round' : 'square');
      } catch {
        resolve('square');
      }
    };

    image.onerror = () => resolve('square');

    if (!src.startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }

    image.src = src;
  });
}

export function AdaptiveBrandLogo({
  src,
  alt,
  wrapperClassName = 'h-10 w-10',
  containerClassName = '',
  imageClassName = '',
  backgroundClassName = 'bg-white',
  borderWidthClassName = '',
  shadowClassName = '',
  squareRadiusClassName = 'rounded-[26px]',
  glowClassName = 'blur-2xl opacity-30',
  glowColor,
  containerStyle,
  imageStyle,
  onClick,
  title,
}: AdaptiveBrandLogoProps) {
  const [shape, setShape] = useState<LogoShape>('square');

  useEffect(() => {
    let isActive = true;

    detectLogoShape(src).then((nextShape) => {
      if (isActive) {
        setShape(nextShape);
      }
    });

    return () => {
      isActive = false;
    };
  }, [src]);

  const radiusClassName = shape === 'round' ? 'rounded-full' : squareRadiusClassName;
  const innerPaddingStyle = shape === 'round' ? undefined : { padding: '12%' };

  return (
    <div className={`relative inline-flex ${wrapperClassName}`}>
      {glowColor && (
        <div
          className={`absolute inset-0 ${radiusClassName} ${glowClassName}`}
          style={{ backgroundColor: glowColor }}
        />
      )}

      <div
        onClick={onClick}
        title={title}
        className={`relative flex h-full w-full items-center justify-center overflow-hidden ${radiusClassName} ${backgroundClassName} ${borderWidthClassName} ${shadowClassName} ${containerClassName}`}
        style={containerStyle}
      >
        <div className="flex h-full w-full items-center justify-center" style={innerPaddingStyle}>
          <img
            src={src}
            alt={alt}
            className={`block h-full w-full ${shape === 'round' ? radiusClassName : ''} ${imageClassName}`}
            style={{ objectFit: 'contain', objectPosition: 'center', ...imageStyle }}
          />
        </div>
      </div>
    </div>
  );
}