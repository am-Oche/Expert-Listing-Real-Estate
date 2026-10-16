/* Shared components: Header, Footer, SearchBar, Carousel, ListingCard (H/V), MapView */

/* ================= Header ================= */
function Header({ mode = "solid" }) {
  const { path, query } = useRoute();
  const { currency, setCurrency, saved, plan } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [curOpen, setCurOpen] = useState(false);
  const [acct, setAcct] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const cRef = useRef(null), aRef = useRef(null);
  useClickOutside(cRef, () => setCurOpen(false));
  useClickOutside(aRef, () => setAcct(false));
  useEffect(() => { const on = () => setScrolled(window.scrollY > 40); on(); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  const isOn = (to) => {
    const [p, qs] = to.split("?"); if (p !== path) return false;
    if (!qs) return true; const q = Object.fromEntries(new URLSearchParams(qs));
    return Object.entries(q).every(([k, v]) => query[k] === v) && (q.type || !query.type || p !== "/search");
  };
  const cls = mode === "clear" ? "clear" + (scrolled ? " scrolled" : "") : mode;
  const cur = CFG.currencies.find((c) => c.code === currency);
  return <>
    <header className={"hdr " + cls}>
      <div className="wrap hdr-in">
        <button className="icon-btn burger" style={{ background: "transparent", borderColor: "currentColor", color: "inherit" }} onClick={() => setDrawer(true)} aria-label="Open menu"><Icon n="menu" /></button>
        <Logo />
        <nav className="nav" aria-label="Main">{CFG.nav.map((n) => <Link key={n.label} to={n.to} className={isOn(n.to) ? "on" : ""}>{n.label}</Link>)}</nav>
        <div className="hdr-r" style={{ marginLeft: "auto" }}>
          <div ref={cRef} style={{ position: "relative" }} className="hide-m">
            <button className="cur-btn" onClick={() => setCurOpen(!curOpen)} aria-haspopup="menu" aria-expanded={curOpen}>{cur.symbol}{cur.code}<Icon n="chevD" s={14} /></button>
            {curOpen && <div className="menu" role="menu" style={{ minWidth: 150 }}>{CFG.currencies.map((c) => <button key={c.code} role="menuitemradio" aria-checked={c.code === currency} onClick={() => { setCurrency(c.code); setCurOpen(false); }}><span style={{ width: 18 }}>{c.symbol}</span>{c.code}{c.code === currency && <Icon n="check" s={15} style={{ marginLeft: "auto", color: "var(--g600)" }} />}</button>)}</div>}
          </div>
          <Link to="/post" className={"btn btn-sm hide-m " + (mode === "solid" ? "btn-dark" : "btn-dark")} style={mode !== "solid" ? { background: "#111" } : null}><Icon n="plus" s={15} />Post a Listing</Link>
          <div ref={aRef} style={{ position: "relative" }}>
            <button className="acct" onClick={() => setAcct(!acct)} aria-label="Account menu" aria-expanded={acct}><Icon n="user" s={18} /></button>
            {acct && <div className="menu" role="menu">
              <div style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px 12px" }}><Avatar src={DB.IMG.agents[0]} name="Zara Balogun" s={38} /><div><div style={{ fontWeight: 600, fontSize: 14 }}>Zara Balogun</div><div className="mute" style={{ fontSize: 12 }}>{plan === "pro" ? "Pro Plan" : "Free Plan"} · Agent</div></div></div>
              <hr className="hair" style={{ margin: "0 6px 6px" }} />
              <Link to="/dashboard" onClick={() => setAcct(false)}><Icon n="dash" s={16} />Dashboard</Link>
              <Link to="/saved" onClick={() => setAcct(false)}><Icon n="heart" s={16} />Saved <span className="badge badge-gray" style={{ marginLeft: "auto" }}>{saved.length}</span></Link>
              <Link to="/dashboard?tab=subscription" onClick={() => setAcct(false)}><Icon n="card" s={16} />Subscription</Link>
              <Link to="/admin" onClick={() => setAcct(false)}><Icon n="shield" s={16} />Admin</Link>
              <hr className="hair" style={{ margin: "6px" }} />
              <button onClick={() => setAcct(false)}><Icon n="logout" s={16} />Sign out</button>
            </div>}
          </div>
        </div>
      </div>
    </header>
    <Drawer open={drawer} onClose={() => setDrawer(false)} title={CFG.brand.name} side="left" footer={<Link to="/post" className="btn btn-dark btn-block" onClick={() => setDrawer(false)}><Icon n="plus" s={15} />Post a Listing</Link>}>
      <nav style={{ display: "flex", flexDirection: "column" }}>{CFG.nav.map((n) => <Link key={n.label} to={n.to} onClick={() => setDrawer(false)} style={{ padding: "14px 4px", borderBottom: "1px solid var(--line)", fontSize: 16, display: "flex", justifyContent: "space-between", fontWeight: isOn(n.to) ? 700 : 500, color: isOn(n.to) ? "var(--g700)" : "" }}>{n.label}<Icon n="chevR" s={16} /></Link>)}</nav>
      <div style={{ marginTop: 22 }}><div className="mute" style={{ fontSize: 12, marginBottom: 8 }}>Currency</div><Tabs items={CFG.currencies.map((c) => ({ id: c.code, label: c.symbol + " " + c.code }))} value={currency} onChange={setCurrency} label="Currency" fill size="sm" /></div>
    </Drawer>
    <nav className="bottom-nav" aria-label="Mobile">{CFG.mobileNav.map((n) => <Link key={n.label} to={n.to} className={(n.icon === "plus" ? "post " : "") + (path === n.to ? "on" : "")} aria-label={n.label}><Icon n={n.icon} s={n.icon === "plus" ? 20 : 21} />{n.icon !== "plus" && n.label}</Link>)}</nav>
  </>;
}

/* ================= Footer ================= */
function Footer() {
  const { toast, currency, setCurrency } = useStore();
  const [email, setEmail] = useState("");
  const cols = [
    ["Buy", [["Lagos homes", "/search?action=buy&city=lagos"], ["Abuja homes", "/search?action=buy&city=abuja"], ["Villas", "/search?action=buy&type=villa"], ["New builds", "/search?action=buy&newBuild=1"]]],
    ["Rent", [["Apartments", "/search?action=rent&type=apartment"], ["Duplexes", "/search?action=rent&type=duplex"], ["Short-let", "/search?action=rent&type=hotel-apartment"], ["Rent calculator", "/property/" + DB.LISTINGS[1].id + "?tab=overview"]]],
    ["Commercial", [["Offices", "/search?type=commercial"], ["Buildings", "/search?type=building"], ["Floors", "/search?type=floor"]]],
    ["Professionals", [["Find agents", "/agents"], ["Developers", "/agents?tab=developers"], ["Snagging", "/snagging"], ["Pricing", "/dashboard?tab=subscription"]]],
    ["Company", [["About", "/about"], ["Contact", "/contact"], ["Admin", "/admin"]]],
    ["Legal", [["Terms", "/about"], ["Privacy (NDPA)", "/about"], ["Report a listing", "/contact"]]]
  ];
  return <footer style={{ background: "var(--g900)", color: "rgba(255,255,255,.82)", paddingTop: 72 }}>
    <div className="wrap">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px,1.3fr) 3fr", gap: 48 }} className="ft-grid">
        <div>
          <Logo />
          <p style={{ marginTop: 14, fontSize: 14, maxWidth: 300, color: "rgba(255,255,255,.6)" }}>{CFG.brand.tagline}</p>
          <form onSubmit={(e) => { e.preventDefault(); if (!/^\S+@\S+\.\S+$/.test(email)) return toast("Enter a valid email", "info"); toast("Subscribed — check your inbox"); setEmail(""); }} style={{ marginTop: 24, display: "flex", background: "rgba(255,255,255,.08)", borderRadius: 999, padding: 4, maxWidth: 340 }}>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email for new listings" aria-label="Email" style={{ flex: 1, background: "transparent", border: 0, outline: 0, color: "#fff", padding: "0 14px", fontSize: 13.5, minWidth: 0 }} />
            <button className="btn btn-lime btn-sm">Subscribe</button>
          </form>
          <div style={{ display: "flex", gap: 8, marginTop: 22 }}>{["ig", "xlogo", "li"].map((s) => <a key={s} href="#" onClick={(e) => e.preventDefault()} className="icon-btn sm" style={{ background: "rgba(255,255,255,.08)", borderColor: "transparent", color: "#fff" }} aria-label={s}><Icon n={s} s={15} /></a>)}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 28 }}>
          {cols.map(([h, ls]) => <div key={h}><div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{h}</div>{ls.map(([l, to]) => <Link key={l} to={to} style={{ display: "block", fontSize: 13.5, padding: "5px 0", color: "rgba(255,255,255,.6)" }}>{l}</Link>)}</div>)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,.1)", marginTop: 56, padding: "22px 0 28px", fontSize: 12.5, color: "rgba(255,255,255,.5)" }}>
        <span>© 2026 {CFG.brand.name}. All rights reserved. {CFG.demoData && "· Listings, agents and reviews shown are demo data."}</span>
        <Tabs items={CFG.currencies.map((c) => ({ id: c.code, label: c.symbol + c.code }))} value={currency} onChange={setCurrency} variant="onDark" size="sm" label="Currency" />
      </div>
    </div>
  </footer>;
}

