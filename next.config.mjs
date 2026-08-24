const nextConfig = {
  // Disable font optimizations that can cause issues in some deployment environments
  optimizeFonts: false,
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'pdf-to-printer'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
