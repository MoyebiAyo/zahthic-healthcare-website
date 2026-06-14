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
import africanOutreachHero from "./assets/african-outreach-hero.jpg";
import blackCliniciansPatient from "./assets/black-clinicians-patient.jpg";
import blackDoctorDesk from "./assets/black-doctor-desk.jpg";
import blackDoctorExam from "./assets/black-doctor-exam.jpg";
import blackDoctorLaptop from "./assets/black-doctor-laptop.jpg";
import blackDoctorStethoscope from "./assets/black-doctor-stethoscope.jpg";
import blackFemaleDoctorPhone from "./assets/black-female-doctor-phone.jpg";
import kadunaCommunityOutreach from "./assets/kaduna-community-outreach.jpg";
import kadunaHealthCheckup from "./assets/kaduna-health-checkup.jpg";
import nigeriaRuralHealth from "./assets/nigeria-rural-health.jpg";

export type Service = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  icon: LucideIcon;
  image: ImageAsset;
};

export type Project = {
  title: string;
  category: string;
  location: string;
  summary: string;
  metric: string;
  image: ImageAsset;
};

export type Article = {
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  image: ImageAsset;
};

export type ImageAsset = {
  src: string;
  alt: string;
};

export const siteImages = {
  hero: {
    src: africanOutreachHero,
    alt: "Healthcare workers supporting an elderly man during community medical outreach in Kaduna, Nigeria",
  },
  about: {
    src: blackDoctorDesk,
    alt: "Black doctor seated at a desk with a laptop and stethoscope",
  },
  outreach: {
    src: kadunaCommunityOutreach,
    alt: "Healthcare workers assisting during a community outreach gathering in Kaduna, Nigeria",
  },
  space: {
    src: nigeriaRuralHealth,
    alt: "Healthcare professionals engaging villagers during a rural outreach program in Nigeria",
  },
  partners: {
    src: blackCliniciansPatient,
    alt: "Black medical professionals discussing care with a patient",
  },
};

export const mediaItems = [
  {
    title: "Outreach photo gallery",
    type: "Photo",
    description: "Field images from Zahthic community education, outreach, and wellness programs.",
    image: siteImages.outreach,
  },
  {
    title: "Health education video",
    type: "Video",
    description: "Short educational resources designed for prevention, recovery, and everyday wellbeing.",
    image: siteImages.space,
  },
  {
    title: "Annual report download",
    type: "Publication",
    description: "A CMS-managed publication area for impact reports, press kits, and partner updates.",
    image: {
      src: blackDoctorLaptop,
      alt: "Black doctor working on a laptop for healthcare documentation",
    },
  },
];

export const recognitionItems = [
  {
    title: "Distinguished Personalities",
    image: siteImages.partners,
  },
  {
    title: "Healthcare Champions",
    image: {
      src: blackFemaleDoctorPhone,
      alt: "Smiling Black female doctor providing an online consultation",
    },
  },
  {
    title: "Strategic Partners",
    image: siteImages.space,
  },
];

export const brand = {
  name: "Zahthic Healthcare Solutions",
  heroEyebrow: "Rehabilitation-Led Care | Preventive Health Systems | Community Health Impact",
  tagline: "Bridging the Gap Between Prevention, Treatment and Rehabilitation.",
  heroBody: "Zahthic Healthcare Solutions is a rehabilitation-led healthcare organization focused on restoring function, improving mobility, and reducing disability risk through clinical rehabilitation, preventive healthcare, workplace wellness, and community-based health interventions.",
  footerMotto: "Transforming Health. Empowering Lives.",
  spaceTeaser: "Spinal Protection and Awareness for Children's Ergonomics (SPACE) is Zahthic's flagship preventive health initiative focused on improving posture, movement habits, and musculoskeletal health in children and adolescents through school-based education, early screening, and community engagement.",
  supporting: "Transforming Health. Empowering Lives.",
  location: "Orlu / Owerri, Imo State, Nigeria",
  linkedin: "https://www.linkedin.com/company/gumaling/",
  instagram: "https://www.instagram.com/zahthichealthcare?igsh=MXV4Y3pyOG9iaDEwaQ==",
  facebook: "https://facebook.com/Zahthichealthcare",
};

