"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { queryKeys } from "@/lib/query-keys";

export function useAlertsRealtime(organizationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`alerts:${organizationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alerts",
          filter: `organization_id=eq.${organizationId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.alerts.all(organizationId),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.analytics.overview(organizationId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [organizationId, queryClient]);
}
