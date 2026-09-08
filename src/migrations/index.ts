import * as migration_20260708_223315_initial from './20260708_223315_initial';
import * as migration_20260907_190206_ical_status_fields from './20260907_190206_ical_status_fields';
import * as migration_20260908_022125_pages_requests_brandguide from './20260908_022125_pages_requests_brandguide';
import * as migration_20260908_033826_booking_is_test from './20260908_033826_booking_is_test';
import * as migration_20260908_043743_guests from './20260908_043743_guests';

export const migrations = [
  {
    up: migration_20260708_223315_initial.up,
    down: migration_20260708_223315_initial.down,
    name: '20260708_223315_initial',
  },
  {
    up: migration_20260907_190206_ical_status_fields.up,
    down: migration_20260907_190206_ical_status_fields.down,
    name: '20260907_190206_ical_status_fields',
  },
  {
    up: migration_20260908_022125_pages_requests_brandguide.up,
    down: migration_20260908_022125_pages_requests_brandguide.down,
    name: '20260908_022125_pages_requests_brandguide',
  },
  {
    up: migration_20260908_033826_booking_is_test.up,
    down: migration_20260908_033826_booking_is_test.down,
    name: '20260908_033826_booking_is_test',
  },
  {
    up: migration_20260908_043743_guests.up,
    down: migration_20260908_043743_guests.down,
    name: '20260908_043743_guests'
  },
];
