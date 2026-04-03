import { Document } from "@contentful/rich-text-types";

import { TabContentType } from "@/lib/models/page-landing";
import { TitleAndDescriptionData } from "@/lib/types/contentful/page-landing";

export class TitleAndDescription {
  public contentType: TabContentType;
  public description?: Document;
  public internalName: string;
  public title?: string;

  constructor(data: TitleAndDescriptionData, contentType: TabContentType) {
    this.contentType = contentType;
    this.description = data.description;
    this.internalName = data.internalName;
    this.title = data.title;
  }
}
