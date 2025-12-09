"use client";

import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface RightSidebarWrapperProps {
  children: React.ReactNode;
  channelType?: string;
}

export const RightSidebarWrapper = ({ children }: RightSidebarWrapperProps) => {
  const pathname = usePathname();
  const [isVoiceChannel, setIsVoiceChannel] = useState(false);

  // Check if current page is a voice/video channel
  // This is a client-side check based on URL pattern
  // In production, you might want to fetch channel type from API
  useEffect(() => {
    // Hide sidebar for voice channels - will be controlled by page
    const checkVoiceChannel = async () => {
      // For now, always show - the page will handle hiding
      setIsVoiceChannel(false);
    };
    checkVoiceChannel();
  }, [pathname]);

  if (isVoiceChannel) return null;

  return <>{children}</>;
};