/* ================= SearchBar ================= */
function Seg({ label, icon, value, children, open, setOpen, id, minW, flex }) {
  const ref = useRef(null);
  useClickOutside(ref, () => open === id && setOpen(null));
  return <div ref={ref} className="seg" style={{ minWidth: minW, flex }} onClick={(e) => { if (e.target.closest(".dd")) return; setOpen(open === id ? null : id); }} role="button" tabIndex={0} aria-expanded={open === id} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !e.target.closest("input") && (e.preventDefault(), setOpen(open === id ? null : id))}>
    <small>{label}</small>
    <div className="val">{icon && <Icon n={icon} s={17} />}{value}<Icon n="chevD" s={15} className="chev" /></div>
    {open === id && <div className="dd" onClick={(e) => e.stopPropagation()}>{children}</div>}
  </div>;
}
function useLocationSuggestions(text) {
  return useMemo(() => {
    const t = text.trim().toLowerCase();
    const out = [];
    CFG.cities.forEach((c) => {
      if (!t || c.name.toLowerCase().includes(t)) out.push({ kind: "City", label: c.name, city: c.id });
      c.areas.forEach((a) => (!t ? false : a.toLowerCase().includes(t)) && out.push({ kind: "Area", label: a + ", " + c.name, city: c.id, area: a }));
    });
    if (!t) CFG.cities[0].areas.slice(0, 4).forEach((a) => out.push({ kind: "Popular in Lagos", label: a, city: "lagos", area: a }));
    return out.slice(0, 9);
  }, [text]);
}
function SearchBar({ initial = {}, showAction = true, onSearch, compact }) {
  const [q, setQ] = useState({ action: "buy", city: "", area: "", type: "apartment", beds: "1 Bed / 1 Bath", min: "", max: "", ...initial });
  useEffect(() => setQ((s) => ({ ...s, ...initial })), [JSON.stringify(initial)]);
  const [open, setOpen] = useState(null);
  const [locText, setLocText] = useState("");
  const [hl, setHl] = useState(0);
  const sugg = useLocationSuggestions(locText);
  const money = useMoney();
  const locLabel = q.area ? q.area : q.city ? CFG.cities.find((c) => c.id === q.city)?.name : "";
  const go = () => {
    setOpen(null);
    const out = { action: q.action, city: q.city, area: q.area, type: q.type, beds: q.beds === "Any" ? "" : q.beds, min: q.min, max: q.max };
    onSearch ? onSearch(out) : navigate(buildHash("/search", out).slice(1));
  };
  const pickLoc = (s) => { setQ({ ...q, city: s.city, area: s.area || "" }); setLocText(""); setOpen(null); };
  const priceSteps = q.action === "rent" ? [400000, 800000, 1500000, 2500000, 5000000, 10000000] : [20e6, 50e6, 100e6, 200e6, 400e6, 800e6];
  return <div className="sbar" role="search" style={compact ? { borderRadius: 18 } : null}>
    {showAction && <Seg id="action" open={open} setOpen={setOpen} label="Action" value={q.action === "buy" ? "Buy" : "Rent"} minW={110} flex="0 0 auto">
      {CFG.tabs.heroAction.map((a) => <button key={a.id} className={q.action === a.id ? "hl" : ""} onClick={() => { setQ({ ...q, action: a.id, min: "", max: "" }); setOpen(null); }}>{a.label}{q.action === a.id && <Icon n="check" s={15} style={{ marginLeft: "auto" }} />}</button>)}
    </Seg>}
    <Seg id="loc" open={open} setOpen={setOpen} label="Location" icon="pin" minW={170} value={
      <input value={open === "loc" ? locText : locLabel} placeholder={open === "loc" ? "City, area or estate" : "Select location"} onFocus={() => setOpen("loc")} onChange={(e) => { setLocText(e.target.value); setHl(0); setOpen("loc"); }}
        onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setHl((h) => Math.min(h + 1, sugg.length - 1)); } if (e.key === "ArrowUp") { e.preventDefault(); setHl((h) => Math.max(h - 1, 0)); } if (e.key === "Enter") { e.preventDefault(); sugg[hl] ? pickLoc(sugg[hl]) : go(); } }} aria-label="Location" role="combobox" aria-expanded={open === "loc"} aria-autocomplete="list" />}>
      {q.city && <button onClick={() => pickLoc({ city: "", area: "" })} className="mute"><Icon n="x" s={14} />Clear location</button>}
      {sugg.map((s, i) => <React.Fragment key={s.label}>{(i === 0 || sugg[i - 1].kind !== s.kind) && <div className="grp">{s.kind}</div>}<button className={i === hl ? "hl" : ""} onMouseEnter={() => setHl(i)} onClick={() => pickLoc(s)}><Icon n={s.area ? "pin" : "building"} s={15} style={{ color: "var(--mute)" }} />{s.label}</button></React.Fragment>)}
      {!sugg.length && <div className="mute" style={{ padding: 12, fontSize: 13 }}>No matches — try "Lekki" or "Maitama"</div>}
    </Seg>
    <Seg id="type" open={open} setOpen={setOpen} label="Property type" icon="building" minW={160} value={typeLabel(q.type)}>
      {CFG.propertyTypes.map((t) => <button key={t.id} className={q.type === t.id ? "hl" : ""} onClick={() => { setQ({ ...q, type: t.id }); setOpen(null); }}>{t.label}{q.type === t.id && <Icon n="check" s={15} style={{ marginLeft: "auto" }} />}</button>)}
    </Seg>
    <Seg id="beds" open={open} setOpen={setOpen} label="Beds & Baths" icon="bed" minW={160} value={q.beds || "Any"}>
      {CFG.bedsOptions.map((b) => <button key={b} className={q.beds === b ? "hl" : ""} onClick={() => { setQ({ ...q, beds: b }); setOpen(null); }}>{b}</button>)}
    </Seg>
    <Seg id="price" open={open} setOpen={setOpen} label="Price" icon="money" minW={190} value={<span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{q.min ? money(+q.min, { compact: true }) : "Min price"}<span className="mute" style={{ margin: "0 8px" }}>–</span>{q.max ? money(+q.max, { compact: true }) : "Max price"}</span>}>
      <div className="price-dd">
        <div style={{ fontSize: 12, color: "var(--mute)", marginBottom: 8 }}>{q.action === "rent" ? "Annual rent" : "Sale price"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <select className="select" value={q.min} onChange={(e) => setQ({ ...q, min: e.target.value })} aria-label="Min price"><option value="">No min</option>{priceSteps.map((p) => <option key={p} value={p}>{money(p, { compact: true })}</option>)}</select>
          <select className="select" value={q.max} onChange={(e) => setQ({ ...q, max: e.target.value })} aria-label="Max price"><option value="">No max</option>{priceSteps.map((p) => <option key={p} value={p}>{money(p, { compact: true })}</option>)}</select>
        </div>
        <button className="btn btn-dark btn-sm btn-block" style={{ marginTop: 10 }} onClick={() => setOpen(null)}>Done</button>
      </div>
    </Seg>
    {compact ? <button className="go" onClick={go} aria-label="Search" style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--lime)", display: "grid", placeItems: "center", flex: "none" }}><Icon n="search" s={19} /></button>
      : <button className="btn btn-lime go" style={{ minWidth: 130, height: 46 }} onClick={go}>Search</button>}
  </div>;
}
/* mobile stacked search card (reference: phone mockup) */
function MobileSearch({ initial = {}, onSearch }) {
  const [q, setQ] = useState({ action: "buy", city: "lagos", type: "apartment", beds: "1 Bed / 1 Bath", min: "", max: "", ...initial });
  const go = () => { const out = { ...q, beds: q.beds === "Any" ? "" : q.beds }; onSearch ? onSearch(out) : navigate(buildHash("/search", out).slice(1)); };
  const row = { display: "flex", flexDirection: "column", gap: 2, padding: "10px 0", borderBottom: "1px solid var(--line)" };
  const sel = { border: 0, outline: 0, background: "transparent", fontSize: 15, fontWeight: 500, padding: "2px 0", width: "100%", appearance: "none" };
  return <div className="card" style={{ padding: "6px 16px 16px", borderRadius: 22, boxShadow: "var(--sh-2)", color: "var(--ink)" }}>
    <div style={{ paddingTop: 10 }}><Tabs items={CFG.tabs.heroAction} value={q.action} onChange={(v) => setQ({ ...q, action: v })} fill size="sm" label="Buy or rent" /></div>
    <label style={row}><small className="mute">Location</small><span style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon n="pin" s={17} /><select style={sel} value={q.city} onChange={(e) => setQ({ ...q, city: e.target.value })}>{CFG.cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><Icon n="chevD" s={15} /></span></label>
    <label style={row}><small className="mute">Property type</small><span style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon n="building" s={17} /><select style={sel} value={q.type} onChange={(e) => setQ({ ...q, type: e.target.value })}>{CFG.propertyTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select><Icon n="chevD" s={15} /></span></label>
    <label style={row}><small className="mute">Beds & Baths</small><span style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon n="bed" s={17} /><select style={sel} value={q.beds} onChange={(e) => setQ({ ...q, beds: e.target.value })}>{CFG.bedsOptions.map((b) => <option key={b}>{b}</option>)}</select><Icon n="chevD" s={15} /></span></label>
    <div style={{ ...row, borderBottom: 0 }}><small className="mute">Price</small><span style={{ display: "flex", gap: 8, alignItems: "center" }}><Icon n="money" s={17} /><input style={sel} placeholder="Min price" inputMode="numeric" value={q.min} onChange={(e) => setQ({ ...q, min: e.target.value.replace(/\D/g, "") })} /><span className="mute">–</span><input style={sel} placeholder="Max price" inputMode="numeric" value={q.max} onChange={(e) => setQ({ ...q, max: e.target.value.replace(/\D/g, "") })} /></span></div>
    <button className="btn btn-lime btn-block btn-lg" onClick={go}>Search</button>
  </div>;
}

/* ================= Photo carousel (swipe + inertia) ================= */
function Carousel({ photos, alt, children, onClick, height }) {
  const [i, setI] = useState(0);
  const [dx, setDx] = useState(0);
  const st = useRef(null);
  const n = photos.length;
  const go = (k) => setI((x) => Math.max(0, Math.min(n - 1, x + k)));
  const down = (e) => { st.current = { x: e.clientX, t: performance.now(), moved: false }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { if (!st.current) return; const d = e.clientX - st.current.x; if (Math.abs(d) > 4) st.current.moved = true; setDx(d); };
  const up = (e) => {
    if (!st.current) return; const d = e.clientX - st.current.x; const v = d / (performance.now() - st.current.t);
    if (d < -50 || v < -0.4) go(1); else if (d > 50 || v > 0.4) go(-1);
    const moved = st.current.moved; st.current = null; setDx(0);
    if (!moved && onClick) onClick();
  };
  return <div className="car" style={{ height }} aria-roledescription="carousel" aria-label={alt}>
    <div className={"track" + (dx ? " drag" : "")} style={{ transform: `translateX(calc(${-i * 100}% + ${dx}px))` }} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={() => { st.current = null; setDx(0); }}>
      {photos.map((p, k) => <img key={k} src={p} alt={`${alt} — photo ${k + 1} of ${n}`} loading={k ? "lazy" : "eager"} draggable="false" />)}
    </div>
    {i > 0 && <button className="nav-b" style={{ left: 10 }} onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Previous photo"><Icon n="chevL" s={15} /></button>}
    {i < n - 1 && <button className="nav-b" style={{ right: 10 }} onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Next photo"><Icon n="chevR" s={15} /></button>}
    <div className="dots">{photos.slice(0, 6).map((_, k) => <i key={k} className={k === Math.min(i, 5) ? "on" : ""} />)}</div>
    {children}
  </div>;
}
function Heart({ id, style }) {
  const { saved, toggleSave, toast } = useStore();
  const on = saved.includes(id);
  const [pop, setPop] = useState(0);
  return <button className={"heart" + (on ? " on" : "") + (pop ? " pop" : "")} key={pop} style={style} aria-pressed={on} aria-label={on ? "Remove from saved" : "Save listing"}
    onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSave(id); setPop((p) => p + 1); toast(on ? "Removed from saved" : "Saved to your list", on ? "heart" : "heartF"); }}>
    <Icon n={on ? "heartF" : "heart"} s={22} w={1.9} />
  </button>;
}
function Specs({ l, small }) {
  const st = small ? { height: 28, fontSize: 12 } : null;
  return <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
    {l.beds > 0 && <span className="chip" style={st}><Icon n="bed" s={15} />{l.beds} Beds</span>}
    <span className="chip" style={st}><Icon n="bath" s={15} />{l.baths} Baths</span>
    <span className="chip" style={st}><Icon n="area" s={15} />{l.size.toLocaleString()} m²</span>
  </div>;
}
function PriceTag({ l, size = 22 }) {
  const money = useMoney();
  return <div className="lc-price price" style={{ fontSize: size }}>{money(l.price)}{l.action === "rent" && <span>/{l.rentPeriod}</span>}</div>;
}
function ListedAgo({ d }) { return <>{d === 0 ? "Listed today" : `Listed ${d} day${d > 1 ? "s" : ""} ago`}</>; }

function CardMenu({ l }) {
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState(false);
  const ref = useRef(null);
  const { toast, toggleCompare, compare } = useStore();
  useClickOutside(ref, () => setOpen(false));
  const share = async () => { const url = location.href.split("#")[0] + "#/property/" + l.id; try { if (navigator.share) await navigator.share({ title: l.title, url }); else { await navigator.clipboard.writeText(url); toast("Link copied"); } } catch {} setOpen(false); };
  return <div ref={ref} style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
    <button className="icon-btn" onClick={() => setOpen(!open)} aria-label="More actions" aria-haspopup="menu"><Icon n="more" s={18} /></button>
    {open && <div className="menu" role="menu">
      <button onClick={share}><Icon n="share" s={16} />Share listing</button>
      <button onClick={() => { toggleCompare(l.id); setOpen(false); }}><Icon n="compare" s={16} />{compare.includes(l.id) ? "Remove from compare" : "Add to compare"}</button>
      <button onClick={() => { setOpen(false); toast("Listing hidden from your results", "eyeOff"); }}><Icon n="eyeOff" s={16} />Hide</button>
      <button onClick={() => { setOpen(false); setReport(true); }} style={{ color: "var(--red)" }}><Icon n="flag" s={16} />Report listing</button>
    </div>}
    <ReportModal open={report} onClose={() => setReport(false)} l={l} />
  </div>;
}
function ReportModal({ open, onClose, l }) {
  const [r, setR] = useState("");
  const { toast } = useStore();
  const reasons = ["Property is no longer available", "Price or fees are misleading", "Photos don't match the property", "Suspected fraud / fake agent", "Duplicate listing", "Other"];
  return <Modal open={open} onClose={onClose} title="Report this listing" width={460} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn btn-dark" disabled={!r} onClick={() => { toast("Report sent to our moderation team"); onClose(); setR(""); }}>Send report</button></>}>
    <p className="mute" style={{ fontSize: 13.5, marginBottom: 12 }}>{l.title} · {l.id}. Reports are reviewed within 24 hours.</p>
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{reasons.map((x) => <label key={x} className="check" style={{ padding: "10px 12px", border: "1px solid " + (r === x ? "var(--g600)" : "var(--line)"), borderRadius: 12, color: "var(--ink)", fontSize: 14 }}><input type="radio" name="rr" checked={r === x} onChange={() => setR(x)} />{x}</label>)}</div>
  </Modal>;
}

/* (a) horizontal result card */
function ListingCardH({ l, hot, onHover, compareMode }) {
  const a = agentById(l.agentId);
  const { compare, toggleCompare } = useStore();
  const msg = `Hello ${a.name.split(" ")[0]}, I'm interested in ${l.title} (${l.id}) on ${CFG.brand.name}.`;
  return <article className={"lc-h" + (hot ? " hot" : "")} onMouseEnter={() => onHover && onHover(l.id)} onMouseLeave={() => onHover && onHover(null)} data-id={l.id}>
    <Carousel photos={l.photos.slice(0, 6)} alt={l.title} onClick={() => navigate("/property/" + l.id)}>
      <div className="tl">{l.badge && <span className="badge badge-white">{l.badge}</span>}{l.verified && <span className="badge badge-white" style={{ color: "var(--g700)" }}><Icon n="verified" s={13} />Verified</span>}</div>
      <Heart id={l.id} />
    </Carousel>
    <div className="body">
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <Link to={"/property/" + l.id} style={{ flex: 1, minWidth: 0 }}>
          <PriceTag l={l} />
          <div className="lc-title" style={{ marginTop: 2 }}>{l.title}, {typeLabel(l.type)}</div>
        </Link>
        {compareMode ? <label className="check" style={{ color: "var(--ink)", alignItems: "center" }}><input type="checkbox" checked={compare.includes(l.id)} onChange={() => toggleCompare(l.id)} />Compare</label> : <CardMenu l={l} />}
      </div>
      <Stars v={l.rating} />
      <div className="loc" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}><Icon n="pin" s={15} />{l.area}, {l.cityName}, Nigeria</div>
      <Specs l={l} />
      {l.agentVisited ? <span className="trust" style={{ alignSelf: "flex-start" }}><Icon n="houseCheck" s={15} />Agent visited this property on {l.agentVisited}</span>
        : l.developerId ? <span className="trust" style={{ alignSelf: "flex-start" }}><Icon n="building" s={15} />Published by Developer</span> : null}
      <div className="lc-agent">
        <Avatar src={a.photo} name={a.name} s={38} />
        <div style={{ minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{a.name}{a.verified && <Icon n="verified" s={14} style={{ color: "var(--g600)" }} />}</div><div className="mute" style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}><Icon n="clock" s={13} /><ListedAgo d={l.daysAgo} /></div></div>
        <div className="contact-pill" role="group" aria-label="Contact agent">
          <a href={"tel:" + a.phone} aria-label="Call agent"><Icon n="phone" s={16} /></a>
          <a href={`mailto:${a.email}?subject=${encodeURIComponent(l.title)}`} aria-label="Email agent"><Icon n="mail" s={16} /></a>
          <a href={waLink(a.phone, msg)} target="_blank" rel="noopener" aria-label="WhatsApp agent"><Icon n="wa" s={16} /></a>
        </div>
      </div>
    </div>
  </article>;
}
/* (b) vertical grid card */
function ListingCardV({ l, imgH = 210 }) {
  const a = agentById(l.agentId);
  return <article className="lc-v">
    <div style={{ height: imgH }}><Carousel photos={l.photos.slice(0, 5)} alt={l.title} onClick={() => navigate("/property/" + l.id)}>
      <div className="tl">{l.badge && <span className="badge badge-white">{l.badge}</span>}<span className="badge badge-white">{l.rating} <Icon n="star" s={12} style={{ color: "var(--star)" }} /></span></div>
      <Heart id={l.id} />
    </Carousel></div>
    <Link to={"/property/" + l.id} className="body">
      <PriceTag l={l} size={20} />
      <div className="lc-title">{l.title}, {typeLabel(l.type)}</div>
      <div className="loc" style={{ fontSize: 12.5, display: "flex", gap: 5, alignItems: "center" }}><Icon n="pin" s={14} />{l.area}, {l.cityName}, Nigeria</div>
      <Specs l={l} small />
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--line)" }}><Avatar src={a.photo} name={a.name} s={26} /><span style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</span><span className="mute" style={{ marginLeft: "auto", fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}><Icon n="clock" s={13} />{l.daysAgo || 1}d ago</span></div>
    </Link>
  </article>;
}
function CardSkeleton() {
  return <div className="lc-h" style={{ pointerEvents: "none" }}><div className="skel" style={{ minHeight: 220, borderRadius: 0 }} /><div className="body"><div className="skel" style={{ height: 24, width: "55%" }} /><div className="skel" style={{ height: 14, width: "35%" }} /><div className="skel" style={{ height: 14, width: "45%" }} /><div style={{ display: "flex", gap: 6 }}>{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 30, width: 76 }} />)}</div><div className="skel" style={{ height: 38, marginTop: 18 }} /></div></div>;
}

