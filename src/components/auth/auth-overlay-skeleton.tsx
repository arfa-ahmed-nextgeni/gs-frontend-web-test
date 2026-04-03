import { Skeleton } from "@/components/ui/skeleton";

export function OtpLoginPopupSkeleton() {
  return (
    <AuthOverlayShell>
      <Skeleton className="absolute end-6 top-6 size-5 rounded-full" />

      <div className="mt-8">
        <Skeleton className="mb-4 h-10 w-44" />
        <Skeleton className="mb-2 h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="mt-8 space-y-4">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
      </div>

      <div className="mt-6 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </AuthOverlayShell>
  );
}

export function RegistrationFormSkeleton() {
  return (
    <AuthOverlayShell>
      <Skeleton className="absolute end-6 top-6 size-5 rounded-full" />

      <div className="mb-10 mt-10">
        <Skeleton className="mb-5 h-10 w-52" />
        <Skeleton className="mb-2 h-4 w-64" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="space-y-4">
        <div className="flex gap-2.5">
          <Skeleton className="h-[50px] flex-1 rounded-xl" />
          <Skeleton className="h-[50px] flex-1 rounded-xl" />
        </div>
        <Skeleton className="h-[50px] w-full rounded-xl" />
        <Skeleton className="mt-2 h-[50px] w-full rounded-xl" />
      </div>
    </AuthOverlayShell>
  );
}

function AuthOverlayShell({ children }: React.PropsWithChildren) {
  return (
    <div
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="status"
    >
      <div className="relative h-full w-full overflow-hidden rounded-none bg-white p-6 shadow-xl lg:h-auto lg:w-[400px] lg:rounded-3xl">
        {children}
      </div>
    </div>
  );
}
