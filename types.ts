export interface RowData {
  rowData: any[];
  originalIndex: number;
}

export interface SummaryMetrics {
  total: number;
  onTime: number;
  offTime: number;
  etaLessThan5: number;
  withTurno: number;
  pending: number;
}

export interface FileData {
  headers: string[];
  data: any[][];
  fileName: string;
}
