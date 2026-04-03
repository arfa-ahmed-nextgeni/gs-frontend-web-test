"use client";

import { ComponentProps, useState } from "react";

import { cn } from "@/lib/utils/index";

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  const [charsCount, setCharsCount] = useState(
    (props.value as string)?.length || 0
  );

  return (
    <div className="relative flex">
      <textarea
        className={cn(
          "text-text-primary bg-bg-surface placeholder:text-text-placeholder flex-1 resize-none rounded-xl p-5 text-lg font-normal focus:outline-none",
          className
        )}
        data-slot="textarea"
        {...props}
        onChange={(e) => {
          setCharsCount(e.target.value.length);
          props?.onChange?.(e);
        }}
      />
      <p className="text-text-secondary absolute bottom-2.5 end-2.5 text-xs font-normal">
        {charsCount}/{props.maxLength}
      </p>
    </div>
  );
}

export { Textarea };
