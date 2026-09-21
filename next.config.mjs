import { DevupUI } from '@devup-ui/next-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['tw72j8-3000.csb.app'],
};

export default DevupUI(nextConfig);
