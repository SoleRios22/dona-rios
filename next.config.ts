import type { NextConfig } from "next";

const noIndexHeaders = [
  {
    key: "X-Robots-Tag",
    value: "noindex, nofollow, noarchive",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/checkout/:path*",
        headers: noIndexHeaders,
      },
      {
        source: "/carrito",
        headers: noIndexHeaders,
      },
      {
        source: "/favoritos",
        headers: noIndexHeaders,
      },
      {
        source: "/pedidos",
        headers: noIndexHeaders,
      },
      {
        source: "/login",
        headers: noIndexHeaders,
      },
    ];
  },
};

export default nextConfig;