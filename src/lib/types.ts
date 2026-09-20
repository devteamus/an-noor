// Shared client-side types for blog views
export interface BlogCategoryInfo {
  name: string;
  slug: string;
}

export interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featureImage: string | null;
  views: number;
  published?: boolean;
  scheduledAt?: string | null;
  live?: boolean;
  createdAt: string;
  category: BlogCategoryInfo | null;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  featureImage: string | null;
  views: number;
  createdAt: string;
  readingMinutes: number;
  category: BlogCategoryInfo | null;
}

export interface BlogListResponse {
  blogs: BlogListItem[];
  page: number;
  totalPages: number;
  total: number;
  perPage: number;
}

export interface BlogPostResponse {
  blog: BlogPost;
  related: BlogListItem[];
  formattedDate: string;
  interlinkStats?: {
    count: number;
    slugs: string[];
    minRequired: number;
  };
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface AnalyticsData {
  totals: {
    posts: number;
    published: number;
    scheduled: number;
    drafts: number;
    views: number;
  };
  viewsRange: {
    last7d: number;
    last15d: number;
    last30d: number;
  };
  dailySeries: { date: string; views: number }[];
  topPosts: {
    id: string;
    title: string;
    slug: string;
    views: number;
    published: boolean;
    scheduledAt: string | null;
  }[];
  categories: {
    id: string;
    name: string;
    slug: string;
    posts: number;
    views: number;
  }[];
}
