import { fetchApi } from "@/lib/api/client";
import { CastVoteReprint } from "@/types/cast-vote-reprint.types";

/**
 * Get a list of districts with optional filtering
 */
export const castVoteReprintApi = {
  getCastVoteReprint: async (params?: {
    controlNumber?: string;
  }): Promise<CastVoteReprint> => {
    const searchParams = new URLSearchParams();

    if (params?.controlNumber)
      searchParams.set("controlNumber", params.controlNumber);

    const queryString = searchParams.toString();
    const endpoint = `/api/cast-votes/reprint?${queryString}`;

    return fetchApi<CastVoteReprint>(endpoint);
  },
};
