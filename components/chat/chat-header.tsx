import { Hash, Menu, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { MobileToggle } from "@/components/mobile-toggle/mobile-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SocketIndicator } from "@/components/socket-indicator";
import { ChatVideoButton } from "./chat-video-button";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@/lib/generated/prisma/client";
import { ServerSearch } from "@/components/server/server-search";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { ModeToggle } from "@/components/mode-toggle";
interface ChatHeaderProps {
    serverId?: string,
    name: string,
    type: "channel" | "conversation";
    imgUrl?: string,
}

const iconMap = {
    [ChannelType.TEXT]: <Hash className="mr-2 h-4 w-4" />,
    [ChannelType.AUDIO]: <Mic className="mr-2 h-4 w-4" />,
    [ChannelType.VIDEO]: <Video className="mr-2 h-4 w-4" />

}

const roleIconMap = {
    [MemberRole.GUEST]: null,
    [MemberRole.MODERATOR]: <ShieldCheck className="mr-2 h-4 w-4 text-indigo-500 " />,
    [MemberRole.ADMIN]: <ShieldAlert className="mr-2 h-4 w-4 text-rose-500 " />
}

export const ChatHeader = async ({ serverId, name, type, imgUrl }: ChatHeaderProps) => {
    const profile = await currentProfile();
    if (!profile) {
        return redirect("/"); 
    }
    
    // Only fetch server data if serverId is provided
    const server = serverId ? await db.server.findUnique({
        where: {
            id: serverId,
        },
        include: {
            channels: {
                orderBy: {
                    createdAt: "asc",
                }
            },
            members: {
                include: {
                    profile: true,
                },
                orderBy: {
                    role: "asc",
                }
            },
        }
    }) : null;
    
    const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT);
    const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO);
    const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO);
    const members = server?.members.filter((member) => member.profileId !== profile.id);
    return (
        <div className="text-md font-semibold px-2 flex items-center h-12 border-neutral-200 dark:border-neutral-800 border-b-2">
            {serverId && <MobileToggle serverId={serverId} />}
            {type === "channel" && (
                <Hash className="w-5 h-5 text-zinc-500 dark:text-zinc-500 mr-2 " />
            )}
            {type === "conversation" && (
                <UserAvatar src={imgUrl} className="h-8 w-8 md:h-8 mr-2" />
            )}

            <p className="font-semibold text-md text-black dark:text-white">{name}</p>
            <div className="ml-auto mr-62 flex items-center">
                {type === "conversation" && (
                    <ChatVideoButton />
                )}
                <ModeToggle />
                <SocketIndicator />

                {server && (
                    <div className="w-53 absolute right-4">
                        <ServerSearch data={[{
                            label: "Text Channels",
                            type: "channel",
                            data:
                                textChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type],
                                })),

                        },
                        {
                            label: "Voice Channels",
                            type: "channel",
                            data:
                                audioChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type],
                                }))
                        },
                        {
                            label: "Video Channels",
                            type: "channel",
                            data:
                                videoChannels?.map((channel) => ({
                                    id: channel.id,
                                    name: channel.name,
                                    icon: iconMap[channel.type],
                                }))
                        }, {
                            label: "Members",
                            type: "member",
                            data:
                                members?.map((members) => ({
                                    id: members.id,
                                    name: profile.name,
                                    icon: roleIconMap[members.role],
                                }))
                        }

                        ]}
                        />
                    </div>
                )}

            </div>
        </div>
    )
}