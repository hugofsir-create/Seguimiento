import React, { useState, useCallback, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Sun, 
  Moon, 
  FileText, 
  Download, 
  Upload, 
  LayoutList, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  Box 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SummaryCard } from './components/SummaryCard';
import { FilterBar } from './components/FilterBar';
import { DataGrid } from './components/DataGrid';
import { FileUpload } from './components/FileUpload';
import { RowData, SummaryMetrics, FileData } from './types';

const SplashScreen = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8 } }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 dark:bg-gray-900"
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
                duration: 1.5,
                ease: "easeOut"
            }}
            className="text-center"
        >
            <h1 className="text-6xl font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
                Calico S.A.
            </h1>
            <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                className="h-1 bg-emerald-600 dark:bg-emerald-400 mt-4 mx-auto"
            />
        </motion.div>
    </motion.div>
);

const App = () => {
    const [showSplash, setShowSplash] = useState(true);
    const [headers, setHeaders] = useState<string[]>([]);
    const [data, setData] = useState<any[][]>([]);
    const [filteredData, setFilteredData] = useState<RowData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [filterOptions, setFilterOptions] = useState<Record<string, string[]>>({});
    const [etaFilterActive, setEtaFilterActive] = useState(false);
    const [fechaturnoFilterActive, setFechaturnoFilterActive] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const storedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
        if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme as 'light' | 'dark';
        }
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    useEffect(() => {
        if (data.length === 0) {
            setFilteredData([]);
            return;
        }

        let tempData = data.map((rowData, originalIndex) => ({ rowData, originalIndex }));
        const activeFilters = Object.entries(filters).filter(([, value]) => value && String(value).trim() !== '' && value !== 'Todos');

        if (activeFilters.length > 0) {
            tempData = tempData.filter(({ rowData }) => {
                return activeFilters.every(([header, value]) => {
                    const headerIndex = headers.findIndex(h => h === header);
                    if (headerIndex === -1) return true;
                    const cellValue = rowData[headerIndex];
                    return cellValue != null && String(cellValue).toLowerCase() === String(value).toLowerCase();
                });
            });
        }
        
        if (etaFilterActive) {
            const diasEtaIndex = headers.findIndex(h => h.toLowerCase() === 'dias eta');
            if (diasEtaIndex !== -1) {
                tempData = tempData.filter(({ rowData }) => {
                    const cellValue = rowData[diasEtaIndex];
                    const numericValue = cellValue !== null ? Number(cellValue) : NaN;
                    return !isNaN(numericValue) && numericValue < 5;
                });
            }
        }

        if (fechaturnoFilterActive) {
            const fechaturnoIndex = headers.findIndex(h => h.toLowerCase() === 'fechaturno');
            if (fechaturnoIndex !== -1) {
                tempData = tempData.filter(({ rowData }) => {
                    const cellValue = rowData[fechaturnoIndex];
                    return cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '';
                });
            }
        }

        setFilteredData(tempData);
    }, [data, headers, filters, etaFilterActive, fechaturnoFilterActive]);

    const summaryMetrics = useMemo<SummaryMetrics>(() => {
        const visibleData = filteredData.map(item => item.rowData);
        const onTimeIndex = headers.findIndex(h => h.toLowerCase() === 'ontime');
        const diasEtaIndex = headers.findIndex(h => h.toLowerCase() === 'dias eta');
        const fechaturnoIndex = headers.findIndex(h => h.toLowerCase() === 'fechaturno');
        const estadoTrackingIndex = headers.findIndex(h => h.toLowerCase() === 'estadotracking');
        
        let onTimeCount = 0;
        let offTimeCount = 0;
        let etaLessThan5Count = 0;
        let withTurnoCount = 0;
        let pendingCount = 0;
        
        if (onTimeIndex !== -1) {
            onTimeCount = visibleData.filter(row => String(row[onTimeIndex]).toLowerCase() === 'entiempo').length;
            offTimeCount = visibleData.filter(row => String(row[onTimeIndex]).toLowerCase() === 'fueradetiempo').length;
        }
        
        if (diasEtaIndex !== -1) {
            etaLessThan5Count = visibleData.filter(row => {
                const cellValue = row[diasEtaIndex];
                const numericValue = cellValue !== null ? Number(cellValue) : NaN;
                return !isNaN(numericValue) && numericValue < 5;
            }).length;
        }

        if (fechaturnoIndex !== -1) {
            withTurnoCount = visibleData.filter(row => {
                const cellValue = row[fechaturnoIndex];
                return cellValue !== null && cellValue !== undefined && String(cellValue).trim() !== '';
            }).length;
        }

        if (estadoTrackingIndex !== -1) {
            pendingCount = visibleData.filter(row => {
                const cellValue = row[estadoTrackingIndex];
                const status = cellValue != null ? String(cellValue).trim().toLowerCase() : '';
                return status !== 'entregado' && status !== '';
            }).length;
        }
        
        return {
            total: data.length,
            onTime: onTimeCount,
            offTime: offTimeCount,
            etaLessThan5: etaLessThan5Count,
            withTurno: withTurnoCount,
            pending: pendingCount
        };
    }, [data, filteredData, headers]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    const setupFilters = useCallback((currentHeaders: string[], currentData: any[][]) => {
        const newFilterOptions: Record<string, string[]> = {};
        const filterableColumns = ['DescCliente', 'EstadoTracking', 'OnTime', 'EstadoTMS'];

        filterableColumns.forEach(header => {
            const headerIndex = currentHeaders.findIndex(h => h === header);
            if (headerIndex !== -1) {
                const uniqueValues = Array.from(
                    new Set(
                        currentData
                            .map(row => row[headerIndex])
                            .filter(value => value !== null && value !== undefined && String(value).trim() !== '')
                            .map(String)
                    )
                ).sort();
                newFilterOptions[header] = uniqueValues;
            }
        });
        setFilterOptions(newFilterOptions);
    }, []);

    const processFile = async (file: File): Promise<FileData> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const buffer = e.target?.result;
                    if (!buffer) throw new Error("No se pudo leer el archivo.");
                    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false }) as any[][];

                    if (jsonData && jsonData.length > 0) {
                        const fileHeaders = jsonData[0].map(header => String(header ?? ''));
                        const body = jsonData.slice(1).map(row => {
                            const fullRow = Array(fileHeaders.length).fill(null);
                            row.forEach((cellValue, index) => {
                                if (index < fileHeaders.length) {
                                    if (cellValue instanceof Date) {
                                        const day = String(cellValue.getUTCDate()).padStart(2, '0');
                                        const month = String(cellValue.getUTCMonth() + 1).padStart(2, '0');
                                        const year = cellValue.getUTCFullYear();
                                        fullRow[index] = `${day}/${month}/${year}`;
                                    } else {
                                        fullRow[index] = cellValue;
                                    }
                                }
                            });
                            return fullRow;
                        });
                        resolve({ headers: fileHeaders, data: body, fileName: file.name });
                    } else {
                        reject(new Error(`El archivo ${file.name} está vacío.`));
                    }
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error("Error de lectura."));
            reader.readAsArrayBuffer(file);
        });
    };

    const handleFilesUpload = useCallback(async (files: File[]) => {
        setError(null);
        setFilters({});
        setSelectedRows(new Set());
        
        try {
            const results = await Promise.all(files.map(file => processFile(file)));
            
            if (results.length === 0) return;

            // Merge logic: Use the headers from the first file as base.
            let mergedHeaders = [...results[0].headers];
            let mergedData: any[][] = [];

            results.forEach((result, idx) => {
              if (idx === 0) {
                mergedData = result.data;
              } else {
                // For subsequent files, map their columns to the headers of the first file
                const dataToMerge = result.data.map(row => {
                  const newRow = Array(mergedHeaders.length).fill(null);
                  result.headers.forEach((h, hIdx) => {
                    const targetIdx = mergedHeaders.indexOf(h);
                    if (targetIdx !== -1) {
                      newRow[targetIdx] = row[hIdx];
                    }
                  });
                  return newRow;
                });
                mergedData = [...mergedData, ...dataToMerge];
              }
            });

            let currentHeaders = [...mergedHeaders];
            let currentData = [...mergedData];

            // Post-processing logic (original features)
            let fechaturnoColIndex = currentHeaders.findIndex(h => h.trim().toLowerCase() === 'fechaturno');
            if (fechaturnoColIndex === -1) {
                fechaturnoColIndex = currentHeaders.findIndex(h => h.trim() === '');
            }
            if (fechaturnoColIndex !== -1) {
                currentHeaders[fechaturnoColIndex] = 'Fechaturno';
                currentData = currentData.map(row => {
                    const newRow = [...row];
                    let cellValue = newRow[fechaturnoColIndex];
                    if (cellValue && !(cellValue instanceof Date)) {
                        let date = new Date(cellValue);
                        if (isNaN(date.getTime()) && !isNaN(Number(cellValue)) && Number(cellValue) > 25569) {
                            date = new Date(Math.round((Number(cellValue) - 25569) * 86400 * 1000));
                        }
                        if (!isNaN(date.getTime())) {
                            const correctedDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
                            const day = String(correctedDate.getDate()).padStart(2, '0');
                            const month = String(correctedDate.getMonth() + 1).padStart(2, '0');
                            const year = correctedDate.getFullYear();
                            newRow[fechaturnoColIndex] = `${day}/${month}/${year}`;
                        }
                    }
                    return newRow;
                });
            }

            const dateColumnIndex = currentHeaders.findIndex(h => h.trim().toLowerCase() === 'fecharecepcion origen');
            if (dateColumnIndex !== -1) {
                currentHeaders.push('dias');
                currentData = currentData.map(row => {
                    const dateStr = row[dateColumnIndex];
                    let daysDiff = null;
                    if (typeof dateStr === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
                        const [d, m, y] = dateStr.split('/').map(Number);
                        const receptionDate = new Date(y, m - 1, d);
                        if (!isNaN(receptionDate.getTime())) {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            receptionDate.setHours(0, 0, 0, 0);
                            daysDiff = Math.floor((today.getTime() - receptionDate.getTime()) / (1000 * 60 * 60 * 24));
                        }
                    }
                    return [...row, daysDiff];
                });
            }

            const fechaCreacionIndex = currentHeaders.findIndex(h => h.trim().toLowerCase() === 'fechacreacion');
            const etaIndex = currentHeaders.findIndex(h => h.trim().toLowerCase() === 'eta');
            if (fechaCreacionIndex !== -1 && etaIndex !== -1) {
                currentHeaders.push('dias ETA');
                currentData = currentData.map(row => {
                    const fechaCreacionStr = row[fechaCreacionIndex];
                    const etaStr = row[etaIndex];
                    let daysDiffETA = null;
                    const parseDate = (ds: any) => {
                        if (typeof ds === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(ds)) {
                            const [d, m, y] = ds.split('/').map(Number);
                            const dObj = new Date(y, m - 1, d);
                            if (!isNaN(dObj.getTime())) { dObj.setHours(0, 0, 0, 0); return dObj; }
                        }
                        return null;
                    };
                    const creacionDate = parseDate(fechaCreacionStr);
                    const etaDate = parseDate(etaStr);
                    if (creacionDate && etaDate) {
                        daysDiffETA = Math.floor((etaDate.getTime() - creacionDate.getTime()) / (1000 * 60 * 60 * 24));
                    }
                    return [...row, daysDiffETA];
                });
            }

            setHeaders(currentHeaders);
            setData(currentData);
            setFileName(results.map(r => r.fileName).join(' + '));
            setupFilters(currentHeaders, currentData);
            
        } catch (err: any) {
            console.error("Error al procesar archivos:", err);
            setError(err.message || "Error al procesar archivos.");
        }
    }, [setupFilters]);

    const handleFilterChange = useCallback((header: string, value: string) => {
        setFilters(prevFilters => ({ ...prevFilters, [header]: value }));
    }, []);

    const handleSummaryFilter = (column: string, value: string) => {
        const newValue = filters[column] === value ? 'Todos' : value;
        handleFilterChange(column, newValue);
    };

    const handleEtaFilterClick = () => setEtaFilterActive(prev => !prev);
    const handleFechaturnoFilterClick = () => setFechaturnoFilterActive(prev => !prev);

    const handleClear = () => {
        setHeaders([]);
        setData([]);
        setFilteredData([]);
        setError(null);
        setFileName(null);
        setFilters({});
        setFilterOptions({});
        setEtaFilterActive(false);
        setFechaturnoFilterActive(false);
        setSelectedRows(new Set());
    };
    
    const handleRowSelection = useCallback((originalIndex: number) => {
        setSelectedRows(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(originalIndex)) newSelected.delete(originalIndex);
            else newSelected.add(originalIndex);
            return newSelected;
        });
    }, []);

    const isAllFilteredSelected = useMemo(() => {
        if (filteredData.length === 0) return false;
        return filteredData.every(item => selectedRows.has(item.originalIndex));
    }, [filteredData, selectedRows]);

    const handleSelectAll = useCallback(() => {
        setSelectedRows(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (isAllFilteredSelected) {
                filteredData.forEach(item => newSelected.delete(item.originalIndex));
            } else {
                filteredData.forEach(item => newSelected.add(item.originalIndex));
            }
            return newSelected;
        });
    }, [filteredData, isAllFilteredSelected]);
    
    const handleExport = useCallback(() => {
        if (selectedRows.size === 0) return;
        const sortedIndices = Array.from(selectedRows).sort((a, b) => a - b);
        const selectedData = sortedIndices.map(index => data[index]);
        const ws = XLSX.utils.aoa_to_sheet([headers, ...selectedData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Seleccion");
        XLSX.writeFile(wb, "seleccion_exportada.xlsx");
    }, [selectedRows, data, headers]);

    return (
        <>
            <AnimatePresence>
                {showSplash && <SplashScreen key="splash" />}
            </AnimatePresence>
            
            <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8">
            <header className="w-full max-w-7xl mx-auto mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex-1"></div>
                    <div className="text-center flex-grow">
                        <h1 className="text-4xl sm:text-5xl font-bold text-emerald-600 dark:text-emerald-400">Dashboard remitos</h1>
                        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
                            Sube hasta 2 archivos de Excel para ver y comparar sus contenidos.
                        </p>
                    </div>
                    <div className="flex-1 flex justify-end">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
                            aria-label="Cambiar tema"
                        >
                            {theme === 'light' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-7xl mx-auto flex-grow flex flex-col">
                {error && (
                    <div className="bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-100 px-4 py-3 rounded-lg relative mb-6" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {data.length === 0 && !fileName ? (
                    <FileUpload onFilesUpload={handleFilesUpload} />
                ) : (
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-wrap justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 gap-4 shadow-sm">
                            <div className="flex items-center gap-3 min-w-0">
                                <FileText className="h-6 w-6 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                <p className="font-medium text-gray-700 dark:text-gray-200 truncate" title={fileName ?? ''}>{fileName}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedRows.size > 0 && (
                                    <button
                                        onClick={handleExport}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                                    >
                                        <Download className="w-5 h-5" />
                                        <span>Exportar ({selectedRows.size})</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleClear}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                                >
                                    <Upload className="w-5 h-5" />
                                    <span>Subir Nuevos Archivos</span>
                                </button>
                            </div>
                        </div>
                        
                        { data.length > 0 ? (
                        <>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <SummaryCard title="Total de Remitos" value={summaryMetrics.total} icon={<LayoutList className="w-5 h-5" />} />
                                    <SummaryCard title="Pendientes" value={summaryMetrics.pending} icon={<Box className="w-5 h-5" />} color="amber" />
                                    <SummaryCard 
                                        title="A Tiempo" 
                                        value={summaryMetrics.onTime} 
                                        icon={<CheckCircle2 className="w-5 h-5" />}
                                        onClick={() => handleSummaryFilter('OnTime', 'EnTiempo')}
                                        isActive={filters['OnTime'] === 'EnTiempo'}
                                    />
                                    <SummaryCard 
                                        title="Fuera de Tiempo" 
                                        value={summaryMetrics.offTime} 
                                        icon={<Clock className="w-5 h-5" />}
                                        onClick={() => handleSummaryFilter('OnTime', 'FueraDeTiempo')}
                                        isActive={filters['OnTime'] === 'FueraDeTiempo'}
                                        color="red"
                                    />
                                    <SummaryCard 
                                        title="ETA < 5 días"
                                        value={summaryMetrics.etaLessThan5}
                                        icon={<AlertTriangle className="w-5 h-5" />}
                                        onClick={handleEtaFilterClick}
                                        isActive={etaFilterActive}
                                        color="red"
                                    />
                                     <SummaryCard 
                                        title="Con Turno"
                                        value={summaryMetrics.withTurno}
                                        icon={<Calendar className="w-5 h-5" />}
                                        onClick={handleFechaturnoFilterClick}
                                        isActive={fechaturnoFilterActive}
                                    />
                                </div>
                                <FilterBar filters={filters} onFilterChange={handleFilterChange} filterOptions={filterOptions} />
                                <DataGrid 
                                    headers={headers} 
                                    data={filteredData}
                                    selectedRows={selectedRows}
                                    onRowSelection={handleRowSelection}
                                    onSelectAll={handleSelectAll}
                                    isAllSelected={isAllFilteredSelected}
                                />
                            </>
                        ) : !error && (
                            <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                <p className="text-gray-500 dark:text-gray-400">La hoja de cálculo está vacía o no contiene datos.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            <footer className="w-full max-w-7xl mx-auto mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                <p>Construido con React y Tailwind CSS. Potenciado por SheetJS.</p>
            </footer>
        </div>
        </>
    );
};

export default App;
