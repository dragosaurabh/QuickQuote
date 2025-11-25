'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseStyles =
      'w-full px-4 py-2 bg-surface border rounded-lg text-text-primary placeholder:text-text-muted transition-all duration-200 focus:outline-none focus:ring-2 min-h-[44px]';

    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
      : 'border-primary/30 focus:ring-primary/50 focus:border-primary';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`${baseStyles} ${stateStyles} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="text-sm text-text-muted">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
