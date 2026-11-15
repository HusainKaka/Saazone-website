(() => {
  const wrap = document.querySelector(".ripple-wrap");
  const ripple = wrap.querySelector(".ripple");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const storageKey = "saazone-page-ripple";
  let leaving = false;
  let animation;

  function position(x, y) {
    wrap.style.setProperty("--ripple-x", x + "px");
    wrap.style.setProperty("--ripple-y", y + "px");
    const radius = Math.ceil(Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))) + 1;
    wrap.style.setProperty("--ripple-end", radius + "px");
    return `circle(${radius}px at ${x}px ${y}px)`;
  }

  function reset() {
    animation?.cancel();
    wrap.hidden = true;
    wrap.classList.remove("goripple", "ripple-arriving");
    leaving = false;
  }

  let arrival;
  try {
    arrival = JSON.parse(sessionStorage.getItem(storageKey));
    sessionStorage.removeItem(storageKey);
  } catch { /* Navigation remains available without storage. */ }
  if (!reduced.matches && arrival?.url === location.href && Date.now() - arrival.time < 6000) {
    const x = Math.max(0, Math.min(innerWidth, arrival.x * innerWidth));
    const y = Math.max(0, Math.min(innerHeight, arrival.y * innerHeight));
    position(x, y);
    wrap.classList.add("goripple", "ripple-arriving");
    wrap.hidden = false;
    ripple.addEventListener("animationend", reset, { once: true });
    setTimeout(() => { if (!leaving) reset(); }, 760);
  }

  document.addEventListener("click", event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || reduced.matches || !ripple.animate) return;
    const link = event.target.closest("a[href]");
    if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
    const destination = new URL(link.href);
    if (destination.origin !== location.origin || destination.pathname === location.pathname ||
        !/^\/(?:$|(?:collections|products)\/[a-z0-9-]+\/?$)/.test(destination.pathname)) return;
    event.preventDefault();
    if (leaving) return;
    reset();
    leaving = true;
    const bounds = link.getBoundingClientRect();
    const x = Math.max(0, Math.min(innerWidth, event.detail ? event.clientX : bounds.left + bounds.width / 2));
    const y = Math.max(0, Math.min(innerHeight, event.detail ? event.clientY : bounds.top + bounds.height / 2));
    const end = position(x, y);
    wrap.classList.add("goripple");
    wrap.hidden = false;
    animation = ripple.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: end }], {
      duration: 320, easing: "cubic-bezier(.4,0,.2,1)", fill: "both",
    });
    const navigate = () => {
      if (!leaving) return;
      try { sessionStorage.setItem(storageKey, JSON.stringify({
        url: destination.href, x: x / innerWidth, y: y / innerHeight, time: Date.now(),
      })); } catch { /* The link still opens. */ }
      location.assign(destination.href);
      setTimeout(reset, 3000);
    };
    animation.finished.then(navigate, navigate);
  });

  addEventListener("pageshow", event => { if (event.persisted) reset(); });
  reduced.addEventListener("change", event => { if (event.matches && !leaving) reset(); });
})();
