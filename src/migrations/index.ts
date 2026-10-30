import * as migration_20260818_035022 from './20260818_035022';
import * as migration_20261028_143927_dynamic_languages from './20261028_143927_dynamic_languages';
import * as migration_20261029_171455_seo_discovery from './20261029_171455_seo_discovery';
import * as migration_20261029_173915_inquiry_mail_notifications from './20261029_173915_inquiry_mail_notifications';
import * as migration_20261030_094707_form_mail_routing from './20261030_094707_form_mail_routing';

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
    up: migration_20261029_171455_seo_discovery.up,
    down: migration_20261029_171455_seo_discovery.down,
    name: '20261029_171455_seo_discovery',
  },
  {
    up: migration_20261029_173915_inquiry_mail_notifications.up,
    down: migration_20261029_173915_inquiry_mail_notifications.down,
    name: '20261029_173915_inquiry_mail_notifications',
  },
  {
    up: migration_20261030_094707_form_mail_routing.up,
    down: migration_20261030_094707_form_mail_routing.down,
    name: '20261030_094707_form_mail_routing'
  },
];
