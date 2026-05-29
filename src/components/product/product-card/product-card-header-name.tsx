"use client";

export const ProductCardHeaderName = ({ name }: { name: string }) => {
  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const isTruncated =
      element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth;

    if (isTruncated) element.setAttribute("title", name);
    else element.removeAttribute("title");
  };

  return (
    <div
      className="text-text-primary line-clamp-1 text-xs font-normal"
      onMouseEnter={handleMouseEnter}
    >
      {name}
    </div>
  );
};
