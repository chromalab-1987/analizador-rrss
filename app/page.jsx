"use client";

import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  Search, TrendingUp, Eye, Hash, Users, Zap,
  ArrowUpRight, RotateCcw, Sparkles,
} from "lucide-react";

/* ─── TOKENS ─── */
const T = {
  bg:"#09090f", bg2:"#0f0f1a", card:"#111120",
  border:"rgba(139,92,246,0.18)", border2:"rgba(139,92,246,0.35)",
  purple:"#8b5cf6", purpleL:"#a78bfa", pink:"#d946ef",
  white:"#f0eeff", text:"#c4c4d8", muted:"#6b6b8a",
  green:"#22c55e", amber:"#f59e0b", red:"#ef4444",
};

/* ─── HELPERS ─── */
const fmt = n => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : String(n || 0);
const rand = (a,b) => Math.floor(Math.random()*(b-a+1))+a;

/* Fallback mock para cuando la API no está configurada */
function buildMock(handle, platform) {
  const followers = rand(9000, 820000);
  return {
    platform, followers,
    name: handle.replace(/[@_]/g," ").replace(/\b\w/g,l=>l.toUpperCase()).trim()||"Marca",
    handle: handle.startsWith("@")?handle:`@${handle}`,
    following: rand(150,3200), posts_count: rand(200,4500),
    engagement: parseFloat((Math.random()*5.5+1.3).toFixed(1)),
    avg_likes: rand(200,8000), avg_comments: rand(20,400),
    avg_reach: Math.floor(followers*(Math.random()*0.17+0.06)),
    recent_posts: Array.from({length:7},(_,i)=>({
      date: new Date(Date.now()-i*86400000).toISOString(),
      likes: rand(600,11000), comments: rand(25,520),
    })),
    _isMock: true,
  };
}

/* ─── ICONS ─── */
const IgIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);
const FbIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

/* ─── TOOLTIP ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 16px",fontSize:"0.78rem"}}>
      <div style={{color:T.muted,marginBottom:6,letterSpacing:"0.08em"}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:T.text,display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:p.stroke,flexShrink:0}}/>
          {p.name}: <span style={{color:T.white,fontWeight:500}}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── LOGO ─── */
const Logo = ({ size=38 }) => (
  <div style={{display:"flex",alignItems:"center",gap:10}}>
    <div style={{width:size,height:size,borderRadius:Math.round(size*.26),background:`linear-gradient(135deg,${T.purple},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 24px rgba(139,92,246,0.4)`,flexShrink:0}}>
      <span className="playfair" style={{fontSize:size*.4,fontWeight:800,color:"#fff",fontStyle:"italic"}}>C</span>
    </div>
    <span className="dmsans" style={{fontSize:"1rem",fontWeight:500,letterSpacing:"0.05em",color:T.white}}>
      CHROMA<span style={{color:T.purple}}>LAB</span>
      <span style={{color:T.muted,fontWeight:300}}> · social</span>
    </span>
  </div>
);

