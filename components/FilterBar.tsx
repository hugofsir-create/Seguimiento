interface FilterBarProps {
  filters: Record<string, string>;
  onFilterChange: (header: string, value: string) => void;
  filterOptions: Record<string, string[]>;
}

export const FilterBar = ({ filters, onFilterChange, filterOptions }: FilterBarProps) => {
  const filterableColumns = ['DescCliente', 'EstadoTracking', 'OnTime', 'EstadoTMS'];
  const hasFilterOptions = filterableColumns.some(col => filterOptions[col]?.length > 0);

  if (!hasFilterOptions) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {filterableColumns.map((header) => {
          const options = filterOptions[header];
          if (!options || options.length === 0) {
            return null;
          }
          return (
            <div key={header}>
              <label htmlFor={`filter-${header}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {header}
              </label>
              <select
                id={`filter-${header}`}
                value={filters[header] || 'Todos'}
                onChange={(e) => onFilterChange(header, e.target.value)}
                className="w-full p-2 text-sm text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-500 rounded-md bg-gray-50 dark:bg-gray-600 focus:ring-emerald-500 focus:border-emerald-500"
                aria-label={`Filtrar por ${header}`}
              >
                <option value="Todos">Todos</option>
                {options.map((option, optionIndex) => (
                  <option key={optionIndex} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
};
