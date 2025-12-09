import { redirect } from "next/navigation";
import { currentProfile } from "@/lib/current-profile";
import { RedirectToSignIn } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { getOrCreateGlobalConversation } from "@/lib/global-conversation";
import { ChatHeader } from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import MediaRoom from "@/components/media-room";

interface ProfileDMPageProps {
  params: Promise<{
    profileId: string;
  }>;
  searchParams: Promise<{
    video?: boolean;
  }>;
}

export default async function ProfileDMPage({
  params,
  searchParams,
}: ProfileDMPageProps) {
  const { profileId } = await params;
  const { video } = await searchParams;
  
  const profile = await currentProfile();

  if (!profile) return <RedirectToSignIn />;

  // Không thể DM chính mình
  if (profile.id === profileId) {
    return redirect("/");
  }

  // Tìm profile của người muốn DM
  const otherProfile = await db.profile.findUnique({
    where: { id: profileId },
  });

  if (!otherProfile) return redirect("/");

  // Tạo hoặc lấy conversation dựa trên profileId
  const conversation = await getOrCreateGlobalConversation(
    profile.id,
    profileId
  );

  if (!conversation) return redirect("/");

  const otherUser =
    conversation.profileOneId === profile.id
      ? conversation.profileTwo
      : conversation.profileOne;

  return (
    <div className="bg-white dark:bg-[#313338] flex flex-col h-full">
      <ChatHeader
        imgUrl={otherUser.imageUrl}
        name={otherUser.name}
        type="conversation"
      />
      {video && <MediaRoom chatId={conversation.id} video audio />}
      {!video && (
        <>
          <ChatMessages
            member={profile as any}
            name={otherUser.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/global-direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/global-direct-messages"
            socketQuery={{
              conversationId: conversation.id,
            }}
          />
          <ChatInput
            name={otherUser.name}
            type="conversation"
            apiUrl="/api/socket/global-direct-messages"
            query={{
              conversationId: conversation.id,
            }}
          />
        </>
      )}
    </div>
  );
}
