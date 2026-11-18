"use client";

import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useCallback, useEffect, useState } from "react";

export function ClassroomRoom({
  roomName,
  canPublish,
}: {
  roomName: string;
  canPublish: boolean;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setToken(null);
    setUrl(null);
    setError(null);

    async function connectToRoom() {
      try {
        const response = await fetch("/api/livekit/token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName }),
          signal: controller.signal,
        });
        const result = (await response.json()) as {
          token?: string;
          url?: string;
          error?: string;
        };
        if (!response.ok || !result.token || !result.url) {
          throw new Error(result.error ?? "The classroom connection could not be created.");
        }

        setToken(result.token);
        setUrl(result.url);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error("Classroom connection failed:", requestError);
        setError(
          requestError instanceof Error
            ? requestError.message
            : "The classroom connection could not be created.",
        );
      }
    }

    void connectToRoom();
    return () => {
      controller.abort();
    };
  }, [roomName, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-semibold text-red-800">{error}</p>
        <button type="button" onClick={retry} className="mt-4 rounded-full bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800">
          Try again
        </button>
      </div>
    );
  }
  if (!token || !url) return <p className="p-6 text-center">Connecting to the classroom…</p>;

  return (
    <LiveKitRoom
      token={token}
      serverUrl={url}
      connect
      video={canPublish}
      audio={canPublish}
      options={{ adaptiveStream: true, dynacast: true }}
      className="h-dvh"
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}