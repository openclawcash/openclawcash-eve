import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description:
    "Add delivery evidence to an escrow (seller proves delivery, buyer records a problem). Append-only and never fetched by OpenClawCash. When every required deliverable has seller evidence the escrow auto-releases after its timer unless disputed.",
  inputSchema: z.object({
    id: s.id.describe("Escrow id."),
    deliverableId: z.string(),
    uri: z.string().optional().describe("Where the evidence lives: https, ipfs or a tx hash."),
    sha256: z.string().regex(/^[0-9a-fA-F]{64}$/).optional(),
    note: z.string().max(2000).optional(),
  }),
  approval: once(),
  execute: ({ id, ...body }, ctx) =>
    occ(ctx, { method: "POST", path: `/api/agent/checkout/escrows/${encodeURIComponent(id)}/evidence`, body }),
});
