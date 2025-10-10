/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,



  // enabling server side source maps
  /**
   *
   * @see https://nextjs.org/docs/messages/improper-devtool
   * NODE_OPTIONS='--inspect' next dev
   */
  webpack: (config, { isServer, dev }) => {
    if (isServer && !dev) {
      config.devtool = "source-map";
    }
    return config;
  },
};

export default nextConfig;
