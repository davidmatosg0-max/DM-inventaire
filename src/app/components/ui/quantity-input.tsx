import * as React from 'react';
import { Minus, Plus } from 'lucide-react';

import { Button } from './button';
import { Input } from './input';
import { cn } from './utils';

function getPrecision(step?: number | string) {
  const stepText = String(step ?? 1);
  const decimalPart = stepText.split('.')[1] || '';
  return decimalPart.length;
}

function trimTrailingZeros(text: string) {
  if (!text.includes('.')) {
    return text;
  }

  return text.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');
}

function sanitizeDecimalText(value: string) {
  const normalized = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
  const [integerPart, ...decimalParts] = normalized.split('.');
  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join('')}`;
}

export function normalizeQuantityText(value: string, allowDecimal = true) {
  return allowDecimal ? sanitizeDecimalText(value) : value.replace(/[^0-9]/g, '');
}

export function parseQuantityText(value: string, allowDecimal = true): number | null {
  const normalized = normalizeQuantityText(value, allowDecimal);

  if (!normalized) {
    return null;
  }

  const parsed = allowDecimal ? Number.parseFloat(normalized) : Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatQuantityText(value: number | string, precision?: number) {
  if (typeof value === 'string') {
    return trimTrailingZeros(sanitizeDecimalText(value));
  }

  if (!Number.isFinite(value)) {
    return '';
  }

  const effectivePrecision = typeof precision === 'number' ? precision : 0;
  if (effectivePrecision <= 0) {
    return String(Math.round(value));
  }

  return trimTrailingZeros(value.toFixed(effectivePrecision));
}

interface QuantityInputProps extends Omit<React.ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> {
  value: number | string;
  onChangeText: (value: string) => void;
  min?: number;
  max?: number;
  step?: number | string;
  showButtons?: boolean;
  clampOnBlur?: boolean;
  allowDecimal?: boolean;
  decrementAriaLabel?: string;
  incrementAriaLabel?: string;
  wrapperClassName?: string;
  buttonClassName?: string;
}

export function QuantityInput({
  value,
  onChangeText,
  min,
  max,
  step = 1,
  showButtons = true,
  clampOnBlur = true,
  allowDecimal,
  decrementAriaLabel = 'Diminuer la quantité',
  incrementAriaLabel = 'Augmenter la quantité',
  className,
  wrapperClassName,
  buttonClassName,
  disabled,
  onBlur,
  ...props
}: QuantityInputProps) {
  const stepPrecision = getPrecision(step);
  const canUseDecimal = allowDecimal ?? stepPrecision > 0;
  const displayValue = React.useMemo(
    () => formatQuantityText(value, canUseDecimal ? stepPrecision : 0),
    [canUseDecimal, stepPrecision, value],
  );

  const clampValue = React.useCallback((rawValue: number) => {
    let nextValue = rawValue;

    if (typeof min === 'number') {
      nextValue = Math.max(min, nextValue);
    }

    if (typeof max === 'number') {
      nextValue = Math.min(max, nextValue);
    }

    return nextValue;
  }, [max, min]);

  const emitAdjustedValue = React.useCallback((delta: number) => {
    const currentValue = typeof value === 'number' ? value : parseQuantityText(String(value), canUseDecimal) ?? 0;
    const stepValue = typeof step === 'number' ? step : Number(step);
    const safeStep = Number.isFinite(stepValue) && stepValue > 0 ? stepValue : 1;
    const rawValue = currentValue + (delta * safeStep);
    const roundedValue = canUseDecimal && stepPrecision > 0
      ? Number(rawValue.toFixed(stepPrecision))
      : Math.round(rawValue);
    const nextValue = clampValue(roundedValue);

    onChangeText(formatQuantityText(nextValue, canUseDecimal ? stepPrecision : 0));
  }, [canUseDecimal, clampValue, onChangeText, step, stepPrecision, value]);

  return (
    <div className={cn('flex items-center gap-2', wrapperClassName)}>
      {showButtons && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={decrementAriaLabel}
          className={cn('h-10 w-10 shrink-0', buttonClassName)}
          disabled={disabled}
          onClick={() => emitAdjustedValue(-1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
      )}
      <Input
        type="text"
        inputMode={canUseDecimal ? 'decimal' : 'numeric'}
        value={displayValue}
        disabled={disabled}
        onChange={(event) => onChangeText(normalizeQuantityText(event.target.value, canUseDecimal))}
        onBlur={(event) => {
          if (clampOnBlur) {
            const parsed = parseQuantityText(event.target.value, canUseDecimal);
            if (parsed !== null) {
              const clampedValue = clampValue(parsed);
              const roundedValue = canUseDecimal && stepPrecision > 0
                ? Number(clampedValue.toFixed(stepPrecision))
                : Math.round(clampedValue);
              onChangeText(formatQuantityText(roundedValue, canUseDecimal ? stepPrecision : 0));
            }
          }

          onBlur?.(event);
        }}
        className={cn('text-center', className)}
        {...props}
      />
      {showButtons && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={incrementAriaLabel}
          className={cn('h-10 w-10 shrink-0', buttonClassName)}
          disabled={disabled}
          onClick={() => emitAdjustedValue(1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}