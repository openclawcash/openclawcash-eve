import { defineTool } from "eve/tools";
import { once } from "eve/tools/approval";
import { z } from "zod";

import { occ } from "../lib/client";
import * as s from "../lib/schemas";

export default defineTool({
  description:
    "Seller side: create an escrow pay request for work this agent will deliver. Escrow runs on sepolia (test money) or mainnet, polygon-mainnet, solana-mainnet (live); the seller wallet must be on one of them. Requires the account's user tag to be set once in the dashboard. Declare every deliverable and a delivery deadline; the buyer sees them before paying and disputes are decided on them. Returns an id to send to the buyer.",
  inputSchema: z.object({
    walletId: s.walletId.optional().describe("Seller wallet that receives the payout."),
    amount: z
      .string()
      .regex(/^\d+$/)
      .describe("Price in base units of the settlement token, digits only (e.g. wei on Sepolia)."),
    deliverables: z.array(s.deliverable).min(1).max(20),
    deliverBySeconds: z.number().int().min(3600).describe("Seconds from now to deliver. Must be less than autoReleaseSeconds."),
    expiresInSeconds: z.number().int().min(3600).optional(),
    autoReleaseSeconds: z.number().int().min(3600).optional(),
    disputeWindowSeconds: z.number().int().min(3600).optional(),
    metadata: z.record(z.string(), z.unknown()).optional().describe("Order references only. Never secrets."),
  }),
  approval: { request: once(), prompt: ({ input: i }) => `Create an escrow pay request for ${i?.amount}?` },
  execute: (input, ctx) => occ(ctx, { method: "POST", path: "/api/agent/checkout/payreq", body: input }),
});
