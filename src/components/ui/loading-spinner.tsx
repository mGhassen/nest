import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  text, 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div className={cn(
        "animate-spin rounded-full border-b-2 border-primary",
        sizeClasses[size]
      )}></div>
      <span className="text-lg text-muted-foreground">{text || "Loading..."}</span>
    </div>
  );
}

interface LoadingPageProps {
  text?: string;
  className?: string;
}

export function LoadingPage({ 
  text, 
  className 
}: LoadingPageProps) {
  return (
    <div className={cn(
      "flex min-h-screen items-center justify-center bg-background",
      className
    )}>
      <LoadingSpinner text={text} />
    </div>
  );
}
