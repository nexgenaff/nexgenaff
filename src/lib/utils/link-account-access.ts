import { isAdmin, isOwner } from '@/lib/auth'
import type { UserRole } from '@/types'

export type LinkAccountVisibilityUser = {
  id: string
  role?: UserRole
  username?: string
}

export function getLinkAccountVisibilityWhereClause(
  user: LinkAccountVisibilityUser,
  ownerUserId: string | null | undefined
) {
  if (isOwner(user)) {
    return {}
  }

  if (isAdmin(user)) {
    return { userId: user.id }
  }

  return { userId: ownerUserId || user.id }
}
