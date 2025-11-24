"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { isValid } from "date-fns";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
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
import { Textarea } from "@/components/ui/textarea";
import { type Election } from "./election-view-dialog";
import { CreateElectionRequest, electionsApi } from "@/lib/api/election";
// Create election form schema
const electionFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  desc1: z.string(),
  address: z
    .string()
    .min(3, { message: "Address must be at least 3 characters" }),
  date: z.string().refine(
    (val) => {
      if (!val) return false;
      const parsedDate = parseISO(val);
      return isValid(parsedDate);
    },
    {
      message: "Invalid date format. Expected YYYY-MM-DD.",
    }
  ),
});

type ElectionFormValues = z.infer<typeof electionFormSchema>;

interface ElectionCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onElectionCreated: (election: Election) => void;
}

// Move defaultValues outside the component to prevent recreation on each render
const DEFAULT_VALUES: Partial<ElectionFormValues> = {
  name: "",
  desc1: "",
  address: "",
  date: "",
};

export function ElectionCreateDialog({
  isOpen,
  onClose,
  onElectionCreated,
}: ElectionCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ElectionFormValues>({
    resolver: zodResolver(electionFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens or closes without recreating dependencies
  React.useEffect(() => {
    // Only reset when opening to avoid infinite loops
    if (isOpen) {
      form.reset(DEFAULT_VALUES);
    }
  }, [isOpen, form]); // Remove defaultValues from dependencies

  const onSubmit = async (data: ElectionFormValues) => {
    setIsSubmitting(true);

    try {
      // Format date to ISO string (YYYY-MM-DD)
      const formattedDate = format(data.date, "yyyy-MM-dd");

      // Create event request payload
      const electionData: CreateElectionRequest = {
        ...data,
        date: formattedDate,
      };

      // Call the events API service
      const createdElection = await electionsApi.createElection(electionData);

      toast.success("Election created successfully");
      onElectionCreated(createdElection);
      onClose();
    } catch (error) {
      console.error("Error creating election:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create election"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Election</DialogTitle>
          <DialogDescription>
            Enter the details for the new election
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Election Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Election 2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-sm font-medium">Date</FormLabel>
                  <FormControl>
                    <Input placeholder="Select date" type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desc1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Event description (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Event venue address" {...field} />
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
                {isSubmitting ? "Creating..." : "Create Election"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
