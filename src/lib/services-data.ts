export const SERVICES = [
  // === TIER 1: Cash cows (1-4 hours) ===
  {
    slug: "logo-branding",
    name: "Logo & Branding",
    category: "GRAPHICS",
    description: "Professional logo design and brand identity that makes you stand out. Includes logo, color palette, and brand guidelines.",
    basePrice: 79,
    basePriceGBP: 63,
    basePriceEUR: 71,
    popular: false,
    icon: "✨",
    features: ["Custom logo design", "Color palette", "Font selection", "Multiple concepts", "Source files"],
    packages: [
      { name: "Logo", price: 79, priceGBP: 63, priceEUR: 71, features: ["1 logo concept", "2 revisions", "PNG + SVG export"] },
      { name: "Brand Kit", price: 149, priceGBP: 119, priceEUR: 134, features: ["3 logo concepts", "Color palette", "Font pairing", "4 revisions", "Full source files"] },
      { name: "Full Identity", price: 299, priceGBP: 239, priceEUR: 269, features: ["5 logo concepts", "Complete brand guidelines", "Social media kit", "Business card design", "Unlimited revisions"] },
    ],
  },
  {
    slug: "social-media-kit",
    name: "Social Media Kit",
    category: "GRAPHICS",
    description: "Matching profile pictures, banners, and headers for all your social platforms. One cohesive look everywhere.",
    basePrice: 69,
    basePriceGBP: 55,
    basePriceEUR: 62,
    popular: true,
    icon: "📱",
    features: ["All major platforms", "Consistent branding", "Multiple sizes", "Profile + banner", "Source files"],
    packages: [
      { name: "Starter", price: 69, priceGBP: 55, priceEUR: 62, features: ["2 platforms", "Profile pic + banner", "2 revisions"] },
      { name: "Creator", price: 129, priceGBP: 99, priceEUR: 116, features: ["5 platforms (YouTube, Twitch, X, Discord, Instagram)", "Profile + banner + thumbnails", "4 revisions"] },
      { name: "Pro", price: 199, priceGBP: 159, priceEUR: 179, features: ["All platforms", "Full asset pack", "Animated versions", "Unlimited revisions", "Source files"] },
    ],
  },
  {
    slug: "youtube-thumbnails",
    name: "YouTube Thumbnails",
    category: "YOUTUBE",
    description: "Eye-catching thumbnails that get clicks. Bulk packs available — consistent style across your whole channel.",
    basePrice: 29,
    basePriceGBP: 23,
    basePriceEUR: 26,
    popular: true,
    icon: "🖼️",
    features: ["Click-worthy design", "Your branding", "Fast delivery", "Reusable templates", "All sizes"],
    packages: [
      { name: "5 Pack", price: 29, priceGBP: 23, priceEUR: 26, features: ["5 thumbnails", "Consistent style", "1 revision per thumbnail"] },
      { name: "10 Pack", price: 49, priceGBP: 39, priceEUR: 44, features: ["10 thumbnails", "2 styles to choose from", "2 revisions per thumbnail"] },
      { name: "20 Pack + Template", price: 89, priceGBP: 71, priceEUR: 80, features: ["20 thumbnails", "Reusable Canva/Figma template", "Unlimited revisions", "Source files"] },
    ],
  },
  {
    slug: "youtube-banner",
    name: "YouTube Banner & Avatar",
    category: "YOUTUBE",
    description: "Professional channel art that attracts subscribers and reflects your brand.",
    basePrice: 59,
    basePriceGBP: 47,
    basePriceEUR: 54,
    popular: false,
    icon: "🎬",
    features: ["HD quality", "Custom colors", "Multiple formats", "Logo included", "Revisions"],
    packages: [
      { name: "Banner", price: 59, priceGBP: 47, priceEUR: 54, features: ["1 banner", "2 revisions", "HD export"] },
      { name: "Package", price: 99, priceGBP: 79, priceEUR: 89, features: ["Banner + avatar", "3 revisions", "All formats"] },
      { name: "Complete", price: 169, priceGBP: 135, priceEUR: 154, features: ["Banner + avatar + thumbnail template", "5 revisions", "Source files"] },
    ],
  },
  {
    slug: "streaming-overlay",
    name: "Streaming Overlay",
    category: "STREAMING",
    description: "Professional overlays and alerts for Twitch, YouTube Gaming or TikTok Live.",
    basePrice: 149,
    basePriceGBP: 119,
    basePriceEUR: 134,
    popular: true,
    icon: "🎯",
    features: ["Custom design", "Alerts & notifications", "Overlay pack", "Scene transitions", "OBS/Streamlabs-ready"],
    packages: [
      { name: "Starter", price: 149, priceGBP: 119, priceEUR: 134, features: ["3 scenes", "Basic alerts", "OBS-ready"] },
      { name: "Streamer", price: 299, priceGBP: 239, priceEUR: 269, features: ["6 scenes", "Animated alerts", "Panels", "Overlay pack"] },
      { name: "Pro", price: 499, priceGBP: 399, priceEUR: 449, features: ["Unlimited scenes", "Fully animated pack", "Custom alerts", "Panels", "Source files"] },
    ],
  },
  {
    slug: "streaming-icons",
    name: "Streaming Icons & Emotes",
    category: "STREAMING",
    description: "Unique sub-badges, emotes and channel point icons for your streaming channel.",
    basePrice: 39,
    basePriceGBP: 31,
    basePriceEUR: 35,
    popular: false,
    icon: "😎",
    features: ["Twitch/Discord-ready", "Custom emotes", "Sub-badges", "Channel points", "Source files"],
    packages: [
      { name: "Starter", price: 39, priceGBP: 31, priceEUR: 35, features: ["5 emotes", "2 badges"] },
      { name: "Standard", price: 79, priceGBP: 63, priceEUR: 71, features: ["15 emotes", "5 badges", "Channel points icon"] },
      { name: "Full Pack", price: 149, priceGBP: 119, priceEUR: 134, features: ["30 emotes", "10 badges", "Everything included", "Source files"] },
    ],
  },
  {
    slug: "discord-server",
    name: "Discord Server",
    category: "DISCORD",
    description: "Professional Discord server with channels, roles, bots and custom design.",
    basePrice: 99,
    basePriceGBP: 79,
    basePriceEUR: 89,
    popular: false,
    icon: "🎮",
    features: ["Channel setup", "Roles & permissions", "Bot integration", "Welcome messages", "Rules & FAQ"],
    packages: [
      { name: "Basic", price: 99, priceGBP: 79, priceEUR: 89, features: ["5 channels", "3 roles", "Welcome bot"] },
      { name: "Pro", price: 199, priceGBP: 159, priceEUR: 179, features: ["15 channels", "10 roles", "Music & moderation bot", "Custom design"] },
      { name: "Premium", price: 399, priceGBP: 319, priceEUR: 359, features: ["Unlimited channels", "Custom bot development", "Verification system", "Ticket system", "Full branding"] },
    ],
  },
  {
    slug: "notion-templates",
    name: "Notion Templates",
    category: "GRAPHICS",
    description: "Beautiful, functional Notion templates for content creators, freelancers, and small businesses.",
    basePrice: 49,
    basePriceGBP: 39,
    basePriceEUR: 44,
    popular: false,
    icon: "📋",
    features: ["Custom design", "Ready to duplicate", "Mobile-friendly", "Instructions included", "Aesthetic layouts"],
    packages: [
      { name: "Single", price: 49, priceGBP: 39, priceEUR: 44, features: ["1 template", "Custom design", "Guide included"] },
      { name: "Bundle", price: 89, priceGBP: 71, priceEUR: 80, features: ["3 templates", "Dashboard + tracker + planner", "Custom branding"] },
      { name: "Business Kit", price: 149, priceGBP: 119, priceEUR: 134, features: ["5+ templates", "Full workspace setup", "CRM + project management", "Onboarding guide"] },
    ],
  },
  {
    slug: "gaming-profile",
    name: "Gaming Profile Pack",
    category: "GRAPHICS",
    description: "Matching avatars, banners, and profile art for Steam, Xbox, PlayStation, and more.",
    basePrice: 39,
    basePriceGBP: 31,
    basePriceEUR: 35,
    popular: false,
    icon: "🎮",
    features: ["Multi-platform", "Consistent style", "Custom art", "All sizes", "Fast delivery"],
    packages: [
      { name: "Basic", price: 39, priceGBP: 31, priceEUR: 35, features: ["1 platform", "Avatar + banner", "2 revisions"] },
      { name: "Multi", price: 69, priceGBP: 55, priceEUR: 62, features: ["3 platforms", "Avatar + banner each", "3 revisions"] },
      { name: "Ultimate", price: 119, priceGBP: 95, priceEUR: 107, features: ["All platforms", "Animated avatar", "Source files", "Unlimited revisions"] },
    ],
  },
  {
    slug: "email-templates",
    name: "Email Templates",
    category: "GRAPHICS",
    description: "Branded email templates for newsletters, marketing campaigns, and transactional emails.",
    basePrice: 99,
    basePriceGBP: 79,
    basePriceEUR: 89,
    popular: false,
    icon: "📧",
    features: ["Mailchimp/ConvertKit ready", "Mobile responsive", "Brand colors", "Reusable", "HTML included"],
    packages: [
      { name: "Single", price: 99, priceGBP: 79, priceEUR: 89, features: ["1 email template", "Mobile responsive", "HTML export"] },
      { name: "Pack", price: 179, priceGBP: 143, priceEUR: 161, features: ["3 templates (welcome, newsletter, promo)", "Matching design", "Platform integration"] },
      { name: "Suite", price: 299, priceGBP: 239, priceEUR: 269, features: ["6 templates", "Full email system", "A/B test variants", "Source files"] },
    ],
  },
];

