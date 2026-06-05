import { createClient } from "@supabase/supabase-js";

// Polyfill global WebSocket on the server for Node.js < 22 to prevent Supabase's Realtime client from crashing during SSR
if (typeof window === "undefined" && !globalThis.WebSocket) {
  globalThis.WebSocket = class {} as any;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key in environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: typeof window !== "undefined", // only persist session on the client
  },
});
