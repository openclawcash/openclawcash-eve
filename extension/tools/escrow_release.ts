import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "Buyer side: release a funded escrow to the seller once the deliverables are confirmed. Final. The user approves every call.",
  inputSchema: z.object({ id: s.id }),
  approval: { request: always(), prompt: ({ input: i }) => `Release escrow ${i?.id} to the seller? This is final.` },
  execute: ({ id }, ctx) => occ(ctx, { method: "POST", path: `/api/agent/checkout/escrows/${encodeURIComponent(id)}/release`, body: {} }),
});
