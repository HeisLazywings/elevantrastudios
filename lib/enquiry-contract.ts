// Public-only contract is colocated with the Edge Function so Supabase can bundle
// and locally serve its complete dependency graph. No server settings are exported.
export * from "../supabase/functions/_shared/enquiry-contract";
