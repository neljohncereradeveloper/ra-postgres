"use client";

import * as React from "react";
import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { castVoteReprintApi } from "@/lib/api/cast-vote-reprint";
import { toast } from "sonner";
import type { CastVoteReprint } from "@/types/cast-vote-reprint.types";
import { CastVoteReprintLoading } from "./ui/cast-vote-reprint-loading";
import { ReprintBallotHalfLetter } from "./reprint-ballot-half-letter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileText, KeyRound, Printer } from "lucide-react";

const verificationSchema = z.object({
  controlNumber: z.string().min(1, "Control number is required"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export function ReprintCastVote() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showBallot, setShowBallot] = React.useState(false);
  const [castVoteReprint, setCastVoteReprint] =
    React.useState<CastVoteReprint | null>(null);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      controlNumber: "",
    },
  });

  const fetchCastVoteReprint = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await castVoteReprintApi.getCastVoteReprint({
        controlNumber: form.getValues("controlNumber"),
      });
      if (response) {
        setCastVoteReprint(response);
        setShowBallot(true);
        toast.success("Vote record found successfully");
      }
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const onSubmit = (data: VerificationFormValues) => {
    fetchCastVoteReprint();
  };

  const handleExit = () => {
    setShowBallot(false);
    setCastVoteReprint(null);
    form.reset();
  };

  if (loading) {
    return <CastVoteReprintLoading />;
  }

  if (showBallot && castVoteReprint) {
    return (
      <ReprintBallotHalfLetter castVote={castVoteReprint} onExit={handleExit} />
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Card className="rounded-xl shadow-lg overflow-hidden border-0">
        <CardHeader className="bg-gradient-to-r text-green-800 py-6 border-b">
          <div className="flex items-center gap-3 mb-2">
            <Printer className="h-8 w-8" />
            <CardTitle className="text-2xl font-bold">
              Reprint Cast Vote
            </CardTitle>
          </div>
          <CardDescription className="text-green-700 text-base">
            Enter your control number below to retrieve and reprint your cast
            vote record
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6">
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
            <div className="flex gap-3 items-start">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800">
                  Important Information
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  You&apos;ll need the unique control number that was provided
                  to you when you originally cast your vote. This ensures only
                  you can access your vote record.
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
                      />
                    </FormControl>
                    <FormDescription className="text-sm text-gray-500">
                      This is the unique identifier assigned to your cast vote
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-300 bg-red-50"
                >
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <AlertTitle className="text-red-800">Error</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-base font-medium bg-green-600 hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                <Printer className="mr-2 h-5 w-5" />
                Retrieve and Reprint
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="bg-gray-50 px-6 py-4 text-sm text-gray-500 border-t">
          If you&apos;re having trouble retrieving your vote, please contact
          support for assistance.
        </CardFooter>
      </Card>
    </div>
  );
}
