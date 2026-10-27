import { createEnquiryHandler } from "./core.ts";
import { createRepository } from "./repository.ts";

const url = Deno.env.get("SUPABASE_URL")?.trim();
// Supabase supplies SERVICE_ROLE_KEY to hosted functions. It never enters a public build.
const databaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
const handler = createEnquiryHandler({
  repository: url && databaseKey ? createRepository(url, databaseKey) : null,
  config: {
    resendApiKey: Deno.env.get("RESEND_API_KEY"),
    from: Deno.env.get("RESEND_FROM_EMAIL"),
    to: Deno.env.get("CONTACT_NOTIFICATION_TO"),
    retrySecret: Deno.env.get("ENQUIRY_RETRY_SECRET"),
    allowedOrigins: Deno.env.get("CONTACT_ALLOWED_ORIGINS"),
    hashSecret: databaseKey,
  },
});
Deno.serve(handler);
