'use client';

import React, { forwardRef, SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, className = '', id, ...props },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    const baseStyles =
      'w-full px-4 py-2 bg-surface border rounded-lg text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 min-h-[44px] appearance-none cursor-pointer';

    const stateStyles = error
      ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
      : 'border-primary/30 focus:ring-primary/50 focus:border-primary';

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`${baseStyles} ${stateStyles} ${className}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <span id={`${selectId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${selectId}-hint`} className="text-sm text-text-muted">
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
