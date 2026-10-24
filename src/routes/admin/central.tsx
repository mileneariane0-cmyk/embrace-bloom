import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminStatus } from "@/lib/admin.functions";
import logo from "@/assets/personalize-logo.png.asset.json";
import { LayoutDashboard, Paintbrush, PanelsTopLeft, Mail, Link2, Package, Tags, ShoppingBag, Users, ClipboardList, Images, Settings, Menu, X, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/central")({ component: Central });
export const adminModules = [
 {slug:"dashboard",title:"Dashboard",icon:LayoutDashboard},
 {slug:"personalizar-site",title:"Personalizar Site",icon:Paintbrush},
 {slug:"landing-pages",title:"Landing Pages de Convites",icon:PanelsTopLeft},
 {slug:"modelos-landing",title:"Modelos de Landing Pages",icon:Mail},
 {slug:"links",title:"Links dos Convites",icon:Link2},
 {slug:"produtos",title:"Produtos",icon:Package},
 {slug:"categorias",title:"Categorias",icon:Tags},
 {slug:"pedidos",title:"Pedidos",icon:ShoppingBag},
 {slug:"clientes",title:"Clientes",icon:Users},
 {slug:"orcamentos",title:"Orçamentos",icon:ClipboardList},
 {slug:"pagamentos",title:"Pagamentos",icon:ShoppingBag},
 {slug:"midias",title:"Arquivos e Mídias",icon:Images},
 {slug:"configuracoes",title:"Configurações",icon:Settings}
] as const;

function Central(){
 const [allowed,setAllowed]=useState<boolean|null>(null);
 const [email,setEmail]=useState("");
 const [menu,setMenu]=useState(false);
 useEffect(()=>{let live=true;getAdminStatus().then(r=>{if(live){setAllowed(r.isOwner);setEmail(r.email)}}).catch(()=>{if(live)setAllowed(false)});return()=>{live=false}},[]);
 const nav=<nav aria-label="Menu administrativo" style={{display:"grid",gap:5}}>{adminModules.map(({slug,title,icon:Icon})=><Link key={slug} to="/admin/modulo/$modulo" params={{modulo:slug}} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 15px",borderRadius:12,color:"#75152f",textDecoration:"none",fontSize:14}}><Icon size={19}/>{title}</Link>)}</nav>;
 return <main style={{minHeight:"100vh",background:"#fff8f6",fontFamily:"Arial,sans-serif",color:"#30272b"}}>
 {allowed===null?<p style={{padding:32}}>Verificando acesso...</p>:!allowed?<section style={{padding:40,textAlign:"center"}}><ShieldCheck color="#75152f" size={40}/><h1>Acesso administrativo restrito</h1><Link to="/admin/login">Entrar</Link></section>:<div style={{display:"flex",minHeight:"100vh"}}>
  <aside style={{width:258,background:"white",padding:20,borderRight:"1px solid #f0e1e5",flexShrink:0}} className="admin-sidebar"><img src={logo.url} alt="Personalizê" style={{maxWidth:175,width:"100%",marginBottom:26}}/>{nav}</aside>
  <div style={{flex:1,minWidth:0}}><header style={{background:"white",borderBottom:"1px solid #f0e1e5",padding:"18px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><strong style={{color:"#75152f"}}>Painel administrativo</strong><div style={{fontSize:12,color:"#766a6d"}}>{email}</div></div><button onClick={()=>setMenu(v=>!v)} style={{background:"#75152f",color:"white",border:0,borderRadius:10,padding:"10px 15px",cursor:"pointer"}}><Menu size={17}/> Menu</button></header>{menu&&<div style={{padding:18,background:"white",borderBottom:"1px solid #f0e1e5"}}>{nav}<button onClick={()=>setMenu(false)} style={{border:0,background:"transparent",display:"flex",alignItems:"center",gap:8}}><X size={16}/> Fechar</button></div>}
  <div style={{padding:"clamp(18px,4vw,36px)"}}><h1 style={{font:"normal 38px Georgia,serif",color:"#75152f"}}>Bem-vinda à Personalizê</h1><p>Escolha um módulo no menu para administrar sua loja. As ações de criação e edição dependem da integração de dados e permissões no Lovable Cloud.</p><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:15}}>{adminModules.map(({slug,title,icon:Icon})=><Link key={slug} to="/admin/modulo/$modulo" params={{modulo:slug}} style={{padding:22,background:"white",border:"1px solid #f0e1e5",borderRadius:16,color:"#75152f",textDecoration:"none",display:"flex",alignItems:"center",gap:12}}><Icon size={23}/><strong>{title}</strong></Link>)}</div></div></div>
 </div>}
 <style>{`@media(max-width:850px){.admin-sidebar{display:none}}`}</style>
 </main>;
}
