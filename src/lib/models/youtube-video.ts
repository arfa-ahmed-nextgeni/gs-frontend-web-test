import { TabContentType } from "@/lib/models/page-landing";

import type { ContentDisplayOn } from "@/lib/types/contentful/display-on";
import type { YoutubeVideoData } from "@/lib/types/contentful/page-landing";

export class YoutubeVideo {
  public contentType: TabContentType;
  public displayOn: ContentDisplayOn;
  public internalName?: string;
  public videoUrl?: string;

  constructor(data: YoutubeVideoData, contentType: TabContentType) {
    this.contentType = contentType;
    this.displayOn = data.displayOn ?? "all";
    this.internalName = data.internalName;
    this.videoUrl = data.videoUrl;
  }
}
