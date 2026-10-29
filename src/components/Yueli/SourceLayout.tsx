import { safeHTML } from './html'
import { DomUtils, parseDocument } from 'htmlparser2'
import { EquipmentInquiryForm } from './InquiryForm'
import { SourceLayoutWithForm } from './SourceLayoutClient'

/** Keep source layouts editable in Payload; only the inquiry slot is a live React island. */
export function SourceLayout({
  html,
  formID,
  product,
  project,
}: {
  html: string
  formID?: number | null
  product?: string
  project?: string
}) {
  // Apply this removal to existing CMS imports as well as newly collected layouts.
  if (html.includes('yc-contact')) {
    const document = parseDocument(html)
    const removedClasses = ['yl-direct-contact', 'yc-contact-bar', 'yc-actions']
    for (const node of DomUtils.findAll(
      (node) =>
        (node.attribs.class || '').split(/\s+/).some((name) => removedClasses.includes(name)),
      document.children,
    )) {
      DomUtils.removeElement(node)
    }
    for (const link of DomUtils.getElementsByTagName('a', document.children)) {
      if ((link.attribs.href || '').startsWith('mailto:')) link.attribs.href = '#project-inquiry'
    }
    for (const section of DomUtils.getElementsByTagName('section', document.children)) {
      if (
        DomUtils.findOne(
          (node) => (node.attribs.class || '').split(/\s+/).includes('yc-fact-grid'),
          section.children,
        )
      ) {
        DomUtils.removeElement(section)
      }
    }
    html = DomUtils.getOuterHTML(document)
  }
  const slot = /<div\b[^>]*\bid="yueli-inquiry-slot"[^>]*><\/div>/
  const pieces = html.split(slot)
  if (pieces.length === 1)
    return (
      <div className="yl-original-layout" dangerouslySetInnerHTML={{ __html: safeHTML(html) }} />
    )
  // A form slot is nested in the source grid. A client portal keeps its exact position
  // without dividing the surrounding HTML into invalid partial DOM trees.
  return (
    <SourceLayoutWithForm
      html={safeHTML(html)}
      form={
        <EquipmentInquiryForm
          formID={formID}
          product={product}
          project={project}
          variant="contact"
        />
      }
    />
  )
}
