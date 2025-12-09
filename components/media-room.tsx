"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useSocket } from "@/components/providers/socket-provider";
import { useParams } from "next/navigation";

interface MediaRoomProps {
  chatId: string;
  video: boolean;
  audio: boolean;
  profileId?: string;
  profileName?: string;
  profileImageUrl?: string;
}

const MediaRoom = ({ 
  chatId, 
  video, 
  audio,
  profileId,
  profileName,
  profileImageUrl,
}: MediaRoomProps) => {
  const { user } = useUser();
  const { socket } = useSocket();
  const params = useParams();
  const [token, setToken] = useState("");
  const serverId = params?.serverId as string;

  useEffect(() => {
    if (!user?.firstName || !user?.lastName) return;
    const name = `${user.firstName} ${user.lastName}`;

    (async () => {
      try {
        const resp = await fetch(`/api/token?room=${chatId}&username=${name}`);
        const data = await resp.json();
        setToken(data.token);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [user?.firstName, user?.lastName, chatId]);

  // Emit voice channel join/leave events
  useEffect(() => {
    if (!socket || !serverId || !profileId || !token) return;

    const participant = {
      odId: profileId,
      odName: profileName || `${user?.firstName} ${user?.lastName}`,
      odImageUrl: profileImageUrl || user?.imageUrl || "",
      odChannelId: chatId,
    };

    socket.emit("voice:join-channel", {
      serverId,
      channelId: chatId,
      participant,
    });

    return () => {
      socket.emit("voice:leave-channel", {
        serverId,
        channelId: chatId,
        odId: profileId,
      });
    };
  }, [socket, serverId, chatId, profileId, profileName, profileImageUrl, token, user]);

  if (token === "") {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={video}
      audio={audio}
    >
      <VideoConference />
    </LiveKitRoom>
  );
};

export default MediaRoom;
