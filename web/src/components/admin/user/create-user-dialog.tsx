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
import { usersApi, type User, type CreateUserRequest } from "@/lib/api/users";
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

// Create user form schema
const userFormSchema = z.object({
  watcher: z.string().min(2, "Watcher must be at least 2 characters"),
  precinct: z.string().min(1, "Precinct is required"),
  applicationAccess: z
    .array(z.string())
    .min(1, "At least one application access is required"),
  userRoles: z.string().min(1, "User role is required"),
  userName: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface CreateUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (user: User) => void;
}

// Move defaultValues outside the component to prevent recreation on each render
const DEFAULT_VALUES: Partial<UserFormValues> = {
  watcher: "",
  precinct: "",
  applicationAccess: [],
  userRoles: "",
  userName: "",
  password: "",
};

export function CreateUserDialog({
  isOpen,
  onClose,
  onUserCreated,
}: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens or closes without recreating dependencies
  React.useEffect(() => {
    // Only reset when opening to avoid infinite loops
    if (isOpen) {
      form.reset(DEFAULT_VALUES);
    }
  }, [isOpen, form]); // Remove defaultValues from dependencies

  const onSubmit = async (data: UserFormValues) => {
    setIsSubmitting(true);

    try {
      // Join applicationAccess array with commas
      const formattedData = {
        ...data,
        applicationAccess: data.applicationAccess.join(","),
      };

      // Create user request payload
      const userData: CreateUserRequest = {
        ...formattedData,
      };

      // Call the users API service
      const createdUser = await usersApi.createUser(userData);

      toast.success("User created successfully");
      onUserCreated(createdUser);
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user account.
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
                  <FormItem className="w-full">
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
                        <SelectItem value="Precinct">Precinct</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                {isSubmitting ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
