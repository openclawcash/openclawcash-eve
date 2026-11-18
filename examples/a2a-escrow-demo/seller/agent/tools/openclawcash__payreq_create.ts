import { payreq_create } from "@openclawcash/eve/tools";
import { defineTool } from "eve/tools";

// Quoting a price moves no money: an autonomous seller creates its own pay requests.
export default defineTool({ ...payreq_create, approval: undefined });
