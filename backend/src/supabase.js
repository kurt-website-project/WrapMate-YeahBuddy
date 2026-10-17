import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[wrapmate] SUPABASE_URL or SUPABASE_SERVICE_KEY is not set. Set them in .env"
  );
}

export const supabase = createClient(url ?? "", serviceKey ?? "", {
  auth: { persistSession: false },
});

export async function nextCounter(name) {
  // Atomic increment via the Postgres next_counter() function (see schema.sql):
  // a single UPDATE ... RETURNING, so concurrent requests never get the same
  // sequence value. .single() unwraps the scalar the function returns.
  const { data, error } = await supabase
    .rpc("next_counter", { p_name: name })
    .single();
  if (error) throw error;

  return data;
}
