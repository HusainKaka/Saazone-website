"use strict";

const main = document.querySelector("#main");
const drawer = document.querySelector("#drawer");
const drawerBody = document.querySelector("#drawer-body");
const status = document.querySelector("#status");
const shop = "https://www.saazone.com";
const maps = "https://maps.app.goo.gl/3zmDDSfoS9MnmZqc6";
const contact = "https://wa.me/254706402296";
const money = new Intl.NumberFormat("en-KE");
const byId = new Map(products.map(product => [product.id, product]));
const mobile = matchMedia("(max-width: 767px)");
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const icons = {
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
  bag: '<path d="M5 8h14l1 12H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>',
  heart: '<path d="M20.5 8.8c0 4.2-8.5 9.7-8.5 9.7s-8.5-5.5-8.5-9.7a4.3 4.3 0 0 1 8.5-.8 4.3 4.3 0 0 1 8.5.8Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  truck: '<path d="M3 6h11v10H3zm11 4h4l3 3v3h-7"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  shield: '<path d="M12 3 5 6v5c0 4 3 7 7 10 4-3 7-6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
  pin: '<path d="M19 10c0 4-7 10-7 10S5 14 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  watch: '<path d="m8 7 1-4h6l1 4m-8 10 1 4h6l1-4"/><circle cx="12" cy="12" r="6"/><path d="M12 9v3l2 1"/>',
  pause: '<path d="M9 5v14m6-14v14"/>',
  play: '<path d="m8 5 12 7-12 7V5Z"/>',
  down: '<path d="M12 4v15m-6-6 6 6 6-6"/>',
};

function icon(name) {
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
}
document.querySelectorAll("[data-icon]").forEach(node => { node.innerHTML = icon(node.dataset.icon); });

