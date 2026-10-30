import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)
const { Client } = createRequire(require.resolve('@payloadcms/db-postgres'))('pg')
const [mode, file] = process.argv.slice(2)
assert.ok(['before', 'after'].includes(mode) && file, 'Use before|after /private/report.json')
const connection = new URL(process.env.DATABASE_URL)
assert.match(connection.pathname, /^\/yueli(?:automation|_seo_mail_check_20261030)$/)
const client = new Client({ connectionString: connection.href })
const quote = value => '"' + value.replaceAll('"', '""') + '"'
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex')
await client.connect()
try {
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
  const migrationNames = (await client.query('SELECT name FROM payload_migrations ORDER BY id')).rows.map(row => row.name)
  const baseline = mode === 'after' ? JSON.parse(await fs.readFile(file, 'utf8')) : null
  const columns = (await client.query("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name,ordinal_position")).rows
  const tables = baseline?.tables || Object.fromEntries([...new Set(columns.map(row => row.table_name))].map(name => [name, { columns: columns.filter(row => row.table_name === name).map(row => row.column_name) }]))
  for (const [name, table] of Object.entries(tables)) {
    const filter = name === 'payload_migrations' && baseline ? ' WHERE name = ANY($1)' : ''
    const rows = (await client.query(`SELECT row_to_json(t)::text AS row FROM (SELECT ${table.columns.map(quote).join(',')} FROM ${quote(name)}${filter}) t ORDER BY row_to_json(t)::text`, filter ? [baseline.migrationNames] : [])).rows
    const actual = { count: rows.length, sha256: hash(rows) }
    if (baseline) assert.deepEqual(actual, { count: table.count, sha256: table.sha256 }, `Existing data changed: ${name}`)
    else Object.assign(table, actual)
  }
  if (!baseline) await fs.writeFile(file, JSON.stringify({ database: connection.pathname, migrationNames, tables }, null, 2), { mode: 0o600 })
  else {
    const settings = (await client.query('SELECT _status,site_url,allow_indexing,allow_crawling FROM search_settings')).rows
    assert.ok(settings.length && settings.every(row => row._status === 'published' && row.site_url === 'https://yueliautomation.com'))
    assert.ok((await client.query('SELECT enabled FROM inquiry_mail_settings')).rows.every(row => row.enabled === false))
    assert.equal(Number((await client.query('SELECT count(*) FROM forms WHERE mail_enabled IS DISTINCT FROM true OR mail_legacy IS DISTINCT FROM true')).rows[0].count), 0)
    for (const migration of ['20261030_050000_seo_discovery','20261030_060000_inquiry_mail_notifications','20261030_070000_form_mail_routing']) assert.ok(migrationNames.includes(migration))
    await fs.writeFile(file.replace(/\.json$/, '-verified.json'), JSON.stringify({ existingTablesPreserved: Object.keys(tables).length, currentTables: new Set(columns.map(row => row.table_name)).size, migrationNames, settings, verifiedAt: new Date().toISOString() }, null, 2), { mode: 0o600 })
  }
  await client.query('COMMIT')
  console.log(JSON.stringify({ mode, tables: Object.keys(tables).length, verified: true }))
} finally { await client.end() }
