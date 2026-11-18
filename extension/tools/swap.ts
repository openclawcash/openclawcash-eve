import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { assertNetworkAllowed, occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "Execute a token swap from a wallet. Run swap_quote first and show the user the quote. Moves money: the user approves every call.",
  inputSchema: z.object({
    walletId: s.walletId,
    tokenIn: z.string(),
    tokenOut: z.string(),
    amountIn: z.string(),
    slippage: z.number().optional().describe("Max slippage in percent."),
    network: s.network.optional(),
  }),
  approval: {
    request: always(),
    prompt: ({ input: i }) => `Swap ${i?.amountIn} ${i?.tokenIn} to ${i?.tokenOut} from wallet ${i?.walletId}?`,
  },
  async execute(i, ctx) {
    await assertNetworkAllowed(ctx, i);
    return occ(ctx, { method: "POST", path: "/api/agent/swap", body: i });
  },
});
