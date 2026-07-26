import type { Document } from "@contentful/rich-text-types";

import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";
import type { PromoBannerData } from "@/lib/types/contentful/nav-header";

export class PromoBanner {
  public displayOn: ContentDisplayOn;
  public richTextDocument: Document;
  public style?: React.CSSProperties;
  public url: string;

  constructor(data: PromoBannerData) {
    this.displayOn = data.displayOn ?? "all";
    this.richTextDocument = data.text;
    this.url = data.url;
    this.style = data.configuration?.style;
  }
}
