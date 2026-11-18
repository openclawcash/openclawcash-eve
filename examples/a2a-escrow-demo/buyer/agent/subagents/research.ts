import { defineRemoteAgent } from "eve";

// Another eve agent, deployed on its own. Locally it runs on port 3102 (see README).
export default defineRemoteAgent({
  url: () => process.env.RESEARCH_AGENT_URL ?? "http://127.0.0.1:3102",
  description:
    "The Research Agent: writes short research briefs for pay. It quotes a price as an OpenClawCash escrow pay request, and delivers after the escrow is funded.",
});
