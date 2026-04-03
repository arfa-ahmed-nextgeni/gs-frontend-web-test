import "server-only";

import { unstable_cache } from "next/cache";

import { contentfulClient } from "@/lib/clients/contentful";
import { CacheTags } from "@/lib/constants/cache/tags";
import { NavHeaderData } from "@/lib/types/contentful/nav-header";

export const getNavHeaderData = ({ entryId }: { entryId: string }) =>
  unstable_cache(
    async () => {
      const entry = await contentfulClient.getEntry(entryId, {
        include: 3,
      });

      return entry as unknown as NavHeaderData;
    },
    [entryId],
    {
      tags: [CacheTags.Contentful],
    }
  )();
