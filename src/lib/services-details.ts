export interface ServiceDetails {
  longDescription: string;
  highlights: { title: string; description: string; icon: string }[];
  process: { step: string; description: string }[];
  deliveryTime: string;
  revisions: string;
  faq: { question: string; answer: string }[];
}

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  "discord-server": {
    longDescription:
      "Whether you're building a gaming community, a brand hub, or a private space for your team — we design and set up your Discord server from scratch. Every channel, role, permission, and bot is configured to work perfectly together. You get a professional server that's ready to grow.",
    highlights: [
      {
        title: "Custom Channel Architecture",
        description: "We design a logical channel structure tailored to your community's needs — from welcome lobbies to private staff areas.",
        icon: "📁",
      },
      {
        title: "Bot Integration",
        description: "Moderation bots, music bots, welcome bots, ticket systems — we install, configure, and test everything.",
        icon: "🤖",
      },
      {
        title: "Branding & Design",
        description: "Custom server icon, banner, role colors, and emoji that match your brand identity.",
        icon: "🎨",
      },
      {
        title: "Security & Moderation",
        description: "Anti-spam filters, verification systems, and moderation tools to keep your community safe.",
        icon: "🛡️",
      },
    ],
    process: [
      { step: "Discovery", description: "You tell us about your community, audience, and goals." },
      { step: "Design", description: "We create the channel structure, roles, and branding." },
      { step: "Build", description: "We set up everything — channels, bots, permissions, embeds." },
      { step: "Review", description: "You test the server and request any changes." },
      { step: "Launch", description: "Your server is ready to go live!" },
    ],
    deliveryTime: "1–3 business days",
    revisions: "2–5 depending on package",
    faq: [
      { question: "Do I need to provide a Discord account?", answer: "Yes, you'll need a Discord account. We'll need temporary admin access to your server (or we create a new one and transfer ownership to you)." },
      { question: "Can you add custom bots?", answer: "Yes! Our Pro and Premium packages include custom bot configuration. Premium includes fully custom bot development tailored to your needs." },
      { question: "What if my community grows?", answer: "All our setups are designed to scale. We structure roles and channels so you can easily add more as your community grows." },
    ],
  },

  "youtube-banner": {
    longDescription:
      "Your YouTube channel art is the first thing visitors see. We create professional, eye-catching banners, avatars, and thumbnail templates that reflect your brand and attract subscribers. Every design is delivered in all required formats and resolutions.",
    highlights: [
      {
        title: "Brand-Matched Design",
        description: "Colors, fonts, and style that match your existing brand or create a new one from scratch.",
        icon: "🎨",
      },
      {
        title: "All Formats Included",
        description: "Desktop, mobile, and TV-safe banner zones. Avatar in all required sizes. Ready to upload.",
        icon: "📐",
      },
      {
        title: "Thumbnail Templates",
        description: "Reusable thumbnail templates (Complete package) so every video looks consistent and professional.",
        icon: "🖼️",
      },
      {
        title: "Source Files",
        description: "Complete package includes editable source files (PSD/Figma) so you can make future tweaks yourself.",
        icon: "📂",
      },
    ],
    process: [
      { step: "Brief", description: "Share your channel name, niche, colors, and style preferences." },
      { step: "Concept", description: "We create 1-2 initial concepts based on your brief." },
      { step: "Refine", description: "You pick your favorite and we refine it to perfection." },
      { step: "Deliver", description: "All files exported in correct formats, ready to upload." },
    ],
    deliveryTime: "2–4 business days",
    revisions: "2–5 depending on package",
    faq: [
      { question: "What do I need to provide?", answer: "Your channel name, any existing branding (logo, colors), and a description of the style you want. Reference images help a lot!" },
      { question: "Can you design a logo too?", answer: "Our avatar design serves as a channel logo. For a full brand identity package, contact us for a custom quote." },
      { question: "What file formats do I get?", answer: "PNG for all assets. Complete package also includes editable source files (PSD or Figma)." },
    ],
  },

  "streaming-overlay": {
    longDescription:
      "Stand out on Twitch, YouTube, or TikTok with a fully custom streaming overlay package. We design everything from webcam frames and scene transitions to animated alerts and info panels — all matching your brand and ready for OBS or Streamlabs.",
    highlights: [
      {
        title: "Full Scene Package",
        description: "Starting soon, BRB, ending, gameplay, and just chatting scenes — all designed to match.",
        icon: "🖥️",
      },
      {
        title: "Animated Alerts",
        description: "Follow, subscribe, donation, and raid alerts with smooth animations that pop on screen.",
        icon: "🔔",
      },
      {
        title: "Stream Panels",
        description: "About, schedule, rules, specs, donations — matching panels for your channel page.",
        icon: "📋",
      },
      {
        title: "OBS/Streamlabs Ready",
        description: "Every file is exported and tested to work perfectly as browser sources in OBS or Streamlabs.",
        icon: "⚙️",
      },
    ],
    process: [
      { step: "Style Brief", description: "Tell us your stream theme, colors, personality, and any references." },
      { step: "Concept", description: "We create a visual concept for your overlay package." },
      { step: "Design", description: "Full design of all scenes, alerts, and panels." },
      { step: "Animate", description: "Transitions and alerts are animated and tested." },
      { step: "Deliver", description: "All files exported, with an installation guide for OBS/Streamlabs." },
    ],
    deliveryTime: "3–7 business days",
    revisions: "2–unlimited depending on package",
    faq: [
      { question: "Which streaming software is supported?", answer: "All overlays work with OBS Studio, Streamlabs, and StreamElements. We can also provide formats for any software that supports browser sources." },
      { question: "Can I request animated overlays?", answer: "Yes! Streamer and Pro packages include animated elements. We use After Effects and CSS animations for smooth, lightweight results." },
      { question: "Do you provide an installation guide?", answer: "Absolutely. Every delivery includes a step-by-step guide showing how to add each element to your streaming software." },
    ],
  },

  "website": {
    longDescription:
      "We build custom websites from the ground up — no templates, no page builders, just clean code tailored to your needs. Whether it's a simple landing page, a business site with a CMS, or a full-stack web application with auth and payments, we handle everything from design to deployment.",
    highlights: [
      {
        title: "Custom Code, No Templates",
        description: "Every website is built from scratch with modern frameworks. No WordPress themes, no drag-and-drop builders — real code that performs.",
        icon: "💻",
      },
      {
        title: "Mobile-First & Responsive",
        description: "Your site looks and works perfectly on every device — phone, tablet, and desktop.",
        icon: "📱",
      },
      {
        title: "SEO Optimized",
        description: "Built-in SEO best practices including meta tags, sitemap, structured data, and fast load times.",
        icon: "🔍",
      },
      {
        title: "Your Choice of Stack",
        description: "Next.js, React, Vue, SvelteKit — you choose (or we recommend) the tech stack that fits your project.",
        icon: "⚡",
      },
      {
        title: "Hosting & Deployment",
        description: "We deploy to Vercel, Railway, DigitalOcean, or your preferred host. Domain setup and SSL included.",
        icon: "🚀",
      },
      {
        title: "Ongoing Support",
        description: "30 days of free support post-launch (6 months for Custom package). We're here if anything breaks.",
        icon: "🛟",
      },
    ],
    process: [
      { step: "Requirements", description: "We discuss your goals, audience, features, and design preferences." },
      { step: "Tech Stack", description: "We recommend (or you choose) the best framework, database, and hosting." },
      { step: "Design", description: "UI/UX design and wireframes for your approval before any code is written." },
      { step: "Development", description: "We build your site with clean, maintainable code and regular progress updates." },
      { step: "Testing", description: "Cross-browser, mobile, and performance testing to ensure everything works." },
      { step: "Launch", description: "Deployment, domain setup, SSL, and final handover with documentation." },
    ],
    deliveryTime: "1–4 weeks depending on complexity",
    revisions: "2–unlimited depending on package",
    faq: [
      { question: "Do I need to know coding?", answer: "Not at all. You tell us what you want in plain language — we handle all the technical work. Our AI recommendation tool even helps you pick the right tech stack." },
      { question: "Will I own the source code?", answer: "Yes. Upon final payment, full ownership transfers to you. You get access to the complete codebase in a GitHub repository." },
      { question: "Can I update the site myself after launch?", answer: "If your package includes a CMS (Business and Custom), you can update content through an easy admin panel. Otherwise, we offer maintenance retainers." },
      { question: "What about hosting costs?", answer: "Hosting is separate from our build fee. Many of our recommended hosts (Vercel, Netlify) offer generous free tiers. We'll help you choose the most cost-effective option." },
    ],
  },

  "mobile-app": {
    longDescription:
      "From concept to App Store — we build native and cross-platform mobile apps for Android and iOS. Whether you need an MVP to validate your idea, a full-featured app for your business, or an enterprise solution with backend infrastructure, we deliver polished, production-ready applications.",
    highlights: [
      {
        title: "Cross-Platform or Native",
        description: "React Native, Flutter, or native Swift/Kotlin — we choose the approach that fits your budget and requirements.",
        icon: "📱",
      },
      {
        title: "UI/UX Design Included",
        description: "Every app comes with custom-designed screens following iOS and Android design guidelines.",
        icon: "🎨",
      },
      {
        title: "Backend & API",
        description: "Standard and Enterprise packages include a complete backend with database, authentication, and API.",
        icon: "🔧",
      },
      {
        title: "Push Notifications",
        description: "Keep your users engaged with push notifications on both platforms.",
        icon: "🔔",
      },
      {
        title: "App Store Publishing",
        description: "Enterprise package includes full submission to Apple App Store and Google Play — screenshots, descriptions, and all.",
        icon: "🏪",
      },
      {
        title: "6 Months Support",
        description: "Enterprise includes 6 months of post-launch support for bug fixes, updates, and minor feature additions.",
        icon: "🛟",
      },
    ],
    process: [
      { step: "Discovery", description: "We map out your app's features, user flows, and technical requirements." },
      { step: "Design", description: "Wireframes and UI design for every screen, reviewed and approved by you." },
      { step: "Development", description: "Iterative development with milestone demos so you see progress." },
      { step: "Testing", description: "Thorough testing on real devices — both Android and iOS." },
      { step: "Beta", description: "TestFlight/internal testing with your team before public launch." },
      { step: "Launch", description: "App Store submission, optimization, and go-live." },
    ],
    deliveryTime: "2–8 weeks depending on complexity",
    revisions: "Included throughout development",
    faq: [
      { question: "Which platforms will my app work on?", answer: "MVP is one platform (your choice). Standard and Enterprise are both Android and iOS." },
      { question: "Do I need a developer account?", answer: "Yes — you'll need an Apple Developer account ($99/year) and/or a Google Play Developer account ($25 one-time) for publishing. We guide you through the setup." },
      { question: "Can you add features later?", answer: "Absolutely. We can scope and quote additional features at any time. Enterprise clients get 6 months of support included." },
      { question: "What about app updates and maintenance?", answer: "We offer ongoing maintenance retainers. OS updates sometimes require app updates — we keep your app running smoothly." },
    ],
  },

  "streaming-icons": {
    longDescription:
      "Level up your Twitch, YouTube, or Discord presence with custom emotes, sub-badges, and channel point icons. Every piece is hand-designed to match your brand and delivered in all required sizes and formats — ready to upload immediately.",
    highlights: [
      {
        title: "Hand-Drawn Emotes",
        description: "Unique, expressive emotes designed specifically for your personality and community.",
        icon: "😎",
      },
      {
        title: "Sub Badges",
        description: "Tiered subscriber badges that reward loyalty and look great next to usernames.",
        icon: "🏅",
      },
      {
        title: "Channel Point Icons",
        description: "Custom icons for your Twitch channel point rewards.",
        icon: "💎",
      },
      {
        title: "All Sizes Included",
        description: "Every emote and badge exported in 28x28, 56x56, and 112x112 — ready for Twitch, YouTube, and Discord.",
        icon: "📐",
      },
    ],
    process: [
      { step: "Brief", description: "Tell us your emote ideas, reactions, inside jokes, and style preferences." },
      { step: "Sketch", description: "We create rough sketches of each emote for your approval." },
      { step: "Design", description: "Approved sketches are turned into polished, full-color emotes." },
      { step: "Export", description: "All assets exported in every required size and format, ready to upload." },
    ],
    deliveryTime: "2–5 business days",
    revisions: "2–unlimited depending on package",
    faq: [
      { question: "Can I request specific emote ideas?", answer: "Absolutely! Most clients give us a list of reactions/emotions they want (e.g., hype, sad, love, rage). We bring them to life." },
      { question: "Are they transparent background?", answer: "Yes, all emotes and badges are delivered with transparent backgrounds in PNG format." },
      { question: "Can I use them on Discord too?", answer: "Yes! We export in sizes compatible with Twitch, YouTube, AND Discord." },
    ],
  },
};
