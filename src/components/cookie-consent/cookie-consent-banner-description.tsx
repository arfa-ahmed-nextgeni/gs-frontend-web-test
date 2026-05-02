import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, type Document, INLINES } from "@contentful/rich-text-types";

import { Link } from "@/i18n/navigation";

type CookieConsentBannerDescriptionProps = {
  description: Document;
};

const cookieConsentRenderOptions: Options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => <p>{children}</p>,
    [INLINES.HYPERLINK]: (node, children) => (
      <Link
        className="text-text-success no-underline hover:underline"
        href={node.data.uri}
      >
        {children}
      </Link>
    ),
  },
};

export function CookieConsentBannerDescription({
  description,
}: CookieConsentBannerDescriptionProps) {
  return (
    <>{documentToReactComponents(description, cookieConsentRenderOptions)}</>
  );
}
