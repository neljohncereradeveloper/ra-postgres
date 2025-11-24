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
import { PositionSearch } from "./position-search";

export function PositionManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const handleCreatePosition = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Positions</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Manage positions.</span>

          <div className="flex justify-end">
            <Button
              onClick={handleCreatePosition}
              className="flex items-center gap-1"
            >
              <span>Create District</span>
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PositionSearch
          isCreateDialogOpen={isCreateDialogOpen}
          handleCloseCreateDialog={handleCloseCreateDialog}
        />
      </CardContent>
    </Card>
  );
}
