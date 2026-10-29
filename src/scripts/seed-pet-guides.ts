import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Post } from '../payload-types'

const guides = [
  {
    slug: 'pet-sourcing-specification-checklist',
    zh: {
      title: '宠物用品采购：从选品到规格确认的实用清单',
      summary: '面向零售商和分销商的采购准备清单，涵盖使用场景、尺寸材质、包装、样品检查及报价比较。',
      sections: [
        ['先明确使用场景', '采购宠物用品前，先记录目标宠物的体型、年龄和使用习惯，以及商品在门店或线上渠道的定位。窝垫需要关注睡姿和可用空间，喂养用品需要考虑容量与清洗方式，牵引装备则需要核对胸围、颈围和调节范围。不要仅凭外观或产品名称判断适用性。'],
        ['把需求写成可比规格', '为每款产品建立规格表，列出尺寸及测量方法、主要材质、颜色、单件重量、配件、包装方式和预计数量。明确哪些是必须满足的条件，哪些可以调整。尺寸公差、面料成分、洗护说明和可拆卸部件应由供应方书面确认。涉及目标市场要求时，应核对适用规则及证明文件，不能把宣传词当作检测结果。'],
        ['用样品检查实际体验', '收到样品后，按照同一清单检查尺寸、缝线、边缘、五金、异味、清洁便利性和包装完整性，并拍照记录。试装或试用应在有人看护的条件下进行，发现破损、松脱或误食风险应停止使用。样品体验不能替代适用的专业检测。'],
        ['比较完整采购条件', '比较报价时同时核对起订量、包装数量、样品费用、运输条件、付款节点和交期起算点。不要只比较单价。把确认的规格、验收方式、数量及包装版本写入订单，约定发现不一致时的沟通流程，并保留确认样，方便后续批次对照。'],
      ],
    },
    en: {
      title: 'A practical pet supplies sourcing and specification checklist',
      summary: 'A buyer’s checklist for comparing pet supplies by intended use, dimensions, materials, packaging, sample checks and complete order terms.',
      sections: [
        ['Start with the intended use', 'Before comparing suppliers, describe the pets and customers you intend to serve. Record the relevant size range, age group, typical behavior and sales channel. For a bed, consider sleeping position and the space available in the home. For feeding products, consider capacity, stability and cleaning. For walking equipment, check the actual neck and chest measurement ranges rather than relying on a small, medium or large label. A clear use case makes it easier to identify gaps in a product assortment.'],
        ['Create a comparable specification', 'Build a simple specification sheet for each shortlisted item. Include dimensions and the measurement method, main materials, color, unit weight, included accessories, packaging and expected quantity. Separate essential requirements from preferences that can change. Ask for written confirmation of tolerances, textile composition, care instructions and removable components. If a supplier offers alternatives, record the exact difference. Requirements vary by destination and product type, so confirm the applicable rules and request relevant evidence where necessary. Marketing language alone is not evidence of testing or suitability.'],
        ['Check a sample systematically', 'Inspect every sample against the same checklist. Look at measurements, seams, edges, hardware, unusual odors, ease of cleaning and packaging condition. Photograph findings and identify each sample by date and version so feedback is unambiguous. Any supervised trial should be appropriate for the animal and product. Stop use if an item breaks, loosens or creates a swallowing risk. A useful sample inspection can reveal practical issues, but it does not replace professional testing where testing is required. Keep the approved sample for later comparison.'],
        ['Compare the complete order', 'Review minimum quantities, units per carton, sample charges, shipping terms, payment milestones and the point from which lead time is calculated. A lower unit price may come with different packaging or delivery responsibilities. Ask whether the quote covers the exact version you reviewed and clarify what could change the price. Before placing an order, record the agreed specifications, quantity, packaging version and acceptance process in writing. Define how discrepancies will be reported and discussed. This shared record helps both parties compare future batches without depending on memory or an outdated product photograph.'],
      ],
    },
  },
  {
    slug: 'private-label-sampling-checklist',
    zh: {
      title: '宠物用品品牌定制：打样前需要确认什么？',
      summary: '从品牌需求、设计文件、样品版本到订单确认，梳理宠物用品定制打样的关键沟通事项。',
      sections: [
        ['先准备一份简明需求书', '定制项目开始前，说明目标客群、产品用途、销售市场、预算范围和计划数量。列出希望调整的内容，例如颜色、面料、尺寸、品牌标识和包装，同时说明哪些基础结构可以保持不变。把目标上市时间作为讨论条件，而不是默认已经得到交期承诺。'],
        ['确认设计文件与适用范围', '提供清晰的标识文件、颜色参考和包装文字，并标明图案的位置、尺寸及阅读方向。确认使用这些素材的权利。不同材质和工艺可能造成色差或细节变化，需要供应方说明可行范围。产品标签、警示语、洗护信息和语言版本，应按目标市场与实际产品核对，不能直接照搬其他品牌。'],
        ['给每个样品明确版本', '在打样前确认样品类型、数量、费用、运输安排和预计完成时间。区分用于看颜色或标识的样品，与接近量产配置的完整样品。收到后记录版本、尺寸、材质、工艺和包装，对需要修改的地方逐项拍照说明。多项意见尽量汇总为一份反馈，避免不同聊天记录互相矛盾。'],
        ['从确认样过渡到订单', '修改完成后，书面确认最终样品和规格表，保留确认日期及双方认可的文件。再次核对起订量、包装装箱方式、交期起算条件以及检验安排。未经确认的变化应重新沟通。样品通过只表示该版本得到认可，不代表所有后续批次自动合格，也不替代适用的检测与合规审核。'],
      ],
    },
    en: {
      title: 'Private-label pet products: a practical sampling checklist',
      summary: 'Prepare a clear customization brief, artwork files and sample feedback process before confirming a private-label pet product order.',
      sections: [
        ['Prepare a focused project brief', 'Start with the intended customer, product use, destination market, budget range and expected order quantity. List the changes you want to explore, such as color, textile, dimensions, branding or packaging. Explain which features are essential and which existing construction details could remain unchanged. Share a target launch date as a planning requirement, rather than assuming a supplier has already committed to it. A short, specific brief makes feasibility discussions more useful and helps distinguish a cosmetic change from a more substantial product development project.'],
        ['Make artwork and labeling clear', 'Provide usable logo files, color references and the exact packaging copy. Identify the size, position and orientation of every mark, and confirm that you have the right to use the supplied artwork. Different materials and production methods can affect color appearance and fine details, so ask what is practical before approving the design. Check product labels, warnings, care information and language versions against the actual item and intended market. Do not copy another brand’s claims or assume that a familiar label meets every destination’s requirements.'],
        ['Define the sample before requesting it', 'Confirm the sample type, quantity, cost, shipping arrangement and estimated completion date. A sample intended to show a print color or logo position may not represent the final production construction. Ask which details are representative and which are still provisional. On arrival, give the sample a version identifier and record its dimensions, materials, workmanship and packaging. Collect feedback in one document with annotated photographs. Consolidated feedback is easier to follow than several conflicting messages, and it reduces the chance that a revision addresses the wrong version.'],
        ['Approve the transition to an order', 'After revisions, approve the final sample and specification sheet in writing. Keep the confirmation date and the agreed files available to both parties. Recheck minimum quantities, packing arrangements, the conditions that start the production schedule and the inspection plan. Any proposed change after approval should be discussed and recorded before it is accepted. Retain an approved sample for comparison with later deliveries. Sample approval confirms a particular version; it does not automatically establish that every production unit meets the agreed specification, and it does not replace relevant testing or compliance review.'],
      ],
    },
  },
]

