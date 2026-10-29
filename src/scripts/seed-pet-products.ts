import 'dotenv/config'
import path from 'node:path'
import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Product } from '@/payload-types'

// Additive local catalog seed. Existing slugs are never updated, including drafts.
const samples = [
  {
    category: 'bedding',
    categoryTitle: '窝垫寝具 / Bedding',
    slug: 'concept-sage-nest-bed',
    pets: 'dogs_cats',
    zh: {
      title: '鼠尾草绿围边宠物窝',
      short:
        '以柔和绿调与围边造型构建家居系列的选品参考。图片为概念展示，实际面料、尺寸与样品待确认。',
      points: [
        '选品方向：围边与独立内垫的视觉组合，便于规划家居配色系列。结构与可拆洗方式以确认样品为准。',
        '采购确认：请提供适用宠物体型、目标外尺寸与内睡眠空间，并确认面料成分、填充物及底部结构。',
        '样品评估：核对缝线、填充均匀度、色差、洗护方式和包装压缩后恢复情况；不预设可机洗或耐咬性能。',
      ],
      care: '请先确认面料与填充物，并以样品洗护标签为准。',
    },
    en: {
      title: 'Sage Nest Bolster Pet Bed',
      short:
        'A soft green bolster-bed concept for a coordinated home assortment. Concept imagery only; fabric, dimensions and samples remain to be confirmed.',
      points: [
        'Assortment direction: a raised-edge silhouette with an inner cushion, intended as a starting point for a coordinated home collection. Construction and removable-cover details require sample approval.',
        'Before quoting: specify the intended pet size, outer dimensions and sleeping area, then confirm fabric composition, filling and base construction.',
        'Sample review: assess stitching, fill distribution, color consistency, care instructions and recovery after packing. Machine washability and chew resistance are not assumed.',
      ],
      care: 'Confirm fabric and filling first; follow the approved sample care label.',
    },
  },
  {
    category: 'feeding',
    categoryTitle: '喂养用品 / Feeding',
    slug: 'concept-studio-feeding-bowls',
    pets: 'dogs_cats',
    zh: {
      title: '奶油绿宠物食水碗组合',
      short:
        '奶油色与深绿底边的食水碗搭配，供喂养用品系列选品参考。图片为概念展示，材质与容量需按样品确认。',
      points: [
        '选品方向：以一致的外观语言搭配食碗与水碗，适合讨论单件或组合包装方案；图片中的食品仅为场景示意。',
        '采购确认：请确认目标口径、深度、容量、重量及底部处理，实际材质和表面工艺不能仅凭图片判断。',
        '样品评估：检查边缘、表面、稳固性及清洁方式；如有食品接触、洗碗机或微波炉要求，请明确目标市场并索取对应验证资料。',
      ],
      care: '清洁工具、温度与洗碗机适用性须由确认样品说明。',
    },
    en: {
      title: 'Cream & Forest Feeding Bowl Pair',
      short:
        'A coordinated food-and-water bowl concept in cream and forest green. Concept imagery only; composition and capacity require sample confirmation.',
      points: [
        'Assortment direction: matching food and water vessels for discussion as individual pieces or a coordinated set. Food shown in the image is styling only.',
        'Before quoting: confirm rim diameter, depth, capacity, weight and base treatment. Material and surface finish cannot be established from imagery alone.',
        'Sample review: examine edges, surfaces, stability and cleaning guidance. Specify the destination market and request relevant evidence for food-contact, dishwasher or microwave requirements.',
      ],
      care: 'Confirm cleaning tools, temperature limits and dishwasher suitability against the approved sample.',
    },
  },
  {
    category: 'toys',
    categoryTitle: '玩具互动 / Toys',
    slug: 'concept-terra-knot-rope-toy',
    pets: 'dogs',
    zh: {
      title: '陶土色双结互动绳玩具',
      short:
        '以双结轮廓与陶土色调呈现互动玩具选品方向。概念图片不代表已验证的材质、耐咬等级或安全认证。',
      points: [
        '选品方向：双结绳形造型可作为互动玩具系列的配色参考，具体纤维成分与编织结构需由样品确认。',
        '采购确认：根据犬只体型与预期玩法讨论长度、绳径、单件重量、结点牢固度及包装警示，不预设适用于所有犬只。',
        '样品评估：核对掉色、纤维脱落和结点结构，确认目标市场的测试要求。互动时需看护，出现破损或松散纤维应停止使用。',
      ],
      care: '按样品说明清洁并充分干燥；破损或松散时停止使用。',
    },
    en: {
      title: 'Terra Double-Knot Rope Toy',
      short:
        'A terracotta double-knot concept for an interactive toy assortment. Concept imagery does not establish fiber content, chew rating or safety certification.',
      points: [
        'Assortment direction: a double-knot rope silhouette as a color reference for interactive toys. Fiber composition and braid construction require sample confirmation.',
        'Before quoting: discuss length, rope diameter, unit weight, knot security and packaging warnings for the intended dog size and play style. Suitability for every dog is not assumed.',
        'Sample review: assess color transfer, fiber shedding and knot construction, and agree destination-market testing requirements. Supervise play and discontinue use if damaged or frayed.',
      ],
      care: 'Follow sample cleaning guidance and dry thoroughly; discontinue use if damaged or frayed.',
    },
  },
  {
    category: 'walking',
    categoryTitle: '出行用品 / Walking',
    slug: 'concept-trail-harness-lead',
    pets: 'dogs',
    zh: {
      title: '苔绿色胸背牵引组合',
      short:
        '协调胸背与牵引带的出行系列选品参考。图片为概念展示，尺码、受力表现与五金规格需经过样品确认。',
      points: [
        '选品方向：以统一色调串联胸背与牵引带，可讨论单件销售或套装包装，实际组件与搭配以确认清单为准。',
        '采购确认：请提供目标胸围、颈围与犬只体型，确认调节范围、织带宽度、扣具、连接环和牵引绳规格。',
        '样品评估：核对贴合度、缝线、扣具操作及连接件测试要求；不预设防挣脱或特定承重能力。使用前检查配件并正确调整。',
      ],
      care: '按样品洗护说明清洁；每次使用前检查缝线、扣具与连接件。',
    },
    en: {
      title: 'Moss Trail Harness & Lead',
      short:
        'A coordinated harness-and-lead concept for a walking assortment. Concept imagery only; sizing, load performance and hardware specifications require sample approval.',
      points: [
        'Assortment direction: a unified color story across harness and lead, for discussion as separate items or a set. Final components follow the confirmed packing list.',
        'Before quoting: provide the intended chest and neck measurements and dog size, then confirm adjustment range, webbing width, buckles, attachment rings and lead specifications.',
        'Sample review: evaluate fit, stitching, buckle operation and attachment testing requirements. Escape resistance or a specific load capacity is not assumed. Inspect and adjust before use.',
      ],
      care: 'Follow sample care instructions; inspect stitching, buckles and attachment points before each use.',
    },
  },
] as const

