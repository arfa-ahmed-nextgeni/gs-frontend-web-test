const SearchIcon: React.FC<React.SVGAttributes<object>> = (props) => {
  return (
    <svg
      className="rtl:rotate-90"
      fill="none"
      height={20}
      width={20}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m19.766 18.589-4.97-4.97a8.34 8.34 0 1 0-1.177 1.177l4.97 4.97a.833.833 0 0 0 1.177-1.177ZM8.353 15.014a6.66 6.66 0 1 1 6.661-6.66 6.668 6.668 0 0 1-6.66 6.66Z"
        fill="#374957"
      />
    </svg>
  );
};

export default SearchIcon;
