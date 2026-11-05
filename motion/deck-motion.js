/* deck-motion.js — 움직임 장면 런타임과 장면 라이브러리. 의존성 없음.
   규칙: 장면은 draw(t) 하나로 그린다. 같은 t면 같은 화면. Date.now, 시드 없는 난수 금지.
   사용: .slide 요소에 data-motion="map"을 주고 안에 application/json 스크립트로 데이터를 넣는다.
   일반 슬라이드는 그대로 두면 비트 하나짜리로 취급한다. */
(function(global){
'use strict';
const NS='http://www.w3.org/2000/svg';
const cl=x=>Math.max(0,Math.min(1,x)),seg=(t,a,b)=>cl((t-a)/(b-a)),lerp=(a,b,p)=>a+(b-a)*p;
const eo=x=>{x=cl(x);return 1-Math.pow(1-x,3)},eio=x=>{x=cl(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2};
const hash=i=>{const x=Math.sin(i*127.1+11.7)*43758.5453;return x-Math.floor(x)};
const tv=n=>`var(--dm-${n})`;
function curve(x0,y0,x1,y1,n=40){const a=[],m=(x0+x1)/2;for(let i=0;i<=n;i++){const u=i/n,v=1-u;a.push([v*v*v*x0+3*v*v*u*m+3*v*u*u*m+u*u*u*x1,v*v*v*y0+3*v*v*u*y0+3*v*u*u*y1+u*u*u*y1])}return a}
function roundRectPts(x,y,w,h,r=12){const a=[[x+r,y],[x+w-r,y]];const arc=(cx,cy,s)=>{for(let i=1;i<=6;i++){const q=s+i/6*Math.PI/2;a.push([cx+r*Math.cos(q),cy+r*Math.sin(q)])}};arc(x+w-r,y+r,-Math.PI/2);a.push([x+w,y+h-r]);arc(x+w-r,y+h-r,0);a.push([x+r,y+h]);arc(x+r,y+h-r,Math.PI/2);a.push([x,y+r]);arc(x+r,y+r,Math.PI);return a}
function pointAt(pts,p){const n=pts.length-1,e=cl(p)*n,k=Math.min(Math.floor(e),n-1),f=e-k;return[lerp(pts[k][0],pts[k+1][0],f),lerp(pts[k][1],pts[k+1][1],f)]}

/* 그리기 도구: 글자와 선은 SVG 노드라 테마 변수를 그대로 따른다 */
function Kit(slide){
  const svg=document.createElementNS(NS,'svg');svg.setAttribute('class','dm-svg');svg.setAttribute('viewBox','0 0 1920 1080');slide.appendChild(svg);
  const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);(parent||svg).appendChild(e);return e};
  const fits=[];
  const kit={svg,mk,
    group(attrs){return mk('g',attrs||{})},
    line(pts,o={}){const d='M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L');
      const e=mk('path',{d,fill:'none','stroke-width':o.w||3,'stroke-linecap':'round','stroke-linejoin':'round',pathLength:1,'stroke-dasharray':'1 1','stroke-dashoffset':1},o.parent);e.style.stroke=tv(o.tone||'mut');
      return{node:e,pts,draw(p,a=1){e.style.visibility=p<=0||a<=0?'hidden':'visible';e.setAttribute('stroke-dashoffset',1-cl(p));e.style.opacity=a},at:p=>pointAt(pts,p)}},
    fill(x,y,w,h,o={}){const e=mk('rect',{x,y,width:w,height:h,rx:o.r==null?12:o.r},o.parent);e.style.fill=tv(o.tone||'accent');e.style.opacity=0;return{node:e,show(a){e.style.opacity=a},tone(t){e.style.fill=tv(t)}}},
    text(s,x,y,o={}){const e=mk('text',{x,y,'font-size':o.size||28,'font-weight':o.weight||500,'text-anchor':o.anchor||'start'},o.parent);e.style.fill=tv(o.tone||'fg');e.textContent=s;e.style.opacity=0;if(o.cls)e.classList.add(o.cls);
      const h={node:e,show(a){e.style.opacity=a},set(v){e.textContent=v},tone(t){e.style.fill=tv(t)},move(nx,ny){e.setAttribute('x',nx);e.setAttribute('y',ny)}};
      if(o.fit){h.fit=o.fit;fits.push({h,s,x,y,size:o.size||28,w:o.fit,min:o.min||17})}return h},
    dot(x,y,r,o={}){const e=mk('circle',{cx:x,cy:y,r},o.parent);e.style.fill=tv(o.tone||'accent');e.style.opacity=0;return{node:e,set(nx,ny,nr,a){e.setAttribute('cx',nx);e.setAttribute('cy',ny);if(nr!=null)e.setAttribute('r',Math.max(0,nr));if(a!=null)e.style.opacity=a},tone(t){e.style.fill=tv(t)}}},
    refit(){fits.forEach(f=>{const e=f.h.node;e.textContent=f.s;e.setAttribute('font-size',f.size);let size=f.size;
      const measure=()=>e.getComputedTextLength();
      while(measure()>f.w&&size>f.min){size-=1;e.setAttribute('font-size',size)}
      if(measure()>f.w&&/\s/.test(f.s)){const words=f.s.split(/\s+/);let best=1,bd=1e9;for(let i=1;i<words.length;i++){const d=Math.abs(words.slice(0,i).join(' ').length-words.slice(i).join(' ').length);if(d<bd){bd=d;best=i}}
        const l1=words.slice(0,best).join(' '),l2=words.slice(best).join(' ');e.textContent='';[[l1,-size*.55],[l2,size*1.15]].forEach(([tx,dy],k)=>{const sp=mk('tspan',{x:f.x,dy:k?dy:dy},e);sp.textContent=tx})}
    })}
  };
  return kit;
}

/* 제목: 비트마다 제목과 부제를 바꿀 수 있다 */
function Head(kit,data,beatStarts){
  const items=[];const list=(data.beats||[]).map(b=>b&&(b.title||b.sub)?b:null);
  if(data.kicker)items.push({n:kit.text(data.kicker,110,86,{size:26,weight:600,tone:'accent'}),a:0,b:null});
  const add=(title,sub,a,b)=>{if(title)items.push({n:kit.text(title,110,150,{size:56,weight:800,cls:'dm-title'}),a,b});if(sub)items.push({n:kit.text(sub,110,200,{size:26,tone:'mut'}),a,b})};
  const starts=[];list.forEach((b,i)=>{if(b)starts.push({i,b})});
  if(!starts.length||starts[0].i>0)add(data.title,data.sub,0,starts.length?beatStarts[starts[0].i]:null);
  starts.forEach((s,k)=>add(s.b.title||data.title,s.b.sub||'',beatStarts[s.i],k+1<starts.length?beatStarts[starts[k+1].i]:null));
  if(data.badge){const w=Math.max(150,data.badge.length*24+36);const pill=kit.mk('rect',{x:1810-w,y:62,width:w,height:44,rx:22,fill:'none','stroke-width':2});pill.style.stroke=tv('dim');const t=kit.text(data.badge,1810-w/2,92,{size:23,weight:600,tone:'mut',anchor:'middle'});t.show(1)}
  return{draw(t){items.forEach(o=>{const inn=o.a===0?eo(seg(t,0,.4)):eo(seg(t,o.a+.1,o.a+.5));const out=o.b==null?0:eo(seg(t,o.b+.01,o.b+.25));o.n.show(inn*(1-out))})}};
}
const starts=beats=>{const a=[];let s=0;beats.forEach(d=>{a.push(s);s+=d});return a};

