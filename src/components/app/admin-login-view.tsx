"use client";

import * as React from "react";
import { useAppStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2, LogOut, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export function AdminLoginView() {
  const goAdminDashboard = useAppStore((s) => s.goAdminDashboard);
  const goHome = useAppStore((s) => s.goHome);
  const { toast } = useToast();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const [alreadyAuth, setAlreadyAuth] = React.useState(false);

  // check existing session
  React.useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated) {
          setAlreadyAuth(true);
          goAdminDashboard();
        }
      })
      .finally(() => setChecking(false));
  }, [goAdminDashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "লগইন ব্যর্থ",
          description: data.error || "আবার চেষ্টা করুন।",
          variant: "destructive",
        });
      } else {
        toast({
          title: "স্বাগতম",
          description: "সফলভাবে লগইন হয়েছে।",
        });
        goAdminDashboard();
      }
    } catch {
      toast({
        title: "সমস্যা",
        description: "নেটওয়ার্ক সমস্যা হয়েছে।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="mx-auto max-w-md">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-emerald-500/30 p-0">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center text-white">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-3 font-bengali text-xl font-bold">
              অ্যাডমিন লগইন
            </h1>
            <p className="mt-1 font-bengali text-xs text-white/80">
              ব্লগ পাবলিশ করতে লগইন করুন
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-bengali">
                ইমেইল
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-bengali"
                placeholder="আপনার ইমেইল"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="font-bengali">
                পাসওয়ার্ড
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-bengali"
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full gap-2 font-bengali cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LayoutDashboard className="h-4 w-4" />
              )}
              {loading ? "লগইন হচ্ছে..." : "ড্যাশবোর্ডে যান"}
            </Button>

            {alreadyAuth && (
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="w-full gap-2 font-bengali cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                লগআউট
              </Button>
            )}
          </form>

        </Card>
      </motion.div>
    </div>
  );
}
