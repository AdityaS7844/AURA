/**
 * Utility functions for resolving image URLs across frontend and backend environments.
 */

export function getImageUrl(pathOrUrl) {
  if (!pathOrUrl) return null;

  // If already absolute URL or blob/data URI, return directly
  if (
    pathOrUrl.startsWith('http://') ||
    pathOrUrl.startsWith('https://') ||
    pathOrUrl.startsWith('blob:') ||
    pathOrUrl.startsWith('data:')
  ) {
    return pathOrUrl;
  }

  // Prepend backend base origin if defined in environment
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase) {
    try {
      const parsed = new URL(apiBase, window.location.origin);
      const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
      return `${parsed.origin}${cleanPath}`;
    } catch {
      // Fall through if URL parsing fails
    }
  }

  return pathOrUrl;
}
