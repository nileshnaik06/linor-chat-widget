var gt=Object.defineProperty,ft=Object.defineProperties;var bt=Object.getOwnPropertyDescriptors;var be=Object.getOwnPropertySymbols;var mt=Object.prototype.hasOwnProperty,ht=Object.prototype.propertyIsEnumerable;var me=(H,R,D)=>R in H?gt(H,R,{enumerable:!0,configurable:!0,writable:!0,value:D}):H[R]=D,M=(H,R)=>{for(var D in R||(R={}))mt.call(R,D)&&me(H,D,R[D]);if(be)for(var D of be(R))ht.call(R,D)&&me(H,D,R[D]);return H},q=(H,R)=>ft(H,bt(R));(function(){"use strict";const H={botName:"Assistant",primaryColor:"#6366f1",welcomeMessage:"Hi! How can I help you today?",position:"bottom-right",offsetX:24,offsetY:24,zIndex:2147483647,buttonSize:56,windowWidth:380,windowHeight:580,hideAttribution:!1,avatarUrl:null,apiKey:null,apiUrl:null,sessionTtlHours:24,maxRetries:3,requestTimeoutMs:3e4,defaultSuggestions:["Book an appointment","Working hours","Services offered","Contact info"],enableVoice:!0,enableTTS:!0,ttsDefaultOn:!1,voiceLang:"en-US",enableSounds:!1,soundVolume:.18};function R(r){const e=r.replace("#",""),i=e.length===3?e.split("").map(n=>n+n).join(""):e,t=/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(i);return t?[parseInt(t[1],16),parseInt(t[2],16),parseInt(t[3],16)].join(", "):"99, 102, 241"}function D(r){const e=typeof window!="undefined"&&window.__AI_WIDGET_CONFIG__?window.__AI_WIDGET_CONFIG__:{},i=typeof window!="undefined"&&window.LinorConfig?window.LinorConfig:{},t={};if(r){const a=C=>r.getAttribute(`data-${C}`),d=C=>{const v=parseInt(a(C),10);return isNaN(v)?void 0:v};a("api-key")&&(t.apiKey=a("api-key")),a("api-url")&&(t.apiUrl=a("api-url")),a("bot-name")&&(t.botName=a("bot-name")),a("primary-color")&&(t.primaryColor=a("primary-color")),a("welcome-message")&&(t.welcomeMessage=a("welcome-message")),a("position")&&(t.position=a("position")),a("avatar-url")&&(t.avatarUrl=a("avatar-url")),a("hide-attribution")&&(t.hideAttribution=a("hide-attribution")!=="false");const b=d("offset-x");b!==void 0&&(t.offsetX=b);const h=d("offset-y");h!==void 0&&(t.offsetY=h);const o=d("z-index");o!==void 0&&(t.zIndex=o);const c=d("button-size");c!==void 0&&(t.buttonSize=c);const g=d("window-width");g!==void 0&&(t.windowWidth=g);const p=d("window-height");p!==void 0&&(t.windowHeight=p);const w=d("session-ttl-hours");w!==void 0&&(t.sessionTtlHours=w);const x=d("max-retries");x!==void 0&&(t.maxRetries=x);const S=d("request-timeout-ms");S!==void 0&&(t.requestTimeoutMs=S);const k=a("default-suggestions");k!=null&&(t.defaultSuggestions=k.split("|").map(C=>C.trim()).filter(Boolean).slice(0,4)),a("enable-voice")!=null&&(t.enableVoice=a("enable-voice")!=="false"),a("enable-tts")!=null&&(t.enableTTS=a("enable-tts")!=="false"),a("tts-default-on")!=null&&(t.ttsDefaultOn=a("tts-default-on")!=="false"),a("enable-sounds")!=null&&(t.enableSounds=a("enable-sounds")!=="false"),a("voice-lang")&&(t.voiceLang=a("voice-lang"))}const n=M(M(M(M({},H),e),i),t);return["bottom-right","bottom-left","top-right","top-left"].includes(n.position)||(console.warn(`[AI Widget] Invalid position "${n.position}". Falling back to "bottom-right".`),n.position="bottom-right"),n.primaryRgb=R(n.primaryColor),n.apiKey||console.warn("[AI Widget] Missing api-key. Widget will be disabled. Set data-api-key on the script tag or window.LinorConfig.apiKey."),n.apiUrl||console.warn("[AI Widget] Missing api-url. Widget will be disabled. Set data-api-url on the script tag or window.LinorConfig.apiUrl."),n}function he(r){let e=M({},r);const i=new Set;return{getState(){return e},setState(t){const n=e,s=typeof t=="function"?t(e):t;e=M(M({},e),s),i.forEach(a=>a(e,n))},subscribe(t){return i.add(t),()=>i.delete(t)}}}function ye(r,e=[],i={}){return M({isOpen:!1,messages:e,status:"idle",error:null,sessionId:r,unreadCount:0,voiceState:"idle",ttsEnabled:!1,interimTranscript:"",sttSupported:!1,ttsSupported:!1,online:!0,transferState:"none",agentName:null},i)}const X={get(r){try{const e=localStorage.getItem(r);return e!==null?JSON.parse(e):null}catch(e){return null}},set(r,e){try{return localStorage.setItem(r,JSON.stringify(e)),!0}catch(i){return!1}},remove(r){try{localStorage.removeItem(r)}catch(e){}},isAvailable(){try{const r="__ai_widget_test__";return localStorage.setItem(r,"1"),localStorage.removeItem(r),!0}catch(r){return!1}}};function Y(){return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`}function xe(){return`sess_${Y()}`}function we(r,e){const i=`ai_widget_session_${r}`,t=e*60*60*1e3;function n(s){return Date.now()-s>t}return{load(){const s=X.get(i);return s?n(s.lastActive)?(X.remove(i),null):{sessionId:s.sessionId,messages:Array.isArray(s.messages)?s.messages:[]}:null},save(s,a){X.set(i,{sessionId:s,messages:a,lastActive:Date.now()})},clear(){X.remove(i)},createNew(){return xe()}}}const ve=2500,Se=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}*_`~#>]/gu;function ke(){return typeof window=="undefined"?null:window.SpeechRecognition||window.webkitSpeechRecognition||null}function _e(){return typeof window!="undefined"&&"speechSynthesis"in window&&typeof window.SpeechSynthesisUtterance=="function"}function Ae(r,e){if(!Array.isArray(r)||r.length===0)return null;const i=(e||"").split("-")[0].toLowerCase(),t=r.filter(s=>{const a=(s.lang||"").toLowerCase();return a===e.toLowerCase()||a.startsWith(i)});if(t.length===0)return r[0]||null;const n=s=>{let a=0;s.localService&&(a+=4);const d=(s.name||"").toLowerCase();return/natural|neural|premium|enhanced|online/.test(d)&&(a+=3),/google|microsoft|samantha|alex/.test(d)&&(a+=2),(s.lang||"").toLowerCase()===e.toLowerCase()&&(a+=1),a};return t.sort((s,a)=>n(a)-n(s))[0]}function Ce({lang:r="en-US",onResult:e=()=>{},onError:i=()=>{},onStateChange:t=()=>{}}={}){const n=ke(),s=!!n,a=_e();let d=null,b=!1,h=!1,o=null,c=null;function g(f){try{t(f)}catch(E){console.error("[AI Widget] voice onStateChange error",E)}}function p(){const f=new n;return f.lang=r,f.interimResults=!0,f.continuous=!1,f.maxAlternatives=1,f.onstart=()=>{b=!0,g("listening"),w()},f.onresult=E=>{var A;let l="",m="";for(let B=E.resultIndex;B<E.results.length;B++){const L=E.results[B],P=((A=L[0])==null?void 0:A.transcript)||"";L.isFinal?m+=P:l+=P}w(),m?e({text:m.trim(),isFinal:!0}):l&&e({text:l.trim(),isFinal:!1})},f.onerror=E=>{if(x(),b=!1,E.error==="aborted"||E.error==="no-speech"){g("idle");return}g("error");const l={"not-allowed":"Microphone access was denied.","service-not-allowed":"Speech service is unavailable.","audio-capture":"No microphone found.",network:"Network issue — voice input needs a connection."}[E.error]||`Voice input failed (${E.error||"unknown"}).`;try{i(new Error(l))}catch(m){}setTimeout(()=>g("idle"),50)},f.onend=()=>{x(),b=!1,g("idle")},f}function w(){x(),o=setTimeout(()=>{if(b&&d)try{d.stop()}catch(f){}},ve)}function x(){o&&(clearTimeout(o),o=null)}function S(){if(!s)return i(new Error("Voice input is not supported in this browser.")),!1;if(b)return!0;z();try{return d=p(),d.start(),!0}catch(f){return g("error"),i(f instanceof Error?f:new Error("Could not start voice input.")),setTimeout(()=>g("idle"),50),!1}}function k(){if(x(),d&&b)try{d.stop()}catch(f){}}function C(){if(!a)return null;if(c)return c;const f=window.speechSynthesis.getVoices()||[];return c=Ae(f,r),c}a&&"onvoiceschanged"in window.speechSynthesis&&window.speechSynthesis.addEventListener("voiceschanged",()=>{c=null,C()});function v(f){if(!a||h||!f)return;const E=String(f).replace(Se,"").trim();if(!E)return;z();const l=new window.SpeechSynthesisUtterance(E);l.lang=r,l.rate=1.02,l.pitch=1,l.volume=1;const m=C();m&&(l.voice=m),l.onstart=()=>g("speaking"),l.onend=()=>{g("idle")},l.onerror=()=>{g("idle")};try{window.speechSynthesis.speak(l)}catch(A){g("idle")}}function z(){if(a)try{window.speechSynthesis.cancel()}catch(f){}}function $(f){h=!!f,h&&z()}function W(){return h}function _(){k(),z(),d=null}return{sttSupported:s,ttsSupported:a,startListening:S,stopListening:k,speak:v,cancelSpeaking:z,setMuted:$,isMuted:W,isListening:()=>b,destroy:_}}function Ee({enabled:r=!1,volume:e=.18}={}){let i=null,t=!r,n=!1;function s(){if(i||t)return i;const c=typeof window!="undefined"?window.AudioContext||window.webkitAudioContext:null;if(!c)return null;try{i=new c,n=!0}catch(g){i=null}return i}function a(c,g,p,w){const x=i.currentTime;c.gain.setValueAtTime(0,x),c.gain.linearRampToValueAtTime(g,x+p),c.gain.exponentialRampToValueAtTime(1e-4,x+p+w)}function d({freq:c,type:g="sine",duration:p=.12,peak:w=e,glideTo:x=null}){if(s())try{const S=i.createOscillator(),k=i.createGain();S.type=g,S.frequency.setValueAtTime(c,i.currentTime),typeof x=="number"&&S.frequency.exponentialRampToValueAtTime(x,i.currentTime+p),a(k,w,.01,p),S.connect(k).connect(i.destination),S.start(),S.stop(i.currentTime+p+.05)}catch(S){}}function b(c){if(!t&&s())switch(i.state==="suspended"&&i.resume().catch(()=>{}),c){case"send":d({freq:620,glideTo:880,duration:.13,peak:e*.8});break;case"receive":d({freq:880,type:"sine",duration:.08,peak:e*.7}),setTimeout(()=>d({freq:1174,type:"sine",duration:.12,peak:e*.85}),70);break;case"error":d({freq:240,glideTo:140,type:"triangle",duration:.22,peak:e*.9});break}}function h(c){t=!!c}function o(){if(i&&n)try{i.close()}catch(c){}i=null}return{play:b,setMuted:h,isMuted:()=>t,destroy:o}}function Te(){const r=new Set,e=typeof window!="undefined",i=()=>e&&typeof navigator!="undefined"?navigator.onLine!==!1:!0;let t=i();function n(){const s=i();s!==t&&(t=s,r.forEach(a=>{try{a(t)}catch(d){console.error("[AI Widget] network listener error",d)}}))}return e&&(window.addEventListener("online",n),window.addEventListener("offline",n)),{isOnline:()=>t,subscribe(s){r.add(s);try{s(t)}catch(a){}return()=>r.delete(s)},destroy(){e&&(window.removeEventListener("online",n),window.removeEventListener("offline",n)),r.clear()}}}class te extends Error{constructor(e){super(e),this.name="NetworkError"}}class re extends Error{constructor(e){super(`Request timed out after ${e}ms`),this.name="TimeoutError"}}class G extends Error{constructor(e,i){super(e),this.name="ApiError",this.status=i}}async function ne(r,e,i){const t=new AbortController,n=setTimeout(()=>t.abort(),i);try{return await fetch(r,q(M({},e),{signal:t.signal}))}catch(s){throw s.name==="AbortError"?new re(i):new te(s.message||"Network request failed")}finally{clearTimeout(n)}}async function Ie(r,e=3,i=600){let t;for(let n=0;n<=e;n++)try{return await r()}catch(s){if(t=s,s instanceof G&&s.status>=400&&s.status<500)throw s;if(n<e){const a=i*Math.pow(2,n),d=Math.random()*200;await new Promise(b=>setTimeout(b,a+d))}}throw t}function Le(r){return r instanceof re?{message:"The request took too long. Please try again.",retryable:!0}:r instanceof te?{message:"No internet connection. Please check your network.",retryable:!0}:r instanceof G?r.status===401||r.status===403?{message:"Authentication failed. Please check your API key.",retryable:!1}:r.status>=500?{message:"Server error. We're working on it — please try again.",retryable:!0}:{message:"Something went wrong. Please try again.",retryable:!0}:{message:"An unexpected error occurred. Please try again.",retryable:!0}}async function Ne(r,e){const{apiKey:i,apiUrl:t,sessionId:n,maxRetries:s,requestTimeoutMs:a}=e;return Ie(async()=>{var p,w,x,S;const b=r[r.length-1],h=r.slice(0,-1).map(({role:k,content:C})=>({role:k,content:C})),o=await ne(t,{method:"POST",headers:{"Content-Type":"application/json","x-api-key":i,Authorization:`Bearer ${i}`,"X-Widget-Session":n||"","X-Widget-Version":"1.0.0"},body:JSON.stringify({message:b.content,sessionId:n,history:h})},a);if(!o.ok){let k="";try{const C=await o.json();k=C.error||C.message||JSON.stringify(C)}catch(C){k=await o.text().catch(()=>`HTTP ${o.status}`)}throw new G(k||`HTTP ${o.status}`,o.status)}let c;try{c=await o.json()}catch(k){throw new G("Invalid JSON in API response",200)}const g=(S=(x=(w=(p=c.reply)!=null?p:c.message)!=null?w:c.content)!=null?x:c.text)!=null?S:c.answer;if(typeof g!="string"||g.trim()==="")throw new G("Unrecognised response format from API",200);return{reply:g.trim(),suggestions:Oe(c.suggestions)}},s)}async function ze(r){const{apiKey:e,apiUrl:i,sessionId:t,requestTimeoutMs:n}=r,a=`${i.replace(/\/[^/]*$/,"")}/transfer`,d=await ne(a,{method:"POST",headers:{"Content-Type":"application/json","x-api-key":e,Authorization:`Bearer ${e}`},body:JSON.stringify({sessionId:t})},n);if(!d.ok){let b=`HTTP ${d.status}`;try{b=(await d.json()).message||b}catch(h){}throw new Error(b)}return d.json()}function Oe(r){if(!Array.isArray(r))return[];const e=new Set,i=[];for(const t of r){if(typeof t!="string")continue;const n=t.trim();if(!n)continue;const s=n.length>60?n.slice(0,60).trim():n,a=s.toLowerCase();if(!e.has(a)&&(e.add(a),i.push(s),i.length>=4))break}return i}function Me(){const r=new Map;return{on(e,i){return r.has(e)||r.set(e,new Set),r.get(e).add(i),()=>this.off(e,i)},off(e,i){var t;(t=r.get(e))==null||t.delete(i)},emit(e,i){var t;(t=r.get(e))==null||t.forEach(n=>{try{n(i)}catch(s){console.error(`[AI Widget] EventBus error in handler for "${e}":`,s)}})},clear(){r.clear()}}}const $e=["button:not([disabled])","textarea:not([disabled])","input:not([disabled])","a[href]",'[tabindex]:not([tabindex="-1"])'].join(", ");function ie(r){return Array.from(r.querySelectorAll($e)).filter(e=>!e.closest("[hidden]")&&e.offsetParent!==null)}function Re(r){let e=!1;function i(t){if(!e||t.key!=="Tab")return;const n=ie(r);if(n.length===0){t.preventDefault();return}const s=n[0],a=n[n.length-1],d=t.target;t.shiftKey?d===s&&(t.preventDefault(),a.focus()):d===a&&(t.preventDefault(),s.focus())}return{activate(t){e=!0,r.addEventListener("keydown",i);const n=t||ie(r)[0];n&&requestAnimationFrame(()=>n.focus())},deactivate(t){e=!1,r.removeEventListener("keydown",i),t&&requestAnimationFrame(()=>t.focus())}}}function Be(r,e){r.textContent="",requestAnimationFrame(()=>{requestAnimationFrame(()=>{r.textContent=e})})}function Ue(r){return`
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :host {
      /* === Brand === */
      --primary:          ${r.primaryColor};
      --primary-rgb:      ${r.primaryRgb};
      --primary-light:    rgba(${r.primaryRgb}, 0.12);
      --primary-hover:    rgba(${r.primaryRgb}, 0.88);

      /* === Surface === */
      --surface:          #ffffff;
      --surface-alt:      #f7f8fa;
      --surface-raised:   #ffffff;
      --border:           #e5e7eb;
      --border-light:     #f3f4f6;

      /* === Text === */
      --text-primary:     #111827;
      --text-secondary:   #6b7280;
      --text-tertiary:    #9ca3af;
      --text-inverse:     #ffffff;

      /* === Semantic === */
      --error:            #ef4444;
      --error-rgb:        239, 68, 68;
      --error-bg:         #fef2f2;
      --success:          #10b981;
      --warning:          #f59e0b;

      /* === Shadows === */
      --shadow-sm:        0 1px 2px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.1);
      --shadow-md:        0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
      --shadow-lg:        0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
      --shadow-xl:        0 20px 40px -8px rgba(0,0,0,0.18), 0 8px 16px -4px rgba(0,0,0,0.08);

      /* === Radius === */
      --radius-xs:        4px;
      --radius-sm:        6px;
      --radius-md:        12px;
      --radius-lg:        16px;
      --radius-xl:        20px;
      --radius-full:      9999px;

      /* === Typography === */
      --font:             -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                          'Helvetica Neue', Arial, sans-serif;
      --font-size-2xs:    10px;
      --font-size-xs:     11px;
      --font-size-sm:     13px;
      --font-size-md:     14px;
      --font-size-lg:     15px;
      --font-size-xl:     18px;

      /* === Motion === */
      --transition-fast:  0.15s ease;
      --transition-base:  0.2s ease;
      --transition-spring: 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      /* === Z-index === */
      --z-widget:         ${r.zIndex};

      /* === Layout === */
      font-family:        var(--font);
      font-size:          var(--font-size-md);
      line-height:        1.5;
      color:              var(--text-primary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    /* Screen-reader only utility */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `}function De(r){const e=r.position||"bottom-right",i=e.includes("left"),t=e.includes("top"),n=typeof r.offsetX=="number"?r.offsetX:24,s=typeof r.offsetY=="number"?r.offsetY:24,a=typeof r.buttonSize=="number"?r.buttonSize:56,d=typeof r.windowWidth=="number"?r.windowWidth:380,b=typeof r.windowHeight=="number"?r.windowHeight:580,h=12,o=s+a+h,c=i?"left":"right",g=t?"top":"bottom",p=t?"-14px":"14px",w=`${t?"top":"bottom"} ${i?"left":"right"}`,x=Math.max(a-4,44);return`
    /* ===================================================
       LAUNCHER BUTTON
    =================================================== */

    .launcher {
      position: fixed;
      ${g}: ${s}px;
      ${c}: ${n}px;
      z-index: var(--z-widget);
      width: ${a}px;
      height: ${a}px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.82) 100%);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-inverse);
      box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.45),
                  0 2px 6px rgba(0,0,0,0.12);
      transition: transform var(--transition-spring),
                  box-shadow var(--transition-base),
                  background var(--transition-base);
      outline: none;
      pointer-events: all;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      /* Gentle entrance — the button scales in from 0 on mount */
      animation: launcherIn 520ms cubic-bezier(0.22, 1.2, 0.36, 1) both,
                 launcherAttention 3.2s ease-in-out 1.2s 2;
    }

    @keyframes launcherIn {
      from { opacity: 0; transform: scale(0.2); }
      to   { opacity: 1; transform: scale(1);   }
    }

    /* Gentle two-pulse attention — plays twice after mount, then stops */
    @keyframes launcherAttention {
      0%, 100% { box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.45),
                             0 2px 6px rgba(0,0,0,0.12),
                             0 0 0 0 rgba(var(--primary-rgb), 0.35); }
      50%       { box-shadow: 0 4px 16px rgba(var(--primary-rgb), 0.45),
                              0 2px 6px rgba(0,0,0,0.12),
                              0 0 0 12px rgba(var(--primary-rgb), 0); }
    }

    .launcher:hover {
      transform: scale(1.07);
      box-shadow: 0 6px 22px rgba(var(--primary-rgb), 0.55),
                  0 3px 8px rgba(0,0,0,0.15);
    }

    .launcher:active {
      transform: scale(0.94);
    }

    .launcher:focus-visible {
      box-shadow: 0 0 0 3px var(--surface),
                  0 0 0 5px var(--primary);
    }

    /* Icon swap animation */
    .launcher__icon {
      position: absolute;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s ease, transform 0.25s ease;
      will-change: transform, opacity;
    }

    .launcher__icon--chat {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }

    .launcher__icon--close {
      opacity: 0;
      transform: scale(0.4) rotate(-90deg);
    }

    .launcher.is-open .launcher__icon--chat {
      opacity: 0;
      transform: scale(0.4) rotate(90deg);
    }

    .launcher.is-open .launcher__icon--close {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }

    /* Unread badge */
    .launcher__badge {
      position: absolute;
      top: -3px;
      right: -3px;
      min-width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      background: var(--error);
      color: var(--text-inverse);
      font-size: var(--font-size-xs);
      font-weight: 700;
      font-family: var(--font);
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      border: 2px solid var(--surface);
      transform: scale(1);
      transition: transform var(--transition-spring), opacity var(--transition-base);
      pointer-events: none;
    }

    .launcher__badge[hidden] {
      transform: scale(0);
      opacity: 0;
      display: flex; /* override hidden so we can animate out */
    }

    /* ===================================================
       CHAT WINDOW
    =================================================== */

    .widget-window {
      position: fixed;
      ${g}: ${o}px;
      ${c}: ${n}px;
      z-index: var(--z-widget);
      width: ${d}px;
      height: ${b}px;
      max-height: calc(100dvh - ${o+16}px);
      background: var(--surface);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      pointer-events: none;
      /* Animation start state */
      opacity: 0;
      transform: scale(0.93) translateY(${p});
      transform-origin: ${w};
      transition: opacity 0.2s ease,
                  transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
      will-change: transform, opacity;
    }

    .widget-window.is-open {
      opacity: 1;
      transform: scale(1) translateY(0);
      pointer-events: all;
    }

    /* ===================================================
       RESPONSIVE — mobile
    =================================================== */

    @media (max-width: 480px) {
      .widget-window {
        width: calc(100vw - 16px);
        height: calc(100dvh - ${x+s+h+16}px);
        max-height: calc(100dvh - ${x+s+h+16}px);
        ${g}: ${x+s+h}px;
        ${c}: 8px;
        ${i?"right: 8px;":"left: 8px;"}
        border-radius: var(--radius-lg) var(--radius-lg) var(--radius-md) var(--radius-md);
        transform-origin: ${t?"top":"bottom"} center;
      }

      .launcher {
        ${g}: ${Math.max(s-10,8)}px;
        ${c}: ${Math.max(n-10,8)}px;
        width: ${x}px;
        height: ${x}px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .launcher { animation: launcherIn 280ms ease both !important; }
      .widget-window {
        transition: opacity 150ms ease !important;
        transform: none !important;
      }
    }
  `}function We(){return`
    /* ===================================================
       HEADER
    =================================================== */

    .header {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 13px 16px;
      border-bottom: 1px solid var(--border);
      background: var(--surface);
      flex-shrink: 0;
    }

    .header__avatar {
      position: relative;
      flex-shrink: 0;
    }

    .header__avatar-img {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      object-fit: cover;
      display: block;
    }

    .header__avatar-fallback {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      background: var(--primary);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-md);
      font-weight: 700;
      letter-spacing: -0.3px;
      flex-shrink: 0;
    }

    .header__status-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 10px;
      height: 10px;
      border-radius: var(--radius-full);
      background: var(--success);
      border: 2px solid var(--surface);
    }

    .header__info {
      flex: 1;
      min-width: 0;
    }

    .header__name {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.3;
    }

    .header__subtitle {
      font-size: var(--font-size-xs);
      color: var(--success);
      font-weight: 500;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .header__actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }

    .header__btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-secondary);
      transition: background var(--transition-fast), color var(--transition-fast);
      padding: 0;
    }

    .header__btn:hover {
      background: var(--surface-alt);
      color: var(--text-primary);
    }

    .header__btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 1px;
    }

    .header__btn--transfer {
      color: var(--text-secondary);
    }
    .header__btn--transfer:hover:not(:disabled) {
      color: var(--primary);
      background: rgba(var(--primary-rgb), 0.1);
    }
    .header__btn--transfer.is-active {
      color: var(--primary);
      background: rgba(var(--primary-rgb), 0.12);
    }
    .header__btn--transfer:disabled {
      opacity: 0.5;
      cursor: default;
    }

    /* ===================================================
       MESSAGES AREA
    =================================================== */

    .messages-area {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 12px 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      background: var(--surface-alt);
      scroll-behavior: smooth;
      overscroll-behavior: contain;
    }

    .messages-area::-webkit-scrollbar {
      width: 4px;
    }

    .messages-area::-webkit-scrollbar-track {
      background: transparent;
    }

    .messages-area::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.12);
      border-radius: 2px;
    }

    .messages-area::-webkit-scrollbar-thumb:hover {
      background: rgba(0,0,0,0.22);
    }

    /* Welcome / empty state */
    .messages-welcome {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 20px 12px 12px;
      gap: 8px;
    }

    .messages-welcome__avatar {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-full);
      background: var(--primary-light);
      border: 2px solid rgba(var(--primary-rgb), 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .messages-welcome__text {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.6;
      max-width: 260px;
    }

    /* Date / time separator between message groups */
    .date-separator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 10px 0 4px;
      padding: 0 2px;
    }

    .date-separator__line {
      flex: 1;
      height: 1px;
      background: var(--border);
    }

    .date-separator__text {
      font-size: var(--font-size-2xs);
      color: var(--text-tertiary);
      font-weight: 500;
      white-space: nowrap;
      letter-spacing: 0.3px;
    }

    /* ===================================================
       MESSAGE BUBBLE
    =================================================== */

    .bubble-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 7px;
      max-width: 86%;
      margin-top: 2px;
    }

    .bubble-wrapper--user {
      margin-left: auto;
      flex-direction: row-reverse;
    }

    .bubble-wrapper--assistant {
      margin-right: auto;
    }

    /* Small bot avatar beside each assistant message */
    .bubble-avatar {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-full);
      background: var(--primary);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 700;
      flex-shrink: 0;
      margin-bottom: 2px;
      overflow: hidden;
    }

    .bubble-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .bubble-avatar--hidden {
      visibility: hidden;
    }

    .bubble-content {
      display: flex;
      flex-direction: column;
    }

    .bubble {
      padding: 9px 13px;
      border-radius: var(--radius-md);
      font-size: var(--font-size-md);
      line-height: 1.55;
      word-break: break-word;
      overflow-wrap: break-word;
      transition: opacity var(--transition-base);
    }

    .bubble--user {
      background: var(--primary);
      color: var(--text-inverse);
      border-radius: var(--radius-md) var(--radius-md) var(--radius-sm) var(--radius-md);
    }

    .bubble--assistant {
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-sm);
    }

    /* Failed message state */
    .bubble--failed {
      background: var(--error-bg);
      border: 1.5px solid rgba(var(--error-rgb), 0.35);
      color: var(--text-primary);
      opacity: 0.9;
    }

    .bubble-retry-row {
      display: flex;
      align-items: center;
      gap: 5px;
      margin-top: 5px;
    }

    /* Critical: the 'hidden' attribute must actually hide the row —
       otherwise "Failed to send" bleeds into every successful message. */
    .bubble-retry-row[hidden] {
      display: none !important;
    }

    .bubble-retry-row__text {
      font-size: var(--font-size-xs);
      color: var(--error);
    }

    .bubble-retry-btn {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      background: none;
      border: none;
      padding: 2px 6px;
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 600;
      color: var(--error);
      cursor: pointer;
      border-radius: var(--radius-xs);
      transition: background var(--transition-fast);
    }

    .bubble-retry-btn:hover {
      background: rgba(var(--error-rgb), 0.1);
    }

    .bubble-retry-btn:focus-visible {
      outline: 2px solid var(--error);
      outline-offset: 1px;
    }

    /* Timestamp below each bubble */
    .bubble-meta {
      font-size: var(--font-size-2xs);
      color: var(--text-tertiary);
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 3px;
    }

    .bubble-meta--user {
      justify-content: flex-end;
    }

    .bubble-meta--assistant {
      justify-content: flex-start;
      padding-left: 1px;
    }

    /* Sending state: subtle pulse on user message */
    .bubble--sending {
      opacity: 0.7;
    }

    /* ===================================================
       SUGGESTION CHIPS
    =================================================== */

    /* Row container — horizontal, wraps on very narrow screens */
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .suggestions[hidden] {
      display: none;
    }

    /* Welcome-state chips: centered so they sit nicely under the greeting */
    .messages-welcome .suggestions {
      justify-content: center;
      margin-top: 12px;
    }

    .suggestion-chip {
      display: inline-flex;
      align-items: center;
      height: 30px;
      padding: 0 12px;
      background: var(--surface);
      border: 1.5px solid rgba(var(--primary-rgb), 0.35);
      border-radius: 100px;           /* pill */
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 500;
      color: var(--primary);
      cursor: pointer;
      white-space: nowrap;
      line-height: 1;
      user-select: none;
      -webkit-user-select: none;
      transition:
        background var(--transition-fast),
        border-color var(--transition-fast),
        color var(--transition-fast),
        transform 80ms ease,
        box-shadow var(--transition-fast),
        opacity var(--transition-fast);
      /* Entrance: fade + slight vertical drift */
      animation: chipIn 220ms ease both;
    }

    @keyframes chipIn {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0);   }
    }

    /* Stagger entrance for each chip */
    .suggestion-chip:nth-child(1) { animation-delay: 0ms;   }
    .suggestion-chip:nth-child(2) { animation-delay: 50ms;  }
    .suggestion-chip:nth-child(3) { animation-delay: 100ms; }
    .suggestion-chip:nth-child(4) { animation-delay: 150ms; }

    .suggestion-chip:hover {
      background: rgba(var(--primary-rgb), 0.08);
      border-color: var(--primary);
      box-shadow: 0 1px 4px rgba(var(--primary-rgb), 0.18);
    }

    .suggestion-chip:active {
      transform: scale(0.95);
      background: rgba(var(--primary-rgb), 0.14);
      box-shadow: none;
    }

    .suggestion-chip:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .suggestion-chip:disabled,
    .suggestions--disabled .suggestion-chip {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }

    /* ===================================================
       TYPING INDICATOR
    =================================================== */

    .typing-indicator {
      display: flex;
      align-items: flex-end;
      gap: 7px;
      margin-top: 4px;
      margin-right: auto;
    }

    .typing-indicator[hidden] {
      display: none;
    }

    .typing-bubble {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md) var(--radius-md) var(--radius-md) var(--radius-sm);
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* Dots wrapper (class renamed from typing-bubble to typing-dots) */
    .typing-dots {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--text-tertiary);
      animation: typingBounce 1.3s infinite ease-in-out both;
    }

    .typing-dot:nth-child(1) { animation-delay: 0ms;   }
    .typing-dot:nth-child(2) { animation-delay: 160ms; }
    .typing-dot:nth-child(3) { animation-delay: 320ms; }

    @keyframes typingBounce {
      0%, 60%, 100% { transform: translateY(0);   opacity: 0.4; }
      30%            { transform: translateY(-5px); opacity: 1;   }
    }

    /* Progress stage label — fades in when text is set */
    .typing-label {
      font-size: var(--font-size-xs);
      color: var(--text-tertiary);
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      transition:
        opacity 350ms ease,
        max-width 350ms ease;
    }

    .typing-label--visible {
      opacity: 1;
      max-width: 120px; /* generous cap; actual text is short */
    }

    /* ===================================================
       ERROR BANNER
    =================================================== */

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 9px 14px;
      background: var(--error-bg);
      border-top: 1px solid rgba(var(--error-rgb), 0.2);
      border-bottom: 1px solid rgba(var(--error-rgb), 0.2);
      font-size: var(--font-size-sm);
      color: #991b1b;
      flex-shrink: 0;
    }

    .error-banner[hidden] {
      display: none;
    }

    .error-banner__icon {
      color: var(--error);
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .error-banner__text {
      flex: 1;
      line-height: 1.4;
    }

    .error-banner__retry {
      flex-shrink: 0;
      background: none;
      border: 1px solid rgba(var(--error-rgb), 0.4);
      border-radius: var(--radius-xs);
      padding: 3px 10px;
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 600;
      color: var(--error);
      cursor: pointer;
      white-space: nowrap;
      transition: background var(--transition-fast);
    }

    .error-banner__retry:hover {
      background: rgba(var(--error-rgb), 0.1);
    }

    .error-banner__retry:focus-visible {
      outline: 2px solid var(--error);
      outline-offset: 1px;
    }

    .error-banner__dismiss {
      flex-shrink: 0;
      background: none;
      border: none;
      padding: 2px;
      cursor: pointer;
      color: rgba(var(--error-rgb), 0.7);
      display: flex;
      align-items: center;
      border-radius: var(--radius-xs);
      transition: color var(--transition-fast);
    }

    .error-banner__dismiss:hover {
      color: var(--error);
    }

    .error-banner__dismiss:focus-visible {
      outline: 2px solid var(--error);
      outline-offset: 1px;
    }

    /* ===================================================
       BUBBLE ENTRANCE ANIMATION
    =================================================== */

    .bubble-wrapper {
      animation: bubbleIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    @keyframes bubbleIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.985);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .bubble-wrapper--user .bubble {
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.88) 100%);
      box-shadow: 0 1px 2px rgba(var(--primary-rgb), 0.3),
                  0 4px 12px rgba(var(--primary-rgb), 0.18);
    }

    /* ===================================================
       READ RECEIPTS (inline with timestamp)
    =================================================== */

    .bubble-meta__status {
      display: inline-flex;
      align-items: center;
      color: var(--text-tertiary);
      transition: color var(--transition-base);
    }

    .bubble-meta__status--sent {
      color: var(--text-tertiary);
    }

    .bubble-meta__status--delivered {
      color: var(--primary);
    }

    .bubble-meta__status[hidden] { display: none !important; }

    /* ===================================================
       HEADER — refined avatar + extra actions
    =================================================== */

    .header {
      background: linear-gradient(180deg,
        var(--surface) 0%,
        rgba(var(--primary-rgb), 0.015) 100%);
    }

    .header__avatar-fallback {
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.78) 100%);
      box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.28);
    }

    .header__status-dot {
      animation: statusPulse 2.4s ease-in-out infinite;
    }

    @keyframes statusPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45); }
      50%       { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
    }

    .header__btn[aria-pressed="true"] {
      background: rgba(var(--primary-rgb), 0.12);
      color: var(--primary);
    }

    /* ===================================================
       WELCOME CARD — richer starter screen
    =================================================== */

    .messages-welcome {
      padding: 28px 16px 16px;
      gap: 10px;
    }

    .messages-welcome__avatar {
      background: linear-gradient(135deg,
        rgba(var(--primary-rgb), 0.14) 0%,
        rgba(var(--primary-rgb), 0.28) 100%);
      border-color: rgba(var(--primary-rgb), 0.28);
      box-shadow: 0 4px 14px rgba(var(--primary-rgb), 0.18);
      animation: welcomeAvatarIn 420ms cubic-bezier(0.22, 1.2, 0.36, 1) both;
    }

    @keyframes welcomeAvatarIn {
      from { opacity: 0; transform: scale(0.6); }
      to   { opacity: 1; transform: scale(1);   }
    }

    .messages-welcome__title {
      font-size: var(--font-size-xl);
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.3px;
      margin-top: 2px;
    }

    .messages-welcome__text {
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      line-height: 1.55;
      max-width: 280px;
    }

    .messages-welcome__hint {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 10px;
      margin-top: 4px;
      font-size: var(--font-size-2xs);
      font-weight: 600;
      letter-spacing: 0.4px;
      text-transform: uppercase;
      color: var(--primary);
      background: rgba(var(--primary-rgb), 0.1);
      border-radius: var(--radius-full);
    }

    .messages-welcome__hint svg { flex-shrink: 0; }

    /* ===================================================
       SCROLL-TO-BOTTOM FLOATING PILL
    =================================================== */

    .scroll-to-bottom {
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%) translateY(8px);
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px 5px 10px;
      background: var(--surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-full);
      font-size: var(--font-size-xs);
      font-family: var(--font);
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      transition: opacity 180ms ease, transform 220ms cubic-bezier(0.34, 1.56, 0.64, 1);
      z-index: 3;
    }

    .scroll-to-bottom.is-visible {
      opacity: 1;
      pointer-events: all;
      transform: translateX(-50%) translateY(0);
    }

    .scroll-to-bottom:hover {
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
      border-color: rgba(var(--primary-rgb), 0.3);
      color: var(--primary);
    }

    .scroll-to-bottom__count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      background: var(--primary);
      color: var(--text-inverse);
      border-radius: var(--radius-full);
      font-size: 9px;
      font-weight: 700;
    }

    .scroll-to-bottom__count[hidden] { display: none !important; }

    /* Messages area needs to be positioning context for the pill */
    .messages-area {
      position: relative;
    }

    /* ===================================================
       OFFLINE BANNER
    =================================================== */

    .offline-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 7px 14px;
      background: #fef3c7;
      color: #92400e;
      border-bottom: 1px solid rgba(245, 158, 11, 0.3);
      font-size: var(--font-size-xs);
      font-weight: 600;
      flex-shrink: 0;
      animation: bannerSlideIn 240ms ease both;
    }

    .offline-banner[hidden] { display: none !important; }

    @keyframes bannerSlideIn {
      from { opacity: 0; transform: translateY(-100%); }
      to   { opacity: 1; transform: translateY(0);    }
    }

    /* ===================================================
       TYPING INDICATOR — enhanced
    =================================================== */

    .typing-bubble {
      background: linear-gradient(135deg,
        var(--surface) 0%,
        var(--surface-alt) 100%);
      animation: bubbleIn 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
    }

    .typing-dot {
      background: linear-gradient(135deg,
        var(--primary) 0%,
        rgba(var(--primary-rgb), 0.7) 100%);
    }

    .typing-label--visible {
      color: var(--primary);
    }

    /* ===================================================
       RESPECT REDUCED MOTION
    =================================================== */

    @media (prefers-reduced-motion: reduce) {
      .bubble-wrapper,
      .typing-bubble,
      .messages-welcome__avatar,
      .offline-banner,
      .suggestion-chip {
        animation: none !important;
      }
      .header__status-dot { animation: none !important; }
    }
  `}function je(){return`
    /* ===================================================
       INPUT CONTAINER (outer wrapper — stacks input row + footer)
    =================================================== */

    .input-container {
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      background: var(--surface);
    }

    /* ===================================================
       INPUT AREA
    =================================================== */

    .input-area {
      padding: 10px 12px 12px;
      background: var(--surface);
      border-top: 1px solid var(--border);
      display: flex;
      align-items: flex-end;
      gap: 8px;
      flex-shrink: 0;
    }

    .input-wrapper {
      flex: 1;
      background: var(--surface-alt);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-md);
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      transition: border-color var(--transition-fast),
                  box-shadow var(--transition-fast);
    }

    .input-wrapper:focus-within {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.15);
      background: var(--surface);
    }

    .input-wrapper.is-disabled {
      opacity: 0.55;
      pointer-events: none;
      /* Subtle animated border shows the request is in-flight */
      border-color: rgba(var(--primary-rgb), 0.4);
      animation: inputPulse 1.8s ease-in-out infinite;
    }

    @keyframes inputPulse {
      0%, 100% { box-shadow: 0 0 0 0px rgba(var(--primary-rgb), 0); }
      50%       { box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.12); }
    }

    .input-textarea {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      padding: 8px 10px 8px 12px;
      font-family: var(--font);
      font-size: var(--font-size-md);
      color: var(--text-primary);
      resize: none;
      min-height: 36px;
      max-height: 116px;
      line-height: 1.5;
      display: block;
      width: 100%;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .input-textarea::placeholder {
      color: var(--text-tertiary);
    }

    .input-textarea::-webkit-scrollbar {
      width: 3px;
    }

    .input-textarea::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 2px;
    }

    /* Send button */
    .send-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: none;
      background: var(--primary);
      color: var(--text-inverse);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background var(--transition-fast),
                  opacity var(--transition-fast),
                  transform var(--transition-spring);
    }

    .send-btn:disabled {
      background: var(--border);
      color: var(--text-tertiary);
      cursor: not-allowed;
      transform: none;
    }

    .send-btn:not(:disabled):hover {
      filter: brightness(0.87);
      transform: scale(1.06);
    }

    .send-btn:not(:disabled):active {
      transform: scale(0.93);
    }

    .send-btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    /* Footer attribution */
    .input-footer {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4px 0 0;
    }

    .input-footer__text {
      font-size: var(--font-size-2xs);
      color: var(--text-tertiary);
      letter-spacing: 0.2px;
    }

    .input-footer__text a {
      color: var(--text-tertiary);
      text-decoration: none;
    }

    .input-footer__text a:hover {
      text-decoration: underline;
    }

    /* ===================================================
       VOICE INPUT — mic button + listening pulse
    =================================================== */

    .voice-btn {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition:
        background var(--transition-fast),
        color var(--transition-fast),
        transform 120ms ease;
    }

    .voice-btn:hover {
      background: var(--surface-alt);
      color: var(--text-primary);
    }

    .voice-btn:active { transform: scale(0.92); }

    .voice-btn:focus-visible {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    .voice-btn[hidden] { display: none !important; }

    /* Active "listening" state — red mic + animated rings */
    .voice-btn.is-listening {
      background: rgba(239, 68, 68, 0.1);
      color: var(--error);
    }

    .voice-btn.is-listening::before,
    .voice-btn.is-listening::after {
      content: '';
      position: absolute;
      inset: 4px;
      border-radius: var(--radius-sm);
      border: 2px solid rgba(239, 68, 68, 0.55);
      pointer-events: none;
      animation: voicePulse 1.4s ease-out infinite;
    }

    .voice-btn.is-listening::after {
      animation-delay: 0.7s;
    }

    @keyframes voicePulse {
      0%   { transform: scale(0.92); opacity: 0.8; }
      100% { transform: scale(1.55); opacity: 0;   }
    }

    /* Interim transcript chip appearing above the input */
    .interim-transcript {
      margin: 0 12px 6px;
      padding: 7px 11px;
      background: rgba(var(--primary-rgb), 0.08);
      border: 1px dashed rgba(var(--primary-rgb), 0.4);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      color: var(--primary);
      font-style: italic;
      line-height: 1.4;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: bannerSlideIn 220ms ease both;
    }

    .interim-transcript[hidden] { display: none !important; }

    .interim-transcript__dot {
      flex-shrink: 0;
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      background: var(--error);
      animation: blink 1s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1;   }
      50%       { opacity: 0.3; }
    }

    /* ===================================================
       CHARACTER COUNTER
    =================================================== */

    .input-counter {
      font-size: 10px;
      color: var(--text-tertiary);
      font-weight: 500;
      padding: 0 8px 4px 0;
      text-align: right;
      opacity: 0;
      transition: opacity var(--transition-base), color var(--transition-fast);
    }

    .input-counter.is-visible { opacity: 1; }
    .input-counter.is-warn    { color: var(--warning); }
    .input-counter.is-limit   { color: var(--error); }

    /* ===================================================
       REDUCED MOTION
    =================================================== */

    @media (prefers-reduced-motion: reduce) {
      .voice-btn.is-listening::before,
      .voice-btn.is-listening::after,
      .interim-transcript__dot,
      .input-wrapper.is-disabled {
        animation: none !important;
      }
    }
  `}function u(r,e={},...i){const t=document.createElement(r);e=e||{};for(const[n,s]of Object.entries(e))if(s!=null)if(n==="class")t.className=s;else if(n==="style"&&typeof s=="string")t.style.cssText=s;else if(n==="html")t.innerHTML=s;else if(n.startsWith("on")&&typeof s=="function"){const a=n.slice(2).toLowerCase();t.addEventListener(a,s)}else t.setAttribute(n,s);for(const n of i.flat(1/0))n!=null&&(typeof n=="string"||typeof n=="number"?t.appendChild(document.createTextNode(String(n))):n instanceof Node&&t.appendChild(n));return t}function ae(r){const i=Date.now()-r,t=Math.floor(i/6e4);return t<1?"just now":t<60?`${t} min ago`:new Date(r).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}function K(r){const e=r.trim().split(/\s+/);return e.length===1?e[0][0].toUpperCase():(e[0][0]+e[e.length-1][0]).toUpperCase()}const He=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
  <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z"/>
  <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.124-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z"/>
</svg>`,se=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
  <line x1="18" y1="6" x2="6" y2="18"/>
  <line x1="6" y1="6" x2="18" y2="18"/>
