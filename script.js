(() => {
  const yearNodes = document.querySelectorAll("[data-year]");
  const year = String(new Date().getFullYear());
  yearNodes.forEach((node) => {
    node.textContent = year;
  });

  const root = document.documentElement;
  const themeToggle = document.querySelector(".theme-toggle");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const themeColors = { dark: "#07090d", light: "#f6f7f9" };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute("content", themeColors[theme]);
    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      );
      themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }
  };

  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const next = root.dataset.theme === "light" ? "dark" : "light";
      applyTheme(next);
      try {
        localStorage.setItem("theme", next);
      } catch (error) {
        /* storage unavailable — theme resets to dark on reload */
      }
    });
  }

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (toggle && nav) {
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealItems.forEach((el) => observer.observe(el));
})();
