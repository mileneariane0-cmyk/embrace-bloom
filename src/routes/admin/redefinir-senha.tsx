import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard, adminStyles as s } from "@/components/admin/AdminCard";

export const Route = createFileRoute("/admin/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Criar senha | Administração Personalizê" },
      { name: "description", content: "Defina sua senha de acesso à administração da Personalizê." },
      { property: "og:title", content: "Criar senha — Personalizê" },
      { property: "og:description", content: "Defina sua senha de acesso administrativo." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [ready, setReady] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => { if (session) setReady(true); });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setTimeout(() => setReady((r) => r ?? false), 2500);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("A senha precisa ter pelo menos 8 caracteres.");
    if (password !== confirm) return setError("As senhas não coincidem.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setError("Não foi possível salvar a senha. Solicite um novo link.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <AdminCard title="Crie sua senha">
      {ready === null && <p style={{ textAlign: "center", marginTop: 20 }}>Verificando link...</p>}
      {ready === false && (
        <div style={s.error}>Este link é inválido ou expirou. <Link to="/admin/acesso" style={s.link}>Solicite um novo link</Link>.</div>
      )}
      {ready && (
        <form onSubmit={submit}>
          <label style={s.label}>Nova senha<input style={s.input} type="password" required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <label style={s.label}>Confirme a senha<input style={s.input} type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></label>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.button} disabled={loading}>{loading ? "Salvando..." : "Salvar senha e entrar"}</button>
        </form>
      )}
    </AdminCard>
  );
}
