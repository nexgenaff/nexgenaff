import { isOwner } from '@/lib/auth'
import type { UserRole } from '@/types'

export type LinkAccountVisibilityUser = {
  id: string
  role?: UserRole
  username?: string
}

export function getLinkAccountUserId(
  user: LinkAccountVisibilityUser,
  ownerUserId: string | null | undefined
) {
  if (isOwner(user)) {
    return ownerUserId || user.id
  }

  return user.id
}

export function getLinkAccountVisibilityWhereClause(
  user: LinkAccountVisibilityUser,
  ownerUserId: string | null | undefined
) {
  if (isOwner(user)) {
    return {}
  }

  return { userId: getLinkAccountUserId(user, ownerUserId) }
}
