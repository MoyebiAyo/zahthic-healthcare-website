# Zahthic Healthcare Solutions UX System

Week 3 deliverable: premium mobile-first UX system, design-system packet, page wireframes, reusable components, and light/dark mode guidance.

Source inputs: Week 1 Graphify findings, Week 2 website copy, Zahthic brand colors, provided healthcare inspiration images, and project clarifications.

## Design-System Request

- Surface: public website plus future admin/CMS content-management surfaces
- Primary mode: cross-surface alignment
- System question: create one coherent visual language for marketing, forms, impact content, media, and admin-managed content blocks
- Key route-outs: high-fidelity visual design belongs to Week 4; component API implementation belongs to development; accessibility verification belongs to QA

## Brand UX Direction

Zahthic should feel like a premium healthcare, rehabilitation, wellness, prevention, and community impact organization. The interface should communicate professional care, human transformation, African healthcare leadership, and measurable community impact.

The site must avoid generic hospital signals:

- No hospital-building hero as the main identity
- No DNA-testing or diagnostic-lab framing
- No doctor-carousel-first homepage
- No unverified medical claims or inflated statistics
- No copied Nuvica layouts, watermarks, or visual identity

The design should adapt useful patterns from the inspiration images:

- Clean modular sections
- Strong hero hierarchy
- Soft but premium healthcare atmosphere
- Impact/stat rows
- Rounded cards used with restraint
- Image-led articles and project stories
- Service discovery grids
- Calm, confident CTAs

## Foundations

### Color System

Use brand colors semantically rather than decoratively.

#### Core Brand Colors

- Midnight Teal: `#0C1F1D`
- Lime Sprout: `#98BF2E`
- Pearl Yellow: `#EFC652`
- Obsidian Black: `#0C0E0D`
- Pure White: `#FFFFFF`

#### Light Mode Tokens

- `surface/page`: `#FFFFFF`
- `surface/subtle`: `#F7FAF7`
- `surface/teal`: `#0C1F1D`
- `surface/lime-soft`: light tint derived from Lime Sprout
- `surface/yellow-soft`: light tint derived from Pearl Yellow
- `text/strong`: `#0C0E0D`
- `text/default`: dark neutral close to Obsidian Black
- `text/muted`: warm grey-green neutral
- `text/inverse`: `#FFFFFF`
- `brand/primary`: `#0C1F1D`
- `brand/action`: `#98BF2E`
- `brand/highlight`: `#EFC652`
- `border/default`: soft neutral line
- `border/emphasis`: muted teal line
- `focus/ring`: `#EFC652`

#### Dark Mode Tokens

- `surface/page`: `#0C0E0D`
- `surface/subtle`: `#111A18`
- `surface/elevated`: `#152421`
- `surface/teal`: `#0C1F1D`
- `text/strong`: `#FFFFFF`
- `text/default`: pale neutral
- `text/muted`: soft grey-green
- `brand/action`: `#98BF2E`
- `brand/highlight`: `#EFC652`
- `border/default`: translucent white
- `focus/ring`: `#EFC652`

### Color Usage Rules

- Midnight Teal owns trust, depth, headers, hero overlays, footer, and premium anchors.
- Lime Sprout owns primary action, growth, recovery, forward movement, and success states.
- Pearl Yellow owns warmth, human impact, highlights, focus rings, and recognition moments.
- White owns clarity, health, editorial readability, and spacious sections.
- Obsidian Black owns serious text, footer depth, and premium contrast.
- Avoid one-note teal dominance by pairing teal sections with white, lime, yellow, and real photography.

## Typography

### Fonts

- Primary: Sora
- Secondary: Montserrat

### Role Assignment

- Sora: headings, section titles, hero copy, navigation labels, metric numbers
- Montserrat: body copy, captions, form labels, longer content, admin fields

### Type Scale

Mobile-first type should feel premium but not oversized.