/* 시간선: 축이 그려지고 점이 쌓임 → 이어진 일 연결 → 종류별 재배열 */
function timeline(slide,data,kit){
  const P=data.periods,G=data.groups||[],items=data.items||[],links=data.links||[];
  const beats=[Math.min(4,1.6+P.length*.12)];const idx={base:0};if(links.length){idx.links=beats.length;beats.push(2)}if(data.regroup!==false&&G.length){idx.group=beats.length;beats.push(2.2)}
  const st=starts(beats),head=Head(kit,data,st);
  const AX0=150,AX1=1770,AXY=data.marks?790:840,TOP=280;const px=i=>AX0+70+i*(AX1-AX0-140)/Math.max(1,P.length-1);
  const stack=P.map(()=>0);items.forEach(d=>{d._r=stack[d.period]++});const maxS=Math.max(1,...stack);
  const pitch=Math.min(40,(AXY-34-TOP)/maxS),R=Math.max(5,pitch*.34);
  const cnt=G.map(()=>0);items.forEach(d=>{d._gi=cnt[d.group]++});const maxG=Math.max(1,...cnt);
  const rowH=Math.min(104,560/Math.max(1,G.length)),dx=Math.min(R*2.8,(1770-500)/maxG);
  const axis=kit.line([[AX0,AXY],[AX1,AXY]],{w:3,tone:'mut'});
  const labels=P.map((m,i)=>kit.text(m,px(i),AXY+44,{size:26,tone:'mut',anchor:'middle'}));
  const marks=(data.marks||[]).map(m=>({m,n:kit.text(m.label,px(m.period),AXY+88,{size:23,weight:600,anchor:'middle',tone:m.tone||'fg'})}));
  const legend=G.map((g,i)=>{const x=1010+i*(800/Math.max(G.length,5));return{d:kit.dot(x,178,10,{tone:g.tone||`c${i+1}`}),t:kit.text(g.name,x+20,187,{size:25,tone:'mut'})}});
  const gl=G.map((g,i)=>({n:kit.text(g.name,170,300+i*rowH+13,{size:36,weight:700,tone:g.tone||`c${i+1}`}),c:kit.text(cnt[i]+'건',470,300+i*rowH+11,{size:30,weight:600,anchor:'end'})}));
  const chains=links.map(l=>{const nodes=l.items.map(id=>items.find(x=>x.id===id)).filter(Boolean);return{l,nodes}});
  const dotXY=d=>[px(d.period),AXY-34-d._r*pitch];
  const nodeSet=new Set();chains.forEach(c=>c.nodes.forEach(n=>nodeSet.add(n)));
  chains.forEach((c,ci)=>{const pts=[];for(let i=0;i<c.nodes.length-1;i++){const a=dotXY(c.nodes[i]),b=dotXY(c.nodes[i+1]);pts.push(...curve(a[0],a[1],b[0],b[1],20))}c.line=pts.length?kit.line(pts,{w:5,tone:c.l.tone||'accent'}):null;const e=pts.length?pts[pts.length-1]:[0,0];const topY=pts.length?Math.min(...pts.slice(-Math.ceil(pts.length*.35)).map(q=>q[1])):0;c.label=kit.text(c.l.name,e[0]+10,topY-34,{size:28,weight:700,anchor:'end',tone:c.l.tone||'accent'})});
  const D=items.map((d,i)=>{const[x,y]=dotXY(d);return{d,x,y,n:kit.dot(x,y,R,{tone:G[d.group]&&G[d.group].tone||`c${d.group+1}`}),rnd:hash(i+1),tx:500+d._gi*dx,ty:300+d.group*rowH}});
  return{beats,draw(t){head.draw(t);
    const b0=beats[0],rev=idx.group!=null?seg(t,st[idx.group],st[idx.group]+.4):0,grp=idx.group!=null?seg(t,st[idx.group],st[idx.group]+beats[idx.group]):0;
    const hl=idx.links!=null?seg(t,st[idx.links],st[idx.links]+.4)*(1-rev):0;
    axis.draw(eio(seg(t,0,b0*.45)),1-rev);
    labels.forEach((l,i)=>l.show(eo(seg(t,i*.09,i*.09+.4))*(1-rev)));
    marks.forEach(m=>m.n.show(eo(seg(t,b0*.8,b0))*(1-rev)));
    legend.forEach(o=>{const a=eo(seg(t,.6,1.1))*(1-rev);o.d.set(+o.d.node.getAttribute('cx'),+o.d.node.getAttribute('cy'),null,a);o.t.show(a)});
    D.forEach(o=>{const s=.2+(o.d.period/Math.max(1,P.length))*(b0*.6)+o.d._r*.025,inn=eo(seg(t,s,s+.4));const on=nodeSet.has(o.d);
      let a=inn*(on?1:1-.72*hl);const p=grp>0?eio(seg(grp,o.rnd*.4,o.rnd*.4+.6)):0;if(p>0)a=lerp(a,1,p);
      o.n.set(lerp(o.x,o.tx,p),lerp(o.y,o.ty,p)-Math.sin(p*Math.PI)*40*o.rnd,R*inn,a)});
    if(idx.links!=null)chains.forEach((c,i)=>{const s=st[idx.links]+i*.25,p=eio(seg(t,s,s+beats[idx.links]*.75));if(c.line)c.line.draw(p,1-rev);c.label.show(seg(t,s+beats[idx.links]*.6,s+beats[idx.links]*.85)*(1-rev))});
    gl.forEach(o=>{const a=idx.group!=null?eo(seg(t,st[idx.group]+.7,st[idx.group]+1.4)):0;o.n.show(a);o.c.show(a)});
  }};
}

