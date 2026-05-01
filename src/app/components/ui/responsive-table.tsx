import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  mobileLabel?: string; // Label para mostrar en vista móvil
  hideOnMobile?: boolean; // Ocultar columna en móvil
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function ResponsiveTable<T>({ 
  data, 
  columns, 
  keyExtractor, 
  emptyMessage = 'No hay datos disponibles',
  onRowClick 
}: ResponsiveTableProps<T>) {
  const getCellValue = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor] as React.ReactNode;
  };

  return (
    <>
      {/* Vista de tabla para desktop */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={column.className}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow 
                  key={keyExtractor(item)}
                  onClick={() => onRowClick?.(item)}
                  className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex}
                      className={column.className}
                    >
                      {getCellValue(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista de cards para móvil */}
      <div className="md:hidden space-y-3">
        {data.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-white rounded-lg border">
            {emptyMessage}
          </div>
        ) : (
          data.map((item) => (
            <div 
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={`bg-white rounded-lg border p-4 space-y-2 ${
                onRowClick ? 'cursor-pointer active:bg-gray-50' : ''
              }`}
            >
              {columns
                .filter(column => !column.hideOnMobile)
                .map((column, colIndex) => (
                  <div key={colIndex} className="flex justify-between items-start gap-2">
                    <span className="text-xs font-medium text-gray-600 flex-shrink-0">
                      {column.mobileLabel || column.header}:
                    </span>
                    <span className="text-sm text-gray-900 text-right flex-1 truncate">
                      {getCellValue(item, column)}
                    </span>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
