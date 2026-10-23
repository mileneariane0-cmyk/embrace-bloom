import type { ReactNode } from "react";
import logo from "@/assets/personalize-logo.png.asset.json";

export const adminStyles = {
  input: { width: "100%", padding: "13px 14px", borderRadius: 12, border: "1px solid #e8d6da", fontSize: 15, marginTop: 6, boxSizing: "border-box" as const, background: "#fff" },
  label: { display: "block", fontSize: 14, color: "#30272B", marginTop: 16 },
  button: { width: "100%", marginTop: 22, padding: 14, borderRadius: 999, background: "#75152F", color: "white", border: 0, fontSize: 15, fontWeight: 600, cursor: "pointer" },
  link: { color: "#75152F", fontSize: 14 },
  error: { background: "#fdecef", color: "#75152F", padding: 12, borderRadius: 10, fontSize: 14, marginTop: 16 },
  ok: { background: "#eef3ef", color: "#3f5a45", padding: 12, borderRadius: 10, fontSize: 14, marginTop: 16, lineHeight: 1.6 },
};

export function AdminCard({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (
    <main style={{ minHeight: "100vh", background: "#FFF8F6", display: "grid", placeItems: "center", padding: 24, fontFamily: "Arial, sans-serif", color: "#30272B" }}>
      <section style={{ width: "100%", maxWidth: wide ? 760 : 460, background: "white", padding: "clamp(24px,5vw,46px)", borderRadius: 24, boxShadow: "0 16px 50px #75152f12", border: "1px solid #f1e2e5" }}>
        <div style={{ textAlign: "center" }}>
          <img src={logo.url} alt="Personalizê" style={{ width: "100%", maxWidth: 260, height: "auto", margin: "0 auto" }} />
          <p style={{ color: "#819B87", letterSpacing: 2, fontSize: 12, margin: "10px 0 4px" }}>ÁREA ADMINISTRATIVA</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 26, color: "#75152F", margin: "8px 0 0" }}>{title}</h1>
        </div>
        {children}
      </section>
    </main>
  );
}
