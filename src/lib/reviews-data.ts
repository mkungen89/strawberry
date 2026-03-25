export interface Review {
  id: string;
  serviceSlug: string;
  author: string;
  role?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string; // YYYY-MM-DD
  text: string;
  avatar?: string; // Optional avatar URL or emoji
}

export const REVIEWS: Review[] = [
  // Logo & Branding
  {
    id: "logo-1",
    serviceSlug: "logo-branding",
    author: "Sarah Mitchell",
    role: "Founder, GreenLeaf Co",
    rating: 5,
    date: "2025-03-10",
    text: "Absolutely loved the logo concepts! They nailed our brand identity on the first round. The Full Identity package was worth every penny — we use the brand kit everywhere.",
    avatar: "👩‍💼",
  },
  {
    id: "logo-2",
    serviceSlug: "logo-branding",
    author: "Marcus Chen",
    role: "Startup Founder",
    rating: 5,
    date: "2025-02-28",
    text: "Fast, professional, and exactly what we needed. Went with the Brand Kit package and got 3 amazing concepts to choose from. Highly recommend!",
    avatar: "👨‍💻",
  },

  // Social Media Kit
  {
    id: "social-1",
    serviceSlug: "social-media-kit",
    author: "Alex Rivera",
    role: "Content Creator",
    rating: 5,
    date: "2025-03-15",
    text: "My socials finally look cohesive! The Creator package covered all my platforms perfectly. People are actually complimenting my profile now 😂",
    avatar: "🎨",
  },
  {
    id: "social-2",
    serviceSlug: "social-media-kit",
    author: "Jordan Lee",
    role: "Twitch Streamer",
    rating: 4,
    date: "2025-03-05",
    text: "Great work! The animated avatars in the Pro package are 🔥. Only minor feedback was one revision needed, but they turned it around same day.",
    avatar: "🎮",
  },

  // YouTube Thumbnails
  {
    id: "thumb-1",
    serviceSlug: "youtube-thumbnails",
    author: "Ryan Brooks",
    role: "YouTube Creator (120K subs)",
    rating: 5,
    date: "2025-03-18",
    text: "My CTR went from 4% to 8% after switching to these thumbnails. The 20-pack deal is insane value — plus the template means I can make more myself!",
    avatar: "📹",
  },
  {
    id: "thumb-2",
    serviceSlug: "youtube-thumbnails",
    author: "Emma Davis",
    role: "Gaming YouTuber",
    rating: 5,
    date: "2025-03-12",
    text: "Best thumbnails I've ever had. Consistent style, fast turnaround, and actually helped me grow my channel. Already ordered a second 10-pack!",
    avatar: "🎮",
  },

  // Streaming Overlay
  {
    id: "stream-1",
    serviceSlug: "streaming-overlay",
    author: "Tyler West",
    role: "Twitch Partner",
    rating: 5,
    date: "2025-03-08",
    text: "The Pro package is a game-changer. Fully animated overlays, custom alerts, the whole works. My stream looks like a top-tier production now. Worth every cent.",
    avatar: "🎯",
  },
  {
    id: "stream-2",
    serviceSlug: "streaming-overlay",
    author: "Mia Johnson",
    role: "YouTube Live Streamer",
    rating: 5,
    date: "2025-02-22",
    text: "Streamer package was perfect for my needs. Clean design, easy OBS setup guide included. Got so many compliments on my new overlay!",
    avatar: "✨",
  },

  // Discord Server
  {
    id: "discord-1",
    serviceSlug: "discord-server",
    author: "Chris Park",
    role: "Community Manager",
    rating: 5,
    date: "2025-03-14",
    text: "They set up our entire Discord server from scratch — channels, roles, bots, everything. Saved us weeks of work. The Premium package was clutch.",
    avatar: "🎮",
  },
  {
    id: "discord-2",
    serviceSlug: "discord-server",
    author: "Nina Patel",
    role: "Gaming Community Lead",
    rating: 4,
    date: "2025-03-01",
    text: "Great setup! Pro package worked perfectly for our 500+ member community. The ticket system bot is super useful. Would've loved a bit more customization but overall solid.",
    avatar: "👾",
  },

  // Copywriting
  {
    id: "copy-1",
    serviceSlug: "copywriting",
    author: "David Kim",
    role: "SaaS Founder",
    rating: 5,
    date: "2025-03-20",
    text: "Our landing page conversion rate doubled after the rewrite. The Pro package unlimited revisions meant we got it perfect. These guys know how to sell with words.",
    avatar: "💼",
  },
  {
    id: "copy-2",
    serviceSlug: "copywriting",
    author: "Olivia Martinez",
    role: "E-commerce Owner",
    rating: 5,
    date: "2025-03-10",
    text: "Best copywriting service I've used. They nailed our brand voice and the SEO keywords are already bringing in traffic. Growth package was perfect for our product pages.",
    avatar: "🛍️",
  },

  // AI Video Shorts
  {
    id: "video-1",
    serviceSlug: "ai-video-shorts",
    author: "Jake Thompson",
    role: "TikTok Creator",
    rating: 5,
    date: "2025-03-16",
    text: "Insane quality for the price. The 5-pack videos all went viral (50K+ views each). The AI visuals look professional and the captions are on point 👌",
    avatar: "🎬",
  },
  {
    id: "video-2",
    serviceSlug: "ai-video-shorts",
    author: "Lily Chang",
    role: "Instagram Influencer",
    rating: 5,
    date: "2025-03-05",
    text: "Monthly plan subscriber here — these videos save me SO much time. The team handles everything and the voiceover sounds natural. My engagement is way up!",
    avatar: "📱",
  },

  // SEO Audit
  {
    id: "seo-1",
    serviceSlug: "seo-audit",
    author: "Tom Bradley",
    role: "Agency Owner",
    rating: 5,
    date: "2025-03-12",
    text: "Full Audit + call was super valuable. They found issues we missed and the priority fix list made it easy to know what to tackle first. Traffic is up 40% since implementing.",
    avatar: "🔍",
  },
  {
    id: "seo-2",
    serviceSlug: "seo-audit",
    author: "Rachel Green",
    role: "E-commerce Manager",
    rating: 4,
    date: "2025-02-28",
    text: "Quick Scan was exactly what we needed — fast, actionable, no fluff. Fixed the top 5 issues and already seeing better rankings. Will upgrade to Full Audit next quarter.",
    avatar: "📊",
  },

  // Growth Strategy
  {
    id: "growth-1",
    serviceSlug: "growth-strategy",
    author: "Kevin Wu",
    role: "YouTube Creator (15K subs)",
    rating: 5,
    date: "2025-03-18",
    text: "Growth Sprint package is a cheat code. Weekly content ideas are spot-on and my subscriber growth went from 100/month to 500/month. Best investment I've made.",
    avatar: "📈",
  },
  {
    id: "growth-2",
    serviceSlug: "growth-strategy",
    author: "Sophie Turner",
    role: "Twitch Streamer",
    rating: 5,
    date: "2025-03-08",
    text: "Channel Audit was eye-opening — they showed me exactly what was holding me back. Implemented their recommendations and hit Affiliate in 3 weeks!",
    avatar: "🎯",
  },

  // Website Development
  {
    id: "web-1",
    serviceSlug: "website",
    author: "Michael Brown",
    role: "Small Business Owner",
    rating: 5,
    date: "2025-03-14",
    text: "They built our entire site from scratch in Next.js — fast, beautiful, and exactly what we wanted. The Business package was perfect for our needs. 10/10 would hire again.",
    avatar: "🌐",
  },
  {
    id: "web-2",
    serviceSlug: "website",
    author: "Amanda Foster",
    role: "Startup Founder",
    rating: 5,
    date: "2025-02-25",
    text: "Custom website exceeded expectations. Clean code, fast load times, and they handled hosting setup. The team was responsive and patient with our many revision requests 😅",
    avatar: "💻",
  },

  // Community Management
  {
    id: "community-1",
    serviceSlug: "community-management",
    author: "Brandon Lee",
    role: "Gaming Brand",
    rating: 5,
    date: "2025-03-10",
    text: "Pro package handles our Discord + Twitter + Reddit perfectly. Engagement is up, moderation is handled 24/7, and I can finally focus on content. Worth every dollar.",
    avatar: "👥",
  },
  {
    id: "community-2",
    serviceSlug: "community-management",
    author: "Jessica Taylor",
    role: "Influencer Manager",
    rating: 4,
    date: "2025-03-01",
    text: "Growth package works great for our Discord and Twitter. They match our brand voice perfectly and the monthly reports are super helpful. Slight delay in responses sometimes but overall excellent.",
    avatar: "💬",
  },
];

/**
 * Get reviews for a specific service
 */
export function getReviewsByService(slug: string): Review[] {
  return REVIEWS.filter((r) => r.serviceSlug === slug);
}

/**
 * Calculate average rating for a service
 */
export function getAverageRating(slug: string): number {
  const reviews = getReviewsByService(slug);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

/**
 * Get total review count for a service
 */
export function getReviewCount(slug: string): number {
  return getReviewsByService(slug).length;
}
