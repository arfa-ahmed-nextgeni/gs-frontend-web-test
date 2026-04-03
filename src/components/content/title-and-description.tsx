"use client";

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";

import Container from "@/components/shared/container";
import Heading from "@/components/shared/heading";

interface TitleAndDescriptionProps {
  data: {
    contentType: string;
    description?: any;
    internalName: string;
    title?: string;
  };
}

export default function TitleAndDescription({
  data,
}: TitleAndDescriptionProps) {
  if (!data.title && !data.description) {
    return null;
  }

  return (
    <Container className="">
      <div className="w-full rounded-md bg-white p-5 md:p-10">
        {data.title && (
          <Heading className="mb-4 text-lg lg:mb-6" variant="title">
            {data.title}
          </Heading>
        )}
        {data.description && (
          <div className="text-brand-muted lg:text-15px space-y-5 text-sm leading-7">
            {documentToReactComponents(data.description, {
              renderNode: {
                // SEO: Convert h1 to h2 to ensure only one h1 per page
                [BLOCKS.HEADING_1]: (_node, children) => (
                  <h2 className="text-brand-muted text-lg font-semibold lg:text-xl">
                    {children}
                  </h2>
                ),
                [BLOCKS.HEADING_2]: (_node, children) => (
                  <h3 className="text-brand-muted text-base font-semibold lg:text-lg">
                    {children}
                  </h3>
                ),
                [BLOCKS.HEADING_3]: (_node, children) => (
                  <h4 className="text-brand-muted text-sm font-semibold lg:text-base">
                    {children}
                  </h4>
                ),
                [BLOCKS.PARAGRAPH]: (_node, children) => (
                  <p className="mb-4 last:mb-0">{children}</p>
                ),
              },
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
