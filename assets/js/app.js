const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}};
let A=LS("mo-ans",{}), D=new Set(LS("mo-done",[]));
const persist=()=>{localStorage.setItem("mo-ans",JSON.stringify(A));localStorage.setItem("mo-done",JSON.stringify([...D]));};
const ans=id=>(A[id]=A[id]||{});
const S3=["","been","want","nope"], S3L={been:"Been",want:"Want to go",nope:"Not for me"};
const list=a=>a.length<2?(a[0]||""):a.slice(0,-1).join(", ")+" and "+a[a.length-1];
function lean(f,v){ if(v==null) return "";
  if(f.words) return f.words[Math.round(v/25)];
  return v<20?`very much “${f.l.toLowerCase()}”`:v<40?`leaning “${f.l.toLowerCase()}”`:v<=60?"somewhere in between":v<=80?`leaning “${f.r.toLowerCase()}”`:`very much “${f.r.toLowerCase()}”`;}
function triWords(w,labels){ if(!w) return ""; const o=w.map((x,i)=>[x,labels[i]]).sort((a,b)=>b[0]-a[0]);
  if(o[0][0]>.65) return `mostly ${o[0][1].toLowerCase()}`; if(o[2][0]>.25) return "a fairly even mix of everyone";
  return `a mix of ${o[0][1].toLowerCase()} and ${o[1][1].toLowerCase()}`;}
const field=(m,id)=>{for(const s of m.screens)for(const f of s.f)if(f.id===id)return f};
const optL=(m,id,v)=>{const f=field(m,id);const o=(f.opts||[]).find(o=>o.v===v);return o?o.l:v};
const MM=id=>M.find(m=>m.id===id);

/* ---------- cards & board ---------- */
function cards(){
  $("#cards").innerHTML=M.map(m=>`<article class="card${D.has(m.id)?" is-shared":""}" tabindex="0" role="button" data-id="${m.id}" aria-label="Open ${esc(m.name)}">
    <div class="c-img"><img src="${IMG(m.id)}" alt="" loading="lazy"><span class="c-time">${m.time}</span>${m.note&&m.id==="your-visit"?`<span class="c-flag">${m.note}</span>`:""}</div>
    <div class="c-body"><h3>${m.name}</h3><p class="c-invite">${m.invite}</p><p class="c-desc">${m.desc}</p>
    <div class="c-foot"><span class="c-open">${D.has(m.id)?"See what you get →":"Open moment →"}</span><button class="c-edit" data-edit="${m.id}" aria-label="Edit ${esc(m.name)}">✎ Edit</button></div></div></article>`).join("");
}
function board(){
  $("#board").innerHTML=M.map(m=>D.has(m.id)
    ?`<button class="tile filled" data-id="${m.id}" aria-label="${esc(m.name)}, shared"><img src="${IMG(m.id)}" alt=""><span class="cap">${m.name}</span></button>`
    :`<button class="tile empty" data-id="${m.id}" aria-label="${esc(m.name)}, not yet shared"><span>${m.name}</span></button>`).join("");
}

