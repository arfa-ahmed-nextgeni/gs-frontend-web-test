"use client";

import Image from "next/image";

import EmptyStarIcon from "@/assets/icons/empty-star-icon.svg";
import StarIcon from "@/assets/icons/star-icon.svg";

export const StarRating = ({
  onChangeAction,
  value,
}: {
  onChangeAction: (value: number) => void;
  value: number;
}) => {
  return (
    <div className="flex flex-row justify-center gap-2.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={`rating-${star}`}
          onClick={() => onChangeAction(star)}
          type="button"
        >
          <Image
            alt="rating"
            className="size-12.5"
            height={50}
            src={star <= value ? StarIcon : EmptyStarIcon}
            width={50}
          />
        </button>
      ))}
    </div>
  );
};
