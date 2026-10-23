import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ADMIN_EMAIL } from "./admin-config";

/**
 * Sends the owner a secure first-access invite (or a password-recovery link if the
 * account already exists). Always returns the same generic answer so the endpoint
 * does not reveal whether an email is authorized.
 */
export const requestAdminAccessLink = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ email: z.string().trim().email().max(255) }).parse(input))
  .handler(async ({ data }) => {
    if (data.email.toLowerCase() !== ADMIN_EMAIL) return { ok: true };
    const origin = getRequestHeader("origin") ?? "";
    const redirectTo = `${origin}/admin/redefinir-senha`;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const invite = await supabaseAdmin.auth.admin.inviteUserByEmail(ADMIN_EMAIL, { redirectTo });
    if (invite.error) {
      // Account already exists: send a recovery link instead.
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(ADMIN_EMAIL, { redirectTo });
      if (error) console.error("admin access link failed", error.message);
    }
    return { ok: true };
  });

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "owner" });
    if (error) throw new Error("Não foi possível verificar as permissões.");
    return { isOwner: data === true, email: (context.claims as { email?: string }).email ?? "" };
  });
