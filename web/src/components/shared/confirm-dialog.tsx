import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useFormStatus } from "react-dom";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: (formData: FormData) => void | Promise<void>;
  onCancel?: () => void;
  "aria-label"?: string;
}

function ConfirmButton({ confirmLabel }: { confirmLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <AlertDialogAction type="submit" disabled={pending} className="bg-primary">
      {pending ? "Processing..." : confirmLabel}
    </AlertDialogAction>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  "aria-label": ariaLabel,
}: ConfirmDialogProps) {
  // Initialize useForm (no fields needed)
  const form = useForm();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form action={onConfirm}>
            <AlertDialogFooter>
              <AlertDialogCancel
                aria-label={ariaLabel ? `${ariaLabel} cancel` : undefined}
                onClick={onCancel}
              >
                {cancelLabel}
              </AlertDialogCancel>
              <ConfirmButton confirmLabel={confirmLabel} />
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
