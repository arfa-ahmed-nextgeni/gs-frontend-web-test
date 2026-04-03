import { Document } from "@contentful/rich-text-types";

import { PromoBannerData } from "@/lib/types/contentful/nav-header";

export class PromoBanner {
  public richTextDocument: Document;
  public style?: React.CSSProperties;
  public url: string;

  constructor(data: PromoBannerData) {
    this.richTextDocument = data.text;
    this.url = data.url;
    this.style = data.configuration?.style;
  }
}