// === ENTERPRISE SERVICES (Contact for quote) ===
export const ENTERPRISE_SERVICES = [
  {
    slug: "website",
    name: "Website Development",
    category: "WEBSITE",
    icon: "🌐",
    description: "Custom-built websites and web applications with modern tech stacks. From landing pages to full-stack SaaS platforms.",
    features: ["Custom code (no templates)", "Responsive design", "SEO optimized", "Your choice of tech stack", "Hosting setup", "Ongoing support"],
    startingAt: 799,
    startingAtGBP: 639,
    startingAtEUR: 719,
  },
  {
    slug: "mobile-app",
    name: "Mobile App",
    category: "APP",
    icon: "📱",
    description: "Native and cross-platform apps for Android and iOS. From MVP to full enterprise solutions.",
    features: ["Android & iOS", "Custom UI/UX design", "Backend & API", "Push notifications", "App Store publishing", "Post-launch support"],
    startingAt: 2499,
    startingAtGBP: 1999,
    startingAtEUR: 2249,
  },
  {
    slug: "saas-platform",
    name: "SaaS Platform",
    category: "WEBSITE",
    icon: "🚀",
    description: "Full-stack SaaS applications with auth, payments, dashboards, and everything you need to launch your product.",
    features: ["User authentication", "Stripe payments", "Admin dashboard", "API development", "Database design", "Scalable architecture"],
    startingAt: 4999,
    startingAtGBP: 3999,
    startingAtEUR: 4499,
  },
];

