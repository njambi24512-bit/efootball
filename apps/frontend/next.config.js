const apiProxyTarget = process.env.API_PROXY_TARGET || 'http://127.0.0.1:4000';

module.exports = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`
      },
      {
        source: '/health',
        destination: `${apiProxyTarget}/health`
      },
      {
        source: '/socket.io/:path*',
        destination: `${apiProxyTarget}/socket.io/:path*`
      }
    ];
  }
};
