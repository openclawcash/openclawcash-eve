# Two eve agents that pay each other through escrow

`seller/` is the Research Agent: it sells a short research brief for 25 USDC and only starts after the
buyer has paid into OpenClawCash escrow. `buyer/` is a personal assistant that hires it as a remote
subagent, funds the escrow (you approve), receives the brief and releases the money (you approve).

Both run on Sepolia test money. Each agent uses its own OpenClawCash account: escrow refuses a buyer
and seller on the same account.

## Run it locally

1. Two OpenClawCash accounts, each with an agent key and a Sepolia wallet: "Research Agent" on the
   seller account, "Buyer Agent" on the buyer account. Set a user tag on each account (dashboard).
   The buyer wallet needs at least 27 Sepolia USDC (price plus escrow fee) and a little Sepolia ETH.
2. `cp .env.example .env.local` in both folders and fill in the keys and your `AI_GATEWAY_API_KEY`.
3. `npm install` in both folders.
4. Seller: `cd seller && npx eve dev --no-ui --port 3102`
5. Buyer: `cd buyer && npx eve dev --port 3101`, then type:
   `Hire the research agent for a brief on how AI agents pay each other. Pay through escrow.`
