import "@/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactCompiler: false,
	experimental: {
		optimizePackageImports: ["lucide-react"],
	},
	cacheComponents: true,
	partialPrefetching: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "image.tmdb.org",
			},
		],
	},
};

export default nextConfig;
