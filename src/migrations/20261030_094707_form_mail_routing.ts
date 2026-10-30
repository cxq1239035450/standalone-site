import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_mail_mode" AS ENUM('inherit', 'custom');
  ALTER TABLE "inquiry_mail_deliveries" ADD COLUMN "form_i_d" numeric;
  ALTER TABLE "inquiry_mail_deliveries" ADD COLUMN "reply_to" varchar;
  ALTER TABLE "forms" ADD COLUMN "mail_enabled" boolean DEFAULT false;
  ALTER TABLE "forms" ADD COLUMN "mail_mode" "enum_forms_mail_mode" DEFAULT 'inherit';
  ALTER TABLE "forms" ADD COLUMN "mail_recipients" varchar;
  ALTER TABLE "forms" ADD COLUMN "mail_subject" varchar;
  ALTER TABLE "forms" ADD COLUMN "mail_reply_field" varchar;
  ALTER TABLE "forms" ADD COLUMN "mail_legacy" boolean DEFAULT false;
  UPDATE forms SET mail_enabled = true, mail_legacy = true;
  UPDATE inquiry_mail_deliveries d SET form_i_d = s.form_id FROM form_submissions s WHERE d.submission_id = s.id;`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  throw new Error('Restore a verified backup to roll back form mail routing. Existing delivery records must be preserved.')
}
