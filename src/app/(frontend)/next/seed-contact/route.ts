import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { contactForm as contactFormData } from '@/endpoints/seed/contact-form'
import { contact as contactPageData } from '@/endpoints/seed/contact-page'

export const maxDuration = 60

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })
  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const payloadReq = await createLocalReq({ user }, payload)

    // Find existing "B2B Inquiry Form"
    const existingForms = await payload.find({
      collection: 'forms',
      req: payloadReq,
      where: {
        title: { equals: 'B2B Inquiry Form' },
      },
      depth: 0,
      limit: 1,
    })

    let contactForm
    if (existingForms.docs.length > 0) {
      contactForm = existingForms.docs[0]
    } else {
      contactForm = await payload.create({
        collection: 'forms',
        req: payloadReq,
        data: contactFormData,
      })
    }

    // Find existing "contact" page
    const existingPages = await payload.find({
      collection: 'pages',
      req: payloadReq,
      where: {
        slug: { equals: 'contact' },
      },
      depth: 0,
      limit: 1,
    })

    const pageData = contactPageData({ contactForm })

    if (existingPages.docs.length > 0) {
      const existingPage = existingPages.docs[0]
      await payload.update({
        collection: 'pages',
        id: existingPage.id,
        req: payloadReq,
        data: {
          hero: pageData.hero,
          layout: pageData.layout,
          title: pageData.title || 'Contact',
        },
      })
    } else {
      await payload.create({
        collection: 'pages',
        req: payloadReq,
        data: pageData,
      })
    }

    return Response.json({
      success: true,
      contactFormId: contactForm.id,
      message: 'Contact form and page seeded/updated successfully',
    })
  } catch (e) {
    payload.logger.error({ err: e, message: 'Error seeding contact data' })
    return new Response(`Error: ${(e as Error).message}`, { status: 500 })
  }
}
