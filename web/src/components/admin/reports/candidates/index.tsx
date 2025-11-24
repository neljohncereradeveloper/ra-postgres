import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CandidatesReportPrint from "./print";
import { AlertCircle, Printer } from "lucide-react";
import { useEffect } from "react";
import { reportsApi } from "@/lib/api/reports";
import { useState } from "react";
import { CandidateReport } from "@/types/reports.types";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function CandidatesReport() {
  const [report, setReport] = useState<CandidateReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await reportsApi.getCandidatesReport();
        setReport(data);
        setError(null);
      } catch (err) {
        setError("Failed to load candidates data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Loading candidates data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="print:hidden">
        <h2 className="text-2xl font-bold">Candidates Report</h2>

        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Generate reports for candidates like their votes and other details.
          </p>

          <Button variant="default" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>
      <Separator className="my-4" />
      <CandidatesReportPrint report={report!} />
    </>
  );
}