- `display`: 44-56 desktop, 34-40 mobile
- `h1`: 40-48 desktop, 32-36 mobile
- `h2`: 30-38 desktop, 26-30 mobile
- `h3`: 22-28 desktop, 20-24 mobile
- `body-lg`: 18-20 desktop, 17-18 mobile
- `body`: 16
- `body-sm`: 14
- `caption`: 12-13
- `metric`: 34-52 depending on placement

### Typography Rules

- Do not use negative letter spacing.
- Do not scale font size directly with viewport width.
- Keep hero headline strong but readable.
- Use short line lengths for health education content.
- Metrics should include clear labels and evidence notes where needed.

## Spacing, Radius, Elevation

### Spacing Scale

- `4`: micro spacing
- `8`: icon and label gaps
- `12`: compact component padding
- `16`: default component padding
- `24`: card/section internal grouping
- `32`: small section rhythm
- `48`: medium section rhythm
- `72`: large section rhythm
- `96`: hero/major band rhythm

### Radius

- Buttons: 999px for pill CTAs or 8px for utility buttons
- Cards: 8px maximum unless an image mask needs a softer editorial shape
- Inputs: 8px
- Media blocks: 8px
- Badges: 999px

### Elevation

Use elevation sparingly.

- Level 0: flat sections
- Level 1: subtle card separation
- Level 2: sticky header / dropdown / modal
- Level 3: mobile menu / major overlay

Avoid heavy shadows. Premium healthcare should feel calm, grounded, and precise.

## Motion

Motion should support confidence, not spectacle.

- Page reveal: gentle fade/translate, 160-240ms
- Card hover: slight lift or border emphasis, 120-180ms
- CTA hover: color shift plus arrow/icon movement
- Form validation: immediate, calm, accessible
- Dark/light toggle: no flashy transition
- Reduced motion: disable scroll reveals and keep state changes instant

## Breakpoints And Layout Policy

Mobile-first breakpoints:

- `xs`: 360px
- `sm`: 480px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1440px

Page containers:

- Default content max width: 1120-1200px
- Editorial article max width: 720-800px
- Form max width: 640-760px
- Impact dashboard/admin content max width: 1280px

Mobile rules:

- Navigation collapses into a clear menu.
- Primary CTA remains visible in header or mobile menu.
- Hero stacks copy before media unless the image is essential proof.
- Service cards become one column.
- Metrics become two-column or stacked depending on label length.
- Forms use one column.
- Tables become cards or grouped rows.

## Visual Language

### Photography Direction

Use real or realistic imagery that shows:

- Rehabilitation support
- Community outreach
- Health education
- Families and caregivers
- Home care context
- Workplace wellness
- Human transformation
- Nigerian/African community relevance

Avoid:

- Generic hospital corridors
- Diagnostic lab/DNA imagery
- Overused doctor-in-white-coat portraits as the main identity
- Stock images that do not reflect the service or community context

### Pattern Usage

Use brand pattern assets as:

- Subtle section dividers
- Footer texture
- Hero background detail
- Empty-state backgrounds
- Spotlight/recognition framing

Do not use patterns behind long body text unless contrast is fully protected.

## Primitive Policy

### Shared Primitives

- `Button`
- `IconButton`
- `Badge`
- `SectionHeader`
- `PageHero`
- `Card`
- `Metric`
- `FormField`
- `Textarea`
- `Select`
- `Checkbox`
- `RadioGroup`
- `Tabs`
- `Accordion`
- `Modal`
- `MediaBlock`
- `LogoGrid`
- `Breadcrumb`
- `Pagination`
- `ThemeToggle`
- `Alert`
- `EmptyState`

### Component Naming Rules

- Use plain role names for primitives: `Button`, `Card`, `Input`.
- Use domain names for Zahthic-specific blocks: `ImpactStoryCard`, `ServiceCard`, `ProjectTimeline`.
- Do not name components after layout appearance alone, such as `GreenCard` or `BigSection`.
- Names should survive dark mode and content changes.

