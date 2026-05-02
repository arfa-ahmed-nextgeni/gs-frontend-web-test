import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

import { LocalizedPrice } from "@/components/shared/localized-price";
import { Link } from "@/i18n/navigation";
import { PromoBanner } from "@/lib/models/promo-banner";

const PRICE_SPLIT_PATTERN = /(-?\d[\d,]*(?:\.\d+)?\s*(?:AED|SAR|د\.إ|ر\.س))/gi;
const PRICE_TOKEN_PATTERN = /^-?\d[\d,]*(?:\.\d+)?\s*(?:AED|SAR|د\.إ|ر\.س)$/i;

const renderOptions: Options = {
  renderNode: {
    // SEO: Convert h1 to h2 to ensure only one h1 per page
    [BLOCKS.HEADING_1]: (_node, children) => (
      <h2 className="inline">{children}</h2>
    ),
  },
  renderText: (text) => {
    return text
      .split(PRICE_SPLIT_PATTERN)
      .filter(Boolean)
      .map((part, index) =>
        PRICE_TOKEN_PATTERN.test(part) ? (
          <LocalizedPrice key={`price-${index}`} price={part} />
        ) : (
          part
        )
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
