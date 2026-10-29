import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

// Add the pet catalog taxonomy without renaming or deleting existing categories.
async function run() {
  const payload = await getPayload({ config })
  const categories = [
    { slug: 'bedding', title: '窝垫家居 / Bedding' },
    { slug: 'feeding', title: '喂养用品 / Feeding' },
    { slug: 'toys', title: '玩具互动 / Toys' },
    { slug: 'walking', title: '出行装备 / Walking' },
  ]
  for (const category of categories) {
    const existing = await payload.find({ collection: 'categories', depth: 0, limit: 1, where: { slug: { equals: category.slug }, taxonomy: { equals: 'product' } } })
    if (!existing.docs.length) await payload.create({ collection: 'categories', data: { ...category, taxonomy: 'product' } })
    payload.logger.info(`Pet category ready: ${category.slug}`)
  }
  await payload.destroy()
  process.exit(0)
}

run().catch((error) => { console.error(error); process.exit(1) })
