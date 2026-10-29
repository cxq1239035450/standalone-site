'use client'

import * as Tabs from '@radix-ui/react-tabs'
import { useState, type ReactNode } from 'react'
import { ProductReviews } from './ProductReviews'
import './product-tabs.css'

export function ProductTabs({
  productID,
  productTitle,
  description,
}: {
  productID: number
  productTitle?: string
  description: ReactNode
}) {
  const [reviewCount, setReviewCount] = useState(0)
  return (
    <Tabs.Root className="yl-product-tabs" defaultValue="description">
      <Tabs.List className="yl-product-tabs-list" aria-label="Product information">
        <Tabs.Trigger className="yl-product-tab" value="description">
          Description
        </Tabs.Trigger>
        <Tabs.Trigger className="yl-product-tab" value="reviews">
          Reviews ({reviewCount})
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content className="yl-product-tab-panel" value="description">
        <h2 className="yl-sr-only">Description</h2>
        {description}
      </Tabs.Content>
      <Tabs.Content className="yl-product-tab-panel" value="reviews" forceMount>
        <ProductReviews
          productID={productID}
          productTitle={productTitle}
          onCountChange={setReviewCount}
        />
      </Tabs.Content>
    </Tabs.Root>
  )
}
