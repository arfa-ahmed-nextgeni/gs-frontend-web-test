import Image from "next/image";

import EmptyStarIcon from "@/assets/icons/empty-star-icon.svg";
import HalfStarIcon from "@/assets/icons/half-star-icon.svg";
import StarIcon from "@/assets/icons/star-icon.svg";

const starSizeVariant = {
  large: {
    className: "size-3.75",
    height: 15,
    width: 15,
  },
  small: {
    className: "size-2.5",
    height: 10,
    width: 10,
  },
};

export const ProductRating = ({
  hideRating,
  rating,
  variant = "small",
}: {
  hideRating?: boolean;
  rating: number;
  variant?: "large" | "small";
}) => {
  return (
    <div className="flex flex-row items-center justify-center gap-0.5">
      <div
        className="flex flex-row items-center justify-center gap-0.5"
        dir="ltr"
      >
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1;

          let starIcon;
          if (rating >= starValue) {
            starIcon = StarIcon;
          } else if (rating >= starValue - 0.5) {
            starIcon = HalfStarIcon;
          } else {
            starIcon = EmptyStarIcon;
          }

          return (
            <Image
              alt=""
              className={starSizeVariant[variant].className}
              height={starSizeVariant[variant].height}
              key={index}
              src={starIcon}
              width={starSizeVariant[variant].width}
            />
          );
        })}
      </div>
      {!hideRating && (
        <p className="text-text-secondary text-[10px] font-medium leading-none">
          {rating}
        </p>
      )}
    </div>
  );
};
