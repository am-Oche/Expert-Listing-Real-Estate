/* Search results page — URL-synced filters, List | Split | Map, filters drawer, save search, compare */
function bedsNum(b) { const m = (b || "").match(/^(\d)/); return m ? +m[1] : 0; }
function applyFilters(q) {
  let ls = DB.LISTINGS.filter((l) =>
    (!q.action || l.action === q.action) && (!q.city || l.city === q.city) && (!q.area || l.area === q.area) && (!q.type || l.type === q.type) &&
    (!q.beds || l.beds >= bedsNum(q.beds)) && (!q.min || l.price >= +q.min) && (!q.max || l.price <= +q.max) &&
    (!q.bathsMin || l.baths >= +q.bathsMin) && (!q.verified || l.verified) && (!q.visited || l.agentVisited) && (!q.dev || l.developerId) &&
    (!q.furnished || l.furnished) && (!q.newBuild || l.newBuild) && (!q.sizeMin || l.size >= +q.sizeMin) && (!q.age || l.daysAgo <= +q.age) &&
    (!q.amen || q.amen.split("|").every((a) => l.amenities.includes(a))) &&
    (!q.bbox || (() => { const [n, s, e, w] = q.bbox.split(",").map(Number); return l.lat <= n && l.lat >= s && l.lng <= e && l.lng >= w; })()));
  const sorters = { new: (a, b) => a.daysAgo - b.daysAgo, low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, rating: (a, b) => b.rating - a.rating, size: (a, b) => b.size - a.size };
  // Pro agents get priority placement under "Recommended"
  ls.sort(sorters[q.sort] || ((a, b) => (agentById(b.agentId).plan === "pro") - (agentById(a.agentId).plan === "pro") || a.daysAgo - b.daysAgo));
  return ls;
}
function resultsTitle(q, n) {
  const t = q.type ? typeLabel(q.type, true) : "Properties";
  const where = q.area || (q.city ? CFG.cities.find((c) => c.id === q.city)?.name : "Nigeria");
  return { main: `${t} for ${q.action === "rent" ? "Rent" : "Sale"} in ${q.bbox ? "this map area" : where}`, n };
}
const SORTS = [["", "Recommended"], ["new", "Newest"], ["low", "Price: low to high"], ["high", "Price: high to low"], ["rating", "Top rated"], ["size", "Largest"]];

