import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_search_settings_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__search_settings_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__search_settings_v_published_locale" AS ENUM('zh', 'en');
  CREATE TABLE "tr_search_settings_geo_sections_links" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "tr_search_settings_geo_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar
  );

  CREATE TABLE "tr_search_settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer,
    "products_id" integer
  );

  CREATE TABLE "_tr_search_settings_v_version_geo_sections_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tr_search_settings_v_version_geo_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_tr_search_settings_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer,
    "products_id" integer
  );

  CREATE TABLE "search_settings_robots_rules" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "user_agent" varchar,
    "allow" varchar,
    "disallow" varchar
  );

  CREATE TABLE "search_settings_geo_sections_links" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar
  );

  CREATE TABLE "search_settings_geo_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "title" varchar
  );

  CREATE TABLE "search_settings_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "locale" "_locales",
    "pages_id" integer,
    "posts_id" integer,
    "products_id" integer
  );

  CREATE TABLE "_search_settings_v_version_robots_rules" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "user_agent" varchar,
    "allow" varchar,
    "disallow" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_search_settings_v_version_organization_same_as" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "url" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_search_settings_v_version_geo_sections_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "description" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_search_settings_v_version_geo_sections" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_search_settings_v_version_geo_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    "_uuid" varchar
  );

  CREATE TABLE "_search_settings_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "version_site_name" varchar DEFAULT 'PawSupply',
    "version_site_url" varchar,
    "version_social_image_id" integer,
    "version_allow_indexing" boolean DEFAULT true,
    "version_allow_crawling" boolean DEFAULT true,
    "version_sitemap_enabled" boolean DEFAULT true,
    "version_sitemap_include_core" boolean DEFAULT true,
    "version_sitemap_include_pages" boolean DEFAULT true,
    "version_sitemap_include_products" boolean DEFAULT true,
    "version_sitemap_include_posts" boolean DEFAULT true,
    "version_organization_legal_name" varchar,
    "version_organization_email" varchar,
    "version_organization_telephone" varchar,
    "version_geo_enabled" boolean DEFAULT true,
    "version_geo_allow_a_i_training" boolean DEFAULT false,
    "version__status" "enum__search_settings_v_version_status" DEFAULT 'draft',
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__search_settings_v_published_locale",
    "latest" boolean
  );

  CREATE TABLE "_search_settings_v_locales" (
    "version_description" varchar,
    "version_geo_summary" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE "_search_settings_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "locale" "_locales",
    "pages_id" integer,
    "posts_id" integer,
    "products_id" integer
  );

  ALTER TABLE "search_settings_organization_same_as" ALTER COLUMN "url" DROP NOT NULL;
  ALTER TABLE "search_settings_geo_faq" ALTER COLUMN "question" DROP NOT NULL;
  ALTER TABLE "search_settings_geo_faq" ALTER COLUMN "answer" DROP NOT NULL;
  ALTER TABLE "pages_locales" ADD COLUMN "discovery_canonical_url" varchar;
  ALTER TABLE "_pages_v_locales" ADD COLUMN "version_discovery_canonical_url" varchar;
  ALTER TABLE "posts_locales" ADD COLUMN "discovery_canonical_url" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN "version_discovery_canonical_url" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "discovery_canonical_url" varchar;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_discovery_canonical_url" varchar;
  ALTER TABLE "tr_pages" ADD COLUMN "discovery_canonical_url" varchar;
  ALTER TABLE "_tr_pages_v" ADD COLUMN "version_discovery_canonical_url" varchar;
  ALTER TABLE "tr_posts" ADD COLUMN "discovery_canonical_url" varchar;
  ALTER TABLE "_tr_posts_v" ADD COLUMN "version_discovery_canonical_url" varchar;
  ALTER TABLE "tr_products" ADD COLUMN "discovery_canonical_url" varchar;
  ALTER TABLE "_tr_products_v" ADD COLUMN "version_discovery_canonical_url" varchar;
  ALTER TABLE "search_settings" ADD COLUMN "allow_crawling" boolean DEFAULT true;
  ALTER TABLE "search_settings" ADD COLUMN "sitemap_enabled" boolean DEFAULT true;
  ALTER TABLE "search_settings" ADD COLUMN "sitemap_include_core" boolean DEFAULT true;
  ALTER TABLE "search_settings" ADD COLUMN "sitemap_include_pages" boolean DEFAULT true;
  ALTER TABLE "search_settings" ADD COLUMN "sitemap_include_products" boolean DEFAULT true;
  ALTER TABLE "search_settings" ADD COLUMN "sitemap_include_posts" boolean DEFAULT true;
  ALTER TABLE "search_settings" ADD COLUMN "_status" "enum_search_settings_status" DEFAULT 'draft';
  ALTER TABLE "tr_search_settings_geo_sections_links" ADD CONSTRAINT "tr_search_settings_geo_sections_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_search_settings_geo_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tr_search_settings_geo_sections" ADD CONSTRAINT "tr_search_settings_geo_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_search_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tr_search_settings_rels" ADD CONSTRAINT "tr_search_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_search_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tr_search_settings_rels" ADD CONSTRAINT "tr_search_settings_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tr_search_settings_rels" ADD CONSTRAINT "tr_search_settings_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "tr_search_settings_rels" ADD CONSTRAINT "tr_search_settings_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tr_search_settings_v_version_geo_sections_links" ADD CONSTRAINT "_tr_search_settings_v_version_geo_sections_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_search_settings_v_version_geo_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tr_search_settings_v_version_geo_sections" ADD CONSTRAINT "_tr_search_settings_v_version_geo_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tr_search_settings_v_rels" ADD CONSTRAINT "_tr_search_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tr_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tr_search_settings_v_rels" ADD CONSTRAINT "_tr_search_settings_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tr_search_settings_v_rels" ADD CONSTRAINT "_tr_search_settings_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tr_search_settings_v_rels" ADD CONSTRAINT "_tr_search_settings_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_settings_robots_rules" ADD CONSTRAINT "search_settings_robots_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_settings_geo_sections_links" ADD CONSTRAINT "search_settings_geo_sections_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_settings_geo_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_settings_geo_sections" ADD CONSTRAINT "search_settings_geo_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_settings_rels" ADD CONSTRAINT "search_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."search_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_settings_rels" ADD CONSTRAINT "search_settings_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_settings_rels" ADD CONSTRAINT "search_settings_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "search_settings_rels" ADD CONSTRAINT "search_settings_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_version_robots_rules" ADD CONSTRAINT "_search_settings_v_version_robots_rules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_version_organization_same_as" ADD CONSTRAINT "_search_settings_v_version_organization_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_version_geo_sections_links" ADD CONSTRAINT "_search_settings_v_version_geo_sections_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_search_settings_v_version_geo_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_version_geo_sections" ADD CONSTRAINT "_search_settings_v_version_geo_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_version_geo_faq" ADD CONSTRAINT "_search_settings_v_version_geo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v" ADD CONSTRAINT "_search_settings_v_version_social_image_id_media_id_fk" FOREIGN KEY ("version_social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_search_settings_v_locales" ADD CONSTRAINT "_search_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_rels" ADD CONSTRAINT "_search_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_search_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_rels" ADD CONSTRAINT "_search_settings_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_rels" ADD CONSTRAINT "_search_settings_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_search_settings_v_rels" ADD CONSTRAINT "_search_settings_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tr_search_settings_geo_sections_links_order_idx" ON "tr_search_settings_geo_sections_links" USING btree ("_order");
  CREATE INDEX "tr_search_settings_geo_sections_links_parent_id_idx" ON "tr_search_settings_geo_sections_links" USING btree ("_parent_id");
  CREATE INDEX "tr_search_settings_geo_sections_order_idx" ON "tr_search_settings_geo_sections" USING btree ("_order");
  CREATE INDEX "tr_search_settings_geo_sections_parent_id_idx" ON "tr_search_settings_geo_sections" USING btree ("_parent_id");
  CREATE INDEX "tr_search_settings_rels_order_idx" ON "tr_search_settings_rels" USING btree ("order");
  CREATE INDEX "tr_search_settings_rels_parent_idx" ON "tr_search_settings_rels" USING btree ("parent_id");
  CREATE INDEX "tr_search_settings_rels_path_idx" ON "tr_search_settings_rels" USING btree ("path");
  CREATE INDEX "tr_search_settings_rels_pages_id_idx" ON "tr_search_settings_rels" USING btree ("pages_id");
  CREATE INDEX "tr_search_settings_rels_posts_id_idx" ON "tr_search_settings_rels" USING btree ("posts_id");
  CREATE INDEX "tr_search_settings_rels_products_id_idx" ON "tr_search_settings_rels" USING btree ("products_id");
  CREATE INDEX "_tr_search_settings_v_version_geo_sections_links_order_idx" ON "_tr_search_settings_v_version_geo_sections_links" USING btree ("_order");
  CREATE INDEX "_tr_search_settings_v_version_geo_sections_links_parent_id_idx" ON "_tr_search_settings_v_version_geo_sections_links" USING btree ("_parent_id");
  CREATE INDEX "_tr_search_settings_v_version_geo_sections_order_idx" ON "_tr_search_settings_v_version_geo_sections" USING btree ("_order");
  CREATE INDEX "_tr_search_settings_v_version_geo_sections_parent_id_idx" ON "_tr_search_settings_v_version_geo_sections" USING btree ("_parent_id");
  CREATE INDEX "_tr_search_settings_v_rels_order_idx" ON "_tr_search_settings_v_rels" USING btree ("order");
  CREATE INDEX "_tr_search_settings_v_rels_parent_idx" ON "_tr_search_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_tr_search_settings_v_rels_path_idx" ON "_tr_search_settings_v_rels" USING btree ("path");
  CREATE INDEX "_tr_search_settings_v_rels_pages_id_idx" ON "_tr_search_settings_v_rels" USING btree ("pages_id");
  CREATE INDEX "_tr_search_settings_v_rels_posts_id_idx" ON "_tr_search_settings_v_rels" USING btree ("posts_id");
  CREATE INDEX "_tr_search_settings_v_rels_products_id_idx" ON "_tr_search_settings_v_rels" USING btree ("products_id");
  CREATE INDEX "search_settings_robots_rules_order_idx" ON "search_settings_robots_rules" USING btree ("_order");
  CREATE INDEX "search_settings_robots_rules_parent_id_idx" ON "search_settings_robots_rules" USING btree ("_parent_id");
  CREATE INDEX "search_settings_geo_sections_links_order_idx" ON "search_settings_geo_sections_links" USING btree ("_order");
  CREATE INDEX "search_settings_geo_sections_links_parent_id_idx" ON "search_settings_geo_sections_links" USING btree ("_parent_id");
  CREATE INDEX "search_settings_geo_sections_links_locale_idx" ON "search_settings_geo_sections_links" USING btree ("_locale");
  CREATE INDEX "search_settings_geo_sections_order_idx" ON "search_settings_geo_sections" USING btree ("_order");
  CREATE INDEX "search_settings_geo_sections_parent_id_idx" ON "search_settings_geo_sections" USING btree ("_parent_id");
  CREATE INDEX "search_settings_geo_sections_locale_idx" ON "search_settings_geo_sections" USING btree ("_locale");
  CREATE INDEX "search_settings_rels_order_idx" ON "search_settings_rels" USING btree ("order");
  CREATE INDEX "search_settings_rels_parent_idx" ON "search_settings_rels" USING btree ("parent_id");
  CREATE INDEX "search_settings_rels_path_idx" ON "search_settings_rels" USING btree ("path");
  CREATE INDEX "search_settings_rels_locale_idx" ON "search_settings_rels" USING btree ("locale");
  CREATE INDEX "search_settings_rels_pages_id_idx" ON "search_settings_rels" USING btree ("pages_id","locale");
  CREATE INDEX "search_settings_rels_posts_id_idx" ON "search_settings_rels" USING btree ("posts_id","locale");
  CREATE INDEX "search_settings_rels_products_id_idx" ON "search_settings_rels" USING btree ("products_id","locale");
  CREATE INDEX "_search_settings_v_version_robots_rules_order_idx" ON "_search_settings_v_version_robots_rules" USING btree ("_order");
  CREATE INDEX "_search_settings_v_version_robots_rules_parent_id_idx" ON "_search_settings_v_version_robots_rules" USING btree ("_parent_id");
  CREATE INDEX "_search_settings_v_version_organization_same_as_order_idx" ON "_search_settings_v_version_organization_same_as" USING btree ("_order");
  CREATE INDEX "_search_settings_v_version_organization_same_as_parent_id_idx" ON "_search_settings_v_version_organization_same_as" USING btree ("_parent_id");
  CREATE INDEX "_search_settings_v_version_geo_sections_links_order_idx" ON "_search_settings_v_version_geo_sections_links" USING btree ("_order");
  CREATE INDEX "_search_settings_v_version_geo_sections_links_parent_id_idx" ON "_search_settings_v_version_geo_sections_links" USING btree ("_parent_id");
  CREATE INDEX "_search_settings_v_version_geo_sections_links_locale_idx" ON "_search_settings_v_version_geo_sections_links" USING btree ("_locale");
  CREATE INDEX "_search_settings_v_version_geo_sections_order_idx" ON "_search_settings_v_version_geo_sections" USING btree ("_order");
  CREATE INDEX "_search_settings_v_version_geo_sections_parent_id_idx" ON "_search_settings_v_version_geo_sections" USING btree ("_parent_id");
  CREATE INDEX "_search_settings_v_version_geo_sections_locale_idx" ON "_search_settings_v_version_geo_sections" USING btree ("_locale");
  CREATE INDEX "_search_settings_v_version_geo_faq_order_idx" ON "_search_settings_v_version_geo_faq" USING btree ("_order");
  CREATE INDEX "_search_settings_v_version_geo_faq_parent_id_idx" ON "_search_settings_v_version_geo_faq" USING btree ("_parent_id");
  CREATE INDEX "_search_settings_v_version_geo_faq_locale_idx" ON "_search_settings_v_version_geo_faq" USING btree ("_locale");
  CREATE INDEX "_search_settings_v_version_version_social_image_idx" ON "_search_settings_v" USING btree ("version_social_image_id");
  CREATE INDEX "_search_settings_v_version_version__status_idx" ON "_search_settings_v" USING btree ("version__status");
  CREATE INDEX "_search_settings_v_created_at_idx" ON "_search_settings_v" USING btree ("created_at");
  CREATE INDEX "_search_settings_v_updated_at_idx" ON "_search_settings_v" USING btree ("updated_at");
  CREATE INDEX "_search_settings_v_snapshot_idx" ON "_search_settings_v" USING btree ("snapshot");
  CREATE INDEX "_search_settings_v_published_locale_idx" ON "_search_settings_v" USING btree ("published_locale");
  CREATE INDEX "_search_settings_v_latest_idx" ON "_search_settings_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_search_settings_v_locales_locale_parent_id_unique" ON "_search_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_search_settings_v_rels_order_idx" ON "_search_settings_v_rels" USING btree ("order");
  CREATE INDEX "_search_settings_v_rels_parent_idx" ON "_search_settings_v_rels" USING btree ("parent_id");
  CREATE INDEX "_search_settings_v_rels_path_idx" ON "_search_settings_v_rels" USING btree ("path");
  CREATE INDEX "_search_settings_v_rels_locale_idx" ON "_search_settings_v_rels" USING btree ("locale");
  CREATE INDEX "_search_settings_v_rels_pages_id_idx" ON "_search_settings_v_rels" USING btree ("pages_id","locale");
  CREATE INDEX "_search_settings_v_rels_posts_id_idx" ON "_search_settings_v_rels" USING btree ("posts_id","locale");
  CREATE INDEX "_search_settings_v_rels_products_id_idx" ON "_search_settings_v_rels" USING btree ("products_id","locale");
  CREATE INDEX "search_settings__status_idx" ON "search_settings" USING btree ("_status");

  -- Existing settings were live before drafts were introduced. Preserve their
  -- current behaviour and retain an initial published snapshot with arrays.
  UPDATE search_settings SET _status = 'published', allow_crawling = COALESCE(allow_indexing, true);
  INSERT INTO _search_settings_v (
    version_site_name, version_site_url, version_social_image_id,
    version_allow_indexing, version_allow_crawling,
    version_sitemap_enabled, version_sitemap_include_core, version_sitemap_include_pages,
    version_sitemap_include_products, version_sitemap_include_posts,
    version_organization_legal_name, version_organization_email, version_organization_telephone,
    version_geo_enabled, version_geo_allow_a_i_training, version__status,
    version_updated_at, version_created_at, latest
  ) SELECT site_name, site_url, social_image_id, allow_indexing, allow_crawling,
    sitemap_enabled, sitemap_include_core, sitemap_include_pages, sitemap_include_products, sitemap_include_posts,
    organization_legal_name, organization_email, organization_telephone, geo_enabled, geo_allow_a_i_training,
    'published', updated_at, created_at, true FROM search_settings ORDER BY id LIMIT 1;
  INSERT INTO _search_settings_v_locales (version_description, version_geo_summary, _locale, _parent_id)
    SELECT s.description, s.geo_summary, s._locale, v.id FROM search_settings_locales s
      CROSS JOIN _search_settings_v v WHERE s._parent_id = (SELECT id FROM search_settings ORDER BY id LIMIT 1);
  INSERT INTO _search_settings_v_version_organization_same_as (_order, _parent_id, url, _uuid)
    SELECT s._order, v.id, s.url, s.id FROM search_settings_organization_same_as s
      CROSS JOIN _search_settings_v v WHERE s._parent_id = (SELECT id FROM search_settings ORDER BY id LIMIT 1);
  INSERT INTO _search_settings_v_version_geo_faq (_order, _parent_id, _locale, question, answer, _uuid)
    SELECT s._order, v.id, s._locale, s.question, s.answer, s.id FROM search_settings_geo_faq s
      CROSS JOIN _search_settings_v v WHERE s._parent_id = (SELECT id FROM search_settings ORDER BY id LIMIT 1);
`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('SEO configuration history is retained. Restore the verified database backup to roll back this migration.')
}
