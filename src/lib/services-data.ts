export const SERVICES = [
  {
    slug: "discord-server",
    name: "Discord Server",
    category: "DISCORD",
    description: "Professional Discord server with channels, roles, bots and custom design.",
    basePrice: 49,
    basePriceGBP: 39,
    popular: false,
    icon: "🎮",
    features: ["Channel setup", "Roles & permissions", "Bot integration", "Welcome messages", "Rules & FAQ"],
    packages: [
      { name: "Basic", price: 49, priceGBP: 39, features: ["5 channels", "3 roles", "Welcome bot"] },
      { name: "Pro", price: 99, priceGBP: 79, features: ["15 channels", "10 roles", "Music & moderation bot", "Custom design"] },
      { name: "Premium", price: 199, priceGBP: 159, features: ["Unlimited", "Custom bot", "Verification", "Ticket system"] },
    ],
  },
  {
    slug: "youtube-banner",
    name: "YouTube Banner & Avatar",
    category: "YOUTUBE",
    description: "Professional channel art that attracts subscribers and reflects your brand.",
    basePrice: 29,
    basePriceGBP: 23,
    popular: false,
    icon: "🎬",
    features: ["HD quality", "Custom colors", "Multiple formats", "Logo included", "Revisions"],
    packages: [
      { name: "Banner", price: 29, priceGBP: 23, features: ["1 banner", "2 revisions", "HD export"] },
      { name: "Package", price: 49, priceGBP: 39, features: ["Banner + avatar", "3 revisions", "All formats"] },
      { name: "Complete", price: 79, priceGBP: 63, features: ["Banner + avatar + thumbnail template", "5 revisions", "Source files"] },
    ],
  },
  {
    slug: "streaming-overlay",
    name: "Streaming Overlay",
    category: "STREAMING",
    description: "Professional overlays and alerts for Twitch, YouTube Gaming or TikTok Live.",
    basePrice: 69,
    basePriceGBP: 55,
    popular: true,
    icon: "🎯",
    features: ["Custom design", "Alerts & notifications", "Overlay pack", "Scene transitions", "OBS/Streamlabs-ready"],
    packages: [
      { name: "Starter", price: 69, priceGBP: 55, features: ["3 scenes", "Basic alerts", "OBS-ready"] },
      { name: "Streamer", price: 129, priceGBP: 99, features: ["6 scenes", "Animated alerts", "Panels", "Overlay pack"] },
      { name: "Pro", price: 249, priceGBP: 199, features: ["Unlimited scenes", "Fully animated pack", "Custom alerts", "Panels"] },
    ],
  },
  {
    slug: "website",
    name: "Website",
    category: "WEBSITE",
    description: "Custom-built website with the features you need, on your chosen tech stack and host.",
    basePrice: 299,
    basePriceGBP: 239,
    popular: true,
    icon: "🌐",
    features: ["Responsive design", "SEO optimized", "Custom tech stack", "Database integration", "Hosting assistance"],
    packages: [
      { name: "Landing Page", price: 299, priceGBP: 239, features: ["1–5 pages", "Contact form", "Basic SEO", "Mobile-friendly"] },
      { name: "Business", price: 599, priceGBP: 479, features: ["10+ pages", "CMS", "Payment integration", "Admin panel"] },
      { name: "Custom", price: 999, priceGBP: 799, features: ["Fully custom", "API integration", "Auth system", "Full support"] },
    ],
    hasTechStack: true,
  },
  {
    slug: "mobile-app",
    name: "Mobile App",
    category: "APP",
    description: "Native or cross-platform app for Android and/or iOS.",
    basePrice: 999,
    basePriceGBP: 799,
    popular: false,
    icon: "📱",
    features: ["Android & iOS", "Custom design", "Push notifications", "API integration", "App Store publishing"],
    packages: [
      { name: "MVP", price: 999, priceGBP: 799, features: ["5 screens", "Core features", "One platform"] },
      { name: "Standard", price: 1999, priceGBP: 1599, features: ["15 screens", "Auth + database", "Both platforms"] },
      { name: "Enterprise", price: 3999, priceGBP: 3199, features: ["Unlimited", "Backend included", "Publishing", "6 months support"] },
    ],
    hasTechStack: true,
  },
  {
    slug: "streaming-icons",
    name: "Streaming Icons & Emotes",
    category: "STREAMING",
    description: "Unique sub-badges, emotes and channel point icons for your streaming channel.",
    basePrice: 39,
    basePriceGBP: 31,
    popular: false,
    icon: "✨",
    features: ["Twitch/Discord-ready", "Custom emotes", "Sub-badges", "Channel points", "Source files"],
    packages: [
      { name: "Starter", price: 39, priceGBP: 31, features: ["5 emotes", "2 badges"] },
      { name: "Standard", price: 79, priceGBP: 63, features: ["15 emotes", "5 badges", "Channel points icon"] },
      { name: "Full Pack", price: 149, priceGBP: 119, features: ["30 emotes", "10 badges", "Everything included", "Source files"] },
    ],
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
  category: string[]; // which service slugs this applies to
}

export const MODULES: Module[] = [
  // Website modules
  { id: "contact-form", name: "Contact Form", description: "Custom contact form with email notifications", price: 49, priceGBP: 39, category: ["website"] },
  { id: "auth-system", name: "User Authentication", description: "Login, register, password reset, user profiles", price: 149, priceGBP: 119, category: ["website", "mobile-app"] },
  { id: "blog-cms", name: "Blog / CMS", description: "Full blog with admin panel to manage posts", price: 199, priceGBP: 159, category: ["website"] },
  { id: "ecommerce", name: "E-commerce", description: "Product listings, cart, checkout with Stripe", price: 399, priceGBP: 319, category: ["website"] },
  { id: "booking-system", name: "Booking System", description: "Calendar-based appointment booking", price: 249, priceGBP: 199, category: ["website", "mobile-app"] },
  { id: "search", name: "Search Functionality", description: "Full-text search across content", price: 99, priceGBP: 79, category: ["website"] },
  { id: "multilingual", name: "Multi-language Support", description: "Site available in multiple languages", price: 149, priceGBP: 119, category: ["website"] },
  { id: "seo-advanced", name: "Advanced SEO", description: "Sitemap, meta tags, structured data, analytics", price: 99, priceGBP: 79, category: ["website"] },
  { id: "payment-gateway", name: "Payment Integration", description: "Accept payments via Stripe, PayPal, or other", price: 199, priceGBP: 159, category: ["website", "mobile-app"] },
  { id: "live-chat", name: "Live Chat", description: "Real-time chat support for your visitors", price: 99, priceGBP: 79, category: ["website"] },
  { id: "dashboard-analytics", name: "Admin Dashboard & Analytics", description: "Track users, orders, and site performance", price: 249, priceGBP: 199, category: ["website", "mobile-app"] },
  { id: "api-integration", name: "Third-party API Integration", description: "Connect to external services (CRM, maps, etc.)", price: 149, priceGBP: 119, category: ["website", "mobile-app"] },
  { id: "notifications", name: "Push Notifications", description: "Email and/or push notifications for users", price: 99, priceGBP: 79, category: ["website", "mobile-app"] },
  { id: "social-login", name: "Social Login", description: "Login with Google, Facebook, Discord", price: 79, priceGBP: 63, category: ["website", "mobile-app"] },
  { id: "file-uploads", name: "File Uploads", description: "Allow users to upload images, documents, etc.", price: 79, priceGBP: 63, category: ["website", "mobile-app"] },
  // Discord modules
  { id: "discord-bot", name: "Custom Discord Bot", description: "Fully custom bot with commands for your server", price: 149, priceGBP: 119, category: ["discord-server"] },
  { id: "discord-ticket", name: "Ticket System", description: "Support ticket system for your community", price: 79, priceGBP: 63, category: ["discord-server"] },
  { id: "discord-levels", name: "Leveling System", description: "XP and levels to engage your community", price: 49, priceGBP: 39, category: ["discord-server"] },
  { id: "discord-verification", name: "Verification System", description: "Member verification with captcha or reaction roles", price: 49, priceGBP: 39, category: ["discord-server"] },
  { id: "discord-economy", name: "Economy System", description: "Virtual currency, shop, and rewards", price: 99, priceGBP: 79, category: ["discord-server"] },
  // Streaming modules
  { id: "stream-alerts", name: "Animated Alerts Pack", description: "Follow, sub, donation, raid animated alerts", price: 79, priceGBP: 63, category: ["streaming-overlay"] },
  { id: "stream-panels", name: "Stream Panels", description: "Matching info panels for your channel page", price: 49, priceGBP: 39, category: ["streaming-overlay"] },
  { id: "stream-screens", name: "Starting/Ending Screens", description: "Animated starting soon and ending stream screens", price: 59, priceGBP: 47, category: ["streaming-overlay", "streaming-icons"] },
  { id: "stream-schedule", name: "Schedule Graphic", description: "Weekly schedule graphic for your channel", price: 39, priceGBP: 31, category: ["streaming-overlay", "streaming-icons"] },
  // App modules
  { id: "app-offline", name: "Offline Mode", description: "App works without internet connection", price: 199, priceGBP: 159, category: ["mobile-app"] },
  { id: "app-maps", name: "Maps & Location", description: "Google Maps integration with location features", price: 149, priceGBP: 119, category: ["mobile-app"] },
  { id: "app-camera", name: "Camera & Media", description: "Camera access, photo/video capture and upload", price: 99, priceGBP: 79, category: ["mobile-app"] },
  { id: "app-payments", name: "In-app Purchases", description: "App Store and Google Play payment integration", price: 249, priceGBP: 199, category: ["mobile-app"] },
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
