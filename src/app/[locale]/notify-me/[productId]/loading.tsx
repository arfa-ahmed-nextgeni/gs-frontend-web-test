import { Spinner } from "@/components/ui/spinner";

export default function NotifyMeLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Spinner className="size-16" size={64} variant="dark" />
    </div>
  );
}