function safe(value) {
  return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function readStorage(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function saveStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { /* The in-page state still works without local storage. */ }
}
const storedFavorites = readStorage("saazone-favorites", []);
const favorites = new Set(Array.isArray(storedFavorites) ? storedFavorites.filter(id => byId.has(id)) : []);
const bag = new Map(Object.entries(readStorage("saazone-bag", {}) || {}).filter(([id, quantity]) =>
  byId.has(id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99
));

const productUrl = product => `/products/${product.id}`;
const collectionUrl = collection => `/collections/${collection.id}`;
const price = amount => `KSh ${money.format(amount)}`;
const art = "/assets/editorial/";
const productImage = (product, eager = false, decorative = false) =>
  `<img src="${art}products/${product.id}.webp" alt="${decorative ? "" : safe(product.name)}" width="720" height="720" loading="eager" ${eager ? 'fetchpriority="high"' : ''} decoding="async">`;
function editorial(name, alt, { responsive = false, priority = false, width = 1200, height = 800, version = "" } = {}) {
  const source = responsive ? `<source media="(max-width: 767px)" srcset="${art}${name}-mobile${version}.webp">` : "";
  const file = responsive ? name + "-desktop" + version : name;
  const image = `<img src="${art}${file}.webp" alt="${safe(alt)}" width="${width}" height="${height}" loading="eager" ${priority ? 'fetchpriority="high"' : ''} decoding="async">`;
  return responsive ? `<picture>${source}${image}</picture>` : image;
}
const collectionArt = ["men", "ladies", "titan-men", "titan-ladies", "titan-edge", "casio", "orient", "clocks"];
const collectionImage = (collection, priority = false) => editorial("tile-" + collectionArt[collections.indexOf(collection)] + "-palette", "", { priority, width: 800, height: 800 });
const arrow = icon("arrow");
const links = (label, url, css = "text-link") => `<a class="${css}" href="${url}">${label} ${arrow}</a>`;

function productCard(product, revealPhoto = false) {
  return `<article class="product-card">
    <a class="product-photo" href="${productUrl(product)}"${revealPhoto ? " data-reveal" : ""}>${productImage(product)}</a>
    <div class="product-info"><p class="eyebrow">${safe(product.brand)}</p>
      <h3><a href="${productUrl(product)}">${safe(product.name)}</a></h3>
      <p class="price">${price(product.price)}</p>
      <div class="product-actions"><button class="button" data-add="${product.id}">Add to bag</button>
      <button type="button" class="icon-button favorite" data-favorite="${product.id}" aria-label="Save ${safe(product.name)}" aria-pressed="${favorites.has(product.id)}">${icon("heart")}</button></div>
    </div></article>`;
}

function collectionCard(collection) {
  return `<a class="collection-card" href="${collectionUrl(collection)}">
    <div class="collection-image">${collectionImage(collection)}</div>
    <div class="collection-caption"><h3>${collection.name}</h3><span>Discover ${arrow}</span></div></a>`;
}

function controls(label, auto = false) {
  return `<div class="rail-controls">
    ${auto ? `<button type="button" class="icon-button rail-toggle" data-rail-toggle aria-label="Pause ${label} rotation">${icon("pause")}</button>` : ""}
    <button type="button" class="icon-button" data-direction="-1" aria-label="Previous ${label}">${icon("back")}</button>
    <button type="button" class="icon-button" data-direction="1" aria-label="Next ${label}">${arrow}</button>
  </div>`;
}

function rail({ id, title, eyebrow, description, content, label, auto = false, inverse = false }) {
  return `<section id="${id}" class="band ${inverse ? "dark" : ""}" data-carousel="${label}" ${auto ? "data-auto" : ""}>
    <div class="shell"><div class="section-head"><div data-reveal>${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ""}<h2>${title}</h2>
    ${description ? `<p class="section-description">${description}</p>` : ""}</div>${controls(label, auto)}</div>
    <div class="rail" aria-label="${title}" tabindex="0">${content}</div></div></section>`;
}

function hero() {
  return `<section class="hero assembly-hero" aria-labelledby="hero-title">
    <div class="hero-scene"><div class="hero-media assembly-media">
      <picture>
        <source media="(min-width:1024px) and (orientation:landscape) and (pointer:fine)" srcset="/assets/assembly/brown-portrait/hero-desktop-detail.webp" width="1260" height="2240">
        <img id="assembly-poster" src="/assets/assembly/brown-portrait/hero-poster.webp" alt="A gold-tone watch with a chocolate leather strap assembling against a brown background" width="1080" height="1920" loading="eager" fetchpriority="high">
      </picture>
    </div></div>
    <div class="shell hero-shell"><div class="hero-copy">
      <p class="eyebrow">TIMEPIECES IN KENYA</p>
      <h1 class="hero-title" id="hero-title">More Than <em>a Watch.</em></h1>
      <div class="hero-actions">
        ${links("Explore collections", "#collections", "button primary")}
      </div>
    </div></div>
  </section>`;
}

function home() {
  const featured = ["orient-blue", "ltp-v004gl-9a", "titan-squircle", "casio-vintage"].map(id => byId.get(id));
  main.innerHTML = `${hero()}
    <section class="promises" aria-label="Shopping with SaaZone"><div class="shell promise-grid" data-reveal>
    ${[
      ["truck", "Free delivery", "Anywhere in Kenya"],
      ["shield", "Genuine timepieces", "Casio, Titan, Orient and more"],
      ["pin", "Nairobi showroom", "Our Mall, Magadi Road"],
      ["watch", "Battery replacement", "Care for your timepiece"],
    ].map(([symbol, title, detail]) => `<div class="promise"><span>${icon(symbol)}</span><div><strong>${title}</strong><p>${detail}</p></div></div>`).join("")}
    </div></section>
    ${rail({ id: "collections", title: "Explore our collections", description: "From everyday classics to distinctive dress watches.", content: collections.map(collectionCard).join(""), label: "collections", auto: true })}
    <section class="story" id="our-story">
      <figure class="story-photo" data-reveal>${editorial("story-palette", "Close-up of a blue-dial Orient watch")}</figure>
      <div class="story-copy" data-reveal><p class="eyebrow">OUR STORY</p><h2>It started with a <em>birthday watch.</em></h2>
      <p>SaaZone founder Alanwar was six when his parents gave him his first watch. Years later, a square-dial Casio Edifice rekindled that feeling and inspired him to bring genuine timepieces to Kenya.</p>
      ${links("Discover our story", shop + "/pages/about-us", "button primary")}</div>
    </section>
    <section class="band" id="featured"><div class="shell"><div class="section-head"><div data-reveal><h2>Featured timepieces</h2></div>
    ${links("Shop the collections", "#collections")}</div><div class="product-grid">${featured.map(product => productCard(product, true)).join("")}</div></div></section>
    <section class="movement"><div class="shell movement-grid"><div data-reveal><p class="eyebrow">A CLOSER LOOK</p><h2>The details make the <em>difference.</em></h2>
    <p>Get to know the dial, the case and the way a bracelet sits on your wrist. Try a timepiece in person at our Nairobi showroom.</p>
    ${links("Visit the showroom", maps, "button")}</div><figure data-reveal>${editorial("movement-dress", "Exploded view of a gold-tone dress watch with a cream dial, leather strap and exposed movement")}</figure></div></section>
    <section class="band why"><div class="shell"><div class="section-head" data-reveal><div><h2>Why SaaZone</h2></div></div>
      <div class="why-grid"><article><h3>Try it on in Nairobi</h3><p>Compare sizes, dials and straps at Our Mall on Magadi Road.</p></article>
      <article><h3>Find a watch that suits you</h3><p>Ask the SaaZone team about fit, everyday wear or choosing a gift.</p></article>
      <article><h3>Keep your watch running</h3><p>Contact SaaZone for battery replacement and after-sales support.</p></article></div>
    </div></section>
    <section class="lifestyle" aria-label="Shop by style">
      ${lifestylePanel("him", "For him", "Shop men’s watches", "/collections/entire-men-collection")}
      ${lifestylePanel("her", "For her", "Shop ladies’ watches", "/collections/entire-ladies-collection")}
    </section>
    <section class="band reviews"><div class="shell"><div class="section-head" data-reveal><div><h2>Hear from SaaZone customers</h2></div></div>
    <div class="review-links"><article><h3>Google Maps reviews</h3><p>See what customers say about their visits and purchases.</p>${links("Read on Google Maps", maps)}</article>
    <article><h3>Customer feedback at SaaZone</h3><p>Browse customer messages shared by the store.</p>${links("Read customer feedback", shop + "/pages/reviews")}</article></div></div></section>`;
}

function lifestylePanel(person, title, action, url) {
  const alt = person === "him" ? "Man wearing a steel wristwatch" : "Woman wearing a gold-toned wristwatch";
  return `<a class="life-panel" href="${url}"><div class="life-art" data-reveal>${editorial("life-" + person, alt, { responsive: true, version: "-palette" })}</div>
    <div class="life-caption"><div><strong>${title}</strong><span>${action} ${arrow}</span></div></div></a>`;
}

function collectionPage(collection) {
  document.title = `${collection.name} | SaaZone Kenya`;
  const cover = byId.get(collection.cover);
  const matches = products.filter(product => product.collections.includes(collection.id));
  const featured = [...matches].sort((a, b) => Number(b.id === cover.id) - Number(a.id === cover.id)).slice(0, 8);
  const person = collection.id === men ? "him" : collection.id === ladies ? "her" : "";
  main.innerHTML = `<section class="category-hero${person ? " category-hero-portrait" : ""}">
    <figure class="category-art">${person ? editorial("life-" + person, `Editorial wristwatch portrait for ${collection.name}`, { responsive: true, priority: true, version: "-palette" }) : collectionImage(collection, true)}</figure>
    <div class="shell category-layout"><div><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span> / </span><a href="/#collections">Collections</a></nav>
    <h1>${collection.name}</h1><p>${collection.description}</p>${links(collection.id === "casio-alarm-clocks" ? "Browse alarm clocks" : "Browse watches", "#collection-products", "button primary")}</div></div>
    </section>
    ${rail({ id: "related", title: "Explore other collections", content: collections.filter(other => other !== collection).map(collectionCard).join(""), label: "related collections" })}
    ${rail({ id: "collection-featured", title: "Featured in this collection", content: featured.map(product => productCard(product)).join(""), label: "featured products", inverse: true })}
    <section class="band" id="collection-products"><div class="shell"><div class="section-head" data-reveal><div><h2>${collection.name}</h2><p class="section-description">${matches.length} ${matches.length === 1 ? "timepiece" : "timepieces"}</p></div></div>
    <div class="product-grid">${matches.map(product => productCard(product, true)).join("")}</div>
    </div></section>`;
}

function detailPage(product) {
  document.title = `${product.name} | SaaZone Kenya`;
  const collection = collections.find(item => product.collections.includes(item.id));
  const message = encodeURIComponent(`Hi SaaZone! I'd like to ask about ${product.name} (${price(product.price)}). Is it available?`);
  const clock = product.id === "clock-analog";
  const related = products.filter(item => item.id !== product.id && item.collections.includes(collection.id)).slice(0, 4);
  main.innerHTML = `<section class="detail detail-catalog">
    <div class="shell"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span> / </span><a href="${collectionUrl(collection)}">${collection.name}</a></nav>
    <div class="detail-grid"><figure class="detail-art ${clock ? "detail-clock" : ""}" data-hero-reveal>
      <img class="detail-prop" src="${art}${clock ? "detail-clock" : "detail-ring"}.webp" alt="" width="780" height="780" decoding="async">
      ${productImage(product, true)}
    </figure>
    <div class="detail-copy"><div data-hero-reveal><p class="eyebrow">${safe(product.brand)} · ${safe(product.model)}</p><h1>${safe(product.title)}</h1>
      <p class="detail-price">${price(product.price)}</p><p>${safe(product.description)}</p></div>
      <div class="detail-actions"><label for="quantity">Quantity<input id="quantity" type="number" value="1" min="1" max="99" inputmode="numeric" required></label>
      <button class="button primary" data-add="${product.id}" data-use-quantity>Add to bag ${arrow}</button>
      <button type="button" class="icon-button favorite" data-favorite="${product.id}" aria-label="Save ${safe(product.name)}" aria-pressed="${favorites.has(product.id)}">${icon("heart")}</button></div>
      ${links("Enquire on WhatsApp", contact + "?text=" + message, "button outline")}
    </div></div></div></section>
    ${related.length ? `<section class="band"><div class="shell"><div class="section-head" data-reveal><div><h2>More from ${collection.name}</h2></div></div><div class="product-grid">${related.map(product => productCard(product, true)).join("")}</div></div></section>` : ""}`;
}

function footer() {
  document.querySelector("#footer").innerHTML = `<div class="shell footer-grid">
    <div><a class="wordmark" href="/" aria-label="SaaZone Kenya home"><img src="/assets/saazone-white.svg" width="226" height="48" alt=""></a><p>Genuine timepieces in Kenya.</p></div>
    <div data-reveal><h2>Shop</h2><a href="/#collections">All collections</a><a href="/collections/entire-men-collection">Men's watches</a><a href="/collections/entire-ladies-collection">Ladies' watches</a><a href="/#featured">Featured watches</a></div>
    <div data-reveal><h2>About</h2><a href="/#our-story">Our story</a><a href="${shop}/pages/reviews">Customer reviews</a><a href="${shop}/pages/contact-us">Contact and location</a><a href="${shop}/policies/refund-policy">Returns policy</a></div>
    <div data-reveal><h2>Visit SaaZone</h2><p>Our Mall, Magadi Road<br>Nairobi, Kenya</p><a href="tel:+254706402296">+254 706 402 296</a><a href="${maps}">Get directions ${arrow}</a></div></div>
    <div class="shell footer-bottom"><span>© SaaZone Kenya</span><span class="footer-credit">Powered by <a href="https://husainitechsolutions.com/">Husaini Tech Solutions</a></span></div>`;
}

const [, page, slug] = location.pathname.split("/");
const currentCollection = collections.find(collection => collection.id === slug);
if (!page) home();
else if (page === "collections" && currentCollection) collectionPage(currentCollection);
else if (page === "products" && byId.has(slug)) detailPage(byId.get(slug));
else main.innerHTML = `<section class="band shell"><h1>Page unavailable</h1>${links("Back to the collections", "/#collections", "button")}</section>`;
footer();
document.querySelector(`[data-nav="${currentCollection?.id ?? (!page ? "home" : "none")}"]`)?.setAttribute("aria-current", "page");
if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());

function setupRails() {
  document.querySelectorAll("[data-carousel]").forEach(section => {
    const track = section.querySelector(".rail");
    const toggle = section.querySelector("[data-rail-toggle]");
    const steps = [...section.querySelectorAll("[data-direction]")];
    let paused = reduced.matches;
    const setToggle = () => {
      if (!toggle) return;
      toggle.innerHTML = icon(paused ? "play" : "pause");
      toggle.setAttribute("aria-label", `${paused ? "Resume" : "Pause"} ${section.dataset.carousel} rotation`);
      toggle.setAttribute("aria-pressed", String(paused));
    };
    const updateSteps = () => {
      const fits = track.scrollWidth <= track.clientWidth + 2;
      steps.forEach(button => { button.disabled = fits; });
      if (toggle) toggle.disabled = fits;
    };
    const move = direction => {
      const max = track.scrollWidth - track.clientWidth;
      if (max < 2) return;
      const styles = getComputedStyle(track);
      const width = track.firstElementChild.getBoundingClientRect().width + parseFloat(styles.columnGap || 0);
      const position = track.scrollLeft;
      const next = direction > 0 && position >= max - 2 ? 0
        : direction < 0 && position <= 2 ? max : position + direction * width;
      track.scrollTo({ left: next, behavior: reduced.matches ? "instant" : "smooth" });
    };
    steps.forEach(button => button.addEventListener("click", () => move(Number(button.dataset.direction))));
    new ResizeObserver(updateSteps).observe(track);
    if (!toggle) return;
    setToggle();
    toggle.addEventListener("click", () => { paused = !paused; setToggle(); });
    reduced.addEventListener("change", event => { paused = event.matches; setToggle(); });
    let visible = false;
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .25 }).observe(section);
    setInterval(() => {
      if (!paused && visible && !document.hidden && !section.matches(":hover, :focus-within")) move(1);
    }, 120000);
  });
}
setupRails();