/* ================= MapView (Leaflet + OSM, price pills, grid clustering, sync) ================= */
function MapView({ listings, hot, setHot, onSearchArea, style, center, zoom = 12, single, onPick, picker }) {
  const box = useRef(null), map = useRef(null), layer = useRef(null), markers = useRef({});
  const money = useMoney();
  const [moved, setMoved] = useState(false);
  const [sel, setSel] = useState(null);
  const [full, setFull] = useState(false);
  const [zoomLv, setZoomLv] = useState(zoom);
  const internal = useRef(false);
  useEffect(() => {
    if (!window.L || map.current) return;
    const c = center || (listings[0] ? [listings[0].lat, listings[0].lng] : DB.CITY_CENTER.lagos);
    const m = L.map(box.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: !single }).setView(c, zoom);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", { attribution: "© OpenStreetMap © CARTO", maxZoom: 19 }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    m.on("moveend", () => { setZoomLv(m.getZoom()); if (!internal.current) setMoved(true); internal.current = false; });
    if (picker) m.on("click", (e) => onPick && onPick([e.latlng.lat, e.latlng.lng]));
    map.current = m;
    setTimeout(() => m.invalidateSize(), 60);
    return () => { m.remove(); map.current = null; };
  }, []);
  useEffect(() => { const ro = new ResizeObserver(() => map.current && map.current.invalidateSize()); box.current && ro.observe(box.current); return () => ro.disconnect(); }, []);
  // fit to listings when set changes
  const key = listings.map((l) => l.id).join();
  useEffect(() => {
    const m = map.current; if (!m || !listings.length || single || picker) return;
    internal.current = true;
    m.fitBounds(L.latLngBounds(listings.map((l) => [l.lat, l.lng])).pad(0.15), { maxZoom: 14, animate: true });
    setMoved(false);
  }, [key]);
  useEffect(() => { if (picker && center && map.current) { internal.current = true; map.current.setView(center, map.current.getZoom()); } }, [picker && center && center.join()]);
  // render markers with simple pixel-grid clustering
  useEffect(() => {
    const m = map.current; if (!m) return;
    layer.current.clearLayers(); markers.current = {};
    const cells = {};
    const z = m.getZoom();
    listings.forEach((l) => {
      const p = m.project([l.lat, l.lng], z); const k = z >= 14 || single ? l.id : Math.floor(p.x / 70) + ":" + Math.floor(p.y / 44);
      (cells[k] ||= []).push(l);
    });
    Object.values(cells).forEach((g) => {
      if (g.length === 1) {
        const l = g[0];
        const html = picker ? `<div class="pin hot" style="width:22px;height:22px;padding:0;border:4px solid #fff;background:var(--g700)"></div>` : `<div class="pin ${l.badge === "Luxury" || l.price > 3e8 ? "lime" : ""}" data-pin="${l.id}">${money(l.price, { compact: true })}</div>`;
        const mk = L.marker([l.lat, l.lng], { icon: L.divIcon({ className: "el-pin", html, iconSize: [0, 0] }), keyboard: true, title: l.title, draggable: !!picker }).addTo(layer.current);
        if (picker) mk.on("dragend", (e) => { const ll = e.target.getLatLng(); onPick && onPick([ll.lat, ll.lng]); });
        else {
          mk.on("mouseover", () => setHot && setHot(l.id)); mk.on("mouseout", () => setHot && setHot(null));
          mk.on("click", () => { setSel(l); setHot && setHot(l.id); const el = document.querySelector(`.lc-h[data-id="${l.id}"]`); if (el) { const sc = el.closest("[data-scroll]") || null; if (sc) sc.scrollTo({ top: el.offsetTop - 20, behavior: "smooth" }); } });
        }
        markers.current[l.id] = mk;
      } else {
        const lat = g.reduce((s, l) => s + l.lat, 0) / g.length, lng = g.reduce((s, l) => s + l.lng, 0) / g.length;
        const mk = L.marker([lat, lng], { icon: L.divIcon({ className: "el-pin", html: `<div class="pin cluster">${g.length}</div>`, iconSize: [0, 0] }) }).addTo(layer.current);
        mk.on("click", () => { internal.current = true; m.fitBounds(L.latLngBounds(g.map((l) => [l.lat, l.lng])).pad(0.3)); });
        g.forEach((l) => (markers.current[l.id] = mk));
      }
    });
  }, [key, zoomLv, money, picker && center && center.join()]);
  // hover sync → pin highlight
  useEffect(() => {
    document.querySelectorAll(".pin.hot[data-pin]").forEach((e) => e.classList.remove("hot", "bounce"));
    if (hot) { const e = document.querySelector(`.pin[data-pin="${hot}"]`); if (e) { e.classList.add("hot", "bounce"); e.parentElement.parentElement && (e.closest(".leaflet-marker-icon").style.zIndex = 9999); } }
  }, [hot, zoomLv, key]);
  const searchArea = () => { const b = map.current.getBounds(); onSearchArea && onSearchArea({ n: b.getNorth(), s: b.getSouth(), e: b.getEast(), w: b.getWest() }); setMoved(false); };
  return <div className="map" style={{ ...style, ...(full ? { position: "fixed", inset: 0, zIndex: 150, borderRadius: 0, height: "auto" } : null) }}>
    <div ref={box} style={{ position: "absolute", inset: 0 }} />
    {!window.L && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }} className="mute">Map loading…</div>}
    <div className="map-ctl">
      <button onClick={() => setFull(!full)} aria-label={full ? "Exit full screen" : "Full screen map"}><Icon n={full ? "x" : "expand"} s={16} /></button>
      <button onClick={() => map.current.zoomIn()} aria-label="Zoom in"><Icon n="plus" s={16} /></button>
      <button onClick={() => map.current.zoomOut()} aria-label="Zoom out"><Icon n="minus" s={16} /></button>
    </div>
    {moved && onSearchArea && <div className="map-area"><button className="btn btn-dark btn-sm" onClick={searchArea} style={{ boxShadow: "var(--sh-2)" }}><Icon n="search" s={15} />Search this area</button></div>}
    {sel && !single && !picker && <div className="map-pop"><MiniCard l={sel} onClose={() => setSel(null)} /></div>}
  </div>;
}
function MiniCard({ l, onClose }) {
  return <div className="card" style={{ display: "flex", gap: 12, padding: 10, borderRadius: 18, boxShadow: "var(--sh-3)", maxWidth: 420, margin: "0 auto", position: "relative" }}>
    <img src={l.photos[0]} alt="" style={{ width: 96, height: 80, objectFit: "cover", borderRadius: 12 }} />
    <Link to={"/property/" + l.id} style={{ flex: 1, minWidth: 0 }}><PriceTag l={l} size={17} /><div style={{ fontSize: 13 }}>{l.title}</div><div className="loc" style={{ fontSize: 12 }}>{l.area}, {l.cityName}</div></Link>
    <button className="icon-btn sm" onClick={onClose} aria-label="Close" style={{ position: "absolute", top: 8, right: 8 }}><Icon n="x" s={14} /></button>
  </div>;
}

