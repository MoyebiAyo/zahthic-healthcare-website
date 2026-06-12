export type FieldType = "text" | "textarea" | "richtext" | "image" | "gallery" | "select" | "number" | "date" | "url" | "boolean";

export type CmsField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  helpText?: string;
  options?: string[];
};

export type CmsSchema = {
  name: string;
  label: string;
  description: string;
  fields: CmsField[];
};

export const cmsSchemas: CmsSchema[] = [
  {
    name: "blogPost",
    label: "Blog Post",
    description: "Health articles, rehabilitation tips, community updates, press releases, research insights, and project reports.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "category", label: "Category", type: "select", required: true, options: ["Health Articles", "Rehabilitation Tips", "Physiotherapy Education", "Community Updates", "Press Releases", "Research Insights", "Project Reports", "Public Health News"] },
      { name: "excerpt", label: "Excerpt", type: "textarea", required: true },
      { name: "coverImage", label: "Cover Image", type: "image" },
      { name: "body", label: "Article Body", type: "richtext", required: true },
      { name: "publishedAt", label: "Published Date", type: "date" },
    ],
  },
  {
    name: "service",
    label: "Service",
    description: "Public service cards and detailed service pages.",
    fields: [
      { name: "title", label: "Service Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text", required: true },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "audience", label: "Audience", type: "text" },
      { name: "body", label: "Detailed Content", type: "richtext" },
      { name: "featured", label: "Feature on Homepage", type: "boolean" },
    ],
  },
  {
    name: "project",
    label: "Project / Impact Story",
    description: "Outreach projects, interventions, campaigns, reports, impact stories, and beneficiary stories.",
    fields: [
      { name: "title", label: "Project Title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Outreach", "Intervention", "Campaign", "Awareness", "Annual Report", "Impact Story", "Beneficiary Story"] },
      { name: "location", label: "Location", type: "text" },
      { name: "date", label: "Date", type: "date" },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "metrics", label: "Verified Metrics", type: "textarea", helpText: "Use only verified numbers." },
      { name: "gallery", label: "Gallery", type: "gallery" },
    ],
  },
  {
    name: "impactStat",
    label: "Impact Stat",
    description: "Verified metrics displayed across the homepage and impact pages.",
    fields: [
      { name: "value", label: "Value", type: "text", required: true },
      { name: "label", label: "Label", type: "text", required: true },
      { name: "source", label: "Source / Evidence", type: "text", helpText: "Required before publishing real claims." },
      { name: "asOfDate", label: "As-of Date", type: "date" },
    ],
  },
  {
    name: "testimonial",
    label: "Testimonial",
    description: "Approved testimonials from patients, families, communities, partners, volunteers, and corporate clients.",
    fields: [
      { name: "quote", label: "Quote", type: "textarea", required: true },
      { name: "name", label: "Name", type: "text" },
      { name: "category", label: "Category", type: "select", options: ["Patient", "Family", "Community", "Corporate", "Partner", "Volunteer"] },
      { name: "permission", label: "Permission To Publish", type: "boolean", required: true },
    ],
  },
  {
    name: "spotlight",
    label: "Recognition & Spotlight",
    description: "Distinguished personalities, healthcare champions, strategic partners, award recipients, and special recognitions.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Distinguished Personality", "Healthcare Champion", "Strategic Partner", "Award Recipient", "Special Recognition"] },
      { name: "summary", label: "Summary", type: "textarea" },
      { name: "image", label: "Image", type: "image" },
    ],
  },
  {
    name: "media",
    label: "Media Item",
    description: "Photo gallery, video gallery, publications, press releases, magazine features, and downloads.",
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "type", label: "Type", type: "select", options: ["Photo", "Video", "Publication", "Press Release", "Magazine Feature", "Download"] },
      { name: "file", label: "File / URL", type: "url" },
      { name: "thumbnail", label: "Thumbnail", type: "image" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    name: "partner",
    label: "Partner",
    description: "Government agencies, NGOs, healthcare institutions, educational institutions, corporate organizations, and development partners.",
    fields: [
      { name: "name", label: "Partner Name", type: "text", required: true },
      { name: "category", label: "Category", type: "select", options: ["Government Agency", "NGO", "Healthcare Institution", "Educational Institution", "Corporate Organization", "Development Partner"] },
      { name: "logo", label: "Logo", type: "image" },
      { name: "website", label: "Website", type: "url" },
      { name: "permission", label: "Logo Permission Confirmed", type: "boolean" },
    ],
  },
];
