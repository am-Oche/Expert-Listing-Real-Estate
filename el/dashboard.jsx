/* Agent / developer dashboard */
function seedMyListings() {
  const st = ["published", "published", "published", "draft", "published", "review", "published", "draft", "expired", "published", "published", "draft", "published", "review", "published", "draft", "published", "published", "draft"];
  return DB.LISTINGS.filter((l) => l.agentId === "zara-balogun").slice(0, 19).map((l, i) => ({ id: l.id, status: st[i % st.length], updated: new Date(2026, 9, 10 - i * 2) }));
}
function useMyListings() {
  const { listings, setListings } = useStore();
  const ls = listings || seedMyListings().map((x) => ({ ...x, updated: +x.updated }));
  return [ls, setListings];
}
function Dashboard() {
  const [tab] = useQueryState("tab", "listings");
  const { plan } = useStore();
  const [ls] = useMyListings();
  const isMobile = useMedia("(max-width:960px)");
  const counts = { published: ls.filter((x) => x.status === "published").length, draft: ls.filter((x) => x.status === "draft").length, review: ls.filter((x) => x.status === "review").length };
  return <div className="page-in" style={{ background: "#fff" }}>
    <Header />
    <div className="wrap" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px minmax(0,1fr)", gap: 26, padding: "28px 24px 80px", alignItems: "start" }}>
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: isMobile ? "static" : "sticky", top: 92 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}><Avatar src={DB.IMG.agents[0]} name="Zara Balogun" s={44} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 14.5 }}>Zara Balogun</div><div className="mute" style={{ fontSize: 12, display: "flex", gap: 4, alignItems: "center" }}><Icon n="mail" s={13} />info@luxeform.com</div></div><Link to="/agents/zara-balogun" className="icon-btn sm" aria-label="View public profile"><Icon n="more" s={16} /></Link></div>
          <div style={{ display: "flex", gap: 6, marginTop: 12 }}><span className="badge badge-line" style={{ color: "#C9772A" }}>Seller</span><span className="badge badge-line" style={{ color: "var(--g600)" }}>{plan === "pro" ? "Pro Plan" : "Free Plan"}</span><span className="badge badge-soft"><Icon n="verified" s={12} />Verified</span></div>
          <div style={{ background: "var(--line-2)", borderRadius: 14, marginTop: 14, padding: "0 14px" }}>
            {[["Published Properties", counts.published, "published"], ["Draft Properties", counts.draft, "draft"], ["Under review Properties", counts.review, "review"]].map(([k, v, s], i) => <Link key={k} to={`/dashboard?tab=listings&status=${s}`} style={{ display: "flex", justifyContent: "space-between", padding: "13px 0", fontSize: 13, borderTop: i ? "1px dashed #D9DCDA" : 0 }}><span>{k}</span><b className="num">{v}</b></Link>)}
          </div>
        </div>
        <div className="card" style={{ padding: "2px 16px" }}><Accordion title="Last Reviews" compact><div style={{ paddingBottom: 12 }}><ReviewsList agentId="zara-balogun" /></div></Accordion></div>
        <ClaimSale />
      </aside>
      <main style={{ minWidth: 0 }}>
        <Tabs items={CFG.tabs.dashboard} param="tab" def="listings" fill label="Dashboard sections" />
        <TabPanel id="tab" k={tab} style={{ marginTop: 22 }}>
          {tab === "listings" && <ManageListings />}
          {tab === "stats" && <PerformanceStats />}
          {tab === "subscription" && <Subscription />}
        </TabPanel>
      </main>
    </div>
    <Footer />
  </div>;
}