/* ================= Lightbox (shared-element-ish zoom from source) ================= */
function Lightbox({ photos, start, onClose, title, origin }) {
  const [i, setI] = useState(start);
  const [zoom, setZoom] = useState(false);
  const [entered, setEntered] = useState(false);
  const sx = useRef(null);
  useEffect(() => { requestAnimationFrame(() => setEntered(true)); }, []);
  useEffect(() => {
    const on = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") setI((x) => (x + 1) % photos.length); if (e.key === "ArrowLeft") setI((x) => (x - 1 + photos.length) % photos.length); };
    document.addEventListener("keydown", on); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", on); document.body.style.overflow = ""; };
  }, []);
  const o = origin && !entered ? { transform: `translate(${origin.x - innerWidth / 2}px, ${origin.y - innerHeight / 2}px) scale(${origin.s})`, opacity: .6 } : { transform: zoom ? "scale(1.8)" : "none" };
  return ReactDOM.createPortal(<div role="dialog" aria-modal="true" aria-label={title + " photos"} style={{ position: "fixed", inset: 0, zIndex: 400, background: entered ? "rgba(6,14,10,.94)" : "rgba(6,14,10,0)", transition: "background .4s", display: "flex", flexDirection: "column", color: "#fff" }}>
    <div style={{ display: "flex", alignItems: "center", padding: "14px 20px", gap: 12 }}>
      <span style={{ fontSize: 14 }}>{title}</span><span className="num" style={{ opacity: .6, fontSize: 13 }}>{i + 1} / {photos.length}</span>
      <button className="icon-btn" onClick={() => setZoom(!zoom)} style={{ marginLeft: "auto", background: "rgba(255,255,255,.1)", borderColor: "transparent", color: "#fff" }} aria-label="Zoom"><Icon n="zoomIn" s={17} /></button>
      <button className="icon-btn" onClick={onClose} style={{ background: "rgba(255,255,255,.1)", borderColor: "transparent", color: "#fff" }} aria-label="Close gallery"><Icon n="x" s={17} /></button>
    </div>
    <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "grid", placeItems: "center" }}
      onPointerDown={(e) => (sx.current = e.clientX)} onPointerUp={(e) => { const d = e.clientX - (sx.current ?? e.clientX); if (d < -50) setI((x) => (x + 1) % photos.length); if (d > 50) setI((x) => (x - 1 + photos.length) % photos.length); sx.current = null; }}>
      <img key={i} src={photos[i]} alt={`${title} photo ${i + 1}`} onDoubleClick={() => setZoom(!zoom)} draggable="false" style={{ maxWidth: "min(1200px,92vw)", maxHeight: "100%", objectFit: "contain", borderRadius: 14, transition: "transform .55s var(--ease), opacity .4s", cursor: zoom ? "zoom-out" : "zoom-in", ...o }} />
      <button onClick={() => setI((i - 1 + photos.length) % photos.length)} className="icon-btn" style={{ position: "absolute", left: 20, background: "#fff", color: "#111" }} aria-label="Previous"><Icon n="chevL" /></button>
      <button onClick={() => setI((i + 1) % photos.length)} className="icon-btn" style={{ position: "absolute", right: 20, background: "#fff", color: "#111" }} aria-label="Next"><Icon n="chevR" /></button>
    </div>
    <div style={{ display: "flex", gap: 8, padding: 16, justifyContent: "center", overflowX: "auto" }}>{photos.map((p, k) => <button key={k} onClick={() => setI(k)} aria-label={"Photo " + (k + 1)} style={{ flex: "none", borderRadius: 10, overflow: "hidden", outline: k === i ? "2px solid var(--lime)" : "none", outlineOffset: 2, opacity: k === i ? 1 : .5, transition: "opacity .2s" }}><img src={p} alt="" style={{ width: 72, height: 52, objectFit: "cover" }} /></button>)}</div>
  </div>, document.body);
}

