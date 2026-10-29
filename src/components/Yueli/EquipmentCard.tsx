import Image from 'next/image'
import type { Product } from '@/payload-types'
import { imageURL, contentPath } from './data'
import { plainText } from './html'

export function EquipmentCard({ product }: { product: Product }) {
  const image = product.general?.heroImage
  return (
    <article className="yl-equipment-card">
      <a
        href={contentPath(product, 'product')}
        className="yl-equipment-photo"
        tabIndex={-1}
        aria-hidden="true"
      >
        {imageURL(image) ? (
          <Image
            src={imageURL(image)}
            alt=""
            fill
            sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 26vw"
          />
        ) : (
          <span>Image being updated</span>
        )}
      </a>
      <div className="yl-equipment-card-body">
        {product.pricing?.sku && <p className="yl-model">{product.pricing.sku}</p>}
        <h3>
          <a href={contentPath(product, 'product')}>{product.title}</a>
        </h3>
        {product.general?.shortDescription && <p>{plainText(product.general.shortDescription)}</p>}
        <a className="yl-text-link" href={contentPath(product, 'product')}>
          View equipment <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  )
}
