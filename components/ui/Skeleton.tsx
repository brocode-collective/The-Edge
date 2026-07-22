export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-secondary ${className}`} />;
}

export function FoodCardSkeleton() {
  return (
    <div className="h-full min-h-[300px] rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
      <Skeleton className="aspect-[5/3] rounded-none shrink-0" />
      <div className="p-3 flex-1 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-3 w-1/3" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ShopCardSkeleton() {
  return (
    <div className="w-full h-[220px] rounded-3xl border border-border bg-card overflow-hidden flex flex-col">
      <Skeleton className="h-[90px] w-full rounded-none shrink-0" />
      <div className="p-4 pt-3 flex-1 flex flex-col gap-2.5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
