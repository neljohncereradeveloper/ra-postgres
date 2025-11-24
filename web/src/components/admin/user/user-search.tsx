"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { usersApi, type User } from "@/lib/api/users";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { CreateUserDialog } from "./create-user-dialog";
import { UserViewDialog } from "./user-view-dialog";
import { UserEditDialog } from "./user-edit-dialog";

type PaginationMeta = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
};

interface UserSearchProps {
  initialSearch?: string;
  isCreateDialogOpen: boolean;
  handleCloseCreateDialog: () => void;
}

export function UserSearch({
  initialSearch = "",
  isCreateDialogOpen,
  handleCloseCreateDialog,
}: UserSearchProps) {
  const [searchQuery, setSearchQuery] = React.useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    page: 1,
    limit: 1000,
    totalRecords: 0,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
  });
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

  // Function to fetch users from API
  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await usersApi.getUsers({
        term: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });

      setUsers(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load users. Please try again.");
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  // Fetch users when search query or pagination changes
  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page on new search
  };

  const handleNextPage = () => {
    if (pagination.nextPage) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.previousPage) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const handleUserCreated = (newUser: User) => {
    // Add the new event to the list and update pagination
    setUsers((prevUsers) => [newUser, ...prevUsers]);

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalRecords: prev.totalRecords + 1,
    }));
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
  };

  const handleEditUser = (user: User) => {
    console.log(user);
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleUserUpdated = (updatedUser: User) => {
    // Update user in the list
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {error ? (
        <div className="text-center py-4 text-red-500">
          <p>{error}</p>
          <Button onClick={fetchUsers} variant="outline" className="mt-2">
            Retry
          </Button>
        </div>
      ) : null}

      {users.length === 0 && !loading ? (
        <div className="text-center py-8 text-muted-foreground">
          No users found
          {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}.
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <div className="flex justify-between p-4 border-b font-medium text-sm">
              <div className="flex-1 text-start">Precinct</div>
              <div className="flex-1">Watcher</div>
              <div className="w-32 text-start">Role</div>
              <div className="w-32 text-start">Username</div>
              <div className="w-32 text-start">Actions</div>
            </div>
            <div className="divide-y">
              {users?.map((user, index) => (
                <div
                  key={index}
                  className="flex justify-between p-4 items-center"
                >
                  <div className="text-sm flex-1 text-start">
                    <div>{user.precinct}</div>
                  </div>
                  <div className="flex-1">{user.watcher}</div>

                  <div className="text-sm w-32 text-start">
                    <div>{user.userRoles}</div>
                  </div>
                  <div className="text-sm w-32 text-start">{user.userName}</div>
                  <div className="w-32 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(user)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <strong>
                  {(pagination.page - 1) * pagination.limit + 1}-
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.totalRecords
                  )}
                </strong>{" "}
                of <strong>{pagination.totalRecords}</strong> users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!pagination.previousPage || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pagination.nextPage || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {loading && users.length > 0 && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      <CreateUserDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onUserCreated={handleUserCreated}
      />

      <UserViewDialog
        user={selectedUser}
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      <UserEditDialog
        user={selectedUser}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
