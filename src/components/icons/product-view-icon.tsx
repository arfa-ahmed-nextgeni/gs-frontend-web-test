export const ProductViewIcon: React.FC<React.SVGAttributes<object>> = (
  props
) => (
  <svg
    fill="none"
    height={34}
    width={34}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#a)">
      <foreignObject height={50} width={50} x={-9} y={-9}>
        <div
          style={{
            backdropFilter: "blur(5px)",
            clipPath: "url(#b)",
            height: "100%",
            width: "100%",
          }}
        />
      </foreignObject>
      <circle
        cx={16}
        cy={16}
        data-figma-bg-blur-radius={10}
        fill="#fff"
        fillOpacity={0.9}
        r={15}
      />
      <path
        d="M16.004 10.5c3.61 0 5.668 2.494 6.572 3.98a2.909 2.909 0 0 1 0 3.039c-.904 1.487-2.962 3.98-6.572 3.98s-5.668-2.493-6.572-3.98a2.91 2.91 0 0 1 0-3.038c.904-1.487 2.961-3.982 6.572-3.982Zm0 1.177c-3.043 0-4.802 2.145-5.578 3.42a1.729 1.729 0 0 0 0 1.806c.777 1.274 2.535 3.42 5.578 3.42s4.801-2.146 5.578-3.42a1.73 1.73 0 0 0 0-1.806c-.777-1.277-2.535-3.42-5.578-3.42Zm0 1.38a2.906 2.906 0 0 1 2.06.863 2.96 2.96 0 0 1 .364 3.715c-.32.484-.776.861-1.309 1.084a2.89 2.89 0 0 1-1.684.167 2.908 2.908 0 0 1-1.494-.805 2.971 2.971 0 0 1-.632-3.208c.221-.537.595-.997 1.075-1.32a2.898 2.898 0 0 1 1.62-.496Zm.669 1.311a1.735 1.735 0 0 0-1.906.383 1.782 1.782 0 0 0-.379 1.925 1.74 1.74 0 0 0 1.616 1.09c.464 0 .908-.187 1.236-.518a1.774 1.774 0 0 0-.567-2.88Z"
        fill="#85878A"
      />
    </g>
    <defs>
      <clipPath id="b" transform="translate(9 9)">
        <circle cx={16} cy={16} r={15} />
      </clipPath>
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height={34}
        id="a"
        width={34}
        x={0}
        y={0}
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dx={1} dy={1} />
        <feGaussianBlur stdDeviation={1} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_4113_1478"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_4113_1478"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
