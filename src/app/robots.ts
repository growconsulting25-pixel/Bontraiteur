import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { isIndexable } from "@/lib/seo";

/** Tant que SITE_INDEXABLE n'est pas « true », tout le site est fermé aux moteurs. */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/login", "/en/login", "/portail", "/en/portal", "/admin", "/api/", "/auth/"] },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
