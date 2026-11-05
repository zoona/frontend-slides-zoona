// motion-check.mjs — 모션 덱의 멈춤 지점을 전부 캡처하고 겹침·넘침 검사와 한 장짜리 모음(sheet.png)을 만든다.
// gstack 없이 Chrome의 CDP만 쓴다. 보여 주기 전 점검용이며, PDF와 영상은 motion-capture.sh가 맡는다.
// 사용: node scripts/motion-check.mjs <덱.html 절대경로> <출력 폴더>
//   출력: NN-<장>.<비트>.png, check.json, sheet.html, sheet.png
//   종료 코드: 검사 문제가 있으면 1
import { spawn } from "node:child_process"; import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from "node:fs"; import { tmpdir } from "node:os"; import { join, resolve } from "node:path"; import { pathToFileURL } from "node:url";
const [srcArg,outArg]=process.argv.slice(2); if(!srcArg||!outArg){console.error("사용: node motion-check.mjs <덱.html> <출력 폴더>");process.exit(2)}
const src=resolve(srcArg),out=resolve(outArg); rmSync(out,{recursive:true,force:true}); mkdirSync(out,{recursive:true});
const CHROME=process.env.CHROME||"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT=9500+Math.floor(Math.random()*90);
const c=spawn(CHROME,["--headless=new",`--remote-debugging-port=${PORT}`,`--user-data-dir=${mkdtempSync(join(tmpdir(),"mc-"))}`,"--no-first-run","--hide-scrollbars","about:blank"],{stdio:"ignore"});
const sleep=ms=>new Promise(r=>setTimeout(r,ms)); let ws;
for(let i=0;i<60&&!ws;i++){try{const l=await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();ws=l.find(t=>t.type==="page")?.webSocketDebuggerUrl;}catch{} if(!ws) await sleep(250);}
if(!ws){console.error("Chrome에 붙지 못함");c.kill();process.exit(2)}
const w=new WebSocket(ws); await new Promise(r=>w.onopen=r); let id=0; const p=new Map();
w.onmessage=e=>{const m=JSON.parse(e.data); if(m.id&&p.has(m.id)){p.get(m.id)(m.result);p.delete(m.id);}};
const send=(m,pa={})=>new Promise(r=>{const i=++id;p.set(i,r);w.send(JSON.stringify({id:i,method:m,params:pa}));});
const ev=async x=>(await send("Runtime.evaluate",{expression:x,returnByValue:true,awaitPromise:true})).result?.value;
await send("Page.enable"); await send("Emulation.setDeviceMetricsOverride",{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
await send("Page.navigate",{url:pathToFileURL(src).href}); await sleep(3000);
const stops=await ev("deckMotion.stops"); if(!stops){console.error("deckMotion이 없음. 모션 덱(.html, 런타임 포함)인지 확인");w.close();c.kill();process.exit(2)}
const files=[];
for(let i=0;i<stops.length;i++){ await ev(`deckMotion.goStop(${i},true);1`); await sleep(700); const s=await send("Page.captureScreenshot",{format:"png"}); const f=`${String(i).padStart(2,"0")}-${stops[i]}.png`; writeFileSync(join(out,f),Buffer.from(s.data,"base64")); files.push(f); }
const issues=JSON.parse(await ev("JSON.stringify(deckMotion.check())")); writeFileSync(join(out,"check.json"),JSON.stringify(issues,null,1));
// 모음 한 장: 4열 격자, 칸마다 멈춤 지점 번호
const COLS=4,CW=480,CH=270,ROWS=Math.ceil(files.length/COLS);
const sheet=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;display:grid;grid-template-columns:repeat(${COLS},${CW}px);width:${COLS*CW}px}figure{margin:0;position:relative;width:${CW}px;height:${CH}px;outline:1px solid #ddd}img{width:100%;height:100%;display:block}figcaption{position:absolute;left:6px;top:4px;font:700 14px/1 system-ui;color:#fff;background:#c8451f;padding:3px 7px;border-radius:4px}</style>`+files.map(f=>`<figure><img src="${f}"><figcaption>${f.replace(/^\d+-/,"").replace(".png","")}</figcaption></figure>`).join("");
writeFileSync(join(out,"sheet.html"),sheet);
await send("Emulation.setDeviceMetricsOverride",{width:COLS*CW,height:ROWS*CH,deviceScaleFactor:1,mobile:false});
await send("Page.navigate",{url:pathToFileURL(join(out,"sheet.html")).href}); await sleep(1200);
const sh=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true}); writeFileSync(join(out,"sheet.png"),Buffer.from(sh.data,"base64"));
console.log(`멈춤 지점 ${stops.length}장, 검사 문제 ${issues.length}건, 모음 ${join(out,"sheet.png")}`);
issues.forEach(o=>console.log(" ",o.stop,o.kind,o.text));
w.close(); c.kill(); process.exit(issues.length?1:0);
