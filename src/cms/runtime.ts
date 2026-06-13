import {
  Activity,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  FileText,
  HandHeart,
  HeartPulse,
  Home,
  Landmark,
  MapPin,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  articles,
  brand,
  contactOptions,
  faqs,
  impactStats,
  mediaItems,
  partnerCategories,
  projects,
  recognitionItems,
  services,
  siteImages,
} from "../content";
import type { ImageAsset } from "../content";

export const CMS_STORAGE_KEY = "zahthic-cms-content-v1";
export const ADMIN_SESSION_KEY = "zahthic-admin-session";
export const ADMIN_USERNAME = "admin";
export const ADMIN_PASSWORD = "ZahthicAdmin2026!";

export type EditableService = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  iconName: string;
  image: ImageAsset;
  body: string;
  featured: boolean;
  published: boolean;
};

export type EditableProject = {
  title: string;
  category: string;
  location: string;
  summary: string;
  metric: string;
  image: ImageAsset;
  gallery: ImageAsset[];
  published: boolean;
};

export type EditableArticle = {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  image: ImageAsset;
  body: string;
  author: string;
  publishedAt: string;
  published: boolean;
};

export type EditableMediaItem = {
  title: string;
  type: string;
  description: string;
  image: ImageAsset;
  fileUrl: string;
  published: boolean;
};

export type EditableRecognitionItem = {
  title: string;
  category: string;
  summary: string;
  image: ImageAsset;
  published: boolean;
};

export type EditablePartnerCategory = {
  title: string;
  iconName: string;
  website: string;
  logo?: ImageAsset;
  published: boolean;
};

export type EditableFaq = {
  question: string;
  answer: string;
  published: boolean;
};

export type EditableContactOption = {
  title: string;
  text: string;
  iconName: string;
  published: boolean;
};

export type SeoRecord = {
  path: string;
  title: string;
  description: string;
  ogImage?: string;
};

export type CmsContent = {
  brand: typeof brand;
  siteImages: typeof siteImages;
  services: EditableService[];
  impactStats: typeof impactStats;
  projects: EditableProject[];
  articles: EditableArticle[];
  mediaItems: EditableMediaItem[];
  recognitionItems: EditableRecognitionItem[];
  partnerCategories: EditablePartnerCategory[];
  faqs: EditableFaq[];
  contactOptions: EditableContactOption[];
  seoRecords: SeoRecord[];
  updatedAt: string;
};

export const iconRegistry: Record<string, LucideIcon> = {
  Activity,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  FileText,
  HandHeart,
  HeartPulse,
  Home,
  Landmark,
  MapPin,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
};

export const iconOptions = Object.keys(iconRegistry);

const serviceIconNames = [
  "Activity",
  "HeartPulse",
  "ShieldCheck",
  "Stethoscope",
  "Home",
  "BriefcaseBusiness",
  "Building2",
  "Newspaper",
  "Users",
  "Megaphone",
];

const partnerIconNames = ["Landmark", "HandHeart", "Stethoscope", "FileText", "BriefcaseBusiness", "Sparkles"];
const contactIconNames = ["CalendarCheck", "HandHeart", "MapPin"];

export function getIcon(name = "Sparkles") {
  return iconRegistry[name] || Sparkles;
}

export function getDefaultCmsContent(): CmsContent {
  return {
    brand: { ...brand },
    siteImages: { ...siteImages },
    services: services.map((service, index) => ({
      audience: service.audience,
      body: `${service.summary}\n\nZahthic provides assessment, education, practical support planning, and follow-up guidance for this care pathway.`,
      featured: index < 6,
      iconName: serviceIconNames[index] || "Sparkles",
      image: service.image,
      published: true,
      slug: service.slug,
      summary: service.summary,
      title: service.title,
    })),
    impactStats: impactStats.map((stat) => ({ ...stat })),
    projects: projects.map((project) => ({
      ...project,
      gallery: [project.image],
      published: true,
    })),
    articles: articles.map((article) => ({
      ...article,
      author: "Zahthic Healthcare Solutions",
      body: `${article.excerpt}\n\nThis article can be expanded from the admin dashboard with practical guidance, approved clinical notes, media, references, and calls to action.`,
      published: true,
      publishedAt: new Date().toISOString().slice(0, 10),
    })),
    mediaItems: mediaItems.map((item) => ({
      ...item,
      fileUrl: "",
      published: true,
    })),
    recognitionItems: recognitionItems.map((item) => ({
      ...item,
      category: "Spotlight",
      published: true,
      summary: "CMS-managed spotlight content with image, summary, category, and publishing status.",
    })),
    partnerCategories: partnerCategories.map((partner, index) => ({
      iconName: partnerIconNames[index] || "Sparkles",
      published: true,
      title: partner.title,
      website: "",
    })),
    faqs: faqs.map((faq) => ({ ...faq, published: true })),
    contactOptions: contactOptions.map((option, index) => ({
      iconName: contactIconNames[index] || "Sparkles",
      published: true,
      text: option.text,
      title: option.title,
    })),
    seoRecords: [
      {
        description: "Premium rehabilitation, prevention, wellness, healthcare education, and community impact support in Imo State, Nigeria.",
        path: "/",
        title: "Zahthic Healthcare Solutions",
      },
      {
        description: "Integrated rehabilitation, wellness, prevention, home care, workplace support, and community health services.",
        path: "/services",
        title: "Services | Zahthic Healthcare Solutions",
      },
      {
        description: "Health education, rehabilitation tips, wellness insights, community updates, press releases, research notes, and project reports.",
        path: "/blog",
        title: "Blog | Zahthic Healthcare Solutions",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function readCmsContent(): CmsContent {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) return getDefaultCmsContent();
    return mergeCmsContent(JSON.parse(raw) as Partial<CmsContent>);
  } catch {
    return getDefaultCmsContent();
  }
}

export function writeCmsContent(content: CmsContent) {
  localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify({ ...content, updatedAt: new Date().toISOString() }));
  window.dispatchEvent(new CustomEvent("zahthic:cms"));
}

export function resetCmsContent() {
  const next = getDefaultCmsContent();
  writeCmsContent(next);
  return next;
}

function mergeCmsContent(saved: Partial<CmsContent>): CmsContent {
  const fallback = getDefaultCmsContent();
  return {
    ...fallback,
    ...saved,
    brand: { ...fallback.brand, ...saved.brand },
    siteImages: { ...fallback.siteImages, ...saved.siteImages },
    services: saved.services?.length ? saved.services : fallback.services,
    impactStats: saved.impactStats?.length ? saved.impactStats : fallback.impactStats,
    projects: saved.projects?.length ? saved.projects : fallback.projects,
    articles: saved.articles?.length ? saved.articles : fallback.articles,
    mediaItems: saved.mediaItems?.length ? saved.mediaItems : fallback.mediaItems,
    recognitionItems: saved.recognitionItems?.length ? saved.recognitionItems : fallback.recognitionItems,
    partnerCategories: saved.partnerCategories?.length ? saved.partnerCategories : fallback.partnerCategories,
    faqs: saved.faqs?.length ? saved.faqs : fallback.faqs,
    contactOptions: saved.contactOptions?.length ? saved.contactOptions : fallback.contactOptions,
    seoRecords: saved.seoRecords?.length ? saved.seoRecords : fallback.seoRecords,
    updatedAt: saved.updatedAt || fallback.updatedAt,
  };
}
