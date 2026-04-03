export const ArrowLeftIcon: React.FC<React.SVGAttributes<object>> = (props) => (
  <svg
    fill="none"
    height={30}
    width={15}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M14.99 1.875a1.846 1.846 0 0 1-.557 1.325l-9.712 9.587a3.089 3.089 0 0 0 0 4.418l9.7 9.573A1.873 1.873 0 0 1 15 28.11a1.853 1.853 0 0 1-.556 1.341 1.9 1.9 0 0 1-1.36.549 1.917 1.917 0 0 1-1.349-.572l-9.699-9.573A6.834 6.834 0 0 1 0 14.996c0-1.822.732-3.57 2.036-4.86L11.748.55a1.922 1.922 0 0 1 2.07-.407c.347.143.644.383.852.691.209.309.32.671.32 1.042Z"
      fill={props.fill || "#fff"}
      opacity={props.opacity || 0.5}
    />
  </svg>
);
