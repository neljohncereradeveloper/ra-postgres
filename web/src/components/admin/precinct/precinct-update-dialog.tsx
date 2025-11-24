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
import { PrecinctUpdateDialogProps } from "@/types/precinct.types";
import { precinctsApi } from "@/lib/api/precincts";

const precinctFormSchema = z.object({
  desc1: z.string(),
});

type PrecinctUpdateFormValues = z.infer<typeof precinctFormSchema>;

export function PrecinctUpdateDialog({
  precinct,
  isOpen,
  onClose,
  onPrecinctUpdated,
}: PrecinctUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PrecinctUpdateFormValues>({
    resolver: zodResolver(precinctFormSchema),
    defaultValues: {
      desc1: "",
    },
  });

  // Reset form and populate with event data when dialog opens or event changes
  React.useEffect(() => {
    if (isOpen && precinct) {
      console.log(precinct);
      form.reset({
        desc1: precinct.desc1 || "",
      });
    }
  }, [isOpen, precinct, form]);

  const onSubmit = async (data: PrecinctUpdateFormValues) => {
    if (!precinct?.id) return;

    setIsSubmitting(true);

    try {
      // Update district request payload
      const precinctData = {
        ...data,
      };

      // Call the districts API service
      const updatedPrecinct = await precinctsApi.updatePrecinct(
        precinct.id,
        precinctData
      );

      onPrecinctUpdated(updatedPrecinct);
      onClose();
    } catch (error) {
      console.error("Error updating precinct:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update precinct"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!precinct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Update Precinct</DialogTitle>
          <DialogDescription>
            Update the details for this precinct
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
                    <Input placeholder="Precinct name" {...field} />
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
                {isSubmitting ? "Updating..." : "Update Precinct"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
