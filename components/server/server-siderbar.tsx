import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChannelType, MemberRole } from "@/lib/generated/prisma/client";
import { ServerHeader } from "./server-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Mic, ShieldAlert, ShieldCheck, Video } from "lucide-react";
import { ServerSection } from "./server-section";
import { ServerChannel } from "./server-channel";
import { ServerVoiceInit } from "./server-voice-init";
interface ServerSidebarProps {
    serverId: string;
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

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
    const profile = await currentProfile();
    if (!profile) {
        return redirect("/"); // or handle the case where the profile is not found
    }
    const server = await db.server.findUnique({
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
    });
    const textChannels = server?.channels.filter((channel) => channel.type === ChannelType.TEXT);
    const audioChannels = server?.channels.filter((channel) => channel.type === ChannelType.AUDIO);
    const videoChannels = server?.channels.filter((channel) => channel.type === ChannelType.VIDEO);

    if (!server) {
        return redirect("/");
    }

    const role = server.members.find((member) => member.profileId === profile.id)?.role;

    return (
        <div className="h-full text-primary w-full dark:bg-[#2B2D31] bg-[#F2F3F5]">
            <ServerVoiceInit serverId={serverId} />
            <ServerHeader server={server} role={role} />
            <ScrollArea className="flex-1 px-3 mt-3">
                {!!textChannels?.length && (
                    <div className="mb-2">
                        <ServerSection sectionType="channels" channelType={ChannelType.TEXT} role={role} label="Text Channels" />
                        <div className="space-y-[2px] " >
                            {textChannels.map((channel) => (
                                <ServerChannel key={channel.id} channel={channel} role={role} server={server} />
                            ))}
                        </div>
                    </div>
                )}
                {!!audioChannels?.length && (
                    <div className="mb-2">
                        <ServerSection sectionType="channels" channelType={ChannelType.AUDIO} role={role} label="Voice Channels" />
                        <div className="space-y-[2px] " >
                            {audioChannels.map((channel) => (
                                <ServerChannel key={channel.id} channel={channel} role={role} server={server} />
                            ))}
                        </div>
                    </div>
                )}
                {!!videoChannels?.length && (
                    <div className="mb-2">
                        <ServerSection sectionType="channels" channelType={ChannelType.VIDEO} role={role} label="Video Channels" />
                        <div className="space-y-[2px] " >
                            {videoChannels.map((channel) => (
                                <ServerChannel key={channel.id} channel={channel} role={role} server={server} />
                            ))}
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}