import React, { useEffect, useMemo, useRef, useState } from "react";
import './App.css'

declare global {
  interface Window {
    emailjs?: {
      init: (publicKey: string) => void;
      send: (serviceId: string, templateId: string, templateParams: Record<string, string>) => Promise<any>;
    };
  }
}

// ------------ Types ------------
interface SectionTitleProps { kicker?: string; title: string; subtitle?: string; }
interface SocialIconProps { label: string; href: string; children: React.ReactNode; }
interface NavLinkProps { href: string; children: React.ReactNode; }
interface Role { company: string; role: string; period: string; location: string; points: string[]; tech: string[]; img: string; }
interface Project { title: string; blurb: string; links: { label: string; href: string }[]; tech: string[]; img: string; }
interface Cert { name: string; org: string; year: string; href?: string }

// ------------ Micro‑utils: Reveal on scroll ------------
function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { setVisible(true); obs.unobserve(e.target); }
      }),
      { threshold: 0.12 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string; }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transform-gpu transition-all duration-700 ease-out ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"} ${className}`}
    >
      {children}
    </div>
  );
}

// ------------ Loading Splash (2s) ------------
function LightningIcon() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <div className="absolute inset-0 blur-xl rounded-full animate-pulse" style={{ backgroundColor: 'rgba(36, 93, 209, 0.35)' }} />
      {/* Lightning bolt */}
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-14 h-14 relative z-10 drop-shadow-[0_0_22px_rgba(36,93,209,0.45)]">
        <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" fill="var(--brand-blue)" />
        <path d="M13 2L3 14h6l-1 8 10-12h-6l1-8z" fill="url(#lightningGradient)" opacity="0.95" />
        <defs>
          <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--brand-blue-400)" />
            <stop offset="45%" stopColor="var(--brand-blue)" />
            <stop offset="100%" stopColor="var(--brand-blue-600)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function LoadingSplash() {
  const [show, setShow] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress animation - reaches 100% in ~2.4 seconds, then waits 300ms before hiding
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 1; // Smaller increments for smoother animation (100% / 120 frames = ~0.84%)
      if (currentProgress >= 100) {
        setProgress(100);
        clearInterval(interval);
        // Wait a bit after reaching 100% before hiding
        setTimeout(() => setShow(false), 150);
      } else {
        setProgress(currentProgress); // Don't round here for smooth bar movement
      }
    }, 20); // Update every 20ms for 50fps smooth animation

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 text-white">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="relative w-[85vw] sm:w-[70vw] max-w-2xl h-24 sm:h-20">
        {/* Progress bar background */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-[var(--brand-blue)]/20 rounded-full overflow-visible">
          <div className="h-full bg-gradient-to-r from-[var(--brand-blue)] to-[var(--brand-blue-400)] rounded-full transition-all duration-150 ease-out shadow-lg shadow-[var(--brand-blue)]/45 relative"
            style={{ width: `${progress}%`, transition: 'width 0.15s ease-out' }}>
            {/* Lightning icon - attached to progress bar end */}
            <div
              className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-10"
            >
              <LightningIcon />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 sm:mt-6 flex items-center gap-3 text-sm sm:text-base text-white/70 animate-[fadeInUp_0.6s_ease-out_0.3s_both]">
        <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-white/30 border-t-[#6A6AFF] animate-spin" />
        <span className="font-medium">Loading portfolio!</span>
      </div>
      <div className="mt-2 text-xs text-white/40 animate-[fadeInUp_0.6s_ease-out_0.5s_both]">
        {Math.round(progress)}%
      </div>
    </div>
  );
}

// ------------ UI Primitives ------------
function SectionTitle(props: SectionTitleProps) {
  const { kicker, title, subtitle } = props;
  return (
    <Reveal>
      <div className="text-center mb-12">
        {kicker ? (
          <p className="uppercase tracking-widest text-xs md:text-[11px] text-white/60 dark:text-white/50 mb-3">{kicker}</p>
        ) : null}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white dark:text-white/95">{title}</h2>
        {subtitle ? (
          <p className="text-white/70 dark:text-white/65 mt-4 leading-relaxed text-lg">{subtitle}</p>
        ) : null}
      </div>
    </Reveal>
  );
}

