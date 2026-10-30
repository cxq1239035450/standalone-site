import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_inquiry_mail_deliveries_kind" AS ENUM('test', 'inquiry');
  CREATE TYPE "public"."enum_inquiry_mail_deliveries_status" AS ENUM('pending', 'sending', 'sent', 'failed');
  ALTER TYPE "public"."enum_payload_jobs_log_task_slug" ADD VALUE 'sendInquiryMail' BEFORE 'schedulePublish';
  ALTER TYPE "public"."enum_payload_jobs_task_slug" ADD VALUE 'sendInquiryMail' BEFORE 'schedulePublish';
  CREATE TABLE "inquiry_mail_deliveries" (
    "id" serial PRIMARY KEY NOT NULL,
    "kind" "enum_inquiry_mail_deliveries_kind" NOT NULL,
    "dedupe_key" varchar NOT NULL,
    "submission_id" integer,
    "status" "enum_inquiry_mail_deliveries_status" DEFAULT 'pending' NOT NULL,
    "attempts" numeric DEFAULT 0,
    "recipients" jsonb NOT NULL,
    "accepted_recipients" jsonb DEFAULT '[]'::jsonb,
    "from_email" varchar,
    "from_name" varchar,
    "subject" varchar NOT NULL,
    "body_text" varchar NOT NULL,
    "config_fingerprint" varchar NOT NULL,
    "last_error" varchar,
    "message_id" varchar,
    "sent_at" timestamp(3) with time zone,
    "confirmed_at" timestamp(3) with time zone,
    "started_at" timestamp(3) with time zone,
    "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  CREATE TABLE "inquiry_mail_settings_recipients" (
    "_order" integer NOT NULL,
    "_parent_id" integer NOT NULL,
    "id" varchar PRIMARY KEY NOT NULL,
    "email" varchar NOT NULL
  );

  CREATE TABLE "inquiry_mail_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "enabled" boolean DEFAULT false,
    "from_name" varchar DEFAULT '网站询盘' NOT NULL,
    "from_email" varchar,
    "subject_prefix" varchar DEFAULT '【网站新询盘】' NOT NULL,
    "updated_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone
  );

  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "inquiry_mail_deliveries_id" integer;
  ALTER TABLE "inquiry_mail_deliveries" ADD CONSTRAINT "inquiry_mail_deliveries_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiry_mail_settings_recipients" ADD CONSTRAINT "inquiry_mail_settings_recipients_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."inquiry_mail_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "inquiry_mail_deliveries_dedupe_key_idx" ON "inquiry_mail_deliveries" USING btree ("dedupe_key");
  CREATE INDEX "inquiry_mail_deliveries_submission_idx" ON "inquiry_mail_deliveries" USING btree ("submission_id");
  CREATE INDEX "inquiry_mail_deliveries_updated_at_idx" ON "inquiry_mail_deliveries" USING btree ("updated_at");
  CREATE INDEX "inquiry_mail_deliveries_created_at_idx" ON "inquiry_mail_deliveries" USING btree ("created_at");
  CREATE INDEX "inquiry_mail_settings_recipients_order_idx" ON "inquiry_mail_settings_recipients" USING btree ("_order");
  CREATE INDEX "inquiry_mail_settings_recipients_parent_id_idx" ON "inquiry_mail_settings_recipients" USING btree ("_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiry_mail_deliveries_fk" FOREIGN KEY ("inquiry_mail_deliveries_id") REFERENCES "public"."inquiry_mail_deliveries"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_inquiry_mail_deliveries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiry_mail_deliveries_id");
  WITH settings AS (
    INSERT INTO inquiry_mail_settings (enabled, from_name, subject_prefix, created_at, updated_at)
    VALUES (false, '网站询盘', '【网站新询盘】', now(), now()) RETURNING id
  ) INSERT INTO inquiry_mail_settings_recipients (_order, _parent_id, id, email)
    SELECT 0, id, 'default-recipient', '1239035450@qq.com' FROM settings;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Inquiry mail delivery history is retained. Restore the verified database backup to roll back this migration.')
}
