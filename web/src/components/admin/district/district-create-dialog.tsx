"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Button } from "@/components/ui/button";
import {
  CreateDistrictRequest,
  DistrictCreateDialogProps,
} from "@/types/district.types";
import { districtsApi } from "@/lib/api/district";

// Create district form schema
const districtFormSchema = z.object({
  desc1: z.string(),
});
type DistrictFormValues = z.infer<typeof districtFormSchema>;

// Move defaultValues outside the component to prevent recreation on each render
const DEFAULT_VALUES: Partial<DistrictFormValues> = {
  desc1: "",
};

export function DistrictCreateDialog({
  isOpen,
  onClose,
  onDistrictCreated,
}: DistrictCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<DistrictFormValues>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens or closes without recreating dependencies
  React.useEffect(() => {
    // Only reset when opening to avoid infinite loops
    if (isOpen) {
      form.reset(DEFAULT_VALUES);
    }
  }, [isOpen, form]); // Remove defaultValues from dependencies

  const onSubmit = async (data: DistrictFormValues) => {
    setIsSubmitting(true);

    try {
      // Create event request payload
      const districtData: CreateDistrictRequest = {
        ...data,
      };

      // Call the events API service
      const createdDistrict = await districtsApi.createDistrict(districtData);

      toast.success("District created successfully");
      onDistrictCreated(createdDistrict);
      onClose();
    } catch (error) {
      console.error("Error creating district:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create district"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New District</DialogTitle>
          <DialogDescription>
            Enter the details for the new district
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="desc1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>District Name</FormLabel>
                  <FormControl>
                    <Input placeholder="District 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isSubmitting ? "Creating..." : "Create District"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
