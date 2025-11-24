import { API_BASE_URL } from "../constants/api.constants";

/**
 * Makes a fetch request to either internal Next.js API or external API server
 * @param endpoint The API endpoint path
 * @param options Fetch options
 * @returns The parsed JSON response
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Determine if this is an internal or external API call
  const isInternalApi = endpoint.startsWith("/api/");
  const url = isInternalApi ? endpoint : `${API_BASE_URL}${endpoint}`;

  const headers = new Headers(options.headers);
  // Only set Content-Type to application/json if not uploading FormData
  const isFormData = options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  // Add authentication for external API requests
  if (!isInternalApi) {
    // Add auth token here if needed for external API
    // Example: headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || errorData.error || `API error: ${response.status}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}
