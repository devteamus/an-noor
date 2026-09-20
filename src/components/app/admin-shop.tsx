"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Loader2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Save,
  Image as ImageIcon,
  ExternalLink,
  ShoppingBag,
  Settings2,
  List,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { formatBengaliNumber } from "@/lib/blog-utils";
import type { ShopProduct } from "@/components/app/shop-view";

/**
 * Admin shop management — 3 sub-tabs:
 *   1. Products (list, toggle active/inactive, delete, sort up/down)
 *   2. Add Product (productId + title + imageURL + price + live preview)
 *   3. Affiliate Settings (affId / affs / cma inputs + save)
 */
export function AdminShop() {
  return (
    <Tabs defaultValue="list" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="list" className="gap-1.5 font-bengali">
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">প্রোডাক্ট তালিকা</span>
          <span className="sm:hidden">তালিকা</span>
        </TabsTrigger>
        <TabsTrigger value="add" className="gap-1.5 font-bengali">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">নতুন প্রোডাক্ট</span>
          <span className="sm:hidden">নতুন</span>
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-1.5 font-bengali">
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">অ্যাফিলিয়েট সেটিংস</span>
          <span className="sm:hidden">সেটিংস</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <ProductsListTab />
      </TabsContent>
      <TabsContent value="add">
        <AddProductTab />
      </TabsContent>
      <TabsContent value="settings">
        <AffiliateSettingsTab />
      </TabsContent>
    </Tabs>
  );
}

