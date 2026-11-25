/* Utileo — frontend prototype
   Pages (hash routes):  #  (home)   #/c/<category>   #/c/<category>/<subcategory>
                         #/i/<item>  #/search/<text>                              */

const SUPABASE_URL = "https://tvtmhisivwctprqmbzbj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Y2qhEXQVAEdSD5izte37yQ_ZZGLcB9Y";
const TERMS_VERSION = "2026-11-25"; // Keep in sync with supabase/schema.sql and terms.html.
const supabaseReady = !!(window.supabase && SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("PASTE_") && !SUPABASE_ANON_KEY.includes("PASTE_"));
const sb = supabaseReady ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

/* ---------- Catalogue data (sample listings) ---------- */
const CATS = [
  { id: "study", name: "Study Materials", emoji: "✏️", c: "#5b5bd6", t: "#eceeff", blurb: "Notes, stationery, calculators",
    desc: "Academic essentials for classes, assignments and exam prep.",
    subs: [{ name: "Calculators", emoji: "🧮" }, { name: "Notes & stationery", emoji: "📝" }, { name: "Study accessories", emoji: "📐" }] },
  { id: "books", name: "Books & Copies", emoji: "📚", c: "#d9822b", t: "#fff1e0", blurb: "Textbooks, notebooks, novels",
    desc: "Borrow textbooks, notebooks and reading material for the time you need.",
    subs: [{ name: "Textbooks", emoji: "📘" }, { name: "Notebooks & copies", emoji: "📓" }, { name: "Novels", emoji: "📖" }] },
  { id: "lab", name: "Lab Essentials", emoji: "🥼", c: "#12957a", t: "#e3f6f0", blurb: "Lab coats, practical items",
    desc: "Practical essentials for your lab sessions. Check campus rules before booking.",
    subs: [{ name: "Lab coats", emoji: "🥼" }, { name: "Glassware", emoji: "🧪" }, { name: "Safety items", emoji: "🥽" }] },
  { id: "indoor", name: "Indoor Games", emoji: "♟️", c: "#b83d93", t: "#fbe8f4", blurb: "Chess, carrom, board games",
    desc: "Game night essentials to enjoy with friends in your hostel or common room.",
    subs: [{ name: "Board games", emoji: "🎲" }, { name: "Chess & carrom", emoji: "♟️" }, { name: "Indoor sports", emoji: "🏓" }] },
  { id: "outdoor", name: "Outdoor Sports", emoji: "🏸", c: "#2f9444", t: "#e6f5e8", blurb: "Rackets, balls, sports gear",
    desc: "Sports gear for practice, play and friendly campus matches.",
    subs: [{ name: "Rackets", emoji: "🏸" }, { name: "Balls", emoji: "⚽" }, { name: "Sports accessories", emoji: "🧘" }] },
  { id: "kitchen", name: "Utensils & Kitchen", emoji: "🍳", c: "#df5a2f", t: "#ffece4", blurb: "Kettle, lunch box, cookware",
    desc: "Everyday kitchen and dining essentials for temporary use.",
    subs: [{ name: "Cookware", emoji: "🍳" }, { name: "Flasks & bottles", emoji: "🥣" }, { name: "Dining", emoji: "🍽️" }] }
];

// [subcategory, title, emoji, price per day (₹), condition, description]
const RAW = {
  study: [
    ["Calculators", "Scientific calculator", "🧮", 25, "Good condition", "Handy scientific calculator for exams, labs and daily assignments."],
    ["Calculators", "Programmable calculator", "🔢", 30, "Very good", "Programmable model for engineering and maths courses. Check your exam rules before using it in a test."],
    ["Notes & stationery", "Class notes bundle", "📝", 10, "Good condition", "Neatly organised class notes covering core topics, useful for revision before tests."],
    ["Notes & stationery", "Highlighter & pen pack", "🖍️", 6, "Like new", "Highlighters and pens for revision sessions and group study."],
    ["Study accessories", "Geometry box", "📐", 8, "Very good", "Compass, divider, protractor and set squares together in one box."],
    ["Study accessories", "Whiteboard markers set", "🖊️", 12, "Good condition", "Assorted markers for group study and whiteboard practice."],
    ["Study accessories", "Drawing board", "📋", 20, "Good condition", "Smooth drawing board for engineering graphics and sketching."]
  ],
  books: [
    ["Textbooks", "Engineering Mathematics", "📘", 15, "Very good", "Core engineering mathematics textbook with solved examples and practice problems."],
    ["Textbooks", "Java Programming Book", "📗", 18, "Good condition", "Beginner-friendly Java programming textbook with exercises."],
    ["Textbooks", "Engineering Physics", "📙", 15, "Good condition", "Physics textbook for first-year engineering courses."],
    ["Notebooks & copies", "Notebook bundle", "📓", 12, "Good condition", "A set of notebooks with plenty of blank pages for class and practicals."],
    ["Notebooks & copies", "Lab record copy", "📒", 8, "Like new", "Ready-to-use record copy for lab practicals."],
    ["Novels", "Campus novel collection", "📚", 10, "Like new", "A mix of popular novels to read between classes."],
    ["Novels", "Self-help classics", "📖", 8, "Good condition", "A few well-loved self-improvement reads for your downtime."]
  ],
  lab: [
    ["Lab coats", "Lab coat — size M", "🥼", 20, "Clean & washed", "Washed and ready-to-wear lab coat in size M."],
    ["Lab coats", "Lab coat — size L", "🥼", 20, "Clean & washed", "Washed and ready-to-wear lab coat in size L."],
    ["Lab coats", "Lab apron — size L", "🧥", 18, "Clean & washed", "Lab apron in size L for practical sessions."],
    ["Glassware", "Beaker set", "🧪", 18, "Good condition", "Set of beakers for chemistry practicals. Handle with care."],
    ["Glassware", "Test tube rack", "🧫", 12, "Good condition", "Sturdy rack for holding test tubes during experiments."],
    ["Safety items", "Safety goggles", "🥽", 10, "Good condition", "Clear safety goggles for chemistry and workshop sessions."],
    ["Safety items", "Lab gloves pack", "🧤", 8, "New, sealed", "Disposable gloves pack for practicals."]
  ],
  indoor: [
    ["Board games", "Ludo & board game pack", "🎲", 8, "Very good", "Ludo and other classic board games in one pack."],
    ["Board games", "Playing cards deck", "🃏", 5, "Good condition", "Complete deck of playing cards for hostel game nights."],
    ["Board games", "Trade & property board game", "💰", 15, "Very good", "A classic property-trading board game for 2–6 players."],
    ["Chess & carrom", "Chess set", "♟️", 10, "Good condition", "Full chess set with board and all pieces."],
    ["Chess & carrom", "Carrom board", "🪙", 40, "Good condition", "Carrom board with coins and striker."],
    ["Indoor sports", "Table tennis bats", "🏓", 20, "Good condition", "Pair of table tennis bats with balls."],
    ["Indoor sports", "Dart board", "🎯", 18, "Good condition", "Dart board with darts for the common room."]
  ],
  outdoor: [
    ["Rackets", "Badminton racket", "🏸", 30, "Good condition", "Lightweight badminton racket, ready for the court."],
    ["Rackets", "Tennis racket", "🎾", 35, "Good condition", "Tennis racket for practice and friendly matches."],
    ["Balls", "Football", "⚽", 20, "Used · usable", "Football in usable condition for kick-abouts on the ground."],
    ["Balls", "Basketball", "🏀", 25, "Good condition", "Basketball with good grip for the campus court."],
    ["Balls", "Cricket ball set", "🏏", 15, "Good condition", "Set of cricket balls for net practice."],
    ["Sports accessories", "Skipping rope", "〰️", 8, "Very good", "Adjustable skipping rope for fitness and warm-ups."],
    ["Sports accessories", "Shuttlecock tube", "🏸", 10, "New, sealed", "Tube of shuttlecocks for badminton."],
    ["Sports accessories", "Yoga mat", "🧘", 15, "Clean", "Non-slip yoga mat for stretching and workouts."]
  ],
  kitchen: [
    ["Cookware", "Electric kettle", "🫖", 35, "Working condition", "Electric kettle for tea, noodles and quick hostel meals."],
    ["Cookware", "Frying pan", "🍳", 20, "Good condition", "Non-stick frying pan for everyday cooking."],
    ["Cookware", "Induction cooktop", "♨️", 50, "Working condition", "Portable induction cooktop. Use only with induction-safe cookware."],
    ["Flasks & bottles", "Lunch box & flask", "🥣", 15, "Clean", "Lunch box with flask for carrying meals to class."],
    ["Flasks & bottles", "Steel water bottle", "🍶", 8, "Clean", "Durable steel bottle that keeps your water fresh."],
    ["Dining", "Steel plate & bowl set", "🍽️", 12, "Clean", "Steel plate and bowl set for hostel dining."],
    ["Dining", "Cutlery set", "🥄", 8, "Clean", "Spoons, forks and knives for a small group."]
  ]
};

