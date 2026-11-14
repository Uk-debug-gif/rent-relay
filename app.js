/* RentRelay — frontend prototype
   Pages (hash routes):  #  (home)   #/c/<category>   #/c/<category>/<subcategory>
                         #/i/<item>  #/search/<text>                              */

const SUPABASE_URL = "https://tvtmhisivwctprqmbzbj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Y2qhEXQVAEdSD5izte37yQ_ZZGLcB9Y";
const TERMS_VERSION = "2026-11-14";
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

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast"; t.setAttribute("role", "status"); t.textContent = msg;
  document.body.append(t);
  setTimeout(() => t.remove(), 3200);
}
function openModal(html) {
  $("modalBody").innerHTML = html;
  $("overlay").classList.remove("hidden");
  const f = $("modalBody").querySelector("input,select");
  if (f) f.focus();
}
function closeModal() { $("overlay").classList.add("hidden"); $("modalBody").innerHTML = ""; }

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
  if (!soft) { $("search").value = ""; $("sort").value = "recommended"; }
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
  document.title = (sub ? sub.name + " — " : "") + cat.name + " | RentRelay";
  show("catalog"); renderGrid(); toTop();
}

function openSearch(q) {
  state.cat = null; state.sub = null; state.search = true;
  if (!soft) { $("search").value = q; $("sort").value = "recommended"; }
  $("catalog").style.cssText = "--c:#6d44c9;--t:#f1ebfb";
  $("crumbs").innerHTML = `<a href="#">Home</a><span>›</span><b>Search</b>`;
  $("catalogEyebrow").textContent = "SEARCH RESULTS";
  $("catalogTitle").textContent = q ? `“${q}”` : "All items";
  $("catalogDesc").textContent = "Showing matches from every category.";
  $("catalogEmoji").textContent = "🔎";
  $("subtiles").classList.add("hidden"); $("subtiles").innerHTML = "";
  document.title = "Search | RentRelay";
  show("catalog"); renderGrid(); toTop();
}

