import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────────────
   VAŽNO: API pozivi idu kroz /api/claude (Vercel proxy)
   API ključ se nikad ne vidi u browseru!
───────────────────────────────────────────────────── */
const API_URL = "/api/claude";

/* ── TRANSLATIONS ── */
const T = {
  HR: {
    appName: "OKUSI HRVATSKU", tagline: "Vodič kroz hrvatsku gastronomiju",
    explore: "🗺 Istraži", ai: "✨ AI Sommelier",
    search: "Pretraži restoran, jelo, atmosferu...",
    localPick: "🏠 Lokalni izbor",
    open: "Otvoreno", closed: "Zatvoreno",
    loading: "AI generira restorane", loadMore: "Učitaj još",
    generating: "Generiranje",
    localScore: "Lokalni", touristScore: "Turisti",
    mustTry: "MUST TRY", reviews: "RECENZIJE",
    mostUseful: "Najkorisnije", byRating: "Ocjena",
    allReviews: "Sve", localReviews: "🏠 Lokalni",
    touristReviews: "✈️ Turisti", badReviews: "⚠️ Loše",
    openMaps: "Google Maps →", back: "← Natrag",
    aiTitle: "AI SOMMELIER", aiSub: "Opiši situaciju — AI odabire savršeno mjesto.",
    aiBtn: "PRONAĐI RESTORAN ✦", aiThinking: "Sommelier misli...",
    aiError: "Greška. Pokušaj ponovno.",
    noResults: "Nema rezultata.", resident: "Mještanin", tourist: "Turist",
    restaurants: "restorana", clickDetails: "Detalji →",
    target: "cilj",
    categories: {
      sve: "Sve", dalmatinska: "Dalmatinska", morska: "Plodovi mora",
      mediteranska: "Mediteranska", pizza: "Pizza", finedining: "Fine Dining",
      kafe: "Kafić", istarska: "Istarska", kontinentalna: "Kontinentalna"
    },
    prices: { sve: "Sve cijene", budget: "€", mid: "€€", upscale: "€€€", luxury: "€€€€" },
    quickPrompts: ["Romantična večera 💑", "Svježa riba, budžet 🐟", "Impresionirati klijenta 💼", "Tajni gem 🏠", "Vegan opcije 🌿", "S djecom 👨‍👩‍👧"],
  },
  EN: {
    appName: "TASTE CROATIA", tagline: "Your guide to Croatian gastronomy",
    explore: "🗺 Explore", ai: "✨ AI Sommelier",
    search: "Search restaurant, dish, vibe...",
    localPick: "🏠 Locals' pick",
    open: "Open", closed: "Closed",
    loading: "AI generating restaurants", loadMore: "Load more",
    generating: "Generating",
    localScore: "Local", touristScore: "Tourists",
    mustTry: "MUST TRY", reviews: "REVIEWS",
    mostUseful: "Most useful", byRating: "Rating",
    allReviews: "All", localReviews: "🏠 Locals",
    touristReviews: "✈️ Tourists", badReviews: "⚠️ Critical",
    openMaps: "Google Maps →", back: "← Back",
    aiTitle: "AI SOMMELIER", aiSub: "Describe your situation — AI picks the perfect place.",
    aiBtn: "FIND MY RESTAURANT ✦", aiThinking: "Sommelier thinking...",
    aiError: "Error. Please try again.",
    noResults: "No results found.", resident: "Local", tourist: "Tourist",
    restaurants: "restaurants", clickDetails: "Details →",
    target: "target",
    categories: {
      sve: "All", dalmatinska: "Dalmatian", morska: "Seafood",
      mediteranska: "Mediterranean", pizza: "Pizza", finedining: "Fine Dining",
      kafe: "Café", istarska: "Istrian", kontinentalna: "Continental"
    },
    prices: { sve: "All prices", budget: "€", mid: "€€", upscale: "€€€", luxury: "€€€€" },
    quickPrompts: ["Romantic dinner 💑", "Fresh fish, budget 🐟", "Impress a client 💼", "Hidden gem 🏠", "Vegan options 🌿", "Family friendly 👨‍👩‍👧"],
  },
  DE: {
    appName: "KROATIEN SCHMECKT", tagline: "Ihr Führer durch die kroatische Gastronomie",
    explore: "🗺 Entdecken", ai: "✨ KI Sommelier",
    search: "Restaurant, Gericht, Atmosphäre suchen...",
    localPick: "🏠 Locals' Wahl",
    open: "Geöffnet", closed: "Geschlossen",
    loading: "KI generiert Restaurants", loadMore: "Mehr laden",
    generating: "Generiere",
    localScore: "Einheimisch", touristScore: "Touristen",
    mustTry: "UNBEDINGT PROBIEREN", reviews: "BEWERTUNGEN",
    mostUseful: "Hilfreichste", byRating: "Bewertung",
    allReviews: "Alle", localReviews: "🏠 Einheimische",
    touristReviews: "✈️ Touristen", badReviews: "⚠️ Kritisch",
    openMaps: "Google Maps →", back: "← Zurück",
    aiTitle: "KI SOMMELIER", aiSub: "Situation beschreiben — KI wählt den perfekten Ort.",
    aiBtn: "FINDE MIR EIN RESTAURANT ✦", aiThinking: "Sommelier denkt...",
    aiError: "Fehler. Bitte erneut versuchen.",
    noResults: "Keine Ergebnisse.", resident: "Einheimischer", tourist: "Tourist",
    restaurants: "Restaurants", clickDetails: "Details →",
    target: "Ziel",
    categories: {
      sve: "Alle", dalmatinska: "Dalmatinisch", morska: "Meeresfrüchte",
      mediteranska: "Mediterran", pizza: "Pizza", finedining: "Fine Dining",
      kafe: "Café", istarska: "Istrisch", kontinentalna: "Kontinental"
    },
    prices: { sve: "Alle Preise", budget: "€", mid: "€€", upscale: "€€€", luxury: "€€€€" },
    quickPrompts: ["Romantisches Dinner 💑", "Frischer Fisch, günstig 🐟", "Kunden beeindrucken 💼", "Geheimtipp 🏠", "Vegan 🌿", "Familienfreundlich 👨‍👩‍👧"],
  }
};

