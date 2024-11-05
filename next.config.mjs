import "./src/env.js";

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

export default config;