function Search() {
  const { query } = useRoute();
  const isMobile = useMedia("(max-width:900px)");
  const q = { action: "buy", ...query };
  const [view] = useQueryState("view", isMobile ? "list" : "split");
  const [hot, setHot] = useState(null);
  const [filters, setFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const sortRef = useRef(null);
  useClickOutside(sortRef, () => setSortOpen(false));
  const results = useMemo(() => applyFilters(q), [JSON.stringify(q)]);
  const filterKey = JSON.stringify({ ...q, view: undefined, sort: undefined });
  useEffect(() => { setLoading(true); setPage(1); const t = setTimeout(() => setLoading(false), 380); return () => clearTimeout(t); }, [filterKey]);
  const per = 8; const pages = Math.max(1, Math.ceil(results.length / per));
  const shown = results.slice(0, page * per); // "load more" (infinite) pattern
  const sentinel = useRef(null);
  useEffect(() => { const el = sentinel.current; if (!el) return; const io = new IntersectionObserver(([e]) => e.isIntersecting && setPage((p) => Math.min(p + 1, pages))); io.observe(el); return () => io.disconnect(); }, [pages, loading, view]);
  const t = resultsTitle(q, results.length);
  const onSearch = (out) => setQuery({ ...out, bbox: undefined }, { push: true });
  const chips = [];
  const label = { verified: "Verified only", visited: "Agent visited", dev: "Developer published", furnished: "Furnished", newBuild: "New builds" };
  Object.keys(label).forEach((k) => q[k] && chips.push([k, label[k]]));
  if (q.area) chips.push(["area", q.area]); else if (q.city) chips.push(["city", CFG.cities.find((c) => c.id === q.city)?.name]);
  if (q.type) chips.push(["type", typeLabel(q.type)]);
  if (q.beds) chips.push(["beds", q.beds]);
  if (q.min || q.max) chips.push(["price", "Price range"]);
  if (q.bathsMin) chips.push(["bathsMin", q.bathsMin + "+ baths"]);
  if (q.sizeMin) chips.push(["sizeMin", q.sizeMin + "+ m²"]);
  if (q.age) chips.push(["age", "Last " + q.age + " days"]);
  if (q.amen) q.amen.split("|").forEach((a) => chips.push(["amen:" + a, a]));
  if (q.bbox) chips.push(["bbox", "Map area"]);
  const removeChip = (k) => {
    if (k === "price") return setQuery({ min: undefined, max: undefined }, { push: true });
    if (k === "city") return setQuery({ city: undefined, area: undefined }, { push: true });
    if (k.startsWith("amen:")) { const rest = q.amen.split("|").filter((a) => a !== k.slice(5)); return setQuery({ amen: rest.join("|") || undefined }, { push: true }); }
    setQuery({ [k]: undefined }, { push: true });
  };
  const clearAll = () => setQuery(Object.fromEntries(Object.keys(q).filter((k) => !["action", "view", "sort"].includes(k)).map((k) => [k, undefined])), { push: true });
  const list = <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {loading ? [0, 1, 2].map((i) => <CardSkeleton key={i} />) : !results.length ? <EmptyState title="No properties match these filters" body="Try widening your price range, removing a filter, or searching a nearby area." action={<div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}><button className="btn btn-dark" onClick={clearAll}>Clear all filters</button>{CFG.cities.filter((c) => c.id !== q.city).slice(0, 2).map((c) => <button key={c.id} className="btn btn-ghost" onClick={() => setQuery({ city: c.id, area: undefined, bbox: undefined }, { push: true })}>Try {c.name}</button>)}</div>} />
      : shown.map((l, i) => <div key={l.id} style={{ animation: `riseIn .5s var(--ease) ${(i % per) * 50}ms both` }}><ListingCardH l={l} hot={hot === l.id} onHover={setHot} compareMode={compareMode} /></div>)}
    {!loading && shown.length < results.length && <div ref={sentinel} style={{ display: "flex", justifyContent: "center", padding: 12 }}><button className="btn btn-ghost" onClick={() => setPage(page + 1)}>Load more ({results.length - shown.length} remaining)</button></div>}
  </div>;
  return <div className="page-in" style={{ background: "#fff", minHeight: "100vh" }}>
    <style>{`@keyframes riseIn{from{opacity:0;transform:translateY(16px)}}`}</style>
    <Header mode="green" />
    <div style={{ background: "var(--g700)", paddingBottom: 26, paddingTop: 6 }}><div className="wrap">{isMobile ? <MobileSearch initial={q} onSearch={onSearch} /> : <SearchBar initial={q} onSearch={onSearch} compact />}</div></div>
    <div className="wrap" style={{ paddingTop: 28, maxWidth: view === "list" ? 1000 : 1400 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
        <h1 style={{ fontSize: "clamp(22px,2.4vw,28px)", fontWeight: 500, flex: "1 1 360px" }} aria-live="polite">{t.main} <span className="mute">({loading ? "…" : t.n} {t.n === 1 ? "property" : "properties"})</span></h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {!isMobile && <Tabs items={CFG.tabs.searchView} param="view" def={isMobile ? "list" : "split"} size="sm" label="Results view" />}
          <div ref={sortRef} style={{ position: "relative" }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setSortOpen(!sortOpen)} aria-haspopup="menu"><Icon n="sort" s={15} />{q.sort ? SORTS.find((s) => s[0] === q.sort)[1] : "Sort By"}</button>
            {sortOpen && <div className="menu" role="menu">{SORTS.map(([k, l]) => <button key={k} role="menuitemradio" aria-checked={(q.sort || "") === k} onClick={() => { setQuery({ sort: k || undefined }); setSortOpen(false); }}>{l}{(q.sort || "") === k && <Icon n="check" s={15} style={{ marginLeft: "auto" }} />}</button>)}</div>}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters(true)}><Icon n="sliders" s={15} />Filters{chips.length > 0 && <span className="badge badge-green" style={{ height: 20, padding: "0 7px" }}>{chips.length}</span>}</button>
          <button className={"btn btn-sm " + (compareMode ? "btn-dark" : "btn-ghost")} onClick={() => setCompareMode(!compareMode)} aria-pressed={compareMode}><Icon n="compare" s={15} />Compare</button>
          <button className="btn btn-lime btn-sm" onClick={() => setSaveOpen(true)}><Icon n="bell" s={15} />Save search</button>
        </div>
      </div>
      {chips.length > 0 && <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
        {chips.map(([k, l]) => <button key={k} className="chip" onClick={() => removeChip(k)} style={{ background: "var(--g50)", borderColor: "var(--g100)", color: "var(--g700)" }} aria-label={"Remove filter " + l}>{l}<Icon n="x" s={13} /></button>)}
        <button className="chip" style={{ border: 0, textDecoration: "underline", color: "var(--ink)" }} onClick={clearAll}>Clear all</button>
      </div>}
      <div role="tabpanel" id="panel-view" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : view === "split" ? "minmax(0,1.25fr) minmax(0,1fr)" : "1fr", gap: 22, paddingBottom: 60 }}>
        {(view !== "map" || isMobile) && !(isMobile && view === "map") && <div>{list}</div>}
        {(!isMobile && view !== "list") || (isMobile && view === "map") ? <div style={{ position: view === "split" ? "sticky" : "relative", top: 92, height: view === "map" ? "calc(100vh - 220px)" : "calc(100vh - 116px)", minHeight: 460 }}>
          <MapView listings={results} hot={hot} setHot={setHot} onSearchArea={(b) => setQuery({ bbox: [b.n, b.s, b.e, b.w].map((x) => x.toFixed(4)).join(","), city: undefined, area: undefined }, { push: true })} />
        </div> : null}
      </div>
    </div>
    {isMobile && <div style={{ position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", zIndex: 110 }}><button className="btn btn-dark" style={{ boxShadow: "var(--sh-3)" }} onClick={() => setQuery({ view: view === "map" ? "list" : "map" }, { push: true })}><Icon n={view === "map" ? "list" : "map"} s={16} />{view === "map" ? "List" : "Map"}</button></div>}
    <FiltersPanel open={filters} onClose={() => setFilters(false)} q={q} count={(qq) => applyFilters(qq).length} isMobile={isMobile} />
    <SaveSearch open={saveOpen} onClose={() => setSaveOpen(false)} q={q} title={t.main} />
    <CompareTray />
    <Footer />
  </div>;
}

function FiltersPanel({ open, onClose, q, count, isMobile }) {
  const [f, setF] = useState(q);
  useEffect(() => { if (open) setF(q); }, [open]);
  const money = useMoney();
  const max = f.action === "rent" ? 15e6 : 1e9;
  const n = count(f);
  const amen = f.amen ? f.amen.split("|") : [];
  const tog = (k) => setF({ ...f, [k]: f[k] ? undefined : "1" });
  const body = <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
    <div><div style={{ fontWeight: 600, marginBottom: 10 }}>Price range</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }} className="num"><span>{money(+f.min || 0, { compact: true })}</span><span>{f.max ? money(+f.max, { compact: true }) : "Any"}</span></div>
      <input type="range" className="range" min={0} max={max} step={max / 100} value={f.min || 0} onChange={(e) => setF({ ...f, min: +e.target.value || undefined })} aria-label="Minimum price" />
      <input type="range" className="range" min={0} max={max} step={max / 100} value={f.max || max} onChange={(e) => setF({ ...f, max: +e.target.value >= max ? undefined : +e.target.value })} aria-label="Maximum price" />
    </div>
    <div><div style={{ fontWeight: 600, marginBottom: 10 }}>Bedrooms</div><Tabs items={["Any", "1", "2", "3", "4", "5"].map((x) => ({ id: x, label: x === "Any" ? x : x + "+" }))} value={f.beds ? String(bedsNum(f.beds)) : "Any"} onChange={(v) => setF({ ...f, beds: v === "Any" ? undefined : v + " Beds" })} fill size="sm" label="Bedrooms" /></div>
    <div><div style={{ fontWeight: 600, marginBottom: 10 }}>Bathrooms</div><Tabs items={["Any", "1", "2", "3", "4"].map((x) => ({ id: x, label: x === "Any" ? x : x + "+" }))} value={f.bathsMin || "Any"} onChange={(v) => setF({ ...f, bathsMin: v === "Any" ? undefined : v })} fill size="sm" label="Bathrooms" /></div>
    <div><div style={{ fontWeight: 600, marginBottom: 10 }}>Property type</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{CFG.propertyTypes.map((t) => <button key={t.id} className="chip" onClick={() => setF({ ...f, type: f.type === t.id ? undefined : t.id })} style={f.type === t.id ? { background: "var(--g700)", color: "#fff", borderColor: "var(--g700)" } : null} aria-pressed={f.type === t.id}>{t.label}</button>)}</div></div>
    <div><div style={{ fontWeight: 600, marginBottom: 10 }}>Trust & listing</div><div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[["verified", "Verified listings only"], ["visited", "Agent visited the property"], ["dev", "Published by developer"], ["furnished", "Furnished"], ["newBuild", "New builds"]].map(([k, l]) => <label key={k} className="check" style={{ color: "var(--ink)", fontSize: 14 }}><input type="checkbox" checked={!!f[k]} onChange={() => tog(k)} />{l}</label>)}
    </div></div>
    <div><div style={{ fontWeight: 600, marginBottom: 10 }}>Amenities</div><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{CFG.amenities.map((a) => { const on = amen.includes(a); return <button key={a} className="chip" aria-pressed={on} onClick={() => { const nx = on ? amen.filter((x) => x !== a) : [...amen, a]; setF({ ...f, amen: nx.join("|") || undefined }); }} style={on ? { background: "var(--lime-100)", borderColor: "var(--lime)", color: "#2F5A0F" } : null}><Icon n={AMENITY_ICON[a]} s={14} />{a}</button>; })}</div></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Field label="Min size (m²)"><input className="input" inputMode="numeric" value={f.sizeMin || ""} onChange={(e) => setF({ ...f, sizeMin: e.target.value.replace(/\D/g, "") || undefined })} /></Field>
      <Field label="Listing age"><select className="select" value={f.age || ""} onChange={(e) => setF({ ...f, age: e.target.value || undefined })}><option value="">Any time</option><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></Field>
    </div>
  </div>;
  const apply = () => { const patch = {}; ["min", "max", "beds", "bathsMin", "type", "verified", "visited", "dev", "furnished", "newBuild", "amen", "sizeMin", "age"].forEach((k) => (patch[k] = f[k])); setQuery(patch, { push: true }); onClose(); };
  const footer = <><button className="btn btn-ghost" onClick={() => setF({ action: f.action, view: f.view })}>Reset</button><button className="btn btn-dark" style={{ flex: 1 }} onClick={apply}>Show {n} {n === 1 ? "property" : "properties"}</button></>;
  if (isMobile && open) return ReactDOM.createPortal(<><div className="scrim" onClick={onClose} /><div role="dialog" aria-modal="true" aria-label="Filters" style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxHeight: "88vh", background: "#fff", borderRadius: "24px 24px 0 0", zIndex: 201, display: "flex", flexDirection: "column", animation: "sheetUp .4s var(--ease)" }}>
    <style>{`@keyframes sheetUp{from{transform:translateY(100%)}}`}</style>
    <div style={{ width: 40, height: 4, borderRadius: 4, background: "#ddd", margin: "10px auto 0" }} />
    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", alignItems: "center" }}><h3>Filters</h3><button className="icon-btn sm" onClick={onClose} aria-label="Close"><Icon n="x" s={15} /></button></div>
    <div style={{ overflow: "auto", padding: "0 20px 20px" }}>{body}</div><div style={{ display: "flex", gap: 10, padding: "12px 20px 20px", borderTop: "1px solid var(--line)" }}>{footer}</div></div></>, document.body);
  return <Drawer open={open} onClose={onClose} title="Filters" footer={footer}>{body}</Drawer>;
}

