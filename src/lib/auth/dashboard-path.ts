import type { UserRole } from '@/types'

export function getDashboardPath(role: UserRole | string | null | undefined): string {
  if (role === 'OWNER') return '/owner/dashboard'
  if (role === 'MANAGER') return '/publisher/dashboard'
  return '/admin/dashboard'
}

export function getDashboardBasePath(role: UserRole | string | null | undefined): string {
  if (role === 'OWNER') return '/owner'
  if (role === 'MANAGER') return '/publisher'
  return '/admin'
}
