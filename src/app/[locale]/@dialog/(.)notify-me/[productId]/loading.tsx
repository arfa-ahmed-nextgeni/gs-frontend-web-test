import { NotifyMeDialog } from "@/components/dialogs/notify-me-dialog";
import { NotifyMeFormSkeleton } from "@/components/dialogs/notify-me-dialog/notify-me-form-skeleton";

export default function NotifyMeLoading() {
  return (
    <NotifyMeDialog productName="">
      <NotifyMeFormSkeleton />
    </NotifyMeDialog>
  );
}
