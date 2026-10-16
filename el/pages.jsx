/* Agents directory + profile, Snagging, Admin, About/Contact, App shell */
function Agents() {
  const [tab] = useQueryState("tab", "agents");
  const [f, setF] = useState({ city: "", spec: "", lang: "", rating: "" });
  const specs = [...new Set(DB.AGENTS.map((a) => a.specialty))], langs = [...new Set(DB.AGENTS.flatMap((a) => a.languages))];
  const agents = DB.AGENTS.filter((a) => (!f.city || a.city === f.city) && (!f.spec || a.specialty === f.spec) && (!f.lang || a.languages.includes(f.lang)) && (!f.rating || a.rating >= +f.rating));
  const devs = DB.DEVELOPERS.filter((d) => !f.city || d.city === f.city);
  return <div className="page-in"><Header mode="green" />
    <div style={{ background: "var(--g700)", color: "#fff", padding: "34px 0 40px" }}><div className="wrap">
      <h1 style={{ fontSize: "clamp(30px,4vw,44px)" }}>{tab === "agents" ? "Find a verified agent" : "Trusted developers"}</h1>
      <p style={{ opacity: .75, marginTop: 6 }}>Every professional is ID-checked and reviewed by verified clients.</p>
      <div style={{ marginTop: 20 }}><Tabs items={CFG.tabs.directory} param="tab" def="agents" variant="onDark" label="Directory" /></div>
    </div></div>
    <div className="wrap" style={{ padding: "26px 24px 80px" }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <select className="select" style={{ width: 180 }} value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} aria-label="Location"><option value="">All locations</option>{CFG.cities.map((c) => <option key={c.id}>{c.name}</option>)}</select>
        {tab === "agents" && <><select className="select" style={{ width: 180 }} value={f.spec} onChange={(e) => setF({ ...f, spec: e.target.value })} aria-label="Specialty"><option value="">Any specialty</option>{specs.map((s) => <option key={s}>{s}</option>)}</select>
          <select className="select" style={{ width: 160 }} value={f.lang} onChange={(e) => setF({ ...f, lang: e.target.value })} aria-label="Language"><option value="">Any language</option>{langs.map((s) => <option key={s}>{s}</option>)}</select>
          <select className="select" style={{ width: 150 }} value={f.rating} onChange={(e) => setF({ ...f, rating: e.target.value })} aria-label="Rating"><option value="">Any rating</option><option value="4.5">4.5+</option><option value="4.8">4.8+</option></select></>}
      </div>
      <TabPanel id="tab" k={tab}>
        {tab === "agents" ? (agents.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>{agents.map((a, i) => <Reveal key={a.id} delay={(i % 3) * 70}><Link to={"/agents/" + a.id} className="card" style={{ display: "block", padding: 18, transition: "transform .3s var(--ease), box-shadow .3s" }}>
          <div style={{ display: "flex", gap: 14 }}><Avatar src={a.photo} name={a.name} s={64} /><div style={{ flex: 1 }}><div style={{ fontFamily: "var(--f-head)", fontSize: 19, display: "flex", gap: 5, alignItems: "center" }}>{a.name}{a.verified && <Icon n="verified" s={16} style={{ color: "var(--g600)" }} />}</div><div className="mute" style={{ fontSize: 12.5 }}>{a.company} · {a.years}+ yrs</div><div style={{ marginTop: 4 }}><Stars v={a.rating} count={a.reviews} size={12} /></div></div></div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}><span className="chip">{a.active} Active properties</span><span className="chip">{a.sales} Sale Transactions</span></div>
          <div className="mute" style={{ fontSize: 12.5, marginTop: 10, display: "flex", gap: 14 }}><span style={{ display: "flex", gap: 4, alignItems: "center" }}><Icon n="lang" s={14} />{a.languages.join(" · ")}</span><span className="loc" style={{ display: "flex", gap: 4, alignItems: "center" }}><Icon n="pin" s={14} />{a.city}</span></div>
        </Link></Reveal>)}</div> : <EmptyState icon="user" title="No agents match" body="Try removing a filter." />)
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>{devs.map((d) => { const ls = DB.LISTINGS.filter((l) => l.developerId === d.id); return <div key={d.id} className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}><span className="avatar" style={{ width: 56, height: 56, borderRadius: 16, background: "var(--g700)", color: "var(--lime)", fontSize: 19 }}>{initials(d.name)}</span><div><div style={{ fontFamily: "var(--f-head)", fontSize: 19, display: "flex", gap: 5, alignItems: "center" }}>{d.name}{d.verified && <Icon n="verified" s={16} style={{ color: "var(--g600)" }} />}</div><Stars v={d.rating} size={12} /></div></div>
            <p className="mute" style={{ fontSize: 13.5, marginTop: 12 }}>{d.bio}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}><span className="chip">{d.projects} projects</span><span className="chip">{ls.length} listings</span><span className="chip">Since {d.founded}</span></div>
            <div style={{ display: "flex", gap: 6, marginTop: 14 }}>{ls.slice(0, 3).map((l) => <Link key={l.id} to={"/property/" + l.id} style={{ flex: 1, height: 70, borderRadius: 12, overflow: "hidden" }}><img src={l.photos[0]} alt={l.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></Link>)}</div>
          </div>; })}</div>}
      </TabPanel>
    </div><Footer /></div>;
}
function AgentProfile({ id }) {
  const a = agentById(id) || DB.AGENTS[0];
  const [tab] = useQueryState("tab", "listings");
  const ls = DB.LISTINGS.filter((l) => l.agentId === a.id);
  const isMobile = useMedia("(max-width:860px)");
  const rv = useRef(null);
  return <div className="page-in"><Header />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "RealEstateAgent", name: a.name, areaServed: a.city, aggregateRating: { "@type": "AggregateRating", ratingValue: a.rating, reviewCount: a.reviews } }) }} />
    <div className="wrap" style={{ padding: "28px 24px 80px" }}>
      <div className="card" style={{ padding: 18, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 22, borderRadius: 26 }}>
        <div style={{ borderRadius: 18, overflow: "hidden", background: "var(--g100)", aspectRatio: isMobile ? "16/10" : "auto", minHeight: 220 }}>{a.photo ? <img src={a.photo} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 20%" }} /> : <div style={{ height: "100%", display: "grid", placeItems: "center", fontFamily: "var(--f-head)", fontSize: 56, color: "var(--g700)" }}>{initials(a.name)}</div>}</div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}><div><h1 style={{ fontSize: 34, display: "flex", gap: 8, alignItems: "center" }}>{a.name}{a.verified && <Icon n="verified" s={22} style={{ color: "var(--g600)" }} />}</h1><div className="mute" style={{ fontSize: 13 }}>{a.years}+ Years Experience</div></div><span className="stars" style={{ fontSize: 15 }}><Icon n="star" s={17} style={{ color: "var(--star)" }} /><b>{a.rating}</b><span className="mute">({a.reviews})</span></span></div>
          <hr className="dash-sep" style={{ margin: "14px 0" }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><span className="chip" style={{ background: "var(--line-2)", border: 0 }}>{a.active} Active properties</span><span className="chip" style={{ background: "var(--line-2)", border: 0 }}>{a.sales} Sale Transactions</span>{a.plan === "pro" && <span className="badge badge-soft" style={{ height: 30 }}>Pro agent</span>}</div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 13.5, flexWrap: "wrap" }}><span style={{ display: "flex", gap: 6, alignItems: "center" }}><Icon n="lang" s={16} />{a.languages.join(" · ")}</span><span className="loc" style={{ display: "flex", gap: 6, alignItems: "center" }}><Icon n="pin" s={16} />{a.city}, Nigeria</span></div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, padding: 10, borderRadius: 14, border: "1px solid var(--line)", maxWidth: 420 }}><span className="avatar" style={{ width: 38, height: 38, borderRadius: 10, background: "var(--g700)", color: "var(--lime)", fontSize: 13 }}>{initials(a.company)}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.company}</div><div className="mute" style={{ fontSize: 12 }}>Brokerage</div></div><span className="stars"><Icon n="star" s={13} style={{ color: "var(--star)" }} />4.7</span></div>
          <p style={{ fontSize: 14, marginTop: 14, color: "var(--ink-2)", maxWidth: 720 }}>{a.bio}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}><a href={"tel:" + a.phone} className="btn btn-dark"><Icon n="phone" s={15} />Call Agent</a><a href={waLink(a.phone, `Hello ${a.name}, I found your profile on ${CFG.brand.name}.`)} target="_blank" rel="noopener" className="btn btn-lime"><Icon n="wa" s={15} />WhatsApp</a><a href={"mailto:" + a.email} className="btn btn-ghost"><Icon n="mail" s={15} />Email</a></div>
        </div>
      </div>
      <div style={{ margin: "28px 0 20px" }}><Tabs items={CFG.tabs.agent.map((t) => (t.id === "listings" ? { ...t, count: ls.length } : t))} param="tab" def="listings" variant="under" label="Agent sections" /></div>
      <TabPanel id="tab" k={tab}>
        {tab === "listings" && (ls.length ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 18 }}>{ls.map((l) => <ListingCardV key={l.id} l={l} />)}</div> : <EmptyState icon="home" title="No active listings" />)}
        {tab === "reviews" && <div><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}><h3 style={{ fontSize: 20 }}>Reviews About Agent</h3><div style={{ display: "flex", gap: 6 }}><button className="icon-btn" onClick={() => rv.current.scrollBy({ left: -320, behavior: "smooth" })} aria-label="Previous reviews"><Icon n="chevL" /></button><button className="icon-btn" onClick={() => rv.current.scrollBy({ left: 320, behavior: "smooth" })} aria-label="Next reviews"><Icon n="chevR" /></button></div></div>
          <div ref={rv} style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "min(320px,85%)", gap: 14, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none" }}><ReviewsList agentId={a.id} grid /></div>
          <p className="mute" style={{ fontSize: 12, marginTop: 12 }}>Only clients who contacted this agent through {CFG.brand.name} can leave a review.</p></div>}
        {tab === "about" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>{[["Specialty", a.specialty], ["Service areas", CFG.cities.find((c) => c.name === a.city).areas.slice(0, 4).join(", ")], ["Languages", a.languages.join(", ")], ["Verification", a.verified ? "ID & licence verified" : "Pending"], ["Response time", "Usually within 2 hours"], ["Member since", 2026 - Math.min(a.years, 6)]].map(([k, v]) => <div key={k} className="card" style={{ padding: 16 }}><div className="mute" style={{ fontSize: 12.5 }}>{k}</div><div style={{ fontWeight: 600, marginTop: 4 }}>{v}</div></div>)}</div>}
      </TabPanel>
    </div><Footer /></div>;
}

