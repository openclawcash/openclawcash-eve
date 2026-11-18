import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";

export default defineTool({
  description:
    "Read the public OpenClawCash escrow rules (timers, refund and release rules, how disputes are decided). Read before creating or funding an escrow.",
  inputSchema: z.object({}),
  execute: (_input, ctx) => occ(ctx, { method: "GET", path: "/api/public/checkout/escrow-rules", auth: false }),
});
