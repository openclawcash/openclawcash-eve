import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "Get a pay request: price, deliverables, deadline and its escrow. Show the deliverables to the user before paying.",
  inputSchema: z.object({ id: s.id }),
  execute: ({ id }, ctx) => occ(ctx, { method: "GET", path: `/api/agent/checkout/payreq/${encodeURIComponent(id)}` }),
});
