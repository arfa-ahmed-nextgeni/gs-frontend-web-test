"use client";

import { useToastContext } from "@/components/providers/toast-provider";

export default function ToastExample() {
  const { showError, showInfo, showResend, showSuccess, showWarning } =
    useToastContext();

  return (
    <div className="flex flex-col gap-4 p-8">
      <h2 className="text-2xl font-bold">Toast Examples</h2>

      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">
          Translation-based Toasts (using GIF icons)
        </h3>
        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            onClick={() => showSuccess()}
          >
            Show Success Toast (Translated)
          </button>

          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => showInfo()}
          >
            Show Info Toast (Translated)
          </button>

          <button
            className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
            onClick={() => showWarning()}
          >
            Show Warning Toast (Translated)
          </button>

          <button
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={() => showError()}
          >
            Show Error Toast (Translated)
          </button>

          <button
            className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600"
            onClick={() => showResend()}
          >
            Show Resend Toast (Translated)
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">Custom Message Toasts</h3>
        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            onClick={() =>
              showSuccess(
                "Custom Success!",
                "This is a custom success message.",
                "top"
              )
            }
          >
            Show Custom Success Toast
          </button>

          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() =>
              showInfo("Custom Info!", "This is a custom info message.", "top")
            }
          >
            Show Custom Info Toast
          </button>

          <button
            className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
            onClick={() =>
              showWarning(
                "Custom Warning!",
                "This is a custom warning message.",
                "top"
              )
            }
          >
            Show Custom Warning Toast
          </button>

          <button
            className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={() =>
              showError(
                "Custom Error!",
                "This is a custom error message.",
                "top"
              )
            }
          >
            Show Custom Error Toast
          </button>

          <button
            className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600"
            onClick={() =>
              showResend(
                "Custom Resend!",
                "This is a custom resend message.",
                "top"
              )
            }
          >
            Show Custom Resend Toast
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">Bottom Position Toasts</h3>
        <div className="flex flex-wrap gap-4">
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            onClick={() => showSuccess(undefined, undefined, "bottom")}
          >
            Show Success Toast (Bottom)
          </button>

          <button
            className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={() => showInfo(undefined, undefined, "bottom")}
          >
            Show Info Toast (Bottom)
          </button>

          <button
            className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600"
            onClick={() => showResend(undefined, undefined, "bottom")}
          >
            Show Resend Toast (Bottom)
          </button>
        </div>
      </div>
    </div>
  );
}
