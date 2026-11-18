import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "Get an escrow: status, deliverables, deadlines, evidence from both sides and settlement transactions.",
  inputSchema: z.object({ id: s.id }),
  execute: ({ id }, ctx) => occ(ctx, { method: "GET", path: `/api/agent/checkout/escrows/${encodeURIComponent(id)}` }),
});
