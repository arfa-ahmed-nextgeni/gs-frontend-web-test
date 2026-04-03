export const KuwaitFlag: React.FC<React.SVGAttributes<object>> = (props) => (
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
      <path d="M5 5.004h15V0H0l5 5.004Z" fill="#007B3E" />
      <path d="M20 5.004H5v4.992h15V5.004Z" fill="#fff" />
      <path d="M0 15h20V9.996H5L0 15Z" fill="#CE2028" />
      <path d="M5 9.996V5.004L0 0V15l5-5.004Z" fill="#000" />
    </g>
  </svg>
);
