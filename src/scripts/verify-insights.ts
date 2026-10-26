import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import assert from 'node:assert/strict'

// Read-only verification against the existing production build. Does not seed or migrate.
const token = randomBytes(32).toString('hex')
const child = spawn(process.execPath, ['--env-file=.env', 'node_modules/next/dist/bin/next', 'start', '-p', '3011', '-H', '127.0.0.1'], {
  cwd: process.cwd(),
  env: { ...process.env, NODE_ENV: 'production', INSIGHTS_ENABLED: 'true', INSIGHTS_SITE_ID: 'freshconnect', INSIGHTS_READ_TOKEN: token },
  stdio: ['ignore', 'pipe', 'pipe'],
})
let output = ''
child.stdout.on('data', chunk => { output = (output + chunk).slice(-4000) })
child.stderr.on('data', chunk => { output = (output + chunk).slice(-4000) })
const base = 'http://127.0.0.1:3011/api/insights/v1'
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Verification server exited before ready')
    try { if ((await fetch(`${base}/capabilities`, { signal: AbortSignal.timeout(2000) })).status === 401) { ready = true; break } } catch { /* starting */ }
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  assert.ok(ready, 'Private endpoint must return 401 without a token')
  const headers = { authorization: `Bearer ${token}` }
  const capabilities = await (await fetch(`${base}/capabilities`, { headers })).json()
  assert.equal(capabilities.siteId, 'freshconnect')
  for (const locale of ['zh', 'en']) for (const collection of ['pages', 'posts', 'products']) {
    const response = await fetch(`${base}/content?collection=${collection}&locale=${locale}`, { headers })
    assert.equal(response.status, 200)
    const data = await response.json()
    for (const record of data.records) {
      assert.equal(record.locale, locale)
      assert.equal(record.collection, collection)
      assert.deepEqual(Object.keys(record).sort(), ['collection', 'id', 'locale', 'title', 'updatedAt', 'url'])
    }
  }
  const response = await fetch(`${base}/submissions`, { headers })
  assert.equal(response.status, 200)
  for (const record of (await response.json()).records) assert.deepEqual(Object.keys(record).sort(), ['createdAt', 'formId', 'id'])
  assert.equal((await fetch('http://127.0.0.1:3011/zh/products')).status, 200)
  console.log('Read-only host integration passed: private endpoints, zh/en published projections, inquiry privacy, frontend response.')
} finally {
  child.kill()
}
