/* ============================================================
   Demo seed data — every record has demo:true.
   Set EL_CONFIG.demoData = false to strip them.
   Mirrors the Prisma seed (see README section in the docs page).
   ============================================================ */
(function () {
  const C = window.EL_CONFIG;
  let s = 42;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const between = (a, b) => Math.round(a + rnd() * (b - a));

  /* ---------- image registry (assets.ts equivalent) ---------- */
  const IMG = {
    hero: "img/hero.jpg",
    inspector: "img/inspector.jpg",
    sky: "img/house-white.jpg",
    exteriors: ["img/villa1.jpg", "img/house7.jpg", "img/villa3.jpg", "img/house2.jpg", "img/house3.jpg", "img/house4.jpg", "img/house5.jpg", "img/house6.jpg", "img/house8.jpg", "img/house-white.jpg"],
    interiors: ["img/living1.jpg", "img/living4.jpg", "img/living3.jpg", "img/living2.jpg"],
    agents: ["img/agent1.jpg", "img/agent2.jpg"]
  };
  const ASSETS = [
    { file: "img/hero.jpg", source: "Easy-Peasy.AI (CC listing)", license: "Verify before launch", status: "verify before launch" },
    { file: "img/villa1.jpg", source: "SplitShire", license: "SplitShire free license", status: "verify before launch" },
    { file: "img/house7.jpg", source: "PICRYL", license: "Public domain", status: "verify before launch" },
    { file: "img/house-white.jpg", source: "PublicDomainPictures.net", license: "CC0", status: "verify before launch" },
    { file: "img/inspector.jpg", source: "Rawpixel", license: "Public domain", status: "verify before launch" },
    { file: "img/agent1.jpg", source: "Easy-Peasy.AI", license: "Verify before launch — replace with real agent photo", status: "replace before launch" }
  ];

  /* ---------- geo ---------- */
  const GEO = {
    "Victoria Island": [6.4281, 3.4219], "Ikoyi": [6.4549, 3.4366], "Lekki Phase 1": [6.4478, 3.4723], "Ajah": [6.4698, 3.5852],
    "Yaba": [6.5095, 3.3711], "Ikeja GRA": [6.5788, 3.3549], "Banana Island": [6.4530, 3.4460], "Ijegun": [6.5167, 3.2667],
    "Maitama": [9.0882, 7.4934], "Asokoro": [9.0430, 7.5250], "Wuse 2": [9.0790, 7.4730], "Gwarinpa": [9.1100, 7.4030], "Jabi": [9.0650, 7.4250], "Katampe": [9.1180, 7.4570],
    "GRA Phase 2": [4.8250, 7.0050], "Old GRA": [4.7900, 7.0100], "Trans Amadi": [4.8100, 7.0350], "Rumuola": [4.8380, 7.0000],
    "Nassarawa GRA": [11.9850, 8.5400], "Bompai": [12.0050, 8.5450], "Tarauni": [11.9700, 8.5300], "Sabon Gari": [12.0100, 8.5300]
  };
  const CITY_CENTER = { lagos: [6.47, 3.43], abuja: [9.07, 7.47], "port-harcourt": [4.81, 7.01], kano: [11.99, 8.53] };

  /* ---------- agents & developers ---------- */
  const AGENTS = [
    { id: "zara-balogun", name: "Zara Balogun", photo: IMG.agents[0], years: 10, rating: 4.9, reviews: 128, city: "Lagos", languages: ["English", "Yoruba", "French"], specialty: "Luxury villas", active: 12, sales: 20, verified: true, plan: "pro", email: "zara@luxeform.com", phone: "+2348031112222", company: "LuxeForm Realty", bio: "Zara Balogun is an experienced real estate professional with over 10 years in the Nigerian property market. Based in Lagos, she specialises in luxury residential homes and new developments across high-demand areas like Ikoyi, Lekki and Victoria Island." },
    { id: "amaka-obi", name: "Amaka Obi", photo: IMG.agents[1], years: 7, rating: 4.8, reviews: 86, city: "Abuja", languages: ["English", "Igbo"], specialty: "Family homes", active: 9, sales: 31, verified: true, plan: "pro", email: "amaka@capitalkeys.ng", phone: "+2348032223333", company: "Capital Keys", bio: "Amaka helps families relocate to Abuja's quietest districts. She has closed over 30 sales in Maitama, Asokoro and Katampe and is known for patient, transparent negotiation." },
    { id: "tunde-adeyemi", name: "Tunde Adeyemi", photo: null, years: 12, rating: 4.7, reviews: 142, city: "Lagos", languages: ["English", "Yoruba"], specialty: "Commercial", active: 15, sales: 44, verified: true, plan: "pro", email: "tunde@adeyemi.co", phone: "+2348033334444", company: "Adeyemi & Co.", bio: "Commercial leasing specialist covering Victoria Island, Ikeja GRA and Yaba's tech corridor." },
    { id: "ibrahim-musa", name: "Ibrahim Musa", photo: null, years: 6, rating: 4.6, reviews: 51, city: "Kano", languages: ["English", "Hausa", "Arabic"], specialty: "Rentals", active: 7, sales: 12, verified: true, plan: "free", email: "ibrahim@arewahomes.ng", phone: "+2348034445555", company: "Arewa Homes", bio: "Rental and short-let specialist across Nassarawa GRA and Bompai." },
    { id: "ngozi-eze", name: "Ngozi Eze", photo: null, years: 9, rating: 4.8, reviews: 77, city: "Port Harcourt", languages: ["English", "Igbo", "Pidgin"], specialty: "Executive rentals", active: 8, sales: 18, verified: true, plan: "pro", email: "ngozi@gardencity.ng", phone: "+2348035556666", company: "Garden City Realty", bio: "Executive rentals for oil & gas professionals in GRA Phase 2 and Old GRA." },
    { id: "kemi-alade", name: "Kemi Alade", photo: null, years: 4, rating: 4.5, reviews: 23, city: "Lagos", languages: ["English", "Yoruba"], specialty: "Apartments", active: 5, sales: 6, verified: false, plan: "free", email: "kemi@homesbykemi.ng", phone: "+2348036667777", company: "Independent", bio: "First-time-buyer friendly agent focused on Yaba, Ajah and Lekki apartments." }
  ];
  const DEVELOPERS = [
    { id: "landmark-africa", name: "Landmark Africa", rating: 4.7, projects: 6, city: "Lagos", founded: 2009, verified: true, bio: "Mixed-use waterfront developer behind several Victoria Island landmarks." },
    { id: "luxeform", name: "LuxeForm Developments", rating: 4.7, projects: 4, city: "Lagos", founded: 2014, verified: true, bio: "Boutique luxury villas and townhouses in Lekki and Ikoyi." },
    { id: "capital-crest", name: "Capital Crest Homes", rating: 4.5, projects: 5, city: "Abuja", founded: 2011, verified: true, bio: "Gated family estates across Katampe, Jabi and Gwarinpa." },
    { id: "riverside", name: "Riverside Estates", rating: 4.3, projects: 3, city: "Port Harcourt", founded: 2016, verified: false, bio: "Serviced apartments and duplexes in the Garden City." }
  ];

  /* ---------- listings ---------- */
  const NAMES = ["Palmview Retreat", "Water Elysian", "Sunnyvale Retreat", "Seaside Cottage", "Mira Villas", "Oak Terrace", "Coral Bay House", "The Lagoon Residence", "Atlantic Heights", "Cedar Court", "Ivory Gardens", "Bluewater Penthouse", "Harmony Duplex", "Royal Palm Estate", "Emerald Towers", "Crescent Villa", "Sapphire Lofts", "Baobab House", "Kingsway Terrace", "Marina Point"];
  const BADGES = ["New Listing", "New Listing", "Luxury", "Published by Developer", null, "New Listing"];
  const typeIds = C.propertyTypes.map((t) => t.id);
  const LISTINGS = [];
  for (let i = 0; i < 64; i++) {
    const city = C.cities[i % 4 === 3 ? (i % 8 === 3 ? 3 : 2) : i % 4 === 2 ? 1 : 0];
    const area = pick(city.areas);
    const [lat, lng] = GEO[area];
    const type = i < 18 ? ["villa", "villa", "apartment", "duplex", "townhouse", "penthouse"][i % 6] : pick(typeIds);
    const action = i % 3 === 1 ? "rent" : "buy";
    const beds = type === "commercial" || type === "building" || type === "floor" ? 0 : between(1, 6);
    const lux = ["villa", "penthouse"].includes(type) ? 2.2 : 1;
    const priceBuy = Math.round((between(45, 420) * lux) * 1e6 / 1e6) * 1e6;
    const priceRent = Math.round(between(12, 120) * lux) * 1e5;
    const price = action === "buy" ? priceBuy : priceRent;
    const agent = AGENTS.find((a) => a.city === city.name) || pick(AGENTS);
    const badge = BADGES[i % BADGES.length];
    const ext = IMG.exteriors[i % IMG.exteriors.length];
    const photos = [ext, ...IMG.interiors.slice(i % 4), ...IMG.interiors.slice(0, i % 4), IMG.exteriors[(i + 3) % 10], IMG.exteriors[(i + 6) % 10], IMG.exteriors[(i + 8) % 10]];
    const daysAgo = between(0, 40);
    const amen = C.amenities.filter(() => rnd() > 0.45);
    const hist = []; let hp = price * (0.78 + rnd() * 0.08);
    for (let m = 0; m < 6; m++) { hist.push({ label: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"][m] + " 2026", value: Math.round(hp / 1e5) * 1e5 }); hp *= 1 + rnd() * 0.06; }
    hist[5].value = price;
    LISTINGS.push({
      id: "L" + (1001 + i),
      slug: NAMES[i % NAMES.length].toLowerCase().replace(/[^a-z]+/g, "-") + "-" + (1001 + i),
      title: NAMES[i % NAMES.length], subtitle: NAMES[i % NAMES.length].split(" ")[0] + " " + (NAMES[i % NAMES.length].split(" ")[1] || "") ,
      type, action, price, rentPeriod: "year",
      city: city.id, cityName: city.name, area, address: between(2, 48) + " " + pick(["Palm Grove", "Admiralty", "Adeola Odeku", "Bourdillon", "Kofo Abayomi", "Aminu Kano", "Gana", "Ordinance", "Ahmadu Bello"]) + " " + pick(["Drive", "Way", "Road", "Crescent", "Street"]),
      lat: lat + (rnd() - 0.5) * 0.03, lng: lng + (rnd() - 0.5) * 0.03,
      beds, baths: beds ? Math.max(1, beds - between(0, 1)) : between(1, 4), size: between(120, 900), year: between(2012, 2026),
      rating: (4.3 + rnd() * 0.7).toFixed(1) * 1,
      badge, agentId: agent.id, developerId: badge === "Published by Developer" ? pick(DEVELOPERS).id : null,
      verified: rnd() > 0.2, agentVisited: rnd() > 0.35 ? between(1, 28) + (["th June", "th July", "th Sept", "th Oct"][between(0, 3)]) : null,
      daysAgo, photos,
      furnished: rnd() > 0.5, newBuild: rnd() > 0.6,
      tenure: action === "buy" ? pick(C.tenureDocs) : null,
      serviceCharge: between(4, 30) * 1e5,
      cautionDeposit: action === "rent" ? Math.round(price * 0.1) : 0,
      power: pick(["24h power (estate grid + inverter)", "Public power + standby generator", "Solar + inverter backup"]),
      water: pick(["Borehole with treatment plant", "Public mains + borehole", "Estate central water"]),
      security: pick(["24/7 armed security, CCTV", "Gated estate, access control", "Manned gatehouse, perimeter fencing"]),
      amenities: amen.length ? amen : C.amenities.slice(0, 4), priceHistory: hist,
      description: `Discover luxury and comfort in this beautifully designed ${beds || ""}${beds ? "-bedroom " : ""}${C.propertyTypes.find((t) => t.id === type).label.toLowerCase()}, nestled in a quiet and secure neighbourhood of ${area}. With high ceilings, floor-to-ceiling windows, and a seamless indoor-outdoor flow, this home offers the perfect blend of elegance and functionality.`,
      description2: "The property features a spacious living area, modern kitchen with island, ensuite bedrooms, private garden, and smart home integration. Ideal for families or professionals looking for upscale coastal living.",
      status: "published", views: between(80, 900), leads: between(2, 40), bookings: between(0, 14),
      demo: true
    });
  }
  // pin the reference hero listing
  Object.assign(LISTINGS[0], { title: "Palmview Retreat", type: "villa", action: "buy", price: 220000000, beds: 6, baths: 4, size: 380, year: 2024, area: "Victoria Island", lat: 6.4291, lng: 3.4229, address: "23 Palm Grove Drive", badge: "New Listing", photos: ["img/living1.jpg", "img/living4.jpg", "img/living3.jpg", "img/villa1.jpg", "img/living2.jpg", "img/house7.jpg", "img/villa3.jpg", "img/house2.jpg", "img/house3.jpg", "img/house4.jpg"] });
  Object.assign(LISTINGS[1], { title: "Water Elysian, Villa", type: "villa", action: "rent", price: 2200000, area: "Lekki Phase 1" });

  /* ---------- reviews (demo) ---------- */
  const REVIEWERS = [["Michael A.", "Bought a villa in Lekki"], ["Ada E.", "Rented an apartment in Ikoyi"], ["Sarah O.", "Sold a duplex in Abuja"], ["Femi K.", "Rented in Victoria Island"], ["Halima B.", "Bought in Maitama"]];
  const TEXTS = [
    "I was relocating from abroad and had little time to find the right place. She listened closely, showed me ideal options, answered all my questions, and even helped negotiate a better deal. Couldn't have asked for a better agent.",
    "Incredibly organised and responsive. Every fee was explained before I paid anything, and the agent-visit note on the listing was accurate.",
    "Handled every detail professionally and kept me informed at each stage. Highly recommend for anyone selling for the first time.",
    "Viewing was arranged within 24 hours and the property matched the photos exactly. Smooth from start to finish.",
    "Patient, honest and knowledgeable about title documents. She walked us through the Governor's Consent process."
  ];
  const REVIEWS = [];
  AGENTS.forEach((a, ai) => {
    for (let k = 0; k < 5; k++) {
      const r = REVIEWERS[(ai + k) % 5];
      REVIEWS.push({ id: "R" + ai + k, agentId: a.id, name: r[0], context: r[1], rating: k === 2 ? 4.7 : 4.9, text: TEXTS[(ai + k) % 5], date: (k + 1) * 6 + " days ago", demo: true, verifiedLead: true });
    }
  });

  /* ---------- analytics (30 days) ---------- */
  const EVENTS = [];
  for (let d = 29; d >= 0; d--) {
    const dt = new Date(2026, 9, 11 - d);
    const base = 120 + Math.sin(d / 3) * 40 + (29 - d) * 3;
    EVENTS.push({ date: dt, views: Math.round(base + rnd() * 70), leads: Math.round(base / 22 + rnd() * 5) });
  }

  const BLOG = [
    { id: "b1", title: "C of O vs Governor's Consent: what buyers must check", tag: "Legal", mins: 6, img: "img/house3.jpg" },
    { id: "b2", title: "The true cost of renting in Lagos in 2026", tag: "Renting", mins: 4, img: "img/living4.jpg" },
    { id: "b3", title: "Why every new-build buyer should book a snagging inspection", tag: "Snagging", mins: 5, img: "img/house6.jpg" }
  ];

  const keep = (arr) => (C.demoData ? arr : arr.filter((x) => !x.demo));
  window.EL_DATA = { IMG, ASSETS, GEO, CITY_CENTER, AGENTS, DEVELOPERS, LISTINGS: keep(LISTINGS), REVIEWS: keep(REVIEWS), EVENTS, BLOG };
})();
