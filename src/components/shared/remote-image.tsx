import { ComponentProps } from "react";

import Image from "next/image";

export function RemoteImage({ alt, ...props }: ComponentProps<typeof Image>) {
  return <Image alt={alt} unoptimized {...props} />;
}
