import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // node-ical is Node-only — bundling it breaks (BigInt/rrule internals), so
  // load it from node_modules at runtime instead. sharp is native: keep it
  // external too.
  serverExternalPackages: ["node-ical", "sharp"],
  // The Turbopack build copies sharp's .node binary into the lambda but not
  // the libvips shared library it links against (@img/sharp-libvips-linux-x64),
  // so every request on Vercel failed with "libvips-cpp.so... cannot open
  // shared object file". Native linking is invisible to file tracing; list
  // the Linux packages explicitly.
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/@img/sharp-linux-x64/**",
      "./node_modules/@img/sharp-libvips-linux-x64/**",
    ],
  },
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
