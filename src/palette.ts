type Command = {
  label: string;
  run: () => void;
};

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function go(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });
}

export function initPalette(onToggleTheme: () => void): void {
  const root = document.querySelector<HTMLElement>("#palette");
  const dialog = root?.querySelector<HTMLElement>(".palette-dialog");
  const input = document.querySelector<HTMLInputElement>("#palette-input");
  const list = document.querySelector<HTMLUListElement>("#palette-list");
  const openButton = document.querySelector<HTMLButtonElement>("#open-palette");
  const closeButton = document.querySelector<HTMLButtonElement>("#palette-close");
  if (!root || !dialog || !input || !list || !openButton || !closeButton) return;

  const data = document.body.dataset;
  const openUrl = (url?: string) => {
    if (url) window.open(url, "_blank", "noopener");
  };

  const commands: Command[] = [
    { label: "Go to about", run: () => go("about") },
    { label: "Go to experience", run: () => go("experience") },
    { label: "Go to projects", run: () => go("projects") },
    { label: "Go to competitive programming", run: () => go("arena") },
    { label: "Go to skills", run: () => go("skills") },
    { label: "Go to contact", run: () => go("contact") },
    { label: "Download resume", run: () => openUrl(data.resume) },
    {
      label: "Copy email",
      run: () => {
        const email = data.email ?? "";
        navigator.clipboard?.writeText(email).catch(() => {});
      },
    },
    { label: "Open GitHub", run: () => openUrl(data.github) },
    { label: "Open LinkedIn", run: () => openUrl(data.linkedin) },
    { label: "Open LeetCode", run: () => openUrl(data.leetcode) },
    { label: "Open Codeforces", run: () => openUrl(data.codeforces) },
    { label: "Open takeUforward", run: () => openUrl(data.tuf) },
    { label: "Toggle light / dark", run: onToggleTheme },
  ];

  let active = 0;
  let restore: HTMLElement | null = null;
  let current: Command[] = commands;

  const render = () => {
    const query = input.value.trim().toLowerCase();
    current = commands.filter((command) => command.label.toLowerCase().includes(query));
    active = Math.min(active, Math.max(0, current.length - 1));
    list.replaceChildren();
    if (!current.length) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "No matching commands";
      empty.setAttribute("role", "presentation");
      list.append(empty);
      input.removeAttribute("aria-activedescendant");
      return;
    }
    current.forEach((command, index) => {
      const item = document.createElement("li");
      item.id = `palette-opt-${index}`;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", index === active ? "true" : "false");
      item.textContent = command.label;
      item.addEventListener("pointermove", () => {
        active = index;
        paintSelection();
      });
      item.addEventListener("click", () => choose(index));
      list.append(item);
    });
    input.setAttribute("aria-activedescendant", `palette-opt-${active}`);
  };

  const paintSelection = () => {
    const items = list.querySelectorAll<HTMLElement>('[role="option"]');
    items.forEach((item, index) => {
      item.setAttribute("aria-selected", index === active ? "true" : "false");
    });
    input.setAttribute("aria-activedescendant", `palette-opt-${active}`);
    items[active]?.scrollIntoView({ block: "nearest" });
  };

  const focusable = () =>
    [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1 && el.getClientRects().length > 0,
    );

  const trap = (event: KeyboardEvent) => {
    if (event.key !== "Tab" || root.hidden) return;
    const nodes = focusable();
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const pullBack = (event: FocusEvent) => {
    if (root.hidden) return;
    const target = event.target;
    if (target instanceof Node && !dialog.contains(target)) {
      input.focus();
    }
  };

  const setBackgroundInert = (on: boolean) => {
    for (const child of document.body.children) {
      if (child === root) continue;
      if (on) child.setAttribute("inert", "");
      else child.removeAttribute("inert");
    }
  };

  const close = () => {
    if (root.hidden) return;
    root.hidden = true;
    document.body.style.overflow = "";
    setBackgroundInert(false);
    const previous = restore;
    restore = null;
    previous?.focus();
  };

  const open = () => {
    if (!root.hidden) return;
    restore = document.activeElement instanceof HTMLElement ? document.activeElement : openButton;
    root.hidden = false;
    document.body.style.overflow = "hidden";
    setBackgroundInert(true);
    input.value = "";
    active = 0;
    render();
    input.focus();
  };

  const choose = (index: number) => {
    const command = current[index];
    if (!command) return;
    close();
    command.run();
  };

  openButton.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  root.addEventListener("click", (event) => {
    if (event.target === root) close();
  });
  input.addEventListener("input", () => {
    active = 0;
    render();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      active = Math.min(active + 1, current.length - 1);
      paintSelection();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      active = Math.max(active - 1, 0);
      paintSelection();
    } else if (event.key === "Home") {
      event.preventDefault();
      active = 0;
      paintSelection();
    } else if (event.key === "End") {
      event.preventDefault();
      active = Math.max(0, current.length - 1);
      paintSelection();
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(active);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (root.hidden) open();
      else close();
      return;
    }
    if (event.key === "Escape" && !root.hidden) {
      event.preventDefault();
      close();
    }
    trap(event);
  });
  document.addEventListener("focusin", pullBack);
}
