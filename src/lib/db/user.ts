import { prisma } from './prisma'
import { Prisma } from '@prisma/client'

export async function createUserSafe(initialData: Prisma.UserCreateInput) {
  let data: Record<string, any> = { ...initialData } as Record<string, any>

  while (true) {
    try {
      return await prisma.user.create({ data: data as Prisma.UserCreateInput })
    } catch (err: any) {
      const code = err?.code
      const metaColumn = String(err?.meta?.column || '')

      if (code === 'P2022') {
        // meta.column may be 'users.fullName' or 'fullName'
        let missingField = ''
        if (metaColumn) {
          missingField = metaColumn.replace(/^users\./, '')
        } else {
          const msg = String(err?.message || '')
          const m = msg.match(/users?\.?(\w+)/i) || msg.match(/column\s+'?(\w+)'?/i)
          if (m) missingField = m[1]
        }

        if (missingField && missingField in data) {
          delete data[missingField]
          // retry with the missing field removed
          continue
        }
      }

      throw err
    }
  }
}
