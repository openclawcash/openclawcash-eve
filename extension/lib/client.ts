import { createHash } from "node:crypto";

import type { ToolContext } from "eve/tools";

import extension from "../extension";

/** Networks that move test money only. Anything else is treated as live (mainnet). */
export const TESTNETS = new Set(["sepolia", "solana-devnet", "solana-testnet"]);

export class OpenClawCashError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly code?: string,
    readonly payload?: unknown,
  ) {
    super(message);
    this.name = "OpenClawCashError";
  }
}

type Method = "GET" | "POST" | "PATCH" | "DELETE";

interface CallOptions {
  method: Method;
  path: string;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** Public endpoints (escrow rules) need no key. */
  auth?: boolean;
}

/**
 * The agent key is only ever sent to openclawcash.com or one of its https subdomains, so a
 * tampered `baseUrl` cannot redirect the key to another host.
 */
function baseUrl(): string {
  const raw = extension.config.baseUrl.replace(/\/+$/, "");
  let url: URL | undefined;
  try {
    url = new URL(raw);
  } catch {
    url = undefined;
  }
  const host = url?.hostname.toLowerCase() ?? "";
  const trusted =
    url !== undefined &&
    url.protocol === "https:" &&
    !url.username &&
    !url.password &&
    !url.port &&
    (host === "openclawcash.com" || host.endsWith(".openclawcash.com"));
  if (!trusted) {
    throw new OpenClawCashError(
      `baseUrl must be https://openclawcash.com or an https://<subdomain>.openclawcash.com host; refusing to send the agent key to ${raw}.`,
    );
  }
  return raw;
}

type AuthProvider = Parameters<ToolContext["getToken"]>[0];

async function agentKey(ctx: ToolContext): Promise<string> {
  const config = extension.config;
  if ("apiKey" in config && config.apiKey) return config.apiKey;
  const auth = (config as { auth: AuthProvider }).auth;
  const { token } = await ctx.getToken(auth, { displayName: "OpenClawCash" });
  return token;
}

function queryString(query: CallOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/**
 * One call to the OpenClawCash agent API.
 *
 * Write calls carry an Idempotency-Key derived from eve's `callId`, which is stable across a
 * crash replay of the same tool call, so a replayed transfer is deduplicated by the server
 * instead of sending twice.
 */
export async function occ<T = unknown>(ctx: ToolContext, options: CallOptions): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "openclawcash-eve-extension",
  };
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth !== false) headers["X-Agent-Key"] = await agentKey(ctx);
  // One key per (tool call, endpoint, body): stable across a crash replay of the same call, distinct
  // when one tool makes several writes (escrow_fund: quick-pay, swap preview, swap confirm).
  if (options.method !== "GET") {
    const digest = createHash("sha256")
      .update(`${options.method} ${options.path} ${JSON.stringify(options.body ?? null)}`)
      .digest("hex")
      .slice(0, 16);
    headers["Idempotency-Key"] = `eve-${ctx.callId}-${digest}`;
  }

  const response = await fetch(`${baseUrl()}${options.path}${queryString(options.query)}`, {
    method: options.method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    // Never follow a redirect: it would resend X-Agent-Key to the Location host.
    redirect: "manual",
    signal: ctx.abortSignal,
  });

  if (response.status >= 300 && response.status < 400) {
    throw new OpenClawCashError(
      `OpenClawCash answered with a redirect (HTTP ${response.status}); refusing to follow it with the agent key.`,
      response.status,
    );
  }

  const text = await response.text();
  let payload: unknown = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const record = payload !== null && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const message =
      typeof record.message === "string"
        ? record.message
        : typeof payload === "string" && payload
          ? payload
          : `OpenClawCash request failed with HTTP ${response.status}`;
    if (response.status === 401 && "auth" in extension.config) {
      // Per-user credentials: ask the caller to (re)authorize instead of failing the turn.
      ctx.requireAuth((extension.config as { auth: AuthProvider }).auth, { displayName: "OpenClawCash" });
    }
    throw new OpenClawCashError(message, response.status, typeof record.code === "string" ? record.code : undefined, payload);
  }

  return payload as T;
}

interface WalletRow {
  id: number | string;
  label?: string;
  address?: string;
  network?: string;
  chain?: string;
}

/** Resolve a wallet's home network from the wallet list. */
export async function walletNetwork(
  ctx: ToolContext,
  selector: { walletId?: number | string; walletAddress?: string },
): Promise<string | undefined> {
  const list = await occ<WalletRow[] | { wallets?: WalletRow[] }>(ctx, { method: "GET", path: "/api/agent/wallets" });
  const rows = Array.isArray(list) ? list : (list?.wallets ?? []);
  const match = rows.find(
    (row) =>
      (selector.walletId !== undefined && String(row.id) === String(selector.walletId)) ||
      (selector.walletAddress !== undefined &&
        typeof row.address === "string" &&
        row.address.toLowerCase() === selector.walletAddress.toLowerCase()),
  );
  return match?.network;
}

/**
 * Refuse live-money operations unless the mount opted in with `allowMainnet: true`.
 * The effective network is the explicit override, else the wallet's home network.
 */
export async function assertNetworkAllowed(
  ctx: ToolContext,
  input: { walletId?: number | string; walletAddress?: string; network?: string },
): Promise<string> {
  const network = input.network ?? (await walletNetwork(ctx, input));
  if (!network) {
    throw new OpenClawCashError(
      "Could not resolve the wallet's network. List wallets with wallets_list and pass a walletId this key can see.",
    );
  }
  if (!extension.config.allowMainnet && !TESTNETS.has(network)) {
    throw new OpenClawCashError(
      `Refused: ${network} is a live network and this agent is mounted testnet-only. The developer can set allowMainnet: true on the openclawcash mount to allow it.`,
      undefined,
      "mainnet_not_allowed",
    );
  }
  return network;
}