const ITEMS = [];
CATS.forEach(c => (RAW[c.id] || []).forEach((r, i) =>
  ITEMS.push({ id: c.id + "-" + (i + 1), cat: c.id, sub: r[0], title: r[1], emoji: r[2], price: r[3], cond: r[4], desc: r[5] })));

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const slug = s => String(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const catById = id => CATS.find(c => c.id === id);
const catOf = it => catById(it.cat);
const money = n => "₹" + Number(n).toLocaleString("en-IN");
let soft = false; // soft refresh = don't reset scroll / inputs / modal

let toastTimer = null;
function toast(msg) {
  document.querySelectorAll(".toast").forEach(t => t.remove());
  const t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
  document.body.append(t); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.remove(), 3200);
}
let modalPreviousFocus = null;
function openModal(html) {
  if ($("overlay").classList.contains("hidden")) modalPreviousFocus = document.activeElement;
  $("modalBody").innerHTML = html;
  $("overlay").classList.remove("hidden");
  document.body.classList.add("modal-open");
  const f = $("modalBody").querySelector("input,select");
  if (f) f.focus();
}
function closeModal() { $("overlay").classList.add("hidden"); $("modalBody").innerHTML = ""; document.body.classList.remove("modal-open"); const previousFocus = modalPreviousFocus; modalPreviousFocus = null; if (previousFocus?.isConnected && previousFocus.focus) previousFocus.focus(); }

function card(it) {
  const c = catOf(it);
  return `<a class="product" href="#/i/${encodeURIComponent(it.id)}" style="--c:${c.c};--t:${c.t}" aria-label="View details: ${esc(it.title)}">` +
    `<div class="product-art">${it.image_url ? `<img class="product-photo" src="${esc(it.image_url)}" alt="${esc(it.title)}" loading="lazy">` : `<span class="emoji" aria-hidden="true">${esc(it.emoji)}</span>`}<span class="condition">${esc(it.cond)}</span><span class="listing-kind">${it.live ? (it.owner_id ? "Member listing" : "Community listing") : "Demo item"}</span></div>` +
    `<div class="product-info"><small>${esc(it.sub)}</small><h3>${esc(it.title)}</h3><div class="location">⌖ ${esc(it.address || "Campus pickup")}</div>` +
    `<div class="product-bottom"><span class="price">${money(it.price)}<small> / day</small></span><span class="details">View details →</span></div></div></a>`;
}

/* ---------- Home ---------- */
function renderHome() {
  $("categoryGrid").innerHTML = CATS.map(c => {
    const n = ITEMS.filter(i => i.cat === c.id).length;
    return `<a class="category-card" href="#/c/${c.id}" style="--c:${c.c};--t:${c.t}">` +
      `<span class="cat-emoji" aria-hidden="true">${c.emoji}</span>` +
      `<span class="cat-text"><b>${esc(c.name)}</b><small>${esc(c.blurb)}</small>` +
      `<em>${c.subs.length} subcategories · ${n} items</em></span><i aria-hidden="true">→</i></a>`;
  }).join("");
  const liveItems = ITEMS.filter(i => i.live);
  const liveFirst = liveItems.slice(0, 4);
  $("listingStatus").textContent = liveItems.length ? `${liveItems.length} live student listing${liveItems.length === 1 ? "" : "s"} · Demo items labelled` : "Demo catalogue · Be the first to list";
  $("featuredDesc").textContent = liveItems.length ? "Real community listings appear first. Demo examples are labelled." : "Explore sample items while the campus community adds its first listings.";
  const sampleFill = CATS.map(c => ITEMS.find(i => i.cat === c.id)).filter(Boolean);
  $("featuredGrid").innerHTML = [...liveFirst, ...sampleFill.filter(i => !liveFirst.some(x => x.id === i.id))].slice(0, 4).map(card).join("");
  $("footCats").innerHTML = CATS.map(c => `<a href="#/c/${c.id}">${esc(c.name)}</a>`).join("");
}

/* ---------- Category / search page ---------- */
const state = { cat: null, sub: null, search: false };

function openCategory(cid, subSlug) {
  const cat = catById(cid);
  if (!cat) { openHome(); return; }
  const sub = cat.subs.find(s => slug(s.name) === subSlug) || null;
  state.cat = cat; state.sub = sub; state.search = false;
  if (!soft) { $("search").value = ""; $("sort").value = "recommended"; $("minPrice").value = ""; $("maxPrice").value = ""; }
  const page = $("catalog");
  page.style.cssText = `--c:${cat.c};--t:${cat.t}`;
  $("crumbs").innerHTML = `<a href="#">Home</a><span>›</span>` + (sub ? `<a href="#/c/${cat.id}">${esc(cat.name)}</a><span>›</span><b>${esc(sub.name)}</b>` : `<b>${esc(cat.name)}</b>`);
  $("catalogEyebrow").textContent = sub ? cat.name.toUpperCase() : "EXPLORE CATEGORY";
  $("catalogTitle").textContent = sub ? sub.name : cat.name;
  $("catalogDesc").textContent = cat.desc;
  $("catalogEmoji").textContent = sub ? sub.emoji : cat.emoji;
  const all = ITEMS.filter(i => i.cat === cat.id);
  $("subtiles").classList.remove("hidden");
  $("subtiles").innerHTML =
    `<a class="subtile ${sub ? "" : "active"}" href="#/c/${cat.id}"><span class="sub-emoji" aria-hidden="true">${cat.emoji}</span><span><b>All</b><small>${all.length} items</small></span></a>` +
    cat.subs.map(s => `<a class="subtile ${sub && sub.name === s.name ? "active" : ""}" href="#/c/${cat.id}/${slug(s.name)}"><span class="sub-emoji" aria-hidden="true">${s.emoji}</span><span><b>${esc(s.name)}</b><small>${all.filter(i => i.sub === s.name).length} items</small></span></a>`).join("");
  document.title = (sub ? sub.name + " — " : "") + cat.name + " | Utileo";
  show("catalog"); renderGrid(); toTop();
}

function openSearch(q) {
  state.cat = null; state.sub = null; state.search = true;
  if (!soft) { $("search").value = q; $("sort").value = "recommended"; $("minPrice").value = ""; $("maxPrice").value = ""; }
  $("catalog").style.cssText = "--c:#6d44c9;--t:#f1ebfb";
  $("crumbs").innerHTML = `<a href="#">Home</a><span>›</span><b>Search</b>`;
  $("catalogEyebrow").textContent = "SEARCH RESULTS";
  $("catalogTitle").textContent = q ? `“${q}”` : "All items";
  $("catalogDesc").textContent = "Showing matches from every category.";
  $("catalogEmoji").textContent = "🔎";
  $("subtiles").classList.add("hidden"); $("subtiles").innerHTML = "";
  document.title = "Search | Utileo";
  show("catalog"); renderGrid(); toTop();
}

