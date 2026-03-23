import type { Metadata } from "next";

const BASE_URL = "https://vexcraft.io";
const SITE_NAME = "Vexcraft";

export function createMetadata(options: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = options.path ? `${BASE_URL}${options.path}` : BASE_URL;
  const fullTitle = options.title === "Home" 
    ? `${SITE_NAME} — Digital Services for Creators & Businesses`
    : `${options.title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description: options.description,
    openGraph: {
      title: fullTitle,
      description: options.description,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: options.description,
    },
    alternates: {
      canonical: url,
    },
    ...(options.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
