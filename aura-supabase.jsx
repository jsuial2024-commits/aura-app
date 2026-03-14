import { useState, useRef, useEffect, useCallback } from "react";

// ─── SUPABASE CLIENT ─────────────────────────────────────────────────
const SUPABASE_URL = "https://izbclyrionmfcjdidnuo.supabase.co";

// ─── FAKE PROFILES (seed) ───────────────────────────────────────────────────
const FAKE_PROFILES = [
  { id:"11111111-1111-1111-1111-111111111111", name:"Camille", age:26, city:"Paris", job:"Designer UX", bio:"Passionnée de street art et de café 🎨☕", photo_url:"https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80","https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=600&q=80"], latitude:48.85, longitude:2.35 },
  { id:"22222222-2222-2222-2222-222222222222", name:"Léa", age:24, city:"Lyon", job:"Photographe", bio:"Je capture les instants qui comptent 📸", photo_url:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80","https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=80"], latitude:45.75, longitude:4.85 },
  { id:"33333333-3333-3333-3333-333333333333", name:"Sofia", age:28, city:"Paris", job:"Avocate", bio:"Debout à 6h, yoga, café, tribunal 🧘‍♀️⚖️", photo_url:"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80","https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80"], latitude:48.87, longitude:2.33 },
  { id:"44444444-4444-4444-4444-444444444444", name:"Inès", age:23, city:"Bordeaux", job:"Étudiante en médecine", bio:"Entre les livres et les soirées 🍷📚", photo_url:"https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&q=80"], latitude:44.83, longitude:-0.57 },
  { id:"55555555-5555-5555-5555-555555555555", name:"Jade", age:27, city:"Marseille", job:"Chef cuisinière", bio:"La mer et la cuisine, c'est toute ma vie 🌊🍽️", photo_url:"https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"], latitude:43.30, longitude:5.37 },
  { id:"66666666-6666-6666-6666-666666666666", name:"Manon", age:25, city:"Toulouse", job:"Ingénieure aéro", bio:"Passionnée d'aviation et de randonnée 🛩️🏔️", photo_url:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80"], latitude:43.60, longitude:1.44 },
  { id:"77777777-7777-7777-7777-777777777777", name:"Chloé", age:29, city:"Nice", job:"Journaliste", bio:"Curieuse de tout, voyageuse à mes heures ✈️🎤", photo_url:"https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?w=600&q=80","https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&q=80"], latitude:43.71, longitude:7.26 },
  { id:"88888888-8888-8888-8888-888888888888", name:"Emma", age:22, city:"Nantes", job:"Illustratrice", bio:"Je dessine le monde tel que je voudrais qu'il soit 🖍️", photo_url:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80", photos_urls:["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80"], latitude:47.21, longitude:-1.55 },
];


function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

const SUPABASE_KEY = "sb_publishable_WiPfn8gk6OfdVL_2SxbhDg_tEEQpo06";

// Client Supabase léger (sans npm, fetch natif)
const supabase = {
  _url: SUPABASE_URL,
  _key: SUPABASE_KEY,
  _headers: {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  },

  // Auth
  auth: {
    async signUp({ email, password, options }) {
      try {
        const r = await fetch(SUPABASE_URL + "/auth/v1/signup", {
          method:"POST",
          headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},
          body: JSON.stringify({ email, password, data: options?.data || {} })
        });
        const data = await r.json();
        console.log("signUp response:", JSON.stringify(data));
        return data;
      } catch(e) {
        console.error("signUp error:", e);
        return { error: { message: e.message } };
      }
    },
    async signIn({ email, password }) {
      try {
        const r = await fetch(SUPABASE_URL + "/auth/v1/token?grant_type=password", {
          method:"POST",
          headers:{"apikey":SUPABASE_KEY,"Content-Type":"application/json"},
          body: JSON.stringify({ email, password })
        });
        const data = await r.json();
        console.log("signIn response:", JSON.stringify(data));
        if (data.access_token) {
          localStorage.setItem("aura_token", data.access_token);
          localStorage.setItem("aura_user_id", data.user?.id);
        }
        return data;
      } catch(e) {
        console.error("signIn error:", e);
        return { error: { message: e.message } };
      }
    },
    async signOut() {
      const token = localStorage.getItem("aura_token");
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method:"POST", headers:{"apikey":SUPABASE_KEY,"Authorization":`Bearer ${token}`}
      });
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user_id");
    },
    getToken() { return localStorage.getItem("aura_token"); },
    getUserId() { return localStorage.getItem("aura_user_id"); },
    isLoggedIn() { return !!localStorage.getItem("aura_token"); },
  },

  // Database helpers
  async select(table, query = "") {
    const token = localStorage.getItem("aura_token") || SUPABASE_KEY;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      headers: { ...this._headers, "Authorization": `Bearer ${token}` }
    });
    return r.json();
  },
  async insert(table, data) {
    const token = localStorage.getItem("aura_token") || SUPABASE_KEY;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:"POST",
      headers: { ...this._headers, "Authorization": `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return r.json();
  },
  async update(table, data, query) {
    const token = localStorage.getItem("aura_token") || SUPABASE_KEY;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      method:"PATCH",
      headers: { ...this._headers, "Authorization": `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return r.json();
  },

  async upsert(table, data) {
    const token = localStorage.getItem("aura_token") || SUPABASE_KEY;
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method:"POST",
      headers: {
        ...this._headers,
        "Authorization": `Bearer ${token}`,
        "Prefer": "resolution=merge-duplicates,return=representation"
      },
      body: JSON.stringify(data)
    });
    const txt = await r.text();
    if (!r.ok) throw new Error(`${r.status}: ${txt}`);
    return txt ? JSON.parse(txt) : [];
  },

  // Realtime (polling simplifié)
  subscribe(table, callback, intervalMs = 3000) {
    const token = localStorage.getItem("aura_token") || SUPABASE_KEY;
    let lastId = null;
    const id = setInterval(async () => {
      const query = lastId ? `?id=gt.${lastId}&order=id` : `?order=created_at.desc&limit=1`;
      const data = await this.select(table, query);
      if (Array.isArray(data) && data.length > 0) {
        if (lastId) callback(data);
        lastId = data[0]?.id || lastId;
      }
    }, intervalMs);
    return () => clearInterval(id);
  },
};

// ─── SCÈNES CANVAS PHOTO-RÉALISTES ──────────────────────────────────
// Chaque scène est dessinée sur un Canvas avec grain photographique,
// couches de lumière et textures — rendu natif navigateur, zéro dépendance.


function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r, y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x, y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

// ─── FONDS — dégradés CSS atmosphériques (floutés = photo réelle) ───
const BG_SCENES = [
  // 1. Chambre — lumière ambre chaude de lampes de chevet
  `radial-gradient(ellipse 80% 60% at 8% 50%, #ffcf6e 0%, #e8801a 18%, #a03808 40%, #3a1204 65%, #180800 100%),
   radial-gradient(ellipse 80% 60% at 92% 50%, #ffcf6e 0%, #e8801a 18%, #a03808 40%, #3a1204 65%, #180800 100%),
   radial-gradient(ellipse 55% 35% at 50% 62%, #f5eacc 0%, #d4b87a 25%, #6a3010 55%, transparent 80%),
   radial-gradient(ellipse 40% 28% at 50% 14%, #c8d8ff 0%, #6080c0 30%, transparent 70%),
   linear-gradient(180deg, #120800 0%, #2a1208 35%, #1e0e06 65%, #3d2010 85%, #1a0a04 100%)`,

  // 2. Salon cheminée — feu orange vif, velours profond
  `radial-gradient(ellipse 55% 70% at 50% 68%, #fff5a0 0%, #ffcc30 8%, #ff8c0a 20%, #e04a05 38%, #801802 58%, #300800 80%, transparent 100%),
   radial-gradient(ellipse 90% 55% at 50% 72%, #ff7008 0%, #cc3a04 25%, #701002 50%, transparent 75%),
   radial-gradient(ellipse 35% 22% at 88% 30%, #ffd878 0%, #e09020 30%, transparent 70%),
   linear-gradient(180deg, #080300 0%, #160902 30%, #0e0601 55%, #3a1e08 75%, #1a0c04 100%)`,

  // 3. Bar whisky — spots dorés, bois mahogany sombre
  `radial-gradient(ellipse 50% 65% at 18% 0%, #ffd060 0%, #e09020 15%, #a05010 32%, #501a04 52%, transparent 75%),
   radial-gradient(ellipse 50% 65% at 50% 0%, #ffd060 0%, #e09020 15%, #a05010 32%, #501a04 52%, transparent 75%),
   radial-gradient(ellipse 50% 65% at 82% 0%, #ffd060 0%, #e09020 15%, #a05010 32%, #501a04 52%, transparent 75%),
   radial-gradient(ellipse 70% 40% at 50% 72%, #8a5020 0%, #5a3010 30%, #2a1406 60%, transparent 85%),
   linear-gradient(180deg, #050301 0%, #100702 22%, #180e04 45%, #4a2e0e 68%, #2e1a08 85%, #120904 100%)`,

  // 4. Restaurant — bougies, nappes blanches, lustre doré
  `radial-gradient(ellipse 60% 40% at 50% 0%, #ffeaa0 0%, #ffcc50 12%, #e09018 28%, #805010 48%, transparent 70%),
   radial-gradient(ellipse 55% 55% at 50% 65%, #fff8e8 0%, #ffecc0 12%, #e8c060 28%, #c08020 45%, #703808 62%, transparent 80%),
   radial-gradient(ellipse 25% 20% at 20% 55%, #fff0c0 0%, #f0d070 20%, #c09030 45%, transparent 70%),
   radial-gradient(ellipse 25% 20% at 80% 53%, #fff0c0 0%, #f0d070 20%, #c09030 45%, transparent 70%),
   linear-gradient(180deg, #060402 0%, #120a04 28%, #1c1006 50%, #0e0804 75%, #080502 100%)`,

  // 5. Plage nuit — lune sur mer turquoise, sable chaud
  `radial-gradient(ellipse 45% 35% at 72% 16%, #fffce8 0%, #f0e8b0 10%, #c8d8ff 25%, #6090d0 45%, transparent 70%),
   radial-gradient(ellipse 65% 30% at 65% 44%, #e8f8ff 0%, #a8d8f0 15%, #4898c8 35%, transparent 60%),
   linear-gradient(180deg, #02040e 0%, #06101e 15%, #0a1e40 30%, #0e3060 45%, #1a78a0 57%, #1e8aaa 63%, #d8bc78 65%, #c8a85e 72%, #a88040 85%, #7a5a28 100%)`,

  // 6. Coucher de soleil — ciel dramatique, silhouettes sombres
  `radial-gradient(ellipse 55% 55% at 50% 55%, #fffcd0 0%, #ffe860 6%, #ffb820 14%, #f06010 25%, #c02818 38%, transparent 65%),
   radial-gradient(ellipse 90% 70% at 50% 52%, #ff8010 0%, #e04808 18%, #901808 38%, #4a0808 58%, transparent 80%),
   radial-gradient(ellipse 40% 30% at 18% 22%, #5a0a4a 0%, #380630 40%, transparent 75%),
   radial-gradient(ellipse 40% 30% at 82% 20%, #5a0a4a 0%, #380630 40%, transparent 75%),
   linear-gradient(180deg, #040110 0%, #0e0420 12%, #28062a 24%, #5a0e20 36%, #c02810 48%, #e86010 58%, #f5a020 67%, #fdd040 74%, #050202 76%, #020101 100%)`,
];

