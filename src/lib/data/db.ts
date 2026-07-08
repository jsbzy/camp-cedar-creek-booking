import { getPayload, type Payload } from "payload";
import config from "../../payload.config";

// getPayload memoizes per config, so this is cheap to call everywhere.
export const getDb = (): Promise<Payload> => getPayload({ config });