function renderGrid() {
  const q = $("search").value.trim().toLowerCase(), sort = $("sort").value;
  let list = state.search ? ITEMS.slice() : ITEMS.filter(i => i.cat === state.cat.id && (!state.sub || i.sub === state.sub.name));
  const minPrice = Number($("minPrice").value || 0);
  const maxPrice = Number($("maxPrice").value || Infinity);
  if (q) list = list.filter(i => (i.title + " " + i.sub + " " + catOf(i).name + " " + i.desc + " " + i.cond + " " + (i.address || "")).toLowerCase().includes(q));
  list = list.filter(i => i.price >= minPrice && i.price <= maxPrice);
  if (sort === "low") list.sort((a, b) => a.price - b.price);
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
  if (!it) {
    box.innerHTML = `<div class="notfound"><h1>We couldn’t find that item</h1><p>It may have been removed, or it is still loading.</p><a class="primary" href="#">Back to home</a></div>`;
    document.title = "Item not found | RentRelay"; toTop(); return;
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
            <label>Start date<input id="rentStart" type="date" min="${todayISO()}" value="${todayISO()}"></label>
            <label>Rental days
              <span class="stepper"><button type="button" id="dMinus" aria-label="Fewer days">−</button><input id="rentDays" type="number" min="1" max="30" value="1" inputmode="numeric"><button type="button" id="dPlus" aria-label="More days">+</button></span>
            </label>
          </div>
          <div class="summary"><div><span id="sumLine"></span><small id="sumReturn"></small></div><b id="sumTotal"></b></div>
          ${it.live && it.owner_id ? (currentSession?.user?.id ? (currentSession.user.id === it.owner_id ? `<p class="note">This is your listing. Other signed-in students can send you a rental request.</p>` : `<button class="primary wide" id="rentBtn" type="button">Send rental request</button>`) : ``) : `<button class="primary wide" id="rentBtn" type="button">Calculate rental total</button>`}
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

  const contactPanel = $("listingContact");
  if (it.live && it.owner_id && sb) {
    sb.rpc("listing_contact", { p_listing_id: it.id.replace("live-", "") }).then(({ data, error }) => {
      if (!contactPanel || !contactPanel.isConnected) return;
      if (error || !data?.length) { contactPanel.innerHTML = "<b>Contact lender</b><p>Contact details are unavailable right now.</p>"; return; }
      const c = data[0];
      const phone = String(c.mobile_display || "Not provided");
      const phoneHTML = c.is_masked || phone === "Not provided"
        ? esc(phone)
        : `<a href="tel:${esc(phone)}">${esc(phone)}</a>`;
      contactPanel.innerHTML = `<b>Contact lender</b><p>${esc(c.owner_name || "Student")} · ${phoneHTML}</p>${c.is_masked ? "<small>Sign in to view the full contact number.</small>" : ""}`;
    });
  } else if (it.live && it.owner_id) {
    contactPanel.innerHTML = "<b>Contact lender</b><p>Sign in to view contact details.</p>";
  } else if (contactPanel) {
    contactPanel.hidden = true;
  }

  const days = $("rentDays");
  const clamp = () => { let n = parseInt(days.value, 10); if (!(n >= 1)) n = 1; if (n > 30) n = 30; days.value = n; return n; };
  const update = () => {
    const n = clamp(), start = $("rentStart").value || todayISO();
    const end = new Date(start + "T00:00"); end.setDate(end.getDate() + n);
    $("sumLine").textContent = `${money(it.price)} × ${n} day${n > 1 ? "s" : ""}`;
    $("sumReturn").textContent = "Return by " + end.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    $("sumTotal").textContent = money(it.price * n);
  };
  $("dMinus").onclick = () => { days.value = clamp() - 1; update(); };
  $("dPlus").onclick = () => { days.value = clamp() + 1; update(); };
  days.addEventListener("input", update); days.addEventListener("change", update); $("rentStart").addEventListener("change", update);
  update();
  if ($("rentBtn")) $("rentBtn").onclick = async () => {
    const name = $("rentName") ? $("rentName").value.trim() : "";
    if ((!it.live || !it.owner_id) && $("rentName") && !name) { toast("Please enter your name first."); $("rentName").focus(); return; }
    const startValue = $("rentStart").value;
    if (!startValue || startValue < todayISO()) { toast("Choose today or a future start date."); $("rentStart").focus(); return; }
    const n = clamp();
    $("rentBtn").disabled = true; $("rentBtn").textContent = "Estimate calculated ✓";
    const m = $("rentMsg"); m.className = "note ok";
    if (it.live && it.owner_id) {
      if (!currentSession?.user?.id) { toast("Please sign in before sending a rental request."); openLogin("login"); $("rentBtn").disabled = false; $("rentBtn").textContent = "Send rental request"; return; }
      if (currentSession.user.id === it.owner_id) { toast("You cannot request your own listing."); $("rentBtn").disabled = false; $("rentBtn").textContent = "Send rental request"; return; }
      $("rentBtn").textContent = "Sending request…";
      const { error } = await sb.from("booking_requests").insert({ listing_id: it.id.replace("live-", ""), renter_id: currentSession.user.id, start_date: startValue, rental_days: n, message: $("rentMessage").value.trim() });
      if (error) { toast("Could not send request: " + error.message); $("rentBtn").disabled = false; $("rentBtn").textContent = "Send rental request"; return; }
      m.className = "note ok"; m.textContent = "Request sent. The owner must accept it before contact details are shared. Open your My Request to track it."; $("rentBtn").textContent = "Request sent ✓";
      return;
    }
    m.textContent = `Thanks, ${name}. Your estimated total for ${it.title} is ${money(it.price * n)} for ${n} day${n > 1 ? "s" : ""}. No booking has been sent.`;
  };
  document.title = it.title + " — " + cat.name + " | RentRelay";
  toTop();
}

/* ---------- Routing ---------- */
function show(view) {
  ["home", "catalog", "detail"].forEach(v => $(v).classList.toggle("hidden", v !== view));
}
function toTop() { if (!soft) window.scrollTo({ top: 0, behavior: "instant" }); }

function openHome(anchor) {
  show("home");
  document.title = "RentRelay — Campus rentals, made simple";
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

/* ---------- Sign up / log in (Supabase email OTP) ----------
   Sign up: mobile number → email → email confirmation link → account complete.
   Mobile is contact information only; it is never verified by SMS. */
let afterLogin = false, signupEmail = "", signupMobile = "", authFlow = "login", resendTimer = null, currentSession = null, welcomeShownFor = null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const AUTH_REDIRECT_URL = window.location.origin + window.location.pathname;
function cleanMobile(raw) {
  const v = String(raw).trim().replace(/[\s()-]/g, "");
  if (/^[6-9]\d{9}$/.test(v)) return "+91" + v;               // 10-digit Indian number
  if (/^\+[1-9]\d{7,14}$/.test(v)) return v;                   // already with country code
  return null;
}
function setAuthUI(session) {
  currentSession = session && session.user ? session : null;
  $("login").hidden = !!currentSession;
  if ($("signup")) $("signup").hidden = !!currentSession;
  $("logout").hidden = !currentSession;
  if ($("requestBox")) $("requestBox").hidden = !currentSession;
}
function needSupabase() {
  if (sb) return false;
  toast("Supabase setup pending — add project URL and anon key first.");
  return true;
}
function friendlyAuthError(err) {
  const m = String(err && err.message || "Something went wrong");
  if (/signups? not allowed|not found/i.test(m)) return "No account found with this email. Please sign up first.";
  if (/rate limit|too many|security purposes/i.test(m)) return "Too many tries. Please wait a minute and try again.";
  if (/expired|invalid/i.test(m)) return "That code is wrong or has expired. Check the latest email or request a new code.";
  return m;
}


function openCheckEmail(mode) {
  const heading = mode === "signup" ? "Confirm your email" : "Check your email";
  const message = mode === "signup"
    ? "We sent a confirmation link to your email. Open it to finish creating your RentRelay account."
    : "We sent a secure sign-in link to your email. Open it to log in to RentRelay.";
  openModal(`<span class="eyebrow">EMAIL SENT</span><h2>${heading}</h2>
    <p>${message}</p><p><b>${esc(signupEmail)}</b></p>
    <p class="note">Check your inbox and spam folder. The link can only be used once.</p>
    <button class="primary wide" id="resendLink" type="button">Resend email</button>
    <button class="back" id="changeEmail" type="button">← Use a different email</button>`);
  $("changeEmail").onclick = () => openLogin(mode);
  $("resendLink").onclick = async () => {
    if (needSupabase()) return;
    const btn = $("resendLink"); btn.disabled = true; btn.textContent = "Sending…";
    const options = { shouldCreateUser: mode === "signup", emailRedirectTo: AUTH_REDIRECT_URL };
    if (mode === "signup") options.data = { mobile: signupMobile, terms_accepted: true, terms_version: TERMS_VERSION };
    const { error } = await sb.auth.signInWithOtp({ email: signupEmail, options });
    if (error) { toast(friendlyAuthError(error)); btn.disabled = false; btn.textContent = "Resend email"; return; }
    toast("A new email link has been sent. Use the latest email.");
    btn.disabled = false; btn.textContent = "Resend email";
  };
}
function openLogin(step = "signup") {
  if (step === "signup") {
    openModal(`<span class="eyebrow">CREATE YOUR ACCOUNT</span><h2>Sign up to RentRelay</h2>
      <p>Enter your mobile number and email. We’ll send a confirmation link to your email.</p>
      <label>Name<input id="suName" autocomplete="name" maxlength="60" placeholder="Your full name"></label>
      <label>Mobile number<input id="suMobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="98765 43210" maxlength="16"></label>
      <label>Email address<input id="suEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" maxlength="120"></label>
      <label class="terms-consent"><input id="suTerms" type="checkbox"><span>I have read and agree to the <a href="terms.html" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a> and <a href="terms.html#privacy" target="_blank" rel="noopener noreferrer">Privacy Notice</a>.</span></label>
      <p class="terms-required" id="termsRequired" role="alert">You must accept the Terms &amp; Conditions and Privacy Notice to create an account.</p>
      <button class="primary wide" id="suGo" type="button">Accept &amp; send confirmation link</button>
      <button class="back" id="toLogin" type="button">Already have an account? Sign in</button>`);
    $("toLogin").onclick = () => openLogin("login");
    $("suGo").onclick = async () => {
      const name = $("suName").value.trim().replace(/\s+/g, " ");
      const mobile = cleanMobile($("suMobile").value), email = $("suEmail").value.trim().toLowerCase();
      if (!$("suTerms").checked) { $("termsRequired").classList.add("show"); $("suTerms").focus(); toast("Please accept the Terms & Conditions to continue."); return; }
      $("termsRequired").classList.remove("show");
      if (name.length < 2 || /[0-9]/.test(name)) { toast("Enter your name using letters."); return; }
      if (!mobile) { toast("Enter a valid mobile number (10 digits, or with country code like +91…)."); return; }
      if (!EMAIL_RE.test(email)) { toast("Enter a valid email address."); return; }
      if (needSupabase()) return;
      $("suGo").disabled = true; $("suGo").textContent = "Sending email…";
      const acceptedAt = new Date().toISOString();
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: AUTH_REDIRECT_URL, data: { full_name: name, mobile, terms_accepted: true, terms_version: TERMS_VERSION, terms_accepted_at: acceptedAt } } });
      if (error) { toast(friendlyAuthError(error)); $("suGo").disabled = false; $("suGo").textContent = "Accept & send confirmation link"; return; }
      signupEmail = email; signupMobile = mobile; authFlow = "signup"; openCheckEmail("signup");
    };
  } else if (step === "login") {
    openModal(`<span class="eyebrow">WELCOME BACK</span><h2>Log in</h2>
      <p>Enter your email and we’ll send you a secure sign-in link.</p>
      <label>Email<input id="liEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" maxlength="120"></label>
      <button class="primary wide" id="liGo" type="button">Send sign-in link</button>
      `);
    $("liGo").onclick = async () => {
      const email = $("liEmail").value.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) { toast("Enter a valid email address."); return; }
      if (needSupabase()) return;
      $("liGo").disabled = true; $("liGo").textContent = "Sending email…";
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: AUTH_REDIRECT_URL } });
      if (error) { toast(friendlyAuthError(error)); $("liGo").disabled = false; $("liGo").textContent = "Send sign-in link"; return; }
      signupEmail = email; authFlow = "login"; openCheckEmail("login");
    };
  } else if (step === "name") {
    openModal(`<span class="eyebrow">ONE LAST STEP</span><h2>Your full name</h2>
      <p>Enter your real full name as shown on your official ID. We do not need your Aadhaar or PAN number or a photo of the document.</p>
      <label>Full legal name<input id="suName" autocomplete="name" maxlength="60" placeholder="Enter your full name"></label>
      <button class="primary wide" id="finishSignup" type="button">Verify &amp; create account</button>
      <p class="note">Your mobile number is saved only so other students can contact you.</p>`);
    $("finishSignup").onclick = async () => {
      const name = $("suName").value.trim().replace(/\s+/g, " ");
      if (name.length < 2 || /[0-9]/.test(name)) { toast("Enter your full name using letters."); return; }
      $("finishSignup").disabled = true; $("finishSignup").textContent = "Creating account…";
      const { data, error } = await sb.auth.updateUser({ data: { full_name: name, mobile: signupMobile } });
      if (error) { toast(friendlyAuthError(error)); $("finishSignup").disabled = false; $("finishSignup").textContent = "Verify & create account"; return; }
      showWelcome(data.user);
    };
  } else if (step === "otp") {
    openModal(`<span class="eyebrow">VERIFY YOUR EMAIL</span><h2>Enter the code</h2>
      <p>We sent a code to <b>${esc(signupEmail)}</b>. It can take a minute. Check spam too.</p>
      <label>Verification code<input id="otp" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="Enter code"></label>
      <button class="primary wide" id="verifyOtp" type="button">Verify &amp; continue</button>
      <button class="back" id="resend" type="button">Resend code</button>
      <button class="back" id="changeEmail" type="button">← Use a different email</button>`);
    $("changeEmail").onclick = () => openLogin("signup");
    const rs = $("resend");
    const cooldown = () => { let s = 30; rs.disabled = true; clearInterval(resendTimer); resendTimer = setInterval(() => { s--; if (!$("resend")) { clearInterval(resendTimer); return; } if (s <= 0) { clearInterval(resendTimer); rs.disabled = false; rs.textContent = "Resend code"; } else rs.textContent = `Resend code in ${s}s`; }, 1000); rs.textContent = "Resend code in 30s"; };
    cooldown();
    rs.onclick = async () => {
      if (needSupabase()) return;
      const { error } = await sb.auth.signInWithOtp({ email: signupEmail, options: { shouldCreateUser: authFlow === "signup", data: authFlow === "signup" ? { mobile: signupMobile, terms_accepted: true, terms_version: TERMS_VERSION } : undefined } });
      if (error) { toast(friendlyAuthError(error)); return; }
      toast("A new code was sent."); cooldown();
    };
    $("verifyOtp").onclick = async () => {
      const token = $("otp").value.trim();
      if (!/^\d{6,10}$/.test(token)) { toast("Enter the code from your email (numbers only)."); return; }
      if (needSupabase()) return;
      $("verifyOtp").disabled = true; $("verifyOtp").textContent = "Verifying…";
      const { data, error } = await sb.auth.verifyOtp({ email: signupEmail, token, type: "email" });
      if (error || !data || !data.user) { toast(friendlyAuthError(error)); $("verifyOtp").disabled = false; $("verifyOtp").textContent = "Verify & continue"; return; }
      clearInterval(resendTimer);
      setAuthUI(data.session || true);
      showWelcome(data.user);
    };
  }
}

