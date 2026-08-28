/* Neon Systems style: asymmetrical mission-dossier layout, Signal Cyan #00F3FF, Space Grotesk + IBM Plex Mono, disciplined cyberpunk glow, no scroll hijacking. */
import { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import {
  ArrowUpRight,
  AtSign,
  Check,
  ChevronDown,
  Code2,
  ExternalLink,
  Github,
  Linkedin,
  LockKeyhole,
  MapPin,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trophy,
  X,
} from "lucide-react";

const heroImage = "/manus-storage/yash-hero-atmosphere_875f1329.jpg";
const securityImage = "/manus-storage/yash-security-texture_2c7507ed.jpg";
const cpImage = "/manus-storage/yash-cp-texture_ef0157c8.jpg";
const signalMark = "/manus-storage/yash-signal-mark_f15fd373.png";

function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 460, damping: 34, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 460, damping: 34, mass: 0.35 });
  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const onMove = (event: MouseEvent) => { x.set(event.clientX); y.set(event.clientY); };
    setEnabled(media.matches);
    if (media.matches) window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);
  if (!enabled) return null;
  return <motion.div className="cursor-orbit" style={{ x: sx, y: sy }} aria-hidden="true"><span /></motion.div>;
}

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const [spot, setSpot] = useState({ x: 50, y: 50 });
  return <article className={`spotlight-card ${className}`} onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSpot({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  }} style={{ "--spot-x": `${spot.x}%`, "--spot-y": `${spot.y}%` } as React.CSSProperties}>{children}</article>;
}

const heatmap = Array.from({ length: 84 }, (_, index) => {
  const value = (index * 17 + index * index * 3 + 11) % 9;
  return value > 6 ? 3 : value > 4 ? 2 : value > 2 ? 1 : 0;
});

function LeetCodeHeatmap() {
  const [live, setLive] = useState(false);
  const [solved, setSolved] = useState("800+");
  useEffect(() => {
    fetch("https://alfa-leetcode-api.onrender.com/solved/Oru388f3ta")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => { if (data?.solvedProblem) setSolved(`${data.solvedProblem}+`); setLive(true); })
      .catch(() => setLive(false));
  }, []);
  return <div className="heatmap-shell">
    <div className="heatmap-topline"><span><span className={`status-dot ${live ? "online" : ""}`} /> {live ? "LIVE PROFILE" : "PROFILE SNAPSHOT"}</span><span className="mono">{solved} SOLVED</span></div>
    <div className="heatmap-grid" aria-label="Native activity matrix">
      {heatmap.map((value, index) => <span key={index} className={`heat-cell level-${value}`} title={`${value ? value * 2 : 0} activity signals`} />)}
    </div>
    <div className="heatmap-legend"><span>LESS</span><i className="heat-cell level-0" /><i className="heat-cell level-1" /><i className="heat-cell level-2" /><i className="heat-cell level-3" /><span>MORE</span></div>
  </div>;
}

function MagneticButton({ href, children, secondary = false }: { href: string; children: React.ReactNode; secondary?: boolean }) {
  return <a className={`magnetic-button ${secondary ? "secondary" : ""}`} href={href} onMouseMove={(e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.transform = `translate(${(e.clientX - rect.left - rect.width / 2) * 0.08}px, ${(e.clientY - rect.top - rect.height / 2) * 0.08}px)`;
  }} onMouseLeave={(e) => { e.currentTarget.style.transform = "translate(0, 0)"; }}>
    {children}<ArrowUpRight size={16} />
  </a>;
}