/* 지도: 칸이 그려짐 → 등급 색이 채워짐 → 바깥 항목 → 투표 */
function map(slide,data,kit){
  const C=data.columns,L=data.levels||[];const beats=[2];const idx={};idx.fill=1;beats.push(2.2);if(data.outside&&data.outside.items&&data.outside.items.length){idx.out=beats.length;beats.push(2.2)}if(data.votes){idx.vote=beats.length;beats.push(2.6)}
  const st=starts(beats),head=Head(kit,data,st);
  const hasOut=idx.out!=null,X0=110,X1=1810,TOP=292,BOT=hasOut||data.votes?842:930,GP=12;
  const n=C.length,cw=(X1-X0-(n-1)*GP)/n,maxR=Math.max(...C.map(c=>c.cells.length)),ch=Math.min(128,(BOT-TOP-(maxR-1)*10)/maxR);
  const lvl={};L.forEach((l,i)=>lvl[l.key]=Object.assign({i},l));
  const strength=[.95,.55,.26,0];const cnts={};L.forEach(l=>cnts[l.key]=0);
  const cells=[];C.forEach((c,ci)=>{const x=X0+ci*(cw+GP);c._h=kit.text(c.name,x+cw/2,TOP-20,{size:29,weight:700,anchor:'middle',fit:cw-10});
    c.cells.forEach((cell,r)=>{const y=TOP+r*(ch+10),l=lvl[cell.level]||{i:3,tone:'dim'},f=kit.fill(x,y,cw,ch,{tone:l.tone||'accent'});const frame=kit.line(roundRectPts(x,y,cw,ch,12).concat([[x+12,y]]),{w:2,tone:'dim'});
      const tx=kit.text(cell.name,x+cw/2,y+ch/2+Math.min(9,ch*.16),{size:Math.min(25,ch*.44),weight:600,anchor:'middle',fit:cw-18,tone:'mut'});
      cnts[cell.level]=(cnts[cell.level]||0)+1;cells.push({ci,r,x,y,cell,l,f,frame,tx,name:cell.name,order:ci*.6+r})})});
  const counts=L.map((l,i)=>{const x=1810-(L.length-i)*178;return{d:kit.dot(x,178,11,{tone:l.tone||'accent'}),t:kit.text(l.label,x+20,187,{size:25,tone:'mut'}),n:kit.text('0',x+128,187,{size:29,weight:800,anchor:'end'}),l,final:cnts[l.key]||0,x}});
  const out=hasOut?{frame:kit.line(roundRectPts(X0-22,TOP-62,X1-X0+44,BOT-TOP+84,18).concat([[X0-4,TOP-62]]),{w:3,tone:'warn'}),title:kit.text(data.outside.title||'',X0,BOT+64,{size:30,weight:700,tone:'warn'}),
    items:(()=>{let x=X0+(data.outside.title?data.outside.title.length*32+24:0);return data.outside.items.map(s=>{const w=s.length*25+40,r=kit.mk('rect',{x,y:BOT+30,width:w,height:48,rx:24,fill:'none','stroke-width':2});r.style.stroke=tv('warn');r.style.opacity=0;const t=kit.text(s,x+w/2,BOT+63,{size:25,weight:600,tone:'fg',anchor:'middle'});const o={r,t};x+=w+14;return o})})()}:null;
  const vd=[];const vb=[];if(data.votes){let id=0;Object.entries(data.votes).forEach(([name,count])=>{const c=cells.find(v=>v.name===name);if(!c)return;const bx=c.x+cw-8,by=c.y+6,badge=kit.dot(bx,by,20,{tone:'warn'}),num=kit.text('0',bx,by+8,{size:23,weight:800,anchor:'middle',tone:'on'});vb.push({c,badge,num,count,bx,by,arr:[]});for(let i=0;i<count;i++){const n=kit.dot(960,1060,9,{tone:'warn'});const o={n,id:id++,c,bx,by,s:hash(id*13)};vd.push(o);vb[vb.length-1].arr.push(o)}})}
  const voteNote=data.voteNote?kit.text(data.voteNote,X0,BOT+64+(hasOut?70:0),{size:30,weight:700,tone:'warn'}):null;
  return{beats,draw(t){head.draw(t);
    const oTot=C.reduce((a,c)=>a+c.cells.length,0);
    C.forEach((c,i)=>c._h.show(eo(seg(t,i*.08,i*.08+.4))));
    const fs=st[idx.fill],fd=beats[idx.fill];
    cells.forEach((c,k)=>{const s=.1+(k/oTot)*1.1,dr=eio(seg(t,s,s+.7));c.frame.draw(dr);const p=eio(seg(t,fs+(k/oTot)*(fd*.6),fs+(k/oTot)*(fd*.6)+.45));
      const st0=c.l.i!=null?strength[Math.min(c.l.i,3)]:0;c.f.show(p*st0);c.tx.show(eo(seg(t,s+.35,s+.75)));c.tx.tone(p>.5&&c.l.i===0?'on':p>.5&&c.l.i===1?'fg':'mut')});
    counts.forEach(o=>{const a=eo(seg(t,fs,fs+.4));o.d.set(o.x,178,null,a*(strength[Math.min(o.l.i==null?L.indexOf(o.l):o.l.i,3)]||.26));o.t.show(a);o.n.show(a);const done=cells.filter((c,k)=>c.cell.level===o.l.key&&t>=fs+(k/oTot)*(fd*.6)+.25).length;o.n.set(String(done))});
    if(out){const s=st[idx.out],d=beats[idx.out];out.frame.draw(eio(seg(t,s,s+d*.55)));out.title.show(eo(seg(t,s+.3,s+.8)));out.items.forEach((o,i)=>{const a=eo(seg(t,s+.5+i*.2,s+.9+i*.2));o.r.style.opacity=a;o.t.show(a)})}
    if(idx.vote!=null){const s=st[idx.vote];vd.forEach(o=>{const a=s+.2+o.s*1.7,p=eio(seg(t,a,a+.55));o.n.set(lerp(960,o.bx,p),lerp(1060,o.by,p),9*(1-.5*seg(p,.8,1)),p>0&&p<1?1:0)});
      vb.forEach(b=>{const k=b.arr.filter(o=>t>=s+.2+o.s*1.7+.55).length;b.badge.set(b.bx,b.by,20,k>0?1:0);b.num.set(String(k));b.num.show(k>0?1:0)});
      if(voteNote)voteNote.show(eo(seg(t,s+2,s+2.5)))}
  }};
}

/* 구조와 흐름: 상자와 연결선이 순서대로 그려지고 입자가 흐름 */
function flow(slide,data,kit){
  if(data.style==='sketch'){slide.classList.add('dm-sketch');const defs=kit.mk('defs',{});const f=kit.mk('filter',{id:'dmRough',x:'-5%',y:'-5%',width:'110%',height:'110%'},defs);kit.mk('feTurbulence',{type:'fractalNoise',baseFrequency:.018,numOctaves:2,seed:7},f);kit.mk('feDisplacementMap',{in:'SourceGraphic',scale:8},f)}
  const B=data.beats&&data.beats.length?data.beats:[{}];const N=data.nodes,byId={};N.forEach(n=>byId[n.id]=n);
  const sk=data.style==='sketch';const nw=data.nodeW||(sk?340:300),nh=data.nodeH||(sk?150:84),cols=Math.max(...N.map(n=>n.col))+1;
  const X0=110,X1=1810,T=data.top||280,Bt=data.bottom||880;
  const colX=c=>cols===1?(X0+X1-nw)/2:X0+c*(X1-X0-nw)/(cols-1);
  for(let c=0;c<cols;c++){const m=N.filter(n=>n.col===c);m.forEach((n,i)=>{const rows=m.length;n.x=colX(c);n.y=n.row!=null?T+n.row*(Bt-T):rows===1?(T+Bt)/2:T+nh/2+i*((Bt-T-nh)/(rows-1));n.h=n.h||nh})}
  const edgesAll=(data.edges||[]).map(e=>{const a=byId[e.from],b=byId[e.to];return Object.assign({},e,{a,b,pts:curve(a.x+nw,a.y,b.x,b.y,40)})});
  const beats=B.map((b,i)=>b.dur||(i===0?2.6:2.2));const st=starts(beats),head=Head(kit,Object.assign({},data,{beats:B}),st);
  const g=kit.group(data.style==='sketch'?{filter:'url(#dmRough)'}:{});
  const showAt=new Map(),hideAt=new Map();
  const edgeKey=e=>e.from+'>'+e.to;
  B.forEach((b,i)=>{(b.nodes||[]).forEach(id=>{if(!showAt.has(id))showAt.set(id,i)});(b.edges||[]).forEach(k=>{if(!showAt.has(k))showAt.set(k,i)});(b.hide||[]).forEach(id=>{hideAt.set(id,i)})});
  if(!B[0].nodes)N.forEach(n=>{if(!showAt.has(n.id))showAt.set(n.id,0)});
  if(!B[0].edges)edgesAll.forEach(e=>{if(!showAt.has(edgeKey(e)))showAt.set(edgeKey(e),0)});
  const E=edgesAll.map((e,i)=>{const k=edgeKey(e),tone=e.tone||(e.b.tone||'mut');const ln=kit.line(e.pts,{w:sk?5:1.5+(e.w||1)*1.1,tone:sk&&!e.tone?'fg':tone,parent:g});const sb=showAt.get(k);const hb=hideAt.has(k)?hideAt.get(k):[e.from,e.to].map(x=>hideAt.has(x)?hideAt.get(x):1e9).reduce((a,b)=>Math.min(a,b));return{e,ln,sb:sb==null?1e9:sb,hb,tone,i}});
  const NB=N.map((n,i)=>{const tone=n.tone||(sk?'fg':'dim');const box=kit.line(roundRectPts(n.x,n.y-n.h/2,nw,n.h,sk?22:12).concat([[n.x+(sk?22:12),n.y-n.h/2]]),{w:sk?5:3,tone,parent:g});const tx=kit.text(n.label,n.x+nw/2,n.y+(n.sub?(sk?-6:-4):(sk?16:11)),{size:sk?52:30,weight:sk?700:600,anchor:'middle',fit:nw-28,tone:n.tone&&n.tone!=='dim'?n.tone:'fg'});const sb=n.sub?kit.text(n.sub,n.x+nw/2,n.y+(sk?44:28),{size:sk?34:22,anchor:'middle',tone:sk?'fg':'mut',fit:nw-24,weight:sk?700:500}):null;return{n,box,tx,sb,beat:showAt.has(n.id)?showAt.get(n.id):0,hb:hideAt.has(n.id)?hideAt.get(n.id):1e9,order:i}});
  const P=[];E.forEach(o=>{const c=Math.round(6+(o.e.w||1)*6);for(let i=0;i<c;i++)P.push({o,ph:hash(o.i*17+i*3+1),n:kit.dot(0,0,5,{tone:o.tone})})});
  const partFrom=B.findIndex(b=>b.particles);
  const notes=[];B.forEach((b,i)=>{if(b.note){const x=b.note.x||1810,y=b.note.y||1020,anchor=b.note.anchor||'end';const big=b.note.big?kit.text(b.note.big,x,y-44,{size:84,weight:800,anchor,tone:b.note.tone||'warn'}):null;const tx=b.note.text?kit.text(b.note.text,x,y,{size:26,anchor,tone:'mut'}):null;notes.push({i,big,tx})}});
  return{beats,draw(t){head.draw(t);const dtBeat=b=>st[b];
    NB.forEach((o,i)=>{const s=dtBeat(o.beat)+.1+(i%8)*.09,dr=eio(seg(t,s,s+.65));const out=o.hb<1e9?eo(seg(t,st[o.hb],st[o.hb]+.5)):0;o.box.draw(dr,1-out);o.tx.show(seg(dr,.5,1)*(1-out));if(o.sb)o.sb.show(seg(dr,.6,1)*(1-out))});
    E.forEach((o,i)=>{if(o.sb>=1e9)return o.ln.draw(0);const s=dtBeat(o.sb)+.5+(i%12)*.07,dr=eio(seg(t,s,s+.85));const out=o.hb<1e9?eo(seg(t,st[o.hb],st[o.hb]+.5)):0;o.ln.draw(dr,(data.edgeAlpha||(sk?1:.55))*(1-out))});
    P.forEach(p=>{const o=p.o;if(partFrom<0||o.sb>=1e9||o.hb<=partFrom&&t>=st[o.hb]+.5){p.n.set(0,0,0,0);return}
      const start=Math.max(st[partFrom],st[o.sb]+.8);const out=o.hb<1e9?1-eo(seg(t,st[o.hb],st[o.hb]+.4)):1;const a=seg(t,start,start+.4)*out;if(a<=0){p.n.set(0,0,0,0);return}
      const u=((t*.28+p.ph)%1+1)%1,xy=o.ln.at(u);p.n.set(xy[0],xy[1],5,a*.95)});
    notes.forEach(o=>{const s=st[o.i]+.5;const nx=o.i+1<B.length?1-eo(seg(t,st[o.i+1],st[o.i+1]+.3)):1;if(o.big)o.big.show(eo(seg(t,s,s+.5))*nx);if(o.tx)o.tx.show(eo(seg(t,s+.15,s+.65))*nx)});
  }};
}

