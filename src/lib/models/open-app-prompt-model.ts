import { TabContentType } from "@/lib/models/page-landing";
import { OpenAppPromptData } from "@/lib/types/contentful/page-landing";

export class OpenAppPromptModel {
  public appRating?: number;
  public appStoreUrl?: string;
  public contentType: TabContentType;
  public dismissButtonLabel?: string;
  public openAppButtonLabel?: string;
  public playStoreUrl?: string;
  public subtitle?: string;
  public title: string;

  constructor(data: OpenAppPromptData, contentType: TabContentType) {
    this.contentType = contentType;
    this.subtitle = data.subtitle;
    this.title = data.title;
    this.appStoreUrl = data.appStoreUrl;
    this.playStoreUrl = data.playStoreUrl;
    this.openAppButtonLabel = data.openAppButtonLabel;
    this.dismissButtonLabel = data.dismissButtonLabel;
    this.appRating = data.appRating;
  }
}
