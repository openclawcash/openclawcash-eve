import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "Quote a token swap (route, expected output, fees) without executing it. Always quote before swap.",
  inputSchema: z.object({
    network: s.network,
    tokenIn: z.string(),
    tokenOut: z.string(),
    amountIn: z.string().describe("Human-readable decimal amount."),
    walletId: s.walletId.optional(),
    chain: z.enum(["evm", "solana"]).optional(),
  }),
  execute: ({ network, ...body }, ctx) => occ(ctx, { method: "POST", path: "/api/agent/quote", query: { network }, body }),
});
