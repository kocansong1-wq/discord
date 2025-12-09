/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tối ưu compiler
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  
  // Tối ưu experimental features
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-avatar",
      "@radix-ui/react-scroll-area",
      "date-fns",
      "emoji-mart",
    ],
  },

  webpack: (config, { isServer }) => {
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });
    
    // Tối ưu bundle size
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
    // Cache images lâu hơn
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },
  logging: {
  fetches: {
    fullUrl: false,
  },
},

  // Tối ưu headers
  poweredByHeader: false,
};

module.exports = nextConfig;