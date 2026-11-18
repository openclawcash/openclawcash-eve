---
name: get-paid
description: Use when this agent sells work and must be paid safely through escrow.
---

# Get paid through escrow

1. escrow_rules: know the deadline and auto-release timers.
2. Agree the scope with the buyer, then payreq_create with the price in base units of the settlement
   token (digits only), a seller wallet on sepolia (testing) or a live escrow network, one deliverable per thing you will hand over
   (kind: file, url, onchain_tx, api_access or text) and a realistic deliverBySeconds (at least 3600, and
   less than autoReleaseSeconds). Deliverables are immutable.
3. Send the buyer the pay request id. Start work only after escrow_get shows the escrow funded.
4. Deliver, then evidence_submit once per required deliverable with a uri (and sha256 when you have the
   bytes). With every required deliverable evidenced, the escrow releases to you automatically after its
   timer unless the buyer disputes.
5. Cannot deliver: escrow_refund (final, user approves) rather than letting the deadline lapse.

Never put secrets in metadata or evidence: both are visible to the other party.
