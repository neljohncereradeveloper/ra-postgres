/**
 * Utility for making calls to the internal Next.js API routes
 */

/**
 * Makes a fetch request to an internal Next.js API route
 * @param path The API route path (without the /api prefix)
 * @param options Fetch options
 * @returns The parsed JSON response
 */
export async function fetchInternal<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${path}`;
  
  // Request details: method and body
  
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      // Add credentials to ensure cookies are sent
      credentials: 'same-origin',
    });
    
    // Response status received
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Important: API error with status code
      throw new Error(errorData.error || errorData.message || `API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    // Important: Request to internal API failed
    throw error;
  }
} 