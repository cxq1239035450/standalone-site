import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  return [
    internetExplorerRedirect,
    ...[
      '/wp-sitemap.xml',
      '/wp-sitemap-posts-post-1.xml',
      '/wp-sitemap-posts-page-1.xml',
      '/wp-sitemap-posts-product-1.xml',
      '/wp-sitemap-taxonomies-category-1.xml',
      '/wp-sitemap-taxonomies-post_tag-1.xml',
      '/wp-sitemap-taxonomies-product_cat-1.xml',
    ].map((source) => ({ source, destination: '/sitemap.xml', permanent: true })),
    { source: '/home', destination: '/', permanent: true },
    { source: '/equipment', destination: '/products', permanent: true },
    { source: '/:locale(en|zh)/home', destination: '/', permanent: true },
    { source: '/posts/:path*', destination: '/blog/:path*', permanent: true },
    { source: '/:locale(en|zh)/posts/:path*', destination: '/blog/:path*', permanent: true },
    { source: '/contact', destination: '/contact-us', permanent: true },
    { source: '/:locale(en|zh)/contact', destination: '/contact-us', permanent: true },
    { source: '/products/:slug', destination: '/product/:slug', permanent: true },
    { source: '/:locale(en|zh)/products/:slug', destination: '/product/:slug', permanent: true },
  ]
}
