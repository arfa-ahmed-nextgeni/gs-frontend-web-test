import { useResponsiveBreakpoint } from "@/hooks/use-responsive-breakpoint";

export function useIsMobile() {
  const breakpoint = useResponsiveBreakpoint();

  return breakpoint === "md" || breakpoint === "sm";
}
