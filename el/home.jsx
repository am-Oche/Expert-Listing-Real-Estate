/* Home page */
function HeroWords({ text }) {
  return <>{text.split(" ").map((w, i) => <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", paddingBottom: ".06em" }}><span style={{ display: "inline-block", animation: `wordUp .9s var(--ease) ${120 + i * 70}ms both` }}>{w}&nbsp;</span></span>)}</>;
}
function Home() {
  const [mode, setMode] = useQueryState("mode", "buy");
  const isMobile = useMedia("(max-width:760px)");
  const heroImg = useRef(null);
  useEffect(() => {
    const on = () => { if (heroImg.current) heroImg.current.style.transform = `translateY(${Math.min(window.scrollY, 700) * 0.18}px) scale(1.06)`; };
    window.addEventListener("scroll", on, { passive: true }); return () => window.removeEventListener("scroll", on);
  }, []);
  const pool = DB.LISTINGS.filter((l) => l.action === mode);
  return <div className="page-in">
    <style>{`@keyframes wordUp{from{transform:translateY(105%)}} @keyframes riseIn{from{opacity:0;transform:translateY(24px)}}`}</style>
    <Header mode="clear" />
    {/* 1 · Hero */}
    <section style={{ position: "relative", minHeight: isMobile ? 640 : 680, color: "#fff", overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--g900)" }} data-screen-label="Home hero">
      <img ref={heroImg} src={DB.IMG.hero} alt="A couple relaxing together on the sofa at home" fetchpriority="high" style={{ position: "absolute", inset: "-4% 0 0", width: "100%", height: "108%", objectFit: "cover", objectPosition: "50% 35%", transform: "scale(1.06)", willChange: "transform" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(5,20,14,.72) 0%,rgba(5,20,14,.35) 38%,rgba(5,20,14,.2) 60%,rgba(5,20,14,.7) 100%)" }} />
      <div className="wrap" style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: isMobile ? 100 : 128, width: "100%" }}>
        <h1 style={{ fontSize: "clamp(36px,5.4vw,64px)", lineHeight: 1.04, fontWeight: 500, letterSpacing: "-.025em" }}><HeroWords text="Your Home is Waiting for You" /></h1>
        <p style={{ marginTop: 14, fontSize: 16, opacity: .85, animation: "riseIn .9s var(--ease) .55s both" }}>{CFG.brand.tagline}</p>
        <div style={{ marginTop: 26, animation: "riseIn .9s var(--ease) .7s both" }}>
          <Tabs items={CFG.tabs.heroAction} param="mode" def="buy" variant="lime" label="Buy or rent" />
        </div>
        <div style={{ marginTop: "auto", width: "100%", paddingBottom: 36, animation: "riseIn 1s var(--ease) .85s both" }}>
          {isMobile ? <MobileSearch key={mode} initial={{ action: mode }} /> : <SearchBar key={mode} initial={{ action: mode }} showAction={false} />}
        </div>
      </div>
    </section>

    <Featured mode={mode} pool={pool} />
    <Categories mode={mode} />
    <SnaggingBanner />
    <BuySellBanner />
    <HowItWorks />
    <PopularLocations mode={mode} />
    <FeaturedPros />
    <Guides />
    <FAQ />
    <Footer />
    <CompareTray />
  </div>;
}

/* 2 · Featured — one large + two smaller, swipeable */
function Featured({ mode, pool }) {
  const money = useMoney();
  const items = pool.filter((l) => l.badge !== "Published by Developer").slice(0, 9);
  const pages = Math.ceil(items.length / 3);
  const [p, setP] = useState(0);
  useEffect(() => setP(0), [mode]);
  const isMobile = useMedia("(max-width:760px)");
  const sx = useRef(null);
  return <section className="sec" style={{ paddingBottom: 40 }}>
    <div className="wrap">
      <Reveal className="sec-h" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", textAlign: "left", gap: 16 }}>
        <h2 key={mode} className="xfade" style={{ fontSize: "clamp(28px,3.4vw,40px)" }}>Featured Properties for {mode === "buy" ? "Sale" : "Rent"}</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="icon-btn" onClick={() => setP((p - 1 + pages) % pages)} aria-label="Previous featured"><Icon n="chevL" /></button>
          <button className="icon-btn" onClick={() => setP((p + 1) % pages)} aria-label="Next featured"><Icon n="chevR" /></button>
        </div>
      </Reveal>
      <div style={{ overflow: "hidden", margin: "0 -6px", padding: "0 6px" }} onPointerDown={(e) => (sx.current = e.clientX)} onPointerUp={(e) => { const d = e.clientX - (sx.current ?? e.clientX); if (d < -60) setP((p + 1) % pages); if (d > 60) setP((p - 1 + pages) % pages); sx.current = null; }}>
        <div style={{ display: "flex", transition: "transform .7s var(--ease)", transform: `translateX(${-p * 100}%)` }}>
          {[...Array(pages)].map((_, pi) => <div key={mode + pi} style={{ flex: "0 0 100%", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr 1fr", gap: 20, alignItems: "end" }}>
            {items.slice(pi * 3, pi * 3 + 3).map((l, k) => <Reveal key={l.id} delay={k * 90}><FeatureTile l={l} big={k === 0} money={money} isMobile={isMobile} /></Reveal>)}
          </div>)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 26 }}>{[...Array(pages)].map((_, i) => <button key={i} onClick={() => setP(i)} aria-label={"Slide " + (i + 1)} style={{ width: i === p ? 26 : 8, height: 8, borderRadius: 8, background: i === p ? "var(--g700)" : "#D5D9D7", transition: "width .4s var(--ease)" }} />)}</div>
    </div>
  </section>;
}
function FeatureTile({ l, big, money, isMobile }) {
  const [hov, setHov] = useState(false);
  return <Link to={"/property/" + l.id} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: "block" }}>
    <div style={{ position: "relative", height: isMobile ? 280 : big ? 400 : 330, borderRadius: 22, overflow: "hidden" }}>
      <img src={l.photos[0]} alt={l.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transform: hov ? "scale(1.05)" : "scale(1)", transition: "transform 1s var(--ease)" }} />
      <Heart id={l.id} style={{ top: 14, right: 14 }} />
      <span className="btn btn-white btn-sm" style={{ position: "absolute", left: "50%", bottom: 18, transform: `translate(-50%, ${hov ? 0 : 14}px)`, opacity: hov || isMobile ? 1 : 0, transition: "all .4s var(--ease)", boxShadow: "var(--sh-2)" }}>See Details</span>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginTop: 14, alignItems: "baseline" }}>
      <div style={{ fontFamily: "var(--f-head)", fontSize: 17, fontWeight: 500 }}>{l.title}</div>
      <div className="price" style={{ fontSize: 17, fontWeight: 600, whiteSpace: "nowrap" }}>{money(l.price, { compact: l.price >= 1e8 })}{l.action === "rent" && <span className="mute" style={{ fontSize: 13, fontWeight: 400 }}>/yr</span>}</div>
    </div>
    <div className="mute" style={{ fontSize: 13, display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}><Icon n="pin" s={14} />{l.area}, {l.cityName}</div>
    <div style={{ marginTop: 10 }}><Specs l={l} small /></div>
  </Link>;
}

