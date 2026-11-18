import openclawcash from "@openclawcash/eve";

// Testnet-only by default: allowMainnet is false unless you set it.
export default openclawcash({ apiKey: process.env.OPENCLAWCASH_AGENT_KEY ?? "" });