/* ── CITIES ── */
const CITIES = [
  { id: "split",     name: "Split",     flag: "🌊", target: 150, region: "Dalmacija" },
  { id: "zagreb",    name: "Zagreb",    flag: "🏙", target: 250, region: "Hrvatska"  },
  { id: "dubrovnik", name: "Dubrovnik", flag: "🏰", target: 70,  region: "Dalmacija" },
  { id: "hvar",      name: "Hvar",      flag: "⛵", target: 50,  region: "Dalmacija" },
  { id: "trogir",    name: "Trogir",    flag: "🏛", target: 40,  region: "Dalmacija" },
  { id: "sibenik",   name: "Šibenik",   flag: "⛪", target: 45,  region: "Dalmacija" },
  { id: "zadar",     name: "Zadar",     flag: "🎵", target: 60,  region: "Dalmacija" },
  { id: "rovinj",    name: "Rovinj",    flag: "🫒", target: 55,  region: "Istra"     },
  { id: "pula",      name: "Pula",      flag: "🏟", target: 55,  region: "Istra"     },
];

const BATCH = 20;

/* ── AI HELPERS ── */
async function callClaude(body) {
  const resp = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 8000, ...body }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

async function fetchBatch(city, lang, offset, batchSize, existingNames = []) {
  const langLabel = { HR: "Croatian", EN: "English", DE: "German" }[lang];
  const months = ["Siječanj","Veljača","Ožujak","Travanj","Svibanj","Lipanj","Srpanj","Kolovoz","Rujan","Listopad","Studeni","Prosinac"];
  const rndMonth = () => months[Math.floor(Math.random() * 12)];

  const system = `You are a restaurant database for Croatia. Return ONLY a valid JSON array. No markdown, no explanation, no text outside the JSON array.`;

  const prompt = `Generate exactly ${batchSize} restaurants for ${city.name}, Croatia. These are entries #${offset + 1} to #${offset + batchSize}.

Do NOT repeat these names: ${existingNames.slice(-20).join(", ")}

Mix: famous spots, hidden gems, konobas, fine dining, seafood, pizza, cafes, bakeries.
Vary ratings (3.9–5.0), reviews (80–18000), prices (1–4), neighborhoods, categories.
Make addresses realistic streets in ${city.name}.

Return a JSON array of exactly ${batchSize} objects with this exact shape:
[
  {
    "id": ${offset + 1},
    "name": "string",
    "address": "string, ${city.name}",
    "rating": 4.7,
    "reviews": 2300,
    "category": "dalmatinska|morska|mediteranska|pizza|finedining|kafe|istarska|kontinentalna",
    "price": 2,
    "localScore": 88,
    "touristScore": 76,
    "tags": ["tag1", "tag2", "tag3"],
    "hours": { "open": 12, "close": 23 },
    "highlight": "One compelling sentence in ${langLabel} about what makes this place special.",
    "mustTry": "Signature dish or drink in ${langLabel}",
    "michelinStar": false,
    "bibGourmand": false,
    "reviews_data": [
      {
        "author": "Name S.",
        "type": "local",
        "stars": 5,
        "useful": 134,
        "text": "Genuine 2-3 sentence review in ${langLabel} from a local perspective.",
        "date": "${rndMonth()} 2025"
      },
      {
        "author": "Name T.",
        "type": "tourist",
        "stars": 5,
        "useful": 89,
        "text": "Genuine 2-3 sentence review in ${langLabel} from a tourist perspective.",
        "date": "Kolovoz 2024"
      },
      {
        "author": "Name K.",
        "type": "local",
        "stars": 2,
        "useful": 167,
        "text": "Critical review in ${langLabel} describing what went wrong specifically.",
        "date": "Srpanj 2024"
      }
    ]
  }
]`;

  const data = await callClaude({ system, messages: [{ role: "user", content: prompt }] });
  const raw = data.content?.map(i => i.text || "").join("").trim();
  const clean = raw.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  const parsed = JSON.parse(clean);
  return parsed.map((r, i) => ({ ...r, id: offset + i + 1, city: city.id }));
}

