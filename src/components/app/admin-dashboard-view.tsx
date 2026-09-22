"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  LogOut,
  FileUp,
  FileText,
  FileDown,
  List,
  Trash2,
  Pencil,
  X,
  Eye,
  Plus,
  Upload,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  FileBarChart,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { formatBengaliNumber } from "@/lib/blog-utils";
import type { AnalyticsData, BlogListItem, CategoryInfo } from "@/lib/types";
import { OverviewTab } from "@/components/app/admin-overview";
import { AdminShop } from "@/components/app/admin-shop";
import { AffiliateManager } from "@/components/app/affiliate-manager";

export function AdminDashboardView() {
  const goAdminLogin = useAppStore((s) => s.goAdminLogin);
  const goHome = useAppStore((s) => s.goHome);
  const goBlogPost = useAppStore((s) => s.goBlogPost);
  const { toast } = useToast();

  const [checking, setChecking] = React.useState(true);
  const [authed, setAuthed] = React.useState(false);
  const [admin, setAdmin] = React.useState<{ name: string; email: string } | null>(null);
  const [categories, setCategories] = React.useState<CategoryInfo[]>([]);
  const [editingSlug, setEditingSlug] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("overview");

  const checkSession = React.useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session");
      const d = await res.json();
      if (d.authenticated) {
        setAuthed(true);
        setAdmin(d.admin);
      } else {
        goAdminLogin();
      }
    } finally {
      setChecking(false);
    }
  }, [goAdminLogin]);

  React.useEffect(() => {
    checkSession();
  }, [checkSession]);

  React.useEffect(() => {
    if (authed) {
      fetch("/api/categories")
        .then((r) => r.json())
        .then((d) => setCategories(d.categories || []))
        .catch(() => {});
    }
  }, [authed]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    toast({ title: "লগআউট হয়েছে" });
    goHome();
  };

  if (checking) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-bengali text-xl font-bold text-foreground sm:text-2xl">
            অ্যাডমিন ড্যাশবোর্ড
          </h1>
          <p className="font-bengali text-xs text-muted-foreground">
            স্বাগতম, {admin?.name || "Admin"} ({admin?.email})
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-1.5 font-bengali cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          লগআউট
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6">
          <TabsTrigger value="overview" className="gap-1.5 font-bengali">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">ওভারভিউ</span>
            <span className="sm:hidden">ওভার</span>
          </TabsTrigger>
          <TabsTrigger value="single" className="gap-1.5 font-bengali">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">একটি পাবলিশ</span>
            <span className="sm:hidden">একটি</span>
          </TabsTrigger>
          <TabsTrigger value="csv" className="gap-1.5 font-bengali">
            <FileUp className="h-4 w-4" />
            <span className="hidden sm:inline">CSV বাল্ক</span>
            <span className="sm:hidden">CSV</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5 font-bengali">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">সব ব্লগ</span>
            <span className="sm:hidden">তালিকা</span>
          </TabsTrigger>
          <TabsTrigger value="shop" className="gap-1.5 font-bengali">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">বই শপ</span>
            <span className="sm:hidden">শপ</span>
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="gap-1.5 font-bengali">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">অ্যাফিলিয়েট</span>
            <span className="sm:hidden">অ্যাফি.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="single">
          <SinglePublishForm
            categories={categories}
            editingSlug={editingSlug}
            onPublished={() => {}}
            onDoneEditing={() => {
              setEditingSlug(null);
              setActiveTab("list");
            }}
          />
        </TabsContent>

        <TabsContent value="csv">
          <CsvBulkUpload />
        </TabsContent>

        <TabsContent value="list">
          <BlogListManager
            onOpen={goBlogPost}
            onEdit={(slug) => {
              setEditingSlug(slug);
              setActiveTab("single");
            }}
          />
        </TabsContent>

        <TabsContent value="shop">
          <AdminShop />
        </TabsContent>

        <TabsContent value="affiliate">
          <AffiliateManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ============ Single publish form ============ */
