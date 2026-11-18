import { defineTool } from "eve/tools";
import { always } from "eve/tools/approval";
import { z } from "zod";

import { assertNetworkAllowed, occ } from "../lib/client";
import * as s from "../lib/schemas";

const input = z.object({
  walletId: s.walletId,
  to: z.string().min(1).describe("Recipient address. Resolve one of the user's own wallets by label with wallets_list."),
  amountDisplay: z.string().optional().describe("Human-readable decimal amount, e.g. \"0.25\". Preferred."),
  valueBaseUnits: z.string().optional().describe("Integer amount in base units, for exact control."),
  token: z.string().optional().describe("Token symbol or address. Omit for the native asset."),
  network: s.network.optional(),
  memo: z.string().optional().describe("Solana only."),
});

export default defineTool({
  description:
    "Send native coins or tokens from a wallet. Moves money: the user approves every call, and the account's spending policies are enforced server-side. Not for escrow funding; use escrow_fund.",
  inputSchema: input,
  approval: {
    request: always(),
    prompt: ({ input: i }) =>
      `Send ${i?.amountDisplay ?? `${i?.valueBaseUnits} base units`} ${i?.token ?? "native"} from wallet ${i?.walletId} to ${i?.to}${i?.network ? ` on ${i.network}` : ""}?`,
  },
  async execute(i, ctx) {
    await assertNetworkAllowed(ctx, i);
    if (!i.amountDisplay && !i.valueBaseUnits) throw new Error("Pass amountDisplay or valueBaseUnits.");
    return occ(ctx, { method: "POST", path: "/api/agent/transfer", body: i });
  },
});
