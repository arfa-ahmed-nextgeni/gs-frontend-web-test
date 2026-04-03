import { TabContentType } from "@/lib/models/page-landing";
import { YoutubeVideoData } from "@/lib/types/contentful/page-landing";

export class YoutubeVideo {
  public contentType: TabContentType;
  public internalName?: string;
  public videoUrl?: string;

  constructor(data: YoutubeVideoData, contentType: TabContentType) {
    this.contentType = contentType;
    this.internalName = data.internalName;
    this.videoUrl = data.videoUrl;
  }
}
