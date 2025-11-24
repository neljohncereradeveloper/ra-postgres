import { fetchApi } from "@/lib/api/client";
import { CandidateReport, CastVoteReport } from "@/types/reports.types";

export const reportsApi = {
  getCastVotesReport: async (): Promise<CastVoteReport> => {
    const endpoint = "/api/reports/cast-votes";
    return fetchApi<CastVoteReport>(endpoint);
  },

  getCandidatesReport: async (): Promise<CandidateReport> => {
    const endpoint = "/api/reports/candidates";
    return fetchApi<CandidateReport>(endpoint);
  },
};
