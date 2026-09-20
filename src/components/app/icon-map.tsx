import * as React from "react";
import {
  HandHeart,
  Sun,
  Wheat,
  Sparkles,
  Sunrise,
  Sunset,
  Moon,
  Star,
  History,
  Home,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Target,
  Trash2,
  Award,
  Clock,
  Shield,
  Droplets,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  HandHeart,
  Sun,
  Wheat,
  Sparkles,
  Sunrise,
  Sunset,
  Moon,
  Star,
  History,
  Home,
  RotateCcw,
  Plus,
  Minus,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Target,
  Trash2,
  Award,
  Clock,
  Shield,
  Droplets,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? BookOpen;
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = getIcon(name);
  return React.createElement(Icon, { className });
}
