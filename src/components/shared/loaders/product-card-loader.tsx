import ContentLoader from "react-content-loader";

const ProductCardLoader = (props: any) => (
  <ContentLoader
    backgroundColor="#F3F6FA"
    className="drop-shadow-card h-auto w-full overflow-hidden rounded-md bg-white"
    foregroundColor="#E7ECF3"
    height={320}
    speed={2}
    viewBox="0 0 226 320"
    width={226}
    {...props}
  >
    <rect height="185" rx="0" ry="0" width="226" x="0" y="0" />
    <rect height="8" rx="3" ry="3" width="79" x="18" y="203" />
    <rect height="5" rx="3" ry="3" width="195" x="18" y="236" />
    <rect height="5" rx="3" ry="3" width="100" x="18" y="258" />
    <rect height="5" rx="3" ry="3" width="79" x="18" y="287" />
  </ContentLoader>
);

export default ProductCardLoader;
