/* Property detail page */
function Property({ id }) {
  const l = DB.LISTINGS.find((x) => x.id === id) || DB.LISTINGS[0];
  const a = agentById(l.agentId);
  const { pushRecent, saved, toggleSave, toast } = useStore();
  const money = useMoney();
  const isMobile = useMedia("(max-width:900px)");
  const [lb, setLb] = useState(null);
  const [report, setReport] = useState(false);
  const [tab, setTab] = useQueryState("tab", "overview");
  const tabsRef = useRef(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => { pushRecent(l.id); }, [l.id]);
  useEffect(() => { const on = () => tabsRef.current && setStuck(tabsRef.current.getBoundingClientRect().top <= 73); window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on); }, []);
  const openLb = (i, e) => { const r = e.currentTarget.getBoundingClientRect(); setLb({ i, origin: { x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.width / Math.min(1200, innerWidth * 0.92) } }); };
  const city = CFG.cities.find((c) => c.id === l.city);
  const share = async () => { const url = location.href; try { if (navigator.share) await navigator.share({ title: l.title, url }); else { await navigator.clipboard.writeText(url); toast("Link copied to clipboard"); } } catch {} };
  const isSaved = saved.includes(l.id);
  const similar = DB.LISTINGS.filter((x) => x.id !== l.id && x.action === l.action && (x.type === l.type || x.city === l.city)).slice(0, 4);
  const jsonld = { "@context": "https://schema.org", "@type": "RealEstateListing", name: l.title, url: location.href, image: l.photos, offers: { "@type": "Offer", price: l.price, priceCurrency: "NGN" }, address: { "@type": "PostalAddress", streetAddress: l.address, addressLocality: l.area, addressRegion: l.cityName, addressCountry: "NG" }, agent: { "@type": "RealEstateAgent", name: a.name } };
  useEffect(() => { document.title = `${l.title} · ${l.area} · ${CFG.brand.name}`; return () => (document.title = CFG.brand.name); }, [l.id]);
  return <div className="page-in">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />
    <Header />
    <div className="wrap" style={{ paddingTop: 22 }}>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to={`/search?action=${l.action}`}>{l.action === "buy" ? "Buy" : "Rent"}</Link><Icon n="chevR" s={13} />
        <Link to={`/search?action=${l.action}&city=${l.city}&type=${l.type}`}>{city.name} {typeLabel(l.type, true)}</Link><Icon n="chevR" s={13} />
        <Link to={`/search?action=${l.action}&city=${l.city}&area=${encodeURIComponent(l.area)}&type=${l.type}`}>{typeLabel(l.type, true)} for {l.action === "buy" ? "Sale" : "Rent"} in {l.area}</Link><Icon n="chevR" s={13} />
        <span>{l.title}</span>
      </nav>
      {/* Gallery */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.45fr 1fr", gap: 12, marginTop: 16, height: isMobile ? "auto" : 470 }}>
        <button onClick={(e) => openLb(0, e)} style={{ borderRadius: 22, overflow: "hidden", height: isMobile ? 280 : "100%", position: "relative" }} aria-label="Open gallery">
          <img src={l.photos[0]} alt={l.title + " main photo"} className="gimg" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <div className="tl" style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6 }}>{l.badge && <span className="badge badge-white">{l.badge}</span>}{l.verified && <span className="badge badge-white" style={{ color: "var(--g700)" }}><Icon n="verified" s={13} />Verified listing</span>}</div>
        </button>
        {!isMobile && <div style={{ display: "grid", gridTemplateRows: "1.25fr 1fr", gap: 12, minHeight: 0 }}>
          <button onClick={(e) => openLb(1, e)} style={{ borderRadius: 22, overflow: "hidden" }} aria-label="Photo 2"><img src={l.photos[1]} alt="" className="gimg" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, minHeight: 0 }}>
            <button onClick={(e) => openLb(2, e)} style={{ borderRadius: 22, overflow: "hidden" }} aria-label="Photo 3"><img src={l.photos[2]} alt="" className="gimg" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></button>
            <button onClick={(e) => openLb(3, e)} style={{ borderRadius: 22, overflow: "hidden", position: "relative" }} aria-label={`See all ${l.photos.length} photos`}><img src={l.photos[3]} alt="" className="gimg" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <span style={{ position: "absolute", right: 10, bottom: 10, background: "rgba(30,40,35,.45)", backdropFilter: "blur(10px)", color: "#fff", border: "1px solid rgba(255,255,255,.3)", borderRadius: 999, padding: "6px 12px", fontSize: 12, display: "flex", gap: 6, alignItems: "center" }}><Icon n="camera" s={14} />See all {l.photos.length} photos</span></button>
          </div>
        </div>}
        {isMobile && <button className="btn btn-ghost btn-sm" onClick={(e) => openLb(0, e)}><Icon n="camera" s={14} />See all {l.photos.length} photos</button>}
      </div>
      <style>{`.gimg{transition:transform .8s var(--ease)} button:hover>.gimg{transform:scale(1.04)}`}</style>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "minmax(0,1.45fr) minmax(320px,1fr)", gap: 28, marginTop: 26, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}><h1 style={{ fontSize: "clamp(28px,3vw,36px)" }}>{l.title}</h1><div className="mute" style={{ fontSize: 13.5, display: "flex", gap: 5, alignItems: "center", marginTop: 4 }}><Icon n="pin" s={15} />{l.address}, {l.area}, {l.cityName}, Nigeria</div></div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" onClick={share}><Icon n="share" s={15} />Share</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { toggleSave(l.id); toast(isSaved ? "Removed from saved" : "Saved to your list"); }} aria-pressed={isSaved}><Icon n={isSaved ? "heartF" : "heart"} s={15} style={{ color: isSaved ? "#FF4D5E" : "" }} />{isSaved ? "Saved" : "Save"}</button>
            </div>
          </div>
          <div ref={tabsRef} style={{ position: "sticky", top: 72, zIndex: 30, background: "#fff", marginTop: 22, boxShadow: stuck ? "0 8px 16px -12px rgba(0,0,0,.15)" : "none", transition: "box-shadow .3s" }}>
            <Tabs items={CFG.tabs.property} param="tab" def="overview" variant="under" label="Property sections" />
          </div>
          <TabPanel id="tab" k={tab} style={{ paddingTop: 24 }}>
            {tab === "overview" && <Overview l={l} money={money} />}
            {tab === "features" && <Features l={l} />}
            {tab === "location" && <LocationTab l={l} />}
            {tab === "history" && <PriceHistory l={l} money={money} />}
            {tab === "reviews" && <ReviewsList agentId={a.id} />}
          </TabPanel>
          <hr className="hair" style={{ margin: "32px 0 24px" }} />
          <Calculator l={l} money={money} />
          <div style={{ marginTop: 22 }}><button className="btn btn-ghost btn-sm" onClick={() => setReport(true)} style={{ color: "var(--red)" }}><Icon n="flag" s={15} />Report this listing</button></div>
          <ReportModal open={report} onClose={() => setReport(false)} l={l} />
        </div>
        <aside style={{ position: isMobile ? "static" : "sticky", top: 90, display: "flex", flexDirection: "column", gap: 14 }}>
          <AgentContact l={l} a={a} />
        </aside>
      </div>
      <section style={{ padding: "64px 0" }}>
        <h2 style={{ fontSize: 28, marginBottom: 20 }}>Similar properties</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 18 }}>{similar.map((x) => <ListingCardV key={x.id} l={x} imgH={190} />)}</div>
        <h2 style={{ fontSize: 28, margin: "48px 0 20px" }}>Recently viewed</h2>
        <RecentGrid />
      </section>
    </div>
    {lb && <Lightbox photos={l.photos} start={lb.i} origin={lb.origin} title={l.title} onClose={() => setLb(null)} />}
    <Footer /><CompareTray />
  </div>;
}

