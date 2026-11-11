/*
 * Home Ring card for Home Assistant
 * https://github.com/anchorapp100/home-ring-card  (MIT licence)
 *
 * Your home as a ring you drill into: the centre is where you are, the rings around it are floors, rooms,
 * kinds of thing and the things themselves. Tap to go in, tap the centre to come back out, hold to switch,
 * slide on a light to dim it. Everything comes from Home Assistant's own floors, areas and entities, so new
 * devices appear by themselves once they have a room.
 */
const HOME_RING_VERSION = '1.3.1';

const HR_CSS = `
:host{
  --bg:#0a0f16; --panel:#111924; --text:#eef4f9; --muted:#8a97a6; --dim:#5d6a79; --line:rgba(255,255,255,.08);
  --light:#ffb638; --plug:#30d1b4; --heat:#ff7a45; --media:#39d98a; --alert:#ff5a5a; --fan:#4bc0e0; --cam:#b088ff;
  --hub:#0e151f; --wedge:#121a26; --cardgrad:linear-gradient(158deg,#151f2b 0%,#0c151f 100%);
  display:block; container-type:inline-size; container-name:hr;
}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
ha-card{display:block;background:var(--bg);color:var(--text);overflow:hidden;border-radius:var(--ha-card-border-radius,16px);
  font-family:var(--hr-font,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif);}
#app{position:relative;height:var(--hr-height,min(78vh,760px));display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,32%);gap:14px;padding:12px 14px;}
#stage{position:relative;min-height:0;}
#ringbox{position:absolute;inset:0;}
.hots{display:contents;}
#ring{width:100%;height:100%;display:block;user-select:none;touch-action:none;}
#ring .w path{stroke:var(--bg);stroke-width:1.5;transition:filter .2s;}
#ring .w.k-floor path,#ring .w.k-area path,#ring .w.k-cat path{stroke-width:3;}
#ring .w{cursor:pointer;}
#ring .w.hl path{filter:brightness(1.35);}
#ring .w.active.k-ent path{stroke:color-mix(in srgb,var(--sc) 70%,transparent);stroke-width:1.5;}
#ring .w.sel path{stroke:#fff;stroke-width:2.5;}
#ring .w:focus{outline:none;} #ring .w:focus-visible path{stroke:#fff;stroke-width:2.5;}
#ring .w.flash path{filter:brightness(1.9);transition:filter .08s;}
#ring .lb{pointer-events:none;}
#ring .nm{fill:var(--text);font-weight:650;}
#ring .sub{fill:var(--muted);font-size:10.5px;font-weight:600;}
#ring .ctr .cn{fill:var(--text);font-weight:750;}
#ring .ctr .cs{fill:var(--muted);font-size:12px;font-weight:600;}
#ring circle.hub{fill:var(--hub);stroke:rgba(255,255,255,.12);stroke-width:1.5;cursor:pointer;}
#ring .pulse{animation:hrpulse 2.2s ease-in-out infinite;}
@keyframes hrpulse{50%{filter:brightness(1.45);}}
#ring .w.moved path{animation:hrmoved 1.1s ease-out 3;}
@keyframes hrmoved{0%{filter:brightness(2.3) saturate(1.3);}100%{filter:none;}}
#ring .scn{cursor:pointer;}
#ring .scn path{fill:#18222f;stroke:var(--bg);stroke-width:3;transition:fill .2s;}
#ring .scn.last path{fill:color-mix(in srgb,var(--light) 20%,#18222f);}
#ring .scn.flash path{fill:color-mix(in srgb,var(--light) 60%,#18222f);}
#ring .scn text{fill:#d5dee8;font-size:12.5px;font-weight:750;letter-spacing:.03em;pointer-events:none;}
#ring .scn:focus{outline:none;} #ring .scn:focus-visible path{stroke:#fff;}
@media (prefers-reduced-motion:reduce){ #ring .pulse{animation:none;} #ring .w.moved path{animation:none;filter:brightness(1.7);} .hot.armed{animation:none;} }
#slide{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(30%,220px);aspect-ratio:1;border-radius:50%;display:none;place-items:center;
  pointer-events:none;background:radial-gradient(closest-side,var(--hub) 78%,transparent 79%),conic-gradient(var(--light) calc(var(--p,0)*1%),rgba(255,255,255,.1) 0);}
#slide div{display:flex;flex-direction:column;align-items:center;gap:2px;}
#slide b{font-size:34px;font-weight:800;color:var(--text);font-variant-numeric:tabular-nums;}
#slide span{font-size:12px;color:var(--muted);font-weight:700;max-width:120px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#toast{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:80%;padding:10px 18px;border-radius:14px;background:rgba(12,18,27,.95);
  border:1px solid rgba(255,255,255,.16);font-size:15px;font-weight:750;text-align:center;opacity:0;transition:opacity .25s;pointer-events:none;}
#toast.show{opacity:1;}
#wait{position:absolute;inset:0;display:grid;place-items:center;color:var(--muted);font-size:14px;}
/* hot buttons: the four corners around the ring */
.hot{all:unset;box-sizing:border-box;position:absolute;z-index:2;display:flex;flex-direction:column;gap:3px;width:138px;padding:10px 12px;border-radius:16px;cursor:pointer;
  background:rgba(17,25,36,.92);border:1px solid rgba(255,255,255,.12);user-select:none;touch-action:none;color:var(--text);transition:background .2s,border-color .2s;}
.hot.tl{left:0;top:0;} .hot.tr{right:0;top:0;} .hot.bl{left:0;bottom:0;} .hot.br{right:0;bottom:0;}
.hot .hi{display:flex;align-items:center;gap:8px;font-size:13.5px;font-weight:800;}
.hot svg{width:22px;height:22px;fill:none;stroke:var(--hc);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;}
.hot .hv{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.hot .md{margin-left:auto;width:9px;height:9px;border-radius:50%;background:var(--alert);box-shadow:0 0 9px var(--alert);display:none;}
.hot.motion .md{display:block;}
.hot.lit{border-color:color-mix(in srgb,var(--hc) 55%,transparent);background:color-mix(in srgb,var(--hc) 13%,rgba(17,25,36,.94));}
.hot.lit .hv{color:var(--text);}
.hot.open{box-shadow:0 0 0 2px color-mix(in srgb,var(--hc) 75%,transparent);}
.hot.armed{animation:hrarmed 2s ease-in-out infinite;}
@keyframes hrarmed{50%{box-shadow:0 0 26px -2px var(--alert);}}
.hot:active{transform:scale(.97);} .hot:focus-visible{box-shadow:0 0 0 2px #fff;}
.hot[hidden]{display:none;}
.hot .hn{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.hot.empty{opacity:.7;}
.hot.edit{border-style:dashed;border-color:color-mix(in srgb,var(--hc) 70%,transparent);animation:hrwiggle 1.4s ease-in-out infinite;}
.hot.picking{animation:none;box-shadow:0 0 0 2px #fff;background:color-mix(in srgb,var(--hc) 18%,rgba(17,25,36,.94));}
@keyframes hrwiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-1.2deg)}75%{transform:rotate(1.2deg)}}
@media (prefers-reduced-motion:reduce){ .hot.edit{animation:none;} }
#custom{display:inline-flex;align-items:center;gap:6px;} #custom[hidden]{display:none;}
#custom svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}
#custom.on{color:var(--light);}
.seg:has(> #custom[hidden]){display:none;}
#ctl .opts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:9px;}
#ctl .opt{all:unset;cursor:pointer;display:flex;align-items:center;gap:7px;min-width:0;padding:8px 9px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid var(--line);font-size:12.5px;font-weight:750;}
#ctl .opt span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#ctl .opt svg{width:18px;height:18px;flex:0 0 auto;fill:none;stroke:var(--hc);stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
#ctl .opt.on{border-color:color-mix(in srgb,var(--hc) 60%,transparent);background:color-mix(in srgb,var(--hc) 14%,transparent);}
#ctl .opt:focus-visible{box-shadow:0 0 0 2px #fff;}
#ctl .mrow{grid-template-columns:minmax(0,1fr) auto;}
#ctl .link2{all:unset;cursor:pointer;min-width:0;}
#ctl .scn2{grid-template-columns:repeat(2,minmax(0,1fr));}
/* the side panel */
#side{min-height:0;display:flex;flex-direction:column;gap:10px;}
.card{background:var(--cardgrad);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:12px 14px;}
#crumbs{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;font-size:13px;font-weight:700;color:var(--muted);}
#crumbs button{all:unset;cursor:pointer;color:var(--muted);padding:2px 0;}
#crumbs button:hover{color:var(--text);}
#crumbs .cur{color:var(--text);} #crumbs .sep{color:var(--dim);}
#back{all:unset;cursor:pointer;font-size:12px;font-weight:700;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:4px 11px;margin-left:auto;white-space:nowrap;}
#back[hidden]{display:none;}
#title{font-size:22px;font-weight:800;letter-spacing:-.3px;margin-top:6px;}
#summary{font-size:12.5px;color:var(--muted);margin-top:3px;line-height:1.45;}
#summary b{color:var(--text);}
.tools{display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;margin-top:10px;}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:999px;padding:3px;gap:2px;}
.seg button{all:unset;cursor:pointer;font-size:12px;font-weight:800;color:var(--muted);padding:5px 12px;border-radius:999px;}
.seg button.on{background:rgba(255,255,255,.11);color:var(--text);}
#lockseg[hidden],#tidy[hidden]{display:none;}
#lock{display:inline-flex;align-items:center;gap:6px;}
#lock svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}
#lock.on{color:var(--light);}
#legend{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--muted);font-weight:700;}
#legend i{width:96px;height:8px;border-radius:999px;background:linear-gradient(90deg,#4a8dff,rgba(255,255,255,.14) 45%,rgba(255,255,255,.14) 55%,#ff8a3d);}
#ctl{flex:1 1 auto;min-height:0;overflow:auto;}
#ctl:empty{display:none;}
#ctl .h{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;}
#ctl .h i{width:10px;height:10px;border-radius:50%;background:var(--sc,var(--muted));box-shadow:0 0 10px -1px var(--sc,transparent);}
#ctl .h i.off{background:var(--dim);box-shadow:none;}
#ctl .st{font-size:12.5px;color:var(--muted);margin-top:3px;}
#ctl .row{display:flex;align-items:center;gap:8px;margin-top:11px;flex-wrap:wrap;}
#ctl .x{all:unset;cursor:pointer;margin-left:auto;font-size:15px;color:var(--muted);padding:2px 8px;border:1px solid var(--line);border-radius:999px;}
#ctl .lbl{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin-top:14px;}
#ctl .pv{font-size:12.5px;font-weight:800;color:var(--muted);min-width:48px;text-align:right;font-variant-numeric:tabular-nums;}
#ctl .note{font-size:12.5px;color:var(--muted);margin-top:12px;}
#ctl .kvs{margin-top:10px;}
#ctl .kv{display:flex;justify-content:space-between;gap:10px;font-size:12.5px;padding:5px 0;border-top:1px solid rgba(255,255,255,.05);color:var(--muted);}
#ctl button.kv{appearance:none;-webkit-appearance:none;background:none;border:0;border-top:1px solid rgba(255,255,255,.05);font:inherit;font-size:12.5px;width:100%;text-align:left;cursor:pointer;margin:0;} #ctl button.kv:hover b{text-decoration:underline;}
#ctl .kv b{color:var(--text);font-weight:700;text-align:right;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
#ctl select{width:100%;margin-top:7px;background:var(--hub);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:9px 10px;font:inherit;font-size:13px;}
#ctl .hue{--h:0;height:28px;appearance:none;-webkit-appearance:none;border-radius:999px;background:linear-gradient(90deg,hsl(0 90% 55%),hsl(60 90% 55%),hsl(120 90% 55%),hsl(180 90% 55%),hsl(240 90% 55%),hsl(300 90% 55%),hsl(359 90% 55%));}
#ctl .hue::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:hsl(var(--h) 90% 55%);border:3px solid #fff;}
#ctl .ct{height:28px;appearance:none;-webkit-appearance:none;border-radius:999px;background:linear-gradient(90deg,#ff9b3d,#fff3e0,#cfe3ff);}
#ctl .ct::-webkit-slider-thumb{-webkit-appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid var(--hub);}
#ctl .sw{gap:7px;} #ctl .dot{all:unset;cursor:pointer;width:30px;height:30px;border-radius:50%;border:2px solid rgba(255,255,255,.25);}
#ctl .dot.white{background:linear-gradient(135deg,#fff3e0,#fff);}
#ctl .clim{display:grid;grid-template-columns:auto 1fr;gap:18px;margin-top:10px;align-items:end;}
#ctl .clim .big{font-size:40px;} #ctl .tgt{margin-top:2px;} #ctl .tgt .btn{font-size:20px;padding:6px 16px;}
#ctl .graph{margin-top:8px;font-size:12px;color:var(--muted);} #ctl .graph svg{width:100%;height:90px;display:block;background:rgba(255,255,255,.03);border-radius:8px;}
#ctl .gl{display:flex;justify-content:space-between;font-size:10.5px;color:var(--dim);margin-top:3px;}
#ctl .art{width:100%;max-height:160px;object-fit:contain;border-radius:10px;margin-top:10px;background:#000;}
#ctl .trow{display:grid;grid-template-columns:minmax(0,1fr) auto 52px auto;align-items:center;gap:8px;padding:6px 0;border-top:1px solid rgba(255,255,255,.05);}
#ctl .trow .tn{min-width:0;font-size:13px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#ctl .trow .tn small{display:block;font-size:11.5px;font-weight:650;color:var(--muted);}
#ctl .trow .tn small.on{color:var(--heat);}
#ctl .trow .tt{font-size:16px;font-weight:800;text-align:center;font-variant-numeric:tabular-nums;}
#ctl .trow .btn{padding:5px 12px;font-size:17px;}
#ctl .cams{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;}
#ctl .cam2{position:relative;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer;}
#ctl .cam2.big{grid-column:1/-1;}
#ctl .cam2 img{width:100%;height:100%;object-fit:cover;display:block;}
#ctl .cam2 span{position:absolute;left:9px;bottom:6px;font-size:12px;font-weight:800;text-shadow:0 1px 3px #000;}
#ctl .cam2 em{position:absolute;inset:0;display:none;place-items:center;color:var(--muted);font-size:12px;font-style:normal;}
#ctl .cam2.fail em{display:grid;} #ctl .cam2.fail img{visibility:hidden;}
#ctl .lchips{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-top:7px;}
#ctl .lchips .chip{padding:6px 8px;}
#ctl .link{all:unset;cursor:pointer;display:inline-block;margin-top:12px;font-size:12.5px;font-weight:750;color:var(--muted);}
.btn{all:unset;cursor:pointer;font-size:13px;font-weight:800;padding:9px 14px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid var(--line);text-align:center;min-width:44px;}
.btn.on{background:color-mix(in srgb,var(--sc,var(--light)) 22%,transparent);border-color:color-mix(in srgb,var(--sc,var(--light)) 55%,transparent);}
.btn:active{transform:scale(.97);} .btn[disabled]{opacity:.4;pointer-events:none;}
.btn:focus-visible,.chip:focus-visible,.seg button:focus-visible,#back:focus-visible{box-shadow:0 0 0 2px #fff;}
input[type=range]{flex:1 1 auto;accent-color:var(--light);height:28px;}
.big{font-size:30px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums;}
.cam{width:100%;border-radius:10px;margin-top:10px;display:block;background:#000;aspect-ratio:16/9;object-fit:cover;}
#list{flex:1 1 auto;min-height:0;overflow:auto;display:flex;flex-direction:column;}
#list .lh{font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);margin:2px 0 8px;}
#rows{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;align-content:start;}
#rows.many{grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;} #rows.many .chip{padding:6px 8px;}
.chip{all:unset;cursor:pointer;display:flex;align-items:center;gap:8px;min-width:0;padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.035);border:1px solid var(--line);}
.chip i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:var(--dim);}
.chip.on{border-color:color-mix(in srgb,var(--sc) 45%,transparent);background:color-mix(in srgb,var(--sc) 10%,transparent);}
.chip.on i{background:var(--sc);box-shadow:0 0 8px -1px var(--sc);}
.chip .t{min-width:0;flex:1 1 auto;}
.chip .n{font-size:12.5px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.chip .s{font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* mini: floors and rooms only, a summary beside it, tap to open the full ring */
#minibox{display:none;}
ha-card.mini{background:transparent;box-shadow:none;border:0;}
#app.mini{height:var(--hr-height,220px);grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:10px;padding:10px 12px;cursor:pointer;
  background:var(--cardgrad);border:1px solid rgba(255,255,255,.10);border-radius:var(--ha-card-border-radius,16px);}
#app.mini #side,#app.mini .hots{display:none;}
#app.mini #minibox{display:flex;flex-direction:column;justify-content:center;gap:7px;min-width:0;}
#minibox .mt{display:flex;align-items:center;gap:8px;font-size:15px;font-weight:800;}
#minibox .mt span{margin-left:auto;font-size:12px;font-weight:700;color:var(--muted);}
#minibox .ml{display:flex;align-items:center;gap:8px;font-size:13px;color:#cfd8e3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
#minibox .ml i{flex:0 0 auto;width:8px;height:8px;border-radius:50%;background:var(--sc);box-shadow:0 0 8px -1px var(--sc);}
#minibox .ml.off{color:var(--dim);} #minibox .ml.off i{background:var(--dim);box-shadow:none;}
/* narrow (phones, small cards): the ring on top, the hot buttons as a row above it, the panel underneath */
@container hr (max-width: 760px){
  #app:not(.mini){height:auto;grid-template-columns:minmax(0,1fr);}
  #app:not(.mini) #stage{display:flex;flex-direction:column;gap:8px;}
  #app:not(.mini) .hots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;}
  #app:not(.mini) .hot{position:relative;left:auto;top:auto;right:auto;bottom:auto;width:auto;padding:8px 9px;border-radius:13px;}
  #app:not(.mini) .hot .hi{font-size:12px;gap:5px;} #app:not(.mini) .hot svg{width:18px;height:18px;}
  #app:not(.mini) .hot .hv{font-size:11px;}
  #app:not(.mini) #ringbox{position:relative;inset:auto;width:100%;aspect-ratio:1;}
  #app:not(.mini) #ctl,#app:not(.mini) #list{overflow:visible;flex:none;}
}
@container hr (max-width: 420px){
  #app:not(.mini) .hot .hv{display:none;}
  #app:not(.mini){padding:10px;}
  #app:not(.mini) .hots{gap:5px;}
  #app:not(.mini) .hot{padding:7px 6px;align-items:center;}
  #app:not(.mini) .hot .hi{flex-direction:column;gap:3px;font-size:11px;}
  #app:not(.mini) .hot .md{position:absolute;top:6px;right:6px;}
}
`;

