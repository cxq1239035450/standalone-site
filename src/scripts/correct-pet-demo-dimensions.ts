import 'dotenv/config'
import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '@payload-config'

// One-time, guarded correction of only the four demo records created by this task.
const targets = [
  [9, 'concept-sage-nest-bed'],
  [10, 'concept-studio-feeding-bowls'],
  [11, 'concept-terra-knot-rope-toy'],
  [12, 'concept-trail-harness-lead'],
] as const
async function run() {
  const payload = await getPayload({ config })
  try {
    for (const [id, slug] of targets)
      for (const locale of ['zh', 'en'] as const) {
        const doc = await payload.findByID({
          collection: 'products',
          id,
          locale,
          fallbackLocale: false,
          depth: 0,
        })
        assert.equal(doc.slug, slug, 'Refuse to modify a different product')
        assert.equal(doc.industryTemplate, 3, 'Refuse to modify a different template')
        const values = structuredClone(doc.technicalValues) as Record<
          string,
          Record<string, string>
        >
        const expected =
          locale === 'zh'
            ? '按目标宠物体型与确认样品确定'
            : 'To be agreed for the intended pet size and approved sample'
        if (!values?.['3'] || !Object.hasOwn(values['3'], 'dimensions')) {
          console.log(`Already corrected ${id}/${locale}`)
          continue
        }
        assert.equal(values['3'].dimensions, expected, 'Preserve any subsequent human edit')
        delete values['3'].dimensions
        await payload.update({
          collection: 'products',
          id,
          locale,
          context: { disableRevalidate: true },
          data: { technicalValues: values },
        })
        const saved = await payload.findByID({
          collection: 'products',
          id,
          locale,
          fallbackLocale: false,
          depth: 0,
          overrideAccess: false,
        })
        assert.deepEqual(saved.technicalValues, values)
        assert.equal(saved._status, doc._status)
        console.log(`Corrected ${id}/${locale}: removed only template 3 dimensions`)
      }
  } finally {
    await payload.destroy()
  }
}
run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
