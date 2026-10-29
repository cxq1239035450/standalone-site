import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "tr_pages" ADD COLUMN IF NOT EXISTS "migration_content_h_t_m_l" varchar;
  ALTER TABLE "tr_pages" ADD COLUMN IF NOT EXISTS "migration_summary" varchar;
  ALTER TABLE "tr_pages" ADD COLUMN IF NOT EXISTS "migration_attributes" jsonb;
  ALTER TABLE "_tr_pages_v" ADD COLUMN IF NOT EXISTS "version_migration_content_h_t_m_l" varchar;
  ALTER TABLE "_tr_pages_v" ADD COLUMN IF NOT EXISTS "version_migration_summary" varchar;
  ALTER TABLE "_tr_pages_v" ADD COLUMN IF NOT EXISTS "version_migration_attributes" jsonb;
  ALTER TABLE "tr_posts" ADD COLUMN IF NOT EXISTS "migration_content_h_t_m_l" varchar;
  ALTER TABLE "tr_posts" ADD COLUMN IF NOT EXISTS "migration_summary" varchar;
  ALTER TABLE "tr_posts" ADD COLUMN IF NOT EXISTS "migration_attributes" jsonb;
  ALTER TABLE "_tr_posts_v" ADD COLUMN IF NOT EXISTS "version_migration_content_h_t_m_l" varchar;
  ALTER TABLE "_tr_posts_v" ADD COLUMN IF NOT EXISTS "version_migration_summary" varchar;
  ALTER TABLE "_tr_posts_v" ADD COLUMN IF NOT EXISTS "version_migration_attributes" jsonb;
  ALTER TABLE "tr_categories" ADD COLUMN IF NOT EXISTS "migration_content_h_t_m_l" varchar;
  ALTER TABLE "tr_categories" ADD COLUMN IF NOT EXISTS "migration_summary" varchar;
  ALTER TABLE "tr_categories" ADD COLUMN IF NOT EXISTS "migration_attributes" jsonb;
  ALTER TABLE "tr_categories" ADD COLUMN IF NOT EXISTS "description" varchar;
  ALTER TABLE "tr_categories" ADD COLUMN IF NOT EXISTS "buyer_guide_summary" varchar;
  ALTER TABLE "tr_categories" ADD COLUMN IF NOT EXISTS "buyer_guide_selection_notes" varchar;
  ALTER TABLE "_tr_categories_v" ADD COLUMN IF NOT EXISTS "version_migration_content_h_t_m_l" varchar;
  ALTER TABLE "_tr_categories_v" ADD COLUMN IF NOT EXISTS "version_migration_summary" varchar;
  ALTER TABLE "_tr_categories_v" ADD COLUMN IF NOT EXISTS "version_migration_attributes" jsonb;
  ALTER TABLE "_tr_categories_v" ADD COLUMN IF NOT EXISTS "version_description" varchar;
  ALTER TABLE "_tr_categories_v" ADD COLUMN IF NOT EXISTS "version_buyer_guide_summary" varchar;
  ALTER TABLE "_tr_categories_v" ADD COLUMN IF NOT EXISTS "version_buyer_guide_selection_notes" varchar;
  ALTER TABLE "tr_products" ADD COLUMN IF NOT EXISTS "migration_content_h_t_m_l" varchar;
  ALTER TABLE "tr_products" ADD COLUMN IF NOT EXISTS "migration_summary" varchar;
  ALTER TABLE "tr_products" ADD COLUMN IF NOT EXISTS "migration_attributes" jsonb;
  ALTER TABLE "_tr_products_v" ADD COLUMN IF NOT EXISTS "version_migration_content_h_t_m_l" varchar;
  ALTER TABLE "_tr_products_v" ADD COLUMN IF NOT EXISTS "version_migration_summary" varchar;
  ALTER TABLE "_tr_products_v" ADD COLUMN IF NOT EXISTS "version_migration_attributes" jsonb;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error(
    'Restore the verified pre-migration backup; removing these columns would lose Yueli translations.',
  )
}