/* 카드: row는 나란히 차례로, carousel은 3D 줄을 넘겨 마지막 카드를 뒤집음 */
function card(c){const e=document.createElement('div');e.className='dm-card';e.innerHTML=(c.tag?`<div class="dm-tag"></div>`:'')+`<h3></h3>`+(c.text?`<p></p>`:'');if(c.tag)e.querySelector('.dm-tag').textContent=c.tag;e.querySelector('h3').textContent=c.title||'';if(c.text)e.querySelector('p').textContent=c.text;return e}
function cards(slide,data,kit){
  const C=data.cards,mode=data.mode||'row';
  if(mode==='carousel'){
    const hasR=!!data.reveal;const beats=[1.7,Math.max(1.8,C.length*.7)];if(hasR)beats.push(1.5);const st=starts(beats),head=Head(kit,data,st);
    const wrap=document.createElement('div');wrap.className='dm-stage3d';slide.appendChild(wrap);
    const all=C.slice();if(hasR)all.push({_q:true});
    const W=400,H=520;const E=all.map(c=>{const f=document.createElement('div');f.className='dm-flipwrap';f.style.cssText=`left:${960-W/2}px;top:50px;width:${W}px;height:${H}px`;if(c._q){const q=document.createElement('div');q.className='dm-card dm-q';q.textContent='?';const b=card(data.reveal);b.classList.add('dm-back');f.append(q,b)}else f.appendChild(card(c));wrap.appendChild(f);return f});
    const last=all.length-1;
    return{beats,draw(t){head.draw(t);const ff=last*eio(seg(t,st[1],st[1]+beats[1]-.1));
      E.forEach((e,i)=>{const d=i-ff,ad=Math.abs(d),inn=eo(seg(t,i*.14,i*.14+.8));const x=d*335+Math.sign(d)*Math.min(ad,1)*90,ry=Math.max(-52,Math.min(52,-d*40)),z=-Math.min(ad,3)*150+(ad<.5?(.5-ad)*120:0);const flip=hasR&&i===last?180*eio(seg(t,st[2]+.1,st[2]+beats[2])):0;
        e.style.transform=`translateX(${x.toFixed(1)}px) translateY(${((1-inn)*90).toFixed(1)}px) translateZ(${z.toFixed(1)}px) rotateY(${(ry+flip).toFixed(1)}deg)`;e.style.opacity=inn*(ad>3.2?Math.max(0,1-(ad-3.2)):1);e.style.zIndex=100-Math.round(ad*10);e.querySelectorAll('.dm-card').forEach(x=>x.style.filter=`brightness(${(1-Math.min(ad,2)*.2).toFixed(2)})`)})}};
  }
  const perBeat=data.perBeat!==false,beats=perBeat?C.map((_,i)=>i===0?1.4:1.1):[1.6+C.length*.2];const st=starts(beats),head=Head(kit,data,st);
  const X0=110,X1=1810,GP=28,H=data.height||460,T=Math.round(250+(800-H)/2),W=(X1-X0-(C.length-1)*GP)/C.length;
  const E=C.map((c,i)=>{const x=X0+i*(W+GP),e=card(c);e.style.cssText=`left:${x}px;top:${T}px;width:${W}px;height:${H}px`;slide.appendChild(e);const fr=kit.line(roundRectPts(x,T,W,H,22).concat([[x+22,T]]),{w:3,tone:c.tone||'dim'});return{e,fr}});
  const at=i=>perBeat?st[i]+.05:i*.2;
  return{beats,draw(t){head.draw(t);E.forEach((o,i)=>{const s=at(i);o.fr.draw(eio(seg(t,s,s+.8)));const a=eo(seg(t,s+.35,s+.85));o.e.style.opacity=a;o.e.style.transform=`translateY(${((1-a)*16).toFixed(1)}px)`})}};
}

