import { RowData } from '../types';

interface DataGridProps {
  headers: string[];
  data: RowData[];
  selectedRows: Set<number>;
  onRowSelection: (originalIndex: number) => void;
  onSelectAll: () => void;
  isAllSelected: boolean;
}

export const DataGrid = ({ headers, data, selectedRows, onRowSelection, onSelectAll, isAllSelected }: DataGridProps) => {
  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm" style={{ maxHeight: '60vh' }}>
      <table className="w-full text-xs text-left text-gray-700 dark:text-gray-300">
        <thead className="text-xs text-gray-600 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
          <tr>
            <th scope="col" className="px-4 py-3">
              <input 
                type="checkbox"
                className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                checked={isAllSelected}
                onChange={onSelectAll}
                aria-label="Seleccionar todas las filas"
              />
            </th>
            {headers.map((header, index) => (
              <th key={index} scope="col" className="px-4 py-3 whitespace-nowrap font-semibold align-top">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(({ rowData, originalIndex }) => (
            <tr key={originalIndex} className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
              <td className="px-4 py-3">
                <input 
                  type="checkbox"
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 dark:focus:ring-emerald-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={selectedRows.has(originalIndex)}
                  onChange={() => onRowSelection(originalIndex)}
                  aria-label={`Seleccionar fila ${originalIndex + 1}`}
                />
              </td>
              {rowData.map((cell, cellIndex) => {
                const header = headers[cellIndex];
                let cellClassName = "px-4 py-3 whitespace-nowrap";

                if (header === 'dias ETA') {
                  const cellValue = cell !== null ? Number(cell) : NaN;
                  if (!isNaN(cellValue) && cellValue <= 4) {
                    cellClassName += " text-red-500 font-semibold";
                  }
                }
                
                return (
                  <td key={cellIndex} className={cellClassName}>
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={headers.length + 1} className="text-center py-8 text-gray-400 dark:text-gray-500">
                No se encontraron filas que coincidan con los filtros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
