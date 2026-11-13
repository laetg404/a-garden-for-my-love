(() => {
"use strict";

// -------------------- Configuración --------------------
const W=1100,H=760, WIND=1, ROWS=4,COLS=9;
const DURATIONS=[12,15,0], FADE=1.2;
const PANEL={left:-500,right:500,top:-186,bottom:-372};
const STOPS=[[0,"#070A22"],[.5,"#161B4C"],[1,"#5E3A7C"]];
const MOON={x:390,y:255,r:44};
const COLORS=["#FF5277","#FF8C42","#FFE066","#B98AFF","#FF4F9A",
"#F4F0FF","#FF4444","#65D6A6","#79AFFF","#F7A6C8"];
const MESSAGES=[
 {title:"Para mi princesa ♡",body:[
  "Hoy el cielo tiene un motivo más para brillar,",
  "porque un día como hoy llegaste a este mundo.",
  "Y entre tantas casualidades de la vida,",
  "la mía más bonita fue encontrarte."
 ]},
 {title:"Mi amor...",body:[
  "Si pudiera regalarte todas las flores del mundo,",
  "lo haría sin pensarlo, aunque ninguna sería",
  "tan hermosa como tú.",
  "Gracias por llenar mis días de tanto amor.",
  "Eres uno de mis lugares favoritos en el mundo."
 ]},
 {title:"¡Feliz cumpleaños, mi cielo! ♡",body:[
  "Deseo que la vida te regale infinitas razones para sonreír,",
  "sueños que se hagan realidad y muchísimos momentos felices.",
  "Quiero seguir celebrando cada estación contigo,",
  "amándote un poquito más cada día.",
  "Te amo muchísimo. ♡"
 ]}
];

const canvas=document.getElementById("scene");
const button=document.getElementById("next");
const previousButton=document.getElementById("previous");
const screen=canvas.getContext("2d");
if(!screen){document.body.textContent="No se pudo iniciar Canvas.";return;}
const bgCanvas=document.createElement("canvas");
bgCanvas.width=W; bgCanvas.height=H;
const bgCtx=bgCanvas.getContext("2d");
let ctx=screen;

const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const X=x=>W/2+x, Y=y=>H/2-y;
function rgb(c){return [1,3,5].map(i=>parseInt(c.slice(i,i+2),16));}
function mix(a,b,t){
 const A=rgb(a),B=rgb(b);t=clamp(t,0,1);
 return `rgb(${A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(",")})`;
}
const dark=(c,t)=>mix(c,"#000000",t), light=(c,t)=>mix(c,"#FFFFFF",t);

function poly(points,color){
 if(!points.length)return;
 ctx.beginPath();ctx.moveTo(X(points[0][0]),Y(points[0][1]));
 for(let i=1;i<points.length;i++)ctx.lineTo(X(points[i][0]),Y(points[i][1]));
 ctx.closePath();ctx.fillStyle=color;ctx.fill();
}
function circle(x,y,r,color){
 ctx.beginPath();ctx.arc(X(x),Y(y),Math.max(.4,r),0,Math.PI*2);
 ctx.fillStyle=color;ctx.fill();
}
function line(points,color,width=2){
 if(points.length<2)return;
 ctx.beginPath();ctx.moveTo(X(points[0][0]),Y(points[0][1]));
 for(let i=1;i<points.length;i++)ctx.lineTo(X(points[i][0]),Y(points[i][1]));
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();
}
function smooth(points,n=1){
 for(let k=0;k<n;k++){
  const out=[];
  for(let i=0;i<points.length;i++){
   const p=points[i],q=points[(i+1)%points.length];
   out.push([.75*p[0]+.25*q[0],.75*p[1]+.25*q[1]],
            [.25*p[0]+.75*q[0],.25*p[1]+.75*q[1]]);
  } points=out;
 } return points;
}
function rounded(x1,y1,x2,y2,r){
 const out=[],corners=[[x2-r,y2-r,0],[x1+r,y2-r,90],[x1+r,y1+r,180],[x2-r,y1+r,270]];
 for(const [cx,cy,s] of corners)for(let i=0;i<=6;i++){
  const a=(s+90*i/6)*Math.PI/180;out.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);
 } return out;
}
function sky(y){
 const t=clamp((400-y)/380,0,1);
 for(let i=0;i<2;i++){const [a,c]=STOPS[i],[b,d]=STOPS[i+1];if(t<=b)return mix(c,d,(t-a)/(b-a));}
 return STOPS[2][1];
}
function star(x,y,r,c){
 const k=r*.22;poly([[x,y+r],[x+k,y+k],[x+r,y],[x+k,y-k],[x,y-r],[x-k,y-k],[x-r,y],[x-k,y+k]],c);
}
const HEART=Array.from({length:24},(_,i)=>{
 const t=i*Math.PI*2/24;
 return [Math.sin(t)**3,(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/16];
});
function heart(x,y,s,c){poly(HEART.map(([a,b])=>[x+a*s,y+b*s]),c);}

// -------------------- Paisaje --------------------
const mountain=x=>35+40*(1-Math.abs(Math.sin(x*.0065+.8)))+8*Math.sin(x*.03);
const farHill=x=>5+24*Math.sin(x*.006+3)+10*Math.sin(x*.017);
const midHill=x=>-22+14*Math.sin(x*.009+.5)+6*Math.sin(x*.03);
const field=x=>-48+5*Math.sin(x*.011)+3*Math.sin(x*.04+1);
function hill(fn,c){
 const p=[];for(let x=-580;x<=600;x+=20)p.push([x,fn(x)]);
 p.push([600,-400],[-580,-400]);poly(p,c);
}
function pine(x,y,h,c){
 for(let i=0;i<3;i++){const b=y+h*i*.28,w=h*(.32-i*.07);poly([[x-w,b],[x,b+h*.46],[x+w,b]],c);}
 poly([[x-2,y-4],[x-2,y+2],[x+2,y+2],[x+2,y-4]],c);
}
function drawMoon(){
 for(let i=7;i>=1;i--)circle(MOON.x,MOON.y,MOON.r+i*9,mix(sky(MOON.y),"#FFE9A8",.03*(8-i)));
 circle(MOON.x,MOON.y,MOON.r,"#FFF1C1");
 // Recorte del disco: luna creciente.
 circle(MOON.x+20,MOON.y+16,MOON.r-2,sky(MOON.y+16));
}
function drawBackground(){
 for(let y=400;y>=-60;y-=10)poly([[-580,y],[580,y],[580,y-11],[-580,y-11]],sky(y-5));
 for(let i=0;i<140;i++){
  const x=rand(-540,540),y=rand(40,390);
  if(Math.hypot(x-MOON.x,y-MOON.y)<105)continue;
  const c=pick(["#FFFFFF","#FFF1BD","#C5D7FF","#E8D5FF"]);
  circle(x,y,rand(.8,2.6),mix(c,sky(y),Math.max(0,(60-y)/120)+.05));
 }
 drawMoon();hill(mountain,"#322E69");hill(farHill,"#262C5E");
 for(let i=0;i<11;i++){const x=rand(-540,540);pine(x,farHill(x)-3,rand(34,56),"#1B2457");}
 hill(midHill,"#1D3B58");
 for(let i=0;i<160;i++){const x=rand(-570,570);circle(x,midHill(x)-rand(2,16),rand(1,2),mix(pick(COLORS),"#1D3B58",.55));}
 hill(field,"#1A4E46");hill(x=>field(x)-45,"#17433F");hill(x=>field(x)-105,"#133A37");
 const greens=["#1F5A4B","#2A6B52","#194A41","#2F7A58"];
 for(let i=0;i<340;i++){
  const x=rand(-570,570),y=rand(-182,-54),d=clamp((-48-y)/134,0,1);
  const h=rand(8,20)*(.45+d),w=1.5+d*2.2;
  poly([[x-w,y],[x+rand(-5,5),y+h],[x+w,y]],mix(pick(greens),"#2C4468",(1-d)*.35));
 }
}

// -------------------- Tulipanes --------------------
const BACK=[[-2,4],[-13,20],[-15,44],[-10,64],[-2,44]];
const CUP=smooth([[0,0],[-13,3],[-22,15],[-25,34],[-19,52],[-10,60],[0,46],[10,60],[19,52],[25,34],[22,15],[13,3]]);
const CENTER=smooth([[-8,3],[-14,22],[-11,44],[0,66],[11,44],[14,22],[8,3],[0,0]]);
const HIGHLIGHT=[[-3,8],[-6,28],[-2,50],[2,50],[4,28],[2,8]];
function createTulips(){
 const list=[],spacing=W/COLS;
 for(let row=0;row<ROWS;row++){
  const depth=row/(ROWS-1),rowY=-66+(-172+66)*depth;
  for(let col=0;col<COLS;col++){
   let x=-W/2+spacing*(col+.5)+(row%2?spacing*.5:0)+rand(-28,28);x=clamp(x,-535,535);
   const baseY=rowY+rand(-8,8),s=(.62+.6*depth)*rand(.88,1.12),h=rand(115,175)*s;
   const haze=(1-depth)*.5,c=mix(pick(COLORS),"#2C4468",haze),leaf=mix("#58B081","#2C4468",haze);
   list.push({x,baseY,s,h,phase:rand(0,Math.PI*2),speed:rand(.7,1.4),amp:rand(4,11),
    p:{back:dark(c,.42),shade:dark(c,.25),base:c,light:light(c,.38),
       stem:mix("#3F9467","#2C4468",haze),leaf,leafDark:dark(leaf,.25)}});
  }
 }
 return list.sort((a,b)=>b.baseY-a.baseY);
}
function drawLeaf(x,y,a,len,w,bend,p){
 const mid=[[x,y]],left=[[x,y]],right=[[x,y]];let px=x,py=y;
 for(let i=1;i<=4;i++){
  const angle=a+bend*i/4;px+=Math.cos(angle)*len/4;py+=Math.sin(angle)*len/4;
  const ww=w*Math.max(0,Math.sin(Math.PI*i/4))**.7,nx=-Math.sin(angle),ny=Math.cos(angle);
  mid.push([px,py]);left.push([px+nx*ww,py+ny*ww]);right.push([px-nx*ww,py-ny*ww]);
 }
 poly([...left,...mid.slice().reverse()],p.leaf);poly([...right,...mid.slice().reverse()],p.leafDark);
}
function transform(points,x,y,s,ca,sa){
 return points.map(([a,b])=>[x+(a*ca-b*sa)*s,y+(a*sa+b*ca)*s]);
}
function drawTulip(o,t){
 const {x,baseY,h,s,p}=o;
 const gust=1+.45*Math.sin(t*.35)+.25*Math.sin(t*.9+1.3);
 const sway=Math.sin(t*o.speed+o.phase+x*.006)*o.amp*WIND*gust;
 drawLeaf(x-1,baseY,70*Math.PI/180+sway*.012,h*.60,10*s,-.9,p);
 drawLeaf(x+1,baseY,110*Math.PI/180+sway*.012,h*.54,10*s,.9,p);
 const stem=[];for(let i=0;i<=6;i++){const q=i/6;stem.push([x+sway*q**1.6,baseY+h*q]);}
 line(stem,p.stem,Math.max(2,Math.round(4*s)));
 const [cx,cy]=stem[6],tilt=-Math.atan2(1.6*sway,h),ca=Math.cos(tilt),sa=Math.sin(tilt);
 poly(transform(BACK,cx,cy,s,ca,sa),p.back);
 poly(transform(BACK.map(([a,b])=>[-a,b]),cx,cy,s,ca,sa),p.back);
 poly(transform(CUP,cx,cy,s,ca,sa),p.shade);
 poly(transform(CENTER,cx,cy,s,ca,sa),p.base);
 poly(transform(HIGHLIGHT,cx,cy,s,ca,sa),p.light);
}

// -------------------- Partículas --------------------
const petals=[],flies=[],twinkles=[],floatingHearts=[];
const shooting={life:0};
function createParticles(){
 for(let i=0;i<12;i++)petals.push({x:rand(-520,520),y:rand(-100,380),speed:rand(.7,1.6),phase:rand(0,6.28),spin:rand(1.5,3.5),color:pick(COLORS),size:rand(3,5.5)});
 for(let i=0;i<14;i++)flies.push({x:rand(-500,500),y:rand(-150,60),range:rand(20,55),speed:rand(.3,.8),pulse:rand(1.5,3),phase:rand(0,6.28)});
 for(let i=0;i<18;i++)twinkles.push({x:rand(-540,540),y:rand(70,385),speed:rand(1,2.5),phase:rand(0,6.28)});
}
function drawParticles(t,lastMessage){
 for(const s of twinkles){
  if(Math.hypot(s.x-MOON.x,s.y-MOON.y)<100)continue;
  const g=.5+.5*Math.sin(t*s.speed+s.phase);
  star(s.x,s.y,1.5+4.5*g,mix(sky(s.y),"#FFF7D6",.35+.65*g));
 }
 if(shooting.life<=0){
  if(Math.random()<.003)Object.assign(shooting,{x:rand(-250,350),y:rand(230,340),vx:-rand(11,15),vy:-rand(4,6),life:30});
 }else{
  shooting.x+=shooting.vx;shooting.y+=shooting.vy;shooting.life--;
  for(let k=0;k<5;k++)line([[shooting.x-shooting.vx*k*.8,shooting.y-shooting.vy*k*.8],[shooting.x-shooting.vx*(k+1)*.8,shooting.y-shooting.vy*(k+1)*.8]],mix("#FFFFFF",sky(shooting.y),k/5),Math.max(1,3-Math.floor(k/2)));
 }
 for(const f of flies){
  const x=f.x+Math.cos(t*f.speed+f.phase)*f.range*2;
  const y=Math.max(-175,f.y+Math.sin(t*f.speed*1.3+f.phase)*f.range*.6);
  const pulse=.5+.5*Math.sin(t*f.pulse+f.phase),back=y<-40?"#1C3F40":"#27325F";
  circle(x,y,9,mix(back,"#FFE98A",.08+.14*pulse));
  circle(x,y,5,mix(back,"#FFE98A",.25+.3*pulse));
  circle(x,y,2,mix(back,"#FFF8C8",.6+.4*pulse));
 }
 if(petals.length<16&&Math.random()<.04)petals.push({x:rand(-520,520),y:395,speed:rand(.7,1.6),phase:rand(0,6.28),spin:rand(1.5,3.5),color:pick(COLORS),size:rand(3,5.5)});
 for(let i=petals.length-1;i>=0;i--){
  const p=petals[i];p.y-=p.speed;p.x+=.5+Math.sin(t*1.5+p.phase)*1.4;
  if(p.y<-172||p.x>570){petals.splice(i,1);continue;}
  const a=Math.sin(t+p.phase)*.6,w=p.size*Math.abs(Math.cos(t*p.spin+p.phase))+.8,h=p.size*1.4,ca=Math.cos(a),sa=Math.sin(a);
  poly([[0,h],[w,0],[0,-h],[-w,0]].map(([x,y])=>[p.x+x*ca-y*sa,p.y+x*sa+y*ca]),p.color);
 }
 if(lastMessage&&floatingHearts.length<10&&Math.random()<.05)floatingHearts.push({x:rand(-480,480),y:-172,speed:rand(.8,1.6),phase:rand(0,6.28),size:rand(5,10),color:pick(["#FF6F9F","#FF9EC4","#FFB3D1","#FF5277"])});
 for(let i=floatingHearts.length-1;i>=0;i--){
  const h=floatingHearts[i];h.y+=h.speed;h.x+=Math.sin(t*1.2+h.phase)*.8;
  if(h.y>300){floatingHearts.splice(i,1);continue;}heart(h.x,h.y,h.size,h.color);
 }
}

// -------------------- Mensajes: siempre visibles --------------------
let messageIndex=0,messageStarted=performance.now()/1000;
function drawPanel(){
 poly(rounded(PANEL.left-3,PANEL.bottom-3,PANEL.right+3,PANEL.top+3,22),"#5C4A8C");
 poly(rounded(PANEL.left,PANEL.bottom,PANEL.right,PANEL.top,20),"#0F1836");
 const inner=rounded(PANEL.left+8,PANEL.bottom+8,PANEL.right-8,PANEL.top-8,14);
 line([...inner,inner[0]],"#262F63",1);
}
function drawMessage(now){
 const elapsed=Math.max(0,now-messageStarted),alpha=clamp(elapsed/FADE,0,1);
 const m=MESSAGES[messageIndex],lines=m.body;
 drawPanel();
 const titleH=30,gap=24,lineH=22;
 const blockH=titleH+gap+lines.length*lineH;
 const center=(PANEL.top+PANEL.bottom)/2+5,top=center+blockH/2;
 ctx.save();ctx.globalAlpha=alpha;ctx.textAlign="center";ctx.textBaseline="alphabetic";
 ctx.font="bold 21px Georgia,serif";ctx.fillStyle="#FFD9EC";
 ctx.fillText(m.title,X(0),Y(top-titleH));
 const dividerY=top-titleH-20;
 line([[-210,dividerY],[-22,dividerY]],"#8E78B8",2);
 line([[22,dividerY],[210,dividerY]],"#8E78B8",2);
 heart(0,dividerY,7,"#FF6F9F");
 ctx.font="13px Georgia,serif";ctx.fillStyle="#FFF5F8";
 lines.forEach((text,i)=>{
  const y=top-titleH-gap-(i+1)*lineH+3;
  ctx.fillText(text,X(0),Y(y),920);
 });
 for(let i=0;i<3;i++)circle((i-1)*16,PANEL.bottom+14,3.2,i===messageIndex?"#FFD9EC":"#3C4272");
 if(messageIndex<2){
  ctx.textAlign="right";ctx.font="9px Georgia,serif";ctx.fillStyle="#A9A7D0";
  ctx.fillText("SPACE ▸",X(PANEL.right-24),Y(PANEL.bottom+8));
 }
 ctx.restore();
}
function changeMessage(direction){
 const nextIndex=clamp(messageIndex+direction,0,MESSAGES.length-1);
 if(nextIndex===messageIndex)return;
 messageIndex=nextIndex;
 // Reinicia el tiempo del mensaje al navegar manualmente.
 messageStarted=performance.now()/1000;
 updateNavigation();
}
function nextMessage(){changeMessage(1);}
function previousMessage(){changeMessage(-1);}
function updateNavigation(){
 previousButton.disabled=messageIndex===0;
 button.disabled=messageIndex===MESSAGES.length-1;
}
function updateSequence(now){
 const duration=DURATIONS[messageIndex];
 if(duration>0&&now-messageStarted>=duration)nextMessage();
}

// -------------------- Inicio y render --------------------
const tulips=createTulips();
createParticles();

// El fondo se dibuja en su propio contexto y queda cacheado.
ctx=bgCtx;
drawBackground();
ctx=screen;

const start=performance.now()/1000;
function frame(){
 const now=performance.now()/1000,t=now-start;
 ctx=screen;
 ctx.clearRect(0,0,W,H);
 ctx.drawImage(bgCanvas,0,0);
 for(const tulip of tulips)drawTulip(tulip,t);
 drawParticles(t,messageIndex===MESSAGES.length-1);
 updateSequence(now);
 // El panel se pinta cada fotograma y queda por delante de los tallos.
 drawMessage(now);
 requestAnimationFrame(frame);
}
window.addEventListener("keydown",event=>{
 if(event.code==="Space" || event.code==="ArrowRight"){
  event.preventDefault();nextMessage();
 } else if(event.code==="ArrowLeft"){
  event.preventDefault();previousMessage();
 }
});
button.addEventListener("click",nextMessage);
previousButton.addEventListener("click",previousMessage);
// Tocar el lienzo avanza al siguiente mensaje, como antes.
canvas.addEventListener("pointerup",nextMessage);
updateNavigation();
frame();
})();