const legacyHosts = [
  "electrobeaty.vercel.app",
  "electrobeaty-portfolio.vercel.app",
];

const nextConfig = {
  async redirects() {
    return legacyHosts.map((host) => ({
      source: "/:path*",
      has: [{ type: "host", value: host }],
      destination: "https://www.electrobeaty.com/:path*",
      permanent: true,
    }));
  },
};

export default nextConfig;