/* 3 · Explore Categories — config-generated chip tabs + animated list + pagination */
function Categories({ mode }) {
  const tabs = [{ id: "all", label: "All" }, ...CFG.propertyTypes.map((t) => ({ id: t.id, label: t.label }))];
  const [cat] = useQueryState("cat", "all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  useEffect(() => { setPage(1); setLoading(true); const t = setTimeout(() => setLoading(false), 320); return () => clearTimeout(t); }, [cat, mode]);
  const list = DB.LISTINGS.filter((l) => l.action === mode && (cat === "all" || l.type === cat));
  const per = 3, pages = Math.max(1, Math.ceil(list.length / per));
  const shown = list.slice((page - 1) * per, page * per);
  return <section className="sec" style={{ background: "#FAFAFA", borderTop: "1px solid var(--line-2)" }}>
    <div className="wrap" style={{ maxWidth: 1040 }}>
      <Reveal className="sec-h"><h2>Explore Categories</h2><p>Browse by property type, location, or lifestyle — find your perfect match.</p></Reveal>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}><Tabs items={tabs} param="cat" def="all" variant="chips" label="Property categories" push={false} /></div>
      <div role="tabpanel" id="panel-cat" style={{ display: "flex", flexDirection: "column", gap: 16, minHeight: 300 }}>
        {loading ? [0, 1, 2].map((i) => <CardSkeleton key={i} />) :
          shown.length ? shown.map((l, i) => <div key={l.id} style={{ animation: `riseIn .55s var(--ease) ${i * 80}ms both` }}><ListingCardH l={l} /></div>)
            : <EmptyState icon="building" title={`No ${typeLabel(cat, true).toLowerCase()} for ${mode} yet`} body="New listings are added daily. Save this search to be alerted first." action={<Link to={`/search?action=${mode}`} className="btn btn-dark">Browse all listings</Link>} />}
      </div>
      {pages > 1 && <div style={{ marginTop: 26 }}><Pagination page={page} pages={pages} onPage={setPage} /></div>}
      <div style={{ textAlign: "center", marginTop: 22 }}><Link to={buildHash("/search", { action: mode, type: cat === "all" ? "" : cat }).slice(1)} className="btn btn-lime">See All Options <Icon n="arrowR" s={16} /></Link></div>
    </div>
  </section>;
}

