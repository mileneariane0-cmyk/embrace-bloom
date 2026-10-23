import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminStatus } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CalendarHeart, Link2, ShoppingBag, Users, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/gestao")({ component: Gestao });
type Tab = "convites"|"links"|"pedidos"|"clientes";
const tabs = [
 {key:"convites" as Tab,title:"Convites",icon:CalendarHeart,table:"invitation_models"},
 {key:"links" as Tab,title:"Links dos convites",icon:Link2,table:"customer_invitations"},
 {key:"pedidos" as Tab,title:"Pedidos",icon:ShoppingBag,table:"customer_orders"},
 {key:"clientes" as Tab,title:"Clientes",icon:Users,table:"customer_profiles"}
];
function Gestao(){
 const [allowed,setAllowed]=useState<boolean|null>(null);
 const [tab,setTab]=useState<Tab>("convites");
 const [rows,setRows]=useState<Record<string,unknown>[]>([]);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{let live=true;getAdminStatus().then(v=>{if(live)setAllowed(v.isOwner)}).catch(()=>{if(live)setAllowed(false)});return()=>{live=false}},[]);
 useEffect(()=>{if(!allowed)return;let live=true;setLoading(true);setError("");setRows([]);
  const name=tabs.find(t=>t.key===tab)!.table;
  // Queries run only after server-side role verification; RLS must also enforce permissions.
  supabase.from(name as "invitation_models").select("*").limit(100).then(({data,error})=>{
   if(!live)return;
   setLoading(false);
   if(error){setError("Não foi possível consultar os dados. Verifique se a tabela e as permissões estão configuradas.");return}
   setRows((data??[]) as Record<string,unknown>[]);
  });
  return()=>{live=false};
 },[allowed,tab]);
 const label=(r:Record<string,unknown>)=>String(r.title??r.name??r.full_name??r.id??"Registro");
 const detail=(r:Record<string,unknown>)=>tab==="links"?String(r.slug??""):tab==="pedidos"?String(r.production_status??""):tab==="convites"?String(r.status??""):String(r.phone??"");
 return <main style={{minHeight:"100vh",background:"#fff8f6",color:"#30272b",fontFamily:"Arial,sans-serif",padding:"24px"}}>
  <div style={{maxWidth:1150,margin:"auto"}}>
   <Link to="/admin" style={{color:"#75152f",display:"inline-flex",gap:8,alignItems:"center",textDecoration:"none"}}><ArrowLeft size={18}/> Voltar ao painel</Link>
   <h1 style={{font:"normal 38px Georgia,serif",color:"#75152f",marginBottom:6}}>Gestão da Personalizê</h1>
   <p style={{color:"#766a6d",marginTop:0}}>Convites personalizados pelo administrador, links exclusivos, pedidos e clientes.</p>
   {allowed===null?<p>Verificando permissões...</p>:!allowed?<section style={{background:"white",padding:28,borderRadius:18}}><ShieldCheck color="#75152f"/><h2>Acesso restrito</h2><p>Entre com uma conta administrativa autorizada.</p><Link to="/admin/login">Ir para o login</Link></section>:<>
    <nav aria-label="Módulos administrativos" style={{display:"flex",flexWrap:"wrap",gap:10,margin:"26px 0"}}>
     {tabs.map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{border:"1px solid #ead6db",background:tab===t.key?"#75152f":"white",color:tab===t.key?"white":"#75152f",borderRadius:14,padding:"13px 17px",display:"flex",gap:9,alignItems:"center",cursor:"pointer"}}><t.icon size={18}/>{t.title}</button>)}
    </nav>
    <section style={{background:"white",padding:"clamp(18px,4vw,32px)",borderRadius:20,border:"1px solid #f0e1e5"}}>
     <h2 style={{color:"#75152f",marginTop:0}}>{tabs.find(t=>t.key===tab)?.title}</h2>
     {tab==="convites"&&<p>Os modelos são a base para personalizações individuais. O editor e a publicação por cliente serão conectados a este módulo.</p>}
     {tab==="links"&&<p>Links individuais terão status ativo, inativo ou arquivado e expiração opcional. Desativar não apaga o convite.</p>}
     {tab==="pedidos"&&<p>Consulte os pedidos registrados no sistema, sem alterar pagamentos automaticamente.</p>}
     {tab==="clientes"&&<p>Dados de clientes disponíveis somente para administradores autorizados.</p>}
     {loading?<p>Carregando registros...</p>:error?<p role="alert" style={{color:"#a22b46"}}>{error}</p>:rows.length===0?<p style={{color:"#766a6d"}}>Nenhum registro encontrado.</p>:<div style={{display:"grid",gap:10}}>{rows.map((r,i)=><div key={String(r.id??i)} style={{padding:16,border:"1px solid #f0e1e5",borderRadius:12,display:"flex",flexWrap:"wrap",justifyContent:"space-between",gap:10}}><strong>{label(r)}</strong><span style={{fontSize:13,color:"#766a6d"}}>{detail(r)}</span></div>)}</div>}
    </section>
   </>}
  </div>
 </main>
}
