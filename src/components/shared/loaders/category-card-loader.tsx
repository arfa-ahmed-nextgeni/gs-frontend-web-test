import ContentLoader from "react-content-loader";

const CategoryCardLoader = (props: any) => (
  <ContentLoader
    backgroundColor="#F3F6FA"
    className="h-auto w-full overflow-hidden"
    foregroundColor="#E7ECF3"
    height={214}
    speed={2}
    viewBox="0 0 180 214"
    width={180}
    {...props}
  >
    <circle cx="90" cy="89" r="89" />
    <rect height="8" rx="5" ry="5" width="118" x="30" y="203" />
  </ContentLoader>
);

export default CategoryCardLoader;
