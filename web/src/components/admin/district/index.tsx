"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DistrictSearch } from "./district-search";

export function DistrictManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const handleCreateDistrict = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Districts</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Manage districts.</span>

          <div className="flex justify-end">
            <Button
              onClick={handleCreateDistrict}
              className="flex items-center gap-1"
            >
              <span>Create District</span>
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DistrictSearch
          isCreateDialogOpen={isCreateDialogOpen}
          handleCloseCreateDialog={handleCloseCreateDialog}
        />
      </CardContent>
    </Card>
  );
}
