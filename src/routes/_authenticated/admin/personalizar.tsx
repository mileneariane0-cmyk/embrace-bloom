import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, Plus, Trash2, Upload, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus } from "@/lib/admin.functions";
import { defaultContent, isHexColor, withDefaults, type CustomSection, type LinkButton, type SectionKey, type SiteContent } from "@/lib/site-content";
import logo from "@/assets/personalize-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin/personalizar")({
  head: () => ({ meta: [{ title: "Personalizar Site | Administração Personalizê" }, { name: "description", content: "Editor do site da Personalizê." }, { property: "og:title", content: "Personalizar Site — Personalizê" }, { property: "og:description", content: "Editor do site da Personalizê." }, { name: "robots", content: "noindex" }] }),
  component: Editor,
});

const W = "#75152F";
const st = {
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e8d6da", fontSize: 14, boxSizing: "border-box" as const, background: "#fff", fontFamily: "inherit" },
  label: { display: "block", fontSize: 13, color: "#5d4f54", marginTop: 12 },
  card: { background: "white", border: "1px solid #f1e2e5", borderRadius: 16, padding: 18, marginBottom: 14 },
  btn: { padding: "10px 16px", borderRadius: 999, border: `1px solid ${W}`, background: W, color: "white", fontSize: 14, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" },
  ghost: { padding: "8px 12px", borderRadius: 999, border: `1px solid ${W}`, background: "white", color: W, fontSize: 13, cursor: "pointer", display: "inline-flex", gap: 6, alignItems: "center" },
  icon: { padding: 6, borderRadius: 8, border: "1px solid #eadde0", background: "white", color: W, cursor: "pointer", display: "inline-flex" },
};

const TABS = ["Marca e cores", "Topo e aviso", "Destaque principal", "Seções", "Categorias", "Convites em destaque", "Como funciona", "Chamada final", "Contato e redes", "Rodapé", "Histórico"] as const;
type Tab = (typeof TABS)[number];

function Editor() {
  const statusFn = useServerFn(getAdminStatus);
  const { data: status, isLoading } = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn() });
  const [c, setC] = useState<SiteContent | null>(null);
  const [tab, setTab] = useState<Tab>("Marca e cores");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!status?.isOwner) return;
    supabase.from("site_content").select("id, content").then(({ data }) => {
      const draft = data?.find((r) => r.id === "draft") ?? data?.find((r) => r.id === "published");
      setC(withDefaults(draft?.content ?? null));
    });
  }, [status?.isOwner]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); return undefined; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (isLoading) return <Shell><p>Carregando...</p></Shell>;
  if (!status?.isOwner) return <Shell><p>Esta conta não tem permissão de administração.</p></Shell>;
  if (!c) return <Shell><p>Carregando conteúdo do site...</p></Shell>;

  const update = (fn: (d: SiteContent) => void) => { const d = structuredClone(c); fn(d); setC(d); setDirty(true); };

  function validate(): string | null {
    for (const [k, v] of Object.entries(c!.colors)) if (!isHexColor(v)) return `Cor inválida em "${k}". Use o formato #RRGGBB.`;
    return null;
  }

  async function save(publish: boolean) {
    const err = validate();
    if (err) return toast.error(err);
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const now = new Date().toISOString();
    const rows = [{ id: "draft", content: c as never, updated_at: now, updated_by: u.user?.id ?? null }];
    if (publish) rows.push({ id: "published", content: c as never, updated_at: now, updated_by: u.user?.id ?? null });
    const { error } = await supabase.from("site_content").upsert(rows);
    if (!error && publish) await supabase.from("site_versions").insert({ content: c as never, note: "Publicação", created_by: u.user?.id ?? null });
    setBusy(false);
    if (error) return toast.error("Não foi possível salvar. Tente novamente.");
    setDirty(false);
    toast.success(publish ? "Alterações publicadas no site!" : "Rascunho salvo.");
  }

  async function discard() {
    if (!confirm("Descartar o rascunho e voltar para a versão publicada?")) return;
    const { data } = await supabase.from("site_content").select("content").eq("id", "published").maybeSingle();
    setC(withDefaults(data?.content ?? null)); setDirty(true);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFF8F6", fontFamily: "Arial, sans-serif", color: "#30272B" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: "white", borderBottom: "1px solid #f1e2e5", padding: "10px 16px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/admin" style={{ color: W, display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}><ArrowLeft size={16} /> Painel</Link>
        <img src={logo.url} alt="Personalizê" style={{ height: 34 }} />
        <strong style={{ color: W, fontFamily: "Georgia, serif", fontWeight: 400, fontSize: 20 }}>Personalizar Site</strong>
        {dirty && <span style={{ fontSize: 12, color: "#a0616f" }}>• alterações não salvas</span>}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={st.ghost} onClick={discard} disabled={busy}>Restaurar publicado</button>
          <button style={st.ghost} onClick={() => save(false)} disabled={busy}>Salvar rascunho</button>
          <button style={st.ghost} onClick={async () => { await save(false); window.open("/?preview=1", "_blank"); }} disabled={busy}><Eye size={15} /> Visualizar</button>
          <button style={st.btn} onClick={() => confirm("Publicar as alterações no site?") && save(true)} disabled={busy}>Publicar</button>
        </div>
      </header>
      <div style={{ display: "flex", gap: 18, padding: 16, flexWrap: "wrap", maxWidth: 1200, margin: "auto" }}>
        <nav style={{ flex: "1 1 200px", maxWidth: 240, display: "flex", flexDirection: "column", gap: 4 }}>
          {TABS.map((t) => <button key={t} onClick={() => setTab(t)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 10, border: 0, cursor: "pointer", background: t === tab ? W : "transparent", color: t === tab ? "white" : "#30272B", fontSize: 14 }}>{t}</button>)}
        </nav>
        <main style={{ flex: "3 1 480px", minWidth: 0 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontWeight: 400, color: W, marginTop: 0 }}>{tab}</h2>
          <Panel tab={tab} c={c} update={update} setC={(v) => { setC(v); setDirty(true); }} />
        </main>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#FFF8F6", fontFamily: "Arial, sans-serif" }}><div style={{ textAlign: "center" }}>{children}<Link to="/admin" style={{ color: W }}>Voltar ao painel</Link></div></main>;
}

