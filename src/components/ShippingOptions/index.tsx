import { ArrowUpRight, MapPin, Route, PackageCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import styles from './index.module.css'

export async function ShippingOptions() {
  const t = await getTranslations('shipping')
  const items = t.raw('items') as Array<{ title: string; description: string }>
  const icons = [MapPin, Route, PackageCheck]
  return (
    <section id="shipping" className={`pet-container pet-section ${styles.section}`}>
      <div className="pet-section-heading">
        <div>
          <h2>{t('title')}</h2>
          <p>{t('description')}</p>
        </div>
        <Link href="/contact" className="pet-text-link">
          {t('action')} <ArrowUpRight size={19} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.grid}>
        {items.map((item, index) => {
          const Icon = icons[index]
          return (
            <article key={item.title}>
              <Icon size={25} strokeWidth={1.5} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          )
        })}
      </div>
      <div className={styles.note}>
        <strong>{t('portsTitle')}</strong>
        <ul className={styles.ports}>
          {(t.raw('ports') as string[]).map((port) => (
            <li key={port}>
              <MapPin size={18} aria-hidden="true" />
              {port}
            </li>
          ))}
        </ul>
        <p>{t('portsDescription')}</p>
      </div>
    </section>
  )
}