function ClaimSale() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [ls] = useMyListings();
  const [pick, setPick] = useState("");
  const { toast } = useStore();
  return <div className="card" style={{ padding: 16 }}>
    <h3 style={{ fontSize: 17, fontFamily: "var(--f-body)", fontWeight: 600 }}>Sold a property?</h3>
    <p className="mute" style={{ fontSize: 13, marginTop: 4 }}>Verified sales appear on your profile and boost your credibility.</p>
    <button className="btn btn-dark btn-block" style={{ marginTop: 14 }} onClick={() => { setOpen(true); setStep(0); }}>Claim Now</button>
    <Modal open={open} onClose={() => setOpen(false)} title="Claim a verified sale" width={500}>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>{[0, 1, 2].map((i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= step ? "var(--lime)" : "var(--line)", transition: "background .3s" }} />)}</div>
      <div key={step} className="xfade">
        {step === 0 && <><Field label="Which listing did you sell?"><select className="select" value={pick} onChange={(e) => setPick(e.target.value)}><option value="">Select a listing</option>{ls.map((x) => <option key={x.id} value={x.id}>{DB.LISTINGS.find((l) => l.id === x.id).title} · {x.id}</option>)}</select></Field><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}><Field label="Sale date"><input className="input" type="date" defaultValue="2026-10-01" /></Field><Field label="Final price (₦)"><input className="input" inputMode="numeric" placeholder="e.g. 210,000,000" /></Field></div></>}
        {step === 1 && <><p className="mute" style={{ fontSize: 13.5, marginBottom: 12 }}>Upload proof — a signed deed of assignment, sale agreement or receipt. Documents are only seen by our verification team.</p><Dropzone compact /></>}
        {step === 2 && <div style={{ textAlign: "center", padding: "10px 0" }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--lime)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon n="check" s={26} w={2.4} /></div><h3 style={{ marginTop: 12 }}>Claim submitted</h3><p className="mute" style={{ fontSize: 13.5, marginTop: 6 }}>We'll confirm with the buyer and add it to your profile within 3 working days.</p></div>}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}>
        {step > 0 && step < 2 ? <button className="btn btn-ghost" onClick={() => setStep(step - 1)}>Back</button> : <span />}
        {step < 2 ? <button className="btn btn-dark" disabled={step === 0 && !pick} onClick={() => { setStep(step + 1); step === 1 && toast("Sale claim sent for verification"); }}>{step === 1 ? "Submit claim" : "Continue"}</button> : <button className="btn btn-dark" onClick={() => setOpen(false)}>Done</button>}
      </div>
    </Modal>
  </div>;
}

