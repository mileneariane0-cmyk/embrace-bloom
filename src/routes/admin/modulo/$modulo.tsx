import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAdminStatus } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Search, ExternalLink, Copy } from "lucide-react";
import { adminModules } from "../central";

export const Route = createFileRoute("/admin/modulo/$modulo")({ component: ModulePage });
type Row = Record<string,unknown>;
const tables:Record<string,string>={
 "landing-pages":"customer_invitations","modelos-landing":"invitation_models",links:"customer_invitations",produtos:"personalized_products",
 categorias:"personalized_product_categories",pedidos:"customer_orders",clientes:"customer_profiles",orcamentos:"quote_requests"
};
function ModulePage(){
 const {modulo}=Route.useParams();
 const module=adminModules.find(m=>m.slug===modulo);
 const [allowed,setAllowed]=useState<boolean|null>(null);
 const [rows,setRows]=useState<Row[]>([]);
 const [error,setError]=useState("");
 const [busy,setBusy]=useState(false);
 const [search,setSearch]=useState("");
 const [showForm,setShowForm]=useState(false);
 const [name,setName]=useState("");
 const [description,setDescription]=useState("");
 const [price,setPrice]=useState("");
 useEffect(()=>{let active=true;getAdminStatus().then(v=>{if(active)setAllowed(v.isOwner)}).catch(()=>{if(active)setAllowed(false)});return()=>{active=false}},[]);
 useEffect(()=>{if(allowed!==true||!tables[modulo])return;let active=true;setBusy(true);setError("");setRows([]);
  supabase.from(tables[modulo] as "invitation_models").select("*").limit(100).then(({data,error})=>{if(!active)return;setBusy(false);if(error)setError("Não foi possível consultar os registros. Verifique as migrações e permissões do Lovable Cloud.");else setRows((data??[]) as Row[])});return()=>{active=false};
 },[allowed,modulo]);
 async function create(e:React.FormEvent){e.preventDefault();setError("");setBusy(true);
  try{
   const payload=modulo==="categorias"?{name,slug:name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+Date.now().toString(36),description}:modulo==="produtos"?{name,slug:name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+Date.now().toString(36),description,price_cents:Math.round(Number(price.replace(",","."))*100),status:"draft"}:null;
   if(!payload)throw Error("Esta operação ainda não está disponível.");
   const {data,error}=await supabase.from(tables[modulo] as "personalized_products").insert(payload as never).select("*").single();
   if(error)throw error;
   setRows(v=>[data as Row,...v]);setShowForm(false);setName("");setDescription("");setPrice("");
  }catch(e){setError(e instanceof Error?e.message:"Erro ao salvar");}finally{setBusy(false)}
 }
 const title=module?.title??"Módulo não encontrado";
 const filtered=rows.filter(r=>JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));
 return <main style={{minHeight:"100vh",padding:"clamp(18px,4vw,36px)",background:"#fff8f6",color:"#30272b",fontFamily:"Arial,sans-serif"}}>
  <div style={{maxWidth:1100,margin:"auto"}}><Link to="/admin/central" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#75152f",textDecoration:"none"}}><ArrowLeft size={18}/> Voltar ao painel</Link><h1 style={{font:"normal 38px Georgia,serif",color:"#75152f"}}>{title}</h1>
  {allowed===null?<p>Verificando permissões...</p>:!allowed?<p>Acesso restrito. <Link to="/admin/login">Entrar</Link></p>:<>
   {modulo==="personalizar-site"&&<p>Este módulo é exclusivo para a aparência e o conteúdo da loja. Não modifica convites de clientes. O editor existente deve ser acessado pelo painel original até sua integração nesta navegação.</p>}
   {modulo==="landing-pages"&&<div style={{background:"white",padding:24,borderRadius:16}}><h2>Landing Pages de Convites</h2><p>As artes serão enviadas prontas pelo administrador. Comece cadastrando as informações e as URLs das mídias da página. O editor de blocos e o upload seguro serão acrescentados em seguida.</p><Link to="/admin/modulo/$modulo" params={{modulo:"modelos-landing"}} style={{color:"#75152f"}}>Consultar modelos cadastrados</Link> <Link to="/admin/landing-page" style={{color:"#75152f",marginLeft:16}}>+ Criar Página de Convite</Link></div>}
   {modulo==="dashboard"&&<div style={{background:"white",padding:24,borderRadius:16}}><p>Os indicadores serão apresentados após a integração das consultas autorizadas de vendas, clientes e convites. Nenhuma métrica fictícia será exibida.</p></div>}
   {!tables[modulo]&&!["dashboard","landing-pages","personalizar-site"].includes(modulo)&&<p>Este módulo aguarda integração com o serviço de dados e arquivos da loja. Nenhuma alteração foi feita nas configurações existentes.</p>}
   {tables[modulo]&&<section style={{background:"white",border:"1px solid #f0e1e5",borderRadius:18,padding:"clamp(16px,4vw,26px)"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,marginBottom:20}}><label style={{display:"flex",alignItems:"center",gap:8,border:"1px solid #e9d8dc",borderRadius:12,padding:"10px 12px"}}><Search size={18}/><input aria-label="Pesquisar registros" placeholder="Pesquisar" value={search} onChange={e=>setSearch(e.target.value)} style={{border:0,outline:0,fontSize:15}}/></label>
     {["produtos","categorias"].includes(modulo)&&<button onClick={()=>setShowForm(v=>!v)} style={{display:"flex",alignItems:"center",gap:8,border:0,background:"#75152f",color:"white",borderRadius:12,padding:"12px 18px",cursor:"pointer"}}><Plus size={18}/>{modulo==="produtos"?"Cadastrar produto":"Nova categoria"}</button>}
    </div>
    {showForm&&<form onSubmit={create} style={{display:"grid",gap:12,padding:18,background:"#fff8f6",borderRadius:12,marginBottom:20}}><label>Nome<input required maxLength={160} value={name} onChange={e=>setName(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label><label>Descrição<textarea value={description} onChange={e=>setDescription(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>{modulo==="produtos"&&<label>Preço (R$)<input required type="number" step="0.01" min="0" value={price} onChange={e=>setPrice(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>}<button disabled={busy} style={{background:"#75152f",color:"white",border:0,borderRadius:12,padding:13,cursor:"pointer"}}>Salvar no Lovable Cloud</button></form>}
    {error&&<p role="alert" style={{color:"#a21d40"}}>{error}</p>}
    {busy?<p>Carregando...</p>:filtered.length===0?<p>Nenhum registro encontrado.</p>:<div style={{display:"grid",gap:10}}>{filtered.map((r,i)=><article key={String(r.id??i)} style={{border:"1px solid #f0e1e5",borderRadius:12,padding:15,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}><div><strong>{String(r.name??r.title??r.full_name??r.id)}</strong><p style={{fontSize:13,color:"#786b70",margin:"5px 0"}}>{String(r.status??r.production_status??r.slug??"")}</p></div>{modulo==="links"&&r.slug&&<div style={{display:"flex",gap:12}}><button onClick={()=>navigator.clipboard.writeText(location.origin+"/convite/"+String(r.slug))} aria-label="Copiar link"><Copy size={18}/></button><a href={"/convite/"+encodeURIComponent(String(r.slug))} target="_blank" rel="noopener noreferrer" aria-label="Abrir convite"><ExternalLink size={18}/></a></div>}</article>)}</div>}
   </section>}
  </>}
  </div>
 </main>;
}
