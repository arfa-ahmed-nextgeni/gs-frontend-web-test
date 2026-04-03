export const UaeFlag: React.FC<React.SVGAttributes<object>> = (props) => (
  <svg
    fill="none"
    height={15}
    width={20}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <mask
      height={15}
      id="a"
      maskUnits="userSpaceOnUse"
      style={{
        maskType: "alpha",
      }}
      width={20}
      x={0}
      y={0}
    >
      <rect fill="#D9D9D9" height={15} rx={3} width={20} />
    </mask>
    <g mask="url(#a)">
      <path d="M20 0H6v5.004h14V0Z" fill="#02733B" />
      <path d="M20 5.004H6v4.992h14V5.004Z" fill="#fff" />
      <path d="M20 9.996H6v4.993h14V9.996Z" fill="#000" />
      <path d="M6 15V0H0V15h6Z" fill="#ED2024" />
    </g>
  </svg>
);
