import { fetchApi } from "@/lib/api/client";

// User type definition
export interface User {
  id: number;
  watcher: string;
  precinct: string;
  applicationAccess: string;
  userRoles: string;
  userName: string;
  deletedAt: string | null;
}

// User update request
export interface UpdateUserRequest {
  watcher?: string;
  precinct?: string;
  applicationAccess?: string;
  userRoles?: string;
  userName?: string;
}

// User create request
export interface CreateUserRequest {
  watcher: string;
  precinct: string;
  applicationAccess?: string;
  userRoles: string;
  userName: string;
  password: string;
}

export interface UsersResponse {
  data: User[];
  meta: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export const usersApi = {
  /**
   * Get a list of users with optional filtering
   */
  getUsers: async (params?: {
    term?: string;
    page?: number;
    limit?: number;
  }): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();

    if (params?.term) searchParams.set("term", params.term);
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/users?${queryString}` : "/api/users";

    return fetchApi<UsersResponse>(endpoint);
  },

  /**
   * Create a new user
   */
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return fetchApi<User>("/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  },

  /**
   * Get a single user by ID
   */
  getUser: async (id: number): Promise<User> => {
    return fetchApi<User>(`/api/users/${id}`);
  },

  /**
   * Update an existing user
   */
  updateUser: async (
    id: number,
    userData: UpdateUserRequest
  ): Promise<User> => {
    return fetchApi<User>(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: number): Promise<void> => {
    return fetchApi<void>(`/api/users/${id}`, {
      method: "DELETE",
    });
  },
};
