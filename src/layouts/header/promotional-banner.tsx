import {
  documentToReactComponents,
  Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

import { Link } from "@/i18n/navigation";
import { PromoBanner } from "@/lib/models/promo-banner";

const renderOptions: Options = {
  renderNode: {
    // SEO: Convert h1 to h2 to ensure only one h1 per page
    [BLOCKS.HEADING_1]: (_node, children) => (
      <h2 className="inline">{children}</h2>
    ),
  },
  renderText: (text) => {
    const TOKEN = "&#xE900;";
    const parts = text.split(TOKEN);

    return parts.flatMap((part, i) =>
      i === 0
        ? [part]
        : [
            <span
              className="font-saudi-riyal top-0.25 relative ltr:-right-0.5 rtl:-left-0.5"
              key={`riyalsym-${i}`}
            >
              &#xE900;
            </span>,
            part,
          ]
    );
  },
};

export const PromotionalBanner = ({ data }: { data: PromoBanner }) => {
  return (
    <Link href={data.url}>
      <div className="relative py-2" style={data.style}>
        {documentToReactComponents(data.richTextDocument, renderOptions)}
      </div>
    </Link>
  );
};
