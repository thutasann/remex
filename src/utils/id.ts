/**
 * Generate a unique ID
 * @returns A unique string identifier
 */
export function generateUniqueId(): string {
  return (
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36)
  )
}
