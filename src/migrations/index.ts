import * as migration_20260818_035022 from './20260818_035022';
import * as migration_20261028_143927_dynamic_languages from './20261028_143927_dynamic_languages';

export const migrations = [
  {
    up: migration_20260818_035022.up,
    down: migration_20260818_035022.down,
    name: '20260818_035022',
  },
  {
    up: migration_20261028_143927_dynamic_languages.up,
    down: migration_20261028_143927_dynamic_languages.down,
    name: '20261028_143927_dynamic_languages'
  },
];
