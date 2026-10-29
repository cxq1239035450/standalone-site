import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DO $$ BEGIN CREATE TYPE "public"."enum_products_pricing_unit" AS ENUM('kg', 'jin', 'box', 'piece', 'bag', 'ton'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_products_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__products_v_version_pricing_unit" AS ENUM('kg', 'jin', 'box', 'piece', 'bag', 'ton'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__products_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__products_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_industry_templates_fields_type" AS ENUM('text', 'number', 'select'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_languages_direction" AS ENUM('ltr', 'rtl'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_site_copy_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__site_copy_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__site_copy_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_hero_links_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_hero_links_link_appearance" AS ENUM('default', 'outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_blocks_cta_links_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_blocks_cta_links_link_appearance" AS ENUM('default', 'outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_blocks_content_columns_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_blocks_content_columns_link_appearance" AS ENUM('default', 'outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_blocks_archive_populate_by" AS ENUM('collection', 'selection'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_blocks_archive_relation_to" AS ENUM('posts'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_pages_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_version_hero_links_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_version_hero_links_link_appearance" AS ENUM('default', 'outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_blocks_cta_links_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_blocks_cta_links_link_appearance" AS ENUM('default', 'outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_blocks_content_columns_size" AS ENUM('oneThird', 'half', 'twoThirds', 'full'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_blocks_content_columns_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_blocks_content_columns_link_appearance" AS ENUM('default', 'outline'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_blocks_archive_populate_by" AS ENUM('collection', 'selection'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_blocks_archive_relation_to" AS ENUM('posts'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_version_hero_type" AS ENUM('none', 'highImpact', 'mediumImpact', 'lowImpact'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_pages_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_posts_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_posts_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_posts_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_media_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_media_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_media_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_categories_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_categories_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_categories_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_products_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_products_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_products_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_industry_templates_fields_type" AS ENUM('text', 'number', 'select'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_industry_templates_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_industry_templates_v_version_fields_type" AS ENUM('text', 'number', 'select'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_industry_templates_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_industry_templates_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_forms_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_forms_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_forms_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_header_nav_items_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_header_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_header_v_version_nav_items_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_header_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_header_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_footer_nav_items_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_footer_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_footer_v_version_nav_items_link_type" AS ENUM('reference', 'custom'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_footer_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_footer_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum_tr_search_settings_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_search_settings_v_version_status" AS ENUM('draft', 'published'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN CREATE TYPE "public"."enum__tr_search_settings_v_published_locale" AS ENUM('zh', 'en'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "products_general_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar
  );

  CREATE TABLE IF NOT EXISTS "products" (
    "id" serial PRIMARY KEY NOT NULL,
    "discovery_no_index" boolean DEFAULT false,
    "industry_template_id" integer,
    "meta_image_id" integer,
    "sourcing_minimum_order_quantity" numeric,
    "general_hero_image_id" integer,
    "pricing_price" numeric,
    "pricing_unit" "enum_products_pricing_unit" DEFAULT 'piece',
    "pricing_stock" numeric,
    "pricing_sku" varchar,
    "organization_category_id" integer,
    "organization_featured" boolean DEFAULT false,
    "published_at" timestamp(3) with time zone,
    "generate_slug" boolean DEFAULT true,
    "slug" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "products_locales" (
    "discovery_summary" varchar,
    "technical_values" jsonb,
    "meta_title" varchar,
    "meta_description" varchar,
    "meta_target_markets" varchar,
    "meta_manufacturing_origin" varchar,
    "sourcing_materials" varchar,
    "sourcing_customization" varchar,
    "sourcing_lead_time" varchar,
    "title" varchar,
    "general_short_description" varchar,
    "general_description" jsonb,
    "_status" "enum_products_status" DEFAULT 'draft',
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "_products_v_version_general_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_products_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_discovery_no_index" boolean DEFAULT false,
    "version_industry_template_id" integer,
    "version_meta_image_id" integer,
    "version_sourcing_minimum_order_quantity" numeric,
    "version_general_hero_image_id" integer,
    "version_pricing_price" numeric,
    "version_pricing_unit" "enum__products_v_version_pricing_unit" DEFAULT 'piece',
    "version_pricing_stock" numeric,
    "version_pricing_sku" varchar,
    "version_organization_category_id" integer,
    "version_organization_featured" boolean DEFAULT false,
    "version_published_at" timestamp(3) with time zone,
    "version_generate_slug" boolean DEFAULT true,
    "version_slug" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__products_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "_products_v_locales" (
    "version_discovery_summary" varchar,
    "version_technical_values" jsonb,
    "version_meta_title" varchar,
    "version_meta_description" varchar,
    "version_meta_target_markets" varchar,
    "version_meta_manufacturing_origin" varchar,
    "version_sourcing_materials" varchar,
    "version_sourcing_customization" varchar,
    "version_sourcing_lead_time" varchar,
    "version_title" varchar,
    "version_general_short_description" varchar,
    "version_general_description" jsonb,
    "version__status" "enum__products_v_version_status" DEFAULT 'draft',
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "industry_templates_fields_options" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar
  );

  CREATE TABLE IF NOT EXISTS "industry_templates_fields_options_locales" (
    "label" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "industry_templates_fields" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "key" varchar NOT NULL,
    "type" "enum_industry_templates_fields_type" DEFAULT 'text' NOT NULL,
    "required" boolean DEFAULT false
  );

  CREATE TABLE IF NOT EXISTS "industry_templates_fields_locales" (
    "label" varchar NOT NULL,
    "unit" varchar,
    "placeholder" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "industry_templates" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "industry_templates_locales" (
    "section_title" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "languages" (
    "id" serial PRIMARY KEY NOT NULL,
    "code" varchar NOT NULL,
    "label" varchar NOT NULL,
    "html_lang" varchar,
    "direction" "enum_languages_direction" DEFAULT 'ltr' NOT NULL,
    "sort_order" numeric DEFAULT 0,
    "enabled" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "site_copy" (
    "id" serial PRIMARY KEY NOT NULL,
    "language_id" integer,
    "messages" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_site_copy_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_site_copy_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_language_id" integer,
    "version_messages" jsonb,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__site_copy_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__site_copy_v_published_locale",
    "latest" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_hero_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_type" "enum_tr_pages_hero_links_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "enum_tr_pages_hero_links_link_appearance"
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_blocks_cta_links" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_type" "enum_tr_pages_blocks_cta_links_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "enum_tr_pages_blocks_cta_links_link_appearance"
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "rich_text" jsonb,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_blocks_content_columns" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "size" "enum_tr_pages_blocks_content_columns_size",
    "rich_text" jsonb,
    "enable_link" boolean,
    "link_type" "enum_tr_pages_blocks_content_columns_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "enum_tr_pages_blocks_content_columns_link_appearance"
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_blocks_content" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_blocks_media_block" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "media_id" integer,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_blocks_archive" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "intro_content" jsonb,
    "populate_by" "enum_tr_pages_blocks_archive_populate_by",
    "relation_to" "enum_tr_pages_blocks_archive_relation_to",
    "limit" numeric,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_blocks_form_block" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "form_id" integer,
    "enable_intro" boolean,
    "intro_content" jsonb,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_pages" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer,
    "language_id" integer,
    "discovery_summary" varchar,
    "title" varchar,
    "hero_type" "enum_tr_pages_hero_type",
    "hero_rich_text" jsonb,
    "hero_media_id" integer,
    "meta_title" varchar,
    "meta_image_id" integer,
    "meta_description" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_pages_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "tr_pages_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer,
    "categories_id" integer
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_version_hero_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "link_type" "enum__tr_pages_v_version_hero_links_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "enum__tr_pages_v_version_hero_links_link_appearance",
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_blocks_cta_links" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "link_type" "enum__tr_pages_v_blocks_cta_links_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "enum__tr_pages_v_blocks_cta_links_link_appearance",
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_blocks_cta" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "rich_text" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_blocks_content_columns" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "size" "enum__tr_pages_v_blocks_content_columns_size",
    "rich_text" jsonb,
    "enable_link" boolean,
    "link_type" "enum__tr_pages_v_blocks_content_columns_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "link_appearance" "enum__tr_pages_v_blocks_content_columns_link_appearance",
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_blocks_content" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_blocks_media_block" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "media_id" integer,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_blocks_archive" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "intro_content" jsonb,
    "populate_by" "enum__tr_pages_v_blocks_archive_populate_by",
    "relation_to" "enum__tr_pages_v_blocks_archive_relation_to",
    "limit" numeric,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_blocks_form_block" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "form_id" integer,
    "enable_intro" boolean,
    "intro_content" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject_id" integer,
    "version_language_id" integer,
    "version_discovery_summary" varchar,
    "version_title" varchar,
    "version_hero_type" "enum__tr_pages_v_version_hero_type",
    "version_hero_rich_text" jsonb,
    "version_hero_media_id" integer,
    "version_meta_title" varchar,
    "version_meta_image_id" integer,
    "version_meta_description" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_pages_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_pages_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "_tr_pages_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer,
    "categories_id" integer
  );

  CREATE TABLE IF NOT EXISTS "tr_posts" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer,
    "language_id" integer,
    "discovery_summary" varchar,
    "title" varchar,
    "content" jsonb,
    "meta_title" varchar,
    "meta_image_id" integer,
    "meta_description" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_posts_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_tr_posts_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject_id" integer,
    "version_language_id" integer,
    "version_discovery_summary" varchar,
    "version_title" varchar,
    "version_content" jsonb,
    "version_meta_title" varchar,
    "version_meta_image_id" integer,
    "version_meta_description" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_posts_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_posts_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_media" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer,
    "language_id" integer,
    "alt" varchar,
    "caption" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_media_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_tr_media_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject_id" integer,
    "version_language_id" integer,
    "version_alt" varchar,
    "version_caption" jsonb,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_media_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_media_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_categories_breadcrumbs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "doc_id" integer,
    "url" varchar,
    "label" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_categories" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer,
    "language_id" integer,
    "title" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_categories_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_tr_categories_v_version_breadcrumbs" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "doc_id" integer,
    "url" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_categories_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject_id" integer,
    "version_language_id" integer,
    "version_title" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_categories_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_categories_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_products_general_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_products" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer,
    "language_id" integer,
    "discovery_summary" varchar,
    "technical_values" jsonb,
    "meta_title" varchar,
    "meta_description" varchar,
    "meta_target_markets" varchar,
    "meta_manufacturing_origin" varchar,
    "sourcing_materials" varchar,
    "sourcing_customization" varchar,
    "sourcing_lead_time" varchar,
    "title" varchar,
    "general_short_description" varchar,
    "general_description" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_products_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_tr_products_v_version_general_gallery" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "image_id" integer,
    "caption" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_products_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject_id" integer,
    "version_language_id" integer,
    "version_discovery_summary" varchar,
    "version_technical_values" jsonb,
    "version_meta_title" varchar,
    "version_meta_description" varchar,
    "version_meta_target_markets" varchar,
    "version_meta_manufacturing_origin" varchar,
    "version_sourcing_materials" varchar,
    "version_sourcing_customization" varchar,
    "version_sourcing_lead_time" varchar,
    "version_title" varchar,
    "version_general_short_description" varchar,
    "version_general_description" jsonb,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_products_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_products_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_industry_templates_fields_options" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_industry_templates_fields" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "key" varchar,
    "label" varchar,
    "type" "enum_tr_industry_templates_fields_type",
    "unit" varchar,
    "placeholder" varchar,
    "required" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_industry_templates" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer,
    "language_id" integer,
    "section_title" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_industry_templates_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_tr_industry_templates_v_version_fields_options" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "value" varchar,
    "label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_industry_templates_v_version_fields" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "key" varchar,
    "label" varchar,
    "type" "enum__tr_industry_templates_v_version_fields_type",
    "unit" varchar,
    "placeholder" varchar,
    "required" boolean,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_industry_templates_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject_id" integer,
    "version_language_id" integer,
    "version_section_title" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_industry_templates_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_industry_templates_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_checkbox" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "default_value" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_country" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_email" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_message" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "message" jsonb,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_number" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" numeric,
    "required" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_select_options" (
    "_order" integer NOT NULL,
    "_parent_id" varchar NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_select" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" varchar,
    "placeholder" varchar,
    "required" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_state" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" varchar,
    "required" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_blocks_textarea" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" varchar,
    "required" boolean,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_forms_emails" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "email_to" varchar,
    "cc" varchar,
    "bcc" varchar,
    "reply_to" varchar,
    "email_from" varchar,
    "subject" varchar,
    "message" jsonb
  );

  CREATE TABLE IF NOT EXISTS "tr_forms" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject_id" integer,
    "language_id" integer,
    "title" varchar,
    "submit_button_label" varchar,
    "confirmation_message" jsonb,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_forms_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_checkbox" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "default_value" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_country" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_email" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_message" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "message" jsonb,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_number" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" numeric,
    "required" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_select_options" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "label" varchar,
    "value" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_select" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" varchar,
    "placeholder" varchar,
    "required" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_state" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "required" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_text" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" varchar,
    "required" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_blocks_textarea" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_path" text NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "name" varchar,
    "label" varchar,
    "width" numeric,
    "default_value" varchar,
    "required" boolean,
    "_uuid" varchar,
    "block_name" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v_version_emails" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "email_to" varchar,
    "cc" varchar,
    "bcc" varchar,
    "reply_to" varchar,
    "email_from" varchar,
    "subject" varchar,
    "message" jsonb,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_forms_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject_id" integer,
    "version_language_id" integer,
    "version_title" varchar,
    "version_submit_button_label" varchar,
    "version_confirmation_message" jsonb,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_forms_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_forms_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "tr_header_nav_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_type" "enum_tr_header_nav_items_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_header" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject" varchar DEFAULT 'header',
    "language_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_header_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "tr_header_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer
  );

  CREATE TABLE IF NOT EXISTS "_tr_header_v_version_nav_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "link_type" "enum__tr_header_v_version_nav_items_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_header_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject" varchar DEFAULT 'header',
    "version_language_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_header_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_header_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "_tr_header_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer
  );

  CREATE TABLE IF NOT EXISTS "tr_footer_nav_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "link_type" "enum_tr_footer_nav_items_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_footer" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject" varchar DEFAULT 'footer',
    "language_id" integer,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_footer_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "tr_footer_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer
  );

  CREATE TABLE IF NOT EXISTS "_tr_footer_v_version_nav_items" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "link_type" "enum__tr_footer_v_version_nav_items_link_type",
    "link_new_tab" boolean,
    "link_url" varchar,
    "link_label" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_footer_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject" varchar DEFAULT 'footer',
    "version_language_id" integer,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_footer_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_footer_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "_tr_footer_v_rels" (
    "id" serial PRIMARY KEY NOT NULL,
    "order" integer,
    "parent_id" integer NOT NULL,
    "path" varchar NOT NULL,
    "pages_id" integer,
    "posts_id" integer
  );

  CREATE TABLE IF NOT EXISTS "tr_search_settings_geo_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar
  );

  CREATE TABLE IF NOT EXISTS "tr_search_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "subject" varchar DEFAULT 'search-settings',
    "language_id" integer,
    "site_name" varchar,
    "description" varchar,
    "organization_legal_name" varchar,
    "geo_summary" varchar,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "_status" "enum_tr_search_settings_status" DEFAULT 'draft'
  );

  CREATE TABLE IF NOT EXISTS "_tr_search_settings_v_version_geo_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" serial PRIMARY KEY NOT NULL,
    "question" varchar,
    "answer" varchar,
    "_uuid" varchar
  );

  CREATE TABLE IF NOT EXISTS "_tr_search_settings_v" (
    "id" serial PRIMARY KEY NOT NULL,
    "parent_id" integer,
    "version_subject" varchar DEFAULT 'search-settings',
    "version_language_id" integer,
    "version_site_name" varchar,
    "version_description" varchar,
    "version_organization_legal_name" varchar,
    "version_geo_summary" varchar,
    "version_updated_at" timestamp(3) with time zone,
    "version_created_at" timestamp(3) with time zone,
    "version__status" "enum__tr_search_settings_v_version_status" DEFAULT 'draft',
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "snapshot" boolean,
    "published_locale" "enum__tr_search_settings_v_published_locale",
    "latest" boolean,
    "autosave" boolean
  );

  CREATE TABLE IF NOT EXISTS "search_settings_organization_same_as" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "url" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "search_settings_geo_faq" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "_locale" "_locales" NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "question" varchar NOT NULL,
    "answer" varchar NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "search_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "site_name" varchar DEFAULT 'PawSupply',
    "site_url" varchar,
    "social_image_id" integer,
    "allow_indexing" boolean DEFAULT true,
    "organization_legal_name" varchar,
    "organization_email" varchar,
    "organization_telephone" varchar,
    "geo_enabled" boolean DEFAULT true,
    "geo_allow_a_i_training" boolean DEFAULT false,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  CREATE TABLE IF NOT EXISTS "search_settings_locales" (
    "description" varchar,
    "geo_summary" varchar,
    "id" serial PRIMARY KEY NOT NULL,
    "_locale" "_locales" NOT NULL,
    "_parent_id" integer NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "language_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "default_language_id" integer NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );



  ALTER TABLE "categories" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "forms" ALTER COLUMN "title" DROP NOT NULL;
  ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "discovery_no_index" boolean DEFAULT false;
  ALTER TABLE "pages_locales" ADD COLUMN IF NOT EXISTS "discovery_summary" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_discovery_no_index" boolean DEFAULT false;
  ALTER TABLE "_pages_v_locales" ADD COLUMN IF NOT EXISTS "version_discovery_summary" varchar;
  ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "discovery_no_index" boolean DEFAULT false;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "discovery_summary" varchar;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "title" varchar;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "content" jsonb;
  ALTER TABLE "posts_locales" ADD COLUMN IF NOT EXISTS "_status" "enum_posts_status" DEFAULT 'draft';
  ALTER TABLE "_posts_v" ADD COLUMN IF NOT EXISTS "version_discovery_no_index" boolean DEFAULT false;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version_discovery_summary" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version_title" varchar;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version_content" jsonb;
  ALTER TABLE "_posts_v_locales" ADD COLUMN IF NOT EXISTS "version__status" "enum__posts_v_version_status" DEFAULT 'draft';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "industry_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "languages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "site_copy_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_pages_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_posts_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_media_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_products_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_industry_templates_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_forms_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_header_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_footer_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "tr_search_settings_id" integer;
  ALTER TABLE "header" ADD COLUMN IF NOT EXISTS "use_custom_navigation" boolean DEFAULT false;
  ALTER TABLE "footer" ADD COLUMN IF NOT EXISTS "use_custom_navigation" boolean DEFAULT false;
  DO $$ BEGIN ALTER TABLE "products_general_gallery" ADD CONSTRAINT "products_general_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "products_general_gallery" ADD CONSTRAINT "products_general_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "products" ADD CONSTRAINT "products_industry_template_id_industry_templates_id_fk" FOREIGN KEY ("industry_template_id") REFERENCES "public"."industry_templates"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "products" ADD CONSTRAINT "products_general_hero_image_id_media_id_fk" FOREIGN KEY ("general_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "products" ADD CONSTRAINT "products_organization_category_id_categories_id_fk" FOREIGN KEY ("organization_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "products_locales" ADD CONSTRAINT "products_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v_version_general_gallery" ADD CONSTRAINT "_products_v_version_general_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v_version_general_gallery" ADD CONSTRAINT "_products_v_version_general_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_industry_template_id_industry_templates_id_fk" FOREIGN KEY ("version_industry_template_id") REFERENCES "public"."industry_templates"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_general_hero_image_id_media_id_fk" FOREIGN KEY ("version_general_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_organization_category_id_categories_id_fk" FOREIGN KEY ("version_organization_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_products_v_locales" ADD CONSTRAINT "_products_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "industry_templates_fields_options" ADD CONSTRAINT "industry_templates_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industry_templates_fields"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "industry_templates_fields_options_locales" ADD CONSTRAINT "industry_templates_fields_options_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industry_templates_fields_options"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "industry_templates_fields" ADD CONSTRAINT "industry_templates_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industry_templates"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "industry_templates_fields_locales" ADD CONSTRAINT "industry_templates_fields_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industry_templates_fields"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "industry_templates_locales" ADD CONSTRAINT "industry_templates_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."industry_templates"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "site_copy" ADD CONSTRAINT "site_copy_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_site_copy_v" ADD CONSTRAINT "_site_copy_v_parent_id_site_copy_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_copy"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_site_copy_v" ADD CONSTRAINT "_site_copy_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_hero_links" ADD CONSTRAINT "tr_pages_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_cta_links" ADD CONSTRAINT "tr_pages_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_cta" ADD CONSTRAINT "tr_pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_content_columns" ADD CONSTRAINT "tr_pages_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages_blocks_content"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_content" ADD CONSTRAINT "tr_pages_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_media_block" ADD CONSTRAINT "tr_pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_media_block" ADD CONSTRAINT "tr_pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_archive" ADD CONSTRAINT "tr_pages_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_form_block" ADD CONSTRAINT "tr_pages_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_blocks_form_block" ADD CONSTRAINT "tr_pages_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages" ADD CONSTRAINT "tr_pages_subject_id_pages_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages" ADD CONSTRAINT "tr_pages_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages" ADD CONSTRAINT "tr_pages_hero_media_id_media_id_fk" FOREIGN KEY ("hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages" ADD CONSTRAINT "tr_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_rels" ADD CONSTRAINT "tr_pages_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_rels" ADD CONSTRAINT "tr_pages_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_rels" ADD CONSTRAINT "tr_pages_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_pages_rels" ADD CONSTRAINT "tr_pages_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_version_hero_links" ADD CONSTRAINT "_tr_pages_v_version_hero_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_cta_links" ADD CONSTRAINT "_tr_pages_v_blocks_cta_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_cta" ADD CONSTRAINT "_tr_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_content_columns" ADD CONSTRAINT "_tr_pages_v_blocks_content_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v_blocks_content"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_content" ADD CONSTRAINT "_tr_pages_v_blocks_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_media_block" ADD CONSTRAINT "_tr_pages_v_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_media_block" ADD CONSTRAINT "_tr_pages_v_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_archive" ADD CONSTRAINT "_tr_pages_v_blocks_archive_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_form_block" ADD CONSTRAINT "_tr_pages_v_blocks_form_block_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_blocks_form_block" ADD CONSTRAINT "_tr_pages_v_blocks_form_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v" ADD CONSTRAINT "_tr_pages_v_parent_id_tr_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_pages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v" ADD CONSTRAINT "_tr_pages_v_version_subject_id_pages_id_fk" FOREIGN KEY ("version_subject_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v" ADD CONSTRAINT "_tr_pages_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v" ADD CONSTRAINT "_tr_pages_v_version_hero_media_id_media_id_fk" FOREIGN KEY ("version_hero_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v" ADD CONSTRAINT "_tr_pages_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_rels" ADD CONSTRAINT "_tr_pages_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tr_pages_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_rels" ADD CONSTRAINT "_tr_pages_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_rels" ADD CONSTRAINT "_tr_pages_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_pages_v_rels" ADD CONSTRAINT "_tr_pages_v_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_posts" ADD CONSTRAINT "tr_posts_subject_id_posts_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_posts" ADD CONSTRAINT "tr_posts_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_posts" ADD CONSTRAINT "tr_posts_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_posts_v" ADD CONSTRAINT "_tr_posts_v_parent_id_tr_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_posts"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_posts_v" ADD CONSTRAINT "_tr_posts_v_version_subject_id_posts_id_fk" FOREIGN KEY ("version_subject_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_posts_v" ADD CONSTRAINT "_tr_posts_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_posts_v" ADD CONSTRAINT "_tr_posts_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_media" ADD CONSTRAINT "tr_media_subject_id_media_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_media" ADD CONSTRAINT "tr_media_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_media_v" ADD CONSTRAINT "_tr_media_v_parent_id_tr_media_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_media_v" ADD CONSTRAINT "_tr_media_v_version_subject_id_media_id_fk" FOREIGN KEY ("version_subject_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_media_v" ADD CONSTRAINT "_tr_media_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_categories_breadcrumbs" ADD CONSTRAINT "tr_categories_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_categories_breadcrumbs" ADD CONSTRAINT "tr_categories_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_categories"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_categories" ADD CONSTRAINT "tr_categories_subject_id_categories_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_categories" ADD CONSTRAINT "tr_categories_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_categories_v_version_breadcrumbs" ADD CONSTRAINT "_tr_categories_v_version_breadcrumbs_doc_id_categories_id_fk" FOREIGN KEY ("doc_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_categories_v_version_breadcrumbs" ADD CONSTRAINT "_tr_categories_v_version_breadcrumbs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_categories_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_categories_v" ADD CONSTRAINT "_tr_categories_v_parent_id_tr_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_categories_v" ADD CONSTRAINT "_tr_categories_v_version_subject_id_categories_id_fk" FOREIGN KEY ("version_subject_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_categories_v" ADD CONSTRAINT "_tr_categories_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_products_general_gallery" ADD CONSTRAINT "tr_products_general_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_products_general_gallery" ADD CONSTRAINT "tr_products_general_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_products" ADD CONSTRAINT "tr_products_subject_id_products_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_products" ADD CONSTRAINT "tr_products_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_products_v_version_general_gallery" ADD CONSTRAINT "_tr_products_v_version_general_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_products_v_version_general_gallery" ADD CONSTRAINT "_tr_products_v_version_general_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_products_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_products_v" ADD CONSTRAINT "_tr_products_v_parent_id_tr_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_products"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_products_v" ADD CONSTRAINT "_tr_products_v_version_subject_id_products_id_fk" FOREIGN KEY ("version_subject_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_products_v" ADD CONSTRAINT "_tr_products_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_industry_templates_fields_options" ADD CONSTRAINT "tr_industry_templates_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_industry_templates_fields"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_industry_templates_fields" ADD CONSTRAINT "tr_industry_templates_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_industry_templates"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_industry_templates" ADD CONSTRAINT "tr_industry_templates_subject_id_industry_templates_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."industry_templates"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_industry_templates" ADD CONSTRAINT "tr_industry_templates_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_industry_templates_v_version_fields_options" ADD CONSTRAINT "_tr_industry_templates_v_version_fields_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_industry_templates_v_version_fields"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_industry_templates_v_version_fields" ADD CONSTRAINT "_tr_industry_templates_v_version_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_industry_templates_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_industry_templates_v" ADD CONSTRAINT "_tr_industry_templates_v_parent_id_tr_industry_templates_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_industry_templates"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_industry_templates_v" ADD CONSTRAINT "_tr_industry_templates_v_version_subject_id_industry_templates_id_fk" FOREIGN KEY ("version_subject_id") REFERENCES "public"."industry_templates"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_industry_templates_v" ADD CONSTRAINT "_tr_industry_templates_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_checkbox" ADD CONSTRAINT "tr_forms_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_country" ADD CONSTRAINT "tr_forms_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_email" ADD CONSTRAINT "tr_forms_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_message" ADD CONSTRAINT "tr_forms_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_number" ADD CONSTRAINT "tr_forms_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_select_options" ADD CONSTRAINT "tr_forms_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms_blocks_select"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_select" ADD CONSTRAINT "tr_forms_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_state" ADD CONSTRAINT "tr_forms_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_text" ADD CONSTRAINT "tr_forms_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_blocks_textarea" ADD CONSTRAINT "tr_forms_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms_emails" ADD CONSTRAINT "tr_forms_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms" ADD CONSTRAINT "tr_forms_subject_id_forms_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_forms" ADD CONSTRAINT "tr_forms_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_checkbox" ADD CONSTRAINT "_tr_forms_v_blocks_checkbox_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_country" ADD CONSTRAINT "_tr_forms_v_blocks_country_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_email" ADD CONSTRAINT "_tr_forms_v_blocks_email_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_message" ADD CONSTRAINT "_tr_forms_v_blocks_message_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_number" ADD CONSTRAINT "_tr_forms_v_blocks_number_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_select_options" ADD CONSTRAINT "_tr_forms_v_blocks_select_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v_blocks_select"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_select" ADD CONSTRAINT "_tr_forms_v_blocks_select_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_state" ADD CONSTRAINT "_tr_forms_v_blocks_state_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_text" ADD CONSTRAINT "_tr_forms_v_blocks_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_blocks_textarea" ADD CONSTRAINT "_tr_forms_v_blocks_textarea_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v_version_emails" ADD CONSTRAINT "_tr_forms_v_version_emails_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_forms_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v" ADD CONSTRAINT "_tr_forms_v_parent_id_tr_forms_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_forms"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v" ADD CONSTRAINT "_tr_forms_v_version_subject_id_forms_id_fk" FOREIGN KEY ("version_subject_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_forms_v" ADD CONSTRAINT "_tr_forms_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_header_nav_items" ADD CONSTRAINT "tr_header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_header"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_header" ADD CONSTRAINT "tr_header_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_header_rels" ADD CONSTRAINT "tr_header_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_header"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_header_rels" ADD CONSTRAINT "tr_header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_header_rels" ADD CONSTRAINT "tr_header_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_header_v_version_nav_items" ADD CONSTRAINT "_tr_header_v_version_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_header_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_header_v" ADD CONSTRAINT "_tr_header_v_parent_id_tr_header_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_header"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_header_v" ADD CONSTRAINT "_tr_header_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_header_v_rels" ADD CONSTRAINT "_tr_header_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tr_header_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_header_v_rels" ADD CONSTRAINT "_tr_header_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_header_v_rels" ADD CONSTRAINT "_tr_header_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_footer_nav_items" ADD CONSTRAINT "tr_footer_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_footer"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_footer" ADD CONSTRAINT "tr_footer_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_footer_rels" ADD CONSTRAINT "tr_footer_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_footer"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_footer_rels" ADD CONSTRAINT "tr_footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_footer_rels" ADD CONSTRAINT "tr_footer_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_footer_v_version_nav_items" ADD CONSTRAINT "_tr_footer_v_version_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_footer_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_footer_v" ADD CONSTRAINT "_tr_footer_v_parent_id_tr_footer_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_footer"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_footer_v" ADD CONSTRAINT "_tr_footer_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_footer_v_rels" ADD CONSTRAINT "_tr_footer_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tr_footer_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_footer_v_rels" ADD CONSTRAINT "_tr_footer_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_footer_v_rels" ADD CONSTRAINT "_tr_footer_v_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_search_settings_geo_faq" ADD CONSTRAINT "tr_search_settings_geo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."tr_search_settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "tr_search_settings" ADD CONSTRAINT "tr_search_settings_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_search_settings_v_version_geo_faq" ADD CONSTRAINT "_tr_search_settings_v_version_geo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_tr_search_settings_v"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_search_settings_v" ADD CONSTRAINT "_tr_search_settings_v_parent_id_tr_search_settings_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tr_search_settings"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "_tr_search_settings_v" ADD CONSTRAINT "_tr_search_settings_v_version_language_id_languages_id_fk" FOREIGN KEY ("version_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "search_settings_organization_same_as" ADD CONSTRAINT "search_settings_organization_same_as_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "search_settings_geo_faq" ADD CONSTRAINT "search_settings_geo_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "search_settings" ADD CONSTRAINT "search_settings_social_image_id_media_id_fk" FOREIGN KEY ("social_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "search_settings_locales" ADD CONSTRAINT "search_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."search_settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "language_settings" ADD CONSTRAINT "language_settings_default_language_id_languages_id_fk" FOREIGN KEY ("default_language_id") REFERENCES "public"."languages"("id") ON DELETE set null ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "products_general_gallery_order_idx" ON "products_general_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "products_general_gallery_parent_id_idx" ON "products_general_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "products_general_gallery_image_idx" ON "products_general_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "products_industry_template_idx" ON "products" USING btree ("industry_template_id");
  CREATE INDEX IF NOT EXISTS "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "products_general_general_hero_image_idx" ON "products" USING btree ("general_hero_image_id");
  CREATE INDEX IF NOT EXISTS "products_organization_organization_category_idx" ON "products" USING btree ("organization_category_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "products__status_idx" ON "products_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "products_locales_locale_parent_id_unique" ON "products_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "_products_v_version_general_gallery_order_idx" ON "_products_v_version_general_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_products_v_version_general_gallery_parent_id_idx" ON "_products_v_version_general_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_products_v_version_general_gallery_image_idx" ON "_products_v_version_general_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_products_v_version_version_industry_template_idx" ON "_products_v" USING btree ("version_industry_template_id");
  CREATE INDEX IF NOT EXISTS "_products_v_version_meta_version_meta_image_idx" ON "_products_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_products_v_version_general_version_general_hero_image_idx" ON "_products_v" USING btree ("version_general_hero_image_id");
  CREATE INDEX IF NOT EXISTS "_products_v_version_organization_version_organization_ca_idx" ON "_products_v" USING btree ("version_organization_category_id");
  CREATE INDEX IF NOT EXISTS "_products_v_version_version_slug_idx" ON "_products_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_products_v_snapshot_idx" ON "_products_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_products_v_published_locale_idx" ON "_products_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_products_v_latest_idx" ON "_products_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "_products_v_version_version__status_idx" ON "_products_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX IF NOT EXISTS "_products_v_locales_locale_parent_id_unique" ON "_products_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "industry_templates_fields_options_order_idx" ON "industry_templates_fields_options" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "industry_templates_fields_options_parent_id_idx" ON "industry_templates_fields_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "industry_templates_fields_options_locales_locale_parent_id_u" ON "industry_templates_fields_options_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "industry_templates_fields_order_idx" ON "industry_templates_fields" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "industry_templates_fields_parent_id_idx" ON "industry_templates_fields" USING btree ("_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "industry_templates_fields_locales_locale_parent_id_unique" ON "industry_templates_fields_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "industry_templates_updated_at_idx" ON "industry_templates" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "industry_templates_created_at_idx" ON "industry_templates" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "industry_templates_locales_locale_parent_id_unique" ON "industry_templates_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "languages_code_idx" ON "languages" USING btree ("code");
  CREATE INDEX IF NOT EXISTS "languages_updated_at_idx" ON "languages" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "languages_created_at_idx" ON "languages" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "site_copy_language_idx" ON "site_copy" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "site_copy_updated_at_idx" ON "site_copy" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "site_copy_created_at_idx" ON "site_copy" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "site_copy__status_idx" ON "site_copy" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_parent_idx" ON "_site_copy_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_version_version_language_idx" ON "_site_copy_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_version_version_updated_at_idx" ON "_site_copy_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_version_version_created_at_idx" ON "_site_copy_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_version_version__status_idx" ON "_site_copy_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_created_at_idx" ON "_site_copy_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_updated_at_idx" ON "_site_copy_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_snapshot_idx" ON "_site_copy_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_published_locale_idx" ON "_site_copy_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_site_copy_v_latest_idx" ON "_site_copy_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "tr_pages_hero_links_order_idx" ON "tr_pages_hero_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_hero_links_parent_id_idx" ON "tr_pages_hero_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_cta_links_order_idx" ON "tr_pages_blocks_cta_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_cta_links_parent_id_idx" ON "tr_pages_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_cta_order_idx" ON "tr_pages_blocks_cta" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_cta_parent_id_idx" ON "tr_pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_cta_path_idx" ON "tr_pages_blocks_cta" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_content_columns_order_idx" ON "tr_pages_blocks_content_columns" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_content_columns_parent_id_idx" ON "tr_pages_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_content_order_idx" ON "tr_pages_blocks_content" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_content_parent_id_idx" ON "tr_pages_blocks_content" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_content_path_idx" ON "tr_pages_blocks_content" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_media_block_order_idx" ON "tr_pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_media_block_parent_id_idx" ON "tr_pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_media_block_path_idx" ON "tr_pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_media_block_media_idx" ON "tr_pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_archive_order_idx" ON "tr_pages_blocks_archive" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_archive_parent_id_idx" ON "tr_pages_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_archive_path_idx" ON "tr_pages_blocks_archive" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_form_block_order_idx" ON "tr_pages_blocks_form_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_form_block_parent_id_idx" ON "tr_pages_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_form_block_path_idx" ON "tr_pages_blocks_form_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_pages_blocks_form_block_form_idx" ON "tr_pages_blocks_form_block" USING btree ("form_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_subject_idx" ON "tr_pages" USING btree ("subject_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_language_idx" ON "tr_pages" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_hero_hero_media_idx" ON "tr_pages" USING btree ("hero_media_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_meta_meta_image_idx" ON "tr_pages" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_updated_at_idx" ON "tr_pages" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_pages_created_at_idx" ON "tr_pages" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_pages__status_idx" ON "tr_pages" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_idx" ON "tr_pages" USING btree ("subject_id","language_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_rels_order_idx" ON "tr_pages_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "tr_pages_rels_parent_idx" ON "tr_pages_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_rels_path_idx" ON "tr_pages_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "tr_pages_rels_pages_id_idx" ON "tr_pages_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_rels_posts_id_idx" ON "tr_pages_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "tr_pages_rels_categories_id_idx" ON "tr_pages_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_hero_links_order_idx" ON "_tr_pages_v_version_hero_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_hero_links_parent_id_idx" ON "_tr_pages_v_version_hero_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_cta_links_order_idx" ON "_tr_pages_v_blocks_cta_links" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_cta_links_parent_id_idx" ON "_tr_pages_v_blocks_cta_links" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_cta_order_idx" ON "_tr_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_cta_parent_id_idx" ON "_tr_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_cta_path_idx" ON "_tr_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_content_columns_order_idx" ON "_tr_pages_v_blocks_content_columns" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_content_columns_parent_id_idx" ON "_tr_pages_v_blocks_content_columns" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_content_order_idx" ON "_tr_pages_v_blocks_content" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_content_parent_id_idx" ON "_tr_pages_v_blocks_content" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_content_path_idx" ON "_tr_pages_v_blocks_content" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_media_block_order_idx" ON "_tr_pages_v_blocks_media_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_media_block_parent_id_idx" ON "_tr_pages_v_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_media_block_path_idx" ON "_tr_pages_v_blocks_media_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_media_block_media_idx" ON "_tr_pages_v_blocks_media_block" USING btree ("media_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_archive_order_idx" ON "_tr_pages_v_blocks_archive" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_archive_parent_id_idx" ON "_tr_pages_v_blocks_archive" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_archive_path_idx" ON "_tr_pages_v_blocks_archive" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_form_block_order_idx" ON "_tr_pages_v_blocks_form_block" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_form_block_parent_id_idx" ON "_tr_pages_v_blocks_form_block" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_form_block_path_idx" ON "_tr_pages_v_blocks_form_block" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_blocks_form_block_form_idx" ON "_tr_pages_v_blocks_form_block" USING btree ("form_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_parent_idx" ON "_tr_pages_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_version_subject_idx" ON "_tr_pages_v" USING btree ("version_subject_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_version_language_idx" ON "_tr_pages_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_hero_version_hero_media_idx" ON "_tr_pages_v" USING btree ("version_hero_media_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_meta_version_meta_image_idx" ON "_tr_pages_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_version_updated_at_idx" ON "_tr_pages_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_version_created_at_idx" ON "_tr_pages_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_version_version__status_idx" ON "_tr_pages_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_created_at_idx" ON "_tr_pages_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_updated_at_idx" ON "_tr_pages_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_snapshot_idx" ON "_tr_pages_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_published_locale_idx" ON "_tr_pages_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_latest_idx" ON "_tr_pages_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_autosave_idx" ON "_tr_pages_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_idx" ON "_tr_pages_v" USING btree ("version_subject_id","version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_rels_order_idx" ON "_tr_pages_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_rels_parent_idx" ON "_tr_pages_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_rels_path_idx" ON "_tr_pages_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_rels_pages_id_idx" ON "_tr_pages_v_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_rels_posts_id_idx" ON "_tr_pages_v_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "_tr_pages_v_rels_categories_id_idx" ON "_tr_pages_v_rels" USING btree ("categories_id");
  CREATE INDEX IF NOT EXISTS "tr_posts_subject_idx" ON "tr_posts" USING btree ("subject_id");
  CREATE INDEX IF NOT EXISTS "tr_posts_language_idx" ON "tr_posts" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_posts_meta_meta_image_idx" ON "tr_posts" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "tr_posts_updated_at_idx" ON "tr_posts" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_posts_created_at_idx" ON "tr_posts" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_posts__status_idx" ON "tr_posts" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_1_idx" ON "tr_posts" USING btree ("subject_id","language_id");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_parent_idx" ON "_tr_posts_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_version_version_subject_idx" ON "_tr_posts_v" USING btree ("version_subject_id");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_version_version_language_idx" ON "_tr_posts_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_version_meta_version_meta_image_idx" ON "_tr_posts_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_version_version_updated_at_idx" ON "_tr_posts_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_version_version_created_at_idx" ON "_tr_posts_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_version_version__status_idx" ON "_tr_posts_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_created_at_idx" ON "_tr_posts_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_updated_at_idx" ON "_tr_posts_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_snapshot_idx" ON "_tr_posts_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_published_locale_idx" ON "_tr_posts_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_latest_idx" ON "_tr_posts_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_posts_v_autosave_idx" ON "_tr_posts_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_1_idx" ON "_tr_posts_v" USING btree ("version_subject_id","version_language_id");
  CREATE INDEX IF NOT EXISTS "tr_media_subject_idx" ON "tr_media" USING btree ("subject_id");
  CREATE INDEX IF NOT EXISTS "tr_media_language_idx" ON "tr_media" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_media_updated_at_idx" ON "tr_media" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_media_created_at_idx" ON "tr_media" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_media__status_idx" ON "tr_media" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_2_idx" ON "tr_media" USING btree ("subject_id","language_id");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_parent_idx" ON "_tr_media_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_version_version_subject_idx" ON "_tr_media_v" USING btree ("version_subject_id");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_version_version_language_idx" ON "_tr_media_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_version_version_updated_at_idx" ON "_tr_media_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_version_version_created_at_idx" ON "_tr_media_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_version_version__status_idx" ON "_tr_media_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_created_at_idx" ON "_tr_media_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_updated_at_idx" ON "_tr_media_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_snapshot_idx" ON "_tr_media_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_published_locale_idx" ON "_tr_media_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_latest_idx" ON "_tr_media_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_media_v_autosave_idx" ON "_tr_media_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_2_idx" ON "_tr_media_v" USING btree ("version_subject_id","version_language_id");
  CREATE INDEX IF NOT EXISTS "tr_categories_breadcrumbs_order_idx" ON "tr_categories_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_categories_breadcrumbs_parent_id_idx" ON "tr_categories_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_categories_breadcrumbs_doc_idx" ON "tr_categories_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX IF NOT EXISTS "tr_categories_subject_idx" ON "tr_categories" USING btree ("subject_id");
  CREATE INDEX IF NOT EXISTS "tr_categories_language_idx" ON "tr_categories" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_categories_updated_at_idx" ON "tr_categories" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_categories_created_at_idx" ON "tr_categories" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_categories__status_idx" ON "tr_categories" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_3_idx" ON "tr_categories" USING btree ("subject_id","language_id");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_breadcrumbs_order_idx" ON "_tr_categories_v_version_breadcrumbs" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_breadcrumbs_parent_id_idx" ON "_tr_categories_v_version_breadcrumbs" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_breadcrumbs_doc_idx" ON "_tr_categories_v_version_breadcrumbs" USING btree ("doc_id");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_parent_idx" ON "_tr_categories_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_version_subject_idx" ON "_tr_categories_v" USING btree ("version_subject_id");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_version_language_idx" ON "_tr_categories_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_version_updated_at_idx" ON "_tr_categories_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_version_created_at_idx" ON "_tr_categories_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_version_version__status_idx" ON "_tr_categories_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_created_at_idx" ON "_tr_categories_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_updated_at_idx" ON "_tr_categories_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_snapshot_idx" ON "_tr_categories_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_published_locale_idx" ON "_tr_categories_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_latest_idx" ON "_tr_categories_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_categories_v_autosave_idx" ON "_tr_categories_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_3_idx" ON "_tr_categories_v" USING btree ("version_subject_id","version_language_id");
  CREATE INDEX IF NOT EXISTS "tr_products_general_gallery_order_idx" ON "tr_products_general_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_products_general_gallery_parent_id_idx" ON "tr_products_general_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_products_general_gallery_image_idx" ON "tr_products_general_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "tr_products_subject_idx" ON "tr_products" USING btree ("subject_id");
  CREATE INDEX IF NOT EXISTS "tr_products_language_idx" ON "tr_products" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_products_updated_at_idx" ON "tr_products" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_products_created_at_idx" ON "tr_products" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_products__status_idx" ON "tr_products" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_4_idx" ON "tr_products" USING btree ("subject_id","language_id");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_general_gallery_order_idx" ON "_tr_products_v_version_general_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_general_gallery_parent_id_idx" ON "_tr_products_v_version_general_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_general_gallery_image_idx" ON "_tr_products_v_version_general_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_parent_idx" ON "_tr_products_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_version_subject_idx" ON "_tr_products_v" USING btree ("version_subject_id");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_version_language_idx" ON "_tr_products_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_version_updated_at_idx" ON "_tr_products_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_version_created_at_idx" ON "_tr_products_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_version_version__status_idx" ON "_tr_products_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_created_at_idx" ON "_tr_products_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_updated_at_idx" ON "_tr_products_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_snapshot_idx" ON "_tr_products_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_published_locale_idx" ON "_tr_products_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_latest_idx" ON "_tr_products_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_products_v_autosave_idx" ON "_tr_products_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_4_idx" ON "_tr_products_v" USING btree ("version_subject_id","version_language_id");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_fields_options_order_idx" ON "tr_industry_templates_fields_options" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_fields_options_parent_id_idx" ON "tr_industry_templates_fields_options" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_fields_order_idx" ON "tr_industry_templates_fields" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_fields_parent_id_idx" ON "tr_industry_templates_fields" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_subject_idx" ON "tr_industry_templates" USING btree ("subject_id");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_language_idx" ON "tr_industry_templates" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_updated_at_idx" ON "tr_industry_templates" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates_created_at_idx" ON "tr_industry_templates" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_industry_templates__status_idx" ON "tr_industry_templates" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_5_idx" ON "tr_industry_templates" USING btree ("subject_id","language_id");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_fields_options_order_idx" ON "_tr_industry_templates_v_version_fields_options" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_fields_options_parent_id_idx" ON "_tr_industry_templates_v_version_fields_options" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_fields_order_idx" ON "_tr_industry_templates_v_version_fields" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_fields_parent_id_idx" ON "_tr_industry_templates_v_version_fields" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_parent_idx" ON "_tr_industry_templates_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_version_subject_idx" ON "_tr_industry_templates_v" USING btree ("version_subject_id");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_version_language_idx" ON "_tr_industry_templates_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_version_updated_at_idx" ON "_tr_industry_templates_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_version_created_at_idx" ON "_tr_industry_templates_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_version_version__status_idx" ON "_tr_industry_templates_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_created_at_idx" ON "_tr_industry_templates_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_updated_at_idx" ON "_tr_industry_templates_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_snapshot_idx" ON "_tr_industry_templates_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_published_locale_idx" ON "_tr_industry_templates_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_latest_idx" ON "_tr_industry_templates_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_industry_templates_v_autosave_idx" ON "_tr_industry_templates_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_5_idx" ON "_tr_industry_templates_v" USING btree ("version_subject_id","version_language_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_checkbox_order_idx" ON "tr_forms_blocks_checkbox" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_checkbox_parent_id_idx" ON "tr_forms_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_checkbox_path_idx" ON "tr_forms_blocks_checkbox" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_country_order_idx" ON "tr_forms_blocks_country" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_country_parent_id_idx" ON "tr_forms_blocks_country" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_country_path_idx" ON "tr_forms_blocks_country" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_email_order_idx" ON "tr_forms_blocks_email" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_email_parent_id_idx" ON "tr_forms_blocks_email" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_email_path_idx" ON "tr_forms_blocks_email" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_message_order_idx" ON "tr_forms_blocks_message" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_message_parent_id_idx" ON "tr_forms_blocks_message" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_message_path_idx" ON "tr_forms_blocks_message" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_number_order_idx" ON "tr_forms_blocks_number" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_number_parent_id_idx" ON "tr_forms_blocks_number" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_number_path_idx" ON "tr_forms_blocks_number" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_select_options_order_idx" ON "tr_forms_blocks_select_options" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_select_options_parent_id_idx" ON "tr_forms_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_select_order_idx" ON "tr_forms_blocks_select" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_select_parent_id_idx" ON "tr_forms_blocks_select" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_select_path_idx" ON "tr_forms_blocks_select" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_state_order_idx" ON "tr_forms_blocks_state" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_state_parent_id_idx" ON "tr_forms_blocks_state" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_state_path_idx" ON "tr_forms_blocks_state" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_text_order_idx" ON "tr_forms_blocks_text" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_text_parent_id_idx" ON "tr_forms_blocks_text" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_text_path_idx" ON "tr_forms_blocks_text" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_textarea_order_idx" ON "tr_forms_blocks_textarea" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_textarea_parent_id_idx" ON "tr_forms_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_blocks_textarea_path_idx" ON "tr_forms_blocks_textarea" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "tr_forms_emails_order_idx" ON "tr_forms_emails" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_forms_emails_parent_id_idx" ON "tr_forms_emails" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_subject_idx" ON "tr_forms" USING btree ("subject_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_language_idx" ON "tr_forms" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_forms_updated_at_idx" ON "tr_forms" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_forms_created_at_idx" ON "tr_forms" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_forms__status_idx" ON "tr_forms" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_6_idx" ON "tr_forms" USING btree ("subject_id","language_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_checkbox_order_idx" ON "_tr_forms_v_blocks_checkbox" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_checkbox_parent_id_idx" ON "_tr_forms_v_blocks_checkbox" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_checkbox_path_idx" ON "_tr_forms_v_blocks_checkbox" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_country_order_idx" ON "_tr_forms_v_blocks_country" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_country_parent_id_idx" ON "_tr_forms_v_blocks_country" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_country_path_idx" ON "_tr_forms_v_blocks_country" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_email_order_idx" ON "_tr_forms_v_blocks_email" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_email_parent_id_idx" ON "_tr_forms_v_blocks_email" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_email_path_idx" ON "_tr_forms_v_blocks_email" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_message_order_idx" ON "_tr_forms_v_blocks_message" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_message_parent_id_idx" ON "_tr_forms_v_blocks_message" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_message_path_idx" ON "_tr_forms_v_blocks_message" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_number_order_idx" ON "_tr_forms_v_blocks_number" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_number_parent_id_idx" ON "_tr_forms_v_blocks_number" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_number_path_idx" ON "_tr_forms_v_blocks_number" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_select_options_order_idx" ON "_tr_forms_v_blocks_select_options" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_select_options_parent_id_idx" ON "_tr_forms_v_blocks_select_options" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_select_order_idx" ON "_tr_forms_v_blocks_select" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_select_parent_id_idx" ON "_tr_forms_v_blocks_select" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_select_path_idx" ON "_tr_forms_v_blocks_select" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_state_order_idx" ON "_tr_forms_v_blocks_state" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_state_parent_id_idx" ON "_tr_forms_v_blocks_state" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_state_path_idx" ON "_tr_forms_v_blocks_state" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_text_order_idx" ON "_tr_forms_v_blocks_text" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_text_parent_id_idx" ON "_tr_forms_v_blocks_text" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_text_path_idx" ON "_tr_forms_v_blocks_text" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_textarea_order_idx" ON "_tr_forms_v_blocks_textarea" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_textarea_parent_id_idx" ON "_tr_forms_v_blocks_textarea" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_blocks_textarea_path_idx" ON "_tr_forms_v_blocks_textarea" USING btree ("_path");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_version_emails_order_idx" ON "_tr_forms_v_version_emails" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_version_emails_parent_id_idx" ON "_tr_forms_v_version_emails" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_parent_idx" ON "_tr_forms_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_version_version_subject_idx" ON "_tr_forms_v" USING btree ("version_subject_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_version_version_language_idx" ON "_tr_forms_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_version_version_updated_at_idx" ON "_tr_forms_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_version_version_created_at_idx" ON "_tr_forms_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_version_version__status_idx" ON "_tr_forms_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_created_at_idx" ON "_tr_forms_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_updated_at_idx" ON "_tr_forms_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_snapshot_idx" ON "_tr_forms_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_published_locale_idx" ON "_tr_forms_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_latest_idx" ON "_tr_forms_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_forms_v_autosave_idx" ON "_tr_forms_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_6_idx" ON "_tr_forms_v" USING btree ("version_subject_id","version_language_id");
  CREATE INDEX IF NOT EXISTS "tr_header_nav_items_order_idx" ON "tr_header_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_header_nav_items_parent_id_idx" ON "tr_header_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_header_language_idx" ON "tr_header" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_header_updated_at_idx" ON "tr_header" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_header_created_at_idx" ON "tr_header" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_header__status_idx" ON "tr_header" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_7_idx" ON "tr_header" USING btree ("subject","language_id");
  CREATE INDEX IF NOT EXISTS "tr_header_rels_order_idx" ON "tr_header_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "tr_header_rels_parent_idx" ON "tr_header_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "tr_header_rels_path_idx" ON "tr_header_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "tr_header_rels_pages_id_idx" ON "tr_header_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "tr_header_rels_posts_id_idx" ON "tr_header_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_version_nav_items_order_idx" ON "_tr_header_v_version_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_version_nav_items_parent_id_idx" ON "_tr_header_v_version_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_parent_idx" ON "_tr_header_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_version_version_language_idx" ON "_tr_header_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_version_version_updated_at_idx" ON "_tr_header_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_version_version_created_at_idx" ON "_tr_header_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_version_version__status_idx" ON "_tr_header_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_created_at_idx" ON "_tr_header_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_updated_at_idx" ON "_tr_header_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_snapshot_idx" ON "_tr_header_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_published_locale_idx" ON "_tr_header_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_latest_idx" ON "_tr_header_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_autosave_idx" ON "_tr_header_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_7_idx" ON "_tr_header_v" USING btree ("version_subject","version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_rels_order_idx" ON "_tr_header_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_rels_parent_idx" ON "_tr_header_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_rels_path_idx" ON "_tr_header_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_rels_pages_id_idx" ON "_tr_header_v_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "_tr_header_v_rels_posts_id_idx" ON "_tr_header_v_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "tr_footer_nav_items_order_idx" ON "tr_footer_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_footer_nav_items_parent_id_idx" ON "tr_footer_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_footer_language_idx" ON "tr_footer" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_footer_updated_at_idx" ON "tr_footer" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_footer_created_at_idx" ON "tr_footer" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_footer__status_idx" ON "tr_footer" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_8_idx" ON "tr_footer" USING btree ("subject","language_id");
  CREATE INDEX IF NOT EXISTS "tr_footer_rels_order_idx" ON "tr_footer_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "tr_footer_rels_parent_idx" ON "tr_footer_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "tr_footer_rels_path_idx" ON "tr_footer_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "tr_footer_rels_pages_id_idx" ON "tr_footer_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "tr_footer_rels_posts_id_idx" ON "tr_footer_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_version_nav_items_order_idx" ON "_tr_footer_v_version_nav_items" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_version_nav_items_parent_id_idx" ON "_tr_footer_v_version_nav_items" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_parent_idx" ON "_tr_footer_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_version_version_language_idx" ON "_tr_footer_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_version_version_updated_at_idx" ON "_tr_footer_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_version_version_created_at_idx" ON "_tr_footer_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_version_version__status_idx" ON "_tr_footer_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_created_at_idx" ON "_tr_footer_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_updated_at_idx" ON "_tr_footer_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_snapshot_idx" ON "_tr_footer_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_published_locale_idx" ON "_tr_footer_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_latest_idx" ON "_tr_footer_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_autosave_idx" ON "_tr_footer_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_8_idx" ON "_tr_footer_v" USING btree ("version_subject","version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_rels_order_idx" ON "_tr_footer_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_rels_parent_idx" ON "_tr_footer_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_rels_path_idx" ON "_tr_footer_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_rels_pages_id_idx" ON "_tr_footer_v_rels" USING btree ("pages_id");
  CREATE INDEX IF NOT EXISTS "_tr_footer_v_rels_posts_id_idx" ON "_tr_footer_v_rels" USING btree ("posts_id");
  CREATE INDEX IF NOT EXISTS "tr_search_settings_geo_faq_order_idx" ON "tr_search_settings_geo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "tr_search_settings_geo_faq_parent_id_idx" ON "tr_search_settings_geo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "tr_search_settings_language_idx" ON "tr_search_settings" USING btree ("language_id");
  CREATE INDEX IF NOT EXISTS "tr_search_settings_updated_at_idx" ON "tr_search_settings" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "tr_search_settings_created_at_idx" ON "tr_search_settings" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "tr_search_settings__status_idx" ON "tr_search_settings" USING btree ("_status");
  CREATE UNIQUE INDEX IF NOT EXISTS "subject_language_9_idx" ON "tr_search_settings" USING btree ("subject","language_id");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_version_geo_faq_order_idx" ON "_tr_search_settings_v_version_geo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_version_geo_faq_parent_id_idx" ON "_tr_search_settings_v_version_geo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_parent_idx" ON "_tr_search_settings_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_version_version_language_idx" ON "_tr_search_settings_v" USING btree ("version_language_id");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_version_version_updated_at_idx" ON "_tr_search_settings_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_version_version_created_at_idx" ON "_tr_search_settings_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_version_version__status_idx" ON "_tr_search_settings_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_created_at_idx" ON "_tr_search_settings_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_updated_at_idx" ON "_tr_search_settings_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_snapshot_idx" ON "_tr_search_settings_v" USING btree ("snapshot");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_published_locale_idx" ON "_tr_search_settings_v" USING btree ("published_locale");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_latest_idx" ON "_tr_search_settings_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_tr_search_settings_v_autosave_idx" ON "_tr_search_settings_v" USING btree ("autosave");
  CREATE INDEX IF NOT EXISTS "version_subject_version_language_9_idx" ON "_tr_search_settings_v" USING btree ("version_subject","version_language_id");
  CREATE INDEX IF NOT EXISTS "search_settings_organization_same_as_order_idx" ON "search_settings_organization_same_as" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "search_settings_organization_same_as_parent_id_idx" ON "search_settings_organization_same_as" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "search_settings_geo_faq_order_idx" ON "search_settings_geo_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "search_settings_geo_faq_parent_id_idx" ON "search_settings_geo_faq" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "search_settings_geo_faq_locale_idx" ON "search_settings_geo_faq" USING btree ("_locale");
  CREATE INDEX IF NOT EXISTS "search_settings_social_image_idx" ON "search_settings" USING btree ("social_image_id");
  CREATE UNIQUE INDEX IF NOT EXISTS "search_settings_locales_locale_parent_id_unique" ON "search_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX IF NOT EXISTS "language_settings_default_language_idx" ON "language_settings" USING btree ("default_language_id");
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industry_templates_fk" FOREIGN KEY ("industry_templates_id") REFERENCES "public"."industry_templates"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_languages_fk" FOREIGN KEY ("languages_id") REFERENCES "public"."languages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_site_copy_fk" FOREIGN KEY ("site_copy_id") REFERENCES "public"."site_copy"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_translations_fk" FOREIGN KEY ("tr_pages_id") REFERENCES "public"."tr_pages"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_translations_fk" FOREIGN KEY ("tr_posts_id") REFERENCES "public"."tr_posts"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_translations_fk" FOREIGN KEY ("tr_media_id") REFERENCES "public"."tr_media"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_translations_fk" FOREIGN KEY ("tr_categories_id") REFERENCES "public"."tr_categories"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_translations_fk" FOREIGN KEY ("tr_products_id") REFERENCES "public"."tr_products"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_industry_templates_translat_fk" FOREIGN KEY ("tr_industry_templates_id") REFERENCES "public"."tr_industry_templates"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_translations_fk" FOREIGN KEY ("tr_forms_id") REFERENCES "public"."tr_forms"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_header_translations_fk" FOREIGN KEY ("tr_header_id") REFERENCES "public"."tr_header"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_footer_translations_fk" FOREIGN KEY ("tr_footer_id") REFERENCES "public"."tr_footer"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_search_settings_translation_fk" FOREIGN KEY ("tr_search_settings_id") REFERENCES "public"."tr_search_settings"("id") ON DELETE cascade ON UPDATE no action; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE INDEX IF NOT EXISTS "posts__status_idx" ON "posts_locales" USING btree ("_status","_locale");
  CREATE INDEX IF NOT EXISTS "_posts_v_version_version__status_idx" ON "_posts_v_locales" USING btree ("version__status","_locale");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_industry_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("industry_templates_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_languages_id_idx" ON "payload_locked_documents_rels" USING btree ("languages_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_site_copy_id_idx" ON "payload_locked_documents_rels" USING btree ("site_copy_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_pages_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_posts_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_media_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_media_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_categories_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_products_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_products_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_industry_templates_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_industry_templates_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_forms_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_header_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_header_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_footer_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_footer_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_tr_search_settings_id_idx" ON "payload_locked_documents_rels" USING btree ("tr_search_settings_id");





  ALTER TABLE "form_submissions" ADD COLUMN IF NOT EXISTS "content_locale" varchar;
  -- Older releases stored article text directly on posts. Preserve it in place
  -- and backfill ONLY Chinese, never invent an English translation.
  DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'title') THEN
      INSERT INTO posts_locales (_locale, _parent_id, title, content, _status)
        SELECT 'zh', id, title, content, _status FROM posts
        ON CONFLICT (_locale, _parent_id) DO UPDATE SET
          _status = CASE WHEN posts_locales.title IS NULL THEN EXCLUDED._status ELSE posts_locales._status END,
          title = COALESCE(posts_locales.title, EXCLUDED.title),
          content = COALESCE(posts_locales.content, EXCLUDED.content);
      ALTER TABLE posts ALTER COLUMN title DROP NOT NULL;
      ALTER TABLE posts ALTER COLUMN content DROP NOT NULL;
      ALTER TABLE _posts_v ALTER COLUMN version_title DROP NOT NULL;
      ALTER TABLE _posts_v ALTER COLUMN version_content DROP NOT NULL;
    END IF;
  END $$;
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('This migration preserves legacy data. Roll back the application and restore the verified pre-migration database backup; automated down would destroy new translations.')
}
