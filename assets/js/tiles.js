/* My Orlando · Moments — generative AMBAR mosaic for the landing Moment tiles.
   Each visit, every tile gets its own AMBAR rendering, crop, palette pair, cell shape and mosaic region.
   Hover, keyboard focus, touch or scrolling into view dissolves the mosaic to reveal the rendering.
   Pure canvas, no network calls, no keys. Respects prefers-reduced-motion. */
(function(){
"use strict";
// AMBAR renderings only (see README credits). No other destinations.
var SRC=["hotel-feeling","picture-it","your-visit","x-pool","x-spa","x-v-pool","x-bright","x-bcalm"];
var C={forest:"#0F2D21",olive:"#5A5A37",sage:"#989B74",brown:"#B37D50",cream:"#F4EFE7",gold:"#FFA94A"};
var PAL=[["forest","cream"],["olive","cream"],["brown","cream"],["forest","sage"],["olive","sage"],["forest","brown"]]; // amber is kept as a sparing accent
var SHAPES=["tessera","halftone","arc","louvre"];
var REGIONS=["diagonal","corner","split","band"];
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)");
var NOHOVER=window.matchMedia&&matchMedia("(hover: none)");
var rm=function(){return !!(RM&&RM.matches)};
var rand=Math.random, pick=function(a){return a[Math.floor(rand()*a.length)]};
var hex=function(h){return [parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]};
var mix=function(a,b,t){return "rgb("+[0,1,2].map(function(i){return Math.round(a[i]+(b[i]-a[i])*t)}).join(",")+")"};
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};

// One roll per tile per page visit; kept for the session so re-renders (e.g. closing a Moment) don't jump.
var order=SRC.slice().sort(function(){return rand()-.5}), rolls={}, n=0;
function roll(id){
  if(rolls[id]) return rolls[id];
  var p=pick(PAL);
  rolls[id]={id:id,src:"assets/img/"+order[n++%order.length]+".jpg",
    x:Math.round(20+rand()*60), y:Math.round(25+rand()*50), z:+(1.08+rand()*.32).toFixed(2),
    dark:p[0], light:p[1], shape:pick(SHAPES), region:pick(REGIONS),
    cell:Math.round(16+rand()*12), seed:Math.floor(rand()*1e9).toString(36)};
  return rolls[id];
}