function Overview({ l, money }) {
  const specs = [["Property Type", typeLabel(l.type)], ["Year Built", l.year], ["Size", l.size + " m²"], ["Bedrooms", l.beds || "—"], ["Bathrooms", l.baths], ["Price", money(l.price) + (l.action === "rent" ? "/yr" : "")]];
  const fees = l.action === "rent" ? [["Annual rent", l.price], ["Agency fee (10%)", l.price * 0.1], ["Legal fee (10%)", l.price * 0.1], ["Caution deposit (refundable)", l.cautionDeposit], ["Service charge / yr", l.serviceCharge]] : [["Asking price", l.price], ["Agency fee (5%)", l.price * 0.05], ["Legal fee (5%)", l.price * 0.05], ["Service charge / yr", l.serviceCharge]];
  const total = fees.reduce((s, f) => s + f[1], 0);
  return <div>
    <p style={{ fontSize: 14.5, color: "var(--ink-2)" }}>{l.description}</p>
    <p style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 12 }}>{l.description2}</p>
    <hr className="hair" style={{ margin: "24px 0" }} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", rowGap: 22 }}>{specs.map(([k, v]) => <div key={k}><div className="mute" style={{ fontSize: 12.5 }}>{k}:</div><div className="num" style={{ fontSize: 19, marginTop: 2 }}>{v}</div></div>)}</div>
    <hr className="hair" style={{ margin: "24px 0" }} />
    <h3 style={{ fontSize: 20, marginBottom: 14 }}>Property Features</h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "12px 24px" }}>{l.amenities.slice(0, 8).map((x) => <div key={x} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14 }}><Icon n={AMENITY_ICON[x]} s={18} style={{ color: "var(--mute)" }} />{x}</div>)}</div>
    <hr className="hair" style={{ margin: "24px 0" }} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>{l.action === "rent" ? "Move-in cost" : "Cost to buy"}</h3>
        {fees.map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "7px 0", borderBottom: "1px dashed #E2E5E3" }}><span className="mute">{k}</span><span className="num">{money(v)}</span></div>)}
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, paddingTop: 10 }}><span>Total upfront</span><span className="num">{money(total)}</span></div>
      </div>
      <div className="card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 17, marginBottom: 12 }}>Title, utilities & security</h3>
        {[["doc", "Title document", l.tenure || "Tenancy agreement (lease)"], ["bolt", "Power", l.power], ["drop", "Water", l.water], ["shield", "Security", l.security]].map(([ic, k, v]) => <div key={k} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px dashed #E2E5E3", fontSize: 13.5 }}><Icon n={ic} s={17} style={{ color: "var(--g600)", marginTop: 1 }} /><div><div className="mute" style={{ fontSize: 12 }}>{k}</div>{v}</div></div>)}
        {l.tenure && <p className="mute" style={{ fontSize: 11.5, marginTop: 10 }}>Always verify title documents at the Lands Registry before payment.</p>}
      </div>
    </div>
  </div>;
}
function Features({ l }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 10 }}>
    {CFG.amenities.map((x) => { const on = l.amenities.includes(x); return <div key={x} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", borderRadius: 14, border: "1px solid var(--line)", opacity: on ? 1 : .4, fontSize: 14 }}><Icon n={AMENITY_ICON[x]} s={18} style={{ color: on ? "var(--g600)" : "var(--mute)" }} />{x}{on ? <Icon n="check" s={15} style={{ marginLeft: "auto", color: "var(--g600)" }} /> : <span className="sr">not included</span>}</div>; })}
    <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>{l.furnished && <span className="badge badge-soft">Furnished</span>}{l.newBuild && <span className="badge badge-soft">New build</span>}{l.agentVisited && <span className="trust"><Icon n="houseCheck" s={14} />Agent visited on {l.agentVisited}</span>}</div>
  </div>;
}
function LocationTab({ l }) {
  const near = [["School", "Corona Secondary School", "1.2 km"], ["Hospital", "Reddington Hospital", "2.4 km"], ["Shopping", "The Palms Mall", "3.1 km"], ["Transport", "Lekki–Ikoyi Link Bridge", "1.8 km"], ["Beach", "Eleko Beach", "6.5 km"]];
  return <div>
    <div style={{ height: 340 }}><MapView listings={[l]} single center={[l.lat, l.lng]} zoom={14} /></div>
    <h3 style={{ fontSize: 18, margin: "22px 0 10px" }}>Nearby</h3>
    {near.map(([k, n, d]) => <div key={n} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px dashed #E2E5E3", fontSize: 14 }}><span><span className="mute" style={{ width: 92, display: "inline-block" }}>{k}</span>{n}</span><span className="num mute">{d}</span></div>)}
    <p className="mute" style={{ fontSize: 12, marginTop: 10 }}>Neighbourhood data is indicative (demo).</p>
  </div>;
}
function PriceHistory({ l, money }) {
  const h = l.priceHistory; const max = Math.max(...h.map((x) => x.value)), min = Math.min(...h.map((x) => x.value));
  const W = 600, H = 200, px = (i) => 20 + (i * (W - 40)) / (h.length - 1), py = (v) => H - 30 - ((v - min) / (max - min || 1)) * (H - 60);
  const d = h.map((p, i) => (i ? "L" : "M") + px(i) + " " + py(p.value)).join(" ");
  return <div>
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Price history chart">
      <defs><linearGradient id="phg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#A8DC62" stopOpacity=".45" /><stop offset="1" stopColor="#A8DC62" stopOpacity="0" /></linearGradient></defs>
      <path d={d + ` L${px(h.length - 1)} ${H - 30} L20 ${H - 30} Z`} fill="url(#phg)" />
      <path d={d} fill="none" stroke="#7CB83A" strokeWidth="2.5" pathLength="1" style={{ strokeDasharray: 1, animation: "draw 1.2s var(--ease) both" }} />
      {h.map((p, i) => <g key={i}><circle cx={px(i)} cy={py(p.value)} r="4" fill="#fff" stroke="#7CB83A" strokeWidth="2" /><text x={px(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#888">{p.label.split(" ")[0]}</text></g>)}
    </svg>
    <style>{`@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`}</style>
    <table className="tbl" style={{ marginTop: 10 }}><thead><tr><th>Date</th><th>Event</th><th style={{ textAlign: "right" }}>Price</th></tr></thead>
      <tbody>{[...h].reverse().map((p, i, arr) => <tr key={i}><td>{p.label}</td><td>{i === arr.length - 1 ? "Listed" : "Price change"}</td><td className="num" style={{ textAlign: "right" }}>{money(p.value)}</td></tr>)}</tbody></table>
  </div>;
}
function ReviewsList({ agentId, grid }) {
  const rs = DB.REVIEWS.filter((r) => r.agentId === agentId);
  return <div style={grid ? { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 } : { display: "flex", flexDirection: "column", gap: 0 }}>
    {rs.map((r) => <div key={r.id} style={grid ? { border: "1px solid var(--line)", borderRadius: 18, padding: 16 } : { padding: "16px 0", borderBottom: "1px dashed #E2E5E3" }}>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Avatar name={r.name} s={34} /><div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</div><div className="mute" style={{ fontSize: 11.5 }}>{r.context}</div></div><span className="stars"><Icon n="star" s={14} style={{ color: "var(--star)" }} />{r.rating}</span></div>
      <p style={{ fontSize: 13.5, marginTop: 10, color: "var(--ink-2)" }}>{r.text}</p>
      <div className="mute" style={{ fontSize: 11.5, marginTop: 8, display: "flex", gap: 8 }}>{r.date}{r.verifiedLead && <span style={{ color: "var(--g600)", display: "inline-flex", gap: 3, alignItems: "center" }}><Icon n="check" s={12} />Verified enquiry</span>}{r.demo && <span className="badge badge-gray" style={{ height: 18, fontSize: 10 }}>Demo review</span>}</div>
    </div>)}
  </div>;
}
function Calculator({ l, money }) {
  const [mode, setMode] = useState(l.action === "rent" ? "rent" : "mortgage");
  const [dp, setDp] = useState(30), [rate, setRate] = useState(18), [yrs, setYrs] = useState(15), [income, setIncome] = useState(1500000);
  const P = l.price * (1 - dp / 100), r = rate / 100 / 12, n = yrs * 12;
  const pm = r ? (P * r) / (1 - Math.pow(1 + r, -n)) : P / n;
  const rentShare = (l.price / 12 / income) * 100;
  return <div className="card" style={{ padding: 22 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
      <h3 style={{ fontSize: 20, display: "flex", gap: 8, alignItems: "center" }}><Icon n="calc" s={20} />Affordability calculator</h3>
      <Tabs items={[{ id: "mortgage", label: "Mortgage" }, { id: "rent", label: "Rent affordability" }]} value={mode} onChange={setMode} size="sm" label="Calculator mode" />
    </div>
    <div key={mode} className="xfade" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 22, alignItems: "center" }}>
      {mode === "mortgage" ? <>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[["Down payment", dp, setDp, 10, 80, "%"], ["Interest rate", rate, setRate, 8, 30, "%"], ["Term", yrs, setYrs, 5, 30, " yrs"]].map(([k, v, s, a, b, u]) => <label key={k} style={{ fontSize: 13 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span className="mute">{k}</span><b className="num">{v}{u}</b></div><input type="range" className="range" min={a} max={b} value={v} onChange={(e) => s(+e.target.value)} /></label>)}
        </div>
        <div style={{ background: "var(--g700)", color: "#fff", borderRadius: 18, padding: 20 }}><div style={{ opacity: .7, fontSize: 13 }}>Estimated monthly repayment</div><div className="num" style={{ fontSize: 30, color: "var(--lime)", marginTop: 4 }}>{money(pm)}</div><div style={{ fontSize: 12.5, opacity: .7, marginTop: 8 }}>Loan {money(P, { compact: true })} · Deposit {money(l.price * dp / 100, { compact: true })}</div></div>
      </> : <>
        <label style={{ fontSize: 13 }}><span className="mute">Your monthly net income</span><input className="input num" style={{ marginTop: 6 }} value={income.toLocaleString()} onChange={(e) => setIncome(+e.target.value.replace(/\D/g, "") || 1)} inputMode="numeric" /><p className="mute" style={{ fontSize: 12, marginTop: 8 }}>Most Lagos landlords ask for 1–2 years upfront. A healthy target is ≤ 30% of income.</p></label>
        <div style={{ background: rentShare > 30 ? "#FDF3E3" : "var(--lime-50)", borderRadius: 18, padding: 20, border: "1px solid " + (rentShare > 30 ? "#F3DDB5" : "var(--lime-100)") }}><div className="mute" style={{ fontSize: 13 }}>Rent as share of income</div><div className="num" style={{ fontSize: 30, marginTop: 4, color: rentShare > 30 ? "#9A5B05" : "var(--g700)" }}>{rentShare.toFixed(0)}%</div><div style={{ fontSize: 12.5, marginTop: 6 }}>{rentShare > 30 ? "Above recommended — consider a smaller unit or longer savings period." : "Within a comfortable range."}</div><div style={{ fontSize: 12.5, marginTop: 4 }} className="mute">≈ {money(l.price / 12)}/month equivalent</div></div>
      </>}
    </div>
  </div>;
}

/* Agent card + contact form + viewing scheduler */
function AgentContact({ l, a }) {
  const { leads, setLeads, toast } = useStore();
  const [tab, setTab] = useState("message");
  const [f, setF] = useState({ name: "", phone: "", email: "", msg: `Hi ${a.name.split(" ")[0]}, I'm interested in ${l.title}. Is it still available?`, consent: false });
  const [err, setErr] = useState({});
  const [sent, setSent] = useState(false);
  const [day, setDay] = useState(null), [time, setTime] = useState(null);
  const days = [...Array(7)].map((_, i) => new Date(2026, 9, 12 + i));
  const times = ["09:00", "10:30", "12:00", "14:00", "15:30", "17:00"];
  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Please enter your name";
    if (!/^\d{10,11}$/.test(f.phone.replace(/\D/g, ""))) e.phone = "Enter a valid Nigerian number";
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email";
    if (!f.consent) e.consent = "Consent is required to share your details with the agent";
    if (tab === "viewing" && (day === null || !time)) e.slot = "Pick a date and time";
    setErr(e); return !Object.keys(e).length;
  };
  const submit = (e) => {
    e.preventDefault(); if (!validate()) return;
    setLeads([{ id: "LD" + Date.now(), listingId: l.id, name: f.name, phone: "+234" + f.phone.replace(/\D/g, "").replace(/^0/, ""), email: f.email, msg: f.msg, kind: tab, slot: tab === "viewing" ? fmtDate(days[day]) + " " + time : null, status: "new", consent: true, at: Date.now() }, ...leads]);
    setSent(true); toast(tab === "viewing" ? "Viewing requested — the agent will confirm shortly" : "Message sent to " + a.name);
  };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return <>
    <div className="card" style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar src={a.photo} name={a.name} s={52} />
      <Link to={"/agents/" + a.id} style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, display: "flex", gap: 4, alignItems: "center" }}>{a.name}{a.verified && <Icon n="verified" s={15} style={{ color: "var(--g600)" }} />}</div><div className="mute" style={{ fontSize: 12 }}>{a.years}+ Years Experience</div><Stars v={a.rating} size={12} /></Link>
      <a href={"tel:" + a.phone} className="btn btn-dark btn-sm"><Icon n="phone" s={15} />Call Agent</a>
    </div>
    <div className="card" style={{ padding: 18 }}>
      {sent ? <div className="xfade" style={{ textAlign: "center", padding: "26px 8px" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--lime)", display: "grid", placeItems: "center", margin: "0 auto", animation: "heartpop .6s var(--spring)" }}><Icon n="check" s={28} w={2.4} /></div>
        <h3 style={{ fontSize: 20, marginTop: 14 }}>{tab === "viewing" ? "Viewing requested" : "Message sent"}</h3>
        <p className="mute" style={{ fontSize: 13.5, marginTop: 6 }}>{a.name.split(" ")[0]} usually replies within 2 hours. We've also sent a copy to {f.email}.</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}><a className="btn btn-lime btn-sm" href={waLink(a.phone, f.msg)} target="_blank" rel="noopener"><Icon n="wa" s={15} />Continue on WhatsApp</a><button className="btn btn-ghost btn-sm" onClick={() => setSent(false)}>Send another</button></div>
      </div> : <form onSubmit={submit} noValidate style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Tabs items={[{ id: "message", label: "Send message" }, { id: "viewing", label: "Schedule a viewing" }]} value={tab} onChange={setTab} fill size="sm" label="Contact type" />
        <p style={{ fontSize: 13.5, margin: "6px 0 2px" }}>Leave your details and the agent will get back to you shortly</p>
        {tab === "viewing" && <div className="xfade">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>{days.map((d, i) => <button type="button" key={i} onClick={() => setDay(i)} aria-pressed={day === i} style={{ padding: "8px 0", borderRadius: 12, border: "1px solid " + (day === i ? "var(--g700)" : "var(--line)"), background: day === i ? "var(--g700)" : "#fff", color: day === i ? "#fff" : "", transition: "all .2s" }}><div style={{ fontSize: 10.5, opacity: .7 }}>{d.toLocaleDateString("en-GB", { weekday: "short" })}</div><div className="num" style={{ fontSize: 15, fontWeight: 600 }}>{d.getDate()}</div></button>)}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 4, marginTop: 6 }}>{times.map((t) => <button type="button" key={t} onClick={() => setTime(t)} aria-pressed={time === t} className="chip" style={{ justifyContent: "center", ...(time === t ? { background: "var(--lime)", borderColor: "var(--lime)" } : null) }}>{t}</button>)}</div>
          {err.slot && <span className="err-msg">{err.slot}</span>}
        </div>}
        <input className={"input" + (err.name ? " err" : "")} placeholder="Your name" value={f.name} onChange={set("name")} aria-label="Your name" aria-invalid={!!err.name} />{err.name && <span className="err-msg">{err.name}</span>}
        <div style={{ display: "flex", gap: 8 }}><span className="input" style={{ width: 96, display: "flex", alignItems: "center", gap: 6, flex: "none" }}><span aria-hidden style={{ width: 18, height: 12, borderRadius: 2, background: "linear-gradient(90deg,#008751 33%,#fff 33% 66%,#008751 66%)", boxShadow: "0 0 0 1px #ddd" }} />+234</span><input className={"input" + (err.phone ? " err" : "")} placeholder="Phone number" inputMode="tel" value={f.phone} onChange={set("phone")} aria-label="Phone number" /></div>{err.phone && <span className="err-msg">{err.phone}</span>}
        <input className={"input" + (err.email ? " err" : "")} placeholder="Email" type="email" value={f.email} onChange={set("email")} aria-label="Email" />{err.email && <span className="err-msg">{err.email}</span>}
        <textarea className="textarea" placeholder="Your message" value={f.msg} onChange={set("msg")} aria-label="Message" />
        <label className="check"><input type="checkbox" checked={f.consent} onChange={set("consent")} />I agree to be contacted by the agent via WhatsApp, SMS, phone, email etc. My data is processed under the Nigeria Data Protection Act.</label>{err.consent && <span className="err-msg">{err.consent}</span>}
        <button className="btn btn-lime btn-lg btn-block" style={{ marginTop: 4 }}>{tab === "viewing" ? "Request viewing" : "Get in touch"}<Icon n="arrowR" s={16} /></button>
      </form>}
    </div>
    <div className="card" style={{ padding: 16 }}>{DB.REVIEWS.filter((r) => r.agentId === a.id).slice(0, 1).map((r) => <div key={r.id}><div style={{ display: "flex", gap: 10, alignItems: "center" }}><Avatar name={r.name} s={32} /><div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 600 }}>{r.name}</div><div className="mute" style={{ fontSize: 11.5 }}>{r.context}</div></div><span className="stars"><Icon n="star" s={14} style={{ color: "var(--star)" }} />{r.rating}</span></div><p style={{ fontSize: 13, marginTop: 8, color: "var(--ink-2)" }}>{r.text}</p></div>)}</div>
  </>;
}

Object.assign(window, { Property, ReviewsList });
