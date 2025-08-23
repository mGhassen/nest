import { User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  user: User | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  if (user?.profileImageUrl) {
    return (
      <img
        src={user.profileImageUrl}
        alt={user.firstName ? `${user.firstName} ${user.lastName}` : user.email || "User"}
        className={cn(
          "rounded-full object-cover",
          sizeClasses[size],
          className
        )}
        data-testid="img-user-avatar"
      />
    );
  }

  return (
    <div
      className={cn(
        "bg-primary rounded-full flex items-center justify-center text-white font-medium",
        sizeClasses[size],
        className
      )}
      data-testid="div-user-avatar"
    >
      {getInitials()}
    </div>
  );
}