function Tile(box){
  var t=this; t.box=box; t.r=roll(box.dataset.tile); t.img=box.querySelector("img");
  t.cv=document.createElement("canvas"); t.cv.className="c-mosaic"; t.cv.setAttribute("aria-hidden","true");
  t.img.insertAdjacentElement("afterend",t.cv);
  box.dataset.src=t.r.src.split("/").pop(); box.dataset.seed=t.r.seed; box.dataset.look=t.r.shape+" · "+t.r.dark+"/"+t.r.light;
  t.ctx=t.cv.getContext("2d"); t.state="cover"; t.cells=[]; t.ok=false;
  var go=function(){t.build();};
  if(t.img.complete&&t.img.naturalWidth) t.ok=true;
  t.img.addEventListener("load",function(){t.ok=true;t.build();t.settle();},{once:true});
  t.img.addEventListener("error",function(){t.fail();},{once:true});
  if(t.img.complete&&!t.img.naturalWidth&&t.img.getAttribute("src")) t.fail();
  if(window.ResizeObserver) new ResizeObserver(function(){t.build();t.draw();}).observe(box); else go();
}
Tile.prototype.fail=function(){this.ok=false;this.box.classList.add("no-img");this.build();this.to("cover",null,true);};
Tile.prototype.build=function(){
  var b=this.box,W=b.clientWidth,H=b.clientHeight; if(!W||!H) return;
  var dpr=Math.min(2,window.devicePixelRatio||1);
  this.cv.width=Math.round(W*dpr); this.cv.height=Math.round(H*dpr); this.dpr=dpr; this.W=W; this.H=H;
  var cs=this.r.cell, cols=Math.ceil(W/cs), rows=Math.ceil(H/cs), lum=this.sample(cols,rows), old=this.cells;
  var cells=[], i=0, j, k;
  for(j=0;j<rows;j++)for(k=0;k<cols;k++,i++){
    var prev=old[i]; cells.push({x:k*cs,y:j*cs,u:(k+.5)/cols,v:(j+.5)/rows,l:lum[i],q:Math.floor(rand()*4),jit:rand(),acc:rand()<.035,
      val:prev?prev.val:(this.state==="cover"?0:1),from:0,to:0});}
  this.cells=cells; this.cs=cs; this.mask();
  if(this.state!=="cover") cells.forEach(function(c){c.val=c.to=c.target[this.state]}.bind(this));
  this.draw();
};
// Luminance per cell, sampled from the same crop the photo shows (object-position + scale).
Tile.prototype.sample=function(cols,rows){
  var out=new Array(cols*rows), img=this.img, r=this.r, i;
  try{
    if(!this.ok) throw 0;
    var iw=img.naturalWidth,ih=img.naturalHeight,W=this.W,H=this.H,s0=Math.max(W/iw,H/ih);
    var ox=(W-iw*s0)*r.x/100, oy=(H-ih*s0)*r.y/100, Px=W*r.x/100, Py=H*r.y/100;
    var sx=(Px-Px/r.z-ox)/s0, sy=(Py-Py/r.z-oy)/s0, sw=W/r.z/s0, sh=H/r.z/s0;
    var o=document.createElement("canvas"); o.width=cols; o.height=rows; var x=o.getContext("2d");
    x.drawImage(img,sx,sy,sw,sh,0,0,cols,rows);
    var d=x.getImageData(0,0,cols,rows).data, lo=1, hi=0;
    for(i=0;i<out.length;i++){var L=(.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2])/255;out[i]=L;lo=Math.min(lo,L);hi=Math.max(hi,L);}
    for(i=0;i<out.length;i++) out[i]=hi>lo?(out[i]-lo)/(hi-lo):.5;
  }catch(e){ // no image (failed or not yet loaded): abstract field from brand colours
    var a=rand()*6.28,f=1.5+rand()*2;
    for(i=0;i<out.length;i++){var u=(i%cols)/cols,v=Math.floor(i/cols)/rows;out[i]=.5+.5*Math.sin(f*(u*Math.cos(a)+v*Math.sin(a))*3.14+rand()*.6);}
  }
  return out;
};
// Region the mosaic keeps at rest (soft edge), so the rendering shows through the rest.
Tile.prototype.mask=function(){
  var r=this.r, flip=r.seed.charCodeAt(0)%2, th=.42+(r.seed.charCodeAt(1)%20)/100;
  this.cells.forEach(function(c){
    var u=flip?1-c.u:c.u, v=c.v, m;
    if(r.region==="diagonal") m=(u+v)/2;
    else if(r.region==="corner") m=Math.hypot(u,v)/1.414;
    else if(r.region==="split") m=u;
    else m=Math.abs(v-.5)*2;
    var rest=Math.max(0,Math.min(1,(m-th)/.22+(c.jit-.5)*.35)); // 0 = full cell, 1 = gone
    c.target={cover:0,rest:rest,open:1};
  });
};
Tile.prototype.to=function(state,origin,instant){
  this.state=state; var t=this, now=performance.now();
  var ox=origin?origin[0]:.5+(rand()-.5)*.6, oy=origin?origin[1]:.5+(rand()-.5)*.6;
  this.cells.forEach(function(c){c.from=c.val;c.to=c.target?c.target[state]:(state==="cover"?0:1);
    c.t0=now+(Math.hypot(c.u-ox,c.v-oy)*520+c.jit*160)*(state==="cover"?.6:1);});
  this.box.dataset.state=state;
  if(instant||rm()){this.cells.forEach(function(c){c.val=c.to});this.draw();return;}
  if(!this.raf) this.raf=requestAnimationFrame(function f(ts){var busy=false;
    t.cells.forEach(function(c){var p=Math.max(0,Math.min(1,(ts-c.t0)/380));c.val=c.from+(c.to-c.from)*ease(p);if(p<1)busy=true;});
    t.draw(); t.raf=busy?requestAnimationFrame(f):0;});
};
Tile.prototype.settle=function(){if(this.ok&&this.state==="cover"&&this.seen) this.to("rest");};
Tile.prototype.draw=function(){
  var x=this.ctx,d=this.dpr||1,r=this.r,cs=this.cs,D=hex(C[r.dark]),Lc=hex(C[r.light]),dk=C[r.dark],lt=C[r.light];
  if(!x||!cs) return; x.setTransform(d,0,0,d,0,0); x.clearRect(0,0,this.W,this.H); x.globalAlpha=.94;
  this.cells.forEach(function(c){
    var s=1-c.val; if(s<=.02) return;
    var w=cs*s, cx=c.x+cs/2, cy=c.y+cs/2, x0=cx-w/2, y0=cy-w/2, L=c.l;
    if(r.shape==="tessera"){x.fillStyle=c.acc?C.gold:mix(D,Lc,L);x.fillRect(x0+.5,y0+.5,w-1,w-1);}
    else if(r.shape==="halftone"){x.fillStyle=lt;x.fillRect(x0,y0,w,w);x.fillStyle=c.acc?C.gold:dk;x.beginPath();x.arc(cx,cy,Math.max(.6,(1-L)*.62*w),0,6.283);x.fill();}
    else if(r.shape==="arc"){x.fillStyle=L>.5?lt:dk;x.fillRect(x0,y0,w,w);x.fillStyle=mix(D,Lc,L>.5?L*.6:.4+L);
      var px=x0+(c.q&1?w:0), py=y0+(c.q&2?w:0); x.beginPath();x.moveTo(px,py);x.arc(px,py,w,c.q*1.5708,c.q*1.5708+1.5708);x.closePath();x.fill();}
    else {x.fillStyle=lt;x.fillRect(x0,y0,w,w);x.fillStyle=dk;var bw=Math.max(1,(1-L)*.85*w);x.fillRect(cx-bw/2,y0,bw,w);}
  });
};

