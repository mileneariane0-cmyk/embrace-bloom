import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Baby, Gift, Heart, Flower2, GraduationCap, Sparkles, Menu, X } from "lucide-react";
import "./personalize.css";

export const Route = createFileRoute("/")({ component: Home });
const categories = [
  { name: "Aniversário infantil", icon: Baby },
  { name: "Aniversário adulto", icon: Gift },
  { name: "Casamento", icon: Heart },
  { name: "Chá de bebê", icon: Flower2 },
  { name: "Chá revelação", icon: Sparkles },
  { name: "Formatura", icon: GraduationCap },
];
const models = [
  { name: "Jardim Encantado", category: "Aniversário infantil", style: "garden", message: "Um dia mágico" },
  { name: "Amor em Flor", category: "Casamento", style: "wedding", message: "O nosso sim" },
  { name: "Doce Espera", category: "Chá de bebê", style: "baby", message: "Um novo amor" },
];
function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState<(typeof models)[number] | null>(null);
  const go = (id: string) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };
  return <div className="personalize">
    <header className="pz-header"><nav className="pz-container pz-nav" aria-label="Menu principal">
      <a className="pz-logo" href="/">Personaliz<span>ê</span>.</a>
      <div className="pz-links"><button onClick={() => go("inicio")}>Início</button><button onClick={() => go("modelos")}>Convites</button><button onClick={() => go("categorias")}>Categorias</button><button onClick={() => go("como-funciona")}>Como funciona</button><a className="pz-button" href="mailto:contato@exemplo.com?subject=Contato%20Personaliz%C3%AA">Contato <ArrowRight size={16}/></a></div>
      <button className="pz-menu-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
    </nav>{menuOpen && <div className="pz-mobile-menu">{[["Início","inicio"],["Convites","modelos"],["Categorias","categorias"],["Como funciona","como-funciona"]].map(([name,id]) => <button key={id} onClick={() => go(id)}>{name}</button>)}</div>}</header>
    <main><section id="inicio" className="pz-hero"><div className="pz-container pz-hero-grid"><div><span className="pz-eyebrow">Personalizê • Convites digitais</span><h1>Momentos únicos merecem <em>detalhes especiais.</em></h1><p>Convites digitais feitos com carinho para transformar suas celebrações em memórias inesquecíveis. Cada história é única. Cada detalhe também.</p><div className="pz-actions"><button className="pz-button" onClick={() => go("modelos")}>Explorar convites <ArrowRight size={17}/></button><button className="pz-button pz-outline" onClick={() => go("como-funciona")}>Como funciona</button></div></div><div className="pz-art"><div className="pz-paper"><span className="pz-eyebrow">Você é nosso convidado</span><h2>Um dia<br/>especial</h2><p>feito para celebrar o amor</p><div className="pz-flowers">✿ ❀ ✿</div></div><div className="pz-art-label">♡ Cada detalhe é único</div></div></div></section>
    <section id="categorias" className="pz-section pz-white"><div className="pz-container"><div className="pz-heading"><span className="pz-eyebrow">Para cada ocasião</span><h2>O que vamos celebrar?</h2><p>Uma coleção pensada para todos os momentos que merecem ser lembrados.</p></div><div className="pz-categories">{categories.map(({name,icon:Icon}) => <button className="pz-category" key={name} onClick={() => go("modelos")}><span className="pz-category-icon"><Icon size={27}/></span><strong>{name}</strong><ArrowRight size={16}/></button>)}</div></div></section>
    <section id="modelos" className="pz-section"><div className="pz-container"><div className="pz-heading"><span className="pz-eyebrow">Inspirações especiais</span><h2>Encontre seu convite perfeito</h2><p>Conheça nossos estilos de inspiração. O catálogo comercial estará disponível em breve.</p></div><div className="pz-models">{models.map(model => <article className="pz-model" key={model.name}><div className={`pz-model-art ${model.style}`}><div className="pz-model-paper"><Flower2 size={30}/><small>VOCÊ É NOSSO CONVIDADO</small><h3>{model.message}</h3><p>✦ com carinho ✦</p></div></div><div className="pz-model-info"><small>{model.category}</small><h3>{model.name}</h3><button className="pz-button pz-outline" onClick={() => setPreview(model)}>Visualizar inspiração <ArrowRight size={16}/></button></div></article>)}</div></div></section>
    <section id="como-funciona" className="pz-section pz-white"><div className="pz-container"><div className="pz-heading"><span className="pz-eyebrow">Simples e especial</span><h2>Como funciona?</h2></div><div className="pz-steps">{[["01","Escolha seu estilo","Encontre a inspiração que combina com seu evento."],["02","Conte sua história","Envie os detalhes que tornam sua celebração única."],["03","Compartilhe a magia","Receba seu convite digital e compartilhe com quem você ama."]].map(([n,t,d]) => <div key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div></div></section>
    <section className="pz-cta"><span className="pz-eyebrow">Feito especialmente para você</span><h2>Cada detalhe é único.</h2><p>Porque os momentos mais bonitos merecem ser celebrados.</p><button className="pz-button" onClick={() => go("modelos")}>Conhecer inspirações <ArrowRight size={16}/></button></section></main>
    <footer className="pz-footer"><div className="pz-container"><span className="pz-logo">Personaliz<span>ê</span>.</span><small>© {new Date().getFullYear()} Personalizê • Cada detalhe é único.</small></div></footer>
    {preview && <div className="pz-overlay" onClick={() => setPreview(null)}><div className="pz-modal" role="dialog" aria-modal="true" aria-label={`Prévia ${preview.name}`} onClick={e => e.stopPropagation()}><button className="pz-close" aria-label="Fechar prévia" onClick={() => setPreview(null)}><X/></button><h2>{preview.name}</h2><div className={`pz-model-art ${preview.style}`}><div className="pz-model-paper"><Flower2 size={30}/><small>VOCÊ É NOSSO CONVIDADO</small><h3>{preview.message}</h3><p>✦ com carinho ✦</p></div></div><p>Esta é uma inspiração visual. As compras serão habilitadas quando a loja e o pagamento estiverem configurados.</p><button className="pz-button" onClick={() => setPreview(null)}>Fechar</button></div></div>}
  </div>;
}
