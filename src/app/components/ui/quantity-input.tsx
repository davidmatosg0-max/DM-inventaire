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

export function normalizeQuantityText(value: string, allowDecimal = true) {
  void allowDecimal;
  return value.replace(/[^0-9]/g, '');
}

export function parseQuantityText(value: string, allowDecimal = true): number | null {
  void allowDecimal;
  const normalized = normalizeQuantityText(value, false);

  if (!normalized) {
    return null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatQuantityText(value: number | string, precision?: number) {
  void precision;
  if (typeof value === 'string') {
    return value.replace(/[^0-9]/g, '');
  }

  if (!Number.isFinite(value)) {
    return '';
  }

  return String(Math.round(value));
}

interface QuantityInputProps extends Omit<React.ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> {
  value: number | string;
  onChangeText: (value: string) => void;
  min?: number;
  max?: number;
  step?: number | string;
  showButtons?: boolean;
  clampOnBlur?: boolean;
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
  decrementAriaLabel = 'Diminuer la quantité',
  incrementAriaLabel = 'Augmenter la quantité',
  className,
  wrapperClassName,
  buttonClassName,
  disabled,
  onBlur,
  ...props
}: QuantityInputProps) {
  const stepPrecision = 0;
  const allowDecimal = false;
  const displayValue = React.useMemo(() => formatQuantityText(value, 0), [value]);

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
    const currentValue = typeof value === 'number' ? value : parseQuantityText(String(value), allowDecimal) ?? 0;
    const stepValue = typeof step === 'number' ? step : Number(step);
    const safeStep = Number.isFinite(stepValue) && stepValue > 0 ? stepValue : 1;
    const nextValue = clampValue(Math.round(currentValue + (delta * safeStep)));

    onChangeText(formatQuantityText(nextValue, stepPrecision));
  }, [allowDecimal, clampValue, onChangeText, step, stepPrecision, value]);

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
        inputMode="numeric"
        value={displayValue}
        disabled={disabled}
        onChange={(event) => onChangeText(normalizeQuantityText(event.target.value, allowDecimal))}
        onBlur={(event) => {
          if (clampOnBlur) {
            const parsed = parseQuantityText(event.target.value, allowDecimal);
            if (parsed !== null) {
              onChangeText(formatQuantityText(clampValue(parsed), stepPrecision));
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