import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus } from "@/lib/admin.functions";
import { AdminCard, adminStyles as s } from "@/components/admin/AdminCard";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Painel | Administração Personalizê" },
      { name: "description", content: "Painel administrativo da Personalizê." },
      { property: "og:title", content: "Painel — Personalizê" },
      { property: "og:description", content: "Painel administrativo da Personalizê." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Painel,
});

function Painel() {
  const status = useServerFn(getAdminStatus);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-status"], queryFn: () => status() });

  async function logout() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin/login", replace: true });
  }

  if (isLoading) return <AdminCard title="Carregando..."><p /></AdminCard>;
  if (error || !data?.isOwner)
    return (
      <AdminCard title="Acesso negado">
        <div style={s.error}>Esta conta não tem permissão de administração.</div>
        <button style={s.button} onClick={logout}>Sair</button>
      </AdminCard>
    );

  return (
    <AdminCard title="Painel administrativo" wide>
      <p style={{ textAlign: "center", color: "#716469" }}>Bem-vinda, {data.email}</p>
      <div style={s.ok}>Seu acesso está ativo e protegido. As próximas seções (Personalizar Site, convites, pedidos e clientes) aparecerão aqui.</div>
      <ChangePassword />
      <button style={{ ...s.button, background: "transparent", color: "#75152F", border: "1px solid #75152F" }} onClick={logout}>Sair</button>
    </AdminCard>
  );
}

function ChangePassword() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 8) return setMsg({ ok: false, text: "A nova senha precisa ter pelo menos 8 caracteres." });
    const { error } = await supabase.auth.updateUser({ password: next, current_password: current } as { password: string });
    setMsg(error ? { ok: false, text: "Não foi possível alterar. Confira a senha atual." } : { ok: true, text: "Senha alterada com sucesso." });
    if (!error) { setCurrent(""); setNext(""); }
  }

  return (
    <form onSubmit={submit} style={{ marginTop: 28, borderTop: "1px solid #f1e2e5", paddingTop: 10 }}>
      <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: "#75152F", fontSize: 20 }}>Alterar senha</h2>
      <label style={s.label}>Senha atual<input style={s.input} type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} /></label>
      <label style={s.label}>Nova senha<input style={s.input} type="password" required autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} /></label>
      {msg && <div style={msg.ok ? s.ok : s.error}>{msg.text}</div>}
      <button style={s.button}>Salvar nova senha</button>
    </form>
  );
}
