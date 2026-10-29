import { getPayload } from 'payload'
import config from '../../src/payload.config'
if (process.env.E2E_DATABASE_COPY !== '1') throw new Error('A disposable database is required.')
const email = process.env.E2E_TEST_EMAIL!
if (!/^e2e-[a-f0-9-]+@example\.test$/.test(email)) throw new Error('Invalid test user.')
const payload = await getPayload({ config })
try {
  if (process.argv[2] === 'create') await payload.create({ collection: 'users', data: {email, password: process.env.E2E_TEST_PASSWORD!} })
  else if (process.argv[2] === 'delete') await payload.delete({collection: 'users', where: {email: {equals: email}}})
  else throw new Error('Unknown action')
} finally { await payload.destroy() }
process.exit(0)