/* ---------- 1. Manage listings ---------- */
const STATUS_BADGE = { published: ["badge-soft", "Published"], draft: ["badge-gray", "Draft"], review: ["badge-amber", "Under review"], expired: ["badge-red", "Expired"], paused: ["badge-gray", "Paused"] };
function ManageListings() {
  const [ls, setLs] = useMyListings();
  const [status] = useQueryState("status", "all");
  const [sub, setSub] = useQueryState("sub", "listings");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState([]);
  const [del, setDel] = useState(null);
  const { toast, plan, leads } = useStore();
  const money = useMoney();
  const items = CFG.tabs.listingStatus.map((t) => ({ ...t, count: t.id === "all" ? ls.length : ls.filter((x) => x.status === t.id).length }));
  const rows = ls.filter((x) => (status === "all" || x.status === status)).map((x) => ({ ...x, l: DB.LISTINGS.find((l) => l.id === x.id) })).filter((x) => !q || x.l.title.toLowerCase().includes(q.toLowerCase()) || x.id.toLowerCase().includes(q.toLowerCase()));
  const upd = (ids, patch) => setLs(ls.map((x) => (ids.includes(x.id) ? { ...x, ...patch, updated: Date.now() } : x)));
  const freePlan = CFG.plans.find((p) => p.id === "free");
  const thisMonth = ls.filter((x) => x.updated > Date.now() - 30 * 864e5).length;
  return <div>
    <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginBottom: 16 }}>
      <Tabs items={[{ id: "listings", label: "Listings" }, { id: "leads", label: "Leads inbox", count: leads.filter((x) => x.status === "new").length + 3 }]} param="sub" def="listings" size="sm" label="Listings or leads" />
      <Link to="/post" className="btn btn-dark btn-sm"><Icon n="plus" s={15} />New listing</Link>
    </div>
    {plan === "free" && <div style={{ background: "var(--lime-50)", border: "1px solid var(--lime-100)", borderRadius: 16, padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", marginBottom: 16, fontSize: 13.5, flexWrap: "wrap" }}><Icon n="info" s={18} style={{ color: "var(--g700)" }} /><span style={{ flex: 1 }}>Free plan: <b>{Math.min(thisMonth, 5)}/{freePlan.listingsPerMonth}</b> listings used this month. Listings stay active for {freePlan.activeDays} days.</span><Link to="/dashboard?tab=subscription" className="btn btn-lime btn-sm">Upgrade to Pro</Link></div>}
    <TabPanel id="sub" k={sub}>
      {sub === "leads" ? <LeadsInbox /> : <>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <Tabs items={items} param="status" def="all" variant="chips" label="Listing status" />
          <div style={{ marginLeft: "auto", position: "relative" }}><Icon n="search" s={16} style={{ position: "absolute", left: 12, top: 12, color: "var(--mute)" }} /><input className="input" style={{ height: 40, paddingLeft: 36, width: 220 }} placeholder="Search listings" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search your listings" /></div>
        </div>
        {sel.length > 0 && <div className="xfade" style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--ink)", color: "#fff", borderRadius: 14, padding: "8px 8px 8px 16px", marginBottom: 12, fontSize: 13.5, flexWrap: "wrap" }}>
          <span>{sel.length} selected</span><span style={{ flex: 1 }} />
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={() => { upd(sel, { status: "paused" }); toast(sel.length + " listings paused"); setSel([]); }}><Icon n="pause" s={14} />Pause</button>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.12)", color: "#fff" }} onClick={() => { upd(sel, { status: "published" }); toast(sel.length + " listings renewed"); setSel([]); }}><Icon n="refresh" s={14} />Renew</button>
          <button className="btn btn-sm btn-danger" onClick={() => setDel(sel)}><Icon n="trash" s={14} />Delete</button>
        </div>}
        <div className="card" style={{ padding: 0, overflowX: "auto" }}>
          <table className="tbl" style={{ minWidth: 720 }}>
            <thead><tr><th style={{ width: 36 }}><input type="checkbox" aria-label="Select all" checked={rows.length > 0 && sel.length === rows.length} onChange={(e) => setSel(e.target.checked ? rows.map((r) => r.id) : [])} style={{ accentColor: "var(--g700)" }} /></th><th>Property</th><th>Status</th><th>Price</th><th>Views</th><th>Leads</th><th>Updated</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
            <tbody>{rows.map((r) => <tr key={r.id} style={{ background: sel.includes(r.id) ? "var(--g50)" : "" }}>
              <td><input type="checkbox" checked={sel.includes(r.id)} onChange={() => setSel(sel.includes(r.id) ? sel.filter((x) => x !== r.id) : [...sel, r.id])} aria-label={"Select " + r.l.title} style={{ accentColor: "var(--g700)" }} /></td>
              <td><Link to={"/property/" + r.id} style={{ display: "flex", gap: 10, alignItems: "center" }}><img src={r.l.photos[0]} alt="" style={{ width: 52, height: 40, borderRadius: 8, objectFit: "cover" }} /><div><div style={{ fontWeight: 600 }}>{r.l.title}</div><div className="mute" style={{ fontSize: 12 }}>{r.l.area} · {r.id}</div></div></Link></td>
              <td><span className={"badge " + STATUS_BADGE[r.status][0]}>{STATUS_BADGE[r.status][1]}</span></td>
              <td className="num">{money(r.l.price, { compact: true })}</td><td className="num">{r.status === "draft" ? "—" : r.l.views}</td><td className="num">{r.status === "draft" ? "—" : r.l.leads}</td>
              <td className="mute" style={{ fontSize: 12.5 }}>{fmtDate(new Date(r.updated))}</td>
              <td><div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <Link to={"/post?step=info&edit=" + r.id} className="icon-btn sm" aria-label="Edit"><Icon n="edit" s={14} /></Link>
                <button className="icon-btn sm" aria-label="Duplicate" onClick={() => toast("Duplicated as draft")}><Icon n="copy" s={14} /></button>
                {r.status === "published" ? <button className="icon-btn sm" aria-label="Pause" onClick={() => { upd([r.id], { status: "paused" }); toast("Listing paused"); }}><Icon n="pause" s={14} /></button>
                  : <button className="icon-btn sm" aria-label="Renew / publish" onClick={() => { upd([r.id], { status: r.status === "draft" ? "review" : "published" }); toast(r.status === "draft" ? "Submitted for review" : "Listing renewed"); }}><Icon n="refresh" s={14} /></button>}
                <button className="icon-btn sm" aria-label="Delete" onClick={() => setDel([r.id])}><Icon n="trash" s={14} /></button>
              </div></td>
            </tr>)}</tbody>
          </table>
          {!rows.length && <div style={{ padding: 20 }}><EmptyState icon="home" title="No listings here" body="Try another status or create a new listing." action={<Link to="/post" className="btn btn-dark">Post a listing</Link>} /></div>}
        </div>
      </>}
    </TabPanel>
    <Confirm open={!!del} onClose={() => setDel(null)} danger ok="Delete" title={`Delete ${del?.length > 1 ? del.length + " listings" : "listing"}?`} body="This removes the listing and its analytics permanently. Leads already received are kept." onOk={() => { setLs(ls.filter((x) => !del.includes(x.id))); setSel([]); toast("Deleted"); }} />
  </div>;
}
function LeadsInbox() {
  const { leads, setLeads, toast } = useStore();
  const demo = [{ id: "d1", listingId: "L1001", name: "Michael Adebayo", phone: "+2348091234567", email: "michael@mail.com", msg: "Is the price negotiable? I'd like to view this weekend.", kind: "viewing", slot: "Sat 17 Oct 10:30", status: "new", at: Date.now() - 36e5, demo: true }, { id: "d2", listingId: "L1005", name: "Ada Eze", phone: "+2348102223333", email: "ada@mail.com", msg: "Does the service charge include diesel?", kind: "message", status: "contacted", at: Date.now() - 864e5, demo: true }, { id: "d3", listingId: "L1009", name: "Femi Kolawole", phone: "+2347033334444", email: "femi@mail.com", msg: "Please share the C of O copy.", kind: "message", status: "new", at: Date.now() - 2 * 864e5, demo: true }];
  const [demoState, setDemo] = useState(demo);
  const all = [...leads, ...demoState];
  const [f, setF] = useState("all");
  const setStatus = (ld, s) => { if (ld.demo) setDemo(demoState.map((x) => (x.id === ld.id ? { ...x, status: s } : x))); else setLeads(leads.map((x) => (x.id === ld.id ? { ...x, status: s } : x))); toast("Marked as " + s); };
  const shown = all.filter((x) => f === "all" || x.status === f);
  return <div>
    <div style={{ marginBottom: 14 }}><Tabs items={["all", "new", "contacted", "closed"].map((s) => ({ id: s, label: s[0].toUpperCase() + s.slice(1), count: s === "all" ? all.length : all.filter((x) => x.status === s).length }))} value={f} onChange={setF} variant="chips" label="Lead status" /></div>
    <div key={f} className="xfade" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {shown.map((ld) => { const l = DB.LISTINGS.find((x) => x.id === ld.listingId); return <div key={ld.id} className="card" style={{ padding: 16, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 14, alignItems: "start" }}>
        <Avatar name={ld.name} s={40} />
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}><b style={{ fontSize: 14 }}>{ld.name}</b><span className={"badge " + (ld.status === "new" ? "badge-lime" : ld.status === "contacted" ? "badge-amber" : "badge-gray")}>{ld.status}</span>{ld.kind === "viewing" && <span className="badge badge-soft"><Icon n="cal" s={12} />Viewing · {ld.slot}</span>}<span className="mute" style={{ fontSize: 12 }}>{Math.max(1, Math.round((Date.now() - ld.at) / 36e5))}h ago</span></div>
          <div className="mute" style={{ fontSize: 12.5, marginTop: 2 }}>Re: {l?.title} · {ld.phone} · {ld.email}</div>
          <p style={{ fontSize: 13.5, marginTop: 8 }}>{ld.msg}</p>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <a className="btn btn-lime btn-sm" href={waLink(ld.phone, `Hi ${ld.name.split(" ")[0]}, thanks for your enquiry about ${l?.title}.`)} target="_blank" rel="noopener" onClick={() => ld.status === "new" && setStatus(ld, "contacted")}><Icon n="wa" s={14} />Reply on WhatsApp</a>
            <a className="btn btn-ghost btn-sm" href={"mailto:" + ld.email}><Icon n="mail" s={14} />Email</a>
            <a className="btn btn-ghost btn-sm" href={"tel:" + ld.phone}><Icon n="phone" s={14} />Call</a>
          </div>
        </div>
        <select className="select" style={{ height: 34, width: 130, fontSize: 13 }} value={ld.status} onChange={(e) => setStatus(ld, e.target.value)} aria-label="Lead status"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select>
      </div>; })}
      {!shown.length && <EmptyState icon="mail" title="No leads in this view" />}
    </div>
  </div>;
}

