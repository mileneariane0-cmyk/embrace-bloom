import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";
export const Route = createFileRoute("/orcamento")({ component: Orcamento });
const inputStyle = { width: "100%", padding: "12px 14px", border: "1px solid #e8d9db", borderRadius: 10, background: "white", color: "#30272b" };
function Orcamento() {
  const [form,setForm] = useState({nome:"",telefone:"",email:"",produto:"",evento:"",prazo:"",quantidade:"",descricao:"",observacoes:""});
  const [anexo,setAnexo] = useState<File|null>(null);
  const [erro,setErro] = useState("");
  const set = (key:keyof typeof form,value:string) => setForm(v=>({...v,[key]:value}));
  function enviar(e:FormEvent<HTMLFormElement>) {
    e.preventDefault(); setErro("");
    if (!form.nome.trim() || !form.telefone.trim() || !form.email.trim() || !form.produto.trim() || !form.descricao.trim()) { setErro("Preencha os campos obrigatórios."); return; }
    if (anexo) { setErro("O envio de anexos ainda depende da integração com armazenamento seguro. Remova o arquivo e envie a descrição pelo WhatsApp."); return; }
    const mensagem = ["Olá! 💗 Gostaria de solicitar um orçamento na Personalizê.","","Nome: "+form.nome,"WhatsApp: "+form.telefone,"E-mail: "+form.email,"Produto/Serviço: "+form.produto,"Tipo de evento: "+(form.evento||"Não informado"),"Data/Prazo: "+(form.prazo||"Não informado"),"Quantidade: "+(form.quantidade||"Não informada"),"Descrição: "+form.descricao,"Observações: "+(form.observacoes||"Nenhuma"),"","Aguardo o retorno com valores e informações. Obrigada!"].join("\n");
    window.location.href = "https://wa.me/5571986691076?text="+encodeURIComponent(mensagem);
  }
  return <main style={{minHeight:"100vh",background:"#fff8f6",padding:"32px 18px",fontFamily:"Arial,sans-serif",color:"#30272b"}}>
    <div style={{maxWidth:760,margin:"auto"}}><Link to="/" style={{color:"#75152f",display:"inline-flex",alignItems:"center",gap:8,textDecoration:"none"}}><ArrowLeft size={17}/> Voltar à loja</Link>
    <header style={{textAlign:"center",margin:"28px 0"}}><span style={{color:"#819b87",letterSpacing:3,fontSize:12}}>PERSONALIZÊ</span><h1 style={{font:"normal 42px Georgia,serif",color:"#75152f",margin:"14px 0"}}>Solicite seu orçamento</h1><p>Conte como imagina seu projeto. Vamos conversar sobre os detalhes!</p></header>
    <form onSubmit={enviar} style={{background:"white",borderRadius:22,padding:"clamp(20px,5vw,42px)",boxShadow:"0 12px 36px #75152f12",display:"grid",gap:18}}>
      <div style={{background:"#fff8f6",padding:15,borderRadius:12,fontSize:13,lineHeight:1.6,display:"flex",gap:10}}><ShieldCheck size={20} color="#819b87" style={{flexShrink:0}}/><span>Seu orçamento será preparado no WhatsApp. O registro no sistema e o número de protocolo serão disponibilizados após a integração do banco de dados. Nenhum envio é feito automaticamente.</span></div>
      {([["nome","Nome completo *"],["telefone","WhatsApp *"],["email","E-mail *"],["produto","Produto ou serviço *"],["evento","Tipo de evento"],["prazo","Data do evento ou prazo"],["quantidade","Quantidade"]] as const).map(([key,label])=><label key={key} style={{display:"grid",gap:7,fontSize:14,fontWeight:600}}>{label}<input style={inputStyle} value={form[key]} onChange={e=>set(key,e.target.value)} required={["nome","telefone","email","produto"].includes(key)} type={key==="email"?"email":key==="prazo"?"date":key==="quantidade"?"number":"text"} min={key==="quantidade"?"1":undefined} autoComplete={key==="nome"?"name":key==="email"?"email":key==="telefone"?"tel":undefined}/></label>)}
      <label style={{display:"grid",gap:7,fontSize:14,fontWeight:600}}>Descreva o que deseja *<textarea style={{...inputStyle,minHeight:120}} value={form.descricao} onChange={e=>set("descricao",e.target.value)} required/></label>
      <label style={{display:"grid",gap:7,fontSize:14,fontWeight:600}}>Observações adicionais<textarea style={{...inputStyle,minHeight:80}} value={form.observacoes} onChange={e=>set("observacoes",e.target.value)}/></label>
      <label style={{display:"grid",gap:7,fontSize:14,fontWeight:600}}>Referências (opcional — integração em preparação)<input style={inputStyle} type="file" accept=".png,.jpg,.jpeg,.pdf" onChange={e=>{const f=e.target.files?.[0]||null;if(f && (f.size>10*1024*1024 || !["image/png","image/jpeg","application/pdf"].includes(f.type))){setErro("Arquivo inválido. Utilize PNG, JPG ou PDF de até 10 MB.");e.target.value="";setAnexo(null)}else{setAnexo(f);setErro("")}}}/></label>
      {erro&&<p role="alert" style={{color:"#a12142",margin:0}}>{erro}</p>}
      <button type="submit" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:16,background:"#75152f",color:"white",border:0,borderRadius:30,fontWeight:700,cursor:"pointer"}}><Send size={18}/> Preparar mensagem no WhatsApp</button>
    </form></div>
  </main>;
}