/* ---------- field renderers ---------- */
function rf(m,f){
  const a=ans(m.id), v=a[f.id];
  if(f.showIf&&!f.showIf(a)) return "";
  const lab=f.label?`<p class="f-label" id="lb-${f.id}">${f.label}</p>`:"";
  switch(f.t){
  case "cards": { const sel=v||[];
    return `${lab}<div class="g-cards${f.season?" season":""}" role="group" aria-label="${esc(f.label||"Options")}">${f.opts.map(o=>`<button class="tapcard${sel.includes(o.v)?" on":""}" data-f="${f.id}" data-v="${esc(o.v)}" aria-pressed="${sel.includes(o.v)}"><span class="ico" aria-hidden="true">${o.i}</span><span>${o.l}</span></button>`).join("")}</div>${f.max>1?`<p class="limit" data-limit="${f.id}" aria-live="polite"></p>`:""}`;}
  case "images": { const sel=v||[];
    return `${lab}<div class="g-imgs" role="group">${f.opts.map(o=>`<button class="imgpick${sel.includes(o.v)?" on":""}" data-f="${f.id}" data-v="${o.v}" aria-pressed="${sel.includes(o.v)}"><img src="${IMG(o.img)}" alt=""><span>${o.l}</span></button>`).join("")}</div>`;}
  case "chips": { let opts=f.opts; if(f.dyn) opts=placeOpts(); const sel=f.one?(v?[v]:[]):(v||[]);
    return `${lab}<div class="g-chips" role="group" aria-label="${esc(f.label||"Options")}">${opts.map(o=>`<button class="chip${sel.includes(o)?" on":""}" data-f="${f.id}" data-v="${esc(o)}" aria-pressed="${sel.includes(o)}">${esc(o)}</button>`).join("")}</div>${f.max?`<p class="limit" data-limit="${f.id}" aria-live="polite"></p>`:""}`;}
  case "chips3": { const st=v||{};
    return `<div class="legend"><span class="chip s-been">Been</span><span class="chip s-want">Want to go</span><span class="chip s-nope">Not for me</span></div><div class="g-chips" role="group" aria-label="Parks">${f.items.map(it=>{const s=st[it]||"";return `<button class="chip c3 s-${s||"none"}" data-f="${f.id}" data-v="${esc(it)}" aria-label="${esc(it)}: ${s?S3L[s]:"not chosen"}"><span>${esc(it)}</span>${s?`<small>${S3L[s]}</small>`:""}</button>`}).join("")}</div>`;}
  case "slider": { const val=v??50;
    return `<div class="slider${f.explain?" compact":""}">${f.label?`<label class="f-label" for="sl-${f.id}">${f.label}</label>`:""}
      <input type="range" id="sl-${f.id}" min="0" max="100" step="${f.words?25:1}" value="${val}" data-f="${f.id}" aria-label="${esc(f.label||(f.l+" to "+f.r))}" aria-valuetext="${esc(lean(f,val))}">
      <div class="ends"><span>${f.l}</span><span>${f.r}</span></div>
      <p class="lean" aria-hidden="true">${v==null?"Slide to show us":cap(lean(f,v))}</p>
      ${f.explain?`<p class="explain${v>55?" on":""}">✉ We’ll send you a short explainer.</p>`:""}</div>`;}
  case "stepper": { const val=v??f.def;
    return `<div class="stepper"><span class="f-label" id="lb-${f.id}">${f.label}</span><div class="st-ctl"><button data-step="${f.id}" data-d="-1" aria-label="Fewer">−</button><output aria-live="polite" aria-labelledby="lb-${f.id}">${val}</output><button data-step="${f.id}" data-d="1" aria-label="More">+</button></div></div>`;}
  case "seg": return `<div class="seg" role="radiogroup">${f.opts.map(o=>`<button role="radio" aria-checked="${v===o}" class="${v===o?"on":""}" data-f="${f.id}" data-v="${o}">${o}</button>`).join("")}</div>`;
  case "toggle": return `<label class="toggle"><input type="checkbox" data-f="${f.id}" ${v?"checked":""}><span class="sw" aria-hidden="true"></span>${f.label}</label>`;
  case "text": return `<div class="textf${f.mic?" voice":""}"><label class="f-label" for="tx-${f.id}">${f.label}</label><div class="tx-wrap">${f.mic?`<span class="mic" aria-hidden="true">🎙</span>`:""}<textarea id="tx-${f.id}" data-f="${f.id}" rows="${f.mic?4:2}" placeholder="${esc(f.ph)}">${esc(v||"")}</textarea></div>${f.mic?`<p class="hint">A voice note in the live portal — type it for this demo.</p>`:""}</div>`;
  case "pairs": { const sel=v||[];
    return f.pairs.map((pr,i)=>`<div class="pair" role="radiogroup" aria-label="Pair ${["one","two","three"][i]}">${pr.map((o,j)=>`${j?'<span class="or">or</span>':""}<button role="radio" aria-checked="${sel[i]===o.v}" class="imgpick${sel[i]===o.v?" on":""}" data-pair="${i}" data-f="${f.id}" data-v="${o.v}"><img src="${IMG(o.img)}" alt=""><span>${o.l}</span></button>`).join("")}</div>`).join("");}
  case "tri": { const w=v||[1/3,1/3,1/3]; const P=triXY(w);
    return `<div class="tri"><svg viewBox="0 0 320 290" id="tri" role="slider" tabindex="0" aria-label="How your time is shared" aria-valuetext="${esc(triWords(v,f.labels)||"An even mix")}" data-f="${f.id}">
      <polygon points="${TV.map(p=>p.join(",")).join(" ")}" class="tri-shape"/><circle cx="${P[0]}" cy="${P[1]}" r="13" class="tri-dot"/></svg>
      <div class="tri-l t">${f.labels[0]}</div><div class="tri-b"><span>${f.labels[1]}</span><span>${f.labels[2]}</span></div>
      <p class="lean">${v?cap(triWords(v,f.labels)):"Drag the point to show us"}</p></div>`;}
  case "invite": return `<button class="btn ghost invite" data-invite>＋ Invite a partner</button><p class="hint">Demo only — nothing is sent.</p>`;
  }
}
const cap=s=>s?s[0].toUpperCase()+s.slice(1):s;
const TV=[[160,30],[20,272],[300,272]];
const triXY=w=>[0,1].map(k=>w[0]*TV[0][k]+w[1]*TV[1][k]+w[2]*TV[2][k]);
function triW(x,y){const[[x1,y1],[x2,y2],[x3,y3]]=TV;const d=(y2-y3)*(x1-x3)+(x3-x2)*(y1-y3);
  let a=((y2-y3)*(x-x3)+(x3-x2)*(y-y3))/d,b=((y3-y1)*(x-x3)+(x1-x3)*(y-y3))/d,c=1-a-b;
  let w=[a,b,c].map(t=>Math.max(0,t));const s=w.reduce((p,q)=>p+q,0)||1;return w.map(t=>t/s);}
