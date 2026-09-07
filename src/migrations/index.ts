import * as migration_20260708_223315_initial from './20260708_223315_initial';
import * as migration_20260907_190206_ical_status_fields from './20260907_190206_ical_status_fields';

export const migrations = [
  {
    up: migration_20260708_223315_initial.up,
    down: migration_20260708_223315_initial.down,
    name: '20260708_223315_initial',
  },
  {
    up: migration_20260907_190206_ical_status_fields.up,
    down: migration_20260907_190206_ical_status_fields.down,
    name: '20260907_190206_ical_status_fields'
  },
];
