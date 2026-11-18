import { defineAgent } from "eve";
import { mockModel } from "eve/evals";

/**
 * Scripted model: each user message names one scenario, so the evals exercise the real tools
 * against the live OpenClawCash API without any model provider.
 */
const scripts: Record<string, { name: string; input: Record<string, unknown> }> = {
  list: { name: "openclawcash__wallets_list", input: {} },
  policies: { name: "openclawcash__policies_list", input: {} },
  rules: { name: "openclawcash__escrow_rules", input: {} },
  mainnet: {
    name: "openclawcash__transfer",
    input: { walletId: "1", to: "0x000000000000000000000000000000000000dEaD", amountDisplay: "0.0001", network: "base-mainnet" },
  },
};

interface Row {
  id: string;
  label: string;
  address: string;
}

/**
 * Real write on solana-devnet (test money): resolve wallets by label, then send 0.001 SOL from
 * "Playground" to "Main Solana". The transfer still pauses for approval.
 */
function devnetTransfer(toolResults: readonly { output?: unknown }[]) {
  if (toolResults.length === 0) return { toolCalls: [{ name: "openclawcash__wallets_list", input: {} }] };
  if (toolResults.length === 1) {
    const rows = toolResults[0]?.output as Row[];
    const from = rows.find((row) => row.label === "Playground");
    const to = rows.find((row) => row.label === "Main Solana");
    if (!from || !to) return "wallets Playground / Main Solana not found";
    return {
      toolCalls: [
        { name: "openclawcash__transfer", input: { walletId: from.id, to: to.address, amountDisplay: "0.001" } },
      ],
    };
  }
  return `RESULT ${JSON.stringify(toolResults[toolResults.length - 1])}`;
}

export default defineAgent({
  model: mockModel({
    modelId: "occ-smoke",
    provider: "fixtures",
    respond: ({ lastUserMessage, toolResults }) => {
      const scenario = String(lastUserMessage).trim();
      if (scenario === "devnet") return devnetTransfer(toolResults);
      const script = scripts[scenario];
      if (!script) return "unknown scenario";
      if (toolResults.length === 0) return { toolCalls: [script] };
      return `RESULT ${JSON.stringify(toolResults[toolResults.length - 1])}`;
    },
  }),
});
