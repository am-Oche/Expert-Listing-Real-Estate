/* ============================================================
   Expert Listing — site configuration
   Edit brand, nav, tabs, categories, plans, currency & cities here.
   Components read from window.EL_CONFIG only.
   ============================================================ */
window.EL_CONFIG = {
  brand: { name: "Expert Listing", tagline: "Real estate made simple — every listing checked, every agent verified.", phone: "+234 800 000 0000", email: "hello@expertlisting.ng", whatsapp: "2348000000000" },
  demoData: true, // set false to hide every demo listing, agent and review

  nav: [
    { label: "Rent", to: "/search?action=rent" },
    { label: "Buy", to: "/search?action=buy" },
    { label: "Commercial", to: "/search?action=buy&type=commercial" },
    { label: "Find agents", to: "/agents" },
    { label: "Developers", to: "/agents?tab=developers" },
    { label: "Snagging", to: "/snagging" },
    { label: "About Platform", to: "/about" },
    { label: "Contact", to: "/contact" }
  ],
  mobileNav: [
    { label: "Home", to: "/", icon: "home" },
    { label: "Search", to: "/search", icon: "search" },
    { label: "Saved", to: "/saved", icon: "heart" },
    { label: "Post", to: "/post", icon: "plus" },
    { label: "Account", to: "/dashboard", icon: "user" }
  ],

  currencies: [
    { code: "NGN", symbol: "₦", rate: 1 },
    { code: "USD", symbol: "$", rate: 1 / 1550 },
    { code: "GBP", symbol: "£", rate: 1 / 1980 }
  ],

  cities: [
    { id: "lagos", name: "Lagos", areas: ["Victoria Island", "Ikoyi", "Lekki Phase 1", "Ajah", "Yaba", "Ikeja GRA", "Banana Island", "Ijegun"] },
    { id: "abuja", name: "Abuja", areas: ["Maitama", "Asokoro", "Wuse 2", "Gwarinpa", "Jabi", "Katampe"] },
    { id: "port-harcourt", name: "Port Harcourt", areas: ["GRA Phase 2", "Old GRA", "Trans Amadi", "Rumuola"] },
    { id: "kano", name: "Kano", areas: ["Nassarawa GRA", "Bompai", "Tarauni", "Sabon Gari"] }
  ],

  propertyTypes: [
    { id: "apartment", label: "Apartment", plural: "Apartments" },
    { id: "villa", label: "Villa", plural: "Villas" },
    { id: "townhouse", label: "Townhouse", plural: "Townhouses" },
    { id: "penthouse", label: "Penthouse", plural: "Penthouses" },
    { id: "hotel-apartment", label: "Hotel Apartment", plural: "Hotel Apartments" },
    { id: "duplex", label: "Duplex", plural: "Duplexes" },
    { id: "floor", label: "Floor", plural: "Floors" },
    { id: "building", label: "Building", plural: "Buildings" },
    { id: "commercial", label: "Commercial", plural: "Commercial Spaces" }
  ],

  bedsOptions: ["Any", "1 Bed / 1 Bath", "2 Beds / 2 Baths", "3 Beds / 3 Baths", "4 Beds / 4 Baths", "5+ Beds"],

  /* Every tab list in the product is generated from these arrays. Add / remove / reorder freely. */
  tabs: {
    heroAction: [{ id: "buy", label: "Buy" }, { id: "rent", label: "Rent" }],
    searchView: [{ id: "list", label: "List", icon: "list" }, { id: "split", label: "Split", icon: "split" }, { id: "map", label: "Map", icon: "map" }],
    property: [{ id: "overview", label: "Overview" }, { id: "features", label: "Features" }, { id: "location", label: "Location" }, { id: "history", label: "Price history" }, { id: "reviews", label: "Reviews" }],
    agent: [{ id: "listings", label: "Listings" }, { id: "reviews", label: "Reviews" }, { id: "about", label: "About" }],
    directory: [{ id: "agents", label: "Agents" }, { id: "developers", label: "Developers" }],
    dashboard: [{ id: "listings", label: "Manage listings" }, { id: "stats", label: "Performance stats" }, { id: "subscription", label: "Manage Subscription" }],
    listingStatus: [{ id: "all", label: "All" }, { id: "published", label: "Published" }, { id: "draft", label: "Draft" }, { id: "review", label: "Under review" }, { id: "expired", label: "Expired" }],
    chartMetric: [{ id: "views", label: "Views" }, { id: "leads", label: "Leads" }],
    billing: [{ id: "monthly", label: "Monthly" }, { id: "yearly", label: "Yearly · save 15%" }],
    admin: [{ id: "moderation", label: "Moderation" }, { id: "verification", label: "Verification" }, { id: "snagging", label: "Snagging requests" }, { id: "reports", label: "Reports" }],
    wizard: [
      { id: "info", label: "Property Info" },
      { id: "features", label: "Property Features" },
      { id: "photos", label: "Upload Photos" },
      { id: "location", label: "Location" },
      { id: "price", label: "Price & Availability" },
      { id: "preview", label: "Preview & Submit" }
    ]
  },

  plans: [
    { id: "free", name: "Free", badge: "Free to use", blurb: "Perfect to get started", price: 0, listingsPerMonth: 5, activeDays: 30,
      features: ["Basic agent dashboard access", "Post up to 5 listings per month", "Listing stays active for 30 days"] },
    { id: "pro", name: "Pro", badge: "Popular", blurb: "For professional agents seeking more leads", price: 2000, listingsPerMonth: Infinity, activeDays: 90,
      features: ["Full-featured agent dashboard", "Unlimited property listing", "Priority in search results", "Weekly insights on views and leads", "Personalized agent landing page", "24/7 support"] }
  ],

  amenities: ["Swimming pool", "Smart home system", "Fully equipped kitchen", "Home office space", "Garden & patio", "24/7 security", "2-car garage", "Ocean view", "Gym", "Boys' quarters", "Elevator", "Inverter / solar backup"],
  tenureDocs: ["Certificate of Occupancy (C of O)", "Governor's Consent", "Registered Deed of Assignment", "Excision / Gazette", "Survey Plan"],

  snaggingPackages: [
    { id: "basic", name: "Essential", price: 85000, items: ["Visual inspection of all rooms", "Doors, windows & finishes", "PDF report in 48 hours"] },
    { id: "standard", name: "Complete", price: 150000, popular: true, items: ["Everything in Essential", "Plumbing & electrical tests", "Thermal & moisture scan", "Re-inspection visit"] },
    { id: "premium", name: "Developer-grade", price: 280000, items: ["Everything in Complete", "Structural engineer sign-off", "Snag list sent to developer", "Handover attendance"] }
  ],

  faqs: [
    { q: "How are listings verified?", a: "Every listing is reviewed by our moderation team before it goes live. Listings marked 'Agent visited' have been physically inspected by the listing agent, with the visit date shown on the card." },
    { q: "What fees should I expect when renting in Lagos?", a: "Besides annual rent, most landlords request an agency fee (typically 10%), legal fee (10%), a refundable caution deposit and an annual service charge. Each listing shows these upfront, along with the total move-in cost." },
    { q: "What is a C of O and why does it matter?", a: "A Certificate of Occupancy is the government document that confirms legal right to the land. We show the title document type on every sale listing so you can ask the right questions before paying." },
    { q: "What is snagging?", a: "Snagging is a pre-handover inspection of a new build. Our certified engineers list defects and unfinished work so the developer fixes them before you move in." },
    { q: "How do I become a verified agent?", a: "Create an account, upload your ID and practising credentials, and our team reviews them within 24 hours. Verified agents get a badge on every listing." }
  ]
};
