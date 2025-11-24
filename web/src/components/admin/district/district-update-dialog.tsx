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
import { DistrictUpdateDialogProps } from "@/types/district.types";
import { districtsApi } from "@/lib/api/district";

const districtFormSchema = z.object({
  desc1: z.string(),
});

type DistrictUpdateFormValues = z.infer<typeof districtFormSchema>;

export function DistrictUpdateDialog({
  district,
  isOpen,
  onClose,
  onDistrictUpdated,
}: DistrictUpdateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<DistrictUpdateFormValues>({
    resolver: zodResolver(districtFormSchema),
    defaultValues: {
      desc1: "",
    },
  });

  // Reset form and populate with event data when dialog opens or event changes
  React.useEffect(() => {
    if (isOpen && district) {
      console.log(district);
      form.reset({
        desc1: district.desc1 || "",
      });
    }
  }, [isOpen, district, form]);

  const onSubmit = async (data: DistrictUpdateFormValues) => {
    if (!district?.id) return;

    setIsSubmitting(true);

    try {
      // Update district request payload
      const districtData = {
        ...data,
      };

      // Call the districts API service
      const updatedDistrict = await districtsApi.updateDistrict(
        district.id,
        districtData
      );

      onDistrictUpdated(updatedDistrict);
      onClose();
    } catch (error) {
      console.error("Error updating district:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update district"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!district) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Update District</DialogTitle>
          <DialogDescription>
            Update the details for this district
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
                    <Input placeholder="District name" {...field} />
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
                {isSubmitting ? "Updating..." : "Update District"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
