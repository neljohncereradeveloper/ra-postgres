import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

// You can move this to an env variable or config
const WS_URL =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_URL || "ws://localhost:3090/ws"
    : "";

export interface UseSocketOptions {
  autoConnect?: boolean;
}

export function useSocket<T = any>(options?: UseSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastPong, setLastPong] = useState<T | null>(null);
  const [latestCastVotes, setLatestCastVotes] = useState<any | null>(null);
  const [castVotesError, setCastVotesError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!WS_URL) return;
    const socket = io(WS_URL, {
      path: "/ws/socket.io",
      transports: ["websocket"],
      autoConnect: options?.autoConnect ?? true,
      // withCredentials: true,
    });
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onPong = (data: T) => setLastPong(data);
    const onLatestCastVotes = (data: any) => {
      setLatestCastVotes(data);
    };
    const onCastVotesError = (err: any) =>
      setCastVotesError(err?.message || "Unknown error");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("pong", onPong);
    socket.on("latest-cast-votes", onLatestCastVotes);
    socket.on("latest-cast-votes-error", onCastVotesError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("pong", onPong);
      socket.off("latest-cast-votes", onLatestCastVotes);
      socket.off("latest-cast-votes-error", onCastVotesError);
      socket.disconnect();
    };
  }, [options?.autoConnect]);

  const sendPing = useCallback((payload?: any) => {
    socketRef.current?.emit("ping", payload);
  }, []);

  // NEW: Request latest cast-votes
  const getLatestCastVotes = useCallback(() => {
    socketRef.current?.emit("get-latest-cast-votes");
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    lastPong,
    sendPing,
    latestCastVotes,
    castVotesError,
    getLatestCastVotes,
  };
}