export const TECH_STACKS = {
  frontend: ["Next.js", "React", "Vue.js", "Nuxt.js", "SvelteKit", "HTML/CSS/JS"],
  backend: ["Node.js", "PHP", "Python (Django)", "Python (FastAPI)", "Laravel", "Express.js"],
  database: ["PostgreSQL", "MySQL", "MongoDB", "SQLite", "Supabase", "PlanetScale"],
  hosting: ["Vercel", "Netlify", "Railway", "DigitalOcean", "AWS", "Hetzner", "Cloudflare Pages"],
};

export interface Module {
  id: string;
  name: string;
  description: string;
  price: number;
  priceGBP: number;
  priceEUR: number;
  category: string[];
}

export const MODULES: Module[] = [
  // Discord modules
  { id: "discord-bot", name: "Custom Discord Bot", description: "Fully custom bot with commands for your server", price: 299, priceGBP: 239, priceEUR: 269, category: ["discord-server"] },
  { id: "discord-ticket", name: "Ticket System", description: "Support ticket system for your community", price: 149, priceGBP: 119, priceEUR: 134, category: ["discord-server"] },
  { id: "discord-levels", name: "Leveling System", description: "XP and levels to engage your community", price: 99, priceGBP: 79, priceEUR: 89, category: ["discord-server"] },
  { id: "discord-verification", name: "Verification System", description: "Member verification with captcha or reaction roles", price: 99, priceGBP: 79, priceEUR: 89, category: ["discord-server"] },
  { id: "discord-economy", name: "Economy System", description: "Virtual currency, shop, and rewards", price: 199, priceGBP: 159, priceEUR: 179, category: ["discord-server"] },
  // Streaming modules
  { id: "stream-alerts", name: "Animated Alerts Pack", description: "Follow, sub, donation, raid animated alerts", price: 149, priceGBP: 119, priceEUR: 134, category: ["streaming-overlay"] },
  { id: "stream-panels", name: "Stream Panels", description: "Matching info panels for your channel page", price: 99, priceGBP: 79, priceEUR: 89, category: ["streaming-overlay"] },
  { id: "stream-screens", name: "Starting/Ending Screens", description: "Animated starting soon and ending stream screens", price: 119, priceGBP: 95, priceEUR: 107, category: ["streaming-overlay", "streaming-icons"] },
  { id: "stream-schedule", name: "Schedule Graphic", description: "Weekly schedule graphic for your channel", price: 79, priceGBP: 63, priceEUR: 71, category: ["streaming-overlay", "streaming-icons"] },
  // Branding modules
  { id: "business-card", name: "Business Card Design", description: "Matching business card for print or digital", price: 49, priceGBP: 39, priceEUR: 44, category: ["logo-branding"] },
  { id: "brand-social", name: "Social Media Assets", description: "Profile pics and banners for all platforms", price: 79, priceGBP: 63, priceEUR: 71, category: ["logo-branding"] },
  { id: "brand-guidelines", name: "Brand Guidelines PDF", description: "Complete style guide document for your brand", price: 99, priceGBP: 79, priceEUR: 89, category: ["logo-branding"] },
];

export const RECOMMENDATIONS: Record<string, { frontend: string; backend: string; database: string; hosting: string; reason: string }> = {
  portfolio: {
    frontend: "Next.js",
    backend: "Next.js API routes",
    database: "PostgreSQL",
    hosting: "Vercel",
    reason: "Perfect for portfolio sites — fast, free hosting and easy to update.",
  },
  ecommerce: {
    frontend: "Next.js",
    backend: "Node.js",
    database: "PostgreSQL",
    hosting: "Railway",
    reason: "Scalable solution for e-commerce with great performance and a reliable database.",
  },
  blog: {
    frontend: "Next.js",
    backend: "Next.js API routes",
    database: "PostgreSQL",
    hosting: "Vercel",
    reason: "Optimal for blogs with SEO and fast load times.",
  },
  webapp: {
    frontend: "React",
    backend: "Node.js",
    database: "PostgreSQL",
    hosting: "DigitalOcean",
    reason: "Flexible and scalable solution for complex web apps.",
  },
};
