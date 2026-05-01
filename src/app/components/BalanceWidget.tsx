import React, { useState } from 'react';
import { ConfigurationBalance } from './ConfigurationBalance';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, ChevronDown, ChevronUp } from 'lucide-react';

interface BalanceWidgetProps {
  onWeightChange?: (weight: number, unit: string) => void;
  defaultExpanded?: boolean;
}

/**
 * Widget compacto de balanza que se puede integrar en otras páginas
 * Muestra un panel colapsable con la configuración de balanza
 */
export function BalanceWidget({ onWeightChange, defaultExpanded = false }: BalanceWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header colapsable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Scale className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">Balance électronique</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Contenido colapsable */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200"
          >
            <div className="p-4">
              <ConfigurationBalance 
                onWeightChange={onWeightChange}
                showInline={false}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
