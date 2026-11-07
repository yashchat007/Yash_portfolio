const HELP = "commands: about · projects · experience · stats · skills · contact · resume · clear";

const ANSWERS: Record<string, string> = {
  help: HELP,
  about: "Yash Chaturvedi · CSE student at Manipal University Jaipur who loves working on complex software engineering tasks.",
  whoami: "Yash Chaturvedi · CSE student at Manipal University Jaipur who loves working on complex software engineering tasks.",
  projects: [
    "01  FRIDAY           Local AI desktop agent",
    "02  RoleRadar        Job intel platform",
    "03  CineCircle       Social movie platform",
    "04  Gesture Control  Hands-free desktop control",
  ].join("\n"),
  ls: [
    "01  FRIDAY           Local AI desktop agent",
    "02  RoleRadar        Job intel platform",
    "03  CineCircle       Social movie platform",
    "04  Gesture Control  Hands-free desktop control",
  ].join("\n"),
  experience: "Software Engineering Intern · DRDO HQ, Ministry of Defence · May–Jul 2026\nSecurity analysis of high-assurance software",
  stats: [
    "leetcode    Knight · max 1863 · top 5.99% · best rank 1633/30,000+",
    "codeforces  Pupil · max 1286 · 300+ solved · 134 problems solved in one month",
    "tuf         Hall of Fame · 500+ problems solved · 220-day streak",
    "total       2000+ problems across platforms",
  ].join("\n"),
  skills: [
    "Languages: C++, Java, Python, JavaScript / TypeScript, SQL",
    "Core: Data Structures & Algorithms, OOP, Low-Level Design, DBMS, Computer Networks",
    "Tools: Git, Linux, PostgreSQL, Docker",
  ].join("\n"),
};

function reply(raw: string, resume: string, email: string, links: Record<string, string>): string | "CLEAR" {
  const command = raw.trim().toLowerCase();
  if (command === "") return "";
  if (command === "clear") return "CLEAR";
  if (command in ANSWERS) return ANSWERS[command];
  if (command === "contact") {
    return [
      `email    ${email}`,
      "github   github.com/yashchat007",
      "linkedin linkedin.com/in/yash-chaturvedi-880032378",
      "tuf      takeuforward.org/profile/astrofantom",
    ].join("\n");
  }
  if (command === "resume") {
    window.open(resume, "_blank", "noopener");
    return "opening resume…";
  }
  if (command === "github") {
    window.open(links.github, "_blank", "noopener");
    return "opening github…";
  }
  return `command not found: ${raw.trim()}. try 'help'`;
}

export function initTerminal(): void {
  const form = document.querySelector<HTMLFormElement>("#term-form");
  const input = document.querySelector<HTMLInputElement>("#term-in");
  const log = document.querySelector<HTMLElement>("#term-log");
  if (!form || !input || !log) return;

  const body = document.body.dataset;
  const resume = body.resume ?? "/Yash_Chaturvedi_Resume.pdf";
  const email = body.email ?? "";
  const links = {
    github: body.github ?? "",
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = input.value;
    const output = reply(value, resume, email, links);
    input.value = "";
    if (output === "CLEAR") {
      log.replaceChildren();
      return;
    }
    if (output === "" && value.trim() === "") return;
    const entry = document.createElement("div");
    entry.className = "term-entry";
    const line = document.createElement("p");
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = ">";
    line.append(prompt, document.createTextNode(` ${value}`));
    const pre = document.createElement("pre");
    pre.textContent = output;
    entry.append(line, pre);
    log.append(entry);
    log.scrollTop = log.scrollHeight;
  });
}
