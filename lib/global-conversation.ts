import { db } from "@/lib/db";

export const getOrCreateGlobalConversation = async (
  profileOneId: string,
  profileTwoId: string
) => {
  let conversation = await findGlobalConversation(profileOneId, profileTwoId);

  if (!conversation) {
    conversation = await createGlobalConversation(profileOneId, profileTwoId);
  }

  return conversation;
};

const findGlobalConversation = async (
  profileOneId: string,
  profileTwoId: string
) => {
  try {
    return await db.globalConversation.findFirst({
      where: {
        OR: [
          {
            AND: [
              { profileOneId: profileOneId },
              { profileTwoId: profileTwoId },
            ],
          },
          {
            AND: [
              { profileOneId: profileTwoId },
              { profileTwoId: profileOneId },
            ],
          },
        ],
      },
      include: {
        profileOne: true,
        profileTwo: true,
      },
    });
  } catch (error) {
    console.error("[FIND_GLOBAL_CONVERSATION]", error);
    return null;
  }
};

const createGlobalConversation = async (
  profileOneId: string,
  profileTwoId: string
) => {
  try {
    return await db.globalConversation.create({
      data: {
        profileOneId,
        profileTwoId,
      },
      include: {
        profileOne: true,
        profileTwo: true,
      },
    });
  } catch (error) {
    console.error("[CREATE_GLOBAL_CONVERSATION]", error);
    return null;
  }
};
