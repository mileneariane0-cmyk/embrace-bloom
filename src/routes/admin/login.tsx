import { createFileRoute, Link } from "@tanstack/react-router";
import logo from "@/assets/personalize-logo.png.asset.json";
import { ShieldCheck, LockKeyhole, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  return (
    <main style={{ minHeight: "100vh", background: "#FFF8F6", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif", color: "#30272B" }}>
      <section style={{ width: "100%", maxWidth: 460, background: "white", padding: "clamp(24px,5vw,46px)", borderRadius: 24, boxShadow: "0 16px 50px #75152f12", border: "1px solid #f1e2e5" }}>
        <div style={{ textAlign: "center", color: "#75152F" }}>
          <ShieldCheck size={42} style={{ margin: "0 auto 14px" }} />
          <h1 style={{ margin: "0 0 8px" }}><img src={logo.url} alt="Personalizê" style={{ width: "100%", maxWidth: 300, height: "auto" }} /></h1>
          <p style={{ color: "#819B87", letterSpacing: 2, fontSize: 12 }}>ÁREA ADMINISTRATIVA</p>
        </div>
        <div style={{ background: "#FFF8F6", border: "1px solid #F2DCE1", padding: 20, borderRadius: 14, margin: "28px 0", display: "flex", gap: 12, alignItems: "flex-start" }}>
          <LockKeyhole size={22} style={{ flexShrink: 0, color: "#75152F" }}/>
          <div><strong style={{ color: "#75152F" }}>Acesso em configuração</strong><p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>O login será habilitado após conectar o provedor de autenticação e configurar as permissões administrativas no servidor. Nenhuma senha é solicitada ou armazenada nesta página.</p></div>
        </div>
        <Link to="/" style={{ display: "flex", justifyContent: "center", gap: 8, alignItems: "center", padding: 14, borderRadius: 999, background: "#75152F", color: "white", textDecoration: "none" }}><ArrowLeft size={17}/> Voltar para a loja</Link>
      </section>
    </main>
  );
}