function renderGrid() {
  const q = $("search").value.trim().toLowerCase(), sort = $("sort").value;
  let list = state.search ? ITEMS.slice() : ITEMS.filter(i => i.cat === state.cat.id && (!state.sub || i.sub === state.sub.name));
  const minPrice = Number($("minPrice").value || 0);
  const maxPrice = Number($("maxPrice").value || Infinity);
  if (q) list = list.filter(i => (i.title + " " + i.sub + " " + catOf(i).name + " " + i.desc + " " + i.cond + " " + (i.address || "")).toLowerCase().includes(q));
  list = list.filter(i => i.price >= minPrice && i.price <= maxPrice);
  if (sort === "recommended") list.sort((a, b) => Number(!!b.live) - Number(!!a.live) || new Date(b.created_at || 0) - new Date(a.created_at || 0));
  else if (sort === "low") list.sort((a, b) => a.price - b.price);
  else if (sort === "high") list.sort((a, b) => b.price - a.price);
  else if (sort === "newest") list.sort((a, b) => Number(!!b.live) - Number(!!a.live) || new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const liveCount = list.filter(i => i.live).length;
  $("resultCount").textContent = `${list.length} item${list.length === 1 ? "" : "s"} · ${liveCount} live ${liveCount === 1 ? "listing" : "listings"}`;
  $("products").innerHTML = list.map(card).join("");
  $("empty").classList.toggle("hidden", list.length > 0);
  $("clearFilters").classList.toggle("hidden", !q && !minPrice && maxPrice === Infinity);
}

/* ---------- Item detail page ---------- */
function todayISO() { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); }

