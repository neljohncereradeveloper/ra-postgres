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
import { Textarea } from "@/components/ui/textarea";
import { type Election } from "./election-view-dialog";
import { electionsApi } from "@/lib/api/election";
import { parseISO, isValid } from "date-fns";

// Update election form schema - focused only on the fields in the PATCH request
const electionUpdateSchema = z.object({
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

type ElectionUpdateFormValues = z.infer<typeof electionUpdateSchema>;

interface ElectionUpdateDialogProps {
  election: Election | null;
  isOpen: boolean;
  onClose: () => void;
  onElectionUpdated: (election: Election) => void;
}

export function ElectionUpdateDialog({
  election,
  isOpen,
  onClose,
  onElectionUpdated,
}: ElectionUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ElectionUpdateFormValues>({
    resolver: zodResolver(electionUpdateSchema),
    defaultValues: {
      name: "",
      desc1: "",
      address: "",
      date: "",
    },
  });

  // Reset form and populate with event data when dialog opens or event changes
  React.useEffect(() => {
    if (isOpen && election) {
      console.log(election);
      form.reset({
        name: election.name || "",
        desc1: election.desc1 || "",
        address: election.address || "",
        date: election.date || "",
      });
    }
  }, [isOpen, election, form]);

  const onSubmit = async (data: ElectionUpdateFormValues) => {
    if (!election?.id) return;

    setIsSubmitting(true);

    try {
      // Update election request payload
      const electionData = {
        ...data,
      };

      // Call the elections API service
      const updatedElection = await electionsApi.updateElection(
        election.id,
        electionData
      );

      onElectionUpdated(updatedElection);
      onClose();
    } catch (error) {
      console.error("Error updating election:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update election"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!election) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Update Election</DialogTitle>
          <DialogDescription>
            Update the details for this election
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
                    <Input placeholder="Election name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                      placeholder="Election description (optional)"
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
                    <Input placeholder="Election venue address" {...field} />
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
                {isSubmitting ? "Updating..." : "Update Election"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
