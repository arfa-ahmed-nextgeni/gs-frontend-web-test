export const PreviousPageIcon: React.FC<React.SVGAttributes<object>> = (
  props
) => (
  <svg
    fill="none"
    height={16}
    width={8}
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M2.551 8.761a1.07 1.07 0 0 1-.244-.349A1.035 1.035 0 0 1 2.55 7.24l5.12-4.907c.104-.1.187-.218.243-.349A1.035 1.035 0 0 0 7.67.812 1.139 1.139 0 0 0 6.884.5c-.295 0-.577.112-.786.312L.978 5.729A3.151 3.151 0 0 0 0 8c0 .852.352 1.67.978 2.272l5.12 4.917a1.156 1.156 0 0 0 1.573 0c.104-.1.187-.218.243-.348a1.035 1.035 0 0 0-.244-1.173L2.551 8.76Z"
      fill={props.fill ?? "var(--color-svg-icon-dark)"}
    />
  </svg>
);
