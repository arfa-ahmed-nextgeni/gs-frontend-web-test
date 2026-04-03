import { cn } from "@/lib/utils/index";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
