/**
 * Badge Component
 * Small status indicators and labels
 */

import React from 'react'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary'

export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    secondary: 'bg-secondary-100 text-secondary-800',
  }

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const dotColorStyles: Record<BadgeVariant, string> = {
    default: 'bg-gray-500',
    primary: 'bg-primary-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    secondary: 'bg-secondary-500',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorStyles[variant]}`}></span>}
      {children}
    </span>
  )
}

// Status Badge Helper
export interface StatusBadgeProps {
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'PENDING' | 'ACTIVE' | 'INACTIVE'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    TODO: { variant: 'default', label: 'To Do' },
    IN_PROGRESS: { variant: 'info', label: 'In Progress' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    CANCELLED: { variant: 'danger', label: 'Cancelled' },
    PENDING: { variant: 'warning', label: 'Pending' },
    ACTIVE: { variant: 'success', label: 'Active' },
    INACTIVE: { variant: 'default', label: 'Inactive' },
  }

  const config = statusConfig[status] || { variant: 'default', label: status }

  return (
    <Badge variant={config.variant} dot className={className}>
      {config.label}
    </Badge>
  )
}
