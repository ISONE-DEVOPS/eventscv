'use client';

// ============================================
// CARD COMPONENT
// ============================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-lg
        ${paddingClasses[padding]}
        ${shadowClasses[shadow]}
        ${border ? 'border border-gray-200' : ''}
        ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ============================================
// CARD HEADER
// ============================================

export interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ============================================
// STAT CARD
// ============================================

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label?: string;
  };
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend,
  loading = false,
}: StatCardProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };

  if (loading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <div className="flex items-center mt-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  trendColors[trend || (change.value >= 0 ? 'up' : 'down')]
                }`}
              >
                {change.value >= 0 ? (
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {Math.abs(change.value)}%
              </span>
              {change.label && (
                <span className="ml-2 text-xs text-gray-500">{change.label}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-purple-100 rounded-lg">
            <span className="text-purple-600">{icon}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// LIST CARD
// ============================================

export interface ListCardItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  icon?: React.ReactNode;
  status?: React.ReactNode;
}

export interface ListCardProps {
  title: string;
  items: ListCardItem[];
  emptyMessage?: string;
  action?: React.ReactNode;
  onItemClick?: (id: string) => void;
  loading?: boolean;
}

export function ListCard({
  title,
  items,
  emptyMessage = 'Nenhum item',
  action,
  onItemClick,
  loading = false,
}: ListCardProps) {
  return (
    <Card padding="none">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="divide-y divide-gray-200">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full" />
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">{emptyMessage}</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`px-6 py-4 ${
                onItemClick ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => onItemClick?.(item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.icon && (
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {item.icon}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-sm text-gray-500">{item.subtitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.value && (
                    <span className="text-sm font-medium text-gray-900">
                      {item.value}
                    </span>
                  )}
                  {item.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
