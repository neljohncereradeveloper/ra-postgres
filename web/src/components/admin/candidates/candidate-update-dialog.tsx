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
import { CandidateUpdateDialogProps } from "@/types/candidates.types";
import { candidatesApi } from "@/lib/api/candidates";
import CComboboxDistrict from "@/components/shared/combobox/district.combobox";
import CComboboxPosition from "@/components/shared/combobox/position.combobox";

const candidateFormSchema = z.object({
  position: z.string(),
  district: z.string(),
  displayName: z.string(),
});
type CandidateFormValues = z.infer<typeof candidateFormSchema>;

// Move defaultValues outside the component to prevent recreation on each render
const DEFAULT_VALUES: CandidateFormValues = {
  position: "",
  district: "",
  displayName: "",
};

export function CandidateUpdateDialog({
  candidate,
  isOpen,
  onClose,
  onCandidateUpdated,
}: CandidateUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form and populate with event data when dialog opens or event changes
  React.useEffect(() => {
    if (isOpen && candidate) {
      console.log(candidate);
      form.reset({
        position: candidate.position || "",
        district: candidate.district || "",
        displayName: candidate.displayName || "",
      });
    }
  }, [isOpen, candidate, form]);

  const onSubmit = async (data: CandidateFormValues) => {
    if (!candidate?.id) return;

    setIsSubmitting(true);

    try {
      // Update candidate request payload
      const candidateData = {
        ...data,
        delegateId: candidate.delegateId!,
      };

      // Call the candidates API service
      const updatedCandidate = await candidatesApi.updateCandidate(
        candidate.id,
        candidateData
      );

      onCandidateUpdated(updatedCandidate);
      onClose();
    } catch (error) {
      console.error("Error updating candidate:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update candidate"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Update Candidate</DialogTitle>
          <DialogDescription>
            Update the details for this candidate
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Candidate Display Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ fieldState }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <CComboboxDistrict
                      value={form.watch("district")}
                      onSelect={(selectedValue: string) => {
                        form.setValue("district", selectedValue);
                      }}
                    />
                  </FormControl>
                  {fieldState.error && (
                    <FormMessage>{fieldState.error.message}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CComboboxPosition
                      value={form.watch("position")}
                      onSelect={(selectedValue: string) => {
                        form.setValue("position", selectedValue);
                      }}
                    />
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
                {isSubmitting ? "Updating..." : "Update Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