function placeOpts(){const d=A["orlando-days"]||{};const out=[];
  Object.entries(d.parks||{}).forEach(([k,s])=>{if(s==="want"||s==="been")out.push(k)});
  (d.beyond||[]).forEach(b=>out.push(optL(MM("orlando-days"),"beyond",b)));
  return out.length>=3?out:["Magic Kingdom","EPCOT","Disney Springs","Lake Eola","Winter Park","ICON Park","A round of golf","Kennedy Space Center"];}

/* ---------- flow ---------- */
let cur=null, step=-1;
function open(id,mode){cur=MM(id);step=mode==="edit"?0:mode==="reward"?cur.screens.length:-1;
  if(mode!=="edit"&&D.has(id)&&mode!=="intro")step=cur.screens.length;
  $("#modal").hidden=false;document.body.classList.add("lock");render(true);}
function close(){$("#modal").hidden=true;document.body.classList.remove("lock");cards();board();summary();}
function dots(){return `<div class="dots" aria-hidden="true">${cur.screens.map((_,i)=>`<i class="${i<step?"past":i===step?"now":""}"></i>`).join("")}</div>`;}
function render(focus){
  const m=cur, n=m.screens.length, body=$("#m-body");
  $("#m-img").src=IMG(m.id);
  if(step<0){ body.innerHTML=`<p class="eyebrow">${m.time}</p><h3 tabindex="-1" id="m-title">${m.name}</h3><p class="m-invite">${m.invite}</p>
    <h4>What it’s about</h4><p>${m.focus}</p><h4>What you get</h4><p>${m.reward}</p>${m.note?`<p class="m-note">${m.note}${m.id==="your-visit"?" Open in this demo so you can try it.":""}</p>`:""}
    <p class="reassure-s">No right answers. Skip anything you like.</p>
    <div class="m-actions"><button class="btn primary" data-go="next">Let’s begin</button><button class="btn link" data-close>Maybe later</button></div>`;}
  else if(step<n){ const s=m.screens[step];
    body.innerHTML=`<p class="eyebrow">${m.name}</p>${dots()}<h3 tabindex="-1" id="m-title" class="q">${s.p}</h3>${s.h?`<p class="hint">${s.h}</p>`:""}
    <div class="fields">${s.f.map(f=>`<div class="fld" data-wrap="${f.id}">${rf(m,f)}</div>`).join("")}</div>
    <div class="m-actions nav"><button class="btn link" data-go="back">← Back</button><span class="sp"></span><button class="btn link" data-go="skip">Skip</button><button class="btn primary" data-go="next">${step===n-1?"Finish":"Next →"}</button></div>`;}
  else { body.innerHTML=`<p class="eyebrow">Added to your board</p><h3 tabindex="-1" id="m-title">${m.name}</h3><p class="m-invite">Thank you — here’s what you get.</p>${reward(m.id)}
    <div class="m-actions"><button class="btn ghost" data-go="edit">✎ Edit my answers</button><button class="btn primary" data-close>Back to my Orlando</button></div>`;}
  $("#m-body").scrollTop=0;$(".modal-card").scrollTop=0;
  if(focus) setTimeout(()=>{($("#m-body h3"))?.focus?.()},30);
}
function refreshScreen(){const s=cur.screens[step];if(!s)return;s.f.forEach(f=>{const w=document.querySelector(`[data-wrap="${f.id}"]`);if(!w)return;if(f.t!=="text"&&f.t!=="slider")w.innerHTML=rf(cur,f);else if(f.showIf&&(w.innerHTML.trim()==="")===f.showIf(ans(cur.id)))w.innerHTML=rf(cur,f);});}
function go(dir){const n=cur.screens.length;
  if(dir==="edit"){step=0;}
  else if(dir==="back"){step=Math.max(-1,step-1);}
  else {step++; if(step>=n){D.add(cur.id);persist();cards();board();summary();}}
  render(true);}

