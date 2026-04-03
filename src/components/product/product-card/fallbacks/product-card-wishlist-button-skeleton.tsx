import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ProductCardWishlistButtonSkeleton = ({
  className = "",
}: {
  className?: string;
}) => <Skeleton className={cn("size-5 rounded-xl", className)} />;
