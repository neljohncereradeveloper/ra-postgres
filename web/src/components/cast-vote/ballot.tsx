"use client";

import * as React from "react";
import type { BallotProps } from "@/types/cast-vote.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Printer, LogOut, AlertTriangle, Scissors } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import QRCode from "react-qr-code";

export const Ballot: React.FC<BallotProps> = ({
  selections,
  candidates,
  castVote,
  onExit,
}) => {
  const [exitDialogOpen, setExitDialogOpen] = React.useState(false);
  const ballotRef = React.useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const hasSelections = Object.values(selections).some(
    (selectionArray) => selectionArray.length > 0
  );

  return (
    <div className="flex justify-center items-center bg-gray-100 print:bg-white ballot-print-top p-2">
      <style>{`
        @media print {
          @page {
            size: 4.25in 11in;
            margin: 0;
          }
          html, body {
            width: 4.25in;
            height: 11in;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            min-width: 0 !important;
            min-height: 0 !important;
          }
          .ballot-print-top, .ballot-print-card {
            width: 4.25in !important;
            max-width: 4.25in !important;
            margin: 0 !important;
            padding: 0.2rem !important;
            box-sizing: border-box !important;
          }
          .print-hide {
            display: none !important;
          }
          .dashed-border {
            border: 1px dashed #888 !important;
            padding: 0.25rem !important;
          }
          .scissors-icon {
            position: absolute;
            top: -10px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 0 5px;
            z-index: 10;
          }
          .qr-code svg {
            width: 100% !important;
            height: auto !important;
            max-width: 80px !important;
            max-height: 80px !important;
          }
        }
      `}</style>
      <Card
        ref={ballotRef}
        className="ballot-print-card w-full max-w-[4.25in] shadow-lg print:shadow-none print:max-w-[4.25in] print:rounded-none print:m-0 print:p-0 bg-white border border-gray-300 print:border-0 relative dashed-border"
      >
        <div
          className="absolute top-50 flex items-center justify-center pointer-events-none select-none z-0"
          aria-hidden="true"
          style={{
            opacity: 0.06,
            fontSize: "3rem",
            fontWeight: 900,
            color: "#222",
            transform: "rotate(-25deg)",
            letterSpacing: "0.2em",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          AGDAO COOP
        </div>
        <div className="scissors-icon print:block hidden">
          <Scissors className="h-4 w-4 text-gray-400" />
        </div>
        <CardHeader className="bg-gradient-to-b from-gray-50 to-white print:bg-white p-3 pb-2 border-b border-gray-200 print:border-b print:border-gray-300 text-center">
          <div className="flex justify-center mb-1">
            <Image
              src="/logo.png"
              alt="AGDAO COOP Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="font-bold text-sm tracking-wide text-black">
            AGDAO MULTIPURPOSE COOPERATIVE
          </h1>
          <div className="text-xs text-black space-y-0.5 text-center flex flex-col items-center">
            <p>AMPC Head Office Bldg., N. Torres & P. Urduja Sts.</p>
            <p>Paciano Bangoy, Davao City 8000</p>
            <div className="flex items-center justify-center gap-2">
              <span>Tel: (082) 285-3797</span>
            </div>
          </div>

          <h2 className="text-xs text-black font-bold tracking-wide uppercase mt-2 mb-2">
            --- Vote Receipt ---
          </h2>

          <div className="flex flex-col gap-2 justify-center text-xs text-black">
            <h2 className="font-semibold tracking-wide ">
              {castVote.election.name}
            </h2>
            <h2 className="tracking-wide ">{castVote.election.address}</h2>
            <div>
              {castVote.election?.date && (
                <div>
                  {new Date(castVote.election.date).toLocaleDateString(
                    undefined,
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </div>
              )}
            </div>
            <h2 className="tracking-wide text-wrap">{castVote.precinct}</h2>
            <div>
              <Badge variant="outline" className="py-0">
                Ballot ID : {castVote.ballotId}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-white print:bg-white overflow-auto">
          {!hasSelections && (
            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2 print-hide">
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
              <p className="text-amber-700 text-xs">
                No selections have been made on this ballot.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 items-center">
            {candidates.map((group) => {
              const selectedIds = selections[group.position] || [];
              const selectedCandidates = group.candidates.filter((c) =>
                selectedIds.includes(c.candidateId)
              );
              return (
                <div key={group.position}>
                  <h2 className="text-xs font-semibold border-b border-gray-400 pb-1 tracking-wide text-black">
                    {group.position}
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      {selectedCandidates.length > 0
                        ? `( ${selectedCandidates.length} SELECTED ) `
                        : "( 0 SELECTED )"}
                    </span>
                  </h2>
                  <ul className="list-disc text-xs py-1 flex flex-col gap-1 items-center">
                    {selectedCandidates.length > 0 ? (
                      selectedCandidates.map((candidate) => (
                        <li
                          key={candidate.candidateId}
                          className="font-medium text-black"
                        >
                          {candidate.displayName}
                        </li>
                      ))
                    ) : (
                      <li className="italic text-black">None selected</li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-300 mt-5 mb-5" />

          {castVote.ballotId && (
            <div className="flex flex-col items-center justify-center my-2 qr-code">
              <QRCode
                value={castVote.ballotId}
                size={80}
                level="M"
                className="h-20 w-20"
              />
              <div className="text-[10px] text-black mt-1">
                Scan to verify ballot
              </div>
            </div>
          )}

          <div className="text-center mt-2">
            <div className="text-xs font-semibold mb-1">
              <em>Thank you for voting!</em>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 print:hidden bg-gray-50 p-2 border-t border-gray-200">
          <Button
            onClick={handlePrint}
            size="sm"
            className="text-xs px-2 h-7 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Printer className="mr-1 h-3 w-3" />
            Print
          </Button>

          {onExit && (
            <Button
              onClick={() => setExitDialogOpen(true)}
              variant="ghost"
              size="sm"
              className="text-xs px-2 h-7 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-1 h-3 w-3" />
              Exit
            </Button>
          )}
        </CardFooter>
      </Card>

      <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit voting session?</AlertDialogTitle>
            <AlertDialogDescription>
              Make sure you&apos;ve printed before exiting.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onExit}
              className="bg-red-500 hover:bg-red-600"
            >
              Yes, exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