/* ---------- events ---------- */
document.addEventListener("click",e=>{
  const t=e.target;
  const ed=t.closest("[data-edit]"); if(ed){e.stopPropagation();open(ed.dataset.edit,"edit");return;}
  const c=t.closest(".card,.tile"); if(c){open(c.dataset.id,D.has(c.dataset.id)?"reward":"intro");return;}
  if(t.closest("[data-close]")){close();return;}
  const g=t.closest("[data-go]"); if(g){go(g.dataset.go);return;}
  if(t.closest("[data-invite]")){toast("In the live portal this would send your partner a private link. Nothing is sent in this demo.");return;}
  if(t.closest("[data-share]")){toast("In the live portal this would share your card with a partner. Nothing is sent in this demo.");return;}
  if(t.closest("#reset")){e.preventDefault();if(confirm("Reset the demo and clear all answers on this device?")){A={};D=new Set();localStorage.removeItem("mo-sum");persist();cards();board();summary();toast("Demo reset.");}return;}
  if(t.closest("#sum-print")){window.print();return;}
  if(t.closest("#sum-refresh")){localStorage.removeItem("mo-sum");summary();return;}
  const st=t.closest("[data-step]"); if(st){const f=field(cur,st.dataset.step),a=ans(cur.id);a[f.id]=Math.min(f.max,Math.max(f.min,(a[f.id]??f.def)+(+st.dataset.d)*(f.step||1)));persist();refreshScreen();document.querySelector(`[data-step="${f.id}"][data-d="${st.dataset.d}"]`)?.focus();return;}
  const b=t.closest("button[data-f]"); if(!b)return;
  const f=field(cur,b.dataset.f),a=ans(cur.id),v=b.dataset.v; let msg="";
  if(f.t==="chips3"){const o=a[f.id]||{};o[v]=S3[(S3.indexOf(o[v]||"")+1)%4];a[f.id]=o;}
  else if(f.t==="seg"||(f.t==="chips"&&f.one)){a[f.id]=a[f.id]===v?undefined:v;}
  else if(f.t==="pairs"){const p=a[f.id]||[];p[+b.dataset.pair]=v;a[f.id]=p;}
  else { let s=a[f.id]||[]; if(s.includes(v)) s=s.filter(x=>x!==v);
    else if(f.max===1) s=[v];
    else if(f.max&&s.length>=f.max) msg=`You’ve picked ${["","one","two","three"][f.max]} — tap one to swap it out.`;
    else s=[...s,v]; a[f.id]=s;}
  persist(); const sel=`button[data-f="${f.id}"][data-v="${CSS.escape(v)}"]${b.dataset.pair?`[data-pair="${b.dataset.pair}"]`:""}`;
  refreshScreen(); document.querySelector(sel)?.focus();
  const lm=document.querySelector(`[data-limit="${f.id}"]`); if(lm) lm.textContent=msg;
});
document.addEventListener("input",e=>{const t=e.target;if(!t.dataset.f||!cur)return;const f=field(cur,t.dataset.f),a=ans(cur.id);
  if(t.type==="range"){a[f.id]=+t.value;t.setAttribute("aria-valuetext",lean(f,+t.value));const w=t.closest(".slider");w.querySelector(".lean").textContent=cap(lean(f,+t.value));const x=w.querySelector(".explain");if(x)x.classList.toggle("on",+t.value>55);}
  else if(t.type==="checkbox") a[f.id]=t.checked; else a[f.id]=t.value;
  persist();});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!$("#modal").hidden)close();
  if((e.key==="Enter"||e.key===" ")&&e.target.classList?.contains("card")){e.preventDefault();open(e.target.dataset.id,D.has(e.target.dataset.id)?"reward":"intro");}
  if(e.target.id==="tri"&&e.key.startsWith("Arrow")){e.preventDefault();const f=field(cur,"time"),a=ans(cur.id);let[x,y]=triXY(a.time||[1/3,1/3,1/3]);
    const d=12;if(e.key==="ArrowUp")y-=d;if(e.key==="ArrowDown")y+=d;if(e.key==="ArrowLeft")x-=d;if(e.key==="ArrowRight")x+=d;setTri(triW(x,y));}
});
function setTri(w){const f=field(cur,"time");ans(cur.id).time=w;persist();const s=$("#tri"),[x,y]=triXY(w);s.querySelector("circle").setAttribute("cx",x);s.querySelector("circle").setAttribute("cy",y);
  s.setAttribute("aria-valuetext",triWords(w,f.labels));s.parentNode.querySelector(".lean").textContent=cap(triWords(w,f.labels));}