</svg>`,Pe=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="17" height="17" aria-hidden="true">
  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
</svg>`,Fe=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
  <polyline points="6 9 12 15 18 9"/>
</svg>`,Ve=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="15" height="15" aria-hidden="true">
  <path fill-rule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/>
</svg>`,qe=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13" aria-hidden="true">
  <polyline points="1 4 1 10 7 10"/>
  <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
</svg>`,Ye=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true">
  <rect x="9" y="3" width="6" height="12" rx="3"/>
  <path d="M5 11a7 7 0 0 0 14 0"/>
  <line x1="12" y1="18" x2="12" y2="22"/>
  <line x1="8" y1="22" x2="16" y2="22"/>
</svg>`,Ke=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="17" height="17" aria-hidden="true">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
</svg>`,oe=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="17" height="17" aria-hidden="true">
  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
  <line x1="23" y1="9" x2="17" y2="15"/>
  <line x1="17" y1="9" x2="23" y2="15"/>
</svg>`,Ge=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
  <line x1="12" y1="5" x2="12" y2="19"/>
  <polyline points="19 12 12 19 5 12"/>
</svg>`,Xe=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
  <path d="M12 2l1.9 5.1L19 9l-5.1 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 2z"/>
  <path d="M19 14l.9 2.4L22 17l-2.1.6L19 20l-.9-2.4L16 17l2.1-.6L19 14z"/>
  <path d="M5 14l.9 2.4L8 17l-2.1.6L5 20l-.9-2.4L2 17l2.1-.6L5 14z"/>
</svg>`,le=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="11" height="11" aria-hidden="true">
  <polyline points="20 6 9 17 4 12"/>
