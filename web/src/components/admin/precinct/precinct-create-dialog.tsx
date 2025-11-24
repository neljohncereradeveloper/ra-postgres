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
  CreatePrecinctRequest,
  PrecinctCreateDialogProps,
} from "@/types/precinct.types";
import { precinctsApi } from "@/lib/api/precincts";

// Create district form schema
const precinctFormSchema = z.object({
  desc1: z.string(),
});
type PrecinctFormValues = z.infer<typeof precinctFormSchema>;

// Move defaultValues outside the component to prevent recreation on each render
const DEFAULT_VALUES: Partial<PrecinctFormValues> = {
  desc1: "",
};

export function PrecinctCreateDialog({
  isOpen,
  onClose,
  onPrecinctCreated,
}: PrecinctCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PrecinctFormValues>({
    resolver: zodResolver(precinctFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens or closes without recreating dependencies
  React.useEffect(() => {
    // Only reset when opening to avoid infinite loops
    if (isOpen) {
      form.reset(DEFAULT_VALUES);
    }
  }, [isOpen, form]); // Remove defaultValues from dependencies

  const onSubmit = async (data: PrecinctFormValues) => {
    setIsSubmitting(true);

    try {
      // Create event request payload
      const precinctData: CreatePrecinctRequest = {
        ...data,
      };

      // Call the events API service
      const createdPrecinct = await precinctsApi.createPrecinct(precinctData);

      toast.success("Precinct created successfully");
      onPrecinctCreated(createdPrecinct);
      onClose();
    } catch (error) {
      console.error("Error creating precinct:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create precinct"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Precinct</DialogTitle>
          <DialogDescription>
            Enter the details for the new precinct
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="desc1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precinct Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Precinct 1" {...field} />
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
                {isSubmitting ? "Creating..." : "Create Precinct"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
