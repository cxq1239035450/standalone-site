import { getTranslations } from 'next-intl/server'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { Link } from '@/i18n/navigation'
import React from 'react'
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()
  const navItems = footerData?.navItems || []
  const t = await getTranslations('footer')
  const tNav = await getTranslations('navigation')

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🥬</span>
                </div>
                <span className="text-xl font-bold">{t('company.name')}</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-4">{t('company.description')}</p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('products')}</h3>
            <ul className="space-y-3">
              {t.raw('productLinks').map((item: string, index: number) => (
                <li key={item}>
                  <Link
                    href={['/products', '/solutions', '/contact', '/posts'][index] || '/'}
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('support')}</h3>
            <ul className="space-y-3">
              {t.raw('supportLinks').map((item: string) => (
                <li key={item}>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t('contact')}</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                {t('phone')}：{t('phoneValue')}
              </li>
              <li>
                {t('email')}：{t('emailValue')}
              </li>
              <li>
                {t('address')}：{t('addressValue')}
              </li>
              <li>
                {t('workTime')}：{t('workTimeValue')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">{t('copyright')}</p>
          <nav className="flex gap-6 text-sm">
            {navItems.map(({ link }, i) => (
              <Link
                key={i}
                href={link.url || '#'}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
