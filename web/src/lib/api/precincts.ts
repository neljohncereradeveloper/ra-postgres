import { fetchApi } from "@/lib/api/client";
import {
  CreatePrecinctRequest,
  Precinct,
  PrecinctsResponse,
} from "@/types/precinct.types";

export const precinctsApi = {
  /**
   * Get a list of precincts with optional filtering
   */
  getPrecincts: async (params?: {
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<PrecinctsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.term) searchParams.set("term", params.term);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/precincts?${queryString}`
      : "/api/precincts";

    return fetchApi<PrecinctsResponse>(endpoint);
  },

  getComboboxPrecincts: async (): Promise<
    {
      label: string;
      value: string;
    }[]
  > => {
    const endpoint = "/api/precincts/combobox";

    return fetchApi<
      {
        label: string;
        value: string;
      }[]
    >(endpoint);
  },

  /**
   * Create a new district
   */
  createPrecinct: async (
    precinctData: CreatePrecinctRequest
  ): Promise<Precinct> => {
    return fetchApi<Precinct>("/api/precincts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(precinctData),
    });
  },

  /**
   * Update an existing precinct
   */
  updatePrecinct: async (
    id: number,
    precinctData: Partial<CreatePrecinctRequest>
  ): Promise<Precinct> => {
    return fetchApi<Precinct>(`/api/precincts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(precinctData),
    });
  },
};
