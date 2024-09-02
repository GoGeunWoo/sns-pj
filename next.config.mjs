/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["flowbite-react"],
  images: {
    domains: [
      "avatars.githubusercontent.com",
      "wallpaperaccess.com",
      "firebasestorage.googleapis.com",
      "via.placeholder.com",
    ], // 도메인 추가
  },
};

export default nextConfig;
