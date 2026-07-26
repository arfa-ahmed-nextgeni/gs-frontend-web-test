"use client";

import { useActionState } from "react";

import Form from "next/form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { submitApiActivityAccess } from "@/lib/actions/api-activity/submit-api-activity-access";

const initialAccessFormState = {
  errorMessage: null,
};

type ApiActivityAccessFormProps = {
  description?: string;
  passwordInputId?: string;
  pendingLabel?: string;
  redirectTo?: string;
  submitLabel?: string;
};

export function ApiActivityAccessForm({
  description = "Enter the tool password to view recent server-side API activity.",
  passwordInputId = "api-activity-password",
  pendingLabel = "Checking...",
  redirectTo,
  submitLabel = "Open activity viewer",
}: ApiActivityAccessFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitApiActivityAccess,
    initialAccessFormState
  );

  return (
    <Card className="border-border-divider bg-bg-default shadow-xs w-full max-w-md">
      <CardHeader className="gap-3">
        <CardTitle className="text-2xl">Access Required</CardTitle>
        <CardDescription className="text-text-secondary text-sm leading-6">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form action={formAction} className="space-y-4">
          {redirectTo ? (
            <input name="redirectTo" type="hidden" value={redirectTo} />
          ) : null}

          <div className="space-y-2">
            <label
              className="text-text-primary text-sm font-medium"
              htmlFor={passwordInputId}
            >
              Password
            </label>
            <Input
              autoComplete="current-password"
              id={passwordInputId}
              name="password"
              placeholder="Enter password"
              type="password"
            />
          </div>

          {state.errorMessage ? (
            <p className="text-text-error text-sm">{state.errorMessage}</p>
          ) : null}

          <Button className="w-full" disabled={isPending} type="submit">
            {isPending ? pendingLabel : submitLabel}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
}
