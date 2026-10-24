import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/convite/$slug")({component: Convite});
type Page = {title:string;content:unknown;status:string};
function Convite(){
 const {slug}=Route.useParams();
 const [page,setPage]=useState<Page|null>(null);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{let active=true;setLoading(true);supabase.from("customer_invitations" as "invitation_models").select("title,content,status").eq("slug",slug).eq("status","active").maybeSingle().then(({data})=>{if(active){setPage(data as Page|null);setLoading(false)}});return()=>{active=false}},[slug]);
 if(loading)return <main style={{padding:40,textAlign:"center"}}>Carregando convite...</main>;
 if(!page)return <main style={{padding:40,textAlign:"center"}}><h1>Convite indisponível</h1><p>Este convite não está publicado ou não está mais disponível.</p></main>;
 const data=(page.content??{}) as Record<string,unknown>;
 const image=typeof data.imageUrl==="string"&&data.imageUrl.startsWith("https://")?data.imageUrl:null;
 const video=typeof data.videoUrl==="string"&&data.videoUrl.startsWith("https://")?data.videoUrl:null;
 const name=typeof data.honoree==="string"?data.honoree:page.title;
 const date=typeof data.eventDate==="string"?data.eventDate:"";
 const address=typeof data.address==="string"?data.address:"";
 const message=typeof data.message==="string"?data.message:"";
 const links=Array.isArray(data.buttons)?data.buttons.filter((b):b is {label:string;url:string}=>typeof b==="object"&&b!==null&&typeof b.label==="string"&&typeof b.url==="string"&&/^https:\/\//.test(b.url)): [];
 return <main style={{minHeight:"100vh",background:typeof data.background==="string"&&/^#[0-9a-fA-F]{6}$/.test(data.background)?data.background:"#fff8f6",color:"#75152f",fontFamily:"Georgia,serif",textAlign:"center",padding:"32px 18px"}}>
  <article style={{maxWidth:600,margin:"auto"}}><h1 style={{fontSize:"clamp(32px,7vw,52px)"}}>{name}</h1>
   {image&&<img src={image} alt={"Arte do convite "+name} style={{width:"100%",borderRadius:18}}/>}
   {video&&<video src={video} controls playsInline style={{width:"100%",borderRadius:18,marginTop:18}}/>}
   {message&&<p style={{fontSize:20,lineHeight:1.7}}>{message}</p>}
   {date&&<p>Data e horário: {date}</p>}{address&&<p>Local: {address}</p>}
   <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>{links.map((b,i)=><a key={i} href={b.url} target="_blank" rel="noopener noreferrer" style={{padding:"12px 20px",background:"#75152f",color:"white",borderRadius:30,textDecoration:"none"}}>{b.label}</a>)}</div>
  </article>
 </main>;
}
