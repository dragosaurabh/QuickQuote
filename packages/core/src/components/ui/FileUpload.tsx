'use client';

import React, { useRef, useState, useCallback } from 'react';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  maxSize?: number; // in bytes
  error?: string;
  hint?: string;
  onFileSelect: (file: File) => void;
  preview?: string | null;
  disabled?: boolean;
}

/**
 * File upload component with drag-and-drop support
 * Validates: Requirements 2.3 (logo upload with file validation)
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = 'image/png,image/jpeg,image/jpg',
  maxSize = 2 * 1024 * 1024, // 2MB default
  error,
  hint,
  onFileSelect,
  preview,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    const acceptedTypes = accept.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload PNG or JPG.';
    }
    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return `File too large. Maximum size is ${maxMB}MB.`;
    }
    return null;
  }, [accept, maxSize]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const displayError = error || localError;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-[150px] p-4
          border-2 border-dashed rounded-lg
          transition-all duration-200 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/10' 
            : displayError 
              ? 'border-red-500 bg-red-500/5' 
              : 'border-primary/30 hover:border-primary/50 hover:bg-surface'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />
        
        {preview ? (
          <div className="flex flex-col items-center gap-2">
            <img
              src={preview}
              alt="Preview"
              className="max-h-24 max-w-full object-contain rounded"
            />
            <span className="text-sm text-text-muted">
              Click or drag to replace
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-3xl">📁</div>
            <span className="text-sm text-text-primary font-medium">
              Click to upload or drag and drop
            </span>
            <span className="text-xs text-text-muted">
              PNG or JPG (max {Math.round(maxSize / (1024 * 1024))}MB)
            </span>
          </div>
        )}
      </div>

      {displayError && (
        <span className="text-sm text-red-500" role="alert">
          {displayError}
        </span>
      )}
      {hint && !displayError && (
        <span className="text-sm text-text-muted">
          {hint}
        </span>
      )}
    </div>
  );
};