/* 4 · Snagging banner */
function SnaggingBanner() {
  const chips = ["Detailed property inspection reports", "Transparent pricing with no hidden fees", "Expert engineers and certified inspectors", "Easy booking and fast turnaround"];
  const icons = ["doc", "money", "shield", "cal"];
  const isMobile = useMedia("(max-width:760px)");
  return <section className="sec" style={{ paddingBottom: 40 }}><div className="wrap">
    <Reveal style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.15fr", borderRadius: 28, overflow: "hidden", minHeight: 400, background: "var(--g700)" }}>
      <div style={{ background: "var(--lime)", padding: isMobile ? 28 : "52px 48px", display: "flex", flexDirection: "column", color: "#0B2A20" }}>
        <h2 style={{ fontSize: "clamp(30px,3.4vw,44px)", lineHeight: 1.05, fontWeight: 600 }}>Snagging Service Before You Move In</h2>
        <p style={{ marginTop: 16, fontSize: 15, maxWidth: 420, opacity: .82 }}>Our professional snagging service identifies construction defects and unfinished work before you take possession — saving you time, money, and stress.</p>
        <div style={{ marginTop: "auto", paddingTop: 28 }}><Link to="/snagging" className="btn btn-white">Book Snagging Service</Link></div>
      </div>
      <div style={{ position: "relative", minHeight: 340 }}>
        <img src={DB.IMG.inspector} alt="Inspector checking a building under completion" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,rgba(10,63,49,.35),transparent 50%)" }} />
        <div style={{ position: "absolute", right: 18, top: 22, display: "flex", flexDirection: "column", gap: 10, maxWidth: 240 }}>
          {chips.map((c, i) => <Reveal key={c} delay={200 + i * 110}><div style={{ display: "flex", gap: 10, alignItems: "center", background: "rgba(40,50,45,.42)", backdropFilter: "blur(14px) saturate(1.3)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,.22)", color: "#fff", borderRadius: 14, padding: "9px 12px", fontSize: 12.5, lineHeight: 1.3 }}><Icon n={icons[i]} s={16} style={{ color: "var(--lime)" }} />{c}</div></Reveal>)}
        </div>
      </div>
    </Reveal>
  </div></section>;
}

/* 5 · Ready to Buy or Sell */
function BuySellBanner() {
  return <section className="sec" style={{ paddingTop: 40 }}><div className="wrap">
    <Reveal style={{ position: "relative", borderRadius: 28, overflow: "hidden", minHeight: 460, color: "#fff", textAlign: "center", padding: "64px 24px", background: "#5A8DB8" }}>
      <img src={DB.IMG.sky} alt="Modern white house under a blue sky" loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 70%" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(55,105,150,.92) 0%,rgba(70,120,165,.7) 35%,rgba(70,120,165,0) 62%)" }} />
      <div style={{ position: "relative" }}>
        <h2 style={{ fontSize: "clamp(30px,3.6vw,46px)", fontWeight: 500 }}>Ready to Buy or Sell?</h2>
        <p style={{ maxWidth: 520, margin: "12px auto 0", fontSize: 15, opacity: .92 }}>Whether you're looking for your next dream home or ready to put your property on the market — we're here to help. Our expert agents make the process smooth, fast, and stress-free.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24 }}>
          <Link to="/search?action=buy" className="btn btn-lime" style={{ minWidth: 150 }}><Icon n="building" s={16} />Buy</Link>
          <Link to="/post" className="btn btn-white" style={{ minWidth: 150 }}><Icon n="money" s={16} />Sell</Link>
        </div>
      </div>
    </Reveal>
  </div></section>;
}

