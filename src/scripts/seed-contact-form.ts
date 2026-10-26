// Standalone seed script - creates the B2B inquiry form on demand
// Run with: pnpm tsx src/scripts/seed-contact-form.ts
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { contactForm as contactFormData } from '../endpoints/seed/contact-form'

async function run() {
  const payload = await getPayload({ config })

  payload.logger.info('Checking for existing B2B Inquiry Form...')

  const existing = await payload.find({
    collection: 'forms',
    overrideAccess: true,
    where: {
      title: {
        equals: contactFormData.title,
      },
    },
  })

  let form
  if (existing.docs.length > 0) {
    form = existing.docs[0]
    payload.logger.info(`Found existing form (id=${form.id}). Updating it...`)
    form = await payload.update({
      collection: 'forms',
      id: form.id,
      overrideAccess: true,
      data: {
        fields: contactFormData.fields,
        submitButtonLabel: contactFormData.submitButtonLabel,
        confirmationType: contactFormData.confirmationType,
        confirmationMessage: contactFormData.confirmationMessage,
        // Keep real notification settings, but remove the old template sender.
        emails: form.emails?.filter((email) => !email.emailFrom?.includes('freshconnect.com')),
      },
    })
    payload.logger.info(`Updated B2B Inquiry Form (id=${form.id}).`)
  } else {
    payload.logger.info('No existing form found. Creating it...')
    form = await payload.create({
      collection: 'forms',
      overrideAccess: true,
      data: contactFormData,
    })
    payload.logger.info(`Created B2B Inquiry Form (id=${form.id}).`)
  }

  await payload.destroy()
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
