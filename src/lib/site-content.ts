// Shape and defaults of the editable public site. Stored as JSON in Lovable Cloud.
export type LinkButton = { label: string; link: string; visible: boolean };
export type CustomSection = {
  id: string;
  type: "texto" | "imagem" | "video" | "banner";
  title: string;
  text: string;
  mediaUrl: string;
  button: LinkButton;
  background: "creme" | "branco" | "bordo";
};
export type SectionKey = "categorias" | "modelos" | "como-funciona" | "cta" | `custom:${string}`;

export type SiteContent = {
  brand: { logoUrl: string; faviconUrl: string; siteTitle: string; siteDescription: string };
  colors: { wine: string; pink: string; sage: string; cream: string; ink: string };
  banner: { enabled: boolean; text: string; link: string };
  header: { menuStart: string; menuInvites: string; menuCategories: string; menuHow: string; showAccount: boolean; cta: LinkButton };
  hero: { visible: boolean; eyebrow: string; title: string; highlight: string; text: string; imageUrl: string; videoUrl: string; cardEyebrow: string; cardTitle: string; cardText: string; badge: string; primary: LinkButton; secondary: LinkButton };
  categories: { eyebrow: string; title: string; text: string; items: { name: string; visible: boolean }[] };
  models: { eyebrow: string; title: string; text: string; items: { name: string; category: string; style: "garden" | "wedding" | "baby"; message: string; imageUrl: string; featured: boolean }[] };
  steps: { eyebrow: string; title: string; items: { title: string; text: string }[] };
  cta: { eyebrow: string; title: string; text: string; button: LinkButton };
  customSections: CustomSection[];
  order: SectionKey[];
  hidden: SectionKey[];
  contact: { whatsapp: string; email: string; phone: string; address: string; instagram: string; facebook: string; tiktok: string; pinterest: string };
  footer: { text: string; showAdminLink: boolean };
};

const btn = (label: string, link: string): LinkButton => ({ label, link, visible: true });

export const defaultContent: SiteContent = {
  brand: { logoUrl: "", faviconUrl: "", siteTitle: "Personalizê | Loja de produtos personalizados", siteDescription: "Personalizê — Cada detalhe é único. Convites virtuais, topos de bolo, papelaria e personalizados para momentos especiais." },
  colors: { wine: "#75152F", pink: "#F29BAA", sage: "#819B87", cream: "#FFF8F6", ink: "#30272B" },
  banner: { enabled: false, text: "Novidade: convites digitais com confirmação de presença!", link: "/orcamento" },
  header: { menuStart: "Início", menuInvites: "Produtos", menuCategories: "Categorias", menuHow: "Como funciona", showAccount: true, cta: btn("Solicite seu orçamento", "/orcamento") },
  hero: {
    visible: true, eyebrow: "Personalizê • Loja de personalizados", title: "Cada celebração merece", highlight: "um toque único.",
    text: "Convites virtuais, topos de bolo, lembrancinhas e personalizados para tornar cada ocasião ainda mais especial. Criamos com carinho para você.",
    imageUrl: "", videoUrl: "", cardEyebrow: "Você é nosso convidado", cardTitle: "Um dia especial", cardText: "feito para celebrar o amor", badge: "♡ Cada detalhe é único",
    primary: btn("Explorar personalizados", "#categorias"), secondary: btn("Solicitar orçamento", "/orcamento"),
  },
  categories: { eyebrow: "Nossa loja", title: "Personalizados para cada momento", text: "Explore nossas linhas de produtos. Novas categorias e coleções chegam em breve.",
    items: ["Convites Virtuais", "Topos de Bolo", "Lembrancinhas", "Papelaria Personalizada", "Kits para Festas"].map((name) => ({ name, visible: true })) },
  models: { eyebrow: "Inspirações especiais", title: "Encontre seu convite perfeito", text: "Conheça nossos estilos de inspiração. O catálogo comercial estará disponível em breve.",
    items: [
      { name: "Jardim Encantado", category: "Aniversário infantil", style: "garden", message: "Um dia mágico", imageUrl: "", featured: true },
      { name: "Amor em Flor", category: "Casamento", style: "wedding", message: "O nosso sim", imageUrl: "", featured: true },
      { name: "Doce Espera", category: "Chá de bebê", style: "baby", message: "Um novo amor", imageUrl: "", featured: true },
    ] },
  steps: { eyebrow: "Simples e especial", title: "Como funciona?", items: [
    { title: "Escolha seu estilo", text: "Encontre a inspiração que combina com seu evento." },
    { title: "Conte sua história", text: "Envie os detalhes que tornam sua celebração única." },
    { title: "Compartilhe a magia", text: "Receba seu convite digital e compartilhe com quem você ama." },
  ] },
  cta: { eyebrow: "Feito especialmente para você", title: "Cada detalhe é único.", text: "Porque os momentos mais bonitos merecem ser celebrados.", button: btn("Conhecer inspirações", "#modelos") },
  customSections: [],
  order: ["categorias", "modelos", "como-funciona", "cta"],
  hidden: [],
  contact: { whatsapp: "", email: "", phone: "", address: "", instagram: "", facebook: "", tiktok: "", pinterest: "" },
  footer: { text: "Cada detalhe é único.", showAdminLink: true },
};

/** Deep-merge stored content over defaults so new fields always have a value. */
export function withDefaults(stored: unknown): SiteContent {
  const merge = (base: any, over: any): any => {
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === "object") {
      const out: any = { ...base };
      if (over && typeof over === "object" && !Array.isArray(over)) for (const k of Object.keys(over)) out[k] = k in base ? merge(base[k], over[k]) : over[k];
      return out;
    }
    return over === undefined || over === null ? base : over;
  };
  const c = merge(defaultContent, stored) as SiteContent;
  // Make sure every custom section appears in the order list.
  for (const s of c.customSections) if (!c.order.includes(`custom:${s.id}`)) c.order = [...c.order, `custom:${s.id}`];
  c.order = c.order.filter((k) => !k.startsWith("custom:") || c.customSections.some((s) => `custom:${s.id}` === k));
  return c;
}

/** Only allow safe link targets: in-page anchors, site paths, http(s), mailto, tel, WhatsApp. */
export function safeLink(link: string): string {
  const l = (link || "").trim();
  if (/^(#|\/(?!\/)|https?:\/\/|mailto:|tel:)/i.test(l)) return l;
  return "#";
}

export const isHexColor = (v: string) => /^#[0-9a-f]{6}$/i.test(v);
