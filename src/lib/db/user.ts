import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export async function createUserSafe(initialData: Prisma.UserCreateInput) {
  let data: Record<string, any> = { ...initialData } as Record<string, any>

  while (true) {
    try {
      return await prisma.user.create({ data: data as Prisma.UserCreateInput })
    } catch (err: any) {
      const code = err?.code

      if (code === 'P2022') {
        // Try to determine which field(s) caused the P2022 and remove them from `data`.
        let removed = false

        // 1) Prefer explicit meta.column when provided (may be 'users.fullName' or 'fullName')
        const metaColumn = String(err?.meta?.column || '')
        if (metaColumn) {
          const missingField = metaColumn.replace(/^users\./, '')
          if (missingField in data) {
            delete data[missingField]
            removed = true
          }
        }

        // 2) Otherwise, inspect the error message for any keys that match properties on `data`.
        if (!removed) {
          const msg = String(err?.message || '').toLowerCase()
          for (const key of Object.keys(data)) {
            if (!key) continue
            const lower = String(key).toLowerCase()
            if (msg.includes(lower)) {
              delete data[key]
              removed = true
              break
            }
          }
        }

        // 3) Fallback: remove common optional user fields if present.
        if (!removed) {
          const common = ['fullName', 'contractNumber', 'telegramUsername', 'bkashNumber', 'source', 'status']
          for (const k of common) {
            if (k in data) {
              delete data[k]
              removed = true
              break
            }
          }
        }

        if (removed) {
          // Retry the create with the offending field removed.
          continue
        }
      }

      throw err
    }
  }
}
