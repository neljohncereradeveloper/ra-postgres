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
import { PositionUpdateDialogProps } from "@/types/position.types";
import { positionsApi } from "@/lib/api/position";

const positionFormSchema = z.object({
  desc1: z.string(),
  maxCandidates: z.coerce.number().min(1), // coerce to number
  termLimit: z.string().min(1),
});

type PositionUpdateFormValues = z.infer<typeof positionFormSchema>;

export function PositionUpdateDialog({
  position,
  isOpen,
  onClose,
  onPositionUpdated,
}: PositionUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PositionUpdateFormValues>({
    resolver: zodResolver(positionFormSchema),
    defaultValues: {
      desc1: "",
      maxCandidates: 0,
      termLimit: "",
    },
  });

  // Reset form and populate with event data when dialog opens or event changes
  React.useEffect(() => {
    if (isOpen && position) {
      console.log(position);
      form.reset({
        desc1: position.desc1 || "",
        maxCandidates: position.maxCandidates || 0,
        termLimit: position.termLimit || "",
      });
    }
  }, [isOpen, position, form]);

  const onSubmit = async (data: PositionUpdateFormValues) => {
    if (!position?.id) return;

    setIsSubmitting(true);

    try {
      // Update position request payload
      const positionData = {
        ...data,
      };

      // Call the positions API service
      const updatedPosition = await positionsApi.updatePosition(
        position.id,
        positionData
      );

      onPositionUpdated(updatedPosition);
      onClose();
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update position"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Update Position</DialogTitle>
          <DialogDescription>
            Update the details for this position
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
                    <Input placeholder="Position name" {...field} />
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
                {isSubmitting ? "Updating..." : "Update Position"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