function SaveSearch({ open, onClose, q, title }) {
  const { searches, setSearches, toast } = useStore();
  const [freq, setFreq] = useState("daily");
  const [name, setName] = useState(title);
  useEffect(() => open && setName(title), [open]);
  return <Modal open={open} onClose={onClose} title="Save this search" width={480} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-dark" onClick={() => { const { view, ...rest } = q; setSearches([{ id: "s" + Date.now(), label: name, q: rest, freq: freq[0].toUpperCase() + freq.slice(1) }, ...searches]); toast("Search saved — we'll email new matches " + (freq === "instant" ? "instantly" : freq)); onClose(); }}>Save & create alert</button></>}>
    <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
    <div style={{ marginTop: 16 }}><div className="mute" style={{ fontSize: 12.5, marginBottom: 8 }}>Alert frequency</div><Tabs items={[{ id: "instant", label: "Instant" }, { id: "daily", label: "Daily" }, { id: "weekly", label: "Weekly" }, { id: "off", label: "Off" }]} value={freq} onChange={setFreq} fill label="Alert frequency" /></div>
    <p className="mute" style={{ fontSize: 12.5, marginTop: 14 }}>Alerts are sent to zara@luxeform.com. Manage them anytime under Saved.</p>
  </Modal>;
}

function Saved() {
  const { saved, searches, setSearches } = useStore();
  const [tab, setTab] = useQueryState("tab", "homes");
  const ls = saved.map((id) => DB.LISTINGS.find((l) => l.id === id)).filter(Boolean);
  return <div className="page-in"><Header />
    <div className="wrap" style={{ padding: "36px 24px 80px", maxWidth: 1100 }}>
      <h1 style={{ fontSize: 34 }}>Saved</h1>
      <div style={{ margin: "18px 0 26px" }}><Tabs items={[{ id: "homes", label: "Homes", count: ls.length }, { id: "searches", label: "Searches & alerts", count: searches.length }, { id: "recent", label: "Recently viewed" }]} param="tab" def="homes" label="Saved sections" /></div>
      <TabPanel id="tab" k={tab}>
        {tab === "homes" && (ls.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>{ls.map((l) => <ListingCardV key={l.id} l={l} />)}</div> : <EmptyState icon="heart" title="No saved homes yet" body="Tap the heart on any listing to keep it here." action={<Link to="/search" className="btn btn-dark">Start searching</Link>} />)}
        {tab === "searches" && (searches.length ? <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{searches.map((s) => <div key={s.id} className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--lime-100)", color: "var(--g700)", display: "grid", placeItems: "center" }}><Icon n="bell" /></div>
          <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 600 }}>{s.label}</div><div className="mute" style={{ fontSize: 12.5 }}>{applyFilters(s.q).length} matches · Alerts: {s.freq}</div></div>
          <Link to={buildHash("/search", s.q).slice(1)} className="btn btn-ghost btn-sm">View results</Link>
          <button className="icon-btn sm" onClick={() => setSearches(searches.filter((x) => x.id !== s.id))} aria-label="Delete saved search"><Icon n="trash" s={15} /></button>
        </div>)}</div> : <EmptyState icon="bell" title="No saved searches" body="Use 'Save search' on the results page to get alerts." />)}
        {tab === "recent" && <RecentGrid />}
      </TabPanel>
    </div><Footer /></div>;
}
function RecentGrid() {
  const { recent } = useStore();
  const ls = recent.map((id) => DB.LISTINGS.find((l) => l.id === id)).filter(Boolean);
  return ls.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>{ls.map((l) => <ListingCardV key={l.id} l={l} />)}</div> : <EmptyState icon="clock" title="Nothing viewed yet" body="Listings you open will show up here." />;
}

Object.assign(window, { Search, Saved, applyFilters, RecentGrid });
