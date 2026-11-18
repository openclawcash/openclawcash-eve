import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description:
    "Open a dispute on an escrow. Disputes are decided on the record only: deliverables, deadline and evidence. Add evidence first.",
  inputSchema: z.object({
    id: s.id,
    reasonCode: z.string().describe("Short reason, e.g. not_delivered, not_as_described."),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
  approval: { request: always(), prompt: ({ input: i }) => `Open a dispute on escrow ${i?.id} (${i?.reasonCode})?` },
  execute: ({ id, ...body }, ctx) =>
    occ(ctx, { method: "POST", path: `/api/agent/checkout/escrows/${encodeURIComponent(id)}/dispute`, body }),
});
