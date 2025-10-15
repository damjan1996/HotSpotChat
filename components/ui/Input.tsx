'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text',
    label,
    error,
    leftIcon,
    rightIcon,
    variant = 'default',
    ...props 
  }, ref) => {
    const baseInputClasses = 'w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      default: 'bg-white border-secondary-200 focus:border-primary-500 focus:ring-primary-500/20',
      filled: 'bg-secondary-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-primary-500/20',
    };
    
    const errorClasses = error 
      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
      : '';
    
    const inputWithIconClasses = clsx(
      leftIcon && 'pl-12',
      rightIcon && 'pr-12'
    );
    
    return (
      <div className="relative">
        {label && (
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-secondary-400">{leftIcon}</span>
            </div>
          )}
          <input
            type={type}
            className={clsx(
              baseInputClasses,
              variants[variant],
              errorClasses,
              inputWithIconClasses,
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
              <span className="text-secondary-400">{rightIcon}</span>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };