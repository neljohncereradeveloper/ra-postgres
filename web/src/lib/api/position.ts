import { fetchApi } from "@/lib/api/client";
import {
  CreatePositionRequest,
  Position,
  PositionsResponse,
} from "@/types/position.types";

export const positionsApi = {
  /**
   * Get a list of positions with optional filtering
   */
  getPositions: async (params?: {
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<PositionsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.term) searchParams.set("term", params.term);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/positions?${queryString}`
      : "/api/positions";

    return fetchApi<PositionsResponse>(endpoint);
  },

  getComboboxPositions: async (): Promise<
    {
      label: string;
      value: string;
    }[]
  > => {
    const endpoint = "/api/positions/combobox";

    return fetchApi<
      {
        label: string;
        value: string;
      }[]
    >(endpoint);
  },

  /**
   * Create a new position
   */
  createPosition: async (
    positionData: CreatePositionRequest
  ): Promise<Position> => {
    return fetchApi<Position>("/api/positions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(positionData),
    });
  },

  /**
   * Update an existing position
   */
  updatePosition: async (
    id: number,
    positionData: Partial<CreatePositionRequest>
  ): Promise<Position> => {
    return fetchApi<Position>(`/api/positions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(positionData),
    });
  },
};
