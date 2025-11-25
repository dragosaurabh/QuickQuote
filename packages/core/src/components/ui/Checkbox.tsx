'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className="flex items-center gap-3 cursor-pointer min-h-[44px]"
        >
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={`peer w-5 h-5 bg-surface border border-primary/30 rounded appearance-none cursor-pointer transition-all duration-200 checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
              aria-invalid={!!error}
              {...props}
            />
            <svg
              className="absolute top-0.5 left-0.5 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          {label && (
            <span className="text-sm text-text-primary select-none">
              {label}
            </span>
          )}
        </label>
        {error && (
          <span className="text-sm text-red-500 ml-8" role="alert">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
