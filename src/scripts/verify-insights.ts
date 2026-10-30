import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { createContentReader } from '@/i18n/content'

// Run on the site server. Never accept tokens on the command line or print records.
const origin = process.argv.find(arg => arg.startsWith('--origin='))?.slice(9) || 'https://yueliautomation.com'
const token = process.env.INSIGHTS_READ_TOKEN
class VerificationError extends Error {}
const check = (value: unknown, code: string) => { if (!value) throw new VerificationError(code) }
check(['http://127.0.0.1:3121', 'https://yueliautomation.com'].includes(origin), 'Unexpected verification origin')
check(process.env.INSIGHTS_ENABLED === 'true' && process.env.INSIGHTS_SITE_ID === 'yueliautomation', 'Invalid integration identity')
check(token && /^[a-f0-9]{64,}$/.test(token), 'Missing high-entropy integration token')
check(process.env.INQUIRY_EMAIL_AUTORUN !== 'true', 'Mail autorun must remain disabled')

const payload = await getPayload({ config })
try {
  const paths = ['capabilities', ...['posts', 'pages', 'products'].map(collection => `content?collection=${collection}&locale=en&page=1`), 'submissions?page=1']
  for (const path of paths) for (const authorization of ['', 'Bearer deliberately-invalid-read-token']) {
    const response = await fetch(`${origin}/api/insights/v1/${path}`, { headers: authorization ? { authorization } : {}, redirect: 'error' })
    check(response.status === 401, 'Missing or invalid token was not rejected')
  }
  async function read(path: string) {
    const response = await fetch(`${origin}/api/insights/v1/${path}`, { headers: { authorization: `Bearer ${token}` }, redirect: 'error' })
    check(response.status === 200, 'Authorized endpoint did not return 200')
    check(response.headers.get('cache-control')?.includes('no-store'), 'Private response may be cached')
    const body = await response.json()
    check(body.schemaVersion === 1 && body.siteId === 'yueliautomation', 'Invalid response identity')
    return body
  }
  const capabilities = await read('capabilities')
  check(capabilities.submissions === true && capabilities.locales.includes('en'), 'Missing capabilities')
  const counts: Record<string, number> = {}
  const reader = createContentReader(payload)
  for (const collection of ['posts', 'pages', 'products'] as const) {
    check(capabilities.collections.includes(collection), 'Missing content collection')
    const expected = await reader.find({ collection, locale: 'en', fallbackLocale: false, draft: false, overrideAccess: false, depth: 0, pagination: false, where: { _status: { equals: 'published' } } })
    const records: { id: string; title: string; url: string; updatedAt: string; locale: string; collection: string }[] = []
    let page: number | null = 1
    while (page !== null) {
      check(page <= 10000, 'Pagination exceeded contract')
      const body = await read(`content?collection=${collection}&locale=en&page=${page}`)
      check(Array.isArray(body.records) && body.records.length <= 100, 'Invalid page shape')
      check(body.nextPage === null || body.nextPage === page + 1, 'Invalid nextPage')
      records.push(...body.records)
      page = body.nextPage
    }
    check(records.length === expected.docs.length && new Set(records.map(row => row.id)).size === records.length, 'Content count or pagination mismatch')
    for (const row of records) {
      const doc = expected.docs.find(doc => String(doc.id) === row.id)
      check(doc && row.title === doc.title && row.updatedAt === doc.updatedAt, 'Content differs from published translation')
      check(row.locale === 'en' && row.collection === collection, 'Invalid content projection')
      const url = new URL(row.url)
      check(url.origin === 'https://yueliautomation.com' && !url.pathname.startsWith('/en/'), 'Invalid public content URL')
    }
    const extra = await read(`content?collection=${collection}&locale=en&page=10000`)
    check(extra.records.length === 0 && extra.nextPage === null, 'Empty page contract failed')
    counts[collection] = records.length
  }
  const expected = await payload.find({ collection: 'form-submissions', overrideAccess: true, depth: 0, pagination: false })
  const forms = await payload.find({ collection: 'forms', overrideAccess: true, depth: 0, pagination: false })
  const records: { id: string; formId: string; formName: string; fields: {key: string; label: string; value: string}[] }[] = []
  let page: number | null = 1
  while (page !== null) {
    check(page <= 10000, 'Submission pagination exceeded contract')
    const body = await read(`submissions?page=${page}`)
    check(Array.isArray(body.records) && body.records.length <= 100, 'Invalid submissions page')
    check(body.nextPage === null || body.nextPage === page + 1, 'Invalid submission nextPage')
    records.push(...body.records)
    page = body.nextPage
  }
  check(records.length === expected.docs.length && new Set(records.map(row => row.id)).size === records.length, 'Submission count mismatch')
  let checkedFields = 0
  for (const record of records) {
    const doc = expected.docs.find(doc => String(doc.id) === record.id)
    check(doc, 'Unexpected submission ID')
    const formId = typeof doc!.form === 'object' ? doc!.form.id : doc!.form
    const form = forms.docs.find(form => form.id === formId)
    check(record.formId === String(formId) && record.formName === (form?.title || `表单 ${formId}`), 'Missing form name')
    const original = doc!.submissionData || []
    check(record.fields.length === original.length, 'Submission fields were dropped')
    original.forEach((row, index) => {
      const field = form?.fields?.find(field => 'name' in field && field.name === row.field)
      const label = field && 'label' in field ? field.label || row.field : row.field
      const value = row.value == null ? '' : typeof row.value === 'string' ? row.value : JSON.stringify(row.value)
      check(record.fields[index]?.key === row.field && record.fields[index]?.label === label && record.fields[index]?.value === value, 'Submission key, label, value or order mismatch')
      checkedFields++
    })
  }
  const extra = await read('submissions?page=10000')
  check(extra.records.length === 0 && extra.nextPage === null, 'Empty submissions page failed')
  console.log(JSON.stringify({ siteId: 'yueliautomation', origin, missingToken: 401, invalidToken: 401, authorized: 200, counts: { ...counts, submissions: records.length }, checkedFields, pagination: 'passed', publishedContent: 'matched', submissionFields: 'matched', cache: 'no-store' }))
} catch (error) {
  // Do not log private response bodies, tokens, form answers or database errors.
  console.error(`INSIGHTS_VERIFICATION_FAILED: ${error instanceof VerificationError ? error.message : 'Unexpected adapter or HTTP failure'}`)
  process.exitCode = 1
} finally { await payload.destroy() }
process.exit(process.exitCode || 0)
