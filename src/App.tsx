import { useEffect, useMemo, useRef, useState } from "react";
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
import logoDark from "./assets/zahthic-logo-2.svg";
import logoLight from "./assets/zahthic-logo-1.svg";
import {
  articles,
  brand,
  contactOptions,
  faqs,
  impactStats,
  mediaItems,
  navItems,
  partnerCategories,
  projects,
  recognitionItems,
  services,
  siteImages,
} from "./content";
import type { Article, ImageAsset, Project, Service } from "./content";

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

function getRoute() {
  const hash = window.location.hash.replace("#", "");
  return hash || "/";
}

function getRoutePath(route: string) {
  return route.split("?")[0].replace(/\/+$/, "") || "/";
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

function getSeoForRoute(route: string) {
  const path = getRoutePath(route);
  const [section, detailSlug] = path.split("/").filter(Boolean);
  const fallback = {
    description: "Premium rehabilitation, prevention, wellness, healthcare education, and community impact support in Imo State, Nigeria.",
    title: "Zahthic Healthcare Solutions",
  };

  if (section === "services" && detailSlug) {
    const item = services.find((service) => service.slug === detailSlug);
    if (item) return { title: `${item.title} | Zahthic Healthcare Solutions`, description: item.summary };
  }
  if (section === "blog" && detailSlug) {
    const item = articles.find((article) => slugify(article.title) === detailSlug);
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

export function App() {
  const [route, setRoute] = useState(getRoute());
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("zahthic-theme") as Theme) || "light");
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

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
    const seo = getSeoForRoute(route);
    document.title = seo.title;
    upsertMeta("description", seo.description);
    upsertMeta("og:title", seo.title, true);
    upsertMeta("og:description", seo.description, true);
    upsertMeta("og:type", "website", true);
    upsertMeta("twitter:card", "summary_large_image");
    trackEvent("page_view", route, { title: seo.title });
    mainRef.current?.focus({ preventScroll: true });
  }, [route]);

  const page = useMemo(() => {
    const path = getRoutePath(route);
    const [section, detailSlug] = path.split("/").filter(Boolean);
    const legacyServiceSlug = section === "services" && !detailSlug ? getQueryParam(route, "service") : "";

    if (section === "services" && (detailSlug || legacyServiceSlug)) {
      const service = services.find((item) => item.slug === (detailSlug || legacyServiceSlug));
      return service ? <ServiceDetailPage service={service} /> : <NotFoundPage />;
    }

    if (section === "impact" && detailSlug) {
      const project = projects.find((item) => slugify(item.title) === detailSlug);
      return project ? <ProjectDetailPage project={project} /> : <NotFoundPage />;
    }

    if (section === "blog" && detailSlug) {
      const article = articles.find((item) => slugify(item.title) === detailSlug);
      return article ? <ArticleDetailPage article={article} /> : <NotFoundPage />;
    }

    if (section === "media" && detailSlug) {
      const item = mediaItems.find((entry) => slugify(entry.title) === detailSlug);
      return item ? <MediaDetailPage item={item} /> : <NotFoundPage />;
    }

    if (section === "recognition" && detailSlug) {
      const item = recognitionItems.find((entry) => slugify(entry.title) === detailSlug);
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
  }, [route]);

  return (
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
          {[...navItems, { label: "Support", href: "#/support" }, { label: "Admin", href: "#/admin" }].map((item) => (
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
  return (
    <footer className="site-footer">
      <div>
        <a className="brand-lockup footer-brand" href="#/">
          <BrandLogo variant="dark" />
        </a>
        <p>{brand.tagline}</p>
      </div>
      <div className="footer-grid">
        <FooterLinks title="Explore" links={[["About", "#/about"], ["Services", "#/services"], ["Impact", "#/impact"], ["Blog", "#/blog"]]} />
        <FooterLinks title="Connect" links={[["Partners", "#/partners"], ["Media Center", "#/media"], ["Careers", "#/careers"], ["Contact", "#/contact"]]} />
        <FooterLinks title="Support" links={[["SPACE Project", "#/space"], ["Donate / Support", "#/support"], ["FAQ", "#/faq"], ["Admin", "#/admin"]]} />
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
  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">Healthcare. Rehabilitation. Prevention. Community Impact.</span>
          <h1>{brand.tagline}</h1>
          <p className="hero-support">{brand.supporting}</p>
          <p>
            Zahthic helps individuals, families, organizations, and communities access rehabilitation, preventive healthcare, wellness education, and long-term support for better health outcomes.
          </p>
          <div className="button-row">
            <a className="button primary" href="#/contact">
              Book Consultation <ArrowRight size={18} />
            </a>
            <a className="button secondary" href="#/partners">
              Partner With Us
            </a>
          </div>
        </div>
        <VisualPanel image={siteImages.hero} label="Rehabilitation, wellness, and community health in action">
          <div className="floating-proof">
            <strong>10</strong>
            <span>Care pathways mapped</span>
          </div>
        </VisualPanel>
      </section>
      <TrustStrip />
      <section className="content-section two-column">
        <div>
          <span className="eyebrow">Who we are</span>
          <h2>More than a clinic. A healthcare impact organization.</h2>
        </div>
        <div>
          <p>
            Zahthic was created to close the gap between clinical care and community wellbeing. Our work brings together physiotherapy, rehabilitation, prevention, wellness, education, home care, and outreach programs so people can recover, function better, and live with greater confidence.
          </p>
          <a className="text-link" href="#/about">Learn about Zahthic <ArrowRight size={16} /></a>
        </div>
      </section>
      <ServicesPreview />
      <ImpactBand />
      <ProjectFeature />
      <SpaceFeature />
      <BlogPreview />
      <PartnerPreview />
      <FinalCta />
    </>
  );
}

function TrustStrip() {
  const items = ["Rehabilitation-focused care", "Community-centered programs", "Prevention education", "Home and workplace support", "Impact-driven outreach"];
  return (
    <section className="trust-strip" aria-label="Zahthic care strengths">
      {items.map((item) => (
        <div key={item}>
          <CheckCircle2 size={18} />
          <span>{item}</span>
        </div>
      ))}
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
  return (
    <section className="content-section">
      <SectionHeader
        eyebrow="Services"
        title="Integrated services for recovery, prevention, and lifelong wellbeing."
        body="Designed for individuals, families, organizations, and communities across the health journey."
      />
      <div className="card-grid service-grid">
        {services.slice(0, 6).map((service) => (
          <ServiceCard key={service.slug} service={service} />
        ))}
      </div>
      <a className="button secondary section-action" href="#/services">
        View all services <ArrowRight size={18} />
      </a>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <article className="service-card">
      <img className="service-image" src={service.image.src} alt={service.image.alt} loading="lazy" decoding="async" />
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
  return (
    <section className="impact-band">
      <div>
        <span className="eyebrow">Measurable impact</span>
        <h2>Building healthier communities through practical action.</h2>
        <p>Launch indicators reflect the current service model, project tracks, education resources, and partnership pathways prepared for Zahthic.</p>
      </div>
      <div className="metric-grid">
        {impactStats.map((stat) => (
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
  return (
    <section className="content-section feature-split">
      <VisualPanel image={siteImages.outreach} label="Community outreach and prevention education in action" />
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
  return (
    <section className="space-feature">
      <div>
        <span className="eyebrow">Flagship initiative</span>
        <h2>The SPACE Project</h2>
        <p>A scalable platform for prevention, rehabilitation, education, outreach, and partnership-led community health impact.</p>
      </div>
      <div className="step-list">
        {["Vision", "Objectives", "Activities", "Gallery", "Impact", "Partnership Opportunities"].map((item) => (
          <a href="#/space" key={item}>{item}</a>
        ))}
      </div>
    </section>
  );
}

function BlogPreview() {
  return (
    <section className="content-section">
      <SectionHeader eyebrow="Insights" title="Latest insights from rehabilitation, wellness, and community health." body="Practical education for healthier lives and stronger communities." />
      <div className="card-grid">
        {articles.map((article) => (
          <BlogCard key={article.title} article={article} />
        ))}
      </div>
    </section>
  );
}

function BlogCard({ article }: { article: Article }) {
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
  return (
    <section className="content-section partner-preview">
      <SectionHeader eyebrow="Partners" title="Partnerships that expand access to better health." body="Logo placeholders remain neutral until approved partner assets are supplied." />
      <div className="logo-grid">
        {partnerCategories.map((partner) => {
          const Icon = partner.icon;
          return (
            <article className="logo-tile" key={partner.title}>
              <Icon size={24} />
              <span>{partner.title}</span>
            </article>
          );
        })}
      </div>
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
  return (
    <>
      <PageHero eyebrow="About Zahthic" title="Transforming health through rehabilitation, prevention, wellness, and community impact." body="Zahthic was built on the belief that healthcare should not end at treatment." />
      <section className="content-section two-column">
        <div>
          <h2>From clinical care to a broader healthcare movement.</h2>
          <MediaImage image={siteImages.about} variant="wide" />
        </div>
        <div>
          <p>Zahthic began with a strong foundation in physiotherapy and rehabilitation. Over time, that foundation expanded into a wider vision: a healthcare solutions organization that supports recovery, promotes prevention, strengthens communities, and creates practical pathways to long-term wellbeing.</p>
          <p>Founded by PT Cosmas Harrison Ifeanyichukwu, Zahthic reflects a commitment to expanding access to rehabilitation, preventive healthcare, wellness, and community-centered support across Nigeria.</p>
        </div>
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
  return (
    <>
      <PageHero eyebrow="Our Services" title="Care designed for recovery, prevention, wellness, and long-term function." body="Integrated healthcare services supporting people at home, at work, in recovery, and within their communities." />
      <section className="content-section">
        <div className="filter-row" aria-label="Service categories">
          {["All", "Rehabilitation", "Wellness", "Community", "Corporate"].map((filter) => <span key={filter}>{filter}</span>)}
        </div>
        <div className="card-grid service-grid">
          {services.map((service) => <ServiceCard key={service.slug} service={service} />)}
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function ServiceDetailPage({ service }: { service: Service }) {
  const Icon = service.icon;
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
  return (
    <>
      <PageHero eyebrow="Projects & Impact" title="Healthcare impact that reaches people, families, workplaces, and communities." body="Zahthic's impact work expands access to rehabilitation, prevention, wellness education, and community-centered care." />
      <ImpactBand />
      <ProjectList projects={projects} />
    </>
  );
}

function ProjectDetailPage({ project }: { project: Project }) {
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

function ProjectList({ projects }: { projects: Project[] }) {
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

function ArticleDetailPage({ article }: { article: Article }) {
  return (
    <>
      <PageHero eyebrow={article.category} title={article.title} body={article.excerpt} />
      <section className="content-section feature-split detail-section">
        <MediaImage image={article.image} variant="feature" />
        <article className="detail-copy">
          <span className="eyebrow">{article.readTime}</span>
          <h2>Article outline</h2>
          <p>{article.excerpt}</p>
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
  return (
    <>
      <PageHero eyebrow="Flagship Initiative" title="The SPACE Project" body="A scalable community health initiative connecting prevention, rehabilitation, education, outreach, and partnerships." />
      <section className="content-section feature-split">
        <div>
          <span className="eyebrow">Future-ready impact</span>
          <h2>A platform for structured community health transformation.</h2>
          <p>The full meaning of SPACE should be confirmed before launch. Until confirmed, the site treats it as the proper initiative name.</p>
        </div>
        <div className="feature-stack">
          <MediaImage image={siteImages.space} variant="feature" />
          <div className="step-list light">
            {["Increase rehabilitation awareness", "Promote preventive healthcare", "Build community partnerships", "Document measurable impact"].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>
    </>
  );
}

function PartnersPage() {
  return (
    <>
      <PageHero eyebrow="Partners & Collaborators" title="Partnerships that expand access to better health." body="Zahthic works with organizations and institutions committed to accessible healthcare, rehabilitation, prevention, wellness, and community transformation." />
      <section className="content-section feature-split">
        <MediaImage image={siteImages.partners} variant="feature" />
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
  const [activeType, setActiveType] = useState("All");
  const filters = ["All", "Photo", "Video", "Publication", "Press Release", "Download"];
  const visibleItems = activeType === "All" ? mediaItems : mediaItems.filter((item) => item.type === activeType);
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

function MediaDetailPage({ item }: { item: (typeof mediaItems)[number] }) {
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
  return (
    <>
      <PageHero eyebrow="Recognition & Spotlight" title="Celebrating people and partnerships advancing health impact." body="A dynamic space for distinguished personalities, healthcare champions, strategic partners, award recipients, and special recognitions." />
      <section className="content-section">
        <div className="card-grid">
          {recognitionItems.map((item) => (
            <article className="project-card" key={item.title}>
              <MediaImage image={item.image} />
              <span>Spotlight</span>
              <h3>{item.title}</h3>
              <p>CMS-managed spotlight content with image, summary, category, and publishing status.</p>
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

function RecognitionDetailPage({ item }: { item: (typeof recognitionItems)[number] }) {
  return (
    <>
      <PageHero eyebrow="Recognition & Spotlight" title={item.title} body="A CMS-ready spotlight page for approved people, partners, award recipients, and healthcare champions." />
      <section className="content-section feature-split detail-section">
        <MediaImage image={item.image} variant="feature" />
        <div className="detail-copy">
          <h2>Spotlight profile</h2>
          <p>This page is prepared for approved biography, recognition notes, partnership context, and publishing status once Zahthic supplies final content.</p>
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
  return (
    <>
      <PageHero eyebrow="Frequently Asked Questions" title="Answers to help you take the next step with confidence." body="Find quick answers about Zahthic's services, consultations, community programs, partnerships, volunteering, and support." />
      <section className="content-section faq-list">
        {faqs.map((faq) => (
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
  return (
    <>
      <PageHero eyebrow="Contact Zahthic" title="Let us help you take the next step." body="For rehabilitation support, home care, workplace wellness, outreach, partnerships, volunteering, or media information, the Zahthic team is ready to respond." />
      <section className="content-section card-grid">
        {contactOptions.map((option) => {
          const Icon = option.icon;
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
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>(() => getStoredJson<SubmissionRecord[]>(CRM_STORAGE_KEY, []));
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => getStoredJson<AnalyticsEvent[]>(ANALYTICS_STORAGE_KEY, []));
  const selectedSchema = getQueryParam(getRoute(), "schema") || cmsSchemas[0]?.name;
  const activeSchema = cmsSchemas.find((schema) => schema.name === selectedSchema) || cmsSchemas[0];

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

  function clearDemoData() {
    localStorage.removeItem(CRM_STORAGE_KEY);
    localStorage.removeItem(ANALYTICS_STORAGE_KEY);
    setSubmissions([]);
    setEvents([]);
  }

  const newCount = submissions.filter((item) => item.status === "new").length;

  return (
    <>
      <PageHero eyebrow="Admin / CMS Preview" title="Content, CRM, analytics, and publishing controls." body="This dashboard shows CMS schemas, captured form records, newsletter leads, route analytics, and Week 6 integration readiness." />
      <section className="admin-shell">
        <aside className="admin-sidebar">
          {cmsSchemas.map((schema, index) => (
            <a href={`#/admin?schema=${schema.name}`} className={activeSchema.name === schema.name || (!selectedSchema && index === 0) ? "active" : ""} key={schema.name}>
              {schema.label}
            </a>
          ))}
        </aside>
        <div className="admin-main">
          <div className="admin-summary">
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
            <article className="metric-card admin-card">
              <strong>{cmsSchemas.length}</strong>
              <span>CMS models</span>
              <small>Blog, services, projects, media, partners</small>
            </article>
            <article className="metric-card admin-card">
              <strong>6</strong>
              <span>Integrations</span>
              <small>Forms, CRM, WhatsApp, newsletter, analytics, chat</small>
            </article>
          </div>
          <div className="admin-tools">
            <section className="schema-card">
              <div>
                <h3>{activeSchema.label}</h3>
                <p>{activeSchema.description}</p>
              </div>
              <div className="schema-fields">
                {activeSchema.fields.map((field) => (
                  <span key={field.name}>{field.label}{field.required ? " *" : ""}</span>
                ))}
              </div>
            </section>
            <section className="admin-panel">
              <div className="admin-panel-head">
                <h3>Recent CRM submissions</h3>
                <button className="button secondary compact" type="button" onClick={clearDemoData}>Clear demo data</button>
              </div>
              <div className="admin-table">
                {(submissions.length ? submissions : [{ id: "No records yet", kind: "contact" as FormKind, status: "new" as SubmissionStatus, createdAt: "", sourceRoute: "", data: { message: "Submit a form to populate this CRM queue." } }]).slice(0, 8).map((item) => (
                  <article key={item.id}>
                    <strong>{item.id}</strong>
                    <span>{item.kind}</span>
                    <small>{item.data.name || item.data.email || item.data.message}</small>
                  </article>
                ))}
              </div>
            </section>
            <section className="admin-panel">
              <h3>Publishing workflow</h3>
              <div className="workflow-grid">
                {["Draft", "Review", "SEO Check", "Publish"].map((step, index) => (
                  <span key={step}><Clock size={16} /> {index + 1}. {step}</span>
                ))}
              </div>
            </section>
            <section className="admin-panel">
              <h3>Integration readiness</h3>
              <div className="workflow-grid">
                {["CRM endpoint ready", "Newsletter capture ready", "Analytics dataLayer active", "WhatsApp handoff active", "Chat widget active", "Donation handoff ready"].map((item) => (
                  <span key={item}><ShieldCheck size={16} /> {item}</span>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
