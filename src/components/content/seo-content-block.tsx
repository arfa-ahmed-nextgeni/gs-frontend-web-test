"use client";

import { useState } from "react";

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";

import Container from "@/components/shared/container";

interface SeoContentBlockProps {
  data: {
    content?: any;
    contentType: string;
    internalName?: string;
  };
}

export default function SeoContentBlock({ data }: SeoContentBlockProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!data.content) {
    return null;
  }

  const title = data.internalName || "More information";

  return (
    <Container>
      <div className="w-full rounded-md bg-white">
        <button
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left md:px-6"
          onClick={() => setIsOpen((prev) => !prev)}
          type="button"
        >
          <span className="text-brand-muted text-base font-semibold lg:text-lg">
            {title}
          </span>
          <span
            className={`inline-block transform text-xl transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            ▾
          </span>
        </button>

        <div
          className={`border-t border-gray-100 transition-all duration-300 ${
            isOpen
              ? "max-h-[9999px] opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          }`}
        >
          <div className="p-5 md:p-10">
            <div className="text-brand-muted lg:text-15px space-y-5 text-sm leading-7">
              {documentToReactComponents(data.content, {
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
                  [BLOCKS.HEADING_4]: (_node, children) => (
                    <h5 className="text-brand-muted text-sm font-semibold">
                      {children}
                    </h5>
                  ),
                  [BLOCKS.HEADING_5]: (_node, children) => (
                    <h6 className="text-brand-muted text-xs font-semibold">
                      {children}
                    </h6>
                  ),
                  [BLOCKS.HEADING_6]: (_node, children) => (
                    <h6 className="text-brand-muted text-xs font-semibold">
                      {children}
                    </h6>
                  ),
                  [BLOCKS.HR]: () => <hr className="my-4 border-gray-300" />,
                  [BLOCKS.OL_LIST]: (_node, children) => (
                    <ol className="mb-4 list-decimal pl-6 last:mb-0">
                      {children}
                    </ol>
                  ),
                  [BLOCKS.PARAGRAPH]: (_node, children) => (
                    <p className="mb-4 last:mb-0">{children}</p>
                  ),
                  [BLOCKS.QUOTE]: (_node, children) => (
                    <blockquote className="mb-4 border-l-4 border-gray-300 pl-4 italic last:mb-0">
                      {children}
                    </blockquote>
                  ),
                  [BLOCKS.UL_LIST]: (_node, children) => (
                    <ul className="mb-4 list-disc pl-6 last:mb-0">
                      {children}
                    </ul>
                  ),
                  [INLINES.HYPERLINK]: (node, children) => (
                    <a
                      href={node.data.uri}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {children}
                    </a>
                  ),
                },
              })}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
