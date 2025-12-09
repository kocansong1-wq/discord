"use client";

import { useVoiceChannel } from "@/components/hooks/use-voice-channel";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";

interface VoiceParticipantsProps {
  channelId: string;
  serverId: string;
}

export const VoiceParticipants = ({ channelId, serverId }: VoiceParticipantsProps) => {
  const { getParticipants } = useVoiceChannel(serverId);
  const participants = getParticipants(channelId);

  if (participants.length === 0) return null;

  return (
    <div className="ml-6 space-y-1">
      {participants.map((participant) => (
        <div
          key={participant.odId}
          className="flex items-center gap-x-2 py-1 px-2 rounded-md hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
        >
          <div className="relative">
            <UserAvatar
              src={participant.odImageUrl}
              className="h-6 w-6"
            />
            {/* Speaking indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-[#F2F3F5] dark:border-[#2B2D31]" />
          </div>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">
            {participant.odName}
          </span>
        </div>
      ))}
    </div>
  );
};
