import sanitize from 'sanitize-html'
import { yueliLocalePath } from '@/i18n/yueliPaths'

/** CMS-authored imported HTML is untrusted. Never render scripts, event handlers or arbitrary embeds. */
export function safeHTML(html: string | null | undefined, locale = 'en'): string {
  return sanitize(html || '', {
    allowedTags: [
      'p',
      'div',
      'section',
      'article',
      'nav',
      'span',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'strong',
      'b',
      'em',
      'i',
      'ul',
      'ol',
      'li',
      'a',
      'img',
      'figure',
      'figcaption',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'br',
      'hr',
      'blockquote',
      'details',
      'summary',
      'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
      iframe: ['src', 'title', 'allowfullscreen', 'loading'],
      '*': ['id', 'class'],
      details: ['open'],
      nav: ['class', 'id', 'aria-label'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
    transformTags: {
      img: (tag, attributes) => ({ tagName: tag, attribs: { ...attributes, loading: 'lazy' } }),
      a: (tag, attributes) => {
        let href = attributes.href || ''
        try {
          const u = new URL(href)
          if (['yueliautomation.com', 'www.yueliautomation.com'].includes(u.hostname))
            href = u.pathname + u.search + u.hash
        } catch {
          /* Relative links remain relative. */
        }
        // Preserve file downloads and anchors; translate only public page links.
        if (
          locale !== 'en' &&
          !/^\/(?:api|media|uploads|wp-content)\//.test(href) &&
          !/\.[a-z0-9]{2,5}(?:[?#]|$)/i.test(href)
        )
          href = yueliLocalePath(href, locale)
        return { tagName: tag, attribs: { ...attributes, href } }
      },
    },
  })
}
export function plainText(html: string): string {
  return sanitize(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