async function fetchAIRecommendation(mood, restaurants, lang) {
  const langLabel = { HR: "Croatian", EN: "English", DE: "German" }[lang];
  const list = restaurants.slice(0, 50)
    .map(r => `ID:${r.id}|${r.name}|cat:${r.category}|price:${r.price}|local:${r.localScore}|tourist:${r.touristScore}|${r.highlight}`)
    .join("\n");

  const system = `You are an AI sommelier for Croatia. Recommend 3 restaurants based on the user's mood/situation. Return ONLY valid JSON, no markdown: {"intro":"2 sentences in ${langLabel}","picks":[{"id":number,"reason":"why in ${langLabel}","tip":"insider tip in ${langLabel}"}]}`;

  const data = await callClaude({
    system,
    messages: [{ role: "user", content: `Situation: "${mood}"\n\nAvailable restaurants:\n${list}` }],
    max_tokens: 1000,
  });

  const raw = data.content?.map(i => i.text || "").join("").trim()
    .replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(raw);
}

/* ── SUB-COMPONENTS ── */
const Stars = ({ n = 0 }) => (
  <span style={{ color: "#c9a84c", fontSize: "11px", letterSpacing: "1px" }}>
    {"★".repeat(Math.floor(n))}{"☆".repeat(5 - Math.floor(n))}
  </span>
);

const Bar = ({ value, color }) => (
  <div style={{ height: "4px", borderRadius: "2px", background: "#111e2c", overflow: "hidden" }}>
    <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "2px", transition: "width .7s ease" }} />
  </div>
);

const ScoreRow = ({ label, value, color }) => (
  <div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "3px" }}>
      <span style={{ color: "#3a4a5a" }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{value}/100</span>
    </div>
    <Bar value={value} color={color} />
  </div>
);

const Chip = ({ label, active, color = "#c9a84c", onClick }) => (
  <button onClick={onClick} style={{
    padding: "4px 11px", borderRadius: "12px", fontSize: "11px", cursor: "pointer",
    border: `1px solid ${active ? color + "55" : "#111e2c"}`,
    background: active ? color + "12" : "transparent",
    color: active ? color : "#4a5a6a",
    fontFamily: "inherit", transition: "all .15s",
  }}>{label}</button>
);

