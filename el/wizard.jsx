/* Post-a-listing wizard + Dropzone + verification screen */
function Dropzone({ compact, photos = [], setPhotos }) {
  const [drag, setDrag] = useState(false);
  const [local, setLocal] = useState([]);
  const list = setPhotos ? photos : local, set = setPhotos || setLocal;
  const input = useRef(null);
  const dragI = useRef(null);
  const compress = (file) => new Promise((res) => {
    const img = new Image(); img.onload = () => { const s = Math.min(1, 1600 / img.width); const c = document.createElement("canvas"); c.width = img.width * s; c.height = img.height * s; c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", 0.8)); URL.revokeObjectURL(img.src); };
    img.onerror = () => res(null); img.src = URL.createObjectURL(file);
  });
  const add = async (files) => {
    const fs = [...files].filter((f) => /^image\//.test(f.type) && f.size < 15e6).slice(0, 20 - list.length);
    const placeholders = fs.map((f, i) => ({ id: Date.now() + i, name: f.name, src: null, p: 0 }));
    let cur = [...list, ...placeholders]; set(cur);
    for (let i = 0; i < fs.length; i++) {
      const src = await compress(fs[i]);
      for (let p = 20; p <= 100; p += 20) { await new Promise((r) => setTimeout(r, 70)); cur = cur.map((x) => (x.id === placeholders[i].id ? { ...x, p, src: p === 100 ? src : x.src } : x)); set(cur); }
    }
  };
  const demo = () => set([...list, ...DB.IMG.exteriors.slice(0, 2).concat(DB.IMG.interiors.slice(0, 3)).map((src, i) => ({ id: "d" + Date.now() + i, name: src.split("/").pop(), src, p: 100 }))].slice(0, 20));
  return <div>
    <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }} onClick={() => input.current.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && input.current.click()}
      style={{ border: `1.5px dashed ${drag ? "var(--g600)" : "#CFD4D1"}`, background: drag ? "var(--g50)" : "#FAFBFA", borderRadius: 22, padding: compact ? 24 : "52px 24px", textAlign: "center", cursor: "pointer", transition: "all .25s" }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(160deg,#3E7A55,#245A3C)", color: "#fff", display: "grid", placeItems: "center", margin: "0 auto", boxShadow: "0 8px 20px -6px rgba(20,70,40,.5)", transform: drag ? "scale(1.08) rotate(-4deg)" : "none", transition: "transform .3s var(--spring)" }}><Icon n="camera" s={28} /></div>
      <h3 style={{ fontSize: 18, marginTop: 14 }}>{compact ? "Upload documents" : "Add Photos to Your Listing"}</h3>
      <p className="mute" style={{ fontSize: 13, marginTop: 4 }}>Drag & drop your images here,<br />or click to browse files</p>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 14 }}><span className="btn btn-dark btn-sm"><Icon n="plus" s={14} />Add Photos</span>{!compact && <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); demo(); }}>Use sample photos</button>}</div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
    </div>
    {list.length > 0 && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 10, marginTop: 14 }}>
      {list.map((p, i) => <div key={p.id} draggable onDragStart={() => (dragI.current = i)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.stopPropagation(); const a = [...list]; const [m] = a.splice(dragI.current, 1); a.splice(i, 0, m); set(a); }}
        style={{ position: "relative", aspectRatio: "4/3", borderRadius: 14, overflow: "hidden", background: "var(--line-2)", cursor: "grab", outline: i === 0 ? "2px solid var(--lime)" : "none", outlineOffset: 2, animation: "pop .3s var(--ease)" }}>
        {p.src && <img src={p.src} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        {p.p < 100 && <div style={{ position: "absolute", left: 8, right: 8, bottom: 8, height: 4, borderRadius: 4, background: "rgba(0,0,0,.15)" }}><div style={{ height: "100%", width: p.p + "%", background: "var(--g700)", borderRadius: 4, transition: "width .1s" }} /></div>}
        {i === 0 && <span className="badge badge-lime" style={{ position: "absolute", top: 6, left: 6, height: 20, fontSize: 10.5 }}>Cover</span>}
        <div style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 4 }}>
          {i > 0 && <button className="icon-btn sm" style={{ width: 26, height: 26 }} onClick={() => { const a = [...list]; const [m] = a.splice(i, 1); a.unshift(m); set(a); }} aria-label="Set as cover"><Icon n="star" s={12} /></button>}
          <button className="icon-btn sm" style={{ width: 26, height: 26 }} onClick={() => set(list.filter((x) => x.id !== p.id))} aria-label="Remove photo"><Icon n="x" s={12} /></button>
        </div>
      </div>)}
    </div>}
    {list.length > 0 && <p className="mute" style={{ fontSize: 12, marginTop: 8 }}>{list.length}/20 photos · drag to reorder · first photo is the cover · images are compressed before upload</p>}
  </div>;
}

