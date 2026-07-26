"use client";

import { useFormStatus } from "react-dom";

import Form from "next/form";

import { Button } from "@/components/ui/button";
import { revalidateCacheTag } from "@/lib/actions/cache/revalidate-cache-tag";

export function CacheRevalidateTagForm({ tag }: { tag: string }) {
  return (
    <Form action={revalidateCacheTag}>
      <input name="tag" type="hidden" value={tag} />
      <CacheRevalidateSubmitButton />
    </Form>
  );
}

function CacheRevalidateSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} type="submit">
      {pending ? "Revalidating..." : "Revalidate"}
    </Button>
  );
}
