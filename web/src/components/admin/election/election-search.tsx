"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/date-format";
import { formatISOTime } from "@/lib/utils/time-format";
import { ElectionViewDialog, type Election } from "./election-view-dialog";
import { ElectionCreateDialog } from "./election-create-dialog";
import { electionsApi } from "@/lib/api/election";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { ElectionUpdateDialog } from "./election-update-dialog";

type PaginationMeta = {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
};

export function ElectionSearch({
  isCreateDialogOpen,
  handleCloseCreateDialog,
}: {
  isCreateDialogOpen: boolean;
  handleCloseCreateDialog: () => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [elections, setElections] = React.useState<Election[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewingElection, setViewingElection] = React.useState<Election | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [editingElection, setEditingElection] = React.useState<Election | null>(
    null
  );
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    page: 1,
    limit: 100,
    totalRecords: 0,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
  });

  // Function to fetch elections from API
  const fetchElections = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await electionsApi.getElections({
        term: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });

      setElections(response.data);
      setPagination(response.meta);
    } catch (error) {
      console.error("Error fetching elections:", error);
      setError("Failed to load elections. Please try again.");
      toast.error("Failed to load elections");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchElections();
  }, [fetchElections]);

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

  // Get status badge color based on election status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 text-green-700";
      case "upcoming":
        return "bg-blue-50 text-blue-700";
      case "completed":
        return "bg-purple-50 text-purple-700";
      case "cancelled":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const handleViewElection = (election: Election) => {
    setViewingElection(election);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
  };

  const handleEditElection = (election: Election) => {
    setEditingElection(election);
    setIsUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setEditingElection(null);
  };

  const handleElectionCreated = (newElection: Election) => {
    // Add the new event to the list and update pagination
    setElections((prevElections) => [newElection, ...prevElections]);

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalRecords: prev.totalRecords + 1,
    }));
  };

  const handleElectionUpdated = (updatedElection: Election) => {
    // Update the event in the list
    setElections((prevElections) =>
      prevElections.map((election) =>
        election.id === updatedElection.id ? updatedElection : election
      )
    );
    toast.success("Election updated successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading elections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchElections} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2  mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="p-5 pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex items-center justify-between my-4">
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

      <div className="border rounded-md">
        <div className="flex p-4 border-b">
          <div className="flex-1">Name</div>
          <div className="w-20 text-start">Status</div>
          <div className="w-32 text-center">Start Time</div>
          <div className="w-32 text-center">End Time</div>
          <div className="w-32 text-center">Actions</div>
        </div>
        <div className="divide-y">
          {elections.map((election) => (
            <div key={election.id} className="flex p-4 items-center">
              <div className="flex-1 flex flex-col">
                <span>{election.name}</span>
                <span className="text-sm">{formatDate(election.date)}</span>
              </div>
              <span
                className={`w-20 mt-1 text-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                  election.status
                )}`}
              >
                {election.status}
              </span>

              <span className="w-32 text-sm text-center">
                {formatISOTime(election.startTime)}
              </span>
              <span className="w-32 text-sm text-center">
                {formatISOTime(election.endTime)}
              </span>
              <div className="w-32 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewElection(election)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditElection(election)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ElectionViewDialog
        election={viewingElection}
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      <ElectionCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onElectionCreated={handleElectionCreated}
      />

      <ElectionUpdateDialog
        election={editingElection}
        isOpen={isUpdateDialogOpen}
        onClose={handleCloseUpdateDialog}
        onElectionUpdated={handleElectionUpdated}
      />
    </>
  );
}
