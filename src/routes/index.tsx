import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState, type CSSProperties } from "react";
import { ArrowRight, Baby, Gift, Heart, Flower2, GraduationCap, Sparkles, Menu, X, UserRound, ShoppingCart, Instagram, Facebook, Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import "./personalize.css";
import logo from "@/assets/personalize-logo.png.asset.json";
import { getPublishedContent } from "@/lib/site-content.functions";
import { safeLink, withDefaults, type SiteContent, type LinkButton, type SectionKey } from "@/lib/site-content";
import { supabase } from "@/integrations/supabase/client";

const contentQuery = queryOptions({ queryKey: ["site-content", "published"], queryFn: () => getPublishedContent() });

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>) => ({ preview: s.preview === "1" || s.preview === 1 ? "1" : undefined }) as { preview?: string },
  loader: ({ context }) => context.queryClient.ensureQueryData(contentQuery),
  head: ({ loaderData }) => {
    const title = loaderData?.brand.siteTitle ?? "Personalizê | Convites digitais personalizados";
    const description = loaderData?.brand.siteDescription ?? "Convites digitais personalizados para celebrações especiais.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: Home,
});

const icons = [Baby, Gift, Heart, Flower2, Sparkles, GraduationCap];

function Home() {
  const { data: published } = useSuspenseQuery(contentQuery);
  const { preview } = Route.useSearch();
  const [draft, setDraft] = useState<SiteContent | null>(null);
  useEffect(() => {
    if (!preview) return;
    supabase.from("site_content").select("content").eq("id", "draft").maybeSingle().then(({ data }) => { if (data) setDraft(withDefaults(data.content)); });
  }, [preview]);
  const c = draft ?? published;

  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<SiteContent["models"]["items"][number] | null>(null);
  const go = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  const logoUrl = c.brand.logoUrl || logo.url;
  const vars = { "--wine": c.colors.wine, "--pink": c.colors.pink, "--sage": c.colors.sage, "--cream": c.colors.cream, "--ink": c.colors.ink } as CSSProperties;

  const Btn = ({ b, outline }: { b: LinkButton; outline?: boolean }) => {
    if (!b.visible) return null;
    const href = safeLink(b.link);
    const cls = `pz-button${outline ? " pz-outline" : ""}`;
    if (href.startsWith("#")) return <button className={cls} onClick={() => go(href.slice(1))}>{b.label} <ArrowRight size={16} /></button>;
    return <a className={cls} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{b.label} <ArrowRight size={16} /></a>;
  };

  const section = (key: SectionKey) => {
    if (c.hidden.includes(key)) return null;
    if (key === "categorias") return <section key={key} id="categorias" className="pz-section pz-white"><div className="pz-container"><div className="pz-heading"><span className="pz-eyebrow">{c.categories.eyebrow}</span><h2>{c.categories.title}</h2><p>{c.categories.text}</p></div><div className="pz-categories">{c.categories.items.filter((i) => i.visible).map(({ name }, i) => { const Icon = icons[i % icons.length]; return <button className="pz-category" key={name + i} onClick={() => go("modelos")}><span className="pz-category-icon"><Icon size={27} /></span><strong>{name}</strong><ArrowRight size={16} /></button>; })}</div></div></section>;
    if (key === "modelos") return <section key={key} id="modelos" className="pz-section"><div className="pz-container"><div className="pz-heading"><span className="pz-eyebrow">{c.models.eyebrow}</span><h2>{c.models.title}</h2><p>{c.models.text}</p></div><div className="pz-models">{c.models.items.filter((m) => m.featured).map((m, i) => <article className="pz-model" key={m.name + i}><ModelArt m={m} /><div className="pz-model-info"><small>{m.category}</small><h3>{m.name}</h3><button className="pz-button pz-outline" onClick={() => setModal(m)}>Visualizar inspiração <ArrowRight size={16} /></button></div></article>)}</div></div></section>;
    if (key === "como-funciona") return <section key={key} id="como-funciona" className="pz-section pz-white"><div className="pz-container"><div className="pz-heading"><span className="pz-eyebrow">{c.steps.eyebrow}</span><h2>{c.steps.title}</h2></div><div className="pz-steps">{c.steps.items.map((s, i) => <div key={i}><span>{String(i + 1).padStart(2, "0")}</span><h3>{s.title}</h3><p>{s.text}</p></div>)}</div></div></section>;
    if (key === "cta") return <section key={key} className="pz-cta"><span className="pz-eyebrow">{c.cta.eyebrow}</span><h2>{c.cta.title}</h2><p>{c.cta.text}</p><Btn b={c.cta.button} /></section>;
    const cs = c.customSections.find((s) => `custom:${s.id}` === key);
    if (!cs) return null;
    const bg = cs.background === "bordo" ? "pz-cta" : cs.background === "branco" ? "pz-section pz-white" : "pz-section";
    return <section key={key} id={cs.id} className={bg} style={cs.background === "bordo" ? undefined : { textAlign: "center" }}><div className="pz-container" style={{ maxWidth: 900 }}>
      {cs.title && <div className="pz-heading" style={{ marginBottom: 20 }}><h2 style={cs.background === "bordo" ? { color: "white" } : undefined}>{cs.title}</h2></div>}
      {cs.text && <p style={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>{cs.text}</p>}
      {cs.mediaUrl && (cs.type === "video" ? <video src={cs.mediaUrl} controls style={{ width: "100%", borderRadius: 18, marginTop: 20 }} /> : cs.type !== "texto" && <img src={cs.mediaUrl} alt={cs.title} style={{ width: "100%", borderRadius: 18, marginTop: 20 }} />)}
      <div style={{ marginTop: 20 }}><Btn b={cs.button} /></div>
    </div></section>;
  };

  const socials = [
    { v: c.contact.instagram, Icon: Instagram, label: "Instagram" },
    { v: c.contact.facebook, Icon: Facebook, label: "Facebook" },
    { v: c.contact.whatsapp && `https://wa.me/${c.contact.whatsapp.replace(/\D/g, "")}`, Icon: MessageCircle, label: "WhatsApp" },
    { v: c.contact.email && `mailto:${c.contact.email}`, Icon: Mail, label: "E-mail" },
    { v: c.contact.phone && `tel:${c.contact.phone.replace(/[^\d+]/g, "")}`, Icon: Phone, label: "Telefone" },
  ].filter((s) => s.v);
  const extraSocial = [["TikTok", c.contact.tiktok], ["Pinterest", c.contact.pinterest]].filter(([, v]) => v);

  return <div className="personalize" style={vars}>
    {draft && <div style={{ background: "#30272B", color: "white", textAlign: "center", padding: 8, fontSize: 13 }}>Pré-visualização do rascunho — ainda não publicado</div>}
    {c.banner.enabled && <a href={safeLink(c.banner.link)} style={{ display: "block", background: "var(--pink)", color: "var(--wine)", textAlign: "center", padding: "10px 16px", fontSize: 14, fontWeight: 600 }}>{c.banner.text}</a>}
    <header className="pz-header"><nav className="pz-container pz-nav" aria-label="Menu principal">
      <a className="pz-logo" href="/"><img src={logoUrl} alt="Personalizê — Cada detalhe é único" /></a>
      <div className="pz-links"><button onClick={() => go("inicio")}>{c.header.menuStart}</button><button onClick={() => go("modelos")}>{c.header.menuInvites}</button><button onClick={() => go("categorias")}>{c.header.menuCategories}</button><button onClick={() => go("como-funciona")}>{c.header.menuHow}</button>{c.header.showAccount && <><a href="/minha-conta" className="pz-header-link" aria-label="Minha Conta"><UserRound size={19} /> Minha Conta</a><a href="/minha-conta" className="pz-header-link" aria-label="Carrinho"><ShoppingCart size={19} /></a></>}<Btn b={c.header.cta} /></div>
      <button className="pz-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
    </nav>{menuOpen && <div className="pz-mobile-menu">{[[c.header.menuStart, "inicio"], [c.header.menuInvites, "modelos"], [c.header.menuCategories, "categorias"], [c.header.menuHow, "como-funciona"]].map(([name, id]) => <button key={id} onClick={() => go(id ?? "")}>{name}</button>)}{c.header.showAccount && <a href="/minha-conta">Minha Conta / Carrinho</a>}{c.header.cta.visible && <a href={safeLink(c.header.cta.link)}>{c.header.cta.label}</a>}</div>}</header>
    <main>
      {c.hero.visible && <section id="inicio" className="pz-hero"><div className="pz-container pz-hero-grid"><div><span className="pz-eyebrow">{c.hero.eyebrow}</span><h1>{c.hero.title} <em>{c.hero.highlight}</em></h1><p>{c.hero.text}</p><div className="pz-actions"><Btn b={c.hero.primary} /><Btn b={c.hero.secondary} outline /></div></div>
        <div className="pz-art">{c.hero.videoUrl ? <video src={c.hero.videoUrl} autoPlay muted loop playsInline style={{ position: "relative", width: "100%", borderRadius: 24 }} /> : c.hero.imageUrl ? <img src={c.hero.imageUrl} alt={c.hero.title} style={{ position: "relative", width: "100%", maxHeight: 470, objectFit: "cover", borderRadius: 24 }} /> : <div className="pz-paper"><span className="pz-eyebrow">{c.hero.cardEyebrow}</span><h2>{c.hero.cardTitle}</h2><p>{c.hero.cardText}</p><div className="pz-flowers">✿ ❀ ✿</div></div>}{c.hero.badge && <div className="pz-art-label">{c.hero.badge}</div>}</div></div></section>}
      {c.order.map(section)}
    </main>
    <footer className="pz-footer"><div className="pz-container"><span className="pz-logo"><img src={logoUrl} alt="Personalizê" /></span>
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", color: "var(--wine)" }}>{socials.map(({ v, Icon, label }) => <a key={label} href={safeLink(v as string)} aria-label={label} target="_blank" rel="noreferrer"><Icon size={20} /></a>)}{extraSocial.map(([l, v]) => <a key={l} href={safeLink(v)} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>{l}</a>)}{c.contact.address && <small style={{ display: "inline-flex", gap: 4, alignItems: "center" }}><MapPin size={14} />{c.contact.address}</small>}</div>
      <small>© {new Date().getFullYear()} Personalizê • {c.footer.text}</small>{c.footer.showAdminLink && <a className="pz-admin-link" href="/admin/login" aria-label="Acessar administração">Administração</a>}</div></footer>
    {modal && <div className="pz-overlay" onClick={() => setModal(null)}><div className="pz-modal" role="dialog" aria-modal="true" aria-label={`Prévia ${modal.name}`} onClick={(e) => e.stopPropagation()}><button className="pz-close" aria-label="Fechar prévia" onClick={() => setModal(null)}><X /></button><h2>{modal.name}</h2><ModelArt m={modal} /><p>Esta é uma inspiração visual. As compras serão habilitadas quando a loja e o pagamento estiverem configurados.</p><button className="pz-button" onClick={() => setModal(null)}>Fechar</button></div></div>}
  </div>;
}

function ModelArt({ m }: { m: SiteContent["models"]["items"][number] }) {
  if (m.imageUrl) return <div className={`pz-model-art ${m.style}`} style={{ padding: 0 }}><img src={m.imageUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>;
  return <div className={`pz-model-art ${m.style}`}><div className="pz-model-paper"><Flower2 size={30} /><small>VOCÊ É NOSSO CONVIDADO</small><h3>{m.message}</h3><p>✦ com carinho ✦</p></div></div>;
}
