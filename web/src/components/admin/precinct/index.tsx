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
import { PrecinctSearch } from "./precinct-search";

export function PrecinctManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const handleCreatePrecinct = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Precincts</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Manage precincts.</span>

          <div className="flex justify-end">
            <Button
              onClick={handleCreatePrecinct}
              className="flex items-center gap-1"
            >
              <span>Create Precinct</span>
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PrecinctSearch
          isCreateDialogOpen={isCreateDialogOpen}
          handleCloseCreateDialog={handleCloseCreateDialog}
        />
      </CardContent>
    </Card>
  );
}