const HR_HTML = `
<ha-card>
<div id="app">
  <div id="stage">
    <div class="hots">
      <button class="hot tl"></button><button class="hot tr"></button><button class="hot bl"></button><button class="hot br"></button>
    </div>
    <div id="ringbox"><svg id="ring" aria-label="Home ring"></svg><div id="slide"></div><div id="toast" role="status" aria-live="polite"></div></div>
    <div id="wait">Waiting for Home Assistant…</div>
  </div>
  <div id="minibox"></div>
  <div id="side">
    <div class="card">
      <div style="display:flex;align-items:center;gap:8px"><div id="crumbs"></div><button id="back" hidden></button></div>
      <div id="title">Home</div>
      <div id="summary"></div>
      <div class="tools"><div class="seg" id="mode" role="group" aria-label="Arrange by"><button data-m="rooms">By room</button><button data-m="systems">By system</button></div>
        <div class="seg" id="lockseg" hidden><button id="lock" aria-pressed="false"></button><button id="tidy" hidden title="Lay the rooms out afresh and lock them there">Re-tidy</button></div>
        <div class="seg"><button id="custom" hidden></button></div>
        <div id="legend" title="Room colour shows its thermostat's temperature: blue = cold, orange = warm">Cold<i></i>Warm</div></div>
    </div>
    <div class="card" id="ctl"></div>
    <div class="card" id="list"><div class="lh" id="lh"></div><div id="rows"></div></div>
  </div>
</div>
</ha-card>`;