## Reusable Components

### Page Hero

Purpose: introduce the page, clarify audience, and provide one primary next step.

Variants:

- Home hero
- Standard page hero
- Initiative hero
- Editorial/blog hero
- Form-focused hero

Structure:

- Eyebrow
- H1
- Supporting copy
- CTA row
- Optional media or proof panel

Rules:

- Home hero should use the exact brand tagline.
- Internal page heroes should be shorter and more functional.
- Use imagery that reinforces rehabilitation/community impact.

### Service Card

Purpose: help users discover the correct service.

Structure:

- Icon or small image
- Service name
- Short benefit-led description
- Audience tag
- CTA

States:

- Default
- Hover/focus
- Featured
- Disabled/unavailable, if needed

Rules:

- Do not overfill cards with long service copy.
- Each card links to a full service page.
- Use icons connected to movement, support, wellness, education, or community, not hospital departments.

### Impact Stat

Purpose: show measurable community and service impact.

Structure:

- Number
- Label
- Optional date/source
- Optional context note

Rules:

- Only publish verified numbers.
- Avoid unsupported claims like exact satisfaction percentages unless source is documented.
- Use impact-oriented labels: people reached, communities served, programs delivered.

### Project Story Card

Purpose: turn impact work into browsable, human-centered proof.

Structure:

- Image
- Project type badge
- Title
- Location/date
- Short summary
- Key metric
- CTA

Variants:

- Featured project
- Compact listing card
- Annual report card
- Beneficiary story card

### Blog Card

Purpose: support health education and authority.

Structure:

- Image
- Category badge
- Title
- Excerpt
- Date
- Author/source
- Read time

Rules:

- Use clear category colors, not too many.
- Prioritize practical education over clickbait.

### Partner Logo Block

Purpose: establish collaboration credibility.

Structure:

- Section header
- Logo grid
- Optional category filters
- Partner inquiry CTA

Rules:

- Use monochrome logo treatment when possible.
- Include alt text for every logo.
- Provide placeholder cards until real partner logos arrive.

### Form System

Form types:

- Contact form
- Custom booking form
- Partnership inquiry form
- Volunteer application form
- Internship application form
- Job application form
- Donation/support inquiry form
- Newsletter signup

Shared structure:

- Clear title
- Short reassurance copy
- Grouped fields
- Required labels
- Consent checkbox where needed
- Submit CTA
- Success state
- Error state

Form UX rules:

- One-column on mobile.
- Avoid intimidating medical language.
- Use helper text for sensitive questions.
- Keep booking form practical and lightweight.
- Do not ask for diagnosis; ask for brief concern or support need.

### Media Gallery

Purpose: organize photos, videos, publications, and downloads.

Variants:

- Photo grid
- Video cards
- Publication/download list
- Press release list

Rules:

- Use filters: Photos, Videos, Publications, Press Releases, Downloads.
- Include date, title, category, and source.
- Gallery images should support real community/rehabilitation credibility.

### Admin Content Blocks

Purpose: make CMS-managed content predictable.

Blocks:

- Blog post editor fields
- Service editor fields
- Project/impact editor fields
- Impact metric editor
- Testimonial editor
- Partner logo editor
- Spotlight editor
- Media upload block

Admin UX rules:

- Use higher density than the public site.
- Prioritize scanability and status visibility.
- Show draft/published state.
- Include required field indicators.
- Provide preview thumbnails for images and media.
- Keep destructive actions secondary and confirm before publishing/deleting.

## Light And Dark Mode

### Light Mode Character

Bright, clear, editorial, trustworthy. Best for health education, services, forms, and blog reading.

Recommended use:

- Default website mode
- Article pages
- Service detail pages
- Forms

### Dark Mode Character

