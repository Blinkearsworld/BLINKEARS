/* Blinkears: "Get the app" (add the website to the home screen)
   - Android / Chrome: one tap (native install prompt)
   - iPhone / iPad: a short picture guide (Apple doesn't allow a one-tap install)
   - hidden when already opened from the home screen */
(()=>{
  const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  if('serviceWorker' in navigator&&location.protocol==='https:'){
    addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
  }
  if(standalone)return;

  const ua=navigator.userAgent||'';
  const isIOS=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isAndroid=/Android/.test(ua);
  const inApp=/FBAN|FBAV|FB_IAB|Instagram|Messenger|Line\/|TikTok|musical_ly|Snapchat/i.test(ua);
  const iosChrome=/CriOS/.test(ua);
  // Safari 26 (iOS 26) hides Share behind the ••• button at the bottom right
  const vm=ua.match(/Version\/(\d+)/),newSafari=isIOS&&!iosChrome&&!/iPad/.test(ua)&&vm&&+vm[1]>=26;
  const mobile=isIOS||isAndroid;
  let deferred=null;
  addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;showBar();});
  addEventListener('appinstalled',()=>{hideBar();closeSheet();});

  const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  const ICON='/apple-touch-icon.png';
  const SHARE='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 3v12M7.5 7.5 12 3l4.5 4.5M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  const PLUS='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const DOTS='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>';

  const css=`
.bk-bar{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:900;display:flex;align-items:center;gap:10px;max-width:520px;margin:0 auto;padding:10px 10px 10px 12px;border-radius:20px;background:#1d140e;color:#fff;box-shadow:0 14px 40px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,200,97,.25);font-family:Nunito,system-ui,sans-serif;transform:translateY(140%);transition:transform .45s cubic-bezier(.2,.8,.2,1)}
.bk-bar.on{transform:none}
.bk-bar img{width:44px;height:44px;border-radius:11px;flex:none}
.bk-bar p{margin:0;flex:1;min-width:0;font-weight:800;font-size:14.5px;line-height:1.25}
.bk-bar small{display:block;font-weight:700;font-size:12.5px;color:#d8c4b4}
.bk-get{flex:none;border:0;border-radius:999px;padding:10px 16px;font:900 15px Nunito,system-ui,sans-serif;color:#2a1206;background:linear-gradient(135deg,#ffe08a,#ffb347 45%,#ff7a1a);cursor:pointer}
.bk-x{flex:none;border:0;background:none;color:#bba;font-size:22px;line-height:1;padding:6px;cursor:pointer}
.bk-sheet{position:fixed;inset:0;z-index:1000;display:flex;align-items:flex-end;justify-content:center;background:rgba(10,6,4,.6);font-family:Nunito,system-ui,sans-serif}
.bk-card{position:relative;width:100%;max-width:440px;margin:0 10px calc(10px + env(safe-area-inset-bottom,0px));padding:22px 20px 18px;border-radius:26px;background:#fbf3e7;color:#2a1d15;box-shadow:0 20px 60px rgba(0,0,0,.5);text-align:center}
.bk-card img.ic{width:72px;height:72px;border-radius:18px;box-shadow:0 8px 20px rgba(0,0,0,.25);margin-top:-56px;border:4px solid #fbf3e7}
.bk-card h2{margin:10px 0 4px;font:700 24px Fredoka,Nunito,system-ui,sans-serif;color:#2a1d15}
.bk-card .sub{margin:0 0 14px;font-weight:700;font-size:14.5px;color:#7a5f4c}
.bk-steps{list-style:none;margin:0 0 14px;padding:0;display:grid;gap:8px;text-align:left}
.bk-steps li{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:14px;background:#fff;font-weight:800;font-size:15px;line-height:1.3}
.bk-steps b{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;background:#ff7a1a;color:#fff;font-size:14px}
.bk-steps i{flex:none;display:grid;place-items:center;width:38px;height:38px;border-radius:10px;background:#eef3ff;color:#1a73e8;font-style:normal}
.bk-close{border:0;border-radius:999px;padding:12px 22px;font:900 15px Nunito,system-ui,sans-serif;background:#2a1d15;color:#fff;cursor:pointer}
.bk-arrow{position:fixed;z-index:1001;font-size:34px;color:#ffb347;text-shadow:0 2px 8px rgba(0,0,0,.6);animation:bkb 1s ease-in-out infinite;pointer-events:none}
@keyframes bkb{50%{transform:translateY(8px)}}
@media (prefers-reduced-motion:reduce){.bk-bar{transition:none}.bk-arrow{animation:none}}`;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // --- the sheet with instructions
  let sheet=null,arrow=null;
  function steps(){
    if(inApp)return{sub:'This page is open inside another app. Open it in your browser first:',list:[
      [DOTS,'Tap <strong>⋯</strong> or <strong>⋮</strong> at the top of this screen'],
      ['🌐',isIOS?'Choose <strong>Open in Safari</strong>':'Choose <strong>Open in Chrome</strong> (or “Open in browser”)'],
      [PLUS,'Then tap <strong>Get the app</strong> again']]};
    if(newSafari)return{sub:'Three quick taps and the Blinkears live on your home screen:',list:[
      ['<span style="font:900 20px system-ui;letter-spacing:1px">•••</span>','Tap <strong>•••</strong> at the bottom right of Safari'],
      [SHARE,'Tap <strong>Share</strong>'],
      [PLUS,'Tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>']]};
    if(isIOS)return{sub:'Two quick taps and the Blinkears live on your home screen:',list:[
      [SHARE,iosChrome?'Tap the <strong>Share</strong> button at the top, next to the address':'Tap the <strong>Share</strong> button '+(/iPad/.test(ua)?'at the top':'at the bottom of Safari')],
      [PLUS,'Scroll down and tap <strong>Add to Home Screen</strong>'],
      ['✅','Tap <strong>Add</strong>. That’s it!']]};
    return{sub:'Add the Blinkears to your home screen:',list:[
      [DOTS,'Tap the <strong>⋮</strong> menu at the top right of your browser'],
      [PLUS,'Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>'],
      ['✅','Tap <strong>Install</strong>. That’s it!']]};
  }
  function openSheet(){
    closeSheet();hideBar();const s=steps();
    sheet=document.createElement('div');sheet.className='bk-sheet';sheet.setAttribute('role','dialog');sheet.setAttribute('aria-modal','true');sheet.setAttribute('aria-label','Get the Blinkears app');
    sheet.innerHTML=`<div class="bk-card"><img class="ic" src="${ICON}" alt=""><h2>Get the Blinkears app</h2><p class="sub">${s.sub}</p>
      <ol class="bk-steps">${s.list.map((x,i)=>`<li><b>${i+1}</b><i>${x[0]}</i><span>${x[1]}</span></li>`).join('')}</ol>
      <button class="bk-close" type="button">Got it</button></div>`;
    sheet.addEventListener('click',e=>{if(e.target===sheet||e.target.classList.contains('bk-close'))closeSheet();});
    document.body.appendChild(sheet);sheet.querySelector('.bk-close').focus();
    // point at Safari's share button (bottom centre on iPhone, top on iPad / Chrome)
    if(isIOS&&!inApp){arrow=document.createElement('div');arrow.className='bk-arrow';arrow.setAttribute('aria-hidden','true');
      if(iosChrome||/iPad/.test(ua)){arrow.textContent='⬆';arrow.style.top='4px';arrow.style.right='60px';}
      else if(newSafari){arrow.textContent='⬇';arrow.style.bottom='2px';arrow.style.right='34px';}
      else{arrow.textContent='⬇';arrow.style.bottom='2px';arrow.style.left='50%';arrow.style.marginLeft='-12px';}
      sheet.querySelector('.bk-card').style.marginBottom='calc(52px + env(safe-area-inset-bottom,0px))';
      document.body.appendChild(arrow);}
  }
  function closeSheet(){if(sheet){sheet.remove();sheet=null;}if(arrow){arrow.remove();arrow=null;}}
  addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet();});

  async function install(){
    if(deferred){deferred.prompt();try{const r=await deferred.userChoice;if(r&&r.outcome==='accepted')hideBar();}catch(e){}deferred=null;return;}
    openSheet();
  }
  window.blinkearsInstall=install;
  document.addEventListener('click',e=>{const a=e.target.closest('[data-install]');if(a){e.preventDefault();install();}});
  // show "Get the app" links (they stay hidden on computers and inside the installed app)
  const reveal=()=>document.querySelectorAll('[data-install]').forEach(a=>{if(mobile||deferred)a.style.display='';});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reveal);else reveal();
  addEventListener('beforeinstallprompt',reveal);

  // --- the little bar at the bottom (phones only, once in a while)
  let bar=null;
  function showBar(){
    if(bar||!(mobile||deferred))return;
    const last=+store.get('bk-app-dismissed')||0;if(Date.now()-last<10*864e5)return;
    bar=document.createElement('div');bar.className='bk-bar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Get the Blinkears app');
    bar.innerHTML=`<img src="${ICON}" alt=""><p>Blinkears on your home screen<small>Cartoons and games, one tap away</small></p><button class="bk-get" type="button">Get the app</button><button class="bk-x" type="button" aria-label="Not now">×</button>`;
    bar.querySelector('.bk-get').onclick=install;
    bar.querySelector('.bk-x').onclick=()=>{store.set('bk-app-dismissed',Date.now());hideBar();};
    document.body.appendChild(bar);requestAnimationFrame(()=>requestAnimationFrame(()=>bar&&bar.classList.add('on')));
  }
  function hideBar(){if(bar){bar.classList.remove('on');const b=bar;bar=null;setTimeout(()=>b.remove(),500);}}
  if(mobile)setTimeout(showBar,5000);
})();
