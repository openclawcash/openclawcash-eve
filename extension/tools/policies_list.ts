import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";

export default defineTool({
  description:
    "List the spending limits, allowlists and testnet-only rules the account owner set on each wallet. Check before proposing a transfer, swap or escrow payment so it stays inside them.",
  inputSchema: z.object({}),
  execute: (_input, ctx) => occ(ctx, { method: "GET", path: "/api/agent/policies" }),
});
