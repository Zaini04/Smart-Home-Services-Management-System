const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const NORMALIZED_BASE_URL = BASE_URL.replace(/\/+$/, "");

/**
 * Formats a file path to be a full URL pointing to the backend.
 * Handles both Windows and Unix style paths and ensures leading slashes.
 */
export const formatImagePath = (path) => {
  if (!path) return null;
  
  // If it's already a full URL, return it
  if (path.startsWith('http')) return path;

  let formattedPath = path.replace(/\\/g, '/');
  if (!formattedPath.startsWith('/')) {
    formattedPath = '/' + formattedPath;
  }
  return `${NORMALIZED_BASE_URL}${formattedPath}`;
};
