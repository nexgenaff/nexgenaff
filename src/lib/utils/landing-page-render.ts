/**
 * Landing Page Rendering Utilities
 * Handles variable replacement in HTML templates
 */

interface RenderVariables {
  headline?: string
  description?: string
  imageUrl?: string
  buttonText?: string
  linkUrl?: string
}

/**
 * Renders landing page HTML by replacing variables with provided values
 * @param htmlContent - Raw HTML template with variables like {headline}, {link.url}
 * @param variables - Object containing values to replace variables with
 * @returns Rendered HTML with all variables replaced
 */
export function renderLandingPageHtml(htmlContent: string, variables: RenderVariables): string {
  let rendered = htmlContent

  // Replace {headline} - always replace to ensure variables are cleared
  rendered = rendered.replace(/{headline}/g, variables.headline || '')

  // Replace {description}
  rendered = rendered.replace(/{description}/g, variables.description || '')

  // Replace {imageUrl}
  rendered = rendered.replace(/{imageUrl}/g, variables.imageUrl || '')

  // Replace {buttonText}
  rendered = rendered.replace(/{buttonText}/g, variables.buttonText || '')

  // Replace {link.url} with tracking link
  rendered = rendered.replace(/{link\.url}/g, variables.linkUrl || '')

  return rendered
}

/**
 * Extracts all variable placeholders from HTML content
 * Useful for validation or showing what variables are needed
 */
export function extractVariablesFromHtml(htmlContent: string): string[] {
  const matches = htmlContent.match(/{[a-zA-Z.]+}/g) || []
  return [...new Set(matches)] // Remove duplicates
}

/**
 * Validates if required variables are present in the HTML
 */
export function validateHtmlVariables(htmlContent: string, requiredVars: string[] = []): { isValid: boolean; missing: string[] } {
  const foundVars = extractVariablesFromHtml(htmlContent)
  const missing = requiredVars.filter((req) => !foundVars.includes(`{${req}}`))
  return { isValid: missing.length === 0, missing }
}
