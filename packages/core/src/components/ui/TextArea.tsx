'use client';

import React, { forwardRef, TextareaHTMLAttributes } from 'react';

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, hint, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseStyles =
      'w-full px-4 py-2 bg-surface border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 resize-y min-h-[100px]';

    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
      : 'border-primary/30 focus:ring-primary/50 focus:border-primary';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={`${baseStyles} ${stateStyles} ${className}`}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
          }
          {...props}
        />
        {error && (
          <span id={`${textareaId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${textareaId}-hint`} className="text-sm text-text-muted">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
