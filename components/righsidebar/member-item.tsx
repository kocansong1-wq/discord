"use client";

import { Member, MemberRole, Server } from "@/lib/generated/prisma";
import { cn } from "@/lib/utils";
import { Crown, Shield, DiamondPlus, Moon, MinusCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { UserAvatar } from "../ui/user-avatar";

type UserStatus = "ONLINE" | "IDLE" | "DND" | "OFFLINE";

// Simplified profile type - only fields we actually use
interface ProfileData {
  id: string;
  name: string;
  imageUrl: string;
  isPremium: boolean;
  status?: UserStatus;
}

interface MemberItemProps {
  member: Member & { profile: ProfileData };
  server: Server;
  roleType: MemberRole;
}

const roleIconMap: Record<MemberRole, React.ReactNode> = {
  [MemberRole.ADMIN]: <Crown className="h-3.5 w-3.5 text-rose-500" />,
  [MemberRole.MODERATOR]: <Shield className="h-3.5 w-3.5 text-indigo-500" />,
  [MemberRole.GUEST]: null,
};

const statusConfig: Record<UserStatus, { color: string; label: string; icon: React.ComponentType<{ className?: string }> | null }> = {
  ONLINE: {
    color: "bg-emerald-500",
    label: "Online",
    icon: null,
  },
  IDLE: {
    color: "bg-amber-500",
    label: "Idle",
    icon: Moon,
  },
  DND: {
    color: "bg-rose-500",
    label: "Do Not Disturb",
    icon: MinusCircle,
  },
  OFFLINE: {
    color: "bg-zinc-500",
    label: "Offline",
    icon: null,
  },
};

export const MemberItem = ({ member }: MemberItemProps) => {
  const params = useParams();
  const router = useRouter();

  const icon = roleIconMap[member.role];
  const isSelected = params?.memberId === member.id;
  const status: UserStatus = (member.profile.status as UserStatus) || "OFFLINE";
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const onClick = () => {
    // Redirect to global DM based on profileId instead of memberId
    router.push(`/dm/${member.profile.id}`);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group px-2 py-1.5 rounded-lg flex items-center gap-x-3 w-full transition-all duration-200",
        "hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50",
        isSelected && "bg-zinc-200/70 dark:bg-zinc-700/70"
      )}
    >
      {/* Avatar with status indicator */}
      <div className="relative">
        <UserAvatar
          src={member.profile.imageUrl}
          className={cn(
            "h-8 w-8 ring-2 ring-transparent group-hover:ring-zinc-300 dark:group-hover:ring-zinc-600 transition-all",
            status === "OFFLINE" && "opacity-60"
          )}
        />
        {/* Status indicator */}
        <div
          className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#F2F3F5] dark:border-[#2B2D31] flex items-center justify-center",
            statusInfo.color
          )}
          title={statusInfo.label}
        >
          {StatusIcon && <StatusIcon className="h-2 w-2 text-white" />}
        </div>
      </div>

      {/* Name and role */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1.5">
          <p
            className={cn(
              "text-sm font-medium truncate transition-colors",
              "text-zinc-700 dark:text-zinc-300",
              "group-hover:text-zinc-900 dark:group-hover:text-zinc-100",
              isSelected && "text-zinc-900 dark:text-zinc-100",
              status === "OFFLINE" && "opacity-60"
            )}
          >
            {member.profile.name}
          </p>
          {icon}
        </div>
        {/* Show status text or role */}
        <p
          className={cn(
            "text-[10px] truncate",
            status === "IDLE" && "text-amber-500",
            status === "DND" && "text-rose-500",
            status === "ONLINE" && "text-emerald-500",
            status === "OFFLINE" && "text-zinc-500"
          )}
        >
          {status === "OFFLINE"
            ? member.role !== MemberRole.GUEST
              ? member.role === MemberRole.ADMIN
                ? "Server Owner"
                : "Moderator"
              : "Offline"
            : statusInfo.label}
        </p>
      </div>

      {/* Premium badge */}
      {member.profile.isPremium && (
        <div className="flex-shrink-0">
          <DiamondPlus className="h-4 w-4 text-purple-500 group-hover:text-purple-400 transition-colors" />
        </div>
      )}
    </button>
  );
};
