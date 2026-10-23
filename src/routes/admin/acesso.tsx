import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { requestAdminAccessLink } from "@/lib/admin.functions";
import { AdminCard, adminStyles as s } from "@/components/admin/AdminCard";

export const Route = createFileRoute("/admin/acesso")({
  head: () => ({
    meta: [
      { title: "Recuperar senha | Administração Personalizê" },
      { name: "description", content: "Receba o link seguro para criar ou redefinir a senha administrativa." },
      { property: "og:title", content: "Recuperar senha — Personalizê" },
      { property: "og:description", content: "Link seguro para criar ou redefinir a senha administrativa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Acesso,
});

function Acesso() {
  const send = useServerFn(requestAdminAccessLink);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await send({ data: { email } });
      setSent(true);
    } catch {
      setError("Não foi possível enviar agora. Tente novamente em instantes.");
    }
    setLoading(false);
  }

  return (
    <AdminCard title="Recuperar senha">
      {sent ? (
        <div style={s.ok}>Se este e-mail estiver autorizado, você receberá em instantes um link seguro para reredefinir sua senha. Verifique também a caixa de spam.</div>
      ) : (
        <form onSubmit={submit}>
          <p style={{ fontSize: 14, lineHeight: 1.7, color: "#716469", marginTop: 18 }}>Informe o e-mail da administradora. Enviaremos um link de uso único para você redefinir sua senha.</p>
          <label style={s.label}>E-mail<input style={s.input} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          {error && <div style={s.error}>{error}</div>}
          <button style={s.button} disabled={loading}>{loading ? "Enviando..." : "Enviar link seguro"}</button>
        </form>
      )}
      <p style={{ textAlign: "center", marginTop: 22 }}><Link to="/admin/login" style={s.link}>← Voltar para o login</Link></p>
    </AdminCard>
  );
}