async function showWelcome(user) {
  let username = "", name = (user.user_metadata && user.user_metadata.full_name) || "";
  try {
    const { data } = await sb.from("profiles").select("username,full_name").eq("id", user.id).maybeSingle();
    if (data) { username = data.username || ""; name = data.full_name || name; }
  } catch (e) { /* profile may take a moment; the welcome still works */ }
  openModal(`<span class="eyebrow">YOU’RE IN</span><h2>Welcome${name ? ", " + esc(name) : ""}!</h2>
    <p>Your email is verified.${username ? " Here is your RentRelay username:" : ""}</p>
    ${username ? `<div class="username-box" id="uname">@${esc(username)}</div>` : ""}
    <button class="primary wide" id="welcomeGo" type="button">Continue</button>`);
  $("welcomeGo").onclick = () => { closeModal(); if (afterLogin) { afterLogin = false; listItem(); } };
}

$("login").onclick = () => openLogin("login");
if ($("signup")) $("signup").onclick = () => openLogin("signup");
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
  openModal('<span class="eyebrow">YOUR RENTRELAY</span><h2>Request box</h2><div id="bookingDashboard">Loading your requests…</div>');
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
    return `<article class="booking-card" data-booking="${esc(r.id)}"><b>${esc(l.title || "Campus item")}</b><p>${incoming ? "Incoming request" : "Your request"} · ${esc(r.start_date)} · ${r.rental_days} day(s)</p><p>Status: <b>${esc(r.status.toUpperCase())}</b></p>${r.message ? `<p>${esc(r.message)}</p>` : ""}${incoming && r.status === "pending" ? `<button class="primary" data-accept="${esc(r.id)}">Accept</button> <button class="secondary" data-decline="${esc(r.id)}">Decline</button>` : ""}${r.status === "accepted" ? `<button class="secondary" data-contact="${esc(r.id)}">Show contact numbers</button><div class="contact-details" id="contact-${esc(r.id)}"></div>` : ""}</article>`;
  }).join("");
  host.querySelectorAll("[data-accept],[data-decline]").forEach(btn => btn.onclick = async () => {
    const id = btn.dataset.accept || btn.dataset.decline, status = btn.dataset.accept ? "accepted" : "declined";
    btn.disabled = true;
    const { error: updateError } = await sb.from("booking_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    if (updateError) { toast("Could not update request: " + updateError.message); btn.disabled = false; return; }
    toast(status === "accepted" ? "Request accepted. Both participants can now view contact details." : "Request declined.");
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
if ($("requestBox")) $("requestBox").onclick = openRequestBox;

/* ---------- List an item ---------- */
function listItem() {
  renderListForm();
}
function renderListForm() {
  openModal(`<span class="eyebrow">SHARE WITH YOUR CAMPUS</span><h2>List an item</h2><p>Add clear details so another student can request a rental.</p>
    <label>Item name<input id="listingName" maxlength="80" placeholder="e.g. Scientific calculator"></label>
    <label>Category<select id="listingCategory">${CATS.map(c => `<option value="${esc(c.name)}">${esc(c.name)}</option>`).join("")}</select></label>
    <label>Subcategory<select id="listingSub"></select></label>
    <label>Price per day (₹)<input id="listingPrice" type="number" min="1" max="100000" placeholder="25"></label>
    <label>Condition<input id="listingCondition" maxlength="60" placeholder="Good condition"></label>
    <label>Item description<textarea id="listingDescription" rows="3" maxlength="500" placeholder="Describe the item, its features, size, included accessories and any existing marks"></textarea></label>
    <label>Address / pickup location<input id="listingAddress" maxlength="180" placeholder="Campus, hostel or pickup point"></label>
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
      photo = $("listingPhoto").files[0];
    if (!title || !subcategory || !condition || !description || !address || !photo || !Number.isInteger(price) || price < 1) { toast("Please complete all details, add a pickup location and upload an item photo."); return; }
    if (needSupabase()) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size > 5 * 1024 * 1024) { toast("Choose an image under 5 MB."); return; }
    $("saveListing").disabled = true; $("saveListing").textContent = "Uploading photo…";
    const ext = (photo.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const imagePath = `public/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await sb.storage.from("listing-images").upload(imagePath, photo, { contentType: photo.type, upsert: false });
    if (uploadError) { toast("Photo upload failed: " + uploadError.message); $("saveListing").disabled = false; $("saveListing").textContent = "Submit listing"; return; }
    const { data: publicImage } = sb.storage.from("listing-images").getPublicUrl(imagePath);
    $("saveListing").textContent = "Saving listing…";
    const { error } = await sb.from("listings").insert({ title, category, subcategory, price_per_day: price, condition, description, address, image_url: publicImage.publicUrl, owner_id: currentSession?.user?.id || null });
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
async function loadLive() {
  if (!sb) return;
  let rows, error;
  try { ({ data: rows, error } = await sb.from("listings").select("*").order("created_at", { ascending: false }).limit(200)); }
  catch (e) { console.error("RentRelay: unable to load listings", e); return; }
  if (error || !rows) { if (error) console.error("RentRelay: listings query failed", error); return; }
  for (let i = ITEMS.length - 1; i >= 0; i--) if (ITEMS[i].live) ITEMS.splice(i, 1);
  rows.forEach(r => {
    const cat = CATS.find(c => c.name === r.category);
    if (!cat) return;
    if (!cat.subs.some(s => s.name === r.subcategory)) cat.subs.push({ name: r.subcategory, emoji: cat.emoji });
    ITEMS.push({ id: "live-" + r.id, cat: cat.id, sub: r.subcategory, title: r.title, emoji: cat.emoji, price: Number(r.price_per_day) || 0, cond: r.condition, live: true,
      desc: r.description || "Community listing. Meet the lister to inspect the item before any rental.", address: r.address || "", image_url: r.image_url || "", created_at: r.created_at || "", owner_id: r.owner_id || null });
  });
  soft = true;
  try { renderHome(); route(); } finally { soft = false; }
}

/* ---------- Start ---------- */
window.addEventListener("error", event => { console.error("RentRelay runtime error:", event.error || event.message); });
renderHome();
route();
if (sb) {
  sb.auth.getSession().then(({ data }) => setAuthUI(data.session));
  sb.auth.onAuthStateChange((event, session) => {
    setAuthUI(session);
    if (event === "SIGNED_IN" && session?.user && welcomeShownFor !== session.user.id) {
      welcomeShownFor = session.user.id;
      showWelcome(session.user);
    }
  });
  loadLive();
}