/* compare tray + table */
function CompareTray() {
  const { compare, clearCompare, toggleCompare } = useStore();
  const [open, setOpen] = useState(false);
  const money = useMoney();
  const ls = compare.map((id) => DB.LISTINGS.find((l) => l.id === id)).filter(Boolean);
  if (!ls.length) return null;
  const rows = [["Price", (l) => money(l.price) + (l.action === "rent" ? "/yr" : "")], ["Type", (l) => typeLabel(l.type)], ["Location", (l) => l.area + ", " + l.cityName], ["Bedrooms", (l) => l.beds || "—"], ["Bathrooms", (l) => l.baths], ["Size", (l) => l.size + " m²"], ["Price / m²", (l) => money(Math.round(l.price / l.size))], ["Year built", (l) => l.year], ["Title document", (l) => l.tenure || "Lease"], ["Service charge", (l) => money(l.serviceCharge) + "/yr"], ["Power", (l) => l.power], ["Verified", (l) => (l.verified ? "Yes" : "Pending")], ["Agent", (l) => agentById(l.agentId).name]];
  return <>
    <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", zIndex: 120, background: "var(--ink)", color: "#fff", borderRadius: 999, padding: "8px 8px 8px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--sh-3)", animation: "tIn .4s var(--spring)" }}>
      <div style={{ display: "flex" }}>{ls.map((l, i) => <img key={l.id} src={l.photos[0]} alt="" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid #111", marginLeft: i ? -8 : 0 }} />)}</div>
      <span style={{ fontSize: 13.5 }}>{ls.length} of 3 selected</span>
      <button className="btn btn-lime btn-sm" onClick={() => setOpen(true)} disabled={ls.length < 2}>Compare</button>
      <button className="icon-btn sm" style={{ background: "transparent", borderColor: "rgba(255,255,255,.2)", color: "#fff" }} onClick={clearCompare} aria-label="Clear compare"><Icon n="x" s={14} /></button>
    </div>
    <Modal open={open} onClose={() => setOpen(false)} title="Compare listings" width={900}>
      <div style={{ overflowX: "auto" }}><table className="tbl" style={{ minWidth: 600 }}>
        <thead><tr><th></th>{ls.map((l) => <th key={l.id} style={{ verticalAlign: "top" }}><img src={l.photos[0]} alt="" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 12, marginBottom: 8 }} /><div style={{ color: "var(--ink)", fontWeight: 600, fontSize: 14 }}>{l.title}</div><button className="mute" style={{ fontSize: 12, marginTop: 4 }} onClick={() => toggleCompare(l.id)}>Remove</button></th>)}</tr></thead>
        <tbody>{rows.map(([k, f]) => <tr key={k}><td className="mute" style={{ whiteSpace: "nowrap" }}>{k}</td>{ls.map((l) => <td key={l.id}>{f(l)}</td>)}</tr>)}</tbody>
      </table></div>
    </Modal>
  </>;
}

Object.assign(window, { Header, Footer, SearchBar, MobileSearch, Carousel, Heart, Specs, PriceTag, ListedAgo, CardMenu, ReportModal, ListingCardH, ListingCardV, CardSkeleton, MapView, MiniCard, Lightbox, CompareTray });