/* ---------- small helpers ---------- */
const NS = 'http://www.w3.org/2000/svg', TAU = Math.PI * 2;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = v => { const x = parseFloat(v); return isFinite(x) ? x : null; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, easeIO = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const asList = v => v == null || v === false ? [] : Array.isArray(v) ? v : [v];
// a list of patterns: an entity id, or part of one with * wildcards ("light.tablet_*", "*_segment_*");
// anything else is a word looked for in the name ("screen")
function matcher(list) {
  const L = asList(list).map(String).filter(Boolean).map(p => !/\s/.test(p) && (p.includes('*') || /^[a-z_]+\.[a-z0-9_]+$/i.test(p))
    ? { re: new RegExp('^' + p.split('*').map(escRe).join('.*') + '$', 'i') } : { word: p.toLowerCase() });
  return (eid, name) => L.some(m => m.re ? m.re.test(eid) : (String(name || '') + ' ' + eid.replace(/_/g, ' ')).toLowerCase().includes(m.word));
}

/* ---------- the kinds of thing, and how they look ---------- */
const CATS = {
  lights:  { name: 'Lights', sc: 'var(--light)' },
  heating: { name: 'Heating', sc: 'var(--heat)' },
  media:   { name: 'TV & music', sc: 'var(--media)' },
  sensors: { name: 'Doors & motion', sc: 'var(--alert)' },
  safety:  { name: 'Safety', sc: 'var(--alert)' },
  alarm:   { name: 'Alarm', sc: 'var(--alert)' },
  locks:   { name: 'Locks', sc: 'var(--alert)' },
  cameras: { name: 'Cameras', sc: 'var(--cam)' },
  fans:    { name: 'Fans', sc: 'var(--fan)' },
  covers:  { name: 'Blinds', sc: 'var(--fan)' },
  valves:  { name: 'Valves', sc: 'var(--fan)' },
  vacuums: { name: 'Vacuums', sc: 'var(--media)' },
  sirens:  { name: 'Sirens', sc: 'var(--alert)' },
  plugs:   { name: 'Plugs', sc: 'var(--plug)' },
  readings: { name: 'Sensors', sc: 'var(--fan)' },
  other:   { name: 'Other', sc: 'var(--cam)' },
};
const NO_COUNT = ['readings', 'other'];                    // never counted in "… on" summaries
const CAT_ORDER = Object.keys(CATS);
CATS.power = { name: 'Power', sc: 'var(--light)' };     // energy readings only show in the By-system view
const SYSTEMS = [
  { id: 'lights', name: 'Lights', cats: ['lights'], hue: '#e0a33a' },
  { id: 'heating', name: 'Heating', cats: ['heating', 'fans'], hue: '#e4704f' },
  { id: 'energy', name: 'Energy', cats: ['power', 'plugs'], hue: '#2fb8a6' },
  { id: 'media', name: 'TV & music', cats: ['media'], hue: '#3fbf7f' },
  { id: 'security', name: 'Security', cats: ['alarm', 'safety', 'sensors', 'locks', 'sirens', 'cameras'], hue: '#a77cf2' },
  { id: 'covers', name: 'Blinds & valves', cats: ['covers', 'valves'], hue: '#5b8def' },
  { id: 'other', name: 'Other', cats: ['vacuums', 'readings', 'other'], hue: '#8a97a6' },
];
const ENERGY_COLOURS = { solar: 'var(--light)', battery: 'var(--plug)', battery_level: 'var(--plug)', grid: 'var(--alert)', load: 'var(--media)', other: 'var(--fan)' };
const SENSOR_CLASSES = ['door', 'window', 'garage_door', 'opening', 'motion', 'occupancy', 'presence'];
const SAFETY_LABEL = { moisture: 'Water leak', smoke: 'Smoke', gas: 'Gas', carbon_monoxide: 'Carbon monoxide', safety: 'Safety alarm' };
// never a thing of its own on the ring (scenes have their band; the rest is housekeeping)
const NEVER = ['scene', 'update', 'image', 'automation', 'zone', 'person', 'device_tracker', 'tts', 'stt', 'wake_word', 'conversation',
  'assist_satellite', 'sun', 'weather', 'calendar', 'todo', 'text', 'notify', 'ai_task', 'time', 'date', 'datetime'];
// what a device with no ring kind is shown by (its first match), before its readings
const PRIMARY = ['remote', 'script', 'button', 'input_button', 'select', 'input_select', 'number', 'input_number'];
const FLOOR_HUES = ['#5b8def', '#a77cf2', '#2fb8a6', '#e0a33a', '#e46f8f'];
const RING_WT = { floor: 1, area: 1.12, cat: 0.82, ent: 1.08 };
const HOLD_MS = 480, MOVE_PX = 10, SLIDE_PX = 2.2;      // a 220 px slide covers 0-100 %
const MINI_LEVELS = 2;                                  // mini: floors + rooms

function normaliseConfig(c) {
  c = c || {};
  const heating = c.heating || {};
  return {
    mini: !!c.mini,
    height: c.height || null,
    mode: c.mode === 'systems' ? 'systems' : 'rooms',
    navigation_path: c.navigation_path || null,
    back_path: c.back_path || null,
    back_label: c.back_label || 'Back',
    exclude: matcher(c.exclude),
    exclude_areas: asList(c.exclude_areas).map(s => String(s).toLowerCase()),
    strip_prefixes: asList(c.strip_prefixes).map(String).filter(Boolean),
    lights_exclude: matcher(c.lights_exclude),
    scenes: c.scenes === undefined ? true : c.scenes,
    hot_buttons: c.hot_buttons === undefined ? true : c.hot_buttons,
    cameras: Array.isArray(c.cameras) ? c.cameras : null,
    camera_refresh: Math.max(1, num(c.camera_refresh) || 2),
    cameras_path: c.cameras_path || null,
    alarm: c.alarm || null,
    alarm_path: c.alarm_path || null,
    heating_entity: heating.entity || null,
    heating_hold_mode: heating.hold_mode || null,
    energy: asList(c.energy).map(e => typeof e === 'string' ? { entity: e } : e).filter(e => e && e.entity),
    voice_entity: c.voice_entity || null,
    temperature_tint: c.temperature_tint !== false,
    comfort: num(c.comfort_temperature) ?? 20.5,
    span: Math.max(0.5, num(c.temperature_span) ?? 4),
    motion_pulse: c.motion_pulse !== false,
    devices: c.devices !== false,
    safety_alerts: c.safety_alerts !== false,
    layout_lock: c.layout_lock !== false,
    layout_key: String(c.layout_key || 'home_ring_layout'),
    corners: c.corners || null,
    corners_key: String(c.corners_key || 'home_ring_corners'),
    customise: c.customise !== false,
  };
}

/* ======================================================================================================
   The ring itself. One per card; everything lives in the card's shadow root.
   ====================================================================================================== */
function createRing(sr, host, CFG) {
  const $ = id => sr.getElementById(id);
  const Q = s => sr.querySelector(s), QA = s => sr.querySelectorAll(s);
  const PFX = 'hr' + Math.random().toString(36).slice(2, 7) + '-';   // ids for the curved-label paths
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MINI = CFG.mini;
  if (MINI) { $('app').classList.add('mini'); Q('ha-card').classList.add('mini'); }
  if (CFG.height) $('app').style.setProperty('--hr-height', CFG.height);
  if (!CFG.hot_buttons) QA('.hot').forEach(b => b.hidden = true);
  if (!CFG.temperature_tint) $('legend').style.display = 'none';

  const LS = { get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  let MODE = LS.get('homeRingMode') || CFG.mode; if (MODE !== 'systems') MODE = 'rooms';
  const ENERGY_BY = Object.fromEntries(CFG.energy.map(e => [e.entity, e]));

  const navigate = p => { if (!p) return; window.history.pushState(null, '', p); window.dispatchEvent(new CustomEvent('location-changed', { detail: { replace: false } })); };
  const moreInfo = eid => { if (eid) host.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId: eid }, bubbles: true, composed: true })); };

  /* ---------- what goes in the ring ---------- */
  const isMotion = (eid, a) => eid.startsWith('binary_sensor.') && (a.device_class === 'motion' || ((a.device_class === 'occupancy' || a.device_class === 'presence') && /person|motion/.test(eid)));
  function tempTint(t) { const k = clamp(Math.abs(t - CFG.comfort) / CFG.span, 0, 1); return k < .08 ? null : { col: t < CFG.comfort ? '#4a8dff' : '#ff8a3d', pct: Math.round(12 + 38 * k) }; }
  function catOf(eid, st) {
    const d = eid.split('.')[0], a = st.attributes || {};
    if (d === 'light') return 'lights';
    if (d === 'switch') return /light|lamp|bulb/i.test(eid + ' ' + (a.friendly_name || '')) ? 'lights' : 'plugs';
    if (d === 'climate' || d === 'water_heater') return 'heating';
    if (d === 'media_player') return 'media';
    if (d === 'camera') return 'cameras';
    if (d === 'fan') return 'fans';
    if (d === 'cover') return 'covers';
    if (d === 'binary_sensor') return SAFETY_LABEL[a.device_class] ? 'safety' : SENSOR_CLASSES.includes(a.device_class) ? 'sensors' : null;
    if (d === 'alarm_control_panel') return 'alarm';
    if (d === 'lock') return 'locks';
    if (d === 'valve') return 'valves';
    if (d === 'vacuum' || d === 'lawn_mower') return 'vacuums';
    if (d === 'siren') return 'sirens';
    if (d === 'humidifier') return 'heating';
    if (d === 'input_boolean') return 'other';
    return null;
  }
  function watts(eid, st) {
    const v = num(st && st.state); if (v == null) return null;
    const u = ((st.attributes || {}).unit_of_measurement || '').toLowerCase(), e = ENERGY_BY[eid];
    const w = u === 'kw' ? v * 1000 : u === 'w' ? v : null;
    return w == null ? null : (e && e.invert ? -w : w);
  }
  function isActive(eid, st) {
    if (!st) return false;
    const d = eid.split('.')[0], s = st.state, a = st.attributes || {};
    if (d === 'climate') return a.hvac_action === 'heating' || a.hvac_action === 'cooling';
    if (d === 'water_heater') return !['off', 'unavailable', 'unknown', 'idle'].includes(s) && a.operation_mode !== 'off';
    if (d === 'media_player') return s === 'playing';
    if (d === 'cover') return s === 'open' || s === 'opening';
    if (d === 'camera') return false;
    if (d === 'alarm_control_panel') return !['disarmed', 'unavailable', 'unknown'].includes(s);
    if (d === 'sensor') { const w = watts(eid, st); return w != null && Math.abs(w) >= 40; }
    if (d === 'lock') return ['unlocked', 'open', 'opening', 'unlocking', 'jammed'].includes(s);
    if (d === 'valve') return s === 'open' || s === 'opening';
    if (d === 'vacuum' || d === 'lawn_mower') return ['cleaning', 'mowing', 'returning'].includes(s);
    return s === 'on';
  }
  const unavail = st => !st || st.state === 'unavailable' || st.state === 'unknown';
  function stateText(eid, st) {
    if (!st) return 'missing';
    const d = eid.split('.')[0], s = st.state, a = st.attributes || {};
    if (s === 'unavailable') return 'unavailable';
    if (d === 'light') return s === 'on' ? (a.brightness != null ? Math.round(a.brightness / 2.55) + '%' : 'on') : 'off';
    if (d === 'climate') return (a.current_temperature != null ? a.current_temperature + '°' : '') + (a.temperature != null ? ' → ' + a.temperature + '°' : '') + (a.hvac_action === 'heating' ? ' · heating' : a.hvac_action === 'cooling' ? ' · cooling' : '');
    if (d === 'media_player') return s === 'playing' ? (a.media_title || 'playing') : s;
    if (d === 'alarm_control_panel') return s.replace(/_/g, ' ');
    if (d === 'lock' || d === 'valve' || d === 'vacuum' || d === 'lawn_mower') return nice(s);
    if (d === 'button' || d === 'input_button') return isFinite(Date.parse(s)) ? 'pressed ' + hhmm(s) : 'never pressed';
    if (d === 'event') return isFinite(Date.parse(s)) ? nice(a.event_type || 'event') + ' · ' + hhmm(s) : 'nothing yet';
    if (d === 'number' || d === 'input_number') return s + (a.unit_of_measurement ? ' ' + a.unit_of_measurement : '');
    if (d === 'binary_sensor') { const open = ['door', 'window', 'garage_door', 'opening'].includes(a.device_class); return s === 'on' ? (open ? 'open' : 'detected') : (open ? 'closed' : 'clear'); }
    if (d === 'sensor') {
      const v = num(s), u = a.unit_of_measurement || ''; if (v == null) return s;
      const w = watts(eid, st), kind = (ENERGY_BY[eid] || {}).kind;
      if (w != null) {
        const m = Math.abs(w), t = m >= 1000 ? (m / 1000).toFixed(1) + ' kW' : Math.round(m) + ' W';
        if (kind === 'grid') return m < 40 ? 'idle' : (w > 0 ? 'importing ' : 'exporting ') + t;
        if (kind === 'battery') return m < 40 ? 'idle' : (w > 0 ? 'charging ' : 'discharging ') + t;
        return t;
      }
      if (a.device_class === 'timestamp') return isFinite(Date.parse(s)) ? hhmm(s) : s;
      const r = Math.abs(v) >= 100 || Number.isInteger(v) ? Math.round(v) : Math.round(v * 10) / 10;
      return r + (u === '%' ? '%' : u ? ' ' + u : '');
    }
    if (a.device_class === 'timestamp' && isFinite(Date.parse(s))) return hhmm(s);
    return s;
  }
  const STRIP = CFG.strip_prefixes.length ? new RegExp('^(' + CFG.strip_prefixes.map(escRe).join('|') + ')\\s+', 'i') : null;
  function shortName(st, eid, area, text) {
    let n = text || (st && st.attributes && st.attributes.friendly_name) || eid.split('.')[1].replace(/_/g, ' ');
    if (STRIP) n = n.replace(STRIP, '');
    if (area) {          // "Kitchen Ceiling" in the Kitchen is just "Ceiling" (but "Utility Room" never becomes "Room")
      const re = new RegExp('^' + escRe(area).replace(/s\b/gi, "'?s") + '\\s+', 'i'), m = n.replace(re, '');
      if (m.length > 2 && !/^(room|lights?)$/i.test(m)) n = m;
    }
    n = n.replace(/\b(\w+)\s+\1\b/gi, '$1');   // "Microphone Microphone mute" -> "Microphone mute"
    return n.charAt(0).toUpperCase() + n.slice(1);
  }

  /* ---------- the tree: Home > floors > rooms > kinds > things ---------- */
  let nodes = [], root = null, focus = null, sel = null, hot = null, hoverN = null, H = null, lastStates = null;
  /* ---------- layout lock: every floor, room, kind and thing keeps its place and size ----------
     A saved layout lists, for every group, its children in order with their sizes, and where each room's centre
     was. While it is locked, known things keep their saved order and size, new ones join the end of their group,
     and the ring turns slightly so the rooms you know stay where they were. */
  const nodeKey = n => n.kind === 'home' ? 'h' : n.kind === 'floor' ? 'f:' + (n.id ?? '_') : n.kind === 'area' ? 'a:' + n.id : n.kind === 'cat' ? 'c:' + n.cat : 'e:' + n.eid;
  const pathKey = n => n.parent ? pathKey(n.parent) + '/' + nodeKey(n) : nodeKey(n);
  let LAYOUT = null;
  function applyLock(n, order) {
    if (!n.kids.length) return;
    const saved = order[pathKey(n)];
    if (saved) {
      const idx = new Map(saved.map((s, i) => [s[0], i])), wt = new Map(saved);
      n.kids.sort((a, b) => (idx.get(nodeKey(a)) ?? 1e9) - (idx.get(nodeKey(b)) ?? 1e9));   // stable: new ones stay in name order at the end
      // a new room or floor starts slim (Re-tidy gives it its full size); new things squeeze into their room
      n.kids.forEach(k => { const w = wt.get(nodeKey(k)); if (w != null) k.lw = w; else if (k.kind === 'area' || k.kind === 'floor') k.lw = 1; });
    }
    n.kids.forEach(k => applyLock(k, order));
    if (saved && n.kind === 'floor' && n.lw != null) {   // a floor grows or shrinks with the rooms it gains or loses
      const was = saved.reduce((s, x) => s + x[1], 0), now = n.kids.reduce((s, k) => s + (k.lw ?? 1), 0);
      if (was > 0 && now > 0) n.lw *= now / was;
    }
  }
  function build(h, ignoreLock) {
    const floors = h.floors || {}, devices = h.devices || {}, ents = h.entities || {}, states = h.states;
    const areas = Object.assign({}, h.areas || {});
    for (const a of Object.keys(areas)) { const ar = areas[a]; if (CFG.exclude_areas.includes(String(a).toLowerCase()) || CFG.exclude_areas.includes(String(ar.name).toLowerCase())) delete areas[a]; }
    areas._energy = { area_id: '_energy', name: 'Energy system', floor_id: null };
    const flist = Object.values(floors).sort((a, b) => (a.level ?? 99) - (b.level ?? 99) || String(a.name).localeCompare(b.name));
    const byArea = {}, tempBy = {}, devShown = new Set(), left = {};
    const areaOf = r => r && (r.area_id || (r.device_id && devices[r.device_id] && devices[r.device_id].area_id));
    for (const eid in states) {
      const r = ents[eid]; if (!r) continue;                 // only things in the entity registry have rooms
      if (r.hidden || r.entity_category) continue;
      const st = states[eid], nm = (st.attributes || {}).friendly_name;
      if (CFG.exclude(eid, nm)) continue;
      const area = areaOf(r);
      if (!area || !areas[area]) continue;
      // a room's temperature = its thermostat (other temperature sensors are often batteries or device chips)
      if (eid.startsWith('climate.') && !tempBy[area] && num((st.attributes || {}).current_temperature) != null) tempBy[area] = eid;
      const c = catOf(eid, st);
      if (c) { if (r.device_id) devShown.add(r.device_id); (byArea[area] = byArea[area] || []).push({ eid, c }); continue; }
      // no ring kind of its own: it belongs to its device (or stands alone if it has none)
      if (!CFG.devices || NEVER.includes(eid.split('.')[0])) continue;
      const key = r.device_id || '~' + eid; (left[key] = left[key] || { area, eids: [] }).eids.push(eid);
    }
    // every device with a room is on the ring: one slice for a device that has nothing on it yet, shown by its most
    // useful entity, with the rest as readings on its card. A device already on the ring carries its extras the same way.
    READ = {};
    for (const key in left) {
      const L = left[key], dev = key[0] === '~' ? null : devices[key];
      if (dev && devShown.has(key)) { READ[key] = L.eids; continue; }
      const devName = dev ? (dev.name_by_user || dev.name || '') : '';
      if (dev && devName && CFG.exclude('', devName)) continue;
      const primary = pickPrimary(L.eids, states); if (!primary) continue;
      const c = L.eids.every(e => /^(sensor|binary_sensor|event)\./.test(e)) ? 'readings' : 'other';
      (byArea[L.area] = byArea[L.area] || []).push({ eid: primary, c, dev: dev ? key : null, devName });
      if (dev) READ[key] = L.eids;
    }
    const sysMode = MODE === 'systems' && !MINI;
    if (sysMode) for (const e of CFG.energy) {
      if (!states[e.entity]) continue;
      const area = areaOf(ents[e.entity]), a = area && areas[area] ? area : '_energy';
      (byArea[a] = byArea[a] || []).push({ eid: e.entity, c: 'power' });
    }
    const mk = (kind, name, extra) => Object.assign({ kind, name, kids: [], parent: null }, extra || {});
    const entNode = (x, a, hue) => {
      const e = x.c === 'power' ? ENERGY_BY[x.eid] : null;
      return mk('ent', e && e.name ? e.name : shortName(states[x.eid], x.eid, areas[a].name, x.devName),
        { hue, cat: x.c, sc: e ? (e.color || ENERGY_COLOURS[e.kind] || ENERGY_COLOURS.other) : CATS[x.c].sc, eid: x.eid, dev: x.dev || null });
    };
    const R = mk('home', 'Home');
    const byName = (a, b) => areas[a].name.localeCompare(areas[b].name);
    if (sysMode) {
      for (const sy of SYSTEMS) {
        const sn = mk('floor', sy.name, { hue: sy.hue, id: 'sys:' + sy.id, sys: sy.id });
        const areaIds = Object.keys(byArea).filter(a => byArea[a].some(x => sy.cats.includes(x.c))).sort(byName);
        for (const a of areaIds) {
          const an = mk('area', areas[a].name, { hue: sy.hue, id: a, tempEid: tempBy[a] });
          byArea[a].filter(x => sy.cats.includes(x.c)).map(x => entNode(x, a, sy.hue))
            .sort((p, q) => p.name.localeCompare(q.name)).forEach(e => { e.parent = an; an.kids.push(e); });
          an.parent = sn; sn.kids.push(an);
        }
        if (sn.kids.length) { sn.parent = R; R.kids.push(sn); }
      }
    } else {
      const roomNode = (a, hue) => {
        const an = mk('area', areas[a].name, { hue, id: a, tempEid: tempBy[a] });
        for (const c of CAT_ORDER) {
          const items = byArea[a].filter(x => x.c === c); if (!items.length) continue;
          const cn = mk('cat', CATS[c].name, { hue, cat: c, sc: CATS[c].sc });
          items.map(x => entNode(x, a, hue)).sort((p, q) => p.name.localeCompare(q.name)).forEach(e => { e.parent = cn; cn.kids.push(e); });
          cn.parent = an; an.kids.push(cn);
        }
        return an;
      };
      const roomsOn = fid => Object.keys(areas).filter(a => a !== '_energy' && (areas[a].floor_id || null) === fid && byArea[a]).sort(byName);
      if (!flist.length) {                                    // no floors set up: the rooms go straight round the house
        roomsOn(null).forEach((a, i) => { const an = roomNode(a, FLOOR_HUES[i % FLOOR_HUES.length]); an.parent = R; R.kids.push(an); });
      } else {
        const groups = flist.map((f, i) => ({ f, hue: FLOOR_HUES[i % FLOOR_HUES.length] }));
        groups.push({ f: { floor_id: null, name: 'Other rooms' }, hue: '#8a97a6' });
        for (const g of groups) {
          const fn = mk('floor', g.f.name, { hue: g.hue, id: g.f.floor_id });
          for (const a of roomsOn(g.f.floor_id || null)) { const an = roomNode(a, g.hue); an.parent = fn; fn.kids.push(an); }
          if (fn.kids.length) { fn.parent = R; R.kids.push(fn); }
        }
      }
    }
    const snap = !ignoreLock && CFG.layout_lock && LAYOUT && LAYOUT.modes && LAYOUT.modes[sysMode ? 'systems' : 'rooms'];
    if (snap && snap.order) applyLock(R, snap.order);
    nodes = [];
    (function walk(n, d) { n.depth = d; n.i = nodes.length; nodes.push(n); n.kids.forEach((k, j) => { k.alt = j % 2 === 1; walk(k, d + 1); }); })(R, 0);
    (function weigh(n) { n.w = n.kids.length ? n.kids.reduce((s, k) => s + weigh(k), 0) : 1; return n.w; })(R);
    (function part(n, x0, x1) {   // sizes grow with the number of things, gently (a locked layout keeps its saved sizes)
      n.x0 = x0; n.x1 = x1; const ws = n.kids.map(k => k.lw ?? Math.pow(k.w, .6)), t = ws.reduce((a, b) => a + b, 0) || 1; let x = x0;
      n.kids.forEach((k, i) => { const x2 = x + (x1 - x0) * ws[i] / t; part(k, x, x2); x = x2; });
    })(R, 0, 1);
    // locked: turn the ring so the rooms you know sit, on average, exactly where they were saved
    R.rot = 0;
    if (snap && snap.centres) {
      let s = 0, sw = 0;
      for (const n of nodes) {
        if (n.kind !== 'area') continue; const c = snap.centres[pathKey(n)]; if (c == null) continue;
        let d = c - (n.x0 + n.x1) / 2; d -= Math.round(d); const w = n.x1 - n.x0; s += d * w; sw += w;
      }
      if (sw) R.rot = s / sw;
    }
    return R;
  }
  const leaves = n => n.kind === 'ent' ? [n] : n.kids.flatMap(leaves);
  let READ = {};                                          // device id -> its entities that are not on the ring
  function pickPrimary(eids, states) {
    for (const d of PRIMARY) { const e = eids.find(x => x.startsWith(d + '.')); if (e) return e; }
    const ok = x => states[x] && !unavail(states[x]);
    const cls = c => eids.find(x => x.startsWith('sensor.') && ok(x) && (states[x].attributes || {}).device_class === c && num(states[x].state) != null);
    // a room sensor (temperature with humidity, or just a few readings) is best shown by its temperature;
    // bigger kit (inverters, chargers, batteries) by its power, then its charge
    const climate = cls('humidity') || eids.length <= 4;
    return (climate && cls('temperature')) || cls('power') || cls('battery') || cls('temperature') || cls('humidity') || eids.find(x => x.startsWith('binary_sensor.') && ok(x))
      || eids.find(x => x.startsWith('sensor.') && ok(x) && num(states[x].state) != null) || eids.find(x => !x.startsWith('event.') && ok(x)) || eids[0];
  }
  const devOf = n => n.dev || ((H && H.entities && H.entities[n.eid]) || {}).device_id || null;
  const findSame = n => n && nodes.find(m => m.kind === n.kind && m.name === n.name && (m.eid || m.id || '') === (n.eid || n.id || '') && (m.parent && n.parent ? m.parent.name === n.parent.name : true));

  /* ---------- geometry + drawing ---------- */
  const svg = $('ring'); let gW, gL, gC, gS, defs, S = 800, B = [], RMAX = 0, SCN = null, anim = null;
  const view = { x0: 0, x1: 1, d: 0 };
  function setup() {
    svg.innerHTML = '<defs></defs><g class="gw"></g><g class="gl"></g><g class="gs"></g><g class="gc"></g>';
    defs = svg.querySelector('defs'); gW = svg.querySelector('.gw'); gL = svg.querySelector('.gl'); gS = svg.querySelector('.gs'); gC = svg.querySelector('.gc');
  }
  function geom(at) {
    const r = $('ringbox').getBoundingClientRect(); S = Math.max(280, Math.floor(Math.min(r.width, r.height || r.width)));
    const n = at || focus || root, kinds = []; for (let q = n.kids[0]; q; q = q.kids[0]) kinds.push(q.kind);
    if (MINI) kinds.splice(MINI_LEVELS);
    const wt = (kinds.length ? kinds : ['ent']).map(k => RING_WT[k] || 1), sum = wt.reduce((a, b) => a + b, 0);
    const band = !MINI && n.kind === 'home' && sceneList().length > 1, SB = band ? clamp(S * .05, 28, 42) : 0;
    const R0 = clamp(S * .115, 48, 92), avail = S / 2 - 8 - R0 - (band ? SB + 8 : 0);
    B = [R0]; wt.forEach(w => B.push(B[B.length - 1] + avail * w / sum)); RMAX = B[B.length - 1];
    SCN = band ? [RMAX + 8, RMAX + 8 + SB] : null;
    svg.setAttribute('viewBox', `${-S / 2} ${-S / 2} ${S} ${S}`);
  }
  function edge(k) { if (k < 0) return Math.max(0, B[0] * (1 + k)); if (k >= B.length - 1) return RMAX; const i = Math.floor(k); return lerp(B[i], B[i + 1], k - i); }
  // the locked layout's turn applies to the whole house and fades out as you zoom into a floor
  const ang = x => clamp((x - view.x0) / (view.x1 - view.x0), 0, 1) * TAU - Math.PI + (root && root.rot ? root.rot * TAU * clamp(1 - view.d, 0, 1) : 0);
  const wrapA = a => a - TAU * Math.round(a / TAU);
  const pt = (a, r) => [r * Math.sin(a), -r * Math.cos(a)], f = v => v.toFixed(2);
  function arcD(a0, a1, r0, r1) {
    if (a1 - a0 >= TAU - 1e-5) {
      const o = `M0,${f(-r1)}A${f(r1)},${f(r1)} 0 1 1 0,${f(r1)}A${f(r1)},${f(r1)} 0 1 1 0,${f(-r1)}Z`;
      return r0 < .5 ? o : o + `M0,${f(-r0)}A${f(r0)},${f(r0)} 0 1 0 0,${f(r0)}A${f(r0)},${f(r0)} 0 1 0 0,${f(-r0)}Z`;
    }
    const L = a1 - a0 > Math.PI ? 1 : 0, [x0, y0] = pt(a0, r1), [x1, y1] = pt(a1, r1), [x2, y2] = pt(a1, r0), [x3, y3] = pt(a0, r0);
    return `M${f(x0)},${f(y0)}A${f(r1)},${f(r1)} 0 ${L} 1 ${f(x1)},${f(y1)}L${f(x2)},${f(y2)}A${f(r0)},${f(r0)} 0 ${L} 0 ${f(x3)},${f(y3)}Z`;
  }
  const states = () => (H && H.states) || {};
  const activeCount = n => leaves(n).filter(e => isActive(e.eid, states()[e.eid])).length;
  function roomTemp(n) { if (!n.tempEid) return null; const st = states()[n.tempEid]; return unavail(st) ? null : num((st.attributes || {}).current_temperature); }
  const deg = t => (Math.round(t * 10) / 10) + '°';
  function fillOf(n) {
    if (n.kind === 'home') return 'var(--hub)';
    if (n.kind === 'ent') {
      const st = states()[n.eid];
      if (unavail(st)) return `color-mix(in srgb, ${n.hue} 8%, var(--wedge))`;
      if (isActive(n.eid, st)) return `color-mix(in srgb, ${n.sc} 72%, var(--wedge))`;
      return `color-mix(in srgb, ${n.hue} ${n.alt ? 21 : 15}%, var(--wedge))`;
    }
    if (n.kind === 'cat' && activeCount(n)) return `color-mix(in srgb, ${n.sc} 42%, var(--wedge))`;
    // every other sibling a shade lighter, so two neighbours never share one colour
    const pct = ({ floor: 46, area: 32, cat: 22 }[n.kind] || 20) + (n.alt ? 7 : 0);
    const base = `color-mix(in srgb, ${n.hue} ${pct}%, var(--wedge))`;
    if (n.kind === 'area' && CFG.temperature_tint) { const t = roomTemp(n), tt = t != null && tempTint(t); if (tt) return `color-mix(in srgb, ${tt.col} ${tt.pct}%, ${base})`; }
    return base;
  }
  function draw() {
    for (const n of nodes) {
      const k = n.depth - view.d, a0 = ang(n.x0), a1 = ang(n.x1), r0 = edge(k - 1), r1 = edge(k);
      const vis = k > 0.01 && a1 - a0 > 1e-4 && r1 - r0 > .3 && (!MINI || k < MINI_LEVELS + .5);
      if (!n.g) { if (!vis) continue; makeWedge(n); }
      n.g.style.display = vis ? '' : 'none'; if (!vis) continue;
      Object.assign(n, { k, a0, a1, r0, r1 }); n.path.setAttribute('d', arcD(a0, a1, r0, r1));
    }
  }
  function makeWedge(n) {
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'w k-' + n.kind); g.dataset.i = n.i;
    g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', n.name);
    const p = document.createElementNS(NS, 'path'); g.appendChild(p); n.g = g; n.path = p; gW.appendChild(g); paint(n);
  }
  function paint(n) {
    if (!n.g) return;
    n.path.style.fill = fillOf(n);
    const act = n.kind !== 'ent' ? activeCount(n) > 0 : isActive(n.eid, states()[n.eid]);
    n.g.classList.toggle('active', act && n.kind !== 'floor'); if (n.sc) n.g.style.setProperty('--sc', n.sc);
    n.g.classList.toggle('pulse', n.kind === 'ent' && n.cat === 'media' && act);
    n.g.classList.toggle('sel', n === sel);
  }

  /* ---------- labels ---------- */
  const cv = document.createElement('canvas').getContext('2d');
  const textW = (s, font) => { cv.font = font; return cv.measureText(s).width; };
  const FONT = px => `650 ${px}px -apple-system,"Segoe UI",Roboto,sans-serif`;
  function fitText(s, px, avail) { if (textW(s, FONT(px)) <= avail) return s; while (s.length > 2 && textW(s + '…', FONT(px)) > avail) s = s.slice(0, -1); return s.length > 2 ? s + '…' : null; }
  function subOf(n) {
    if (n.kind === 'ent') return stateText(n.eid, states()[n.eid]);
    const on = activeCount(n);
    if (n.kind === 'cat') return on ? on + ' on' : '';
    const parts = CAT_ORDER.filter(c => !NO_COUNT.includes(c)).map(c => { const k = leaves(n).filter(e => e.cat === c && isActive(e.eid, states()[e.eid])).length; return k ? k + ' ' + CATS[c].name.toLowerCase() : null; }).filter(Boolean);
    const t = n.kind === 'area' ? roomTemp(n) : null;
    return [t != null ? deg(t) : null, ...parts.slice(0, 2)].filter(Boolean).join(' · ');
  }
  function labels() {
    gL.textContent = ''; gC.textContent = ''; defs.textContent = '';
    for (const n of nodes) {
      if (!n.g || n.g.style.display === 'none') continue;
      const k = Math.round(n.k); if (k < 1) continue;
      const { a0, a1, r0, r1 } = n, span = a1 - a0, rm = (r0 + r1) / 2, arc = span * rm, thick = r1 - r0;
      const px = k === 1 ? 15 : k === 2 ? 13.5 : 12.5, sub = subOf(n);
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'lb');
      if (arc > thick * 1.05 && arc > 64) {             // wide: the name curves along the ring
        const mid = wrapA((a0 + a1) / 2), bottom = Math.abs(mid) > Math.PI / 2;
        const name = fitText(n.name, px, arc - 16); if (!name) continue;
        const showS = sub && thick >= 40, rN = showS ? (bottom ? rm - 7 : rm + 7) : rm, rS = bottom ? rm + 10 : rm - 10;
        const mkp = (r, id) => {
          const pad = .004, s = bottom ? a1 - pad : a0 + pad, e = bottom ? a0 + pad : a1 - pad, [x0, y0] = pt(s, r), [x1, y1] = pt(e, r), L = span > Math.PI ? 1 : 0;
          const d = document.createElementNS(NS, 'path'); d.id = id; d.setAttribute('d', `M${f(x0)},${f(y0)}A${f(r)},${f(r)} 0 ${L} ${bottom ? 0 : 1} ${f(x1)},${f(y1)}`); defs.appendChild(d);
        };
        mkp(rN, PFX + 'ln' + n.i);
        g.innerHTML = `<text class="nm" style="font-size:${px}px" dominant-baseline="central"><textPath href="#${PFX}ln${n.i}" startOffset="50%" text-anchor="middle">${esc(name)}</textPath></text>`;
        if (showS) { const s2 = fitText(sub, 10.5, arc - 16); if (s2) { mkp(rS, PFX + 'ls' + n.i); g.innerHTML += `<text class="sub" dominant-baseline="central"><textPath href="#${PFX}ls${n.i}" startOffset="50%" text-anchor="middle">${esc(s2)}</textPath></text>`; } }
      } else {                                            // narrow: the name runs outwards
        const lh = 13, rpx = Math.min(px, 12.5), lines = Math.floor((arc - 3) / lh), avail = thick - 12;
        if (lines < 1 || avail < 20) continue;
        const rows = [[fitText(n.name, rpx, avail), 'nm']]; if (lines >= 2 && sub) rows.push([fitText(sub, 10.5, avail), 'sub']);
        const ok = rows.filter(r => r[0]); if (!ok.length) continue;
        const mid = wrapA((a0 + a1) / 2), dg = mid * 180 / Math.PI, right = mid >= 0, rot = right ? dg - 90 : dg + 90, x = right ? r0 + 7 : -(r0 + 7);
        g.setAttribute('transform', `rotate(${f(rot)})`);
        g.innerHTML = ok.map((r, i) => `<text class="${r[1]}" x="${f(x)}" y="${f((i - (ok.length - 1) / 2) * lh)}" text-anchor="${right ? 'start' : 'end'}" dominant-baseline="central"${r[1] === 'nm' ? ` style="font-size:${rpx}px"` : ''}>${esc(r[0])}</text>`).join('');
      }
      gL.appendChild(g);
    }
    // the centre: where you are
    const c = document.createElementNS(NS, 'g'); c.setAttribute('class', 'ctr');
    const r = B[0]; let nm = focus.name;
    const fpx = r > 70 ? 20 : 16; nm = fitText(nm, fpx, r * 1.75) || nm;
    const sub = focus.kind === 'home' ? homeSummary() : subOf(focus);
    c.innerHTML = `<circle class="hub" r="${f(r - 2)}"></circle><text class="lb cn" text-anchor="middle" dominant-baseline="central" y="${sub ? -9 : 0}" style="font-size:${fpx}px">${esc(nm)}</text>` +
      (sub ? `<text class="lb cs" text-anchor="middle" dominant-baseline="central" y="13">${esc(fitText(sub, 12, r * 1.7) || '')}</text>` : '') +
      (focus.kind !== 'home' ? `<text class="lb cs" text-anchor="middle" dominant-baseline="central" y="${f(r * .62)}">↑ back</text>` : '');
    gC.appendChild(c);
    c.querySelector('circle').addEventListener('click', () => { if (focus.parent) setFocus(focus.parent); });
    drawScenes();
  }
  function homeSummary() { const on = leaves(root).filter(e => e.cat === 'lights' && isActive(e.eid, states()[e.eid])).length; return on + ' light' + (on === 1 ? '' : 's') + ' on'; }

  /* ---------- scenes: a band around the whole house; tap one to run it ---------- */
  const sceneName = eid => { const st = states()[eid]; return (st && st.attributes && st.attributes.friendly_name) || eid.split('.')[1].replace(/_/g, ' '); };
  function sceneList(noLock) {
    if (!H || !CFG.scenes) return [];
    if (Array.isArray(CFG.scenes)) return CFG.scenes.filter(e => H.states[e]);
    const ents = H.entities || {};
    const L = Object.keys(H.states).filter(e => e.startsWith('scene.') && !(ents[e] && (ents[e].hidden || ents[e].entity_category)) && !CFG.exclude(e, sceneName(e)))
      .sort((a, b) => sceneName(a).localeCompare(sceneName(b)));
    const saved = !noLock && CFG.layout_lock && LAYOUT && LAYOUT.scenes;      // locked: known scenes keep their place, new ones join the end
    if (saved) { const idx = new Map(saved.map((e, i) => [e, i])); L.sort((a, b) => (idx.get(a) ?? 1e9) - (idx.get(b) ?? 1e9)); }
    return L;
  }
  function drawScenes() {
    gS.textContent = '';
    if (!SCN || focus !== root || anim) return;
    const L = sceneList(), n = L.length; if (n < 2) return;
    const [r0, r1] = SCN, rm = (r0 + r1) / 2, gap = Math.min(.02, 6 / rm);
    let last = null, lt = 0;                          // the scene run most recently (within 6 h) stays lit
    L.forEach(e => { const t = Date.parse(states()[e].state); if (t > lt) { lt = t; last = e; } });
    if (Date.now() - lt > 6 * 3600e3) last = null;
    L.forEach((eid, i) => {
      const a0 = -Math.PI + i * TAU / n + gap, a1 = -Math.PI + (i + 1) * TAU / n - gap, mid = (a0 + a1) / 2, bottom = Math.abs(mid) > Math.PI / 2;
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'scn' + (eid === last ? ' last' : ''));
      g.setAttribute('role', 'button'); g.setAttribute('tabindex', '0'); g.setAttribute('aria-label', 'Run scene ' + sceneName(eid));
      const p = document.createElementNS(NS, 'path'); p.setAttribute('d', arcD(a0, a1, r0, r1)); g.appendChild(p);
      const [x0, y0] = pt(bottom ? a1 : a0, rm), [x1, y1] = pt(bottom ? a0 : a1, rm);
      const d = document.createElementNS(NS, 'path'); d.id = PFX + 'sc' + i; d.setAttribute('d', `M${f(x0)},${f(y0)}A${f(rm)},${f(rm)} 0 0 ${bottom ? 0 : 1} ${f(x1)},${f(y1)}`); defs.appendChild(d);
      const label = fitText(sceneName(eid), 12.5, (a1 - a0) * rm - 14);
      if (label) { const t = document.createElementNS(NS, 'g'); t.innerHTML = `<text dominant-baseline="central"><textPath href="#${PFX}sc${i}" startOffset="50%" text-anchor="middle">${esc(label)}</textPath></text>`; g.appendChild(t); }
      const run = () => { call('scene', 'turn_on', { entity_id: eid }); buzz(); g.classList.add('flash'); setTimeout(() => g.classList.remove('flash'), 600); toast(sceneName(eid) + ' scene on'); };
      g.addEventListener('click', run);
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); } });
      gS.appendChild(g);
    });
  }

  /* ---------- focus + movement ---------- */
  function setFocus(n) {
    if (!n || n.kind === 'ent') return;
    if (sel && !leaves(n).includes(sel)) sel = null;
    focus = n; hover(null); side(); controls(); geom(n);
    const to = { x0: n.x0, x1: n.x1, d: n.depth }, from = { ...view };
    cancelAnimationFrame(anim);
    if (REDUCED) { Object.assign(view, to); draw(); labels(); return; }
    const t0 = performance.now(), dur = 750;
    const step = now => {
      const t = clamp((now - t0) / dur, 0, 1), e = easeIO(t);
      view.x0 = lerp(from.x0, to.x0, e); view.x1 = lerp(from.x1, to.x1, e); view.d = lerp(from.d, to.d, e); draw();
      if (t < 1) anim = requestAnimationFrame(step); else { anim = null; Object.assign(view, to); draw(); labels(); }
    };
    gL.textContent = ''; gS.textContent = ''; anim = requestAnimationFrame(step);
  }
  function hover(n) {
    if (hoverN === n) return;
    if (hoverN && hoverN.g) hoverN.g.style.transform = '';
    svg.querySelectorAll('.w.hl').forEach(g => g.classList.remove('hl'));
    hoverN = n; if (!n) return;
    for (let c = n; c && c !== focus; c = c.parent) if (c.g) c.g.classList.add('hl');
    if (!REDUCED) { const m = (n.a0 + n.a1) / 2; n.g.style.transform = `translate(${f(Math.sin(m) * 4)}px,${f(-Math.cos(m) * 4)}px)`; }
  }
  const nodeOf = el => { const g = el && el.closest && el.closest('.w'); return g ? nodes[+g.dataset.i] : null; };
  if (MINI) $('app').addEventListener('click', () => navigate(CFG.navigation_path));

  /* ---------- gestures: tap = go there (a thing: its card), hold = on/off, slide up/down on a light = brightness ---------- */
  let press = null;
  const domOf = n => n.eid.split('.')[0];
  const canToggle = n => n && n.kind === 'ent' && ['light', 'switch', 'fan', 'media_player', 'input_boolean'].includes(domOf(n)) && !unavail(states()[n.eid]);
  const canDim = n => { if (!n || n.kind !== 'ent' || domOf(n) !== 'light') return false; const st = states()[n.eid]; return !unavail(st) && ((st.attributes || {}).supported_color_modes || []).some(m => m !== 'onoff'); };
  const briOf = n => { const st = states()[n.eid], a = (st && st.attributes) || {}; return st && st.state === 'on' ? (a.brightness != null ? Math.round(a.brightness / 2.55) : 100) : 0; };
  function select(n) { sel = n; hot = null; nodes.forEach(paint); controls(); hotBtns(); }
  function buzz() { try { navigator.vibrate && navigator.vibrate(30); } catch (e) {} }
  function flash(n) { if (!n.g) return; n.g.classList.add('flash'); setTimeout(() => n.g && n.g.classList.remove('flash'), 450); }
  function toggleThing(n) {
    if (domOf(n) === 'media_player') call('media_player', 'media_play_pause', { entity_id: n.eid });
    else call(domOf(n), 'toggle', { entity_id: n.eid });
    buzz(); flash(n);
  }
  let toastT = null;
  function toast(s) { const t = $('toast'); t.textContent = s; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1900); }
  // hold a room (or its Lights) = all its lights off if any is on, otherwise all on
  const roomLights = n => leaves(n).filter(e => e.cat === 'lights' && !unavail(states()[e.eid]) && !CFG.lights_exclude(e.eid, e.name));
  function switchLights(list, turnOn) {
    for (const d of ['light', 'switch']) { const ids = list.filter(e => domOf(e) === d).map(e => e.eid); if (ids.length) call(d, turnOn ? 'turn_on' : 'turn_off', { entity_id: ids }); }
  }
  function toggleRoomLights(n) {
    const where = n.kind === 'home' ? 'House' : n.kind === 'cat' ? n.parent.name : n.name, L = roomLights(n);
    buzz(); flash(n);
    if (!L.length) { toast('No lights to switch in ' + where); return; }
    const on = L.filter(e => isActive(e.eid, states()[e.eid])), turnOn = !on.length, list = turnOn ? L : on;
    switchLights(list, turnOn);
    toast(`${where}: ${list.length} light${list.length === 1 ? '' : 's'} ${turnOn ? 'on' : 'off'}`);
  }
  // motion: a sensor that has just gone on makes its room (and itself) flash
  let motionSeen = {};
  function pulse(n) {
    if (!n || !n.g) return; n.g.classList.remove('moved'); n.g.getBoundingClientRect(); n.g.classList.add('moved');
    clearTimeout(n.mt); n.mt = setTimeout(() => n.g && n.g.classList.remove('moved'), 3400);
  }
  function motionCheck(h, quiet) {
    if (!CFG.motion_pulse) return;
    for (const e of leaves(root)) {
      const st = h.states[e.eid]; if (e.cat !== 'sensors' || !st || !isMotion(e.eid, st.attributes || {})) continue;
      const was = motionSeen[e.eid]; motionSeen[e.eid] = st.last_changed;
      if (quiet || was === undefined || was === st.last_changed || st.state !== 'on') continue;
      for (let c = e; c; c = c.parent) if (c === e || c.kind === 'area') pulse(c);
    }
  }
  // safety: a leak, smoke, gas or CO sensor going off flashes its room and opens its card
  let safeSeen = {};
  function safetyCheck(h, quiet) {
    if (!root) return;
    for (const e of leaves(root)) {
      if (e.cat !== 'safety') continue;
      const st = h.states[e.eid]; if (!st) continue;
      const was = safeSeen[e.eid]; safeSeen[e.eid] = st.last_changed;
      if (quiet || !CFG.safety_alerts || MINI || was === undefined || was === st.last_changed || st.state !== 'on') continue;
      for (let c = e; c; c = c.parent) if (c === e || c.kind === 'area') pulse(c);
      sel = e; hot = null; nodes.forEach(paint); controls(); hotBtns();
      try { navigator.vibrate && navigator.vibrate([200, 100, 200]); } catch (x) {}
      toast((SAFETY_LABEL[(st.attributes || {}).device_class] || 'Alarm') + ' · ' + roomName(e));
    }
  }
  function showSlide(n, v) { const o = $('slide'); o.style.display = 'grid'; o.innerHTML = `<div><b>${v}%</b><span>${esc(n.name)}</span></div>`; o.style.setProperty('--p', v); }
  function hideSlide() { $('slide').style.display = 'none'; }
  svg.addEventListener('contextmenu', e => e.preventDefault());   // a long press must not open the browser's menu
  svg.addEventListener('pointerdown', e => {
    if (MINI) return; const n = nodeOf(e.target); if (!n) return;
    press = { n, x: e.clientX, y: e.clientY, held: false, sliding: false, bri0: 0, bri: null, id: e.pointerId };
    press.timer = setTimeout(() => {
      if (!press || press.sliding) return;
      press.held = true;
      if (canToggle(n)) { toggleThing(n); select(n); }
      else if (n.kind === 'ent') { buzz(); select(n); }
      else if (n.kind === 'area' || (n.kind === 'cat' && n.cat === 'lights')) toggleRoomLights(n);
    }, HOLD_MS);
  });
  svg.addEventListener('pointermove', e => {
    if (e.pointerType === 'mouse' && !press) hover(nodeOf(e.target));
    if (!press || press.held) return;
    const dx = e.clientX - press.x, dy = e.clientY - press.y;
    if (!press.sliding && Math.hypot(dx, dy) > MOVE_PX) {
      clearTimeout(press.timer);
      if (!canDim(press.n)) { press = null; return; }
      press.sliding = true; press.bri0 = briOf(press.n);
      try { svg.setPointerCapture(press.id); } catch (_) {}
      select(press.n);
    }
    if (press.sliding) { press.bri = clamp(Math.round(press.bri0 - dy / SLIDE_PX), 0, 100); showSlide(press.n, press.bri); }
  });
  svg.addEventListener('pointerup', () => {
    if (!press) return; const p = press; press = null; clearTimeout(p.timer);
    if (p.sliding) {
      hideSlide();
      if (p.bri != null) { if (p.bri <= 0) call('light', 'turn_off', { entity_id: p.n.eid }); else call('light', 'turn_on', { entity_id: p.n.eid, brightness_pct: p.bri }); buzz(); }
      return;
    }
    if (p.held) return;
    if (p.n.kind === 'ent') select(p.n); else setFocus(p.n);
  });
  svg.addEventListener('pointercancel', () => { if (press) { clearTimeout(press.timer); press = null; hideSlide(); } });
  svg.addEventListener('pointerleave', () => { if (!press) hover(null); });
  svg.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return; const n = nodeOf(e.target); if (!n) return; e.preventDefault();
    if (n.kind === 'ent') select(n); else setFocus(n);
  });

  /* ---------- the side: where you are, the selected thing's card, and everything under the focus ---------- */
  function crumbs() {
    const path = []; for (let c = focus; c; c = c.parent) path.unshift(c);
    $('crumbs').innerHTML = path.map((c, i) => i === path.length - 1 ? `<span class="cur">${esc(c.name)}</span>` : `<button data-i="${c.i}">${esc(c.name)}</button><span class="sep">›</span>`).join('');
    $('crumbs').querySelectorAll('button').forEach(b => b.onclick = () => setFocus(nodes[+b.dataset.i]));
  }
  const MINI_LINES = [['lights', 'lights on', 'no lights on'], ['heating', 'heating', 'heating idle'], ['media', 'playing', 'nothing playing'],
    ['sensors', 'doors & motion', 'doors closed, no motion'], ['plugs', 'plugs on', 'plugs off']];
  function miniBox() {
    const L = leaves(root);
    $('minibox').innerHTML = `<div class="mt">Home Ring${CFG.navigation_path ? '<span>open ›</span>' : ''}</div>` + MINI_LINES.map(([c, on, off]) => {
      const k = L.filter(e => e.cat === c && isActive(e.eid, states()[e.eid])).length;
      return `<div class="ml${k ? '' : ' off'}" style="--sc:${CATS[c].sc}"><i></i>${k ? k + ' ' + on : off}</div>`;
    }).join('');
  }
  function side() {
    if (MINI) return miniBox();
    crumbs();
    $('title').textContent = focus.name;
    const L = leaves(focus), on = CAT_ORDER.filter(c => !NO_COUNT.includes(c)).map(c => { const k = L.filter(e => e.cat === c && isActive(e.eid, states()[e.eid])).length; return k ? `<b>${k}</b> ${esc(CATS[c].name.toLowerCase())}` : null; }).filter(Boolean);
    const off = L.filter(e => unavail(states()[e.eid])).length;
    $('summary').innerHTML = (on.length ? on.join(' · ') + ' on' : 'Nothing on') + ` · ${L.length} thing${L.length === 1 ? '' : 's'}` + (off ? ` · <span style="color:var(--alert)">${off} unavailable</span>` : '');
    $('mode').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === MODE));
    lockUi();
    $('legend').style.display = CFG.temperature_tint && (focus.kind === 'home' || focus.kind === 'floor') ? '' : 'none';
    // the list: rooms for the house and floors, things for a room or kind (By system at home: the systems)
    const sysHome = MODE === 'systems' && focus.kind === 'home';
    const items = sysHome ? focus.kids : focus.kind === 'home' || focus.kind === 'floor' ? nodes.filter(n => n.kind === 'area' && (focus.kind === 'home' || n.parent === focus)) : L;
    $('lh').textContent = sysHome ? 'Systems' : focus.kind === 'home' || focus.kind === 'floor' ? 'Rooms' : 'In ' + focus.name;
    $('rows').classList.toggle('many', items.length > 16);
    $('rows').innerHTML = items.map(n => {
      if (n.kind === 'area' || n.kind === 'floor') {
        const k = activeCount(n), s = subOf(n), txt = k ? s : (s ? s + ' · all off' : 'all off');
        return `<button class="chip${k ? ' on' : ''}" style="--sc:var(--light)" data-i="${n.i}"><i></i><span class="t"><div class="n">${esc(n.name)}</div><div class="s">${esc(txt)}</div></span></button>`;
      }
      const st = states()[n.eid], act = isActive(n.eid, st);
      return `<button class="chip${act ? ' on' : ''}" style="--sc:${n.sc}" data-i="${n.i}"><i></i><span class="t"><div class="n">${esc(n.name)}</div><div class="s">${esc(stateText(n.eid, st))}</div></span></button>`;
    }).join('');
    $('rows').querySelectorAll('.chip').forEach(b => b.onclick = () => { const n = nodes[+b.dataset.i]; if (n.kind !== 'ent') setFocus(n); else select(n); });
  }
  function call(domain, service, data) { try { H.callService(domain, service, data); } catch (e) { console.warn('home-ring-card', e); } }

  /* ---------- the detailed card for one thing (replaces the room list until closed) ---------- */
  const HIST = {};
  async function fetchHistory(eid, minimal) {               // last 24 h, cached 5 min
    const k = eid + (minimal ? '|m' : ''), c = HIST[k]; if (c && Date.now() - c.t < 300000) return c.v;
    const start = encodeURIComponent(new Date(Date.now() - 864e5).toISOString());
    let v = [];
    try { const r = await H.callApi('GET', `history/period/${start}?filter_entity_id=${eid}${minimal ? '&minimal_response&no_attributes' : ''}`); v = (r && r[0]) || []; } catch (e) {}
    HIST[k] = { t: Date.now(), v }; return v;
  }
  const hhmm = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const kv = (k, v) => v == null || v === '' ? '' : `<div class="kv"><span>${esc(k)}</span><b>${v}</b></div>`;
  const btns = (list, cur, act, label = x => x) => `<div class="row">${list.map(x => `<button class="btn${x === cur ? ' on' : ''}" data-a="${act}" data-v="${esc(x)}">${esc(label(x))}</button>`).join('')}</div>`;
  const nice = s => String(s).replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
  let camTimer = null;
  function controls() {
    const el = $('ctl'); clearInterval(camTimer); stopCams();
    if (MINI) return;
    $('list').style.display = sel || hot || (EDIT && editPos) ? 'none' : '';
    if (EDIT && editPos) { chooserCard(el); return; }
    if (hot && !sel) { hotCard(el); return; }
    if (!sel) { el.innerHTML = ''; return; }
    const eid = sel.eid, st = states()[eid], d = eid.split('.')[0], a = (st && st.attributes) || {}, act = isActive(eid, st);
    el.style.setProperty('--sc', sel.sc);
    let h = `<div class="h"><i class="${act ? '' : 'off'}"></i>${esc(sel.name)}<button class="x" data-a="close" aria-label="Close">✕</button></div>
      <div class="st">${esc(stateText(eid, st))}${st && st.last_changed ? ' · since ' + hhmm(st.last_changed) : ''}</div>`;
    if (unavail(st)) { el.innerHTML = h + `<div class="note">Not reachable right now.</div>`; wire(el, eid, d, a); return; }
    if (d === 'light') {
      const modes = a.supported_color_modes || [], dim = modes.some(m => m !== 'onoff');
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="toggle">${act ? 'Turn off' : 'Turn on'}</button>
        ${dim ? `<input type="range" min="1" max="100" step="1" value="${act && a.brightness ? Math.round(a.brightness / 2.55) : 1}" data-a="bri" aria-label="Brightness"><span class="pv">${act && a.brightness ? Math.round(a.brightness / 2.55) + '%' : 'off'}</span>` : ''}</div>`;
      if (modes.includes('color_temp') && a.min_color_temp_kelvin) {
        h += `<div class="lbl">Colour temperature</div><div class="row"><input class="ct" type="range" min="${a.min_color_temp_kelvin}" max="${a.max_color_temp_kelvin}" step="50"
          value="${a.color_temp_kelvin || Math.round((a.min_color_temp_kelvin + a.max_color_temp_kelvin) / 2)}" data-a="ct" aria-label="Colour temperature"><span class="pv">${a.color_temp_kelvin ? a.color_temp_kelvin + ' K' : ''}</span></div>`;
      }
      if (modes.some(m => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(m))) {
        const hue = (a.hs_color || [0, 0])[0];
        h += `<div class="lbl">Colour</div><div class="row"><input class="hue" type="range" min="0" max="359" step="1" value="${Math.round(hue)}" data-a="hue" aria-label="Colour" style="--h:${Math.round(hue)}">
          </div><div class="row sw">${[0, 30, 55, 120, 180, 220, 275, 320].map(x => `<button class="dot" style="background:hsl(${x} 90% 55%)" data-a="hs" data-v="${x}" aria-label="Colour ${x}"></button>`).join('')}
          <button class="dot white" data-a="white" aria-label="White"></button></div>`;
      }
      if ((a.effect_list || []).length && a.effect_list.length <= 60)
        h += `<div class="lbl">Effect</div><select data-a="effect"><option value="">—</option>${a.effect_list.map(x => `<option${x === a.effect ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
      h += `<div class="kvs">${kv('Colour mode', a.color_mode && esc(nice(a.color_mode)))}</div>`;
    } else if (d === 'switch' || d === 'fan' || d === 'input_boolean' || d === 'remote') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="toggle">${act ? 'Turn off' : 'Turn on'}</button>
        ${d === 'fan' && a.percentage != null ? `<input type="range" min="0" max="100" step="${a.percentage_step || 1}" value="${a.percentage || 0}" data-a="fanpct" aria-label="Fan speed"><span class="pv">${a.percentage || 0}%</span>` : ''}</div>`;
    } else if (d === 'climate') {
      h += `<div class="clim"><div><div class="lbl">Room</div><div class="big">${a.current_temperature != null ? esc(a.current_temperature) + '°' : '—'}</div></div>
        <div><div class="lbl">Target</div><div class="row tgt"><button class="btn" data-a="t-">−</button><span class="big">${a.temperature != null ? esc(a.temperature) + '°' : '—'}</span><button class="btn" data-a="t+">+</button></div></div></div>
        <div class="kvs">${kv('Now', a.hvac_action ? esc(nice(a.hvac_action)) : null)}${kv('Humidity', a.current_humidity != null ? esc(a.current_humidity) + '%' : null)}${kv('Range', a.min_temp != null ? esc(a.min_temp) + '° – ' + esc(a.max_temp) + '°' : null)}</div>`;
      if ((a.hvac_modes || []).length) h += `<div class="lbl">Mode</div>` + btns(a.hvac_modes, st.state, 'hvac', nice);
      if ((a.preset_modes || []).length) h += `<div class="lbl">Preset</div>` + btns(a.preset_modes, a.preset_mode, 'preset', nice);
      h += `<div class="lbl">Last 24 hours</div><div class="graph" id="graph">loading…</div>`;
    } else if (d === 'water_heater') {
      h += `<div class="kvs">${kv('Temperature', a.current_temperature != null ? esc(a.current_temperature) + '°' : null)}${kv('Target', a.temperature != null ? esc(a.temperature) + '°' : null)}${kv('Mode', a.operation_mode && esc(modeLabel(a.operation_mode)))}</div>`;
      if ((a.operation_list || []).length) h += `<div class="lbl">Mode</div>` + btns(a.operation_list, a.operation_mode, 'wmode', modeLabel);
    } else if (d === 'media_player') {
      h += `${a.entity_picture ? `<img class="art" alt="" src="${esc(a.entity_picture)}">` : ''}
        <div class="kvs">${kv('Playing', a.media_title ? esc(a.media_title) : null)}${kv('By', a.media_artist ? esc(a.media_artist) : null)}${kv('Source', a.source ? esc(a.source) : null)}</div>
        <div class="row"><button class="btn" data-a="prev" aria-label="Previous">⏮</button><button class="btn${act ? ' on' : ''}" data-a="pp">${act ? 'Pause' : 'Play'}</button><button class="btn" data-a="next" aria-label="Next">⏭</button>
        ${st.state !== 'off' ? `<button class="btn" data-a="off">Turn off</button>` : `<button class="btn" data-a="on">Turn on</button>`}</div>`;
      if (a.volume_level != null) h += `<div class="lbl">Volume</div><div class="row"><input type="range" min="0" max="100" step="1" value="${Math.round(a.volume_level * 100)}" data-a="vol" aria-label="Volume"><span class="pv">${Math.round(a.volume_level * 100)}%</span></div>`;
      if ((a.source_list || []).length && a.source_list.length <= 40) h += `<div class="lbl">Source</div><select data-a="source">${a.source_list.map(x => `<option${x === a.source ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
    } else if (d === 'cover') {
      h += `<div class="row"><button class="btn" data-a="open">Open</button><button class="btn" data-a="stop">Stop</button><button class="btn" data-a="shut">Close</button></div>`;
      if (a.current_position != null) h += `<div class="row"><input type="range" min="0" max="100" value="${a.current_position}" data-a="pos" aria-label="Position"><span class="pv">${a.current_position}%</span></div>`;
    } else if (d === 'lock') {
      const locked = st.state === 'locked';
      h += `<div class="row"><button class="btn${locked ? ' on' : ''}" data-a="lock">Lock</button><button class="btn" data-a="confirm" data-v="unlock">Unlock…</button>${a.supported_features & 1 ? '<button class="btn" data-a="confirm" data-v="open">Open…</button>' : ''}</div>
        <div class="note">Unlocking asks you to tap twice${a.code_format ? ', and your lock needs its code: use More controls' : ''}.</div>`;
    } else if (d === 'valve') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="vopen">Open</button><button class="btn" data-a="vclose">Close</button>${a.current_position != null ? '<button class="btn" data-a="vstop">Stop</button>' : ''}</div>`;
      if (a.current_position != null) h += `<div class="row"><input type="range" min="0" max="100" value="${a.current_position}" data-a="vpos" aria-label="Position"><span class="pv">${a.current_position}%</span></div>`;
    } else if (d === 'vacuum' || d === 'lawn_mower') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="vstart">Start</button><button class="btn" data-a="vpause">Pause</button><button class="btn" data-a="vdock">Dock</button></div>
        <div class="kvs">${kv('Battery', a.battery_level != null ? esc(a.battery_level) + '%' : null)}${kv('Fan speed', a.fan_speed ? esc(a.fan_speed) : null)}</div>`;
    } else if (d === 'siren') {
      h += `<div class="row">${act ? '<button class="btn on" data-a="sirenoff">Turn off</button>' : '<button class="btn" data-a="confirm" data-v="siren">Sound it…</button>'}</div>`;
    } else if (d === 'humidifier') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="toggle">${act ? 'Turn off' : 'Turn on'}</button>
        ${a.humidity != null ? `<input type="range" min="${a.min_humidity ?? 0}" max="${a.max_humidity ?? 100}" step="1" value="${a.humidity}" data-a="hum" aria-label="Target humidity"><span class="pv">${a.humidity}%</span>` : ''}</div>
        <div class="kvs">${kv('Humidity now', a.current_humidity != null ? esc(a.current_humidity) + '%' : null)}${kv('Mode', a.mode ? esc(nice(a.mode)) : null)}</div>`;
    } else if (d === 'button' || d === 'input_button') {
      h += `<div class="row"><button class="btn" data-a="press">Press</button></div>`;
    } else if (d === 'script') {
      h += `<div class="row"><button class="btn${act ? ' on' : ''}" data-a="run">${act ? 'Running…' : 'Run'}</button></div>`;
    } else if ((d === 'select' || d === 'input_select') && (a.options || []).length <= 60) {
      h += `<select data-a="opt">${(a.options || []).map(x => `<option${x === st.state ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>`;
    } else if ((d === 'number' || d === 'input_number') && a.min != null && a.max != null) {
      h += `<div class="row"><input type="range" min="${a.min}" max="${a.max}" step="${a.step || 1}" value="${esc(st.state)}" data-a="num" aria-label="${esc(sel.name)}"><span class="pv">${esc(st.state)}${a.unit_of_measurement ? ' ' + esc(a.unit_of_measurement) : ''}</span></div>`;
    } else if (d === 'alarm_control_panel') {
      h += `<div class="row"><button class="btn" data-a="more">Open the keypad</button></div>`;
    } else if (d === 'camera' && a.entity_picture) {
      h += `<img class="cam" id="cam" alt="${esc(sel.name)}" src="${esc(withT(a.entity_picture))}"><div class="row"><button class="btn" data-a="more">Live view</button></div>`;
      camTimer = setInterval(() => { const i = $('cam'), s2 = states()[eid]; if (i && sel && sel.eid === eid && s2) i.src = withT(s2.attributes.entity_picture); }, 5000);
    } else if (d === 'binary_sensor') {
      h += `<div class="kvs" id="bsh">${kv('Since', st.last_changed ? hhmm(st.last_changed) : null)}</div>`;
    }
    h += readingsHtml(sel);
    // Home Assistant's own pop-up has the right controls for every kind of device, including ones this card has no buttons for
    if (d !== 'alarm_control_panel' && d !== 'camera') {
      const dev = devOf(sel), admin = H.user && H.user.is_admin;
      h += `<div class="row"><button class="btn" data-a="more">${/^(sensor|binary_sensor|event)$/.test(d) ? 'History' : 'More controls'}</button>${dev && admin ? '<button class="btn" data-a="devpage">Device page</button>' : ''}</div>`;
    }
    el.innerHTML = h;
    wire(el, eid, d, a);
    el.querySelectorAll('[data-mi]').forEach(b => b.onclick = () => moreInfo(b.dataset.mi));
    if (d === 'climate') fetchHistory(eid, false).then(v => { if (sel && sel.eid === eid) drawGraph(v); });
    if (d === 'binary_sensor') fetchHistory(eid, true).then(v => {
      if (!(sel && sel.eid === eid)) return; const n = v.filter((s, i) => s.state === 'on' && i > 0).length;
      const b = $('bsh'); if (b) b.innerHTML += kv('Last 24 hours', n + ' time' + (n === 1 ? '' : 's'));
    });
  }
  // the rest of a device: its readings and extra controls, each opening Home Assistant's own pop-up
  function readingsHtml(n) {
    const dev = devOf(n), L = ((dev && READ[dev]) || []).filter(x => x !== n.eid && states()[x]); if (!L.length) return '';
    const D = dev && H.devices && H.devices[dev], dn = D ? (D.name_by_user || D.name || '') : '';
    const label = x => { let t = (states()[x].attributes || {}).friendly_name || x.split('.')[1].replace(/_/g, ' ');
      if (dn && t.toLowerCase().startsWith(dn.toLowerCase() + ' ')) t = t.slice(dn.length + 1); return t.charAt(0).toUpperCase() + t.slice(1); };
    const rank = x => { const d = x.split('.')[0], c = (states()[x].attributes || {}).device_class || ''; return (d === 'sensor' ? (['power', 'temperature', 'humidity', 'energy', 'battery'].indexOf(c) + 1 || 6) : d === 'binary_sensor' ? 7 : 8); };
    const rows = L.slice().sort((p, q) => rank(p) - rank(q) || label(p).localeCompare(label(q)));
    const MAX = 14;
    return `<div class="lbl">${n.dev ? 'Readings' : 'Also on this device'}</div><div class="kvs">` +
      rows.slice(0, MAX).map(x => `<button class="kv kvb" data-mi="${esc(x)}"><span>${esc(label(x))}</span><b>${esc(stateText(x, states()[x]))}</b></button>`).join('') + '</div>' +
      (rows.length > MAX ? `<div class="note">and ${rows.length - MAX} more on the device page</div>` : '');
  }
  const withT = p => /^(data|blob):/.test(p) ? p : p + (p.includes('?') ? '&' : '?') + 't=' + Date.now();   // fresh still each time
  function wire(el, eid, d, a) {
    el.querySelectorAll('[data-a]').forEach(b => {
      const k = b.dataset.a, v = b.dataset.v;
      const live = b.nextElementSibling && b.nextElementSibling.classList.contains('pv') ? b.nextElementSibling : null;
      if (b.tagName === 'INPUT') {
        b.oninput = () => { if (live) live.textContent = k === 'ct' ? b.value + ' K' : b.value + '%'; if (k === 'hue') b.style.setProperty('--h', b.value); };
        b.onchange = () => {
          if (k === 'bri') call('light', 'turn_on', { entity_id: eid, brightness_pct: +b.value });
          if (k === 'ct') call('light', 'turn_on', { entity_id: eid, color_temp_kelvin: +b.value });
          if (k === 'hue') call('light', 'turn_on', { entity_id: eid, hs_color: [+b.value, 100] });
          if (k === 'fanpct') call('fan', 'set_percentage', { entity_id: eid, percentage: +b.value });
          if (k === 'vol') call('media_player', 'volume_set', { entity_id: eid, volume_level: +b.value / 100 });
          if (k === 'pos') call('cover', 'set_cover_position', { entity_id: eid, position: +b.value });
          if (k === 'vpos') call('valve', 'set_valve_position', { entity_id: eid, position: +b.value });
          if (k === 'hum') call('humidifier', 'set_humidity', { entity_id: eid, humidity: +b.value });
          if (k === 'num') call(d, 'set_value', { entity_id: eid, value: +b.value });
        };
        return;
      }
      if (b.tagName === 'SELECT') {
        b.onchange = () => {
          if (!b.value) return;
          if (k === 'effect') call('light', 'turn_on', { entity_id: eid, effect: b.value });
          if (k === 'source') call('media_player', 'select_source', { entity_id: eid, source: b.value });
          if (k === 'opt') call(d, 'select_option', { entity_id: eid, option: b.value });
        };
        return;
      }
      b.onclick = () => {
        if (k === 'close') { sel = null; nodes.forEach(paint); controls(); return; }
        if (k === 'more') { moreInfo(eid); return; }
        if (k === 'devpage') { navigate('/config/devices/device/' + devOf(sel)); return; }
        if (k === 'confirm') {                   // unlocking a door or sounding a siren takes a second tap within 4 s
          if (!b.dataset.armed || Date.now() - +b.dataset.armed > 4000) { b.dataset.armed = Date.now(); b.textContent = 'Tap again to ' + (v === 'siren' ? 'sound it' : v); b.classList.add('on'); buzz(); return; }
          if (v === 'unlock') call('lock', 'unlock', { entity_id: eid });
          if (v === 'open') call('lock', 'open', { entity_id: eid });
          if (v === 'siren') call('siren', 'turn_on', { entity_id: eid });
          delete b.dataset.armed; buzz(); toast(sel.name + ': ' + (v === 'siren' ? 'sounding' : v === 'open' ? 'opening' : 'unlocking')); return;
        }
        if (k === 'lock') call('lock', 'lock', { entity_id: eid });
        if (k === 'sirenoff') call('siren', 'turn_off', { entity_id: eid });
        if (k === 'vopen' || k === 'vclose' || k === 'vstop') call('valve', { vopen: 'open_valve', vclose: 'close_valve', vstop: 'stop_valve' }[k], { entity_id: eid });
        if (k === 'vstart' || k === 'vpause' || k === 'vdock') call(d, d === 'lawn_mower' ? { vstart: 'start_mowing', vpause: 'pause', vdock: 'dock' }[k] : { vstart: 'start', vpause: 'pause', vdock: 'return_to_base' }[k], { entity_id: eid });
        if (k === 'press') { call(d, 'press', { entity_id: eid }); buzz(); }
        if (k === 'run') { call('script', 'turn_on', { entity_id: eid }); buzz(); }
        if (k === 'toggle') call(d, 'toggle', { entity_id: eid });
        if (k === 'hs') call('light', 'turn_on', { entity_id: eid, hs_color: [+v, 100] });
        if (k === 'white') call('light', 'turn_on', { entity_id: eid, ...(a.min_color_temp_kelvin ? { color_temp_kelvin: Math.round((a.min_color_temp_kelvin + a.max_color_temp_kelvin) / 2) } : { hs_color: [0, 0] }) });
        if (k === 't-' || k === 't+') call('climate', 'set_temperature', { entity_id: eid, temperature: Math.round(((a.temperature || 20) + (k === 't+' ? .5 : -.5)) * 2) / 2 });
        if (k === 'hvac') call('climate', 'set_hvac_mode', { entity_id: eid, hvac_mode: v });
        if (k === 'preset') call('climate', 'set_preset_mode', { entity_id: eid, preset_mode: v });
        if (k === 'wmode') call('water_heater', 'set_operation_mode', { entity_id: eid, operation_mode: v });
        if (k === 'pp') call('media_player', 'media_play_pause', { entity_id: eid });
        if (k === 'prev') call('media_player', 'media_previous_track', { entity_id: eid });
        if (k === 'next') call('media_player', 'media_next_track', { entity_id: eid });
        if (k === 'on' || k === 'off') call('media_player', 'turn_' + k, { entity_id: eid });
        if (k === 'open' || k === 'stop' || k === 'shut') call('cover', (k === 'shut' ? 'close' : k) + '_cover', { entity_id: eid });
      };
    });
  }
  // 24 h of a thermostat: room temperature (line) and target (dashed), with the time it was heating shaded
  function drawGraph(hist) {
    const g = $('graph'); if (!g) return;
    const pts = hist.map(s => ({ t: new Date(s.last_changed || s.last_updated).getTime(), cur: num((s.attributes || {}).current_temperature), tgt: num((s.attributes || {}).temperature), heat: (s.attributes || {}).hvac_action === 'heating' })).filter(p => p.cur != null);
    if (pts.length < 2) { g.textContent = 'Not enough history yet.'; return; }
    const W = 300, Hh = 90, t0 = Date.now() - 864e5, t1 = Date.now(), vals = pts.flatMap(p => [p.cur, p.tgt]).filter(v => v != null && v > 0);
    const lo = Math.floor(Math.min(...vals) - 0.5), hi = Math.ceil(Math.max(...vals) + 0.5);
    const X = t => ((Math.max(t, t0) - t0) / (t1 - t0)) * W, Y = v => Hh - 6 - ((v - lo) / (hi - lo || 1)) * (Hh - 14);
    let heat = '', cur = '', tgt = '';
    pts.forEach((p, i) => {
      const x = X(p.t), x2 = i + 1 < pts.length ? X(pts[i + 1].t) : W;
      if (p.heat) heat += `<rect x="${f(x)}" y="0" width="${f(Math.max(.5, x2 - x))}" height="${Hh}" fill="rgba(255,122,69,.16)"/>`;
      cur += (i ? 'L' : 'M') + f(x) + ',' + f(Y(p.cur)) + 'L' + f(x2) + ',' + f(Y(p.cur));
      if (p.tgt != null && p.tgt > 0) tgt += (tgt ? 'L' : 'M') + f(x) + ',' + f(Y(p.tgt)) + 'L' + f(x2) + ',' + f(Y(p.tgt));
    });
    g.innerHTML = `<svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none">${heat}<path d="${tgt}" fill="none" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="4 3"/>
      <path d="${cur}" fill="none" stroke="var(--heat)" stroke-width="2"/></svg><div class="gl"><span>${lo}°</span><span>shaded = heating · dashed = target</span><span>${hi}°</span></div>`;
  }
  if (CFG.back_path) { const b = $('back'); b.hidden = false; b.textContent = '← ' + CFG.back_label; b.onclick = () => navigate(CFG.back_path); }

  /* ---------- corner buttons: tap = its card on the right, hold = its quick action ----------
     Each corner can be any of the kinds below, a room shortcut ("room:<area id>"), or empty. Choose them with
     Customise in the panel (saved in Home Assistant for every screen) or with `corners:` in the card's YAML.
     Cameras: stills; opens by itself when a doorbell rings.   Lights: every light; hold = all off, or all on.
     Alarm: arm from here when no code is needed to arm.         Heating: thermostats -/+ and boiler modes; hold = your mode.
     TV & music: what's playing; hold = pause everything.        Scenes: run one.
     Doors & motion: what's open and recent movement.            Energy: your power readings and plugs.
     Blinds: open / stop / close; hold = close all, or open all. Fans: hold = all off.   Plugs: switch them. */
  const IC = {
    cams: '<path d="M3.5 8h3l1.8-2.5h7.4L17.5 8h3v11h-17z"/><circle cx="12" cy="13.2" r="3.6"/>',
    lights: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.5 1.1-2.1A6 6 0 0 0 12 3z"/>',
    alarm: '<path d="M12 3l7.5 3v5.6c0 4.6-3.2 8.2-7.5 9.4-4.3-1.2-7.5-4.8-7.5-9.4V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    heat: '<path d="M12 3c1 3.2 4.5 4.8 4.5 9.4a4.5 4.5 0 0 1-9 0c0-2.2 1-3.6 2.2-4.6 0 2 .8 3.4 2.2 3.6C11.5 8.6 10.8 5.8 12 3z"/>',
    media: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M10.5 8.8v4.8l4-2.4z"/>',
    scenes: '<path d="M11 3l1.8 4.7L17.5 9.5l-4.7 1.8L11 16l-1.8-4.7L4.5 9.5l4.7-1.8z"/><path d="M18 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    doors: '<path d="M6 21V4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21M4 21h16"/><circle cx="14.6" cy="12" r=".9"/>',
    energy: '<path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z"/>',
    blinds: '<path d="M4 4h16M5 4v10M19 4v10M5 7.5h14M5 11h14M5 14h14M12 14v3.5"/><circle cx="12" cy="19.2" r="1.3"/>',
    fans: '<circle cx="12" cy="12" r="1.8"/><path d="M12 10.2c-1-3.6.4-6.7 3-6.7 2.4 0 2.6 3.6-1.3 6.3M13.8 12.6c3.6 1 5.6 3.8 4.3 6-1.2 2.1-4.3.4-5.4-4M10.3 12.9c-2.6 2.7-6 3-7.3.8-1.2-2.1 1.9-3.9 6.3-2.8"/>',
    plugs: '<path d="M9 3v5M15 3v5M6.5 8h11v3.5a5.5 5.5 0 0 1-11 0zM12 17v4"/>',
    room: '<path d="M3.5 11.5L12 4l8.5 7.5M6 10v10h12V10"/><path d="M10 20v-5h4v5"/>',
    none: '<path d="M12 6v12M6 12h12"/>',
    pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  };
  const svgOf = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k] || IC.none}</svg>`;
  const KINDS = {
    cams: { name: 'Cameras', hc: 'var(--cam)' }, lights: { name: 'Lights', hc: 'var(--light)' },
    alarm: { name: 'Alarm', hc: 'var(--media)' }, heat: { name: 'Heating', hc: 'var(--heat)' },
    media: { name: 'TV & music', hc: 'var(--media)' }, scenes: { name: 'Scenes', hc: 'var(--light)' },
    doors: { name: 'Doors & motion', hc: 'var(--alert)' }, energy: { name: 'Energy', hc: 'var(--plug)' },
    blinds: { name: 'Blinds', hc: 'var(--fan)' }, fans: { name: 'Fans', hc: 'var(--fan)' },
    plugs: { name: 'Plugs', hc: 'var(--plug)' }, none: { name: 'Empty', hc: 'var(--dim)' },
  };
  const POS = ['tl', 'tr', 'bl', 'br'], POS_NAME = { tl: 'Top left', tr: 'Top right', bl: 'Bottom left', br: 'Bottom right' };
  const DEFAULT_CORNERS = ['cams', 'lights', 'alarm', 'heat'];
  const validCorner = k => typeof k === 'string' && (KINDS[k] || /^room:.+/.test(k));
  const cleanCorners = v => Array.isArray(v) && v.length === 4 && v.every(validCorner) ? v.slice() : null;
  let CORNERS = cleanCorners(CFG.corners) || DEFAULT_CORNERS.slice(), EDIT = false, editPos = null;
  const kindOf = pos => CORNERS[POS.indexOf(pos)];
  const roomIdOf = k => k.startsWith('room:') ? k.slice(5) : null;
  const roomNodeOf = id => nodes.find(n => n.kind === 'area' && n.id === id);
  const roomTitle = id => { const n = roomNodeOf(id); return n ? n.name : ((H && H.areas && H.areas[id]) || {}).name || 'Room'; };
  const kindName = k => roomIdOf(k) ? roomTitle(roomIdOf(k)) : (KINDS[k] || KINDS.none).name;

  let hotCam = null, hotAuto = null, camTimers = [], dingSeen = {}, pend = {};
  const roomName = e => { for (let c = e; c; c = c.parent) if (c.kind === 'area') return c.name; return e.name; };
  const areaNodeOf = e => { for (let c = e; c; c = c.parent) if (c.kind === 'area') return c; return null; };
  const alarmEid = () => CFG.alarm || Object.keys(states()).find(e => e.startsWith('alarm_control_panel.') && !CFG.exclude(e, ''));
  const heaterEid = () => CFG.heating_entity || (root ? (leaves(root).find(e => domOf(e) === 'water_heater') || {}).eid : null);
  const thermostats = () => root ? leaves(root).filter(e => domOf(e) === 'climate').sort((a, b) => roomName(a).localeCompare(roomName(b))) : [];
  const allLights = () => root ? roomLights(root) : [];
  const ofCat = c => root ? leaves(root).filter(e => e.cat === c && !unavail(states()[e.eid])) : [];
  const onOf = L => L.filter(e => isActive(e.eid, states()[e.eid]));
  const OPENING = ['door', 'window', 'garage_door', 'opening'];
  const openNow = () => ofCat('sensors').filter(e => { const st = states()[e.eid]; return st.state === 'on' && OPENING.includes((st.attributes || {}).device_class); });
  const recentMotion = ms => ofCat('sensors').filter(e => { const st = states()[e.eid]; return isMotion(e.eid, st.attributes || {}) && (st.state === 'on' || Date.now() - Date.parse(st.last_changed) < ms); })
    .sort((a, b) => Date.parse(states()[b.eid].last_changed) - Date.parse(states()[a.eid].last_changed));
  const energyNodes = () => CFG.energy.filter(e => states()[e.entity]);
  const lastScene = () => { let last = null, lt = 0; for (const e of sceneList()) { const t = Date.parse(states()[e].state); if (t > lt) { lt = t; last = e; } } return Date.now() - lt < 6 * 3600e3 ? last : null; };
  function camList() {
    if (CFG.cameras) return CFG.cameras.map((c, i) => {
      const srcs = asList(c.entities || c.entity);
      return { id: 'c' + i, name: c.name || (srcs[0] ? sceneName(srcs[0]) : 'Camera'), srcs, doorbell: c.doorbell || null, motion: asList(c.motion) };
    }).filter(c => c.srcs.some(s => states()[s]));
    if (!root) return [];
    return leaves(root).filter(e => e.cat === 'cameras').map((e, i) => {
      const room = areaNodeOf(e);
      const motion = room ? leaves(room).filter(m => m.cat === 'sensors' && isMotion(m.eid, (states()[m.eid] || {}).attributes || {})).map(m => m.eid) : [];
      return { id: 'a' + i, name: e.name === 'Camera' && room ? room.name : e.name, srcs: [e.eid], doorbell: null, motion };
    });
  }
  function stopCams() { camTimers.forEach(clearInterval); camTimers = []; }
  // draw the four corners for their current kinds (the live values come from hotBtns)
  function renderCorners() {
    if (MINI) return;
    for (const pos of POS) {
      const b = Q('.hot.' + pos), k = kindOf(pos), rid = roomIdOf(k), kd = KINDS[k] || { hc: 'var(--light)' };
      b.dataset.h = k; b.hidden = !CFG.hot_buttons || (k === 'none' && !EDIT);
      b.style.setProperty('--hc', kd.hc);
      b.classList.toggle('empty', k === 'none'); b.classList.toggle('edit', EDIT); b.classList.toggle('picking', EDIT && editPos === pos);
      b.setAttribute('aria-label', EDIT ? `Change the ${POS_NAME[pos].toLowerCase()} button (${kindName(k)})` : kindName(k));
      b.innerHTML = `<span class="hi">${svgOf(rid ? 'room' : k)}<span class="hn">${esc(kindName(k))}</span><i class="md"></i></span><span class="hv"></span>`;
    }
    const cb = $('custom'); cb.hidden = !CFG.hot_buttons || !CFG.customise;
    cb.classList.toggle('on', EDIT); cb.innerHTML = svgOf('pen') + (EDIT ? 'Done' : 'Customise');
    cb.title = EDIT ? 'Finish changing the corner buttons' : 'Choose what the four corner buttons do';
  }
  function hotBtns() {
    if (MINI || !root || !CFG.hot_buttons) return;
    for (const pos of POS) {
      const b = Q('.hot.' + pos), k = kindOf(pos), rid = roomIdOf(k), hv = b.querySelector('.hv'); if (!hv) continue;
      let lit = false, val = '', motion = false, armed = false;
      if (rid) {
        const n = roomNodeOf(rid);
        if (n) { lit = activeCount(n) > 0; val = subOf(n) || 'all off'; } else val = 'not on the ring';
      } else if (k === 'cams') {
        const cams = camList();
        motion = cams.some(c => c.motion.some(m => { const st = states()[m]; return st && (st.state === 'on' || Date.now() - Date.parse(st.last_changed) < 120e3); }));
        val = motion ? 'movement' : cams.length + ' camera' + (cams.length === 1 ? '' : 's');
      } else if (k === 'lights') { const on = onOf(allLights()).length; lit = on > 0; val = on ? on + ' on' : 'all off'; }
      else if (k === 'alarm') {
        const ast = states()[alarmEid()], s = ast ? ast.state : 'none'; armed = !!ast && !['disarmed', 'unavailable', 'unknown'].includes(s);
        lit = armed; val = ast ? nice(s) : 'not set up';
      } else if (k === 'heat') {
        const T = thermostats().map(e => states()[e.eid]).filter(st => !unavail(st)), cur = T.map(st => num(st.attributes.current_temperature)).filter(v => v != null);
        const heating = T.filter(st => st.attributes.hvac_action === 'heating').length; lit = heating > 0;
        val = (cur.length ? deg(cur.reduce((a, c) => a + c, 0) / cur.length) : '—') + (heating ? ' · ' + heating + ' heating' : '');
      } else if (k === 'media') {
        const p = onOf(ofCat('media')); lit = p.length > 0;
        val = p.length === 1 ? (states()[p[0].eid].attributes.media_title || p[0].name) : p.length ? p.length + ' playing' : 'nothing playing';
      } else if (k === 'scenes') { const l = lastScene(), n = sceneList().length; lit = !!l; val = l ? sceneName(l) : n + ' scene' + (n === 1 ? '' : 's'); }
      else if (k === 'doors') {
        const o = openNow(), m = recentMotion(120e3); lit = o.length > 0; motion = m.length > 0;
        val = o.length ? o.length + ' open' : m.length ? 'movement' : 'all closed';
      } else if (k === 'energy') {
        const sol = CFG.energy.find(e => e.kind === 'solar' && states()[e.entity]), load = CFG.energy.find(e => e.kind === 'load' && states()[e.entity]);
        const pick = sol || load; if (pick) { const w = watts(pick.entity, states()[pick.entity]); lit = !!sol && w != null && Math.abs(w) >= 40; val = (pick.name || (sol ? 'Solar' : 'Use')) + ' ' + stateText(pick.entity, states()[pick.entity]); }
        else { const on = onOf(ofCat('plugs')).length; lit = on > 0; val = on + ' plug' + (on === 1 ? '' : 's') + ' on'; }
      } else if (k === 'blinds') { const L = ofCat('covers'), o = onOf(L).length; lit = o > 0; val = L.length ? (o ? o + ' open' : 'all closed') : 'none'; }
      else if (k === 'fans') { const o = onOf(ofCat('fans')).length; lit = o > 0; val = o ? o + ' on' : 'all off'; }
      else if (k === 'plugs') { const o = onOf(ofCat('plugs')).length; lit = o > 0; val = o ? o + ' on' : 'all off'; }
      else if (k === 'none') val = EDIT ? 'tap to choose' : '';
      b.classList.toggle('lit', lit && !EDIT); b.classList.toggle('motion', motion && !EDIT); b.classList.toggle('armed', armed && !EDIT);
      if (k === 'alarm') b.style.setProperty('--hc', armed ? 'var(--alert)' : 'var(--media)');
      b.classList.toggle('open', !EDIT && (rid ? !!focus && focus.kind === 'area' && focus.id === rid : hot === k));
      hv.textContent = EDIT ? (editPos === pos ? 'choosing…' : 'tap to change') : val;
    }
  }
  function openHot(k, keep) {
    clearTimeout(hotAuto); hotAuto = null;
    const rid = roomIdOf(k);
    if (rid) { hot = null; sel = null; nodes.forEach(paint); goPlace('area:' + rid); controls(); hotBtns(); return; }
    if (k === 'none') return;
    if (hot === k && !keep) hot = null; else { hot = k; if (sel) { sel = null; nodes.forEach(paint); } }
    if (k === 'cams' && !keep) hotCam = null;
    controls(); hotBtns();
  }
  function switchAll(list, domain, on, off, one, many) {          // hold: everything off if any is on, otherwise all on
    const act = onOf(list); buzz();
    if (!list.length) { toast('No ' + many + ' to switch'); return; }
    const turnOn = !act.length, ids = (turnOn ? list : act).map(e => e.eid);
    call(domain, turnOn ? on : off, { entity_id: ids }); toast(`${ids.length} ${ids.length === 1 ? one : many} ${turnOn ? (on === 'open_cover' ? 'opening' : 'on') : (off === 'close_cover' ? 'closing' : 'off')}`);
  }
  function hotHold(k) {
    const rid = roomIdOf(k);
    if (rid) { const n = roomNodeOf(rid); if (n) toggleRoomLights(n); return; }
    if (k === 'lights') { toggleRoomLights(root); openHot('lights', true); return; }
    if (k === 'heat' && CFG.heating_hold_mode) {
      const w = heaterEid(); if (w) { call('water_heater', 'set_operation_mode', { entity_id: w, operation_mode: CFG.heating_hold_mode }); buzz(); toast(sceneName(w) + ': ' + modeLabel(CFG.heating_hold_mode).toLowerCase()); }
      openHot('heat', true); return;
    }
    if (k === 'media') {
      const p = onOf(ofCat('media')); buzz();
      if (p.length) { call('media_player', 'media_pause', { entity_id: p.map(e => e.eid) }); toast('Paused ' + p.length + ' player' + (p.length === 1 ? '' : 's')); }
      else toast('Nothing is playing');
      openHot('media', true); return;
    }
    if (k === 'blinds') { switchAll(ofCat('covers'), 'cover', 'open_cover', 'close_cover', 'blind', 'blinds'); openHot('blinds', true); return; }
    if (k === 'fans') { const on = onOf(ofCat('fans')); buzz(); if (on.length) { call('fan', 'turn_off', { entity_id: on.map(e => e.eid) }); toast(on.length + ' fan' + (on.length === 1 ? '' : 's') + ' off'); } else toast('No fans on'); openHot('fans', true); return; }
    if (k === 'none') return;
    buzz(); openHot(k, true);
  }
  QA('.hot').forEach(b => {
    let t = null, held = false;
    const pos = [...b.classList].find(c => POS.includes(c));
    b.addEventListener('pointerdown', () => { held = false; clearTimeout(t); if (EDIT) return; t = setTimeout(() => { held = true; hotHold(kindOf(pos)); }, HOLD_MS); });
    b.addEventListener('pointerup', () => { clearTimeout(t); if (EDIT) { pickCorner(pos); return; } if (!held) openHot(kindOf(pos)); });
    ['pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => clearTimeout(t)));
    b.addEventListener('contextmenu', e => e.preventDefault());
    b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (EDIT) pickCorner(pos); else openHot(kindOf(pos)); } });
  });
  // a doorbell press opens the Cameras card on that door (and closes it after a minute unless someone uses it)
  function dingCheck(h) {
    if (MINI || !CFG.hot_buttons) return;
    for (const c of camList()) {
      const eid = c.doorbell; if (!eid) continue;
      const st = h.states[eid]; if (!st) continue;
      const was = dingSeen[eid]; dingSeen[eid] = st.last_changed;
      if (was === undefined || was === st.last_changed || st.state !== 'on' || EDIT) continue;
      hot = 'cams'; hotCam = c.id; if (sel) { sel = null; nodes.forEach(paint); }
      controls(); hotBtns(); buzz(); toast(`Doorbell · ${c.name}`);
      clearTimeout(hotAuto); hotAuto = setTimeout(() => { hotAuto = null; if (hot === 'cams') { hot = null; controls(); hotBtns(); } }, 60000);
    }
  }
  const modeLabel = x => /^boost_\d+$/.test(x) ? 'Boost ' + x.split('_')[1] + ' min' : /^off_\d+$/.test(x) ? 'Off ' + x.split('_')[1] + ' min' : nice(x);
  const thingChip = (e, act, sub) => `<button class="chip${act ? ' on' : ''}" style="--sc:${e.sc}" data-a="sel" data-v="${esc(e.eid)}"><i></i><span class="t"><div class="n">${esc(e.name)}</div><div class="s">${esc(sub)}</div></span></button>`;
  const toggleChip = (e, act) => `<button class="chip${act ? ' on' : ''}" style="--sc:${e.sc}" data-a="lt" data-v="${esc(e.eid)}"><i></i><span class="t"><div class="n">${esc(e.name)}</div><div class="s">${esc(roomName(e))}</div></span></button>`;
  const ago = t => { const m = Math.round((Date.now() - Date.parse(t)) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : hhmm(t); };
  function hotCard(el) {
    const head = (t, sc) => { el.style.setProperty('--sc', sc); return `<div class="h"><i></i>${t}<button class="x" data-a="close" aria-label="Close">✕</button></div>`; };
    let h = '';
    if (hot === 'cams') {
      const cams = camList(); if (!hotCam || !cams.find(c => c.id === hotCam)) hotCam = cams[0] && cams[0].id;
      cams.sort((a, b) => (b.id === hotCam) - (a.id === hotCam));
      h = head('Cameras', 'var(--cam)') + (cams.length ? `<div class="cams">${cams.map(c => `<div class="cam2${c.id === hotCam ? ' big' : ''}" data-a="cam" data-v="${c.id}"><img alt="${esc(c.name)}"><span>${esc(c.name)}</span><em>No picture right now</em></div>`).join('')}</div>
        <button class="link" data-a="camlive">${CFG.cameras_path ? 'Open your cameras ›' : 'Live view ›'}</button>` : `<div class="note">No cameras with a room yet.</div>`);
    } else if (hot === 'lights') {
      const L = allLights(), on = onOf(L), off = L.filter(e => !on.includes(e));
      h = head(`Lights · ${on.length} on`, 'var(--light)') + `<div class="row"><button class="btn" data-a="alloff"${on.length ? '' : ' disabled'}>All off</button><button class="btn" data-a="allon"${off.length ? '' : ' disabled'}>All on</button></div>
        ${on.length ? `<div class="lbl">On</div><div class="lchips">${on.map(e => toggleChip(e, true)).join('')}</div>` : ''}${off.length ? `<div class="lbl">Off</div><div class="lchips">${off.map(e => toggleChip(e, false)).join('')}</div>` : ''}`;
    } else if (hot === 'alarm') {
      const eid = alarmEid(), st = states()[eid], s = st ? st.state : 'none', armed = !!st && !['disarmed', 'unavailable', 'unknown'].includes(s);
      if (!st) h = head('Alarm', 'var(--media)') + `<div class="note">No alarm panel found. Set <b>alarm:</b> in the card if you have one.</div>`;
      else {
        const a = st.attributes || {}, sf = a.supported_features || 0, codeToArm = a.code_arm_required !== false && a.code_format != null;
        const modes = [[1, 'arm_home', 'Arm home', 'armed_home'], [2, 'arm_away', 'Arm away', 'armed_away'], [4, 'arm_night', 'Arm night', 'armed_night']].filter(m => sf & m[0]);
        h = head('Alarm', armed ? 'var(--alert)' : 'var(--media)') + `<div class="big" style="margin-top:8px;color:${armed ? 'var(--alert)' : 'var(--media)'}">${esc(nice(s))}</div>
          <div class="st">${st.last_changed ? 'since ' + hhmm(st.last_changed) : ''}</div>
          <div class="row">${codeToArm ? '' : modes.map(m => `<button class="btn${s === m[3] ? ' on' : ''}" data-a="arm" data-v="${m[1]}">${m[2]}</button>`).join('')}<button class="btn" data-a="keypad">${armed ? 'Disarm…' : codeToArm ? 'Arm…' : 'Keypad…'}</button></div>
          <div class="note">${codeToArm ? 'Your alarm needs its code to arm, so arming opens the keypad.' : 'Arming needs no code here. Disarming always asks for the code.'}</div>`;
      }
    } else if (hot === 'heat') {
      const w = heaterEid(), ws = w && states()[w], wa = (ws && ws.attributes) || {}, mode = wa.operation_mode || (ws && ws.state);
      const rows = thermostats().map(e => {
        const st = states()[e.eid]; if (unavail(st)) return ''; const a = st.attributes || {}, on = a.hvac_action === 'heating';
        const p = pend[e.eid], tgt = p && Date.now() - p.t < 6000 ? p.v : a.temperature;
        return `<div class="trow"><div class="tn">${esc(roomName(e))}<small class="${on ? 'on' : ''}">${a.current_temperature != null ? deg(a.current_temperature) + ' now' : ''}${on ? ' · heating' : ''}</small></div>
          <button class="btn" data-a="tm" data-v="${e.eid}" aria-label="Lower">−</button><div class="tt">${tgt != null ? deg(tgt) : '—'}</div><button class="btn" data-a="tp" data-v="${e.eid}" aria-label="Raise">+</button></div>`;
      }).join('');
      h = head('Heating', 'var(--heat)') + (rows ? `<div class="lbl">Rooms · target</div>${rows}` : `<div class="note">No thermostats with a room yet.</div>`);
      if (ws && (wa.operation_list || []).length) h += `<div class="lbl">${esc(sceneName(w))} · ${esc(modeLabel(mode || '—'))}</div>` + btns(wa.operation_list, mode, 'wm', modeLabel);
    } else if (hot === 'media') {
      const L = ofCat('media'), p = onOf(L);
      const rows = L.sort((a, b) => isActive(b.eid, states()[b.eid]) - isActive(a.eid, states()[a.eid])).map(e => {
        const st = states()[e.eid], a = st.attributes || {}, playing = st.state === 'playing';
        const sub = (a.media_title ? a.media_title + (a.media_artist ? ' · ' + a.media_artist : '') : st.state) + ' · ' + roomName(e);
        return `<div class="trow mrow"><button class="tn link2" data-a="sel" data-v="${esc(e.eid)}">${esc(e.name)}<small class="${playing ? 'on' : ''}">${esc(sub)}</small></button>
          <button class="btn${playing ? ' on' : ''}" data-a="pp" data-v="${esc(e.eid)}">${playing ? 'Pause' : 'Play'}</button></div>`;
      }).join('');
      h = head(`TV & music · ${p.length} playing`, 'var(--media)') + (p.length ? `<div class="row"><button class="btn" data-a="pauseall">Pause all</button></div>` : '') +
        (rows ? `<div class="lbl">Players</div>${rows}` : `<div class="note">No TVs or speakers with a room yet.</div>`);
    } else if (hot === 'scenes') {
      const L = sceneList(), last = lastScene();
      h = head('Scenes', 'var(--light)') + (L.length ? `<div class="lchips scn2">${L.map(e => `<button class="chip${e === last ? ' on' : ''}" style="--sc:var(--light)" data-a="scene" data-v="${esc(e)}"><i></i><span class="t"><div class="n">${esc(sceneName(e))}</div><div class="s">${e === last ? 'last run ' + hhmm(states()[e].state) : 'tap to run'}</div></span></button>`).join('')}</div>` : `<div class="note">No scenes yet.</div>`);
    } else if (hot === 'doors') {
      const o = openNow(), m = recentMotion(3600e3), al = onOf(ofCat('safety'));
      h = head('Doors & motion', 'var(--alert)') + (al.length ? `<div class="lbl">Going off now</div><div class="lchips">${al.map(e => thingChip(e, true, roomName(e) + ' · ' + (SAFETY_LABEL[(states()[e.eid].attributes || {}).device_class] || 'alarm'))).join('')}</div>` : '') +
        `<div class="lbl">Open now</div>` + (o.length ? `<div class="lchips">${o.map(e => thingChip(e, true, roomName(e) + ' · ' + ago(states()[e.eid].last_changed))).join('')}</div>` : `<div class="note">Everything is closed.</div>`) +
        `<div class="lbl">Movement in the last hour</div>` + (m.length ? `<div class="lchips">${m.map(e => thingChip(e, states()[e.eid].state === 'on', roomName(e) + ' · ' + ago(states()[e.eid].last_changed))).join('')}</div>` : `<div class="note">No movement.</div>`);
    } else if (hot === 'energy') {
      const E = energyNodes(), plugs = ofCat('plugs'), on = onOf(plugs);
      h = head('Energy', 'var(--plug)') + (E.length ? `<div class="kvs">${E.map(e => kv(e.name || sceneName(e.entity), esc(stateText(e.entity, states()[e.entity])))).join('')}</div>` : '') +
        `<div class="lbl">Plugs · ${on.length} on</div>` + (plugs.length ? `<div class="lchips">${plugs.sort((a, b) => isActive(b.eid, states()[b.eid]) - isActive(a.eid, states()[a.eid])).map(e => toggleChip(e, isActive(e.eid, states()[e.eid]))).join('')}</div>` : `<div class="note">No plugs with a room yet.</div>`) +
        (E.length ? '' : `<div class="note">Add your solar, battery and grid readings with <b>energy:</b> in the card.</div>`);
    } else if (hot === 'blinds') {
      const L = ofCat('covers'), o = onOf(L);
      h = head(`Blinds · ${o.length} open`, 'var(--fan)') + (L.length ? `<div class="row"><button class="btn" data-a="coverall" data-v="open">All open</button><button class="btn" data-a="coverall" data-v="close">All closed</button></div>` +
        L.map(e => `<div class="trow mrow"><button class="tn link2" data-a="sel" data-v="${esc(e.eid)}">${esc(e.name)}<small>${esc(roomName(e) + ' · ' + stateText(e.eid, states()[e.eid]))}</small></button>
          <span class="row" style="margin:0;flex-wrap:nowrap"><button class="btn" data-a="cv" data-v="open:${esc(e.eid)}">Open</button><button class="btn" data-a="cv" data-v="stop:${esc(e.eid)}">Stop</button><button class="btn" data-a="cv" data-v="close:${esc(e.eid)}">Close</button></span></div>`).join('')
        : `<div class="note">No blinds with a room yet.</div>`);
    } else if (hot === 'fans' || hot === 'plugs') {
      const L = ofCat(hot === 'fans' ? 'fans' : 'plugs'), on = onOf(L), off = L.filter(e => !on.includes(e)), label = hot === 'fans' ? 'Fans' : 'Plugs';
      h = head(`${label} · ${on.length} on`, hot === 'fans' ? 'var(--fan)' : 'var(--plug)') + (hot === 'fans' && on.length ? `<div class="row"><button class="btn" data-a="fansoff">All off</button></div>` : '') +
        (on.length ? `<div class="lbl">On</div><div class="lchips">${on.map(e => toggleChip(e, true)).join('')}</div>` : '') +
        (off.length ? `<div class="lbl">Off</div><div class="lchips">${off.map(e => toggleChip(e, false)).join('')}</div>` : '') + (L.length ? '' : `<div class="note">None with a room yet.</div>`);
    }
    el.innerHTML = h;
    el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const k = b.dataset.a, v = b.dataset.v;
      if (k !== 'close') { clearTimeout(hotAuto); hotAuto = null; }     // someone is using it: no auto-close
      if (k === 'close') { hot = null; controls(); hotBtns(); return; }
      if (k === 'cam') { hotCam = v; controls(); return; }
      if (k === 'camlive') { if (CFG.cameras_path) navigate(CFG.cameras_path); else { const c = camList().find(x => x.id === hotCam); moreInfo(c && c.srcs.find(s => states()[s])); } return; }
      if (k === 'sel') { const n = nodes.find(x => x.eid === v); if (n) select(n); return; }
      if (k === 'lt') call(v.split('.')[0], 'toggle', { entity_id: v });
      if (k === 'alloff') { switchLights(onOf(allLights()), false); buzz(); toast('All lights off'); }
      if (k === 'allon') { switchLights(allLights(), true); buzz(); toast('All lights on'); }
      if (k === 'arm') { call('alarm_control_panel', 'alarm_' + v, { entity_id: alarmEid() }); buzz(); toast(nice(v.replace('arm_', 'arming ').replace('_', ' '))); }
      if (k === 'keypad') { if (CFG.alarm_path) navigate(CFG.alarm_path); else moreInfo(alarmEid()); }
      if (k === 'tm' || k === 'tp') {
        const a = (states()[v] || {}).attributes || {}, p = pend[v], base = p && Date.now() - p.t < 6000 ? p.v : (a.temperature || 20), step = a.target_temp_step || .5;
        const t = clamp(Math.round((base + (k === 'tp' ? step : -step)) / step) * step, a.min_temp || 5, a.max_temp || 35);
        pend[v] = { v: t, t: Date.now() }; call('climate', 'set_temperature', { entity_id: v, temperature: t }); const tt = b.parentNode.querySelector('.tt'); if (tt) tt.textContent = deg(t);
      }
      if (k === 'wm') { call('water_heater', 'set_operation_mode', { entity_id: heaterEid(), operation_mode: v }); buzz(); toast(sceneName(heaterEid()) + ': ' + modeLabel(v).toLowerCase()); }
      if (k === 'pp') { call('media_player', 'media_play_pause', { entity_id: v }); buzz(); }
      if (k === 'pauseall') { const p = onOf(ofCat('media')); if (p.length) call('media_player', 'media_pause', { entity_id: p.map(e => e.eid) }); buzz(); toast('Paused everything'); }
      if (k === 'scene') { call('scene', 'turn_on', { entity_id: v }); buzz(); toast(sceneName(v) + ' scene on'); }
      if (k === 'coverall') { const L = ofCat('covers'); if (L.length) call('cover', v === 'open' ? 'open_cover' : 'close_cover', { entity_id: L.map(e => e.eid) }); buzz(); toast(v === 'open' ? 'Opening all blinds' : 'Closing all blinds'); }
      if (k === 'cv') { const [act, eid] = [v.slice(0, v.indexOf(':')), v.slice(v.indexOf(':') + 1)]; call('cover', act + '_cover', { entity_id: eid }); buzz(); }
      if (k === 'fansoff') { const on = onOf(ofCat('fans')); if (on.length) call('fan', 'turn_off', { entity_id: on.map(e => e.eid) }); buzz(); toast('Fans off'); }
    });
    if (hot === 'cams') el.querySelectorAll('.cam2').forEach(tile => {
      const c = camList().find(x => x.id === tile.dataset.v), img = tile.querySelector('img'), big = tile.classList.contains('big');
      if (!c) return;
      let i = 0, skip = 0;
      const next = () => { const st = states()[c.srcs[i]], p = st && !unavail(st) && st.attributes.entity_picture; if (!p) { fail(); return; } img.src = withT(p); };
      const fail = () => { if (i < c.srcs.length - 1) { i++; next(); } else { tile.classList.add('fail'); i = 0; skip = 5; } };
      img.onload = () => tile.classList.remove('fail'); img.onerror = fail;
      next();
      const every = CFG.camera_refresh * 1000;
      camTimers.push(setInterval(() => { if (skip > 0) { skip--; return; } next(); }, big ? Math.max(1000, every / 2) : every));
    });
  }

  /* ---------- Customise: choose what each corner does ---------- */
  function setEdit(on) {
    EDIT = on; editPos = null; hot = null;
    if (sel) { sel = null; nodes.forEach(paint); }
    renderCorners(); controls(); hotBtns();
  }
  function pickCorner(pos) { editPos = editPos === pos ? null : pos; renderCorners(); controls(); hotBtns(); }
  function chooserCard(el) {
    const cur = kindOf(editPos);
    const opt = (k, label, icon, hc) => `<button class="opt${k === cur ? ' on' : ''}" style="--hc:${hc}" data-k="${esc(k)}">${svgOf(icon)}<span>${esc(label)}</span></button>`;
    const rooms = nodes.filter(n => n.kind === 'area').filter((n, i, a) => a.findIndex(m => m.id === n.id) === i).sort((a, b) => a.name.localeCompare(b.name));
    el.style.setProperty('--sc', 'var(--light)');
    el.innerHTML = `<div class="h"><i></i>${esc(POS_NAME[editPos])} button<button class="x" data-done="1" aria-label="Close">✕</button></div>
      <div class="st">Now: ${esc(kindName(cur))}. Pick what it should do.</div>
      <div class="opts">${Object.keys(KINDS).filter(k => k !== 'none').map(k => opt(k, KINDS[k].name, k, KINDS[k].hc)).join('')}</div>
      ${rooms.length ? `<div class="lbl">Or go straight to a room</div><div class="opts">${rooms.map(n => opt('room:' + n.id, n.name, 'room', 'var(--light)')).join('')}</div>` : ''}
      <div class="row">${opt('none', 'Leave it empty', 'none', 'var(--dim)')}</div>
      <div class="note">${cornersStore.shared === false ? 'Saved in this browser.' : 'Saved for every screen.'} Holding a corner still does its quick action once you tap Done.</div>`;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
      const next = CORNERS.slice(); next[POS.indexOf(editPos)] = b.dataset.k;
      const where = await saveShared(cornersStore, next); buzz();
      toast(`${POS_NAME[editPos]}: ${kindName(b.dataset.k)}` + (where === 'here' && cornersStore.shared ? ' (this browser only)' : ''));
      editPos = null; renderCorners(); controls(); hotBtns();
    });
    el.querySelector('[data-done]').onclick = () => { editPos = null; renderCorners(); controls(); hotBtns(); };
  }
  $('custom').onclick = () => setEdit(!EDIT);
  renderCorners();

  /* ---------- saving in Home Assistant ----------
     The layout lock and the corner choices live in Home Assistant's shared frontend data, so every screen and
     every user sees the same thing and follows a change at once. Writing needs an admin; anyone else (or an older
     Home Assistant without shared data) saves in their own browser instead. */
  const stores = [];
  function makeStore(key, apply) { const s = { key, apply, shared: null, unsub: null, started: false }; stores.push(s); return s; }
  const localOf = s => { try { return JSON.parse(localStorage.getItem('homeRing:' + s.key) || 'null'); } catch (e) { return null; } };
  function startStore(s) {
    if (s.started || !H) return; s.started = true;
    const conn = H.connection;
    if (!conn || !conn.subscribeMessage) { s.shared = false; s.apply(localOf(s)); return; }
    conn.subscribeMessage(m => { s.shared = true; s.apply(m && m.value != null ? m.value : localOf(s)); }, { type: 'frontend/subscribe_system_data', key: s.key })
      .then(u => { if (destroyed) u(); else s.unsub = u; }, () => { s.shared = false; s.apply(localOf(s)); });
  }
  async function saveShared(s, v) {        // 'all' = every screen, 'here' = this browser, null = not allowed
    if (s.shared && H.callWS) {
      try { await H.callWS({ type: 'frontend/set_system_data', key: s.key, value: v }); try { localStorage.removeItem('homeRing:' + s.key); } catch (e) {} return 'all'; }
      catch (e) { if (!v && !localOf(s)) return null; }     // clearing a shared value needs an admin
    }
    try { if (v) localStorage.setItem('homeRing:' + s.key, JSON.stringify(v)); else localStorage.removeItem('homeRing:' + s.key); } catch (e) {}
    s.apply(v); return 'here';
  }
  const layoutStore = makeStore(CFG.layout_key, v => setLayout(v));
  const cornersStore = makeStore(CFG.corners_key, v => {
    const c = cleanCorners(v) || cleanCorners(CFG.corners) || DEFAULT_CORNERS.slice();
    if (c.join() === CORNERS.join()) return;
    CORNERS = c; renderCorners(); if (hot && !CORNERS.includes(hot) && hot !== 'cams') hot = null; controls(); hotBtns();
  });
  function startSync() { if (CFG.layout_lock) startStore(layoutStore); if (CFG.hot_buttons && !MINI) startStore(cornersStore); }

  /* ---------- layout lock ---------- */
  const LOCK_SVG = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
  const OPEN_SVG = '<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2"/></svg>';
  function setLayout(v) {
    v = v || null;
    if (JSON.stringify(v) === JSON.stringify(LAYOUT)) return;
    LAYOUT = v; structKey = ''; if (H && root) update(H);
  }
  function makeLayout() {                 // the layout as it is now, unlocked, for both views
    const keep = MODE, modes = {};
    for (const m of ['rooms', 'systems']) {
      MODE = m; const R = build(H, true), order = {}, centres = {};
      (function walk(n) {
        if (n.kids.length) { order[pathKey(n)] = n.kids.map(k => [nodeKey(k), +Math.pow(k.w, .6).toFixed(4)]); n.kids.forEach(walk); }
        if (n.kind === 'area') centres[pathKey(n)] = +((n.x0 + n.x1) / 2).toFixed(5);
      })(R);
      modes[m] = { order, centres };
    }
    MODE = keep;
    const out = { v: 1, at: new Date().toISOString(), modes, scenes: sceneList(true) };
    structKey = ''; update(H);            // building the snapshots replaced the ring's own tree: put it back
    return out;
  }
  function lockUi() {
    const seg = $('lockseg'); seg.hidden = !CFG.layout_lock || MINI; if (seg.hidden) return;
    const b = $('lock'), on = !!LAYOUT;
    b.classList.toggle('on', on); b.setAttribute('aria-pressed', on);
    b.innerHTML = (on ? LOCK_SVG : OPEN_SVG) + (on ? 'Locked' : 'Lock layout');
    b.title = on ? 'Rooms keep their places. Tap to unlock.' : 'Keep every room where it is now; new rooms join the end of their floor';
    $('tidy').hidden = !on;
  }
  $('lock').onclick = async () => {
    if (!H || !root) return;
    const r = await saveShared(layoutStore, LAYOUT ? null : makeLayout()); buzz();
    if (r === null) toast('Only an admin can unlock the shared layout');
    else toast(LAYOUT ? (r === 'all' ? 'Layout locked on every screen' : 'Layout locked in this browser') : 'Layout unlocked');
    lockUi();
  };
  $('tidy').onclick = async () => {
    if (!H || !root) return;
    const r = await saveShared(layoutStore, makeLayout()); buzz();
    toast(r === 'all' ? 'Rooms tidied and locked on every screen' : 'Rooms tidied and locked in this browser'); lockUi();
  };
  let destroyed = false;

  /* ---------- By room / By system ---------- */

  function setMode(m) { if (m === MODE) return; MODE = m; LS.set('homeRingMode', m); sel = null; focus = null; structKey = ''; if (H) update(H); }
  $('mode').querySelectorAll('button').forEach(b => b.onclick = () => setMode(b.dataset.m));

  /* ---------- voice (optional): an input_text set to "area:<id or name>|<unix seconds>", "floor:…|…" or "home|…" ---------- */
  let voiceSeen = null;
  function voiceCheck(h) {
    if (MINI || !CFG.voice_entity) return;
    const st = h.states[CFG.voice_entity]; if (!st) return;
    const v = String(st.state || ''); if (v === voiceSeen) return;
    const first = voiceSeen === null; voiceSeen = v;
    const [target, ts] = v.split('|'), age = ts ? Date.now() - (+ts || 0) * 1000 : Date.now() - Date.parse(st.last_changed);
    let done = null; try { done = sessionStorage.getItem('homeRingVoice'); } catch (e) {}
    if (!target || done === v || age > (first ? 90e3 : 300e3) || age < -120e3) return;
    try { sessionStorage.setItem('homeRingVoice', v); } catch (e) {}
    goPlace(target);
  }
  function goPlace(target) {
    const i = target.indexOf(':'), kind = (i < 0 ? target : target.slice(0, i)).trim().toLowerCase(), id = i < 0 ? '' : target.slice(i + 1).trim().toLowerCase();
    if (MODE !== 'rooms') { MODE = 'rooms'; LS.set('homeRingMode', 'rooms'); sel = null; focus = null; structKey = ''; update(H); }
    const n = kind === 'home' ? root : nodes.find(m => m.kind === kind && (String(m.id).toLowerCase() === id || String(m.name).toLowerCase() === id));
    if (!n) return;
    sel = null; setFocus(n);
  }

  /* ---------- live: rebuild when rooms change, repaint when states change ---------- */
  let structKey = '', ringSig = '', selSt = null, regRefs = [], regKey = '';
  // rooms, floors and what is in them; worked out again only when Home Assistant hands over a new registry
  function regKeyOf(h) {
    const refs = [h.areas, h.floors, h.entities, h.devices];
    if (refs.every((r, i) => r === regRefs[i])) return regKey;
    regRefs = refs;
    regKey = JSON.stringify([
      Object.values(h.areas || {}).map(a => a.area_id + ':' + a.name + ':' + (a.floor_id || '')),
      Object.values(h.floors || {}).map(x => x.floor_id + ':' + x.name + ':' + x.level),
      Object.values(h.entities || {}).map(e => e.entity_id + ':' + (e.area_id || '') + ':' + (e.hidden ? 1 : 0) + (e.entity_category || '') + ':' + (e.name || '')),
      Object.values(h.devices || {}).map(d => d.id + ':' + (d.area_id || ''))]);
    return regKey;
  }
  const sigOf = h => root ? leaves(root).map(e => { const s = h.states[e.eid]; return s ? s.last_updated : '-'; }).join('|') : '';
  function update(h) {
    if (!h || !h.states) return;
    H = h; $('wait').style.display = 'none';
    startSync();
    const key = regKeyOf(h) + '|' + Object.keys(h.states).length + '|' + MODE;   // a new thing's state can arrive after its registry entry
    if (key !== structKey || !root) {
      structKey = key; const was = focus, wsel = sel;
      root = build(h); setup();
      focus = findSame(was) || root; sel = wsel ? nodes.find(n => n.eid === wsel.eid) || null : null; geom();
      Object.assign(view, { x0: focus.x0, x1: focus.x1, d: focus.depth }); draw(); labels(); side(); controls();
      lastStates = h.states; ringSig = sigOf(h); selSt = sel && h.states[sel.eid];
      renderCorners(); motionCheck(h, true); safetyCheck(h, true); dingCheck(h); hotBtns(); voiceCheck(h); return;
    }
    if (h.states === lastStates) return;
    lastStates = h.states;
    voiceCheck(h); dingCheck(h); hotBtns();
    const sig = sigOf(h); if (sig === ringSig) return;
    ringSig = sig; motionCheck(h, false); safetyCheck(h, false); nodes.forEach(paint); if (!anim) labels(); side();
    if (hot && hot !== 'cams' && !sel) controls();          // an open Lights / Alarm / Heating card follows the house
    if (sel && h.states[sel.eid] !== selSt) { selSt = h.states[sel.eid]; const ae = sr.activeElement; if (!ae || ae.type !== 'range') controls(); }
  }
  function resize() { if (root) { geom(); draw(); labels(); } }
  const clock = setInterval(() => { if (root) hotBtns(); }, 15000);     // "movement" fades after two minutes
  function destroy() { destroyed = true; for (const st of stores) if (st.unsub) { try { st.unsub(); } catch (e) {} st.unsub = null; } clearInterval(clock); clearInterval(camTimer); stopCams(); clearTimeout(hotAuto); cancelAnimationFrame(anim); }
  return { update, resize, destroy };
}

/* ======================================================================================================
   The Lovelace card
   ====================================================================================================== */
class HomeRingCard extends HTMLElement {
  setConfig(config) {
    if (!config || typeof config !== 'object') throw new Error('home-ring-card: no configuration');
    if (config.cameras != null && !Array.isArray(config.cameras)) throw new Error('home-ring-card: cameras must be a list');
    if (config.energy != null && !Array.isArray(config.energy)) throw new Error('home-ring-card: energy must be a list');
    this._raw = config;
    this._cfg = normaliseConfig(config);
    if (this._ring) { this._teardown(); this._mount(); }
  }
  set hass(h) {
    this._hass = h;
    if (!this._ring && this.isConnected && this._cfg) this._mount();
    if (this._ring) this._ring.update(h);
  }
  get hass() { return this._hass; }
  connectedCallback() { if (!this._ring && this._cfg) this._mount(); }
  disconnectedCallback() { this._teardown(); }
  _mount() {
    const sr = this.shadowRoot || this.attachShadow({ mode: 'open' });
    sr.innerHTML = `<style>${HR_CSS}</style>${HR_HTML}`;
    this._ring = createRing(sr, this, this._cfg);
    this._ro = new ResizeObserver(() => this._ring && this._ring.resize());
    this._ro.observe(sr.getElementById('ringbox'));
    if (this._hass) this._ring.update(this._hass);
  }
  _teardown() {
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
    if (this._ring) { this._ring.destroy(); this._ring = null; }
  }
  getCardSize() { return this._cfg && this._cfg.mini ? 4 : 12; }
  getGridOptions() { return { columns: 'full', rows: 'auto' }; }
  static getStubConfig() { return {}; }
}
if (!customElements.get('home-ring-card')) customElements.define('home-ring-card', HomeRingCard);
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'home-ring-card'))
  window.customCards.push({ type: 'home-ring-card', name: 'Home Ring', description: 'Your home as a ring you drill into: floors, rooms, kinds of thing and the things themselves.', preview: false, documentationURL: 'https://github.com/anchorapp100/home-ring-card' });
console.info(`%c HOME-RING-CARD %c ${HOME_RING_VERSION} `, 'color:#0a0f16;background:#ffb638;font-weight:700', 'color:#ffb638;background:#0a0f16');
