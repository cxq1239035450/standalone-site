import * as formMail from './20261030_070000_form_mail_routing'
import * as seo from './20261030_050000_seo_discovery'
import * as inquiryMail from './20261030_060000_inquiry_mail_notifications'
import * as baseline from './20261030_010000_verified_baseline'
import * as languages from './20261030_020000_dynamic_languages'
import * as fields from './20261030_030000_translation_fields'
import * as brand from './20261030_040000_archive_search_brand'

export const migrations = [
  { ...baseline, name: '20261030_010000_verified_baseline' },
  { ...languages, name: '20261030_020000_dynamic_languages' },
  { ...fields, name: '20261030_030000_translation_fields' },
  { ...brand, name: '20261030_040000_archive_search_brand' },
  { ...seo, name: '20261030_050000_seo_discovery' },
  { ...inquiryMail, name: '20261030_060000_inquiry_mail_notifications' },
  { ...formMail, name: '20261030_070000_form_mail_routing' },
]