let drag=false;
document.addEventListener("pointerdown",e=>{const s=e.target.closest("#tri");if(!s)return;drag=true;s.setPointerCapture(e.pointerId);mv(e);});
document.addEventListener("pointermove",e=>{if(drag)mv(e)});document.addEventListener("pointerup",()=>drag=false);
function mv(e){const s=$("#tri");if(!s)return;const r=s.getBoundingClientRect();setTri(triW((e.clientX-r.left)*320/r.width,(e.clientY-r.top)*290/r.height));}
function toast(t){const el=$("#toast");el.textContent=t;el.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>el.classList.remove("on"),3600);}

/* ---------- rewards (templated) ---------- */
const MORN={balcony:"coffee on the balcony",pool:"an early swim",tee:"an early tee time",rope:"rope-drop at the parks",spa:"a slow spa morning",laptop:"a little work on the terrace"};
const PULL={people:"time with the people you love",winter:"a break from winter",money:"a smart place for your money",retire:"settling in for retirement",parks:"being close to the parks",explore:"the joy of exploring"};
function storyWhy(){const a=A["why-orlando"]||{};const p=(a.pull||[]).map(x=>PULL[x]);const mo=MORN[(a.morning||[])[0]];const n=a.party??(a.morning||a.pull?2:0);
  return `${p.length?`What’s drawing you to Orlando is ${list(p)}.`:"You’re still discovering what draws you to Orlando — and that’s a lovely place to start."} ${mo?`Your first morning starts with ${mo}`:"We picture an unhurried first morning"}${n?`, ${n===1?"just for you":`with ${n} of you together`}`:""}. We’ll keep that picture in mind as your Orlando takes shape.`;}
function dayPlan(){const a=A["orlando-days"]||{};const m=MM("orlando-days");
  const want=Object.entries(a.parks||{}).filter(([,s])=>s==="want").map(([k])=>k), been=Object.entries(a.parks||{}).filter(([,s])=>s==="been").map(([k])=>k);
  const park=want[0]||been[0]||"a park of your choosing"; const pace=a.pace??50; const bey=(a.beyond||[]).map(b=>optL(m,"beyond",b));
  const din=a.dinner??50, cu=(a.cuisine||[])[0];
  return {pins:[...want,...been.filter(x=>!want.includes(x)),...bey],plan:[
   ["Morning",pace<50?`Rope-drop at ${park} — straight to the headliners while it’s quiet.`:`A relaxed start, then ${park} for the highlights you care about most.`],
   ["Afternoon",pace<50?`Stay for the rides you love, with a long shaded lunch break.`:`Back for the pool${bey[0]?`, or some ${bey[0].toLowerCase()}`:""}.`],
   ["Evening",`${din<50?"Somewhere casual and lively":"Somewhere intimate and refined"}${cu?` — ${cu} on the menu`:""}${pace<50?", then fireworks to close the day.":"."}`]]};}
