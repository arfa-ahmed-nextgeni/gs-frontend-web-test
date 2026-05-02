import type { ReactNode } from "react";

import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES, MARKS } from "@contentful/rich-text-types";

import { ContentfulImage } from "@/components/shared/contentful-image";
import { Link } from "@/i18n/navigation";
import { normalizeContentfulSrc } from "@/lib/utils/contentful-image-loader";

import type {
  OriginalProductDialogContent as OriginalProductDialogContentData,
  PdpDialogConfigAssetData,
} from "@/lib/types/contentful/pdp-dialog-config";

export function OriginalProductDialogContent({
  content,
}: {
  content: OriginalProductDialogContentData;
}) {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-5">
      {documentToReactComponents(
        content.content,
        originalProductDialogRenderOptions
      )}
    </div>
  );
}

const originalProductDialogRenderOptions: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong className="font-medium">{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
  },
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) =>
      renderOriginalProductEmbeddedAsset(
        node.data.target as PdpDialogConfigAssetData | undefined
      ),
    [BLOCKS.HEADING_1]: (_node, children) => (
      <h2 className="text-text-primary text-xl font-medium">{children}</h2>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="text-text-primary text-xl font-medium">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="text-text-primary text-lg font-medium">{children}</h3>
    ),
    [BLOCKS.LIST_ITEM]: (_node, children) => <li>{children}</li>,
    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="text-text-primary ms-4 list-decimal space-y-2 text-sm font-normal">
        {children}
      </ol>
    ),
    [BLOCKS.PARAGRAPH]: (_node, children) => (
      <p className="text-text-primary text-sm font-normal">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="text-text-primary ms-4 list-disc space-y-2 text-sm font-normal">
        {children}
      </ul>
    ),
    [INLINES.HYPERLINK]: (node, children) =>
      renderOriginalProductDialogLink(node.data.uri, children),
  },
};

function renderOriginalProductDialogLink(href: string, children: ReactNode) {
  const className = "text-text-primary underline";

  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <a
      className={className}
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

function renderOriginalProductEmbeddedAsset(
  asset?: PdpDialogConfigAssetData
): ReactNode {
  const file = asset?.fields?.file;
  const fileUrl = file?.url;
  const contentType = file?.contentType;

  if (!fileUrl || !contentType) {
    return null;
  }

  if (contentType.startsWith("image/")) {
    return (
      <ContentfulImage
        alt={asset?.fields?.description || asset?.fields?.title || ""}
        className="h-auto w-full rounded-lg"
        height={file.details?.image?.height || 800}
        src={fileUrl}
        width={file.details?.image?.width || 1200}
      />
    );
  }

  if (contentType.startsWith("video/")) {
    return (
      <div className="relative aspect-video w-full">
        <iframe
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 size-full"
          src={normalizeContentfulSrc(fileUrl)}
          title={asset?.fields?.title || "Product video"}
        />
      </div>
    );
  }

  return null;
}