var live=[], io=window.IntersectionObserver?new IntersectionObserver(function(es){es.forEach(function(e){var t=e.target._mo;if(!t)return;
  if(e.isIntersecting&&e.intersectionRatio>=.55){if(!t.seen){t.seen=true;t.settle();}
    else if(NOHOVER&&NOHOVER.matches&&t.ok&&t.state!=="open") t.to("open");}
  else if(!e.isIntersecting&&t.seen&&t.ok&&NOHOVER&&NOHOVER.matches) t.to("rest",null,true);});},{threshold:[0,.55]}):null;

function mount(root){
  live=[]; if(io) io.disconnect();
  (root||document).querySelectorAll(".c-img[data-tile]").forEach(function(box){
    var card=box.closest(".card"), t=new Tile(box); box._mo=t; live.push(t);
    if(io) io.observe(box); else {t.seen=true;t.settle();}
    var pt=function(e){var b=box.getBoundingClientRect();return e&&e.clientX!=null?[(e.clientX-b.left)/b.width,(e.clientY-b.top)/b.height]:null;};
    card.addEventListener("pointerenter",function(e){if(e.pointerType==="mouse"&&t.ok)t.to("open",pt(e));});
    card.addEventListener("pointerleave",function(e){if(e.pointerType==="mouse"&&t.ok)t.to("rest",pt(e));});
    card.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse"&&t.ok)t.to("open",pt(e));});
    card.addEventListener("focusin",function(){if(t.ok)t.to("open");});
    card.addEventListener("focusout",function(e){if(t.ok&&!card.contains(e.relatedTarget))t.to("rest");});
  });
}
window.MoTiles={roll:roll,mount:mount,tiles:function(){return live}};
})();
