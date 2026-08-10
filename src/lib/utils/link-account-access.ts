import { isManager, isOwner } from '@/lib/auth'
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

  if (isManager(user) && ownerUserId) {
    return ownerUserId
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

  if (isManager(user) && ownerUserId) {
    return { userId: { in: [user.id, ownerUserId] } }
  }

  return { userId: getLinkAccountUserId(user, ownerUserId) }
}
