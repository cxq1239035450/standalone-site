import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'

type Definition = {
  key: string
  zh: string
  en: string
  type: 'text' | 'number' | 'select'
  unit?: string
  options?: Array<[string, string, string]>
}
const templates: Array<{ title: string; heading: [string, string]; fields: Definition[] }> = [
  {
    title: '机械设备 / Machinery',
    heading: ['技术参数与工程规格', 'Technical specifications'],
    fields: [
      { key: 'model', zh: '型号', en: 'Model', type: 'text' },
      { key: 'rated_power', zh: '额定功率', en: 'Rated power', type: 'number', unit: 'kW' },
      { key: 'rated_voltage', zh: '额定电压', en: 'Rated voltage', type: 'number', unit: 'V' },
      { key: 'net_weight', zh: '净重', en: 'Net weight', type: 'number', unit: 'kg' },
      {
        key: 'control_mode',
        zh: '控制方式',
        en: 'Control mode',
        type: 'select',
        options: [
          ['manual', '手动', 'Manual'],
          ['semi_automatic', '半自动', 'Semi-automatic'],
          ['automatic', '自动', 'Automatic'],
        ],
      },
    ],
  },
  {
    title: '鞋类 / Footwear',
    heading: ['鞋类材料与规格', 'Footwear materials and specifications'],
    fields: [
      { key: 'upper_material', zh: '鞋面材质', en: 'Upper material', type: 'text' },
      { key: 'sole_material', zh: '鞋底材质', en: 'Sole material', type: 'text' },
      { key: 'lining', zh: '内衬与鞋垫', en: 'Lining and insole', type: 'text' },
      { key: 'size_range', zh: '尺码范围', en: 'Size range', type: 'text' },
      { key: 'oem', zh: '定制 / OEM 能力', en: 'Customization / OEM', type: 'text' },
    ],
  },
  {
    title: '宠物用品 / Pet supplies',
    heading: ['产品规格与参数', 'Product specifications'],
    fields: [
      {
        key: 'suitable_pets',
        zh: '适用宠物',
        en: 'Suitable pets',
        type: 'select',
        options: [
          ['dogs', '犬', 'Dogs'],
          ['cats', '猫', 'Cats'],
          ['dogs_cats', '犬猫', 'Dogs and cats'],
          ['other', '其他', 'Other'],
        ],
      },
      { key: 'materials', zh: '主要材质', en: 'Main materials', type: 'text' },
      {
        key: 'dimensions',
        zh: '尺寸（长 × 宽 × 高）',
        en: 'Dimensions (L × W × H)',
        type: 'text',
        unit: 'cm',
      },
      { key: 'net_weight', zh: '净重', en: 'Net weight', type: 'number', unit: 'g' },
      { key: 'care', zh: '清洁与保养', en: 'Cleaning and care', type: 'text' },
    ],
  },
]

async function run() {
  const payload = await getPayload({ config })
  try {
    for (const template of templates) {
      const existing = await payload.find({
        collection: 'industry-templates',
        where: { title: { equals: template.title } },
        limit: 1,
        depth: 0,
      })
      if (existing.totalDocs) {
        console.log(`Preserved existing template: ${template.title}`)
        continue
      }
      const doc = await payload.create({
        collection: 'industry-templates',
        locale: 'zh',
        context: { disableRevalidate: true },
        data: {
          title: template.title,
          sectionTitle: template.heading[0],
          fields: template.fields.map((field) => ({
            key: field.key,
            label: field.zh,
            type: field.type,
            unit: field.unit,
            required: false,
            options: field.options?.map(([value, label]) => ({ value, label })),
          })),
        },
      })
      await payload.update({
        collection: 'industry-templates',
        id: doc.id,
        locale: 'en',
        context: { disableRevalidate: true },
        data: {
          sectionTitle: template.heading[1],
          fields: doc.fields?.map((field) => {
            const definition = template.fields.find((item) => item.key === field.key)!
            return {
              ...field,
              label: definition.en,
              options: field.options?.map((option) => ({
                ...option,
                label:
                  definition.options?.find((item) => item[0] === option.value)?.[2] || option.label,
              })),
            }
          }),
        },
      })
      console.log(`Created bilingual template: ${template.title}`)
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
