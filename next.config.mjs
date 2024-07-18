/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.reclaimprotocol.org/:path*",
      },
    ];
  },
};

export default nextConfig;