/* 점 단위 숫자: 점이 채워짐 → 일부가 강조 → 다른 단위로 모임 */
function dots(slide,data,kit){
  const steps=data.steps||[];const beats=[2.3,2.2,2.5].slice(0,Math.max(1,steps.length));const st=starts(beats),head=Head(kit,data,st);
  const cols=data.cols,rows=data.rows,hl=data.highlightRows||0,per=data.gatherPerCol||8;
  const GX=data.x||880,GY=data.y||240,P=Math.min(17,(1810-GX)/cols,(data.gridH||560)/rows);
  const cv=document.createElement('canvas');cv.className='dm-canvas';cv.width=1920;cv.height=1080;slide.insertBefore(cv,kit.svg);const c=cv.getContext('2d');
  const D=[];let k=0;for(let x=0;x<cols;x++)for(let y=0;y<rows;y++)D.push({x:GX+x*P,y:GY+y*P,c:x,r:y,rnd:hash(++k)});
  const M=D.filter(d=>d.r<hl);const TGY=GY+rows*P+70;const tP=Math.min(13.6,(1810-GX)/Math.ceil(M.length/per));M.forEach((d,i)=>{d.tx=GX+Math.floor(i/per)*tP;d.ty=TGY+(i%per)*tP;d.m=i});
  const texts=steps.map((s,i)=>({big:kit.text(s.big,110,520,{size:128,weight:800,tone:i?'accent':'fg',cls:'dm-title'}),sub:(s.sub||'').split('\n').map((l,j)=>kit.text(l,110,590+j*50,{size:36,tone:'mut'}))}));
  const note=data.note?kit.text(data.note,110,990,{size:24,tone:'mut'}):null;const dl=data.gatherLabel?kit.text(data.gatherLabel,GX,TGY-28,{size:24,tone:'mut'}):null;
  return{beats,draw(t){head.draw(t);const cs=getComputedStyle(slide),ac=cs.getPropertyValue('--dm-accent').trim()||'#5b9dff',mut=cs.getPropertyValue('--dm-mut').trim()||'#8b98ad';
    c.clearRect(0,0,1920,1080);const b0=beats[0],sw=beats[1]?eio(seg(t,st[1],st[1]+beats[1]*.85)):0,fly=beats[2]?seg(t,st[2],st[2]+beats[2]*.95):0;const lineY=GY-P/2+sw*hl*P;
    D.forEach(d=>{const s=d.c/cols*1.3+d.rnd*.25,a=eo(seg(t,s,s+.45));if(a<=0)return;const on=d.r<hl&&d.y<lineY;let x=d.x,y=d.y,r=P*.27*a;c.fillStyle=on?ac:mut;c.globalAlpha=(on?1:.42-(fly>0?.24*eo(fly):0))*a;
      if(on){r=P*.3;const p=eio(seg(fly,d.m/M.length*.45,d.m/M.length*.45+.55));if(p>0){const arc=Math.sin(p*Math.PI)*(70+d.rnd*90);x=lerp(d.x,d.tx,p);y=lerp(d.y,d.ty,p)+arc*.35;r=lerp(r,tP*.3,p)}}
      c.beginPath();c.arc(x,y,Math.max(0,r),0,6.2832);c.fill()});c.globalAlpha=1;
    const lo=beats[1]?seg(t,st[1],st[1]+.3)*(1-seg(t,st[1]+beats[1]-.3,st[1]+beats[1])):0;if(lo>0){c.strokeStyle=ac;c.globalAlpha=lo;c.lineWidth=2;c.beginPath();c.moveTo(GX-30,lineY);c.lineTo(GX+cols*P+14,lineY);c.stroke();c.globalAlpha=1}
    texts.forEach((o,i)=>{const a=eo(seg(t,st[i]+.1,st[i]+.6))*(i+1<steps.length&&beats[i+1]?1-eo(seg(t,st[i+1],st[i+1]+.35)):1);o.big.show(a);o.sub.forEach(x=>x.show(a))});
    if(note)note.show(eo(seg(t,.5,1)));if(dl)dl.show(fly>0?eo(seg(fly,.6,.85)):0);
  }};
}

/* 상태 보간: 요소마다 비트별 상태를 주면 그 사이를 이어서 그림. 숫자는 세면서 바뀌고 모양은 늘거나 줄며 옮겨 감.
   요소 type: box(x,y 왼쪽 위, w,h, fill, label, sub, lp, rows/cols/vals면 칸 격자), dot(x,y 중심, r, label), ring(x,y,r,label),
   text(x,y,s 또는 v+d+pre+suf, size, weight, anchor), link(from,to,arrow). 공통 a(투명도), tone.
   비트 set:{id:{상태}}에 처음 나온 요소는 a=1로 나타남. hide:[id]는 사라짐. 비트마다 note 가능. */
