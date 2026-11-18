import { defineTool } from "eve/tools";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description: "Get one wallet with its current native and token balances. Read this before quoting a balance.",
  inputSchema: s.walletSelector,
  execute: (input, ctx) => occ(ctx, { method: "GET", path: "/api/agent/wallet", query: input }),
});
