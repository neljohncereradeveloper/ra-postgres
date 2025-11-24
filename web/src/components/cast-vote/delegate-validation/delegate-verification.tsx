"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { delegatesApi } from "@/lib/api/delegates";
import type { Delegate } from "@/types/delegates.types";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  UserCheck,
  KeyRound,
  Building,
  MapPin,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// Form schema
const verificationSchema = z.object({
  controlNumber: z.string().min(1, "Control number is required"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

interface DelegateVerificationProps {
  onVerified: (delegate: Delegate) => void;
}

export function DelegateVerification({
  onVerified,
}: DelegateVerificationProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [delegate, setDelegate] = React.useState<Delegate | null>(null);
  const [confirming, setConfirming] = React.useState(false);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      controlNumber: "",
    },
  });

  const onSubmit = async (data: VerificationFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const controlNumber = Number.parseInt(data.controlNumber, 10);
      if (isNaN(controlNumber)) {
        throw new Error("Invalid control number format");
      }

      const fetchedDelegate = await delegatesApi.getDelegateWithControlNumber(
        controlNumber
      );

      if (fetchedDelegate.hasVoted) {
        setError("You have already voted. You cannot cast another vote.");
        toast.error("You have already voted. You cannot cast another vote.");
        return;
      }
      setDelegate(fetchedDelegate);
      toast.success("Delegate verified successfully");
    } catch (error) {
      setError(
        "Failed to verify delegate. Please check your control number and try again."
      );
      toast.error("Delegate verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (delegate) {
      setConfirming(true);
      setTimeout(() => {
        onVerified(delegate);
      }, 1000);
    }
  };

  if (delegate) {
    return (
      <Card className="rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden border-0">
        <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white py-6">
          <div className="flex items-center gap-3 mb-2">
            <UserCheck className="h-8 w-8" />
            <CardTitle className="text-2xl font-bold">
              Verify Your Information
            </CardTitle>
          </div>
          <CardDescription className="text-green-100 text-base">
            Please confirm that this is your information before proceeding to
            vote
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Delegate Information
            </h3>
            <Separator className="mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium">Account Name</span>
                </div>
                <p className="text-lg font-semibold pl-6">
                  {delegate.accountName}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Building className="h-4 w-4" />
                  <span className="text-sm font-medium">Branch</span>
                </div>
                <p className="text-lg font-semibold pl-6">{delegate.branch}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <KeyRound className="h-4 w-4" />
                  <span className="text-sm font-medium">Account ID</span>
                </div>
                <p className="text-lg font-semibold pl-6">
                  {delegate.accountId}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <p className="text-lg font-semibold pl-6">{delegate.address}</p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t p-6 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setDelegate(null)}
            className="text-base px-8 h-12 w-full sm:w-auto"
          >
            Back to Verification
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleConfirm}
            disabled={confirming}
            className="text-base px-8 h-12 bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto transition-colors"
          >
            {confirming ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Proceeding...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Confirm & Continue to Vote
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-lg max-w-4xl mx-auto overflow-hidden border-0">
      <CardHeader className="bg-gradient-to-r  text-green-800 py-6 border-b">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8" />
          <CardTitle className="text-2xl font-bold">
            Delegate Verification
          </CardTitle>
        </div>
        <CardDescription className="text-green-700 text-base">
          Enter your control number to verify your identity and proceed to
          voting
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
          <div className="flex gap-3 items-start">
            <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800">
                Verification Required
              </h3>
              <p className="text-green-700 text-sm mt-1">
                Please enter the control number that was assigned to you. This
                verifies your eligibility to participate in the voting process.
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="controlNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Control Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your control number"
                      className="h-12 text-base rounded-md"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-500">
                    This is the unique control number assigned to you for voting
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <Alert variant="destructive" className="border-red-300 bg-red-50">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertTitle className="text-red-800">
                  Verification Failed
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full text-base h-12 bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Verify & Continue
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="bg-gray-50 px-8 py-4 text-sm text-gray-500 border-t">
        If you&apos;re having trouble with verification, please contact the
        election administrator for assistance.
      </CardFooter>
    </Card>
  );
}
