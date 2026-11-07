const D = window.ZIPDATA;
const cityIdx = {};
D.c.forEach((c,i)=>{ cityIdx[c.toLowerCase()] = []; });
for (const [z,v] of Object.entries(D.z)) cityIdx[D.c[v[2]].toLowerCase()].push(z);
for (const [a,zs] of Object.entries(D.a)) { const k=a.toLowerCase(); if(!cityIdx[k]) cityIdx[k]=zs.slice(); }
const titleCase = s => s.toLowerCase().replace(/\b\w/g, m=>m.toUpperCase());
document.getElementById('cityList').innerHTML = D.c.map(c=>`<option value="${c}">`).join('');

function lookup(raw){
  const s = raw.trim();
  if(!s) return {error:'Type a ZIP code or a city name.'};
  const m = s.match(/^\d{5}/);
  if(m){
    const v = D.z[m[0]];
    if(!v) return {error:`ZIP ${m[0]} isn't in the California list. Double-check the number.`};
    return {label:D.c[v[2]], sub:`${m[0]} · ${D.k[v[3]]} County`, zip:m[0], lat:v[0], lng:v[1], q:m[0]+' CA'};
  }
  const key = s.toLowerCase().replace(/,?\s*ca(lifornia)?$/,'').trim();
  const zs = cityIdx[key];
  if(!zs || !zs.length) return {error:`Couldn't find "${s}". Try the ZIP code or pick a city from the suggestions.`};
  let lat=0,lng=0; zs.forEach(z=>{lat+=D.z[z][0]; lng+=D.z[z][1];});
  const co = D.k[D.z[zs[0]][3]];
  return {label:titleCase(key), sub:`City · ${co} County`, zip:null, lat:lat/zs.length, lng:lng/zs.length, q:titleCase(key)+' CA'};
}
function miles(a,b){
  const R=3958.8, r=x=>x*Math.PI/180;
  const dLat=r(b.lat-a.lat), dLng=r(b.lng-a.lng);
  const h=Math.sin(dLat/2)**2+Math.cos(r(a.lat))*Math.cos(r(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h))*1.3; // road factor
}
function driveMin(mi){ return Math.round(mi/ (mi>40?50:32) * 60 + 5); }
function fmtTime(m){ return m<60? `${m} min` : `${Math.floor(m/60)} hr ${m%60? (m%60)+' min':''}`.trim(); }
function grade(mi){ return mi<20?['good','Close']: mi<=40?['warn','Check first']:['bad','Too far']; }
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

let jobs = [], customer = null;
try { const s = JSON.parse(localStorage.getItem('routecheck-jobs')||'null'); if(Array.isArray(s)) jobs = s; } catch(e){}
function save(){ try{ localStorage.setItem('routecheck-jobs', JSON.stringify(jobs)); }catch(e){} }

