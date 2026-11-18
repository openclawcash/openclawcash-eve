// Headless end-to-end run of the buyer agent: sends the user request, approves every money move,
// and writes a transcript. Usage: node run.mjs  (buyer on :3101, seller on :3102)
import { Client } from "eve/client";
import { writeFileSync } from "node:fs";

const client = new Client({ baseUrl: process.env.BUYER_URL ?? "http://127.0.0.1:3101" });
const log = [];
const t0 = Date.now();
const note = (kind, data) => {
  const row = { t: ((Date.now() - t0) / 1000).toFixed(1), kind, ...data };
  log.push(row);
  console.log(JSON.stringify(row).slice(0, 600));
};

const { session, delivery } = await client.sessions.create({
  message: "Hire the research agent for a short brief on how AI agents can pay each other safely. Pay through escrow.",
});
note("session", { sessionId: delivery.sessionId });
let response = delivery;
for (let round = 0; round < 8; round++) {
  const result = await response.result();
  note("result", { status: result.status, outcome: result.outcome, reply: result.reply ?? null, error: result.error ?? null });
  const pending = result.interactions ?? [];
  if (pending.length === 0) break;
  for (const p of pending) note("interaction", { interactionId: p.interactionId, kind: p.kind, prompt: p.prompt ?? p.title ?? null, tool: p.toolName ?? null });
  response = await session.respond(pending.map((p) => ({ interactionId: p.interactionId, optionId: "approve" })));
}
writeFileSync(process.env.OUT ?? "./run-transcript.json", JSON.stringify(log, null, 1));
