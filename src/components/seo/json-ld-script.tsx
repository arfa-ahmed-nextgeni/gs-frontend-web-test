import type { Thing, WithContext } from "schema-dts";

interface JsonLdScriptProps {
  data: WithContext<Thing> | WithContext<Thing>[];
  id?: string;
}

/**
 * Component to render JSON-LD structured data scripts
 *
 * @example
 * ```tsx
 * <JsonLdScript data={organizationSchema} id="organization-schema" />
 * ```
 */
export function JsonLdScript({ data, id }: JsonLdScriptProps) {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <>
      {jsonLd.map((item, index) => (
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
          id={id ? `${id}-${index}` : `schema-${index}`}
          key={id ? `${id}-${index}` : `schema-${index}`}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
