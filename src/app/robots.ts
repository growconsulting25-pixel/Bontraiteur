import type { MetadataRoute } from "next";
import { site } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/login", "/en/login", "/portail", "/en/portal"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