function Badge(props: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium border-white/20 bg-white/5 text-white/80 dark:text-white/75 backdrop-blur-sm">
      {props.children}
    </span>
  );
}

function Card(props: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`group rounded-2xl border border-white/10 dark:border-white/10 bg-white/5 dark:bg-white/5 backdrop-blur-xl p-6 transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#6A6AFF]/10 hover:border-white/20 hover:scale-[1.02] ${props.className || ""}`}>
      {props.children}
    </div>
  );
}

function SocialIcon(props: SocialIconProps) {
  const { label, href, children } = props;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={label}
      className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/90 px-4 py-2 text-sm hover:bg-white/10 hover:border-white/30 transition-all"
    >
      {children}
      <span className="sr-only">{label}</span>
    </a>
  );
}

function ExternalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.66-.3-5.46-1.34-5.46-5.96 0-1.32.47-2.39 1.23-3.23-.12-.3-.53-1.52.12-3.17 0 0 1.01-.32 3.31 1.23a11.5 11.5 0 0 1 6.02 0c2.3-1.55 3.31-1.23 3.31-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.66-5.47 5.96.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.58A12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.77 2.65 4.77 6.1V23h-4v-7.15c0-1.7-.03-3.9-2.38-3.9-2.38 0-2.75 1.86-2.75 3.78V23h-4V8z" />
    </svg>
  );
}

function MediumIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    </svg>
  );
}

function LeetcodeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.863s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.111-.702 1.824-.702s1.357.235 1.823.702l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.038-1.901l-2.609-2.636a5.055 5.055 0 00-2.445-1.337l2.467-2.503c.516-.514.498-1.365-.037-1.9-.535-.535-1.386-.553-1.899-.038l-10.1 10.101c-.981.982-1.494 2.337-1.494 3.835 0 1.498.513 2.895 1.494 3.875l7.761 7.762c.983.983 2.337 1.494 3.834 1.494s2.853-.512 3.835-1.494l2.609-2.637c.514-.514.496-1.365-.039-1.9-.535-.535-1.387-.553-1.9-.038z" />
    </svg>
  );
}

function HandshakeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M11 12h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 14" />
      <path d="M7 18h1a2 2 0 0 0 2-2v-4.5c0-.8.7-1.5 1.5-1.5h1c.8 0 1.5.7 1.5 1.5V18M7 18H5a2 2 0 0 1-2-2v-4c0-.6.4-1 1-1h2M7 18l-2-2M13 12h2a2 2 0 1 1 0 4h-3c-.6 0-1.1-.2-1.4-.6L3 10" />
      <path d="M17 6h-1a2 2 0 0 0-2 2v4.5c0 .8-.7 1.5-1.5 1.5h-1c-.8 0-1.5-.7-1.5-1.5V6M17 6h2a2 2 0 0 1 2 2v4c0 .6-.4 1-1 1h-2M17 6l2 2" />
    </svg>
  );
}

function NavLink(props: NavLinkProps) {
  const { href, children } = props;
  return (
    <a href={href} className="text-sm text-white/70 hover:text-white transition-colors">
      {children}
    </a>
  );
}

