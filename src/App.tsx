import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle2,
  Clock,
  Download,
  HeartHandshake,
  Mail,
  Menu,
  Moon,
  Phone,
  Send,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react";
import { cmsSchemas } from "./cms/schemas";
import {
  ADMIN_PASSWORD,
  ADMIN_SESSION_KEY,
  ADMIN_USERNAME,
  CMS_STORAGE_KEY,
  getDefaultCmsContent,
  getIcon,
  iconOptions,
  normalizeCmsContent,
  readCmsContent,
  resetCmsContent,
  writeCmsContent,
} from "./cms/runtime";
import type { CmsContent, EditableArticle, EditableMediaItem, EditablePartnerCategory, EditableProject, EditableRecognitionItem, EditableService } from "./cms/runtime";
import logoDark from "./assets/zahthic-logo-2.svg";
import logoLight from "./assets/zahthic-logo-1.svg";
import spaceLogoDarkText from "./assets/space-logo-dark-text.png";
import spaceLogoLightText from "./assets/space-logo-light-text.png";
import { navItems } from "./content";
import type { ImageAsset } from "./content";

type Theme = "light" | "dark";
type FormKind = "contact" | "partner" | "career" | "support" | "newsletter" | "chat";
type SubmissionStatus = "new" | "triage" | "contacted";

type SubmissionRecord = {
  id: string;
  kind: FormKind;
  status: SubmissionStatus;
  createdAt: string;
  sourceRoute: string;
  data: Record<string, string>;
};

type AnalyticsEvent = {
  name: string;
  route: string;
  timestamp: string;
  payload?: Record<string, string | number | boolean>;
};

const CRM_STORAGE_KEY = "zahthic-crm-submissions";
const ANALYTICS_STORAGE_KEY = "zahthic-analytics-events";
const WHATSAPP_NUMBER = "2347033362935";
const HAS_WHATSAPP_NUMBER = Boolean(WHATSAPP_NUMBER.trim());
const SITE_URL = "https://zahthic.com";
const CmsContext = createContext<{
  cms: CmsContent;
  setCms: (content: CmsContent) => void;
} | null>(null);

declare global {
  interface Window {
    dataLayer?: AnalyticsEvent[];
  }
}

const routeLabels: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/services": "Services",
  "/impact": "Projects & Impact",
  "/space": "SPACE Project",
  "/partners": "Partners",
  "/blog": "Blog",
  "/media": "Media Center",
  "/recognition": "Recognition",
  "/careers": "Volunteer & Careers",
  "/support": "Donate / Support",
  "/faq": "FAQ",
  "/testimonials": "Testimonials",
  "/contact": "Contact",
  "/admin": "Admin",
};

const serviceDivisions = [
  {
    description: "Our rehabilitation services are designed to support recovery, restore function, reduce pain, improve mobility, and help individuals regain independence and participation in daily life.",
    iconName: "Activity",
    intro: "Helping individuals recover function, independence, mobility, and quality of life through evidence-based rehabilitation.",
    title: "Rehabilitation Services",
  },
  {
    description: "We provide workplace health solutions that promote employee wellbeing, reduce preventable injuries, improve productivity, and encourage healthier workplace practices.",
    iconName: "BriefcaseBusiness",
    intro: "Helping organizations build healthier, safer, and more productive work environments.",
    title: "Workplace Health & Wellness",
  },
  {
    description: "We work with communities, institutions, development partners, and stakeholders to improve health awareness, expand rehabilitation access, promote prevention, and strengthen community wellbeing.",
    iconName: "HandHeart",
    intro: "Expanding access to healthcare, rehabilitation, prevention, and health education beyond traditional healthcare settings.",
    title: "Community Health & Development",
  },
];

function servicesForDivision(services: EditableService[], division: string) {
  return services.filter((service) => service.published && service.division === division);
}

function getRoute() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/admin") return "/admin";
  const hash = window.location.hash.replace("#", "");
  return hash || "/";
}

function getRoutePath(route: string) {
  return route.split("?")[0].replace(/\/+$/, "") || "/";
}

function getCanonicalUrl(route: string) {
  const path = getRoutePath(route);
  if (path === "/admin") return `${SITE_URL}/admin`;
  return `${SITE_URL}/#${path}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getQueryParam(route: string, key: string) {
  const query = route.split("?")[1];
  if (!query) return "";
  return new URLSearchParams(query).get(key) || "";
}

function getStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStoredJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function trackEvent(name: string, route = getRoute(), payload?: AnalyticsEvent["payload"]) {
  const event: AnalyticsEvent = {
    name,
    payload,
    route: getRoutePath(route),
    timestamp: new Date().toISOString(),
  };
  window.dataLayer = [...(window.dataLayer || []), event];
  const events = getStoredJson<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEY, []);
  saveStoredJson(ANALYTICS_STORAGE_KEY, [event, ...events].slice(0, 200));
  window.dispatchEvent(new CustomEvent("zahthic:analytics"));
}

function saveSubmission(kind: FormKind, data: Record<string, string>, sourceRoute = getRoute()) {
  const record: SubmissionRecord = {
    id: `ZHS-${Date.now().toString(36).toUpperCase()}`,
    kind,
    status: "new",
    createdAt: new Date().toISOString(),
    data,
    sourceRoute: getRoutePath(sourceRoute),
  };
  const submissions = getStoredJson<SubmissionRecord[]>(CRM_STORAGE_KEY, []);
  saveStoredJson(CRM_STORAGE_KEY, [record, ...submissions].slice(0, 120));
  trackEvent(`${kind}_submitted`, sourceRoute, { submissionId: record.id });
  window.dispatchEvent(new CustomEvent("zahthic:crm"));
  return record;
}

function buildWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER.trim()}?text=${encodeURIComponent(message)}`;
}

function useCms() {
  const value = useContext(CmsContext);
  if (!value) throw new Error("CMS context is unavailable.");
  return value;
}

function getSeoForRoute(route: string, cms: CmsContent) {
  const path = getRoutePath(route);
  const [section, detailSlug] = path.split("/").filter(Boolean);
  const customSeo = cms.seoRecords.find((record) => record.path === path);
  if (customSeo) return { title: customSeo.title, description: customSeo.description, ogImage: customSeo.ogImage };
  const fallback = {
    description: "Premium rehabilitation, prevention, wellness, healthcare education, and community impact support in Imo State, Nigeria.",
    title: "Zahthic Healthcare Solutions",
  };

  if (section === "services" && detailSlug) {
    const item = cms.services.find((service) => service.published && service.slug === detailSlug);
    if (item) return { title: `${item.title} | Zahthic Healthcare Solutions`, description: item.summary };
  }
  if (section === "blog" && detailSlug) {
    const item = cms.articles.find((article) => article.published && slugify(article.title) === detailSlug);
    if (item) return { title: `${item.title} | Zahthic Insights`, description: item.excerpt };
  }
  const label = routeLabels[path];
  return label ? { title: `${label} | Zahthic Healthcare Solutions`, description: fallback.description } : fallback;
}

function upsertMeta(name: string, content: string, property = false) {
  const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(property ? "property" : "name", name);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function upsertCanonical(href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.appendChild(tag);
  }
  tag.href = href;
}

