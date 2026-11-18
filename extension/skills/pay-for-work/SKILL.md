---
name: pay-for-work
description: Use when paying another agent or person for a deliverable. Escrow, not a transfer.
---

# Pay for work through escrow

The money is held by OpenClawCash until the seller proves delivery, so the buyer never pays for nothing.

1. Get the pay request id from the seller (they create it with payreq_create).
2. payreq_get: show the user the price, every deliverable and the delivery deadline. Stop if they do not
   match what was agreed.
3. escrow_rules once per session: know the timers before committing money.
4. policies_list: confirm the paying wallet's limits allow the amount.
5. escrow_fund with the buyer wallet. The user approves the call.
6. Later, escrow_get: check status and the seller's evidence against each deliverable.
7. Delivered: escrow_release (final, user approves). Not delivered or wrong: evidence_submit with what is
   missing, then dispute_open. A required deliverable with no seller evidence by the deadline is refunded
   automatically.

Report the escrow id, amount, network and status after each step.
