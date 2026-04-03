import type { Document } from "@contentful/rich-text-types";

import { TabContentType } from "@/lib/models/page-landing";

import type { CookieConsentPromptData } from "@/lib/types/contentful/page-landing";

export class CookieConsentPromptModel {
  public allowButtonLabel: string;
  public consentVersion: string;
  public contentType: TabContentType;
  public declineButtonLabel: string;
  public description: Document;
  public enabled: boolean;
  public internalName: string;

  constructor(data: CookieConsentPromptData, contentType: TabContentType) {
    this.contentType = contentType;
    this.internalName = data.internalName;
    this.enabled = data.enabled ?? true;
    this.consentVersion = data.consentVersion;
    this.description = data.description;
    this.allowButtonLabel = data.allowButtonLabel;
    this.declineButtonLabel = data.declineButtonLabel;
  }
}
