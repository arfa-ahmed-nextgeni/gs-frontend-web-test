import cn from "classnames";

const LicenseIcon = ({
  className = "",
  color = "currentColor",
  height = "24px",
  width = "23px",
}) => {
  return (
    <svg
      className={cn(className, color)}
      fill="none"
      height={height}
      viewBox="0 0 23 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.8916 19.0584L9.06588 19.2219C4.62937 19.2832 1 15.7037 1 11.2667V11.2667"
        stroke={"currentColor"}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <rect
        height="20.5333"
        rx="2.8"
        stroke={"currentColor"}
        strokeWidth="1.5"
        width="20.5333"
        x="1"
        y="2.46698"
      />
      <path
        d="M6.86621 3.93333V1"
        stroke={"currentColor"}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M15.667 3.93333V1"
        stroke={"currentColor"}
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <line
        stroke={"currentColor"}
        strokeLinecap="round"
        strokeWidth="1.5"
        x1="5.59961"
        x2="11.7996"
        y1="13.1747"
        y2="13.1747"
      />
      <line
        stroke={"currentColor"}
        strokeLinecap="round"
        strokeWidth="1.5"
        x1="5.59961"
        x2="14.3663"
        y1="9.32483"
        y2="9.32483"
      />
    </svg>
  );
};

export default LicenseIcon;
