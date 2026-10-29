import { createHash } from 'node:crypto'

// No row data, OIDs, owners or credentials: identical after pg_dump / pg_restore.
export const schemaQuery = `
SELECT jsonb_build_object(
  'columns', (SELECT jsonb_agg(to_jsonb(x) ORDER BY x.table_name, x.ordinal_position) FROM (
    SELECT table_name, ordinal_position, column_name, data_type, udt_name,
      is_nullable, column_default, character_maximum_length, numeric_precision,
      numeric_scale, datetime_precision, is_identity, identity_generation
    FROM information_schema.columns WHERE table_schema = 'public'
  ) x),
  'enums', (SELECT jsonb_agg(to_jsonb(x) ORDER BY x.name, x.position) FROM (
    SELECT t.typname name, e.enumsortorder position, e.enumlabel label
    FROM pg_type t JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public'
  ) x),
  'constraints', (SELECT jsonb_agg(to_jsonb(x) ORDER BY x.table_name, x.name) FROM (
    SELECT c.relname table_name, co.conname name, co.contype type,
      pg_get_constraintdef(co.oid) definition, co.convalidated validated
    FROM pg_constraint co JOIN pg_class c ON c.oid = co.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public'
  ) x),
  'indexes', (SELECT jsonb_agg(to_jsonb(x) ORDER BY x.tablename, x.indexname) FROM (
    SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname = 'public'
  ) x),
  'sequences', (SELECT jsonb_agg(to_jsonb(x) ORDER BY x.sequence_name) FROM (
    SELECT sequence_name, data_type, start_value, minimum_value, maximum_value, increment, cycle_option
    FROM information_schema.sequences WHERE sequence_schema = 'public'
  ) x),
  'triggers', (SELECT jsonb_agg(to_jsonb(x) ORDER BY x.table_name, x.name) FROM (
    SELECT c.relname table_name, t.tgname name, pg_get_triggerdef(t.oid) definition
    FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND NOT t.tgisinternal
  ) x)
) AS snapshot`

export function schemaDigest(snapshot: unknown): string {
  return createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')
}

export function assertBaseline(actual: unknown, expected: unknown): void {
  if (schemaDigest(actual) !== schemaDigest(expected)) {
    throw new Error(
      'Yueli baseline mismatch. Stop and audit the schema; do not replay initialization or fabricate migration records.',
    )
  }
}
