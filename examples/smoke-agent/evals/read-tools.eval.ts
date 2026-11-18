import { defineEval } from "eve/evals";

/** Live read calls against openclawcash.com with a real agent key. No money moves. */
export default defineEval({
  description: "wallets_list, policies_list and the public escrow rules answer through the mounted extension.",
  async test(t) {
    for (const scenario of ["list", "policies", "rules"]) {
      const turn = await t.send(scenario);
      turn.messageIncludes("RESULT");
    }
    t.succeeded();
    t.calledTool("openclawcash__wallets_list", { status: "completed" });
    t.calledTool("openclawcash__policies_list", { status: "completed" });
    t.calledTool("openclawcash__escrow_rules", { status: "completed" });
  },
});
