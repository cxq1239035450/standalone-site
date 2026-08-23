'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Menu, X, User } from 'lucide-react'
import { useTranslations } from 'next-intl'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { SearchIcon } from 'lucide-react'
import { Link } from '@/i18n/navigation'

export const HeaderClient: React.FC<{ data: HeaderType }> = ({ data }) => {
  const t = useTranslations('header')
  const tNav = useTranslations('navigation')
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  const navItems = data?.navItems || []

  // Default nav items if CMS data is empty
  const defaultNavItems = [
    { link: { url: '/', label: tNav('home') } },
    { link: { url: '/products', label: tNav('products') } },
    { link: { url: '/posts', label: tNav('articles') } },
    { link: { url: '/solutions', label: tNav('solutions') } },
    { link: { url: '/about', label: tNav('about') } },
    { link: { url: '/contact', label: tNav('contact') } },
  ]

  const displayNavItems = navItems.length > 0 ? navItems : defaultNavItems

  return (
    <header
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🥬</span>
            </div>
            <span className="hidden text-xl font-bold text-gray-900 sm:block">{t('brand')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {displayNavItems.map(({ link }, i) => (
              <Link
                key={i}
                href={link.url || '/'}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/search" className="rounded-lg p-2 transition-colors hover:bg-gray-100">
              <SearchIcon className="w-5 h-5 text-gray-600" />
              <span className="sr-only">{t('search')}</span>
            </Link>
            <LanguageSwitcher />
            <Link
              href="/login"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              <User className="w-4 h-4" />
              {t('login')}
            </Link>
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col gap-2">
              {displayNavItems.map(({ link }, i) => (
                <Link
                  key={i}
                  href={link.url || '/'}
                  className="px-4 py-2 text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-4 px-4">
                <Link
                  href="/login"
                  className="flex-1 items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/register"
                  className="flex-1 items-center justify-center gap-2 px-4 py-2 border border-green-600 text-green-600 hover:bg-green-50 font-medium rounded-lg transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