// ------------ Sections ------------
function Hero() {
  return (
    <section
      id="home"
      className="
    min-h-[calc(100vh-56px)] sm:min-h-[calc(100vh-64px)]
    flex items-center justify-center
    pt-32 sm:pt-40 md:pt-48
    pb-12 sm:pb-16
  "
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-8 md:gap-12 items-center">
          <Reveal>
            <div>
              <p className="tracking-widest text-[10px] sm:text-xs md:text-[12px] text-neutral-400 dark:text-neutral-500"><b>Open to Fulltime Software Engineer Roles and Summer'26 SDE Internships!</b></p>
              <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white dark:text-white/95">Hey, I'm Haseeb!</h1>

              {/* Professional Title & Roles */}
              <div className="mt-4 sm:mt-5 space-y-2">
                <p className="text-base sm:text-lg font-semibold text-white/90 dark:text-white/85">
                  Full-Stack Software Engineer
                </p>
                <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-xs sm:text-sm text-white/70 dark:text-white/65">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
                    Ex-SWE @ UBS (3 years)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
                    MSCS @ UC Davis
                  </span>
                  <span className="w-full"></span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
                    GSM TA and Researcher @ HERD Lab & ExpoLab, UC Davis
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/75 dark:text-white/70 leading-relaxed max-w-xl">
                I build scalable AI-driven data to decision products with robust data models, polished UIs, and improve backends with measurable performance gains.
              </p>

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                <a href={import.meta.env.BASE_URL + 'resume.pdf'} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-2 border-white/20 text-white/90 hover:border-white/40 hover:text-white transition-all backdrop-blur-sm hover:scale-105 active:scale-95">
                  <DownloadIcon /> <b>Download Resume</b>
                </a>
                <a href="#contact" className="inline-flex items-center gap-2 rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium bg-[#22C55E] text-white hover:bg-[#16A34A] transition-all shadow-lg shadow-[#22C55E]/30 hover:scale-105 active:scale-95">
                  <span className="text-white"><b>Contact me!</b></span> <ExternalIcon />
                </a>
              </div>
              <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
                <SocialIcon label="Email" href="mailto:hrahman@ucdavis.edu"><MailIcon /></SocialIcon>
                <SocialIcon label="LinkedIn" href="https://linkedin.com/in/haseebshaik00"><LinkedInIcon /></SocialIcon>
                <SocialIcon label="GitHub" href="https://github.com/haseebshaik00"><GithubIcon /></SocialIcon>

              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="relative justify-center md:justify-end mt-8 md:mt-0 hidden md:flex">
              <div className="w-72 md:w-80 lg:w-[26rem] xl:w-[28rem] aspect-square
                rounded-full overflow-hidden
                border-4 border-white/90 ring-1 ring-white/20
                shadow-2xl 
                shadow-[0_0_20px_rgba(255,255,255,0.15),0_0_60px_rgba(255,255,255,0.1)]
                cursor-pointer">
                <img 
                  src="/picture.png" 
                  alt="Your portrait" 
                  className="w-full h-full object-cover object-bottom" 
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}


function About() {
  return (
    <section id="about" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="About Me" subtitle="" />
        <Reveal>
          <Card className="max-w-4xl mx-auto">
            <div className="text-white/80 dark:text-white/75 leading-7 text-base md:text-lg">
              <p>I'm a graduate student in Computer Science at UC Davis ('26) and previously a Software Engineer at UBS (3 years). At UBS, I built production systems used across the bank—shipping 40+ integrations, re‑engineering 550+ business processes, and helping cut vendor costs by 80% while improving reliability.</p>
              <p className="mt-6">My recent work blends full‑stack engineering with applied ML—Vite/React/TS, Node/FastAPI, PostgreSQL, Azure/Kubernetes. I'm currently scaling FinSight and contributing to HERD Lab research pipelines.</p>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  );
}

function getRoles(): Role[] {
  return [
    {
      company: "University of California, Davis",
      role: "MSCS Grad",
      period: "Jul 2022 – Sep 2024",
      location: "Davis, CA",
      points: [
        "Delivered 40+ integration interfaces; re‑engineered 550+ processes; improved TAT by 80%.",
        "Cut platform costs by 80% migrating to Azure; built reliable data pipelines and APIs.",
        "Owned production reliability: on‑call, performance profiling, code reviews, and CI/CD.",
      ],
      tech: ["React", "JavaScript/TypeScript", "SpringBoot", "JEST/JUnit","Azure", "Docker", "Kubernetes", "SQL"],
      img: "https://communicationsguide.ucdavis.edu/sites/g/files/dgvnsk6246/files/styles/sf_landscape_4x3/public/images/marketing_highlight/wordmarks_5.png?h=89d6a65b&itok=LmLXGS4c",
    },
    {
      company: "UBS",
      role: "Software Engineer",
      period: "Jul 2022 – Sep 2024",
      location: "Pune, India",
      points: [
        "Delivered 40+ integration interfaces; re‑engineered 550+ processes; improved TAT by 80%.",
        "Cut platform costs by 80% migrating to Azure; built reliable data pipelines and APIs.",
        "Owned production reliability: on‑call, performance profiling, code reviews, and CI/CD.",
      ],
      tech: ["React", "JavaScript/TypeScript", "SpringBoot", "JEST/JUnit","Azure", "Docker", "Kubernetes", "SQL"],
      img: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.businesswire.com%2Fnews%2Fhome%2F20250427406336%2Fen%2FUBS-unveils-new-Workplace-Wealth-Solutions-technology-for-global-stock-plan-issuers&psig=AOvVaw2aUYW082NURA6acyrRMpYa&ust=1762913043514000&source=images&cd=vfe&opi=89978449&ved=0CBYQjRxqFwoTCODisf-A6ZADFQAAAAAdAAAAABAE",
    },
    {
      company: "UC Davis — HERD Lab",
      role: "Graduate Student Researcher (GSR)",
      period: "2025 — Present",
      location: "Davis, CA",
      points: [
        "Built ECG/EDA processing and QC pipelines for iRRRd Study (NYU Global TIES).",
        "Created reproducible data flows and dashboards for physiological analytics.",
      ],
      tech: ["R", "Python", "tidyverse", "Dashboards"],
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop",
    },
    {
      company: "UC Davis — GSM",
      role: "Teaching Assistant (ACC 455/271)",
      period: "2025 — Present",
      location: "Davis, CA",
      points: [
        "Designed AI‑integrated analytics assignments and grading rubrics.",
        "Taught data visualization and responsible AI usage in business contexts.",
      ],
      tech: ["Python", "Pandas", "Tableau", "Power BI"],
      img: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?q=80&w=1200&auto=format&fit=crop",
    },
  ];
}

function Experience() {
  const roles = useMemo(getRoles, []);

  function renderPoint(point: string, idx: number) {
    return (
      <li key={idx} className="flex gap-3 text-sm text-white/75 dark:text-white/70">
        <span className="mt-1.5 size-1.5 rounded-full bg-[var(--brand-blue)] flex-shrink-0" />
        <span>{point}</span>
      </li>
    );
  }

  function renderTech(t: string, idx: number) { return <Badge key={idx}>{t}</Badge>; }

  function renderRole(r: Role, idx: number) {
    return (
      <Reveal delay={idx * 80}>
        <Card className="p-4 md:p-5">
          <div className="flex items-start gap-6">
            <img src={r.img} alt={r.company} className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-1 ring-white/10" />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-white dark:text-white/95">{r.role} · {r.company}</h3>
                </div>
                <div className="text-sm text-white/60 dark:text-white/50 md:text-right">
                  <div>{r.period}</div>
                  <div>{r.location}</div>
                </div>
              </div>
              <ul className="mt-3 space-y-2">{r.points.map(renderPoint)}</ul>
              <div className="mt-4 flex flex-wrap gap-2">{r.tech.map(renderTech)}</div>
            </div>
          </div>
        </Card>
      </Reveal>
    );
  }

  return (
    <section id="experience" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Experience" />
        <div className="grid grid-cols-1 gap-6">{roles.map(renderRole)}</div>
      </div>
    </section>
  );
}

function getProjects(): Project[] {
  return [
    {
      title: "FinSight — Smart Personal Finance & Investment Advisor",
      blurb: "MERN + ML platform for expense tracking, savings forecasting, and ML‑driven portfolio plans. Attention‑LSTM + Markowitz; +18% Sharpe uplift; 500+ users.",
      links: [{ label: "Demo", href: "https://your-demo-link" }, { label: "Code", href: "https://github.com/your-handle/finsight" }],
      tech: ["React", "TypeScript", "Node", "FastAPI", "PostgreSQL", "Azure"],
      img: "/icon.png",
    },
    {
      title: "EventFlare — Event Engagement & Management Platform",
      blurb: "Real‑time chat, QR polls, geo discovery, and AI recommendations (82% relevance). Used by 5+ organisations.",
      links: [{ label: "Demo", href: "https://your-demo-link" }, { label: "Code", href: "https://github.com/your-handle/eventflare" }],
      tech: ["React", "Vite", "GraphQL", "WebSockets", "PostgreSQL"],
      img: "https://images.unsplash.com/photo-1515169067865-5387ec356754?q=80&w=1400&auto=format&fit=crop",
    },
    {
      title: "HERD Lab — iRRRd Physiological Data Pipelines",
      blurb: "ECG/EDA processing with QC workflows and dashboards; reproducible data products for intergenerational risk & resilience research.",
      links: [{ label: "Overview", href: "https://your-site/irr" }],
      tech: ["R", "Python", "tidyverse", "Openxlsx", "Dashboards"],
      img: "https://images.unsplash.com/photo-1511848575295-ffa4ea9b3e09?q=80&w=1400&auto=format&fit=crop",
    },
  ];
}

function Projects() {
  const items = useMemo(getProjects, []);

  function renderTech(t: string, idx: number) { return <Badge key={idx}>{t}</Badge>; }

  function renderLink(l: { label: string; href: string }, idx: number) {
    return (
      <a key={idx} href={l.href} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 text-sm font-900 text-white/80 dark:text-white/75 hover:text-[var(--brand-blue)] transition-colors">
        {l.label}
        <ExternalIcon />
      </a>
    );
  }

  function renderItem(p: Project, idx: number) {
    return (
      <Reveal delay={idx * 80}>
        <Card className="p-4 md:p-5">
          <div className="overflow-hidden rounded-xl aspect-[16/9] w-full mb-3">
            <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-white dark:text-white/95">{p.title}</h3>
          <p className="mt-2 text-xs md:text-sm text-white/70 dark:text-white/65">{p.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-2">{p.tech.map(renderTech)}</div>
          <div className="mt-4 flex items-center gap-4">{p.links.map(renderLink)}</div>
        </Card>
      </Reveal>
    );
  }

  return (
    <section id="projects" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Projects" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{items.map(renderItem)}</div>
      </div>
    </section>
  );
}

function Skills() {
  const stacks = useMemo(function () {
    return [
      { group: "Languages", items: ["C++", "Java", "Python", "JavaScript", "TypeScript"] },
      { group: "Frameworks", items: ["React", "Next.js", "Node", "Express", "FastAPI", "Spring Boot"] },
      { group: "Data & Infra", items: ["PostgreSQL", "MongoDB", "Azure", "Kubernetes", "Docker", "CI/CD"] },
      { group: "Concepts", items: ["System Design", "Microservices", "REST/GraphQL", "ML for Product", "DSA"] },
    ];
  }, []);

  function renderItem(itm: string, idx: number) { return <Badge key={idx}>{itm}</Badge>; }
  function renderGroup(g: { group: string; items: string[] }, idx: number) {
    return (
      <Reveal delay={idx * 60}>
        <Card>
          <h4 className="text-sm font-semibold text-white dark:text-white/95 mb-4">{g.group}</h4>
          <div className="flex flex-wrap gap-2">{g.items.map(renderItem)}</div>
        </Card>
      </Reveal>
    );
  }

  return (
    <section id="skills" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Skills" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{stacks.map(renderGroup)}</div>
      </div>
    </section>
  );
}

function getPosts() {
  return [
    { title: "10 Ways to Solve Fibonacci (with time complexity)", href: "https://medium.com/@your-handle/fibonacci-10-ways", date: "2025", img: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop" },
    { title: "Attention‑LSTM + Markowitz for Smart Allocation", href: "https://medium.com/@your-handle/modelx-allocation", date: "2025", img: "https://images.unsplash.com/photo-1518183214770-9cffbec72538?q=80&w=1200&auto=format&fit=crop" },
    { title: "Event Platforms with GraphQL", href: "https://medium.com/@your-handle/event-graphql", date: "2024", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop" },
    { title: "Clean Architecture for FastAPI", href: "https://medium.com/@your-handle/fastapi-clean", date: "2024", img: "https://images.unsplash.com/photo-1534759846116-57968a6b6b77?q=80&w=1200&auto=format&fit=crop" },
  ];
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M15 18l-6-6 6-6" /></svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 6l6 6-6 6" /></svg>
  );
}

function Blogs() {
  const posts = useMemo(getPosts, []);
  const trackRef = useRef<HTMLDivElement | null>(null);

  function scrollLeft() { if (trackRef.current) { trackRef.current.scrollBy({ left: -360, behavior: "smooth" }); } }
  function scrollRight() { if (trackRef.current) { trackRef.current.scrollBy({ left: 360, behavior: "smooth" }); } }

  function renderPost(p: { title: string; href: string; date: string; img: string }, idx: number) {
    return (
      <a key={idx} href={p.href} target="_blank" rel="noreferrer noopener" className="min-w-[260px] max-w-[260px] sm:min-w-[280px] sm:max-w-[280px] md:min-w-[320px] md:max-w-[320px] flex-shrink-0 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:bg-white/10 hover:border-white/20 transition-all text-white/90 dark:text-white/85 group">
        <div className="aspect-video w-full overflow-hidden">
          <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium pr-4">{p.title}</h4>
            <ArrowRightIcon />
          </div>
          <p className="text-xs text-white/50 dark:text-white/45 mt-2">{p.date}</p>
        </div>
      </a>
    );
  }

  return (
    <section id="blogs" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Blogs & Articles" subtitle="" />
        <div className="flex items-center justify-center mb-4 sm:mb-6 gap-2 sm:gap-3">
          <button onClick={scrollLeft} className="rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm p-2.5 sm:p-3 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95">
            <ArrowLeftIcon />
          </button>
          <button onClick={scrollRight} className="rounded-full border-2 border-white/20 bg-white/5 backdrop-blur-sm p-2.5 sm:p-3 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all shadow-lg hover:scale-110 active:scale-95">
            <ArrowRightIcon />
          </button>
        </div>
        <div ref={trackRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {posts.map(renderPost)}
        </div>
      </div>
    </section>
  );
}

function Certifications() {
  const certs: Cert[] = useMemo(function () {
    return [
      { name: "Azure Fundamentals (AZ‑900)", org: "Microsoft", year: "2024", href: "https://link-to-credential" },
      { name: "Kubernetes Basics", org: "CNCF", year: "2024" },
      { name: "Data Engineering Essentials", org: "Coursera", year: "2023" },
    ];
  }, []);

  function renderCert(c: Cert, idx: number) {
    return (
      <Reveal delay={idx * 80}>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white dark:text-white/95">{c.name}</h4>
              <p className="text-xs text-white/60 dark:text-white/50 mt-1">{c.org} · {c.year}</p>
            </div>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer noopener" className="text-white/70 hover:text-[var(--brand-blue)] transition-colors"><ExternalIcon /></a>
            ) : null}
          </div>
        </Card>
      </Reveal>
    );
  }

  return (
    <section id="certs" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Beyond Code!" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{certs.map(renderCert)}</div>
      </div>
    </section>
  );
}

// ------------ Contact Form ------------
function ContactInfoCard({ icon, title, content, href }: { icon: React.ReactNode; title: string; content: string; href?: string }) {
  const contentElement = href ? (
    <a href={href} className="text-white/80 hover:text-[var(--brand-blue)] transition-colors">{content}</a>
  ) : (
    <span className="text-white/80">{content}</span>
  );

  return (
    <Card className="flex items-start gap-4 p-5">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--brand-blue)]/20 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-white/90 mb-1">{title}</h4>
        <div className="text-sm">
          {contentElement}
        </div>
      </div>
    </Card>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load EmailJS script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // Check if EmailJS is loaded and configured
      const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'YOUR_SERVICE_ID';
      const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';
      const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

      if (window.emailjs && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
        // Initialize EmailJS
        window.emailjs.init(EMAILJS_PUBLIC_KEY);

        await window.emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          {
            from_name: formData.name,
            from_email: formData.email,
            subject: formData.subject,
            message: formData.message,
            to_email: 'hrahman@ucdavis.edu'
          }
        );
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 3000);
      } else {
        // Fallback: Use mailto if EmailJS not configured
        const mailtoLink = `mailto:hrahman@ucdavis.edu?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`;
        window.location.href = mailtoLink;
        setStatus('success');
        setTimeout(() => setStatus('idle'), 2000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:border-[#6A6AFF] focus:ring-2 focus:ring-[#6A6AFF]/20 transition-all"
              placeholder="Your name"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:border-[#6A6AFF] focus:ring-2 focus:ring-[#6A6AFF]/20 transition-all"
              placeholder="your.email@example.com"
            />
          </div>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-white/80 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:border-[#6A6AFF] focus:ring-2 focus:ring-[#6A6AFF]/20 transition-all"
            placeholder="What's this about?"
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-white/80 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder-white/40 focus:outline-none focus:border-[#6A6AFF] focus:ring-2 focus:ring-[#6A6AFF]/20 transition-all resize-none"
            placeholder="Tell me about your project or just say hello..."
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className="w-full px-6 py-4 rounded-xl bg-[var(--brand-blue)] text-white font-medium hover:bg-[var(--brand-blue-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--brand-blue)]/20 hover:shadow-[#6A6AFF]/30 flex items-center justify-center gap-2"
        >
          {status === 'sending' ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : status === 'success' ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Message Sent!
            </>
          ) : status === 'error' ? (
            'Error - Try Again'
          ) : (
            <>
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                {/* Arrow Right (outline) */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 12h14m-6-6l6 6-6 6"
                />
              </svg>
              Send Message
            </>
          )}
        </button>
        {status === 'error' && (
          <p className="text-sm text-red-400 text-center">
            There was an error sending your message. Please try again or email me directly at hrahman@ucdavis.edu
          </p>
        )}
      </form>
    </Card>
  );
}

function Contact() {
  return (
    <section id="contact" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Let's Collaborate!" subtitle="" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 sm:gap-8 mt-8 sm:mt-12">
          <Reveal delay={0}>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white/90 mb-6">Contact Information</h3>
              <ContactInfoCard
                icon={<MailIcon />}
                title="Work Email"
                content="hrahman@ucdavis.edu"
                href="mailto:hrahman@ucdavis.edu"
              />
              <ContactInfoCard
                icon={<MailIcon />}
                title="Personal Email"
                content="haseebshaik00@gmail.com"
                href="mailto:haseebshaik00@gmail.com"
              />
              <ContactInfoCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                }
                title="Location"
                content="Davis, CA (Open to relocate)"
              />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

// ------------ Chrome ------------
function Footer() {
  return (
    <footer className="pt-12 sm:pt-16 pb-8 sm:pb-10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs">
            <a href="https://github.com/haseebshaik00/haseebshaik00.github.io" target="_blank" rel="noreferrer noopener" className="text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] hover:underline transition-colors">
              © {new Date().getFullYear()}, Shaik Haseeb Ur Rahman. All rights reserved.
            </a>
          </p>
          <div className="flex items-center gap-3">
            <SocialIcon label="Email" href="mailto:hrahman@ucdavis.edu"><MailIcon /></SocialIcon>
            <SocialIcon label="LinkedIn" href="https://linkedin.com/in/haseebshaik00"><LinkedInIcon /></SocialIcon>
            <SocialIcon label="GitHub" href="https://github.com/haseebshaik00"><GithubIcon /></SocialIcon>
            <SocialIcon label="Handshake" href="https://ucdavis.joinhandshake.com/profiles/haseebshaik00"><HandshakeIcon /></SocialIcon>
            <SocialIcon label="Medium" href="https://medium.com/@haseebshaik00"><MediumIcon /></SocialIcon>
            <SocialIcon label="Leetcode" href="https://leetcode.com/u/haseebshaik00/"><LeetcodeIcon /></SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = useMemo(function () {
    return [
      { name: "About", href: "#about" },
      { name: "Experience", href: "#experience" },
      { name: "Projects", href: "#projects" },
      { name: "Skills", href: "#skills" },
      { name: "Leadership", href: "#certs" },
      { name: "Blogs", href: "#blogs" },
      { name: "Contact", href: "#contact" },
    ];
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function renderLink(l: { name: string; href: string }, idx: number) { return <NavLink key={idx} href={l.href}>{l.name}</NavLink>; }

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-950/80 border-b transition-all duration-300 ${scrolled ? 'border-white/10 shadow-lg shadow-black/10' : 'border-transparent'} text-white`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16 h-14 sm:h-16 flex items-center justify-between">
        <a href="#home" className="font-bold tracking-tight text-white hover:text-[var(--brand-blue)] transition-colors text-lg sm:text-xl"><b>Shaik Haseeb Ur Rahman</b></a>
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6 font-bold">{links.map(renderLink)}</nav>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white/80 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-neutral-950/95 backdrop-blur-xl">
          <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16 py-4 flex flex-col gap-4">
            {links.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                onClick={handleMobileLinkClick}
                className="text-sm text-white/70 hover:text-white transition-colors font-medium py-2"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950" style={{ scrollBehavior: 'smooth' }}>
      <LoadingSplash />
      <Navbar />
      <main className="pb-10">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Certifications />
        <Blogs />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
