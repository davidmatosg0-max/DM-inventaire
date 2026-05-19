import React, { useEffect, useState } from 'react';

type LogoShape = 'round' | 'square';

interface LogoContentBounds {
  widthRatio: number;
  heightRatio: number;
  centerX: number;
  centerY: number;
}

interface LogoAnalysis {
  shape: LogoShape;
  contentBounds: LogoContentBounds | null;
}

interface AdaptiveBrandLogoProps {
  src: string;
  alt: string;
  forceShape?: LogoShape;
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

const CANVAS_SIZE = 64;
const CORNER_ALPHA_THRESHOLD = 40;
const CONTENT_ALPHA_THRESHOLD = 24;
const CONTENT_FILL_RATIO = 0.9;
const MAX_AUTO_SCALE = 2.4;

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

function getLogoContentBounds(data: Uint8ClampedArray): LogoContentBounds | null {
  let minX = CANVAS_SIZE;
  let minY = CANVAS_SIZE;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < CANVAS_SIZE; y += 1) {
    for (let x = 0; x < CANVAS_SIZE; x += 1) {
      const pixelIndex = (y * CANVAS_SIZE + x) * 4 + 3;
      const alpha = data[pixelIndex] ?? 0;

      if (alpha <= CONTENT_ALPHA_THRESHOLD) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0 || maxY < 0) {
    return null;
  }

  return {
    widthRatio: (maxX - minX + 1) / CANVAS_SIZE,
    heightRatio: (maxY - minY + 1) / CANVAS_SIZE,
    centerX: (minX + maxX + 1) / (2 * CANVAS_SIZE),
    centerY: (minY + maxY + 1) / (2 * CANVAS_SIZE),
  };
}

function analyzeLogo(src: string): Promise<LogoAnalysis> {
  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const largestSide = Math.max(image.naturalWidth, image.naturalHeight, 1);
      const aspectDelta = Math.abs(image.naturalWidth - image.naturalHeight) / largestSide;

      try {
        const canvas = document.createElement('canvas');
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
          resolve({
            shape: 'square',
            contentBounds: null,
          });
          return;
        }

        context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        context.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const { data } = context.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const contentBounds = getLogoContentBounds(data);

        const cornerAlphas = [
          getAverageCornerAlpha(data, 0, 0),
          getAverageCornerAlpha(data, CANVAS_SIZE - 3, 0),
          getAverageCornerAlpha(data, 0, CANVAS_SIZE - 3),
          getAverageCornerAlpha(data, CANVAS_SIZE - 3, CANVAS_SIZE - 3),
        ];

        resolve({
          shape: aspectDelta > 0.16 || !cornerAlphas.every((alpha) => alpha < CORNER_ALPHA_THRESHOLD) ? 'square' : 'round',
          contentBounds,
        });
      } catch {
        resolve({
          shape: 'square',
          contentBounds: null,
        });
      }
    };

    image.onerror = () => resolve({
      shape: 'square',
      contentBounds: null,
    });

    if (!src.startsWith('data:')) {
      image.crossOrigin = 'anonymous';
    }

    image.src = src;
  });
}

export function AdaptiveBrandLogo({
  src,
  alt,
  forceShape,
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
  const [analysis, setAnalysis] = useState<LogoAnalysis>({
    shape: 'square',
    contentBounds: null,
  });

  useEffect(() => {
    let isActive = true;

    analyzeLogo(src).then((nextAnalysis) => {
      if (isActive) {
        setAnalysis({
          shape: forceShape ?? nextAnalysis.shape,
          contentBounds: nextAnalysis.contentBounds,
        });
      }
    });

    return () => {
      isActive = false;
    };
  }, [forceShape, src]);

  const shape = forceShape ?? analysis.shape;
  const resolvedSquareRadiusClassName = forceShape === 'square' && squareRadiusClassName === 'rounded-[26px]'
    ? 'rounded-none'
    : squareRadiusClassName;
  const radiusClassName = shape === 'round' ? 'rounded-full' : resolvedSquareRadiusClassName;
  const imageRenderStyle: React.CSSProperties = {
    objectFit: 'contain',
    objectPosition: 'center',
    ...imageStyle,
  };

  if (analysis.contentBounds) {
    const dominantCoverage = Math.max(analysis.contentBounds.widthRatio, analysis.contentBounds.heightRatio, 0.01);
    const scale = Math.min(MAX_AUTO_SCALE, Math.max(1, CONTENT_FILL_RATIO / dominantCoverage));
    const translateX = -(analysis.contentBounds.centerX - 0.5) * scale * 100;
    const translateY = -(analysis.contentBounds.centerY - 0.5) * scale * 100;

    imageRenderStyle.transform = `translate(${translateX.toFixed(2)}%, ${translateY.toFixed(2)}%) scale(${scale.toFixed(3)})`;
    imageRenderStyle.transformOrigin = 'center center';
  }

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
        <div className="flex h-full w-full items-center justify-center">
          <img
            src={src}
            alt={alt}
            className={`block h-full w-full ${shape === 'round' ? radiusClassName : ''} ${imageClassName}`}
            style={imageRenderStyle}
          />
        </div>
      </div>
    </div>
  );
}