function openItem(id) {
  const it = ITEMS.find(x => x.id === id);
  show("detail");
  const box = $("detailBody");
  if (!it && id.startsWith("live-") && !liveListingsLoaded) {
    box.innerHTML = '<div class="notfound"><h1>Loading item…</h1><p>Fetching the latest campus listing.</p></div>';
    document.title = "Loading item | Utileo"; return;
  }
  if (!it) {
    box.innerHTML = `<div class="notfound"><h1>We couldn’t find that item</h1><p>It may have been removed, or it is still loading.</p><a class="primary" href="#">Back to home</a></div>`;
    document.title = "Item not found | Utileo"; toTop(); return;
  }
  const cat = catOf(it);
  $("detail").style.cssText = `--c:${cat.c};--t:${cat.t}`;
  const similar = ITEMS.filter(x => x.id !== it.id && x.cat === it.cat).sort((a, b) => (b.sub === it.sub) - (a.sub === it.sub)).slice(0, 4);
  box.innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#">Home</a><span>›</span><a href="#/c/${cat.id}">${esc(cat.name)}</a><span>›</span><a href="#/c/${cat.id}/${slug(it.sub)}">${esc(it.sub)}</a><span>›</span><b>${esc(it.title)}</b></nav>
    <div class="detail-grid">
      <div class="detail-art">${it.image_url ? `<img class="detail-photo" src="${esc(it.image_url)}" alt="${esc(it.title)}">` : `<span class="emoji" aria-hidden="true">${esc(it.emoji)}</span>`}<span class="condition">${esc(it.cond)}</span></div>
      <div class="detail-info">
        <span class="eyebrow">${esc(it.sub).toUpperCase()}</span>
        <h1>${esc(it.title)}</h1>
        <div class="chips"><span class="chip">✓ ${esc(it.cond)}</span><span class="chip">⌖ ${esc(it.address || "Campus pickup")}</span><span class="chip">📅 From 1 day</span></div>
        <div class="big-price">${money(it.price)}<small> / day</small></div>
        <p class="desc">${esc(it.desc)}</p>
        <div class="contact-panel" id="listingContact"><b>Contact lender</b><p>Loading contact details…</p></div>
        <div class="rent-box">
          <h2>${it.live && it.owner_id ? "Request this rental" : "Estimate your rental"}</h2>
          ${it.live && it.owner_id ? `<label>Message to the owner (optional)<textarea id="rentMessage" rows="2" maxlength="500" placeholder="Hi, is this item available for these dates?"></textarea></label>` : `<label>Your name<input id="rentName" maxlength="60" placeholder="Enter your name" autocomplete="name"></label>`}
          <div class="rent-row">
            <label>From date<input id="rentStart" type="date" min="${todayISO()}" value="${todayISO()}"></label>
            <label>To date<input id="rentEnd" type="date" min="${todayISO()}" value="${todayISO()}"></label>
          </div>
          <div class="summary"><div><span id="sumLine"></span><small id="sumReturn"></small></div><b id="sumTotal"></b></div>
          ${it.live && it.owner_id ? (currentSession?.user?.id ? (currentSession.user.id === it.owner_id ? `<p class="note">This is your listing. Other signed-in students can send you a rental request.</p>` : `<button class="primary wide" id="rentBtn" type="button">Send rental request</button>`) : `<button class="primary wide" id="rentSignIn" type="button">Sign in to request this item</button>`) : `<button class="primary wide" id="rentBtn" type="button">Calculate rental total</button>`}
          <div class="note" id="rentMsg">${it.live && it.owner_id ? "Your request goes to the item owner. The rental is not confirmed until they accept." : "This is a price estimate only. It does not send a booking request or reserve the item."}</div>
        </div>
        <ul class="checklist">
          <li><b>At handover:</b> meet the lender on campus and inspect the item together.</li>
          <li><b>Condition:</b> note any marks or damage before you take it.</li>
          <li><b>Return:</b> give it back clean and on the agreed date.</li>
        </ul>
      </div>
    </div>
    ${similar.length ? `<section class="similar"><h2>More in ${esc(cat.name)}</h2><div class="products">${similar.map(card).join("")}</div></section>` : ""}`;

  if (it.live && it.owner_id && currentSession?.user?.id === it.owner_id) {
    const actions = document.createElement("div");
    actions.className = "owner-actions";
    actions.innerHTML = '<button class="secondary" id="deleteMyListing" type="button">Delete my listing</button>';
    $("detailBody").querySelector(".detail-info").append(actions);
    $("deleteMyListing").onclick = async () => {
      if (!window.confirm("Delete this listing? This cannot be undone.")) return;
      const btn = $("deleteMyListing"); btn.disabled = true; btn.textContent = "Deleting…";
      const listingId = it.id.replace("live-", "");
      const { count, error: requestCheckError } = await sb.from("booking_requests").select("id", { count: "exact", head: true }).eq("listing_id", listingId).in("status", ["pending", "accepted"]);
      if (requestCheckError || count > 0) { toast(count > 0 ? "This listing has pending or accepted requests. Cancel or resolve them before deleting it." : "Could not check active requests. Please try again."); btn.disabled = false; btn.textContent = "Delete my listing"; return; }
      const { error } = await sb.from("listings").delete().eq("id", listingId);
      if (error) { toast("Could not delete listing. Please try again."); btn.disabled = false; btn.textContent = "Delete my listing"; return; }
      if (it.image_url) {
        const marker = "/listing-images/";
        const pos = it.image_url.indexOf(marker);
        if (pos >= 0) {
          const path = decodeURIComponent(it.image_url.slice(pos + marker.length));
          const { error: photoError } = await sb.storage.from("listing-images").remove([path]);
          if (photoError) toast("Listing deleted, but its photo could not be removed. Contact support.");
        }
      }
      toast("Your listing was deleted."); await loadLive(); location.hash = "#/c/" + it.cat;
    };
  }

  const contactPanel = $("listingContact");
  if (it.live && it.owner_id) {
    contactPanel.innerHTML = "<b>Contact lender</b><p>Contact details are shared only with the renter after the owner accepts a request.</p>";
  } else if (it.live) { contactPanel.innerHTML = "<b>Community listing</b><p>This older listing has no linked owner account and cannot receive booking requests.</p>"; } else if (contactPanel) { contactPanel.hidden = true; }

  const signInRequest = $("rentSignIn");
  if (signInRequest) signInRequest.onclick = () => { afterLoginRequestId = it.id; openLogin("login"); };

  const endInput = $("rentEnd");
  const clamp = () => { const start = new Date(($("rentStart").value || todayISO())+"T00:00"); const end = new Date((endInput.value || $("rentStart").value || todayISO())+"T00:00"); let n = Math.round((end-start)/86400000)+1; if (!(n>=1)) n=1; return Math.min(n,30); };
  const update = () => {
    const n = clamp(), start = $("rentStart").value || todayISO();
    const end = new Date((endInput.value || start) + "T00:00");
    $("sumLine").textContent = `${money(it.price)} × ${n} day${n > 1 ? "s" : ""}`;
    $("sumReturn").textContent = "Return by " + end.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    $("sumTotal").textContent = money(it.price * n);
  };
  $("rentStart").addEventListener("change", () => { endInput.min = $("rentStart").value; if(endInput.value < endInput.min) endInput.value=endInput.min; update(); });
  endInput.addEventListener("change", update);
  update();
  if ($("rentBtn")) $("rentBtn").onclick = async () => {
    const name = $("rentName") ? $("rentName").value.trim() : "";
    if ((!it.live || !it.owner_id) && $("rentName") && !name) { toast("Please enter your name first."); $("rentName").focus(); return; }
    const startValue = $("rentStart").value;
    if (!startValue || startValue < todayISO()) { toast("Choose today or a future start date."); $("rentStart").focus(); return; }
    const n = clamp();
    if (!$("rentEnd").value || $("rentEnd").value < startValue || n > 30) { toast("Choose a valid To date within 30 days."); $("rentEnd").focus(); return; }
    if (it.available_from && startValue < it.available_from || it.available_to && $("rentEnd").value > it.available_to) { toast("These dates are outside the owner’s availability."); return; }
    const isEstimate = !(it.live && it.owner_id);
    if (!isEstimate) { $("rentBtn").disabled = true; $("rentBtn").textContent = "Sending request…"; }
    const m = $("rentMsg"); m.className = "note ok";
    if (it.live && it.owner_id) {
      if (!currentSession?.user?.id) { toast("Please sign in before sending a rental request."); openLogin("login"); $("rentBtn").disabled = false; $("rentBtn").textContent = "Send rental request"; return; }
      if (currentSession.user.id === it.owner_id) { toast("You cannot request your own listing."); $("rentBtn").disabled = false; $("rentBtn").textContent = "Send rental request"; return; }
      $("rentBtn").textContent = "Sending request…";
      const { error } = await sb.from("booking_requests").insert({ listing_id: it.id.replace("live-", ""), renter_id: currentSession.user.id, start_date: startValue, rental_days: n, message: $("rentMessage").value.trim() });
      if (error) {
        const duplicate = error.code === "23505" || /booking_one_pending_per_renter_item|duplicate key/i.test(error.message || "");
        toast(duplicate ? "You already have a pending request for this item. Check My Requests." : "Could not send your request. Please try again.");
        $("rentBtn").disabled = false; $("rentBtn").textContent = "Send rental request"; return;
      }
      m.className = "note ok"; m.textContent = "Request sent. The owner must accept it before contact details are shared. Open your My Request to track it."; $("rentBtn").textContent = "Request sent ✓";
      return;
    }
    m.textContent = `Thanks, ${name}. Your estimated total for ${it.title} is ${money(it.price * n)} for ${n} day${n > 1 ? "s" : ""}. No booking has been sent.`;
    $("rentBtn").disabled = false; $("rentBtn").textContent = "Calculate rental total";
  };
  document.title = it.title + " — " + cat.name + " | Utileo";
  toTop();
}

/* ---------- Routing ---------- */
function show(view) {
  ["home", "catalog", "detail", "account"].forEach(v => $(v).classList.toggle("hidden", v !== view));
}
function toTop() { if (!soft) window.scrollTo({ top: 0, behavior: "instant" }); }

function openHome(anchor) {
  show("home");
  document.title = "Utileo — Campus rentals, made simple";
  if (soft) return;
  const el = anchor && $(anchor);
  if (el) requestAnimationFrame(() => el.scrollIntoView()); else window.scrollTo({ top: 0, behavior: "instant" });
}

function route() {
  if (!soft) closeModal();
  const raw = location.hash.replace(/^#/, "");
  if (raw.startsWith("/")) {
    const p = raw.slice(1).split("/").map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (p[0] === "c") return catById(p[1]) ? openCategory(p[1], p[2]) : openHome();
    if (p[0] === "i" && p[1]) return openItem(p[1]);
    if (p[0] === "search") return openSearch(p[1] || "");
    if (p[0] === "account") return openAccountPage(p[1] || "profile");
    return openHome();
  }
  openHome(raw);
}
window.addEventListener("hashchange", () => {
  soft = false;
  $("mainNav").classList.remove("open"); $("menuBtn").setAttribute("aria-expanded", "false");
  route();
});

/* ---------- Page wiring ---------- */
$("search").addEventListener("input", renderGrid);
$("sort").addEventListener("change", renderGrid);
$("minPrice").addEventListener("input", renderGrid);
$("maxPrice").addEventListener("input", renderGrid);
$("clearFilters").addEventListener("click", () => {
  $("search").value = ""; $("minPrice").value = ""; $("maxPrice").value = "";
  $("sort").value = "recommended"; renderGrid();
});
$("heroSearch").addEventListener("submit", e => {
  e.preventDefault();
  const q = $("heroQuery").value.trim();
  location.hash = "#/search/" + encodeURIComponent(q);
});
$("menuBtn").onclick = () => { const o = $("mainNav").classList.toggle("open"); $("menuBtn").setAttribute("aria-expanded", String(o)); };
$("mainNav").addEventListener("click", e => { if (e.target.closest("a")) { $("mainNav").classList.remove("open"); $("menuBtn").setAttribute("aria-expanded", "false"); } });
$("close").onclick = closeModal;
$("overlay").addEventListener("click", e => { if (e.target === $("overlay")) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---------- Email + password authentication ---------- */
let afterLoginRequestId = null, afterLoginListItem = false, signupEmail = "", signupMobile = "", authFlow = "login", currentSession = null, welcomeShownFor = null;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AUTH_REDIRECT_URL = window.location.origin + window.location.pathname;

function cleanMobile(raw) {
  const v = String(raw).trim().replace(/[\s()-]/g, "");
  if (/^[6-9]\d{9}$/.test(v)) return "+91" + v;
  if (/^\+[1-9]\d{7,14}$/.test(v)) return v;
  return null;
}
function setAuthUI(session) {
  const previousUserId = currentSession?.user?.id || null;
  currentSession = session && session.user ? session : null;
  const nextUserId = currentSession?.user?.id || null;
  const authStateChanged = previousUserId !== nextUserId;
  $("login").hidden = !!currentSession;
  $("logout").hidden = !currentSession;
  const userHandle = $("userHandle");
  if (userHandle) {
    userHandle.hidden = !currentSession;
    userHandle.textContent = "";
    if (authStateChanged && currentSession && sb) {
      const userId = currentSession.user.id;
      sb.from("profiles").select("username").eq("id", userId).maybeSingle().then(({ data, error }) => {
        if (!error && data?.username && currentSession?.user?.id === userId) {
          userHandle.textContent = "@" + data.username;
          userHandle.hidden = false;
        }
      }).catch(() => {});
    }
  }
  if ($("myRequests")) $("myRequests").hidden = !currentSession;
  if ($("profileTop")) $("profileTop").hidden = !currentSession;
  if ($("mobileProfile")) $("mobileProfile").hidden = !currentSession;
  if ($("mobileMyRequests")) $("mobileMyRequests").hidden = !currentSession;
  if (authStateChanged && !currentSession && location.hash.startsWith("#/account")) location.hash = "#";
  if ($("mobileLogout")) $("mobileLogout").hidden = !currentSession;
  // Rebuild only when signed-in identity actually changes; token refreshes must
  // not destroy in-progress item form fields or scroll position.
  const route = location.hash.replace(/^#/, "");
  if (authStateChanged && route.startsWith("/i/")) {
    let itemId = route.slice(3);
    try { itemId = decodeURIComponent(itemId); } catch (e) { /* keep raw id */ }
    openItem(itemId);
  }
}

// Consume deferred navigation/form actions after either login or signup.
function continueAfterAuth() {
  if (afterLoginRequestId) {
    const itemId = afterLoginRequestId;
    afterLoginRequestId = null;
    location.hash = "#/i/" + encodeURIComponent(itemId);
  } else if (afterLoginListItem) {
    afterLoginListItem = false;
    renderListForm();
  }
}
function needSupabase() {
  if (sb) return false;
  toast("Supabase setup pending — add project URL and publishable key first.");
  return true;
}
function friendlyAuthError(err) {
  const m = String(err && err.message || "Something went wrong");
  if (/email rate limit exceeded/i.test(m)) return "Email service limit reached. Please wait before trying again.";
  if (/password should be at least|weak password/i.test(m)) return "Choose a stronger password (at least 8 characters).";
  if (/invalid login credentials/i.test(m)) return "Email or password is incorrect. If you forgot your password, use Forgot password.";
  if (/email not confirmed/i.test(m)) return "Please verify your email using the confirmation link first.";
  if (/user already registered/i.test(m)) return "An account already exists for this email. Please log in instead.";
  if (/expired|invalid/i.test(m)) return "That link is invalid or expired. Request a fresh one.";
  return m;
}
function passwordRules(password) {
  return password.length >= 8;
}
function openLogin(step = "login") {
  if (step === "signup") {
    openModal(`<span class="eyebrow">CREATE YOUR ACCOUNT</span><h2>Join Utileo</h2>
      <p>Create your account with an email and password. We’ll send one email verification link.</p>
      <label>Full name<input id="suName" autocomplete="name" maxlength="60" placeholder="Your full name"></label>
      <label>Mobile number<input id="suMobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="98765 43210" maxlength="16"></label>
      <label>Email address<input id="suEmail" type="email" autocomplete="email" placeholder="you@example.com" maxlength="120"></label>
      <label>Password<input id="suPassword" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters"></label>
      <label>Confirm password<input id="suConfirm" type="password" autocomplete="new-password" minlength="8" placeholder="Enter password again"></label>
      <p class="form-hint">Use at least 8 characters. Never share your password.</p>
      <label class="terms-consent"><input id="suTerms" type="checkbox"><span>I agree to the <a href="terms.html" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a> and <a href="terms.html#privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a>.</span></label>
      <p class="terms-required" id="termsRequired" role="alert">Please accept the Terms &amp; Conditions and Privacy Notice.</p>
      <button class="primary wide" id="suGo" type="button">Create account</button>
      <button class="back" id="toLogin" type="button">Already have an account? Log in</button>`);
    $("toLogin").onclick = () => openLogin("login");
    $("suGo").onclick = async () => {
      const name = $("suName").value.trim().replace(/\s+/g, " ");
      const mobile = cleanMobile($("suMobile").value);
      const email = $("suEmail").value.trim().toLowerCase();
      const password = $("suPassword").value;
      const confirm = $("suConfirm").value;
      if (!$("suTerms").checked) { $("termsRequired").classList.add("show"); return; }
      $("termsRequired").classList.remove("show");
      if (name.length < 2 || /[0-9]/.test(name)) { toast("Enter your full name."); return; }
      if (!mobile) { toast("Enter a valid mobile number."); return; }
      if (!EMAIL_RE.test(email)) { toast("Enter a valid email address."); return; }
      if (!passwordRules(password)) { toast("Password must be at least 8 characters."); return; }
      if (password !== confirm) { toast("Passwords do not match."); return; }
      if (needSupabase()) return;
      $("suGo").disabled = true; $("suGo").textContent = "Creating account…";
      try {
        const { error } = await sb.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: AUTH_REDIRECT_URL,
            data: { full_name: name, mobile, terms_accepted: true, terms_version: TERMS_VERSION, terms_accepted_at: new Date().toISOString() }
          }
        });
        if (error) { toast(friendlyAuthError(error)); $("suGo").disabled = false; $("suGo").textContent = "Create account"; return; }
        signupEmail = email; signupMobile = mobile; authFlow = "signup";
        try { localStorage.setItem("utileo_pending_verified_welcome", email); } catch (e) { /* optional welcome marker */ }
        openModal(`<span class="eyebrow">VERIFY YOUR EMAIL</span><h2>Check your inbox</h2>
          <p>We sent one confirmation link to <b>${esc(email)}</b>. Open it once to activate your Utileo account.</p>
          <p class="note">After verification, log in anytime using your email and password. You won’t need a sign-in link again.</p>
          <button class="primary wide" id="verifyDone" type="button">Back to log in</button>`);
        $("verifyDone").onclick = () => openLogin("login");
      } catch (error) {
        toast("Could not create the account. Please try again later.");
        $("suGo").disabled = false; $("suGo").textContent = "Create account";
      }
    };
  } else if (step === "login") {
    openModal(`<span class="eyebrow">WELCOME BACK</span><h2>Log in to Utileo</h2>
      <p>Use your registered email and password.</p>
      <label>Email address<input id="liEmail" type="email" autocomplete="email" placeholder="you@example.com" maxlength="120"></label>
      <label>Password<input id="liPassword" type="password" autocomplete="current-password" placeholder="Your password"></label>
      <button class="primary wide" id="liGo" type="button">Log in</button>
      <button class="back" id="forgotPassword" type="button">Forgot password?</button>
      <button class="back" id="toSignup" type="button">New to Utileo? Create an account</button>`);
    $("toSignup").onclick = () => openLogin("signup");
    $("forgotPassword").onclick = () => openLogin("forgot");
    $("liGo").onclick = async () => {
      const email = $("liEmail").value.trim().toLowerCase(), password = $("liPassword").value;
      if (!EMAIL_RE.test(email) || !password) { toast("Enter your email and password."); return; }
      if (needSupabase()) return;
      $("liGo").disabled = true; $("liGo").textContent = "Logging in…";
      try {
        // A manual password login must not consume a stale signup-browser welcome marker.
        // Clear it before auth emits SIGNED_IN, avoiding a race with the auth listener.
        try { localStorage.removeItem("utileo_pending_verified_welcome"); } catch (e) { /* optional storage */ }
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) { toast(friendlyAuthError(error)); $("liGo").disabled = false; $("liGo").textContent = "Log in"; return; }
        try { localStorage.removeItem("utileo_pending_verified_welcome"); } catch (e) { /* optional storage */ }
        setAuthUI(data.session); closeModal(); toast("You’re logged in."); continueAfterAuth();
      } catch (error) {
        toast("Could not log in. Please try again.");
        $("liGo").disabled = false; $("liGo").textContent = "Log in";
      }
    };
  } else if (step === "forgot") {
    openModal(`<span class="eyebrow">ACCOUNT RECOVERY</span><h2>Reset your password</h2>
      <p>Enter your registered email. We’ll send a password-reset link.</p>
      <label>Email address<input id="resetEmail" type="email" autocomplete="email" placeholder="you@example.com" maxlength="120"></label>
      <button class="primary wide" id="sendReset" type="button">Send reset link</button>
      <button class="back" id="backLogin" type="button">Back to log in</button>`);
    $("backLogin").onclick = () => openLogin("login");
    $("sendReset").onclick = async () => {
      const email = $("resetEmail").value.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) { toast("Enter a valid email address."); return; }
      if (needSupabase()) return;
      $("sendReset").disabled = true; $("sendReset").textContent = "Sending…";
      try {
        const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: AUTH_REDIRECT_URL });
        if (error) { toast(friendlyAuthError(error)); $("sendReset").disabled = false; $("sendReset").textContent = "Send reset link"; return; }
        openModal(`<span class="eyebrow">EMAIL SENT</span><h2>Check your inbox</h2><p>If an account exists for <b>${esc(email)}</b>, a password-reset link has been sent. Open the latest link to choose a new password.</p><button class="primary wide" id="resetBack" type="button">Back to log in</button>`);
        $("resetBack").onclick = () => openLogin("login");
      } catch (error) {
        toast("Could not send the reset email. Please try again later.");
        $("sendReset").disabled = false; $("sendReset").textContent = "Send reset link";
      }
    };
  }
}
function openSetNewPassword() {
  openModal(`<span class="eyebrow">ACCOUNT RECOVERY</span><h2>Choose a new password</h2>
    <label>New password<input id="newPassword" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters"></label>
    <label>Confirm new password<input id="confirmNewPassword" type="password" autocomplete="new-password" minlength="8" placeholder="Enter it again"></label>
    <button class="primary wide" id="saveNewPassword" type="button">Update password</button>`);
  $("saveNewPassword").onclick = async () => {
    const password = $("newPassword").value, confirm = $("confirmNewPassword").value;
    if (!passwordRules(password)) { toast("Password must be at least 8 characters."); return; }
    if (password !== confirm) { toast("Passwords do not match."); return; }
    $("saveNewPassword").disabled = true; $("saveNewPassword").textContent = "Updating…";
    const { error } = await sb.auth.updateUser({ password });
    if (error) { toast(friendlyAuthError(error)); $("saveNewPassword").disabled = false; $("saveNewPassword").textContent = "Update password"; return; }
    closeModal(); toast("Password updated. You can now log in with it.");
  };
}

async function showWelcome(user) {
  let username = "", name = (user.user_metadata && user.user_metadata.full_name) || "";
  try {
    const { data } = await sb.from("profiles").select("username,full_name").eq("id", user.id).maybeSingle();
    if (data) { username = data.username || ""; name = data.full_name || name; }
  } catch (e) { /* profile may take a moment; the welcome still works */ }
  openModal(`<span class="eyebrow">YOU’RE IN</span><h2>Welcome${name ? ", " + esc(name) : ""}!</h2>
    <p>Your email is verified.${username ? " Here is your Utileo username:" : ""}</p>
    ${username ? `<div class="username-box" id="uname">@${esc(username)}</div>` : ""}
    <button class="primary wide" id="welcomeGo" type="button">Continue</button>`);
  $("welcomeGo").onclick = () => {
    closeModal();
    continueAfterAuth();
  };
}

$("login").onclick = () => openLogin("login");
if ($("myRequests")) $("myRequests").onclick = openRequestBox;
if ($("profileTop")) $("profileTop").onclick = () => { location.hash = "#/account/profile"; };
if ($("mobileProfile")) $("mobileProfile").onclick = () => { $("mainNav").classList.remove("open"); location.hash = "#/account/profile"; };
if ($("accountSignout")) $("accountSignout").onclick = () => $("logout").click();
if ($("mobileMyRequests")) $("mobileMyRequests").onclick = () => { $("mainNav").classList.remove("open"); openRequestBox(); };
if ($("mobileLogout")) $("mobileLogout").onclick = () => { $("mainNav").classList.remove("open"); $("logout").click(); };
$("logout").onclick = async () => {
  if (!sb || !currentSession) return;
  $("logout").disabled = true;
  const { error } = await sb.auth.signOut();
  $("logout").disabled = false;
  if (error) { toast("Could not sign out. Please try again."); return; }
  setAuthUI(null); closeModal(); toast("You have been signed out.");
};


/* ---------- Booking dashboard + private contact reveal ---------- */
async function openRequestBox() {
  if (!currentSession?.user?.id) { openLogin("login"); return; }
  openModal('<span class="eyebrow">YOUR UTILEO</span><h2>My Request</h2><div id="bookingDashboard">Loading your requests…</div>');
  const host = $("bookingDashboard");
  const { data: requests, error } = await sb.from("booking_requests").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) { host.textContent = "Could not load requests: " + error.message; return; }
  if (!requests?.length) { host.innerHTML = '<p>No requests available</p><button class="primary" id="emptyListItem" type="button">List an item</button>'; $("emptyListItem").onclick = listItem; return; }
  const listingIds = [...new Set(requests.map(r => r.listing_id))];
  const { data: listings } = await sb.from("listings").select("id,title,owner_id,price_per_day").in("id", listingIds);
  const byId = Object.fromEntries((listings || []).map(l => [l.id,l]));
  host.innerHTML = requests.map(r => {
    const l = byId[r.listing_id] || {};
    const incoming = l.owner_id === currentSession.user.id;
    return `<article class="booking-card" data-booking="${esc(r.id)}"><b>${esc(l.title || "Campus item")}</b><p>${incoming ? "Request received" : "Request sent"} · ${esc(r.start_date)} · ${r.rental_days} day(s)</p><p>Status: <b>${esc(r.status.toUpperCase())}</b></p>${r.message ? `<p>${esc(r.message)}</p>` : ""}${incoming && r.status === "pending" ? `<button class="primary" data-accept="${esc(r.id)}">Accept</button> <button class="secondary" data-decline="${esc(r.id)}">Decline</button>` : ""}${["pending","accepted"].includes(r.status) ? `<button class="secondary" data-cancel="${esc(r.id)}">${r.status === "accepted" ? "Cancel accepted rental" : "Cancel request"}</button>` : ""}${r.status === "accepted" ? `<button class="secondary" data-contact="${esc(r.id)}">Show contact numbers</button><div class="contact-details" id="contact-${esc(r.id)}"></div>` : ""}</article>`;
  }).join("");
  host.querySelectorAll("[data-accept],[data-decline],[data-cancel]").forEach(btn => btn.onclick = async () => {
    const id = btn.dataset.accept || btn.dataset.decline || btn.dataset.cancel, status = btn.dataset.accept ? "accepted" : btn.dataset.decline ? "declined" : "cancelled";
    btn.disabled = true;
    const { error: updateError } = await sb.from("booking_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) { toast(/overlap/i.test(updateError.message || "") ? "Those dates overlap another accepted rental. Choose different dates." : "Could not update the request. Please refresh and try again."); btn.disabled = false; return; }
    toast(status === "accepted" ? "Request accepted. Both participants can now view contact details." : status === "declined" ? "Request declined." : "Request cancelled.");
    openRequestBox();
  });
  host.querySelectorAll("[data-contact]").forEach(btn => btn.onclick = async () => {
    btn.disabled = true;
    const { data, error: contactError } = await sb.rpc("booking_contact", { p_booking_id: btn.dataset.contact });
    btn.disabled = false;
    const target = $("contact-" + btn.dataset.contact);
    if (contactError || !data?.length) { target.textContent = "Contact details are not available yet. Both accounts need a saved mobile number."; return; }
    const c = data[0];
    target.innerHTML = `<p>Lender: ${esc(c.owner_name)} · <a href="tel:${esc(c.owner_mobile || "")}">${esc(c.owner_mobile || "No number saved")}</a></p><p>Renter: ${esc(c.renter_name)} · <a href="tel:${esc(c.renter_mobile || "")}">${esc(c.renter_mobile || "No number saved")}</a></p>`;
  });
}

/* ---------- Signed-in account dashboard ---------- */
let activeAccountTab = "profile";
async function openAccountPage(tab="profile") {
  if (!currentSession?.user?.id) { openLogin("login"); return; }
  activeAccountTab = ["profile","listings","borrowed","requests","chats"].includes(tab) ? tab : "profile";
  show("account"); document.title = "My Utileo | Utileo";
  document.querySelectorAll("[data-account-tab]").forEach(b=>b.classList.toggle("active",b.dataset.accountTab===activeAccountTab));
  const host=$("accountPanel"); host.innerHTML="<p>Loading…</p>";
  document.querySelectorAll("[data-account-tab]").forEach(b=>b.onclick=()=>openAccountPage(b.dataset.accountTab));
  if(activeAccountTab==="profile"){
    const {data,error}=await sb.from("profiles").select("username,public_id,full_name,email").eq("id",currentSession.user.id).maybeSingle();
    if(error||!data){host.innerHTML="<p>Could not load your profile.</p>";return;}
    host.innerHTML=`<h2>Profile details</h2><p class="muted">Your public Student ID can be shared to receive message requests. Email and mobile remain private.</p><label>Full name<input id="profileName" maxlength="60" value="${esc(data.full_name||"")}"></label><label>Email<input value="${esc(data.email||currentSession.user.email||"")}" disabled></label><label>Student ID<input value="${esc(data.public_id||data.username||"")}" readonly></label><button class="primary" id="saveProfile">Save profile</button><p class="form-hint">Student ID is unique and cannot be edited.</p>`;
    $("saveProfile").onclick=async()=>{const full_name=$("profileName").value.trim();if(!full_name){toast("Enter your name.");return;}const {error}=await sb.from("profiles").update({full_name}).eq("id",currentSession.user.id);if(error){toast("Profile could not be updated.");return;}toast("Profile updated.");};
  } else if(activeAccountTab==="listings" || activeAccountTab==="borrowed"){
    const own=activeAccountTab==="listings";
    let q=sb.from("listings").select("id,title,price_per_day,created_at,available_from,available_to").order("created_at",{ascending:false});
    if(own) q=q.eq("owner_id",currentSession.user.id);
    const {data,error}=await q.limit(100);
    if(error){host.textContent="Could not load items.";return;}
    let rows=data||[];
    if(!own){
      const {data:req}=await sb.from("booking_requests").select("listing_id,status,start_date,rental_days").eq("renter_id",currentSession.user.id).order("created_at",{ascending:false});
      const ids=[...new Set((req||[]).map(x=>x.listing_id))];
      const {data:items}=ids.length?await sb.from("listings").select("id,title,price_per_day").in("id",ids):{data:[]};
      const map=Object.fromEntries((items||[]).map(x=>[x.id,x]));
      rows=(req||[]).map(x=>({...map[x.listing_id],...x})).filter(x=>x.id);
    }
    host.innerHTML=rows.length?rows.map(x=>`<article class="account-item"><b>${esc(x.title||"Item")}</b><p>${own?("₹"+Number(x.price_per_day||0)+"/day · Availability: "+(x.available_from||"Not set")+" to "+(x.available_to||"Not set")):(esc(x.start_date)+" · "+x.rental_days+" day(s) · "+esc(x.status))}</p>${own?`<a href="#/i/live-${esc(x.id)}">View listing →</a>`:""}</article>`).join(""):"<p>No items to show yet.</p>";
  } else if(activeAccountTab==="requests"){
    const {data,error}=await sb.from("booking_requests").select("id,listing_id,status,start_date,rental_days,message,renter_id").order("created_at",{ascending:false}).limit(100);
    if(error){host.textContent="Could not load rental requests.";return;}
    const ids=[...new Set((data||[]).map(x=>x.listing_id))];
    const {data:listings}=ids.length?await sb.from("listings").select("id,title,owner_id").in("id",ids):{data:[]};
    const map=Object.fromEntries((listings||[]).map(x=>[x.id,x]));
    host.innerHTML=(data||[]).length?(data||[]).map(x=>{const l=map[x.listing_id]||{};const incoming=l.owner_id===currentSession.user.id;return `<article class="account-item"><b>${esc(l.title||"Rental item")}</b><p>${incoming?"Received":"Sent"} · ${esc(x.start_date)} · ${x.rental_days} day(s) · ${esc(x.status)}</p>${incoming&&x.status==="pending"?`<button class="primary" data-accept="${esc(x.id)}">Accept</button> <button class="secondary" data-decline="${esc(x.id)}">Decline</button>`:""}${x.status==="accepted"?`<button class="secondary" data-open-rental-chat="${esc(x.id)}">Open rental chat</button>`:""}</article>`;}).join(""):"<p>No rental requests yet.</p>";
    host.querySelectorAll("[data-accept],[data-decline]").forEach(b=>b.onclick=async()=>{const status=b.dataset.accept?"accepted":"declined";const {error}=await sb.from("booking_requests").update({status,updated_at:new Date().toISOString()}).eq("id",b.dataset.accept||b.dataset.decline);if(error){toast("Could not update request.");return;}toast("Request "+status+".");openAccountPage("requests");});
    host.querySelectorAll("[data-open-rental-chat]").forEach(b=>b.onclick=()=>openChatForBooking(b.dataset.openRentalChat));
  } else if(activeAccountTab==="chats"){
    const {data:parts,error}=await sb.from("conversation_participants").select("conversation_id").eq("user_id",currentSession.user.id);
    if(error){host.textContent="Could not load chats.";return;}
    const ids=(parts||[]).map(x=>x.conversation_id);
    const {data:convs}=ids.length?await sb.from("conversations").select("id,kind,status,created_at").in("id",ids).order("created_at",{ascending:false}):{data:[]};
    const {data:requests}=await sb.from("message_requests").select("id,sender_id,recipient_id,conversation_id,status").eq("recipient_id",currentSession.user.id).eq("status","pending");
    host.innerHTML=`<h2>Message requests</h2>${(requests||[]).map(x=>`<article class="account-item"><b>New student message request</b><p>Request ID: ${esc(x.id.slice(0,8))}</p><button class="primary" data-msg-accept="${esc(x.id)}">Accept</button> <button class="secondary" data-msg-decline="${esc(x.id)}">Decline</button></article>`).join("")||"<p>No pending message requests.</p>"}<h2>Your chats</h2><label>Start a chat using Student ID<input id="targetStudentId" maxlength="6" placeholder="e.g. X7K9P2"></label><button class="primary" id="sendMessageRequest">Send message request</button>${(convs||[]).filter(c=>c.status==="active").map(c=>`<article class="account-item"><b>${c.kind==="rental"?"Rental chat":"Student chat"}</b><p>${esc(c.created_at.slice(0,10))}</p><button class="secondary" data-chat="${esc(c.id)}">Open chat</button></article>`).join("")||"<p>No active chats yet.</p>"}<div id="chatWindow"></div>`;
    $("sendMessageRequest").onclick=async()=>{const id=$("targetStudentId").value.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(id)){toast("Enter a valid 6-character Student ID.");return;}const {error}=await sb.rpc("send_message_request",{p_public_id:id});if(error){toast(error.message||"Could not send request.");return;}toast("Message request sent.");openAccountPage("chats");};
    host.querySelectorAll("[data-msg-accept],[data-msg-decline]").forEach(b=>b.onclick=async()=>{const {error}=await sb.rpc("respond_message_request",{p_request_id:b.dataset.msgAccept||b.dataset.msgDecline,p_accept:!!b.dataset.msgAccept});if(error){toast("Could not update request.");return;}openAccountPage("chats");});
    host.querySelectorAll("[data-chat]").forEach(b=>b.onclick=()=>openChat(b.dataset.chat));
  }
}
async function openChatForBooking(bookingId){
 const {data}=await sb.from("conversations").select("id").eq("booking_id",bookingId).maybeSingle();
 if(data?.id){location.hash="#/account/chats";setTimeout(()=>openChat(data.id),250);}else toast("Chat is available after the booking is accepted.");
}
async function openChat(id){
 const host=$("accountPanel");if(!host)return;
 const {data:messages,error}=await sb.from("messages").select("id,sender_id,body,created_at").eq("conversation_id",id).order("created_at",{ascending:true}).limit(200);
 if(error){toast("Could not load messages.");return;}
 const current= currentSession.user.id;
 host.insertAdjacentHTML("beforeend",`<section class="chat-box"><h3>Private chat</h3><div class="chat-messages" id="chatMessages">${(messages||[]).map(m=>`<p class="${m.sender_id===current?"mine":"theirs"}">${esc(m.body)}<small>${esc(m.created_at.slice(0,16).replace("T"," "))}</small></p>`).join("")}</div><form id="chatSend"><input id="chatText" maxlength="2000" placeholder="Write a message…" required><button class="primary">Send</button></form></section>`);
 $("chatSend").onsubmit=async e=>{e.preventDefault();const body=$("chatText").value.trim();if(!body)return;const {error}=await sb.from("messages").insert({conversation_id:id,sender_id:current,body});if(error){toast("Message could not be sent.");return;}openChat(id);};
}

/* ---------- List an item ---------- */
function listItem() {
  renderListForm();
}
function renderListForm() {
  if (!currentSession?.user?.id) { afterLoginListItem = true; openLogin("login"); return; }
  openModal(`<span class="eyebrow">SHARE WITH YOUR CAMPUS</span><h2>List an item</h2><p>Add clear details so another student can request a rental.</p>
    <label>Item name<input id="listingName" maxlength="80" placeholder="e.g. Scientific calculator"></label>
    <label>Category<select id="listingCategory">${CATS.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join("")}</select></label>
    <label>Subcategory<select id="listingSub"></select></label>
    <label>Price per day (₹)<input id="listingPrice" type="number" min="1" max="100000" placeholder="25"></label>
    <label>Condition<input id="listingCondition" maxlength="60" placeholder="Good condition"></label>
    <label>Item description<textarea id="listingDescription" rows="3" maxlength="500" placeholder="Describe the item, its features, size, included accessories and any existing marks"></textarea></label>
    <label>Available from<input id="listingAvailableFrom" type="date" min="${todayISO()}"></label><label>Available to<input id="listingAvailableTo" type="date" min="${todayISO()}"></label><p class="form-hint">Set the dates when your item can be requested. Leave both blank for flexible availability.</p>
     <label>Public pickup area<input id="listingAddress" maxlength="120" placeholder="Campus gate / common area / library"></label><p class="form-hint">Do not enter your home address, room number or flat number. Share exact handover details privately after acceptance.</p>
    <label>Item photo<input id="listingPhoto" type="file" accept="image/*" required></label>
    <div class="photo-preview hidden" id="photoPreview"><img id="photoPreviewImage" alt="Selected item preview"></div>
    <p class="form-hint">Upload one clear photo of your item (JPG, PNG or WebP, up to 5 MB).</p>
    <button class="primary wide" id="saveListing" type="button">Submit listing</button>`);
  const fillSubs = () => { const c = CATS.find(x => x.name === $("listingCategory").value); $("listingSub").innerHTML = c.subs.map(s => `<option>${esc(s.name)}</option>`).join(""); };
  fillSubs(); $("listingCategory").onchange = fillSubs;
  $("listingPhoto").onchange = () => {
    const file = $("listingPhoto").files[0], preview = $("photoPreview");
    if (!file) { preview.classList.add("hidden"); return; }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      $("listingPhoto").value = ""; preview.classList.add("hidden");
      toast("Choose an image under 5 MB."); return;
    }
    $("photoPreviewImage").src = URL.createObjectURL(file); preview.classList.remove("hidden");
  };
  $("saveListing").onclick = async () => {
    const title = $("listingName").value.trim(), category = $("listingCategory").value, subcategory = $("listingSub").value,
      price = Number($("listingPrice").value), condition = $("listingCondition").value.trim(),
      description = $("listingDescription").value.trim(), address = $("listingAddress").value.trim(),
      photo = $("listingPhoto").files[0], available_from=$("listingAvailableFrom").value||null, available_to=$("listingAvailableTo").value||null;
    if ((available_from&&!available_to)||(available_to&&!available_from)||(available_from&&available_to&&available_to<available_from)) { toast("Choose both valid availability dates or leave both blank."); return; }
     if (!title || title.length > 80 || !subcategory || !condition || condition.length > 60 || !description || description.length > 500 || !address || address.length > 120 || !photo || !Number.isInteger(price) || price < 1 || price > 100000) { toast("Please complete all details, add a pickup location and upload an item photo."); return; }
    if (needSupabase()) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 5 * 1024 * 1024) { toast("Choose an image under 5 MB."); return; }
    $("saveListing").disabled = true; $("saveListing").textContent = "Uploading photo…";
    const ext = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" })[photo.type];
    if (!ext) { toast("Choose a JPG, PNG or WebP image."); $("saveListing").disabled = false; $("saveListing").textContent = "Submit listing"; return; }
    const imagePath = `${currentSession.user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await sb.storage.from("listing-images").upload(imagePath, photo, { contentType: photo.type, upsert: false });
    if (uploadError) { toast("Photo upload failed: " + uploadError.message); $("saveListing").disabled = false; $("saveListing").textContent = "Submit listing"; return; }
    const { data: publicImage } = sb.storage.from("listing-images").getPublicUrl(imagePath);
    $("saveListing").textContent = "Saving listing…";
    const { error } = await sb.from("listings").insert({ title, category, subcategory, price_per_day: price, condition, description, pickup_area: address, available_from, available_to, image_url: publicImage.publicUrl, owner_id: currentSession.user.id });
    if (error) {
      await sb.storage.from("listing-images").remove([imagePath]);
      toast("Listing save failed: " + error.message); $("saveListing").disabled = false; $("saveListing").textContent = "Submit listing"; return;
    }
    closeModal(); toast("Your item and photo were listed successfully!"); loadLive();
  };
}
$("listHero").onclick = listItem;
$("listTop").onclick = listItem;

