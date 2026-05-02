import { ContentfulImage } from "@/components/shared/contentful-image";

import type { CashbackDialogContent as CashbackDialogContentData } from "@/lib/types/contentful/pdp-dialog-config";

export function CashbackDialogContent({
  content,
}: {
  content: CashbackDialogContentData;
}) {
  return (
    <ContentfulImage
      alt={content.title || "Cashback"}
      className="w-full"
      height={content.imageHeight || 500}
      src={content.imageUrl}
      width={content.imageWidth || 500}
    />
  );
}
