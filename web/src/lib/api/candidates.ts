import { fetchApi } from "@/lib/api/client";
import {
  CreateCandidateRequest,
  Candidate,
  CandidatesResponse,
} from "@/types/candidates.types";

export const candidatesApi = {
  /**
   * Get a list of candidates with optional filtering
   */
  getCandidates: async (params?: {
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<CandidatesResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.term) searchParams.set("term", params.term);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString
      ? `/api/candidates?${queryString}`
      : "/api/candidates";

    return fetchApi<CandidatesResponse>(endpoint);
  },

  /**
   * Create a new candidate
   */
  createCandidate: async (
    candidateData: CreateCandidateRequest
  ): Promise<Candidate> => {
    return fetchApi<Candidate>("/api/candidates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidateData),
    });
  },

  /**
   * Update an existing candidate
   */
  updateCandidate: async (
    id: number,
    candidateData: Partial<CreateCandidateRequest>
  ): Promise<Candidate> => {
    return fetchApi<Candidate>(`/api/candidates/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(candidateData),
    });
  },
};
