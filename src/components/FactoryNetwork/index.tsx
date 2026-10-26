import { ArrowUpRight, Factory, MessagesSquare, ClipboardCheck } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { companyProfile } from '@/content/company'
import styles from './index.module.css'

export async function FactoryNetwork() {
  const t = await getTranslations('factoryNetwork')
  const locale = (await getLocale()) === 'en' ? 'en' : 'zh'
  const items = t.raw('items') as Array<{ title: string; description: string }>
  const icons = [Factory, MessagesSquare, ClipboardCheck]
  return (
    <section
      className={`pet-container pet-section ${styles.section}`}
      aria-labelledby="factory-network-title"
    >
      <div className={styles.panel}>
        <div className={styles.intro}>
          <span className={styles.eyebrow}>{t('eyebrow')}</span>
          <h2 id="factory-network-title">{t('title')}</h2>
          <p>{companyProfile[locale].summary}</p>
          <Link className="pet-text-link" href="/contact">
            {t('action')} <ArrowUpRight size={19} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.facts}>
          <div className={styles.stat}>
            <strong>{t('count')}</strong>
            <span>{t('stat')}</span>
          </div>
          <p>{t('note')}</p>
        </div>
        <div className={styles.items}>
          {items.map((item, index) => {
            const Icon = icons[index]
            return (
              <article key={item.title}>
                <Icon size={23} strokeWidth={1.5} aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