Premium, calm, focused, and institutional. Best for hero sections, footer, media, impact highlights, and users who prefer reduced brightness.

Recommended use:

- User-toggle full dark mode
- Hero and footer sections
- Impact/stat bands
- Spotlight features

### Dark Mode Rules

- Lime Sprout should stay vibrant but not neon.
- Pearl Yellow should be used for focus and warmth, not large backgrounds.
- Cards in dark mode need visible borders.
- Form fields must preserve clear contrast.
- Images should not be darkened so much that people/community context disappears.

## Page Wireframes

Wireframes are mobile-first. Desktop layouts expand the same sequence into two-column or grid compositions.

### Home Page

Mobile order:

1. Header with logo, menu, Book Consultation
2. Hero: eyebrow, tagline, subheadline, body, CTAs
3. Hero image/video or community rehabilitation visual
4. Trust strip
5. Who Zahthic is
6. Service preview cards
7. Impact metric band
8. Featured project story
9. SPACE Project preview
10. Founder/mission preview
11. Testimonials placeholders
12. Partner/logo preview
13. Blog preview
14. Newsletter signup
15. Final CTA
16. Footer

Desktop structure:

- Hero uses split composition: copy left, human/community visual right.
- Trust strip sits directly under hero.
- Services use 3-column grid.
- Impact uses horizontal metric row plus featured story.
- Blog uses 3-card editorial row.

### About Page

Mobile order:

1. Page hero
2. Organization story
3. Founder story with portrait placeholder
4. Mission and vision
5. Core values grid
6. Timeline/evolution section
7. Community commitment
8. CTA band

Desktop:

- Founder story can use two-column editorial layout.
- Mission/vision use paired panels.
- Values use 3 or 4-column grid.

### Services Page

Mobile order:

1. Page hero
2. Intro copy
3. Service category filters
4. Service cards
5. Custom booking CTA
6. FAQ preview

Desktop:

- Filter row above card grid.
- Cards in 3-column grid.
- Featured rehabilitation services may occupy wider cards.

### Service Detail Page

Mobile order:

1. Breadcrumb
2. Service hero
3. Who it is for
4. Common needs
5. How Zahthic supports you
6. What to expect
7. Benefits
8. Related services
9. Booking CTA

Desktop:

- Main content plus sticky booking/help panel.
- Related services as card row.

### Projects & Impact Page

Mobile order:

1. Page hero
2. Impact metrics
3. Featured project
4. Project category filters
5. Project story cards
6. Beneficiary story block
7. Annual reports/downloads
8. Partner/support CTA

Desktop:

- Metrics row near top.
- Featured project uses large image plus story panel.
- Projects use editorial card grid.

### Project Detail Page

Mobile order:

1. Breadcrumb
2. Project hero
3. Location/date/category
4. Challenge addressed
5. Activities delivered
6. Impact metrics
7. Gallery
8. Beneficiary story
9. Partners involved
10. Lessons learned
11. Partnership/support CTA

### SPACE Project Page

Mobile order:

1. Initiative hero
2. Vision
3. Objectives
4. Activities
5. Impact model
6. Gallery
7. Partnership opportunities
8. Support CTA

Desktop:

- Use an initiative roadmap/timeline visual.
- Objectives can be icon cards.
- Partnership CTA should be prominent but not salesy.

### Partners & Collaborators Page

Mobile order:

1. Page hero
2. Partner categories
3. Logo grid/placeholders
4. Partnership models
5. Partnership inquiry form
6. CTA/footer

### Blog Listing Page

Mobile order:

1. Editorial hero
2. Category tabs
3. Featured article
4. Article cards
5. Pagination/load more
6. Newsletter signup

Desktop:

- Featured article spans wider grid.
- Cards in 3-column layout.

### Blog Detail Page

Mobile order:

1. Breadcrumb
2. Category/date/read time
3. Article title
4. Author/source
5. Featured image
6. Article content
7. Medical disclaimer note
8. Related articles
9. Newsletter CTA

