import React, { useState, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FileUploadProps {
  onFilesUpload: (files: File[]) => void;
}

export const FileUpload = ({ onFilesUpload }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesUpload(files.slice(0, 2)); // Limit to 2 files as requested
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) {
      onFilesUpload(files.slice(0, 2));
    }
  }, [onFilesUpload]);

  return (
    <div className="w-full max-w-3xl mx-auto text-center">
      <label
        htmlFor="file-upload"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300",
          isDragging 
            ? 'border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-gray-700' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700'
        )}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Haz clic para subir</span> o arrastra y suelta
          </p>
          <p className="text-xs text-gray-500">Puedes subir hasta 2 archivos (XLSX, XLS o CSV)</p>
        </div>
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".xlsx, .xls, .csv"
        />
      </label>
    </div>
  );
};
