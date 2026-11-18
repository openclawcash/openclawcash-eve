import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "List a wallet's transaction history. EVM wallets accept network, or \"all\" to merge every EVM chain.",
  inputSchema: s.walletSelector.extend({ network: z.string().optional() }),
  execute: (input, ctx) => occ(ctx, { method: "GET", path: "/api/agent/transactions", query: input }),
});
