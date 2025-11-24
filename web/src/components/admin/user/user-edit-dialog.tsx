"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { usersApi, type User, type UpdateUserRequest } from "@/lib/api/users";
import { AuthApplicationAccessEnum } from "@/lib/constants/auth.constants";
import CComboboxPrecinct from "@/components/shared/combobox/precinct.combobox";

// Available application access options
const applicationAccessOptions = [
  {
    id: "admin",
    label: AuthApplicationAccessEnum.AdminModule,
    value: AuthApplicationAccessEnum.AdminModule,
  },
  {
    id: "election",
    label: AuthApplicationAccessEnum.ElectionManagementModule,
    value: AuthApplicationAccessEnum.ElectionManagementModule,
  },
  {
    id: "castvote",
    label: AuthApplicationAccessEnum.CastVoteManagementModule,
    value: AuthApplicationAccessEnum.CastVoteManagementModule,
  },
];

// Edit user form schema
const userEditSchema = z.object({
  watcher: z.string().min(2, "Watcher must be at least 2 characters"),
  precinct: z.string().min(1, "Precinct is required"),
  applicationAccess: z
    .array(z.string())
    .min(1, "At least one application access is required"),
  userRoles: z.string().min(1, "User role is required"),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

interface UserEditDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: (updatedUser: User) => void;
}

export function UserEditDialog({
  user,
  isOpen,
  onClose,
  onUserUpdated,
}: UserEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Initialize the form with default values
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      watcher: "",
      precinct: "",
      applicationAccess: [],
      userRoles: "Client",
    },
  });

  // Reset and populate form when user changes or dialog opens
  React.useEffect(() => {
    if (isOpen && user) {
      // Convert comma-separated applicationAccess to array
      const applicationAccess = user.applicationAccess?.split(",") || [];

      form.reset({
        watcher: user.watcher || "",
        precinct: user.precinct || "",
        applicationAccess: applicationAccess.map((item) => item.trim()),
        userRoles: user.userRoles,
      });
    }
  }, [isOpen, user, form]);

  const onSubmit = async (data: UserEditFormValues) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Join applicationAccess array with commas
      const formattedData = {
        ...data,
        applicationAccess: data.applicationAccess.join(","),
      };

      // Create update request payload
      const userData: UpdateUserRequest = {
        ...formattedData,
      };

      // Call the users API service
      const updatedUser = await usersApi.updateUser(user.id, userData);

      toast.success("User updated successfully");
      onUserUpdated(updatedUser);
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information for precinct {user?.precinct}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="watcher"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Watcher</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter watcher" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precinct"
                render={({ fieldState }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <CComboboxPrecinct
                        value={form.watch("precinct")}
                        onSelect={(selectedValue: string) => {
                          form.setValue("precinct", selectedValue);
                        }}
                      />
                    </FormControl>
                    {fieldState.error && (
                      <FormMessage>{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-between gap-4">
              <FormField
                control={form.control}
                name="userRoles"
                render={({ field }) => (
                  <FormItem className="w-full hidden">
                    <FormLabel>User Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>Application Access</FormLabel>
              <div className="grid grid-cols-1 gap-2 border rounded-md p-4">
                {applicationAccessOptions.map((option, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name="applicationAccess"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...field.value, option.value]
                                  : field.value.filter(
                                      (value) => value !== option.value
                                    );
                                field.onChange(updatedValue);
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {option.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
                <FormMessage />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