export const coreFocusAreas = [
  {
    description: "Restoring movement, function, and independence through evidence-based rehabilitation services.",
    iconName: "HeartHandshake",
    title: "Rehabilitation-Led Care",
  },
  {
    description: "Reducing the risk of disability and chronic conditions through education, early intervention, and health promotion.",
    iconName: "ShieldCheck",
    title: "Preventive Health Systems",
  },
  {
    description: "Improving access to care through outreach programs, community-based rehabilitation, and health education initiatives.",
    iconName: "BookOpen",
    title: "Community Health Impact",
  },
];

export const navItems = [
  { label: "Home", href: "#/" },
  { label: "About", href: "#/about" },
  { label: "Services", href: "#/services" },
  { label: "Impact", href: "#/impact" },
  { label: "SPACE", href: "#/space" },
  { label: "Blog", href: "#/blog" },
  { label: "Contact", href: "#/contact" },
];

export const services: Service[] = [
  {
    slug: "physiotherapy",
    title: "Physiotherapy",
    summary: "Personalized physical rehabilitation to improve movement, reduce pain, restore function, and support everyday independence.",
    audience: "Individuals and families",
    icon: Activity,
    image: {
      src: kadunaHealthCheckup,
      alt: "Community health checkup during outreach in Kaduna, Nigeria",
    },
  },
  {
    slug: "neurorehabilitation",
    title: "Neurorehabilitation",
    summary: "Specialized rehabilitation support for people living with neurological conditions affecting movement, balance, coordination, and daily function.",
    audience: "Recovery and function",
    icon: HeartPulse,
    image: {
      src: blackDoctorExam,
      alt: "Black female doctor examining a patient with professional care",
    },
  },
  {
    slug: "stroke-rehabilitation",
    title: "Stroke Rehabilitation",
    summary: "Structured recovery support for stroke survivors, helping improve mobility, strength, confidence, and participation in daily life.",
    audience: "Stroke survivors",
    icon: ShieldCheck,
    image: {
      src: blackCliniciansPatient,
      alt: "Medical professionals discussing recovery support with a patient",
    },
  },
  {
    slug: "musculoskeletal-rehabilitation",
    title: "Musculoskeletal Rehabilitation",
    summary: "Care for injuries, pain, posture issues, joint limitations, and movement-related conditions affecting muscles, bones, and joints.",
    audience: "Pain and injury support",
    icon: Stethoscope,
    image: {
      src: blackDoctorStethoscope,
      alt: "Black doctor wearing a stethoscope for clinical assessment",
    },
  },
  {
    slug: "home-care-physiotherapy",
    title: "Home Care Physiotherapy",
    summary: "Professional rehabilitation support delivered in the comfort of the home for people who need accessible and continuous care.",
    audience: "Home-based support",
    icon: Home,
    image: {
      src: africanOutreachHero,
      alt: "Healthcare workers supporting an elderly man during Nigerian community outreach",
    },
  },
  {
    slug: "corporate-wellness",
    title: "Corporate Wellness",
    summary: "Workplace health programs that help organizations improve employee wellbeing, reduce preventable strain, and promote healthier habits.",
    audience: "Organizations",
    icon: BriefcaseBusiness,
    image: {
      src: blackDoctorLaptop,
      alt: "Black doctor working on a laptop for wellness planning",
    },
  },
  {
    slug: "ergonomic-assessment",
    title: "Ergonomic Assessment",
    summary: "Practical assessments to identify posture, movement, and environmental risks that may contribute to pain or injury.",
    audience: "Workplaces and teams",
    icon: Building2,
    image: siteImages.partners,
  },
  {
    slug: "health-education",
    title: "Health Education",
    summary: "Clear, practical education that helps individuals and communities understand prevention, recovery, wellness, and long-term self-care.",
    audience: "Communities",
    icon: Newspaper,
    image: siteImages.outreach,
  },
  {
    slug: "community-based-rehabilitation",
    title: "Community-Based Rehabilitation",
    summary: "Accessible rehabilitation and support programs designed around the realities, needs, and strengths of local communities.",
    audience: "Underserved communities",
    icon: Users,
    image: siteImages.outreach,
  },
  {
    slug: "outreach-programs",
    title: "Outreach Programs",
    summary: "Community health initiatives that bring education, rehabilitation awareness, and wellness support closer to underserved populations.",
    audience: "Community impact",
    icon: Megaphone,
    image: siteImages.outreach,
  },
];

