import { DomUtils, parseDocument } from 'htmlparser2'
import { safeHTML } from './html'

type Node = ReturnType<typeof parseDocument>['children'][number]
type Section = 'overview' | 'technical' | 'features' | 'applications' | 'prepare'
const serialize = (nodes: Node[]) => nodes.map((node) => DomUtils.getOuterHTML(node)).join('')
const text = (node: Node) => DomUtils.textContent(node).trim()
const hasClass = (node: Node, name: string) =>
  node.type === 'tag' && (node.attribs.class || '').split(/\s+/).includes(name)

/** Present legacy descriptions consistently without copying specifications between products. */
export function productDetailSections(html: string) {
  const document = parseDocument(safeHTML(html))
  const sections: Record<Section, string> = {
    overview: '',
    technical: '',
    features: '',
    applications: '',
    prepare: '',
  }
  // Old exports mistakenly made these links point to the homepage.
  for (const anchor of DomUtils.getElementsByTagName('a', document.children)) {
    if (/^\/#yl-/.test(anchor.attribs.href || ''))
      anchor.attribs.href = anchor.attribs.href.slice(1)
  }
  const existingMain = DomUtils.findOne(
    (node) => hasClass(node, 'yueli-detail-main'),
    document.children,
  )
  let nodes = existingMain?.children || document.children
  const elements = nodes.filter((node) => node.type === 'tag')
  const onlyElement = elements[0]
  if (
    !existingMain &&
    elements.length === 1 &&
    onlyElement.type === 'tag' &&
    onlyElement.name === 'div'
  )
    nodes = onlyElement.children
  let current: Section = 'overview'
  let tableTitle = 'Technical specifications'
  for (const node of nodes) {
    if (node.type === 'text' && !text(node)) continue
    if (node.type === 'tag') {
      if (node.name === 'p' && !text(node) && !DomUtils.getElementsByTagName('img', [node]).length)
        continue
      const sectionID = node.attribs.id
      const sectionKey = (
        {
          'yl-overview': 'overview',
          'yl-technical': 'technical',
          'yl-features': 'features',
          'yl-applications': 'applications',
          'yl-prepare': 'prepare',
        } as Record<string, Section>
      )[sectionID]
      if (sectionKey) {
        const children = node.children.filter(
          (child) => !(child.type === 'tag' && /^h[2-4]$/.test(child.name)),
        )
        sections[sectionKey] += serialize(children)
        current = sectionKey
        continue
      }
      if (/^h[2-4]$/.test(node.name)) {
        const heading = text(node)
        if (/overview|概述/i.test(heading)) current = 'overview'
        else if (/features|功能|特点/i.test(heading)) current = 'features'
        else if (/applications?|应用/i.test(heading)) current = 'applications'
        else if (/technical|specifications?|parameters?|技术|规格|参数/i.test(heading)) {
          current = 'technical'
          tableTitle = heading
        } else {
          sections[current] += DomUtils.getOuterHTML(node)
        }
        continue
      }
      if (current === 'technical' && node.name === 'table') {
        node.attribs.class = `${node.attribs.class || ''} yl-catalog-table`.trim()
        // Preserve multi-column headers and every original cell, including units.
        const title = tableTitle.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        sections.technical += `<details class="yl-model" open><summary>${title}</summary><div class="yl-spec-scroll">${DomUtils.getOuterHTML(node)}</div></details>`
        continue
      }
    }
    sections[current] += DomUtils.getOuterHTML(node)
  }
  return sections
}
