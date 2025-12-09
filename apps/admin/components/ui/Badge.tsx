'use client';

// ============================================
// BADGE COMPONENT
// ============================================

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
};

const dotClasses = {
  default: 'bg-gray-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${variantClasses[variant]}
        ${sizeClasses[size]}
      `}
    >
      {dot && (
        <span
          className={`mr-1.5 h-2 w-2 rounded-full ${dotClasses[variant]}`}
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1 -mr-1 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-black/10"
        >
          <span className="sr-only">Remover</span>
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// ============================================
// STATUS BADGE (Pre-configured for common statuses)
// ============================================

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'refunded' | 'transferred';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';
export type UserStatus = 'active' | 'suspended' | 'pending';

const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string }> = {
  // Event statuses
  draft: { variant: 'default', label: 'Rascunho' },
  published: { variant: 'success', label: 'Publicado' },
  ongoing: { variant: 'info', label: 'A decorrer' },
  completed: { variant: 'purple', label: 'Concluído' },
  cancelled: { variant: 'danger', label: 'Cancelado' },

  // Ticket statuses
  valid: { variant: 'success', label: 'Válido' },
  used: { variant: 'purple', label: 'Utilizado' },
  refunded: { variant: 'warning', label: 'Reembolsado' },
  transferred: { variant: 'info', label: 'Transferido' },

  // Payout statuses
  pending: { variant: 'warning', label: 'Pendente' },
  processing: { variant: 'info', label: 'A processar' },
  failed: { variant: 'danger', label: 'Falhou' },

  // Order statuses
  paid: { variant: 'success', label: 'Pago' },

  // User statuses
  active: { variant: 'success', label: 'Ativo' },
  suspended: { variant: 'danger', label: 'Suspenso' },
};

export interface StatusBadgeProps {
  status: string;
  size?: BadgeProps['size'];
  dot?: boolean;
}

export function StatusBadge({ status, size = 'md', dot = true }: StatusBadgeProps) {
  const config = statusConfig[status] || { variant: 'default' as const, label: status };

  return (
    <Badge variant={config.variant} size={size} dot={dot}>
      {config.label}
    </Badge>
  );
}

// ============================================
// ROLE BADGE
// ============================================

export type UserRole = 'super_admin' | 'org_admin' | 'promoter' | 'staff' | 'user';

const roleConfig: Record<UserRole, { variant: BadgeProps['variant']; label: string }> = {
  super_admin: { variant: 'purple', label: 'Super Admin' },
  org_admin: { variant: 'info', label: 'Admin' },
  promoter: { variant: 'success', label: 'Promotor' },
  staff: { variant: 'warning', label: 'Staff' },
  user: { variant: 'default', label: 'Utilizador' },
};

export interface RoleBadgeProps {
  role: UserRole;
  size?: BadgeProps['size'];
}

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const config = roleConfig[role] || { variant: 'default' as const, label: role };

  return (
    <Badge variant={config.variant} size={size}>
      {config.label}
    </Badge>
  );
}
