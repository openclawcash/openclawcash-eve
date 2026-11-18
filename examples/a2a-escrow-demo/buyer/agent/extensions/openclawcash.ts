import openclawcash from "@openclawcash/eve";

// The buyer's own OpenClawCash account. Testnet only (allowMainnet defaults to false).
export default openclawcash({ apiKey: process.env.OPENCLAWCASH_AGENT_KEY! });
