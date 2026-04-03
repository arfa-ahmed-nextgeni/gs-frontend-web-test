export type ProductTag = {
  base_popularity: string;
  tag_attributes: string;
  tag_title: string;
};

export type ProductTagLabel = {
  title: string;
} & ProductTagStyle;

export type ProductTags = ProductTag[];

export type ProductTagStyle = {
  backgroundColor?: string;
  color?: string;
};