function reward(id){const a=A[id]||{}, m=MM(id);
  if(id==="why-orlando") return `<div class="reward"><p class="eyebrow">Your Orlando, so far</p><textarea class="rw-edit" data-rw="why" aria-label="Your Orlando, so far — edit freely">${esc(a._card||storyWhy())}</textarea><div class="rw-act"><span class="hint">Edit it however you like.</span><button class="btn ghost sm" data-share>Share with a partner</button></div></div>`;
  if(id==="orlando-days"){const d=dayPlan();return `<div class="reward"><p class="eyebrow">Your starter pins</p><div class="pins">${d.pins.length?d.pins.map(p=>`<span class="pin">📍 ${esc(p)}</span>`).join(""):'<span class="hint">Tap a few parks to start your pins.</span>'}</div><p class="eyebrow" style="margin-top:16px">Your one-click day plan</p><ol class="plan">${d.plan.map(([t,x])=>`<li><b>${t}</b>${esc(x)}</li>`).join("")}</ol></div>`;}
  if(id==="hotel-feeling"){const G={checkin:"Ask how arrival works — many branded residences are built around an easy, hotel-style welcome.",name:"Look for a residence team that gets to know you, not just a front desk.",spa:"Ask which spa and wellness spaces residents can use.",quiet:"Ask about quieter floors and where the busier spaces sit.",breakfast:"Look at what dining sits on site, morning to night.",kids:"Ask what’s on offer for younger guests.",design:"Look closely at the design language and finishes in the model homes.",gym:"Ask to see the fitness space on your visit."};
    const sp=a.special||[];return `<div class="reward"><p class="eyebrow">Your branded residences guide</p><p>Built around ${sp.length?list(sp.map(x=>optL(m,"special",x).toLowerCase())):"what you value"}.</p><ul class="guide">${(sp.length?sp:["checkin","name","design"]).map(x=>`<li>${G[x]}</li>`).join("")}</ul>${a.bonvoy==="Yes"?`<p class="hint">As a Bonvoy ${a.tier||"member"}, ask your advisor how Bonvoy fits with Apartments by Marriott Bonvoy.</p>`:""}<p class="hint">${(a.familiar??50)<50?"We’ll start with the basics of branded residences, in plain English.":"We’ll skip the basics and go straight to the detail."}</p></div>`;}
  if(id==="picture-it"){const V={lake:"calm water",pool:"the resort pool",skyline:"city lights",palms:"palms and greenery",green:"a fairway green"};const pr=a.pairs||[];const st={bright:"bright and open",eclectic:"collected and characterful",airy:"soft and airy",moody:"calm and cocooning",crisp:"crisp and classic",rustic:"warm and rustic"};
    return `<div class="reward"><p class="eyebrow">Your shortlist, sketched</p><ul class="guide"><li>Views of ${V[(a.view||[])[0]]||"whatever catches your eye"}</li><li>${(a.space??50)<50?"Compact and effortless":"Room to spread out"}${a.sleeps?`, sleeping ${a.sleeps}`:""}</li><li>${(a.height??50)<50?"Closer to the pool":"Higher up"}</li>${pr.filter(Boolean).length?`<li>A style that’s ${list(pr.filter(Boolean).map(x=>st[x]))}</li>`:""}${a.time?`<li>Time there shared as ${triWords(a.time,field(m,"time").labels)}</li>`:""}</ul><p class="m-note">Your advisor will match these with real AMBAR homes and views. Your shortlist adds suggestions — it never hides or excludes anything.</p></div>`;}
  if(id==="on-your-mind"){const ex=["overseas","costs","afar","hurricane","currency"].filter(k=>(a[k]??0)>55).map(k=>field(m,k).label);
    return `<div class="reward"><p class="eyebrow">Your explainers</p>${ex.length?`<ul class="guide">${ex.map(x=>`<li>✉ ${x}</li>`).join("")}</ul><p class="hint">Short, clear answers from our approved knowledge set.</p>`:`<p>Nothing flagged — if that changes, just slide any topic toward “want to know more”.</p>`}<p class="eyebrow" style="margin-top:16px">Your one thing</p><p>${a.ask?`“${esc(a.ask)}” — your advisor will reply to this personally.`:"Whenever something comes to mind, add it here and your advisor will reply personally."}</p></div>`;}
  if(id==="your-visit"){const pl=a.places||[];const w=(a.style??50)>=50;
    return `<div class="reward"><p class="eyebrow">Your tour day, sketched</p><p>${(a.season||[])[0]?`Thinking ${a.season[0].toLowerCase()}`:"Your tour day"}${a.guests?`, for ${a.guests===1?"just you":a.guests+" of you"}`:""}${a.stepfree?", on step-free routes":""}${a.littles?", with room for nap times":""}.</p><ol class="plan"><li><b>Morning</b>A warm welcome, then ${w?"a light-touch walk around AMBAR with time to wander":"a guided walk through AMBAR, every detail covered"}.</li><li><b>Lunch</b>${a.plannote?esc(a.plannote):"Somewhere easy nearby, planned around your party"}.</li><li><b>Afternoon</b>${pl.length?esc(list(pl)):"A few of your favourite places"}.</li><li><b>Evening</b>Free time — your advisor will have a couple of suggestions ready.</li></ol></div>`;}
  if(id==="whos-part"){const w=(a.who||[]).filter(x=>x!=="Just me");const d=a.decide??50;
    return `<div class="reward"><p class="eyebrow">How your advisor will share</p><ul class="guide"><li>${d<50?"Short, visual highlights — the feel of the place first":"Clear detail and side-by-side comparisons you can work through"}</li><li>${w.length?`Easy to pass on to your ${list(w.map(x=>x.toLowerCase()))}`:"Written just for you"}</li>${(a.change||[]).filter(x=>x!=="Nothing much").length?`<li>Timed around what’s changing: ${list(a.change.filter(x=>x!=="Nothing much").map(x=>x.toLowerCase()))}</li>`:""}</ul></div>`;}
}
document.addEventListener("input",e=>{if(e.target.dataset.rw==="why"){ans("why-orlando")._card=e.target.value;persist();}});

