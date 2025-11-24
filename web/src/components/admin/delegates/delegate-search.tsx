"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { District } from "@/types/district.types";
import { PaginationMeta } from "@/types/shared";
import { districtsApi } from "@/lib/api/district";
import { Delegate } from "@/types/delegates.types";
import { delegatesApi } from "@/lib/api/delegates";
import { formatPeso } from "@/lib/utils/peso-format";
import { CandidateCreateDialog } from "./candidate-create-dialog";
import { Candidate } from "@/types/candidates.types";

export function DelegateSearch() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [delegates, setDelegates] = React.useState<Delegate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [pagination, setPagination] = React.useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalRecords: 0,
    totalPages: 0,
    nextPage: null,
    previousPage: null,
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [delegate, setDelegate] = React.useState<Delegate | null>(null);

  // Function to fetch districts from API
  const fetchDelegates = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await delegatesApi.getDelegates({
        term: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });

      setDelegates(response.data);
      setPagination(response.meta);
    } catch (error) {
      setError("Failed to load delegates. Please try again.");
      toast.error("Failed to load delegates");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchDelegates();
  }, [fetchDelegates]);

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

  const handleCreateCandidate = (delegate: Delegate) => {
    setDelegate(delegate);
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading delegates...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchDelegates} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search districts..."
            className="p-5 pl-8"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {/* Pagination */}
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
          <div className="w-32 text-center">Branch</div>
          <div className="flex-1">Name</div>
          <div className="flex-1 text-center">Account ID</div>
          <div className="w-40 text-center">Balance</div>
          <div className="w-40 text-center">Has Voted</div>
          <div className="w-40 text-center">Control Number</div>

          <div className="flex-1 text-center">Actions</div>
        </div>
        <div className="divide-y">
          {delegates?.map((delegate) => (
            <div key={delegate.id} className="flex p-4 items-center">
              <div className="w-32 text-center">
                <span>{delegate?.branch}</span>
              </div>
              <div className="flex-1">
                <span>{delegate?.accountName}</span>
              </div>
              <div className="flex-1 text-center">
                <span>{delegate?.accountId}</span>
              </div>
              <div className="w-40 text-center">
                <span>{formatPeso(Number(delegate?.balance))}</span>
              </div>
              <div className="w-40 text-center">
                <span>{delegate?.hasVoted}</span>
              </div>
              <div className="w-40 text-center">
                <span>{delegate?.controlNumber}</span>
              </div>

              <div className="flex-1 text-center">
                <Button
                  variant="outline"
                  onClick={() => handleCreateCandidate(delegate)}
                >
                  Register Candidate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CandidateCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        delegate={delegate!}
      />
    </>
  );
}
