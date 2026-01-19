/**
 * EventCardSkeleton.tsx
 *
 * Purpose: Loading skeleton for event cards on homepage
 * Keeps exact layout and styling from Index.tsx
 */

interface EventCardSkeletonProps {
  count?: number;
}

export const EventCardSkeleton = ({ count = 3 }: EventCardSkeletonProps) => {
  return (
    <div className="border-t border-b border-[hsl(var(--divider))] animate-pulse">
      <div className="flex flex-col md:flex-row">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex-1 px-4 py-5 md:px-6 md:py-6 border-b md:border-b-0 md:border-r last:border-r-0 border-[hsl(var(--divider))]/40"
          >
            <div className="flex gap-4 items-start">
              <div className="min-w-[3.5rem]">
                <div className="h-3 w-8 bg-[hsl(var(--divider))]/40 rounded mb-2" />
                <div className="h-6 w-10 bg-[hsl(var(--divider))]/40 rounded" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-[hsl(var(--divider))]/40 rounded" />
                <div className="h-4 w-40 bg-[hsl(var(--divider))]/40 rounded" />
                <div className="h-3 w-32 bg-[hsl(var(--divider))]/30 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
