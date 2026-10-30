import * as seo from './20261029_171455_seo_discovery'
import * as inquiryMail from './20261029_173915_inquiry_mail_notifications'
import * as migration_20260818_035022 from './20260818_035022'
import * as migration_20261028_143927_dynamic_languages from './20261028_143927_dynamic_languages'
import * as migration_20261030_001800_yueli_translation_fields from './20261030_001800_yueli_translation_fields'

export const migrations = [
  {
    up: migration_20260818_035022.up,
    down: migration_20260818_035022.down,
    name: '20260818_035022',
  },
  {
    up: migration_20261028_143927_dynamic_languages.up,
    down: migration_20261028_143927_dynamic_languages.down,
    name: '20261028_143927_dynamic_languages',
  },
  {
    up: migration_20261030_001800_yueli_translation_fields.up,
    down: migration_20261030_001800_yueli_translation_fields.down,
    name: '20261030_001800_yueli_translation_fields',
  },
  { ...seo, name: '20261029_171455_seo_discovery' },
  { ...inquiryMail, name: '20261029_173915_inquiry_mail_notifications' },
]