const navItems = [["01", "Work", "#work"], ["02", "Signal", "#signal"], ["03", "Stack", "#stack"], ["04", "Contact", "#contact"]];
const certifications: Array<{ org: string; title: string; body: string; Icon: React.ComponentType<{ size?: number; className?: string }> }> = [
  { org: "GOOGLE", title: "Cybersecurity Professional Certificate", body: "Networks · Linux · SQL · Threat analysis", Icon: ShieldCheck },
  { org: "ANTHROPIC", title: "AI Fluency", body: "Frameworks · Foundations · Claude 101", Icon: Sparkles },
  { org: "ELECTRONIC ARTS", title: "Software Engineering Simulation", body: "Forage · Engineering workflow", Icon: Terminal },
  { org: "MASTERCARD", title: "Cybersecurity Simulation", body: "Forage · Threat response", Icon: LockKeyhole },
];
const profileLinks = {
  github: "https://github.com/yashchat007",
  linkedin: "https://linkedin.com/in/yash-chaturvedi-880032378",
  leetcode: "https://leetcode.com/u/Oru388f3ta",
  codeforces: "https://codeforces.com/profile/yashchat007",
};
const gmailComposeUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=yashchat007@gmail.com";
const resumeUrl = "/manus-storage/yash-chaturvedi-resume_1eeead93.pdf";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const role = "Software Engineering Intern @ DRDO";
  useEffect(() => { let index = 0; const timer = window.setInterval(() => { setTyped(role.slice(0, index)); index += 1; if (index > role.length) window.clearInterval(timer); }, 48); return () => window.clearInterval(timer); }, []);
  return <div className="portfolio-shell">
    <CustomCursor />
    <header className="site-header">
      <a className="brand-lockup" href="#top"><img src={signalMark} alt="Yash Chaturvedi signal mark" /><span>YASH<span className="brand-dim">/</span>CHATURVEDI</span></a>
      <nav className={menuOpen ? "nav-open" : ""}>{navItems.map(([number, label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)}><b>{number}</b>{label}</a>)}</nav>
      <a className="header-contact" href={gmailComposeUrl} target="_blank" rel="noreferrer"><AtSign size={15} /> <span>LET'S CONNECT</span></a>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
    </header>

    <main id="top">
      <section className="hero-section">
        <div className="hero-image" style={{ backgroundImage: `url(${heroImage})` }} />
        <div className="hero-grid" />
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot online" /> AVAILABLE FOR HIGH-IMPACT BUILDS <span className="eyebrow-line" /></div>
          <p className="hero-kicker">SYSTEMS / SECURITY / SOFTWARE</p>
          <h1>Build systems<br /><em>that hold</em><br />under pressure.</h1>
          <p className="hero-summary">Computer science engineer focused on secure software, adversarial thinking, and the small decisions that keep complex systems dependable.</p>
          <div className="hero-actions"><MagneticButton href="#work">Inspect the work</MagneticButton><a className="magnetic-button secondary" href={resumeUrl} target="_blank" rel="noreferrer">View resume<ArrowUpRight size={16} /></a></div>
        </div>
        <div className="hero-readout">
          <div className="readout-head"><span>IDENTITY // YC-01</span><span>● ONLINE</span></div>
          <div className="readout-name">YASH<br /><span>CHATURVEDI</span></div>
          <div className="readout-rule" />
          <div className="readout-row"><span>ROLE</span><strong>{typed}<span className="type-caret">_</span></strong></div>
          <div className="readout-row"><span>BASE</span><strong><MapPin size={13} /> Gurugram, India</strong></div>
          <div className="readout-row"><span>EDUCATION</span><strong>MANIPAL UNIVERSITY JAIPUR</strong></div>
          <div className="readout-row"><span>CGPA</span><strong className="cyan-value">8.63 / 10</strong></div>
          <div className="readout-footer"><span>ENGAGED SINCE 2022</span><span>SCROLL TO DECODE <ChevronDown size={14} /></span></div>
        </div>
        <div className="hero-index mono">[ 00 / 04 ]</div>
      </section>

      <section className="signal-strip" id="signal"><div className="strip-label">SIGNAL / 01</div><div className="strip-stat"><strong>17+</strong><span>file formats<br />validated</span></div><div className="strip-stat"><strong>1.1K+</strong><span>problems<br />solved</span></div><div className="strip-stat"><strong>8.63</strong><span>current<br />CGPA</span></div><p>“The best security work is often invisible: it is the blind spot you found before anyone else had to.”</p></section>

      <section className="work-section content-section" id="work">
        <div className="section-marker"><span>02</span><span>SELECTED WORK</span></div>
        <div className="section-body"><div className="section-intro"><h2>Evidence over<br /><em>empty claims.</em></h2><p>Engineering work is a record of choices under constraints. Here are the systems, test suites, and security questions I have taken apart to understand better.</p></div>
          <SpotlightCard className="feature-card"><div className="feature-media" style={{ backgroundImage: `url(${securityImage})` }}><span className="media-tag">DRDO / SECURITY ANALYSIS</span><LockKeyhole size={34} /></div><div className="feature-content"><div className="card-meta"><span>SOFTWARE ENGINEERING INTERN</span><span>MAY — JUL 2026</span></div><h3>Building high assurance<br />software.</h3><p>Evaluated a Python-based embedded file detection system, then stress-tested its edges with adversarial inputs that mimic real-world evasion.</p><ul><li>Recursive extraction and classification across 17+ file formats.</li><li>Validation suite covering steganography, ZIP bombs, nesting, metadata manipulation, and invisible characters.</li><li>Authenticated and unauthenticated Linux baseline audits using OpenSCAP and Nessus.</li></ul><div className="tag-row"><span>PYTHON</span><span>LINUX</span><span>OPENSCAP</span><span>NESSUS</span><span>PQC</span><span>DNSSEC</span></div></div></SpotlightCard>
        </div>
      </section>

      <section className="metrics-section content-section"><div className="section-marker"><span>03</span><span>COMPETITIVE SIGNAL</span></div><div className="section-body"><div className="section-intro"><p className="section-kicker">ALGORITHMIC PRACTICE / LIVE-ish</p><h2>Practice makes<br /><em>patterns visible.</em></h2><p>Competitive programming is where I sharpen speed, abstraction, and the instinct to find the hidden constraint.</p></div><div className="metric-layout"><SpotlightCard className="metric-card leetcode"><a className="metric-top" href={profileLinks.leetcode} target="_blank" rel="noreferrer"><span className="metric-icon"><Code2 size={20} /></span><span>LEETCODE / ORU388F3TA</span><ExternalLink size={15} /></a><div className="metric-big">800<span>+</span></div><p>problems solved</p><div className="metric-details"><span><b>KNIGHT</b> badge</span><span><b>1863</b> contest rating</span><span><b>TOP 5.87%</b> globally</span></div><LeetCodeHeatmap /></SpotlightCard><SpotlightCard className="metric-card codeforces"><a className="metric-top" href={profileLinks.codeforces} target="_blank" rel="noreferrer"><span className="metric-icon violet"><Trophy size={20} /></span><span>CODEFORCES / YASHCHAT007</span><ExternalLink size={15} /></a><div className="metric-big">300<span>+</span></div><p>problems solved</p><div className="metric-details"><span><b>PUPIL</b> current rank</span><span><b>1286</b> rating</span><span><b>3903 / 29K</b> top contest rank</span></div><div className="cp-visual" style={{ backgroundImage: `url(${cpImage})` }}><div className="cp-visual-label"><Network size={16} /> 134 SOLVED / INTENSIVE MONTH</div></div></SpotlightCard></div></div></section>

      <section className="stack-section content-section" id="stack"><div className="section-marker"><span>04</span><span>TECHNICAL STACK</span></div><div className="section-body"><div className="section-intro"><p className="section-kicker">TOOLS / LANGUAGES / MENTAL MODELS</p><h2>The stack is a<br /><em>point of view.</em></h2></div><div className="stack-grid">{[["01", "LANGUAGES", "C++ · Python · SQL · Bash / Linux Shell"], ["02", "PROBLEM SOLVING & DSA", "Advanced data structures · Algorithms · Competitive programming"], ["03", "SOFTWARE ENGINEERING & SECURITY", "Architecture analysis · Static & dynamic analysis · Code comprehension · Cross-format validation · Software testing"], ["04", "TOOLS & SECURITY PLATFORMS", "Git · GitHub · Linux Shell · OpenSCAP · Nessus"], ["05", "CORE COURSEWORK", "Data structures · Object-oriented programming · Computer networks"]].map(([n, title, body]) => <div className="stack-item" key={n}><span className="stack-number">{n}</span><div><h3>{title}</h3><p>{body}</p></div><ArrowUpRight size={18} /></div>)}</div></div></section>

      <section className="cert-section content-section"><div className="section-marker"><span>05</span><span>CREDENTIALS</span></div><div className="section-body"><div className="section-intro"><p className="section-kicker">VERIFIED SIGNALS</p><h2>Receipts for<br /><em>the curiosity.</em></h2></div><div className="cert-grid">{certifications.map(({ org, title, body, Icon }) => <div className="cert-card" key={org}><div className="cert-icon"><Icon size={20} /></div><span>{org}</span><h3>{title}</h3><p>{body}</p><Check size={15} className="cert-check" /></div>)}</div></div></section>

      <section className="contact-section" id="contact"><div className="contact-grid" /><div className="contact-inner"><p className="section-kicker">NEXT TRANSMISSION / OPEN CHANNEL</p><h2>Have a hard<br /><em>problem?</em></h2><p>Send the brief. I’m interested in the systems behind the headline, the unknowns nobody has documented yet, and work that rewards care.</p><a className="contact-email" href={gmailComposeUrl} target="_blank" rel="noreferrer">yashchat007@gmail.com <ArrowUpRight size={21} /></a><div className="social-links"><a href={profileLinks.github} target="_blank" rel="noreferrer"><Github size={16} /> GitHub</a><a href={profileLinks.linkedin} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a><a href={profileLinks.leetcode} target="_blank" rel="noreferrer"><Code2 size={16} /> LeetCode</a><a href={profileLinks.codeforces} target="_blank" rel="noreferrer"><Trophy size={16} /> Codeforces</a></div></div></section>
    </main>
    <footer><span>YC / 2026</span><span>BUILT WITH CURIOSITY + CONSTRAINTS</span><span><a href="#top">BACK TO TOP ↑</a></span></footer>
  </div>;
}
