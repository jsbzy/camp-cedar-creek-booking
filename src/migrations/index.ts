import * as migration_20260708_223315_initial from './20260708_223315_initial';
import * as migration_20260907_190206_ical_status_fields from './20260907_190206_ical_status_fields';
import * as migration_20260908_022125_pages_requests_brandguide from './20260908_022125_pages_requests_brandguide';
import * as migration_20260908_033826_booking_is_test from './20260908_033826_booking_is_test';
import * as migration_20260908_043743_guests from './20260908_043743_guests';
import * as migration_20260908_063100_versions_for_sites_addons_blocks_settings from './20260908_063100_versions_for_sites_addons_blocks_settings';
import * as migration_20260908_232720_guest_messages from './20260908_232720_guest_messages';

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
    name: '20260908_043743_guests',
  },
  {
    up: migration_20260908_063100_versions_for_sites_addons_blocks_settings.up,
    down: migration_20260908_063100_versions_for_sites_addons_blocks_settings.down,
    name: '20260908_063100_versions_for_sites_addons_blocks_settings',
  },
  {
    up: migration_20260908_232720_guest_messages.up,
    down: migration_20260908_232720_guest_messages.down,
    name: '20260908_232720_guest_messages'
  },
];
