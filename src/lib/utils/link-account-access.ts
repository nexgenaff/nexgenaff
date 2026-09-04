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

  return user.id
}

export function getLinkAccountVisibilityWhereClause(
  user: LinkAccountVisibilityUser,
  ownerUserId: string | null | undefined
): Prisma.LinkAccountWhereInput {
  if (isOwner(user)) {
    return {
      OR: [
        ...[user.id, ownerUserId]
          .filter((userId, index, userIds): userId is string => Boolean(userId) && userIds.indexOf(userId) === index)
          .map((userId) => ({ userId })),
        { user: { role: 'MANAGER' } },
      ],
    }
  }

  if (isManager(user)) {
    return { userId: user.id }
  }

  return { userId: getLinkAccountUserId(user, ownerUserId) }
}