function Text({ label, value, onChange, area }: { label: string; value: string; onChange: (v: string) => void; area?: boolean }) {
  return <label style={st.label}>{label}{area ? <textarea style={{ ...st.input, minHeight: 80 }} value={value} onChange={(e) => onChange(e.target.value)} /> : <input style={st.input} value={value} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return <label style={{ ...st.label, display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}><input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} /> {label}</label>;
}
function ButtonEditor({ label, b, onChange }: { label: string; b: LinkButton; onChange: (b: LinkButton) => void }) {
  return <div style={{ ...st.card, background: "#fffafa" }}><strong style={{ fontSize: 14, color: W }}>{label}</strong>
    <Toggle label="Mostrar botão" value={b.visible} onChange={(visible) => onChange({ ...b, visible })} />
    <Text label="Texto do botão" value={b.label} onChange={(l) => onChange({ ...b, label: l })} />
    <Text label="Link (ex.: /orcamento, #modelos, https://...)" value={b.link} onChange={(link) => onChange({ ...b, link })} />
  </div>;
}
function Media({ label, value, onChange, accept = "image/*" }: { label: string; value: string; onChange: (v: string) => void; accept?: string }) {
  const [up, setUp] = useState(false);
  async function upload(f: File) {
    setUp(true);
    const path = `${crypto.randomUUID()}-${f.name.replace(/[^\w.\-]/g, "_")}`;
    const { error } = await supabase.storage.from("site-media").upload(path, f, { contentType: f.type });
    setUp(false);
    if (error) return toast.error("Falha no envio do arquivo.");
    onChange(`/api/public/media/${path}`);
  }
  return <div style={st.label}>{label}
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
      {value && (accept.startsWith("video") ? <video src={value} style={{ height: 60, borderRadius: 8 }} /> : <img src={value} alt="" style={{ height: 60, maxWidth: 160, objectFit: "contain", borderRadius: 8, border: "1px solid #eee" }} />)}
      <label style={st.ghost}><Upload size={14} /> {up ? "Enviando..." : "Enviar arquivo"}<input type="file" accept={accept} hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} /></label>
      {value && <button style={st.ghost} onClick={() => onChange("")}>Remover</button>}
    </div>
    <input style={{ ...st.input, marginTop: 6 }} placeholder="ou cole um endereço de imagem" value={value} onChange={(e) => onChange(e.target.value)} />
  </div>;
}
function Color({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label style={{ ...st.label, display: "flex", alignItems: "center", gap: 10 }}><input type="color" value={isHexColor(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} /><input style={{ ...st.input, width: 110 }} value={value} onChange={(e) => onChange(e.target.value)} /> {label}</label>;
}
function move<T>(arr: T[], i: number, d: number) { const j = i + d; if (j < 0 || j >= arr.length) return; const t = arr[i] as T; arr[i] = arr[j] as T; arr[j] = t; }
function Row({ children, onUp, onDown, onDelete }: { children: ReactNode; onUp: () => void; onDown: () => void; onDelete?: (() => void) | undefined }) {
  return <div style={st.card}><div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}><button style={st.icon} onClick={onUp} aria-label="Subir"><ArrowUp size={14} /></button><button style={st.icon} onClick={onDown} aria-label="Descer"><ArrowDown size={14} /></button>{onDelete && <button style={st.icon} onClick={() => confirm("Remover este item?") && onDelete()} aria-label="Remover"><Trash2 size={14} /></button>}</div>{children}</div>;
}

const sectionNames: Record<string, string> = { categorias: "Categorias", modelos: "Convites em destaque", "como-funciona": "Como funciona", cta: "Chamada final" };

function Panel({ tab, c, update, setC }: { tab: Tab; c: SiteContent; update: (fn: (d: SiteContent) => void) => void; setC: (c: SiteContent) => void }) {
  switch (tab) {
    case "Marca e cores": return <>
      <div style={st.card}>
        <Media label="Logomarca (PNG com fundo transparente)" value={c.brand.logoUrl} onChange={(v) => update((d) => { d.brand.logoUrl = v; })} />
        <p style={{ fontSize: 12, color: "#8a7b80" }}>Sem arquivo enviado, o site usa a logomarca oficial atual.</p>
        <Media label="Ícone da aba do navegador (favicon)" value={c.brand.faviconUrl} onChange={(v) => update((d) => { d.brand.faviconUrl = v; })} />
        <Text label="Título do site (aparece no Google e na aba)" value={c.brand.siteTitle} onChange={(v) => update((d) => { d.brand.siteTitle = v; })} />
        <Text label="Descrição do site (Google e compartilhamentos)" area value={c.brand.siteDescription} onChange={(v) => update((d) => { d.brand.siteDescription = v; })} />
      </div>
      <div style={st.card}><strong style={{ color: W }}>Cores</strong>
        <Color label="Principal (bordô)" value={c.colors.wine} onChange={(v) => update((d) => { d.colors.wine = v; })} />
        <Color label="Destaque (rosa)" value={c.colors.pink} onChange={(v) => update((d) => { d.colors.pink = v; })} />
        <Color label="Secundária (sálvia)" value={c.colors.sage} onChange={(v) => update((d) => { d.colors.sage = v; })} />
        <Color label="Fundo (creme)" value={c.colors.cream} onChange={(v) => update((d) => { d.colors.cream = v; })} />
        <Color label="Texto" value={c.colors.ink} onChange={(v) => update((d) => { d.colors.ink = v; })} />
        <button style={{ ...st.ghost, marginTop: 12 }} onClick={() => update((d) => { d.colors = { ...defaultContent.colors }; })}>Voltar às cores originais</button>
      </div></>;
    case "Topo e aviso": return <>
      <div style={st.card}><strong style={{ color: W }}>Faixa de aviso no topo</strong>
        <Toggle label="Mostrar faixa de aviso" value={c.banner.enabled} onChange={(v) => update((d) => { d.banner.enabled = v; })} />
        <Text label="Texto" value={c.banner.text} onChange={(v) => update((d) => { d.banner.text = v; })} />
        <Text label="Link" value={c.banner.link} onChange={(v) => update((d) => { d.banner.link = v; })} />
      </div>
      <div style={st.card}><strong style={{ color: W }}>Menu</strong>
        <Text label="Item 'Início'" value={c.header.menuStart} onChange={(v) => update((d) => { d.header.menuStart = v; })} />
        <Text label="Item 'Convites'" value={c.header.menuInvites} onChange={(v) => update((d) => { d.header.menuInvites = v; })} />
        <Text label="Item 'Categorias'" value={c.header.menuCategories} onChange={(v) => update((d) => { d.header.menuCategories = v; })} />
        <Text label="Item 'Como funciona'" value={c.header.menuHow} onChange={(v) => update((d) => { d.header.menuHow = v; })} />
        <Toggle label="Mostrar Minha Conta e Carrinho" value={c.header.showAccount} onChange={(v) => update((d) => { d.header.showAccount = v; })} />
      </div>
      <ButtonEditor label="Botão do topo" b={c.header.cta} onChange={(b) => update((d) => { d.header.cta = b; })} /></>;
    case "Destaque principal": return <>
      <div style={st.card}>
        <Toggle label="Mostrar esta seção" value={c.hero.visible} onChange={(v) => update((d) => { d.hero.visible = v; })} />
        <Text label="Frase pequena acima do título" value={c.hero.eyebrow} onChange={(v) => update((d) => { d.hero.eyebrow = v; })} />
        <Text label="Título" value={c.hero.title} onChange={(v) => update((d) => { d.hero.title = v; })} />
        <Text label="Parte do título em destaque (itálico)" value={c.hero.highlight} onChange={(v) => update((d) => { d.hero.highlight = v; })} />
        <Text label="Texto" area value={c.hero.text} onChange={(v) => update((d) => { d.hero.text = v; })} />
      </div>
      <div style={st.card}><strong style={{ color: W }}>Imagem ao lado</strong>
        <Media label="Imagem (substitui o cartão ilustrado)" value={c.hero.imageUrl} onChange={(v) => update((d) => { d.hero.imageUrl = v; })} />
        <Media label="Ou vídeo" accept="video/*" value={c.hero.videoUrl} onChange={(v) => update((d) => { d.hero.videoUrl = v; })} />
        <Text label="Cartão: frase pequena" value={c.hero.cardEyebrow} onChange={(v) => update((d) => { d.hero.cardEyebrow = v; })} />
        <Text label="Cartão: título" value={c.hero.cardTitle} onChange={(v) => update((d) => { d.hero.cardTitle = v; })} />
        <Text label="Cartão: texto" value={c.hero.cardText} onChange={(v) => update((d) => { d.hero.cardText = v; })} />
        <Text label="Selo (deixe vazio para ocultar)" value={c.hero.badge} onChange={(v) => update((d) => { d.hero.badge = v; })} />
      </div>
      <ButtonEditor label="Botão principal" b={c.hero.primary} onChange={(b) => update((d) => { d.hero.primary = b; })} />
      <ButtonEditor label="Botão secundário" b={c.hero.secondary} onChange={(b) => update((d) => { d.hero.secondary = b; })} /></>;
    case "Seções": return <>
      <p style={{ fontSize: 14, color: "#716469" }}>Reorganize, oculte ou crie novas seções. A ordem abaixo é a ordem no site.</p>
      {c.order.map((key, i) => {
        const cs = key.startsWith("custom:") ? c.customSections.find((s) => `custom:${s.id}` === key) : null;
        const hidden = c.hidden.includes(key);
        return <Row key={key} onUp={() => update((d) => move(d.order, i, -1))} onDown={() => update((d) => move(d.order, i, 1))} onDelete={cs ? () => update((d) => { d.customSections = d.customSections.filter((s) => s.id !== cs.id); d.order = d.order.filter((k) => k !== key); }) : undefined}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <strong style={{ color: W }}>{cs ? `Seção personalizada: ${cs.title || "(sem título)"}` : sectionNames[key]}</strong>
            <button style={{ ...st.ghost, marginLeft: "auto" }} onClick={() => update((d) => { d.hidden = hidden ? d.hidden.filter((k) => k !== key) : [...d.hidden, key]; })}>{hidden ? <><EyeOff size={14} /> Oculta</> : <><Eye size={14} /> Visível</>}</button>
          </div>
          {cs && <CustomEditor s={cs} onChange={(n) => update((d) => { d.customSections = d.customSections.map((x) => (x.id === n.id ? n : x)); })} />}
        </Row>;
      })}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["texto", "imagem", "video", "banner"] as const).map((type) => <button key={type} style={st.ghost} onClick={() => update((d) => {
          const id = `secao-${Date.now().toString(36)}`;
          d.customSections.push({ id, type, title: "Nova seção", text: "", mediaUrl: "", button: { label: "Saiba mais", link: "/orcamento", visible: false }, background: type === "banner" ? "bordo" : "branco" });
          d.order.push(`custom:${id}` as SectionKey);
        })}><Plus size={14} /> {type === "texto" ? "Texto" : type === "imagem" ? "Imagem" : type === "video" ? "Vídeo" : "Banner"}</button>)}
      </div></>;
    case "Categorias": return <>
      <div style={st.card}>
        <Text label="Frase pequena" value={c.categories.eyebrow} onChange={(v) => update((d) => { d.categories.eyebrow = v; })} />
        <Text label="Título" value={c.categories.title} onChange={(v) => update((d) => { d.categories.title = v; })} />
        <Text label="Texto" area value={c.categories.text} onChange={(v) => update((d) => { d.categories.text = v; })} />
      </div>
      {c.categories.items.map((it, i) => <Row key={i} onUp={() => update((d) => move(d.categories.items, i, -1))} onDown={() => update((d) => move(d.categories.items, i, 1))} onDelete={() => update((d) => { d.categories.items.splice(i, 1); })}>
        <Text label="Nome da categoria" value={it.name} onChange={(v) => update((d) => { d.categories.items[i].name = v; })} />
        <Toggle label="Mostrar no site" value={it.visible} onChange={(v) => update((d) => { d.categories.items[i].visible = v; })} />
      </Row>)}
      <button style={st.ghost} onClick={() => update((d) => { d.categories.items.push({ name: "Nova categoria", visible: true }); })}><Plus size={14} /> Adicionar categoria</button></>;
    case "Convites em destaque": return <>
      <div style={st.card}>
        <Text label="Frase pequena" value={c.models.eyebrow} onChange={(v) => update((d) => { d.models.eyebrow = v; })} />
        <Text label="Título" value={c.models.title} onChange={(v) => update((d) => { d.models.title = v; })} />
        <Text label="Texto" area value={c.models.text} onChange={(v) => update((d) => { d.models.text = v; })} />
      </div>
      {c.models.items.map((m, i) => <Row key={i} onUp={() => update((d) => move(d.models.items, i, -1))} onDown={() => update((d) => move(d.models.items, i, 1))} onDelete={() => update((d) => { d.models.items.splice(i, 1); })}>
        <Toggle label="Exibir em destaque no site" value={m.featured} onChange={(v) => update((d) => { d.models.items[i].featured = v; })} />
        <Text label="Nome" value={m.name} onChange={(v) => update((d) => { d.models.items[i].name = v; })} />
        <Text label="Categoria" value={m.category} onChange={(v) => update((d) => { d.models.items[i].category = v; })} />
        <Text label="Frase do convite" value={m.message} onChange={(v) => update((d) => { d.models.items[i].message = v; })} />
        <label style={st.label}>Estilo de cores<select style={st.input} value={m.style} onChange={(e) => update((d) => { d.models.items[i].style = e.target.value as "garden"; })}><option value="garden">Rosado</option><option value="wedding">Verde sálvia</option><option value="baby">Rosa claro</option></select></label>
        <Media label="Imagem do convite (opcional)" value={m.imageUrl} onChange={(v) => update((d) => { d.models.items[i].imageUrl = v; })} />
      </Row>)}
      <button style={st.ghost} onClick={() => update((d) => { d.models.items.push({ name: "Novo convite", category: "", style: "garden", message: "Celebre conosco", imageUrl: "", featured: true }); })}><Plus size={14} /> Adicionar convite</button></>;
    case "Como funciona": return <>
      <div style={st.card}>
        <Text label="Frase pequena" value={c.steps.eyebrow} onChange={(v) => update((d) => { d.steps.eyebrow = v; })} />
        <Text label="Título" value={c.steps.title} onChange={(v) => update((d) => { d.steps.title = v; })} />
      </div>
      {c.steps.items.map((s, i) => <Row key={i} onUp={() => update((d) => move(d.steps.items, i, -1))} onDown={() => update((d) => move(d.steps.items, i, 1))} onDelete={() => update((d) => { d.steps.items.splice(i, 1); })}>
        <Text label={`Passo ${i + 1} — título`} value={s.title} onChange={(v) => update((d) => { d.steps.items[i].title = v; })} />
        <Text label="Descrição" area value={s.text} onChange={(v) => update((d) => { d.steps.items[i].text = v; })} />
      </Row>)}
      <button style={st.ghost} onClick={() => update((d) => { d.steps.items.push({ title: "Novo passo", text: "" }); })}><Plus size={14} /> Adicionar passo</button></>;
    case "Chamada final": return <>
      <div style={st.card}>
        <Text label="Frase pequena" value={c.cta.eyebrow} onChange={(v) => update((d) => { d.cta.eyebrow = v; })} />
        <Text label="Título" value={c.cta.title} onChange={(v) => update((d) => { d.cta.title = v; })} />
        <Text label="Texto" value={c.cta.text} onChange={(v) => update((d) => { d.cta.text = v; })} />
      </div>
      <ButtonEditor label="Botão" b={c.cta.button} onChange={(b) => update((d) => { d.cta.button = b; })} /></>;
    case "Contato e redes": return <div style={st.card}>
      <p style={{ fontSize: 13, color: "#8a7b80", margin: 0 }}>Campos vazios não aparecem no site.</p>
      <Text label="WhatsApp (com DDD, ex.: 5571999999999)" value={c.contact.whatsapp} onChange={(v) => update((d) => { d.contact.whatsapp = v; })} />
      <Text label="E-mail" value={c.contact.email} onChange={(v) => update((d) => { d.contact.email = v; })} />
      <Text label="Telefone" value={c.contact.phone} onChange={(v) => update((d) => { d.contact.phone = v; })} />
      <Text label="Endereço / cidade" value={c.contact.address} onChange={(v) => update((d) => { d.contact.address = v; })} />
      <Text label="Instagram (link completo)" value={c.contact.instagram} onChange={(v) => update((d) => { d.contact.instagram = v; })} />
      <Text label="Facebook (link completo)" value={c.contact.facebook} onChange={(v) => update((d) => { d.contact.facebook = v; })} />
      <Text label="TikTok (link completo)" value={c.contact.tiktok} onChange={(v) => update((d) => { d.contact.tiktok = v; })} />
      <Text label="Pinterest (link completo)" value={c.contact.pinterest} onChange={(v) => update((d) => { d.contact.pinterest = v; })} />
    </div>;
    case "Rodapé": return <div style={st.card}>
      <Text label="Texto do rodapé" value={c.footer.text} onChange={(v) => update((d) => { d.footer.text = v; })} />
      <Toggle label="Mostrar link 'Administração'" value={c.footer.showAdminLink} onChange={(v) => update((d) => { d.footer.showAdminLink = v; })} />
      {!c.footer.showAdminLink && <p style={{ fontSize: 12, color: "#a0616f" }}>Sem o link, acesse pelo endereço do site seguido de /admin/login.</p>}
    </div>;
    case "Histórico": return <History onRestore={setC} />;
  }
}

