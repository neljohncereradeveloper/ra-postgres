"use client";

import * as React from "react";
import { UserSearch } from "./user-search";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  return (
    <Card className="rounded-none">
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription className="flex justify-between items-center">
          <span>View and manage all system users.</span>
          <div className="flex justify-end">
            <Button
              className="flex items-center gap-1"
              onClick={handleOpenCreateDialog}
            >
              <UserPlus className="h-4 w-4" />
              <span>Add User</span>
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UserSearch
          isCreateDialogOpen={isCreateDialogOpen}
          handleCloseCreateDialog={handleCloseCreateDialog}
        />
      </CardContent>
    </Card>
  );
}
