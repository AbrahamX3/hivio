import { fileURLToPath } from "node:url";
import withPlaiceholder from "@plaiceholder/next";
import createJiti from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));
jiti("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        hostname: "image.tmdb.org",
      },
      {
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default withPlaiceholder(config);
// export default config;