const NUMK=['x','y','w','h','r','fill','v','a','size','lw'];
function morph(slide,data,kit){
  const B=data.beats&&data.beats.length?data.beats:[{}];
  const beats=B.map((b,i)=>b.dur||(i===0?2.4:2.2));const st=starts(beats),head=Head(kit,Object.assign({},data,{beats:B}),st);
  const EL=(data.els||[]).map((e,i)=>Object.assign({i},e));const byId={};EL.forEach(e=>byId[e.id]=e);
  EL.forEach(e=>{let cur=Object.assign({a:0},e);e.S=[];e.D=[];
    B.forEach((b,bi)=>{const set=b.set&&b.set[e.id];const prev=Object.assign({},cur);let d=0;
      if(set){const keys=Object.keys(b.set);d=set._d!=null?set._d:Math.min(.6,keys.indexOf(e.id)*(b.stagger==null?.06:b.stagger));cur=Object.assign({},cur,set);if(set.a==null&&prev.a===0)cur.a=1}
      if((b.hide||[]).includes(e.id))cur=Object.assign({},cur,{a:0});
      e.S.push(Object.assign({},cur));e.D.push(d)})});
  const mv=data.move||.9;
  const stateAt=(e,t)=>{let b=0;while(b+1<B.length&&t>=st[b+1])b++;const to=e.S[b];let from=b?e.S[b-1]:Object.assign({},e.S[0],{a:0});if(from.a===0)from=Object.assign({},to,{a:0});
    const p=eio(seg(t,st[b]+e.D[b],st[b]+e.D[b]+mv));const o={};for(const k in to){const A=from[k],Z=to[k];
      if(NUMK.includes(k)&&typeof Z==='number'&&typeof A==='number')o[k]=lerp(A,Z,p);
      else if(k==='vals'&&Array.isArray(Z)){o[k]=Z.map((z,j)=>lerp(A&&A[j]!=null?A[j]:z,z,p))}
      else o[k]=p<.5&&A!==undefined?A:Z}o._p=p;o._new=from.a===0&&to.a>0;return o};
  const g=kit.group({});
  const R=EL.map(e=>{const r={e};
    if(e.type==='box'){r.rect=kit.mk('rect',{rx:e.rx==null?10:e.rx},g);r.cells=[];if(e.rows&&e.cols)for(let k=0;k<e.rows*e.cols;k++)r.cells.push(kit.mk('rect',{rx:2},g));
      r.lb=kit.text('',0,0,{size:e.size||28,weight:e.weight||700,anchor:'middle',parent:g});r.sb=kit.text('',0,0,{size:e.subSize||22,anchor:'middle',tone:'mut',parent:g})}
    else if(e.type==='dot'||e.type==='ring'){r.c=kit.mk('circle',{},g);r.lb=kit.text('',0,0,{size:e.size||26,weight:e.weight||600,anchor:e.type==='ring'?'middle':'start',parent:g})}
    else if(e.type==='text'){r.t=kit.text('',0,0,{size:e.size||28,weight:e.weight||600,anchor:e.anchor||'start',parent:g})}
    else if(e.type==='link'){r.l=kit.mk('path',{fill:'none','stroke-linecap':'round',pathLength:1,'stroke-dasharray':'1 1'},g);r.h=kit.mk('path',{},g)}
    return r});
  const center=(id,t)=>{const e=byId[id],s=stateAt(e,t);if(e.type==='box')return{x:s.x+s.w/2,y:s.y+s.h/2,hw:s.w/2,hh:s.h/2,a:s.a};return{x:s.x,y:s.y,hw:(s.r||10)+6,hh:(s.r||10)+6,a:s.a}};
  const clip=(c,dx,dy)=>{const k=Math.min(dx?c.hw/Math.abs(dx):1e9,dy?c.hh/Math.abs(dy):1e9);return[c.x+dx*k,c.y+dy*k]};
  const notes=[];B.forEach((b,i)=>{if(b.note){const x=b.note.x||1810,y=b.note.y||1020,anchor=b.note.anchor||'end';notes.push({i,big:b.note.big?kit.text(b.note.big,x,y-44,{size:b.note.size||72,weight:800,anchor,tone:b.note.tone||'warn'}):null,tx:b.note.text?kit.text(b.note.text,x,y,{size:26,anchor,tone:'mut'}):null})}});
  const label=s=>s.v!=null?(s.pre||'')+Number(s.v).toFixed(s.d||0).replace(/\B(?=(\d{3})+(?!\d))/g,s.d?'':',')+(s.suf||''):(s.s!=null?s.s:'');
  return{beats,draw(t){head.draw(t);
    R.forEach(r=>{const e=r.e,s=stateAt(e,t),a=Math.max(0,s.a),tone=tv(s.tone||e.tone||'mut');
      if(e.type==='box'){const vis=a>.001?'visible':'hidden';r.rect.setAttribute('x',s.x);r.rect.setAttribute('y',s.y);r.rect.setAttribute('width',Math.max(0,s.w));r.rect.setAttribute('height',Math.max(0,s.h));
        r.rect.style.visibility=vis;r.rect.style.fill=tone;r.rect.style.fillOpacity=(s.fill==null?.12:s.fill);r.rect.style.stroke=tone;r.rect.style.strokeWidth=s.lw==null?2.5:s.lw;r.rect.style.opacity=a;
        if(r.cells.length){const gp=e.gap==null?3:e.gap,cw=(s.w-gp*(e.cols+1))/e.cols,ch=(s.h-gp*(e.rows+1))/e.rows;r.cells.forEach((c,k)=>{const i=Math.floor(k/e.cols),j=k%e.cols,v=s.vals?s.vals[k]:.5;
          c.setAttribute('x',s.x+gp+j*(cw+gp));c.setAttribute('y',s.y+gp+i*(ch+gp));c.setAttribute('width',Math.max(0,cw));c.setAttribute('height',Math.max(0,ch));c.style.visibility=vis;c.style.fill=tv(s.cellTone||s.tone||e.tone||'accent');c.style.opacity=a*(.08+.92*cl(v))})}
        const lp=s.lp||'in',fs=+r.lb.node.getAttribute('font-size');let lx=s.x+s.w/2,ly=s.y+s.h/2+fs*.35,anc='middle';
        if(lp==='top')ly=s.y-(s.sub?44:16);else if(lp==='bottom')ly=s.y+s.h+fs+8;else if(lp==='left'){lx=s.x-18;anc='end'}else if(lp==='right'){lx=s.x+s.w+18;anc='start'}else if(s.sub)ly-=fs*.45;
        r.lb.node.setAttribute('text-anchor',anc);r.sb.node.setAttribute('text-anchor',anc);r.lb.move(lx,ly);r.lb.set(label(s.label!=null?{s:s.label}:{}));r.lb.tone(s.ltone||(s.tone&&s.tone!=='dim'?s.tone:'fg'));r.lb.show(a);
        if(s.sub!=null){r.sb.move(lx,lp==='top'?s.y-14:ly+30);r.sb.set(s.sub);r.sb.show(a)}else r.sb.show(0)}
      else if(e.type==='dot'||e.type==='ring'){r.c.setAttribute('cx',s.x);r.c.setAttribute('cy',s.y);r.c.setAttribute('r',Math.max(0,s.r||12));r.c.style.opacity=a;
        if(e.type==='dot'){r.c.style.fill=tone;r.c.style.stroke='none'}else{r.c.style.fill=tone;r.c.style.fillOpacity=s.fill==null?.06:s.fill;r.c.style.stroke=tone;r.c.style.strokeWidth=s.lw||2.5}
        if(s.label){r.lb.node.setAttribute('text-anchor',e.type==='ring'?'middle':s.lp==='left'?'end':'start');if(e.type==='dot')r.lb.move(s.lp==='left'?s.x-(s.r||12)-12:s.x+(s.r||12)+12,s.y+9);else r.lb.move(s.x,s.y-(s.r||12)-14);r.lb.set(s.label);r.lb.tone(s.ltone||(e.type==='dot'?'fg':(s.tone||'fg')));r.lb.show(a)}else r.lb.show(0)}
      else if(e.type==='text'){r.t.move(s.x,s.y);r.t.node.setAttribute('font-size',s.size||e.size||28);r.t.set(label(s));r.t.tone(s.tone||'fg');r.t.show(a)}
      else if(e.type==='link'){const A=center(s.from||e.from,t),Z=center(s.to||e.to,t);const dx=Z.x-A.x,dy=Z.y-A.y,L=Math.hypot(dx,dy)||1;const p0=clip(A,dx/L,dy/L),p1=clip(Z,-dx/L,-dy/L);
        r.l.setAttribute('d',`M${p0[0].toFixed(1)} ${p0[1].toFixed(1)}L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`);r.l.style.stroke=tone;r.l.style.strokeWidth=s.lw||3;
        const grow=s._new?s._p:1;r.l.setAttribute('stroke-dashoffset',1-grow);const la=a*Math.min(A.a,Z.a)>.001?a:0;r.l.style.opacity=la;r.l.style.visibility=la>0?'visible':'hidden';
        if(s.arrow){const ux=dx/L,uy=dy/L,hx=p1[0],hy=p1[1],k=14;r.h.setAttribute('d',`M${hx} ${hy}L${hx-ux*k-uy*k*.6} ${hy-uy*k+ux*k*.6}L${hx-ux*k+uy*k*.6} ${hy-uy*k-ux*k*.6}Z`);r.h.style.fill=tone;r.h.style.opacity=grow>.95?la:0}else r.h.style.opacity=0}});
    notes.forEach(o=>{const s=st[o.i]+.5;const nx=o.i+1<B.length?1-eo(seg(t,st[o.i+1],st[o.i+1]+.3)):1;if(o.big)o.big.show(eo(seg(t,s,s+.5))*nx);if(o.tx)o.tx.show(eo(seg(t,s+.15,s+.65))*nx)});
  }};
}