### Media Center Page

Mobile order:

1. Page hero
2. Media tabs
3. Featured media
4. Gallery/list
5. Downloads
6. Media inquiry CTA

### Recognition & Spotlight Page

Mobile order:

1. Page hero
2. Spotlight category tabs
3. Featured spotlight
4. Recognition cards
5. Nomination/recommendation CTA

### Volunteer & Careers Page

Mobile order:

1. Page hero
2. Volunteer section
3. Internship section
4. Careers section
5. Application form selector
6. Form
7. Impact/values reassurance

### Donate / Support Us Page

Mobile order:

1. Page hero
2. Why support Zahthic
3. Support options
4. SPACE Project support highlight
5. Support inquiry form
6. Trust/impact note

### FAQ Page

Mobile order:

1. Page hero
2. Search or category filter
3. Accordion groups
4. Contact CTA

FAQ categories:

- Zahthic overview
- Services
- Booking
- Home care
- Outreach
- Corporate wellness
- Partnerships
- Volunteering
- Support/donations

### Testimonials Page

Mobile order:

1. Page hero
2. Testimonial category filters
3. Featured story
4. Testimonial cards
5. Submit story CTA

Use placeholders until real testimonials are available.

### Contact Page

Mobile order:

1. Page hero
2. Contact option cards
3. Contact form
4. Booking form entry
5. WhatsApp/contact details
6. Address/map placeholder
7. Social links

Desktop:

- Two-column layout: forms left, contact details/help panel right.
- Booking can be a dedicated tab or separate route.

## Admin / CMS Wireframes

### Admin Dashboard

Primary layout:

- Left sidebar navigation
- Top bar with search, preview site, account
- Main content area
- Status cards

Sections:

- Overview
- Blog posts
- Services
- Projects & Impact
- Media Library
- Testimonials
- Partners
- Spotlight
- Forms/Submissions
- Impact Metrics
- Site Settings

### Admin List View

Structure:

- Page title
- Create button
- Filters
- Search
- Table/list cards
- Status chips
- Bulk actions

### Admin Edit View

Structure:

- Title field
- Slug
- Status
- Content fields
- Image/media picker
- SEO fields
- Preview panel
- Save draft
- Publish

## Accessibility Baseline

- Minimum body text size: 16px.
- All interactive elements need visible focus states.
- Focus ring should use Pearl Yellow or a high-contrast equivalent.
- Buttons need text labels or accessible labels.
- Icons alone are not enough for unfamiliar actions.
- Forms need labels, helper text, and error messages.
- Images require alt text.
- Statistics require context and source where possible.
- Dark mode must preserve WCAG contrast.
- Motion must respect reduced-motion preferences.

## Content Governance

### Verified Claims Rule

No metric should be published unless it is verified. If a number is not available, use a qualitative message or placeholder.

### Testimonial Rule

Testimonials require permission to display name, role/category, image, and story.

### Health Education Rule

Blog content should be practical, understandable, and include medical disclaimer context where appropriate.

### Partner Logo Rule

Partner logos should only be displayed with permission and correct naming.

## Open UX Decisions

- Should the "Skills" page be renamed to "Expertise"?
- What does SPACE stand for?
- Will Donate / Support Us include payment now or inquiry only?
- What CRM will receive form submissions?
- What chat widget will be used?
- What exact contact details should appear?
- Which real impact numbers are verified?
- Are team profiles needed, or should the site avoid staff-directory patterns?

## Route-Outs

- Week 4 should create high-fidelity desktop and mobile designs from this UX system.
- Development should translate primitives into actual reusable components.
- Accessibility remediation and verification should be handled during QA.
- Final image selection should use real Zahthic/community/rehabilitation assets wherever possible.

This packet defines the shared UI system, wireframe logic, and reusable UX components; high-fidelity page polish belongs in Week 4.

