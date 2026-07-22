"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ListOrdered, Utensils, BarChart3, Settings,
  Check, ChefHat, Bell, TrendingUp, DollarSign,
  Plus, Pencil, Power, Users, Trash2,
  ArrowLeft, ToggleLeft, ToggleRight, Upload,
  Search, X, RotateCcw, Printer, ChevronRight,
  Clock, MapPin, Hash, User
} from "lucide-react";
import { toast } from "sonner";
import { 
  useUpdateOrderStatus, 
  useDeleteVendorOrder,
  useUpdateShopHours,
  useCreateMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useVendorOrders, 
  useVendorSearch,
  useShopMenuItems,
  useSupabaseUser,
  useVendorShop,
  useUpdateMenuItemDietaryTags
} from "@/lib/supabase/hooks";
import { useSignOut } from "@/lib/supabase/useSignOut";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import type { OrderStatus } from "@/lib/types";
import type { VendorOrder } from "@/lib/supabase/data";

type Tab = "orders" | "menu" | "analytics" | "settings";

export default function VendorDashboard() {
  const params = useParams();
  const slug = params?.slug as string;
  const { data: user, isLoading: userLoading } = useSupabaseUser();
  const { data: shop, isLoading: shopLoading } = useVendorShop(slug, user?.id);
  const { data: menuItems = [] } = useShopMenuItems(shop?.id);
  const updateDietaryTags = useUpdateMenuItemDietaryTags(shop?.id);
  const createItemMutation = useCreateMenuItem(shop?.id);
  const updateItemMutation = useUpdateMenuItem(shop?.id);
  const deleteItemMutation = useDeleteMenuItem(shop?.id);
  const updateHoursMutation = useUpdateShopHours(slug);
  const deleteOrderMutation = useDeleteVendorOrder();
  const { signOut, isSigningOut } = useSignOut("/vendor/login");
  
  const [tab, setTab] = useState<Tab>("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month">("today");
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);

  // Menu Modal State
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Main",
    imageUrl: "",
    isAvailable: true,
  });

  // Settings State
  const [openingTime, setOpeningTime] = useState("08:00");
  const [closingTime, setClosingTime] = useState("22:00");

  useEffect(() => {
    if (shop) {
      setOpeningTime(shop.openingTime || "08:00");
      setClosingTime(shop.closingTime || "22:00");
    }
  }, [shop]);

  // Live orders query
  const { data: liveOrders = [], isLoading: ordersLoading } = useVendorOrders(shop?.id, dateFilter);
  const { data: searchResults = [] } = useVendorSearch(shop?.id, debouncedQuery, dateFilter);

  const updateOrderStatusMutation = useUpdateOrderStatus();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const ordersToDisplay = debouncedQuery ? searchResults : liveOrders;

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatusMutation.mutateAsync({ orderId, status });
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrderMutation.mutateAsync(orderId);
      if (selectedOrder?.id === orderId) setSelectedOrder(null);
      toast.success("Order deleted");
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const handleSaveHours = async () => {
    if (!shop?.id) return;
    try {
      await updateHoursMutation.mutateAsync({
        shopId: shop.id,
        openingTime,
        closingTime,
      });
      toast.success("Operating hours updated!");
    } catch {
      toast.error("Failed to update operating hours");
    }
  };

  const handleOpenItemModal = (item?: any) => {
    if (item) {
      setEditingItemId(item.id);
      setItemForm({
        title: item.title,
        description: item.description || "",
        price: item.price.toString(),
        category: item.category || "Main",
        imageUrl: item.image || "",
        isAvailable: item.isAvailable ?? true,
      });
    } else {
      setEditingItemId(null);
      setItemForm({
        title: "",
        description: "",
        price: "",
        category: "Main",
        imageUrl: "",
        isAvailable: true,
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop?.id) return;

    const priceNum = parseInt(itemForm.price, 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      if (editingItemId) {
        await updateItemMutation.mutateAsync({
          menuItemId: editingItemId,
          updates: {
            title: itemForm.title,
            description: itemForm.description,
            price_lkr: priceNum,
            category: itemForm.category,
            image_url: itemForm.imageUrl || null,
            is_available: itemForm.isAvailable,
          },
        });
        toast.success("Menu item updated");
      } else {
        await createItemMutation.mutateAsync({
          shopId: shop.id,
          title: itemForm.title,
          description: itemForm.description,
          priceLkr: priceNum,
          category: itemForm.category,
          imageUrl: itemForm.imageUrl,
          isAvailable: itemForm.isAvailable,
        });
        toast.success("Menu item created");
      }
      setIsItemModalOpen(false);
    } catch {
      toast.error("Failed to save menu item");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await deleteItemMutation.mutateAsync(itemId);
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const toggleDietaryTag = async (menuItemId: string, currentTags: string[], tag: "Vegan" | "Vegetarian") => {
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter((itemTag) => itemTag !== tag)
      : [...currentTags, tag];

    try {
      await updateDietaryTags.mutateAsync({ menuItemId, dietaryTags: nextTags });
      toast.success("Product tags updated");
    } catch {
      toast.error("Failed to update product tags");
    }
  };

  if (userLoading || shopLoading) {
    return (
      <div className="flex-1 grid place-items-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading vendor portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 grid place-items-center bg-background px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Vendor sign in required</h1>
          <p className="text-muted-foreground mt-3">Use the Google account approved for this shop.</p>
          <Link href="/vendor/login" className="pill bg-foreground text-background px-6 py-2.5 text-sm font-bold inline-flex mt-6">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex-1 grid place-items-center bg-background px-4">
        <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">No approved access</h1>
          <p className="text-muted-foreground mt-3">
            This shop is not approved for your Google account, or the shop does not exist.
          </p>
          <Link href="/vendor" className="pill bg-foreground text-background px-6 py-2.5 text-sm font-bold inline-flex mt-6">
            View my shops
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-secondary/20 flex overflow-hidden">
      {/* ── SIDEBAR (Desktop) ── */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-background h-screen z-30">
        <div className="p-6 border-b border-border bg-card/50">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl hero-gradient grid place-items-center text-white font-bold text-sm">E</div>
            <span className="font-bold tracking-tight">The Edge</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary border border-border grid place-items-center text-2xl">{shop.emoji}</div>
            <div className="min-w-0">
              <div className="font-bold truncate text-sm">{shop.name}</div>
              <div className={`text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider ${shop.isOpen ? "text-success" : "text-muted-foreground"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${shop.isOpen ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                {shop.isOpen ? "Live" : "Offline"}
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {[
            { id: "orders", label: "Live Orders", icon: ListOrdered },
            { id: "menu", label: "Menu Items", icon: Utensils },
            { id: "settings", label: "Store Settings", icon: Settings },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-border">
          <button onClick={signOut} disabled={isSigningOut} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50">
            <Power className="w-3 h-3" /> {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header / Tab Bar */}
        <header className="lg:hidden bg-background border-b border-border p-4 sticky top-0 z-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <div className="text-xl">{shop.emoji}</div>
               <span className="font-bold text-sm truncate">{shop.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${shop.isOpen ? "bg-success/10 text-success border border-success/20" : "bg-muted text-muted-foreground"}`}>
                {shop.isOpen ? "Accepting Orders" : "Closed"}
              </div>
              <button
                onClick={signOut}
                disabled={isSigningOut}
                className="w-8 h-8 rounded-full bg-secondary grid place-items-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                aria-label="Sign out"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["orders", "menu", "settings"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t as Tab)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap border capitalize transition-all ${
                  tab === t 
                    ? "bg-foreground text-background border-foreground" 
                    : "bg-secondary/50 text-muted-foreground border-transparent"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </header>

        {/* Global Toolbar */}
        <div className="bg-background border-b border-border px-6 py-4 flex items-center justify-between z-10 sticky top-0 hidden lg:flex">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold capitalize">{tab === "orders" ? "Orders Feed" : tab === "menu" ? "Menu Items" : "Settings"}</h1>
            {tab === "orders" && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Code, Ref, or Name..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-full bg-secondary/50 border-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-primary"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {tab === "orders" && (
              <div className="flex items-center gap-1 bg-secondary/50 rounded-full p-1 border border-border">
                {["today", "week", "month"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f as any)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                      dateFilter === f ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
            {tab === "menu" && (
              <Button onClick={() => handleOpenItemModal()} className="pill bg-primary text-primary-foreground text-xs font-bold px-4 py-2">
                <Plus className="w-4 h-4 mr-1.5" /> Add Menu Item
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          
          {/* ── ORDERS TAB ── */}
          {tab === "orders" && (
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              {/* Order Lists */}
              <div className="flex-1 space-y-8">
                <div className="grid md:grid-cols-2 gap-6 h-full content-start">
                  
                  {/* COLUMN: NEW / ACTIVE ORDERS */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-primary" />
                        <h2 className="font-bold text-sm uppercase tracking-widest">Active Orders</h2>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                        {ordersToDisplay.filter(o => o.status === "paid" || o.status === "preparing").length}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {ordersToDisplay.filter(o => o.status === "paid" || o.status === "preparing").map((o) => (
                        <OrderCard 
                          key={o.id} 
                          order={o} 
                          onClick={() => setSelectedOrder(o)}
                          onStatusChange={handleUpdateStatus}
                          onDeleteOrder={handleDeleteOrder}
                          isActive={selectedOrder?.id === o.id}
                        />
                      ))}
                      {ordersToDisplay.filter(o => o.status === "paid" || o.status === "preparing").length === 0 && (
                        <EmptyState message="All caught up!" icon={Check} />
                      )}
                    </div>
                  </div>

                  {/* COLUMN: READY FOR PICKUP */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-success" />
                        <h2 className="font-bold text-sm uppercase tracking-widest">Ready for Pickup</h2>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold">
                        {ordersToDisplay.filter(o => o.status === "ready").length}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {ordersToDisplay.filter(o => o.status === "ready").map((o) => (
                        <OrderCard 
                          key={o.id} 
                          order={o} 
                          onClick={() => setSelectedOrder(o)}
                          onStatusChange={handleUpdateStatus}
                          onDeleteOrder={handleDeleteOrder}
                          isActive={selectedOrder?.id === o.id}
                        />
                      ))}
                      {ordersToDisplay.filter(o => o.status === "ready").length === 0 && (
                        <EmptyState message="Nothing ready yet" icon={Clock} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Receipt Preview Pane (Desktop) */}
              <AnimatePresence>
                {selectedOrder && (
                  <motion.div 
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="hidden lg:block w-[400px] bg-background border border-border rounded-[2.5rem] p-6 sticky top-0 h-fit"
                  >
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold uppercase tracking-widest text-xs text-muted-foreground">Receipt Preview</h3>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-2 hover:bg-destructive/10 text-destructive rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-secondary rounded-full">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <ReceiptPreview order={selectedOrder} />
                    <div className="mt-8 flex gap-3">
                       <Button variant="outline" className="flex-1 pill h-11 text-sm" onClick={() => window.print()}>
                         <Printer className="w-4 h-4 mr-2" /> Print Ticket
                       </Button>
                       {selectedOrder.status === "ready" ? (
                         <Button className="flex-1 pill h-11 text-sm bg-success hover:bg-success/90 text-white font-bold" onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}>
                           <Check className="w-4 h-4 mr-2" /> Complete
                         </Button>
                       ) : (
                         <Button className="flex-1 pill h-11 text-sm bg-foreground text-background font-bold" onClick={() => handleUpdateStatus(selectedOrder.id, "ready")}>
                           <Bell className="w-4 h-4 mr-2" /> Make Ready
                         </Button>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ── MENU TAB ── */}
          {tab === "menu" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Menu items</h2>
                  <p className="text-sm text-muted-foreground mt-1">Manage your shop items, prices, and dietary tags.</p>
                </div>
                <Button onClick={() => handleOpenItemModal()} className="pill bg-primary text-primary-foreground text-xs font-bold px-4 py-2">
                  <Plus className="w-4 h-4 mr-1.5" /> Add Menu Item
                </Button>
              </div>

              <div className="grid gap-4">
                {menuItems.map((item) => (
                  <div key={item.id} className="rounded-3xl border border-border bg-card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold tracking-tight text-lg">{item.title}</span>
                        {!item.isAvailable && (
                          <span className="px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-[10px] font-bold">Unavailable</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{item.category} · Rs {item.price.toFixed(0)}</div>
                      {item.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.description}</div>}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex flex-wrap gap-2">
                        {(["Vegan", "Vegetarian"] as const).map((tag) => {
                          const active = item.dietaryTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => toggleDietaryTag(item.id, item.dietaryTags, tag)}
                              disabled={updateDietaryTags.isPending}
                              className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-60 ${
                                active
                                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                                  : "border-border bg-secondary/50 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {active && <Check className="mr-1 inline h-3 w-3" />}
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenItemModal(item)} className="pill">
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)} className="pill border-destructive/30 text-destructive hover:bg-destructive/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {menuItems.length === 0 && (
                  <EmptyState message="No menu items yet" icon={Utensils} />
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {tab === "settings" && (
            <div className="max-w-xl space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Store Settings</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure daily operating hours and availability.</p>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Daily Operating Hours</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Opening Time</label>
                      <Input
                        type="time"
                        value={openingTime}
                        onChange={(e) => setOpeningTime(e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Closing Time</label>
                      <Input
                        type="time"
                        value={closingTime}
                        onChange={(e) => setClosingTime(e.target.value)}
                        className="rounded-2xl"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveHours} disabled={updateHoursMutation.isPending} className="pill bg-foreground text-background w-full">
                    {updateHoursMutation.isPending ? "Saving..." : "Save Operating Hours"}
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Appearance</h3>
                    <p className="text-xs text-muted-foreground">Switch between light and dark theme modes</p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── EDIT / CREATE MENU ITEM MODAL ── */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-background border border-border rounded-3xl p-6 space-y-5"
            >
              <div className="flex justify-between items-center border-b border-border pb-4">
                <h3 className="font-bold text-lg">{editingItemId ? "Edit Menu Item" : "Add Menu Item"}</h3>
                <button onClick={() => setIsItemModalOpen(false)} className="p-2 hover:bg-secondary rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title</label>
                  <Input
                    required
                    value={itemForm.title}
                    onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                    placeholder="e.g. Chicken Burger"
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price (LKR)</label>
                    <Input
                      required
                      type="number"
                      value={itemForm.price}
                      onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })}
                      placeholder="550"
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</label>
                    <Input
                      required
                      value={itemForm.category}
                      onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                      placeholder="e.g. Mains, Beverages"
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                  <Input
                    value={itemForm.description}
                    onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                    placeholder="Brief details..."
                    className="rounded-2xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Image URL</label>
                  <Input
                    value={itemForm.imageUrl}
                    onChange={(e) => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="rounded-2xl"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="isAvailable" className="text-sm font-semibold cursor-pointer">
                    Available for customers
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsItemModalOpen(false)} className="flex-1 pill">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 pill bg-foreground text-background font-bold">
                    Save Item
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Receipt Bottom Sheet */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-4">
             <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="w-full max-w-md bg-background border border-border rounded-t-[2.5rem] p-6 overflow-y-auto max-h-[90vh]"
             >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1 bg-secondary rounded-full" />
                </div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold">Order Details</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleDeleteOrder(selectedOrder.id)} className="p-2 bg-destructive/10 text-destructive rounded-full">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSelectedOrder(null)} className="p-2 bg-secondary rounded-full">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <ReceiptPreview order={selectedOrder} />
                <div className="mt-8 space-y-3">
                   <Button className="w-full pill h-11 text-sm font-bold" onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status === "ready" ? "completed" : "ready")}>
                      {selectedOrder.status === "ready" ? "Mark as Completed" : "Mark as Ready"}
                   </Button>
                   <Button variant="outline" className="w-full pill h-11 text-sm" onClick={() => setSelectedOrder(null)}>
                      Close
                   </Button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── SUB-COMPONENTS ──

function OrderCard({ 
  order, 
  onClick, 
  onStatusChange,
  onDeleteOrder,
  isActive 
}: { 
  order: VendorOrder, 
  onClick: () => void,
  onStatusChange: (id: string, status: OrderStatus) => void,
  onDeleteOrder: (id: string) => void,
  isActive: boolean
}) {
  return (
    <motion.div 
      layout
      onClick={onClick}
      className={`group relative rounded-3xl border p-5 cursor-pointer transition-all ${
        isActive 
          ? "bg-foreground text-background border-foreground z-10" 
          : "bg-card border-border hover:border-primary/50"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={`font-mono font-black text-lg tracking-tighter ${isActive ? "text-primary" : "text-primary"}`}>
            #{order.code}
          </span>
          {order.scheduledSlot !== "ASAP" && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${isActive ? "bg-white/10 text-white" : "bg-secondary text-muted-foreground"}`}>
              <Clock className="w-2.5 h-2.5" /> {order.scheduledSlot}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium ${isActive ? "text-background/60" : "text-muted-foreground"}`}>
            {order.time}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteOrder(order.id);
            }}
            className={`p-1 rounded-md transition-colors ${isActive ? "hover:bg-white/20 text-white/80" : "hover:bg-destructive/10 text-muted-foreground hover:text-destructive"}`}
            title="Delete Order"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        {order.itemDetails.map((it, idx) => (
          <div key={idx} className="flex justify-between items-start gap-4">
            <span className={`text-sm font-semibold line-clamp-1 ${isActive ? "text-background" : "text-foreground"}`}>
              {it.quantity}× {it.title}
            </span>
            <span className={`font-mono text-xs ${isActive ? "text-background/70" : "text-muted-foreground"}`}>
              Rs {it.quantity * it.unitPrice}
            </span>
          </div>
        ))}
      </div>

      {order.note && (
        <div className={`text-[11px] rounded-xl px-3 py-2 mb-4 italic ${isActive ? "bg-white/10 text-white/90" : "bg-warning/10 text-warning-foreground"}`}>
          &ldquo;{order.note}&rdquo;
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-current/10">
        <div className="flex items-center gap-2">
           <User className="w-3 h-3 opacity-60" />
           <span className="text-[11px] font-bold uppercase tracking-widest">{order.customerName}</span>
        </div>
        
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {order.status !== "ready" ? (
            <button
              onClick={() => onStatusChange(order.id, "ready")}
              className={`pill text-[10px] font-bold px-4 py-2 transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground hover:bg-primary-glow" 
                  : "bg-foreground text-background hover:bg-foreground/80"
              }`}
            >
              Make Ready
            </button>
          ) : (
            <button
              onClick={() => onStatusChange(order.id, "completed")}
              className={`pill text-[10px] font-bold px-4 py-2 transition-all ${
                isActive 
                  ? "bg-success text-success-foreground hover:opacity-90" 
                  : "bg-success text-success-foreground hover:opacity-90"
              }`}
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ReceiptPreview({ order }: { order: VendorOrder }) {
  const formattedRef = order.referenceNumber.replace(/^RF (\d{4}) (\d{6}) (\d{4})$/, "#RF $1 $2 $3");

  return (
    <div className="receipt-print-container bg-white text-black p-8 rounded-lg font-sans border-2 border-dashed border-gray-200">
      <div className="text-center mb-6">
        <h4 className="font-black text-xl tracking-tighter uppercase mb-1">Order Ticket</h4>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest">{order.createdAt}</div>
      </div>

      <div className="flex flex-col items-center mb-8 py-6 border-y-2 border-black border-dashed">
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500">Pickup Code</div>
        <div className="text-6xl font-black tracking-tighter">{order.code}</div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
          <span className="text-[10px] font-bold uppercase text-gray-400">Customer</span>
          <span className="font-bold text-sm">{order.customerName}</span>
        </div>
        <div className="flex justify-between items-end border-b border-gray-100 pb-2">
          <span className="text-[10px] font-bold uppercase text-gray-400">Scheduled For</span>
          <span className="font-bold text-sm">{order.scheduledSlot}</span>
        </div>
      </div>

      <div className="space-y-3 mb-8">
        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Order Items</div>
        {order.itemDetails.map((it, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="font-bold">{it.quantity}× {it.title}</span>
            <span className="font-mono">Rs {it.quantity * it.unitPrice}</span>
          </div>
        ))}
        <div className="pt-4 border-t-2 border-black border-dotted flex justify-between items-center">
          <span className="font-black uppercase text-sm">Total Paid</span>
          <span className="font-mono font-black text-lg">Rs {order.total}</span>
        </div>
      </div>

      {order.note && (
        <div className="bg-gray-50 p-3 rounded-md mb-8">
          <div className="text-[10px] font-bold uppercase text-gray-400 mb-1">Notes</div>
          <p className="text-xs italic leading-relaxed">&ldquo;{order.note}&rdquo;</p>
        </div>
      )}

      <div className="text-center pt-4 border-t border-gray-100">
        <div className="text-[10px] font-bold text-gray-400 mb-1">REFERENCE NUMBER</div>
        <div className="font-mono text-[11px] font-bold tracking-tighter">{formattedRef}</div>
      </div>
      
      <div className="mt-8 flex justify-center opacity-10">
        <div className="w-12 h-12 border-4 border-black rounded-full" />
      </div>
    </div>
  );
}

function EmptyState({ message, icon: Icon }: { message: string, icon: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[2.5rem] bg-background/40 border-2 border-dashed border-border/50 text-muted-foreground">
      <div className="w-12 h-12 rounded-2xl bg-secondary/50 grid place-items-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
