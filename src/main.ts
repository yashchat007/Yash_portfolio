import "./styles.css";
import { initPalette } from "./palette";
import { initTerminal } from "./terminal";

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

function allowCore(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return false;
  return true;
}

function initTheme(): () => void {
  const button = document.querySelector<HTMLButtonElement>("#theme-toggle");
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  const apply = (light: boolean) => {
    document.documentElement.classList.toggle("light", light);
    try {
      localStorage.setItem("theme", light ? "light" : "dark");
    } catch {
      /* private mode */
    }
    button?.setAttribute("aria-pressed", light ? "true" : "false");
    button?.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
    if (meta) meta.content = light ? "#f3efe6" : "#08090d";
    document.dispatchEvent(new Event("themechange"));
  };

  apply(document.documentElement.classList.contains("light"));
  const toggle = () => apply(!document.documentElement.classList.contains("light"));
  button?.addEventListener("click", toggle);
  return toggle;
}

function initNav(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-nav]")];
  const ids = links.map((link) => link.getAttribute("href")?.slice(1)).filter((id): id is string => Boolean(id));
  const sections = ids
    .map((id) => document.getElementById(id))
    .filter((section): section is HTMLElement => section !== null);
  const visible = new Set<string>();
  const mark = () => {
    let current = "";
    for (const id of ids) if (visible.has(id)) current = id;
    for (const link of links) {
      const id = link.getAttribute("href")?.slice(1);
      if (id && id === current) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    }
  };
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      mark();
    },
    { rootMargin: "-20% 0px -55% 0px", threshold: 0.01 },
  );
  sections.forEach((section) => observer.observe(section));

  const header = document.querySelector(".site-header");
  const onScroll = () => header?.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initSpotlight(): void {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;
  document.querySelectorAll<HTMLElement>(".project").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });
}

function initCopy(): void {
  const button = document.querySelector<HTMLButtonElement>("#copy-email");
  const email = document.body.dataset.email ?? "";
  if (!button) return;
  let timer = 0;
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      button.textContent = "Copied";
    } catch {
      button.textContent = email;
    }
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      button.textContent = "Copy";
    }, 1600);
  });
}

function initCore(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#core-canvas");
  const core = document.querySelector<HTMLElement>("#core");
  const state = document.querySelector("#stage-state");
  if (!canvas || !core || !allowCore()) return;

  const start = () => {
    const run = () => {
      import("./scene")
        .then(({ mount }) => {
          mount(canvas, () => {
            core.classList.add("is-live");
            if (state) state.textContent = "Live";
          });
        })
        .catch(() => {
          if (state) state.textContent = "Still";
        });
    };
    requestIdleCallback(run, { timeout: 1800 });
  };

  if (document.readyState === "complete") start();
  else window.addEventListener("load", start, { once: true });
}

const toggleTheme = initTheme();
initPalette(toggleTheme);
initTerminal();
initNav();
initSpotlight();
initCopy();
initCore();
