(() => {
  const hero = document.querySelector(".assembly-hero");
  const { gsap, ScrollTrigger } = window;
  if (!hero || !gsap || !ScrollTrigger || navigator.connection?.saveData) return;

  const poster = hero.querySelector("#assembly-poster");
  const videoBase = "/assets/assembly/brown-portrait";
  const media = gsap.matchMedia();

  function enable() {
    media.add({
      motion: "(prefers-reduced-motion: no-preference) and (min-height: 320px)",
      portrait: "(orientation: portrait)",
      mobile: "(pointer: coarse), (max-width: 767px)",
    }, ({ conditions }) => {
      if (!conditions.motion || location.hash) return;

      const session = new AbortController();
      const video = document.createElement("video");
      video.className = "assembly-video";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.hidden = true;
      video.setAttribute("aria-hidden", "true");
      poster.after(video);

      const playhead = { progress: 0 };
      const frameRate = 24;
      let requestedFrame = 0;
      let seekRequest = 0;
      let trigger;
      let scrub;

      function scheduleSeek() {
        if (seekRequest || video.seeking || session.signal.aborted) return;
        seekRequest = requestAnimationFrame(() => {
          seekRequest = 0;
          const time = requestedFrame / frameRate;
          if (Math.abs(video.currentTime - time) >= 0.5 / frameRate) {
            video.currentTime = time;
          }
        });
      }

      function cleanup() {
        if (session.signal.aborted) return;
        session.abort();
        cancelAnimationFrame(seekRequest);
        trigger?.kill();
        scrub?.kill();
        video.removeAttribute("src");
        video.load();
        video.remove();
        poster.classList.remove("assembly-poster-covered");
      }

      video.addEventListener("seeked", () => {
        video.hidden = false;
        poster.classList.add("assembly-poster-covered");
        scheduleSeek();
      }, { signal: session.signal });
      video.addEventListener("error", cleanup, { signal: session.signal });
      video.addEventListener("loadeddata", () => {
        // Keep the page in place if someone starts browsing before the clip is ready.
        if (window.scrollY > 8 || location.hash || !Number.isFinite(video.duration)) {
          cleanup();
          return;
        }

        const lastFrame = Math.max(0, Math.ceil(video.duration * frameRate - 0.01) - 1);
        scrub = gsap.to(playhead, {
          progress: 1,
          duration: 1,
          ease: "none",
          paused: true,
          onUpdate: () => {
            const frame = Math.round(playhead.progress * lastFrame);
            if (frame === requestedFrame) return;
            requestedFrame = frame;
            scheduleSeek();
          },
        });
        trigger = ScrollTrigger.create({
          id: "watch-assembly",
          trigger: hero,
          animation: scrub,
          scrub: conditions.mobile ? 0.28 : 0.32,
          pin: true,
          pinSpacing: true,
          refreshPriority: 1,
          start: () => `top ${document.querySelector(".header").offsetHeight}px`,
          end: () => `+=${Math.round(hero.offsetHeight * (conditions.portrait ? 2.4 : 2.8))}`,
        });
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      }, { once: true, signal: session.signal });

      video.src = `${videoBase}/hero-${conditions.mobile ? 900 : 1080}.mp4`;
      return cleanup;
    });
  }

  enable();
  addEventListener("pagehide", () => media.revert());
  addEventListener("pageshow", event => { if (event.persisted) enable(); });
})();
