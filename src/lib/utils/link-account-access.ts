import { isManager, isOwner } from '@/lib/auth'
import type { Prisma } from '@prisma/client'
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
): Prisma.LinkAccountWhereInput {
  if (isOwner(user)) {
    return {
      OR: [
        { userId: ownerUserId || user.id },
        { user: { role: 'MANAGER' } },
      ],
    }
  }

  if (isManager(user) && ownerUserId) {
    return { userId: { in: [user.id, ownerUserId] } }
  }

  return { userId: getLinkAccountUserId(user, ownerUserId) }
}
