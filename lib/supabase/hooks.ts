"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchMenuItems,
  fetchMenuItemsByShop,
  fetchOrderByCode,
  fetchShopBySlug,
  fetchShops,
  fetchVendorOrdersByShop,
} from "@/lib/supabase/data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/mockData";

export function useShops() {
  return useQuery({
    queryKey: ["shops"],
    queryFn: fetchShops,
  });
}

export function useMenuItems() {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: fetchMenuItems,
  });
}

export function useShop(slug: string) {
  return useQuery({
    queryKey: ["shop", slug],
    queryFn: () => fetchShopBySlug(slug),
    enabled: Boolean(slug),
  });
}

export function useShopMenuItems(shopId?: string) {
  return useQuery({
    queryKey: ["shop-menu-items", shopId],
    queryFn: () => fetchMenuItemsByShop(shopId!),
    enabled: Boolean(shopId),
  });
}

export function useLiveOrder(code: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["order", code],
    queryFn: () => fetchOrderByCode(code),
    enabled: Boolean(code),
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !code) return;

    const channel = supabase
      .channel(`order:${code}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `pickup_code=eq.${code}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["order", code] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [code, queryClient]);

  return query;
}

export function useVendorOrders(shopId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["vendor-orders", shopId],
    queryFn: () => fetchVendorOrdersByShop(shopId!),
    enabled: Boolean(shopId),
  });

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !shopId) return;

    const channel = supabase
      .channel(`vendor-orders:${shopId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: `shop_id=eq.${shopId}`,
        },
        () => queryClient.invalidateQueries({ queryKey: ["vendor-orders", shopId] })
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => queryClient.invalidateQueries({ queryKey: ["vendor-orders", shopId] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, shopId]);

  return query;
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return;

      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
    },
  });
}
