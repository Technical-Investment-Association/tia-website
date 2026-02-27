import { Button } from "@/components/ui/button";
import type { AnyResource } from "@/types/resource";

function statusLabel(r: AnyResource) {
  if (r.archived) return "Archived";
  if (r.published) return "Published";
  return "Unpublished";
}

export function AdminResourceRow({
  resource,
  onEdit,
}: {
  resource: AnyResource;
  onEdit: () => void;
}) {
  return (
    <div className="py-6 border-b border-[hsl(var(--divider))]/40 flex flex-col md:flex-row md:items-center gap-5">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="text-lg font-semibold text-[hsl(var(--section-light-foreground))]">
            {resource.title}
          </h3>
          <span className="text-xs px-2 py-1 border border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]/70">
            {statusLabel(resource)}
          </span>
          <span className="text-xs px-2 py-1 border border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]/70">
            {resource.year}
          </span>
          {resource.tags?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-1 border border-[hsl(var(--divider))] text-[hsl(var(--section-light-foreground))]/60"
            >
              #{t}
            </span>
          ))}
        </div>

        <p className="mt-2 text-sm text-[hsl(var(--section-light-foreground))]/70 line-clamp-2">
          {resource.summary}
        </p>

        {resource.file_url ? (
          <p className="mt-2 text-xs text-[hsl(var(--section-light-foreground))]/60 break-all">
            PDF: {resource.file_url}
          </p>
        ) : null}
      </div>

      <div className="flex gap-3 md:justify-end">
        <Button variant="outline" onClick={onEdit}>
          Edit
        </Button>
        {resource.file_url ? (
          <Button asChild variant="outline">
            <a href={resource.file_url} target="_blank" rel="noreferrer">
              Open PDF
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
