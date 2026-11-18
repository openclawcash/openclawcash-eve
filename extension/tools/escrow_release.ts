import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

// Right after delivery, the release can find the escrow's gas top-up not yet confirmed on chain
// (seen on Sepolia: "Escrow still has insufficient gas after top-up"). The same release succeeds a
// few seconds later, so retry that one case, each attempt with its own idempotency key.
const GAS_PENDING = /insufficient gas after top-up/i;
const RETRY_DELAYS_MS = [15_000, 30_000];

export default defineTool({
  description: "Buyer side: release a funded escrow to the seller once the deliverables are confirmed. Final. The user approves every call.",
  inputSchema: z.object({ id: s.id }),
  approval: { request: always(), prompt: ({ input: i }) => `Release escrow ${i?.id} to the seller? This is final.` },
  execute: async ({ id }, ctx) => {
    const path = `/api/agent/checkout/escrows/${encodeURIComponent(id)}/release`;
    for (let attempt = 0; ; attempt++) {
      try {
        return await occ(ctx, { method: "POST", path, body: {}, attempt });
      } catch (error) {
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay === undefined || !GAS_PENDING.test(String((error as Error)?.message ?? ""))) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  },
});
