"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/components/providers/socket-provider";

interface VoiceParticipant {
  odId: string;
  odName: string;
  odImageUrl: string;
  odChannelId: string;
}

interface VoiceChannelStore {
  [channelId: string]: VoiceParticipant[];
}

export const useVoiceChannel = (serverId?: string) => {
  const { socket } = useSocket();
  const [voiceChannels, setVoiceChannels] = useState<VoiceChannelStore>({});

  useEffect(() => {
    if (!socket || !serverId) return;

    // Join server room to receive voice updates
    socket.emit("voice:join-server", serverId);

    // Listen for voice channel updates
    socket.on(`voice:${serverId}:update`, (data: VoiceChannelStore) => {
      setVoiceChannels(data);
    });

    // Listen for participant join
    socket.on(`voice:${serverId}:participant-join`, ({ channelId, participant }: { channelId: string; participant: VoiceParticipant }) => {
      setVoiceChannels((prev) => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), participant],
      }));
    });

    // Listen for participant leave
    socket.on(`voice:${serverId}:participant-leave`, ({ channelId, odId }: { channelId: string; odId: string }) => {
      setVoiceChannels((prev) => ({
        ...prev,
        [channelId]: (prev[channelId] || []).filter((p) => p.odId !== odId),
      }));
    });

    return () => {
      socket.emit("voice:leave-server", serverId);
      socket.off(`voice:${serverId}:update`);
      socket.off(`voice:${serverId}:participant-join`);
      socket.off(`voice:${serverId}:participant-leave`);
    };
  }, [socket, serverId]);

  const joinVoiceChannel = (channelId: string, profile: { id: string; name: string; imageUrl: string }) => {
    if (!socket || !serverId) return;
    
    socket.emit("voice:join-channel", {
      serverId,
      channelId,
      participant: {
        odId: profile.id,
        odName: profile.name,
        odImageUrl: profile.imageUrl,
        odChannelId: channelId,
      },
    });
  };

  const leaveVoiceChannel = (channelId: string, profileId: string) => {
    if (!socket || !serverId) return;
    
    socket.emit("voice:leave-channel", {
      serverId,
      channelId,
      odId: profileId,
    });
  };

  const getParticipants = (channelId: string) => {
    return voiceChannels[channelId] || [];
  };

  return {
    voiceChannels,
    joinVoiceChannel,
    leaveVoiceChannel,
    getParticipants,
  };
};