const EMPTY_DRAFT = { title: "", type: "villa", action: "buy", description: "", beds: 3, baths: 3, size: "", year: 2024, amenities: [], furnished: false, tenure: CFG.tenureDocs[0], photos: [], city: "lagos", area: "Lekki Phase 1", address: "", pin: null, price: "", period: "year", negotiable: false, agencyFee: 10, legalFee: 10, caution: "", serviceCharge: "", available: "2026-11-01" };
function Wizard() {
  const steps = CFG.tabs.wizard;
  const [step, setStep] = useQueryState("step", steps[0].id);
  const [d, setD] = useState(() => LS.get("draft", EMPTY_DRAFT));
  const [err, setErr] = useState({});
  const [savedAt, setSavedAt] = useState(null);
  const [done, setDone] = useState(false);
  const { plan, toast } = useStore();
  const [ls] = useMyListings();
  const isMobile = useMedia("(max-width:860px)");
  const money = useMoney();
  const idx = steps.findIndex((s) => s.id === step);
  // autosave draft
  useEffect(() => { const t = setTimeout(() => { LS.set("draft", { ...d, photos: d.photos.filter((p) => !String(p.src).startsWith("data:")) }); setSavedAt(new Date()); }, 500); return () => clearTimeout(t); }, [d]);
  const set = (k, v) => setD((x) => ({ ...x, [k]: v }));
  const schema = {
    info: () => ({ ...(d.title.trim().length < 4 && { title: "Title must be at least 4 characters" }), ...(d.description.trim().length < 30 && { description: "Describe the property in at least 30 characters" }) }),
    features: () => ({ ...(!(+d.size > 10) && { size: "Enter the size in m²" }) }),
    photos: () => (d.photos.length < 3 ? { photos: "Add at least 3 photos" } : {}),
    location: () => ({ ...(d.address.trim().length < 4 && { address: "Enter the street address" }) }),
    price: () => ({ ...(!(+d.price > 0) && { price: "Enter a price" }) }),
    preview: () => ({})
  };
  const validStep = (id) => !Object.keys(schema[id]()).length;
  const next = () => { const e = schema[step](); setErr(e); if (Object.keys(e).length) return; idx < steps.length - 1 && setStep(steps[idx + 1].id); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const back = () => idx > 0 && setStep(steps[idx - 1].id);
  const go = (id) => { const i = steps.findIndex((s) => s.id === id); if (i <= idx || steps.slice(0, i).every((s) => validStep(s.id))) setStep(id); else toast("Complete the earlier steps first", "info"); };
  const freeUsed = ls.filter((x) => x.updated > Date.now() - 30 * 864e5).length;
  const limitHit = plan === "free" && freeUsed >= 5;
  const submit = () => { if (limitHit) return toast("Free plan limit reached — upgrade to publish", "info"); LS.set("draft", EMPTY_DRAFT); setDone(true); window.scrollTo({ top: 0 }); };
  if (done) return <Verification />;
  const preview = { ...DB.LISTINGS[0], id: "PREVIEW", title: d.title || "Your listing title", type: d.type, action: d.action, price: +d.price || 0, rentPeriod: d.period, beds: +d.beds, baths: +d.baths, size: +d.size || 0, area: d.area, cityName: CFG.cities.find((c) => c.id === d.city).name, badge: "New Listing", photos: d.photos.length ? d.photos.map((p) => p.src).filter(Boolean) : DB.LISTINGS[0].photos, agentVisited: null, daysAgo: 0, verified: false };
  return <div className="page-in"><Header />
    <div className="wrap" style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "260px minmax(0,1fr)", gap: isMobile ? 18 : 48, padding: "32px 24px 80px" }}>
      {isMobile ? <div><div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}><b>Step {idx + 1} of {steps.length} · {steps[idx].label}</b><span className="mute">{Math.round(((idx + 1) / steps.length) * 100)}%</span></div><div style={{ height: 6, borderRadius: 6, background: "var(--line)" }}><div style={{ height: "100%", width: ((idx + 1) / steps.length) * 100 + "%", background: "var(--lime)", borderRadius: 6, transition: "width .5s var(--ease)" }} /></div></div> :
        <aside style={{ position: "sticky", top: 96, alignSelf: "start" }}>
          <Link to="/dashboard" className="mute" style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}><Icon n="arrowL" s={15} />Back to dashboard</Link>
          <h3 style={{ fontSize: 17, margin: "18px 0 14px", fontFamily: "var(--f-body)", fontWeight: 700 }}>Steps to Publish</h3>
          <ol role="tablist" aria-label="Listing steps" style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
            {steps.map((s, i) => { const doneS = i < idx && validStep(s.id); const cur = i === idx; return <li key={s.id} style={{ position: "relative", paddingBottom: 16 }}>
              {i < steps.length - 1 && <span style={{ position: "absolute", left: 13, top: 28, bottom: 0, width: 2, background: i < idx ? "var(--lime)" : "var(--line)", transition: "background .4s" }} />}
              <button role="tab" aria-selected={cur} onClick={() => go(s.id)} style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 13.5, fontWeight: cur ? 700 : 500, color: cur || doneS ? "var(--ink)" : "var(--mute)" }}>
                <span style={{ width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, background: doneS ? "var(--lime)" : cur ? "var(--ink)" : "#fff", color: cur && !doneS ? "#fff" : "#173311", border: doneS || cur ? 0 : "1.5px solid var(--line)", transition: "all .3s var(--spring)", transform: cur ? "scale(1.08)" : "none" }}>{doneS ? <Icon n="check" s={14} w={2.6} /> : i + 1}</span>{s.label}
              </button></li>; })}
          </ol>
          <p className="mute" style={{ fontSize: 12, marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}><Icon n="check" s={13} />{savedAt ? "Draft autosaved " + savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Drafts save automatically"}</p>
        </aside>}
      <main style={{ minWidth: 0, maxWidth: 760 }}>
        <div key={step} style={{ animation: "wizIn .45s var(--ease)" }}>
          <style>{`@keyframes wizIn{from{opacity:0;transform:translateX(18px)}}`}</style>
          {step === "info" && <Step title="Property Info" sub="Tell buyers and renters what you're listing.">
            <Tabs items={CFG.tabs.heroAction.map((x) => ({ ...x, label: x.id === "buy" ? "For sale" : "For rent" }))} value={d.action} onChange={(v) => set("action", v)} label="Listing purpose" />
            <Field label="Listing title" error={err.title}><input className={"input" + (err.title ? " err" : "")} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Luxury Beachfront Villa" /></Field>
            <Field label="Property type"><div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{CFG.propertyTypes.map((t) => <button key={t.id} className="chip" aria-pressed={d.type === t.id} onClick={() => set("type", t.id)} style={d.type === t.id ? { background: "var(--g700)", color: "#fff", borderColor: "var(--g700)", height: 36 } : { height: 36 }}>{t.label}</button>)}</div></Field>
            <Field label="Description" error={err.description}><textarea className={"textarea" + (err.description ? " err" : "")} rows={5} value={d.description} onChange={(e) => set("description", e.target.value)} placeholder="Highlight the layout, finishes, neighbourhood and what makes it special." /><span className="mute" style={{ fontSize: 11.5, textAlign: "right" }}>{d.description.length}/2000</span></Field>
          </Step>}
          {step === "features" && <Step title="Property Features" sub="Specs and amenities help your listing appear in filtered searches.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              {[["beds", "Bedrooms"], ["baths", "Bathrooms"]].map(([k, l]) => <Field key={k} label={l}><div style={{ display: "flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: 12, height: 46 }}><button className="icon-btn sm" style={{ border: 0 }} onClick={() => set(k, Math.max(0, d[k] - 1))} aria-label={"Fewer " + l}><Icon n="minus" s={15} /></button><span className="num" style={{ flex: 1, textAlign: "center", fontSize: 16 }}>{d[k]}</span><button className="icon-btn sm" style={{ border: 0 }} onClick={() => set(k, d[k] + 1)} aria-label={"More " + l}><Icon n="plus" s={15} /></button></div></Field>)}
              <Field label="Size (m²)" error={err.size}><input className={"input" + (err.size ? " err" : "")} inputMode="numeric" value={d.size} onChange={(e) => set("size", e.target.value.replace(/\D/g, ""))} /></Field>
              <Field label="Year built"><input className="input" inputMode="numeric" value={d.year} onChange={(e) => set("year", e.target.value.replace(/\D/g, "").slice(0, 4))} /></Field>
            </div>
            <Field label="Amenities"><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>{CFG.amenities.map((a) => { const on = d.amenities.includes(a); return <button key={a} aria-pressed={on} onClick={() => set("amenities", on ? d.amenities.filter((x) => x !== a) : [...d.amenities, a])} style={{ display: "flex", gap: 10, alignItems: "center", padding: "11px 12px", borderRadius: 12, border: "1px solid " + (on ? "var(--lime)" : "var(--line)"), background: on ? "var(--lime-50)" : "#fff", fontSize: 13.5, textAlign: "left", transition: "all .2s" }}><Icon n={AMENITY_ICON[a]} s={17} style={{ color: on ? "var(--g700)" : "var(--mute)" }} />{a}{on && <Icon n="check" s={14} style={{ marginLeft: "auto", color: "var(--g700)" }} />}</button>; })}</div></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Title document"><select className="select" value={d.tenure} onChange={(e) => set("tenure", e.target.value)}>{CFG.tenureDocs.map((t) => <option key={t}>{t}</option>)}</select></Field>
              <Field label="Furnishing"><Tabs items={[{ id: "no", label: "Unfurnished" }, { id: "yes", label: "Furnished" }]} value={d.furnished ? "yes" : "no"} onChange={(v) => set("furnished", v === "yes")} fill size="sm" label="Furnishing" /></Field>
            </div>
          </Step>}
          {step === "photos" && <Step title="Upload Photos" sub="Add up to 20 high-quality images to make your listing stand out. Start with the front view, then living spaces, kitchen, bedrooms, bathrooms, and amenities.">
            <Dropzone photos={d.photos} setPhotos={(p) => set("photos", typeof p === "function" ? p(d.photos) : p)} />{err.photos && <span className="err-msg">{err.photos}</span>}
          </Step>}
          {step === "location" && <Step title="Location" sub="Drop a pin so buyers can see the neighbourhood. Exact address is only shared with confirmed leads.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="City"><select className="select" value={d.city} onChange={(e) => { const c = CFG.cities.find((x) => x.id === e.target.value); setD({ ...d, city: c.id, area: c.areas[0], pin: null }); }}>{CFG.cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
              <Field label="Area"><select className="select" value={d.area} onChange={(e) => setD({ ...d, area: e.target.value, pin: null })}>{CFG.cities.find((c) => c.id === d.city).areas.map((a) => <option key={a}>{a}</option>)}</select></Field>
            </div>
            <Field label="Street address" error={err.address}><input className={"input" + (err.address ? " err" : "")} value={d.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. 23 Palm Grove Drive" /></Field>
            <div style={{ height: 320 }}><MapView key={d.area} picker listings={[{ id: "pin", lat: (d.pin || DB.GEO[d.area])[0], lng: (d.pin || DB.GEO[d.area])[1], price: 0, title: "Pin" }]} center={d.pin || DB.GEO[d.area]} zoom={14} onPick={(p) => set("pin", p)} /></div>
            <p className="mute" style={{ fontSize: 12 }}>Click the map or drag the pin to adjust. {d.pin && <span className="num">({d.pin[0].toFixed(4)}, {d.pin[1].toFixed(4)})</span>}</p>
          </Step>}
          {step === "price" && <Step title="Price & Availability" sub="Be upfront about fees — listings with full fee breakdowns get more serious leads.">
            {d.action === "rent" && <Tabs items={[{ id: "year", label: "Per year" }, { id: "month", label: "Per month" }]} value={d.period} onChange={(v) => set("period", v)} label="Rent period" />}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, alignItems: "end" }}>
              <Field label={d.action === "rent" ? `Rent (₦ per ${d.period})` : "Asking price (₦)"} error={err.price}><input className={"input num" + (err.price ? " err" : "")} inputMode="numeric" value={d.price ? (+d.price).toLocaleString() : ""} onChange={(e) => set("price", e.target.value.replace(/\D/g, ""))} placeholder="0" /></Field>
              <label className="check" style={{ color: "var(--ink)", height: 46, alignItems: "center" }}><input type="checkbox" checked={d.negotiable} onChange={(e) => set("negotiable", e.target.checked)} />Negotiable</label>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
              <Field label="Agency fee (%)"><input className="input" inputMode="numeric" value={d.agencyFee} onChange={(e) => set("agencyFee", e.target.value.replace(/\D/g, ""))} /></Field>
              <Field label="Legal fee (%)"><input className="input" inputMode="numeric" value={d.legalFee} onChange={(e) => set("legalFee", e.target.value.replace(/\D/g, ""))} /></Field>
              {d.action === "rent" && <Field label="Caution deposit (₦)"><input className="input" inputMode="numeric" value={d.caution} onChange={(e) => set("caution", e.target.value.replace(/\D/g, ""))} /></Field>}
              <Field label="Service charge (₦/yr)"><input className="input" inputMode="numeric" value={d.serviceCharge} onChange={(e) => set("serviceCharge", e.target.value.replace(/\D/g, ""))} /></Field>
            </div>
            <Field label="Available from"><input className="input" type="date" value={d.available} onChange={(e) => set("available", e.target.value)} style={{ maxWidth: 240 }} /></Field>
            {+d.price > 0 && <div className="card xfade" style={{ padding: 16, background: "var(--g50)", borderColor: "var(--g100)" }}><div className="mute" style={{ fontSize: 12.5 }}>Total upfront for the {d.action === "rent" ? "tenant" : "buyer"}</div><div className="num" style={{ fontSize: 24, color: "var(--g700)" }}>{money(+d.price * (1 + (+d.agencyFee + +d.legalFee) / 100) + (+d.caution || 0) + (+d.serviceCharge || 0))}</div></div>}
          </Step>}
          {step === "preview" && <Step title="Preview & Submit" sub="Double-check your details. This is how your listing will appear in search.">
            <ListingCardH l={preview} />
            <div className="card" style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, fontSize: 13.5 }}>
              {[["Type", typeLabel(d.type)], ["Purpose", d.action === "buy" ? "For sale" : "For rent"], ["Title document", d.tenure], ["Photos", d.photos.length], ["Amenities", d.amenities.length], ["Available", d.available]].map(([k, v]) => <div key={k}><div className="mute" style={{ fontSize: 12 }}>{k}</div><b style={{ fontWeight: 600 }}>{v}</b></div>)}
            </div>
            {limitHit && <div style={{ background: "#FDF3E3", borderRadius: 14, padding: 14, fontSize: 13.5, display: "flex", gap: 10, alignItems: "center" }}><Icon n="info" s={18} />You've used 5 of 5 free listings this month. <Link to="/dashboard?tab=subscription" style={{ fontWeight: 700, textDecoration: "underline" }}>Upgrade to Pro</Link> for unlimited listings.</div>}
            <label className="check"><input type="checkbox" defaultChecked />I confirm I'm authorised to list this property and the details are accurate. Listings are reviewed before publishing.</label>
          </Step>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <button className="btn btn-ghost" onClick={back} disabled={idx === 0}><Icon n="arrowL" s={16} />Back</button>
          {idx < steps.length - 1 ? <button className="btn btn-dark" onClick={next}>Continue<Icon n="arrowR" s={16} /></button> : <button className="btn btn-lime" onClick={submit}>Submit listing<Icon n="arrowR" s={16} /></button>}
        </div>
      </main>
    </div></div>;
}
function Step({ title, sub, children }) {
  return <div><h1 style={{ fontSize: 30 }}>{title}</h1><p className="mute" style={{ fontSize: 14, marginTop: 6, maxWidth: 560 }}>{sub}</p><div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 24 }}>{children}</div></div>;
}
/* "You're almost there!" — milestone tiles are typographic/iconic placeholders for the 3D illustrations in the reference */
function Verification() {
  const tiles = [["mail", "Verify your email", true], ["key", "Profile approved", false], ["building", "Publish listings", false], ["spark", "Start closing deals", false]];
  return <div className="page-in" style={{ background: "#F4F5F4", minHeight: "100vh" }}><Header />
    <div className="wrap" style={{ maxWidth: 760, padding: "56px 24px 80px" }}>
      <div className="card" style={{ padding: "44px 28px", textAlign: "center", borderRadius: 28 }}>
        <div style={{ position: "relative", width: 96, height: 96, margin: "0 auto", borderRadius: 28, background: "linear-gradient(160deg,#F3F8EE,#E2F0D4)", display: "grid", placeItems: "center", animation: "heartpop .8s var(--spring)" }}>
          <Icon n="home" s={46} w={1.5} style={{ color: "var(--g700)" }} />
          <span style={{ position: "absolute", right: -6, bottom: -6, width: 34, height: 34, borderRadius: "50%", background: "#fff", boxShadow: "var(--sh-2)", display: "grid", placeItems: "center", color: "var(--g600)" }}><Icon n="check" s={18} w={2.6} /></span>
        </div>
        <h1 style={{ fontSize: 32, marginTop: 22 }}>You're almost there!</h1>
        <p className="mute" style={{ fontSize: 14.5, marginTop: 8, maxWidth: 440, marginInline: "auto" }}>Verification may take up to 24 hours. We'll notify you once you're verified and ready to start listing your properties.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}><Link to="/dashboard" className="btn btn-line" style={{ minWidth: 200 }}>Go to Dashboard</Link><Link to="/post?step=info" className="btn btn-lime" style={{ minWidth: 200 }} onClick={() => setTimeout(() => location.reload(), 30)}>Post another listing</Link></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 14 }}>
        {tiles.map(([ic, l, ok], i) => <div key={l} className="card" style={{ padding: 20, textAlign: "center", borderRadius: 22, animation: `riseIn .6s var(--ease) ${200 + i * 100}ms both` }}>
          <div style={{ width: 60, height: 60, borderRadius: 18, margin: "0 auto", display: "grid", placeItems: "center", background: ok ? "var(--lime)" : "var(--line-2)", color: ok ? "#173311" : "var(--mute)" }}><Icon n={ok ? "check" : ic} s={26} w={ok ? 2.4 : 1.6} /></div>
          <div style={{ fontSize: 13, marginTop: 12, fontWeight: 600 }}>{l}</div><div className="mute" style={{ fontSize: 11.5 }}>{ok ? "Done" : i === 1 ? "In review · ~24h" : "Up next"}</div>
        </div>)}
      </div>
      <style>{`@keyframes riseIn{from{opacity:0;transform:translateY(16px)}}`}</style>
    </div></div>;
}

Object.assign(window, { Dropzone, Wizard, Verification });