/* 막대: 행마다 계열별 막대. 비트마다 값을 주면 길이와 숫자가 바뀜. kind:"mark"인 계열은 목표선. pick은 한 행 강조, tags는 행 오른쪽 글 */
function bars(slide,data,kit){
  const rows=data.rows,S=data.series,B=data.beats||[{}],max=data.max||1,dec=data.decimals==null?2:data.decimals;
  const hasTags=B.some(b=>b.tags),T=data.top||300,Bt=data.bottom||880,LX=data.labelW||560,X0=LX+40,X1=hasTags?(data.barEnd||1240):(data.barEnd||1600);
  const band=(Bt-T)/rows.length,bars_=S.filter(s=>s.kind!=='mark'),bh=Math.min(data.barH||54,(band*.72-(bars_.length-1)*10)/bars_.length);
  const sc=v=>Math.max(0,v)/max*(X1-X0);
  const els=[],bt=B.map(b=>({title:b.title,sub:b.sub,dur:b.dur,note:b.note,set:{},hide:[]}));
  rows.forEach((r,i)=>{const y0=T+i*band+(band-(bars_.length*bh+(bars_.length-1)*10))/2;
    els.push({id:`r${i}`,type:'text',x:110,y:y0+(r.sub?bh*.5:bh*.5+12),size:34,weight:700,s:r.label});if(r.sub)els.push({id:`rs${i}`,type:'text',x:110,y:y0+bh*.5+38,size:23,weight:500,tone:'mut',s:r.sub});
    els.push({id:`base${i}`,type:'box',x:X0,y:y0-8,w:2,h:bars_.length*bh+(bars_.length-1)*10+16,fill:1,lw:0,tone:'dim'});
    els.push({id:`fr${i}`,type:'box',x:96,y:T+i*band+6,w:1730,h:band-12,fill:.06,lw:2.5,tone:'accent'});
    bars_.forEach((s,k)=>{const y=y0+k*(bh+10);els.push({id:`b${i}_${s.key}`,type:'box',x:X0,y,w:0,h:bh,fill:.85,lw:0,rx:6,tone:s.tone||'accent'});els.push({id:`v${i}_${s.key}`,type:'text',x:X0+14,y:y+bh*.5+11,size:30,weight:800,d:dec,v:0,tone:s.tone||'accent'})});
    S.filter(s=>s.kind==='mark').forEach(s=>{els.push({id:`m${i}_${s.key}`,type:'box',x:X0,y:y0-14,w:6,h:bars_.length*bh+(bars_.length-1)*10+28,fill:1,lw:0,rx:3,tone:s.tone||'warn'});els.push({id:`ml${i}_${s.key}`,type:'text',x:X0,y:y0-24,size:22,weight:700,anchor:'middle',tone:s.tone||'warn',s:''})});
    els.push({id:`tg${i}`,type:'text',x:1810,y:y0+(bars_.length*bh+(bars_.length-1)*10)/2+10,size:27,weight:600,anchor:'end',tone:'fg',s:''})});
  S.forEach((s,k)=>{const x=1810-(S.length-k)*260;els.push({id:`lgd${k}`,type:'box',x,y:166,w:s.kind==='mark'?6:26,h:26,fill:1,lw:0,rx:s.kind==='mark'?3:5,tone:s.tone||(s.kind==='mark'?'warn':'accent')});els.push({id:`lgt${k}`,type:'text',x:x+40,y:188,size:24,weight:500,tone:'mut',s:s.label})});
  let shown=new Set();const markAt={};
  B.forEach((b,bi)=>{const set=bt[bi].set;
    if(bi===0){rows.forEach((r,i)=>{set[`r${i}`]={};if(r.sub)set[`rs${i}`]={};set[`base${i}`]={a:.8}})}
    Object.entries(b.values||{}).forEach(([key,vals])=>{const s=S.find(x=>x.key===key);if(!s)return;const k=S.indexOf(s);if(!shown.has(key)){set[`lgd${k}`]={};set[`lgt${k}`]={};shown.add(key)}
      vals.forEach((v,i)=>{if(v==null)return;if(s.kind==='mark'){markAt[i]=v;set[`m${i}_${key}`]={x:X0+sc(v)-3};set[`ml${i}_${key}`]={x:X0+sc(v),s:s.markLabel||label(v)}}else{set[`b${i}_${key}`]={w:sc(v)};const mk=markAt[i]!=null&&markAt[i]>v&&sc(markAt[i])-sc(v)<110?sc(markAt[i])+6:sc(v);set[`v${i}_${key}`]={x:X0+mk+14,v}}})});
    if(b.pick!=null){rows.forEach((r,i)=>{const on=i===b.pick;set[`r${i}`]=Object.assign(set[`r${i}`]||{},{a:on?1:.35,tone:on?'warn':'fg'});if(r.sub)set[`rs${i}`]={a:on?1:.35};bars_.forEach(s=>{set[`b${i}_${s.key}`]=Object.assign(set[`b${i}_${s.key}`]||{},{a:on?1:.3});set[`v${i}_${s.key}`]=Object.assign(set[`v${i}_${s.key}`]||{},{a:on?1:.35})})});set[`fr${b.pick}`]={a:1};const pp=B.slice(0,bi).reverse().find(x=>x.pick!=null);if(pp&&pp.pick!==b.pick&&B[bi-1].pick!=null)bt[bi].hide.push(`fr${pp.pick}`)}
    else if(bi>0&&B[bi-1].pick!=null){rows.forEach((r,i)=>{set[`r${i}`]=Object.assign(set[`r${i}`]||{},{a:1,tone:'fg'});if(r.sub)set[`rs${i}`]={a:1};bars_.forEach(s=>{set[`b${i}_${s.key}`]=Object.assign(set[`b${i}_${s.key}`]||{},{a:1});set[`v${i}_${s.key}`]=Object.assign(set[`v${i}_${s.key}`]||{},{a:1})})});bt[bi].hide.push(`fr${B[bi-1].pick}`)}
    if(b.tags)b.tags.forEach((s,i)=>{if(s==null||s==='')bt[bi].hide.push(`tg${i}`);else set[`tg${i}`]={s,a:1}});
    if(b.hide)b.hide.forEach(key=>rows.forEach((r,i)=>bt[bi].hide.push(`b${i}_${key}`,`v${i}_${key}`,`m${i}_${key}`,`ml${i}_${key}`)))});
  els.push(...(data.els||[]));B.forEach((b,bi)=>{Object.assign(bt[bi].set,b.set||{});if(b.hideEls)bt[bi].hide.push(...b.hideEls)});
  function label(v){return Number(v).toFixed(dec)}
  return morph(slide,Object.assign({},data,{els,beats:bt,move:data.move||1.1}),kit);
}

/* 공간: 점이 2차원 평면 위에서 옮겨 다님. 비트마다 pos(0~1 좌표), links, rings(묶음 원), hide */
function space(slide,data,kit){
  const ar=data.area||[110,290,1810,930],[x0,y0,x1,y1]=ar,P=(u,v)=>[x0+u*(x1-x0),y0+v*(y1-y0)];
  const pts=data.points||[],B=data.beats||[{}];const els=[];
  if(data.frame!==false)els.push({id:'_frame',type:'box',x:x0-30,y:y0-30,w:x1-x0+60,h:y1-y0+60,fill:0,lw:2,tone:'dim',rx:18});
  pts.forEach(p=>els.push({id:p.id,type:'dot',r:p.r||14,label:p.label,lp:p.lp,tone:p.tone||'accent',size:p.size||26}));
  const ringIds=new Set(),linkIds=new Set();
  B.forEach(b=>{(b.rings||[]).forEach(r=>{if(!ringIds.has(r.id)){ringIds.add(r.id);els.push({id:r.id,type:'ring',tone:r.tone||'dim',size:26})}});(b.links||[]).forEach(l=>{const id=l.id||`${l.from}>${l.to}`;if(!linkIds.has(id)){linkIds.add(id);els.push({id,type:'link',from:l.from,to:l.to,tone:l.tone||'mut',arrow:!!l.arrow,lw:l.w||3})}})});
  const bt=B.map((b,bi)=>{const set={};if(bi===0&&data.frame!==false)set._frame={a:.5};
    Object.entries(b.pos||{}).forEach(([id,[u,v]])=>{const[x,y]=P(u,v);set[id]=Object.assign({x,y},b.tones&&b.tones[id]?{tone:b.tones[id]}:{})});
    Object.entries(b.tones||{}).forEach(([id,tone])=>{if(!set[id])set[id]={tone}});
    (b.rings||[]).forEach(r=>{const[x,y]=P(r.at[0],r.at[1]);set[r.id]={x,y,r:r.r*(x1-x0),label:r.label,tone:r.tone||'dim'}});
    (b.links||[]).forEach(l=>{set[l.id||`${l.from}>${l.to}`]=Object.assign({},l.tone?{tone:l.tone}:{})});
    Object.assign(set,b.set||{});return{title:b.title,sub:b.sub,dur:b.dur,note:b.note,set,hide:b.hide||[],stagger:b.stagger}});
  els.push(...(data.els||[]));
  return morph(slide,Object.assign({},data,{els,beats:bt,move:data.move||1.2}),kit);
}

