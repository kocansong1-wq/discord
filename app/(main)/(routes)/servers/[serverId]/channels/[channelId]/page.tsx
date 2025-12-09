import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { ChatHeader } from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import { ChannelType } from "@/lib/generated/prisma";
import MediaRoom from "@/components/media-room";
import { RedirectToSignIn } from "@clerk/nextjs";
interface ChannelIdPageProps {
  params: {
    serverId: string;
    channelId: string;
  };
}

export default async function ChannelIdPage(props: ChannelIdPageProps) {
  const { channelId, serverId } = await props.params; 
  const profile = await currentProfile();

  if (!profile) return <RedirectToSignIn />

  const channel = await db.channel.findUnique({
    where: { id: channelId }
  });

  const member = await db.member.findFirst({
    where: { serverId: serverId, profileId: profile.id }
  });

  if (!channel || !member) return redirect("/");

  const isVoiceChannel = channel.type === ChannelType.AUDIO || channel.type === ChannelType.VIDEO;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <>
          <ChatMessages
            member={member}
            name={channel.name}
            chatId={channel.id}
            type="channel"
            apiUrl="/api/messages"
            socketUrl="/api/socket/messages"
            socketQuery={{
              channelId: channel.id,
              serverId: channel.serverId
            }}
            paramKey="channelId"
            paramValue={channel.id}
          />
          <ChatInput
            name={channel.name}
            type="channel"
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId: channel.serverId
            }}
          />
        </>
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom 
          chatId={channel.id} 
          video={false} 
          audio={true}
          profileId={profile.id}
          profileName={profile.name}
          profileImageUrl={profile.imageUrl}
        />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom 
          chatId={channel.id} 
          video={true} 
          audio={true}
          profileId={profile.id}
          profileName={profile.name}
          profileImageUrl={profile.imageUrl}
        />
      )}
    </div>
  );
}