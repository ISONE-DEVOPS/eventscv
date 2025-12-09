'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';

// ============================================
// TYPES
// ============================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ============================================
// VARIANT CLASSES
// ============================================

const variantClasses = {
  primary: 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 border-transparent',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border-transparent',
  outline: 'bg-white text-gray-700 hover:bg-gray-50 focus:ring-purple-500 border-gray-300',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500 border-transparent',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 border-transparent',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

// ============================================
// COMPONENT
// ============================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          inline-flex items-center justify-center font-medium rounded-lg border
          focus:outline-none focus:ring-2 focus:ring-offset-2
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            A processar...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// ============================================
// ICON BUTTON
// ============================================

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon: React.ReactNode;
  'aria-label': string;
}

const iconSizeClasses = {
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-3',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', icon, disabled, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center rounded-lg border
          focus:outline-none focus:ring-2 focus:ring-offset-2
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${iconSizeClasses[size]}
          ${className}
        `}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

// ============================================
// BUTTON GROUP
// ============================================

export interface ButtonGroupProps {
  children: React.ReactNode;
  attached?: boolean;
}

export function ButtonGroup({ children, attached = false }: ButtonGroupProps) {
  return (
    <div className={`flex ${attached ? '' : 'gap-2'}`}>
      {attached ? (
        <div className="inline-flex rounded-lg shadow-sm">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default Button;
