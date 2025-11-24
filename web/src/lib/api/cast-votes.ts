import { fetchApi } from "@/lib/api/client";
import { CastVote, CastVoteCandidates } from "@/types/cast-vote.types";

export const castVotesApi = {
  /**
   * Get a list of cast vote candidates
   */
  getCastVoteCandidates: async (): Promise<CastVoteCandidates> => {
    const endpoint = `/api/cast-votes`;

    return fetchApi<CastVoteCandidates>(endpoint);
  },

  /**
   * Submit a cast vote
   */
  castVote: async (submissionData: any): Promise<CastVote> => {
    // You might want to define a more specific type for submissionData and the response
    const endpoint = `/api/cast-votes`;
    return fetchApi<CastVote>(endpoint, {
      method: "POST",
      body: JSON.stringify(submissionData),
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