/* 6 · trust + how it works */
function HowItWorks() {
  const verifiedAgents = DB.AGENTS.filter((a) => a.verified).length;
  const stats = [[DB.LISTINGS.length, "Verified listings"], [verifiedAgents, "Verified agents"], [CFG.cities.length, "Cities covered"], [24, "Hour listing review"]];
  const steps = [["search", "Search verified listings", "Filter by area, budget and title document. Every listing is checked before it goes live."], ["cal", "Book a viewing", "Pick a date and time on the listing — the agent confirms by WhatsApp or email."], ["key", "Move in with confidence", "Add a snagging inspection on new builds so defects are fixed before handover."]];
  return <section className="sec" style={{ background: "var(--g900)", color: "#fff" }}><div className="wrap">
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 1, background: "rgba(255,255,255,.1)", borderRadius: 22, overflow: "hidden", marginBottom: 72 }}>
      {stats.map(([n, l], i) => <Reveal key={l} delay={i * 80} style={{ background: "var(--g900)", padding: "28px 24px" }}><div className="num" style={{ fontSize: 44, color: "var(--lime)", fontWeight: 500, lineHeight: 1 }}><CountUp to={n} /></div><div style={{ opacity: .7, fontSize: 14, marginTop: 8 }}>{l}</div></Reveal>)}
    </div>
    <Reveal className="sec-h"><h2>How it works</h2><p style={{ color: "rgba(255,255,255,.6)" }}>Three steps from search to keys.</p></Reveal>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20 }}>
      {steps.map(([ic, t, d], i) => <Reveal key={t} delay={i * 110} style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 22, padding: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ width: 46, height: 46, borderRadius: 14, background: "var(--lime)", color: "#0B2A20", display: "grid", placeItems: "center" }}><Icon n={ic} s={21} /></div><span className="num" style={{ fontSize: 13, opacity: .5 }}>0{i + 1}</span></div>
        <h3 style={{ fontSize: 20, marginTop: 22 }}>{t}</h3><p style={{ marginTop: 8, fontSize: 14, opacity: .68 }}>{d}</p>
      </Reveal>)}
    </div>
  </div></section>;
}
function PopularLocations({ mode }) {
  const locs = [["Victoria Island", "lagos", DB.IMG.exteriors[0]], ["Ikoyi", "lagos", DB.IMG.exteriors[1]], ["Lekki Phase 1", "lagos", DB.IMG.exteriors[2]], ["Maitama", "abuja", DB.IMG.exteriors[5]], ["GRA Phase 2", "port-harcourt", DB.IMG.exteriors[3]], ["Nassarawa GRA", "kano", DB.IMG.exteriors[7]]];
  return <section className="sec"><div className="wrap">
    <Reveal className="sec-h"><h2>Popular locations</h2><p>Where people are {mode === "buy" ? "buying" : "renting"} this month.</p></Reveal>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
      {locs.map(([a, c, img], i) => { const n = DB.LISTINGS.filter((l) => l.area === a && l.action === mode).length; const city = CFG.cities.find((x) => x.id === c).name;
        return <Reveal key={a} delay={(i % 3) * 80}><Link to={`/search?action=${mode}&city=${c}&area=${encodeURIComponent(a)}`} className="loc-tile" style={{ display: "block", position: "relative", height: 200, borderRadius: 22, overflow: "hidden", color: "#fff" }}>
          <img src={img} alt={a} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .9s var(--ease)" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent 40%,rgba(0,0,0,.65))" }} />
          <div style={{ position: "absolute", left: 18, bottom: 16, right: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}><div><div style={{ fontFamily: "var(--f-head)", fontSize: 21 }}>{a}</div><div style={{ fontSize: 13, opacity: .8 }}>{city}</div></div><span className="badge badge-white">{n} {n === 1 ? "listing" : "listings"}</span></div>
        </Link></Reveal>; })}
    </div>
    <style>{`.loc-tile:hover img{transform:scale(1.06)}`}</style>
  </div></section>;
}
function FeaturedPros() {
  const [tab, setTab] = useState("agents");
  const sc = useRef(null);
  return <section className="sec" style={{ background: "#FAFAFA", borderTop: "1px solid var(--line-2)" }}><div className="wrap">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
      <div><h2 style={{ fontSize: "clamp(28px,3.4vw,40px)" }}>Featured professionals</h2><p className="mute" style={{ marginTop: 6, fontSize: 14 }}>Verified agents and developers with the best-rated service.</p></div>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Tabs items={CFG.tabs.directory} value={tab} onChange={setTab} label="Professionals" /><button className="icon-btn" onClick={() => sc.current.scrollBy({ left: -300, behavior: "smooth" })} aria-label="Scroll left"><Icon n="chevL" /></button><button className="icon-btn" onClick={() => sc.current.scrollBy({ left: 300, behavior: "smooth" })} aria-label="Scroll right"><Icon n="chevR" /></button></div>
    </div>
    <div ref={sc} key={tab} className="xfade" style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", paddingBottom: 8, scrollbarWidth: "none" }}>
      {tab === "agents" ? DB.AGENTS.map((a) => <Link key={a.id} to={"/agents/" + a.id} className="card" style={{ flex: "0 0 270px", scrollSnapAlign: "start", padding: 18, display: "flex", flexDirection: "column", gap: 12, transition: "transform .3s var(--ease)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}><Avatar src={a.photo} name={a.name} s={52} /><div><div style={{ fontWeight: 600, display: "flex", gap: 4, alignItems: "center" }}>{a.name}{a.verified && <Icon n="verified" s={15} style={{ color: "var(--g600)" }} />}</div><div className="mute" style={{ fontSize: 12.5 }}>{a.years}+ Years Experience</div></div></div>
        <Stars v={a.rating} count={a.reviews} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}><span className="chip">{a.active} Active</span><span className="chip">{a.sales} Sales</span><span className="chip"><Icon n="pin" s={13} />{a.city}</span></div>
      </Link>) : DB.DEVELOPERS.map((d) => <div key={d.id} className="card" style={{ flex: "0 0 270px", scrollSnapAlign: "start", padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}><span className="avatar" style={{ width: 52, height: 52, borderRadius: 14, background: "var(--g700)", color: "var(--lime)", fontSize: 18 }}>{initials(d.name)}</span><div><div style={{ fontWeight: 600, display: "flex", gap: 4, alignItems: "center" }}>{d.name}{d.verified && <Icon n="verified" s={15} style={{ color: "var(--g600)" }} />}</div><div className="mute" style={{ fontSize: 12.5 }}>Since {d.founded} · {d.city}</div></div></div>
        <Stars v={d.rating} /><p className="mute" style={{ fontSize: 13 }}>{d.bio}</p><span className="chip" style={{ alignSelf: "flex-start" }}>{d.projects} projects</span>
      </div>)}
    </div>
  </div></section>;
}
function Guides() {
  return <section className="sec"><div className="wrap">
    <Reveal className="sec-h"><h2>Guides for Nigerian buyers & renters</h2></Reveal>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
      {DB.BLOG.map((b, i) => <Reveal key={b.id} delay={i * 90}><a href="#" onClick={(e) => e.preventDefault()} style={{ display: "block" }}>
        <div style={{ height: 210, borderRadius: 22, overflow: "hidden" }}><img src={b.img} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}><span className="badge badge-soft">{b.tag}</span><span className="mute" style={{ fontSize: 12.5 }}>{b.mins} min read</span></div>
        <h3 style={{ fontSize: 19, marginTop: 8 }}>{b.title}</h3>
      </a></Reveal>)}
    </div>
  </div></section>;
}
function FAQ() {
  return <section className="sec" style={{ paddingTop: 20 }}><div className="wrap" style={{ maxWidth: 820 }}>
    <Reveal className="sec-h"><h2>Frequently asked questions</h2></Reveal>
    <div style={{ borderTop: "1px solid var(--line)" }}>{CFG.faqs.map((f, i) => <Accordion key={f.q} title={f.q} defaultOpen={i === 0}><p className="mute" style={{ paddingBottom: 20, fontSize: 14.5, maxWidth: 680 }}>{f.a}</p></Accordion>)}</div>
  </div></section>;
}

Object.assign(window, { Home });
