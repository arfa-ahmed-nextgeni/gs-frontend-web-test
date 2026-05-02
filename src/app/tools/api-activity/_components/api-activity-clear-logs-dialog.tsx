"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearApiActivityLogs } from "@/lib/actions/api-activity/clear-api-activity-logs";
import { isError, isUnauthenticated } from "@/lib/utils/service-result";

export function ApiActivityClearLogsDialog() {
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await clearApiActivityLogs();

      if (isUnauthenticated(result)) {
        setErrorMessage("Session expired. Refresh and sign in again.");
        return;
      }

      if (isError(result)) {
        setErrorMessage(result.error);
        return;
      }

      setIsOpen(false);
    });
  }

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <Button onClick={() => setIsOpen(true)} type="button" variant="outline">
        Clear logs
      </Button>

      <DialogContent
        aria-describedby={undefined}
        className="w-full max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="gap-3">
          <DialogTitle>Clear API activity logs?</DialogTitle>
          <DialogDescription className="text-text-secondary text-sm leading-6">
            This removes all currently stored activity from server memory. This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {errorMessage ? (
          <p className="text-text-error text-sm">{errorMessage}</p>
        ) : null}

        <DialogFooter className="gap-2 sm:justify-end">
          <Button
            disabled={isPending}
            onClick={() => setIsOpen(false)}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="bg-btn-bg-alert text-text-inverse hover:bg-btn-bg-alert/90 hover:text-text-inverse border-transparent"
            disabled={isPending}
            onClick={handleConfirm}
            type="button"
            variant="outline"
          >
            {isPending ? "Clearing..." : "Delete logs"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
