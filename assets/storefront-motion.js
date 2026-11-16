(() => {
  const { gsap, ScrollTrigger, SplitText, Lenis } = window;
  const main = document.querySelector("main");
  if (!gsap || !ScrollTrigger || !main) return;
  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  let media;
  function start() {
    media?.revert();
    media = gsap.matchMedia();
    media.add({
      phone: "(max-width: 767px)",
      desktop: "(min-width: 768px)",
      precisePointer: "(hover: hover) and (pointer: fine)",
      reduced: "(prefers-reduced-motion: reduce)",
    }, ({ conditions }) => {
      if (conditions.reduced) return;
      let lenis;
      if (Lenis && conditions.desktop && conditions.precisePointer) {
        lenis = new Lenis({
          autoRaf: true, lerp: .165, wheelMultiplier: 1.25,
          prevent: node => {
            const heroMotion = ScrollTrigger.getById("watch-assembly");
            return document.body.classList.contains("dialog-open")
              || Boolean(node.closest?.("dialog, .rail"))
              || Boolean(heroMotion && window.scrollY < heroMotion.end);
          },
        });
        lenis.on("scroll", ScrollTrigger.update);
      }
      const running = new Map();
      const pending = new Map();
      let restoreTitle;
      const finish = node => {
        running.get(node)?.progress(1);
        pending.get(node)?.kill();
        pending.delete(node);
      };
      const onFocus = event => {
        const focused = event.target;
        for (const node of [...pending.keys(), ...running.keys()]) {
          if (node.contains(focused) || focused.contains(node)) finish(node);
        }
      };
      const onHash = () => {
        const destination = document.getElementById(location.hash.slice(1));
        if (!destination) return;
        [...pending.keys(), ...running.keys()].forEach(node => {
          if (destination.contains(node) || node.contains(destination)) finish(node);
        });
      };
      function enter(node, index, intro = false) {
        if (node.contains(document.activeElement)) return;
        const art = !intro && node.matches("figure, .product-photo, .life-art");
        const copy = !intro && node.matches(".section-head");
        const text = !intro && (copy || node.parentElement.matches(".section-head") || node.matches(".story-copy, .movement-grid > div"))
          ? (copy ? node.firstElementChild : node)?.querySelectorAll(":scope > :is(h2, p)")
          : null;
        const delay = Math.min(index, 3) * .055;
        const done = {
          delay,
          overwrite: "auto",
          onComplete: () => running.delete(node),
        };
        // Editorial images reveal upward. Copy follows with a shorter lift.
        const tween = art
          ? gsap.fromTo(node, { clipPath: "inset(86% 0% 0% 0%)" }, {
              ...done,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: conditions.phone ? .5 : .68,
              ease: "power2.inOut",
              clearProps: "clipPath",
            })
          : gsap.fromTo(text?.length ? text : node, {
              opacity: intro ? .65 : .46,
              y: intro ? 12 : 14,
            }, {
              ...done,
              opacity: 1,
              y: 0,
              duration: intro ? .4 : .48,
              delay: delay + (text?.length ? .1 : 0),
              stagger: text?.length > 1 ? .06 : 0,
              ease: "power2.out",
              clearProps: "opacity,transform",
            });
        running.set(node, tween);
      }
      const revealContext = gsap.context(self => {
        self.add("enter", enter);
        if (!location.hash && window.scrollY < 10) {
          const heading = main.querySelector(".hero:not(.assembly-hero) .hero-title, .category-layout h1, .detail h1");
          main.querySelectorAll("[data-hero-reveal]").forEach((node, i) => {
            if (!heading || !node.contains(heading)) self.enter(node, i, true);
          });
          if (SplitText && heading) {
            const split = SplitText.create(heading, { type: "lines,words", mask: "lines", aria: "auto" });
            const tween = gsap.fromTo(split.words, { yPercent: 72, opacity: .35 }, {
              yPercent: 0, opacity: 1, duration: conditions.phone ? .45 : .60, stagger: .04,
              ease: "power3.out", onComplete: () => split.revert(),
            });
            restoreTitle = () => { tween.kill(); split.revert(); };
          } else {
            if (heading) self.enter(heading, 0, true);
          }
        }
        const candidates = Array.from(document.querySelectorAll("[data-reveal]")).filter(node =>
          !node.closest(".assembly-hero") && !node.parentElement.closest("[data-reveal]")
            && node.getBoundingClientRect().top >= innerHeight);
        if (!candidates.length) return;
        const triggers = ScrollTrigger.batch(candidates, {
          start: "top 97%",
          once: true,
          interval: .055,
          batchMax: conditions.phone ? 2 : 4,
          onEnter: (nodes, entries) => nodes.forEach((node, index) => {
            if (!pending.has(node)) return;
            pending.delete(node);
            // Skip entrances crossed by a scrollbar jump or a deep link.
            if (entries[index].progress < 1 && node.getBoundingClientRect().bottom > 0) self.enter(node, index);
          }),
        });
        for (const trigger of triggers) {
          pending.set(trigger.trigger, trigger);
        }
      }, document.body);
      document.addEventListener("focusin", onFocus);
      window.addEventListener("hashchange", onHash);
      onHash();
      return () => {
        pending.clear();
        lenis?.destroy();
        restoreTitle?.();
        revealContext.revert();
        document.removeEventListener("focusin", onFocus);
        window.removeEventListener("hashchange", onHash);
      };
    });
  }
  start();
  window.addEventListener("pagehide", () => media?.revert());
  window.addEventListener("pageshow", event => { if (event.persisted) start(); });
})();
