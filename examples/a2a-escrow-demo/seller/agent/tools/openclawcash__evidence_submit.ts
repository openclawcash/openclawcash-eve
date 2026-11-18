import { evidence_submit } from "@openclawcash/eve/tools";
import { defineTool } from "eve/tools";

// An autonomous seller files its own proof of delivery. It moves no money, so this agent drops the
// extension's approval gate for it. Money-moving tools keep theirs.
export default defineTool({ ...evidence_submit, approval: undefined });
