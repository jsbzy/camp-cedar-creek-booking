import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // node-ical is Node-only — bundling it breaks (BigInt/rrule internals), so
  // load it from node_modules at runtime instead.
  serverExternalPackages: ["node-ical"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "hipcamp-res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
      },
    ],
  },
};

export default withPayload(nextConfig);