/* ── MAIN APP ── */
export default function App() {
  const [lang, setLang]           = useState("HR");
  const [view, setView]           = useState("explore");
  const [selectedId, setSelectedId] = useState(null);
  const [city, setCity]           = useState("split");
  const [search, setSearch]       = useState("");
  const [category, setCategory]   = useState("sve");
  const [price, setPrice]         = useState("sve");
  const [localOnly, setLocalOnly] = useState(false);
  const [revFilter, setRevFilter] = useState("all");
  const [revSort, setRevSort]     = useState("useful");
  const [showBad, setShowBad]     = useState(false);
  const [aiMood, setAiMood]       = useState("");
  const [aiResult, setAiResult]   = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [cityData, setCityData]   = useState({});
  const loadingRef = useRef({});

  const t          = T[lang];
  const cityInfo   = CITIES.find(c => c.id === city);
  const now        = new Date().getHours();
  const isOpen     = r => (r.hours?.open ?? 0) <= now && now < (r.hours?.close ?? 24);
  const priceLabel = { 1: "€", 2: "€€", 3: "€€€", 4: "€€€€" };
  const accentFor  = { split: "#4a9ec8", zagreb: "#c94a6e", dubrovnik: "#c9a84c", hvar: "#9e4ac9", trogir: "#4ac98a", sibenik: "#c97a4a", zadar: "#4a7ec9", rovinj: "#8ac94a", pula: "#c94a4a" };
  const accent     = accentFor[city] || "#c9a84c";

  /* ── LOAD CITY ── */
  const loadCity = useCallback(async (cityId) => {
    if (loadingRef.current[cityId]) return;
    const conf   = CITIES.find(c => c.id === cityId);
    if (!conf) return;
    const prev   = cityData[cityId]?.restaurants || [];
    if (cityData[cityId]?.done) return;
    const offset = prev.length;
    if (offset >= conf.target) return;

    loadingRef.current[cityId] = true;
    setCityData(d => ({ ...d, [cityId]: { restaurants: prev, loading: true, done: false, error: null } }));

    try {
      const batchSize = Math.min(BATCH, conf.target - offset);
      const names     = prev.map(r => r.name);
      const batch     = await fetchBatch(conf, lang, offset, batchSize, names);

      setCityData(d => {
        const merged = [...(d[cityId]?.restaurants || []), ...batch];
        return { ...d, [cityId]: { restaurants: merged, loading: false, done: merged.length >= conf.target, error: null } };
      });
    } catch (err) {
      setCityData(d => ({ ...d, [cityId]: { ...d[cityId], loading: false, error: err.message } }));
    }
    loadingRef.current[cityId] = false;
  }, [cityData, lang]);

  /* Load on city change */
  useEffect(() => {
    if (!cityData[city] || cityData[city].restaurants.length === 0) loadCity(city);
  }, [city]);

  /* Reset on lang change */
  useEffect(() => {
    setCityData({});
    loadingRef.current = {};
  }, [lang]);

  const cd        = cityData[city] || { restaurants: [], loading: false, done: false, error: null };
  const allRests  = cd.restaurants;
  const isLoading = cd.loading;
  const isDone    = cd.done;
  const hasError  = cd.error;

  /* ── FILTER / SORT ── */
  const priceKeyMap = { budget: 1, mid: 2, upscale: 3, luxury: 4 };
  const filtered = allRests.filter(r => {
    const s = search.toLowerCase();
    const ok_search  = !s || r.name.toLowerCase().includes(s) || (r.highlight || "").toLowerCase().includes(s) || (r.tags || []).some(t => t.toLowerCase().includes(s));
    const ok_cat     = category === "sve" || r.category === category;
    const ok_price   = price === "sve" || r.price === priceKeyMap[price];
    const ok_local   = !localOnly || r.localScore >= 85;
    return ok_search && ok_cat && ok_price && ok_local;
  }).sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

  /* ── SELECTED DETAIL ── */
  const sel = selectedId ? allRests.find(r => r.id === selectedId) : null;

  const reviews = sel ? (() => {
    let revs = [...(sel.reviews_data || [])];
    if (revFilter === "local")   revs = revs.filter(r => r.type === "local");
    if (revFilter === "tourist") revs = revs.filter(r => r.type === "tourist");
    if (showBad) revs = revs.filter(r => r.stars <= 3);
    revs.sort((a, b) => revSort === "useful" ? b.useful - a.useful : b.stars - a.stars);
    return revs;
  })() : [];

  /* ── AI CALL ── */
  const callAI = async () => {
    if (!aiMood.trim() || allRests.length < 3) return;
    setAiLoading(true); setAiResult(null);
    try { setAiResult(await fetchAIRecommendation(aiMood, allRests, lang)); }
    catch { setAiResult({ error: true }); }
    setAiLoading(false);
  };

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div style={{ minHeight: "100vh", background: "#07101a", color: "#d5c9b2", fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a2535;border-radius:2px}
        .hov{transition:all .18s;cursor:pointer}
        .hov:hover{transform:translateY(-2px);border-color:rgba(201,168,76,.35)!important;box-shadow:0 6px 20px rgba(0,0,0,.3)}
        .fade{animation:fd .28s ease}
        @keyframes fd{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .spin{animation:sp 1.1s linear infinite;display:inline-block}
        @keyframes sp{to{transform:rotate(360deg)}}
        .pulse{animation:pl 1.6s ease infinite}
        @keyframes pl{0%,100%{opacity:1}50%{opacity:.35}}
        .stagger:nth-child(1){animation-delay:.03s}.stagger:nth-child(2){animation-delay:.06s}
        .stagger:nth-child(3){animation-delay:.09s}.stagger:nth-child(4){animation-delay:.12s}
        .stagger:nth-child(5){animation-delay:.15s}.stagger:nth-child(6){animation-delay:.18s}
        input::placeholder,textarea::placeholder{color:#2a3a4a}
        button{outline:none}
        a{text-decoration:none}
      `}</style>

      {/* ══ NAV ══ */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: "#07101aee", backdropFilter: "blur(16px)",
        borderBottom: "1px solid #111e2c",
        padding: "0 16px", height: "54px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
          <span style={{ fontSize: "20px", flexShrink: 0 }}>🇭🇷</span>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "13px", fontWeight: "bold", color: accent, letterSpacing: "2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {t.appName}
          </span>
        </div>
        <div style={{ display: "flex", gap: "3px", alignItems: "center", flexShrink: 0 }}>
          {/* Lang */}
          <div style={{ display: "flex", border: "1px solid #111e2c", borderRadius: "6px", overflow: "hidden", marginRight: "6px" }}>
            {["HR","EN","DE"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "4px 9px", border: "none",
                background: lang === l ? accent + "22" : "transparent",
                color: lang === l ? accent : "#3a4a5a",
                fontSize: "11px", cursor: "pointer", fontWeight: lang === l ? 700 : 400,
                transition: "all .15s",
              }}>{l}</button>
            ))}
          </div>
          {[["explore", t.explore], ["ai", t.ai]].map(([v, label]) => (
            <button key={v} onClick={() => { setView(v); setSelectedId(null); }} style={{
              padding: "5px 10px", borderRadius: "7px", border: "none", cursor: "pointer",
              fontSize: "12px", fontFamily: "inherit",
              background: view === v && !selectedId ? accent + "18" : "transparent",
              color: view === v && !selectedId ? accent : "#4a5a6a",
              whiteSpace: "nowrap", transition: "all .15s",
            }}>{label}</button>
          ))}
        </div>
      </nav>

      {/* ══ DETAIL ══ */}
      {selectedId && sel && (
        <div className="fade" style={{ maxWidth: "740px", margin: "0 auto", padding: "22px 16px 80px" }}>
          <button onClick={() => setSelectedId(null)} style={{
            background: "none", border: "none", color: accent, cursor: "pointer",
            fontSize: "13px", marginBottom: "16px", fontFamily: "inherit",
            display: "flex", gap: "5px", alignItems: "center",
          }}>{t.back}</button>

          {/* Header */}
          <div style={{ background: "#0e1c2c", border: `1px solid ${accent}22`, borderRadius: "14px", padding: "22px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "8px" }}>
                  {sel.michelinStar && <span style={{ padding: "2px 8px", borderRadius: "8px", background: "#c9a84c18", color: "#c9a84c", fontSize: "10px", border: "1px solid #c9a84c33" }}>⭐ Michelin</span>}
                  {sel.bibGourmand && <span style={{ padding: "2px 8px", borderRadius: "8px", background: "#4a9e6e18", color: "#4a9e6e", fontSize: "10px", border: "1px solid #4a9e6e33" }}>🍽 Bib Gourmand</span>}
                  <span style={{ padding: "2px 8px", borderRadius: "8px", background: "#1a2535", color: "#6a7a8a", fontSize: "10px" }}>{t.categories[sel.category] || sel.category}</span>
                  <span style={{ padding: "2px 8px", borderRadius: "8px", background: "#1a2535", color: "#6a7a8a", fontSize: "10px" }}>{priceLabel[sel.price]}</span>
                  <span style={{ padding: "2px 8px", borderRadius: "8px", fontSize: "10px", background: isOpen(sel) ? "#4a9e6e18" : "#b84a4a18", color: isOpen(sel) ? "#4a9e6e" : "#b84a4a", border: `1px solid ${isOpen(sel) ? "#4a9e6e33" : "#b84a4a33"}` }}>
                    {isOpen(sel) ? `● ${t.open}` : `● ${t.closed}`}
                  </span>
                </div>
                <h1 style={{ fontSize: "clamp(18px,3.5vw,24px)", color: "#f0e8d0", fontWeight: "bold", lineHeight: 1.2 }}>{sel.name}</h1>
                <div style={{ color: "#3a4a5a", fontSize: "12px", marginTop: "4px" }}>
                  📍 {sel.address} · {sel.hours?.open}:00–{sel.hours?.close}:00
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "38px", color: accent, fontWeight: "bold", lineHeight: 1 }}>{sel.rating?.toFixed(1)}</div>
                <Stars n={sel.rating} />
                <div style={{ color: "#2a3a4a", fontSize: "11px", marginTop: "2px" }}>{sel.reviews?.toLocaleString()} recenzija</div>
              </div>
            </div>

            <p style={{ marginTop: "14px", color: "#8a9aaa", fontStyle: "italic", fontSize: "14px", lineHeight: 1.75 }}>{sel.highlight}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "16px" }}>
              <ScoreRow label={`🏠 ${t.localScore}`}   value={sel.localScore}   color="#4a9e6e" />
              <ScoreRow label={`✈️ ${t.touristScore}`} value={sel.touristScore} color="#4a7eb8" />
            </div>

            <div style={{ marginTop: "14px", padding: "11px 14px", background: accent + "10", border: `1px solid ${accent}22`, borderRadius: "9px" }}>
              <div style={{ fontSize: "9px", letterSpacing: "2px", color: accent, marginBottom: "3px" }}>{t.mustTry}</div>
              <div style={{ color: "#f0e8d0", fontSize: "13px" }}>🍽 {sel.mustTry}</div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "12px" }}>
              {(sel.tags || []).map(tag => (
                <span key={tag} style={{ padding: "3px 8px", borderRadius: "8px", background: "#1a2535", color: "#5a6a7a", fontSize: "11px" }}>{tag}</span>
              ))}
            </div>

            <a href={`https://www.google.com/maps/search/${encodeURIComponent(sel.name + " " + sel.address)}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "14px", padding: "9px 16px", background: accent + "14", border: `1px solid ${accent}33`, borderRadius: "9px", color: accent, fontSize: "12px" }}>
              {t.openMaps}
            </a>
          </div>

          {/* Reviews */}
          <div style={{ background: "#0e1c2c", border: "1px solid #111e2c", borderRadius: "14px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", marginBottom: "12px", alignItems: "center" }}>
              <h3 style={{ color: accent, fontSize: "12px", letterSpacing: "2px" }}>{t.reviews}</h3>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                {[["all", t.allReviews], ["local", t.localReviews], ["tourist", t.touristReviews]].map(([v, l]) => (
                  <Chip key={v} label={l} active={revFilter === v} color={accent} onClick={() => setRevFilter(v)} />
                ))}
                <Chip label={t.badReviews} active={showBad} color="#b84a4a" onClick={() => setShowBad(x => !x)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
              <Chip label={t.mostUseful} active={revSort === "useful"} color={accent} onClick={() => setRevSort("useful")} />
              <Chip label={t.byRating}   active={revSort === "stars"}  color={accent} onClick={() => setRevSort("stars")} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {reviews.map((rev, i) => (
                <div key={i} style={{ background: "#07101a", borderRadius: "10px", padding: "14px", borderLeft: `3px solid ${rev.stars <= 3 ? "#b84a4a" : rev.type === "local" ? "#4a9e6e" : "#4a7eb8"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7px" }}>
                    <div style={{ display: "flex", gap: "7px", alignItems: "center" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: rev.type === "local" ? "#4a9e6e18" : "#4a7eb818", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px" }}>
                        {rev.type === "local" ? "🏠" : "✈️"}
                      </div>
                      <div>
                        <div style={{ color: "#a0b0b8", fontSize: "12px", fontWeight: "bold" }}>{rev.author}</div>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                          <Stars n={rev.stars} />
                          <span style={{ color: "#2a3a4a", fontSize: "10px" }}>{rev.date}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                      <span style={{ padding: "2px 6px", borderRadius: "6px", fontSize: "10px", background: rev.type === "local" ? "#4a9e6e14" : "#4a7eb814", color: rev.type === "local" ? "#4a9e6e" : "#4a7eb8" }}>
                        {rev.type === "local" ? t.resident : t.tourist}
                      </span>
                      <span style={{ color: "#2a3a4a", fontSize: "10px" }}>👍 {rev.useful}</span>
                    </div>
                  </div>
                  <p style={{ color: "#6a7a8a", fontSize: "12px", lineHeight: 1.65, fontStyle: "italic" }}>"{rev.text}"</p>
                </div>
              ))}
              {reviews.length === 0 && (
                <div style={{ textAlign: "center", padding: "20px", color: "#2a3a4a", fontSize: "13px" }}>—</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ AI SOMMELIER ══ */}
      {!selectedId && view === "ai" && (
        <div className="fade" style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 16px 80px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "40px", marginBottom: "8px" }}>✨</div>
            <h2 style={{ fontSize: "20px", color: accent, letterSpacing: "2px", fontWeight: "bold" }}>{t.aiTitle}</h2>
            <p style={{ color: "#4a5a6a", marginTop: "6px", fontSize: "13px", fontStyle: "italic" }}>{t.aiSub}</p>
          </div>

          {/* City selector */}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "16px", justifyContent: "center" }}>
            {CITIES.map(c => (
              <Chip key={c.id} label={`${c.flag} ${c.name}`} active={city === c.id} color={accentFor[c.id]}
                onClick={() => { setCity(c.id); if (!cityData[c.id]?.restaurants?.length) loadCity(c.id); }} />
            ))}
          </div>

          <div style={{ background: "#0e1c2c", border: `1px solid ${accent}18`, borderRadius: "14px", padding: "18px", marginBottom: "14px" }}>
            <textarea value={aiMood} onChange={e => setAiMood(e.target.value)}
              placeholder={t.quickPrompts[0]} rows={3}
              style={{ width: "100%", background: "#07101a", border: "1px solid #111e2c", borderRadius: "8px", padding: "12px", color: "#d5c9b2", fontSize: "14px", fontFamily: "inherit", resize: "none", outline: "none", lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = accent + "44"}
              onBlur={e => e.target.style.borderColor = "#111e2c"}
            />
            <div style={{ display: "flex", gap: "5px", marginTop: "8px", flexWrap: "wrap" }}>
              {t.quickPrompts.map(s => (
                <Chip key={s} label={s} active={aiMood === s} color={accent} onClick={() => setAiMood(s)} />
              ))}
            </div>
            <button onClick={callAI}
              disabled={aiLoading || !aiMood.trim() || allRests.length < 3}
              style={{
                width: "100%", marginTop: "12px", padding: "12px", borderRadius: "9px", border: "none",
                background: (aiLoading || !aiMood.trim() || allRests.length < 3) ? "#1a2535" : `linear-gradient(135deg, ${accent}, ${accent}88)`,
                color: (aiLoading || !aiMood.trim() || allRests.length < 3) ? "#3a4a5a" : "#07101a",
                fontSize: "13px", fontWeight: "bold", cursor: "pointer", fontFamily: "inherit", letterSpacing: "1px",
              }}>
              {aiLoading ? <span className="pulse">{t.aiThinking}</span> : t.aiBtn}
            </button>
          </div>

          {aiResult && !aiResult.error && (
            <div className="fade" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ padding: "14px", background: accent + "08", border: `1px solid ${accent}22`, borderRadius: "11px" }}>
                <p style={{ color: accent, fontStyle: "italic", fontSize: "14px", lineHeight: 1.7 }}>✦ {aiResult.intro}</p>
              </div>
              {(aiResult.picks || []).map((pick, i) => {
                const r = allRests.find(x => x.id === pick.id);
                if (!r) return null;
                return (
                  <div key={i} className="hov" onClick={() => { setSelectedId(r.id); setView("explore"); }}
                    style={{ background: "#0e1c2c", border: "1px solid #111e2c", borderRadius: "12px", padding: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ color: accent, fontSize: "9px", letterSpacing: "2px", marginBottom: "3px" }}>#{i + 1} PICK</div>
                        <h3 style={{ fontSize: "15px", color: "#f0e8d0", fontWeight: "bold" }}>{r.name}</h3>
                        <div style={{ color: "#3a4a5a", fontSize: "11px" }}>{r.address} · {priceLabel[r.price]}</div>
                      </div>
                      <div style={{ fontSize: "24px", color: accent, fontWeight: "bold" }}>{r.rating?.toFixed(1)}</div>
                    </div>
                    <p style={{ color: "#6a7a8a", fontSize: "12px", marginTop: "9px", fontStyle: "italic", lineHeight: 1.6 }}>{pick.reason}</p>
                    <div style={{ marginTop: "9px", padding: "8px 11px", background: "#4a9e6e0a", border: "1px solid #4a9e6e18", borderRadius: "7px" }}>
                      <span style={{ color: "#4a9e6e", fontSize: "9px", letterSpacing: "1.5px" }}>🏠 INSIDER: </span>
                      <span style={{ color: "#5a8a6a", fontSize: "12px" }}>{pick.tip}</span>
                    </div>
                    <div style={{ color: "#2a3a4a", fontSize: "10px", textAlign: "right", marginTop: "8px" }}>{t.clickDetails}</div>
                  </div>
                );
              })}
            </div>
          )}
          {aiResult?.error && (
            <div style={{ background: "#b84a4a0a", border: "1px solid #b84a4a22", borderRadius: "9px", padding: "12px", color: "#b84a4a", fontSize: "13px", textAlign: "center" }}>{t.aiError}</div>
          )}
        </div>
      )}

      {/* ══ EXPLORE ══ */}
      {!selectedId && view === "explore" && (
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "18px 16px 80px" }}>

          {/* Hero */}
          <div style={{ textAlign: "center", padding: "14px 0 20px" }}>
            <div style={{ fontSize: "9px", letterSpacing: "5px", color: accent, marginBottom: "6px" }}>HRVATSKA · CROATIA · KROATIEN</div>
            <h1 style={{ fontSize: "clamp(22px,5vw,44px)", color: "#f0e8d0", fontWeight: "bold", letterSpacing: "3px" }}>{t.appName}</h1>
            <div style={{ width: "40px", height: "1px", background: `linear-gradient(90deg,transparent,${accent},transparent)`, margin: "10px auto" }} />
            <p style={{ color: "#2a3a4a", fontStyle: "italic", fontSize: "12px" }}>{t.tagline}</p>
          </div>

          {/* City tabs */}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "18px", justifyContent: "center" }}>
            {CITIES.map(c => {
              const loaded = cityData[c.id]?.restaurants?.length || 0;
              const done   = cityData[c.id]?.done;
              const ac     = accentFor[c.id];
              return (
                <button key={c.id}
                  onClick={() => { setCity(c.id); setSearch(""); setCategory("sve"); setPrice("sve"); setLocalOnly(false); if (!cityData[c.id]?.restaurants?.length) loadCity(c.id); }}
                  style={{
                    padding: "7px 14px", borderRadius: "20px", cursor: "pointer", fontFamily: "inherit",
                    border: `1px solid ${city === c.id ? ac + "55" : "#111e2c"}`,
                    background: city === c.id ? ac + "18" : "#0e1c2c",
                    color: city === c.id ? ac : "#4a5a6a",
                    fontSize: "12px", transition: "all .15s",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "1px",
                  }}>
                  <span>{c.flag} {c.name}</span>
                  <span style={{ fontSize: "9px", color: city === c.id ? ac + "88" : "#1e2e3e" }}>
                    {loaded > 0 ? `${loaded}${done ? "" : "+"} rest.` : "·"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: "10px" }}>
            <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", opacity: .3, fontSize: "15px" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.search}
              style={{ width: "100%", padding: "11px 13px 11px 38px", background: "#0e1c2c", border: "1px solid #111e2c", borderRadius: "9px", color: "#d5c9b2", fontSize: "14px", outline: "none", fontFamily: "inherit" }}
              onFocus={e => e.target.style.borderColor = accent + "44"}
              onBlur={e => e.target.style.borderColor = "#111e2c"}
            />
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "6px" }}>
            {Object.entries(t.categories).map(([k, v]) => (
              <Chip key={k} label={v} active={category === k} color={accent} onClick={() => setCategory(k)} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "12px", alignItems: "center" }}>
            {Object.entries(t.prices).map(([k, v]) => (
              <Chip key={k} label={v} active={price === k} color={accent} onClick={() => setPrice(k)} />
            ))}
            <Chip label={t.localPick} active={localOnly} color="#4a9e6e" onClick={() => setLocalOnly(x => !x)} />
            <span style={{ color: "#1e2e3e", fontSize: "10px", marginLeft: "auto" }}>
              {filtered.length} / {allRests.length} {t.restaurants}
              {!isDone && cityInfo ? ` · ${t.target}: ${cityInfo.target}` : ""}
            </span>
          </div>

          {/* ── Loading first batch ── */}
          {isLoading && allRests.length === 0 && (
            <div style={{ textAlign: "center", padding: "70px 20px" }}>
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>
                <span className="spin">⚙️</span>
              </div>
              <div className="pulse" style={{ color: accent, fontSize: "15px", fontStyle: "italic" }}>{t.loading}...</div>
              <div style={{ color: "#1e2e3e", fontSize: "11px", marginTop: "8px" }}>
                AI generira {cityInfo?.target} restorana za {cityInfo?.name}
              </div>
            </div>
          )}

          {/* ── Error ── */}
          {hasError && allRests.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "30px", marginBottom: "10px" }}>⚠️</div>
              <div style={{ color: "#b84a4a", fontSize: "13px", marginBottom: "12px" }}>{hasError}</div>
              <button onClick={() => loadCity(city)} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #b84a4a44", background: "transparent", color: "#b84a4a", cursor: "pointer", fontFamily: "inherit" }}>
                Pokušaj ponovno
              </button>
            </div>
          )}

          {/* ── Cards grid ── */}
          {allRests.length > 0 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "12px" }}>
                {filtered.map((r, i) => (
                  <div key={r.id} className="hov fade stagger"
                    onClick={() => setSelectedId(r.id)}
                    style={{ background: "linear-gradient(145deg,#0e1c2c,#0a1520)", border: "1px solid #111e2c", borderRadius: "12px", padding: "16px", position: "relative", overflow: "hidden" }}>

                    {/* Top color line by local score */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg,transparent,${r.localScore >= 90 ? "#4a9e6e" : r.localScore >= 80 ? accent : "#4a7eb8"},transparent)` }} />

                    {r.michelinStar && <div style={{ position: "absolute", top: "8px", right: "8px", fontSize: "12px" }}>⭐</div>}

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "9px" }}>
                      <div style={{ flex: 1, paddingRight: "8px" }}>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "5px" }}>
                          <span style={{ padding: "2px 6px", borderRadius: "6px", background: "#1a2535", color: "#5a6a7a", fontSize: "9px" }}>{t.categories[r.category] || r.category}</span>
                          <span style={{ padding: "2px 6px", borderRadius: "6px", background: "#1a2535", color: "#5a6a7a", fontSize: "9px" }}>{priceLabel[r.price]}</span>
                          {isOpen(r) && <span style={{ padding: "2px 6px", borderRadius: "6px", background: "#4a9e6e14", color: "#4a9e6e", fontSize: "9px" }}>● {t.open}</span>}
                        </div>
                        <h3 style={{ fontSize: "13px", color: "#f0e8d0", fontWeight: "bold", lineHeight: 1.25 }}>{r.name}</h3>
                        <div style={{ color: "#2a3a4a", fontSize: "10px", marginTop: "2px" }}>📍 {r.address}</div>
                      </div>
                      <div style={{ textAlign: "right", minWidth: "44px" }}>
                        <div style={{ fontSize: "21px", color: accent, fontWeight: "bold", lineHeight: 1 }}>{r.rating?.toFixed(1)}</div>
                        <Stars n={r.rating} />
                        <div style={{ color: "#1e2e3e", fontSize: "9px" }}>
                          {r.reviews >= 1000 ? `${(r.reviews / 1000).toFixed(1)}k` : r.reviews}
                        </div>
                      </div>
                    </div>

                    <p style={{ color: "#4a5a6a", fontSize: "11px", lineHeight: 1.55, fontStyle: "italic", marginBottom: "10px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {r.highlight}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "10px" }}>
                      {[["🏠", r.localScore, "#4a9e6e"], ["✈️", r.touristScore, "#4a7eb8"]].map(([icon, score, color]) => (
                        <div key={icon}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", marginBottom: "2px" }}>
                            <span style={{ color: "#2a3a4a" }}>{icon} {icon === "🏠" ? t.localScore : t.touristScore}</span>
                            <span style={{ color }}>{score}</span>
                          </div>
                          <Bar value={score} color={color + "88"} />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                      {(r.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} style={{ padding: "2px 6px", borderRadius: "6px", background: "#1a2535", color: "#4a5a6a", fontSize: "9px" }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ color: "#1e2e3e", fontSize: "9px", textAlign: "right", marginTop: "8px" }}>{t.clickDetails}</div>
                  </div>
                ))}
              </div>

              {/* Load more / progress */}
              <div style={{ textAlign: "center", marginTop: "24px" }}>
                {isLoading && (
                  <div className="pulse" style={{ color: accent, fontSize: "13px", padding: "12px", fontStyle: "italic" }}>
                    <span className="spin" style={{ marginRight: "8px" }}>⚙️</span>
                    {t.generating}... ({allRests.length}/{cityInfo?.target})
                  </div>
                )}
                {!isLoading && !isDone && !hasError && (
                  <button onClick={() => loadCity(city)} style={{
                    padding: "10px 28px", borderRadius: "20px",
                    border: `1px solid ${accent}33`, background: accent + "10",
                    color: accent, fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
                  }}>
                    {t.loadMore} ({allRests.length}/{cityInfo?.target})
                  </button>
                )}
                {isDone && (
                  <div style={{ color: "#1e2e3e", fontSize: "11px", padding: "8px" }}>
                    ✓ {allRests.length} restorana • {cityInfo?.name}
                  </div>
                )}
              </div>
            </>
          )}

          {/* No results */}
          {filtered.length === 0 && allRests.length > 0 && (
            <div style={{ textAlign: "center", padding: "40px", color: "#2a3a4a" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🌊</div>
              <div style={{ fontSize: "13px" }}>{t.noResults}</div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!selectedId && (
        <div style={{ textAlign: "center", padding: "14px", borderTop: "1px solid #0e1c2c", color: "#0e1c2c", fontSize: "9px", letterSpacing: "3px" }}>
          {t.appName} · HRVATSKA · {new Date().getFullYear()}
        </div>
      )}
    </div>
  );
}