/* ============ Products list (with active toggle, delete, sort) ============ */
function ProductsListTab() {
  const { toast } = useToast();
  const [products, setProducts] = React.useState<ShopProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    fetch("/api/shop?all=true")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleActive = async (p: ShopProduct) => {
    setBusy(p.id);
    try {
      const res = await fetch(`/api/shop/${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !p.active }),
      });
      if (!res.ok) throw new Error("আপডেট ব্যর্থ");
      toast({
        title: p.active ? "ইনঅ্যাক্টিভ হয়েছে" : "অ্যাক্টিভ হয়েছে",
      });
      load();
    } catch {
      toast({ title: "ব্যর্থ", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const handleDelete = async (p: ShopProduct) => {
    if (!confirm(`"${p.title}" মুছে ফেলতে চান?`)) return;
    setBusy(p.id);
    try {
      const res = await fetch(`/api/shop/${p.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("মুছতে সমস্যা");
      toast({ title: "প্রোডাক্ট মুছে ফেলা হয়েছে" });
      load();
    } catch {
      toast({ title: "ব্যর্থ", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  /**
   * Move a product up or down in the sort order. We swap sortOrder values
   * with the adjacent product and batch-update via /api/shop/sort.
   */
  const move = async (p: ShopProduct, dir: "up" | "down") => {
    const idx = products.findIndex((x) => x.id === p.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= products.length) return;
    const other = products[swapIdx];
    setBusy(p.id);
    try {
      const res = await fetch("/api/shop/sort", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { id: p.id, sortOrder: other.sortOrder },
            { id: other.id, sortOrder: p.sortOrder },
          ],
        }),
      });
      if (!res.ok) throw new Error("সর্ট ব্যর্থ");
      toast({ title: dir === "up" ? "উপরে সরানো হয়েছে" : "নিচে সরানো হয়েছে" });
      load();
    } catch {
      toast({ title: "ব্যর্থ", variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 sm:p-5">
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="grid place-items-center p-12 text-center">
        <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
        <p className="mt-2 font-bengali text-sm text-muted-foreground">
          এখনও কোনো প্রোডাক্ট নেই।{" "}
          <span className="font-medium text-foreground">নতুন প্রোডাক্ট</span>{" "}
          ট্যাবে যান।
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bengali text-base font-bold text-foreground">
          সব প্রোডাক্ট ({formatBengaliNumber(products.length)})
        </h3>
      </div>

      <div className="max-h-[60vh] space-y-2 overflow-y-auto custom-scroll pr-1">
        {products.map((p, idx) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-accent/30"
          >
            {/* Image */}
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
              {p.image ? (
                 
                <img
                  src={p.image}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <div className="grid h-full w-full place-items-center">
                  <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="min-w-0 flex-1">
              <p className="font-bengali line-clamp-1 text-sm font-semibold text-foreground">
                {p.title}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 font-bengali text-[11px] text-muted-foreground">
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  ID: {p.productId}
                </Badge>
                {p.price && (
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    ৳{p.price}
                  </span>
                )}
                {p.active ? (
                  <Badge className="border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
                    অ্যাক্টিভ
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                    ইনঅ্যাক্টিভ
                  </Badge>
                )}
              </div>
            </div>

            {/* Sort buttons */}
            <div className="hidden shrink-0 items-center gap-0.5 sm:flex">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => move(p, "up")}
                disabled={busy === p.id || idx === 0}
                aria-label="উপরে সরান"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => move(p, "down")}
                disabled={busy === p.id || idx === products.length - 1}
                aria-label="নিচে সরান"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Toggle active */}
            <div className="flex shrink-0 items-center gap-1.5">
              <Switch
                checked={p.active}
                onCheckedChange={() => toggleActive(p)}
                disabled={busy === p.id}
                aria-label="অ্যাক্টিভ টগল"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleDelete(p)}
                disabled={busy === p.id}
                aria-label="মুছুন"
              >
                {busy === p.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile-only sort buttons (one row per product, below) */}
      <p className="mt-3 hidden font-bengali text-[11px] text-muted-foreground sm:block">
        ↑↓ বাটনে প্রোডাক্টের ক্রম পরিবর্তন করুন।
      </p>
    </Card>
  );
}

/* ============ Add Product form with live preview ============ */
function AddProductTab() {
  const { toast } = useToast();
  const [productId, setProductId] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [image, setImage] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId.trim() || !title.trim()) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "Product ID ও শিরোনাম আবশ্যক।",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productId.trim(),
          title: title.trim(),
          image: image.trim() || null,
          price: price.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "যুক্ত করতে সমস্যা");
      toast({
        title: "সফল!",
        description: "প্রোডাক্ট যুক্ত হয়েছে ও শপে দেখা যাবে।",
      });
      setProductId("");
      setTitle("");
      setImage("");
      setPrice("");
    } catch (err) {
      toast({
        title: "ব্যর্থ",
        description: err instanceof Error ? err.message : "সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
      <Card className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="font-bengali text-base font-bold text-foreground">
            নতুন প্রোডাক্ট যুক্ত করুন
          </h3>

          <div className="space-y-1.5">
            <Label htmlFor="productId" className="font-bengali">
              Rokomari Product ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="font-bengali"
              placeholder="168407"
            />
            <p className="font-bengali text-[11px] text-muted-foreground">
              rokomari.com/product/&lt;ID&gt;/... থেকে শুধু ID দিন।
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="font-bengali">
              শিরোনাম <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="font-bengali"
              placeholder="বইয়ের নাম"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="image" className="font-bengali">
              ইমেজ URL
            </Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="font-bengali"
              placeholder="https://...jpg"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="font-bengali">
              মূল্য (৳)
            </Label>
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="font-bengali"
              placeholder="450"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full gap-2 font-bengali cursor-pointer sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {loading ? "যুক্ত হচ্ছে..." : "প্রোডাক্ট যুক্ত করুন"}
          </Button>
        </form>
      </Card>

      {/* Live preview card */}
      <Card className="w-full overflow-hidden p-0 md:w-56">
        <div className="bg-muted/30 px-4 py-2 font-bengali text-[11px] text-muted-foreground">
          লাইভ প্রিভিউ
        </div>
        <div className="aspect-square w-full overflow-hidden bg-muted/40">
          {image ? (
             
            <img
              src={image}
              alt={title || "preview"}
              className="h-full w-full object-contain p-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = "0.2";
              }}
            />
          ) : (
            <div className="grid h-full w-full place-items-center">
              <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
          )}
        </div>
        <div className="space-y-2 p-3">
          <p className="font-bengali line-clamp-2 text-sm font-semibold text-foreground">
            {title || "বইয়ের নাম"}
          </p>
          <p className="font-bengali text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {price ? `৳${price}` : "মূল্য নেই"}
          </p>
          <Button
            size="sm"
            disabled
            className="w-full gap-1.5 font-bengali opacity-90"
          >
            কিনুন
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

/* ============ Affiliate Settings (affId / affs / cma) ============ */
function AffiliateSettingsTab() {
  const { toast } = useToast();
  const [affId, setAffId] = React.useState("");
  const [affs, setAffs] = React.useState("");
  const [cma, setCma] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/affiliate-settings")
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings || {};
        setAffId(s.affId || "");
        setAffs(s.affs || "");
        setCma(s.cma || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/affiliate-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affId, affs, cma }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "সেভ ব্যর্থ");
      toast({
        title: "সেভ হয়েছে",
        description: `সকল শপ প্রোডাক্টের অ্যাফিলিয়েট URL রিবিল্ড হয়েছে (${formatBengaliNumber(
          data.rebuilt || 0
        )} টি)।`,
      });
    } catch (err) {
      toast({
        title: "ব্যর্থ",
        description: err instanceof Error ? err.message : "সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-5 sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-emerald-600" />
          <h3 className="font-bengali text-base font-bold text-foreground">
            অ্যাফিলিয়েট সেটিংস
          </h3>
        </div>
        <p className="font-bengali text-xs text-muted-foreground">
          এই তিনটি মান একবার সেভ করলে সকল শপ প্রোডাক্টের অ্যাফিলিয়েট URL
          স্বয়ংক্রিয়ভাবে রিবিল্ট হবে।
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="affId" className="font-bengali">
            affId
          </Label>
          <Input
            id="affId"
            value={affId}
            onChange={(e) => setAffId(e.target.value)}
            className="font-mono text-sm"
            placeholder="oIOmRo7k86or1AK"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="affs" className="font-bengali">
            affs
          </Label>
          <Input
            id="affs"
            value={affs}
            onChange={(e) => setAffs(e.target.value)}
            className="font-mono text-sm"
            placeholder="72292"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cma" className="font-bengali">
            cma
          </Label>
          <Input
            id="cma"
            value={cma}
            onChange={(e) => setCma(e.target.value)}
            className="font-mono text-sm"
            placeholder="604800"
          />
        </div>

        <Button
          type="submit"
          disabled={saving}
          className="w-full gap-2 font-bengali cursor-pointer sm:w-auto"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "সেভ হচ্ছে..." : "সেটিংস সেভ করুন"}
        </Button>
      </form>
    </Card>
  );
}