function CustomEditor({ s, onChange }: { s: CustomSection; onChange: (s: CustomSection) => void }) {
  return <>
    <Text label="Título" value={s.title} onChange={(title) => onChange({ ...s, title })} />
    <Text label="Texto" area value={s.text} onChange={(text) => onChange({ ...s, text })} />
    {s.type !== "texto" && <Media label={s.type === "video" ? "Vídeo" : "Imagem"} accept={s.type === "video" ? "video/*" : "image/*"} value={s.mediaUrl} onChange={(mediaUrl) => onChange({ ...s, mediaUrl })} />}
    <label style={st.label}>Fundo<select style={st.input} value={s.background} onChange={(e) => onChange({ ...s, background: e.target.value as CustomSection["background"] })}><option value="branco">Branco</option><option value="creme">Creme</option><option value="bordo">Bordô</option></select></label>
    <ButtonEditor label="Botão" b={s.button} onChange={(button) => onChange({ ...s, button })} />
  </>;
}

function History({ onRestore }: { onRestore: (c: SiteContent) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ["site-versions"], queryFn: async () => (await supabase.from("site_versions").select("id, created_at, note, content").order("created_at", { ascending: false }).limit(30)).data ?? [] });
  if (isLoading) return <p>Carregando...</p>;
  if (!data?.length) return <p style={{ color: "#716469" }}>Nenhuma publicação ainda. Cada vez que você publicar, uma versão fica guardada aqui.</p>;
  return <>{data.map((v) => <div key={v.id} style={{ ...st.card, display: "flex", alignItems: "center", gap: 10 }}>
    <span>{new Date(v.created_at).toLocaleString("pt-BR")} — {v.note}</span>
    <button style={{ ...st.ghost, marginLeft: "auto" }} onClick={() => { if (confirm("Carregar esta versão no editor? Depois é só publicar.")) { onRestore(withDefaults(v.content)); toast.success("Versão carregada. Revise e publique."); } }}>Restaurar</button>
  </div>)}</>;
}
