import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";

export default defineTool({
  description: "List the tokens OpenClawCash supports on a network or chain.",
  inputSchema: z.object({ network: z.string().optional(), chain: z.enum(["evm", "solana"]).optional() }),
  execute: (input, ctx) => occ(ctx, { method: "GET", path: "/api/agent/supported-tokens", query: input }),
});
