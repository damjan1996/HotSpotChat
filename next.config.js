/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['supabase.co', 'localhost', 'mjdzrksckoexefncgaqs.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  // Disable static generation for dynamic routes to prevent build-time Supabase errors
  trailingSlash: false,
}

module.exports = nextConfig