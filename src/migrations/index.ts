import * as migration_20260708_223315_initial from './20260708_223315_initial';

export const migrations = [
  {
    up: migration_20260708_223315_initial.up,
    down: migration_20260708_223315_initial.down,
    name: '20260708_223315_initial'
  },
];
