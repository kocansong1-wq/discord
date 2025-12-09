"use client";

import { useEffect } from "react";
import { useVoice } from "@/components/providers/voice-provider";

interface ServerVoiceInitProps {
  serverId: string;
}

export const ServerVoiceInit = ({ serverId }: ServerVoiceInitProps) => {
  const { setCurrentServerId } = useVoice();

  useEffect(() => {
    setCurrentServerId(serverId);
    return () => setCurrentServerId(null);
  }, [serverId, setCurrentServerId]);

  return null;
};
