const requireEnv = (name: string, isDev = false): string => {
  const value = process.env[name]?.trim()
  if (!value) {
    if (isDev && process.env.NODE_ENV === 'development') {
      console.warn(`Warning: ${name} environment variable is not set`)
      return ''
    }
    throw new Error(`${name} environment variable is required for security`)
  }
  return value
}

export const ADMIN_USERNAME = requireEnv('ADMIN_USERNAME')
export const ADMIN_PASSWORD = requireEnv('ADMIN_PASSWORD')
export const OWNER_USERNAME = requireEnv('OWNER_USERNAME')
export const OWNER_PASSWORD = requireEnv('OWNER_PASSWORD')
