/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      stream: false,
      crypto: false,
    };
    
    // 标记某些包为外部依赖以避免客户端打包
    if (isServer) {
      config.externals.push('mammoth', 'pdf-parse');
    }
    
    return config;
  },
  experimental: {
    esmExternals: 'loose',
  },
}

module.exports = nextConfig
