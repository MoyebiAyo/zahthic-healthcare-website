import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  FileText,
  HandHeart,
  HeartHandshake,
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
  coreFocusAreas,
  faqs,
  impactStats,
  mediaItems,
  partnerCategories,
  projects,
  recognitionItems,
  siteImages,
} from "../content";
import type { ImageAsset } from "../content";

export const CMS_STORAGE_KEY = "zahthic-cms-content-v2";
export const ADMIN_SESSION_KEY = "zahthic-admin-session";
export const ADMIN_USERNAME = "Healthyzeeceo";
export const ADMIN_PASSWORD = "LeaveZahthic360";

export type EditableService = {
  slug: string;
  title: string;
  division: string;
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

export type EditableTestimonial = {
  name: string;
  role: string;
  category: string;
  quote: string;
  photo: ImageAsset;
  videoLink: string;
  displayOrder: number;
  sample: boolean;
  featured: boolean;
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
  coreFocusAreas: typeof coreFocusAreas;
  siteImages: typeof siteImages;
  services: EditableService[];
  impactStats: typeof impactStats;
  projects: EditableProject[];
  articles: EditableArticle[];
  mediaItems: EditableMediaItem[];
  recognitionItems: EditableRecognitionItem[];
  partnerCategories: EditablePartnerCategory[];
  testimonials: EditableTestimonial[];
  faqs: EditableFaq[];
  contactOptions: EditableContactOption[];
  seoRecords: SeoRecord[];
  updatedAt: string;
};

export const iconRegistry: Record<string, LucideIcon> = {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  FileText,
  HandHeart,
  HeartHandshake,
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

const partnerIconNames = ["Landmark", "HandHeart", "Stethoscope", "FileText", "BriefcaseBusiness", "Sparkles"];
const contactIconNames = ["CalendarCheck", "HandHeart", "MapPin"];

const defaultTestimonials: EditableTestimonial[] = [
  {
    category: "Patient",
    displayOrder: 1,
    featured: true,
    name: "Mrs. Ada Okafor",
    photo: {
      src: siteImages.about.src,
      alt: "Generic professional portrait placeholder for Mrs. Ada Okafor",
    },
    published: true,
    quote: "The rehabilitation support I received helped me regain confidence in my daily activities. The team was professional, supportive, and focused on helping me achieve meaningful progress.",
    role: "Stroke Rehabilitation Patient",
    sample: true,
    videoLink: "",
  },
  {
    category: "Healthcare Professional",
    displayOrder: 2,
    featured: true,
    name: "Dr. Michael Eze",
    photo: {
      src: siteImages.partners.src,
      alt: "Generic professional portrait placeholder for Dr. Michael Eze",
    },
    published: true,
    quote: "Zahthic Healthcare Solutions demonstrates a strong commitment to patient-centered rehabilitation and collaborative healthcare delivery. Their approach reflects professionalism and quality care.",
    role: "Medical Practitioner",
    sample: true,
    videoLink: "",
  },
  {
    category: "Partner Organization",
    displayOrder: 3,
    featured: true,
    name: "Grace Community Initiative",
    photo: {
      src: siteImages.outreach.src,
      alt: "Generic professional organization image placeholder for Grace Community Initiative",
    },
    published: true,
    quote: "Our collaboration with Zahthic Healthcare Solutions contributed to a successful community health engagement. Their team brought professionalism, organization, and a genuine commitment to impact.",
    role: "Community Health Partner",
    sample: true,
    videoLink: "",
  },
];

const rehabilitationDescription = "Our rehabilitation services are designed to support recovery, restore function, reduce pain, improve mobility, and help individuals regain independence and participation in daily life.";
const workplaceDescription = "We provide workplace health solutions that promote employee wellbeing, reduce preventable injuries, improve productivity, and encourage healthier workplace practices.";
const communityDescription = "We work with communities, institutions, development partners, and stakeholders to improve health awareness, expand rehabilitation access, promote prevention, and strengthen community wellbeing.";

const defaultServices: EditableService[] = [
  {
    audience: "Rehabilitation Services",
    body: rehabilitationDescription,
    division: "Rehabilitation Services",
    featured: true,
    iconName: "Activity",
    image: {
      src: siteImages.outreach.src,
      alt: siteImages.outreach.alt,
    },
    published: true,
    slug: "physiotherapy",
    summary: "Evidence-based physiotherapy support to reduce pain, improve movement, restore function, and support everyday independence.",
    title: "Physiotherapy",
  },
  {
    audience: "Rehabilitation Services",
    body: rehabilitationDescription,
    division: "Rehabilitation Services",
    featured: true,
    iconName: "HeartPulse",
    image: {
      src: siteImages.partners.src,
      alt: siteImages.partners.alt,
    },
    published: true,
    slug: "neurorehabilitation",
    summary: "Specialized rehabilitation support for people living with neurological conditions affecting movement, balance, coordination, and daily function.",
    title: "Neurorehabilitation",
  },
  {
    audience: "Rehabilitation Services",
    body: rehabilitationDescription,
    division: "Rehabilitation Services",
    featured: true,
    iconName: "ShieldCheck",
    image: siteImages.partners,
    published: true,
    slug: "stroke-rehabilitation",
    summary: "Structured recovery support for stroke survivors, helping improve mobility, strength, confidence, and participation in daily life.",
    title: "Stroke Rehabilitation",
  },
  {
    audience: "Rehabilitation Services",
    body: rehabilitationDescription,
    division: "Rehabilitation Services",
    featured: true,
    iconName: "Stethoscope",
    image: {
      src: siteImages.about.src,
      alt: siteImages.about.alt,
    },
    published: true,
    slug: "musculoskeletal-rehabilitation",
    summary: "Care for injuries, pain, posture issues, joint limitations, and movement-related conditions affecting muscles, bones, and joints.",
    title: "Musculoskeletal Rehabilitation",
  },
  {
    audience: "Rehabilitation Services",
    body: rehabilitationDescription,
    division: "Rehabilitation Services",
    featured: true,
    iconName: "Home",
    image: siteImages.hero,
    published: true,
    slug: "home-care-physiotherapy",
    summary: "Professional rehabilitation support delivered in the comfort of the home for people who need accessible and continuous care.",
    title: "Home Care Physiotherapy",
  },
  {
    audience: "Workplace Health & Wellness",
    body: workplaceDescription,
    division: "Workplace Health & Wellness",
    featured: true,
    iconName: "BriefcaseBusiness",
    image: {
      src: siteImages.about.src,
      alt: siteImages.about.alt,
    },
    published: true,
    slug: "corporate-wellness",
    summary: "Workplace health programs that help organizations improve employee wellbeing, reduce preventable strain, and promote healthier habits.",
    title: "Corporate Wellness",
  },
  {
    audience: "Workplace Health & Wellness",
    body: workplaceDescription,
    division: "Workplace Health & Wellness",
    featured: true,
    iconName: "Building2",
    image: siteImages.partners,
    published: true,
    slug: "ergonomic-assessment",
    summary: "Practical assessments to identify posture, movement, and environmental risks that may contribute to pain or injury.",
    title: "Ergonomic Assessment",
  },
  {
    audience: "Workplace Health & Wellness",
    body: workplaceDescription,
    division: "Workplace Health & Wellness",
    featured: true,
    iconName: "Newspaper",
    image: {
      src: siteImages.partners.src,
      alt: siteImages.partners.alt,
    },
    published: true,
    slug: "workplace-health-education",
    summary: "Practical workplace health education that helps teams understand prevention, safer movement, wellbeing, and healthier daily practices.",
    title: "Workplace Health Education",
  },
  {
    audience: "Workplace Health & Wellness",
    body: workplaceDescription,
    division: "Workplace Health & Wellness",
    featured: true,
    iconName: "Users",
    image: {
      src: siteImages.about.src,
      alt: siteImages.about.alt,
    },
    published: true,
    slug: "staff-wellness-programs",
    summary: "Structured staff wellness programs that support employee wellbeing, prevention, healthier routines, and workplace productivity.",
    title: "Staff Wellness Programs",
  },
  {
    audience: "Community Health & Development",
    body: communityDescription,
    division: "Community Health & Development",
    featured: true,
    iconName: "Newspaper",
    image: siteImages.outreach,
    published: true,
    slug: "health-education",
    summary: "Clear, practical education that helps individuals and communities understand prevention, recovery, wellness, and long-term self-care.",
    title: "Health Education",
  },
  {
    audience: "Community Health & Development",
    body: communityDescription,
    division: "Community Health & Development",
    featured: true,
    iconName: "Users",
    image: siteImages.outreach,
    published: true,
    slug: "community-based-rehabilitation",
    summary: "Accessible rehabilitation and support programs designed around the realities, needs, and strengths of local communities.",
    title: "Community-Based Rehabilitation",
  },
  {
    audience: "Community Health & Development",
    body: communityDescription,
    division: "Community Health & Development",
    featured: true,
    iconName: "Megaphone",
    image: siteImages.outreach,
    published: true,
    slug: "outreach-programs",
    summary: "Community health initiatives that bring education, rehabilitation awareness, and wellness support closer to underserved populations.",
    title: "Outreach Programs",
  },
  {
    audience: "Community Health & Development",
    body: communityDescription,
    division: "Community Health & Development",
    featured: true,
    iconName: "Megaphone",
    image: siteImages.space,
    published: true,
    slug: "health-campaigns",
    summary: "Health campaigns that improve awareness, promote prevention, and mobilize communities around practical wellbeing priorities.",
    title: "Health Campaigns",
  },
  {
    audience: "Community Health & Development",
    body: communityDescription,
    division: "Community Health & Development",
    featured: true,
    iconName: "HandHeart",
    image: siteImages.space,
    published: true,
    slug: "community-wellness-initiatives",
    summary: "Community wellness initiatives that strengthen everyday health practices, prevention, rehabilitation access, and long-term wellbeing.",
    title: "Community Wellness Initiatives",
  },
];

export function getIcon(name = "Sparkles") {
  return iconRegistry[name] || Sparkles;
}

export function getDefaultCmsContent(): CmsContent {
  return {
    brand: { ...brand },
    coreFocusAreas: coreFocusAreas.map((area) => ({ ...area })),
    siteImages: { ...siteImages },
    services: defaultServices.map((service) => ({ ...service })),
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
      logo: { src: "", alt: `${partner.title} logo` },
      published: true,
      title: partner.title,
      website: "",
    })),
    testimonials: defaultTestimonials.map((testimonial) => ({ ...testimonial, photo: { ...testimonial.photo } })),
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

export function normalizeCmsContent(saved: Partial<CmsContent>): CmsContent {
  return mergeCmsContent(saved);
}

function mergeCmsContent(saved: Partial<CmsContent>): CmsContent {
  const fallback = getDefaultCmsContent();
  const legacyImpactLabels = new Set(["Care pathways", "Impact tracks", "Education resources", "Partner pathways"]);
  const savedImpactStats = saved.impactStats?.some((stat) => legacyImpactLabels.has(stat.label)) ? fallback.impactStats : saved.impactStats;
  const savedBrand = { ...fallback.brand, ...saved.brand };
  if (savedBrand.supporting.includes("rehabilitation-led healthcare organization focused on restoring function")) {
    savedBrand.supporting = fallback.brand.supporting;
  }
  if (!savedBrand.footerMotto || savedBrand.footerMotto.includes("rehabilitation-led healthcare organization focused on restoring function")) {
    savedBrand.footerMotto = fallback.brand.footerMotto;
  }
  if (!savedBrand.heroBody) savedBrand.heroBody = fallback.brand.heroBody;
  if (!savedBrand.heroEyebrow) savedBrand.heroEyebrow = fallback.brand.heroEyebrow;
  if (!savedBrand.spaceTeaser) savedBrand.spaceTeaser = fallback.brand.spaceTeaser;
  return {
    ...fallback,
    ...saved,
    brand: savedBrand,
    coreFocusAreas: saved.coreFocusAreas?.length ? saved.coreFocusAreas.map((area, index) => ({ ...fallback.coreFocusAreas[index % fallback.coreFocusAreas.length], ...area })) : fallback.coreFocusAreas,
    siteImages: { ...fallback.siteImages, ...saved.siteImages },
    services: saved.services?.length
      ? saved.services.map((service) => ({
          ...service,
          division: service.division || service.audience || "Rehabilitation Services",
        }))
      : fallback.services,
    impactStats: savedImpactStats?.length ? savedImpactStats : fallback.impactStats,
    projects: saved.projects?.length ? saved.projects : fallback.projects,
    articles: saved.articles?.length ? saved.articles : fallback.articles,
    mediaItems: saved.mediaItems?.length ? saved.mediaItems : fallback.mediaItems,
    recognitionItems: saved.recognitionItems?.length ? saved.recognitionItems : fallback.recognitionItems,
    partnerCategories: saved.partnerCategories?.length ? saved.partnerCategories : fallback.partnerCategories,
    testimonials: saved.testimonials?.length ? saved.testimonials : fallback.testimonials,
    faqs: saved.faqs?.length ? saved.faqs : fallback.faqs,
    contactOptions: saved.contactOptions?.length ? saved.contactOptions : fallback.contactOptions,
    seoRecords: saved.seoRecords?.length ? saved.seoRecords : fallback.seoRecords,
    updatedAt: saved.updatedAt || fallback.updatedAt,
  };
}
