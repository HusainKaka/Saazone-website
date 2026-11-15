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
    }, ({ conditions }) => {
      if (!conditions.motion) return;

      const session = new AbortController();
      const portrait = matchMedia("(orientation: portrait)");
      const mobile = matchMedia("(pointer: coarse), (max-width: 767px)").matches;
      const video = document.createElement("video");
      video.className = "assembly-video";
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("aria-hidden", "true");
      poster.after(video);

      const playhead = { progress: 0 };
      const frameRate = 24;
      let seekRequest = 0;
      let refreshFrame = false;
      let trigger;
      let scrub;

      function scheduleSeek() {
        if (document.hidden || seekRequest || video.seeking || video.readyState < 1 || !Number.isFinite(video.duration) || session.signal.aborted) return;
        seekRequest = requestAnimationFrame(() => {
          seekRequest = 0;
          const lastFrame = Math.max(0, Math.ceil(video.duration * frameRate - 0.01) - 1);
          const time = Math.round(playhead.progress * lastFrame) / frameRate;
          if (refreshFrame || Math.abs(video.currentTime - time) >= 0.5 / frameRate) {
            refreshFrame = false;
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
      }

      video.addEventListener("seeked", () => {
        if (!document.hidden && !refreshFrame && video.readyState >= 2) {
          video.classList.add("assembly-video-ready");
        }
        scheduleSeek();
      }, { signal: session.signal });
      function suspendFrame() {
        cancelAnimationFrame(seekRequest);
        seekRequest = 0;
        refreshFrame = true;
        video.classList.remove("assembly-video-ready");
      }
      function resumeFrame() {
        if (document.hidden) return;
        ScrollTrigger.update();
        scheduleSeek();
      }
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) suspendFrame();
        else resumeFrame();
      }, { signal: session.signal });
      window.addEventListener("blur", suspendFrame, { signal: session.signal });
      window.addEventListener("focus", resumeFrame, { signal: session.signal });
      window.addEventListener("pagehide", event => {
        if (event.persisted) suspendFrame();
      }, { signal: session.signal });
      window.addEventListener("pageshow", event => {
        if (event.persisted) resumeFrame();
      }, { signal: session.signal });
      video.addEventListener("error", cleanup, { signal: session.signal });
      for (const event of ["loadedmetadata", "loadeddata", "canplay"]) {
        video.addEventListener(event, scheduleSeek, { signal: session.signal });
      }
      // Reserve the scroll distance before loading media so browser scroll restoration
      // and early swipes both land on the same timeline.
      scrub = gsap.to(playhead, {
        progress: 1,
        duration: 1,
        ease: "none",
        paused: true,
        onUpdate: scheduleSeek,
      });
      trigger = ScrollTrigger.create({
        id: "watch-assembly",
        trigger: hero,
        animation: scrub,
        scrub: mobile ? 0.2 : 0.28,
        pin: true,
        pinSpacing: true,
        refreshPriority: 1,
        start: () => `top ${document.querySelector(".header").offsetHeight}px`,
        end: () => `+=${Math.round(hero.offsetHeight * (portrait.matches ? 3 : 3.2))}`,
      });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();

      video.src = `${videoBase}/hero-${mobile ? 900 : 1080}.mp4`;
      return cleanup;
    });
  }

  enable();
  addEventListener("pagehide", event => {
    if (!event.persisted) media.revert();
  });
})();
