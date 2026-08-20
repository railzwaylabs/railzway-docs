import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Keep production builds isolated from an active local dev server.
  distDir: process.env.NODE_ENV === 'production' ? '.next-build' : '.next',
};

export default withMDX(config);
