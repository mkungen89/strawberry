export const SERVICES = [
  // === TIER 1: Cash cows (1-4 hours) ===
  {
    slug: "logo-branding",
    name: "Logo & Branding",
    category: "GRAPHICS",
    briefPlaceholder: "Example: I run a gaming YouTube channel called 'NightOwl Gaming'. I want a logo that feels dark and mysterious with a purple/black color scheme. Think owl mascot, maybe holding a controller. I like minimalist designs — nothing too cluttered. I'll use it on YouTube, merch, and social media.",
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
    briefPlaceholder: "Example: I'm a Twitch streamer and content creator. I need matching profile pictures and banners for YouTube, Twitch, Twitter/X, and Instagram. My brand colors are red and white. I go by 'FrostByte' and I play FPS games. Clean, modern esports style.",
    description: "Matching profile pictures, banners, and headers for all your social platforms. One cohesive look everywhere.",
    basePrice: 79,
    basePriceGBP: 63,
    basePriceEUR: 71,
    popular: true,
    icon: "📱",
    features: ["All major platforms", "Consistent branding", "Multiple sizes", "Profile + banner", "Source files"],
    packages: [
      { name: "Starter", price: 79, priceGBP: 63, priceEUR: 71, features: ["2 platforms", "Profile pic + banner", "2 revisions"] },
      { name: "Creator", price: 149, priceGBP: 119, priceEUR: 134, features: ["5 platforms (YouTube, Twitch, X, Discord, Instagram)", "Profile + banner + thumbnails", "4 revisions"] },
      { name: "Pro", price: 229, priceGBP: 183, priceEUR: 206, features: ["All platforms", "Full asset pack", "Animated versions", "Unlimited revisions", "Source files"] },
    ],
  },
  {
    slug: "youtube-thumbnails",
    name: "YouTube Thumbnails",
    category: "YOUTUBE",
    briefPlaceholder: "Example: I make Minecraft survival videos. My channel color is orange and I want a bold, bright thumbnail style with big text and my face in the corner. Think MrBeast-style energy. Video topics will be things like 'I survived 100 days' and 'building the world's biggest base'.",
    description: "Eye-catching thumbnails that get clicks. Bulk packs available — consistent style across your whole channel.",
    basePrice: 39,
    basePriceGBP: 31,
    basePriceEUR: 35,
    popular: true,
    icon: "🖼️",
    features: ["Click-worthy design", "Your branding", "Fast delivery", "Reusable templates", "All sizes"],
    packages: [
      { name: "5 Pack", price: 39, priceGBP: 31, priceEUR: 35, features: ["5 thumbnails", "Consistent style", "1 revision per thumbnail"] },
      { name: "10 Pack", price: 69, priceGBP: 55, priceEUR: 62, features: ["10 thumbnails", "2 styles to choose from", "2 revisions per thumbnail"] },
      { name: "20 Pack + Template", price: 109, priceGBP: 87, priceEUR: 98, features: ["20 thumbnails", "Reusable Canva/Figma template", "Unlimited revisions", "Source files"] },
    ],
  },
  {
    slug: "youtube-banner",
    name: "YouTube Banner & Avatar",
    category: "YOUTUBE",
    briefPlaceholder: "Example: My YouTube channel is about tech reviews and unboxings. I want a clean, modern banner with blue/white tones, my channel name 'TechTalkTV', and maybe some device imagery in the background. Avatar should be a clean logo version that looks good small.",
    description: "Professional channel art that attracts subscribers and reflects your brand.",
    basePrice: 69,
    basePriceGBP: 55,
    basePriceEUR: 62,
    popular: false,
    icon: "🎬",
    features: ["HD quality", "Custom colors", "Multiple formats", "Logo included", "Revisions"],
    packages: [
      { name: "Banner", price: 69, priceGBP: 55, priceEUR: 62, features: ["1 banner", "2 revisions", "HD export"] },
      { name: "Package", price: 119, priceGBP: 95, priceEUR: 107, features: ["Banner + avatar", "3 revisions", "All formats"] },
      { name: "Complete", price: 189, priceGBP: 151, priceEUR: 170, features: ["Banner + avatar + thumbnail template", "5 revisions", "Source files"] },
    ],
  },
  {
    slug: "streaming-overlay",
    name: "Streaming Overlay",
    category: "STREAMING",
    briefPlaceholder: "Example: I stream Valorant and CS2 on Twitch. I want a dark overlay with neon pink/cyan accents. I need a webcam border, health/info bar, and animated alerts for follows, subs, and donations. OBS-compatible. My brand name is 'xViper' and I want it to feel like a pro esports setup.",
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
    briefPlaceholder: "Example: I'm a Twitch streamer who plays cozy games. I want cute, chibi-style emotes — a laughing face, a crying one, a hype one, and a 'GG' emote. Sub-badges should match my pastel pink theme. My mascot is a little fox so emotes based on that would be amazing.",
    description: "Unique sub-badges, emotes and channel point icons for your streaming channel.",
    basePrice: 49,
    basePriceGBP: 39,
    basePriceEUR: 44,
    popular: false,
    icon: "😎",
    features: ["Twitch/Discord-ready", "Custom emotes", "Sub-badges", "Channel points", "Source files"],
    packages: [
      { name: "Starter", price: 49, priceGBP: 39, priceEUR: 44, features: ["5 emotes", "2 badges"] },
      { name: "Standard", price: 99, priceGBP: 79, priceEUR: 89, features: ["15 emotes", "5 badges", "Channel points icon"] },
      { name: "Full Pack", price: 169, priceGBP: 135, priceEUR: 152, features: ["30 emotes", "10 badges", "Everything included", "Source files"] },
    ],
  },
  {
    slug: "discord-server",
    name: "Discord Server",
    category: "DISCORD",
    briefPlaceholder: "Example: I want a Discord server for my gaming community. The theme should be dark blue and neon green. I need channels for announcements, general chat, gaming sessions, and a rules channel. I'd like a welcome bot that greets new members and roles for different games like Fortnite, Minecraft, and Valorant.",
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
    briefPlaceholder: "Example: I'm a freelance video editor and I need a Notion workspace to manage my clients, track invoices, and plan my content calendar. I love dark mode with purple accents. I want it to feel minimal and professional — not too cluttered.",
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
    briefPlaceholder: "Example: I mainly play on Steam and Xbox. My gamer tag is 'IronGhost' and I want a dark, military-themed profile — grey and olive green tones, maybe a ghost/soldier silhouette. I want matching avatars for both platforms that look cool and unique.",
    description: "Matching avatars, banners, and profile art for Steam, Xbox, PlayStation, and more.",
    basePrice: 49,
    basePriceGBP: 39,
    basePriceEUR: 44,
    popular: false,
    icon: "🎮",
    features: ["Multi-platform", "Consistent style", "Custom art", "All sizes", "Fast delivery"],
    packages: [
      { name: "Basic", price: 49, priceGBP: 39, priceEUR: 44, features: ["1 platform", "Avatar + banner", "2 revisions"] },
      { name: "Multi", price: 89, priceGBP: 71, priceEUR: 80, features: ["3 platforms", "Avatar + banner each", "3 revisions"] },
      { name: "Ultimate", price: 149, priceGBP: 119, priceEUR: 134, features: ["All platforms", "Animated avatar", "Source files", "Unlimited revisions"] },
    ],
  },
  {
    slug: "email-templates",
    name: "Email Templates",
    category: "GRAPHICS",
    briefPlaceholder: "Example: I run a small online merch store for content creators. I need a welcome email for new subscribers, a weekly newsletter template, and a promotional email for sales. My brand colors are black and gold. I use Mailchimp and want it to look clean and premium.",
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
  {
    slug: "copywriting",
    name: "Copywriting",
    category: "CONTENT",
    briefPlaceholder: "Example: I'm launching a landing page for my online course on YouTube growth. Target audience is small creators (under 10k subs) who want to monetize. I want punchy, motivating copy with a clear CTA to sign up. Tone should feel like a friend giving real advice, not a salesman.",
    description: "Copywriting that converts. Website copy, landing pages, email sequences, and ad copy. Fast turnaround, unlimited revisions on Pro.",
    basePrice: 149,
    basePriceGBP: 119,
    basePriceEUR: 134,
    popular: true,
    icon: "✍️",
    features: ["Conversion-focused", "SEO integrated", "Brand voice matched", "Fast delivery", "Unlimited revisions (Pro)"],
    packages: [
      { name: "Starter", price: 149, priceGBP: 119, priceEUR: 134, features: ["500 words", "1 page/section", "SEO keywords", "2 revisions"] },
      { name: "Growth", price: 299, priceGBP: 239, priceEUR: 269, features: ["1,500 words", "Full landing page", "3-email sequence", "Brand voice guide", "3 revisions"] },
      { name: "Pro", price: 599, priceGBP: 479, priceEUR: 539, features: ["5,000 words", "Full website copy", "Email sequence", "Ad copy", "Unlimited revisions"] },
    ],
  },
  {
    slug: "ai-images",
    name: "Custom Images",
    category: "GRAPHICS",
    briefPlaceholder: "Example: I need 10 fantasy-style images for my YouTube channel thumbnails. Think dark forests, glowing swords, epic landscapes. Color palette: deep blues, purples, and gold. High resolution, no watermarks. I'll use them for commercial content.",
    description: "Custom-generated images. On-brand, high resolution, commercial rights included.",
    basePrice: 49,
    basePriceGBP: 39,
    basePriceEUR: 44,
    popular: false,
    icon: "🖼️",
    features: ["Advanced image generation", "4K resolution", "Commercial rights", "Custom prompts", "Fast delivery"],
    packages: [
      { name: "Image Pack", price: 49, priceGBP: 39, priceEUR: 44, features: ["10 images", "1 style/theme", "High resolution", "24h delivery"] },
      { name: "Brand Visuals", price: 149, priceGBP: 119, priceEUR: 134, features: ["30 images", "3 themes", "Consistent brand aesthetic"] },
      { name: "Content Library", price: 299, priceGBP: 239, priceEUR: 269, features: ["100 images", "Full visual identity", "Organized delivery"] },
    ],
  },
  {
    slug: "seo-audit",
    name: "SEO Audit",
    category: "SEO",
    briefPlaceholder: "Example: My website is a gaming blog at gamecentral.io. I've had it for 2 years but organic traffic is stagnant at around 500 visits/month. I mainly write game reviews and tier lists. I want to know why I'm not ranking and what I should fix first.",
    description: "Find and fix what's killing your Google rankings. Technical audit, keyword gaps, and a prioritized action plan — not a confusing 100-page report.",
    basePrice: 99,
    basePriceGBP: 79,
    basePriceEUR: 89,
    popular: false,
    icon: "🔍",
    features: ["50+ checks", "Core Web Vitals", "Keyword gaps", "Priority fix list", "Competitor analysis"],
    packages: [
      { name: "Quick Scan", price: 99, priceGBP: 79, priceEUR: 89, features: ["Technical scan", "Core Web Vitals", "Top 10 fixes", "1–2 day delivery"] },
      { name: "Full Audit", price: 299, priceGBP: 239, priceEUR: 269, features: ["Everything + on-page analysis", "Keyword gaps", "Competitor comparison", "30-min call"] },
      { name: "Audit + Fix", price: 599, priceGBP: 479, priceEUR: 539, features: ["Full audit + we implement fixes", "Meta tags, schema, sitemap", "Monthly follow-up"] },
    ],
  },
  {
    slug: "growth-strategy",
    name: "Growth Strategy",
    category: "GROWTH",
    briefPlaceholder: "Example: I have a YouTube channel about PC building with 800 subscribers. I've been uploading for 8 months and growth has stalled. I post 2 videos per week. My videos average 200 views. I want to understand why I'm not growing and get a clear plan to reach 10k subs.",
    description: "Data-driven growth strategy for YouTube and Twitch creators. Channel audits, weekly support, and proven playbooks that actually grow your audience.",
    basePrice: 149,
    basePriceGBP: 119,
    basePriceEUR: 134,
    popular: false,
    icon: "📈",
    features: ["Channel audit", "Competitor analysis", "Content strategy", "SEO optimization", "Weekly support"],
    packages: [
      { name: "Channel Audit", price: 149, priceGBP: 119, priceEUR: 134, features: ["Full audit", "20+ recommendations", "Loom walkthrough", "Q&A call"] },
      { name: "Growth Sprint", price: 499, priceGBP: 399, priceEUR: 449, features: ["Monthly strategy", "Weekly content ideas", "Thumbnail feedback", "Analytics review"] },
      { name: "Full Partner", price: 1299, priceGBP: 1039, priceEUR: 1169, features: ["Everything + community mgmt", "Monetization strategy", "Brand deal consulting"] },
    ],
  },
  {
    slug: "community-management",
    name: "Community Management",
    category: "SOCIAL",
    briefPlaceholder: "Example: I'm a Twitch streamer with a Discord server of 2,000 members and a Twitter/X account. I need help moderating the server, posting daily content on Twitter, and running community events. My tone is casual and fun — not corporate. Main audience: 18–28 year old gamers.",
    description: "Professional community management for Discord, Twitter/X, and Reddit. Daily engagement, moderation, and growth. Your brand's voice, handled.",
    basePrice: 299,
    basePriceGBP: 239,
    basePriceEUR: 269,
    popular: false,
    icon: "👥",
    features: ["Discord + Twitter/X", "24/7 moderation", "Content calendar", "Monthly reports", "Engagement campaigns"],
    packages: [
      { name: "Starter", price: 299, priceGBP: 239, priceEUR: 269, features: ["1 platform", "10 posts/week", "Basic moderation", "Monthly report"] },
      { name: "Growth", price: 599, priceGBP: 479, priceEUR: 539, features: ["2 platforms", "20 posts/week", "24/7 moderation", "Strategy calls"] },
      { name: "Pro", price: 1199, priceGBP: 959, priceEUR: 1079, features: ["3+ platforms", "40 posts/week", "Events & AMAs", "Dedicated manager"] },
    ],
  },
  {
    slug: "landing-page-design",
    name: "Landing Page Design",
    category: "WEB",
    briefPlaceholder: "Example: I'm launching an online course about digital marketing. I need a landing page that sells the course and captures email signups. My brand colors are blue/white. I want it to feel trustworthy and professional — think clean, modern, minimal clutter. I have my own domain.",
    description: "Custom landing pages that convert. Perfect for products, services, or campaigns. Includes design, layout, and ready-to-deploy.",
    basePrice: 399,
    basePriceGBP: 319,
    basePriceEUR: 359,
    popular: false,
    icon: "🌐",
    features: ["Custom design", "Responsive layout", "CTA optimization", "Fast loading", "Mobile-friendly"],
    packages: [
      { name: "Single Page", price: 399, priceGBP: 319, priceEUR: 359, features: ["1 custom page", "CTA sections", "Mobile responsive", "Ready to deploy"] },
      { name: "3-Page Site", price: 699, priceGBP: 559, priceEUR: 630, features: ["3 pages", "Navigation", "Contact form", "SEO optimized"] },
      { name: "Full Package with Strategy", price: 999, priceGBP: 799, priceEUR: 900, features: ["Up to 5 pages", "Conversion strategy", "A/B tested layout", "Analytics setup", "Unlimited revisions"] },
    ],
  },
  {
    slug: "custom-illustrations",
    name: "Custom Illustrations",
    category: "GRAPHICS",
    briefPlaceholder: "Example: I'm a SaaS startup and I want custom illustrations for our app onboarding. Think friendly, modern, tech-forward. We need 3 character illustrations (different professions using our app) and 2 scene illustrations. Our brand is minimalist with purple accents. Should feel welcoming, not corporate.",
    description: "Unique, custom illustrations for your brand. Characters, mascots, or scene illustrations — made just for you.",
    basePrice: 99,
    basePriceGBP: 79,
    basePriceEUR: 89,
    popular: false,
    icon: "🎨",
    features: ["Original artwork", "Brand-aligned", "Multiple concepts", "Commercial rights", "Source files"],
    packages: [
      { name: "Single Illustration", price: 99, priceGBP: 79, priceEUR: 89, features: ["1 custom illustration", "2 revisions", "PNG + SVG export"] },
      { name: "5-Pack", price: 299, priceGBP: 239, priceEUR: 269, features: ["5 illustrations", "Consistent style", "3 revisions each", "Source files"] },
      { name: "10-Pack + Unlimited Revisions", price: 399, priceGBP: 319, priceEUR: 359, features: ["10 illustrations", "Unlimited revisions", "Full source files", "Commercial license"] },
    ],
  },
  {
    slug: "email-newsletter-template",
    name: "Email Newsletter Template",
    category: "GRAPHICS",
    briefPlaceholder: "Example: I run a tech newsletter with 5k subscribers. I want a sleek, modern email template that looks good on mobile. Dark mode support. I want space for featured article, 3-4 links, and a call-to-action. My brand is dark blue and white with orange accents.",
    description: "Beautiful, ready-to-use email templates for Substack, Beehiiv, or Mailchimp. One-off or monthly subscriptions.",
    basePrice: 99,
    basePriceGBP: 79,
    basePriceEUR: 89,
    popular: false,
    icon: "📮",
    features: ["Custom design", "Responsive layout", "Drag-and-drop ready", "Brand colors", "Monthly options"],
    packages: [
      { name: "Single Template", price: 99, priceGBP: 79, priceEUR: 89, features: ["1 email template", "Mobile responsive", "Platform-ready export"] },
      { name: "5-Template Pack", price: 199, priceGBP: 159, priceEUR: 179, features: ["5 templates", "Cohesive design system", "Welcome + newsletter + promo + more"] },
      { name: "Monthly Subscription", price: 99, priceGBP: 79, priceEUR: 89, features: ["2 new templates/month", "Brand refresh each month", "Priority delivery"] },
    ],
  },
  {
    slug: "brand-guidelines",
    name: "Brand Guidelines Document",
    category: "STRATEGY",
    briefPlaceholder: "Example: My personal brand is growing and I need official brand guidelines so I can work with contractors. I have a logo already, but I need rules for: logo usage (sizing, spacing), color palette, typography (which fonts), how to describe my brand voice (I'm casual but professional), and examples of what 'on-brand' looks like. I want it as a PDF and a Figma file.",
    description: "Professional brand guidelines document. Logo usage, colors, typography, voice, and more — everything your team needs.",
    basePrice: 199,
    basePriceGBP: 159,
    basePriceEUR: 179,
    popular: false,
    icon: "📋",
    features: ["Logo guidelines", "Color palette", "Typography rules", "Brand voice", "Usage examples"],
    packages: [
      { name: "Basic Guidelines", price: 199, priceGBP: 159, priceEUR: 179, features: ["Logo rules", "Color palette", "Typography", "PDF export"] },
      { name: "Standard Package", price: 349, priceGBP: 279, priceEUR: 314, features: ["Everything in Basic", "Brand voice guide", "Do/don't examples", "Figma file"] },
      { name: "Premium with Video Guidelines", price: 599, priceGBP: 479, priceEUR: 540, features: ["Full guidelines doc", "Loom walkthrough video", "Social templates", "Onboarding kit for contractors"] },
    ],
  },
  {
    slug: "social-media-calendar",
    name: "Social Media Content Calendar",
    category: "GRAPHICS",
    briefPlaceholder: "Example: I'm a life coach and I post on Instagram and TikTok. I need 30 custom graphics per month that align with my brand (pink/gold, motivational quotes, before-after stories, tips). I want them ready-to-post with captions. I can't spend time making graphics — I need them done and scheduled. Different graphics for Instagram vs TikTok sizes.",
    description: "Monthly content calendar with custom graphics ready to post. 30 on-brand graphics + scheduling strategy.",
    basePrice: 149,
    basePriceGBP: 119,
    basePriceEUR: 134,
    popular: false,
    icon: "📅",
    features: ["30+ monthly graphics", "Multi-platform", "Ready to post", "Custom captions", "Strategy call"],
    packages: [
      { name: "Standard", price: 149, priceGBP: 119, priceEUR: 134, features: ["30 graphics/month", "Instagram + TikTok sizes", "Custom captions", "Monthly delivery"] },
      { name: "Premium with Strategy", price: 249, priceGBP: 199, priceEUR: 224, features: ["40 graphics/month", "Bi-weekly strategy calls", "Content mix planning", "Scheduling recommendations"] },
      { name: "Quarterly Prepay", price: 379, priceGBP: 303, priceEUR: 341, features: ["90 graphics (3 months)", "Save 15%", "Priority support", "Dedicated content theme"] },
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

// Platform size requirements per service slug
export interface PlatformSize {
  label: string;
  dimensions: string;
}

export interface Platform {
  id: string;
  name: string;
  icon: string;
  sizes: PlatformSize[];
}

export const SERVICE_PLATFORMS: Record<string, Platform[]> = {
  "logo-branding": [
    { id: "youtube", name: "YouTube", icon: "▶", sizes: [{ label: "Channel Art", dimensions: "2560×1440px" }, { label: "Profile Picture", dimensions: "800×800px" }] },
    { id: "twitch", name: "Twitch", icon: "🟣", sizes: [{ label: "Profile Banner", dimensions: "1200×380px" }, { label: "Profile Picture", dimensions: "800×800px" }] },
    { id: "twitter", name: "Twitter/X", icon: "✕", sizes: [{ label: "Header", dimensions: "1500×500px" }, { label: "Profile Picture", dimensions: "400×400px" }] },
    { id: "instagram", name: "Instagram", icon: "📷", sizes: [{ label: "Profile Picture", dimensions: "320×320px" }] },
    { id: "tiktok", name: "TikTok", icon: "♪", sizes: [{ label: "Profile Picture", dimensions: "200×200px" }] },
    { id: "facebook", name: "Facebook", icon: "f", sizes: [{ label: "Cover Photo", dimensions: "851×315px" }, { label: "Profile Picture", dimensions: "170×170px" }] },
    { id: "discord", name: "Discord", icon: "💬", sizes: [{ label: "Server Icon", dimensions: "512×512px" }] },
    { id: "linkedin", name: "LinkedIn", icon: "in", sizes: [{ label: "Banner", dimensions: "1584×396px" }, { label: "Profile Picture", dimensions: "400×400px" }] },
  ],
  "social-media-kit": [
    { id: "youtube", name: "YouTube", icon: "▶", sizes: [{ label: "Channel Art", dimensions: "2560×1440px" }, { label: "Profile Picture", dimensions: "800×800px" }] },
    { id: "twitch", name: "Twitch", icon: "🟣", sizes: [{ label: "Profile Banner", dimensions: "1200×380px" }, { label: "Profile Picture", dimensions: "800×800px" }, { label: "Offline Banner", dimensions: "1920×1080px" }, { label: "Panels", dimensions: "320×160px" }] },
    { id: "twitter", name: "Twitter/X", icon: "✕", sizes: [{ label: "Header", dimensions: "1500×500px" }, { label: "Profile Picture", dimensions: "400×400px" }] },
    { id: "instagram", name: "Instagram", icon: "📷", sizes: [{ label: "Profile Picture", dimensions: "320×320px" }, { label: "Post", dimensions: "1080×1080px" }, { label: "Story/Reel", dimensions: "1080×1920px" }] },
    { id: "tiktok", name: "TikTok", icon: "♪", sizes: [{ label: "Profile Picture", dimensions: "200×200px" }, { label: "Video Cover", dimensions: "1080×1920px" }] },
    { id: "facebook", name: "Facebook", icon: "f", sizes: [{ label: "Cover Photo", dimensions: "851×315px" }, { label: "Profile Picture", dimensions: "170×170px" }] },
    { id: "discord", name: "Discord", icon: "💬", sizes: [{ label: "Server Icon", dimensions: "512×512px" }, { label: "Banner", dimensions: "960×540px" }] },
    { id: "linkedin", name: "LinkedIn", icon: "in", sizes: [{ label: "Banner", dimensions: "1584×396px" }, { label: "Profile Picture", dimensions: "400×400px" }] },
    { id: "kick", name: "Kick", icon: "🟢", sizes: [{ label: "Banner", dimensions: "1920×480px" }, { label: "Profile Picture", dimensions: "400×400px" }] },
  ],
  "youtube-banner": [
    { id: "youtube", name: "YouTube", icon: "▶", sizes: [{ label: "Channel Art", dimensions: "2560×1440px" }, { label: "Avatar/Logo", dimensions: "800×800px" }, { label: "Thumbnail", dimensions: "1280×720px" }] },
  ],
  "youtube-thumbnails": [
    { id: "youtube", name: "YouTube", icon: "▶", sizes: [{ label: "Thumbnail", dimensions: "1280×720px" }] },
    { id: "shorts", name: "YouTube Shorts", icon: "▶", sizes: [{ label: "Thumbnail/Cover", dimensions: "1080×1920px" }] },
  ],
  "streaming-overlay": [
    { id: "twitch", name: "Twitch", icon: "🟣", sizes: [{ label: "Stream Overlay", dimensions: "1920×1080px" }, { label: "Alert Box", dimensions: "1920×1080px" }, { label: "Panels", dimensions: "320×160px" }] },
    { id: "youtube-gaming", name: "YouTube Gaming", icon: "▶", sizes: [{ label: "Stream Overlay", dimensions: "1920×1080px" }] },
    { id: "tiktok-live", name: "TikTok Live", icon: "♪", sizes: [{ label: "Overlay", dimensions: "1080×1920px" }] },
    { id: "kick", name: "Kick", icon: "🟢", sizes: [{ label: "Stream Overlay", dimensions: "1920×1080px" }] },
  ],
  "streaming-icons": [
    { id: "twitch", name: "Twitch", icon: "🟣", sizes: [{ label: "Emotes (small)", dimensions: "28×28px" }, { label: "Emotes (medium)", dimensions: "56×56px" }, { label: "Emotes (large)", dimensions: "112×112px" }, { label: "Sub Badges", dimensions: "18×18 / 36×36 / 72×72px" }] },
    { id: "discord", name: "Discord", icon: "💬", sizes: [{ label: "Server Emoji", dimensions: "128×128px" }] },
    { id: "youtube-gaming", name: "YouTube Gaming", icon: "▶", sizes: [{ label: "Membership Badges", dimensions: "48×48px" }, { label: "Emojis", dimensions: "512×512px" }] },
    { id: "kick", name: "Kick", icon: "🟢", sizes: [{ label: "Emotes", dimensions: "128×128px" }] },
  ],
  "gaming-profile": [
    { id: "steam", name: "Steam", icon: "🎮", sizes: [{ label: "Avatar", dimensions: "184×184px" }, { label: "Artwork Background", dimensions: "3840×1240px" }, { label: "Mini Profile Background", dimensions: "2000×600px" }] },
    { id: "xbox", name: "Xbox", icon: "🎮", sizes: [{ label: "Gamerpic", dimensions: "1080×1080px" }, { label: "Background", dimensions: "1920×1080px" }] },
    { id: "playstation", name: "PlayStation", icon: "🎮", sizes: [{ label: "Avatar", dimensions: "512×512px" }, { label: "Background", dimensions: "1920×1080px" }] },
    { id: "epic", name: "Epic Games", icon: "🎮", sizes: [{ label: "Avatar", dimensions: "512×512px" }] },
    { id: "battlenet", name: "Battle.net", icon: "🎮", sizes: [{ label: "Avatar", dimensions: "512×512px" }] },
  ],
  "landing-page-design": [
    { id: "web", name: "Website", icon: "🌐", sizes: [{ label: "Desktop", dimensions: "1440×900px" }, { label: "Mobile", dimensions: "390×844px" }] },
  ],
  "custom-illustrations": [
    { id: "web", name: "Website / App", icon: "🌐", sizes: [{ label: "Standard", dimensions: "1000×1000px" }, { label: "Wide", dimensions: "1920×600px" }] },
    { id: "print", name: "Print", icon: "🖨", sizes: [{ label: "A4 (300dpi)", dimensions: "2480×3508px" }] },
    { id: "social", name: "Social Media", icon: "📱", sizes: [{ label: "Post", dimensions: "1080×1080px" }] },
  ],
  "email-newsletter-template": [
    { id: "email-desktop", name: "Email (Desktop)", icon: "📧", sizes: [{ label: "Email Width", dimensions: "600px wide" }] },
    { id: "email-mobile", name: "Email (Mobile)", icon: "📱", sizes: [{ label: "Mobile Email", dimensions: "375px wide" }] },
  ],
  "brand-guidelines": [
    { id: "pdf", name: "PDF Document", icon: "📄", sizes: [{ label: "A4", dimensions: "210×297mm" }] },
    { id: "figma", name: "Figma File", icon: "🎨", sizes: [{ label: "Canvas", dimensions: "Scalable" }] },
  ],
  "social-media-calendar": [
    { id: "instagram", name: "Instagram", icon: "📷", sizes: [{ label: "Post", dimensions: "1080×1080px" }, { label: "Story/Reel", dimensions: "1080×1920px" }] },
    { id: "tiktok", name: "TikTok", icon: "♪", sizes: [{ label: "Cover / Graphic", dimensions: "1080×1920px" }] },
    { id: "twitter", name: "Twitter/X", icon: "✕", sizes: [{ label: "Post Image", dimensions: "1200×675px" }] },
    { id: "facebook", name: "Facebook", icon: "f", sizes: [{ label: "Post", dimensions: "1200×630px" }] },
    { id: "linkedin", name: "LinkedIn", icon: "in", sizes: [{ label: "Post", dimensions: "1200×627px" }] },
  ],
};

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
  { id: "brand-social", name: "Social Media Assets", description: "Profile pics and banners for all platforms", price: 99, priceGBP: 79, priceEUR: 89, category: ["logo-branding"] },
  { id: "brand-guidelines", name: "Brand Guidelines PDF", description: "Complete style guide document for your brand", price: 99, priceGBP: 79, priceEUR: 89, category: ["logo-branding"] },
];

// ---------------------------------------------------------------------------
// Deliverables per service+package — drives what Midjourney jobs to generate
// ---------------------------------------------------------------------------

export interface DeliverableSpec {
  type: string;         // internal key: "banner", "avatar", "logo", etc.
  label: string;        // human-readable: "Banner", "Avatar", "Logo"
  ar: string;           // Midjourney --ar flag
  promptSuffix: string; // appended to the base concept prompt
}

/** Returns the list of image deliverables for a given service + package combo.
 *  Services that don't produce Midjourney images return an empty array.
 */
export function getServiceDeliverables(serviceSlug: string, packageName: string): DeliverableSpec[] {
  const p = packageName.toLowerCase();

  switch (serviceSlug) {
    case "youtube-banner":
      if (p === "banner") return [
        { type: "banner", label: "Banner", ar: "32:9", promptSuffix: "YouTube channel banner, ultra-wide format 2560x1440, horizontal composition" },
      ];
      if (p === "package") return [
        { type: "banner", label: "Banner", ar: "32:9", promptSuffix: "YouTube channel banner, ultra-wide format 2560x1440, horizontal composition" },
        { type: "avatar", label: "Avatar", ar: "1:1", promptSuffix: "profile picture avatar, square format 800x800, centered subject, clean background" },
      ];
      if (p === "complete") return [
        { type: "banner", label: "Banner", ar: "32:9", promptSuffix: "YouTube channel banner, ultra-wide format 2560x1440, horizontal composition" },
        { type: "avatar", label: "Avatar", ar: "1:1", promptSuffix: "profile picture avatar, square format 800x800, centered subject, clean background" },
      ];
      return [{ type: "banner", label: "Banner", ar: "32:9", promptSuffix: "YouTube channel banner, ultra-wide format 2560x1440" }];

    case "social-media-kit":
      return [
        { type: "banner", label: "Banner", ar: "16:9", promptSuffix: "social media channel banner, wide format, horizontal composition" },
        { type: "avatar", label: "Profile Picture", ar: "1:1", promptSuffix: "profile picture avatar, square format, centered subject, clean background" },
      ];

    case "gaming-profile":
      return [
        { type: "avatar", label: "Avatar", ar: "1:1", promptSuffix: "gaming profile picture avatar, square format 800x800, centered subject" },
        { type: "banner", label: "Banner", ar: "16:9", promptSuffix: "gaming profile banner, wide format, horizontal composition" },
      ];

    case "logo-branding":
      return [
        { type: "logo", label: "Logo", ar: "1:1", promptSuffix: "logo design, square canvas, transparent/white background, vector style" },
      ];

    case "streaming-overlay":
      return [
        { type: "overlay", label: "Overlay Preview", ar: "16:9", promptSuffix: "streaming overlay layout, 1920x1080, dark background, showing webcam frame and info bars" },
      ];

    case "youtube-thumbnails":
      return [
        { type: "thumbnail", label: "Thumbnail", ar: "16:9", promptSuffix: "YouTube thumbnail, 1280x720, bold composition, eye-catching" },
      ];

    case "streaming-icons":
      return [
        { type: "emote", label: "Emote Preview", ar: "1:1", promptSuffix: "emote/icon design, square format, simple expressive design, suitable for Twitch/Discord" },
      ];

    case "ai-images":
      return [
        { type: "main", label: "Image", ar: "16:9", promptSuffix: "high quality digital art, detailed, professional" },
      ];

    default:
      return [];
  }
}

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
