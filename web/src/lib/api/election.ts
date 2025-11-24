import { fetchApi } from "@/lib/api/client";
import { Election } from "@/types/settings.types";

// Election Creation Request
export interface CreateElectionRequest {
  name: string;
  desc1: string;
  address: string;
  date: string;
}

export interface ElectionsResponse {
  data: Election[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface ScheduledElectionsResponse {
  value: string;
  label: string;
}

export const electionsApi = {
  /**
   * Get a list of elections with optional filtering
   */
  getElections: async (params?: {
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<ElectionsResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.term) searchParams.set("term", params.term);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/elections?${queryString}`
      : "/api/elections";

    return fetchApi<ElectionsResponse>(endpoint);
  },

  /**
   * Get a list of scheduled elections
   */
  getScheduledElections: async (): Promise<ScheduledElectionsResponse> => {
    const endpoint = "/api/elections/scheduled";
    return fetchApi<ScheduledElectionsResponse>(endpoint);
  },

  /**
   * Create a new election
   */
  createElection: async (
    electionData: CreateElectionRequest
  ): Promise<Election> => {
    return fetchApi<Election>("/api/elections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(electionData),
    });
  },

  /**
   * Get a single election by ID
   */
  getElection: async (id: number): Promise<Election> => {
    return fetchApi<Election>(`/api/elections/${id}`);
  },

  /**
   * Update an existing election
   */
  updateElection: async (
    id: number,
    electionData: Partial<CreateElectionRequest>
  ): Promise<Election> => {
    return fetchApi<Election>(`/api/elections/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(electionData),
    });
  },

  /**
   * Delete an election
   */
  deleteElection: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/elections/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Start an election
   */
  startElection: async (): Promise<void> => {
    return fetchApi<void>(`/api/elections/start`, {
      method: "PATCH",
    });
  },

  /**
   * End an election
   */
  closeElection: async (): Promise<void> => {
    return fetchApi<void>(`/api/elections/close`, {
      method: "PATCH",
    });
  },

  /**
   * Cancel an election
   */
  cancelElection: async (): Promise<void> => {
    return fetchApi<void>(`/api/elections/cancel`, {
      method: "PATCH",
    });
  },
};
