"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { PaginationMeta } from "@/types/shared";
import { Candidate } from "@/types/candidates.types";
import { candidatesApi } from "@/lib/api/candidates";
import { CandidateViewDialog } from "./candidate-view-dialog";
import { CandidateUpdateDialog } from "./candidate-update-dialog";

export function CandidateSearch() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 1000);
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewingCandidate, setViewingCandidate] =
    React.useState<Candidate | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [editingCandidate, setEditingCandidate] =
    React.useState<Candidate | null>(null);
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
  });

  // Function to fetch candidates from API
  const fetchCandidates = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await candidatesApi.getCandidates({
        term: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });

      setCandidates(response.data);
      setPagination(response.meta);
    } catch (error) {
      setError("Failed to load candidates. Please try again.");
      toast.error("Failed to load candidates");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

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

  const handleViewCandidate = (candidate: Candidate) => {
    setViewingCandidate(candidate);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
  };

  const handleEditCandidate = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setEditingCandidate(null);
  };

  const handleCandidateUpdated = (updatedCandidate: Candidate) => {
    console.log(updatedCandidate);
    // Update the candidate in the list
    setCandidates((prevCandidates) =>
      prevCandidates.map((candidate) =>
        candidate.id === updatedCandidate.id ? updatedCandidate : candidate
      )
    );
    toast.success("Candidate updated successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading candidates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchCandidates} variant="outline" className="mt-4">
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
            placeholder="Search candidates..."
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
        <div className="flex p-4 border-b font-semibold">
          <div className="flex-1">Election</div>
          <div className="flex-1">Delegate Account</div>
          <div className="flex-1">Candidate Name</div>
          <div className="flex-1">District</div>
          <div className="flex-1">Position</div>
          <div className="w-32 text-center">Actions</div>
        </div>
        <div className="divide-y">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="flex p-4 items-center">
              <div className="flex-1">
                <span>{candidate.election}</span>
              </div>
              <div className="flex-1 flex flex-col">
                <span>{candidate.accountId}</span>
                <span>{candidate.accountName}</span>
              </div>
              <div className="flex-1">
                <span>{candidate.displayName}</span>
              </div>
              <div className="flex-1">
                <span>{candidate.district}</span>
              </div>
              <div className="flex-1">
                <span>{candidate.position}</span>
              </div>

              <div className="w-32 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewCandidate(candidate)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCandidate(candidate)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CandidateViewDialog
        candidate={viewingCandidate}
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      <CandidateUpdateDialog
        candidate={editingCandidate}
        isOpen={isUpdateDialogOpen}
        onClose={handleCloseUpdateDialog}
        onCandidateUpdated={handleCandidateUpdated}
      />
    </>
  );
}
