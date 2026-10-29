import { ArrowUpRight, Check } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { getSearchSettings } from '@/utilities/searchSettings'
import { isLocale, defaultLocale } from '@/i18n/config'
import configPromise from '@payload-config'
import { getPayload } from '@/i18n/content'
import { B2BInquiryForm } from '@/components/B2BInquiryForm'
import { contactForm as contactFormData } from '@/endpoints/seed/contact-form'
import { Link } from '@/i18n/navigation'
interface ContactPageContentProps {
  formID?: number | string
  initialCategory?: string
  initialProduct?: string
  initialProductSlug?: string
  sourceArticle?: string
}
export async function ContactPageContent({
  formID,
  initialCategory,
  initialProduct,
  initialProductSlug,
  sourceArticle,
}: ContactPageContentProps) {
  const t = await getTranslations('contact')
  const locale = await getLocale()
  const settings = await getSearchSettings(isLocale(locale) ? locale : defaultLocale)
  const payload = await getPayload({ config: configPromise })
  let resolvedFormID = formID
  if (!resolvedFormID) {
    const existing = await payload.find({
      collection: 'forms',
      locale,
      depth: 0,
      limit: 1,
      overrideAccess: false,
      where: { 'shared.title': { equals: contactFormData.title } },
    })
    resolvedFormID = existing.docs[0]?.id
  }
  const businessTypeOptions = [
    'pet-store',
    'ecommerce',
    'brand',
    'distributor',
    'grooming',
    'other',
  ].map((value) => ({ value, label: t('form.businessTypeOptions.' + value) }))
  const productCategoryOptions = ['walking', 'feeding', 'bedding', 'toys', 'multiple'].map(
    (value) => ({ value, label: t('form.productCategoryOptions.' + value) }),
  )
  const monthlyVolumeOptions = ['under-100', '100-500', '500-2000', 'over-2000', 'not-sure'].map(
    (value) => ({
      value,
      label: t('form.monthlyVolumeOptions.' + value),
    }),
  )
  return (
    <main className="pet-site pet-contact">
      <div className="pet-container pet-contact-grid">
        <div className="pet-contact-intro">
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.description')}</p>
          {(settings.organization?.email || settings.organization?.telephone) && (
            <address className="mt-7 flex flex-col gap-3 text-sm not-italic">
              {settings.organization.email && (
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${settings.organization.email}`}
                >
                  {settings.organization.email}
                </a>
              )}
              {settings.organization.telephone && (
                <a
                  className="underline underline-offset-4"
                  href={`tel:${settings.organization.telephone.replace(/[^+\d]/g, '')}`}
                >
                  {settings.organization.telephone}
                </a>
              )}
            </address>
          )}
          <div className="pet-contact-next">
            <h2>{t('sidebar.promiseTitle')}</h2>
            <ul>
              {[1, 2, 3].map((i) => (
                <li key={i}>
                  <Check size={18} />
                  <span>{t('sidebar.promise' + i)}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link href="/#faq" className="pet-text-link">
            {t('process.eyebrow')} <ArrowUpRight size={18} />
          </Link>
        </div>
        <section className="pet-contact-form">
          <h2>{t('form.title')}</h2>
          <p>{t('form.subtitle')}</p>
          {resolvedFormID ? (
            <B2BInquiryForm
              key={
                [initialCategory, initialProduct, initialProductSlug, sourceArticle].join(':') ||
                'inquiry'
              }
              initialCategory={initialCategory}
              initialRequirements={
                [
                  initialProduct
                    ? `${t('form.productContext')}: ${initialProduct}${initialProductSlug ? ` (${initialProductSlug})` : ''}`
                    : '',
                  sourceArticle ? `${t('form.articleContext')}: ${sourceArticle}` : '',
                ]
                  .filter(Boolean)
                  .join('\n') || undefined
              }
              formID={resolvedFormID}
              labels={{
                fields: {
                  companyName: t('form.fields.companyName'),
                  contactName: t('form.fields.contactName'),
                  email: t('form.fields.email'),
                  phone: t('form.fields.phone'),
                  businessType: t('form.fields.businessType'),
                  productCategory: t('form.fields.productCategory'),
                  monthlyVolume: t('form.fields.monthlyVolume'),
                  deliveryCity: t('form.fields.deliveryCity'),
                  requirements: t('form.fields.requirements'),
                },
                businessTypeOptions,
                productCategoryOptions,
                monthlyVolumeOptions,
                placeholders: {
                  select: t('form.placeholders.select'),
                },
                submit: t('form.submit'),
                submitting: t('form.submitting'),
                success: {
                  backToProducts: t('form.success.backToProducts'),
                  title: t('form.success.title'),
                  message: t('form.success.message'),
                },
                error: t('form.error'),
                privacy: t('form.privacy'),
                validation: {
                  required: t('form.validation.required'),
                  email: t('form.validation.email'),
                },
              }}
            />
          ) : (
            <p role="status">{t('form.formNotConfigured')}</p>
          )}
        </section>
      </div>
    </main>
  )
}
