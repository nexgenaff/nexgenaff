export const corsConfig = {
  allowedOrigins: [
    'http://localhost:3000',
    'https://*.vercel.app',
    'https://*.yourdomain.com',
    '*',
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-CSRF-Token',
    'X-Api-Version',
    'Referer',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Total-Pages'],
  credentials: true,
  maxAge: 86400,
}

export function getCorsHeaders(origin?: string | null): Record<string, string> {
  const isAllowed = corsConfig.allowedOrigins.includes('*') ||
    (origin && corsConfig.allowedOrigins.includes(origin)) ||
    (origin && corsConfig.allowedOrigins.some(o => o.includes('*') && origin.includes(o.replace('*', ''))))

  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Credentials': String(corsConfig.credentials),
    'Access-Control-Allow-Methods': corsConfig.allowedMethods.join(', '),
    'Access-Control-Allow-Headers': corsConfig.allowedHeaders.join(', '),
    'Access-Control-Expose-Headers': corsConfig.exposedHeaders.join(', '),
    'Access-Control-Max-Age': String(corsConfig.maxAge),
  }
}