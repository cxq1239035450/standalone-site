import { notFound } from 'next/navigation'
import RichText from '@/components/RichText'
import source from '@/data/yueli.json'
import { getProducts, getYueli, imageURL, contentPath } from './data'
import { EquipmentGallery } from './Gallery'
import { safeHTML } from './html'
import { getSearchSettings, siteOrigin, jsonLd } from '@/utilities/searchSettings'
import { ProductTabs } from './ProductTabs'
import { ProductDescription } from './ProductDescription'
import './product-detail.css'
import { getLocale } from 'next-intl/server'
import { yueliLocalePath } from '@/i18n/yueliPaths'

export async function ReplicaProduct({ slug }: { slug: string }) {
  const locale = await getLocale()
  const [products, { site }, settings] = await Promise.all([
    getProducts(),
    getYueli(),
    getSearchSettings(locale),
  ])
  const product = products.find(
    (item) =>
      item.slug === slug ||
      decodeURIComponent(contentPath(item, 'product').split('/').filter(Boolean).pop() || '') ===
        slug,
  )
  if (!product) notFound()
  const original = source.products.find((item) => item.id === product.migration?.sourceId)
  const images =
    product.general?.gallery?.flatMap((row) =>
      imageURL(row.image)
        ? [
            {
              src: imageURL(row.image),
              alt: row.caption || product.title || product.slug || 'Yueli',
            },
          ]
        : [],
    ) || []
  if (!images.length && imageURL(product.general?.heroImage))
    images.push({
      src: imageURL(product.general?.heroImage),
      alt: product.title || product.slug || 'Yueli',
    })
  const category = product.organization?.category
  const origin = siteOrigin(settings.siteUrl)
  const description = (
    <ProductDescription
      locale={locale}
      html={product.migration?.contentHTML || ''}
      title={product.title || product.slug || 'Yueli'}
      summary={product.general?.shortDescription}
      category={
        typeof category === 'object' && category
          ? {
              title: category.title || category.slug || 'Yueli',
              href: contentPath(category, 'category'),
            }
          : undefined
      }
      fallback={
        product.general?.description ? (
          <RichText data={product.general.description} enableGutter={false} />
        ) : undefined
      }
    />
  )
  return (
    <div className="yl-replica-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            '@context': 'https://schema.org',
            '@type': 'Product',
            '@id': `${origin}${contentPath(product, 'product')}#product`,
            name: product.title || product.slug || 'Yueli',
            description: product.general?.shortDescription || undefined,
            sku: product.pricing?.sku || undefined,
            image: images.map((image) => new URL(image.src, origin).href),
            brand: { '@type': 'Brand', name: site.name },
            manufacturer: { '@id': `${origin}/#organization` },
            url: origin + contentPath(product, 'product'),
          }),
        }}
      />
      <section className="yl-wrap yl-product-hero">
        <EquipmentGallery images={images} />
        <div className="yl-product-description">
          <h1>{product.title || product.slug || 'Yueli'}</h1>
          {locale === 'en' &&
          original?.shortHTML &&
          product.general?.shortDescription === original.summary ? (
            <div
              className="yl-original-short-description"
              dangerouslySetInnerHTML={{ __html: safeHTML(original.shortHTML) }}
            />
          ) : (
            <p className="yl-product-summary">{product.general?.shortDescription}</p>
          )}
          {typeof category === 'object' && category && (
            <p className="yl-product-category">
              Category:{' '}
              <a href={contentPath(category, 'category')}>
                {category.title || category.slug || 'Yueli'}
              </a>
            </p>
          )}
          <a
            href={yueliLocalePath(
              `/contact-us?product=${encodeURIComponent(product.title || product.slug || 'Yueli')}`,
              locale,
            )}
            className="yl-button yl-configuration-link"
          >
            Request Configuration
          </a>
        </div>
      </section>
      <section className="yl-wrap yl-product-content">
        <ProductTabs
          productID={product.id}
          productTitle={product.title || product.slug || 'Yueli'}
          description={description}
        />
      </section>
    </div>
  )
}
