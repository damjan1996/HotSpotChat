/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['supabase.co', 'localhost', 'mjdzrksckoexefncgaqs.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig