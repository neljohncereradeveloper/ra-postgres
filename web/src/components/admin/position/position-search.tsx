"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { PaginationMeta } from "@/types/shared";
import { positionsApi } from "@/lib/api/position";
import { PositionViewDialog } from "./position-view-dialog";
import { PositionCreateDialog } from "./position-create-dialog";
import { PositionUpdateDialog } from "./position-update-dialog";
import { Position } from "@/types/position.types";

export function PositionSearch({
  isCreateDialogOpen,
  handleCloseCreateDialog,
}: {
  isCreateDialogOpen: boolean;
  handleCloseCreateDialog: () => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewingPosition, setViewingPosition] = React.useState<Position | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [editingPosition, setEditingPosition] = React.useState<Position | null>(
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

  // Function to fetch positions from API
  const fetchPositions = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await positionsApi.getPositions({
        term: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });

      setPositions(response.data);
      setPagination(response.meta);
    } catch (error) {
      setError("Failed to load positions. Please try again.");
      toast.error("Failed to load positions");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

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

  const handleViewPosition = (position: Position) => {
    setViewingPosition(position);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setIsUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setEditingPosition(null);
  };

  const handlePositionCreated = (newPosition: Position) => {
    // Add the new position to the list and update pagination
    setPositions((prevPositions) => [newPosition, ...prevPositions]);

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalRecords: prev.totalRecords + 1,
    }));
  };

  const handlePositionUpdated = (updatedPosition: Position) => {
    // Update the position in the list
    setPositions((prevPositions) =>
      prevPositions.map((position) =>
        position.id === updatedPosition.id ? updatedPosition : position
      )
    );
    toast.success("Position updated successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading positions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchPositions} variant="outline" className="mt-4">
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
            placeholder="Search positions..."
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
          <div className="flex-1">Max Candidates</div>
          <div className="flex-1">Term Limit</div>
          <div className="w-32 text-center">Actions</div>
        </div>
        <div className="divide-y">
          {positions.map((position) => (
            <div key={position.id} className="flex p-4 items-center">
              <div className="flex-1 flex flex-col">
                <span>{position.desc1}</span>
              </div>
              <div className="flex-1 flex flex-col">
                <span>{position.maxCandidates}</span>
              </div>
              <div className="flex-1 flex flex-col">
                <span>{position.termLimit}</span>
              </div>

              <div className="w-32 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPosition(position)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPosition(position)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <PositionViewDialog
        position={viewingPosition}
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      <PositionCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onPositionCreated={handlePositionCreated}
      />

      <PositionUpdateDialog
        position={editingPosition}
        isOpen={isUpdateDialogOpen}
        onClose={handleCloseUpdateDialog}
        onPositionUpdated={handlePositionUpdated}
      />
    </>
  );
}
