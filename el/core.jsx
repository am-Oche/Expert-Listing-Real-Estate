/* Core: router, store, icons, Tabs, primitives */
const { useState, useEffect, useRef, useMemo, useCallback, useLayoutEffect, createContext, useContext } = React;
const CFG = window.EL_CONFIG;
const DB = window.EL_DATA;

/* ================= Router (hash-based, query-synced) ================= */
function parseHash() {
  const h = window.location.hash.replace(/^#/, "") || "/";
  const [path, qs] = h.split("?");
  return { path: path || "/", query: Object.fromEntries(new URLSearchParams(qs || "")) };
}
const RouteCtx = createContext(null);
function RouterProvider({ children }) {
  const [loc, setLoc] = useState(parseHash);
  useEffect(() => {
    const on = () => setLoc(parseHash());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return <RouteCtx.Provider value={loc}>{children}</RouteCtx.Provider>;
}
const useRoute = () => useContext(RouteCtx);
function buildHash(path, query) {
  const q = Object.entries(query || {}).filter(([, v]) => v !== undefined && v !== null && v !== "");
  return "#" + path + (q.length ? "?" + new URLSearchParams(q).toString() : "");
}
function navigate(to, { replace = false } = {}) {
  const href = to.startsWith("#") ? to : "#" + to;
  if (replace) history.replaceState(null, "", href), window.dispatchEvent(new HashChangeEvent("hashchange"));
  else window.location.hash = href.slice(1);
  if (!replace) window.scrollTo({ top: 0, behavior: "instant" });
}
/* set/merge query params on current path (replace by default — tab switches don't spam history unless asked) */
function setQuery(patch, { push = false } = {}) {
  const { path, query } = parseHash();
  const next = { ...query, ...patch };
  Object.keys(next).forEach((k) => (next[k] === undefined || next[k] === null || next[k] === "") && delete next[k]);
  const href = buildHash(path, next);
  if (push) history.pushState(null, "", href); else history.replaceState(null, "", href);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}
/* useQueryState: param-bound state. push=true creates history entries so Back works between tabs */
function useQueryState(key, def, { push = true } = {}) {
  const { query } = useRoute();
  const val = query[key] ?? def;
  const set = useCallback((v) => setQuery({ [key]: v === def ? undefined : v }, { push }), [key, def, push]);
  return [val, set];
}
function Link({ to, children, className, style, onClick, ...rest }) {
  return <a href={"#" + to} className={className} style={style} onClick={(e) => { onClick && onClick(e); if (!e.defaultPrevented) { e.preventDefault(); navigate(to); } }} {...rest}>{children}</a>;
}

/* ================= Store ================= */
const LS = {
  get(k, d) { try { const v = localStorage.getItem("el:" + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem("el:" + k, JSON.stringify(v)); } catch {} }
};
const StoreCtx = createContext(null);
function StoreProvider({ children }) {
  const [saved, setSaved] = useState(() => LS.get("saved", ["L1001", "L1003"]));
  const [compare, setCompare] = useState(() => LS.get("compare", []));
  const [recent, setRecent] = useState(() => LS.get("recent", []));
  const [currency, setCurrency] = useState(() => LS.get("cur", "NGN"));
  const [searches, setSearches] = useState(() => LS.get("searches", [{ id: "s1", label: "Villas for Sale in Victoria Island", q: { action: "buy", city: "lagos", area: "Victoria Island", type: "villa" }, freq: "Daily" }]));
  const [plan, setPlan] = useState(() => LS.get("plan", "pro"));
  const [leads, setLeads] = useState(() => LS.get("leads", []));
  const [listings, setListings] = useState(() => LS.get("mylistings", null));
  const [toasts, setToasts] = useState([]);
  useEffect(() => LS.set("saved", saved), [saved]);
  useEffect(() => LS.set("compare", compare), [compare]);
  useEffect(() => LS.set("recent", recent), [recent]);
  useEffect(() => LS.set("cur", currency), [currency]);
  useEffect(() => LS.set("searches", searches), [searches]);
  useEffect(() => LS.set("plan", plan), [plan]);
  useEffect(() => LS.set("leads", leads), [leads]);
  useEffect(() => { if (listings) LS.set("mylistings", listings); }, [listings]);
  const toast = useCallback((msg, icon = "check") => {
    const id = Math.random();
    setToasts((t) => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);
  const api = {
    saved, toggleSave: (id) => setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    compare, toggleCompare: (id) => setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length >= 3 ? (toast("You can compare up to 3 listings", "info"), c) : [...c, id])), clearCompare: () => setCompare([]),
    recent, pushRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)),
    currency, setCurrency, searches, setSearches, plan, setPlan, leads, setLeads, listings, setListings, toast
  };
  return (
    <StoreCtx.Provider value={api}>
      {children}
      <div className="toasts" role="status" aria-live="polite">{toasts.map((t) => <div key={t.id} className="toast"><Icon n={t.icon} s={16} />{t.msg}</div>)}</div>
    </StoreCtx.Provider>
  );
}
const useStore = () => useContext(StoreCtx);

/* ================= Format ================= */
function useMoney() {
  const { currency } = useStore();
  const c = CFG.currencies.find((x) => x.code === currency) || CFG.currencies[0];
  return useCallback((ngn, { compact = false } = {}) => {
    const v = ngn * c.rate;
    if (compact) {
      if (v >= 1e9) return c.symbol + (v / 1e9).toFixed(v >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B";
      if (v >= 1e6) return c.symbol + (v / 1e6).toFixed(v >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
      if (v >= 1e3) return c.symbol + Math.round(v / 1e3) + "K";
    }
    return c.symbol + Math.round(v).toLocaleString("en-NG");
  }, [c]);
}
const typeLabel = (id, plural) => { const t = CFG.propertyTypes.find((x) => x.id === id); return t ? (plural ? t.plural : t.label) : "Properties"; };
const agentById = (id) => DB.AGENTS.find((a) => a.id === id);
const initials = (n) => n.split(" ").map((x) => x[0]).join("").slice(0, 2);
const fmtDate = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/* ================= Icons (stroke, 24 grid) ================= */
const ICONS = {
  logo: <><path d="M5 19 19 5" /><path d="M9 5h10v10" /><path d="M5 12l3-3" /><path d="M12 19l3-3" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  home: <><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1Z" /></>,
  building: <><rect x="5" y="3" width="10" height="18" rx="1" /><path d="M15 9h4v12h-4M8 7h1M11 7h1M8 11h1M11 11h1M8 15h1M11 15h1" /></>,
  bed: <><path d="M3 18V7M21 18v-5a3 3 0 0 0-3-3H10v8M3 14h18M3 18h18" /><circle cx="6.5" cy="11" r="1.5" /></>,
  bath: <><path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z" /><path d="M6 12V5.5A2.5 2.5 0 0 1 10.5 4l.5.5M7 20l-1 2M17 20l1 2" /></>,
  area: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M4 9h16M9 20V9" /></>,
  money: <><circle cx="12" cy="12" r="9" /><path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6.5v11" /></>,
  heart: <path d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.4 3.9 4.5 7 4.5c2 0 3.4 1.2 5 3 1.6-1.8 3-3 5-3 3.1 0 5.3 2.9 4.2 6.2C19.5 15.4 12 20 12 20Z" />,
  heartF: <path fill="currentColor" d="M12 20s-7.5-4.6-9.2-9.3C1.7 7.4 3.9 4.5 7 4.5c2 0 3.4 1.2 5 3 1.6-1.8 3-3 5-3 3.1 0 5.3 2.9 4.2 6.2C19.5 15.4 12 20 12 20Z" />,
  star: <path fill="currentColor" stroke="none" d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z" />,
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  wa: <><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7Z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2Z" /></>,
  chevD: <path d="m6 9 6 6 6-6" />, chevR: <path d="m9 6 6 6-6 6" />, chevL: <path d="m15 6-6 6 6 6" />, chevU: <path d="m6 15 6-6 6 6" />,
  arrowR: <path d="M5 12h14M13 6l6 6-6 6" />, arrowL: <path d="M19 12H5M11 6l-6 6 6 6" />,
  plus: <path d="M12 5v14M5 12h14" />, minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />, check: <path d="m5 12.5 4.5 4.5L19 7" />,
  checkC: <><circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" /><path d="m8 12.5 2.8 2.8L16 10" stroke="#fff" /></>,
  more: <><circle cx="5" cy="12" r="1.3" fill="currentColor" /><circle cx="12" cy="12" r="1.3" fill="currentColor" /><circle cx="19" cy="12" r="1.3" fill="currentColor" /></>,
  share: <><path d="M12 4v11M8 8l4-4 4 4" /><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></>,
  flag: <path d="M5 21V4h11l-2 4 2 4H5" />, eyeOff: <><path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-3 3.5M6.4 7.4C4.2 9 3 12 3 12s4 6 9 6a8.6 8.6 0 0 0 3.6-.8" /></>,
  eye: <><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />, sort: <path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4" />,
  sliders: <><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />, map: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2Z" /><path d="M9 4v14M15 6v14" /></>,
  split: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M12 4v16" /></>,
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  cal: <><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" /><path d="m9 12 2 2 4-4" /></>,
  verified: <><path fill="currentColor" stroke="none" d="m12 2 2.4 1.8 3-.2.9 2.8 2.5 1.8-1 2.8 1 2.8-2.5 1.8-.9 2.8-3-.2L12 22l-2.4-1.8-3 .2-.9-2.8-2.5-1.8 1-2.8-1-2.8 2.5-1.8.9-2.8 3 .2Z" /><path d="m8.5 12 2.3 2.3 4.7-4.6" stroke="#fff" /></>,
  houseCheck: <><path d="M3 11 12 4l9 7" /><path d="M5 10v10h6M19 10v4" /><path d="m14 19 2 2 4-4" /></>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4Z" /><circle cx="12" cy="13" r="3.5" /></>,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />, edit: <path d="M4 20h4L19 9l-4-4L4 16Z" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>,
  pause: <path d="M9 5v14M15 5v14" />, refresh: <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4" />,
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4ZM10 21h4" />, cancel: <><circle cx="12" cy="12" r="9" /><path d="M6 6l12 12" /></>,
  card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>, receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2ZM9 8h6M9 12h6" />,
  lang: <path d="M4 5h9M8.5 3v2M6 5c0 4 3 7 6 8M11 5c0 4-3 7-6 9M13 21l4-10 4 10M14.5 18h5" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />, info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  compare: <path d="M8 4v16M16 4v16M4 8l4-4 4 4M12 16l4 4 4-4" />, calc: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01" /></>,
  history: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 8v4l3 2" />, zoomIn: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5M8 11h6M11 8v6" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3M18 5l2 2" /></>, spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />,
  kitchen: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M4 9h16M8 6h.01M11 6h.01M9 13v4" /></>,
  pool: <path d="M3 18c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0 3-1 4.5 0M8 15V5a2 2 0 0 1 4 0M14 15V5a2 2 0 0 1 4 0M8 9h6" />,
  tree: <path d="M12 21v-6M7 15h10l-5-11Z" />, car: <path d="M5 16V11l2-5h10l2 5v5M3 16h18M7 19v-3M17 19v-3M7 11h10" />,
  wave: <path d="M3 9c3-3 6 3 9 0s6 3 9 0M3 15c3-3 6 3 9 0s6 3 9 0" />, bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6Z" />,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />, gym: <path d="M3 12h18M6 8v8M18 8v8M4 10v4M20 10v4" />,
  doc: <><path d="M6 3h8l4 4v14H6Z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>, logout: <path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10" />,
  dash: <><rect x="3" y="3" width="8" height="10" rx="2" /><rect x="13" y="3" width="8" height="6" rx="2" /><rect x="13" y="11" width="8" height="10" rx="2" /><rect x="3" y="15" width="8" height="6" rx="2" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" /></>,
  ig: <><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.5" /><path d="M17 7h.01" /></>,
  xlogo: <path d="M5 4l14 16M19 4 5 20" />, li: <><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M8 11v5M8 8h.01M12 16v-5M12 13a2 2 0 0 1 4 0v3" /></>
};
function Icon({ n, s = 18, w = 1.7, style, className }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none", ...style }} className={className} aria-hidden="true">{ICONS[n] || ICONS.info}</svg>;
}
const AMENITY_ICON = { "Swimming pool": "pool", "Smart home system": "bolt", "Fully equipped kitchen": "kitchen", "Home office space": "building", "Garden & patio": "tree", "24/7 security": "shield", "2-car garage": "car", "Ocean view": "wave", "Gym": "gym", "Boys' quarters": "home", "Elevator": "chevU", "Inverter / solar backup": "sun" };

/* ================= Tabs — the one tab system =================
   items: config array [{id,label,icon}] · value/onChange OR param (URL-synced)
   variant: '' | 'lime' | 'chips' | 'under' | 'onDark' ; ARIA tablist + arrow keys + sliding pill */
function Tabs({ items, value, onChange, param, def, variant = "", size, fill, label = "Tabs", push = true, className = "", idPrefix }) {
  const q = useQueryState(param || "__none", def ?? items[0].id, { push });
  const cur = param ? q[0] : value;
  const set = param ? q[1] : onChange;
  const ref = useRef(null);
  const [pill, setPill] = useState(null);
  const measure = useCallback(() => {
    const root = ref.current; if (!root) return;
    const el = root.querySelector('[aria-selected="true"]');
    if (!el) return setPill(null);
    setPill({ x: el.offsetLeft, w: el.offsetWidth });
    // keep active tab visible in scrollable lists
    if (root.scrollWidth > root.clientWidth) {
      const l = el.offsetLeft - 24, r = el.offsetLeft + el.offsetWidth + 24;
      if (l < root.scrollLeft) root.scrollTo({ left: l, behavior: "smooth" });
      else if (r > root.scrollLeft + root.clientWidth) root.scrollTo({ left: r - root.clientWidth, behavior: "smooth" });
    }
  }, []);
  useLayoutEffect(measure, [cur, items, measure]);
  useEffect(() => {
    const ro = new ResizeObserver(measure); ref.current && ro.observe(ref.current);
    document.fonts && document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, [measure]);
  const onKey = (e) => {
    const i = items.findIndex((t) => t.id === cur);
    let n = null;
    if (e.key === "ArrowRight") n = (i + 1) % items.length;
    if (e.key === "ArrowLeft") n = (i - 1 + items.length) % items.length;
    if (e.key === "Home") n = 0; if (e.key === "End") n = items.length - 1;
    if (n !== null) { e.preventDefault(); set(items[n].id); requestAnimationFrame(() => ref.current.querySelectorAll('[role="tab"]')[n]?.focus()); }
  };
  const pre = idPrefix || param || label.replace(/\W/g, "");
  return (
    <div ref={ref} role="tablist" aria-label={label} onKeyDown={onKey} className={`tabs ${variant} ${size || ""} ${fill ? "fill" : ""} ${className}`}>
      {pill && <span className="pill" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />}
      {items.map((t) => (
        <button key={t.id} role="tab" id={`tab-${pre}-${t.id}`} aria-controls={`panel-${pre}`} aria-selected={cur === t.id} tabIndex={cur === t.id ? 0 : -1} className="tab" onClick={() => set(t.id)}>
          {t.icon && <Icon n={t.icon} s={15} />}{t.label}{t.count != null && <span style={{ opacity: .6, fontWeight: 500 }}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
/* crossfading tab panel */
function TabPanel({ id, k, children, style }) {
  return <div role="tabpanel" id={`panel-${id}`} key={k} className="xfade" style={style}>{children}</div>;
}

/* ================= Primitives ================= */
function Stars({ v, count, size = 13 }) {
  return <span className="stars"><b style={{ fontWeight: 600 }}>{v}</b><i>{[0, 1, 2, 3, 4].map((i) => <Icon key={i} n="star" s={size} style={{ opacity: v >= i + 0.5 ? 1 : .25 }} />)}</i>{count != null && <span className="mute">({count})</span>}</span>;
}
function Avatar({ src, name, s = 36, ring }) {
  return src ? <img src={src} alt={name} className="avatar" style={{ width: s, height: s, objectPosition: "50% 20%", boxShadow: ring ? "0 0 0 2px #fff" : "" }} />
    : <span className="avatar" style={{ width: s, height: s, fontSize: s * 0.36, boxShadow: ring ? "0 0 0 2px #fff" : "" }}>{initials(name)}</span>;
}
function Modal({ open, onClose, title, children, width, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    const on = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && ref.current) {
        const f = ref.current.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", on); document.body.style.overflow = "hidden";
    setTimeout(() => ref.current?.querySelector("input,button")?.focus(), 30);
    return () => { document.removeEventListener("keydown", on); document.body.style.overflow = ""; prev && prev.focus && prev.focus(); };
  }, [open]);
  if (!open) return null;
  return ReactDOM.createPortal(<>
    <div className="scrim" onClick={onClose} />
    <div ref={ref} className="modal" role="dialog" aria-modal="true" aria-label={title} style={width ? { width: `min(${width}px, calc(100vw - 32px))` } : null}>
      {title && <div className="modal-h"><h3 style={{ fontSize: 20 }}>{title}</h3><button className="icon-btn sm" onClick={onClose} aria-label="Close"><Icon n="x" s={16} /></button></div>}
      <div className="modal-b">{children}</div>
      {footer && <div style={{ padding: "0 22px 22px", display: "flex", gap: 10, justifyContent: "flex-end" }}>{footer}</div>}
    </div>
  </>, document.body);
}
function Drawer({ open, onClose, title, children, side, footer }) {
  useEffect(() => { if (!open) return; const on = (e) => e.key === "Escape" && onClose(); document.addEventListener("keydown", on); document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", on); document.body.style.overflow = ""; }; }, [open]);
  if (!open) return null;
  return ReactDOM.createPortal(<>
    <div className="scrim" onClick={onClose} />
    <aside className={"drawer " + (side || "")} role="dialog" aria-modal="true" aria-label={title}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--line)" }}><h3 style={{ fontSize: 19 }}>{title}</h3><button className="icon-btn sm" onClick={onClose} aria-label="Close"><Icon n="x" s={16} /></button></div>
      <div style={{ flex: 1, overflow: "auto", padding: 22 }}>{children}</div>
      {footer && <div style={{ padding: "14px 22px", borderTop: "1px solid var(--line)", display: "flex", gap: 10 }}>{footer}</div>}
    </aside>
  </>, document.body);
}
function Confirm({ open, onClose, onOk, title, body, ok = "Confirm", danger }) {
  return <Modal open={open} onClose={onClose} title={title} width={440} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className={"btn " + (danger ? "btn-danger" : "btn-dark")} onClick={() => { onOk(); onClose(); }}>{ok}</button></>}>
    <p className="mute" style={{ fontSize: 14 }}>{body}</p>
  </Modal>;
}
function Accordion({ title, children, defaultOpen, compact }) {
  const [o, setO] = useState(!!defaultOpen);
  return <div className={"acc" + (o ? " open" : "")} style={compact ? { borderBottom: 0 } : null}>
    <button aria-expanded={o} onClick={() => setO(!o)} style={compact ? { padding: "14px 0", fontSize: 15, fontFamily: "var(--f-body)", fontWeight: 500 } : null}>{title}<Icon n="chevD" className="chev" /></button>
    <div className="acc-b"><div>{children}</div></div>
  </div>;
}
/* scroll reveal with stagger */
function Reveal({ children, delay = 0, as: Tag = "div", className = "", style }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { rootMargin: "0px 0px -8% 0px" });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={"rv " + className} style={{ transitionDelay: delay + "ms", ...style }}>{children}</Tag>;
}
function CountUp({ to, dur = 1100, fmt = (v) => Math.round(v).toLocaleString(), deps = [] }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, t0;
    const step = (t) => { t0 ??= t; const p = Math.min(1, (t - t0) / dur); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step); return () => cancelAnimationFrame(raf);
  }, [to, ...deps]);
  return <>{fmt(v)}</>;
}
function useClickOutside(ref, fn) {
  useEffect(() => { const on = (e) => ref.current && !ref.current.contains(e.target) && fn(); document.addEventListener("mousedown", on); return () => document.removeEventListener("mousedown", on); }, [fn]);
}
function useMedia(q) {
  const [m, setM] = useState(() => matchMedia(q).matches);
  useEffect(() => { const mm = matchMedia(q); const on = () => setM(mm.matches); mm.addEventListener("change", on); return () => mm.removeEventListener("change", on); }, [q]);
  return m;
}
function Pagination({ page, pages, onPage }) {
  const nums = pages <= 7 ? [...Array(pages)].map((_, i) => i + 1) : page <= 4 ? [1, 2, 3, 4, "…", pages] : page >= pages - 3 ? [1, "…", pages - 3, pages - 2, pages - 1, pages] : [1, "…", page - 1, page, page + 1, "…", pages];
  return <nav aria-label="Pagination" style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
    <button className="icon-btn sm" style={{ border: 0 }} disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Previous page"><Icon n="chevL" s={16} /></button>
    {nums.map((n, i) => n === "…" ? <span key={i} className="mute" style={{ width: 20, textAlign: "center" }}>…</span> :
      <button key={i} onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined} style={{ width: 32, height: 32, borderRadius: "50%", fontSize: 13, fontWeight: 600, background: n === page ? "var(--ink)" : "transparent", color: n === page ? "#fff" : "var(--ink-2)", transition: "background .2s" }}>{n}</button>)}
    <button className="icon-btn sm" style={{ border: 0 }} disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Next page"><Icon n="chevR" s={16} /></button>
  </nav>;
}
function EmptyState({ icon = "search", title, body, action }) {
  return <div style={{ textAlign: "center", padding: "56px 20px", border: "1px dashed #D5D9D7", borderRadius: 22, background: "#FAFBFA" }}>
    <div style={{ width: 56, height: 56, borderRadius: 18, background: "var(--lime-100)", color: "var(--g700)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icon n={icon} s={24} /></div>
    <h3 style={{ fontSize: 20 }}>{title}</h3>
    {body && <p className="mute" style={{ marginTop: 6, fontSize: 14, maxWidth: 420, marginInline: "auto" }}>{body}</p>}
    {action && <div style={{ marginTop: 18 }}>{action}</div>}
  </div>;
}
function Logo({ to = "/" }) {
  return <Link to={to} className="logo" aria-label={CFG.brand.name + " home"}><Icon n="logo" s={20} w={2.2} />{CFG.brand.name}</Link>;
}
function Field({ label, error, children, style }) {
  return <div className="field" style={style}><label>{label}</label>{children}{error && <span className="err-msg">{error}</span>}</div>;
}
const waLink = (phone, text) => `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

Object.assign(window, { RouterProvider, useRoute, navigate, setQuery, useQueryState, buildHash, Link, StoreProvider, useStore, useMoney, typeLabel, agentById, initials, fmtDate, Icon, AMENITY_ICON, Tabs, TabPanel, Stars, Avatar, Modal, Drawer, Confirm, Accordion, Reveal, CountUp, useClickOutside, useMedia, Pagination, EmptyState, Logo, Field, waLink, LS, CFG, DB });
