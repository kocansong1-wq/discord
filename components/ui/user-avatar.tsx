import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    className?: string;
    fallback?: string;
}

export const UserAvatar = ({ src, className, fallback }: UserAvatarProps) => {
    return (
        <Avatar className={cn("h-7 w-7 md:h-10 md:w-10", className)}>
            <AvatarImage src={src} className="object-cover" />
            <AvatarFallback className="bg-indigo-500 text-white text-xs">
                {fallback?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
        </Avatar>
    );
};