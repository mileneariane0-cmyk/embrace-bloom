import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminCard, adminStyles as s } from "@/components/admin/AdminCard";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Entrar | Administração Personalizê" },
      { name: "description", content: "Acesso restrito à administração da Personalizê." },
      { property: "og:title", content: "Administração Personalizê" },
      { property: "og:description", content: "Acesso restrito à administração da Personalizê." },
      { name: "robots", content: "noindex" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) return setError("E-mail ou senha incorretos.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <AdminCard title="Entrar">
      <form onSubmit={submit}>
        <label style={s.label}>E-mail<input style={s.input} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label style={s.label}>Senha<input style={s.input} type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <div style={s.error}>{error}</div>}
        <button style={s.button} disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
      </form>
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 20 }}>
        
        <Link to="/admin/acesso" style={s.link}>Esqueci minha senha</Link>
      </div>
      <p style={{ textAlign: "center", marginTop: 22 }}><Link to="/" style={{ ...s.link, color: "#819B87" }}>← Voltar para a loja</Link></p>
    </AdminCard>
  );
}