function renderJobs(){
  const ul = document.getElementById('jobs');
  if(!jobs.length){ ul.innerHTML = '<li class="empty">No jobs added yet. Add the installer’s other stops for that day.</li>'; return; }
  ul.innerHTML = jobs.map((j,i)=>`<li><span class="zip">${j.zip||'—'}</span><span class="place"><b>${esc(j.label)}</b><small>${esc(j.sub)}</small></span><button class="x" data-i="${i}" aria-label="Remove ${esc(j.label)}">×</button></li>`).join('');
}
var renderResult = function(){
  const v = document.getElementById('verdict'), t = document.getElementById('tbl'), tb = t.querySelector('tbody');
  if(!customer || !jobs.length){
    v.className='verdict none';
    v.innerHTML = `<div class="big">Waiting</div><p>${!jobs.length?'Add at least one booked job for the installer.':'Enter the new customer’s ZIP or city.'}</p>`;
    t.hidden = true; return;
  }
  const rows = jobs.map(j=>{ const mi=miles(j,customer); return {j,mi}; });
  const nearest = rows.reduce((a,b)=>a.mi<=b.mi?a:b), farthest = rows.reduce((a,b)=>a.mi>=b.mi?a:b);
  const [cls,word] = grade(farthest.mi);
  const msg = cls==='good' ? `${esc(customer.label)} is within ${Math.round(farthest.mi)} miles of every job that day. Good to schedule.`
    : cls==='warn' ? `Farthest job is about ${Math.round(farthest.mi)} miles away (${esc(farthest.j.label)}). Check with the installer or look for a closer day.`
    : `${esc(customer.label)} is about ${Math.round(farthest.mi)} miles from ${esc(farthest.j.label)}, roughly ${fmtTime(driveMin(farthest.mi))} of driving. Look for a day the installer is already in that area.`;
  v.className = 'verdict '+cls;
  v.innerHTML = `<div class="big">${word}</div><p>${msg}</p>`;
  tb.innerHTML = rows.map(({j,mi})=>{ const [c,w]=grade(mi);
    const url=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(j.q)}&destination=${encodeURIComponent(customer.q)}`;
    return `<tr><td><b>${esc(j.label)}</b> <span class="zip">${j.zip||''}</span></td><td class="num">${Math.round(mi)} mi</td><td class="num">${fmtTime(driveMin(mi))}</td><td><span class="chip ${c}">${w}</span></td><td><a href="${url}" target="_blank" rel="noopener">Open</a></td></tr>`; }).join('');
  t.hidden = false;
};

document.getElementById('addForm').addEventListener('submit',e=>{
  e.preventDefault(); const inp=document.getElementById('bookedIn'), err=document.getElementById('addErr');
  const r=lookup(inp.value); if(r.error){ err.textContent=r.error; return; }
  err.textContent=''; jobs.push(r); inp.value=''; save(); renderJobs(); renderResult(); inp.focus();
});
document.getElementById('newForm').addEventListener('submit',e=>{
  e.preventDefault(); const inp=document.getElementById('newIn'), err=document.getElementById('newErr');
  const r=lookup(inp.value); if(r.error){ err.textContent=r.error; customer=null; renderResult(); return; }
  err.textContent=''; customer=r; renderResult();
});
document.getElementById('jobs').addEventListener('click',e=>{
  const b=e.target.closest('button.x'); if(!b) return; jobs.splice(+b.dataset.i,1); save(); renderJobs(); renderResult();
});
document.getElementById('clearBtn').addEventListener('click',()=>{ jobs=[]; save(); renderJobs(); renderResult(); });

// Example on first open so the page shows what it does
if(!jobs.length){ const a=lookup('91355'); jobs=[a]; customer=lookup('92260'); document.getElementById('newIn').value='92260'; }
renderJobs(); renderResult();

// ---- Map (drawn from ZIP centers; no outside map service) ----
const CITIES=['Los Angeles','San Diego','Santa Clarita','Lancaster','Bakersfield','Oxnard','Riverside','San Bernardino','Palm Desert','Irvine','Long Beach','Temecula','Victorville','Escondido','Palm Springs','Ontario','Pasadena','Santa Barbara','Indio','El Centro','Oceanside','Chula Vista','Hesperia','Thousand Oaks','Anaheim'];
const cityPts = CITIES.map(c=>{ const r=lookup(c); return r.error?null:{n:c,lat:r.lat,lng:r.lng}; }).filter(Boolean);
const allPts = Object.values(D.z);
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function drawMap(){
  const cv=document.getElementById('map'); const dpr=window.devicePixelRatio||1;
  const W=cv.clientWidth, H=cv.clientHeight; cv.width=W*dpr; cv.height=H*dpr;
  const ctx=cv.getContext('2d'); ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.fillStyle=css('--map'); ctx.fillRect(0,0,W,H);
  const pts=[...jobs]; if(customer) pts.push(customer);
  let la0=33.6,la1=34.5,lo0=-118.8,lo1=-116.8; // default: LA/SD area
  if(pts.length){ la0=Math.min(...pts.map(p=>p.lat)); la1=Math.max(...pts.map(p=>p.lat)); lo0=Math.min(...pts.map(p=>p.lng)); lo1=Math.max(...pts.map(p=>p.lng)); }
  const k=Math.cos(((la0+la1)/2)*Math.PI/180);
  let cx=(lo0+lo1)/2, cy=(la0+la1)/2, sx=Math.max((lo1-lo0)*k,0.5)*1.35, sy=Math.max(la1-la0,0.4)*1.35;
  const scale=Math.min(W/sx, H/sy);
  const P=(lat,lng)=>[W/2+(lng-cx)*k*scale, H/2-(lat-cy)*scale];
  ctx.fillStyle=css('--mapdot');
  for(const v of allPts){ const [x,y]=P(v[0],v[1]); if(x>-5&&x<W+5&&y>-5&&y<H+5){ ctx.beginPath(); ctx.arc(x,y,1.6,0,7); ctx.fill(); } }
  ctx.font='600 12px Barlow, system-ui, sans-serif'; ctx.fillStyle=css('--maplabel'); ctx.textAlign='center';
  const placed=[];
  for(const c of cityPts){ const [x,y]=P(c.lat,c.lng); if(x<30||x>W-30||y<14||y>H-24) continue;
    if(placed.some(([a,b])=>Math.abs(a-x)<70&&Math.abs(b-y)<16)) continue; placed.push([x,y]); ctx.fillText(c.n,x,y-6); }
  const fg=css('--fg'), bg=css('--panel');
  if(customer){
    const [cxp,cyp]=P(customer.lat,customer.lng);
    jobs.forEach(j=>{ const [x,y]=P(j.lat,j.lng); const mi=miles(j,customer); const [g]=grade(mi);
      ctx.strokeStyle=css('--'+g); ctx.lineWidth=2.5; ctx.setLineDash([7,5]); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(cxp,cyp); ctx.stroke(); ctx.setLineDash([]);
      const t=Math.round(mi)+' mi', mx=(x+cxp)/2, my=(y+cyp)/2; ctx.font='700 14px Barlow, system-ui, sans-serif';
      const w=ctx.measureText(t).width+14; ctx.fillStyle=bg; ctx.strokeStyle=css('--'+g); ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.roundRect(mx-w/2,my-12,w,24,12); ctx.fill(); ctx.stroke(); ctx.fillStyle=css('--'+g); ctx.textAlign='center'; ctx.fillText(t,mx,my+5);
    });
  }
  const pin=(p,col,lbl)=>{ const [x,y]=P(p.lat,p.lng); ctx.fillStyle=col; ctx.strokeStyle=bg; ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.fill(); ctx.stroke();
    ctx.font='700 13px Barlow, system-ui, sans-serif'; ctx.textAlign= x>W-90?'right':'left'; const tx= x>W-90? x-12 : x+12;
    ctx.lineWidth=4; ctx.strokeStyle=css('--map'); ctx.strokeText(lbl,tx,y+4); ctx.fillStyle=fg; ctx.fillText(lbl,tx,y+4); };
  jobs.forEach(j=>pin(j,css('--job'),j.label));
  if(customer) pin(customer,css('--bad'),customer.label);
}
const _rr=renderResult; renderResult=function(){ _rr(); drawMap(); };
window.addEventListener('resize',drawMap);
try{ matchMedia('(prefers-color-scheme: dark)').addEventListener('change',drawMap); new MutationObserver(drawMap).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']}); }catch(e){}
if(document.fonts) document.fonts.ready.then(drawMap);
drawMap();
