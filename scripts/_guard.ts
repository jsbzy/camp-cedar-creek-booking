/**
 * Refuse to run a maintenance script against production with a local
 * environment loaded.
 *
 * Sourcing .env.local to get PAYLOAD_SECRET and the Postgres URL also brings
 * NEXT_PUBLIC_APP_URL, which pointed at a laptop. Payload hooks read it during
 * a save, so a backfill wrote "http://100.107.214.16:3000/api/ical/..." onto
 * twenty of the twenty-one live sites: the exact string the owners were being
 * told to paste into Hipcamp. Nothing failed. It just quietly became wrong.
 */
export function guardProductionEnv(): void {
  const db = process.env.DATABASE_URI || "";
  if (!db.startsWith("postgres")) return; // local sqlite, nothing to protect

  const app = process.env.NEXT_PUBLIC_APP_URL || "";
  const localish = !app || /localhost|127\.0\.0\.1|\b\d{1,3}(\.\d{1,3}){3}\b/.test(app);
  if (!localish) return;

  console.error(
    `Refusing to write to production with NEXT_PUBLIC_APP_URL="${app || "(unset)"}".\n\n` +
      "  Payload hooks read that during a save, so anything derived from it gets\n" +
      "  written with a local address. Run it with the real one:\n\n" +
      "      NEXT_PUBLIC_APP_URL=https://ccc.bzy.design npx tsx <script>\n"
  );
  process.exit(2);
}
