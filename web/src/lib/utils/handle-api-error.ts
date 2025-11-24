import { toast } from "sonner";

export function handleApiError(
  error: unknown,
  defaultMessage = "Something went wrong."
) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }
  // toast.error(defaultMessage);
}
