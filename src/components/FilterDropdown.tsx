import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Check } from 'lucide-react';

interface FilterDropdownProps {
  options: { id: number; name: string }[];
  selectedIds: Set<number>;
  onSelectionChange: (selectedIds: Set<number>) => void;
  label: string;
}

export default function FilterDropdown({ options, selectedIds, onSelectionChange, label }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<Set<number>>(new Set(selectedIds));
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempSelected(new Set(selectedIds));
  }, [selectedIds, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = (id: number) => {
    const next = new Set(tempSelected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setTempSelected(next);
  };

  const handleSelectAll = () => {
    if (tempSelected.size === filteredOptions.length && filteredOptions.length > 0) {
      setTempSelected(new Set());
    } else {
      const next = new Set(tempSelected);
      filteredOptions.forEach(opt => next.add(opt.id));
      setTempSelected(next);
    }
  };

  const handleApply = () => {
    onSelectionChange(tempSelected);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelected(new Set(selectedIds));
    setIsOpen(false);
  };

  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every(opt => tempSelected.has(opt.id));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors text-sm text-slate-700 dark:text-slate-200"
      >
        <Filter size={16} />
        <span>{label}</span>
        {selectedIds.size > 0 && (
          <span className="bg-amber-100 text-amber-800 text-xs px-1.5 py-0.5 rounded-full font-medium">
            {selectedIds.size}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 flex flex-col max-h-[400px]">
          <div className="p-2 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-slate-700 dark:text-white"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <label className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">(Seleccionar todo)</span>
            </label>
            
            {filteredOptions.map(option => (
              <label key={option.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSelected.has(option.id)}
                  onChange={() => handleToggle(option.id)}
                  className="rounded border-slate-300 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">{option.name}</span>
              </label>
            ))}
            
            {filteredOptions.length === 0 && (
              <div className="text-center py-4 text-sm text-slate-500 dark:text-slate-400">
                No se encontraron resultados
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded border border-slate-300 dark:border-slate-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1.5 text-sm bg-amber-500 text-white hover:bg-amber-600 rounded font-medium"
            >
              ACEPTAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
