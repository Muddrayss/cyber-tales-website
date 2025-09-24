// @utils/score-submit.utils.ts
type SubmitArgs = {
  email: string;
  agree: boolean;
  newsletter: boolean;
  game: string;
  difficulty: string;
  score: number;
  description?: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export async function submitScoreWithEmail(args: SubmitArgs): Promise<boolean> {
  const url = `${SUPABASE_URL}/functions/v1/submit-score`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(args),
  });

  if (!res.ok) {
    console.error("submit-score failed", res.status, await res.text().catch(() => ""));
    return false;
  }

  const data = await res.json().catch(() => ({}));
  return !!data?.ok;
}
