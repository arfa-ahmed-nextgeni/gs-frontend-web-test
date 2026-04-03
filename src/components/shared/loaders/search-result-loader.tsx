import ContentLoader from "react-content-loader";

const SearchResultLoader = (props: any) => {
  return (
    <ContentLoader
      backgroundColor="#F3F6FA"
      className="h-auto w-full overflow-hidden rounded-md"
      foregroundColor="#E7ECF3"
      height={26}
      speed={2}
      viewBox="0 0 400 26"
      width={400}
      {...props}
    >
      <rect height="26" rx="3" ry="3" width="26" x="0" y="0" />
      <rect height="4" rx="2" ry="2" width="100" x="32" y="12" />
    </ContentLoader>
  );
};

export default SearchResultLoader;
