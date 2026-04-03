import Image from "next/image";

import { Link } from "@/i18n/navigation";

export const FooterAppLinks = ({ appSection }: { appSection: any }) => {
  return (
    <div className="border-border-base order-last col-span-1 flex flex-col border-t pt-6 lg:order-first lg:border-0 lg:pt-0">
      <div className="text-text-primary text-base font-extrabold">
        {appSection.title}
      </div>
      <div className="flex-1/1 mt-6 flex flex-col justify-between gap-2.5">
        <div className="flex flex-row gap-4">
          {appSection.appLinks.map((appLink: any, index: number) => (
            <Link
              href={appLink.url}
              key={`app-link-${index}`}
              rel="noopener noreferrer"
              target="_blank"
              title={appLink.label}
            >
              <Image
                alt={appLink.label}
                height={40}
                src={appLink.imageUrl}
                width={120}
              />
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 sm:mt-4">
          {appSection.paymentMethods.map((paymentMethod: any, idx: number) => (
            <Image
              alt={paymentMethod.label}
              height={20}
              key={idx}
              src={paymentMethod.imageUrl}
              width={37}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
