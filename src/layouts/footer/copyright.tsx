import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

import Container from "@/components/shared/container";

export const Copyright = ({ copyrightText }: { copyrightText: any }) => {
  return (
    <Container
      className="border-border-base bg-bg-default border-t"
      variant="FullWidth"
    >
      <Container className="pb-25 pt-5 lg:py-8">
        <div
          className="text-text-secondary flex flex-col gap-2 text-[13px] font-medium lg:flex-row lg:items-center lg:justify-center lg:gap-2"
          suppressHydrationWarning
        >
          {copyrightText &&
            documentToReactComponents(copyrightText, {
              renderNode: {
                // SEO: Convert h1 to h2 to ensure only one h1 per page
                [BLOCKS.HEADING_1]: (_node, children) => (
                  <h2 className="inline">{children}</h2>
                ),
              },
            })}
        </div>
      </Container>
    </Container>
  );
};