function Snagging() {
  const [pkg, setPkg] = useState("standard");
  const [sent, setSent] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", address: "", date: "2026-10-20", type: "Apartment" });
  const money = useMoney();
  const { toast } = useStore();
  const isMobile = useMedia("(max-width:860px)");
  const ok = f.name.length > 1 && f.phone.replace(/\D/g, "").length >= 10 && f.address.length > 3;
  return <div className="page-in"><Header />
    <section className="wrap" style={{ paddingTop: 28 }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.1fr", borderRadius: 28, overflow: "hidden", minHeight: 420 }}>
        <div style={{ background: "var(--g700)", color: "#fff", padding: isMobile ? 28 : 52, display: "flex", flexDirection: "column" }}><span className="badge" style={{ background: "rgba(168,220,98,.2)", color: "var(--lime)", alignSelf: "flex-start" }}>Snagging service</span><h1 style={{ fontSize: "clamp(34px,4vw,52px)", lineHeight: 1.04, marginTop: 14 }}>Snagging Service Before You Move In</h1><p style={{ opacity: .78, marginTop: 14, maxWidth: 440 }}>Our professional snagging service identifies construction defects and unfinished work before you take possession — saving you time, money, and stress.</p><a href="#book" onClick={(e) => { e.preventDefault(); const el = document.getElementById("book"); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" }); }} className="btn btn-white" style={{ alignSelf: "flex-start", marginTop: "auto" }}>Book Snagging Service</a></div>
        <div style={{ position: "relative", minHeight: 300 }}><img src={DB.IMG.inspector} alt="Inspector on site" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} /></div>
      </div>
    </section>
    <section className="sec"><div className="wrap">
      <Reveal className="sec-h"><h2>How it works</h2></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>{[["cal", "Book a slot", "Choose a package and preferred date."], ["shield", "Certified inspection", "An engineer checks 300+ points on site."], ["doc", "Detailed report", "Photo-annotated PDF within 48 hours."], ["houseCheck", "Developer fixes", "We send the snag list and re-inspect."]].map(([ic, t, d], i) => <Reveal key={t} delay={i * 80} className="card" style={{ padding: 20 }}><div style={{ width: 44, height: 44, borderRadius: 14, background: "var(--lime-100)", color: "var(--g700)", display: "grid", placeItems: "center" }}><Icon n={ic} s={20} /></div><h3 style={{ fontSize: 18, marginTop: 14 }}>{t}</h3><p className="mute" style={{ fontSize: 13.5, marginTop: 4 }}>{d}</p></Reveal>)}</div>
    </div></section>
    <section className="sec" id="book" style={{ background: "#FAFAFA", borderTop: "1px solid var(--line-2)" }}><div className="wrap" style={{ maxWidth: 1080 }}>
      <Reveal className="sec-h"><h2>Choose a package</h2><p>Transparent pricing with no hidden fees.</p></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>{CFG.snaggingPackages.map((p) => { const on = pkg === p.id; return <button key={p.id} onClick={() => setPkg(p.id)} aria-pressed={on} style={{ textAlign: "left", borderRadius: 22, padding: 20, background: on ? "var(--g700)" : "#fff", color: on ? "#fff" : "", border: "1px solid " + (on ? "var(--g700)" : "var(--line)"), transition: "all .3s var(--ease)", transform: on ? "translateY(-4px)" : "none", boxShadow: on ? "var(--sh-2)" : "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><h3 style={{ fontSize: 20, color: on ? "var(--lime)" : "" }}>{p.name}</h3>{p.popular && <span className="badge badge-lime">Popular</span>}</div>
        <div className="num" style={{ fontSize: 28, margin: "10px 0 14px" }}>{money(p.price)}</div>
        {p.items.map((x) => <div key={x} style={{ display: "flex", gap: 8, fontSize: 13.5, padding: "5px 0" }}><Icon n="checkC" s={16} style={{ color: on ? "var(--lime)" : "var(--g700)" }} />{x}</div>)}
      </button>; })}</div>
      <div className="card" style={{ padding: 22, marginTop: 20, borderRadius: 24 }}>
        {sent ? <div className="xfade" style={{ textAlign: "center", padding: 24 }}><div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--lime)", display: "grid", placeItems: "center", margin: "0 auto" }}><Icon n="check" s={26} w={2.4} /></div><h3 style={{ marginTop: 12 }}>Booking received</h3><p className="mute" style={{ fontSize: 14, marginTop: 6 }}>Ref SNG-{String(Date.now()).slice(-5)} · {CFG.snaggingPackages.find((p) => p.id === pkg).name} on {f.date}. Our team will call {f.phone} to confirm.</p><button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => setSent(false)}>Book another</button></div> :
          <form onSubmit={(e) => { e.preventDefault(); if (!ok) return toast("Please complete all fields", "info"); setSent(true); toast("Snagging request sent"); }} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <Field label="Full name"><input className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
            <Field label="Phone (+234)"><input className="input" inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
            <Field label="Property type"><select className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{CFG.propertyTypes.map((t) => <option key={t.id}>{t.label}</option>)}</select></Field>
            <Field label="Property address" style={{ gridColumn: "span 2" }}><input className="input" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></Field>
            <Field label="Preferred date"><input className="input" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
            <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}><span className="mute" style={{ fontSize: 13 }}>Selected: <b style={{ color: "var(--ink)" }}>{CFG.snaggingPackages.find((p) => p.id === pkg).name} · {money(CFG.snaggingPackages.find((p) => p.id === pkg).price)}</b></span><button className="btn btn-lime btn-lg">Book inspection<Icon n="arrowR" s={16} /></button></div>
          </form>}
      </div>
    </div></section>
    <Footer /></div>;
}

function Admin() {
  const [tab] = useQueryState("tab", "moderation");
  const { toast } = useStore();
  const [queue, setQueue] = useState(() => DB.LISTINGS.slice(20, 26).map((l) => ({ ...l, mod: "pending" })));
  const [reject, setReject] = useState(null);
  const [reason, setReason] = useState("");
  const [log, setLog] = useState([]);
  const [agents, setAgents] = useState(() => DB.AGENTS.map((a) => ({ ...a, vstate: a.verified ? "verified" : "pending" })));
  const money = useMoney();
  const act = (msg) => setLog((l) => [{ at: new Date(), msg }, ...l]);
  const items = CFG.tabs.admin.map((t) => t.id === "moderation" ? { ...t, count: queue.filter((q) => q.mod === "pending").length } : t);
  return <div className="page-in" style={{ background: "#F6F7F6", minHeight: "100vh" }}><Header />
    <div className="wrap" style={{ padding: "28px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}><h1 style={{ fontSize: 30, flex: 1 }}>Admin</h1><span className="badge badge-amber">Role: admin</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, margin: "18px 0" }}>{[["Listings live", DB.LISTINGS.length], ["Pending review", queue.filter((q) => q.mod === "pending").length], ["Agents", DB.AGENTS.length], ["Leads (30d)", 412], ["MRR", money(38 * 2000)]].map(([k, v]) => <div key={k} className="card" style={{ padding: 16 }}><div className="mute" style={{ fontSize: 12.5 }}>{k}</div><div className="num" style={{ fontSize: 26 }}>{v}</div></div>)}</div>
      <Tabs items={items} param="tab" def="moderation" label="Admin sections" />
      <TabPanel id="tab" k={tab} style={{ marginTop: 18 }}>
        {tab === "moderation" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{queue.map((l) => <div key={l.id} className="card" style={{ padding: 14, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", opacity: l.mod === "pending" ? 1 : .6, transition: "opacity .3s" }}>
          <img src={l.photos[0]} alt="" style={{ width: 90, height: 66, borderRadius: 12, objectFit: "cover" }} />
          <div style={{ flex: 1, minWidth: 200 }}><div style={{ fontWeight: 600 }}>{l.title} <span className="mute" style={{ fontWeight: 400 }}>· {l.id}</span></div><div className="mute" style={{ fontSize: 12.5 }}>{typeLabel(l.type)} · {l.area}, {l.cityName} · {money(l.price, { compact: true })} · by {agentById(l.agentId).name}</div><div style={{ display: "flex", gap: 6, marginTop: 6 }}><span className="badge badge-gray">{l.photos.length} photos</span><span className="badge badge-gray">{l.tenure || "Lease"}</span></div></div>
          {l.mod === "pending" ? <div style={{ display: "flex", gap: 6 }}><button className="btn btn-sm btn-danger" onClick={() => { setReject(l); setReason(""); }}>Reject</button><button className="btn btn-sm btn-lime" onClick={() => { setQueue(queue.map((q) => (q.id === l.id ? { ...q, mod: "approved" } : q))); act(`Approved ${l.id}`); toast("Listing approved & published"); }}>Approve</button></div> : <span className={"badge " + (l.mod === "approved" ? "badge-soft" : "badge-red")}>{l.mod}</span>}
        </div>)}</div>}
        {tab === "verification" && <div className="card" style={{ padding: 0, overflowX: "auto" }}><table className="tbl" style={{ minWidth: 640 }}><thead><tr><th>Agent</th><th>Company</th><th>Documents</th><th>Status</th><th></th></tr></thead><tbody>{agents.map((a) => <tr key={a.id}><td><div style={{ display: "flex", gap: 10, alignItems: "center" }}><Avatar src={a.photo} name={a.name} s={32} />{a.name}</div></td><td>{a.company}</td><td><span className="chip"><Icon n="doc" s={14} />NIN</span> <span className="chip"><Icon n="doc" s={14} />Licence</span></td><td><span className={"badge " + (a.vstate === "verified" ? "badge-soft" : a.vstate === "rejected" ? "badge-red" : "badge-amber")}>{a.vstate}</span></td><td style={{ textAlign: "right" }}>{a.vstate === "pending" && <button className="btn btn-sm btn-dark" onClick={() => { setAgents(agents.map((x) => (x.id === a.id ? { ...x, vstate: "verified" } : x))); act(`Verified agent ${a.name}`); toast(a.name + " verified"); }}>Verify</button>}</td></tr>)}</tbody></table></div>}
        {tab === "snagging" && <div className="card" style={{ padding: 0, overflowX: "auto" }}><table className="tbl" style={{ minWidth: 600 }}><thead><tr><th>Ref</th><th>Client</th><th>Package</th><th>Date</th><th>Status</th></tr></thead><tbody>{[["SNG-20391", "Bola T.", "Complete", "Oct 14", "Scheduled"], ["SNG-20388", "Chinedu O.", "Developer-grade", "Oct 16", "New"], ["SNG-20377", "Aisha M.", "Essential", "Oct 9", "Report sent"]].map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{i === 4 ? <span className={"badge " + (c === "New" ? "badge-lime" : "badge-gray")}>{c}</span> : c}</td>)}</tr>)}</tbody></table></div>}
        {tab === "reports" && <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{[["L1012", "Photos don't match the property", "2h ago"], ["L1040", "Suspected fraud / fake agent", "1d ago"]].map(([id, r, t]) => <div key={id} className="card" style={{ padding: 14, display: "flex", gap: 12, alignItems: "center" }}><Icon n="flag" s={18} style={{ color: "var(--red)" }} /><div style={{ flex: 1 }}><b>{r}</b><div className="mute" style={{ fontSize: 12.5 }}>Listing {id} · {t}</div></div><Link to={"/property/" + id} className="btn btn-ghost btn-sm">Open</Link><button className="btn btn-dark btn-sm" onClick={() => { act("Resolved report on " + id); toast("Report resolved"); }}>Resolve</button></div>)}</div>}
      </TabPanel>
      <h3 style={{ fontSize: 17, margin: "30px 0 10px" }}>Audit log</h3>
      <div className="card" style={{ padding: 14, fontSize: 13 }}>{log.length ? log.map((l, i) => <div key={i} style={{ padding: "6px 0", borderBottom: "1px dashed var(--line)" }}><span className="mute num">{l.at.toLocaleTimeString()}</span> · admin@expertlisting.ng · {l.msg}</div>) : <span className="mute">No actions yet this session.</span>}</div>
    </div>
    <Modal open={!!reject} onClose={() => setReject(null)} title="Reject listing" width={460} footer={<><button className="btn btn-ghost" onClick={() => setReject(null)}>Cancel</button><button className="btn btn-danger" disabled={reason.length < 5} onClick={() => { setQueue(queue.map((q) => (q.id === reject.id ? { ...q, mod: "rejected" } : q))); act(`Rejected ${reject.id}: ${reason}`); toast("Rejected — agent notified"); setReject(null); }}>Reject & notify agent</button></>}>
      <Field label="Reason (sent to the agent)"><textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Please upload a clearer photo of the title document." /></Field>
    </Modal>
  </div>;
}

function Simple({ kind }) {
  const { toast } = useStore();
  return <div className="page-in"><Header /><div className="wrap" style={{ maxWidth: 820, padding: "56px 24px 80px" }}>
    {kind === "about" ? <><h1 style={{ fontSize: 42 }}>About {CFG.brand.name}</h1><p style={{ fontSize: 17, marginTop: 14, color: "var(--ink-2)" }}>We're building the most trustworthy way to buy, rent and sell property in Nigeria — every listing reviewed, every agent ID-verified, every fee shown upfront.</p>
      <div style={{ marginTop: 30, borderTop: "1px solid var(--line)" }}>{CFG.faqs.map((f) => <Accordion key={f.q} title={f.q}><p className="mute" style={{ paddingBottom: 18 }}>{f.a}</p></Accordion>)}</div></>
      : <><h1 style={{ fontSize: 42 }}>Contact us</h1><p className="mute" style={{ marginTop: 8 }}>{CFG.brand.email} · {CFG.brand.phone}</p>
        <form onSubmit={(e) => { e.preventDefault(); toast("Message sent — we reply within one business day"); e.target.reset(); }} className="card" style={{ padding: 22, marginTop: 24, display: "grid", gap: 12 }}><Field label="Name"><input className="input" required /></Field><Field label="Email"><input className="input" type="email" required /></Field><Field label="Topic"><select className="select"><option>General</option><option>Report a listing</option><option>Agent verification</option><option>Billing</option></select></Field><Field label="Message"><textarea className="textarea" required /></Field><label className="check"><input type="checkbox" required />I consent to {CFG.brand.name} processing my data to respond (NDPA).</label><button className="btn btn-dark btn-lg">Send message</button></form></>}
  </div><Footer /></div>;
}

/* ================= App shell / routes ================= */
function App() {
  const { path } = useRoute();
  const lenis = useRef(null);
  useEffect(() => {
    if (window.Lenis && !matchMedia("(prefers-reduced-motion: reduce)").matches && !lenis.current) {
      lenis.current = new Lenis({ duration: 1.05, smoothWheel: true, prevent: (node) => !!(node.closest && node.closest(".drawer,.modal,.dd,.menu,.leaflet-container,[role=dialog]")) });
      const raf = (t) => { lenis.current.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf);
    }
  }, []);
  useEffect(() => { lenis.current && lenis.current.scrollTo(0, { immediate: true }); }, [path]);
  const seg = path.split("/").filter(Boolean);
  let page;
  if (!seg.length) page = <Home />;
  else if (seg[0] === "search") page = <Search />;
  else if (seg[0] === "property") page = <Property id={seg[1]} key={seg[1]} />;
  else if (seg[0] === "agents" && seg[1]) page = <AgentProfile id={seg[1]} key={seg[1]} />;
  else if (seg[0] === "agents") page = <Agents />;
  else if (seg[0] === "dashboard") page = <Dashboard />;
  else if (seg[0] === "post") page = <Wizard />;
  else if (seg[0] === "snagging") page = <Snagging />;
  else if (seg[0] === "saved") page = <Saved />;
  else if (seg[0] === "admin") page = <Admin />;
  else if (seg[0] === "about" || seg[0] === "contact") page = <Simple kind={seg[0]} />;
  // SEO-style location landing: /buy/lagos/victoria-island/villas
  else if ((seg[0] === "buy" || seg[0] === "rent") && seg[1]) { const city = CFG.cities.find((c) => c.id === seg[1]); const area = city?.areas.find((a) => a.toLowerCase().replace(/\W+/g, "-") === seg[2]); const type = CFG.propertyTypes.find((t) => t.plural.toLowerCase().replace(/\W+/g, "-") === (seg[3] || seg[2])); setTimeout(() => navigate(buildHash("/search", { action: seg[0], city: city?.id, area, type: type?.id }).slice(1), { replace: true })); page = null; }
  else page = <div><Header /><div className="wrap" style={{ padding: 80 }}><EmptyState title="Page not found" action={<Link to="/" className="btn btn-dark">Go home</Link>} /></div></div>;
  return <div key={path} data-screen-label={path}>{page}</div>;
}
function Root() { return <RouterProvider><StoreProvider><App /></StoreProvider></RouterProvider>; }
ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
