import type { ApiActivityEntry } from "@/lib/api-activity/api-activity-types";

export function ApiActivityHeadersList({
  headers,
  title,
}: {
  headers: ApiActivityEntry["request"]["headers"];
  title: string;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {headers.length === 0 ? (
        <div className="text-text-secondary rounded-xl border border-dashed p-3 text-sm">
          No headers recorded.
        </div>
      ) : (
        <div className="border-border-divider overflow-hidden rounded-xl border">
          {headers.map((header, index) => (
            <div
              className="border-border-divider grid grid-cols-[minmax(120px,180px)_minmax(0,1fr)] gap-3 border-b px-4 py-3 text-sm last:border-b-0"
              key={`${header.name}-${header.value}-${index}`}
            >
              <span className="text-text-secondary break-all font-medium">
                {header.name}
              </span>
              <span className="break-all">{header.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
