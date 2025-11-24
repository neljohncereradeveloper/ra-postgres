"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { District } from "@/types/district.types";
import { PaginationMeta } from "@/types/shared";
import { precinctsApi } from "@/lib/api/precincts";
import { PrecinctViewDialog } from "./precinct-view-dialog";
import { PrecinctCreateDialog } from "./precinct-create-dialog";
import { PrecinctUpdateDialog } from "./precinct-update-dialog";
import { Precinct } from "@/types/precinct.types";

export function PrecinctSearch({
  isCreateDialogOpen,
  handleCloseCreateDialog,
}: {
  isCreateDialogOpen: boolean;
  handleCloseCreateDialog: () => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [precincts, setPrecincts] = React.useState<Precinct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewingPrecinct, setViewingPrecinct] = React.useState<Precinct | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [editingPrecinct, setEditingPrecinct] = React.useState<Precinct | null>(
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

  // Function to fetch districts from API
  const fetchPrecincts = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await precinctsApi.getPrecincts({
        term: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });

      setPrecincts(response.data);
      setPagination(response.meta);
    } catch (error) {
      setError("Failed to load precincts. Please try again.");
      toast.error("Failed to load precincts");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchPrecincts();
  }, [fetchPrecincts]);

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

  const handleViewPrecinct = (precinct: Precinct) => {
    setViewingPrecinct(precinct);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
  };

  const handleEditPrecinct = (precinct: Precinct) => {
    setEditingPrecinct(precinct);
    setIsUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setEditingPrecinct(null);
  };

  const handlePrecinctCreated = (newPrecinct: Precinct) => {
    // Add the new district to the list and update pagination
    setPrecincts((prevPrecincts) => [newPrecinct, ...prevPrecincts]);

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalRecords: prev.totalRecords + 1,
    }));
  };

  const handlePrecinctUpdated = (updatedPrecinct: Precinct) => {
    // Update the precinct in the list
    setPrecincts((prevPrecincts) =>
      prevPrecincts.map((precinct) =>
        precinct.id === updatedPrecinct.id ? updatedPrecinct : precinct
      )
    );
    toast.success("Precinct updated successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading precincts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchPrecincts} variant="outline" className="mt-4">
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
            placeholder="Search precincts..."
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
          <div className="w-32 text-center">Actions</div>
        </div>
        <div className="divide-y">
          {precincts.map((precinct) => (
            <div key={precinct.id} className="flex p-4 items-center">
              <div className="flex-1 flex flex-col">
                <span>{precinct.desc1}</span>
              </div>

              <div className="w-32 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPrecinct(precinct)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPrecinct(precinct)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PrecinctViewDialog
        precinct={viewingPrecinct}
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      <PrecinctCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onPrecinctCreated={handlePrecinctCreated}
      />

      <PrecinctUpdateDialog
        precinct={editingPrecinct}
        isOpen={isUpdateDialogOpen}
        onClose={handleCloseUpdateDialog}
        onPrecinctUpdated={handlePrecinctUpdated}
      />
    </>
  );
}