// ─── Composant fond CSS (ultra simple, toujours visible) ──────────────
function SceneBg({ sceneIndex, opacity=1, transition="" }) {
  return (
    <div style={{
      position:"absolute", inset:-12,
      background: BG_SCENES[sceneIndex % BG_SCENES.length],
      backgroundSize:"cover",
      filter:"blur(8px) saturate(1.3) brightness(0.9)",
      opacity, transition,
    }}/>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');

*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}

:root{
  --rose:       #E8647A;
  --rose-deep:  #C0415A;
  --amber:      #E8A050;
  --amber-soft: #F5C883;
  --teal:       #4ECDC4;
  --navy:       #1A2744;
  --navy-mid:   #243356;
  --glass:      rgba(255,255,255,0.12);
  --glass-dark: rgba(10,18,40,0.55);
  --glass-med:  rgba(10,18,40,0.72);
  --white:      #FFFFFF;
  --offwhite:   #F7F2EE;
  --muted:      rgba(255,255,255,0.55);
  --dim:        rgba(255,255,255,0.28);
  --border:     rgba(255,255,255,0.14);
  --shadow:     0 8px 40px rgba(0,0,0,0.38);
  --shadow-sm:  0 4px 20px rgba(0,0,0,0.22);
}

body{
  background:#0a0f1e;
  display:flex;justify-content:center;align-items:center;
  min-height:100vh;
  font-family:'Nunito',sans-serif;
  color:var(--white);
}

/* ── PHONE SHELL ── */
.shell{
  width:393px;height:852px;
  border-radius:52px;overflow:hidden;
  position:relative;
  background:#111828;
  box-shadow:
    0 0 0 1.5px rgba(255,255,255,0.12),
    0 50px 140px rgba(0,0,0,0.85),
    0 0 100px rgba(232,100,122,0.08);
}

/* ── BG PAYSAGE FLOUTÉ ── */
.bg-wrap{
  position:absolute;inset:0;
  z-index:0;overflow:hidden;
}
.bg-landscape{
  position:absolute;inset:-10px;
  width:calc(100% + 20px);height:calc(100% + 20px);
  filter:blur(9px) brightness(0.6) saturate(1.25);
  object-fit:cover;
}
.bg-landscape-next{
  position:absolute;inset:-10px;
  width:calc(100% + 20px);height:calc(100% + 20px);
  filter:blur(9px) brightness(0.6) saturate(1.25);
  opacity:0;
  transition:opacity 1.8s ease;
  object-fit:cover;
}
.bg-landscape-next.visible{ opacity:1; }
.bg-overlay{position:absolute;inset:0;background:linear-gradient(160deg,rgba(10,16,40,0.10) 0%,rgba(5,8,20,0.05) 50%,rgba(10,16,40,0.12) 100%);}

/* ── SCREEN ── */
.screen{
  position:absolute;inset:0;z-index:2;
  display:flex;flex-direction:column;
  overflow:hidden;
  background:transparent;
}

/* ── STATUS BAR ── */
.status-bar{
  padding:16px 28px 0;
  display:flex;justify-content:space-between;align-items:center;
  flex-shrink:0;
}
.s-time{font-size:15px;font-weight:700;letter-spacing:-.3px;}
.s-icons{display:flex;gap:5px;align-items:center;font-size:13px;}

/* ── BOTTOM NAV ── */
.bottom-nav{
  position:absolute;bottom:0;left:0;right:0;
  height:90px;
  background:var(--glass-med);
  backdrop-filter:blur(28px);
  border-top:1px solid var(--border);
  display:flex;align-items:flex-start;padding-top:10px;
  z-index:50;
}
.nav-item{
  flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;
  cursor:pointer;padding:8px;position:relative;
  transition:transform .15s;
}
.nav-item:active{transform:scale(.88);}
.nav-icon{font-size:23px;transition:transform .2s;line-height:1;}
.nav-label{font-size:10px;font-weight:600;color:var(--dim);
  transition:color .2s;letter-spacing:.6px;text-transform:uppercase;}
.nav-item.active .nav-label{color:var(--rose);}
.nav-item.active .nav-icon{transform:scale(1.12);}
.nav-badge{
  position:absolute;top:3px;right:14px;
  background:var(--rose);color:white;
  font-size:9px;font-weight:800;
  width:17px;height:17px;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  border:2px solid transparent;
}

/* ── LOGO ── */
.logo{
  font-family:'Cormorant Garamond',serif;
  font-size:32px;font-weight:700;
  background:linear-gradient(135deg,#F5C883,#E8647A);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  letter-spacing:-.5px;
}

/* ─────────────────────────────────────────
   SPLASH
───────────────────────────────────────── */
.splash{
  position:absolute;inset:0;
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:0 32px;text-align:center;
  gap:0;
}
.splash-status{
  position:absolute;top:0;left:0;right:0;
  padding:16px 28px 0;
  display:flex;justify-content:space-between;align-items:center;
}
.splash-logo{
  font-family:'Cormorant Garamond',serif;
  font-size:96px;font-weight:700;line-height:1;
  background:linear-gradient(135deg,#F5C883 0%,#E8647A 55%,#C084FC 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  margin-bottom:4px;
  animation:fadeUpEl .9s cubic-bezier(.22,1,.36,1) both;
}
.splash-tag{
  font-size:12px;letter-spacing:5px;text-transform:uppercase;
  color:var(--muted);font-weight:400;margin-bottom:36px;
  animation:fadeUpEl .9s .08s cubic-bezier(.22,1,.36,1) both;
}
.splash-pills{
  display:flex;gap:8px;flex-wrap:wrap;justify-content:center;
  margin-bottom:36px;
  animation:fadeUpEl .9s .16s cubic-bezier(.22,1,.36,1) both;
}
.splash-pill{
  background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.16);
  backdrop-filter:blur(14px);
  border-radius:40px;padding:8px 15px;
  font-size:12px;font-weight:700;color:rgba(255,255,255,0.88);
  display:flex;align-items:center;gap:5px;
}
.splash-divider{
  width:48px;height:1px;background:rgba(255,255,255,0.15);
  margin:0 auto 28px;
}
.btn-primary{
  width:100%;padding:17px;border:none;border-radius:20px;
  background:linear-gradient(135deg,#E8647A,#E8A050);
  color:white;font-family:'Nunito',sans-serif;
  font-size:16px;font-weight:700;cursor:pointer;
  box-shadow:0 10px 36px rgba(232,100,122,.42);
  transition:all .2s;margin-bottom:12px;letter-spacing:.3px;
  animation:fadeUpEl .9s .24s cubic-bezier(.22,1,.36,1) both;
}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(232,100,122,.55);}
.btn-primary:active{transform:scale(.97);}
.btn-ghost{
  width:100%;padding:15px;border-radius:20px;
  background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);
  backdrop-filter:blur(14px);
  color:rgba(255,255,255,0.88);font-family:'Nunito',sans-serif;
  font-size:15px;font-weight:600;cursor:pointer;
  transition:all .2s;
  animation:fadeUpEl .9s .32s cubic-bezier(.22,1,.36,1) both;
}
.btn-ghost:hover{background:rgba(255,255,255,.18);}
.splash-footnote{
  margin-top:18px;font-size:11px;color:var(--dim);font-weight:500;
  animation:fadeUpEl .9s .4s cubic-bezier(.22,1,.36,1) both;
}

/* ─────────────────────────────────────────
   DISCOVER
───────────────────────────────────────── */
.discover{
  flex:1;padding-bottom:90px;
  display:flex;flex-direction:column;overflow:hidden;
}
.disc-header{
  padding:8px 22px 10px;
  display:flex;justify-content:space-between;align-items:center;
  flex-shrink:0;
}
.icon-btn{
  width:44px;height:44px;
  background:var(--glass);border:1px solid var(--border);
  backdrop-filter:blur(14px);border-radius:16px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;font-size:18px;transition:all .2s;
}
.icon-btn:hover{background:rgba(255,255,255,.2);}

/* Card stack */
.card-stack{
  flex:1;position:relative;
  padding:0 18px;
  display:flex;align-items:center;justify-content:center;
}
.pcard{
  position:absolute;width:100%;height:455px;
  border-radius:32px;overflow:hidden;
  cursor:grab;user-select:none;
  transform-origin:bottom center;
  box-shadow:0 24px 64px rgba(0,0,0,.55);
  transition:transform .08s;
  background:#111828;
  will-change:transform;
  isolation:isolate;
}
.pcard:active{cursor:grabbing;}
.pcard-img{width:100%;height:100%;object-fit:cover;display:block;}
.pcard-grad{position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(10,18,40,.02) 30%,rgba(10,18,40,.97) 100%);}
.pcard-top{
  position:absolute;top:14px;left:14px;right:14px;
  display:flex;justify-content:space-between;align-items:flex-start;
}
.match-badge{
  background:rgba(10,18,40,.7);backdrop-filter:blur(12px);
  border:1px solid rgba(232,100,122,.35);border-radius:30px;
  padding:6px 14px;font-size:13px;font-weight:700;color:#F5C883;
  display:flex;align-items:center;gap:5px;
}
.pcard-badges{display:flex;flex-direction:column;gap:6px;align-items:flex-end;}
.badge-verified{
  background:rgba(10,18,40,.7);backdrop-filter:blur(12px);
  border-radius:30px;padding:5px 10px;font-size:12px;
}
.badge-premium{
  background:linear-gradient(135deg,#E8A050,#E8647A);
  border-radius:30px;padding:4px 10px;font-size:10px;
  font-weight:800;letter-spacing:.6px;text-transform:uppercase;
}

/* Media badges on card */
.media-badges{
  position:absolute;top:14px;left:50%;transform:translateX(-50%);
  display:flex;gap:8px;align-items:center;
}
.media-badge{
  background:rgba(10,18,40,.75);backdrop-filter:blur(12px);
  border:1px solid var(--border);border-radius:30px;
  padding:5px 12px;font-size:11px;font-weight:700;
  display:flex;align-items:center;gap:5px;cursor:pointer;
  transition:all .2s;
}
.media-badge:hover{background:rgba(232,100,122,.35);border-color:rgba(232,100,122,.5);}
.media-badge.voice{color:#4ECDC4;}
.media-badge.video{color:#F5C883;}

.pcard-body{position:absolute;bottom:0;left:0;right:0;padding:18px 20px 20px;}
.pcard-name-row{display:flex;align-items:baseline;gap:9px;margin-bottom:3px;}
.pcard-name{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;}
.pcard-age{font-size:20px;color:rgba(255,255,255,.65);font-weight:300;}
.pcard-job{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:10px;
  display:flex;align-items:center;gap:5px;}
.pcard-tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:9px;}
.ptag{
  background:rgba(255,255,255,.12);backdrop-filter:blur(8px);
  border:1px solid rgba(255,255,255,.08);
  border-radius:30px;padding:4px 12px;font-size:11px;font-weight:600;
}
.pcard-dist{font-size:12px;color:rgba(255,255,255,.38);
  display:flex;align-items:center;gap:4px;}

/* Swipe overlays */
.swipe-ov{
  position:absolute;inset:0;border-radius:32px;
  display:flex;align-items:center;justify-content:center;
  opacity:0;pointer-events:none;transition:opacity .08s;
}
.swipe-ov.like{background:linear-gradient(135deg,rgba(78,205,196,.28),transparent);}
.swipe-ov.nope{background:linear-gradient(225deg,rgba(232,100,122,.28),transparent);}
.swipe-lbl{
  font-family:'Cormorant Garamond',serif;
  font-size:44px;font-weight:700;
  border:3px solid;border-radius:14px;
  padding:6px 20px;
}
.swipe-lbl.like{color:#4ECDC4;border-color:#4ECDC4;transform:rotate(18deg);}
.swipe-lbl.nope{color:#E8647A;border-color:#E8647A;transform:rotate(-18deg);}

/* Action buttons */
.actions{
  display:flex;justify-content:center;align-items:center;gap:16px;
  padding:10px 24px 14px;flex-shrink:0;
}
.act-btn{
  border:none;cursor:pointer;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  transition:all .18s;
  backdrop-filter:blur(14px);
}
.act-btn:active{transform:scale(.86);}
.act-pass{width:58px;height:58px;font-size:24px;
  background:var(--glass);border:1px solid var(--border);}
.act-undo{width:50px;height:50px;font-size:20px;
  background:var(--glass);border:1px solid var(--border);}
.act-like{width:70px;height:70px;font-size:28px;
  background:linear-gradient(135deg,#E8647A,#E8A050);
  box-shadow:0 10px 36px rgba(232,100,122,.45);}
.act-star{width:50px;height:50px;font-size:20px;
  background:linear-gradient(135deg,#6C63FF,#C084FC);
  box-shadow:0 6px 24px rgba(108,99,255,.35);}
.act-boost{width:50px;height:50px;font-size:20px;
  background:linear-gradient(135deg,#E8A050,#F5C883);
  box-shadow:0 6px 24px rgba(232,160,80,.35);}

/* Back cards */
.bcard1{transform:scale(.94) translateY(13px);opacity:.55;z-index:0;}
.bcard2{transform:scale(.88) translateY(26px);opacity:.25;z-index:-1;}
.fcard{z-index:1;}

/* ─────────────────────────────────────────
   MEDIA PLAYER (voice/video)
───────────────────────────────────────── */
.media-overlay{
  position:absolute;inset:0;z-index:100;
  background:rgba(10,15,30,.88);backdrop-filter:blur(28px);
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:32px;animation:fadeIn .25s ease;
}
.media-avatar{
  width:90px;height:90px;border-radius:50%;object-fit:cover;
  border:3px solid rgba(232,160,80,.6);
  margin-bottom:14px;
}
.media-name{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;
  margin-bottom:4px;}
.media-sub{font-size:13px;color:var(--muted);margin-bottom:32px;}

/* Voice player */
.voice-player{
  width:100%;background:var(--glass);
  border:1px solid var(--border);border-radius:24px;
  padding:22px 24px;margin-bottom:20px;
}
.voice-bars{
  display:flex;align-items:center;justify-content:center;
  gap:4px;height:48px;margin-bottom:18px;
}
.vbar{
  width:4px;border-radius:4px;
  background:linear-gradient(180deg,#E8A050,#E8647A);
  animation:barPulse 1.2s ease-in-out infinite;
}
@keyframes barPulse{
  0%,100%{transform:scaleY(.3);opacity:.5;}
  50%{transform:scaleY(1);opacity:1;}
}
.voice-controls{display:flex;align-items:center;gap:16px;}
.play-btn{
  width:52px;height:52px;border-radius:50%;
  background:linear-gradient(135deg,#E8647A,#E8A050);
  border:none;color:white;font-size:20px;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 24px rgba(232,100,122,.4);
  flex-shrink:0;transition:transform .15s;
}
.play-btn:active{transform:scale(.9);}
.voice-progress{flex:1;height:4px;background:rgba(255,255,255,.15);
  border-radius:2px;position:relative;cursor:pointer;}
.voice-fill{height:100%;background:linear-gradient(90deg,#E8A050,#E8647A);
  border-radius:2px;transition:width .1s linear;}
.voice-time{font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;}

/* Video player */
.video-player{
  width:100%;aspect-ratio:9/16;max-height:260px;
  border-radius:24px;overflow:hidden;
  background:rgba(255,255,255,.06);
  border:1px solid var(--border);margin-bottom:20px;
  display:flex;align-items:center;justify-content:center;
  position:relative;
}
.video-placeholder{
  width:100%;height:100%;
  background:linear-gradient(160deg,#1A2744,#243356);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:12px;
}
.video-icon{font-size:48px;opacity:.7;}
.video-label{font-size:13px;color:var(--muted);font-weight:600;letter-spacing:.5px;}
.video-duration{
  position:absolute;bottom:12px;right:12px;
  background:rgba(10,15,30,.75);border-radius:20px;
  padding:4px 10px;font-size:12px;font-weight:700;
}
.media-close{
  padding:14px 40px;background:var(--glass);
  border:1px solid var(--border);border-radius:20px;
  color:var(--offwhite);font-family:'Nunito',sans-serif;
  font-size:15px;font-weight:600;cursor:pointer;
  backdrop-filter:blur(12px);transition:all .2s;
}
.media-close:hover{background:rgba(255,255,255,.2);}

/* ─────────────────────────────────────────
   MESSAGES
───────────────────────────────────────── */
.messages{flex:1;padding-bottom:90px;overflow-y:auto;display:flex;flex-direction:column;}
.messages::-webkit-scrollbar{display:none;}
.sec-header{padding:8px 22px 0;display:flex;justify-content:space-between;align-items:center;}
.sec-title{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;}

.stories{display:flex;gap:14px;padding:16px 22px;overflow-x:auto;flex-shrink:0;}
.stories::-webkit-scrollbar{display:none;}
.story{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;}
.story-ring{
  width:62px;height:62px;border-radius:50%;padding:2.5px;
  background:linear-gradient(135deg,#E8A050,#E8647A,#C084FC);cursor:pointer;
}
.story-inner{
  width:100%;height:100%;border-radius:50%;overflow:hidden;
  border:2.5px solid rgba(10,15,30,.9);
}
.story-inner img{width:100%;height:100%;object-fit:cover;}
.story-name{font-size:11px;color:var(--muted);font-weight:600;}

.conv-list{flex:1;padding:0 16px;}
.conv{
  display:flex;gap:13px;align-items:center;
  padding:13px 8px;cursor:pointer;
  border-bottom:1px solid var(--border);
  border-radius:18px;transition:background .15s;
}
.conv:hover{background:var(--glass);}
.conv-av-wrap{position:relative;flex-shrink:0;}
.conv-av{width:56px;height:56px;min-width:56px;border-radius:50%;
  border:2px solid var(--border);}
.online-dot{
  width:13px;height:13px;border-radius:50%;background:#4ECDC4;
  border:2.5px solid rgba(10,15,30,.9);
  position:absolute;bottom:1px;right:1px;
}
.conv-info{flex:1;min-width:0;}
.conv-name-row{display:flex;justify-content:space-between;margin-bottom:3px;}
.conv-name{font-size:15px;font-weight:700;}
.conv-time{font-size:11px;color:var(--dim);}
.conv-preview{font-size:13px;color:var(--muted);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.conv-unread{
  background:var(--rose);color:white;
  font-size:11px;font-weight:800;
  min-width:20px;height:20px;border-radius:10px;
  display:flex;align-items:center;justify-content:center;
  padding:0 4px;flex-shrink:0;
}

/* ─────────────────────────────────────────
   CHAT
───────────────────────────────────────── */
.chat-mode * { animation-play-state: paused !important; }
.chat-mode .bg-overlay, .chat-mode canvas { display: none !important; }
.chat{position:absolute;top:0;left:0;right:0;bottom:90px;display:flex;flex-direction:column;overflow:hidden;background:#0a0e1a;z-index:10;isolation:isolate;}
.chat-header{
  padding:8px 18px 12px;
  display:flex;align-items:center;gap:12px;
  border-bottom:1px solid var(--border);flex-shrink:0;
  background:#0a0e1a;
  contain:layout style;
  transform:translateZ(0);
}
.chat-back{font-size:22px;cursor:pointer;color:var(--rose);padding:4px;}
.chat-av{width:44px;height:44px;min-width:44px;border-radius:50%;object-fit:cover;
  border:2px solid rgba(232,160,80,.4);transform:translateZ(0);backface-visibility:hidden;
  will-change:transform;}
.chat-hinfo{flex:1;}
.chat-hname{font-size:16px;font-weight:700;}
.chat-hstatus{font-size:12px;color:#4ECDC4;font-weight:600;}
.chat-hmore{font-size:22px;color:var(--muted);cursor:pointer;padding:4px;}
.chat-msgs{
  flex:1;overflow-y:auto;padding:16px 18px;
  display:flex;flex-direction:column;gap:8px;
  min-height:0;
  background:#0a0e1a;
}
.chat-msgs::-webkit-scrollbar{display:none;}
.msg-row{display:flex;}
.msg-row.me{justify-content:flex-end;}
.bubble{
  max-width:73%;padding:11px 16px;
  border-radius:22px;font-size:14px;line-height:1.55;
  font-weight:500;
}
.bubble.them{
  background:var(--glass);border:1px solid var(--border);
  backdrop-filter:blur(12px);border-bottom-left-radius:6px;
}
.bubble.me{
  background:linear-gradient(135deg,#E8647A,#E8A050);
  border-bottom-right-radius:6px;
}
.btime{font-size:10px;color:var(--dim);margin-top:3px;}
.msg-row.me .btime{text-align:right;}
.chat-bar{
  padding:10px 14px max(16px, env(safe-area-inset-bottom));display:flex;gap:10px;align-items:flex-end;
  border-top:1px solid var(--border);flex-shrink:0;
  background:var(--bg);
}
.chat-input{
  flex:1;padding:13px 16px;
  background:var(--glass);border:1px solid var(--border);
  backdrop-filter:blur(14px);
  border-radius:26px;color:white;
  font-family:'Nunito',sans-serif;font-size:14px;font-weight:500;
  outline:none;resize:none;transition:border-color .2s;
}
.chat-input:focus{border-color:rgba(232,100,122,.45);}
.chat-input::placeholder{color:var(--dim);}
.send-btn{
  width:46px;height:46px;border-radius:50%;
  background:linear-gradient(135deg,#E8647A,#E8A050);
  border:none;color:white;font-size:18px;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 6px 20px rgba(232,100,122,.4);
  transition:transform .15s;flex-shrink:0;
}
.send-btn:active{transform:scale(.88);}

/* ─────────────────────────────────────────
   PROFIL & ENREGISTREMENT
───────────────────────────────────────── */
.profile-scr{flex:1;overflow-y:auto;padding-bottom:90px;}
.profile-scr::-webkit-scrollbar{display:none;}
.profile-cover{height:210px;position:relative;}
.profile-cover img{width:100%;height:100%;object-fit:cover;}
.cover-ov{position:absolute;inset:0;
  background:linear-gradient(180deg,transparent 30%,rgba(10,15,30,.95) 100%);}
.profile-av-row{
  padding:0 22px;margin-top:-52px;
  display:flex;justify-content:space-between;align-items:flex-end;
  margin-bottom:14px;
}
.profile-av{width:92px;height:92px;border-radius:50%;object-fit:cover;
  border:4px solid rgba(10,15,30,.9);}
.edit-btn{
  padding:10px 20px;background:var(--glass);
  border:1px solid var(--border);backdrop-filter:blur(12px);
  border-radius:22px;color:var(--offwhite);
  font-family:'Nunito',sans-serif;font-size:13px;font-weight:700;
  cursor:pointer;transition:all .2s;
}
.edit-btn:hover{background:rgba(255,255,255,.2);}
.profile-names{padding:0 22px 14px;}
.pname{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:700;margin-bottom:3px;}
.ptag2{font-size:13px;color:var(--muted);}
.pstats{display:flex;padding:0 22px 18px;gap:8px;}
.pstat{
  flex:1;background:var(--glass);border:1px solid var(--border);
  backdrop-filter:blur(12px);border-radius:18px;padding:14px;text-align:center;
}
.pstat-n{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;color:var(--amber);}
.pstat-l{font-size:11px;color:var(--muted);margin-top:2px;font-weight:600;}

/* Section enregistrement */
.rec-section{padding:0 22px 20px;}
.rec-title{font-size:15px;font-weight:800;margin-bottom:12px;
  display:flex;align-items:center;gap:8px;}
.rec-cards{display:flex;gap:10px;}
.rec-card{
  flex:1;background:var(--glass);border:1px solid var(--border);
  backdrop-filter:blur(14px);border-radius:20px;
  padding:16px 12px;text-align:center;cursor:pointer;
  transition:all .22s;position:relative;overflow:hidden;
}
.rec-card:hover{background:rgba(255,255,255,.18);transform:translateY(-2px);}
.rec-card.has-rec{border-color:rgba(232,160,80,.45);}
.rec-icon{font-size:32px;margin-bottom:8px;}
.rec-lbl{font-size:12px;font-weight:700;color:var(--offwhite);margin-bottom:4px;}
.rec-sub{font-size:10px;color:var(--muted);}
.rec-indicator{
  position:absolute;top:8px;right:8px;
  width:8px;height:8px;border-radius:50%;background:#4ECDC4;
}

/* Enregistrement en cours */
.recording-overlay{
  position:absolute;inset:0;z-index:200;
  background:rgba(10,15,30,.93);backdrop-filter:blur(32px);
  display:flex;flex-direction:column;
  align-items:center;justify-content:center;
  padding:36px;animation:fadeIn .25s ease;
}
.rec-pulse{
  width:120px;height:120px;border-radius:50%;
  background:linear-gradient(135deg,#E8647A,#E8A050);
  display:flex;align-items:center;justify-content:center;
  font-size:48px;margin-bottom:24px;
  animation:pulse-rec 1s ease-in-out infinite;
  box-shadow:0 0 0 0 rgba(232,100,122,.5);
}
@keyframes pulse-rec{
  0%{transform:scale(1);box-shadow:0 0 0 0 rgba(232,100,122,.5);}
  70%{transform:scale(1.05);box-shadow:0 0 0 24px rgba(232,100,122,0);}
  100%{transform:scale(1);box-shadow:0 0 0 0 rgba(232,100,122,0);}
}
.rec-status{font-family:'Cormorant Garamond',serif;font-size:28px;font-weight:700;
  margin-bottom:6px;}
.rec-timer{font-size:48px;font-weight:800;color:var(--amber-soft);
  font-variant-numeric:tabular-nums;margin-bottom:6px;letter-spacing:-1px;}
.rec-hint{font-size:13px;color:var(--muted);margin-bottom:32px;}
.rec-progress{
  width:220px;height:5px;background:rgba(255,255,255,.12);
  border-radius:3px;margin-bottom:28px;overflow:hidden;
}
.rec-progress-fill{
  height:100%;border-radius:3px;
  background:linear-gradient(90deg,#E8A050,#E8647A);
  transition:width .1s linear;
}
.rec-stop{
  padding:16px 52px;border-radius:22px;
  background:var(--glass);border:1px solid var(--border);
  backdrop-filter:blur(12px);
  color:var(--offwhite);font-family:'Nunito',sans-serif;
  font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;
}
.rec-stop:hover{background:rgba(255,255,255,.2);}

/* intérêts & settings */
.psection{padding:0 22px 18px;}
.psection-title{font-size:14px;font-weight:800;margin-bottom:12px;
  text-transform:uppercase;letter-spacing:.8px;color:var(--muted);}
.itags{display:flex;flex-wrap:wrap;gap:8px;}
.itag{
  padding:8px 16px;background:var(--glass);border:1px solid var(--border);
  backdrop-filter:blur(12px);border-radius:30px;
  font-size:13px;font-weight:600;
}
.setting{
  display:flex;justify-content:space-between;align-items:center;
  padding:13px 0;border-bottom:1px solid var(--border);cursor:pointer;
}
.setting-l{display:flex;align-items:center;gap:12px;}
.setting-icon{font-size:18px;width:26px;text-align:center;}
.toggle{width:48px;height:26px;border-radius:13px;
  background:var(--rose);position:relative;cursor:pointer;transition:background .2s;}
.toggle::after{
  content:'';position:absolute;width:20px;height:20px;background:white;
  border-radius:50%;top:3px;right:3px;transition:left .2s,right .2s;
}
.toggle.off{background:rgba(255,255,255,.18);}
.toggle.off::after{right:auto;left:3px;}

/* ─────────────────────────────────────────
   FILTRES
───────────────────────────────────────── */
.filters-ov{
  position:absolute;inset:0;z-index:150;
  background:rgba(10,15,30,.92);backdrop-filter:blur(32px);
  display:flex;flex-direction:column;animation:slideUp .32s ease;
}
@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
.filters-handle{width:44px;height:4px;background:var(--dim);border-radius:2px;
  margin:16px auto;}
.filters-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;
  padding:0 22px 18px;}
.filters-body{flex:1;overflow-y:auto;padding:0 22px;}
.filters-body::-webkit-scrollbar{display:none;}
.fgroup{margin-bottom:28px;}
.flabel{font-size:12px;font-weight:800;color:var(--muted);
  text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;}
.frank{font-size:24px;font-weight:800;color:var(--amber-soft);margin-bottom:12px;}
.fslider{
  width:100%;height:4px;background:var(--border);border-radius:2px;
  -webkit-appearance:none;outline:none;cursor:pointer;accent-color:var(--rose);
}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.foption{
  padding:13px;background:var(--glass);border:2px solid var(--border);
  border-radius:16px;text-align:center;cursor:pointer;transition:all .2s;
  font-size:13px;font-weight:600;backdrop-filter:blur(12px);
}
.foption.active{border-color:var(--rose);background:rgba(232,100,122,.1);color:var(--rose);}
.finterests{display:flex;flex-wrap:wrap;gap:8px;}
.fibtn{
  padding:8px 15px;background:var(--glass);border:2px solid var(--border);
  border-radius:30px;font-size:12px;font-weight:700;cursor:pointer;
  transition:all .2s;color:var(--offwhite);backdrop-filter:blur(12px);
}
.fibtn.active{border-color:var(--rose);background:rgba(232,100,122,.12);color:var(--rose);}
.filter-apply{
  margin:14px 22px 28px;padding:18px;
  background:linear-gradient(135deg,#E8647A,#E8A050);
  border:none;border-radius:22px;width:calc(100% - 44px);
  color:white;font-family:'Nunito',sans-serif;font-size:16px;font-weight:700;
  cursor:pointer;box-shadow:0 8px 28px rgba(232,100,122,.35);
  transition:all .2s;
}
.filter-apply:hover{transform:translateY(-2px);}

/* ─────────────────────────────────────────
   MATCH POPUP
───────────────────────────────────────── */
.match-popup{
  position:absolute;inset:0;z-index:180;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:40px 28px;text-align:center;
  background:rgba(10,15,30,.93);backdrop-filter:blur(28px);
}
.match-emoji{font-size:52px;margin-bottom:4px;animation:matchPop .5s cubic-bezier(.175,.885,.32,1.275);}
.match-title{
  font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:700;
  background:linear-gradient(135deg,#F5C883,#E8647A);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  margin-bottom:6px;
  animation:matchPop .5s .1s cubic-bezier(.175,.885,.32,1.275) both;
}
@keyframes matchPop{from{transform:scale(.4);opacity:0;}to{transform:scale(1);opacity:1;}}
.match-sub{font-size:15px;color:var(--muted);margin-bottom:30px;}
.match-photos{display:flex;align-items:center;gap:16px;margin-bottom:32px;}
.match-ph{width:88px;height:88px;border-radius:50%;object-fit:cover;
  border:3px solid rgba(232,160,80,.5);}
.match-me{
  width:88px;height:88px;border-radius:50%;
  background:linear-gradient(135deg,#E8647A,#C084FC);
  display:flex;align-items:center;justify-content:center;
  font-size:36px;border:3px solid var(--border);
}
.match-hearts{display:flex;flex-direction:column;align-items:center;gap:4px;}
.match-heart{font-size:26px;animation:heartbeat 1s infinite;}
@keyframes heartbeat{0%,100%{transform:scale(1);}50%{transform:scale(1.25);}}
.match-btn{
  width:100%;padding:17px;border:none;border-radius:22px;
  font-family:'Nunito',sans-serif;font-size:16px;font-weight:700;
  cursor:pointer;margin-bottom:12px;transition:all .2s;
}
.match-btn-p{background:linear-gradient(135deg,#E8647A,#E8A050);color:white;
  box-shadow:0 8px 28px rgba(232,100,122,.35);}
.match-btn-s{background:var(--glass);color:var(--offwhite);
  border:1px solid var(--border);backdrop-filter:blur(12px);}

/* ─────────────────────────────────────────
   TOAST & DIVERS
───────────────────────────────────────── */
.toast{
  position:absolute;bottom:106px;left:50%;transform:translateX(-50%);
  background:var(--glass-med);border:1px solid var(--border);
  backdrop-filter:blur(20px);border-radius:22px;
  padding:11px 22px;font-size:13px;font-weight:600;
  white-space:nowrap;z-index:400;animation:fadeUp .3s ease;
  box-shadow:var(--shadow-sm);
}
.empty-state{
  flex:1;display:flex;flex-direction:column;align-items:center;
  justify-content:center;text-align:center;padding:40px;
}
.empty-icon{font-size:60px;margin-bottom:16px;opacity:.7;}
.empty-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:700;
  margin-bottom:8px;}
.empty-sub{font-size:14px;color:var(--muted);margin-bottom:24px;line-height:1.6;}
.empty-link{color:var(--rose);font-weight:700;cursor:pointer;font-size:14px;}

@keyframes fadeUp{from{opacity:0;transform:translate(-50%,10px);}to{opacity:1;transform:translate(-50%,0);}}
@keyframes fadeUpEl{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
`;


// ─── PROFILS ────────────────────────────────────────────────────────
const PROFILES = [
  { id:1, name:"Léa", age:27, job:"Designer UX", city:"Paris",
    bio:"Passionnée d'art contemporain et de randonnée. Je cherche quelqu'un qui aime autant les musées que les sommets.",
    distance:"2 km", interests:["Art","Randonnée","Photo","Yoga"],
    verified:true, premium:false, match:94, hasVoice:true, hasVideo:true,
    photo:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80" },
  { id:2, name:"Sofia", age:25, job:"Chef cuisinière", city:"Lyon",
    bio:"La vie est trop courte pour manger sans plaisir. J'adore cuisiner et explorer de nouvelles cultures.",
    distance:"5 km", interests:["Cuisine","Voyage","Musique","Cinéma"],
    verified:true, premium:true, match:88, hasVoice:true, hasVideo:false,
    photo:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80" },
  { id:3, name:"Camille", age:29, job:"Architecte", city:"Bordeaux",
    bio:"Je construis des espaces le jour et des rêves la nuit. Amatrice de jazz et de café bien trop fort.",
    distance:"8 km", interests:["Architecture","Jazz","Lecture","Running"],
    verified:false, premium:true, match:79, hasVoice:false, hasVideo:true,
    photo:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&q=80" },
  { id:4, name:"Emma", age:26, job:"Journaliste", city:"Paris",
    bio:"Toujours curieuse, jamais satisfaite. Je cherche quelqu'un pour débattre jusqu'à 2h du matin.",
    distance:"3 km", interests:["Écriture","Débats","Théâtre","Voyages"],
    verified:true, premium:false, match:91, hasVoice:true, hasVideo:true,
    photo:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80" },
];

// ─── CONVERSATIONS ───────────────────────────────────────────────────
const MESSAGES_DATA = [
  { id:1, name:"Léa", photo:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&q=80",
    online:true, lastMsg:"Haha oui exactement ! Tu connais cet endroit ?", time:"2 min", unread:2,
    chat:[
      { from:"them", text:"Salut ! J'ai vu que tu aimais la randonnée 🏔️", time:"14:20" },
      { from:"me",   text:"Oui ! Je fais souvent des sorties dans les Alpes", time:"14:22" },
      { from:"them", text:"Le mont Blanc l'été dernier c'était incroyable ✨", time:"14:23" },
      { from:"me",   text:"Moi j'ai fait la Mer de Glace en juin", time:"14:25" },
      { from:"them", text:"Haha oui exactement ! Tu connais cet endroit ?", time:"14:27" },
    ]},
  { id:2, name:"Emma", photo:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&q=80",
    online:true, lastMsg:"Super ! On se retrouve samedi alors ?", time:"1h", unread:0,
    chat:[
      { from:"them", text:"Hey ! Tu as vu le dernier film de Villeneuve ?", time:"11:00" },
      { from:"me",   text:"Non pas encore, il est bien ?", time:"11:05" },
      { from:"them", text:"Absolument brillant. On pourrait le voir ensemble ?", time:"11:06" },
      { from:"them", text:"Super ! On se retrouve samedi alors ?", time:"11:11" },
    ]},
  { id:3, name:"Sofia", photo:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&q=80",
    online:false, lastMsg:"Je t'enverrai la recette 😄", time:"3h", unread:0,
    chat:[{ from:"them", text:"Je t'enverrai la recette 😄", time:"09:05" }]},
];

// ─── COMPOSANT PRINCIPAL ────────────────────────────────────────────
export default function AuraApp() {
  const [screen, setScreen]           = useState("splash");
  const [authMode, setAuthMode]       = useState("login"); // "login" | "register"
  const [authEmail, setAuthEmail]     = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName]       = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError]     = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [avatarUrl, setAvatarUrl]       = useState(null);
  const [profilePhotos, setProfilePhotos] = useState([]);
  const [cardPhotoIdx, setCardPhotoIdx] = useState(0);
  const [lastSwiped, setLastSwiped] = useState(null);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // {label, onConfirm}
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [coverUrl, setCoverUrl]         = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [audioSrcUrl, setAudioSrcUrl]     = useState(null);
  const [showPlayer, setShowPlayer]       = useState(null);
  const [profileName, setProfileName]   = useState("");
  const [profileAge, setProfileAge]     = useState("");
  const [profileCity, setProfileCity]   = useState("");
  const [profileBio, setProfileBio]     = useState("");
  const [profileJob, setProfileJob]     = useState("");
  const [dbProfiles, setDbProfiles]   = useState([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [tab, setTab]                 = useState("discover");
  const [profiles, setProfiles]       = useState(PROFILES);
  const [bgIdx, setBgIdx]             = useState(0);
  const [bgNext, setBgNext]           = useState(1);
  const [bgCrossfade, setBgCrossfade] = useState(false);
  const [showMatch, setShowMatch]     = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [onlineOnly, setOnlineOnly]     = useState(false);
  const [mediaPlayer, setMediaPlayer] = useState(null);
  const [openChat, setOpenChat]       = useState(null);
  const [msgs, setMsgs]               = useState(MESSAGES_DATA);
  const [realMsgs, setRealMsgs]       = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [viewProfile, setViewProfile] = useState(null);
  const [dbMatches, setDbMatches]       = useState([]);
  const [newLikes, setNewLikes]         = useState(0);
  const [lastLikeCheck, setLastLikeCheck] = useState(new Date().toISOString());
  const [likesReceived, setLikesReceived] = useState([]);
  const [showLikesPanel, setShowLikesPanel] = useState(false);
  const [chatInput, setChatInput]     = useState("");
  const [toast, setToast]             = useState(null);
  const [genderF, setGenderF]         = useState("Femmes");
  const [ageF, setAgeF]               = useState(35);
  const [distF, setDistF]             = useState(25);
  const [intF, setIntF]               = useState(["Musique","Voyage"]);
  const [drag, setDrag]               = useState({ on:false, x:0, y:0, sx:0, sy:0 });
  const [recording, setRecording]     = useState(null);
  const [recHas, setRecHas]           = useState({ voice:false, video:false });
  const [playing, setPlaying]         = useState(false);
  const [playProg, setPlayProg]       = useState(0);
  const recTimerRef    = useRef(null);
  const playTimerRef   = useRef(null);
  const mediaRecRef    = useRef(null);
  const mediaChunksRef = useRef([]);
  const audioBlobRef   = useRef(null);
  const audioUrlRef    = useRef(null);
  const videoUrlRef    = useRef(null);
  const audioElRef     = useRef(null);


  // Upload avatar to Supabase Storage
  async function loadLikesReceived() {
    if (!currentUser) return;
    try {
      const uid = currentUser.id;
      // Get all swipes where someone liked me
      const swipes = await supabase.select("swipes",
        `?swiped_id=eq.${uid}&direction=eq.like&order=created_at.desc&limit=50`);
      if (!Array.isArray(swipes) || swipes.length === 0) { setLikesReceived([]); return; }
      // Fetch profile for each liker
      const enriched = await Promise.all(swipes.map(async s => {
        const profiles = await supabase.select("profiles", `?id=eq.${s.swiper_id}`);
        const p = Array.isArray(profiles) && profiles[0];
        return p ? {
          id: p.id,
          name: p.name || "Membre",
          age: p.age || "",
          city: p.city || "",
          photo: p.photo_url || null,
          photos: p.photos_urls || (p.photo_url ? [p.photo_url] : []),
          bio: p.bio || "",
          job: p.job || "",
          likedAt: s.created_at,
        } : null;
      }));
      setLikesReceived(enriched.filter(Boolean));
      setNewLikes(0);
    } catch(e) { console.error("loadLikesReceived:", e); }
  }

  async function seedFakeProfiles() {
    showToast("⏳ Ajout des profils...");
    try {
      const token = localStorage.getItem("aura_token");
      for (const p of FAKE_PROFILES) {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
          method: "POST",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Prefer": "resolution=ignore-duplicates",
          },
          body: JSON.stringify(p),
        });
      }
      await loadProfiles();
      showToast("✅ 8 profils ajoutés !");
    } catch(e) { showToast("❌ " + e.message.slice(0,40)); }
  }

  async function setupPushNotifications() {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    try {
      const perm = await Notification.requestPermission();
      if (perm === "granted") {
        showToast("🔔 Notifications activées !");
        localStorage.setItem("aura_notif", "1");
      }
    } catch(e) {}
  }

  function sendLocalNotif(title, body) {
    if (Notification.permission === "granted" && document.hidden) {
      new Notification(title, { body, icon: "/icon-192.png", badge: "/icon-192.png" });
    }
  }

  async function uploadRecording(blob, type) {
    if (!blob || !currentUser) return;
    showToast("📤 Sauvegarde en cours...");
    try {
      const token = localStorage.getItem("aura_token");
      const ext = blob.type.includes("webm") ? "webm" : "mp4";
      const path = `${currentUser.id}/${type}_${Date.now()}.${ext}`;
      const bucket = "media";
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`,
          "Content-Type": blob.type,
          "x-upsert": "true",
        },
        body: blob,
      });
      if (r.ok) {
        const url = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
        const col = type === "voice" ? "voice_url" : "video_url";
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}`, {
          method: "PATCH",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [col]: url }),
        });
        showToast(type === "voice" ? "✅ Vocal sauvegardé !" : "✅ Vidéo sauvegardée !");
      } else {
        const txt = await r.text();
        showToast("❌ Erreur upload: " + r.status);
        console.error("Recording upload error:", r.status, txt);
      }
    } catch(e) {
      showToast("❌ " + e.message.slice(0,50));
    }
  }

  async function uploadExtraPhoto(file) {
    if (!file || !currentUser) return;
    if (profilePhotos.length >= 3) { showToast("Maximum 3 photos atteint"); return; }
    try {
      const token = localStorage.getItem("aura_token");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${currentUser.id}/photo_${Date.now()}.${ext}`;
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${path}`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`,
          "Content-Type": file.type || "image/jpeg",
          "x-upsert": "true",
        },
        body: file,
      });
      if (r.ok) {
        const url = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
        const newPhotos = [...profilePhotos, url].slice(0, 3);
        setProfilePhotos(newPhotos);
        // Save first photo as main avatar too
        if (newPhotos.length === 1) setAvatarUrl(url);
        // Save array to DB
        const token2 = localStorage.getItem("aura_token");
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}`, {
          method: "PATCH",
          headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": `Bearer ${token2}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photos_urls: newPhotos, photo_url: newPhotos[0] }),
        });
        showToast("✅ Photo ajoutée !");
      } else { showToast("❌ Erreur upload"); }
    } catch(e) { showToast("❌ " + e.message.slice(0,40)); }
  }

  async function removeExtraPhoto(idx) {
    const newPhotos = profilePhotos.filter((_,i) => i !== idx);
    setProfilePhotos(newPhotos);
    if (idx === 0) setAvatarUrl(newPhotos[0] || null);
    const token = localStorage.getItem("aura_token");
    await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}`, {
      method: "PATCH",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ photos_urls: newPhotos, photo_url: newPhotos[0] || null }),
    });
    showToast("Photo supprimée");
  }

  async function uploadAvatar(file) {
    if (!file || !currentUser) { showToast("❌ Pas de fichier ou non connecté"); return; }
    setAvatarUploading(true);

    // Aperçu local immédiat
    const reader = new FileReader();
    reader.onload = e => setAvatarUrl(e.target.result);
    reader.readAsDataURL(file);

    try {
      const token = localStorage.getItem("aura_token");
      if (!token) { showToast("❌ Token manquant, reconnectez-vous"); setAvatarUploading(false); return; }

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const ts = Date.now();
      const path = `${currentUser.id}/avatar_${ts}.${ext}`;

      showToast("📤 Upload en cours...");

      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${path}`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`,
          "Content-Type": file.type || "image/jpeg",
          "x-upsert": "true",
        },
        body: file,
      });

      const respText = await r.text();
      console.log("Storage response:", r.status, respText);

      if (r.ok || r.status === 200) {
        const url = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}`;
        setAvatarUrl(url);
        showToast("💾 Sauvegarde en DB...");
        try {
          // UPDATE direct (plus fiable que upsert)
          const token2 = localStorage.getItem("aura_token");
          const dbR = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${currentUser.id}`, {
            method: "PATCH",
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${token2}`,
              "Content-Type": "application/json",
              "Prefer": "return=representation",
            },
            body: JSON.stringify({ photo_url: url }),
          });
          const dbTxt = await dbR.text();
          console.log("PATCH photo result:", dbR.status, dbTxt);
          if (dbR.ok) {
            showToast("✅ Photo sauvegardée !");
          } else {
            showToast("⚠️ DB erreur " + dbR.status + ": " + dbTxt.slice(0,50));
          }
        } catch(e2) {
          console.error("DB save error:", e2.message);
          showToast("⚠️ DB échouée: " + e2.message.slice(0,50));
        }
      } else {
        console.error("Upload failed:", r.status, respText);
        showToast("❌ Upload échoué " + r.status + ": " + respText.slice(0,60));
      }
    } catch(e) {
      console.error("Upload exception:", e.message);
      showToast("❌ Exception: " + e.message.slice(0,60));
    }
    setAvatarUploading(false);
  }

  // Save profile info to Supabase

  async function uploadCover(file) {
    const reader = new FileReader();
    reader.onload = e => setCoverUrl(e.target.result);
    reader.readAsDataURL(file);
    try {
      const token = localStorage.getItem("aura_token");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${currentUser.id}/cover_${Date.now()}.${ext}`;
      const r = await fetch(`${SUPABASE_URL}/storage/v1/object/avatars/${path}`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}`, "Content-Type": file.type || "image/jpeg", "x-upsert": "true" },
        body: file,
      });
      if (r.ok && currentUser) {
        const url = `${SUPABASE_URL}/storage/v1/object/public/avatars/${path}?t=${Date.now()}`;
        setCoverUrl(url);
        await supabase.upsert("profiles", { id: currentUser.id, cover_url: url });
      }
    } catch(e) { console.error("Cover upload:", e); }
  }

  async function saveProfile() {
    if (!currentUser) return;
    try {
      await supabase.upsert("profiles", {
        id: currentUser.id,
        name: profileName || "Membre",
        age: parseInt(profileAge) || null,
        city: profileCity || null,
        bio: profileBio || null,
        job: profileJob || null,
      });
      showToast("Profil mis à jour ✓");
      setEditingProfile(false);
    } catch(e) {
      console.error("saveProfile error:", e);
      showToast("Erreur sauvegarde: " + (e.message || "inconnue"));
    }
  }

  // BG crossfade cycling
  async function loadMyProfile(userId) {
    try {
      const data = await supabase.select("profiles", `?id=eq.${userId}`);
      console.log("loadMyProfile data:", JSON.stringify(data));
      if (Array.isArray(data) && data[0]) {
        const p = data[0];
        if (p.name)      setProfileName(p.name);
        if (p.age)       setProfileAge(String(p.age));
        if (p.city)      setProfileCity(p.city);
        if (p.bio)       setProfileBio(p.bio);
        if (p.job)       setProfileJob(p.job);
        if (p.photo_url) { setAvatarUrl(p.photo_url); console.log("Avatar loaded:", p.photo_url.slice(0,60)); }
        if (p.photos_urls && Array.isArray(p.photos_urls)) setProfilePhotos(p.photos_urls);
        else if (p.photo_url) setProfilePhotos([p.photo_url]);
        if (p.cover_url) setCoverUrl(p.cover_url);
      } else {
        console.log("loadMyProfile: no profile found for", userId);
      }
    } catch(e) { console.error("loadMyProfile error:", e); }
  }

  async function loadProfiles() {
    try {
      const userId = supabase.auth.getUserId();
      // Fetch profiles already swiped to exclude them
      const swipedData = await supabase.select("swipes",
        "?swiper_id=eq." + userId + "&select=swiped_id");
      const swipedIds = Array.isArray(swipedData)
        ? swipedData.map(s => s.swiped_id) : [];

      const data = await supabase.select("profiles",
        "?id=neq." + userId + "&limit=20&order=created_at.desc");
      const filtered = Array.isArray(data)
        ? data.filter(p => p.id !== userId && !swipedIds.includes(p.id)) : data;
      const mapped = Array.isArray(filtered) ? filtered.map(p => ({
          id: p.id, name: p.name || "Membre", age: p.age || 25,
          job: p.job || "AURA", city: p.city || "Paris",
          bio: p.bio || "Nouveau sur AURA",
          distance: "? km", interests: p.interests || ["Voyages"],
          verified: p.verified || false, premium: p.premium || false,
          match: Math.floor(75 + Math.random()*24),
          hasVoice: !!p.voice_url, hasVideo: !!p.video_url,
          voice_url: p.voice_url || null,
          video_url: p.video_url || null,
          photo: p.photo_url || null,
          photos: p.photos_urls || (p.photo_url ? [p.photo_url] : []),
          distance: getDistance(userLocation?.lat, userLocation?.lon, p.latitude, p.longitude),
          online: true,
        })) : [];
      if (mapped.length > 0) {
        setDbProfiles(mapped);
        setProfiles(mapped);
      } else if (Array.isArray(data) && data.length > 0) {
        // Tous déjà swipés → réinitialiser les swipes et recharger
        const allMapped = data.filter(p => p.id !== userId).map(p => ({
          id: p.id, name: p.name || "Membre", age: p.age || 25,
          job: p.job || "AURA", city: p.city || "Paris",
          bio: p.bio || "Nouveau sur AURA",
          distance: "? km", interests: p.interests || ["Voyages"],
          verified: p.verified || false, premium: p.premium || false,
          match: Math.floor(75 + Math.random()*24),
          hasVoice: !!p.voice_url, hasVideo: !!p.video_url,
          voice_url: p.voice_url || null,
          video_url: p.video_url || null,
          photo: p.photo_url || null,
          photos: p.photos_urls || (p.photo_url ? [p.photo_url] : []),
          online: true,
        }));
        setDbProfiles(allMapped);
        setProfiles(allMapped);
      } else {
        setProfiles([]);
      }
    } catch(e) { console.log(e); }
  }


  async function loadMessages(matchId) {
    if (!matchId) return;
    try {
      const token = localStorage.getItem("aura_token");
      const data = await supabase.select("messages",
        `?match_id=eq.${matchId}&order=created_at.asc&limit=100`);
      if (Array.isArray(data)) {
        setRealMsgs(prev => {
          // Strict equality check — only update if something actually changed
          if (prev.length === data.length &&
              (prev.length === 0 || prev[prev.length-1]?.id === data[data.length-1]?.id)) {
            return prev; // Return SAME reference — React skips re-render
          }
          const newOnes = data.filter(m => !prev.find(p => p.id === m.id) && m.sender_id !== currentUser?.id);
          if (newOnes.length > 0) sendLocalNotif("💬 Nouveau message", newOnes[newOnes.length-1].text || "...");
          return data;
        });
      }
    } catch(e) { console.error("loadMessages:", e); }
  }

  async function sendRealMsg(matchId, text) {
    if (!matchId || !text.trim() || !currentUser) return;
    try {
      const token = localStorage.getItem("aura_token");
      const msg = {
        match_id: matchId,
        sender_id: currentUser.id,
        text: text.trim(),
      };
      const r = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify(msg),
      });
      const respTxt = await r.text();
      console.log("sendMsg response:", r.status, respTxt);
      if (r.ok) {
        const saved = respTxt ? JSON.parse(respTxt) : null;
        const newMsg = Array.isArray(saved) ? saved[0] : saved;
        if (newMsg) {
          setRealMsgs(prev => [...prev, newMsg]);
        } else {
          // Insert ok but no return — reload messages
          setTimeout(() => loadMessages(matchId), 500);
        }
      } else {
        console.error("sendMsg failed:", r.status, respTxt);
        showToast("❌ Message non envoyé: " + r.status);
      }
    } catch(e) {
      console.error("sendRealMsg:", e);
      showToast("❌ " + e.message.slice(0,50));
    }
  }

  async function loadMatches() {
    if (!currentUser) return;
    try {
      const uid = currentUser.id;
      // Two separate queries to avoid or= syntax issues
      const [asUser1, asUser2] = await Promise.all([
        supabase.select("matches", `?user1_id=eq.${uid}&order=created_at.desc`),
        supabase.select("matches", `?user2_id=eq.${uid}&order=created_at.desc`),
      ]);
      const all = [...(Array.isArray(asUser1) ? asUser1 : []), ...(Array.isArray(asUser2) ? asUser2 : [])];
      // Deduplicate by id
      const seen = new Set();
      const data = all.filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; });
      if (!data.length) { setDbMatches([]); return; }
      // For each match, fetch the other user's profile
      const enriched = await Promise.all(data.map(async m => {
        const otherId = m.user1_id === uid ? m.user2_id : m.user1_id;
        const profiles = await supabase.select("profiles", `?id=eq.${otherId}`);
        const p = Array.isArray(profiles) && profiles[0];
        return {
          matchId: m.id,
          id: otherId,
          name: p?.name || "Membre",
          age: p?.age || "",
          city: p?.city || "",
          bio: p?.bio || "",
          job: p?.job || "",
          photo: p?.photo_url || null,
          voice_url: p?.voice_url || null,
          video_url: p?.video_url || null,
          online: Math.random() > 0.5,
          lastMsg: "",
          unread: 0,
          chat: [],
          createdAt: m.created_at,
        };
      }));
      setDbMatches(prev => {
        // Only update if matches actually changed
        if (prev.length === enriched.length &&
            prev.every((m,i) => m.matchId === enriched[i]?.matchId)) return prev;
        return enriched;
      });
      // Merge into msgs state for chat
      setMsgs(prev => {
        const existingIds = new Set(enriched.map(m => m.id));
        const filtered = prev.filter(m => !existingIds.has(m.id));
        return [...enriched, ...filtered];
      });
    } catch(e) { console.error("loadMatches:", e); }
  }

  async function handleAuth() {
    setAuthLoading(true); setAuthError("");
    try {
      if (authMode === "register") {
        const res = await supabase.auth.signUp({
          email: authEmail, password: authPassword,
          options: { data: { name: authName } }
        });
        if (res.error) { setAuthError(res.error.message || res.msg || JSON.stringify(res.error)); }
        else {
          // Try auto-login after signup
          const login = await supabase.auth.signIn({ email: authEmail, password: authPassword });
          if (login.access_token) {
            localStorage.setItem("aura_token", login.access_token);
            localStorage.setItem("aura_user_id", login.user?.id);
            setCurrentUser({ id: login.user?.id });
            await loadMyProfile(login.user?.id);
            await loadProfiles();
            setScreen("app");
          } else {
            // Fallback: compte créé, connexion manuelle
            setAuthError("Compte créé ! Connecte-toi maintenant.");
            setAuthMode("login");
          }
        }
      } else {
        const res = await supabase.auth.signIn({ email: authEmail, password: authPassword });
        if (res.access_token) {
          localStorage.setItem("aura_token", res.access_token);
          localStorage.setItem("aura_user_id", res.user?.id);
          setCurrentUser({ id: res.user?.id });
          await loadMyProfile(res.user?.id);
          await loadProfiles();
          loadMatches();
          setScreen("app");
          setTimeout(() => setupPushNotifications(), 2000);
          // Get user location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
              const { latitude, longitude } = pos.coords;
              setUserLocation({ lat: latitude, lon: longitude });
              // Save to profile
              const tok = localStorage.getItem("aura_token");
              const uid = localStorage.getItem("aura_user_id");
              fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
                method: "PATCH",
                headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${tok}`, "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude })
              });
            }, () => {});
          }
        } else { setAuthError(res.error?.message || res.error_description || res.msg || "Email ou mot de passe incorrect. Verifie tes identifiants."); }
      }
    } catch(e) { console.error("handleAuth error:", e); setAuthError("Erreur: " + e.message); }
    setAuthLoading(false);
  }

    // Auth check on startup
  useEffect(() => {
    const timer = setTimeout(() => {
      if (supabase.auth.isLoggedIn()) {
        const uid3 = supabase.auth.getUserId();
        setCurrentUser({ id: uid3 });
        loadMyProfile(uid3);
        loadProfiles();
        loadMatches();
        setScreen("app");
      } else {
        setScreen("auth");
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);


  // Polling messages en chat toutes les 5s
  useEffect(() => {
    activeMatchIdRef.current = openChat?.matchId || null;
    if (!openChat?.matchId) return;
    // First load with loading indicator
    setChatLoading(true);
    Promise.resolve(loadMessages(openChat.matchId)).finally(() => setChatLoading(false));
    const t = setInterval(() => {
      if (activeMatchIdRef.current) loadMessages(activeMatchIdRef.current);
    }, 8000);
    return () => { clearInterval(t); };
  }, [openChat?.matchId]);

  // Polling: vérifie les nouveaux likes toutes les 30s
  const likeCheckRef = React.useRef(new Date().toISOString());

  // Update chat avatar directly in DOM — bypasses React re-render cycle completely
  useEffect(() => {
    if (chatAvRef.current && openChat?.photo) {
      chatAvRef.current.style.backgroundImage = `url(${openChat.photo})`;
    }
  }, [openChat?.id]);
  const activeMatchIdRef = React.useRef(null);
  useEffect(() => {
    if (!currentUser) return;
    const poll = setInterval(async () => {
      // Skip heavy polling when user is actively chatting
      if (activeMatchIdRef.current) return;
      try {
        const uid = currentUser.id;
        const since = likeCheckRef.current;
        const likes = await supabase.select("swipes",
          `?swiped_id=eq.${uid}&direction=eq.like&created_at=gt.${encodeURIComponent(since)}`);
        if (Array.isArray(likes) && likes.length > 0) {
          setNewLikes(n => n + likes.length);
          likeCheckRef.current = new Date().toISOString();
          const msg = likes.length > 1 ? `${likes.length} personnes vous ont liké !` : "Quelqu'un vous a liké !";
          showToast("💛 " + msg);
          sendLocalNotif("✦ Aura", msg);
        }
        loadMatches();
      } catch(e) { console.error("polling error:", e); }
    }, 15000);
    return () => clearInterval(poll);
  }, [currentUser]);

  useEffect(() => {
    // Stop background animation completely when in chat
    if (openChat || tab === "messages") {
      setBgCrossfade(false);
      return;
    }
    const t = setInterval(() => {
      const next = (bgIdx + 1) % BG_SCENES.length;
      setBgNext(next);
      setBgCrossfade(true);
      setTimeout(() => {
        setBgIdx(next);
        setBgCrossfade(false);
      }, 1400);
    }, 7000);
    return () => clearInterval(t);
  }, [bgIdx, openChat, tab]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  // ── Swipe ──
  const onMD = e => setDrag({ on:true, x:0, y:0, sx:e.clientX, sy:e.clientY });
  const onMM = e => { if (!drag.on) return; setDrag(d => ({...d, x:e.clientX-d.sx, y:e.clientY-d.sy})); };
  const onMU = () => {
    if (!drag.on) return;
    if (drag.x > 85) doLike();
    else if (drag.x < -85) doPass();
    setDrag({ on:false, x:0, y:0, sx:0, sy:0 });
  };
  // Touch support for mobile swipe
  const onTD = e => {
    const t = e.touches[0];
    setDrag({ on:true, x:0, y:0, sx:t.clientX, sy:t.clientY });
  };
  const onTM = e => {
    if (!drag.on) return;
    e.preventDefault();
    const t = e.touches[0];
    setDrag(d => ({...d, x:t.clientX-d.sx, y:t.clientY-d.sy}));
  };
  const onTU = () => {
    if (!drag.on) return;
    if (drag.x > 85) doLike();
    else if (drag.x < -85) doPass();
    setDrag({ on:false, x:0, y:0, sx:0, sy:0 });
  };

  const doLike = async () => {
    if (!profiles.length || !currentUser) return;
    const p = profiles[0];
    setLastSwiped({ profile: p, direction: "like" });
    setProfiles(prev => prev.slice(1));
    setCardPhotoIdx(0);
    setBgIdx(i => (i+1) % BG_SCENES.length);
    try {
      await supabase.insert("swipes", {
        swiper_id: currentUser.id,
        swiped_id: p.id,
        direction: "like"
      });
      // Vérifier si match mutuel
      const existing = await supabase.select("swipes",
        `?swiper_id=eq.${p.id}&swiped_id=eq.${currentUser.id}&direction=eq.like`);
      if (Array.isArray(existing) && existing.length > 0) {
        // C'est un match !
        setShowMatch(true);
        // Créer le match en DB (le trigger le fait aussi, mais on force)
        try {
          await supabase.upsert("matches", {
            user1_id: currentUser.id < p.id ? currentUser.id : p.id,
            user2_id: currentUser.id < p.id ? p.id : currentUser.id,
          });
        } catch(e) { /* ignore duplicate */ }
        // Fetch the real matchId to use in chat
        try {
          const uid = currentUser.id;
          const u1 = uid < p.id ? uid : p.id;
          const u2 = uid < p.id ? p.id : uid;
          const matchRows = await supabase.select("matches",
            `?user1_id=eq.${u1}&user2_id=eq.${u2}&limit=1`);
          const matchId = Array.isArray(matchRows) && matchRows[0]?.id;
          setMatchedProfile({ ...p, matchId: matchId || null });
        } catch(e) {
          setMatchedProfile(p);
        }
        loadMatches();
      } else {
        showToast("💛 Tu as liké " + p.name);
      }
    } catch(e) {
      if (e.message && e.message.includes("duplicate")) {
        // Déjà swiké
      } else {
        showToast("💛 Tu as liké " + p.name);
      }
    }
  };

  const doPass = async () => {
    if (!profiles.length || !currentUser) return;
    const p = profiles[0];
    setLastSwiped({ profile: p, direction: "pass" });
    setProfiles(prev => prev.slice(1));
    setCardPhotoIdx(0);
    setBgIdx(i => (i+1) % BG_SCENES.length);
    showToast("👋 Profil passé");
    try {
      await supabase.insert("swipes", {
        swiper_id: currentUser.id,
        swiped_id: p.id,
        direction: "pass"
      });
    } catch(e) { /* ignore */ }
  };

  const doUndo = () => { loadProfiles(); showToast("↩ Rechargement"); };

  // ── Recording ──
  const startRec = async (type) => {
    try {
      const constraints = type === "voice"
        ? { audio: true }
        : { audio: true, video: { facingMode: "user", width: 480, height: 640 } };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaChunksRef.current = [];

      const mimeType = type === "voice"
        ? (MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4")
        : (MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "video/mp4");

      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecRef.current = mr;

      mr.ondataavailable = e => {
        if (e.data.size > 0) mediaChunksRef.current.push(e.data);
      };

      mr.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(mediaChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        audioBlobRef.current = blob;
        if (type === "voice") {
          audioUrlRef.current = url;
          audioElRef.current = null;
          setAudioSrcUrl(url);
        } else {
          videoUrlRef.current = url;
          setVideoPreviewUrl(url);
        }
        const recType = type;
        setRecHas(prev => ({ ...prev, [recType]: true }));
        setShowPlayer(recType);
        showToast(recType === "voice" ? "🎤 Message vocal enregistré !" : "🎬 Vidéo enregistrée !");
      };

      mr.start();
      setRecording({ type, elapsed: 0 });

      let t = 0;
      recTimerRef.current = setInterval(() => {
        t += 0.1;
        setRecording(r => r ? ({ ...r, elapsed: Math.min(t, 10) }) : null);
        if (t >= 10) stopRec(type);
      }, 100);

    } catch(e) {
      if (e.name === "NotAllowedError") {
        showToast("❌ Accès micro/caméra refusé");
      } else {
        showToast("❌ Erreur: " + e.message);
      }
    }
  };

  const stopRec = (type) => {
    clearInterval(recTimerRef.current);
    if (mediaRecRef.current && mediaRecRef.current.state !== "inactive") {
      mediaRecRef.current.stop();
    }
    setRecording(null);
  };

  // ── Lecture audio réelle ──
  const startPlay = () => {
    if (!audioUrlRef.current) return;
    if (!audioElRef.current) {
      audioElRef.current = new Audio(audioUrlRef.current);
      audioElRef.current.onended = () => { setPlaying(false); setPlayProg(0); };
    }
    audioElRef.current.play();
    setPlaying(true); setPlayProg(0);
    let p = 0;
    playTimerRef.current = setInterval(() => {
      p += 1; setPlayProg(p);
      if (p >= 100) { clearInterval(playTimerRef.current); setPlaying(false); setPlayProg(0); }
    }, 100);
  };

  const stopPlay = () => {
    if (audioElRef.current) audioElRef.current.pause();
    clearInterval(playTimerRef.current);
    setPlaying(false); setPlayProg(0);
  };

  // ── Chat ──
  const doSuperLike = async () => {
    if (!profiles.length || !currentUser) return;
    const p = profiles[0];
    setLastSwiped({ profile: p, direction: "superlike" });
    setProfiles(prev => prev.slice(1));
    setCardPhotoIdx(0);
    setBgIdx(i => (i+1) % BG_SCENES.length);
    showToast("⭐ Super Like envoyé !");
    try {
      await supabase.insert("swipes", {
        swiper_id: currentUser.id,
        swiped_id: p.id,
        direction: "superlike"
      });
      // Check if they already liked us → instant match
      const existing = await supabase.select("swipes",
        `?swiper_id=eq.${p.id}&swiped_id=eq.${currentUser.id}&direction=eq.like`);
      if (Array.isArray(existing) && existing.length > 0) {
        setMatchedProfile(p);
        setShowMatch(true);
        await supabase.upsert("matches", {
          user1_id: currentUser.id < p.id ? currentUser.id : p.id,
          user2_id: currentUser.id < p.id ? p.id : currentUser.id,
        });
        loadMatches();
      }
    } catch(e) { console.error("superlike:", e); }
  };

  const doDeleteMatch = async (matchId) => {
    if (!matchId || !currentUser) return;
    try {
      const token = localStorage.getItem("aura_token");
      // Delete messages first
      await fetch(`${SUPABASE_URL}/rest/v1/messages?match_id=eq.${matchId}`, {
        method: "DELETE",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
      });
      // Delete match
      await fetch(`${SUPABASE_URL}/rest/v1/matches?id=eq.${matchId}`, {
        method: "DELETE",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
      });
      setDbMatches(prev => prev.filter(m => m.matchId !== matchId));
      setOpenChat(null);
      setRealMsgs([]);
      showToast("Match supprimé");
    } catch(e) { showToast("❌ " + e.message.slice(0,40)); }
  };

  const doBlockUser = async (userId, matchId) => {
    if (!userId || !currentUser) return;
    try {
      const token = localStorage.getItem("aura_token");
      // Delete the match if exists
      if (matchId) await doDeleteMatch(matchId);
      // Delete swipes both ways
      await fetch(`${SUPABASE_URL}/rest/v1/swipes?swiper_id=eq.${currentUser.id}&swiped_id=eq.${userId}`, {
        method: "DELETE",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
      });
      // Remove from profiles list
      setProfiles(prev => prev.filter(p => p.id !== userId));
      setDbMatches(prev => prev.filter(m => m.id !== userId));
      setOpenChat(null);
      showToast("🚫 Utilisateur bloqué");
    } catch(e) { showToast("❌ " + e.message.slice(0,40)); }
  };

  const doRewind = async () => {
    if (!lastSwiped || !currentUser) { showToast("Rien à annuler"); return; }
    const { profile, direction } = lastSwiped;
    // Re-add profile at front
    setProfiles(prev => [profile, ...prev]);
    setLastSwiped(null);
    setCardPhotoIdx(0);
    // Delete the swipe from DB
    try {
      const token = localStorage.getItem("aura_token");
      await fetch(`${SUPABASE_URL}/rest/v1/swipes?swiper_id=eq.${currentUser.id}&swiped_id=eq.${profile.id}`, {
        method: "DELETE",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
      });
      // If it was a like, also delete potential match
      if (direction === "like") {
        const u1 = currentUser.id < profile.id ? currentUser.id : profile.id;
        const u2 = currentUser.id < profile.id ? profile.id : currentUser.id;
        await fetch(`${SUPABASE_URL}/rest/v1/matches?user1_id=eq.${u1}&user2_id=eq.${u2}`, {
          method: "DELETE",
          headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
        });
      }
      showToast("↩️ Annulé !");
    } catch(e) { showToast("❌ " + e.message.slice(0,40)); }
  };

  const sendMsg = () => {
    const matchId = activeMatchIdRef.current;
    if (!chatInput.trim() || !matchId) return;
    const txt = chatInput;
    setChatInput("");
    sendRealMsg(matchId, txt);
  };

  const chatConv = openChat || null;
  const shownProfiles = onlineOnly ? profiles.filter(p => p.online) : profiles;
  const cur = shownProfiles[0], nxt = shownProfiles[1], nn = shownProfiles[2];
  const likeOp = Math.max(0, Math.min(1, drag.x / 85));
  const nopeOp = Math.max(0, Math.min(1, -drag.x / 85));
  const cardStyle = drag.on
    ? { transform:`translate(${drag.x}px,${drag.y}px) rotate(${drag.x*0.07}deg)`, transition:"none" }
    : {};

  return (
    <>
      <style>{css}</style>
      <div className="shell">

        {/* FOND PHOTO-RÉALISTE */}
        <div className="bg-wrap">
          <div style={{position:"absolute",inset:0,zIndex:0,willChange:"contents"}}>
            {!openChat && <SceneBg sceneIndex={bgIdx} opacity={1} />}
            {!openChat && <SceneBg sceneIndex={bgNext} opacity={bgCrossfade ? 1 : 0} transition="opacity 1.8s ease" />}
            {!openChat && <div className="bg-overlay"/>}
          </div>
        </div>

        {/* ═══════════════════════════════════
            SPLASH
        ═══════════════════════════════════ */}
        {screen === "auth" && (
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",zIndex:10}}>
          <div style={{width:"100%",maxWidth:340}}>
            {/* Logo */}
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={{fontFamily:"Cormorant Garamond,serif",fontSize:52,fontWeight:700,background:"linear-gradient(135deg,#E8647A,#E8A050)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>aura</div>
              <div style={{color:"rgba(255,255,255,0.6)",fontSize:14,marginTop:4}}>Trouve ta personne ✨</div>
            </div>
            {/* Tabs */}
            <div style={{display:"flex",background:"rgba(255,255,255,0.08)",borderRadius:12,padding:4,marginBottom:24}}>
              {["login","register"].map(m=>(
                <button key={m} onClick={()=>{setAuthMode(m);setAuthError("");}}
                  style={{flex:1,padding:"10px 0",borderRadius:9,border:"none",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"Nunito,sans-serif",
                    background:authMode===m?"linear-gradient(135deg,#E8647A,#E8A050)":"transparent",
                    color:authMode===m?"white":"rgba(255,255,255,0.55)",transition:"all 0.2s"}}>
                  {m==="login"?"Se connecter":"S'inscrire"}
                </button>
              ))}
            </div>
            {/* Fields */}
            {authMode==="register" && (
              <div style={{marginBottom:14}}>
                <input value={authName} onChange={e=>setAuthName(e.target.value)}
                  placeholder="Ton prénom" type="text"
                  style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"white",fontSize:15,fontFamily:"Nunito,sans-serif",outline:"none",boxSizing:"border-box"}}/>
              </div>
            )}
            <div style={{marginBottom:14}}>
              <input value={authEmail} onChange={e=>setAuthEmail(e.target.value)}
                placeholder="Email" type="email"
                style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"white",fontSize:15,fontFamily:"Nunito,sans-serif",outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:20}}>
              <input value={authPassword} onChange={e=>setAuthPassword(e.target.value)}
                placeholder="Mot de passe" type="password"
                onKeyDown={e=>e.key==="Enter"&&handleAuth()}
                style={{width:"100%",padding:"14px 16px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.08)",color:"white",fontSize:15,fontFamily:"Nunito,sans-serif",outline:"none",boxSizing:"border-box"}}/>
            </div>
            {authError && <div style={{color:"#ff6b6b",fontSize:13,marginBottom:14,textAlign:"center",padding:"8px 12px",background:"rgba(255,80,80,0.1)",borderRadius:8}}>{authError}</div>}
            <button onClick={handleAuth} disabled={authLoading}
              style={{width:"100%",padding:"15px",borderRadius:12,border:"none",cursor:authLoading?"not-allowed":"pointer",
                background:"linear-gradient(135deg,#E8647A,#E8A050)",color:"white",fontSize:16,fontWeight:700,fontFamily:"Nunito,sans-serif",
                opacity:authLoading?0.7:1,transition:"opacity 0.2s"}}>
              {authLoading ? "..." : authMode==="login" ? "Se connecter" : "Créer mon compte"}
            </button>
            <div style={{textAlign:"center",marginTop:20,color:"rgba(255,255,255,0.35)",fontSize:12}}>
              En continuant tu acceptes nos CGU
            </div>
          </div>
        </div>
      )}

      {screen === "splash" && (
          <div className="screen">
            <div className="splash">
              {/* status bar haut */}


              {/* Logo centré */}
              <div className="splash-logo">Aura</div>
              <div className="splash-tag">Find your spark</div>

              {/* Pills features */}
              <div className="splash-pills">
                <div className="splash-pill">✨ Matching IA</div>
                <div className="splash-pill">🎤 Message vocal</div>
                <div className="splash-pill">🎬 Vidéo 10s</div>
                <div className="splash-pill">🛡️ Profils vérifiés</div>
              </div>

              <div className="splash-divider"/>

              {/* CTAs */}
              <button className="btn-primary" onClick={() => setScreen("auth")}>
                Commencer gratuitement ✦
              </button>
              <button className="btn-ghost" onClick={() => { setScreen("auth"); setAuthMode("login"); }}>
                J'ai déjà un compte
              </button>

              <div className="splash-footnote">
                2 millions de membres · 150 000 couples formés
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════
            APP PRINCIPALE
        ═══════════════════════════════════ */}
        {screen === "app" && (
          <div className={`screen${openChat ? " chat-mode" : ""}`}>


            {/* ── DISCOVER ── */}
            {tab === "discover" && (
              <div className="discover">
                <div className="disc-header">
                  <div className="logo">Aura</div>
                  <div style={{ display:"flex", gap:10 }}>
                    <div className="icon-btn" onClick={() => setShowFilters(true)}>⚙️</div>
                    <div className="icon-btn" onClick={() => { setShowLikesPanel(true); loadLikesReceived(); }} style={{position:"relative"}}>
                      🔔
                      {newLikes > 0 && <div style={{position:"absolute",top:-4,right:-4,background:"#E8647A",borderRadius:"50%",width:16,height:16,fontSize:10,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{newLikes}</div>}
                    </div>
                  </div>
                </div>

                <div className="card-stack" onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU} onTouchStart={onTD} onTouchMove={onTM} onTouchEnd={onTU}>
                  {nn && <div className="pcard bcard2" style={{ backgroundImage:`url(${(nn.photos&&nn.photos[0])||nn.photo})`, backgroundSize:"cover", backgroundPosition:"center", backgroundColor:"#111828" }}><div className="pcard-grad"/></div>}
                  {nxt && <div className="pcard bcard1" style={{ backgroundImage:`url(${(nxt.photos&&nxt.photos[0])||nxt.photo})`, backgroundSize:"cover", backgroundPosition:"center", backgroundColor:"#111828" }}><div className="pcard-grad"/></div>}

                  {cur ? (
                    <div className="pcard fcard"
                      style={{ backgroundImage:`url(${(cur.photos && cur.photos[cardPhotoIdx]) || cur.photo})`, backgroundSize:"cover", backgroundPosition:"center", backgroundColor:"#111828", ...cardStyle }}
                      onMouseDown={onMD} onTouchStart={onTD}
                    >
                      {/* Photo dots + tap zones */}
                      {cur.photos && cur.photos.length > 1 && (
                        <>
                          <div style={{position:"absolute",top:10,left:0,right:0,display:"flex",justifyContent:"center",gap:4,zIndex:5,pointerEvents:"none"}}>
                            {cur.photos.map((_,i) => (
                              <div key={i} style={{height:3,borderRadius:2,background:i===cardPhotoIdx?"#fff":"rgba(255,255,255,0.4)",flex:i===cardPhotoIdx?2:1,transition:"all .2s"}}/>
                            ))}
                          </div>
                          <div style={{position:"absolute",top:0,left:0,width:"40%",height:"70%",zIndex:6}} onClick={e=>{e.stopPropagation();setCardPhotoIdx(i=>Math.max(0,i-1));}}/>
                          <div style={{position:"absolute",top:0,right:0,width:"40%",height:"70%",zIndex:6}} onClick={e=>{e.stopPropagation();setCardPhotoIdx(i=>Math.min((cur.photos.length-1),i+1));}}/>
                        </>
                      )}
                      <div className="pcard-grad"/>
                      <div className="swipe-ov like" style={{ opacity:likeOp }}><div className="swipe-lbl like">LIKE ✓</div></div>
                      <div className="swipe-ov nope" style={{ opacity:nopeOp }}><div className="swipe-lbl nope">NOPE ✗</div></div>

                      <div className="pcard-top">
                        <div className="match-badge">❤️ {cur.match}%</div>
                        <div className="pcard-badges">
                          {cur.verified && <div className="badge-verified">✅ Vérifié</div>}
                          {cur.premium && <div className="badge-premium">⭐ Premium</div>}
                        </div>
                      </div>

                      {/* Badges médias */}
                      <div style={{ position:"absolute", bottom:96, left:16, right:16, display:"flex", gap:8 }}>
                        {cur.hasVoice && (
                          <div className="media-badge voice" onClick={e => { e.stopPropagation(); setMediaPlayer({ profile:cur, type:"voice" }); }}>
                            🎤 Message vocal
                          </div>
                        )}
                        {cur.hasVideo && (
                          <div className="media-badge video" onClick={e => { e.stopPropagation(); setMediaPlayer({ profile:cur, type:"video" }); }}>
                            🎬 Vidéo 10s
                          </div>
                        )}
                      </div>

                      <div className="pcard-body">
                        <div className="pcard-name-row" onClick={() => setViewProfile(cur)} style={{cursor:"pointer"}}>
                          <div className="pcard-name">{cur.name}</div>
                          <div className="pcard-age">{cur.age}</div>
                          <span style={{marginLeft:"auto",fontSize:18,opacity:0.7}}>ⓘ</span>
                        </div>
                        <div className="pcard-job">💼 {cur.job} · {cur.city}{cur.distance ? ` · 📍${cur.distance}km` : ""}</div>
                        <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
                          {cur.hasVoice && <div onClick={() => setViewProfile({...cur, playVoice:true})} style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"4px 12px",fontSize:12,cursor:"pointer"}}>🎵 Écouter</div>}
                          {cur.hasVideo && <div onClick={() => setViewProfile({...cur, playVideo:true})} style={{background:"rgba(255,255,255,0.15)",borderRadius:20,padding:"4px 12px",fontSize:12,cursor:"pointer"}}>▶ Vidéo</div>}
                        </div>
                        <div className="pcard-tags">{cur.interests.map(t => <span key={t} className="ptag">{t}</span>)}</div>
                        <div className="pcard-dist">📍 {cur.distance}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <div className="empty-icon">✨</div>
                      <div className="empty-title">C'est tout pour aujourd'hui</div>
                      <div className="empty-sub">Reviens demain pour découvrir de nouveaux profils près de toi.</div>
                      <div className="empty-link" onClick={doUndo}>🔄 Recommencer la démo</div>
                    </div>
                  )}
                </div>

                <div className="actions">
                  <div className="act-btn act-pass" onClick={doPass}>✕</div>
                  <div className="act-btn act-undo" onClick={doRewind} style={{opacity: lastSwiped ? 1 : 0.3}}>↩</div>
                  <div className="act-btn act-like" onClick={doLike}>♥</div>
                  <div className="act-btn act-star" onClick={doSuperLike}>⭐</div>
                  <div className="act-btn act-boost" onClick={() => showToast("🚀 Boost activé !")}>⚡</div>
                </div>
              </div>
            )}

            {/* ── MESSAGES ── */}
            {tab === "messages" && !openChat && (
              <div className="messages">
                <div className="sec-header" style={{ paddingTop:8 }}>
                  <div className="sec-title">Messages</div>
                  <div className="icon-btn">✏️</div>
                </div>
                <div className="stories">
                  {dbMatches.length === 0 && (
                    <div style={{color:"var(--muted)",fontSize:13,padding:"8px 4px",opacity:0.7}}>
                      Tes matchs apparaîtront ici ✨
                    </div>
                  )}
                  {dbMatches.map(p => (
                    <div key={p.id} className="story" onClick={() => { setOpenChat(p); loadMessages(p.matchId); }}>
                      <div className="story-ring">
                        <div className="story-inner">
                          <div style={{width:"100%",height:"100%",backgroundImage:p.photo?`url(${p.photo})`:"none",backgroundSize:"cover",backgroundPosition:"center",backgroundColor:"#2a2f45",borderRadius:"50%"}}/>
                        </div>
                      </div>
                      <span className="story-name">{p.name}</span>
                    </div>
                  ))}
                </div>
                <div className="conv-list">
                  {dbMatches.map(c => (
                    <div key={c.id} className="conv" onClick={() => { setOpenChat(c); loadMessages(c.matchId); }}>
                      <div className="conv-av-wrap">
                        <div className="conv-av" style={{backgroundImage:c.photo?`url(${c.photo})`:"none",backgroundSize:"cover",backgroundPosition:"center",backgroundColor:"#2a2f45"}}/>
                        {c.online && <div className="online-dot"/>}
                      </div>
                      <div className="conv-info">
                        <div className="conv-name-row">
                          <span className="conv-name">{c.name}</span>
                          <span className="conv-time">{c.time}</span>
                        </div>
                        <div className="conv-preview">{c.lastMsg}</div>
                      </div>
                      {c.unread > 0 && <div className="conv-unread">{c.unread}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CHAT ── */}
            {tab === "messages" && openChat && chatConv && (
              <div className="chat">
                <div className="chat-header">
                  <div className="chat-back" onClick={() => { setOpenChat(null); setRealMsgs([]); setShowChatMenu(false); }}>←</div>
                  <div ref={chatAvRef} className="chat-av" onClick={() => setViewProfile(chatConv)}
                     style={{
                       cursor:"pointer",
                       backgroundImage: chatConv.photo ? `url(${chatConv.photo})` : "none",
                       backgroundSize:"cover",
                       backgroundPosition:"center",
                       backgroundColor:"#2a2f45",
                       flexShrink:0,
                     }}/>
                  <div className="chat-hinfo" onClick={() => setViewProfile(chatConv)} style={{cursor:"pointer"}}>
                    <div className="chat-hname">{chatConv.name}</div>
                    <div className="chat-hstatus">{chatConv.online ? "● En ligne" : "Hors ligne"}</div>
                  </div>
                  <div className="chat-hmore" onClick={() => setShowChatMenu(m => !m)} style={{cursor:"pointer",position:"relative"}}>
                    ⋯
                    {showChatMenu && (
                      <div style={{position:"absolute",top:36,right:0,background:"#1a1f35",borderRadius:14,padding:8,minWidth:190,zIndex:100,boxShadow:"0 8px 32px rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.1)"}}>
                        <div onClick={e => { e.stopPropagation(); setShowChatMenu(false); setConfirmAction({ label:`Supprimer le match avec ${chatConv.name} ?`, onConfirm: () => doDeleteMatch(chatConv.matchId) }); }}
                          style={{padding:"13px 16px",color:"#ff6b6b",fontSize:15,cursor:"pointer",borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
                          🗑️ Supprimer le match
                        </div>
                        <div onClick={e => { e.stopPropagation(); setShowChatMenu(false); setConfirmAction({ label:`Bloquer ${chatConv.name} ?`, onConfirm: () => doBlockUser(chatConv.id, chatConv.matchId) }); }}
                          style={{padding:"13px 16px",color:"#ff9f43",fontSize:15,cursor:"pointer",borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
                          🚫 Bloquer
                        </div>
                        <div onClick={e => { e.stopPropagation(); setShowChatMenu(false); }}
                          style={{padding:"13px 16px",color:"rgba(255,255,255,0.4)",fontSize:15,cursor:"pointer",borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
                          ✕ Annuler
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="chat-msgs">
                  {chatLoading && <div style={{textAlign:"center",color:"rgba(255,255,255,0.4)",padding:20}}>Chargement...</div>}
                  {!chatLoading && realMsgs.length === 0 && (
                    <div style={{textAlign:"center",color:"rgba(255,255,255,0.4)",padding:20,fontSize:13}}>
                      Dis bonjour à {openChat?.name} ! 👋
                    </div>
                  )}
                  {realMsgs.map((m, i) => {
                    const isMe = m.sender_id === currentUser?.id;
                    const t = new Date(m.created_at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
                    return (
                      <div key={m.id || i}>
                        <div className={`msg-row ${isMe?"me":"them"}`}>
                          <div className={`bubble ${isMe?"me":"them"}`}>{m.text || m.content}</div>
                        </div>
                        <div className={`msg-row ${isMe?"me":"them"}`}>
                          <div className="btime">{t}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="chat-bar">
                  <textarea className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Écris un message..." rows={1}
                    onKeyDown={e => { if (e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg();}}}
                  />
                  <div className="send-btn" onClick={sendMsg}>➤</div>
                </div>
              </div>
            )}

            {/* ── PROFIL ── */}
            {tab === "premium" && (
              <div style={{
                flex:1, overflowY:"auto", padding:"24px 20px",
                display:"flex", flexDirection:"column", gap:16,
              }}>
                {/* Header */}
                <div style={{textAlign:"center", padding:"20px 0 10px"}}>
                  <div style={{fontSize:48, marginBottom:8}}>👑</div>
                  <div style={{fontSize:24, fontWeight:700, color:"#fff", marginBottom:6}}>Aura Premium</div>
                  <div style={{fontSize:14, color:"rgba(255,255,255,0.6)"}}>Débloquez toutes les fonctionnalités</div>
                </div>

                {/* Features */}
                {[
                  { icon:"♾️", title:"Likes illimités", desc:"Swipez sans limite chaque jour" },
                  { icon:"👀", title:"Voir qui vous a liké", desc:"Accédez à la liste complète" },
                  { icon:"⚡", title:"Boost de profil", desc:"Soyez vu 10x plus souvent" },
                  { icon:"🔄", title:"Retour en arrière", desc:"Revenez sur un profil passé" },
                  { icon:"🌍", title:"Filtres avancés", desc:"Âge, distance, centres d'intérêt" },
                  { icon:"✅", title:"Badge vérifié", desc:"Inspirez confiance aux autres" },
                ].map((f,i) => (
                  <div key={i} style={{
                    background:"rgba(255,255,255,0.05)", borderRadius:16,
                    padding:"16px", display:"flex", alignItems:"center", gap:14,
                    border:"1px solid rgba(255,255,255,0.08)",
                  }}>
                    <div style={{fontSize:28, minWidth:40, textAlign:"center"}}>{f.icon}</div>
                    <div>
                      <div style={{fontSize:15, fontWeight:600, color:"#fff"}}>{f.title}</div>
                      <div style={{fontSize:13, color:"rgba(255,255,255,0.5)", marginTop:2}}>{f.desc}</div>
                    </div>
                    <div style={{marginLeft:"auto", color:"#E8A050"}}>✓</div>
                  </div>
                ))}

                {/* Plans */}
                <div style={{marginTop:8}}>
                  <div style={{fontSize:16, fontWeight:600, color:"#fff", marginBottom:12}}>Choisissez votre plan</div>
                  {[
                    { label:"1 mois", price:"19.99€", per:"mois", popular:false },
                    { label:"6 mois", price:"11.99€", per:"mois", popular:true, total:"71.94€" },
                    { label:"12 mois", price:"7.99€", per:"mois", popular:false, total:"95.88€" },
                  ].map((plan,i) => (
                    <div key={i} onClick={() => showToast("💳 Paiement bientôt disponible !")} style={{
                      background: plan.popular ? "linear-gradient(135deg,#E8647A,#E8A050)" : "rgba(255,255,255,0.05)",
                      borderRadius:14, padding:"14px 18px", marginBottom:10,
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      border: plan.popular ? "none" : "1px solid rgba(255,255,255,0.1)",
                      cursor:"pointer", position:"relative",
                    }}>
                      {plan.popular && <div style={{
                        position:"absolute", top:-8, right:12,
                        background:"#fff", color:"#E8647A", fontSize:10,
                        fontWeight:700, borderRadius:20, padding:"2px 8px",
                      }}>POPULAIRE</div>}
                      <div>
                        <div style={{fontSize:15, fontWeight:600, color:"#fff"}}>{plan.label}</div>
                        {plan.total && <div style={{fontSize:12, color:"rgba(255,255,255,0.7)"}}>soit {plan.total} facturé d'un coup</div>}
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:20, fontWeight:700, color:"#fff"}}>{plan.price}</div>
                        <div style={{fontSize:11, color:"rgba(255,255,255,0.7)"}}>/{plan.per}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.3)", paddingBottom:20}}>
                  Résiliable à tout moment • Sans engagement
                </div>
              </div>
            )}
            {tab === "profile" && (
              <div className="profile-scr">
                <div className="profile-cover" style={{position:"relative"}}>
                  <img src={coverUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"} alt="cover" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <div className="cover-ov"/>
                  <label style={{
                    position:"absolute",top:12,right:12,
                    background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",
                    borderRadius:20,padding:"6px 12px",
                    color:"white",fontSize:12,fontWeight:600,cursor:"pointer",
                    border:"1px solid rgba(255,255,255,0.2)"
                  }}>
                    📷 Couverture
                    <input type="file" accept="image/*" style={{display:"none"}}
                           onChange={e => e.target.files[0] && uploadCover(e.target.files[0])}/>
                  </label>
                </div>
                <div className="profile-av-row">
                  <div style={{position:"relative",display:"inline-block"}}>
                    <img className="profile-av" 
                         src={avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80"} 
                         alt="me"
                         style={{width:88,height:88,borderRadius:"50%",objectFit:"cover",border:"3px solid var(--rose)"}}/>
                    <label style={{
                      position:"absolute",bottom:0,right:0,
                      background:"var(--rose)",borderRadius:"50%",
                      width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:"pointer",fontSize:14,border:"2px solid #111"
                    }}>
                      {avatarUploading ? "⏳" : "📷"}
                      <input type="file" accept="image/*" style={{display:"none"}}
                             onChange={e => e.target.files[0] && uploadAvatar(e.target.files[0])}/>
                    </label>
                  </div>
                  <button className="edit-btn" onClick={() => setEditingProfile(true)}>✏️ Modifier</button>
                </div>
                {/* ── MULTI PHOTO GRID ── */}
                <div style={{padding:"0 20px 16px",display:"flex",gap:8}}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      flex:1, aspectRatio:"1", borderRadius:16,
                      background:"rgba(255,255,255,0.06)",
                      border:"1.5px dashed rgba(255,255,255,0.15)",
                      position:"relative", overflow:"hidden",
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                      {profilePhotos[i] ? (
                        <>
                          <img src={profilePhotos[i]} style={{width:"100%",height:"100%",objectFit:"cover"}} alt={`photo${i}`}/>
                          <div onClick={() => removeExtraPhoto(i)} style={{
                            position:"absolute",top:4,right:4,
                            background:"rgba(0,0,0,0.6)",borderRadius:"50%",
                            width:22,height:22,display:"flex",alignItems:"center",
                            justifyContent:"center",fontSize:12,cursor:"pointer",color:"#fff",
                          }}>✕</div>
                          {i === 0 && <div style={{position:"absolute",bottom:4,left:4,background:"var(--rose)",borderRadius:8,padding:"2px 6px",fontSize:10,fontWeight:700,color:"#fff"}}>principale</div>}
                        </>
                      ) : (
                        <label style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexDirection:"column",gap:4}}>
                          <span style={{fontSize:24,opacity:0.4}}>+</span>
                          <span style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>Photo {i+1}</span>
                          <input type="file" accept="image/*" style={{display:"none"}} onChange={e => e.target.files[0] && uploadExtraPhoto(e.target.files[0])}/>
                        </label>
                      )}
                    </div>
                  ))}
                </div>

                <div className="profile-names">
                  <div className="pname">{profileName || "Ton prénom"}{profileAge ? `, ${profileAge}` : ""}</div>
                  <div className="ptag2">{profileJob ? `💼 ${profileJob}` : ""}{profileJob && profileCity ? " · " : ""}{profileCity || ""}</div>
                  {profileBio && <div style={{fontSize:13,color:"var(--muted)",marginTop:4,padding:"0 16px",textAlign:"center"}}>{profileBio}</div>}
                </div>
                <div className="pstats">
                  <div className="pstat"><div className="pstat-n">247</div><div className="pstat-l">Likes</div></div>
                  <div className="pstat"><div className="pstat-n">18</div><div className="pstat-l">Matchs</div></div>
                  <div className="pstat"><div className="pstat-n">94%</div><div className="pstat-l">Profil</div></div>
                </div>

                {/* Modal édition profil */}
                {editingProfile && (
                  <div style={{
                    position:"fixed",inset:0,zIndex:100,
                    background:"rgba(0,0,0,0.85)",
                    display:"flex",flexDirection:"column",
                    alignItems:"center",justifyContent:"center",
                    padding:"24px"
                  }}>
                    <div style={{
                      background:"var(--navy-mid)",borderRadius:20,
                      padding:"24px",width:"100%",maxWidth:360,
                      border:"1px solid var(--border)"
                    }}>
                      <div style={{fontSize:18,fontWeight:700,color:"white",marginBottom:20,textAlign:"center"}}>
                        ✏️ Mon profil
                      </div>
                      {[
                        {label:"Prénom",val:profileName,set:setProfileName,placeholder:"Ton prénom"},
                        {label:"Âge",val:profileAge,set:setProfileAge,placeholder:"25",type:"number"},
                        {label:"Ville",val:profileCity,set:setProfileCity,placeholder:"Paris"},
                        {label:"Métier",val:profileJob,set:setProfileJob,placeholder:"Designer, Dev..."},
                      ].map(({label,val,set,placeholder,type}) => (
                        <div key={label} style={{marginBottom:14}}>
                          <div style={{fontSize:12,color:"var(--muted)",marginBottom:4,fontWeight:600}}>{label}</div>
                          <input
                            type={type||"text"}
                            value={val}
                            onChange={e => set(e.target.value)}
                            placeholder={placeholder}
                            style={{
                              width:"100%",padding:"12px 14px",
                              background:"rgba(255,255,255,0.08)",
                              border:"1px solid var(--border)",
                              borderRadius:10,color:"white",fontSize:15,
                              outline:"none"
                            }}
                          />
                        </div>
                      ))}
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:12,color:"var(--muted)",marginBottom:4,fontWeight:600}}>Bio</div>
                        <textarea
                          value={profileBio}
                          onChange={e => setProfileBio(e.target.value)}
                          placeholder="Dis quelque chose sur toi..."
                          rows={3}
                          style={{
                            width:"100%",padding:"12px 14px",
                            background:"rgba(255,255,255,0.08)",
                            border:"1px solid var(--border)",
                            borderRadius:10,color:"white",fontSize:15,
                            outline:"none",resize:"none"
                          }}
                        />
                      </div>
                      <div style={{display:"flex",gap:10,marginTop:8}}>
                        <button onClick={() => setEditingProfile(false)} style={{
                          flex:1,padding:"12px",borderRadius:12,border:"1px solid var(--border)",
                          background:"transparent",color:"var(--muted)",fontSize:14,cursor:"pointer"
                        }}>Annuler</button>
                        <button onClick={saveProfile} style={{
                          flex:2,padding:"12px",borderRadius:12,border:"none",
                          background:"linear-gradient(135deg,var(--rose),var(--amber))",
                          color:"white",fontSize:14,fontWeight:700,cursor:"pointer"
                        }}>Enregistrer</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Section enregistrement */}
                <div className="rec-section">
                  <div className="rec-title">🎙️ Présentation multimédia <span style={{ fontSize:11, color:"var(--muted)", fontWeight:400 }}>nouveauté</span></div>
                  <div className="rec-cards">
                    <div className={`rec-card ${recHas.voice ? "has-rec" : ""}`} onClick={() => startRec("voice")}>
                      {recHas.voice && <div className="rec-indicator"/>}
                      <div className="rec-icon">🎤</div>
                      <div className="rec-lbl">Message vocal</div>
                      <div className="rec-sub">{recHas.voice ? "✓ Enregistré" : "10 secondes"}</div>
                    </div>
                    <div className={`rec-card ${recHas.video ? "has-rec" : ""}`}
                      onClick={() => recHas.video ? setShowPlayer("video") : startRec("video")}>
                      {recHas.video && <div className="rec-indicator"/>}
                      <div className="rec-icon">🎬</div>
                      <div className="rec-lbl">Vidéo courte</div>
                      <div className="rec-sub">{recHas.video ? "▶ Visionner" : "10 secondes"}</div>
                    </div>
                  </div>
                </div>

                <div className="psection">
                  <div className="psection-title">Mes intérêts</div>
                  <div className="itags">
                    {["🎵 Musique","✈️ Voyage","🏃 Running","🎬 Cinéma","📚 Tech","🍕 Cuisine"].map(t => (
                      <span key={t} className="itag">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="psection">
                  <div className="psection-title">Paramètres</div>
                  {[
                    { icon:"🔔", lbl:"Notifications", toggle:true, on:true },
                    { icon:"🌍", lbl:"Visibilité du profil", toggle:true, on:true },
                    { icon:"📍", lbl:"Géolocalisation", toggle:true, on:false },
                    { icon:"🛡️", lbl:"Confidentialité & RGPD", arrow:true },
                    { icon:"💳", lbl:"Abonnement Premium", arrow:true },
                  ].map((s,i) => (
                    <div key={i} className="setting" onClick={() => s.arrow && showToast(`Ouvre ${s.lbl}`)}>
                      <div className="setting-l">
                        <span className="setting-icon">{s.icon}</span>
                        <span style={{ fontSize:14, fontWeight:600 }}>{s.lbl}</span>
                      </div>
                      {s.toggle && <div className={`toggle ${s.on?"":"off"}`}/>}
                      {s.arrow && <span style={{ color:"var(--dim)" }}>›</span>}
                    </div>
                  ))}
                </div>

                {/* Bouton déconnexion */}
                <div style={{ padding:"16px 20px 32px" }}>
                  <button onClick={async () => {
                    try { await supabase.auth.signOut(); } catch(e) {}
                    localStorage.removeItem("aura_token");
                    localStorage.removeItem("aura_user_id");
                    setCurrentUser(null);
                    setProfileName(""); setProfileAge(""); setProfileCity("");
                    setProfileBio(""); setProfileJob(""); setAvatarUrl(null); setCoverUrl(null);
                    setDbMatches([]); setMsgs(MESSAGES_DATA);
                    setScreen("splash");
                  }} style={{
                    width:"100%", padding:"14px",
                    borderRadius:14, border:"1px solid rgba(232,100,122,0.35)",
                    background:"rgba(232,100,122,0.08)",
                    color:"#E8647A", fontSize:15, fontWeight:700,
                    cursor:"pointer", letterSpacing:"0.5px"
                  }}>
                    🚪 Se déconnecter
                  </button>
                  <button onClick={seedFakeProfiles} style={{
                    width:"100%", padding:"14px", borderRadius:16,
                    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                    color:"rgba(255,255,255,0.6)", fontSize:14, cursor:"pointer", marginTop:8,
                  }}>
                    🧪 Ajouter profils de test
                  </button>
                  <button onClick={setupPushNotifications} style={{
                    width:"100%", padding:"14px", borderRadius:16,
                    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
                    color:"rgba(255,255,255,0.6)", fontSize:14, cursor:"pointer", marginTop:8,
                  }}>
                    🔔 Activer les notifications
                  </button>
                </div>

              </div>
            )}

            {/* ── LIKES RECEIVED PANEL ── */}
            {showLikesPanel && (
              <div style={{position:"absolute",inset:0,zIndex:40,background:"#0a0e1a",display:"flex",flexDirection:"column",overflow:"hidden"}}>
                {/* Header */}
                <div style={{padding:"16px 20px 12px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                  <div onClick={() => setShowLikesPanel(false)} style={{fontSize:22,cursor:"pointer",color:"#E8647A",padding:4}}>←</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:20,fontWeight:700,color:"#fff",fontFamily:"'Cormorant Garamond',serif"}}>Qui vous a liké</div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.4)"}}>{likesReceived.length} personne{likesReceived.length!==1?"s":""}</div>
                  </div>
                  <div style={{background:"linear-gradient(135deg,#E8647A,#E8A050)",borderRadius:12,padding:"6px 14px",fontSize:13,fontWeight:700,color:"#fff"}}>
                    💛 {likesReceived.length}
                  </div>
                </div>
                {/* Grid */}
                <div style={{flex:1,overflowY:"auto",padding:16,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {likesReceived.length === 0 && (
                    <div style={{gridColumn:"1/-1",textAlign:"center",color:"rgba(255,255,255,0.3)",padding:60,fontSize:14}}>
                      Personne ne vous a liké encore 😔<br/>Continuez à swiper !
                    </div>
                  )}
                  {likesReceived.map(p => (
                    <div key={p.id} onClick={() => setViewProfile(p)} style={{borderRadius:20,overflow:"hidden",position:"relative",aspectRatio:"3/4",cursor:"pointer",background:"#1a1f35"}}>
                      {p.photo
                        ? <img src={p.photo} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#E8647A,#E8A050)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:48}}>{p.name[0]}</div>
                      }
                      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 50%)"}}/>
                      <div style={{position:"absolute",bottom:10,left:10,right:10}}>
                        <div style={{color:"#fff",fontWeight:700,fontSize:16}}>{p.name}{p.age ? `, ${p.age}` : ""}</div>
                        {p.city && <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>📍 {p.city}</div>}
                      </div>
                      <div style={{position:"absolute",top:8,right:8,background:"rgba(232,100,122,0.9)",borderRadius:"50%",width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>💛</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── CONFIRM MODAL ── */}
            {confirmAction && (
              <div style={{position:"absolute",inset:0,zIndex:500,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"flex-end",padding:"0 0 40px"}}>
                <div style={{width:"100%",background:"#1a1f35",borderRadius:"24px 24px 0 0",padding:24}}>
                  <div style={{fontSize:16,color:"#fff",fontWeight:600,textAlign:"center",marginBottom:24,lineHeight:1.4}}>
                    {confirmAction.label}
                  </div>
                  <div style={{display:"flex",gap:12}}>
                    <button onClick={() => setConfirmAction(null)} style={{flex:1,padding:14,borderRadius:14,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff",fontSize:15,cursor:"pointer",fontWeight:600}}>
                      Annuler
                    </button>
                    <button onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} style={{flex:1,padding:14,borderRadius:14,background:"linear-gradient(135deg,#ff6b6b,#ff4444)",border:"none",color:"#fff",fontSize:15,cursor:"pointer",fontWeight:700}}>
                      Confirmer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* BOTTOM NAV */}
            <div className="bottom-nav">
              {[
                { id:"discover", icon:"✦", lbl:"Découvrir" },
                { id:"messages", icon:"💬", lbl:"Messages", badge:3 },
                { id:"premium",  icon:"👑", lbl:"Premium" },
                { id:"profile",  icon:"👤", lbl:"Profil" },
              ].map(t => (
                <div key={t.id} className={`nav-item ${tab===t.id?"active":""}`}
                  onClick={() => { setTab(t.id); if (t.id!=="messages") setOpenChat(null); if (t.id==="discover") setNewLikes(0); }}>
                  {t.badge && tab!=="messages" && <div className="nav-badge">{t.badge}</div>}
                  {t.likeBadge > 0 && <div className="nav-badge" style={{background:"#E8A050"}}>{t.likeBadge}</div>}
                  <div className="nav-icon">{t.icon}</div>
                  <div className="nav-label">{t.lbl}</div>
                </div>
              ))}
            </div>

            {/* ── LECTEUR MEDIA ── */}
            {showPlayer && (
              <div style={{
                position:"fixed",inset:0,zIndex:300,
                background:"rgba(10,15,30,0.97)",
                display:"flex",flexDirection:"column",
                alignItems:"center",justifyContent:"center",
                padding:"24px"
              }}>
                <div style={{fontSize:36,marginBottom:16}}>
                  {showPlayer === "voice" ? "🎤" : "🎬"}
                </div>
                <div style={{fontSize:20,fontWeight:700,color:"white",marginBottom:24,fontFamily:"'Cormorant Garamond',serif"}}>
                  {showPlayer === "voice" ? "Mon message vocal" : "Ma vidéo"}
                </div>
                {showPlayer === "voice" && audioUrlRef.current && (
                  <audio controls src={audioSrcUrl}
                    style={{width:"100%",maxWidth:320,borderRadius:12}}
                    autoPlay
                  />
                )}
                {showPlayer === "video" && videoPreviewUrl && (
                  <video controls src={videoPreviewUrl} playsInline autoPlay
                    style={{width:"100%",maxWidth:320,borderRadius:16,background:"#000",maxHeight:400}}
                  />
                )}
                <div style={{display:"flex",gap:12,marginTop:28,width:"100%",maxWidth:320}}>
                  <button onClick={() => { const t = showPlayer; setShowPlayer(null); startRec(t); }} style={{
                    flex:1,padding:"12px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",
                    background:"transparent",color:"white",fontSize:13,cursor:"pointer"
                  }}>🔄 Refaire</button>
                  <button onClick={() => {
                    const blob = audioBlobRef.current;
                    const t = showPlayer;
                    setShowPlayer(null);
                    if (blob) uploadRecording(blob, t);
                  }} style={{
                    flex:2,padding:"12px",borderRadius:12,border:"none",
                    background:"linear-gradient(135deg,#E8647A,#E8A050)",
                    color:"white",fontSize:14,fontWeight:700,cursor:"pointer"
                  }}>✓ Garder</button>
                </div>
              </div>
            )}

            {/* ── ENREGISTREMENT EN COURS ── */}
            {recording && (
              <div className="recording-overlay">
                <div className="rec-pulse">{recording.type==="voice" ? "🎤" : "🎬"}</div>
                <div className="rec-status">
                  {recording.type==="voice" ? "Enregistrement vocal" : "Enregistrement vidéo"}
                </div>
                <div className="rec-timer">{(10 - recording.elapsed).toFixed(1)}s</div>
                <div className="rec-hint">
                  {recording.type==="voice" ? "Présentez-vous en quelques mots…" : "Regardez la caméra et souriez…"}
                </div>
                <div className="rec-progress">
                  <div className="rec-progress-fill" style={{ width:`${(recording.elapsed/10)*100}%` }}/>
                </div>
                <button className="rec-stop" onClick={() => stopRec()}>⏹ Arrêter</button>
              </div>
            )}

            {/* ── LECTEUR MÉDIA (voice/video) ── */}
            {mediaPlayer && (
              <div className="media-overlay">
                <img className="media-avatar" src={mediaPlayer.profile.photo} alt={mediaPlayer.profile.name}/>
                <div className="media-name">{mediaPlayer.profile.name}</div>
                <div className="media-sub">
                  {mediaPlayer.type==="voice" ? "🎤 Message vocal • 10 sec" : "🎬 Vidéo de présentation • 10 sec"}
                </div>

                {mediaPlayer.type === "voice" && (
                  <div className="voice-player">
                    <div className="voice-bars">
                      {Array.from({length:28}).map((_,i) => (
                        <div key={i} className="vbar" style={{
                          height: `${20 + Math.sin(i*0.7)*14 + Math.random()*12}px`,
                          animationDelay:`${i*0.04}s`,
                          animationPlayState: playing ? "running" : "paused",
                          opacity: playing ? 1 : 0.35,
                        }}/>
                      ))}
                    </div>
                    <div className="voice-controls">
                      <div className="play-btn" onClick={playing ? stopPlay : startPlay}>
                        {playing ? "⏸" : "▶"}
                      </div>
                      <div className="voice-progress">
                        <div className="voice-fill" style={{ width:`${playProg}%` }}/>
                      </div>
                      <span className="voice-time">{playing ? `${(playProg/10).toFixed(1)}s` : "0:10"}</span>
                    </div>
                  </div>
                )}

                {mediaPlayer.type === "video" && (
                  <div className="video-player">
                    <div className="video-placeholder">
                      <div className="video-icon">▶️</div>
                      <div className="video-label">VIDÉO DE PRÉSENTATION</div>
                      <div style={{ fontSize:12, color:"var(--muted)" }}>{mediaPlayer.profile.name} • 10 secondes</div>
                    </div>
                    <div className="video-duration">0:10</div>
                  </div>
                )}

                <button className="media-close" onClick={() => { setMediaPlayer(null); stopPlay(); }}>
                  Fermer
                </button>
              </div>
            )}

            {/* ── FILTRES ── */}
            {showFilters && (
              <div className="filters-ov">
                <div className="filters-handle"/>
                <div className="filters-title">Affiner la recherche</div>
                <div className="filters-body">
                  <div className="fgroup">
                    <div className="flabel">Tranche d'âge</div>
                    <div className="frank">18 — {ageF} ans</div>
                    <input className="fslider" type="range" min={20} max={55} value={ageF} onChange={e=>setAgeF(e.target.value)}/>
                  </div>
                  <div className="fgroup">
                    <div className="flabel">Distance maximale</div>
                    <div className="frank">{distF} km</div>
                    <input className="fslider" type="range" min={5} max={100} value={distF} onChange={e=>setDistF(e.target.value)}/>
                  </div>
                  <div className="fgroup">
                    <div className="flabel">Je cherche</div>
                    <div className="fgrid">
                      {["Femmes","Hommes","Non-binaires","Tout le monde"].map(g => (
                        <div key={g} className={`foption ${genderF===g?"active":""}`} onClick={()=>setGenderF(g)}>{g}</div>
                      ))}
                    </div>
                  </div>
                  <div className="fgroup">
                    <div className="flabel">Centres d'intérêt</div>
                    <div className="finterests">
                      {["Art","Cuisine","Voyage","Musique","Sport","Cinéma","Lecture","Gaming","Nature","Yoga"].map(i => (
                        <div key={i} className={`fibtn ${intF.includes(i)?"active":""}`}
                          onClick={()=>setIntF(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i])}>{i}</div>
                      ))}
                    </div>
                  </div>
                  <div className="fgroup">
                    <div className="flabel">Médias de présentation</div>
                    <div className="fgrid">
                      {["Avec vocal 🎤","Avec vidéo 🎬","Avec photo","Tous"].map(o => (
                        <div key={o} className={`foption ${o==="Tous"?"active":""}`}>{o}</div>
                      ))}
                    </div>
                  </div>
                </div>
                  <div className="fgroup">
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div className="flabel" style={{marginBottom:0}}>En ligne uniquement</div>
                      <div onClick={() => setOnlineOnly(v => !v)} style={{
                        width:48, height:26, borderRadius:13,
                        background: onlineOnly ? "var(--rose)" : "rgba(255,255,255,0.12)",
                        position:"relative", cursor:"pointer",
                        transition:"background .2s", flexShrink:0
                      }}>
                        <div style={{
                          position:"absolute", top:3,
                          left: onlineOnly ? 25 : 3,
                          width:20, height:20, borderRadius:"50%",
                          background:"white", transition:"left .2s",
                          boxShadow:"0 1px 4px rgba(0,0,0,0.3)"
                        }}/>
                      </div>
                    </div>
                    {onlineOnly && <div style={{fontSize:11,color:"var(--muted)",marginTop:6}}>🟢 Personnes connectées récemment</div>}
                  </div>
                <button className="filter-apply" onClick={() => {
                  setShowFilters(false);
                  showToast(onlineOnly ? "🟢 En ligne uniquement activé" : "✅ Filtres appliqués");
                }}>
                  Appliquer les filtres
                </button>
              </div>
            )}

            {/* ── MATCH POPUP ── */}
            {showMatch && matchedProfile && (
              <div className="match-popup">
                <div className="match-emoji">🎉</div>
                <div className="match-title">C'est un Match !</div>
                <div className="match-sub">Toi et {matchedProfile.name} vous vous êtes mutuellement plu ✨</div>
                <div className="match-photos">
                  <div className="match-me">😊</div>
                  <div className="match-hearts">
                    <div className="match-heart">💕</div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>match</div>
                  </div>
                  <img className="match-ph" src={matchedProfile.photo} alt={matchedProfile.name}/>
                </div>
                <button className="match-btn match-btn-p"
                  onClick={async () => {
                    setShowMatch(false);
                    setTab("messages");
                    // Cherche dans dbMatches par id du profil matché
                    let conv = dbMatches.find(m => m.id === matchedProfile?.id);
                    if (!conv) {
                      // Pas encore chargé — recharge et réessaie
                      await loadMatches();
                      conv = dbMatches.find(m => m.id === matchedProfile?.id);
                    }
                    if (!conv) {
                      // Fetch direct en DB
                      const uid = currentUser.id;
                      const pid = matchedProfile.id;
                      const u1 = uid < pid ? uid : pid;
                      const u2 = uid < pid ? pid : uid;
                      const rows = await supabase.select("matches", `?user1_id=eq.${u1}&user2_id=eq.${u2}&limit=1`);
                      if (Array.isArray(rows) && rows[0]) {
                        conv = { ...matchedProfile, matchId: rows[0].id };
                      }
                    }
                    if (conv) {
                      setOpenChat(conv);
                      loadMessages(conv.matchId);
                    }
                  }}>
                  💬 Envoyer un message
                </button>
                <button className="match-btn match-btn-s" onClick={() => setShowMatch(false)}>
                  Continuer à explorer
                </button>
              </div>
            )}


            {/* ── PROFIL MODAL ── */}
            {viewProfile && (
              <div onClick={() => setViewProfile(null)} style={{
                position:"absolute", inset:0, zIndex:100,
                background:"rgba(0,0,0,0.85)", display:"flex",
                flexDirection:"column", overflowY:"auto",
              }}>
                <div onClick={e => e.stopPropagation()} style={{
                  background:"linear-gradient(180deg,#0d1220 0%,#111828 100%)",
                  borderRadius:"32px 32px 0 0", marginTop:"auto",
                  minHeight:"80vh", display:"flex", flexDirection:"column",
                }}>
                  {/* Photo */}
                  <div style={{position:"relative", height:360, flexShrink:0}}>
                    {(viewProfile.photos && viewProfile.photos.length > 0) || viewProfile.photo ? (
                      <div style={{width:"100%",height:"100%",position:"relative"}}>
                        <img src={(viewProfile.photos&&viewProfile.photos[0])||viewProfile.photo} alt={viewProfile.name} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"32px 32px 0 0"}}/>
                        {viewProfile.photos && viewProfile.photos.length > 1 && (
                          <div style={{position:"absolute",bottom:60,left:0,right:0,display:"flex",justifyContent:"center",gap:6}}>
                            {viewProfile.photos.map((_,i) => (
                              <div key={i} style={{width:i===0?20:6,height:6,borderRadius:3,background:i===0?"#fff":"rgba(255,255,255,0.5)"}}/>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#E8647A,#E8A050)",borderRadius:"32px 32px 0 0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:72}}>{viewProfile.name?.[0]}</div>
                    )}
                    <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 50%,#0d1220 100%)",borderRadius:"32px 32px 0 0"}}/>
                    <div onClick={() => setViewProfile(null)} style={{
                      position:"absolute",top:16,right:16,width:36,height:36,
                      background:"rgba(0,0,0,0.5)",borderRadius:"50%",
                      display:"flex",alignItems:"center",justifyContent:"center",
                      cursor:"pointer",fontSize:18,color:"#fff",
                    }}>✕</div>
                    <div style={{position:"absolute",bottom:16,left:20}}>
                      <div style={{fontSize:26,fontWeight:700,color:"#fff"}}>{viewProfile.name}, {viewProfile.age}</div>
                      <div style={{fontSize:14,color:"rgba(255,255,255,0.7)"}}>{viewProfile.job} · {viewProfile.city}{viewProfile.distance ? ` · 📍${viewProfile.distance}km` : ""}</div>
                    </div>
                  </div>

                  {/* Bio */}
                  <div style={{padding:"20px 20px 0"}}>
                    {viewProfile.bio && (
                      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:16,marginBottom:16}}>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:6,fontWeight:600,letterSpacing:1}}>À PROPOS</div>
                        <div style={{fontSize:14,color:"rgba(255,255,255,0.85)",lineHeight:1.6}}>{viewProfile.bio}</div>
                      </div>
                    )}

                    {/* Audio / Video */}
                    {(viewProfile.voice_url || viewProfile.hasVoice) && (
                      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:16,marginBottom:12}}>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:10,fontWeight:600,letterSpacing:1}}>PRÉSENTATION VOCALE</div>
                        <audio controls src={viewProfile.voice_url} style={{width:"100%",height:40}} />
                      </div>
                    )}
                    {(viewProfile.video_url || viewProfile.hasVideo) && (
                      <div style={{background:"rgba(255,255,255,0.05)",borderRadius:16,padding:16,marginBottom:12}}>
                        <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:10,fontWeight:600,letterSpacing:1}}>PRÉSENTATION VIDÉO</div>
                        <video controls src={viewProfile.video_url} style={{width:"100%",borderRadius:12,maxHeight:200}} />
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{display:"flex",gap:12,padding:"16px 0 32px"}}>
                      <div onClick={() => { doPass(); setViewProfile(null); }} style={{
                        flex:1,height:52,background:"rgba(255,255,255,0.08)",
                        borderRadius:26,display:"flex",alignItems:"center",
                        justifyContent:"center",fontSize:24,cursor:"pointer",
                      }}>👎</div>
                      <div onClick={() => { doLike(); setViewProfile(null); }} style={{
                        flex:2,height:52,background:"linear-gradient(135deg,#E8647A,#E8A050)",
                        borderRadius:26,display:"flex",alignItems:"center",
                        justifyContent:"center",gap:8,cursor:"pointer",
                        fontSize:16,fontWeight:700,color:"#fff",
                      }}>💛 J'aime</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TOAST */}
            {toast && <div className="toast">{toast}</div>}
          </div>
        )}
      </div>
    </>
  );
}
