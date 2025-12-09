'use client';

import { useState } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// ============================================
// TYPES
// ============================================

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  searchValue?: string;
  // Pagination
  pagination?: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  // Sorting
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  // Selection
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  // Actions
  actions?: React.ReactNode;
  bulkActions?: React.ReactNode;
}

// ============================================
// COMPONENT
// ============================================

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Nenhum item encontrado',
  searchPlaceholder = 'Pesquisar...',
  onSearch,
  searchValue,
  pagination,
  sortColumn,
  sortDirection,
  onSort,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  actions,
  bulkActions,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = useState(searchValue || '');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    onSearch?.(value);
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    const key = column.key as string;
    const newDirection =
      sortColumn === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedItems.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(keyExtractor));
    }
  };

  const handleSelectItem = (id: string) => {
    if (!onSelectionChange) return;

    if (selectedItems.includes(id)) {
      onSelectionChange(selectedItems.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedItems, id]);
    }
  };

  const getValue = (item: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  const allSelected = data.length > 0 && selectedItems.length === data.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < data.length;

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Search */}
          {onSearch && (
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={localSearch}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedItems.length > 0 && bulkActions}
            {actions}
          </div>
        </div>

        {/* Selection info */}
        {selectable && selectedItems.length > 0 && (
          <div className="mt-3 text-sm text-gray-600">
            {selectedItems.length} item(s) selecionado(s)
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortColumn === column.key && (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon className="h-4 w-4" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              // Loading skeleton
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {selectable && (
                    <td className="px-6 py-4">
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                const id = keyExtractor(item);
                const isSelected = selectedItems.includes(id);

                return (
                  <tr
                    key={id}
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-purple-50' : ''}`}
                  >
                    {selectable && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(id)}
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key as string}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {column.render
                          ? column.render(item, index)
                          : String(getValue(item, column.key as string) ?? '-')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Page size selector */}
            {pagination.onPageSizeChange && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Mostrar</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>por página</span>
              </div>
            )}

            {/* Page info and navigation */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {((pagination.currentPage - 1) * pagination.pageSize) + 1} -{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} de{' '}
                {pagination.totalItems}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                {/* Page numbers */}
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum: number;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => pagination.onPageChange(pageNum)}
                      className={`px-3 py-1 rounded text-sm ${
                        pagination.currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
