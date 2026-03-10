import { useState, useRef, useEffect } from "react";

// ── DTM brand palette ──────────────────────────────────────────────────────
const C = {
  bg:       "#0f0f0d",
  surface:  "#1a1a16",
  card:     "#222219",
  border:   "#2e2e26",
  copper:   "#c97c3a",
  amber:    "#e8a84a",
  sand:     "#d4b896",
  sage:     "#7a9e7e",
  red:      "#c0392b",
  text:     "#e8e4d8",
  muted:    "#7a7a6a",
  dim:      "#3a3a30",
};

// ── Google Font import (inline style trick) ────────────────────────────────
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&family=Nunito:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${C.bg}; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: ${C.surface}; }
    ::-webkit-scrollbar-thumb { background: ${C.dim}; border-radius: 2px; }
    .btn-tap { transition: transform 0.1s, opacity 0.1s; }
    .btn-tap:active { transform: scale(0.96); opacity: 0.85; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
    }
    @keyframes shimmer {
      0% { background-position: -200% center; }
      100% { background-position: 200% center; }
    }
    .anim-up { animation: fadeUp 0.35s ease both; }
    .typing-dot { display:inline-block; width:7px; height:7px; border-radius:50%;
      background:${C.copper}; margin:0 2px; animation: pulse-dot 1.2s infinite; }
    .typing-dot:nth-child(2) { animation-delay:0.2s; }
    .typing-dot:nth-child(3) { animation-delay:0.4s; }
  `}</style>
);

// ── BUDGET DATA ────────────────────────────────────────────────────────────
const INITIAL_BUDGET = [
  { id:1, cat:"Infrastructure",  label:"IBC Manifold (31 totes)",  budgeted:15500, spent:0,    note:"~10,230 gal rainwater" },
  { id:2, cat:"Infrastructure",  label:"Solar / REAP (USDA)",      budgeted:28000, spent:0,    note:"REAP grant target" },
  { id:3, cat:"Infrastructure",  label:"Fence & Gate",             budgeted:4200,  spent:1100, note:"Gate sign installed" },
  { id:4, cat:"Infrastructure",  label:"Septic System",            budgeted:8500,  spent:0,    note:"Budgeted Q3 2025" },
  { id:5, cat:"Vehicle",         label:"2020 Ram 3500 (diesel)",   budgeted:42000, spent:0,    note:"CP4.2 risk flagged" },
  { id:6, cat:"Crops",           label:"Saffron (primary cash)",   budgeted:3200,  spent:800,  note:"Grade I target" },
  { id:7, cat:"Crops",           label:"Agave (7-yr rotation)",    budgeted:2800,  spent:400,  note:"Legacy asset" },
  { id:8, cat:"Crops",           label:"Garlic / Einkorn / Herbs", budgeted:1400,  spent:200,  note:"Zone 3" },
  { id:9, cat:"Crops",           label:"Chiltepin / Pomegranate",  budgeted:900,   spent:0,    note:"Border + orchard" },
  { id:10,cat:"Operations",      label:"LoRaWAN Sensor Network",   budgeted:2200,  spent:0,    note:"AI irrigation" },
  { id:11,cat:"Operations",      label:"DTM Media Equipment",      budgeted:3500,  spent:600,  note:"YouTube / content" },
  { id:12,cat:"Operations",      label:"Reserve / Bridge Fund",    budgeted:10000, spent:0,    note:"Break-glass protocol" },
];

const INITIAL_GRANTS = [
  { id:1, name:"USDA REAP",        amount:28000, status:"Pending",   deadline:"2025-10-01", division:"AgTech",     note:"Solar array" },
  { id:2, name:"NRCS EQIP",        amount:15000, status:"Pending",   deadline:"2025-09-15", division:"AgTech",     note:"Water conservation" },
  { id:3, name:"SARE Research",    amount:9500,  status:"Research",  deadline:"2026-01-15", division:"AgTech",     note:"Drought-tolerant trial" },
  { id:4, name:"USDA 2501",        amount:12000, status:"Research",  deadline:"2026-03-01", division:"Homestead",  note:"Underserved farmer" },
  { id:5, name:"VAPG",             amount:8000,  status:"Research",  deadline:"2026-02-01", division:"Homestead",  note:"Value-added product" },
  { id:6, name:"BFRDP",            amount:6000,  status:"Research",  deadline:"2026-04-01", division:"Homestead",  note:"Beginning farmer" },
  { id:7, name:"AZ Specialty Crop",amount:5000,  status:"Approved",  deadline:"2025-06-01", division:"AgTech",     note:"Saffron focus" },
];

const STATUS_COLOR = {
  Approved: C.sage,
  Pending:  C.amber,
  Research: C.muted,
  Denied:   C.red,
};

// ── DTM AI SYSTEM PROMPT ──────────────────────────────────────────────────
const DTM_SYSTEM = `You are the DTM Core AI Field Assistant for DTM Core Group LLC (Account #25019341), a solopreneur agricultural operation run by Drop (Elijah T. Scott) in Pearce, Arizona (Cochise County, ~4,600 ft elevation, ~5 acres).

OPERATION OVERVIEW:
- Three divisions: DTM AgTech (crop production, AI monitoring), DTM Homestead (brand identity, direct sales), DTM Media (documentation, content)
- 7-year retirement plan targeting 2033
- Strong emphasis on grant funding, OPM strategies, capital reserve protection
- "Set and Forget" agtech approach with AI-controlled irrigation and LoRaWAN sensor networks
- Parcel: 330×660 ft true dimensions

PRODUCTION ZONES:
1. Agave (7-year rotation) – primary legacy asset
2. Solar/Jojoba zone
3. Garlic/Einkorn/Herbs (Zone 3)
4. Saffron – PRIMARY cash crop, Grade I target
5. Chiltepin border
6. Pomegranate orchard
7. Lavender/Jojoba

WATER SYSTEM:
- 31-tote IBC manifold (~10,230 gallons), modular with individual swap capability
- 100% rainwater harvesting narrative (strategic for grants – no well drilling due to Douglas AMA irrigation restrictions)
- Swale lines designed for 330×660 ft parcel

GRANT TARGETS: USDA REAP (solar), NRCS EQIP (water), SARE (research), USDA 2501 Program, VAPG, BFRDP, Arizona specialty crop programs

VEHICLES: 2016 Mercedes Sprinter "Betty White" (logistics), 2020 Ram 3500 diesel under consideration (CP4.2 pump risk flagged)

BRAND: DTM Homestead DBA (not "Barrington Farm" – this was corrected across all grant documents). Drop the Mic brand combines off-grid homesteading with music production (Akai MPC 3) and content creation (YouTube).

CLIMATE/GROWING NOTES (Pearce, AZ ~4,600 ft):
- Semi-arid high desert, cold winters, monsoon season July-September
- Elevation allows some crops that lower Arizona can't support
- Drought tolerance is a core design principle for all crop selection
- Average annual rainfall ~14-16 inches, most from monsoons

Your role: Answer questions about farm operations, crop management, grant strategy, irrigation, budget planning, and homestead logistics. Be direct, specific, and actionable. Use your knowledge of Cochise County, USDA programs, and high-desert agriculture. When asked about finances, reference the DTM Master Budget v8 context. Always support Drop's 94%+ confidence threshold standard.`;

// ── COMPONENTS ─────────────────────────────────────────────────────────────

function TopBar({ title, sub }) {
  return (
    <div style={{
      padding: "16px 20px 12px",
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
    }}>
      <div style={{ fontFamily:"Rajdhani", fontSize:22, fontWeight:700, color:C.copper, letterSpacing:2, textTransform:"uppercase" }}>
        {title}
      </div>
      {sub && <div style={{ fontFamily:"Nunito", fontSize:12, color:C.muted, marginTop:2 }}>{sub}</div>}
    </div>
  );
}

function Tag({ color, label }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 4,
      padding: "2px 8px",
      fontSize: 11,
      fontFamily: "Share Tech Mono",
      letterSpacing: 1,
    }}>{label}</span>
  );
}