function richText(
  paragraphs: readonly string[],
): NonNullable<NonNullable<Product['general']>['description']> {
  return {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        version: 1,
        direction: 'ltr',
        format: '',
        indent: 0,
        children: [
          { type: 'text', version: 1, detail: 0, format: 0, mode: 'normal', style: '', text },
        ],
      })),
    },
  }
}

async function run() {
  const payload = await getPayload({ config })
  const context = { disableRevalidate: true }
  const created: number[] = []
  try {
    const templates = await payload.find({
      collection: 'industry-templates',
      where: { title: { equals: '宠物用品 / Pet supplies' } },
      limit: 1,
      depth: 0,
    })
    const template = templates.docs[0]
    if (!template)
      throw new Error(
        'Existing Pet supplies industry template is required; seed it before running this script.',
      )
    for (const sample of samples) {
      const existing = await payload.find({
        collection: 'products',
        draft: true,
        depth: 0,
        limit: 1,
        where: { slug: { equals: sample.slug } },
      })
      if (existing.docs.length) {
        console.log(JSON.stringify({ preserved: existing.docs[0].id, slug: sample.slug }))
        continue
      }
      let category = (
        await payload.find({
          collection: 'categories',
          depth: 0,
          limit: 1,
          where: { slug: { equals: sample.category }, taxonomy: { equals: 'product' } },
        })
      ).docs[0]
      if (!category)
        category = await payload.create({
          collection: 'categories',
          context,
          data: { taxonomy: 'product', title: sample.categoryTitle, slug: sample.category },
        })
      const alt = `${sample.zh.title} / ${sample.en.title} — concept reference image`
      let media = (
        await payload.find({
          collection: 'media',
          depth: 0,
          limit: 1,
          where: { alt: { equals: alt } },
        })
      ).docs[0]
      if (!media)
        media = await payload.create({
          collection: 'media',
          context,
          filePath: path.resolve(`public/pet-assets/${sample.category}.webp`),
          data: {
            alt,
            caption: richText([
              '概念选品参考图，不代表已确认量产样品。Concept sourcing reference; not an approved production sample.',
            ]),
          },
        })
      const localized = (locale: 'zh' | 'en') => {
        const content = sample[locale]
        const notice =
          locale === 'zh'
            ? '本页为示例选品方向，图片仅作概念参考，并非现货或已确认量产规格。报价、库存、起订量、交期、定制与测试要求需在询盘及样品确认后明确。'
            : 'This page presents a sample sourcing direction with concept imagery, not confirmed stock or approved production specifications. Quotation, availability, MOQ, lead time, customization and testing requirements must be agreed through inquiry and sample approval.'
        return {
          title: content.title,
          general: {
            heroImage: media.id,
            shortDescription: content.short,
            description: richText([notice, ...content.points]),
          },
          meta: { title: content.title, description: content.short, image: media.id },
          discovery: { summary: notice },
          technicalValues: {
            [template.id]: {
              suitable_pets: sample.pets,
              materials:
                locale === 'zh'
                  ? '材质成分待样品及资料确认'
                  : 'Composition pending sample and documentation review',
              care: content.care,
            },
          },
          _status: 'published' as const,
        }
      }
      const product = await payload.create({
        collection: 'products',
        locale: 'zh',
        context,
        data: {
          ...localized('zh'),
          slug: sample.slug,
          industryTemplate: template.id,
          pricing: { unit: 'piece' },
          organization: { category: category.id, featured: true },
        },
      })
      await payload.update({
        collection: 'products',
        id: product.id,
        locale: 'en',
        context,
        data: localized('en'),
      })
      created.push(product.id)
      for (const locale of ['zh', 'en'] as const) {
        const publicDoc = await payload.findByID({
          collection: 'products',
          id: product.id,
          locale,
          fallbackLocale: false,
          overrideAccess: false,
          depth: 1,
        })
        assert.equal(publicDoc.title, sample[locale].title)
        assert.equal(publicDoc._status, 'published')
        assert.equal(publicDoc.pricing?.price ?? null, null)
        assert.equal(publicDoc.pricing?.stock ?? null, null)
        assert.equal(publicDoc.sourcing?.minimumOrderQuantity ?? null, null)
        assert.ok(typeof publicDoc.general?.heroImage === 'object')
      }
      console.log(
        JSON.stringify({
          created: product.id,
          slug: sample.slug,
          category: sample.category,
          media: media.id,
          template: template.id,
          locales: ['zh', 'en'],
        }),
      )
    }
    console.log(
      JSON.stringify({
        createdIDs: created,
        message: 'Existing products preserved. Refresh the running site after CLI seeding.',
      }),
    )
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
