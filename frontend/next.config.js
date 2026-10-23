/* eslint-disable @typescript-eslint/no-require-imports */
const envalid = require('envalid');

const authDependent = envalid.makeValidator((x) => {
  const authEnabled = process.env.HEALTH_AUTH === 'true';

  if (authEnabled && !x.length) {
    throw new Error(`Can't be empty if "HEALTH_AUTH" is true`);
  }

  return x;
});

envalid.cleanEnv(process.env, {
  NEXT_PUBLIC_API_URL: envalid.str(),
  HEALTH_AUTH: envalid.bool(),
  HEALTH_USERNAME: authDependent(),
  HEALTH_PASSWORD: authDependent(),
});

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// The Docker build sets NEXT_OUTPUT=standalone; local builds keep the default output.
const shouldUseStandaloneOutput = process.env.NEXT_OUTPUT === 'standalone';

module.exports = withBundleAnalyzer({
  output: shouldUseStandaloneOutput ? 'standalone' : undefined,
  images: {
    // The app does not use next/image, but the /_next/image endpoint is still served in production.
    // Two unpatched advisories on Next 16.2 target it (AVIF RCE GHSA-2xp9-vwfh-vxw4 and SSRF
    // GHSA-cjq9-62q9-8jv4; fixed in 16.3.3 and 16.3.8). Disabling optimization closes that endpoint.
    // Remove this line once the app can run Next >= 16.3.8.
    unoptimized: true,
    remotePatterns: process.env.DOMAIN_NAME ? [{ protocol: 'https', hostname: process.env.DOMAIN_NAME }] : [],
    formats: ['image/avif', 'image/webp'],
  },
  basePath: process.env.BASE_PATH,
  sassOptions: {
    prependData: `$basePath: '${process.env.BASE_PATH}';`,
  },
  transpilePackages: ['lucide-react'],
  experimental: {
    optimizePackageImports: ['@sk-web-gui/core', '@sk-web-gui/react'],
  },
  turbopack: {
    root: __dirname,
  },
  async rewrites() {
    return [{ source: '/napi/:path*', destination: '/api/:path*' }];
  },
});