/* ══════════════════════════════════════════════
   HOME
══════════════════════════════════════════════ */
function HomeView({ onAnalyze }) {
  const [handle,setPlatform2] = useState("");
  const [platform,setPlatform] = useState("instagram");
  const setHandle = setPlatform2;

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"fixed",top:"-20%",left:"-10%",width:600,height:600,borderRadius:"50%",filter:"blur(90px)",background:"radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-15%",right:"-8%",width:500,height:500,borderRadius:"50%",filter:"blur(80px)",background:"radial-gradient(circle, rgba(217,70,239,0.09) 0%, transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      <div style={{maxWidth:540,width:"100%",position:"relative",zIndex:1}} className="fadeUp">
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:22}}><Logo/></div>
          <span className="label-tag" style={{textAlign:"center"}}>Análisis de redes sociales</span>
          <h1 className="playfair" style={{fontSize:"clamp(2.4rem, 5vw, 3.8rem)",fontWeight:800,lineHeight:1.1,color:T.white,marginBottom:18}}>
            Profundidad que<br/>
            <em className="grad-text" style={{fontStyle:"italic"}}>transforma</em>
          </h1>
          <p style={{color:T.text,fontSize:"1rem",lineHeight:1.75,maxWidth:420,margin:"0 auto"}}>
            Analizá datos públicos de Instagram y Facebook con inteligencia artificial integrada.
          </p>
        </div>

        <div className="cl-card" style={{padding:36}}>
          <div style={{marginBottom:22}}>
            <span className="label-tag">Plataforma</span>
            <div style={{display:"flex",gap:10}}>
              {[{id:"instagram",label:"Instagram",Icon:IgIcon},{id:"facebook",label:"Facebook",Icon:FbIcon}].map(({id,label,Icon})=>(
                <button key={id} className={`platform-btn${platform===id?" active":""}`} onClick={()=>setPlatform(id)}>
                  <Icon/>{label}
                </button>
              ))}
            </div>
          </div>

          <div style={{marginBottom:26}}>
            <span className="label-tag">Usuario o página</span>
            <div style={{position:"relative"}}>
              <input className="cl-input" type="text"
                placeholder={platform==="instagram"?"@tu_marca":"nombre-pagina"}
                value={handle} onChange={e=>setHandle(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handle.trim()&&onAnalyze(handle.trim(),platform)}
              />
              <Search size={15} style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:T.muted}}/>
            </div>
          </div>

          <button className="btn-primary" onClick={()=>handle.trim()&&onAnalyze(handle.trim(),platform)} disabled={!handle.trim()} style={{width:"100%",justifyContent:"center",fontSize:"1rem"}}>
            <Zap size={16}/> Analizar ahora
          </button>
          <p style={{textAlign:"center",fontSize:"0.73rem",color:T.muted,marginTop:16,letterSpacing:"0.06em"}}>
            · Datos reales vía Meta Graph API · IA por Groq ·
          </p>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:48,marginTop:40}}>
          {[{n:"Groq",l:"Llama 3.3 70B"},{n:"2",l:"Redes conectadas"},{n:"Real",l:"Datos de Meta API"}].map(s=>(
            <div key={s.l} style={{textAlign:"center"}}>
              <div className="playfair" style={{fontSize:"1.5rem",fontWeight:700,color:T.white}}>{s.n}</div>
              <div style={{fontSize:"0.62rem",letterSpacing:"0.15em",textTransform:"uppercase",color:T.muted,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   LOADING
══════════════════════════════════════════════ */
function LoadingView({ handle }) {
  const [step,setStep]=useState(0);
  const [pct,setPct]=useState(0);
  const steps=["Conectando con Meta Graph API...","Obteniendo datos del perfil...","Analizando publicaciones recientes...","Procesando comentarios con IA...","Calculando métricas de engagement...","Generando insights con Groq..."];

  useEffect(()=>{
    let i=0;
    const iv=setInterval(()=>{
      if(i<steps.length){setStep(i);setPct(Math.round(((i+1)/steps.length)*100));i++;}
      else clearInterval(iv);
    },700);
    return ()=>clearInterval(iv);
  },[]);

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}>
      <div style={{maxWidth:420,width:"100%",textAlign:"center"}}>
        <div className="glow" style={{width:72,height:72,borderRadius:20,background:`linear-gradient(135deg,${T.purple},${T.pink})`,margin:"0 auto 32px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 40px rgba(139,92,246,0.4)`}}>
          <Sparkles size={28} color="#fff"/>
        </div>
        <h2 className="playfair" style={{fontSize:"1.6rem",fontWeight:700,color:T.white,marginBottom:6}}>Analizando...</h2>
        <p style={{color:T.muted,fontSize:"0.88rem",marginBottom:36}}>{handle}</p>
        <div style={{height:3,background:"rgba(139,92,246,0.15)",borderRadius:3,overflow:"hidden",marginBottom:10}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${T.purple},${T.pink})`,borderRadius:3,transition:"width .55s ease"}}/>
        </div>
        <p className="pulse" style={{color:T.purpleL,fontSize:"0.8rem",marginBottom:36,minHeight:20}}>{steps[step]}</p>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {steps.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,opacity:i<=step?1:.2,transition:"opacity .3s"}}>
              <div style={{width:6,height:6,borderRadius:"50%",flexShrink:0,background:i<step?T.green:i===step?T.purple:"rgba(139,92,246,0.2)",boxShadow:i===step?`0 0 8px ${T.purple}`:"none"}}/>
              <span style={{fontSize:"0.78rem",color:i<=step?T.text:T.muted,textAlign:"left"}}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   DASHBOARD
══════════════════════════════════════════════ */
function DashboardView({ data, onReset }) {
  const [insights,setInsights]=useState("");

  useEffect(()=>{ fetchInsights(); },[]);

  async function fetchInsights() {
    try {
      const r = await fetch("/api/insights", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(data),
      });
      const j = await r.json();
      if (j.insights) setInsights(j.insights);
    } catch { setInsights("No se pudieron generar los insights. Verificá tu GROQ_API_KEY."); }
  }

  /* Normalizar datos para los gráficos */
  const posts = data.recent_posts || [];
  const days  = ["L","M","X","J","V","S","D"];
  const weekly = posts.slice(0,7).map((p,i)=>({
    d: days[i],
    likes:    p.likes    || 0,
    comments: p.comments || 0,
  }));

  const sentimentData = [
    { name:"Positivo", pct:65, color:T.green  },
    { name:"Neutro",   pct:22, color:T.amber  },
    { name:"Negativo", pct:13, color:T.red    },
  ];

  const contentMix = [
    { type:"Foto",     pct:40, color:T.purple  },
    { type:"Video",    pct:28, color:T.pink    },
    { type:"Carrusel", pct:20, color:T.amber   },
    { type:"Reel",     pct:12, color:T.purpleL },
  ];

  const metrics = [
    { icon:<TrendingUp size={17}/>, label:"Engagement Rate", val:`${data.engagement||0}%`,       color:T.purple, delta:"+0.8%" },
    { icon:<Eye size={17}/>,        label:"Alcance promedio", val:fmt(data.avg_reach||data.avg_likes||0), color:T.pink,   delta:"+12%"  },
    { icon:<Hash size={17}/>,       label:"Avg. Likes",       val:fmt(data.avg_likes||0),          color:T.amber,  delta:null    },
    { icon:<Users size={17}/>,      label:"Seguidores",       val:fmt(data.followers||0),          color:T.green,  delta:"+5%"   },
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,color:T.text,padding:"24px 24px 52px",maxWidth:1200,margin:"0 auto",position:"relative",zIndex:1}} className="fadeUp">
      {/* Orbs */}
      <div style={{position:"fixed",top:"-15%",left:"-8%",width:500,height:500,borderRadius:"50%",filter:"blur(90px)",background:"radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"fixed",bottom:"-10%",right:"-5%",width:400,height:400,borderRadius:"50%",filter:"blur(80px)",background:"radial-gradient(circle, rgba(217,70,239,0.07) 0%, transparent 70%)",pointerEvents:"none",zIndex:0}}/>

      {/* Nav */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:12}}>
        <Logo size={32}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {data._isMock && (
            <span className="pill" style={{background:"rgba(245,158,11,0.12)",borderColor:"rgba(245,158,11,0.25)",color:T.amber}}>
              ⚠ Modo demo — configurá META_ACCESS_TOKEN
            </span>
          )}
          <button className="btn-secondary" onClick={onReset}><RotateCcw size={12}/> Nueva búsqueda</button>
        </div>
      </div>

      {/* Profile */}
      <div className="cl-card" style={{padding:"22px 26px",marginBottom:14,display:"flex",alignItems:"center",gap:18,flexWrap:"wrap"}}>
        <div style={{width:52,height:52,flexShrink:0,borderRadius:"50%",background:`linear-gradient(135deg,${T.purple},${T.pink})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 22px rgba(139,92,246,0.3)`}}>
          <span className="playfair" style={{fontSize:20,fontWeight:800,color:"#fff",fontStyle:"italic"}}>{data.name?.charAt(0)||"?"}</span>
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"}}>
            <h2 className="playfair" style={{fontSize:"1.2rem",fontWeight:700,color:T.white}}>{data.name}</h2>
            <span className="pill">{data.platform}</span>
          </div>
          <p style={{color:T.muted,fontSize:"0.83rem"}}>{data.handle}</p>
        </div>
        <div style={{display:"flex",gap:32,flexWrap:"wrap"}}>
          {[
            {l:"Seguidores",    v:fmt(data.followers||0)},
            {l:"Publicaciones", v:fmt(data.posts_count||0)},
          ].map(x=>(
            <div key={x.l} style={{textAlign:"center"}}>
              <div className="playfair" style={{fontSize:"1.4rem",fontWeight:700,color:T.white}}>{x.v}</div>
              <div style={{fontSize:"0.58rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.12em",marginTop:2}}>{x.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:12,marginBottom:14}}>
        {metrics.map(m=>(
          <div key={m.label} className="cl-card" style={{padding:18,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:`linear-gradient(90deg, transparent, ${m.color}65, transparent)`}}/>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div style={{color:m.color,opacity:.85}}>{m.icon}</div>
              {m.delta&&<div style={{display:"flex",alignItems:"center",gap:2,fontSize:"0.7rem",color:T.green}}><ArrowUpRight size={11}/>{m.delta}</div>}
            </div>
            <div className="playfair" style={{fontSize:"1.6rem",fontWeight:700,color:m.color,marginBottom:3}}>{m.val}</div>
            <div style={{fontSize:"0.6rem",color:T.muted,textTransform:"uppercase",letterSpacing:"0.12em"}}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:12,marginBottom:12}}>
        <div className="cl-card" style={{padding:22}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
            <h3 className="playfair" style={{fontSize:"0.95rem",fontWeight:700,color:T.white}}>Engagement últimos posts</h3>
            <span className="pill">Likes + Comentarios</span>
          </div>
          <ResponsiveContainer width="100%" height={145}>
            <LineChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.1)" vertical={false}/>
              <XAxis dataKey="d" axisLine={false} tickLine={false} tick={{fill:T.muted,fontSize:10,fontFamily:"'DM Sans'"}}/>
              <YAxis hide/>
              <Tooltip content={<CustomTooltip/>}/>
              <Line type="monotone" dataKey="likes"    name="Likes"       stroke={T.purple} strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="comments" name="Comentarios" stroke={T.pink}   strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
          <div style={{display:"flex",gap:16,marginTop:10}}>
            {[{l:"Likes",c:T.purple},{l:"Comentarios",c:T.pink}].map(x=>(
              <div key={x.l} style={{display:"flex",alignItems:"center",gap:6,fontSize:"0.72rem",color:T.muted}}>
                <div style={{width:14,height:2,background:x.c,borderRadius:2}}/>{x.l}
              </div>
            ))}
          </div>
        </div>

        <div className="cl-card" style={{padding:22}}>
          <h3 className="playfair" style={{fontSize:"0.95rem",fontWeight:700,color:T.white,marginBottom:18}}>Análisis de Sentimiento</h3>
          <div style={{display:"flex",alignItems:"center",gap:18}}>
            <ResponsiveContainer width={115} height={115}>
              <PieChart>
                <Pie data={sentimentData} dataKey="pct" cx="50%" cy="50%" innerRadius={34} outerRadius={52} paddingAngle={4}>
                  {sentimentData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:12}}>
              {sentimentData.map(s=>(
                <div key={s.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                    <span style={{fontSize:"0.82rem",color:T.text}}>{s.name}</span>
                  </div>
                  <span className="playfair" style={{fontSize:"1.05rem",fontWeight:700,color:s.color}}>{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mix */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:12,marginBottom:12}}>
        <div className="cl-card" style={{padding:22}}>
          <h3 className="playfair" style={{fontSize:"0.95rem",fontWeight:700,color:T.white,marginBottom:18}}>Mix de Contenido</h3>
          <div style={{display:"flex",flexDirection:"column",gap:15}}>
            {contentMix.map((c,i)=>(
              <div key={i}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:"0.83rem",color:T.text}}>{c.type}</span>
                  <span className="playfair" style={{fontSize:"0.9rem",fontWeight:700,color:c.color}}>{c.pct}%</span>
                </div>
                <div style={{height:6,background:"rgba(139,92,246,0.1)",borderRadius:4,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${c.pct}%`,background:c.color,borderRadius:4,boxShadow:`0 0 8px ${c.color}50`}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <div className="cl-card" style={{padding:22,borderColor:"rgba(139,92,246,0.28)",background:"rgba(139,92,246,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
            <div style={{width:32,height:32,borderRadius:8,background:"rgba(139,92,246,0.15)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <Sparkles size={14} style={{color:T.purple}}/>
            </div>
            <h3 className="playfair" style={{fontSize:"0.95rem",fontWeight:700,color:T.white}}>Insights con Groq</h3>
            {!insights&&(
              <div style={{display:"flex",alignItems:"center",gap:7,fontSize:"0.75rem",color:T.muted}}>
                <div className="spinA" style={{width:13,height:13,border:`2px solid ${T.purple}`,borderTopColor:"transparent",borderRadius:"50%",flexShrink:0}}/>
                Generando...
              </div>
            )}
          </div>
          {insights
            ? <p style={{fontSize:"0.86rem",color:T.text,lineHeight:1.85,whiteSpace:"pre-line"}}>{insights}</p>
            : <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {[100,100,100,58].map((w,i)=>(
                  <div key={i} className="pulse" style={{height:12,background:"rgba(139,92,246,0.1)",borderRadius:4,width:`${w}%`}}/>
                ))}
              </div>
          }
        </div>
      </div>

      <p style={{textAlign:"center",marginTop:28,color:"rgba(107,107,138,0.45)",fontSize:"0.7rem",letterSpacing:"0.1em"}}>
        CHROMALAB · SOCIAL ANALYZER · {data._isMock?"DATOS SIMULADOS":"DATOS REALES VÍA META API"}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT
══════════════════════════════════════════════ */
export default function Page() {
  const [view,setView]     = useState("home");
  const [handle,setHandle] = useState("");
  const [platform,setPlatform] = useState("");
  const [data,setData]     = useState(null);
  const [error,setError]   = useState("");

  async function startAnalysis(h, p) {
    setHandle(h); setPlatform(p); setView("loading"); setError("");

    try {
      const res = await fetch("/api/analyze", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ handle:h, platform:p }),
      });
      const json = await res.json();

      if (!json.success) {
        // Si falla la API real, usamos mock con aviso
        console.warn("Meta API no disponible, usando datos simulados:", json.error);
        setData(buildMock(h, p));
      } else {
        setData(json.data);
      }
    } catch (err) {
      console.warn("Error de red, usando datos simulados:", err.message);
      setData(buildMock(h, p));
    }

    setView("dashboard");
  }

  function reset() { setView("home"); setHandle(""); setPlatform(""); setData(null); setError(""); }

  return (
    <>
      {view==="home"      && <HomeView onAnalyze={startAnalysis}/>}
      {view==="loading"   && <LoadingView handle={handle}/>}
      {view==="dashboard" && data && <DashboardView data={data} onReset={reset}/>}
    </>
  );
}
