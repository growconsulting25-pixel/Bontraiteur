import type { MetadataRoute } from "next";
import { site } from "@/data/site";

const routes = ["", "/menu", "/nos-repas", "/garderies", "/comment-ca-fonctionne", "/a-propos", "/faq", "/contact", "/soumission"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: path === "/menu" ? "monthly" : "yearly",
    priority: path === "" ? 1 : path === "/menu" || path === "/soumission" ? 0.9 : 0.7,
  }));
}