const SCENES={timeline,map,flow,cards,dots,morph,bars,space};

/* 런타임: 슬라이드와 비트 이동, 시간 탐색, 검사 */
function init(){
  const slides=[...document.querySelectorAll('.deck-stage .slide, .slide')].filter((s,i,a)=>a.indexOf(s)===i);if(!slides.length)return;
  const reduced=matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  const S=slides.map(el=>{const type=el.dataset.motion;if(!type||!SCENES[type])return{el,type:null,beats:[0],draw(){}};
    el.classList.add('dm-slide');const j=el.querySelector('script[type="application/json"]');const data=j?JSON.parse(j.textContent):{};const kit=Kit(el);const sc=SCENES[type](el,data,kit);kit.refit();return{el,type,kit,beats:sc.beats,draw:sc.draw}});
  S.forEach(s=>{s.ends=[];let a=0;s.beats.forEach(b=>{a+=b;s.ends.push(a)});s.dur=a});
  const stops=[];S.forEach((s,i)=>s.ends.forEach((t,b)=>stops.push({slide:i,beat:b,t})));
  let cur=-1,si=0,T=0,target=0,raf=null,last=0;
  const setHash=()=>{const st=stops[cur];if(st)try{history.replaceState(null,'',`#${st.slide+1}.${st.beat+1}`)}catch(e){}};
  function activate(i){if(si===i&&S[i].el.classList.contains('active'))return;si=i;S.forEach((s,k)=>s.el.classList.toggle('active',k===i));document.documentElement.style.setProperty('--slide',i)}
  const paint=()=>S[si].draw(T);
  function stopAnim(){if(raf){cancelAnimationFrame(raf);raf=null}}
  function tick(n){const dt=(n-last)/1000;last=n;const d=Math.sign(target-T),r=d<0?3:1;T+=d*dt*r;if(d===0||(d>0&&T>=target)||(d<0&&T<=target)){T=target;paint();raf=null;return}paint();raf=requestAnimationFrame(tick)}
  function run(){if(reduced||S[si].dur===0){T=target;paint();return}if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}}
  function goStop(n,instant){if(n<0||n>=stops.length)return;const st=stops[n],prev=stops[cur];cur=n;
    if(!prev||st.slide!==prev.slide){stopAnim();activate(st.slide);const forward=!prev||st.slide>prev.slide;T=forward&&!instant&&st.beat===0?0:st.t;target=st.t;if(instant||!forward)T=st.t;paint();if(T!==target)run()}
    else{target=st.t;if(instant){stopAnim();T=target;paint()}else run()}setHash()}
  const next=()=>goStop(cur+1),prev=()=>goStop(cur-1);
  addEventListener('keydown',e=>{if(e.metaKey||e.ctrlKey||e.altKey)return;const k=e.key;
    if(k==='ArrowRight'||k===' '||k==='PageDown'){e.preventDefault();e.stopImmediatePropagation();next()}
    else if(k==='ArrowLeft'||k==='PageUp'){e.preventDefault();e.stopImmediatePropagation();prev()}
    else if(k==='Home'){e.preventDefault();e.stopImmediatePropagation();goStop(0,true)}
    else if(k==='End'){e.preventDefault();e.stopImmediatePropagation();goStop(stops.length-1,true)}},true);
  document.addEventListener('click',e=>{if(e.target.closest('.slide')&&!e.target.closest('a,button,input,select,textarea'))next()});
  let sx=null;addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{capture:true,passive:true});
  addEventListener('touchend',e=>{if(sx==null)return;const d=e.changedTouches[0].clientX-sx;e.stopImmediatePropagation();if(d<-40)next();else if(d>40)prev();sx=null},true);

  /* 전체 시간축: 영상 출력용. 일반 슬라이드는 2초 */
  const span=S.map(s=>s.dur||2);const total=span.reduce((a,b)=>a+b,0);
  function seek(G){document.documentElement.classList.add('dm-capture');stopAnim();let a=0;for(let i=0;i<S.length;i++){if(G<a+span[i]||i===S.length-1){activate(i);T=target=Math.min(G-a,S[i].dur);paint();return}a+=span[i]}}
  function setStopForCapture(n){document.documentElement.classList.add('dm-capture');cur=-1;goStop(n,true)}

  /* 멈춤 지점별 겹침과 넘침 검사 */
  function visibleAlpha(el,root){let a=1;for(let e=el;e&&e!==root.parentElement;e=e.parentElement){const c=getComputedStyle(e);if(c.visibility==='hidden'||c.display==='none')return 0;a*=parseFloat(c.opacity)}return a}
  function check(){const stage=document.querySelector('.deck-stage').getBoundingClientRect(),k=stage.width/1920;const out=[];const saved=cur;
    stops.forEach((st,n)=>{setStopForCapture(n);const root=S[st.slide].el;if(root.querySelector('.dm-stage3d'))return;const nodes=[...root.querySelectorAll('text,h1,h2,h3,h4,h5,p,li,td,th,span,div,.dm-tag')].filter(e=>{if(e.tagName!=='text'&&[...e.children].some(c=>c.textContent.trim()))return false;return e.textContent.trim()&&visibleAlpha(e,root)>.05});
      const boxes=nodes.map(e=>{const r=e.getBoundingClientRect();return{e,x:(r.left-stage.left)/k,y:(r.top-stage.top)/k,w:r.width/k,h:r.height/k,s:e.textContent.trim().slice(0,24)}}).filter(b=>b.w>0&&b.h>0);
      boxes.forEach(b=>{if(b.x<-1||b.y<-1||b.x+b.w>1921||b.y+b.h>1081)out.push({stop:`${st.slide+1}.${st.beat+1}`,kind:'화면 밖',text:b.s})});
      for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];if(a.e.contains(b.e)||b.e.contains(a.e))continue;const ix=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x),iy=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);if(ix>2&&iy>2){const ov=ix*iy/Math.min(a.w*a.h,b.w*b.h);if(ov>.15)out.push({stop:`${st.slide+1}.${st.beat+1}`,kind:'글자 겹침',text:`${a.s} / ${b.s}`})}}
      root.querySelectorAll('.dm-card').forEach(c=>{if(c.scrollHeight>c.clientHeight+2&&visibleAlpha(c,root)>.05)out.push({stop:`${st.slide+1}.${st.beat+1}`,kind:'카드 넘침',text:c.textContent.trim().slice(0,24)})})});
    cur=-1;goStop(Math.max(0,saved),true);const uniq={};out.forEach(o=>uniq[o.stop+o.kind+o.text]=o);return Object.values(uniq)}

  global.deckMotion={stops:stops.map(s=>`${s.slide+1}.${s.beat+1}`),duration:total,seek,goStop:setStopForCapture,check,next,prev};
  const refit=()=>{S.forEach(s=>s.kit&&s.kit.refit());paint()};
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refit);
  const m=location.hash.match(/^#(\d+)\.(\d+)$/);let startN=0;if(m){const f=stops.findIndex(s=>s.slide===m[1]-1&&s.beat===m[2]-1);if(f>=0)startN=f}
  S.forEach((s,i)=>{if(s.dur)s.draw(0)});
  goStop(startN,!!m);
}
global.DeckMotion={init,register(name,fn){SCENES[name]=fn},kit:{cl,seg,eo,eio,lerp,hash,curve,roundRectPts,Kit,Head,starts}};
})(window);