export function App() {
  const [route, setRoute] = useState(getRoute());
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("zahthic-theme") as Theme) || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cms, setCmsState] = useState<CmsContent>(() => readCmsContent());
  const mainRef = useRef<HTMLElement>(null);

  function setCms(content: CmsContent) {
    const normalized = normalizeCmsContent(content);
    setCmsState(normalized);
    writeCmsContent(normalized);
  }

  useEffect(() => {
    const onHashChange = () => {
      setRoute(getRoute());
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("zahthic-theme", theme);
  }, [theme]);

  useEffect(() => {
    const seo = getSeoForRoute(route, cms);
    const canonicalUrl = getCanonicalUrl(route);
    const path = getRoutePath(route);
    document.title = seo.title;
    upsertCanonical(canonicalUrl);
    upsertMeta("description", seo.description);
    upsertMeta("robots", path === "/admin" ? "noindex,nofollow" : "index,follow");
    upsertMeta("og:title", seo.title, true);
    upsertMeta("og:description", seo.description, true);
    upsertMeta("og:type", "website", true);
    upsertMeta("og:url", canonicalUrl, true);
    if (seo.ogImage) upsertMeta("og:image", seo.ogImage, true);
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:url", canonicalUrl);
    upsertMeta("twitter:title", seo.title);
    upsertMeta("twitter:description", seo.description);
    trackEvent("page_view", route, { title: seo.title });
    mainRef.current?.focus({ preventScroll: true });
  }, [route, cms]);

  useEffect(() => {
    const syncCms = () => setCmsState(readCmsContent());
    window.addEventListener("zahthic:cms", syncCms);
    window.addEventListener("storage", syncCms);
    return () => {
      window.removeEventListener("zahthic:cms", syncCms);
      window.removeEventListener("storage", syncCms);
    };
  }, []);

  const page = useMemo(() => {
    const path = getRoutePath(route);
    const [section, detailSlug] = path.split("/").filter(Boolean);
    const legacyServiceSlug = section === "services" && !detailSlug ? getQueryParam(route, "service") : "";

    if (section === "services" && (detailSlug || legacyServiceSlug)) {
      const service = cms.services.find((item) => item.published && item.slug === (detailSlug || legacyServiceSlug));
      return service ? <ServiceDetailPage service={service} /> : <NotFoundPage />;
    }

    if (section === "impact" && detailSlug) {
      const project = cms.projects.find((item) => item.published && slugify(item.title) === detailSlug);
      return project ? <ProjectDetailPage project={project} /> : <NotFoundPage />;
    }

    if (section === "blog" && detailSlug) {
      const article = cms.articles.find((item) => item.published && slugify(item.title) === detailSlug);
      return article ? <ArticleDetailPage article={article} /> : <NotFoundPage />;
    }

    if (section === "media" && detailSlug) {
      const item = cms.mediaItems.find((entry) => entry.published && slugify(entry.title) === detailSlug);
      return item ? <MediaDetailPage item={item} /> : <NotFoundPage />;
    }

    if (section === "recognition" && detailSlug) {
      const item = cms.recognitionItems.find((entry) => entry.published && slugify(entry.title) === detailSlug);
      return item ? <RecognitionDetailPage item={item} /> : <NotFoundPage />;
    }

    switch (path) {
      case "/about":
        return <AboutPage />;
      case "/services":
        return <ServicesPage />;
      case "/impact":
        return <ImpactPage />;
      case "/space":
        return <SpacePage />;
      case "/partners":
        return <PartnersPage />;
      case "/blog":
        return <BlogPage />;
      case "/media":
        return <MediaPage />;
      case "/recognition":
        return <RecognitionPage />;
      case "/careers":
        return <CareersPage />;
      case "/support":
        return <SupportPage />;
      case "/faq":
        return <FaqPage />;
      case "/testimonials":
        return <TestimonialsPage />;
      case "/contact":
        return <ContactPage />;
      case "/admin":
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  }, [route, cms]);

  return (
    <CmsContext.Provider value={{ cms, setCms }}>
      <div className="site-shell">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header
          route={route}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          theme={theme}
          setTheme={setTheme}
        />
        <main id="main-content" ref={mainRef} tabIndex={-1}>{page}</main>
        <Footer />
        <ChatWidget />
      </div>
    </CmsContext.Provider>
  );
}

function Header({
  route,
  menuOpen,
  setMenuOpen,
  theme,
  setTheme,
}: {
  route: string;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}) {
  const activePath = getRoutePath(route);
  return (
    <header className="site-header">
      <a className="brand-lockup" href="#/" aria-label="Zahthic Healthcare Solutions home">
        <BrandLogo variant="auto" />
      </a>

      <nav className="desktop-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} aria-current={activePath === item.href.replace("#", "") ? "page" : undefined}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-button" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle dark mode">
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <a className="button primary compact" href="#/contact">
          Book Consultation
        </a>
        <button className="icon-button mobile-only" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {[...navItems, { label: "Support", href: "#/support" }].map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { cms } = useCms();
  return (
    <footer className="site-footer">
      <div>
        <a className="brand-lockup footer-brand" href="#/">
          <BrandLogo variant="dark" />
        </a>
        <p>{cms.brand.footerMotto}</p>
      </div>
      <div className="footer-grid">
        <FooterLinks title="Explore" links={[["About", "#/about"], ["Services", "#/services"], ["Impact", "#/impact"], ["Blog", "#/blog"]]} />
        <FooterLinks title="Connect" links={[["Partners", "#/partners"], ["Media Center", "#/media"], ["Careers", "#/careers"], ["Contact", "#/contact"]]} />
        <FooterLinks title="Support" links={[["SPACE Project", "#/space"], ["Donate / Support", "#/support"], ["FAQ", "#/faq"]]} />
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3>{title}</h3>
      {links.map(([label, href]) => (
        <a key={href} href={href}>
          {label}
        </a>
      ))}
    </div>
  );
}

function BrandLogo({ variant }: { variant: "auto" | "light" | "dark" }) {
  return (
    <span className={`logo-image-wrap ${variant === "auto" ? "logo-auto" : ""}`}>
      {(variant === "auto" || variant === "light") && (
        <img className="logo-image logo-image-light" src={logoLight} alt="Zahthic Healthcare Solutions" />
      )}
      {(variant === "auto" || variant === "dark") && (
        <img className="logo-image logo-image-dark" src={logoDark} alt="Zahthic Healthcare Solutions" />
      )}
    </span>
  );
}

function SpaceLogo({ variant = "auto" }: { variant?: "auto" | "light" | "dark" }) {
  return (
    <span className={`space-logo-wrap ${variant === "auto" ? "space-logo-auto" : ""}`}>
      {(variant === "auto" || variant === "light") && (
        <img className="space-logo-image space-logo-light" src={spaceLogoDarkText} alt="SPACE Project" />
      )}
      {(variant === "auto" || variant === "dark") && (
        <img className="space-logo-image space-logo-dark" src={spaceLogoLightText} alt="SPACE Project" />
      )}
    </span>
  );
}

function PageHero({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <section className="page-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{body}</p>
    </section>
  );
}

function SectionHeader({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {body && <p>{body}</p>}
    </div>
  );
}

function HomePage() {
  const { cms } = useCms();
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{cms.brand.heroEyebrow}</span>
          <h1>{cms.brand.tagline}</h1>
          <p className="hero-support">{cms.brand.heroBody}</p>
          <div className="button-row">
            <a className="button primary" href="#/contact">
              Book Consultation <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="#/partners">
              Partner With Us
            </a>
          </div>
        </div>
        <VisualPanel image={cms.siteImages.hero} label="Rehabilitation, wellness, and community health in action">
        </VisualPanel>
      </section>
      <section className="content-section two-column">
        <div>
          <span className="eyebrow">Who we are</span>
          <h2>More than a clinic. A healthcare impact organization.</h2>
        </div>
        <div>
          <p>
            Many healthcare systems respond only after illness, injury, or disability has already occurred. At Zahthic, we believe healthcare must go beyond treatment. We exist to bridge the gap between prevention, treatment, and rehabilitation by ensuring that individuals not only recover from health challenges but also maintain long-term function, independence, and quality of life.
          </p>
          <a className="text-link" href="#/about">Learn about Zahthic <ArrowRight size={16} /></a>
        </div>
      </section>
      <CoreFocusAreas />
      <ImpactBand />
      <SpaceFeature />
      <ServicesPreview />
      <PartnerPreview />
      <BlogPreview />
      <ProjectFeature />
      <FinalCta />
    </>
  );
}

function CoreFocusAreas() {
  const { cms } = useCms();

  return (
    <section className="content-section core-focus-section">
      <SectionHeader eyebrow="Our Core Focus Areas" title="Focused care that supports recovery, prevention, and community wellbeing." />
      <div className="core-focus-grid">
        {cms.coreFocusAreas.map((area, index) => {
          const Icon = getIcon(area.iconName);
          return (
            <article className="core-focus-card" key={area.title}>
              <span className="core-focus-number">{String(index + 1).padStart(2, "0")}</span>
              <div className="core-focus-icon">
                <Icon size={22} />
              </div>
              <h3>{area.title}</h3>
              <p>{area.description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function VisualPanel({ label, image, children }: { label: string; image?: ImageAsset; children?: ReactNode }) {
  return (
    <div className="visual-panel" role="img" aria-label={label}>
      {image && <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />}
      <div className="visual-pattern" />
      <span>{label}</span>
      {children}
    </div>
  );
}

function ServicesPreview() {
  const { cms } = useCms();
  return (
    <section className="content-section">
      <SectionHeader
        eyebrow="Services"
        title="Three focused divisions for rehabilitation, workplace wellness, and community health."
        body="Zahthic's service architecture reflects a rehabilitation-led healthcare solutions organization, not a traditional hospital clinic."
      />
      <div className="division-grid">
        {serviceDivisions.map((division) => (
          <ServiceDivisionCard
            division={division}
            key={division.title}
            services={servicesForDivision(cms.services, division.title)}
          />
        ))}
      </div>
      <a className="button secondary section-action" href="#/services">
        View all services <ArrowRight size={18} />
      </a>
    </section>
  );
}

function ServiceDivisionCard({ division, services }: { division: (typeof serviceDivisions)[number]; services: EditableService[] }) {
  const Icon = getIcon(division.iconName);
  return (
    <article className="division-card">
      <div className="card-icon"><Icon size={24} /></div>
      <span>{division.title}</span>
      <h3>{division.intro}</h3>
      <p>{division.description}</p>
      <div className="division-service-list">
        {services.map((service) => (
          <a key={service.slug} href={`#/services/${service.slug}`}>
            {service.title} <ArrowRight size={14} />
          </a>
        ))}
      </div>
    </article>
  );
}

function ServiceCard({ service }: { service: EditableService }) {
  const Icon = getIcon(service.iconName);
  return (
    <article className="service-card">
      <div className="service-image-frame">
        <img className="service-image" src={service.image.src} alt={service.image.alt} loading="lazy" decoding="async" />
      </div>
      <div className="card-icon"><Icon size={22} /></div>
      <span>{service.audience}</span>
      <h3>{service.title}</h3>
      <p>{service.summary}</p>
      <a href={`#/services/${service.slug}`} className="text-link">
        Learn more <ArrowRight size={15} />
      </a>
    </article>
  );
}

function ImpactBand() {
  const { cms } = useCms();
  return (
    <section className="impact-band">
      <div>
        <span className="eyebrow">Measurable impact</span>
        <h2>Healthcare outcomes that can be seen, counted, and sustained.</h2>
        <p>Zahthic delivers healthcare through a model that integrates clinical rehabilitation, prevention, and community engagement to create sustainable health outcomes for individuals, organizations, and communities.</p>
      </div>
      <div className="metric-grid">
        {cms.impactStats.map((stat) => (
          <article className="metric-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
            <small>{stat.note}</small>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProjectFeature() {
  const { cms } = useCms();
  return (
    <section className="content-section feature-split">
      <VisualPanel image={cms.siteImages.outreach} label="Community outreach and prevention education in action" />
      <div>
        <span className="eyebrow">Featured project</span>
        <h2>Community impact stories with dignity, evidence, and context.</h2>
        <p>Project pages document the challenge addressed, activities delivered, verified metrics, partners involved, and beneficiary stories.</p>
        <a className="button primary" href="#/impact">Explore impact</a>
      </div>
    </section>
  );
}

function SpaceFeature() {
  const { cms } = useCms();
  return (
    <section className="space-feature">
      <div>
        <div className="space-feature-lockup">
          <span className="eyebrow">Flagship initiative</span>
          <SpaceLogo variant="auto" />
        </div>
        <p>{cms.brand.spaceTeaser}</p>
        <a className="button primary" href="#/space">
          Explore SPACE <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}

function BlogPreview() {
  const { cms } = useCms();
  const visibleArticles = cms.articles.filter((article) => article.published);
  return (
    <section className="content-section">
      <SectionHeader eyebrow="Insights" title="Latest insights from rehabilitation, wellness, and community health." body="Practical education for healthier lives and stronger communities." />
      <div className="card-grid">
        {visibleArticles.map((article) => (
          <BlogCard key={article.title} article={article} />
        ))}
      </div>
    </section>
  );
}

function BlogCard({ article }: { article: EditableArticle }) {
  return (
    <article className="blog-card">
      <MediaImage image={article.image} />
      <span>{article.category}</span>
      <h3>{article.title}</h3>
      <p>{article.excerpt}</p>
      <small>{article.readTime}</small>
      <a href={`#/blog/${slugify(article.title)}`} className="text-link">
        Read article <ArrowRight size={15} />
      </a>
    </article>
  );
}

function PartnerPreview() {
  const { cms } = useCms();
  const visiblePartners = cms.partnerCategories.filter((partner) => partner.published);
  return (
    <section className="content-section partner-preview">
      <SectionHeader
        eyebrow="Partners"
        title="Partnerships & Collaboration"
        body="We collaborate with government agencies, healthcare institutions, NGOs, schools, and organizations committed to improving health outcomes and expanding access to care."
      />
      <div className="logo-grid">
        {visiblePartners.map((partner) => {
          const Icon = getIcon(partner.iconName);
          const hasLogo = Boolean(partner.logo?.src);
          const content = (
            <>
              {hasLogo ? (
                <img className="partner-logo-image" src={partner.logo?.src} alt={partner.logo?.alt || partner.title} loading="lazy" decoding="async" />
              ) : (
                <div className="partner-logo-placeholder">
                  <Icon size={24} />
                </div>
              )}
              <span>{partner.title}</span>
            </>
          );
          return (
            partner.website ? (
              <a className="logo-tile" href={partner.website} key={partner.title} rel="noreferrer" target="_blank">
                {content}
              </a>
            ) : (
              <article className="logo-tile" key={partner.title}>
                {content}
              </article>
            )
          );
        })}
      </div>
      <a className="button primary section-action" href="#/partners">
        Become a Partner <ArrowRight size={18} />
      </a>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="final-cta">
      <h2>Ready to take the next step?</h2>
      <p>Whether you need rehabilitation support, workplace wellness guidance, community health collaboration, or an impact-driven healthcare partner, Zahthic is ready to help.</p>
      <div className="button-row">
        <a className="button primary" href="#/contact">Book Consultation</a>
        <a className="button secondary on-dark" href="#/partners">Partner With Us</a>
      </div>
    </section>
  );
}

function AboutPage() {
  const { cms } = useCms();
  return (
    <>
      <PageHero eyebrow="About Zahthic" title="Transforming health through rehabilitation, prevention, wellness, and community impact." body="Zahthic was built on the belief that healthcare should not end at treatment." />
      <section className="content-section two-column">
        <div>
          <h2>From clinical care to a broader healthcare movement.</h2>
          <MediaImage image={cms.siteImages.about} variant="wide" />
        </div>
        <div>
          <p>Zahthic began with a strong foundation in physiotherapy and rehabilitation. Over time, that foundation expanded into a wider vision: a healthcare solutions organization that supports recovery, promotes prevention, strengthens communities, and creates practical pathways to long-term wellbeing.</p>
          <p>As part of the wider Zahthic brand family, Zahthic Healthcare Solutions carries the parent brand's commitment to whole-person wellbeing, innovation, accessibility, sustainability, and human development into focused rehabilitation-led care.</p>
          <p>Founded by PT Cosmas Harrison Ifeanyichukwu, Zahthic reflects a commitment to expanding access to rehabilitation, preventive healthcare, wellness, and community-centered support across Nigeria.</p>
        </div>
      </section>
      <section className="content-section founder-section">
        <div>
          <span className="eyebrow">Meet the Founder</span>
          <h2>PT Cosmas Harrison Ifeanyichukwu, BMR (PT)</h2>
          <p>PT Cosmas Harrison Ifeanyichukwu, BMR (PT) is a physiotherapist, healthcare advocate, and the Founder & Clinical Director of Zahthic Healthcare Solutions.</p>
          <p>Driven by a passion for rehabilitation, prevention, and community health, he founded Zahthic to address a critical gap in healthcare: the disconnect between treatment, recovery, and long-term wellbeing.</p>
          <p>Through patient-centered rehabilitation, health education, community outreach, and innovative healthcare initiatives, he is committed to expanding access to quality healthcare services and empowering individuals and communities to achieve better health outcomes.</p>
        </div>
        <aside>
          <blockquote>"Healthcare should not stop at treatment. It should restore function, preserve independence, and improve quality of life."</blockquote>
          <div>
            <span className="eyebrow">Founder Mission Statement</span>
            <p>To advance accessible rehabilitation, preventive healthcare, wellness, and community health solutions that empower people to live healthier, more independent, and more meaningful lives.</p>
          </div>
        </aside>
      </section>
      <section className="content-section value-grid">
        {["Compassion", "Excellence", "Innovation", "Accessibility", "Sustainability", "Integrity", "Impact"].map((value) => (
          <article className="value-card" key={value}>
            <h3>{value}</h3>
            <p>{value === "Impact" ? "We measure success by lives improved and communities strengthened." : "A core principle guiding Zahthic's care, programs, partnerships, and community work."}</p>
          </article>
        ))}
      </section>
    </>
  );
}

function ServicesPage() {
  const { cms } = useCms();
  return (
    <>
      <PageHero eyebrow="Our Services" title="Service architecture for Zahthic Healthcare Solutions." body="To improve clarity, professionalism, and brand positioning, Zahthic groups its work into three core divisions rather than a long list of standalone services." />
      <section className="content-section">
        <SectionHeader
          eyebrow="Rehabilitation-led healthcare solutions"
          title="Three divisions that reflect Zahthic's identity and impact."
          body="Each division keeps related services together so visitors quickly understand where their need fits."
        />
        <div className="division-stack">
          {serviceDivisions.map((division) => (
            <section className="division-section" key={division.title}>
              <ServiceDivisionCard division={division} services={servicesForDivision(cms.services, division.title)} />
              <div className="card-grid service-grid">
                {servicesForDivision(cms.services, division.title).map((service) => <ServiceCard key={service.slug} service={service} />)}
              </div>
            </section>
          ))}
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function ServiceDetailPage({ service }: { service: EditableService }) {
  const Icon = getIcon(service.iconName);
  return (
    <>
      <PageHero eyebrow={service.audience} title={service.title} body={service.summary} />
      <section className="content-section feature-split detail-section">
        <MediaImage image={service.image} variant="feature" />
        <div className="detail-copy">
          <div className="card-icon"><Icon size={24} /></div>
          <h2>Care pathway</h2>
          <p>{service.summary}</p>
          <div className="detail-list">
            <span>Assessment and goal setting</span>
            <span>Personalized support plan</span>
            <span>Progress review and education</span>
          </div>
          <div className="button-row">
            <a className="button primary" href="#/contact">Book Consultation <ArrowRight size={18} /></a>
            <a className="button secondary" href="#/services">All Services</a>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function ImpactPage() {
  const { cms } = useCms();
  const visibleProjects = cms.projects.filter((project) => project.published);
  return (
    <>
      <PageHero eyebrow="Projects & Impact" title="Healthcare impact that reaches people, families, workplaces, and communities." body="Zahthic's impact work expands access to rehabilitation, prevention, wellness education, and community-centered care." />
      <ImpactBand />
      <ProjectList projects={visibleProjects} />
    </>
  );
}

function ProjectDetailPage({ project }: { project: EditableProject }) {
  return (
    <>
      <PageHero eyebrow={project.category} title={project.title} body={project.summary} />
      <section className="content-section feature-split detail-section">
        <MediaImage image={project.image} variant="feature" />
        <div className="detail-copy">
          <h2>Impact record</h2>
          <p>{project.summary}</p>
          <div className="detail-list">
            <span>Location: {project.location}</span>
            <span>Metric: {project.metric}</span>
            <span>CMS fields: gallery, partners, outcomes, beneficiary stories</span>
          </div>
          <div className="button-row">
            <a className="button primary" href="#/partners">Partner on Impact</a>
            <a className="button secondary" href="#/impact">All Projects</a>
          </div>
        </div>
      </section>
    </>
  );
}

function ProjectList({ projects }: { projects: EditableProject[] }) {
  return (
    <section className="content-section">
      <SectionHeader title="Project stories" body="Each project can be managed through the CMS with location, gallery, metrics, partners, and beneficiary stories." />
      <div className="card-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <MediaImage image={project.image} />
            <span>{project.category}</span>
            <h3>{project.title}</h3>
            <p>{project.summary}</p>
            <small>{project.location} · {project.metric}</small>
            <a href={`#/impact/${slugify(project.title)}`} className="text-link">
              View project <ArrowRight size={15} />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function ArticleDetailPage({ article }: { article: EditableArticle }) {
  return (
    <>
      <PageHero eyebrow={article.category} title={article.title} body={article.excerpt} />
      <section className="content-section feature-split detail-section">
        <MediaImage image={article.image} variant="feature" />
        <article className="detail-copy">
          <span className="eyebrow">{article.readTime}</span>
          <h2>Article outline</h2>
          <p>{article.body || article.excerpt}</p>
          <div className="detail-list">
            <span>Why this matters for families and communities</span>
            <span>Practical steps readers can apply</span>
            <span>When to speak with a qualified professional</span>
          </div>
          <div className="button-row">
            <a className="button primary" href="#/contact">Ask Zahthic</a>
            <a className="button secondary" href="#/blog">All Articles</a>
          </div>
        </article>
      </section>
      <Newsletter />
    </>
  );
}

function SpacePage() {
  const { cms } = useCms();
  const spaceActions = [
    "Healthy posture and movement habits",
    "Ergonomic awareness in learning environments",
    "Regular physical activity in schools and homes",
    "Early identification of musculoskeletal risk factors",
  ];
  const focusAreas = [
    {
      title: "School Health & Ergonomics",
      body: "Improving posture awareness, classroom ergonomics, and movement-friendly learning environments.",
    },
    {
      title: "Physical Activity Promotion",
      body: "Encouraging active lifestyles that support healthy musculoskeletal development.",
    },
    {
      title: "Early Screening & Risk Identification",
      body: "Identifying posture and movement-related risk factors before they progress into long-term conditions.",
    },
    {
      title: "Research & Data Collection",
      body: "Generating insights to better understand child and adolescent musculoskeletal health trends.",
    },
    {
      title: "Advocacy & Stakeholder Engagement",
      body: "Working with schools, communities, and stakeholders to strengthen preventive health practices.",
    },
  ];
  return (
    <>
      <section className="page-hero space-page-hero">
        <SpaceLogo variant="auto" />
        <h1>Spinal Protection and Awareness for Children's Ergonomics (SPACE)</h1>
        <p>SPACE is the flagship preventive health initiative of Zahthic Healthcare Solutions.</p>
      </section>
      <section className="content-section feature-split space-intro-section">
        <div>
          <span className="eyebrow">Preventive health for young people</span>
          <h2>Protecting spinal and musculoskeletal health before problems become lifelong limitations.</h2>
          <p>SPACE was established to address a growing but overlooked public health issue affecting children and adolescents: the early development of poor posture, reduced physical activity, and musculoskeletal strain linked to modern learning environments and lifestyle habits.</p>
          <p>Factors such as prolonged sitting in classrooms and at home, increased screen exposure, heavy school bags, and limited physical activity are contributing to preventable spinal and musculoskeletal problems in young people.</p>
          <p>Traditionally, these conditions are often recognized and treated only after symptoms develop in adulthood. SPACE seeks to shift this approach from treatment to prevention.</p>
        </div>
        <div className="feature-stack">
          <MediaImage image={cms.siteImages.space} variant="feature" />
          <div className="step-list light">
            {["School partnerships", "Health education", "Community engagement", "Screening initiatives", "Evidence-based interventions"].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>
      <section className="content-section space-details-grid">
        <article className="space-detail-panel">
          <span className="eyebrow">What SPACE does</span>
          <h2>Prevention through education, screening, and evidence-based action.</h2>
          <p>Through school partnerships, health education, community engagement, screening initiatives, and evidence-based interventions, SPACE promotes practical habits and early support for healthier spinal and musculoskeletal development.</p>
        </article>
        <div className="space-action-grid">
          {spaceActions.map((item) => (
            <article className="space-action-card" key={item}>
              <CheckCircle2 size={20} />
              <h3>{item}</h3>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section space-focus-section">
        <SectionHeader eyebrow="Focus areas" title="A prevention framework for schools, homes, communities, and stakeholders." body="SPACE brings health education, ergonomics, movement habits, screening, research, and advocacy into one clear child and adolescent health initiative." />
        <div className="card-grid">
          {focusAreas.map((area) => (
            <article className="service-card space-focus-card" key={area.title}>
              <ShieldCheck size={22} />
              <h3>{area.title}</h3>
              <p>{area.body}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section final-cta space-cta">
        <div>
          <span className="eyebrow">Partner with SPACE</span>
          <h2>Help schools and communities prevent avoidable spinal and musculoskeletal problems early.</h2>
        </div>
        <div>
          <p>SPACE is designed for schools, parents, community organizations, health stakeholders, and partners who want practical prevention, screening, and education for children and adolescents.</p>
          <div className="button-row">
            <a className="button primary" href="#/partners">Partner With Us <ArrowRight size={17} /></a>
            <a className="button secondary on-dark" href="#/contact">Contact Zahthic</a>
          </div>
        </div>
      </section>
    </>
  );
}

function PartnersPage() {
  const { cms } = useCms();
  return (
    <>
      <PageHero eyebrow="Partners & Collaborators" title="Partnerships that expand access to better health." body="Zahthic works with organizations and institutions committed to accessible healthcare, rehabilitation, prevention, wellness, and community transformation." />
      <section className="content-section feature-split">
        <MediaImage image={cms.siteImages.partners} variant="feature" />
        <div>
          <span className="eyebrow">Collaboration</span>
          <h2>Built for institutions, communities, and organizations that want health access to go further.</h2>
          <p>Partnership pages can combine approved partner logos, project stories, sponsorship calls, and verified outcomes without making the site feel like a hospital directory.</p>
        </div>
      </section>
      <PartnerPreview />
      <FormSection
        kind="partner"
        title="Partnership inquiry"
        submitLabel="Submit Partnership Inquiry"
        intro="Tell Zahthic about the organization, proposed collaboration, and communities or outcomes you want to support."
      />
    </>
  );
}

function BlogPage() {
  return (
    <>
      <PageHero eyebrow="News, Articles & Insights" title="Practical knowledge for healthier lives and stronger communities." body="Explore health education, rehabilitation tips, wellness insights, community updates, press releases, research notes, and project reports." />
      <BlogPreview />
      <Newsletter />
    </>
  );
}

function MediaPage() {
  const { cms } = useCms();
  const [activeType, setActiveType] = useState("All");
  const filters = ["All", "Photo", "Video", "Publication", "Press Release", "Download"];
  const publishedMedia = cms.mediaItems.filter((item) => item.published);
  const visibleItems = activeType === "All" ? publishedMedia : publishedMedia.filter((item) => item.type === activeType);
  return (
    <>
      <PageHero eyebrow="Media Center" title="Stories, updates, and resources from Zahthic's work." body="Photo gallery, video gallery, publications, press releases, magazine features, and downloads." />
      <section className="content-section">
        <div className="filter-row" role="tablist" aria-label="Media filters">
          {filters.map((filter) => (
            <button className={filter === activeType ? "active" : ""} type="button" key={filter} onClick={() => setActiveType(filter)}>
              {filter}
            </button>
          ))}
        </div>
        <div className="card-grid">
          {visibleItems.map((item) => (
            <article className="blog-card" key={item.title}>
              <MediaImage image={item.image} />
              <span>{item.type}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a className="text-link" href={`#/media/${slugify(item.title)}`}><Download size={15} /> View resource</a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function MediaDetailPage({ item }: { item: EditableMediaItem }) {
  return (
    <>
      <PageHero eyebrow="Media Center" title={item.title} body={item.description} />
      <section className="content-section feature-split detail-section">
        <MediaImage image={item.image} variant="feature" />
        <div className="detail-copy">
          <h2>Resource details</h2>
          <p>{item.description}</p>
          <div className="detail-list">
            <span>CMS-managed thumbnail and description</span>
            <span>Publication date and category ready for admin editing</span>
            <span>Download or video file can be connected in the CMS</span>
          </div>
          <div className="button-row">
            <a className="button primary" href="#/contact">Request Media Info</a>
            <a className="button secondary" href="#/media">All Media</a>
          </div>
        </div>
      </section>
    </>
  );
}

function RecognitionPage() {
  const { cms } = useCms();
  const visibleItems = cms.recognitionItems.filter((item) => item.published);
  return (
    <>
      <PageHero eyebrow="Recognition & Spotlight" title="Celebrating people and partnerships advancing health impact." body="A dynamic space for distinguished personalities, healthcare champions, strategic partners, award recipients, and special recognitions." />
      <section className="content-section">
        <div className="card-grid">
          {visibleItems.map((item) => (
            <article className="project-card" key={item.title}>
              <MediaImage image={item.image} />
              <span>Spotlight</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <a href={`#/recognition/${slugify(item.title)}`} className="text-link">
                View spotlight <ArrowRight size={15} />
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function RecognitionDetailPage({ item }: { item: EditableRecognitionItem }) {
  return (
    <>
      <PageHero eyebrow="Recognition & Spotlight" title={item.title} body="A CMS-ready spotlight page for approved people, partners, award recipients, and healthcare champions." />
      <section className="content-section feature-split detail-section">
        <MediaImage image={item.image} variant="feature" />
        <div className="detail-copy">
          <h2>Spotlight profile</h2>
          <p>{item.summary}</p>
          <div className="detail-list">
            <span>Profile image and summary</span>
            <span>Recognition category</span>
            <span>Approval and publication controls</span>
          </div>
          <div className="button-row">
            <a className="button primary" href="#/partners">Explore Partnerships</a>
            <a className="button secondary" href="#/recognition">All Spotlights</a>
          </div>
        </div>
      </section>
    </>
  );
}

function MediaImage({ image, variant = "card" }: { image: ImageAsset; variant?: "card" | "wide" | "feature" }) {
  return (
    <figure className={`media-image media-image-${variant}`}>
      <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
    </figure>
  );
}

function NotFoundPage() {
  return (
    <>
      <PageHero eyebrow="Page not found" title="This page is not available yet." body="The content may have moved, or the CMS item may not be published." />
      <section className="content-section">
        <div className="button-row">
          <a className="button primary" href="#/">Go Home</a>
          <a className="button secondary" href="#/contact">Contact Zahthic</a>
        </div>
      </section>
    </>
  );
}

function CareersPage() {
  return (
    <>
      <PageHero eyebrow="Volunteer & Careers" title="Join a team committed to transforming health and empowering lives." body="Contribute your skills, time, learning, and energy to healthcare, rehabilitation, wellness, and community impact." />
      <section className="content-section card-grid">
        {["Volunteer with Zahthic", "Apply for internship", "Build your career with purpose"].map((item) => (
          <article className="service-card" key={item}>
            <div className="card-icon"><HeartHandshake size={22} /></div>
            <h3>{item}</h3>
            <p>Application forms are built into the CMS-ready site structure.</p>
          </article>
        ))}
      </section>
      <FormSection
        kind="career"
        title="Volunteer, internship, and career form"
        submitLabel="Submit Application"
        intro="Share your area of interest, availability, and how you want to contribute to Zahthic's work."
      />
    </>
  );
}

function SupportPage() {
  return (
    <>
      <PageHero eyebrow="Donate / Support Us" title="Support access to rehabilitation, prevention, and community health." body="Your support helps Zahthic bring health education, wellness programs, outreach initiatives, and community-centered healthcare support to more people." />
      <DonationPanel />
      <section className="content-section card-grid">
        {["One-time Support", "Program Sponsorship", "SPACE Project Support", "CSR Partnership", "In-kind Support", "Technical Support"].map((item) => (
          <article className="service-card" key={item}>
            <div className="card-icon"><HeartHandshake size={22} /></div>
            <h3>{item}</h3>
            <p>Support route designed for inquiry-first fundraising until a payment provider is selected.</p>
          </article>
        ))}
      </section>
      <FormSection
        kind="support"
        title="Support inquiry"
        submitLabel="Start Support Conversation"
        intro="Choose a support route and Zahthic can follow up with the right giving or partnership pathway."
      />
    </>
  );
}

function FaqPage() {
  const { cms } = useCms();
  const visibleFaqs = cms.faqs.filter((faq) => faq.published);
  return (
    <>
      <PageHero eyebrow="Frequently Asked Questions" title="Answers to help you take the next step with confidence." body="Find quick answers about Zahthic's services, consultations, community programs, partnerships, volunteering, and support." />
      <section className="content-section faq-list">
        {visibleFaqs.map((faq) => (
          <details key={faq.question}>
            <summary>{faq.question}</summary>
            <p>{faq.answer}</p>
          </details>
        ))}
      </section>
    </>
  );
}

function TestimonialsPage() {
  return (
    <>
      <PageHero eyebrow="Testimonials" title="Real stories of care, recovery, learning, and community impact." body="This section is ready for approved testimonials from patients, families, communities, partners, volunteers, and collaborators." />
      <section className="content-section card-grid">
        {["Patient story placeholder", "Community beneficiary placeholder", "Partner testimonial placeholder"].map((item) => (
          <article className="testimonial-card" key={item}>
            <p>"Zahthic helped us understand the journey and take the next step with confidence."</p>
            <strong>{item}</strong>
            <small>Permission pending</small>
          </article>
        ))}
      </section>
    </>
  );
}

function ContactPage() {
  const { cms } = useCms();
  const visibleOptions = cms.contactOptions.filter((option) => option.published);
  return (
    <>
      <PageHero eyebrow="Contact Zahthic" title="Let us help you take the next step." body="For rehabilitation support, home care, workplace wellness, outreach, partnerships, volunteering, or media information, the Zahthic team is ready to respond." />
      <section className="content-section card-grid">
        {visibleOptions.map((option) => {
          const Icon = getIcon(option.iconName);
          return (
            <article className="service-card" key={option.title}>
              <div className="card-icon"><Icon size={22} /></div>
              <h3>{option.title}</h3>
              <p>{option.text}</p>
            </article>
          );
        })}
      </section>
      <FormSection
        kind="contact"
        title="Custom booking and contact form"
        submitLabel="Send Message"
        intro="Book rehabilitation support, ask about home care, request workplace wellness guidance, or start a general inquiry."
      />
    </>
  );
}

function DonationPanel() {
  const [amount, setAmount] = useState("25000");
  const [focus, setFocus] = useState("SPACE Project Support");
  const message = `Hello Zahthic, I would like to support ${focus} with NGN ${amount}. Please send donation/payment details.`;

  return (
    <section className="content-section donation-panel">
      <div>
        <span className="eyebrow">Donation ready</span>
        <h2>Prepared for payment integration.</h2>
        <p>Until a payment provider is connected, support requests are routed into the CRM and WhatsApp handoff with clear intent and amount.</p>
      </div>
      <div className="donation-card">
        <label>
          Support focus
          <select name="supportFocus" value={focus} onChange={(event) => setFocus(event.target.value)}>
            <option>SPACE Project Support</option>
            <option>Community Outreach</option>
            <option>Rehabilitation Access Fund</option>
            <option>Health Education Program</option>
          </select>
        </label>
        <label>
          Intended amount (NGN)
          <input name="amount" value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="numeric" />
        </label>
        <div className="button-row">
          <a
            className="button primary"
            href={HAS_WHATSAPP_NUMBER ? buildWhatsAppUrl(message) : "#/contact"}
            target={HAS_WHATSAPP_NUMBER ? "_blank" : undefined}
            rel={HAS_WHATSAPP_NUMBER ? "noreferrer" : undefined}
            onClick={() => trackEvent(HAS_WHATSAPP_NUMBER ? "donation_whatsapp_clicked" : "donation_contact_clicked", getRoute(), { focus })}
          >
            {HAS_WHATSAPP_NUMBER ? "Continue on WhatsApp" : "Request support details"} <ArrowRight size={18} />
          </a>
          <a className="button secondary" href="#/contact">Request Details</a>
        </div>
      </div>
    </section>
  );
}

function FormSection({ kind, title, submitLabel, intro }: { kind: FormKind; title: string; submitLabel: string; intro: string }) {
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const nextErrors: Record<string, string> = {};
    if (!data.name?.trim() && kind !== "newsletter") nextErrors.name = "Full name is required.";
    if (!data.phone?.trim() && kind !== "newsletter") nextErrors.phone = "Phone or WhatsApp number is required.";
    if (!data.email?.trim() && (kind === "newsletter" || kind === "partner" || kind === "career")) nextErrors.email = "Email address is required.";
    if (!data.message?.trim() && kind !== "newsletter") nextErrors.message = "Please add a short message.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const record = saveSubmission(kind, data, getRoute());
    setStatus(`Received. Reference ${record.id}.`);
    form.reset();
  }

  const whatsappText = `Hello Zahthic, I would like help with ${title}.`;

  return (
    <section className="content-section form-layout">
      <div>
        <span className="eyebrow">Form</span>
        <h2>{title}</h2>
        <p>{intro}</p>
        <div className="integration-list">
          <span><CheckCircle2 size={16} /> CRM-ready record</span>
          <span><Mail size={16} /> Email workflow ready</span>
          <span><Phone size={16} /> WhatsApp handoff</span>
        </div>
      </div>
      <form className="form-card" onSubmit={handleSubmit}>
        <label>
          Full name
          <input name="name" placeholder="Your name" aria-invalid={Boolean(errors.name)} />
          {errors.name && <small>{errors.name}</small>}
        </label>
        {(kind === "partner" || kind === "career") && (
          <label>
            Email address
            <input name="email" type="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} />
            {errors.email && <small>{errors.email}</small>}
          </label>
        )}
        {kind === "career" && (
          <label>
            Application type
            <select name="applicationType" defaultValue="Volunteer">
              <option>Volunteer</option>
              <option>Internship</option>
              <option>Job opportunity</option>
            </select>
          </label>
        )}
        {kind === "support" && (
          <label>
            Support route
            <select name="supportRoute" defaultValue="SPACE Project Support">
              <option>SPACE Project Support</option>
              <option>Program Sponsorship</option>
              <option>CSR Partnership</option>
              <option>In-kind Support</option>
              <option>Technical Support</option>
            </select>
          </label>
        )}
        {kind === "partner" && (
          <label>
            Organization
            <input name="organization" placeholder="Organization name" />
          </label>
        )}
        {kind === "contact" && (
          <label>
            Preferred date
            <input name="preferredDate" type="date" />
          </label>
        )}
        <label>
          Phone / WhatsApp
          <input name="phone" placeholder="Your phone number" aria-invalid={Boolean(errors.phone)} />
          {errors.phone && <small>{errors.phone}</small>}
        </label>
        <label>
          Inquiry type
          <select name="type" defaultValue={kind}>
            <option value="contact">Book consultation</option>
            <option value="partner">Partnership</option>
            <option value="career">Volunteer / careers</option>
            <option value="support">Support / donation</option>
          </select>
        </label>
        <label>
          Message
          <textarea name="message" placeholder="Tell us what support you need" rows={4} aria-invalid={Boolean(errors.message)} />
          {errors.message && <small>{errors.message}</small>}
        </label>
        <button className="button primary" type="submit">
          {submitLabel} <Send size={17} />
        </button>
        <a
          className="text-link"
          href={HAS_WHATSAPP_NUMBER ? buildWhatsAppUrl(whatsappText) : "#/contact"}
          target={HAS_WHATSAPP_NUMBER ? "_blank" : undefined}
          rel={HAS_WHATSAPP_NUMBER ? "noreferrer" : undefined}
          onClick={() => trackEvent(HAS_WHATSAPP_NUMBER ? "whatsapp_handoff_clicked" : "contact_fallback_clicked", getRoute(), { kind })}
        >
          {HAS_WHATSAPP_NUMBER ? "Continue on WhatsApp" : "Open contact form"} <ArrowRight size={15} />
        </a>
        {status && <p className="form-status" role="status">{status}</p>}
      </form>
    </section>
  );
}

function Newsletter() {
  const [status, setStatus] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    if (!data.email?.trim()) {
      setStatus("Please enter an email address.");
      return;
    }
    const record = saveSubmission("newsletter", data, getRoute());
    setStatus(`Subscribed. Reference ${record.id}.`);
    form.reset();
  }

  return (
    <section className="newsletter">
      <div>
        <BookOpen size={30} />
        <h2>Get practical health education and Zahthic updates.</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email address" aria-label="Email address" />
        <button className="button primary" type="submit">Subscribe</button>
        {status && <span className="newsletter-status">{status}</span>}
      </form>
    </section>
  );
}

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "Zahthic", text: "Hello. How can Zahthic help you today?" },
  ]);
  const [draft, setDraft] = useState("");

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    const text = draft.trim();
    setMessages((current) => [
      ...current,
      { from: "You", text },
      {
        from: "Zahthic",
        text: HAS_WHATSAPP_NUMBER
          ? "Thank you. Please use the booking form or continue on WhatsApp so the team can follow up properly."
          : "Thank you. Please use the booking/contact form so the team can follow up properly.",
      },
    ]);
    saveSubmission("chat", { message: text }, getRoute());
    setDraft("");
  }

  return (
    <div className="chat-widget">
      {open && (
        <section className="chat-panel" aria-label="Zahthic chat widget">
          <div className="chat-head">
            <div>
              <strong>Zahthic Assist</strong>
              <span>Booking, services, partnerships</span>
            </div>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
          </div>
          <div className="chat-messages">
            {messages.map((message, index) => (
              <p className={message.from === "You" ? "from-user" : ""} key={`${message.from}-${index}`}>
                <strong>{message.from}</strong>
                {message.text}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage}>
            <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type your question" aria-label="Chat message" />
            <button className="icon-button" type="submit" aria-label="Send chat message"><Send size={18} /></button>
          </form>
          <a
            className="text-link"
            href={HAS_WHATSAPP_NUMBER ? buildWhatsAppUrl("Hello Zahthic, I need support from the website chat.") : "#/contact"}
            target={HAS_WHATSAPP_NUMBER ? "_blank" : undefined}
            rel={HAS_WHATSAPP_NUMBER ? "noreferrer" : undefined}
          >
            {HAS_WHATSAPP_NUMBER ? "Continue on WhatsApp" : "Open contact form"} <ArrowRight size={15} />
          </a>
        </section>
      )}
      <button className="chat-toggle" type="button" onClick={() => { setOpen((value) => !value); trackEvent("chat_toggle_clicked", getRoute()); }} aria-label="Open Zahthic chat">
        <Bot size={22} />
      </button>
    </div>
  );
}

function AdminPage() {
  const { cms, setCms } = useCms();
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem(ADMIN_SESSION_KEY) === "active");
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => getStoredJson<SubmissionRecord[]>(CRM_STORAGE_KEY, []));
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => getStoredJson<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEY, []));
  const [activeSection, setActiveSection] = useState("brand");
  const [loginError, setLoginError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const sync = () => {
      setSubmissions(getStoredJson<SubmissionRecord[]>(CRM_STORAGE_KEY, []));
      setEvents(getStoredJson<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEY, []));
    };
    window.addEventListener("zahthic:crm", sync);
    window.addEventListener("zahthic:analytics", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("zahthic:crm", sync);
      window.removeEventListener("zahthic:analytics", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>;
    if (data.username === ADMIN_USERNAME && data.password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "active");
      setLoggedIn(true);
      setLoginError("");
      trackEvent("admin_login_success", getRoute());
      return;
    }
    setLoginError("Invalid admin login.");
    trackEvent("admin_login_failed", getRoute());
  }

  function updateCms(next: CmsContent, message = "Saved.") {
    setCms(normalizeCmsContent({ ...next, updatedAt: new Date().toISOString() }));
    setNotice(message);
  }

  function clearDemoData() {
    localStorage.removeItem(CRM_STORAGE_KEY);
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    setSubmissions([]);
    setEvents([]);
  }

  function exportCms() {
    const blob = new Blob([JSON.stringify(cms, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `zahthic-cms-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice("CMS export downloaded.");
  }

  async function importCms(file: File) {
    const text = await file.text();
    const parsed = normalizeCmsContent(JSON.parse(text) as Partial<CmsContent>);
    updateCms(parsed, "CMS import applied.");
  }

  if (!loggedIn) {
    return (
      <>
        <PageHero eyebrow="Admin Login" title="Secure website management for Zahthic." body="Sign in to manage content, figures, services, blogs, media, SEO, CRM records, and publishing controls." />
        <section className="admin-login-wrap">
          <form className="form-card admin-login-card" onSubmit={handleLogin}>
            <label>
              Username
              <input name="username" autoComplete="username" placeholder="admin" />
            </label>
            <label>
              Password
              <input name="password" type="password" autoComplete="current-password" placeholder="Admin password" />
            </label>
            <button className="button primary" type="submit">Login</button>
            {loginError && <p className="form-status error" role="alert">{loginError}</p>}
            <p className="admin-helper">Authorized Zahthic administrators only. Keep login details private and update credentials through the project configuration when needed.</p>
          </form>
        </section>
      </>
    );
  }

  const newCount = submissions.filter((item) => item.status === "new").length;
  const sections = [
    ["brand", "Brand & Homepage"],
    ["brand-rules", "Brand Rules"],
    ["services", "Services"],
    ["projects", "Projects & Impact"],
    ["articles", "Blog"],
    ["media", "Media"],
    ["recognition", "Recognition"],
    ["partners", "Partners"],
    ["faqs", "FAQ"],
    ["contact", "Contact Options"],
    ["seo", "SEO"],
    ["crm", "CRM & Analytics"],
    ["schemas", "CMS Schemas"],
    ["settings", "Settings"],
  ];

  return (
    <>
      <PageHero eyebrow="Admin Dashboard" title="Edit the Zahthic website from one control room." body="Manage brand content, figures, blogs, SEO, services, media, public pages, CRM records, and publishing controls." />
      <section className="admin-shell">
        <aside className="admin-sidebar">
          {sections.map(([key, label]) => (
            <button type="button" className={activeSection === key ? "active" : ""} key={key} onClick={() => setActiveSection(key)}>
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              sessionStorage.removeItem(ADMIN_SESSION_KEY);
              setLoggedIn(false);
            }}
          >
            Logout
          </button>
        </aside>
        <div className="admin-main">
          {notice && <p className="form-status admin-notice" role="status">{notice}</p>}
          <div className="admin-summary">
            <article className="metric-card admin-card">
              <strong>{cms.services.filter((item) => item.published).length}</strong>
              <span>Live services</span>
              <small>{cms.services.length} total records</small>
            </article>
            <article className="metric-card admin-card">
              <strong>{cms.articles.filter((item) => item.published).length}</strong>
              <span>Published blog posts</span>
              <small>{cms.articles.length} total records</small>
            </article>
            <article className="metric-card admin-card">
              <strong>{submissions.length}</strong>
              <span>CRM records</span>
              <small>{newCount} new submissions</small>
            </article>
            <article className="metric-card admin-card">
              <strong>{events.length}</strong>
              <span>Analytics events</span>
              <small>Local event layer active</small>
            </article>
          </div>
          <div className="admin-tools">
            {activeSection === "brand" && <BrandEditor cms={cms} onSave={updateCms} />}
            {activeSection === "brand-rules" && <BrandRulesPanel />}
            {activeSection === "services" && <CollectionEditor title="Services" items={cms.services} onSave={(items) => updateCms({ ...cms, services: items }, "Services saved.")} createItem={() => ({ audience: "Rehabilitation Services", body: "", division: "Rehabilitation Services", featured: false, iconName: "Activity", image: cms.siteImages.hero, published: true, slug: "new-service", summary: "Service summary", title: "New Service" })} renderItem={(item, index, update) => <ServiceFields item={item} update={update} index={index} />} />}
            {activeSection === "projects" && <CollectionEditor title="Projects & Impact" items={cms.projects} onSave={(items) => updateCms({ ...cms, projects: items }, "Projects saved.")} createItem={() => ({ category: "Impact Story", gallery: [], image: cms.siteImages.outreach, location: "Imo State", metric: "Metric pending", published: true, summary: "Project summary", title: "New Project" })} renderItem={(item, index, update) => <ProjectFields item={item} update={update} index={index} />} />}
            {activeSection === "articles" && <CollectionEditor title="Blog Posts" items={cms.articles} onSave={(items) => updateCms({ ...cms, articles: items }, "Blog saved.")} createItem={() => ({ author: "Zahthic Healthcare Solutions", body: "Article body", category: "Health Articles", excerpt: "Article excerpt", image: cms.siteImages.about, published: false, publishedAt: new Date().toISOString().slice(0, 10), readTime: "5 min read", title: "New Article" })} renderItem={(item, index, update) => <ArticleFields item={item} update={update} index={index} />} />}
            {activeSection === "media" && <CollectionEditor title="Media Library" items={cms.mediaItems} onSave={(items) => updateCms({ ...cms, mediaItems: items }, "Media saved.")} createItem={() => ({ description: "Media description", fileUrl: "", image: cms.siteImages.outreach, published: true, title: "New Media Item", type: "Photo" })} renderItem={(item, index, update) => <MediaFields item={item} update={update} index={index} />} />}
            {activeSection === "recognition" && <CollectionEditor title="Recognition" items={cms.recognitionItems} onSave={(items) => updateCms({ ...cms, recognitionItems: items }, "Recognition saved.")} createItem={() => ({ category: "Spotlight", image: cms.siteImages.partners, published: true, summary: "Recognition summary", title: "New Recognition Item" })} renderItem={(item, index, update) => <RecognitionFields item={item} update={update} index={index} />} />}
            {activeSection === "partners" && <PartnerEditor cms={cms} onSave={updateCms} />}
            {activeSection === "faqs" && <FaqEditor cms={cms} onSave={updateCms} />}
            {activeSection === "contact" && <ContactOptionEditor cms={cms} onSave={updateCms} />}
            {activeSection === "seo" && <SeoEditor cms={cms} onSave={updateCms} />}
            {activeSection === "crm" && <CrmAnalyticsPanel submissions={submissions} events={events} clearDemoData={clearDemoData} />}
            {activeSection === "schemas" && <SchemaPanel />}
            {activeSection === "settings" && (
              <section className="admin-panel">
                <h3>Admin settings</h3>
                <div className="workflow-grid">
                  <button className="button secondary" type="button" onClick={exportCms}>Export CMS JSON</button>
                  <label className="button secondary file-button">
                    Import CMS JSON
                    <input type="file" accept="application/json" onChange={(event) => event.currentTarget.files?.[0] && importCms(event.currentTarget.files[0]).catch(() => setNotice("Import failed. Check the JSON file."))} />
                  </label>
                  <button className="button secondary" type="button" onClick={() => updateCms(resetCmsContent(), "CMS reset to default content.")}>Reset content</button>
                  <button className="button secondary" type="button" onClick={() => { localStorage.removeItem(CMS_STORAGE_KEY); updateCms(getDefaultCmsContent(), "Stored CMS data cleared."); }}>Clear stored CMS</button>
                </div>
                <p className="admin-helper">This static-site admin stores edits in browser storage. For multi-user live production editing, connect this model to Supabase, Sanity, WordPress, or another authenticated backend.</p>
              </section>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function TextField({ label, value, onChange, multiline = false, type = "text" }: { label: string; value: string; onChange: (value: string) => void; multiline?: boolean; type?: string }) {
  return (
    <label>
      {label}
      {multiline ? (
        <textarea value={value || ""} onChange={(event) => onChange(event.target.value)} rows={4} />
      ) : (
        <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="toggle-field">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <select value={value || options[0]} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}

function ImageField({ label, image, onChange }: { label: string; image: ImageAsset; onChange: (image: ImageAsset) => void }) {
  async function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => onChange({ alt: image?.alt || file.name, src: String(reader.result) });
    reader.readAsDataURL(file);
  }

  return (
    <div className="image-field">
      <label>
        {label} URL
        <input value={image?.src || ""} onChange={(event) => onChange({ ...image, src: event.target.value })} />
      </label>
      <label>
        Alt text
        <input value={image?.alt || ""} onChange={(event) => onChange({ ...image, alt: event.target.value })} />
      </label>
      <label className="button secondary file-button">
        Upload image
        <input type="file" accept="image/*" onChange={(event) => event.currentTarget.files?.[0] && readFile(event.currentTarget.files[0])} />
      </label>
      {image?.src && <img src={image.src} alt={image.alt || ""} />}
    </div>
  );
}

function CollectionEditor<T extends { title?: string; published?: boolean }>({
  createItem,
  items,
  onSave,
  renderItem,
  title,
}: {
  createItem: () => T;
  items: T[];
  onSave: (items: T[]) => void;
  renderItem: (item: T, index: number, update: (next: T) => void) => ReactNode;
  title: string;
}) {
  const [draft, setDraft] = useState<T[]>(items);

  useEffect(() => setDraft(items), [items]);

  function updateItem(index: number, next: T) {
    setDraft((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)));
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>{title}</h3>
        <div className="button-row">
          <button className="button secondary compact" type="button" onClick={() => setDraft((current) => [createItem(), ...current])}>Add New</button>
          <button className="button primary compact" type="button" onClick={() => onSave(draft)}>Save Changes</button>
        </div>
      </div>
      <div className="editor-list">
        {draft.map((item, index) => (
          <details className="editor-item" key={`${item.title || "item"}-${index}`} open={index === 0}>
            <summary>
              <span>{item.title || `Item ${index + 1}`}</span>
              <small>{item.published === false ? "Draft" : "Published"}</small>
            </summary>
            <div className="editor-grid">
              {renderItem(item, index, (next) => updateItem(index, next))}
              <div className="editor-actions">
                <button className="button secondary compact" type="button" onClick={() => setDraft((current) => current.filter((_, itemIndex) => itemIndex !== index))}>Remove</button>
                <button className="button secondary compact" type="button" onClick={() => setDraft((current) => [current[index], ...current])}>Duplicate</button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function ServiceFields({ item, update }: { item: EditableService; index: number; update: (next: EditableService) => void }) {
  return (
    <>
      <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title, slug: item.slug || slugify(title) })} />
      <TextField label="Slug" value={item.slug} onChange={(slug) => update({ ...item, slug: slugify(slug) })} />
      <SelectField label="Division" value={item.division} options={serviceDivisions.map((division) => division.title)} onChange={(division) => update({ ...item, division, audience: division })} />
      <TextField label="Audience" value={item.audience} onChange={(audience) => update({ ...item, audience })} />
      <SelectField label="Icon" value={item.iconName} options={iconOptions} onChange={(iconName) => update({ ...item, iconName })} />
      <TextField label="Summary" value={item.summary} multiline onChange={(summary) => update({ ...item, summary })} />
      <TextField label="Detailed body" value={item.body} multiline onChange={(body) => update({ ...item, body })} />
      <ImageField label="Service image" image={item.image} onChange={(image) => update({ ...item, image })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
      <ToggleField label="Feature on homepage" checked={item.featured} onChange={(featured) => update({ ...item, featured })} />
    </>
  );
}

function ProjectFields({ item, update }: { item: EditableProject; index: number; update: (next: EditableProject) => void }) {
  return (
    <>
      <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
      <TextField label="Category" value={item.category} onChange={(category) => update({ ...item, category })} />
      <TextField label="Location" value={item.location} onChange={(location) => update({ ...item, location })} />
      <TextField label="Metric / figure" value={item.metric} onChange={(metric) => update({ ...item, metric })} />
      <TextField label="Summary" value={item.summary} multiline onChange={(summary) => update({ ...item, summary })} />
      <ImageField label="Project image" image={item.image} onChange={(image) => update({ ...item, image })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
    </>
  );
}

function ArticleFields({ item, update }: { item: EditableArticle; index: number; update: (next: EditableArticle) => void }) {
  return (
    <>
      <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
      <TextField label="Category" value={item.category} onChange={(category) => update({ ...item, category })} />
      <TextField label="Author" value={item.author} onChange={(author) => update({ ...item, author })} />
      <TextField label="Read time" value={item.readTime} onChange={(readTime) => update({ ...item, readTime })} />
      <TextField label="Published date" type="date" value={item.publishedAt} onChange={(publishedAt) => update({ ...item, publishedAt })} />
      <TextField label="Excerpt" value={item.excerpt} multiline onChange={(excerpt) => update({ ...item, excerpt })} />
      <TextField label="Body" value={item.body} multiline onChange={(body) => update({ ...item, body })} />
      <ImageField label="Cover image" image={item.image} onChange={(image) => update({ ...item, image })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
    </>
  );
}

function MediaFields({ item, update }: { item: EditableMediaItem; index: number; update: (next: EditableMediaItem) => void }) {
  return (
    <>
      <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
      <SelectField label="Type" value={item.type} options={["Photo", "Video", "Publication", "Press Release", "Magazine Feature", "Download"]} onChange={(type) => update({ ...item, type })} />
      <TextField label="File / URL" value={item.fileUrl} onChange={(fileUrl) => update({ ...item, fileUrl })} />
      <TextField label="Description" value={item.description} multiline onChange={(description) => update({ ...item, description })} />
      <ImageField label="Thumbnail" image={item.image} onChange={(image) => update({ ...item, image })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
    </>
  );
}

function RecognitionFields({ item, update }: { item: EditableRecognitionItem; index: number; update: (next: EditableRecognitionItem) => void }) {
  return (
    <>
      <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
      <TextField label="Category" value={item.category} onChange={(category) => update({ ...item, category })} />
      <TextField label="Summary" value={item.summary} multiline onChange={(summary) => update({ ...item, summary })} />
      <ImageField label="Image" image={item.image} onChange={(image) => update({ ...item, image })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
    </>
  );
}

function BrandRulesPanel() {
  const colors = [
    ["Midnight Teal", "#0C1F1D", "Primary brand dark, headings, dark backgrounds"],
    ["Lime Sprout", "#98BF2E", "Primary accent, CTAs, icons, active states"],
    ["Peal Yellow", "#EFC652", "Secondary accent for highlights and dark sections"],
    ["Obsidian Black", "#0C0E0D", "Deep contrast and dark-mode foundation"],
    ["Pure White", "#FFFFFF", "Clean brand space and primary light surface"],
  ];
  const logoRules = [
    "Use the approved full logo, sub-brand logo, wordmark, or icon variation only.",
    "Keep clear space around the logo so nearby text, icons, and navigation do not crowd it.",
    "Use the white logo on colorful or dark backgrounds.",
    "Do not recolor, rotate, stretch, compress, fade, or add shadows to the logo.",
  ];
  const typographyRules = [
    "Sora is the primary font for headings, hero text, section titles, and strong brand moments.",
    "Montserrat is the secondary font for body copy, forms, navigation, labels, and longer reading.",
    "Use the available brand weights intentionally: lighter weights for supporting copy, bold weights for hierarchy.",
  ];

  return (
    <section className="admin-panel brand-rules-panel">
      <div className="admin-panel-head">
        <h3>Zahthic brand rules</h3>
        <small>From the official brand guideline book</small>
      </div>
      <div className="brand-rule-grid">
        <article className="brand-rule-card">
          <h4>Official palette</h4>
          <div className="brand-swatch-grid">
            {colors.map(([name, value, usage]) => (
              <div className="brand-swatch" key={name}>
                <span style={{ background: value }} />
                <strong>{name}</strong>
                <code>{value}</code>
                <small>{usage}</small>
              </div>
            ))}
          </div>
        </article>
        <article className="brand-rule-card">
          <h4>Logo use</h4>
          <div className="brand-logo-rule">
            <BrandLogo variant="auto" />
          </div>
          <div className="detail-list">
            {logoRules.map((rule) => <span key={rule}>{rule}</span>)}
          </div>
        </article>
        <article className="brand-rule-card">
          <h4>Typography</h4>
          <div className="type-sample">
            <strong>Sora primary font</strong>
            <span>Transforming Health. Empowering Lives.</span>
          </div>
          <div className="type-sample secondary">
            <strong>Montserrat secondary font</strong>
            <span>Use for clear body copy, forms, labels, and helpful content.</span>
          </div>
          <div className="detail-list">
            {typographyRules.map((rule) => <span key={rule}>{rule}</span>)}
          </div>
        </article>
        <article className="brand-rule-card">
          <h4>Visual pattern and imagery</h4>
          <div className="brand-pattern-sample" aria-hidden="true" />
          <p>Use the Zahthic geometric pattern as a controlled brand accent in heroes, footers, section dividers, and official materials. Keep healthcare photos clear, respectful, and human-centered.</p>
        </article>
      </div>
    </section>
  );
}

function BrandEditor({ cms, onSave }: { cms: CmsContent; onSave: (next: CmsContent, message?: string) => void }) {
  const [draft, setDraft] = useState(cms);
  useEffect(() => setDraft(cms), [cms]);
  function saveDraft() {
    onSave({ ...draft, brand: { ...draft.brand, supporting: draft.brand.footerMotto } }, "Brand and homepage saved.");
  }
  return (
    <section className="admin-panel">
      <div className="admin-panel-head">
        <h3>Brand, homepage and key figures</h3>
        <button className="button primary compact" type="button" onClick={saveDraft}>Save Changes</button>
      </div>
      <h4>Homepage Hero</h4>
      <div className="editor-grid">
        <TextField label="Brand name" value={draft.brand.name} onChange={(name) => setDraft({ ...draft, brand: { ...draft.brand, name } })} />
        <TextField label="Hero eyebrow" value={draft.brand.heroEyebrow} onChange={(heroEyebrow) => setDraft({ ...draft, brand: { ...draft.brand, heroEyebrow } })} />
        <TextField label="Tagline / hero headline" value={draft.brand.tagline} multiline onChange={(tagline) => setDraft({ ...draft, brand: { ...draft.brand, tagline } })} />
        <TextField label="Hero body" value={draft.brand.heroBody} multiline onChange={(heroBody) => setDraft({ ...draft, brand: { ...draft.brand, heroBody } })} />
        <TextField label="Footer motto" value={draft.brand.footerMotto} onChange={(footerMotto) => setDraft({ ...draft, brand: { ...draft.brand, footerMotto, supporting: footerMotto } })} />
        <TextField label="SPACE homepage teaser" value={draft.brand.spaceTeaser} multiline onChange={(spaceTeaser) => setDraft({ ...draft, brand: { ...draft.brand, spaceTeaser } })} />
        <TextField label="Location" value={draft.brand.location} onChange={(location) => setDraft({ ...draft, brand: { ...draft.brand, location } })} />
        <TextField label="Instagram" value={draft.brand.instagram} onChange={(instagram) => setDraft({ ...draft, brand: { ...draft.brand, instagram } })} />
        <TextField label="Facebook" value={draft.brand.facebook} onChange={(facebook) => setDraft({ ...draft, brand: { ...draft.brand, facebook } })} />
      </div>
      <div className="admin-panel-head subsection-head">
        <h4>Core Focus Areas</h4>
        <button className="button secondary compact" type="button" onClick={() => setDraft({ ...draft, coreFocusAreas: [{ description: "Focus area description", iconName: "Sparkles", title: "New Focus Area" }, ...draft.coreFocusAreas] })}>Add Focus Area</button>
      </div>
      <div className="editor-list compact-list">
        {draft.coreFocusAreas.map((area, index) => (
          <div className="editor-grid" key={`${area.title}-${index}`}>
            <TextField label="Title" value={area.title} onChange={(title) => setDraft({ ...draft, coreFocusAreas: draft.coreFocusAreas.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item) })} />
            <SelectField label="Icon" value={area.iconName} options={iconOptions} onChange={(iconName) => setDraft({ ...draft, coreFocusAreas: draft.coreFocusAreas.map((item, itemIndex) => itemIndex === index ? { ...item, iconName } : item) })} />
            <TextField label="Description" value={area.description} multiline onChange={(description) => setDraft({ ...draft, coreFocusAreas: draft.coreFocusAreas.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item) })} />
            <button className="button secondary compact" type="button" onClick={() => setDraft({ ...draft, coreFocusAreas: draft.coreFocusAreas.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
          </div>
        ))}
      </div>
      <h4>Homepage Images</h4>
      <div className="editor-grid">
        {Object.entries(draft.siteImages).map(([key, image]) => (
          <ImageField key={key} label={key} image={image} onChange={(nextImage) => setDraft({ ...draft, siteImages: { ...draft.siteImages, [key]: nextImage } })} />
        ))}
      </div>
      <div className="admin-panel-head subsection-head">
        <h4>Impact Figures</h4>
        <button className="button secondary compact" type="button" onClick={() => setDraft({ ...draft, impactStats: [{ label: "New figure", note: "Short note", value: "0" }, ...draft.impactStats] })}>Add Figure</button>
      </div>
      <div className="editor-list compact-list">
        {draft.impactStats.map((stat, index) => (
          <div className="editor-grid" key={`${stat.label}-${index}`}>
            <TextField label="Value" value={stat.value} onChange={(value) => setDraft({ ...draft, impactStats: draft.impactStats.map((item, itemIndex) => itemIndex === index ? { ...item, value } : item) })} />
            <TextField label="Label" value={stat.label} onChange={(label) => setDraft({ ...draft, impactStats: draft.impactStats.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item) })} />
            <TextField label="Note" value={stat.note} onChange={(note) => setDraft({ ...draft, impactStats: draft.impactStats.map((item, itemIndex) => itemIndex === index ? { ...item, note } : item) })} />
            <button className="button secondary compact" type="button" onClick={() => setDraft({ ...draft, impactStats: draft.impactStats.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function PartnerEditor({ cms, onSave }: { cms: CmsContent; onSave: (next: CmsContent, message?: string) => void }) {
  return <CollectionEditor<EditablePartnerCategory> title="Partners" items={cms.partnerCategories} onSave={(partnerCategories) => onSave({ ...cms, partnerCategories }, "Partners saved.")} createItem={() => ({ iconName: "HandHeart", logo: { src: "", alt: "New Partner logo" }, published: true, title: "New Partner", website: "" })} renderItem={(item, _index, update) => (
    <>
      <TextField label="Name / category" value={item.title} onChange={(title) => update({ ...item, title })} />
      <SelectField label="Icon" value={item.iconName} options={iconOptions} onChange={(iconName) => update({ ...item, iconName })} />
      <TextField label="Website" value={item.website} onChange={(website) => update({ ...item, website })} />
      <ImageField label="Logo" image={item.logo || { src: "", alt: item.title }} onChange={(logo) => update({ ...item, logo })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
    </>
  )} />;
}

function FaqEditor({ cms, onSave }: { cms: CmsContent; onSave: (next: CmsContent, message?: string) => void }) {
  return <CollectionEditor title="FAQ" items={cms.faqs} onSave={(faqs) => onSave({ ...cms, faqs }, "FAQ saved.")} createItem={() => ({ answer: "Answer", published: true, question: "New question?" })} renderItem={(item, _index, update) => (
    <>
      <TextField label="Question" value={item.question} onChange={(question) => update({ ...item, question })} />
      <TextField label="Answer" value={item.answer} multiline onChange={(answer) => update({ ...item, answer })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
    </>
  )} />;
}

function ContactOptionEditor({ cms, onSave }: { cms: CmsContent; onSave: (next: CmsContent, message?: string) => void }) {
  return <CollectionEditor title="Contact Cards" items={cms.contactOptions} onSave={(contactOptions) => onSave({ ...cms, contactOptions }, "Contact options saved.")} createItem={() => ({ iconName: "CalendarCheck", published: true, text: "Card text", title: "New Contact Option" })} renderItem={(item, _index, update) => (
    <>
      <TextField label="Title" value={item.title} onChange={(title) => update({ ...item, title })} />
      <TextField label="Text" value={item.text} multiline onChange={(text) => update({ ...item, text })} />
      <SelectField label="Icon" value={item.iconName} options={iconOptions} onChange={(iconName) => update({ ...item, iconName })} />
      <ToggleField label="Published" checked={item.published} onChange={(published) => update({ ...item, published })} />
    </>
  )} />;
}

function SeoEditor({ cms, onSave }: { cms: CmsContent; onSave: (next: CmsContent, message?: string) => void }) {
  return <CollectionEditor title="SEO Metadata" items={cms.seoRecords} onSave={(seoRecords) => onSave({ ...cms, seoRecords }, "SEO metadata saved.")} createItem={() => ({ description: "SEO description", ogImage: "", path: "/new-page", title: "Page Title | Zahthic Healthcare Solutions" })} renderItem={(item, _index, update) => (
    <>
      <TextField label="Route path" value={item.path} onChange={(path) => update({ ...item, path })} />
      <TextField label="SEO title" value={item.title} onChange={(title) => update({ ...item, title })} />
      <TextField label="Meta description" value={item.description} multiline onChange={(description) => update({ ...item, description })} />
      <TextField label="Open Graph image URL" value={item.ogImage || ""} onChange={(ogImage) => update({ ...item, ogImage })} />
    </>
  )} />;
}

function CrmAnalyticsPanel({ clearDemoData, events, submissions }: { clearDemoData: () => void; events: AnalyticsEvent[]; submissions: SubmissionRecord[] }) {
  return (
    <>
      <section className="admin-panel">
        <div className="admin-panel-head">
          <h3>Recent CRM submissions</h3>
          <button className="button secondary compact" type="button" onClick={clearDemoData}>Clear demo data</button>
        </div>
        <div className="admin-table">
          {(submissions.length ? submissions : [{ id: "No records yet", kind: "contact" as FormKind, status: "new" as SubmissionStatus, createdAt: "", sourceRoute: "", data: { message: "Submit a form to populate this CRM queue." } }]).slice(0, 12).map((item) => (
            <article key={item.id}>
              <strong>{item.id}</strong>
              <span>{item.kind}</span>
              <small>{item.data.name || item.data.email || item.data.message}</small>
            </article>
          ))}
        </div>
      </section>
      <section className="admin-panel">
        <h3>Analytics events</h3>
        <div className="admin-table">
          {(events.length ? events : [{ name: "No events yet", route: "/", timestamp: "", payload: { note: "Browse the site to populate analytics." } }]).slice(0, 12).map((item, index) => (
            <article key={`${item.name}-${item.timestamp}-${index}`}>
              <strong>{item.name}</strong>
              <span>{item.route}</span>
              <small>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "Waiting for activity"}</small>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function SchemaPanel() {
  return (
    <section className="admin-panel">
      <h3>CMS schemas</h3>
      <div className="schema-list">
        {cmsSchemas.map((schema) => (
          <div className="schema-card" key={schema.name}>
            <div>
              <h3>{schema.label}</h3>
              <p>{schema.description}</p>
            </div>
            <div className="schema-fields">
              {schema.fields.map((field) => (
                <span key={field.name}>{field.label}{field.required ? " *" : ""}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
