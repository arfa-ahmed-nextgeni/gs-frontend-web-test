import type { Document } from "@contentful/rich-text-types";

import { TabContentType } from "@/lib/models/page-landing";
import { SeoContentBlockData } from "@/lib/types/contentful/page-landing";

export class SeoContentBlock {
  public content?: Document;
  public contentType: TabContentType;
  public internalName?: string;

  constructor(data: SeoContentBlockData, contentType: TabContentType) {
    this.contentType = contentType;
    this.content = data.content;
    this.internalName = data.internalName;
  }
}
