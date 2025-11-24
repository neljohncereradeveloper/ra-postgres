import { fetchApi } from "@/lib/api/client";
import {
  CreateDistrictRequest,
  District,
  DistrictsResponse,
} from "@/types/district.types";

export const districtsApi = {
  /**
   * Get a list of districts with optional filtering
   */
  getDistricts: async (params?: {
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<DistrictsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.term) searchParams.set("term", params.term);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/districts?${queryString}`
      : "/api/districts";

    return fetchApi<DistrictsResponse>(endpoint);
  },

  getComboboxDistricts: async (): Promise<
    {
      label: string;
      value: string;
    }[]
  > => {
    const endpoint = "/api/districts/combobox";

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
  createDistrict: async (
    districtData: CreateDistrictRequest
  ): Promise<District> => {
    return fetchApi<District>("/api/districts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(districtData),
    });
  },

  /**
   * Update an existing district
   */
  updateDistrict: async (
    id: number,
    districtData: Partial<CreateDistrictRequest>
  ): Promise<District> => {
    return fetchApi<District>(`/api/districts/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(districtData),
    });
  },
};
