"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCategoryTrends } from "@/lib/analytics/category-trends";
import { queryKeys } from "@/lib/query-keys";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CategoryTrendsProps = {
  organizationId: string;
};

function TrendList({
  title,
  items,
  emptyMessage,
}: {
  title: string;
  items: { id: string; label: string; count: number }[];
  emptyMessage: string;
}) {
  const maxCount = items[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 8).map((item) => (
              <li key={item.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function CategoryTrends({ organizationId }: CategoryTrendsProps) {
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.analytics.categories(organizationId),
    queryFn: fetchCategoryTrends,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-sm text-destructive">
        Failed to load category trends.
      </div>
    );
  }

  if (!data.complaints.length && !data.praise.length) {
    return (
      <EmptyState
        title="No feedback trends yet"
        description="Complete and analyze customer conversations to see complaint and praise patterns."
        actions={[{ label: "View conversations", href: "/conversations" }]}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TrendList
        title="Top complaints"
        items={data.complaints}
        emptyMessage="No complaint categories yet."
      />
      <TrendList
        title="Top praise"
        items={data.praise}
        emptyMessage="No praise categories yet."
      />
    </div>
  );
}
