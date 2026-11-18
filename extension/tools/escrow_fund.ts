import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { assertNetworkAllowed, occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description:
    "Buyer side: pay into an escrow from a wallet. Funds are held, not sent: the seller is paid only after delivery, and a missed deadline refunds the buyer. Pays directly, or swaps first when the wallet holds a different token. The user approves every call.",
  inputSchema: z.object({
    id: s.id.describe("Escrow id."),
    walletId: s.walletId,
    slippage: z.number().optional(),
    allowSwapFallback: z.boolean().optional().describe("Defaults to true."),
  }),
  approval: { request: always(), prompt: ({ input: i }) => `Pay into escrow ${i?.id} from wallet ${i?.walletId}? The money is held until the seller delivers.` },
  async execute({ id, walletId, slippage, allowSwapFallback = true }, ctx) {
    await assertNetworkAllowed(ctx, { walletId });
    const path = `/api/agent/checkout/escrows/${encodeURIComponent(id)}`;
    try {
      return { strategy: "quick-pay", result: await occ(ctx, { method: "POST", path: `${path}/quick-pay`, body: { walletId } }) };
    } catch (error) {
      if ((error as { code?: string }).code !== "quick_pay_requires_swap" || !allowSwapFallback) throw error;
      const swapBody = { walletId, ...(slippage !== undefined ? { slippage } : {}) };
      const preview = await occ<{ quote?: unknown }>(ctx, {
        method: "POST",
        path: `${path}/swap-and-pay`,
        body: { ...swapBody, confirm: false },
      });
      const result = await occ(ctx, {
        method: "POST",
        path: `${path}/swap-and-pay`,
        body: { ...swapBody, confirm: true },
      });
      return { strategy: "swap-and-pay", quote: preview?.quote ?? null, result };
    }
  },
});
