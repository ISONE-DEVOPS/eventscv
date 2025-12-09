'use client';

import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

// ============================================
// INPUT COMPONENT
// ============================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">{leftIcon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-lg border shadow-sm
              focus:ring-2 focus:ring-purple-500 focus:border-purple-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : 'pl-4'}
              ${rightIcon || error ? 'pr-10' : 'pr-4'}
              ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
              py-2 text-sm
              ${className}
            `}
            {...props}
          />
          {(rightIcon || error) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {error ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              ) : (
                <span className="text-gray-400">{rightIcon}</span>
              )}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================
// TEXTAREA COMPONENT
// ============================================

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            block w-full rounded-lg border shadow-sm
            focus:ring-2 focus:ring-purple-500 focus:border-purple-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            px-4 py-2 text-sm
            ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          rows={4}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ============================================
// SELECT COMPONENT
// ============================================

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`
            block w-full rounded-lg border shadow-sm
            focus:ring-2 focus:ring-purple-500 focus:border-purple-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            px-4 py-2 text-sm
            ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

// ============================================
// CHECKBOX COMPONENT
// ============================================

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', ...props }, ref) => {
    return (
      <div className="relative flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              h-4 w-4 rounded border-gray-300 text-purple-600
              focus:ring-purple-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? 'border-red-300' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700">{label}</label>
          {description && <p className="text-gray-500">{description}</p>}
          {error && <p className="text-red-600">{error}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============================================
// RADIO GROUP COMPONENT
// ============================================

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  orientation = 'vertical',
}: RadioGroupProps) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}
      <div className={`space-${orientation === 'vertical' ? 'y' : 'x'}-4 ${orientation === 'horizontal' ? 'flex' : ''}`}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange?.(option.value)}
                disabled={option.disabled}
                className="h-4 w-4 border-gray-300 text-purple-600 focus:ring-purple-500 disabled:opacity-50"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">{option.label}</label>
              {option.description && (
                <p className="text-gray-500">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// ============================================
// SWITCH/TOGGLE COMPONENT
// ============================================

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: SwitchProps) {
  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div className="flex-1">
          {label && <p className="text-sm font-medium text-gray-700">{label}</p>}
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
          ${checked ? 'bg-purple-600' : 'bg-gray-200'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

// ============================================
// FILE UPLOAD COMPONENT
// ============================================

export interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onChange: (files: File[]) => void;
  error?: string;
  helperText?: string;
  preview?: string;
}

export function FileUpload({
  label,
  accept,
  multiple = false,
  maxSize,
  onChange,
  error,
  helperText,
  preview,
}: FileUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (maxSize) {
      const validFiles = files.filter((file) => file.size <= maxSize);
      if (validFiles.length !== files.length) {
        console.warn('Some files exceed the maximum size limit');
      }
      onChange(validFiles);
    } else {
      onChange(files);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center
          hover:border-purple-400 transition-colors cursor-pointer
          ${error ? 'border-red-300' : 'border-gray-300'}
        `}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded" />
            <p className="mt-2 text-sm text-gray-500">Clique para alterar</p>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-purple-600 hover:text-purple-500">
                Clique para enviar
              </span>{' '}
              ou arraste e solte
            </p>
            {helperText && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
          </>
        )}
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

// ============================================
// FORM SECTION COMPONENT
// ============================================

export interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="border-b border-gray-200 pb-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

// ============================================
// DATE/TIME PICKER COMPONENT
// ============================================

export interface DateTimePickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  type?: 'date' | 'time' | 'datetime-local';
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  type = 'datetime-local',
  min,
  max,
  error,
  required,
}: DateTimePickerProps) {
  return (
    <Input
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      error={error}
      required={required}
    />
  );
}

// ============================================
// CURRENCY INPUT COMPONENT
// ============================================

export interface CurrencyInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  error?: string;
  required?: boolean;
}

export function CurrencyInput({
  label,
  value,
  onChange,
  currency = 'CVE',
  error,
  required,
}: CurrencyInputProps) {
  return (
    <Input
      label={label}
      type="number"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      min={0}
      step={1}
      rightIcon={<span className="text-gray-500 text-sm">{currency}</span>}
      error={error}
      required={required}
    />
  );
}
