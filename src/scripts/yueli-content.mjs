import { JSDOM } from 'jsdom'
import sanitize from 'sanitize-html'
import postcss from 'postcss'

/** Keep source layout hooks while excluding executable markup and arbitrary inline CSS. */
export function sanitizeMigratedHTML(
  html,
  mapURL = (value) => value || '',
  { product = false } = {},
) {
  const fragment = JSDOM.fragment(
    (html || '')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''),
  )
  fragment
    .querySelectorAll(
      `header,footer,form,button,input,textarea,select,link,meta,svg${product ? '' : ',nav'}`,
    )
    .forEach((element) => element.remove())
  return sanitize(
    [...fragment.childNodes].map((node) => node.outerHTML || node.textContent || '').join(''),
    {
      allowedTags: [
        'p',
        'div',
        'section',
        'article',
        'span',
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
        ...(product ? ['nav'] : []),
      ],
      allowedAttributes: {
        a: ['href', 'title'],
        img: ['src', 'alt', 'width', 'height', 'loading'],
        th: ['colspan', 'rowspan', 'scope'],
        td: ['colspan', 'rowspan'],
        iframe: ['src', 'title', 'allowfullscreen', 'loading'],
        details: ['open'],
        nav: ['aria-label'],
        '*': ['id', 'class'],
      },
      allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com'],
      allowedSchemes: ['http', 'https', 'mailto', 'tel'],
      transformTags: {
        a: (tagName, attributes) => ({
          tagName,
          attribs: { ...attributes, href: mapURL(attributes.href) },
        }),
        img: (tagName, attributes) => ({
          tagName,
          attribs: { ...attributes, src: mapURL(attributes.src), loading: 'lazy' },
        }),
      },
    },
  )
}

/** Extract reviewed source product CSS; every retained selector is contained by the product body. */
export function extractProductCSS(products) {
  const styles = new Set()
  for (const product of products) {
    for (const match of (product.description || '').matchAll(
      /<style\b[^>]*>([\s\S]*?)<\/style>/gi,
    )) {
      styles.add(
        match[1]
          .replace(/<\/?p\b[^>]*>|<br\s*\/?>/gi, '')
          .replaceAll('&gt;', '>')
          .replaceAll('&lt;', '<')
          .replaceAll('&amp;', '&')
          .trim(),
      )
    }
  }
  const root = postcss.root()
  for (const css of styles) {
    const parsed = postcss.parse(css)
    parsed.walkAtRules((rule) => {
      if (!['media', 'supports'].includes(rule.name.toLowerCase())) rule.remove()
    })
    parsed.walkRules((rule) => {
      const selectors = rule.selectors.filter((selector) =>
        /^\.(?:ta12-detail\b|yueli-(?:summary|detail|spec|app|check|cta)|yl-(?:catalog|spec|model|unit|custom))/.test(
          selector,
        ),
      )
      if (!selectors.length) rule.remove()
      else
        rule.selectors = selectors.map((selector) =>
          selector.startsWith('.yueli-summary')
            ? `.yl-product-description ${selector}`
            : `.yl-product-content .yl-source-content ${selector}`,
        )
    })
    parsed.walkDecls((declaration) => {
      if (/expression\s*\(|javascript\s*:|url\s*\(/i.test(declaration.value)) declaration.remove()
    })
    root.append(parsed.nodes)
  }
  return `/* Source product description styles, isolated from site navigation and other pages. */\n${root.toString()}\n`
}