function content(sections: string[][]): Post['content'] {
  return {
    root: {
      type: 'root', version: 1, direction: 'ltr', format: '', indent: 0,
      children: sections.flatMap(([heading, body]) => [
        { type: 'heading', tag: 'h2', version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', version: 1, text: heading, format: 0, detail: 0, mode: 'normal', style: '' }] },
        { type: 'paragraph', version: 1, direction: 'ltr', format: '', indent: 0, children: [{ type: 'text', version: 1, text: body, format: 0, detail: 0, mode: 'normal', style: '' }] },
      ]),
    },
  }
}

async function run() {
  const payload = await getPayload({ config })
  try {
    const found = await payload.find({ collection: 'categories', depth: 0, limit: 1, where: { slug: { equals: 'pet-guides' }, taxonomy: { equals: 'post-category' } } })
    const category = found.docs[0] ?? await payload.create({ collection: 'categories', data: { taxonomy: 'post-category', title: '宠物采购指南 / Pet buying guides', slug: 'pet-guides' } })
    for (const guide of guides) {
      const existing = await payload.find({ collection: 'posts', draft: true, depth: 0, limit: 1, where: { slug: { equals: guide.slug } } })
      if (existing.docs.length) {
        payload.logger.info(`Skipped existing guide (preserving edits): ${guide.slug}`)
        continue
      }
      const dataFor = (locale: 'zh' | 'en') => ({
        title: guide[locale].title, content: content(guide[locale].sections),
        meta: { title: `${guide[locale].title} | PawSupply`, description: guide[locale].summary },
        discovery: { noIndex: false, summary: guide[locale].summary },
        categories: [category.id], _status: 'published' as const,
      })
      const post = await payload.create({ collection: 'posts', locale: 'zh', context: { disableRevalidate: true }, data: { ...dataFor('zh'), slug: guide.slug } })
      await payload.update({ collection: 'posts', id: post.id, locale: 'en', context: { disableRevalidate: true }, data: dataFor('en') })
      for (const locale of ['zh', 'en'] as const) {
        const verified = await payload.findByID({ collection: 'posts', id: post.id, locale, fallbackLocale: false, draft: false, depth: 0 })
        if (verified._status !== 'published' || verified.title !== guide[locale].title || !verified.discovery?.summary) throw new Error(`Guide verification failed: ${guide.slug}/${locale}`)
      }
      payload.logger.info(`Published and verified zh/en guide: ${guide.slug}`)
    }
  } finally { await payload.destroy() }
}

run().then(() => process.exit(0)).catch((error) => { console.error(error); process.exit(1) })
