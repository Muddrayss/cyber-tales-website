// @utils/staff.api.ts
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export type ScanResult = {
  ok: boolean;
  mode?: "auth" | "preview" | "redeem";
  alreadyRedeemed?: boolean;
  score?: {
    id: string;
    email: string;
    game: string;
    difficulty: string;
    score: number;
    redeemed: boolean;
    redeemed_at: string | null;
    created_at: string;
  };
  player?: {
    email: string;
    submit_count: number;
    redeem_count: number;
    created_at: string;
    updated_at: string;
  };
  error?: string;
};

async function callScan(action: "auth" | "preview" | "redeem", payload: Record<string, unknown>, staffKey: string): Promise<ScanResult> {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/scan-qr`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
      "x-staff-key": staffKey,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  try {
    return await res.json();
  } catch {
    return { ok: false, error: `HTTP ${res.status}` };
  }
}

export async function verifyStaffKey(staffKey: string) {
  return callScan("auth", {}, staffKey);
}

export async function previewToken(token: string, staffKey: string) {
  return callScan("preview", { token }, staffKey);
}

export async function redeemToken(token: string, staffKey: string) {
  return callScan("redeem", { token }, staffKey);
}