function SinglePublishForm({
  categories,
  editingSlug,
  onPublished,
  onDoneEditing,
}: {
  categories: CategoryInfo[];
  editingSlug: string | null;
  onPublished: () => void;
  onDoneEditing: () => void;
}) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [featureImage, setFeatureImage] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [published, setPublished] = React.useState(true);
  const [enableSchedule, setEnableSchedule] = React.useState(false);
  const [scheduledAt, setScheduledAt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingEdit, setLoadingEdit] = React.useState(false);

  const isEditing = !!editingSlug;

  const resetForm = () => {
    setTitle("");
    setContent("");
    setFeatureImage("");
    setCategory("");
    setPublished(true);
    setEnableSchedule(false);
    setScheduledAt("");
  };

  // এডিট মোডে ঢুকলে বিদ্যমান পোস্টের raw ডেটা এনে ফর্ম fill করুন
  React.useEffect(() => {
    if (!editingSlug) {
      resetForm();
      return;
    }
    setLoadingEdit(true);
    fetch(`/api/blogs/${encodeURIComponent(editingSlug)}?edit=1`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.blog) return;
        setTitle(d.blog.title || "");
        setContent(d.blog.content || "");
        setFeatureImage(d.blog.featureImage || "");
        setCategory(d.blog.category?.name || "");
        setPublished(d.blog.published !== false);
        if (d.blog.scheduledAt) {
          setEnableSchedule(true);
          // datetime-local input চায় "YYYY-MM-DDTHH:mm" ফরম্যাটে (লোকাল টাইমে)
          const dt = new Date(d.blog.scheduledAt);
          const pad = (n: number) => String(n).padStart(2, "0");
          setScheduledAt(
            `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
          );
        } else {
          setEnableSchedule(false);
          setScheduledAt("");
        }
      })
      .catch(() => {
        toast({
          title: "ব্যর্থ",
          description: "পোস্টের তথ্য আনতে সমস্যা হয়েছে।",
          variant: "destructive",
        });
      })
      .finally(() => setLoadingEdit(false));
  }, [editingSlug, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "তথ্য অসম্পূর্ণ",
        description: "শিরোনাম ও বিষয়বস্তু দিন।",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        title,
        content,
        featureImage,
        category,
        published,
      };
      if (enableSchedule && scheduledAt) {
        payload.scheduledAt = new Date(scheduledAt).toISOString();
      } else if (isEditing) {
        payload.scheduledAt = null;
      }
      const res = await fetch(
        isEditing ? `/api/blogs/${encodeURIComponent(editingSlug!)}` : "/api/blogs",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({
        title: "সফল!",
        description: isEditing
          ? "ব্লগ আপডেট হয়েছে।"
          : enableSchedule
          ? "ব্লগ সিডিউল করা হয়েছে। নির্ধারিত সময়ে প্রকাশিত হবে।"
          : "ব্লগ পাবলিশ হয়েছে। meta স্বয়ংক্রিয়ভাবে তৈরি হয়েছে।",
      });
      resetForm();
      if (isEditing) onDoneEditing();
      onPublished();
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
    <Card className="p-5 sm:p-6">
      {isEditing && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5">
          <p className="flex items-center gap-1.5 font-bengali text-xs font-medium text-amber-700 dark:text-amber-300">
            <Pencil className="h-3.5 w-3.5" />
            পোস্ট এডিট করা হচ্ছে
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 font-bengali cursor-pointer"
            onClick={onDoneEditing}
          >
            <X className="h-3.5 w-3.5" />
            বাতিল
          </Button>
        </div>
      )}
      {loadingEdit ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="ব্লগের শিরোনাম লিখুন"
          />
          <p className="font-bengali text-[11px] text-muted-foreground">
            meta title স্বয়ংক্রিয়ভাবে এই শিরোনাম থেকে তৈরি হবে।
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content" className="font-bengali">
            বিষয়বস্তু <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="font-bengali min-h-[280px] resize-y"
            placeholder="<p>এখানে ব্লগের বিষয়বস্তু লিখুন (HTML সাপোর্টেড)...</p>"
          />
          <p className="font-bengali text-[11px] text-muted-foreground">
            HTML ট্যাগ ব্যবহার করুন (&lt;p&gt;, &lt;h2&gt;, &lt;ul&gt; ইত্যাদি)।
            meta description ও excerpt স্বয়ংক্রিয়ভাবে তৈরি হবে।
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="featureImage" className="font-bengali">
              ফিচার ইমেজ (URL)
            </Label>
            <Input
              id="featureImage"
              value={featureImage}
              onChange={(e) => setFeatureImage(e.target.value)}
              className="font-bengali"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="category" className="font-bengali">
              ক্যাটাগরি
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              list="cat-list"
              className="font-bengali"
              placeholder="নতুন বা বিদ্যমান ক্যাটাগরি"
            />
            <datalist id="cat-list">
              {categories.map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="published"
            checked={published}
            onCheckedChange={setPublished}
          />
          <Label htmlFor="published" className="font-bengali cursor-pointer">
            পাবলিশ করা হবে (অন)
          </Label>
        </div>

        {/* Schedule */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3.5">
          <div className="flex items-center gap-2">
            <Switch
              id="enableSchedule"
              checked={enableSchedule}
              onCheckedChange={setEnableSchedule}
            />
            <Label
              htmlFor="enableSchedule"
              className="flex items-center gap-1.5 font-bengali cursor-pointer"
            >
              <Clock className="h-3.5 w-3.5" />
              সিডিউল করে পাবলিশ করুন
            </Label>
          </div>
          {enableSchedule && (
            <div className="space-y-1.5">
              <Label htmlFor="scheduledAt" className="font-bengali text-xs">
                প্রকাশের তারিখ ও সময়
              </Label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="font-bengali"
              />
              <p className="font-bengali text-[11px] text-muted-foreground">
                এই সময়ের আগে ব্লগটি পাবলিক দেখা যাবে না। এডমিন প্রিভিউ করতে পারবেন।
              </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full gap-2 font-bengali cursor-pointer sm:w-auto"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isEditing ? (
            <Pencil className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {loading
            ? isEditing
              ? "আপডেট হচ্ছে..."
              : "পাবলিশ হচ্ছে..."
            : isEditing
            ? "ব্লগ আপডেট করুন"
            : "ব্লগ পাবলিশ করুন"}
        </Button>
      </form>
      )}
    </Card>
  );
}

/* ============ CSV Bulk upload ============ */
function CsvBulkUpload() {
  const { toast } = useToast();
  const [csvText, setCsvText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{
    created: number;
    scheduled: number;
    total: number;
    errors: string[];
  } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ""));
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvText.trim()) {
      toast({
        title: "CSV খালি",
        description: "CSV কনটেন্ট দিন বা ফাইল আপলোড করুন।",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/blogs/bulk-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult({
        created: data.created,
        scheduled: data.scheduled || 0,
        total: data.total,
        errors: data.errors || [],
      });
      toast({
        title: "সম্পন্ন!",
        description: `${formatBengaliNumber(data.created)} টি ব্লগ তৈরি হয়েছে${
          data.scheduled ? ` (${formatBengaliNumber(data.scheduled)} সিডিউলড)` : ""
        }।`,
      });
      if (data.created > 0) setCsvText("");
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

  const downloadTemplate = () => {
    const template = `title,content,feature image,category,schedule
"সূরা ফাতিহার ফজিলত","<p>সূরা ফাতিহা কুরআনের সর্বশ্রেষ্ঠ সূরা। এতে আল্লাহর প্রশংসা ও হেদায়েত প্রার্থনা করা হয়েছে।</p><p>রাসূলুল্লাহ (সা) বলেছেন, এটি কুরআনের মূল।</p>","https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800","কুরআন",""
"ইসতিগফারের গুরুত্ব","<p>ইসতিগফার গুনাহ মাফের অন্যতম উপায়। নূহ (আ)-এর সম্প্রদায়কে আল্লাহ ইসতিগফারের নির্দেশ দিয়েছিলেন।</p>","https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800","আমল","2025-12-25 09:00"
"তাসবিহ পড়ার ফজিলত","<p>তাসবিহ নামাজের পরের গুরুত্বপূর্ণ আমল।</p>","https://images.unsplash.com/photo-1591456983933-9c1f4b7c7b1a?w=800","আমল","2025-12-26 10:30"`;
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blog-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bengali text-base font-bold text-foreground">
              CSV দিয়ে বাল্ক পাবলিশ
            </h3>
            <p className="mt-0.5 font-bengali text-xs text-muted-foreground">
              কলাম: <code className="rounded bg-muted px-1">title</code>,{" "}
              <code className="rounded bg-muted px-1">content</code>,{" "}
              <code className="rounded bg-muted px-1">feature image</code>,{" "}
              <code className="rounded bg-muted px-1">category</code>,{" "}
              <code className="rounded bg-muted px-1">schedule</code>
              <span className="text-muted-foreground/80"> (ঐচ্ছিক)</span>
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="gap-1.5 font-bengali cursor-pointer"
          >
            <FileDown className="h-4 w-4" />
            টেমপ্লেট ডাউনলোড
          </Button>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFile}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              className="gap-1.5 font-bengali cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              CSV ফাইল আপলোড
            </Button>
            <span className="font-bengali text-[11px] text-muted-foreground">
              অথবা নিচে সরাসরি পেস্ট করুন
            </span>
          </div>

          <Textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={`title,content,feature image,category,schedule\n"শিরোনাম","<p>বিষয়বস্তু</p>","https://...","ক্যাটাগরি","2025-12-25 09:00"`}
            className="font-mono min-h-[220px] resize-y text-xs"
          />

          {/* helper note */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <p className="font-bengali text-[11px] leading-relaxed text-foreground/80">
              <strong>সিডিউল:</strong> ঐচ্ছিক <code className="rounded bg-muted px-1">schedule</code> কলামে তারিখ দিন। ফরম্যাট: <code className="rounded bg-muted px-1">YYYY-MM-DD HH:MM</code> বা ISO। খালি ছাড়লে সাথে সাথে পাবলিশ হবে।
              <br />
              <strong>ক্যাটাগরি:</strong> বিদ্যমান ক্যাটাগরির নাম মিললে সেটাই বসবে, নাহলে নতুন ক্যাটাগরি তৈরি হবে।
              <br />
              <strong>ইন্টারলিংকিং:</strong> প্রতিটি পোস্টে অটো ৮-১০ টা ইউনিক সম্পর্কিত পোস্টের লিংক যুক্ত হবে।
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={loading}
            className="w-full gap-2 font-bengali cursor-pointer sm:w-auto"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileUp className="h-4 w-4" />
            )}
            {loading ? "আপলোড হচ্ছে..." : "বাল্ক পাবলিশ করুন"}
          </Button>
        </div>
      </Card>

      {result && (
        <Card className="p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div className="flex-1">
              <p className="font-bengali text-sm font-semibold text-foreground">
                {formatBengaliNumber(result.created)} /{" "}
                {formatBengaliNumber(result.total)} টি ব্লগ সফলভাবে তৈরি হয়েছে
                {result.scheduled > 0 && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400">
                    ({formatBengaliNumber(result.scheduled)} সিডিউলড)
                  </span>
                )}
              </p>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="flex items-center gap-1.5 font-bengali text-xs font-medium text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {formatBengaliNumber(result.errors.length)} টি সমস্যা:
                  </p>
                  <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto custom-scroll rounded-lg bg-muted/40 p-3">
                    {result.errors.map((err, i) => (
                      <li
                        key={i}
                        className="font-bengali text-[11px] text-muted-foreground"
                      >
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============ Blog list manager ============ */
function BlogListManager({
  onOpen,
  onEdit,
}: {
  onOpen: (slug: string) => void;
  onEdit: (slug: string) => void;
}) {
  const { toast } = useToast();
  const [blogs, setBlogs] = React.useState<BlogListItem[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const load = React.useCallback((p: number) => {
    setLoading(true);
    fetch(`/api/blogs?all=true&page=${p}`)
      .then((r) => r.json())
      .then((d) => {
        setBlogs(d.blogs || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
        setPage(d.page || 1);
      })
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load(1);
  }, [load]);

  const handleDelete = async (slug: string) => {
    if (!confirm("এই ব্লগটি মুছে ফেলতে চান?")) return;
    setDeleting(slug);
    try {
      const res = await fetch(`/api/blogs/${encodeURIComponent(slug)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("মুছতে সমস্যা");
      toast({ title: "ব্লগ মুছে ফেলা হয়েছে" });
      load(page);
    } catch {
      toast({
        title: "ব্যর্থ",
        description: "মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bengali text-base font-bold text-foreground">
          সব ব্লগ ({formatBengaliNumber(total)})
        </h3>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="grid place-items-center py-12 text-center">
          <List className="h-10 w-10 text-muted-foreground/50" />
          <p className="mt-2 font-bengali text-sm text-muted-foreground">
            এখনও কোনো ব্লগ নেই।
          </p>
        </div>
      ) : (
        <div className="max-h-[55vh] space-y-2 overflow-y-auto custom-scroll pr-1">
          {blogs.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 rounded-lg border border-border/60 p-3 transition-colors hover:bg-accent/30"
            >
              <div className="h-12 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                {b.featureImage && (
                  <img
                    src={b.featureImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bengali line-clamp-1 text-sm font-semibold text-foreground">
                  {b.title}
                </p>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 font-bengali text-[11px] text-muted-foreground">
                  {b.category && (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      {b.category.name}
                    </Badge>
                  )}
                  <span className="flex items-center gap-0.5">
                    <Eye className="h-3 w-3" />
                    {formatBengaliNumber(b.views)}
                  </span>
                  {b.published ? (
                    b.live === false || (b.scheduledAt && new Date(b.scheduledAt).getTime() > Date.now()) ? (
                      <Badge className="border-amber-500/30 bg-amber-500/10 px-1.5 py-0 text-[10px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/15">
                        <Clock className="mr-0.5 h-2.5 w-2.5" />
                        সিডিউলড
                      </Badge>
                    ) : (
                      <Badge className="border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/15">
                        পাবলিশড
                      </Badge>
                    )
                  ) : (
                    <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                      ড্রাফট
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => onOpen(b.slug)}
                  aria-label="দেখুন"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer"
                  onClick={() => onEdit(b.slug)}
                  aria-label="এডিট"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(b.slug)}
                  disabled={deleting === b.slug}
                  aria-label="মুছুন"
                >
                  {deleting === b.slug ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="font-bengali cursor-pointer"
          >
            আগের
          </Button>
          <span className="font-bengali text-xs text-muted-foreground">
            {formatBengaliNumber(page)} / {formatBengaliNumber(totalPages)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(page + 1)}
            disabled={page >= totalPages}
            className="font-bengali cursor-pointer"
          >
            পরের
          </Button>
        </div>
      )}
    </Card>
  );
}