export const impactStats = [
  { value: "250+", label: "Patients treated", note: "People supported through rehabilitation-led care" },
  { value: "900+", label: "Rehabilitation sessions delivered", note: "Clinical sessions focused on movement, function, and recovery" },
  { value: "120+", label: "Home visits completed", note: "Care delivered closer to patients and families" },
  { value: "2,500+", label: "Community members reached", note: "People reached through outreach, education, and prevention activities" },
  { value: "35+", label: "Outreach programs conducted", note: "Community health and rehabilitation awareness programs" },
  { value: "18+", label: "Schools reached", note: "Preventive health education for children and adolescents" },
  { value: "24+", label: "Organizations engaged", note: "Workplace wellness, partnerships, and institutional collaboration" },
  { value: "12+", label: "Active partnerships", note: "Partners supporting access, outreach, education, and impact" },
];

export const projects: Project[] = [
  {
    title: "Community Health Awareness Program",
    category: "Health Education",
    location: "Imo State",
    summary: "A community-facing program designed to make prevention, recovery education, and wellness support easier to understand and access.",
    metric: "Impact metric pending",
    image: siteImages.outreach,
  },
  {
    title: "Rehabilitation Awareness Campaign",
    category: "Rehabilitation",
    location: "Community outreach",
    summary: "A campaign focused on helping families and communities understand the value of rehabilitation beyond immediate treatment.",
    metric: "Beneficiary stories pending",
    image: {
      src: blackCliniciansPatient,
      alt: "Black clinicians discussing patient recovery and support",
    },
  },
  {
    title: "Corporate Wellness Session",
    category: "Workplace Wellness",
    location: "Partner organization",
    summary: "A workplace program supporting posture, movement, prevention, and healthier habits for staff and teams.",
    metric: "Partner data pending",
    image: siteImages.partners,
  },
];

export const articles: Article[] = [
  {
    title: "Why rehabilitation should be part of long-term health planning",
    category: "Rehabilitation Tips",
    excerpt: "A practical guide to understanding recovery, function, and the support people need after illness or injury.",
    readTime: "5 min read",
    image: services[0].image,
  },
  {
    title: "Simple workplace habits that can reduce pain and strain",
    category: "Corporate Wellness",
    excerpt: "How teams can use prevention-focused habits to protect movement, comfort, and productivity.",
    readTime: "4 min read",
    image: siteImages.partners,
  },
  {
    title: "Building healthier communities through outreach and prevention",
    category: "Community Updates",
    excerpt: "Why health education and community-based rehabilitation matter for underserved populations.",
    readTime: "6 min read",
    image: siteImages.outreach,
  },
];

export const partnerCategories = [
  { title: "Government Agencies", icon: Landmark },
  { title: "NGOs", icon: HandHeart },
  { title: "Healthcare Institutions", icon: Stethoscope },
  { title: "Educational Institutions", icon: FileText },
  { title: "Corporate Organizations", icon: BriefcaseBusiness },
  { title: "Development Partners", icon: Sparkles },
];

export const faqs = [
  {
    question: "Is Zahthic a hospital?",
    answer: "No. Zahthic is a healthcare solutions and impact organization focused on rehabilitation, prevention, wellness, education, home care, corporate wellness, and community health development.",
  },
  {
    question: "How do I book a consultation?",
    answer: "Use the Book Consultation button and complete the custom booking form. The Zahthic team will review your request and follow up with the next steps.",
  },
  {
    question: "Does Zahthic offer home care physiotherapy?",
    answer: "Yes. Zahthic provides home care physiotherapy for people who need professional rehabilitation support in the comfort of their home.",
  },
  {
    question: "Can Zahthic partner on outreach programs?",
    answer: "Yes. Zahthic welcomes collaboration with institutions and organizations interested in rehabilitation, prevention, wellness education, and community health impact.",
  },
];

export const contactOptions = [
  { title: "Book a consultation", icon: CalendarCheck, text: "Tell us the support you need and the team will follow up." },
  { title: "Partnership inquiry", icon: HandHeart, text: "Start a conversation about outreach, sponsorship, or collaboration." },
  { title: "Visit / locate us", icon: MapPin, text: "Based in Orlu / Owerri, Imo State, Nigeria. Full address pending." },
];
