"use client"

import { Channel, ChannelType, MemberRole, Server } from "@/lib/generated/prisma"
import { cn } from "@/lib/utils"
import { Edit, Hash, Lock, Mic, Trash, UserPlus, Video } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { ActionTooltip } from "../ui/action-tooltip"
import { ModalType, useModal } from "../hooks/user-model-store"
import { useVoice } from "../providers/voice-provider"
import { UserAvatar } from "../ui/user-avatar"

interface ServerChannelProps {
    channel: Channel,
    server: Server,
    role?: MemberRole
}

const iconMap = {
    [ChannelType.TEXT]: Hash,
    [ChannelType.AUDIO]: Mic,
    [ChannelType.VIDEO]: Video,
}

export const ServerChannel = ({ channel, server, role }: ServerChannelProps) => {
    const params = useParams();
    const router = useRouter();
    const { onOpen } = useModal();
    const { getParticipants } = useVoice();

    const Icon = iconMap[channel.type];
    const isVoiceChannel = channel.type === ChannelType.AUDIO || channel.type === ChannelType.VIDEO;
    const participants = isVoiceChannel ? getParticipants(channel.id) : [];

    const onClick = () => {
        router.push(`/servers/${params?.serverId}/channels/${channel.id}`);
    }

    const onAction = (e: React.MouseEvent, action: ModalType) => {
        e.stopPropagation();
        onOpen(action, { channel, server })
    }

    return (
        <div className="mb-1">
            <button onClick={onClick} className={cn("group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition",
                params?.channelId === channel.id && "bg-zinc-700/20 dark:bg-zinc-700"
            )}>
                <Icon className="flex-shrink-0 w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                <p className={cn("line-clamp-1 font-semibold text-sm text-zinc-500 group-hover:text-zinc-600 dark:text-zinc-400 dark:group-hover:text-zinc-300 transition",
                    params?.channelId === channel.id && "text-primary dark:text-zinc-200 dark:group-hover:text-white"
                )}>{channel.name}</p>
                {channel.name !== "general" && role !== MemberRole.GUEST && (
                    <div className="ml-auto flex items-center gap-x-2">
                        <ActionTooltip label="Delete">
                            <Trash onClick={(e) => onAction(e, "deleteChannel")} className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
                        </ActionTooltip>
                        <ActionTooltip label="Edit">
                            <Edit onClick={(e)=> onAction(e, "editChannel")} className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
                        </ActionTooltip>
                        <ActionTooltip label="Invite">
                            <UserPlus onClick={(e) => onAction(e, "invite")} className="hidden group-hover:block w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300 transition" />
                        </ActionTooltip>
                    </div>
                )}
                {channel.name === "general" && (
                    <Lock className="ml-auto w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                )}
            </button>
            
            {/* Voice channel participants */}
            {isVoiceChannel && participants.length > 0 && (
                <div className="ml-7 mt-0.5 space-y-0.5">
                    {participants.map((participant) => (
                        <div
                            key={participant.odId}
                            className="flex items-center gap-x-2 py-0.5 px-1 rounded hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 cursor-pointer"
                        >
                            <div className="relative flex-shrink-0">
                                <UserAvatar
                                    src={participant.odImageUrl}
                                    className="!h-5 !w-5 !md:h-5 !md:w-5"
                                    fallback={participant.odName}
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500 border border-[#2B2D31]" />
                            </div>
                            <span className="text-[11px] text-zinc-400 truncate">
                                {participant.odName}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}