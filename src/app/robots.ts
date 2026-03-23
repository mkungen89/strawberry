import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/orders/"],
      },
    ],
    sitemap: "https://vexcraft.io/sitemap.xml",
  };
}
