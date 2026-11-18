import { z } from "zod";

export const walletId = z
  .union([z.number().int(), z.string().min(1)])
  .describe("Wallet id from wallets_list. Resolve a wallet the user names by label with wallets_list first.");

export const walletSelector = z.object({
  walletId: walletId.optional(),
  walletLabel: z.string().optional().describe("Wallet label, as shown in wallets_list."),
  walletAddress: z.string().optional(),
  chain: z.enum(["evm", "solana"]).optional(),
});

export const network = z
  .string()
  .describe(
    "Network id: sepolia, solana-devnet, solana-testnet (test money) or mainnet, base-mainnet, polygon-mainnet, solana-mainnet (live money). EVM wallets accept an override; omit to use the wallet's home network.",
  );

export const id = z.string().min(1);

export const deliverable = z.object({
  id: z.string().regex(/^[a-z0-9_-]{1,64}$/).describe("Unique within the list, [a-z0-9_-]."),
  kind: z.enum(["file", "url", "onchain_tx", "api_access", "text"]),
  description: z.string().min(1).max(1000),
  required: z.boolean().optional().describe("Defaults to true."),
});
