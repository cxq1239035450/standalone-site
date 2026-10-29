/** English keeps the imported site's canonical URLs. Other languages are explicit. */
export function yueliLocalePath(path: string, locale: string, knownLocales: string[] = []) {
  if (!path.startsWith('/') || path.startsWith('//')) return path
  const match = /^([^?#]*)([?#].*)?$/.exec(path)!
  const segments = match[1].split('/')
  if (['en', 'zh', locale, ...knownLocales].includes(segments[1])) segments.splice(1, 1)
  const localPath = segments.join('/') || '/'
  return `${locale === 'en' ? '' : `/${locale}`}${localPath === '/' && locale !== 'en' ? '' : localPath}${match[2] || ''}`
}

export function pathLocale(path: string, registeredCodes: string[]) {
  const candidate = path.split('/')[1]
  // Never classify an English path such as /faq or /tag using the locale regex alone.
  return [...registeredCodes, 'en', 'zh'].includes(candidate) ? candidate : undefined
}
