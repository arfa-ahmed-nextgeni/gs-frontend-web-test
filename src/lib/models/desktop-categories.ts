import { TabContentType } from "@/lib/models/page-landing";
import { DesktopCategoriesData } from "@/lib/types/contentful/page-landing";

export class DesktopCategories {
  public categories: DesktopCategory[] = [];
  public contentType: TabContentType;
  public title?: string;

  constructor(data: DesktopCategoriesData, contentType: TabContentType) {
    this.contentType = contentType;
    this.title = data.title;
    this.categories = data.categories.map(
      ({ fields, sys }) =>
        new DesktopCategory({
          id: sys.id,
          imageUrl: fields?.image?.fields?.file?.url,
          label: fields?.label,
          url: fields?.url,
        })
    );
  }
}

export class DesktopCategory {
  public id: string;
  public imageUrl?: string;
  public label: string;
  public url: string;

  constructor({
    id,
    imageUrl,
    label,
    url,
  }: {
    id: string;
    imageUrl?: string;
    label: string;
    url: string;
  }) {
    this.id = id;
    this.label = label;
    this.url = url;
    this.imageUrl = imageUrl;
  }
}
