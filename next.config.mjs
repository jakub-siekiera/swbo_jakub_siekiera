/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 to natywny moduł Node – nie bundlujemy go
  serverExternalPackages: ['better-sqlite3'],
  experimental: {
    // limit rozmiaru wgrywanych plików (Server Actions)
    serverActions: { bodySizeLimit: '5mb' },
  },
};

export default nextConfig;
