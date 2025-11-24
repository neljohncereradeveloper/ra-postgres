import { fetchApi } from "@/lib/api/client";

export type Election = {
  id: number;
  name: string;
  desc1: string;
  address: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  maxAttendees: number | null;
  status: string;
  deletedAt: string | null;
};

export type Setup = {
  id: number;
  setupCode: string;
  electionId: number;
  election: Election;
};

export const settingsApi = {
  /**
   * Retrieve settings
   */
  getSettings: async (): Promise<Setup> => {
    const endpoint = "/api/settings";

    return await fetchApi<Setup>(endpoint);
  },

  /**
   * Set active election
   */
  setActiveElection: async (electionName: string): Promise<Setup> => {
    const endpoint = "/api/settings/set-active";

    return await fetchApi<Setup>(endpoint, {
      method: "PATCH",
      body: JSON.stringify({ electionName }),
    });
  },

  /**
   * Reset election
   */
  resetElection: async (): Promise<Setup> => {
    const endpoint = "/api/settings/reset";
    return await fetchApi<Setup>(endpoint, {
      method: "PATCH",
    });
  },

  uploadAttendees: async (userData: { file: File }): Promise<any> => {
    const formData = new FormData();
    // Append file
    formData.append("file", userData.file);

    return fetchApi("/api/settings/upload-attendees", {
      method: "POST",
      body: formData,
    });
  },
};
