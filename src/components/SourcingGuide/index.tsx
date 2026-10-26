import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { ArrowUpRight, Check, Layers, Palette, Tag, Package } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import styles from './index.module.css'
import { FactoryNetwork } from '@/components/FactoryNetwork'
import { ShippingOptions } from '@/components/ShippingOptions'

export async function SourcingGuide() {
  const en = (await getLocale()) === 'en'
  const text = (zh: string, english: string) => (en ? english : zh)
  const options = en
    ? [
        [
          'Materials & construction',
          'Share intended use, pet sizes and dimensions to discuss fabric, filling or component options.',
        ],
        [
          'Colors & appearance',
          'Provide color references and review how materials affect the sample appearance.',
        ],
        [
          'Brand identity',
          'Share artwork, placement and size requirements before discussing suitable branding methods.',
        ],
        [
          'Packaging & labels',
          'Describe sales channels, pack formats, barcodes and wording for the target market.',
        ],
      ]
    : [
        ['材料与结构', '提供使用场景、目标宠物和期望尺寸，讨论面料、填充或部件方案。'],
        ['配色与外观', '准备颜色参考，确认不同材质上的呈现方式与样品差异。'],
        ['品牌标识', '提供标识文件、位置及尺寸要求，再评估适合的呈现工艺。'],
        ['包装与标签', '说明销售渠道、包装形式、条码及目标市场的文字要求。'],
      ]
  const steps = en
    ? [
        [
          'Define the brief',
          'Choose products and share quantities, markets and target timing.',
          'A project requirements checklist',
        ],
        [
          'Review samples & details',
          'Discuss feasible options, identify sample versions and consolidate feedback.',
          'Sample feedback and a specification version',
        ],
        [
          'Plan the order',
          'Confirm configuration, packaging, quantities, pricing and delivery terms.',
          'An agreed order specification',
        ],
      ]
    : [
        ['整理需求', '选择产品或品类，说明计划数量、目标市场和期望时间。', '项目需求清单'],
        ['确认样品与细节', '讨论可行方案，记录样品版本并汇总修改意见。', '样品反馈与规格版本'],
        ['规划采购订单', '确认产品配置、包装、数量、报价和交付条件。', '双方认可的订单明细'],
      ]
  const lists = [
    {
      id: 'samples',
      number: '01',
      title: text('打样前，准备好这些信息。', 'What to prepare before sampling.'),
      intro: text(
        '区分用于确认颜色或标识的局部样品，与接近量产配置的完整样品。费用、数量和时间请在开始前确认。',
        'Distinguish a sample for color or branding from a complete sample representing production specifications. Confirm costs, quantities and timing before work begins.',
      ),
      items: en
        ? [
            'Product references, key dimensions and material preferences',
            'Artwork, color references and packaging copy',
            'Expected quantity, sales market and target schedule',
            'Sample version and a record of feedback',
          ]
        : [
            '产品参考、关键尺寸与材质偏好',
            '标识文件、颜色参考与包装文字',
            '计划数量、销售市场及时间要求',
            '样品版本、验证细节与反馈记录',
          ],
    },
    {
      id: 'quality',
      number: '02',
      title: text('把验收要求写在订单之前。', 'Agree on acceptance criteria before ordering.'),
      intro: text(
        '根据产品和目标市场，约定适用的检查项目与文件要求，再将确认结果写入订单。以下清单用于采购沟通，具体检测安排需另行确认。',
        'Agree on checks and documentation for the product and destination, then record the requirements in your order. Use this checklist to guide the discussion; testing arrangements are confirmed separately.',
      ),
      items: en
        ? [
            'Define criteria for dimensions, materials, colors and packaging',
            'Agree on inspection methods and how issues will be reported',
            'Retain the approved sample, specification and change record',
            'Confirm the scope and corresponding model of any test documents',
          ]
        : [
            '明确尺寸、材质、颜色和包装验收依据',
            '约定检查项目与问题反馈流程',
            '保留确认样、规格表和变更记录',
            '确认检测或合规文件的适用范围与对应型号',
          ],
    },
  ]
  const icons = [Layers, Palette, Tag, Package]
  return (
    <main className="pet-site">
      <section className={`pet-container ${styles.hero}`}>
        <div>
          <h1>
            {text(
              '把品牌想法，\n变成清晰的采购方案。',
              'Your brand idea.\nA clearer sourcing plan.',
            )}
          </h1>
          <p>
            {text(
              '从现有款式选品到品牌定制，先确认产品、规格和样品，再一起规划订单。每个项目的可行工艺、起订量、费用与交期均需单独确认。',
              'From selecting existing styles to private-label development, agree on products, specifications and samples before planning an order. Available processes, minimums, costs and lead times are confirmed for each project.',
            )}
          </p>
          <div className={styles.actions}>
            <Link href="/contact" className="pet-button">
              {text('讨论我的采购计划', 'Discuss my project')}
              <ArrowUpRight size={19} />
            </Link>
            <a href="#samples" className="pet-text-link">
              {text('查看打样清单', 'Sample checklist')}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <figure className={styles.visual}>
          <div className={styles.image}>
            <Image
              src="/pet-assets/walking.webp"
              fill
              loading="eager"
              sizes="(max-width: 767px) 100vw, 45vw"
              alt={text(
                '苔绿色胸背与牵引带的产品概念参考',
                'Moss harness and matching lead concept reference',
              )}
            />
          </div>
          <figcaption>
            {text(
              '从配色到配件，逐项讨论品牌细节。',
              'From color to components, discuss the details that define your brand.',
            )}
          </figcaption>
        </figure>
      </section>
      <section className={`pet-container pet-section ${styles.options}`}>
        <div className="pet-section-heading">
          <div>
            <h2>{text('从这些细节开始讨论。', 'Start with the details that matter.')}</h2>
            <p>
              {text(
                '把需求拆成具体项目，方便评估、打样和核对。',
                'Break your brief into details that can be evaluated, sampled and checked.',
              )}
            </p>
          </div>
        </div>
        <div className={styles.optionGrid}>
          {options.map(([title, body], index) => {
            const Icon = icons[index]
            return (
              <article key={title}>
                <Icon size={26} strokeWidth={1.5} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            )
          })}
        </div>
      </section>
      <FactoryNetwork />
      <section className="pet-custom">
        <div className="pet-container">
          <h2>{text('每一步，都有明确的确认结果。', 'A clear outcome at every step.')}</h2>
          <div className={`pet-steps ${styles.steps}`}>
            {steps.map(([title, body, outcome], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <div className={styles.outcome}>
                  <Check size={17} aria-hidden="true" />
                  {outcome}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="pet-container">
        {lists.map((list) => (
          <section id={list.id} key={list.id} className={styles.checklist}>
            <div>
              <span className={styles.number}>{list.number}</span>
              <h2>{list.title}</h2>
              <p>{list.intro}</p>
            </div>
            <ul>
              {list.items.map((item) => (
                <li key={item}>
                  <Check size={19} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <ShippingOptions />
      <section className="pet-cta">
        <div className="pet-container">
          <h2>
            {text(
              '带着清单，\n开始下一次采购。',
              'Bring your checklist.\nBuild your next collection.',
            )}
          </h2>
          <p>
            {text(
              '需求尚未完全确定也可以联系。先分享已知信息，再逐项讨论。',
              'Your brief does not need to be complete. Share what you know and discuss the remaining details with us.',
            )}
          </p>
          <Link className="pet-button" href="/contact">
            {text('讨论采购计划', 'Discuss your project')}
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  )
}