</svg>`,Je=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" width="13" height="11" aria-hidden="true">
  <polyline points="1 12 6 17 15 7"/>
  <polyline points="9 12 14 17 23 7"/>
</svg>`,Qe=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14" aria-hidden="true">
  <line x1="2" y1="2" x2="22" y2="22"/>
  <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
  <path d="M2 8.82a15 15 0 0 1 4.17-2.65"/>
  <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76"/>
  <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68"/>
  <path d="M5 13a10 10 0 0 1 5.24-2.76"/>
  <line x1="12" y1="20" x2="12.01" y2="20"/>
</svg>`,Ze=`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
  <circle cx="12" cy="7" r="4"/>
</svg>`;function et(r,e,i){const t=u("span",{class:"launcher__icon launcher__icon--chat",html:He}),n=u("span",{class:"launcher__icon launcher__icon--close",html:se}),s=u("span",{class:"launcher__badge","aria-label":"unread messages",role:"status"});s.setAttribute("hidden","");const a=u("button",{class:"launcher",type:"button","aria-label":`Open chat with ${i.botName}`,"aria-expanded":"false","aria-haspopup":"dialog"},t,n,s),d=()=>e.emit("toggle");a.addEventListener("click",d);function b(c,g){const p=c.isOpen!==(g==null?void 0:g.isOpen),w=c.unreadCount!==(g==null?void 0:g.unreadCount);if(p&&(a.classList.toggle("is-open",c.isOpen),a.setAttribute("aria-expanded",String(c.isOpen)),a.setAttribute("aria-label",c.isOpen?"Close chat":`Open chat with ${i.botName}`)),w||p){const x=c.unreadCount;x>0&&!c.isOpen?(s.textContent=x>99?"99+":String(x),s.removeAttribute("hidden"),s.setAttribute("aria-label",`${x} unread message${x!==1?"s":""}`)):s.setAttribute("hidden","")}}const h=r.subscribe(b);function o(){h(),a.removeEventListener("click",d)}return{el:a,destroy:o}}function tt(r,e,i){let t;if(i.avatarUrl){const _=u("img",{class:"header__avatar-img",src:i.avatarUrl,alt:`${i.botName} avatar`});_.addEventListener("error",()=>{_.replaceWith(n())}),t=_}else t=n();function n(){return u("span",{class:"header__avatar-fallback","aria-hidden":"true"},K(i.botName))}const s=u("span",{class:"header__status-dot",title:"Online","aria-hidden":"true"}),a=u("div",{class:"header__avatar"},t,s),d=u("div",{class:"header__name"},i.botName),b=u("div",{class:"header__subtitle"},"Active now"),h=u("div",{class:"header__info"},d,b),o=u("button",{class:"header__btn",type:"button","aria-label":"Turn on voice responses","aria-pressed":"false",title:"Voice responses",html:oe});o.setAttribute("hidden","");const c=()=>e.emit("tts-toggle");o.addEventListener("click",c);function g(_){const f=_.ttsSupported&&i.enableTTS!==!1;o.toggleAttribute("hidden",!f);const E=!!_.ttsEnabled;o.innerHTML=E?Ke:oe,o.setAttribute("aria-pressed",String(E)),o.setAttribute("aria-label",E?"Turn off voice responses":"Turn on voice responses"),o.title=E?"Voice responses: on":"Voice responses: off"}const p=u("button",{class:"header__btn header__btn--transfer",type:"button","aria-label":"Talk to a human agent",title:"Talk to a human",html:Ze}),w=()=>e.emit("request-transfer");p.addEventListener("click",w);function x(_){const f=_.transferState==="requested",E=_.transferState==="connected",l=_.transferState==="ended";p.classList.toggle("is-active",f||E),p.disabled=f||E||l,p.title=f?"Connecting to agent…":E?"Agent is connected":"Talk to a human"}const S=u("button",{class:"header__btn",type:"button","aria-label":"Close chat",html:Fe}),k=()=>e.emit("close");S.addEventListener("click",k);const C=u("div",{class:"header__actions"},o,p,S),v=u("header",{class:"header",role:"banner"},a,h,C);function z(_,f){(_.ttsEnabled!==(f==null?void 0:f.ttsEnabled)||_.ttsSupported!==(f==null?void 0:f.ttsSupported))&&g(_),_.transferState!==(f==null?void 0:f.transferState)&&x(_),_.agentName!==(f==null?void 0:f.agentName)&&_.agentName?b.textContent=`${_.agentName} (Human)`:_.agentName||(b.textContent=_.transferState==="requested"?"Connecting to agent…":"Active now")}const $=r.subscribe(z);g(r.getState()),x(r.getState());function W(){S.removeEventListener("click",k),o.removeEventListener("click",c),p.removeEventListener("click",w),$()}return{el:v,destroy:W}}function ce({suggestions:r=[],bus:e,messageId:i=null,ariaLabel:t="Suggested replies"}){const n=u("div",{class:"suggestions",role:"group","aria-label":t});let s=i,a=!1;function d(c){if(n.textContent="",!Array.isArray(c)||c.length===0){n.setAttribute("hidden","");return}n.removeAttribute("hidden"),c.forEach(g=>{const p=u("button",{type:"button",class:"suggestion-chip","aria-label":`Send: ${g}`});p.textContent=g,p.addEventListener("click",()=>{a||(h(!0),e.emit("suggestion-click",{text:g,messageId:s}))}),n.appendChild(p)})}function b({suggestions:c=[],messageId:g=s}={}){s=g,a=!1,d(c)}function h(c){a=!!c,n.classList.toggle("suggestions--disabled",a);for(const g of n.querySelectorAll(".suggestion-chip"))g.disabled=a,g.setAttribute("aria-disabled",String(a))}function o(){n.textContent=""}return d(r),{el:n,update:b,setDisabled:h,destroy:o}}function rt(r,e,i,t=!0){const n=r.role==="user";let s=null;if(!n)if(e.avatarUrl){const v=document.createElement("img");v.src=e.avatarUrl,v.alt="",s=u("div",{class:"bubble-avatar"},v),v.addEventListener("error",()=>{v.replaceWith(document.createTextNode(K(e.botName)))})}else s=u("div",{class:`bubble-avatar${t?"":" bubble-avatar--hidden"}`,"aria-hidden":"true"},K(e.botName));const a=u("div",{class:`bubble bubble--${n?"user":"assistant"}`});a.textContent=r.content;let d=null;if(n){d=u("div",{class:"bubble-retry-row","aria-live":"polite"}),d.setAttribute("hidden","");const v=u("button",{class:"bubble-retry-btn",type:"button","aria-label":"Retry sending this message",html:`${qe} Retry`});v.addEventListener("click",()=>{i.emit("retry-message",{messageId:r.id,content:r.content})});const z=u("span",{class:"bubble-retry-row__text"},"Failed to send.");d.appendChild(z),d.appendChild(v)}const b=u("span",{class:"bubble-meta__time"},ae(r.timestamp));let h=null;n&&(h=u("span",{class:"bubble-meta__status","aria-hidden":"true",html:le}),h.setAttribute("hidden",""));const o=u("div",{class:`bubble-meta bubble-meta--${n?"user":"assistant"}`,"aria-label":new Date(r.timestamp).toLocaleTimeString()},b,h);let c=null;n||(c=ce({suggestions:Array.isArray(r.suggestions)?r.suggestions:[],bus:i,messageId:r.id}));const g=[a];c&&g.push(c.el),d&&g.push(d),g.push(o);const p=u("div",{class:"bubble-content"},...g),w=n?[p]:[s,p],x=u("div",{class:`bubble-wrapper bubble-wrapper--${n?"user":"assistant"}`,role:"listitem","data-message-id":r.id},...w);S(r.status);function S(v){a.classList.remove("bubble--sending","bubble--failed"),v==="sending"?(a.classList.add("bubble--sending"),d&&d.setAttribute("hidden",""),h&&h.setAttribute("hidden","")):v==="failed"?(a.classList.add("bubble--failed"),d&&d.removeAttribute("hidden"),h&&h.setAttribute("hidden","")):(d&&d.setAttribute("hidden",""),h&&(h.innerHTML=v==="delivered"?Je:le,h.classList.toggle("bubble-meta__status--delivered",v==="delivered"),h.classList.toggle("bubble-meta__status--sent",v!=="delivered"),h.removeAttribute("hidden")))}function k(v){if(v.content!==r.content&&(a.textContent=v.content,r.content=v.content),v.status!==r.status&&(r.status=v.status,S(v.status)),v.timestamp!==r.timestamp&&(r.timestamp=v.timestamp,b.textContent=ae(v.timestamp),o.setAttribute("aria-label",new Date(v.timestamp).toLocaleTimeString())),c){const z=Array.isArray(v.suggestions)?v.suggestions:[],$=Array.isArray(r.suggestions)?r.suggestions:[];(z.length!==$.length||z.some((W,_)=>W!==$[_]))&&(r.suggestions=z,c.update({suggestions:z,messageId:r.id}))}}function C(v){s&&s.classList.toggle("bubble-avatar--hidden",!v)}return{el:x,update:k,setAvatarVisible:C}}const nt=[{delayMs:1500,text:"Thinking…"},{delayMs:5e3,text:"Processing…"},{delayMs:1e4,text:"Almost ready…"}];function it(r,e){let i;if(e.avatarUrl){i=u("div",{class:"bubble-avatar"});const p=document.createElement("img");p.src=e.avatarUrl,p.alt="",p.addEventListener("error",()=>{p.replaceWith(document.createTextNode(K(e.botName)))}),i.appendChild(p)}else i=u("div",{class:"bubble-avatar","aria-hidden":"true"},K(e.botName));const t=u("div",{class:"typing-dots","aria-hidden":"true"},u("span",{class:"typing-dot"}),u("span",{class:"typing-dot"}),u("span",{class:"typing-dot"})),n=u("span",{class:"typing-label","aria-live":"polite"}),s=u("div",{class:"typing-bubble"},t,n),a=u("div",{class:"typing-indicator",role:"status","aria-label":`${e.botName} is thinking`},i,s);a.setAttribute("hidden","");let d=[];function b(){n.textContent="",n.classList.remove("typing-label--visible"),d=nt.map(({delayMs:p,text:w})=>setTimeout(()=>{n.textContent=w,n.classList.add("typing-label--visible"),a.setAttribute("aria-label",`${e.botName}: ${w}`)},p))}function h(){d.forEach(clearTimeout),d=[],n.textContent="",n.classList.remove("typing-label--visible"),a.setAttribute("aria-label",`${e.botName} is thinking`)}function o(p,w){p.status!==(w==null?void 0:w.status)&&(p.status==="loading"?(a.removeAttribute("hidden"),b()):(a.setAttribute("hidden",""),h()))}const c=r.subscribe(o);function g(){h(),c()}return{el:a,destroy:g}}function at(r,e,i){const t=u("div",{class:"sr-only","aria-live":"polite","aria-atomic":"false",role:"log"});let n;if(i.avatarUrl){const l=document.createElement("img");l.src=i.avatarUrl,l.alt="",l.style.cssText="width:100%;height:100%;object-fit:cover;border-radius:50%",n=u("div",{class:"messages-welcome__avatar"},l)}else n=u("div",{class:"messages-welcome__avatar"},K(i.botName));const s=ce({suggestions:Array.isArray(i.defaultSuggestions)?i.defaultSuggestions:[],bus:e,messageId:null,ariaLabel:"Quick start options"}),a=u("div",{class:"messages-welcome__title"},`Hi, I'm ${i.botName}`),d=u("div",{class:"messages-welcome__hint"},u("span",{class:"messages-welcome__hint-icon",html:Xe}),"AI Assistant"),b=u("div",{class:"messages-welcome","aria-hidden":"true"},n,d,a,u("p",{class:"messages-welcome__text"},i.welcomeMessage),s.el),{el:h,destroy:o}=it(r,i),c=u("div",{role:"list","aria-label":"Chat messages"}),g=u("span",{class:"scroll-to-bottom__count"});g.setAttribute("hidden","");const p=u("button",{type:"button",class:"scroll-to-bottom","aria-label":"Jump to latest message"},u("span",{class:"scroll-to-bottom__icon",html:Ge,"aria-hidden":"true"}),u("span",{class:"scroll-to-bottom__label"},"Latest"),g),w=u("div",{class:"messages-area","aria-label":"Messages",tabindex:"0"},b,c,h,p,t),x=new Map;let S=!1,k=0,C=0;function v(){const l=S;p.classList.toggle("is-visible",l),l||(C=0),z()}function z(){C>0?(g.textContent=C>99?"99+":String(C),g.removeAttribute("hidden")):g.setAttribute("hidden","")}w.addEventListener("scroll",()=>{const l=w.scrollHeight-w.scrollTop-w.clientHeight,m=S;S=l>60,m!==S&&v()},{passive:!0}),p.addEventListener("click",()=>{S=!1,C=0,$(!0),v()});function $(l=!1){(!S||l)&&requestAnimationFrame(()=>{w.scrollTop=w.scrollHeight})}function W(l){const m=new Set(l.map(A=>A.id));for(const[A,B]of x)m.has(A)||(B.el.remove(),x.delete(A));l.forEach((A,B)=>{var P;const L=B===l.length-1||((P=l[B+1])==null?void 0:P.role)!==A.role;if(x.has(A.id)){const{handle:F}=x.get(A.id);F.update(A),F.setAvatarVisible(A.role==="assistant"&&L)}else{const F=A.role==="assistant"&&L,V=rt(A,i,e,F);c.appendChild(V.el),x.set(A.id,{el:V.el,handle:V}),A.role==="assistant"&&Be(t,`${i.botName}: ${A.content}`)}})}function _(l,m){const A=l.messages!==(m==null?void 0:m.messages),B=l.status!==(m==null?void 0:m.status);if(A){const L=l.messages.length>0;if(b.setAttribute("aria-hidden",String(L)),b.style.display=L?"none":"",W(l.messages),l.messages.length>k)if(S){const V=l.messages.slice(k).filter(Q=>Q.role==="assistant").length;C+=V,z()}else $(!0);k=l.messages.length}B&&l.status==="loading"&&$(),w.setAttribute("aria-busy",String(l.status==="loading"))}const f=r.subscribe(_);_(r.getState(),null);function E(){f(),o(),s.destroy(),x.clear()}return{el:w,scrollToBottom:$,destroy:E}}const J=2e3,de=1700;function st(r,e,i){const t=document.createElement("textarea");t.className="input-textarea",t.placeholder=`Message ${i.botName}…`,t.setAttribute("aria-label","Type a message"),t.setAttribute("rows","1"),t.setAttribute("maxlength",String(J)),t.setAttribute("autocomplete","off"),t.setAttribute("spellcheck","true");const n=u("button",{class:"send-btn",type:"button","aria-label":"Send message",html:Pe,disabled:""}),s=u("button",{class:"voice-btn",type:"button","aria-label":"Start voice input","aria-pressed":"false",html:Ye});s.setAttribute("hidden",""),s.addEventListener("click",()=>{k()||e.emit("voice-toggle")});const a=u("div",{class:"input-wrapper"},t),d=u("span",{class:"interim-transcript__dot","aria-hidden":"true"}),b=u("span",{class:"interim-transcript__text"}),h=u("div",{class:"interim-transcript",role:"status","aria-live":"polite"},d,b);h.setAttribute("hidden","");const o=u("div",{class:"input-counter","aria-live":"polite"}),c=u("div",{class:"input-area",role:"form","aria-label":"Message input"},a,s,n),g=u("div",{class:"input-container"},h,c,o);i.hideAttribution||g.appendChild(u("div",{class:"input-footer"},u("span",{class:"input-footer__text"},"Powered by AI Receptionist")));function p(){t.style.height="auto",t.style.height=`${t.scrollHeight}px`}t.addEventListener("input",()=>{p(),w(),x()});function w(){const l=t.value.trim().length>0;n.disabled=!l||k()}function x(){const l=t.value.length,m=J-l;o.classList.toggle("is-visible",l>=de),o.classList.toggle("is-warn",l>=de&&l<J),o.classList.toggle("is-limit",l>=J),o.textContent=`${m} left`}function S(){const l=t.value.trim();!l||k()||(e.emit("send",l),t.value="",t.style.height="auto",n.disabled=!0,x(),t.focus())}n.addEventListener("click",S),t.addEventListener("keydown",l=>{if((l.ctrlKey||l.metaKey)&&l.key.toLowerCase()==="m"){!s.hasAttribute("hidden")&&!k()&&(l.preventDefault(),e.emit("voice-toggle"));return}l.key==="Enter"&&!l.shiftKey&&(l.preventDefault(),S())});function k(){const l=r.getState();return l.status==="loading"||l.online===!1}function C(l){t.disabled=l,a.classList.toggle("is-disabled",l),l?n.disabled=!0:w()}function v(l){l.online===!1?t.placeholder="You are offline — messages will resume once reconnected":l.voiceState==="listening"?t.placeholder="Listening… speak now or click mic to stop":l.status==="loading"?t.placeholder=`${i.botName} is thinking…`:t.placeholder=`Message ${i.botName}…`}function z(l){const m=l.sttSupported&&i.enableVoice!==!1;s.toggleAttribute("hidden",!m);const A=l.voiceState==="listening";s.classList.toggle("is-listening",A),s.setAttribute("aria-pressed",String(A)),s.setAttribute("aria-label",A?"Stop voice input":"Start voice input")}function $(l){const m=l.voiceState==="listening"&&typeof l.interimTranscript=="string"&&l.interimTranscript.trim().length>0;h.toggleAttribute("hidden",!m),m&&(b.textContent=l.interimTranscript)}function W(l,m){(l.status!==(m==null?void 0:m.status)||l.online!==(m==null?void 0:m.online))&&C(k()),(l.status!==(m==null?void 0:m.status)||l.online!==(m==null?void 0:m.online)||l.voiceState!==(m==null?void 0:m.voiceState))&&v(l),(l.voiceState!==(m==null?void 0:m.voiceState)||l.sttSupported!==(m==null?void 0:m.sttSupported))&&z(l),(l.interimTranscript!==(m==null?void 0:m.interimTranscript)||l.voiceState!==(m==null?void 0:m.voiceState))&&$(l)}const _=r.subscribe(W);W(r.getState(),null),x();function f(){requestAnimationFrame(()=>t.focus())}function E(){_()}return{el:g,focus:f,destroy:E}}function ot(r,e){const i=u("span",{class:"error-banner__icon",html:Ve,"aria-hidden":"true"}),t=u("span",{class:"error-banner__text"}),n=u("button",{class:"error-banner__retry",type:"button","aria-label":"Retry"},"Retry"),s=u("button",{class:"error-banner__dismiss",type:"button","aria-label":"Dismiss error",html:se}),a=u("div",{class:"error-banner",role:"alert","aria-live":"assertive"},i,t,n,s);a.setAttribute("hidden",""),n.addEventListener("click",()=>{e.emit("retry-last")}),s.addEventListener("click",()=>{e.emit("dismiss-error")});function d(o,c){o.error!==(c==null?void 0:c.error)&&(o.error?(t.textContent=o.error.message,n.style.display=o.error.retryable?"":"none",a.removeAttribute("hidden")):a.setAttribute("hidden",""))}const b=r.subscribe(d);function h(){b()}return{el:a,destroy:h}}function lt(r){const e=u("div",{class:"offline-banner",role:"status","aria-live":"polite"},u("span",{html:Qe,"aria-hidden":"true"}),u("span",null,"You are offline — we will reconnect automatically"));e.setAttribute("hidden","");function i(n,s){n.online!==(s==null?void 0:s.online)&&e.toggleAttribute("hidden",n.online!==!1)}const t=r.subscribe(i);return{el:e,destroy(){t()}}}function ct(r,e){var ge,fe;const i=document.createElement("style");i.textContent=[Ue(e),De(e),We(),je()].join(`
`),r.appendChild(i);const t=we(e.apiKey,e.sessionTtlHours),n=t.load(),s=(ge=n==null?void 0:n.sessionId)!=null?ge:t.createNew(),a=(fe=n==null?void 0:n.messages)!=null?fe:[];e.sessionId=s;const d=Te(),b=Ce({lang:e.voiceLang||"en-US",onResult:({text:y,isFinal:I})=>{I?(o.setState({interimTranscript:""}),y&&p.emit("send",y)):o.setState({interimTranscript:y})},onError:y=>{o.setState({voiceState:"idle",interimTranscript:"",error:{message:y.message,retryable:!1,failedMessageId:null}})},onStateChange:y=>{y!=="listening"?o.setState({voiceState:y,interimTranscript:""}):o.setState({voiceState:y})}}),h=Ee({enabled:!!e.enableSounds,volume:typeof e.soundVolume=="number"?e.soundVolume:.18}),o=he(ye(s,a,{sttSupported:b.sttSupported,ttsSupported:b.ttsSupported,ttsEnabled:b.ttsSupported&&e.enableTTS!==!1&&!!e.ttsDefaultOn,online:d.isOnline()}));b.setMuted(!o.getState().ttsEnabled);let c=null;o.subscribe(y=>{clearTimeout(c),c=setTimeout(()=>{t.save(y.sessionId,y.messages)},300)});const g=d.subscribe(y=>{o.setState({online:y})}),p=Me(),{el:w}=et(o,p,e),{el:x,destroy:S}=tt(o,p,e),{el:k,destroy:C}=lt(o),{el:v,scrollToBottom:z}=at(o,p,e),{el:$}=ot(o,p),{el:W,focus:_}=st(o,p,e),f=document.createElement("div");f.className="widget-window",f.setAttribute("role","dialog"),f.setAttribute("aria-modal","true"),f.setAttribute("aria-label",`Chat with ${e.botName}`),f.setAttribute("aria-hidden","true"),f.appendChild(x),f.appendChild(k),f.appendChild(v),f.appendChild($),f.appendChild(W),r.appendChild(f),r.appendChild(w);const E=Re(f);let l=w;p.on("toggle",()=>{const{isOpen:y}=o.getState();y?A():m()}),p.on("close",()=>{A()}),p.on("send",y=>{F(y)}),p.on("retry-last",()=>{const{messages:y}=o.getState(),I=[...y].reverse().find(T=>T.role==="user"&&T.status==="failed");I&&V(I)}),p.on("retry-message",({messageId:y,content:I})=>{const{messages:T}=o.getState(),N=T.find(O=>O.id===y);N&&V(N)}),p.on("dismiss-error",()=>{o.setState({error:null})}),p.on("suggestion-click",({text:y,messageId:I})=>{I&&o.setState(T=>({messages:T.messages.map(N=>N.id===I?q(M({},N),{suggestions:[]}):N)})),F(y)}),p.on("voice-toggle",()=>{const y=o.getState();y.status!=="loading"&&(y.voiceState==="listening"?b.stopListening():(b.cancelSpeaking(),b.startListening()))}),p.on("tts-toggle",()=>{const y=!o.getState().ttsEnabled;o.setState({ttsEnabled:y}),b.setMuted(!y),y||b.cancelSpeaking()}),p.on("request-transfer",()=>{P()});function m(){o.setState({isOpen:!0,unreadCount:0}),f.classList.add("is-open"),f.removeAttribute("aria-hidden"),E.activate(null),_(),z(!0),f.setAttribute("aria-label",`Chat with ${e.botName} — dialog`)}function A(){o.setState({isOpen:!1}),f.classList.remove("is-open"),f.setAttribute("aria-hidden","true"),E.deactivate(l),b.stopListening(),b.cancelSpeaking()}const B=y=>{y.key==="Escape"&&o.getState().isOpen&&A()};document.addEventListener("keydown",B);let L=null;async function P(){if(o.getState().transferState!=="none"||!e.apiKey||!e.apiUrl)return;o.setState({transferState:"requested",status:"loading"});const I={id:Y(),role:"assistant",content:"🔄 Connecting you to a human agent. Please hold on…",timestamp:Date.now(),status:"sent",isSystem:!0};o.setState(N=>({messages:[...N.messages,I],status:"idle"}));try{await ze(e)}catch(N){o.setState({transferState:"none",error:{message:"Could not connect to a human agent right now. Please try again.",retryable:!0,failedMessageId:null},status:"error"});return}const T=e.apiUrl.replace(/\/api\/chat.*$/,"");try{let N=typeof window!="undefined"&&window.io;N||(await new Promise((O,U)=>{const j=document.createElement("script");j.src=`${T}/socket.io/socket.io.js`,j.onload=O,j.onerror=U,document.head.appendChild(j)}),N=window.io),N&&(L=N(T,{transports:["websocket","polling"]}),L.on("connect",()=>{L.emit("join-session",{sessionId:e.sessionId,tenantId:e.apiKey})}),L.on("agent-joined",({agentName:O})=>{o.setState({transferState:"connected",agentName:O});const U={id:Y(),role:"assistant",content:`✅ ${O} has joined the conversation.`,timestamp:Date.now(),status:"sent",isSystem:!0};o.setState(j=>({messages:[...j.messages,U]})),z(!0)}),L.on("new-message",({content:O,isHuman:U,agentName:j})=>{if(!U)return;const Z={id:Y(),role:"assistant",content:O,timestamp:Date.now(),status:"sent"};o.setState(ee=>({messages:[...ee.messages,Z]})),h.play("receive"),o.getState().isOpen||o.setState(ee=>({unreadCount:ee.unreadCount+1})),z(!0)}),L.on("session-ended",()=>{o.setState({transferState:"ended",agentName:null});const O={id:Y(),role:"assistant",content:"The conversation has been closed by the agent.",timestamp:Date.now(),status:"sent",isSystem:!0};o.setState(U=>({messages:[...U.messages,O]})),L&&L.disconnect(),L=null}))}catch(N){console.warn("[AI Widget] Socket.IO unavailable; transfer request sent via REST.",N)}}async function F(y){const I=o.getState();if(I.status==="loading")return;const T={id:Y(),role:"user",content:y,timestamp:Date.now(),status:"sending"};if(o.setState(N=>({messages:[...N.messages,T],status:"idle",error:null})),h.play("send"),I.transferState==="connected"&&(L!=null&&L.connected)){L.emit("patient-message",{sessionId:e.sessionId,content:y}),o.setState(N=>({messages:N.messages.map(O=>O.id===T.id?q(M({},O),{status:"sent"}):O)}));return}o.setState({status:"loading"}),await Q(T)}async function V(y){o.setState(I=>({messages:I.messages.map(T=>T.id===y.id?q(M({},T),{status:"sending"}):T),status:"loading",error:null})),await Q(y)}async function Q(y){o.setState(I=>({messages:I.messages.map(T=>T.id===y.id?q(M({},T),{status:"sent"}):T)}));try{const I=o.getState().messages.filter(U=>U.status!=="failed"),{reply:T,suggestions:N}=await Ne(I,e),O={id:Y(),role:"assistant",content:T,timestamp:Date.now(),status:"sent",suggestions:N};o.setState(U=>({messages:[...U.messages.map(j=>{var Z;return j.role==="assistant"&&((Z=j.suggestions)!=null&&Z.length)?q(M({},j),{suggestions:[]}):j}),O],status:"idle",error:null})),o.getState().isOpen||o.setState(U=>({unreadCount:U.unreadCount+1})),h.play("receive"),o.getState().ttsEnabled&&b.speak(T)}catch(I){const T=Le(I);o.setState(N=>({messages:N.messages.map(O=>O.id===y.id?q(M({},O),{status:"failed"}):O),status:"error",error:{message:T.message,retryable:T.retryable,failedMessageId:y.id}})),h.play("error"),console.error("[AI Widget] API call failed:",I)}}function pt(){document.removeEventListener("keydown",B),p.clear(),c&&clearTimeout(c);try{g()}catch(y){}try{d.destroy()}catch(y){}try{b.destroy()}catch(y){}try{h.destroy()}catch(y){}try{S()}catch(y){}try{C()}catch(y){}try{L&&L.disconnect()}catch(y){}}return{open:m,close:A,toggle:()=>o.getState().isOpen?A():m(),destroy:pt,on:(y,I)=>p.on(y,I),off:(y,I)=>p.off(y,I),getState:()=>M({},o.getState())}}const ue="ai-receptionist-widget-host";function dt(r){if(document.getElementById(ue))return console.warn("[AI Widget] Already initialized. Call window.LinorWidget.destroy() first to re-mount."),typeof window!="undefined"&&window.LinorWidget||null;const e=document.createElement("div");e.id=ue,e.style.cssText=["position: fixed","z-index: 2147483647","top: 0","left: 0","width: 0","height: 0","overflow: visible","pointer-events: none"].join("; ");const i=e.attachShadow({mode:"closed"});document.body.appendChild(e);const t=ct(i,r),n=t.destroy;return t.destroy=()=>{n(),e.remove(),typeof window!="undefined"&&window.LinorWidget===t&&delete window.LinorWidget},t}const ut=typeof document!="undefined"?document.currentScript:null;function pe(){const r=D(ut);if(!r.apiKey||!r.apiUrl)return;const e=dt(r);e&&typeof window!="undefined"&&(window.LinorWidget=e)}typeof document!="undefined"&&(document.readyState==="loading"?document.addEventListener("DOMContentLoaded",pe,{once:!0}):pe())})();
//# sourceMappingURL=widget.js.map
