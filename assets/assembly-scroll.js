(() => {
  const hero = document.querySelector(".assembly-hero");
  const { gsap, ScrollTrigger } = window;
  if (!hero || !gsap || !ScrollTrigger || navigator.connection?.saveData) return;

  const canvas = document.querySelector("#assembly-canvas");
  const poster = document.querySelector("#assembly-poster");
  const hint = hero.querySelector(".assembly-hint");
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return;

  const media = gsap.matchMedia();
  function enable() {
    media.add({
      motion: "(prefers-reduced-motion: no-preference) and (min-height: 320px)",
      portrait: "(orientation: portrait)",
      touch: "(pointer: coarse)",
    }, ({ conditions }) => {
      if (!conditions.motion) return;
      const base = "/assets/assembly/brown-portrait";
      const session = new AbortController();
      const cache = new Map();
      const pending = new Map();
      const failed = new Set();
      let trigger;
      let target = 0;
      let count = 0;
      let shown = -1;
      let direction = 1;
      let video;
      let requestedTime = 0;
      let readyToSeek;
      const touch = conditions.touch;
      const playhead = { progress: 0 };
      let scrub;

      function draw(index) {
        if (shown === index || (index !== 0 && !cache.has(index))) return;
        if (index !== 0) context.drawImage(cache.get(index), 0, 0, canvas.width, canvas.height);
        shown = index;
        canvas.dataset.frame = index;
        canvas.hidden = index === 0;
        poster.classList.toggle("assembly-poster-covered", index !== 0);
      }

      async function load(index) {
        const controller = new AbortController();
        pending.set(index, controller);
        try {
          const response = await fetch(`${base}/frame-${String(index).padStart(3, "0")}.webp`, { signal: controller.signal });
          if (!response.ok) throw new Error("Watch frame unavailable");
          const bitmap = await createImageBitmap(await response.blob());
          if (controller.signal.aborted || session.signal.aborted) { bitmap.close(); return; }
          cache.set(index, bitmap);
          if (index === target) draw(index);
          if (cache.size > 18) {
            const far = [...cache.keys()].sort((a, b) => Math.abs(b - target) - Math.abs(a - target))[0];
            cache.get(far).close();
            cache.delete(far);
          }
        } catch {
          if (!controller.signal.aborted) failed.add(index);
        } finally {
          if (pending.get(index) === controller) pending.delete(index);
          queue();
        }
      }

      function queue() {
        if (!count || target === 0 || session.signal.aborted) return;
        const priorities = [target, target + direction, target + 2 * direction,
          target - direction, target + 3 * direction, target + 4 * direction, target - 2 * direction];
        for (const index of priorities) {
          if (pending.size >= 3) break;
          if (index > 0 && index < count && !cache.has(index) && !pending.has(index) && !failed.has(index)) load(index);
        }
      }

      function seek(progress) {
        const beat = gsap.utils.clamp(0, 1, (progress - .035) / .89);
        const next = Math.round(beat * (count - 1));
        if (next !== target) direction = Math.sign(next - target);
        target = next;
        for (const [index, controller] of pending) {
          if (Math.abs(index - target) > 5) {
            controller.abort();
            pending.delete(index);
          }
        }
        draw(target);
        if (target !== 0 && !cache.has(target)) {
          const nearest = [...cache.keys()].sort((a, b) => Math.abs(a - target) - Math.abs(b - target))[0];
          if (nearest !== undefined && (shown < 0 || Math.abs(nearest - target) < Math.abs(shown - target))) draw(nearest);
        }
        queue();
      }

      (async () => {
        try {
          let sequence;
          if (touch) {
            video = document.createElement("video");
            video.className = "assembly-touch-video";
            video.muted = true;
            video.playsInline = true;
            video.preload = "auto";
            video.hidden = true;
            video.setAttribute("aria-hidden", "true");
            poster.after(video);
            await new Promise((resolve, reject) => {
              video.addEventListener("loadeddata", resolve, { once: true, signal: session.signal });
              video.addEventListener("error", reject, { once: true, signal: session.signal });
              session.signal.addEventListener("abort", reject, { once: true });
              video.src = `${base}/touch.mp4`;
            });
            sequence = { count: 190, width: 720, height: 1280 };
          } else {
            if (!window.createImageBitmap) return;
            const response = await fetch(`${base}/manifest.json`, { signal: session.signal });
            if (!response.ok) return;
            sequence = await response.json();
          }
          if (![sequence.count, sequence.width, sequence.height].every(value => Number.isInteger(value) && value > 1) || session.signal.aborted) return;
          await poster.decode();
          if (session.signal.aborted) return;
          canvas.width = sequence.width;
          canvas.height = sequence.height;
          count = sequence.count;
          // Avoid inserting a pin above someone who has already started browsing.
          if (touch && (window.scrollY > 8 || location.hash)) {
            video.remove();
            video.removeAttribute("src");
            video.load();
            return;
          }
          draw(0);
          hint.hidden = false;
          if (touch) {
            readyToSeek = () => {
              if (video.seeking || Math.abs(video.currentTime - requestedTime) < 1 / 48) return;
              video.currentTime = requestedTime;
            };
            video.addEventListener("seeked", () => {
              video.hidden = false;
              poster.classList.add("assembly-poster-covered");
              readyToSeek();
            }, { signal: session.signal });
            scrub = gsap.to(playhead, {
              progress: 1, duration: 1, ease: "none", paused: true,
              onUpdate: () => {
                requestedTime = Math.round(playhead.progress * (count - 1)) / 24;
                readyToSeek();
              },
            });
          }
          trigger = ScrollTrigger.create({
            id: "watch-assembly", trigger: hero, pin: true, pinSpacing: true,
            ...(touch ? { animation: scrub, scrub: 0.18 } : {
              onUpdate: self => seek(self.progress),
              onRefresh: self => seek(self.progress),
            }),
            refreshPriority: 1,
            start: () => `top ${document.querySelector(".header").offsetHeight}px`,
            end: () => `+=${Math.round(innerHeight * (conditions.portrait ? 1.8 : 2.3))}`,
          });
          ScrollTrigger.sort();
          ScrollTrigger.refresh();
          if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
        } catch {
          session.abort();
          video?.remove();
        }
      })();

      return () => {
        session.abort();
        for (const controller of pending.values()) controller.abort();
        for (const frame of cache.values()) frame.close();
        trigger?.kill();
        scrub?.kill();
        if (video) {
          video.removeAttribute("src");
          video.load();
          video.remove();
        }
        hint.hidden = true;
        canvas.hidden = true;
        delete canvas.dataset.frame;
        poster.classList.remove("assembly-poster-covered");
      };
    });
  }
  enable();
  addEventListener("pagehide", () => media.revert());
  addEventListener("pageshow", event => { if (event.persisted) enable(); });
})();
