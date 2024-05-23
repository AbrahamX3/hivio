import { type MetadataRoute } from "next";

import { env } from "@/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: env.NEXT_PUBLIC_BASE_URL,
      lastModified: new Date(),
    },
  ];
}
