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
  CreatePositionRequest,
  PositionCreateDialogProps,
} from "@/types/position.types";
import { positionsApi } from "@/lib/api/position";

// Create position form schema
const positionFormSchema = z.object({
  desc1: z.string(),
  maxCandidates: z.coerce.number().min(1), // coerce to number
  termLimit: z.string().min(1),
});
type PositionFormValues = z.infer<typeof positionFormSchema>;

// Move defaultValues outside the component to prevent recreation on each render
const DEFAULT_VALUES: Partial<PositionFormValues> = {
  desc1: "",
  maxCandidates: 0,
  termLimit: "",
};

export function PositionCreateDialog({
  isOpen,
  onClose,
  onPositionCreated,
}: PositionCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PositionFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens or closes without recreating dependencies
  React.useEffect(() => {
    // Only reset when opening to avoid infinite loops
    if (isOpen) {
      form.reset(DEFAULT_VALUES);
    }
  }, [isOpen, form]); // Remove defaultValues from dependencies

  const onSubmit = async (data: PositionFormValues) => {
    setIsSubmitting(true);

    try {
      // Create event request payload
      const positionData: CreatePositionRequest = {
        ...data,
      };

      // Call the events API service
      const createdPosition = await positionsApi.createPosition(positionData);

      toast.success("Position created successfully");
      onPositionCreated(createdPosition);
      onClose();
    } catch (error) {
      console.error("Error creating position:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create position"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Position</DialogTitle>
          <DialogDescription>
            Enter the details for the new position
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="desc1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Position 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxCandidates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Candidates</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="termLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term Limit</FormLabel>
                  <FormControl>
                    <Input placeholder="2 years" {...field} />
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
                {isSubmitting ? "Creating..." : "Create Position"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
