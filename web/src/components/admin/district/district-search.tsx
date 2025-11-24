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
import { DistrictViewDialog } from "./district-view-dialog";
import { DistrictCreateDialog } from "./district-create-dialog";
import { DistrictUpdateDialog } from "./district-update-dialog";

export function DistrictSearch({
  isCreateDialogOpen,
  handleCloseCreateDialog,
}: {
  isCreateDialogOpen: boolean;
  handleCloseCreateDialog: () => void;
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [districts, setDistricts] = React.useState<District[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [viewingDistrict, setViewingDistrict] = React.useState<District | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = React.useState(false);
  const [editingDistrict, setEditingDistrict] = React.useState<District | null>(
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
  const fetchDistricts = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await districtsApi.getDistricts({
        term: debouncedSearch,
        page: pagination.page,
        limit: pagination.limit,
      });

      setDistricts(response.data);
      setPagination(response.meta);
    } catch (error) {
      setError("Failed to load districts. Please try again.");
      toast.error("Failed to load districts");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, pagination.page, pagination.limit]);

  React.useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

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

  const handleViewDistrict = (district: District) => {
    setViewingDistrict(district);
    setIsViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false);
  };

  const handleEditDistrict = (district: District) => {
    setEditingDistrict(district);
    setIsUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setIsUpdateDialogOpen(false);
    setEditingDistrict(null);
  };

  const handleDistrictCreated = (newDistrict: District) => {
    // Add the new district to the list and update pagination
    setDistricts((prevDistricts) => [newDistrict, ...prevDistricts]);

    // Update pagination
    setPagination((prev) => ({
      ...prev,
      totalRecords: prev.totalRecords + 1,
    }));
  };

  const handleDistrictUpdated = (updatedDistrict: District) => {
    // Update the district in the list
    setDistricts((prevDistricts) =>
      prevDistricts.map((district) =>
        district.id === updatedDistrict.id ? updatedDistrict : district
      )
    );
    toast.success("District updated successfully");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading districts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <Button onClick={fetchDistricts} variant="outline" className="mt-4">
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
            placeholder="Search districts..."
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
          {districts.map((district) => (
            <div key={district.id} className="flex p-4 items-center">
              <div className="flex-1 flex flex-col">
                <span>{district.desc1}</span>
              </div>

              <div className="w-32 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDistrict(district)}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditDistrict(district)}
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DistrictViewDialog
        district={viewingDistrict}
        isOpen={isViewDialogOpen}
        onClose={handleCloseViewDialog}
      />

      <DistrictCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={handleCloseCreateDialog}
        onDistrictCreated={handleDistrictCreated}
      />

      <DistrictUpdateDialog
        district={editingDistrict}
        isOpen={isUpdateDialogOpen}
        onClose={handleCloseUpdateDialog}
        onDistrictUpdated={handleDistrictUpdated}
      />
    </>
  );
}
