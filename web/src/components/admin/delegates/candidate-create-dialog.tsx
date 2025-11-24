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
  CreateCandidateRequest,
  CandidateCreateDialogProps,
} from "@/types/candidates.types";
import { candidatesApi } from "@/lib/api/candidates";
import { Label } from "@/components/ui/label";
import CComboboxDistrict from "@/components/shared/combobox/district.combobox";
import CComboboxPosition from "@/components/shared/combobox/position.combobox";

// Create district form schema
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

export function CandidateCreateDialog({
  isOpen,
  onClose,
  delegate,
}: CandidateCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const formCandidate = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Reset form when dialog opens or closes without recreating dependencies
  React.useEffect(() => {
    // Only reset when opening to avoid infinite loops
    if (isOpen) {
      formCandidate.reset(DEFAULT_VALUES);
    }
  }, [isOpen, formCandidate]); // Remove defaultValues from dependencies

  const onSubmit = async (data: CandidateFormValues) => {
    setIsSubmitting(true);

    try {
      // Create event request payload
      const candidateData: CreateCandidateRequest = {
        ...data,
        delegateId: delegate.id,
      };

      // Call the events API service
      await candidatesApi.createCandidate(candidateData);

      toast.success("Candidate created successfully");
      onClose();
    } catch (error) {
      console.error("Error creating candidate:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create candidate"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Register As Candidate</DialogTitle>
          <DialogDescription>
            Enter the details for the new candidate
          </DialogDescription>
        </DialogHeader>

        <Form {...formCandidate}>
          <form
            onSubmit={formCandidate.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="flex flex-col gap-2">
              <Label>Delegate Account</Label>
              <div className="flex gap-2">
                <span>{delegate?.branch}</span>
              </div>
              <div className="flex gap-2">
                <span>{delegate?.accountName}</span>
                <span>{","}</span>
                <span>{delegate?.accountId}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>DelegateId</Label>
              <Input placeholder="DelegateId" value={delegate?.id} readOnly />
            </div>

            <FormField
              control={formCandidate.control}
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
              control={formCandidate.control}
              name="district"
              render={({ fieldState }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <CComboboxDistrict
                      value={formCandidate.watch("district")}
                      onSelect={(selectedValue: string) => {
                        formCandidate.setValue("district", selectedValue);
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
              control={formCandidate.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <CComboboxPosition
                      value={formCandidate.watch("position")}
                      onSelect={(selectedValue: string) => {
                        formCandidate.setValue("position", selectedValue);
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
                {isSubmitting ? "Creating..." : "Create Candidate"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
