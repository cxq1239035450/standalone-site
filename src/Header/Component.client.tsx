'use client'
import React, { useRef, useState } from 'react'
import { ArrowUpRight, Menu, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import type { NavigationLink } from '@/utilities/navigationLinks'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Link } from '@/i18n/navigation'

export const HeaderClient: React.FC<{ brand: string; customLinks: NavigationLink[] }> = ({ brand, customLinks }) => {
  const t = useTranslations('header')
  const nav = useTranslations('navigation')
  const pathname = usePathname()
  const currentPath = pathname.replace(/^\/(zh|en)(?=\/|$)/, '') || '/'
  const [openAt, setOpenAt] = useState<string | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const open = openAt === pathname
  const links: NavigationLink[] = customLinks.length ? customLinks : [
    { href: '/products', title: nav('products') },
    { href: '/solutions', title: nav('solutions') },
    { href: '/posts', title: nav('articles') },
  ]
  return (
    <header className="pet-header" onKeyDown={(event) => {
      if (event.key === 'Escape' && open) { setOpenAt(null); toggleRef.current?.focus() }
    }}>
      <a className="pet-skip-link" href="#main-content">{t('skipToContent')}</a>
      <div className="pet-container pet-header-inner">
        <Link href="/" aria-label={brand} className="pet-logo" title={brand}>
          {brand}<span aria-hidden="true">.</span>
        </Link>
        <nav className="pet-desktop-nav" aria-label={nav('main')}>
          {links.map(({ href, title, newTab }) => (
            <Link
              key={href}
              href={href}
              target={newTab ? '_blank' : undefined}
              rel={newTab ? 'noopener noreferrer' : undefined}
              aria-current={currentPath === href || (href !== '/' && currentPath.startsWith(`${href}/`)) ? 'page' : undefined}
            >
              {title}
            </Link>
          ))}
        </nav>
        <div className="pet-header-actions">
          <Link className="pet-search-link" href="/search" aria-label={t('search')} title={t('search')}><Search size={20} aria-hidden="true" /></Link>
          <LanguageSwitcher />
          <Link className="pet-button pet-header-quote" href="/contact">
            {t('quote')} <ArrowUpRight size={17} />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="pet-menu-toggle"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpenAt(open ? null : pathname)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="pet-mobile-nav" aria-label={nav('main')}>
          {links.map(({ href, title, newTab }) => (
            <Link key={href} href={href} target={newTab ? '_blank' : undefined} rel={newTab ? 'noopener noreferrer' : undefined} onClick={() => setOpenAt(null)}>
              {title}
            </Link>
          ))}
          <Link href="/search" onClick={() => setOpenAt(null)}>{t('search')} <Search size={18} aria-hidden="true" /></Link>
          <Link href="/contact" onClick={() => setOpenAt(null)}>
            {t('quote')} <ArrowUpRight size={18} />
          </Link>
        </nav>
      )}
    </header>
  )
}
