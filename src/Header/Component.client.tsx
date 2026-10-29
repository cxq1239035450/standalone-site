'use client'
import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, Search, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import type { NavigationLink } from '@/utilities/navigationLinks'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Link } from '@/i18n/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import styles from './navigation.module.css'

export const HeaderClient: React.FC<{ brand: string; customLinks: NavigationLink[] }> = ({
  brand,
  customLinks,
}) => {
  const t = useTranslations('header')
  const nav = useTranslations('navigation')
  const pathname = usePathname()
  const currentPath = pathname.replace(/^\/(zh|en)(?=\/|$)/, '') || '/'
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === pathname
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 768px)')
    const closeOnDesktop = () => {
      if (desktop.matches) setOpenAt(null)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])
  const links: NavigationLink[] = customLinks.length
    ? customLinks
    : [
        { href: '/products', title: nav('products') },
        { href: '/solutions', title: nav('solutions') },
        { href: '/posts', title: nav('articles') },
      ]
  return (
    <Dialog.Root open={open} onOpenChange={(value) => setOpenAt(value ? pathname : null)}>
      <header className="pet-header">
        <a className="pet-skip-link" href="#main-content">
          {t('skipToContent')}
        </a>
        <div className="pet-container pet-header-inner">
          <Link href="/" aria-label={brand} className="pet-logo" title={brand}>
            {brand}
            <span aria-hidden="true">.</span>
          </Link>
          <nav className="pet-desktop-nav" aria-label={nav('main')}>
            {links.map(({ href, title, newTab }) => (
              <Link
                key={href}
                href={href}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener noreferrer' : undefined}
                aria-current={
                  currentPath === href || (href !== '/' && currentPath.startsWith(`${href}/`))
                    ? 'page'
                    : undefined
                }
              >
                {title}
              </Link>
            ))}
          </nav>
          <div className="pet-header-actions">
            <Link
              className="pet-search-link"
              href="/search"
              aria-label={t('search')}
              title={t('search')}
            >
              <Search size={20} aria-hidden="true" />
            </Link>
            <LanguageSwitcher />
            <Link className="pet-button pet-header-quote" href="/contact">
              {t('quote')} <ArrowUpRight size={17} />
            </Link>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="pet-menu-toggle"
                aria-label={open ? t('closeMenu') : t('openMenu')}
                aria-expanded={open}
                aria-controls="mobile-navigation"
              >
                {open ? <X /> : <Menu />}
              </button>
            </Dialog.Trigger>
          </div>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay className={styles.overlay} />
          <Dialog.Content
            id="mobile-navigation"
            className={styles.panel}
            aria-describedby={undefined}
          >
            <div className={styles.heading}>
              <Dialog.Title className={styles.title}>{nav('main')}</Dialog.Title>
              <Dialog.Close className={styles.close} aria-label={t('closeMenu')}>
                <X size={22} aria-hidden="true" />
              </Dialog.Close>
            </div>
            <nav className={styles.links} aria-label={nav('main')}>
              {links.map(({ href, title, newTab }) => (
                <Link
                  key={href}
                  href={href}
                  target={newTab ? '_blank' : undefined}
                  rel={newTab ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpenAt(null)}
                  aria-current={
                    currentPath === href || (href !== '/' && currentPath.startsWith(`${href}/`))
                      ? 'page'
                      : undefined
                  }
                >
                  {title}
                </Link>
              ))}
              <Link href="/search" onClick={() => setOpenAt(null)}>
                {t('search')} <Search size={18} aria-hidden="true" />
              </Link>
              <Link href="/contact" onClick={() => setOpenAt(null)}>
                {t('quote')} <ArrowUpRight size={18} />
              </Link>
            </nav>
          </Dialog.Content>
        </Dialog.Portal>
      </header>
    </Dialog.Root>
  )
}
