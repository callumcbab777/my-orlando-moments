const M=[
{id:"why-orlando",name:"Why Orlando",time:"about 2 minutes",invite:"Tell us what’s drawing you to Orlando right now.",desc:"The pull of the place, in your own words.",focus:"What’s drawing you here right now — the reasons Orlando is on your mind today.",prompts:["Tell us what first made you think of Orlando.","Show us a photo that feels like the Orlando you have in mind.","Which feels more like you: lakeside calm or right in the middle of it all?"],reward:"A short “Your Orlando, so far” card, written warmly in ABI’s voice from what you share. You can edit it and share it with a partner."},
{id:"orlando-days",name:"Orlando Days",time:"about 2 minutes",invite:"Tell us about your Orlando days.",desc:"Parks, dining and the things you love doing.",focus:"Parks, dining and the things you love doing — and the pace you like to do them at.",prompts:["Tell us about a perfect day out: parks, dining or something else entirely?","Show us the places you already love, or would love to try.","Which feels more like you: first in line at opening, or a long lunch and a late evening?"],reward:"A starter set of pins and a one-click day plan built around your parks, your dining and your pace."},
{id:"hotel-feeling",name:"The Hotel Feeling",time:"about 2 minutes",invite:"Tell us what great service feels like to you.",desc:"Service, Bonvoy and the brand experiences you value.",focus:"What great service means to you, plus your Marriott Bonvoy and brand experiences.",prompts:["Tell us about a stay where the service made the trip.","Show us the hotel moments you remember most.","Which feels more like you: anticipated before you ask, or there the moment you do?"],reward:"A short guide to branded residences, shaped around what you said matters, so you only see what’s relevant to you."},
{id:"picture-it",name:"Picture It",time:"about 3 minutes",invite:"How do you picture your time there?",desc:"The view, the space, the style and how you’d spend your time.",focus:"The view, the space and the style you’re drawn to, and how you imagine spending your time there.",prompts:["How do you picture your time there?","Show us the view you’d love to wake up to.","Which feels more like you: bright and open, or warm and tucked away?"],reward:"A shortlist of AMBAR units and views that match your picks.",note:"Your shortlist adds suggestions — it never hides or excludes anything. Every home stays open to explore."},
{id:"on-your-mind",name:"On Your Mind",time:"about 2 minutes",invite:"Tell us what’s on your mind today.",desc:"Your questions and hesitations, and the one thing you’d ask us.",focus:"The questions and hesitations you have right now, and the one thing you’d most like to ask us.",prompts:["Tell us what you’re still wondering about.","If you could ask us one thing, what would it be?","Which feels more like you: all the detail now, or the big picture first?"],reward:"Direct answers from our approved knowledge set to the things you flagged, plus a personal reply from your advisor to your one question."},
{id:"your-visit",name:"Your Visit",time:"about 2 minutes",invite:"Tell us how you’d like your tour day to feel.",desc:"Planning your tour, once it’s booked.",focus:"Tour planning, for when your visit is booked — who’s coming, what you’d like to see and how you like to travel.",prompts:["Tell us who’s joining you on the day.","Show us what you’d most like to see while you’re here.","Which feels more like you: a full, packed day or plenty of breathing room?"],reward:"A personalised tour-day itinerary.",note:"Opens once a tour is booked."},
{id:"whos-part",name:"Who’s Part of This",time:"about 1 minute",invite:"Tell us who you’re deciding with.",desc:"The people in the conversation, and how you like to decide.",focus:"Who you’re deciding with, and whether you go with gut feel or with a spreadsheet.",prompts:["Tell us who else is part of this.","Which feels more like you: gut feel or spreadsheet?","Show us how you like to receive information — quick notes, or the full detail?"],reward:"Your advisor tailors how they share information, so it suits you and everyone deciding with you."}
];
const $=s=>document.querySelector(s);
const shared=new Set(JSON.parse(localStorage.getItem("mo-shared")||"[]"));
const save=()=>localStorage.setItem("mo-shared",JSON.stringify([...shared]));
function cards(){
  $("#cards").innerHTML=M.map(m=>`<article class="card${shared.has(m.id)?" is-shared":""}" tabindex="0" role="button" data-id="${m.id}" aria-label="Open ${m.name}">
    <div class="c-img"><img src="assets/img/${m.id}.jpg" alt="" loading="lazy"><span class="c-time">${m.time}</span></div>
    <div class="c-body"><h3>${m.name}</h3><p class="c-invite">${m.invite}</p><p class="c-desc">${m.desc}</p>
    <div class="c-foot"><span class="c-open">Open moment →</span><button class="c-edit" data-edit="${m.id}" aria-label="Edit ${m.name}">✎ Edit</button></div></div></article>`).join("");
}
function board(){
  const done=M.filter(m=>shared.has(m.id));
  $("#board").innerHTML=M.map(m=>shared.has(m.id)
    ?`<figure class="tile filled"><img src="assets/img/${m.id}.jpg" alt=""><figcaption>${m.name}</figcaption></figure>`
    :`<figure class="tile empty"><span>${m.name}</span></figure>`).join("")
    +(done.length?"":"");
}
let cur=null;
function open(id,edit){
  const m=M.find(x=>x.id===id);cur=m;
  $("#m-img").src=`assets/img/${m.id}.jpg`;$("#m-time").textContent=m.time;$("#m-title").textContent=m.name;
  $("#m-invite").textContent=m.invite;$("#m-focus").textContent=m.focus;$("#m-reward").textContent=m.reward;
  $("#m-prompts").innerHTML=m.prompts.map(p=>`<li>${p}</li>`).join("");
  $("#m-note").textContent=m.note||"";$("#m-note").hidden=!m.note;
  $("#m-share").textContent=shared.has(m.id)?"Shared ✓ — tap to remove from board":"Mark as shared";
  $("#m-edit").textContent=edit?"✎ Editing — your answers can change":"✎ Edit my answers";
  $("#modal").hidden=false;document.body.classList.add("lock");$(".modal .close").focus();
}
function close(){$("#modal").hidden=true;document.body.classList.remove("lock");}
document.addEventListener("click",e=>{
  const ed=e.target.closest("[data-edit]");if(ed){e.stopPropagation();open(ed.dataset.edit,true);return;}
  const c=e.target.closest(".card");if(c){open(c.dataset.id);return;}
  if(e.target.closest("[data-close]"))close();
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape")close();
  if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("card")){e.preventDefault();open(e.target.dataset.id);}
});
$("#m-share").onclick=()=>{shared.has(cur.id)?shared.delete(cur.id):shared.add(cur.id);save();cards();board();open(cur.id);};
$("#m-edit").onclick=()=>{$("#m-edit").textContent="✎ Editing — your answers can change";};
cards();board();
