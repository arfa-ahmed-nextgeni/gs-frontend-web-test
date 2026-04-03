import ContentLoader from "react-content-loader";

const CategoryListCardLoader = (props: any) => (
  <ContentLoader
    backgroundColor="#f9f9f9"
    className="w-full rounded-md"
    foregroundColor="#ecebeb"
    height={70}
    speed={2}
    viewBox="0 0 389 88"
    width={389}
    {...props}
  >
    <circle cx="43" cy="45" r="30" />
    <rect height="8" rx="3" ry="3" width="96" x="88" y="40" />
    <rect height="20" rx="3" ry="3" width="20" x="350" y="34" />
  </ContentLoader>
);

export default CategoryListCardLoader;
