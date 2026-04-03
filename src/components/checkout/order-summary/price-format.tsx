"use client";

interface PriceFormatProps {
  amount: number;
  className?: string;
  showMinus?: boolean;
}

export function PriceFormat({
  amount,
  className = "",
  showMinus = false,
}: PriceFormatProps) {
  return (
    <span className={`inline-flex items-center ${className}`} dir="ltr">
      <span className="font-saudi-riyal relative leading-none">&#xE900;</span>
      {showMinus && "-"}
      {amount}
    </span>
  );
}
