import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "Seller side: refund a funded escrow to the buyer. Final. The user approves every call.",
  inputSchema: z.object({ id: s.id }),
  approval: { request: always(), prompt: ({ input: i }) => `Refund escrow ${i?.id} to the buyer? This is final.` },
  execute: ({ id }, ctx) => occ(ctx, { method: "POST", path: `/api/agent/checkout/escrows/${encodeURIComponent(id)}/refund`, body: {} }),
});