/* ---------- summary ---------- */
function storyAll(){const out=[];
  if(D.has("why-orlando")) out.push(["Why Orlando",A["why-orlando"]._card||storyWhy()]);
  if(D.has("orlando-days")){const d=dayPlan();out.push(["Orlando Days",`${d.pins.length?`Your Orlando pins so far: ${list(d.pins)}.`:""} ${d.plan.map(x=>x[1]).join(" ")}`]);}
  if(D.has("hotel-feeling")){const a=A["hotel-feeling"],m=MM("hotel-feeling");out.push(["The Hotel Feeling",`A stay feels special with ${list((a.special||[]).map(x=>optL(m,"special",x).toLowerCase()))||"the little things done well"}.${(a.brands||[]).length?` You’d happily copy ${list(a.brands)}.`:""}${a.bonvoy==="Yes"?` Bonvoy ${a.tier||"member"}.`:""} When it comes to looking after the place: ${lean(field(m,"care"),a.care??50)}.`]);}
  if(D.has("picture-it")){const t=document.createElement("div");t.innerHTML=reward("picture-it");out.push(["Picture It",[...t.querySelectorAll("li")].map(l=>l.textContent).join(". ")+"."]);}
  if(D.has("on-your-mind")){const t=document.createElement("div");t.innerHTML=reward("on-your-mind");const a=A["on-your-mind"],m=MM("on-your-mind");const ex=["overseas","costs","afar","hurricane","currency"].filter(k=>(a[k]??0)>55).map(k=>field(m,k).label.toLowerCase());out.push(["On Your Mind",`${ex.length?`You’d like to know more about ${list(ex)} — short explainers are on their way.`:"Nothing flagged for now."}${(a.pause||[]).length?` Things that could give you pause: ${list(a.pause.filter(x=>x!=="Other").map(x=>x.toLowerCase()).concat(a.pauseother?[a.pauseother]:[]))}.`:""}${a.ask?` Your one thing: “${a.ask}”`:""}`]);}
  if(D.has("your-visit")){const t=document.createElement("div");t.innerHTML=reward("your-visit");out.push(["Your Visit",t.querySelector("p:not(.eyebrow)").textContent+" "+[...t.querySelectorAll("li")].map(l=>l.textContent.replace(/^(Morning|Lunch|Afternoon|Evening)/,"$1: ")).join(" ")]);}
  if(D.has("whos-part")){const t=document.createElement("div");t.innerHTML=reward("whos-part");out.push(["Who’s Part of This",[...t.querySelectorAll("li")].map(l=>l.textContent).join(". ")+"."]);}
  return out;}
function summary(){const el=$("#sum-text"), s=storyAll();
  $("#sum-tools").hidden=!s.length;
  if(!s.length){el.contentEditable=false;el.innerHTML=`<p class="sum-empty">Share a Moment or two and your one-page Your Orlando will start writing itself here.</p>`;return;}
  el.contentEditable=true;el.innerHTML=localStorage.getItem("mo-sum")||s.map(([h,p])=>`<h3>${h}</h3><p>${esc(p.replace(/\s+/g," ").trim())}</p>`).join("");}
document.addEventListener("input",e=>{if(e.target.id==="sum-text")localStorage.setItem("mo-sum",e.target.innerHTML);});
cards();board();summary();
