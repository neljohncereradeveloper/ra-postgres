import { fetchApi } from "@/lib/api/client";
import { DelegatesResponse, Delegate } from "@/types/delegates.types";

export const delegatesApi = {
  /**
   * Get a list of delegates with optional filtering
   */
  getDelegates: async (params?: {
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<DelegatesResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.term) searchParams.set("term", params.term);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/delegates?${queryString}`
      : "/api/delegates";

    return fetchApi<DelegatesResponse>(endpoint);
  },

  /**
   * Get a delegate with control number
   */
  getDelegateWithControlNumber: async (id: number): Promise<Delegate> => {
    return fetchApi<Delegate>(`/api/delegates/control-number/${id}`);
  },
};