// ── TAB: BUDGET ────────────────────────────────────────────────────────────
function BudgetTab() {
  const [items, setItems] = useState(INITIAL_BUDGET);
  const [filter, setFilter] = useState("All");
  const [editing, setEditing] = useState(null);
  const [editSpent, setEditSpent] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ cat:"Operations", label:"", budgeted:"", spent:"", note:"" });

  const cats = ["All", ...new Set(INITIAL_BUDGET.map(i => i.cat))];
  const visible = filter === "All" ? items : items.filter(i => i.cat === filter);
  const totalBudgeted = items.reduce((a, i) => a + i.budgeted, 0);
  const totalSpent = items.reduce((a, i) => a + i.spent, 0);
  const pct = Math.round((totalSpent / totalBudgeted) * 100);

  function saveEdit(id) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, spent: parseFloat(editSpent) || 0 } : i));
    setEditing(null);
  }

  function addItem() {
    if (!newItem.label || !newItem.budgeted) return;
    setItems(prev => [...prev, { ...newItem, id: Date.now(), budgeted: parseFloat(newItem.budgeted), spent: parseFloat(newItem.spent)||0 }]);
    setNewItem({ cat:"Operations", label:"", budgeted:"", spent:"", note:"" });
    setShowAdd(false);
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <TopBar title="DTM Budget" sub="Master Budget v8 · DTM Core Group LLC" />

      {/* Summary bar */}
      <div style={{ padding: "14px 16px", background: C.card, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <div>
            <div style={{ fontFamily:"Share Tech Mono", fontSize:11, color:C.muted }}>TOTAL BUDGETED</div>
            <div style={{ fontFamily:"Rajdhani", fontSize:22, color:C.amber, fontWeight:700 }}>${totalBudgeted.toLocaleString()}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"Share Tech Mono", fontSize:11, color:C.muted }}>SPENT</div>
            <div style={{ fontFamily:"Rajdhani", fontSize:22, color:C.copper, fontWeight:700 }}>${totalSpent.toLocaleString()}</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"Share Tech Mono", fontSize:11, color:C.muted }}>REMAINING</div>
            <div style={{ fontFamily:"Rajdhani", fontSize:22, color:C.sage, fontWeight:700 }}>${(totalBudgeted-totalSpent).toLocaleString()}</div>
          </div>
        </div>
        <div style={{ height:6, background:C.dim, borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${C.copper},${C.amber})`, borderRadius:3, transition:"width 0.5s" }} />
        </div>
        <div style={{ fontFamily:"Share Tech Mono", fontSize:10, color:C.muted, marginTop:4, textAlign:"right" }}>{pct}% utilized</div>
      </div>

      {/* Category filter */}
      <div style={{ display:"flex", gap:8, padding:"10px 16px", overflowX:"auto", background:C.surface, borderBottom:`1px solid ${C.border}` }}>
        {cats.map(c => (
          <button key={c} className="btn-tap" onClick={() => setFilter(c)} style={{
            fontFamily:"Rajdhani", fontSize:13, fontWeight:600, letterSpacing:1,
            padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer", whiteSpace:"nowrap",
            background: filter===c ? C.copper : C.dim,
            color: filter===c ? "#fff" : C.muted,
          }}>{c}</button>
        ))}
      </div>

      {/* Line items */}
      <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
        {visible.map(item => {
          const p = Math.min(Math.round((item.spent/item.budgeted)*100), 100);
          const over = item.spent > item.budgeted;
          return (
            <div key={item.id} className="anim-up" style={{
              background:C.card, borderRadius:10, padding:"12px 14px",
              border:`1px solid ${over ? C.red+"55" : C.border}`,
            }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ flex:1, marginRight:8 }}>
                  <div style={{ fontFamily:"Nunito", fontSize:14, fontWeight:700, color:C.text }}>{item.label}</div>
                  <div style={{ fontFamily:"Share Tech Mono", fontSize:10, color:C.muted, marginTop:2 }}>{item.note}</div>
                </div>
                <Tag color={item.cat==="Crops"?C.sage:item.cat==="Vehicle"?C.amber:C.copper} label={item.cat} />
              </div>
              <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ flex:1, height:4, background:C.dim, borderRadius:2, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${p}%`, background: over?C.red:`linear-gradient(90deg,${C.copper},${C.amber})`, borderRadius:2, transition:"width 0.4s" }} />
                </div>
                <div style={{ fontFamily:"Share Tech Mono", fontSize:10, color: over?C.red:C.muted, minWidth:32, textAlign:"right" }}>{p}%</div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, alignItems:"center" }}>
                <div style={{ fontFamily:"Share Tech Mono", fontSize:12 }}>
                  <span style={{ color:C.muted }}>B: </span><span style={{ color:C.sand }}>${item.budgeted.toLocaleString()}</span>
                  <span style={{ color:C.dim }}> / </span>
                  <span style={{ color:C.muted }}>S: </span>
                  {editing===item.id ? (
                    <input
                      value={editSpent}
                      onChange={e=>setEditSpent(e.target.value)}
                      onBlur={()=>saveEdit(item.id)}
                      onKeyDown={e=>e.key==="Enter"&&saveEdit(item.id)}
                      autoFocus
                      style={{ width:70, background:C.dim, border:`1px solid ${C.copper}`, color:C.amber, fontFamily:"Share Tech Mono", fontSize:12, borderRadius:4, padding:"1px 6px", outline:"none" }}
                    />
                  ) : (
                    <span style={{ color: over?C.red:C.copper, cursor:"pointer", borderBottom:`1px dashed ${C.copper}44` }} onClick={()=>{setEditing(item.id);setEditSpent(String(item.spent));}}>
                      ${item.spent.toLocaleString()}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily:"Share Tech Mono", fontSize:11, color:over?C.red:C.sage }}>
                  {over ? `▲ $${(item.spent-item.budgeted).toLocaleString()} over` : `$${(item.budgeted-item.spent).toLocaleString()} left`}
                </span>
              </div>
            </div>
          );
        })}

        {/* Add item */}
        {showAdd ? (
          <div style={{ background:C.card, borderRadius:10, padding:14, border:`1px solid ${C.copper}55` }}>
            <div style={{ fontFamily:"Rajdhani", color:C.copper, fontSize:14, fontWeight:700, marginBottom:10, letterSpacing:1 }}>NEW LINE ITEM</div>
            {[["Label","label","text"],["Budgeted ($)","budgeted","number"],["Spent ($)","spent","number"],["Note","note","text"]].map(([pl,key,type])=>(
              <input key={key} placeholder={pl} type={type} value={newItem[key]}
                onChange={e=>setNewItem(p=>({...p,[key]:e.target.value}))}
                style={{ width:"100%", background:C.dim, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 10px", color:C.text, fontFamily:"Nunito", fontSize:13, marginBottom:8, outline:"none" }}
              />
            ))}
            <select value={newItem.cat} onChange={e=>setNewItem(p=>({...p,cat:e.target.value}))}
              style={{ width:"100%", background:C.dim, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 10px", color:C.text, fontFamily:"Nunito", fontSize:13, marginBottom:10, outline:"none" }}>
              {["Infrastructure","Vehicle","Crops","Operations"].map(c=><option key={c}>{c}</option>)}
            </select>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-tap" onClick={addItem} style={{ flex:1, background:C.copper, color:"#fff", border:"none", borderRadius:8, padding:10, fontFamily:"Rajdhani", fontWeight:700, fontSize:14, cursor:"pointer" }}>ADD ITEM</button>
              <button className="btn-tap" onClick={()=>setShowAdd(false)} style={{ flex:1, background:C.dim, color:C.muted, border:"none", borderRadius:8, padding:10, fontFamily:"Rajdhani", fontWeight:700, fontSize:14, cursor:"pointer" }}>CANCEL</button>
            </div>
          </div>
        ) : (
          <button className="btn-tap" onClick={()=>setShowAdd(true)} style={{
            background:"transparent", border:`1px dashed ${C.copper}55`, borderRadius:10, padding:14,
            color:C.copper, fontFamily:"Rajdhani", fontWeight:700, fontSize:14, letterSpacing:1,
            cursor:"pointer", width:"100%",
          }}>+ ADD LINE ITEM</button>
        )}
      </div>
    </div>
  );
}

// ── TAB: GRANTS ────────────────────────────────────────────────────────────
function GrantsTab() {
  const [grants, setGrants] = useState(INITIAL_GRANTS);
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [ng, setNg] = useState({ name:"", amount:"", status:"Research", deadline:"", division:"AgTech", note:"" });

  const statuses = ["All","Approved","Pending","Research","Denied"];
  const visible = filter==="All" ? grants : grants.filter(g=>g.status===filter);
  const totalPipeline = grants.reduce((a,g)=>a+g.amount,0);
  const approved = grants.filter(g=>g.status==="Approved").reduce((a,g)=>a+g.amount,0);

  function cycleStatus(id) {
    const order = ["Research","Pending","Approved","Denied"];
    setGrants(prev=>prev.map(g=>g.id===id?{...g,status:order[(order.indexOf(g.status)+1)%order.length]}:g));
  }

  function addGrant() {
    if(!ng.name||!ng.amount) return;
    setGrants(p=>[...p,{...ng,id:Date.now(),amount:parseFloat(ng.amount)||0}]);
    setNg({name:"",amount:"",status:"Research",deadline:"",division:"AgTech",note:""});
    setShowAdd(false);
  }

  return (
    <div style={{ paddingBottom:80 }}>
      <TopBar title="Grant Pipeline" sub="USDA · NRCS · SARE · AZ Programs" />

      {/* Summary */}
      <div style={{ display:"flex", gap:0, background:C.card, borderBottom:`1px solid ${C.border}` }}>
        {[["PIPELINE",`$${totalPipeline.toLocaleString()}`,C.amber],["APPROVED",`$${approved.toLocaleString()}`,C.sage],["GRANTS",grants.length,C.copper]].map(([l,v,c])=>(
          <div key={l} style={{ flex:1, padding:"14px 0", textAlign:"center", borderRight:`1px solid ${C.border}` }}>
            <div style={{ fontFamily:"Share Tech Mono", fontSize:10, color:C.muted }}>{l}</div>
            <div style={{ fontFamily:"Rajdhani", fontSize:20, fontWeight:700, color:c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, padding:"10px 16px", overflowX:"auto", background:C.surface, borderBottom:`1px solid ${C.border}` }}>
        {statuses.map(s=>(
          <button key={s} className="btn-tap" onClick={()=>setFilter(s)} style={{
            fontFamily:"Rajdhani", fontSize:13, fontWeight:600, letterSpacing:1,
            padding:"5px 14px", borderRadius:20, border:"none", cursor:"pointer", whiteSpace:"nowrap",
            background: filter===s ? (STATUS_COLOR[s]||C.copper) : C.dim,
            color: filter===s ? "#fff" : C.muted,
          }}>{s}</button>
        ))}
      </div>

      {/* Grant cards */}
      <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:8 }}>
        {visible.map(g=>(
          <div key={g.id} className="anim-up" style={{ background:C.card, borderRadius:10, padding:14, border:`1px solid ${C.border}`, borderLeft:`3px solid ${STATUS_COLOR[g.status]||C.muted}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontFamily:"Nunito", fontSize:15, fontWeight:700, color:C.text }}>{g.name}</div>
                <div style={{ fontFamily:"Share Tech Mono", fontSize:10, color:C.muted, marginTop:2 }}>{g.division} · {g.note}</div>
              </div>
              <div style={{ fontFamily:"Rajdhani", fontSize:20, fontWeight:700, color:C.amber }}>${g.amount.toLocaleString()}</div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10 }}>
              <div style={{ fontFamily:"Share Tech Mono", fontSize:10, color:C.muted }}>
                DUE: <span style={{ color:C.sand }}>{g.deadline||"TBD"}</span>
              </div>
              <button className="btn-tap" onClick={()=>cycleStatus(g.id)} style={{
                background: (STATUS_COLOR[g.status]||C.muted)+"22",
                color: STATUS_COLOR[g.status]||C.muted,
                border: `1px solid ${(STATUS_COLOR[g.status]||C.muted)}44`,
                borderRadius:6, padding:"3px 10px", cursor:"pointer",
                fontFamily:"Rajdhani", fontSize:12, fontWeight:700, letterSpacing:1,
              }}>{g.status} ↻</button>
            </div>
          </div>
        ))}

        {showAdd ? (
          <div style={{ background:C.card, borderRadius:10, padding:14, border:`1px solid ${C.sage}55` }}>
            <div style={{ fontFamily:"Rajdhani", color:C.sage, fontSize:14, fontWeight:700, marginBottom:10, letterSpacing:1 }}>NEW GRANT</div>
            {[["Grant Name","name","text"],["Amount ($)","amount","number"],["Deadline","deadline","date"],["Note","note","text"]].map(([pl,key,type])=>(
              <input key={key} placeholder={pl} type={type} value={ng[key]}
                onChange={e=>setNg(p=>({...p,[key]:e.target.value}))}
                style={{ width:"100%", background:C.dim, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 10px", color:C.text, fontFamily:"Nunito", fontSize:13, marginBottom:8, outline:"none" }}
              />
            ))}
            {[["Status","status",["Research","Pending","Approved","Denied"]],["Division","division",["AgTech","Homestead","Media"]]].map(([pl,key,opts])=>(
              <select key={key} value={ng[key]} onChange={e=>setNg(p=>({...p,[key]:e.target.value}))}
                style={{ width:"100%", background:C.dim, border:`1px solid ${C.border}`, borderRadius:6, padding:"8px 10px", color:C.text, fontFamily:"Nunito", fontSize:13, marginBottom:8, outline:"none" }}>
                {opts.map(o=><option key={o}>{o}</option>)}
              </select>
            ))}
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn-tap" onClick={addGrant} style={{ flex:1, background:C.sage, color:"#fff", border:"none", borderRadius:8, padding:10, fontFamily:"Rajdhani", fontWeight:700, fontSize:14, cursor:"pointer" }}>ADD GRANT</button>
              <button className="btn-tap" onClick={()=>setShowAdd(false)} style={{ flex:1, background:C.dim, color:C.muted, border:"none", borderRadius:8, padding:10, fontFamily:"Rajdhani", fontWeight:700, fontSize:14, cursor:"pointer" }}>CANCEL</button>
            </div>
          </div>
        ) : (
          <button className="btn-tap" onClick={()=>setShowAdd(true)} style={{
            background:"transparent", border:`1px dashed ${C.sage}55`, borderRadius:10, padding:14,
            color:C.sage, fontFamily:"Rajdhani", fontWeight:700, fontSize:14, letterSpacing:1,
            cursor:"pointer", width:"100%",
          }}>+ ADD GRANT</button>
        )}
      </div>
    </div>
  );
}

// ── TAB: AI FIELD ASSISTANT ────────────────────────────────────────────────
const QUICK_PROMPTS = [
  "Saffron planting timeline for Pearce AZ?",
  "Best EQIP water conservation strategies for DTM?",
  "Agave harvest schedule for Zone 1?",
  "How to protect my CP4.2 pump risk?",
  "Monsoon water capture tips for IBC manifold?",
  "What grants should I apply for next quarter?",
];

function FieldAITab() {
  const [messages, setMessages] = useState([
    { role:"assistant", content:"DTM Field AI online. I have full context on your Pearce operation — zones, crops, water system, budget v8, and grant pipeline. What do you need?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");
    const newMsgs = [...messages, { role:"user", content:userMsg }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      const apiMessages = newMsgs.map(m => ({ role:m.role, content:m.content }));
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: DTM_SYSTEM,
          messages: apiMessages,
        })
      });
      const data = await response.json();
      const reply = data.content?.find(b=>b.type==="text")?.text || "No response received.";
      setMessages(p=>[...p,{ role:"assistant", content:reply }]);
    } catch(e) {
      setMessages(p=>[...p,{ role:"assistant", content:`Connection error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 56px)" }}>
      <TopBar title="Field AI" sub="DTM Core Intelligence · Pearce, AZ" />

      {/* Quick prompts */}
      <div style={{ display:"flex", gap:8, padding:"10px 12px", overflowX:"auto", background:C.surface, borderBottom:`1px solid ${C.border}`, flexShrink:0 }}>
        {QUICK_PROMPTS.map(q=>(
          <button key={q} className="btn-tap" onClick={()=>send(q)} style={{
            fontFamily:"Nunito", fontSize:12, fontWeight:600,
            background:C.dim, color:C.sand, border:`1px solid ${C.border}`,
            borderRadius:20, padding:"5px 12px", cursor:"pointer", whiteSpace:"nowrap",
          }}>{q}</button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"12px", display:"flex", flexDirection:"column", gap:10 }}>
        {messages.map((m, i) => (
          <div key={i} className="anim-up" style={{
            display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start",
          }}>
            {m.role==="assistant" && (
              <div style={{
                width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C.copper},${C.amber})`,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"Rajdhani", fontWeight:700, fontSize:11, color:"#fff",
                flexShrink:0, marginRight:8, marginTop:2,
              }}>AI</div>
            )}
            <div style={{
              maxWidth:"80%", borderRadius: m.role==="user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
              padding:"10px 14px",
              background: m.role==="user" ? `linear-gradient(135deg,${C.copper},${C.amber})` : C.card,
              color: m.role==="user" ? "#fff" : C.text,
              border: m.role==="user" ? "none" : `1px solid ${C.border}`,
              fontFamily:"Nunito", fontSize:14, lineHeight:1.55,
              whiteSpace:"pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${C.copper},${C.amber})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Rajdhani", fontWeight:700, fontSize:11, color:"#fff", flexShrink:0 }}>AI</div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"4px 18px 18px 18px", padding:"12px 16px" }}>
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ padding:"10px 12px", background:C.surface, borderTop:`1px solid ${C.border}`, display:"flex", gap:8, flexShrink:0, paddingBottom:"max(10px, env(safe-area-inset-bottom))" }}>
        <input
          value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Ask about crops, grants, water, budget..."
          style={{
            flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:24,
            padding:"10px 16px", color:C.text, fontFamily:"Nunito", fontSize:14, outline:"none",
          }}
        />
        <button className="btn-tap" onClick={()=>send()} style={{
          width:44, height:44, borderRadius:"50%", border:"none", cursor:"pointer",
          background: input.trim() ? `linear-gradient(135deg,${C.copper},${C.amber})` : C.dim,
          display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={input.trim()?"#fff":C.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── BOTTOM NAV ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id:"budget",  label:"Budget", icon:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  )},
  { id:"grants", label:"Grants", icon:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
    </svg>
  )},
  { id:"ai",     label:"Field AI", icon:(
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  )},
];

// ── ROOT APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("budget");

  return (
    <div style={{ background:C.bg, minHeight:"100vh", maxWidth:480, margin:"0 auto", position:"relative", fontFamily:"Nunito" }}>
      <FontStyle />

      {/* Header brand strip */}
      <div style={{
        background:`linear-gradient(90deg,${C.bg},${C.surface})`,
        borderBottom:`2px solid ${C.copper}33`,
        padding:"10px 16px 8px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            width:36, height:36, borderRadius:8,
            background:`linear-gradient(135deg,${C.copper},${C.amber})`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"Rajdhani", fontWeight:700, fontSize:13, color:"#fff", letterSpacing:0.5,
          }}>DTM</div>
          <div>
            <div style={{ fontFamily:"Rajdhani", fontSize:16, fontWeight:700, color:C.text, letterSpacing:2 }}>CORE</div>
            <div style={{ fontFamily:"Share Tech Mono", fontSize:9, color:C.muted, letterSpacing:1 }}>DTM CORE GROUP LLC</div>
          </div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontFamily:"Share Tech Mono", fontSize:9, color:C.muted }}>PEARCE · AZ · 4,600ft</div>
          <div style={{ display:"flex", alignItems:"center", gap:4, justifyContent:"flex-end", marginTop:2 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.sage, animation:"pulse-dot 2s infinite" }} />
            <span style={{ fontFamily:"Share Tech Mono", fontSize:9, color:C.sage }}>ONLINE</span>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ paddingBottom:60 }}>
        {tab === "budget" && <BudgetTab />}
        {tab === "grants" && <GrantsTab />}
        {tab === "ai"     && <FieldAITab />}
      </div>

      {/* Bottom nav */}
      <div style={{
        position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)",
        width:"100%", maxWidth:480,
        background:C.surface, borderTop:`1px solid ${C.border}`,
        display:"flex", paddingBottom:"env(safe-area-inset-bottom)",
        zIndex:100,
      }}>
        {NAV_ITEMS.map(n=>(
          <button key={n.id} className="btn-tap" onClick={()=>setTab(n.id)} style={{
            flex:1, border:"none", background:"transparent", cursor:"pointer", padding:"10px 0 8px",
            display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            color: tab===n.id ? C.copper : C.muted,
            position:"relative",
          }}>
            {tab===n.id && <div style={{ position:"absolute", top:0, left:"25%", right:"25%", height:2, background:C.copper, borderRadius:"0 0 2px 2px" }} />}
            {n.icon}
            <span style={{ fontFamily:"Rajdhani", fontSize:11, fontWeight:600, letterSpacing:1 }}>{n.label.toUpperCase()}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