/* ---------- 2. Performance stats ---------- */
function PerformanceStats() {
  const [metric, setMetric] = useQueryState("metric", "views");
  const [range, setRange] = useQueryState("range", "7");
  const [sort, setSort] = useState({ k: "views", d: -1 });
  const [ls] = useMyListings();
  const n = +range;
  const ev = DB.EVENTS.slice(-n), prev = DB.EVENTS.slice(-2 * n, -n);
  const sum = (a, k) => a.reduce((s, x) => s + x[k], 0);
  const views = sum(ev, "views"), leads = sum(ev, "leads");
  const dV = prev.length ? Math.round(((views - sum(prev, "views")) / sum(prev, "views")) * 100) : 14;
  const dL = prev.length ? Math.round(((leads - sum(prev, "leads")) / Math.max(1, sum(prev, "leads"))) * 100) : 14;
  const conv = (leads / views) * 100;
  const rows = ls.filter((x) => x.status !== "draft").map((x) => { const l = DB.LISTINGS.find((y) => y.id === x.id); return { id: x.id, title: l.title, area: l.area, img: l.photos[0], views: l.views, bookings: l.bookings, conv: (l.leads / l.views) * 100, updated: x.updated }; });
  rows.sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : -1) * sort.d);
  const th = (k, l) => <th><button onClick={() => setSort({ k, d: sort.k === k ? -sort.d : -1 })} aria-sort={sort.k === k ? (sort.d > 0 ? "ascending" : "descending") : "none"}>{l}{sort.k === k && <Icon n={sort.d > 0 ? "chevU" : "chevD"} s={12} />}</button></th>;
  const KPI = ({ label, v, fmt, delta, sub }) => <div className="card" style={{ padding: 18 }}><div className="mute" style={{ fontSize: 13 }}>{label}</div><div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}><span className="num" style={{ fontSize: 30, fontWeight: 500 }}><CountUp to={v} fmt={fmt} deps={[range]} /></span>{delta != null ? <span className="delta" style={delta < 0 ? { background: "#FCEDEB", color: "var(--red)" } : null}>{delta >= 0 ? "+" : ""}{delta}% {delta >= 0 ? "▲" : "▼"}</span> : <span className="badge badge-gray">{sub}</span>}</div></div>;
  return <div>
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
      <h2 style={{ fontSize: 28, flex: 1 }}>Performance Overview</h2>
      <Tabs items={[{ id: "7", label: "7 days" }, { id: "14", label: "14 days" }, { id: "30", label: "30 days" }]} param="range" def="7" size="sm" label="Date range" />
      <span className="btn btn-ghost btn-sm" style={{ pointerEvents: "none" }}><Icon n="cal" s={15} />{fmtDate(ev[0].date)} – {fmtDate(ev[ev.length - 1].date)}, 2026</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
      <KPI label="Total Views" v={views} delta={dV} /><KPI label="Leads Generated" v={leads} delta={dL} /><KPI label="Conversion Rate" v={conv} fmt={(x) => x.toFixed(1) + "%"} sub="Avg: 3.2%" />
    </div>
    <div className="card" style={{ padding: 20, marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><h3 style={{ fontSize: 18 }}>{metric === "views" ? "Views" : "Leads"} Over Time</h3><Tabs items={CFG.tabs.chartMetric} param="metric" def="views" variant="lime" size="sm" label="Chart metric" /></div>
      <AreaChart data={ev} k={metric} />
    </div>
    <div className="card" style={{ padding: 0, marginTop: 14, overflowX: "auto" }}>
      <div style={{ padding: "16px 18px 6px", display: "flex", justifyContent: "space-between" }}><h3 style={{ fontSize: 18 }}>Performance by Listing</h3></div>
      <table className="tbl" style={{ minWidth: 640 }}><thead><tr>{th("title", "Property")}{th("views", "Views")}{th("bookings", "Bookings")}{th("conv", "Conversion")}{th("updated", "Updated")}<th style={{ textAlign: "right" }}>Actions</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id}><td><div style={{ display: "flex", gap: 10, alignItems: "center" }}><img src={r.img} alt="" style={{ width: 44, height: 34, borderRadius: 8, objectFit: "cover" }} /><div><div style={{ fontWeight: 600, fontSize: 13 }}>{r.title}</div><div className="mute" style={{ fontSize: 11.5 }}>{r.area}</div></div></div></td><td className="num">{r.views}</td><td className="num">{r.bookings}</td><td><span className="delta" style={r.conv < 3.2 ? { background: "var(--line-2)", color: "var(--ink-2)" } : null}>{r.conv.toFixed(1)}%</span></td><td className="mute" style={{ fontSize: 12.5 }}>{fmtDate(new Date(r.updated))}</td><td style={{ textAlign: "right" }}><Link to={"/property/" + r.id} className="btn btn-ghost btn-sm">View</Link></td></tr>)}</tbody></table>
    </div>
  </div>;
}
/* Smooth area chart — draws on load, morphs between metrics, crosshair tooltip */
function AreaChart({ data, k }) {
  const W = 760, H = 260, pl = 40, pr = 14, pt = 20, pb = 34;
  const vals = data.map((d) => d[k]);
  const maxV = Math.max(...vals); const top = k === "views" ? Math.ceil(maxV / 100) * 100 : Math.ceil(maxV / 10) * 10;
  const x = (i) => pl + (i * (W - pl - pr)) / (data.length - 1), y = (v) => pt + (1 - v / top) * (H - pt - pb);
  const [hov, setHov] = useState(null);
  const [anim, setAnim] = useState(vals);
  const from = useRef(vals);
  useEffect(() => { // morph
    const a = from.current.length === vals.length ? from.current : vals.map(() => 0); let raf, t0;
    const st = (t) => { t0 ??= t; const p = Math.min(1, (t - t0) / 600), e = 1 - Math.pow(1 - p, 3); const cur = vals.map((v, i) => a[i] + (v - a[i]) * e); setAnim(cur); from.current = cur; if (p < 1) raf = requestAnimationFrame(st); };
    raf = requestAnimationFrame(st); return () => cancelAnimationFrame(raf);
  }, [k, data.length]);
  const pts = anim.map((v, i) => [x(i), y(v)]);
  const smooth = pts.reduce((s, p, i, a) => { if (!i) return `M${p[0]},${p[1]}`; const c = a[i - 1]; const mx = (c[0] + p[0]) / 2; return s + ` C${mx},${c[1]} ${mx},${p[1]} ${p[0]},${p[1]}`; }, "");
  const peakI = vals.indexOf(maxV);
  const svgRef = useRef(null);
  const onMove = (e) => { const r = svgRef.current.getBoundingClientRect(); const px = ((e.clientX - r.left) / r.width) * W; const i = Math.round(((px - pl) / (W - pl - pr)) * (data.length - 1)); setHov(Math.max(0, Math.min(data.length - 1, i))); };
  const every = Math.ceil(data.length / 9);
  return <div style={{ position: "relative" }}>
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", touchAction: "none" }} onPointerMove={onMove} onPointerLeave={() => setHov(null)} role="img" aria-label={`${k} over time, peak ${maxV} on ${fmtDate(data[peakI].date)}`}>
      <defs><linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#A8DC62" stopOpacity=".42" /><stop offset="1" stopColor="#A8DC62" stopOpacity="0" /></linearGradient></defs>
      {[0, .33, .66, 1].map((f) => <g key={f}><line x1={pl} x2={W - pr} y1={y(top * f)} y2={y(top * f)} stroke="#EEF0EF" /><text x={pl - 8} y={y(top * f) + 4} textAnchor="end" fontSize="11" fill="#999">{Math.round(top * f)}</text></g>)}
      <path d={smooth + ` L${x(data.length - 1)},${H - pb} L${pl},${H - pb} Z`} fill="url(#ag)" />
      <path key={data.length} d={smooth} fill="none" stroke="#8BC34A" strokeWidth="2.5" pathLength="1" style={{ strokeDasharray: 1, animation: "draw 1.3s var(--ease) both" }} />
      {data.map((d, i) => i % every === 0 && <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#999">{fmtDate(d.date)}</text>)}
      {hov !== null && <g><line x1={x(hov)} x2={x(hov)} y1={pt} y2={H - pb} stroke="#8BC34A" strokeDasharray="3 3" /><circle cx={x(hov)} cy={y(anim[hov])} r="6" fill="#fff" stroke="#8BC34A" strokeWidth="3" /></g>}
    </svg>
    <style>{`@keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}`}</style>
    {hov !== null && <div style={{ position: "absolute", left: `${(x(hov) / W) * 100}%`, top: `${(y(anim[hov]) / H) * 100}%`, transform: `translate(${hov > data.length * 0.7 ? "-105%" : "-50%"}, -130%)`, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "8px 12px", boxShadow: "var(--sh-2)", pointerEvents: "none", whiteSpace: "nowrap", transition: "left .12s, top .12s" }}><div style={{ fontSize: 13, fontWeight: 600 }}>{data[hov].date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div><div className="mute num" style={{ fontSize: 12.5 }}>{vals[hov]} {k === "views" ? "Views" : "Leads"}</div></div>}
    <p className="mute" style={{ fontSize: 12.5, marginTop: 4 }}>Peak activity on {data[peakI].date.toLocaleDateString("en-GB", { day: "numeric", month: "long" })} — {maxV} {k}</p>
  </div>;
}

/* ---------- 3. Subscription ---------- */
function Subscription() {
  const { plan, setPlan, toast } = useStore();
  const [billing, setBilling] = useQueryState("billing", "monthly");
  const [confirm, setConfirm] = useState(null);
  const [inv, setInv] = useState(false);
  const [pay, setPay] = useState(false);
  const money = useMoney();
  const pro = CFG.plans.find((p) => p.id === "pro");
  const price = (p) => billing === "yearly" ? Math.round(p.price * 12 * 0.85) : p.price;
  const per = billing === "yearly" ? "/year" : "/month";
  const invoices = [...Array(6)].map((_, i) => ({ id: "INV-2026-0" + (10 - i), date: new Date(2026, 9 - i, 9), amount: pro.price }));
  return <div>
    {plan === "pro" ? <div style={{ background: "var(--lime-50)", border: "1px solid var(--line)", borderRadius: 24, padding: 18, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h2 style={{ fontSize: 22, color: "#7CB83A", fontWeight: 600 }}>Your Pro Plan</h2><button className="btn btn-sm" style={{ background: "transparent" }} onClick={() => setConfirm("cancel")}><Icon n="cancel" s={15} />Cancel Plan</button></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 12 }}>
        <div className="card" style={{ padding: 18 }}><h3 style={{ fontSize: 16, fontFamily: "var(--f-body)", fontWeight: 600, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>Manage Subscription</h3><div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>{pro.features.map((f) => <div key={f} style={{ display: "flex", gap: 8, fontSize: 13 }}><Icon n="check" s={15} style={{ color: "var(--g600)" }} />{f}</div>)}</div></div>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column" }}><h3 style={{ fontSize: 16, fontFamily: "var(--f-body)", fontWeight: 600, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>Billing & Payment</h3>
          {[["Price", money(pro.price) + "/month"], ["Status", <span className="badge badge-green"><Icon n="checkC" s={13} />Active</span>], ["Next billing date", "Nov 9, 2026"], ["Payment method", <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><span style={{ background: "#1A1F71", color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 5px", borderRadius: 3, fontStyle: "italic" }}>VISA</span>Visa •••• 7723</span>]].map(([k, v]) => <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "8px 0" }}><span>{k}</span><b style={{ fontWeight: 600 }}>{v}</b></div>)}
          <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 10 }}><button className="btn btn-soft btn-block btn-sm" onClick={() => setInv(true)}>View Invoices</button><button className="btn btn-ghost btn-sm" onClick={() => setPay(true)}>Update card</button></div>
        </div>
      </div>
    </div> : <div style={{ background: "var(--line-2)", borderRadius: 24, padding: 22, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}><div style={{ flex: 1 }}><h2 style={{ fontSize: 22 }}>You're on the Free plan</h2><p className="mute" style={{ fontSize: 13.5, marginTop: 4 }}>Upgrade for unlimited listings, priority placement and weekly insights.</p></div><button className="btn btn-lime" onClick={() => setConfirm("upgrade")}>Upgrade to Pro</button></div>}

    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "30px 0 16px" }}><h2 style={{ fontSize: 22 }}>Subscription Plans</h2><Tabs items={CFG.tabs.billing} param="billing" def="monthly" size="sm" label="Billing period" /></div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
      {CFG.plans.map((p) => { const dark = p.id === "pro"; const active = plan === p.id;
        return <div key={p.id} style={{ borderRadius: 24, padding: 6, background: dark ? "var(--g800)" : "#F4F5F4", border: dark ? 0 : "1px solid var(--line)", color: dark ? "#fff" : "", boxShadow: dark ? "var(--sh-2)" : "none" }}>
          <div style={{ borderRadius: 20, padding: 18, background: dark ? "linear-gradient(160deg,#17694F,#0E523E)" : "#fff", border: dark ? "1px solid rgba(255,255,255,.1)" : "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h3 style={{ fontSize: 22, color: dark ? "var(--lime)" : "var(--g700)", fontWeight: 600 }}>{p.name}</h3><span className={"badge " + (dark ? "" : "badge-green")} style={dark ? { background: "rgba(168,220,98,.25)", color: "var(--lime)" } : null}>{p.badge}</span></div>
            <p style={{ fontSize: 13, opacity: .7, marginTop: 2 }}>{p.blurb}</p>
            <div key={billing} className="num xfade" style={{ fontSize: 32, margin: "16px 0", fontWeight: 500 }}>{money(price(p))}{per}</div>
            {active ? <button className={"btn btn-block " + (dark ? "btn-lime" : "btn-line")} disabled style={{ opacity: 1 }}>{dark ? "Active" : "Current plan"}</button>
              : <button className={"btn btn-block " + (dark ? "btn-lime" : "btn-line")} onClick={() => setConfirm(dark ? "upgrade" : "downgrade")}>{dark ? "Upgrade to Pro" : "Downgrade Plan"}</button>}
          </div>
          <div style={{ padding: "14px 16px 10px" }}>{p.features.map((f, i) => <div key={f} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", fontSize: 13, borderTop: i ? `1px dashed ${dark ? "rgba(255,255,255,.18)" : "#D9DCDA"}` : 0 }}><Icon n="checkC" s={17} style={{ color: dark ? "#E6F4D6" : "var(--g700)" }} />{f}</div>)}</div>
        </div>; })}
    </div>
    <Confirm open={confirm === "cancel"} onClose={() => setConfirm(null)} danger ok="Cancel plan" title="Cancel your Pro plan?" body="You'll keep Pro features until Nov 9, 2026. After that, listings above the Free limit (5/month) will be paused and your landing page will be unpublished." onOk={() => { setPlan("free"); toast("Plan cancelled — Pro active until Nov 9"); }} />
    <Confirm open={confirm === "downgrade"} onClose={() => setConfirm(null)} ok="Downgrade" title="Downgrade to Free?" body={`Your unused ${money(pro.price * 0.7)} will be credited to your account (prorated for 21 days remaining). Listings over the Free limit will be paused.`} onOk={() => { setPlan("free"); toast("Downgraded to Free — prorated credit applied"); }} />
    <CheckoutModal open={confirm === "upgrade"} onClose={() => setConfirm(null)} amount={price(pro)} per={per} onPaid={() => { setPlan("pro"); toast("Welcome to Pro!"); }} />
    <CheckoutModal open={pay} onClose={() => setPay(false)} amount={0} per="" update onPaid={() => toast("Card updated")} />
    <Modal open={inv} onClose={() => setInv(false)} title="Invoices" width={560}>
      <table className="tbl"><thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th></th></tr></thead><tbody>{invoices.map((i) => <tr key={i.id}><td>{i.id}</td><td>{i.date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td><td className="num">{money(i.amount)}</td><td style={{ textAlign: "right" }}><button className="btn btn-ghost btn-sm" onClick={() => downloadReceipt(i, money)}><Icon n="receipt" s={14} />Receipt</button></td></tr>)}</tbody></table>
    </Modal>
  </div>;
}
function downloadReceipt(i, money) {
  const txt = `${CFG.brand.name} — Receipt\n\nInvoice: ${i.id}\nDate: ${i.date.toDateString()}\nBilled to: Zara Balogun (info@luxeform.com)\nPlan: Pro (monthly)\nAmount: ${money(i.amount)}\nPaid via: Visa •••• 7723\nStatus: PAID\n`;
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" })); a.download = i.id + ".txt"; a.click();
}
/* payment adapter UI (Paystack / Flutterwave — mock) */
function CheckoutModal({ open, onClose, amount, per, onPaid, update }) {
  const [prov, setProv] = useState("paystack");
  const [stage, setStage] = useState("form");
  const money = useMoney();
  useEffect(() => { if (open) setStage("form"); }, [open]);
  const pay = () => { setStage("processing"); setTimeout(() => { setStage("done"); onPaid(); }, 1400); };
  return <Modal open={open} onClose={onClose} title={update ? "Update payment method" : "Upgrade to Pro"} width={460}>
    {stage === "form" && <div className="xfade" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <Tabs items={[{ id: "paystack", label: "Paystack" }, { id: "flutterwave", label: "Flutterwave" }]} value={prov} onChange={setProv} fill label="Payment provider" />
      <Field label="Card number"><input className="input num" placeholder="4084 0840 8408 4081" inputMode="numeric" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><Field label="Expiry"><input className="input" placeholder="MM / YY" /></Field><Field label="CVV"><input className="input" placeholder="123" inputMode="numeric" /></Field></div>
      {!update && <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: "1px dashed var(--line)", fontSize: 14 }}><span>Pro {per.replace("/", "")}</span><b className="num">{money(amount)}</b></div>}
      <button className="btn btn-dark btn-lg" onClick={pay}>{update ? "Save card" : "Pay " + money(amount)}</button>
      <p className="mute" style={{ fontSize: 11.5, textAlign: "center" }}>Test mode · secured by {prov === "paystack" ? "Paystack" : "Flutterwave"}. No real charge.</p>
    </div>}
    {stage === "processing" && <div style={{ textAlign: "center", padding: 30 }}><div style={{ width: 40, height: 40, border: "3px solid var(--line)", borderTopColor: "var(--g700)", borderRadius: "50%", margin: "0 auto", animation: "spin .8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><p className="mute" style={{ marginTop: 14 }}>Confirming with {prov}…</p></div>}
    {stage === "done" && <div className="xfade" style={{ textAlign: "center", padding: 16 }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--lime)", display: "grid", placeItems: "center", margin: "0 auto", animation: "heartpop .6s var(--spring)" }}><Icon n="check" s={26} w={2.4} /></div><h3 style={{ marginTop: 12 }}>{update ? "Card saved" : "You're on Pro"}</h3><button className="btn btn-dark" style={{ marginTop: 16 }} onClick={onClose}>Done</button></div>}
  </Modal>;
}

Object.assign(window, { Dashboard, AreaChart, useMyListings });
