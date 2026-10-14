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

  const radar = document.querySelector("[data-radar]");
  if (radar) {
    const hudName = document.querySelector("[data-radar-name]");
    const hudRole = document.querySelector("[data-radar-role]");
    const nodes = Array.from(radar.querySelectorAll(".radar-node"));
    const defaultName = hudName ? hudName.textContent : "Homelab";
    const defaultRole = hudRole ? hudRole.textContent : "";

    const nodeData = nodes.map((el) => {
      const x = parseFloat(el.style.getPropertyValue("--x")) || 50;
      const y = parseFloat(el.style.getPropertyValue("--y")) || 50;
      const dx = x - 50;
      const dy = y - 50;
      const dist = Math.hypot(dx, dy);
      const angle = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      return { el, dist, angle };
    });

    let currentBeam = 102;
    let targetBeam = null;
    let hoveredNode = null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const shortestDelta = (from, to) => ((((to - from) % 360) + 540) % 360) - 180;

    const updateSweep = (beamDeg) => {
      const startDeg = (beamDeg - 252 + 360) % 360;
      radar.style.setProperty("--radar-angle", `${startDeg.toFixed(1)}deg`);
      nodeData.forEach(({ el, dist, angle }) => {
        if (dist < 4) return;
        const diff = Math.abs(shortestDelta(angle, beamDeg));
        el.classList.toggle("is-swept", diff < 28);
      });
    };

    const setHud = (name, role) => {
      if (hudName) hudName.textContent = name;
      if (hudRole) hudRole.textContent = role;
    };

    nodes.forEach((el, idx) => {
      const activate = () => {
        hoveredNode = nodeData[idx];
        if (hoveredNode.dist >= 4) {
          targetBeam = hoveredNode.angle;
        }
        setHud(el.dataset.name || defaultName, el.dataset.role || defaultRole);
      };
      const deactivate = () => {
        hoveredNode = null;
        setHud(defaultName, defaultRole);
      };
      el.addEventListener("mouseenter", activate);
      el.addEventListener("focus", activate);
      el.addEventListener("mouseleave", deactivate);
      el.addEventListener("blur", deactivate);
    });

    radar.addEventListener("pointermove", (event) => {
      if (hoveredNode && hoveredNode.dist >= 4) return;
      const rect = radar.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      if (Math.hypot(dx, dy) > 8) {
        targetBeam = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360;
      }
    });

    radar.addEventListener("pointerleave", () => {
      if (!hoveredNode) targetBeam = null;
    });

    if (!reduceMotion) {
      let lastTime = performance.now();
      const tick = (now) => {
        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;
        if (targetBeam !== null) {
          const delta = shortestDelta(currentBeam, targetBeam);
          currentBeam = (currentBeam + delta * Math.min(1, dt * 8) + 360) % 360;
        } else {
          currentBeam = (currentBeam + dt * 18) % 360;
        }
        updateSweep(currentBeam);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    } else {
      updateSweep(currentBeam);
    }
  }

  const filterChips = document.querySelectorAll("[data-filter]");
  const projectCards = document.querySelectorAll(".project-card[data-category]");
  if (filterChips.length && projectCards.length) {
    filterChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.dataset.filter;
        filterChips.forEach((c) => c.classList.toggle("is-active", c === chip));
        projectCards.forEach((card) => {
          const match = filter === "all" || card.dataset.category === filter;
          card.hidden = !match;
        });
      });
    });
  }

  const hwChips = document.querySelectorAll("[data-hw-filter]");
  const hwCards = document.querySelectorAll(".hw-card[data-hw-category]");
  if (hwChips.length && hwCards.length) {
    hwChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        const filter = chip.dataset.hwFilter;
        hwChips.forEach((c) => c.classList.toggle("is-active", c === chip));
        hwCards.forEach((card) => {
          const match = filter === "all" || card.dataset.hwCategory === filter;
          card.hidden = !match;
        });
      });
    });
  }

  const snakeCanvas = document.querySelector("[data-snake-canvas]");
  if (snakeCanvas instanceof HTMLCanvasElement) {
    const ctx = snakeCanvas.getContext("2d");
    const scoreNode = document.querySelector("[data-snake-score]");
    const cols = 20;
    const rows = 9;
    const cell = 14;
    let snake = [
      { x: 6, y: 4 },
      { x: 5, y: 4 },
      { x: 4, y: 4 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
    ];
    let food = { x: 14, y: 4 };
    let score = 140;

    const placeFood = (tx, ty) => {
      if (typeof tx === "number" && typeof ty === "number") {
        food = {
          x: Math.max(1, Math.min(cols - 2, tx)),
          y: Math.max(1, Math.min(rows - 2, ty)),
        };
        return;
      }
      for (let i = 0; i < 30; i++) {
        const fx = 1 + Math.floor(Math.random() * (cols - 2));
        const fy = 1 + Math.floor(Math.random() * (rows - 2));
        if (!snake.some((s) => s.x === fx && s.y === fy)) {
          food = { x: fx, y: fy };
          return;
        }
      }
    };

    const drawSnake = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, snakeCanvas.width, snakeCanvas.height);

      ctx.strokeStyle = "rgba(238, 242, 246, 0.04)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cell + 0.5, 0);
        ctx.lineTo(x * cell + 0.5, rows * cell);
        ctx.stroke();
      }
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cell + 0.5);
        ctx.lineTo(cols * cell, y * cell + 0.5);
        ctx.stroke();
      }

      ctx.fillStyle = "#ff4a1c";
      ctx.beginPath();
      ctx.arc(food.x * cell + cell / 2, food.y * cell + cell / 2, 4.5, 0, Math.PI * 2);
      ctx.fill();

      snake.forEach((seg, idx) => {
        const alpha = Math.max(0.28, 1 - idx * 0.09);
        ctx.fillStyle = idx === 0 ? "#eef2f6" : `rgba(255, 122, 82, ${alpha})`;
        ctx.fillRect(seg.x * cell + 2, seg.y * cell + 2, cell - 4, cell - 4);
      });
    };

    const stepSnake = () => {
      const head = snake[0];
      const dirs = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 },
      ];
      const valid = dirs
        .map((d) => ({
          x: (head.x + d.x + cols) % cols,
          y: (head.y + d.y + rows) % rows,
        }))
        .filter((p) => !snake.slice(0, -1).some((s) => s.x === p.x && s.y === p.y));

      const next = valid.length
        ? valid.sort(
            (a, b) =>
              Math.hypot(a.x - food.x, a.y - food.y) -
              Math.hypot(b.x - food.x, b.y - food.y)
          )[0]
        : { x: (head.x + 1) % cols, y: head.y };

      snake.unshift(next);
      if (next.x === food.x && next.y === food.y) {
        score += 10;
        if (scoreNode) scoreNode.textContent = `SCORE ${String(score).padStart(4, "0")}`;
        if (snake.length > 9) snake.pop();
        placeFood();
      } else {
        snake.pop();
      }
      drawSnake();
    };

    snakeCanvas.addEventListener("pointerdown", (e) => {
      const rect = snakeCanvas.getBoundingClientRect();
      const gx = Math.floor(((e.clientX - rect.left) / rect.width) * cols);
      const gy = Math.floor(((e.clientY - rect.top) / rect.height) * rows);
      placeFood(gx, gy);
      drawSnake();
    });

    drawSnake();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(stepSnake, 180);
    }
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
