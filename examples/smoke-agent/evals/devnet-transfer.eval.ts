import { defineEval } from "eve/evals";

/**
 * Real money path on solana-devnet (test SOL): wallets resolved by label, transfer pauses for
 * approval, then settles. Needs devnet balance in the "Playground" wallet.
 */
export default defineEval({
  description: "Approved 0.001 SOL devnet transfer Playground -> Main Solana completes with a tx hash.",
  timeoutMs: 120_000,
  async test(t) {
    const turn = await t.send("devnet");
    turn.session.requireInteraction({ toolName: "openclawcash__transfer" });
    const after = await turn.session.respondAll("approve");
    after.messageIncludes("txHash");
    t.calledTool("openclawcash__transfer", { status: "completed" });
  },
});