/* ---------- Live listings from Supabase (merged into the browse pages) ---------- */
let liveListingsLoaded = false;
async function loadLive() {
  if (!sb) { liveListingsLoaded = true; return; }
  let rows, error;
  try { ({ data: rows, error } = await sb.from("listings").select("id,owner_id,title,category,subcategory,price_per_day,condition,description,image_url,pickup_area,available_from,available_to,created_at").order("created_at", { ascending: false }).limit(200)); }
  catch (e) { console.error("Utileo: unable to load listings", e); liveListingsLoaded = true; soft = true; try { route(); } finally { soft = false; } return; }
  if (error || !rows) { if (error) console.error("Utileo: listings query failed", error); liveListingsLoaded = true; soft = true; try { route(); } finally { soft = false; } return; }
  for (let i = ITEMS.length - 1; i >= 0; i--) if (ITEMS[i].live) ITEMS.splice(i, 1);
  rows.forEach(r => {
    const cat = CATS.find(c => c.name === r.category);
    if (!cat) return;
    if (!cat.subs.some(s => s.name === r.subcategory)) cat.subs.push({ name: r.subcategory, emoji: cat.emoji });
    ITEMS.push({ id: "live-" + r.id, cat: cat.id, sub: r.subcategory, title: r.title, emoji: cat.emoji, price: Number(r.price_per_day) || 0, cond: r.condition, live: true,
      desc: r.description || "Community listing. Meet the lister to inspect the item before any rental.", address: r.pickup_area || "", available_from:r.available_from||null, available_to:r.available_to||null, image_url: r.image_url || "", created_at: r.created_at || "", owner_id: r.owner_id || null });
  });
  liveListingsLoaded = true;
  soft = true;
  try { renderHome(); route(); } finally { soft = false; }
}

/* ---------- Start ---------- */
window.addEventListener("error", event => { console.error("Utileo runtime error:", event.error || event.message); });
renderHome();
route();
if (sb) {
  sb.auth.getSession().then(({ data }) => setAuthUI(data.session));
  sb.auth.onAuthStateChange((event, session) => {
    setAuthUI(session);
    if (event === "PASSWORD_RECOVERY") openSetNewPassword();
    if (event === "SIGNED_IN" && session?.user && welcomeShownFor !== session.user.id) {
      let verifiedEmail = "";
      try { verifiedEmail = localStorage.getItem("utileo_pending_verified_welcome") || ""; } catch (e) { /* storage may be unavailable */ }
      if (verifiedEmail && verifiedEmail.toLowerCase() === String(session.user.email || "").toLowerCase()) {
        welcomeShownFor = session.user.id;
        try { localStorage.removeItem("utileo_pending_verified_welcome"); } catch (e) { /* ignore */ }
        showWelcome(session.user);
      }
    }
  });
  loadLive();
}