let activePanel;
let panelOpener;
const menuLinks = [
  ["Home", "/"], ["All collections", "/#collections"], ["Men's watches", "/collections/entire-men-collection"],
  ["Ladies' watches", "/collections/entire-ladies-collection"], ["Our story", "/#our-story"], ["Visit the showroom", maps],
];

function miniProduct(product, after = "") {
  return `<li class="mini-product"><a href="${productUrl(product)}">${productImage(product, false, true)}
    <span>${safe(product.name)}<small>${price(product.price)}</small></span></a>${after}</li>`;
}
function searchResults(query) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = terms.length ? products.filter(product => terms.every(term =>
    `${product.name} ${product.model} ${product.brand}`.toLowerCase().includes(term)
  )) : [];
  return `<p class="panel-note" role="status">${terms.length ? `${matches.length} ${matches.length === 1 ? "result" : "results"}` : "Search by brand or model."}</p>
    <ul class="mini-list">${matches.map(product => miniProduct(product)).join("")}</ul>`;
}
function renderPanel() {
  document.querySelector("#drawer-title").textContent = { menu: "Menu", search: "Search", bag: "Shopping bag", favorites: "Favorites" }[activePanel];
  if (activePanel === "menu") {
    drawerBody.innerHTML = `<nav class="drawer-nav" aria-label="Mobile navigation">${menuLinks.map(([label, url]) => links(label, url)).join("")}
      <button type="button" data-panel="favorites" class="button outline">${icon("heart")} Favorites</button></nav>`;
  } else if (activePanel === "search") {
    drawerBody.innerHTML = `<label for="search-input">Search watches and clocks</label><input id="search-input" type="search" placeholder="Try Casio or Titan Edge" autocomplete="off"><div id="search-results">${searchResults("")}</div>`;
  } else if (activePanel === "favorites") {
    drawerBody.innerHTML = favorites.size ? `<ul class="mini-list">${[...favorites].map(id => miniProduct(byId.get(id),
      `<button class="small-action" data-favorite="${id}" aria-label="Remove ${safe(byId.get(id).name)} from favorites">Remove</button>`)).join("")}</ul>`
      : '<p class="panel-note">No favorites yet. Use the heart beside a timepiece to save it here.</p>';
  } else {
    const total = [...bag].reduce((sum, [id, quantity]) => sum + byId.get(id).price * quantity, 0);
    drawerBody.innerHTML = bag.size ? `<ul class="mini-list">${[...bag].map(([id, quantity]) => miniProduct(byId.get(id),
      `<div class="line-actions"><label>Qty <input data-bag-quantity="${id}" aria-label="Quantity for ${safe(byId.get(id).name)}" type="number" min="1" max="99" value="${quantity}"></label><button class="small-action" data-remove="${id}" aria-label="Remove ${safe(byId.get(id).name)} from bag">Remove</button></div>`)).join("")}</ul>
      <p class="bag-total" aria-live="polite"><strong>Subtotal</strong><strong>${price(total)}</strong></p><button class="button" type="button" data-close>Continue shopping</button>`
      : '<p class="panel-note">Your shopping bag is empty.</p><a href="/#collections" class="button">Browse collections</a>';
  }
}
function openPanel(panel, opener) {
  if (!drawer.open) panelOpener = opener;
  activePanel = panel;
  renderPanel();
  if (!drawer.open) drawer.showModal();
  document.body.classList.add("dialog-open");
  (drawer.querySelector("#search-input") || drawer.querySelector("[data-close]")).focus();
}
drawer.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  panelOpener?.focus({ preventScroll: true });
});
drawer.addEventListener("click", event => {
  if (event.target === drawer && (event.clientX < drawer.getBoundingClientRect().left)) drawer.close();
  if (event.target.closest("a")) drawer.close();
});
drawer.addEventListener("input", event => {
  if (event.target.id === "search-input") document.querySelector("#search-results").innerHTML = searchResults(event.target.value);
});

