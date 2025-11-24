"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ElectionSearch } from "./election-search";
import { Button } from "@/components/ui/button";

export function ElectionManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const handleCreateElection = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Elections</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>Manage elections.</span>

          <div className="flex justify-end">
            <Button
              onClick={handleCreateElection}
              className="flex items-center gap-1"
            >
              <span>Create Election</span>
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ElectionSearch
          isCreateDialogOpen={isCreateDialogOpen}
          handleCloseCreateDialog={handleCloseCreateDialog}
        />
      </CardContent>
    </Card>
  );
}
