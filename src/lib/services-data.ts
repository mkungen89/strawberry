export const SERVICES = [
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
    slug: "website",
    name: "Website",
    category: "WEBSITE",
    description: "Custom-built website with the features you need, on your chosen tech stack and host.",
    basePrice: 799,
    basePriceGBP: 639,
    basePriceEUR: 719,
    popular: true,
    icon: "🌐",
    features: ["Responsive design", "SEO optimized", "Custom tech stack", "Database integration", "Hosting assistance"],
    packages: [
      { name: "Landing Page", price: 799, priceGBP: 639, priceEUR: 719, features: ["1–5 pages", "Contact form", "Basic SEO", "Mobile-friendly"] },
      { name: "Business", price: 1499, priceGBP: 1199, priceEUR: 1349, features: ["10+ pages", "CMS", "Payment integration", "Admin panel"] },
      { name: "Custom", price: 2999, priceGBP: 2399, priceEUR: 2699, features: ["Fully custom", "API integration", "Auth system", "Full support", "3 months maintenance"] },
    ],
    hasTechStack: true,
  },
  {
    slug: "mobile-app",
    name: "Mobile App",
    category: "APP",
    description: "Native or cross-platform app for Android and/or iOS.",
    basePrice: 2499,
    basePriceGBP: 1999,
    basePriceEUR: 2249,
    popular: false,
    icon: "📱",
    features: ["Android & iOS", "Custom design", "Push notifications", "API integration", "App Store publishing"],
    packages: [
      { name: "MVP", price: 2499, priceGBP: 1999, priceEUR: 2249, features: ["5 screens", "Core features", "One platform"] },
      { name: "Standard", price: 4999, priceGBP: 3999, priceEUR: 4499, features: ["15 screens", "Auth + database", "Both platforms", "Push notifications"] },
      { name: "Enterprise", price: 9999, priceGBP: 7999, priceEUR: 8999, features: ["Unlimited screens", "Backend included", "App Store publishing", "6 months support"] },
    ],
    hasTechStack: true,
  },
  {
    slug: "streaming-icons",
    name: "Streaming Icons & Emotes",
    category: "STREAMING",
    description: "Unique sub-badges, emotes and channel point icons for your streaming channel.",
    basePrice: 79,
    basePriceGBP: 63,
    basePriceEUR: 71,
    popular: false,
    icon: "✨",
    features: ["Twitch/Discord-ready", "Custom emotes", "Sub-badges", "Channel points", "Source files"],
    packages: [
      { name: "Starter", price: 79, priceGBP: 63, priceEUR: 71, features: ["5 emotes", "2 badges"] },
      { name: "Standard", price: 149, priceGBP: 119, priceEUR: 134, features: ["15 emotes", "5 badges", "Channel points icon"] },
      { name: "Full Pack", price: 299, priceGBP: 239, priceEUR: 269, features: ["30 emotes", "10 badges", "Everything included", "Source files"] },
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
  priceEUR: number;
  category: string[];
}

export const MODULES: Module[] = [
  // Website modules
  { id: "contact-form", name: "Contact Form", description: "Custom contact form with email notifications", price: 99, priceGBP: 79, priceEUR: 89, category: ["website"] },
  { id: "auth-system", name: "User Authentication", description: "Login, register, password reset, user profiles", price: 299, priceGBP: 239, priceEUR: 269, category: ["website", "mobile-app"] },
  { id: "blog-cms", name: "Blog / CMS", description: "Full blog with admin panel to manage posts", price: 399, priceGBP: 319, priceEUR: 359, category: ["website"] },
  { id: "ecommerce", name: "E-commerce", description: "Product listings, cart, checkout with Stripe", price: 799, priceGBP: 639, priceEUR: 719, category: ["website"] },
  { id: "booking-system", name: "Booking System", description: "Calendar-based appointment booking", price: 499, priceGBP: 399, priceEUR: 449, category: ["website", "mobile-app"] },
  { id: "search", name: "Search Functionality", description: "Full-text search across content", price: 199, priceGBP: 159, priceEUR: 179, category: ["website"] },
  { id: "multilingual", name: "Multi-language Support", description: "Site available in multiple languages", price: 299, priceGBP: 239, priceEUR: 269, category: ["website"] },
  { id: "seo-advanced", name: "Advanced SEO", description: "Sitemap, meta tags, structured data, analytics", price: 199, priceGBP: 159, priceEUR: 179, category: ["website"] },
  { id: "payment-gateway", name: "Payment Integration", description: "Accept payments via Stripe, PayPal, or other", price: 399, priceGBP: 319, priceEUR: 359, category: ["website", "mobile-app"] },
  { id: "live-chat", name: "Live Chat", description: "Real-time chat support for your visitors", price: 199, priceGBP: 159, priceEUR: 179, category: ["website"] },
  { id: "dashboard-analytics", name: "Admin Dashboard & Analytics", description: "Track users, orders, and site performance", price: 499, priceGBP: 399, priceEUR: 449, category: ["website", "mobile-app"] },
  { id: "api-integration", name: "Third-party API Integration", description: "Connect to external services (CRM, maps, etc.)", price: 299, priceGBP: 239, priceEUR: 269, category: ["website", "mobile-app"] },
  { id: "notifications", name: "Push Notifications", description: "Email and/or push notifications for users", price: 199, priceGBP: 159, priceEUR: 179, category: ["website", "mobile-app"] },
  { id: "social-login", name: "Social Login", description: "Login with Google, Facebook, Discord", price: 149, priceGBP: 119, priceEUR: 134, category: ["website", "mobile-app"] },
  { id: "file-uploads", name: "File Uploads", description: "Allow users to upload images, documents, etc.", price: 149, priceGBP: 119, priceEUR: 134, category: ["website", "mobile-app"] },
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
  // App modules
  { id: "app-offline", name: "Offline Mode", description: "App works without internet connection", price: 399, priceGBP: 319, priceEUR: 359, category: ["mobile-app"] },
  { id: "app-maps", name: "Maps & Location", description: "Google Maps integration with location features", price: 299, priceGBP: 239, priceEUR: 269, category: ["mobile-app"] },
  { id: "app-camera", name: "Camera & Media", description: "Camera access, photo/video capture and upload", price: 199, priceGBP: 159, priceEUR: 179, category: ["mobile-app"] },
  { id: "app-payments", name: "In-app Purchases", description: "App Store and Google Play payment integration", price: 499, priceGBP: 399, priceEUR: 449, category: ["mobile-app"] },
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
