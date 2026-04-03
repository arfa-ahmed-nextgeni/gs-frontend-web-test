import { cn } from "@/lib/utils";

export function AlertTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("text-text-secondary text-sm font-medium", className)}
      data-slot="alert-title"
      {...props}
    />
  );
}
