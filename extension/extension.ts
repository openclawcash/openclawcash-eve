import { defineExtension } from "eve/extension";
import { z } from "zod";

/**
 * Mount configuration.
 *
 * Credentials, one of:
 * - `apiKey`: one OpenClawCash agent key for the whole agent (the developer's own account).
 * - `auth`: an eve authorization provider, resolved per call with `ctx.getToken`. Use it when each
 *   end user brings their own OpenClawCash account: a `getToken` object that reads the caller's
 *   key from your store (principalType "user"), or an interactive OAuth provider.
 *
 * Safety:
 * - `allowMainnet` (default false): money-moving tools refuse any wallet or network that is not a
 *   testnet (sepolia, solana-devnet, solana-testnet) until you opt in.
 */
const safety = {
  allowMainnet: z.boolean().default(false),
  baseUrl: z.string().default("https://openclawcash.com"),
};

const config = z.union([
  z.strictObject({
    apiKey: z.string().trim().min(1, "Provide an OpenClawCash agent key (occ_...)."),
    ...safety,
  }),
  z.strictObject({
    auth: z.custom<object>(
      (value) =>
        value !== null &&
        typeof value === "object" &&
        "getToken" in value &&
        typeof (value as { getToken: unknown }).getToken === "function",
      "Provide an eve authorization provider with getToken().",
    ),
    ...safety,
  }),
]);

export default defineExtension({ config });