function updateBag() {
  const count = [...bag.values()].reduce((sum, quantity) => sum + quantity, 0);
  document.querySelector("#bag-count").textContent = count;
  document.querySelector(".bag").setAttribute("aria-label", `Shopping bag, ${count} items`);
  saveStorage("saazone-bag", Object.fromEntries(bag));
}
updateBag();
function announce(message) {
  status.textContent = message;
  clearTimeout(announce.timer);
  announce.timer = setTimeout(() => { status.textContent = ""; }, 3800);
}

document.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;
  const { panel, add, favorite, remove } = button.dataset;
  if (panel) openPanel(panel, button);
  else if (button.hasAttribute("data-close")) drawer.close();
  else if (add) {
    const field = button.hasAttribute("data-use-quantity") ? document.querySelector("#quantity") : null;
    if (field && !field.reportValidity()) return;
    bag.set(add, Math.min(99, (bag.get(add) || 0) + (field?.valueAsNumber || 1)));
    updateBag();
    openPanel("bag", button);
  } else if (favorite) {
    const selected = !favorites.has(favorite);
    if (selected) favorites.add(favorite);
    else favorites.delete(favorite);
    saveStorage("saazone-favorites", [...favorites]);
    document.querySelectorAll(`.favorite[data-favorite="${favorite}"]`).forEach(item => item.setAttribute("aria-pressed", String(selected)));
    if (drawer.open) { renderPanel(); (drawerBody.querySelector(".small-action") || drawer.querySelector("[data-close]")).focus(); }
    announce(selected ? "Saved to favorites." : "Removed from favorites.");
  } else if (remove) {
    bag.delete(remove);
    updateBag();
    renderPanel();
    (drawerBody.querySelector(".small-action") || drawer.querySelector("[data-close]")).focus();
  }
});
drawer.addEventListener("change", event => {
  const id = event.target.dataset.bagQuantity;
  if (!id) return;
  const value = event.target.valueAsNumber;
  if (!Number.isInteger(value) || value < 1 || value > 99) {
    event.target.value = bag.get(id);
    return;
  }
  bag.set(id, value);
  updateBag();
  const total = [...bag].reduce((sum, [product, quantity]) => sum + byId.get(product).price * quantity, 0);
  drawer.querySelector(".bag-total strong:last-child").textContent = price(total);
});
mobile.addEventListener("change", event => {
  if (!event.matches && drawer.open && activePanel === "menu") drawer.close();
});
