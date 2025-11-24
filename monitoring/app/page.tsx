"use client";

import { useState, useEffect } from "react";
import { useSocket } from "./hooks/useSocket";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  Vote,
  Users,
  MapPin,
  Activity,
  TrendingUp,
  Crown,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

interface Candidate {
  name: string;
  voteCount: number;
}

interface Position {
  position: string;
  candidates: Candidate[];
}

export default function ElectionMonitoring() {
  const { isConnected, latestCastVotes, castVotesError, getLatestCastVotes } =
    useSocket();
  const [loading, setLoading] = useState(false);

  // Fetch on mount and when connected
  useEffect(() => {
    if (isConnected) {
      setLoading(true);
      getLatestCastVotes();
    }
  }, [isConnected, getLatestCastVotes]);

  // Stop loading when data arrives
  useEffect(() => {
    if (latestCastVotes) setLoading(false);
  }, [latestCastVotes]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "ongoing":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const calculatePercentage = (voteCount: number, totalVotes: number) => {
    return totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
  };

  const getTotalVotes = (candidates: Candidate[]) => {
    return candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
  };

  const getLeadingCandidate = (candidates: Candidate[]) => {
    return candidates.reduce((prev, current) =>
      prev.voteCount > current.voteCount ? prev : current
    );
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 overflow-hidden">
      <div className="h-full max-w-full mx-auto flex flex-col space-y-4">
        {/* Header with Election Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Election Monitor
              </h1>
              <p className="text-sm text-slate-600">
                Real-time vote tracking dashboard
              </p>
            </div>

            {/* Election Info Inline */}
            {latestCastVotes?.election && (
              <div className="ml-8 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Vote className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-900">
                    {latestCastVotes.election.name}
                  </span>
                </div>
                <Badge
                  className={`${getStatusColor(
                    latestCastVotes.election.status
                  )} text-white`}
                >
                  {latestCastVotes.election.status}
                </Badge>
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {latestCastVotes.election.address}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border">
              {isConnected ? (
                <>
                  <Wifi className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Connected
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                </>
              ) : (
                <>
                  <WifiOff className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-700">
                    Disconnected
                  </span>
                </>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              onClick={() => {
                setLoading(true);
                getLatestCastVotes();
              }}
              disabled={!isConnected || loading}
              size="default"
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {castVotesError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-3">
              <div className="flex items-center gap-2 text-red-700">
                <Activity className="h-5 w-5" />
                <span className="font-medium text-base">
                  Error: {castVotesError}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center gap-3 text-slate-600">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span className="text-base">Loading latest results...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Positions Grid - 3 per row, 2 rows */}
        {latestCastVotes?.data && (
          <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 min-h-0">
            {latestCastVotes.data.map((position: Position) => {
              const totalVotes = getTotalVotes(position.candidates);
              const leadingCandidate = getLeadingCandidate(position.candidates);

              return (
                <Card key={position.position} className="flex flex-col">
                  <CardHeader className="bg-slate-50 border-b pb-3">
                    <div className="space-y-2">
                      <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                        <Users className="h-5 w-5 text-slate-600" />
                        <span className="leading-tight">
                          {position.position}
                        </span>
                      </CardTitle>
                      <div className="flex items-center gap-2 text-slate-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {totalVotes.toLocaleString()} total votes
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-4">
                    <div className="space-y-3">
                      {position.candidates
                        .sort((a, b) => b.voteCount - a.voteCount)
                        .map((candidate, index) => {
                          const percentage = calculatePercentage(
                            candidate.voteCount,
                            totalVotes
                          );
                          const isLeading =
                            candidate.name === leadingCandidate.name &&
                            totalVotes > 0;

                          return (
                            <div key={candidate.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0">
                                  {isLeading && (
                                    <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                  )}
                                  <span
                                    className={`text-sm font-medium truncate ${
                                      isLeading
                                        ? "text-yellow-700"
                                        : "text-slate-700"
                                    }`}
                                    title={candidate.name}
                                  >
                                    {candidate.name}
                                  </span>
                                  {index === 0 && totalVotes > 0 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs px-2 py-1 flex-shrink-0"
                                    >
                                      Leading
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-500 font-medium">
                                  {percentage.toFixed(1)}%
                                </span>
                                <span className="font-bold text-lg font-mono text-slate-900">
                                  {candidate.voteCount.toLocaleString()}
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* No Data State */}
        {!loading && !latestCastVotes && !castVotesError && (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="pt-8 pb-8">
                <div className="text-center space-y-3">
                  <Vote className="h-12 w-12 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-medium text-slate-600">
                    No election data available
                  </h3>
                  <p className="text-base text-slate-500">
                    Connect to start monitoring live results
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
