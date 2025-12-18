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
interface Role { company: string; role: string; period: string; location: string; points: (string | React.ReactNode)[]; tech: string[]; img: string; imgClassName?: string; }
interface Project { title: string; blurb: string; links: { label: string; href: string }[]; tech: string[]; img: string; }
interface Cert { name: string; org: string; year: string; description?: string; href?: string }

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
        <span className="font-medium">Open to Fulltime SDE Roles & <br /> Summer'26 SDE Internships!</span>
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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Reduced offset for less space at top
      const offsetTop = targetElement.offsetTop - 0;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Remove hash from URL after scrolling
      setTimeout(() => {
        window.history.replaceState(null, '', window.location.pathname);
      }, 100);
    }
  };

  return (
    <a href={href} onClick={handleClick} className="text-sm text-white/70 hover:text-white transition-colors">
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
              <p className="tracking-widest text-[10px] sm:text-xs md:text-[12px] text-neutral-400 dark:text-neutral-500"><b>Open to Fulltime Software Engineer Roles & Summer'26 SDE Internships!
                <br /> <span className="italic">Location: Davis, CA (Open to Relocation)</span>
                </b>
                </p>
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
                  {/* <span className="w-full"></span> */}
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
                    Researcher @ HERD Lab & ExpoLab, UC Davis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-blue)]"></span>
                    Research & Teaching Assistant, Graduate School of Management, UC Davis
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
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    const targetId = '#contact'.replace('#', '');
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                      // Reduced offset for less space at top
                      const offsetTop = targetElement.offsetTop - 0;
                      window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                      });
                      // Remove hash from URL after scrolling
                      setTimeout(() => {
                        window.history.replaceState(null, '', window.location.pathname);
                      }, 100);
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-xl px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium bg-[#22C55E] text-white hover:bg-[#16A34A] transition-all shadow-lg shadow-[#22C55E]/20 hover:scale-105 active:scale-95"
                >
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
                  src={import.meta.env.BASE_URL + 'picture.png'}
                  alt="Your portrait"
                  className="w-full h-full object-cover object-bottom"
                  onError={(e) => {
                    console.error('Failed to load profile picture:', e);
                    const target = e.target as HTMLImageElement;
                    target.style.backgroundColor = 'rgba(255,255,255,0.1)';
                  }}
                  onLoad={() => console.log('Profile picture loaded successfully')}
                  loading="lazy"
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
          <Card className="max-w-6xl mx-auto bg-white/10 border border-white/20">
            <div className="text-white/80 dark:text-white/75 leading-7 text-base md:text-lg">
              <p>I'm currently pursuing <a href="https://www.linkedin.com/in/haseebshaik00/overlay/1759710762723/single-media-viewer/?type=DOCUMENT&profileId=ACoAACsxNGgBiud29STPssCuUdPlfSyqxDGRVns" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-600 font-medium">Master's in Computer Science (GPA: 3.91) </a> at the University of California, Davis, focusing on building scalable, secure, AI-driven full-stack products. 
              I also hold a <a href="https://www.linkedin.com/in/haseebshaik00/overlay/education/584866014/multiple-media-viewer/?profileId=ACoAACsxNGgBiud29STPssCuUdPlfSyqxDGRVns&treasuryMediaId=1727937170325" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-600 font-medium">Bachelor's in Computer Science (CGPA: 9.34)</a> from VIT Vellore, India. My experience spans three years as a <a 
                  href="#experience"
                  onClick={(e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById('experience');
                    if (targetElement) {
                      const offsetTop = targetElement.offsetTop - 60;
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                      setTimeout(() => window.history.replaceState(null, '', window.location.pathname), 100);
                    }
                  }}
                  className="text-blue-400 underline hover:text-blue-600 font-medium cursor-pointer"
                >Software Engineer at UBS</a>, two internships (UBS and PitchKrafts), and my current roles as a <a 
                  href="#experience"
                  onClick={(e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById('experience');
                    if (targetElement) {
                      const offsetTop = targetElement.offsetTop - 60;
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                      setTimeout(() => window.history.replaceState(null, '', window.location.pathname), 100);
                    }
                  }}
                  className="text-blue-400 underline hover:text-blue-600 font-medium cursor-pointer"
                >Research & Teaching Assistant</a> at UC Davis's Graduate School of Management and a <a 
                  href="#experience"
                  onClick={(e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById('experience');
                    if (targetElement) {
                      const offsetTop = targetElement.offsetTop - 60;
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                      setTimeout(() => window.history.replaceState(null, '', window.location.pathname), 100);
                    }
                  }}
                  className="text-blue-400 underline hover:text-blue-600 font-medium cursor-pointer"
                >Researcher</a> at the HERD Lab and ExpoLab. I specialize in Algorithms, Software Engineering, Full-Stack Development, System Design, and Machine Learning.</p>
              <p className="mt-6">
                I've been recognized for innovation, collaboration, and leadership at UBS through <a 
                  href="#certs"
                  onClick={(e) => {
                    e.preventDefault();
                    const targetElement = document.getElementById('certs');
                    if (targetElement) {
                      const offsetTop = targetElement.offsetTop - 60;
                      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                      setTimeout(() => window.history.replaceState(null, '', window.location.pathname), 100);
                    }
                  }}
                  className="text-blue-400 underline hover:text-blue-600 font-medium cursor-pointer"
                >JOSH and CSR initiatives</a>, led numerous campus marketing initiatives, and received media recognition for ed-tech work at VIT Vellore. When I'm not working, you'll find me volunteering with NGOs, exploring new places, and binge-watching shows.
              </p>
            </div>
            {/* Organization Images */}
            <div className="mt-8 grid grid-cols-3 sm:grid-cols-6 gap-6 items-center justify-items-center">
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 sm:h-24 w-full">
                <img src="/ucdavis.png" alt="UC Davis" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 sm:h-24 w-full">
                <img src="/ucdavis-gsm.avif" alt="UC Davis GSM" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 sm:h-24 w-full">
                <img src="/herd-lab.png" alt="HERD Lab" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 sm:h-24 w-full">
                <img src="/expo-lab.png" alt="ExpoLab" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 sm:h-24 w-full">
                <img src="/UBS-logo.png" alt="UBS" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
              <div className="bg-white rounded-lg p-3 flex items-center justify-center h-20 sm:h-24 w-full">
                <img src="/vit.png" alt="VIT Vellore" className="h-16 sm:h-20 w-auto object-contain" />
              </div>
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
      role: "MSCS Graduate Student, Teaching Assistant and Researcher",
      period: "Sep 2024 – Present",
      location: "Davis, CA",
      points: [
        <>Building scalable, secure, AI-driven full-stack products. Also, scaling <a href="https://github.com/haseebshaik00/FinSight" target="_blank" rel="noopener noreferrer" className="underline text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] transition-colors">FinSight</a> on ResilientDB at <a href="https://expolab.org/" target="_blank" rel="noopener noreferrer" className="underline text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] transition-colors">ExpoLab</a> by integrating a bill-splitting module that enables transparent, auditable transactions between individuals</>,
        <>As a Research & Teaching Assistant at <a href="https://gsm.ucdavis.edu/" target="_blank" rel="noopener noreferrer" className="underline text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] transition-colors">Graduate School of Management, UC Davis</a>, teaching AI-integrated data analytics (SQL, Alteryx, Access, iXBRL, Excel, Tableau, and Power BI) to a cohort of 45+ students; Designing accounting & analytics coursework with an emphasis on ethical AI</>,
        <>Developing iRRd data pipelines at the <a href="https://herdlab.faculty.ucdavis.edu/" target="_blank" rel="noopener noreferrer" className="underline text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] transition-colors">HERD Lab</a> in collaboration with <a href="https://globaltiesforchildren.nyu.edu/" target="_blank" rel="noopener noreferrer" className="underline text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] transition-colors">NYU Global TIES for Children</a>; introduced batched execution saving 24+ hours per execution and built ECG/EDA compliant MIRAGE mapping apps</>
      ],
      tech: ["Software Engineering", "System Design", "Data Acquisition", "Visual Analytics", "Ethical AI", "Distributed Systems", "Machine Learning"],
      img: "/ucdavis.png",
    },
    {
      company: "UBS",
      role: "Software Engineer",
      period: "Jul 2022 – Sep 2024",
      location: "Pune, India",
      points: [
        "Redesigned 200+ React/TypeScript UIs curtailing submission time by 4.5 seconds and clicks from 15 to <10",
        "Re-engineered 550+ processes achieving 60% improvement in turnaround time, reducing 80% operational cost via vendor consolidation & Azure migration",
        "Built 42+ integration interfaces for Global Wealth Management streamlining client workflows; contributing to $300M+ FY’22–’24 revenue",
        "Owned end-to-end workflow with 95% defects reduction across 40+ SIT cycles, ensuring production stability",
        <>Earned <a href="https://www.credly.com/badges/2a455056-0625-459c-b96e-ba3245b1a22a" target="_blank" rel="noopener noreferrer" className="underline text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] transition-colors">Certified Engineer</a> title and recognised with <a rel="noopener noreferrer" className="underline text-[var(--brand-blue)] hover:text-[var(--brand-blue-400)] transition-colors">4 awards</a> for exceptional performance and leadership in JOSH and CSR initiatives</>
      ],
      tech: ["React", "JavaScript/TypeScript", "SpringBoot", "JEST/JUnit", "Azure", "Docker", "Kubernetes", "SQL"],
      img: "/UBS-logo.png",
      imgClassName: "bg-white object-contain w-24 h-24 md:w-28 md:h-28 rounded-2xl p-3",
    },
    {
      company: "UBS",
      role: "Software Engineer Intern",
      period: "Jan 2022 – Jun 2022",
      location: "Pune, India",
      points: [
        "Re-engineered SLP into multi-tier microservices; proactively troubleshot issues to cut the defect ratio by 0.4 and improve code quality by 92%",
        "Built 25+ modular React/TS components (extending Broadridge’s UI framework), boosting developer productivity and saving 500+ engineering hours",
        "Shipped 6 CI/CD-compliant production releases with Docker and Kubernetes; managed production hotfixes across 12+ Agile sprints",
      ],
      tech: ["React", "JavaScript/TypeScript", "Material UI", "Broadridge UI", "SpringBoot", "JEST/JUnit", "Azure", "Docker", "Kubernetes", "SQL"],
      img: "/UBS-logo.png",
      imgClassName: "bg-white object-contain w-24 h-24 md:w-28 md:h-28 rounded-2xl p-3", // Ensures fit, white background, and padding
    },
    {
      company: "PitchKrafts",
      role: "Software Engineer Intern",
      period: "Dec 2020 – Feb 2021",
      location: "Pune, India",
      points: [
        "Led end-to-end website build (APIs, integration tests, production rollout) for a pitch-deck platform, growing the client base by 30%",
        "Designed and shipped 5+ responsive UIs (Figma → React) aligned to brand guidelines and user feedback, boosting engagement by 20%",
        "Elevated SEO with targeted keywords and on-page optimizations, increasing organic traffic by 25%",
      ],
      tech: ["React", "Bootstrap", "Figma", "NodeJS", "ExpressJS", "MongoDB", "Firebase", "SQL"],
      img: "/pitchkrafts.png",
    },
  ];
}

function Experience() {
  const roles = useMemo(getRoles, []);

  function renderPoint(point: string | React.ReactNode, idx: number) {
    return (
      <li key={idx} className="flex gap-3 text-sm text-white/75 dark:text-white/70">
        <svg
          className="w-4 h-4 text-[var(--brand-blue)]"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
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
            <img src={r.img} alt={r.company} className={r.imgClassName || "w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover ring-1 ring-white/10"} />
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div>
                  {(
                    <div>
                      <h3 className="text-lg font-semibold text-white dark:text-white/95">{r.role}</h3>
                      <p className="text-sm font-bold text-white/70 dark:text-white/60 mt-1">{r.company}</p>
                    </div>
                  )}
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
        <SectionTitle kicker="" title="Work Experience" />
        <div className="grid grid-cols-1 gap-6">{roles.map(renderRole)}</div>
      </div>
    </section>
  );
}

function getProjects(): Project[] {
  return [
    {
      title: "FinSight: Personal Finance Tracker & Investment Advisor",
      blurb: "Financial platform for funds tracking, savings forecasting, and ML‑driven portfolio plans. Used by 500+ users; Attention-LSTM + Markowitz allocation → +18% Sharpe ratio uplift and 64% decision accuracy",
      links: [{ label: "Demo", href: "https://github.com/haseebshaik00/FinSight" }, { label: "GitHub", href: "https://github.com/haseebshaik00/FinSight" }],
      tech: ["MERN Stack", "D3.js", "FastAPI", "LSTM Forecasting Models"],
      img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2940",
    },
    {
      title: "EventFlare: Event Engagement & Management Platform",
      blurb: "Event Engagement and Management Platform with real-time chat, QR polls, geo discovery, AI recommendations (82% relevance), used by 5+ organisations",
      links: [{ label: "Demo", href: "https://github.com/haseebshaik00/EventFlare" }, { label: "GitHub", href: "https://github.com/haseebshaik00/EventFlare" }],
      tech: ["React/TypeScript", "Vite", "NodeJS & FastAPI", "PostgreSQL", "GraphQL"],
      img: "https://images.unsplash.com/photo-1549451371-64aa98a6f660?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    },
    {
      title: "ASFI Popularity Paradigm",
      blurb: "Analyzed 330 Apache Incubator repos by pairing a normalized GitHub pScore with socio-technical metrics, finding that developer engagement, file-level collaboration, and governance practices drive popularity while overly dense networks correlate negatively",
      links: [{ label: "Report", href: "https://github.com/haseebshaik00/SEProject-Team4-The-Popularity-Paradigm/blob/main/final_report.pdf" }, { label: "GitHub", href: "https://github.com/haseebshaik00/SEProject-Team4-The-Popularity-Paradigm" }],
      tech: ["Apache", "ASFI", "Web Scraping", "Regression Models", "scikit-learn"],
      img: "https://images.unsplash.com/photo-1586448317606-cb1ec00298fc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070",
    },
    {
      title: "CalFit: Optimizing Health Insights",
      blurb: "CalFit predicts calorie burnt using monotone gradient-boosted trees with conformal prediction intervals, outperforming LASSO baselines while staying interpretable and reliable",
      links: [{ label: "Report", href: "https://github.com/haseebshaik00/CalFit-STA-221-Project/blob/main/Team%2011%20-%20STA%20221%20Final%20Report.pdf" }, { label: "GitHub", href: "https://github.com/haseebshaik00/CalFit-STA-221-Project" }],
      tech: ["Monotonic Gradient Boosting", "XGBoost/LightGBM", "Lasso Regression", "Gradio UI", "Hyperparameters Tuning"],
      img: "https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=987",
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
        <Card className="p-4 md:p-5 h-full flex flex-col">
          <div className="overflow-hidden rounded-xl aspect-[16/9] w-full mb-3">
            <img src={p.img} alt={p.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
          </div>
          <h3 className="text-sm md:text-base font-semibold text-white dark:text-white/95">{p.title}</h3>
          <p className="mt-2 text-xs md:text-sm text-white/70 dark:text-white/65 flex-grow">{p.blurb}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">{p.tech.map(renderTech)}</div>
          <div className="mt-4 flex items-center gap-3">{p.links.map(renderLink)}</div>
        </Card>
      </Reveal>
    );
  }

  return (
    <section id="projects" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Projects" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{items.map(renderItem)}</div>
      </div>
    </section>
  );
}

function Skills() {
  const CodeIcon = () => (
    <svg className="w-6 h-6 text-[var(--brand-blue)]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  );

  const DatabaseIcon = () => (
    <svg className="w-6 h-6 text-[var(--brand-blue)]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
      <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
      <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
    </svg>
  );

  const GearIcon = () => (
    <svg className="w-6 h-6 text-[var(--brand-blue)]" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
  );

  const FrameworkIcon = () => (
    <svg className="w-6 h-6 text-[var(--brand-blue)]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
    </svg>
  );

  const stacks = useMemo(function () {
    return [
      {
        group: "Programming Languages",
        icon: <CodeIcon />,
        items: ["C/C++", "Java", "Python", "JavaScript", "TypeScript", "HTML5", "CSS3", "Bootstrap", "Tailwind CSS", "Material UI"]
      },
      {
        group: "Frameworks and Libraries",
        icon: <FrameworkIcon />,
        items: ["ReactJS", "NodeJS", "ExpressJS", "SpringBoot", "FastAPI", "GraphQL", "RTL", "JEST", "JUnit", "Selenium"]
      },
      {
        group: "Databases and Data Tools",
        icon: <DatabaseIcon />,
        items: ["SQL", "MySQL", "PostgreSQL", "SQLite", "NoSQL", "MongoDB", "Access", "Alteryx", "Power BI"]
      },
      {
        group: "Development Tools and Services",
        icon: <GearIcon />,
        items: ["REST APIs", "GIT", "CI/CD", "JIRA", "Vite", "Postman", "Docker", "Kubernetes", "Azure", "AWS"]
      },
    ];
  }, []);

  function renderItem(itm: string, idx: number) { return <Badge key={idx}>{itm}</Badge>; }
  function renderGroup(g: { group: string; icon: React.ReactNode; items: string[] }, idx: number) {
    return (
      <Reveal delay={idx * 60}>
        <Card className="p-5 bg-white/5">
          <div className="flex items-center gap-3 mb-4">
            {g.icon}
            <h4 className="text-base font-semibold text-white dark:text-white/95">{g.group}</h4>
          </div>
          <div className="flex flex-wrap gap-2">{g.items.map(renderItem)}</div>
        </Card>
      </Reveal>
    );
  }

  return (
    <section id="skills" className="pt-16 sm:pt-20">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16">
        <SectionTitle kicker="" title="Skills" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{stacks.map(renderGroup)}</div>
      </div>
    </section>
  );
}

function getPosts() {
  return [
    { title: "DSA Prep Sheet", href: "https://prep-dsa.netlify.app/", img: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2069" },
    { title: "Coincensus: Split Bills and Track Balances Powered by ResilientDB", href: "https://medium.com/@haseebshaik00/coincensus-split-bills-and-track-balances-powered-by-resilientdb-1ec46253312a", img: "https://miro.medium.com/v2/resize:fit:1400/format:webp/1*j7LPyKLoHwY-u9iHAuyhdA.png" },
    { title: "Visual Modeling Techniques in Software and Data Engineering", href: "https://medium.com/@haseebshaik00/visual-modeling-techniques-in-software-and-data-engineering-b3c88bde223f", img: "https://miro.medium.com/v2/resize:fit:1400/format:webp/0*FjIabpj8LksHeQxn" },
    { title: "Do You Really Know Agile?", href: "https://medium.com/@haseebshaik00/do-you-really-know-agile-99a9d1d630c7", img: "https://miro.medium.com/v2/resize:fit:1400/format:webp/0*kiDbSMIeETIgiyiP" },
    { title: "Unraveling the Fibonacci Sequence: A Comprehensive Analysis of Different Approaches", href: "https://medium.com/@haseebshaik00/unraveling-the-fibonacci-sequence-a-comprehensive-analysis-of-different-approaches-c18616eec0b3", img: "https://miro.medium.com/v2/resize:fit:1400/format:webp/0*hiC_3OQtzVzXExEK" },
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

  function renderPost(p: { title: string; href: string; date?: string; img: string }, idx: number) {
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
          {p.date && <p className="text-xs text-white/50 dark:text-white/45 mt-2">{p.date}</p>}
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
      {
        name: "CDIO Champion",
        org: "UBS",
        year: "Dec 2022",
        description: "Recognized for elevating firm's culture quotient through JOSH initiatives, contributing to employee experience and involvement.",
        href: "https://www.linkedin.com/in/haseebshaik00/details/honors/1727922037681/single-media-viewer/?profileId=ACoAACsxNGgBiud29STPssCuUdPlfSyqxDGRVns"
      },
      {
        name: "Silver Volunteer 2022",
        org: "Kreedo, UBS",
        year: "Dec 2022",
        description: "Developed Practico, a gamification learning app with NGO Kreedo to enhance sensory, motor, analytical, and math skills for middle school children.",
        href: "https://www.business-standard.com/content/press-releases-ani/kreedo-early-childhood-solutions-launches-a-gaming-app-to-improve-learning-outcomes-in-budget-private-schools-and-preschools-122111600950_1.html"
      },
      {
        name: "Publicity, Marketing and Outreach Head",
        org: "SIAM VIT",
        year: "Dec 2019 - Feb 2022",
        description: "Led marketing campaigns and outreach events, boosted candidate frequency by 50% during recruitment, and increased event participation by 60% in 2020.",
        href: "https://www.linkedin.com/in/haseebshaik00/overlay/education/584866014/multiple-media-viewer/?profileId=ACoAACsxNGgBiud29STPssCuUdPlfSyqxDGRVns&treasuryMediaId=1727936862708"
      },
      {
        name: "Senior Core Committee Member",
        org: "VIT LEO CLUB",
        year: "Dec 2019 - Feb 2022",
        description: "Handled recruitment processes and organized outreach events for underprivileged schools, cancer awareness, and blood donation drives.",
        href: "https://www.linkedin.com/in/haseebshaik00/overlay/education/584866014/multiple-media-viewer/?profileId=ACoAACsxNGgBiud29STPssCuUdPlfSyqxDGRVns&treasuryMediaId=1727936862709"
      },
      {
        name: "Semi-Finalist in Ideathon 3.0",
        org: "VITMAS & 5th Pillar VIT",
        year: "Sep 2019",
        description: "Demonstrated a novel irrigation approach integrating pisciculture with a regression-based statistical model to optimize nutrient levels.",
        href: "https://www.linkedin.com/in/haseebshaik00/details/honors/1727921818315/single-media-viewer/?profileId=ACoAACsxNGgBiud29STPssCuUdPlfSyqxDGRVns"
      },
      {
        name: "Best Idea Presentation in NSABS",
        org: "Sigma XI",
        year: "Apr 2019",
        description: "Proposed an innovative solution to replace traditional plastic with bioplastics, supported by cost optimization analysis and scalability metrics.",
        href: "https://www.linkedin.com/in/haseebshaik00/details/honors/1727921536727/single-media-viewer/?profileId=ACoAACsxNGgBiud29STPssCuUdPlfSyqxDGRVns"
      }
    ];
  }, []);

  function renderCert(c: Cert, idx: number) {
    return (
      <Reveal delay={idx * 80}>
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white dark:text-white/95">{c.name}</h4>
              <p className="text-xs text-white/60 dark:text-white/50 mt-1">{c.org} · {c.year}</p>
              {c.description && (
                <p className="text-xs text-white/70 dark:text-white/60 mt-2">{c.description}</p>
              )}
            </div>
            {c.href ? (
              <a href={c.href} target="_blank" rel="noreferrer noopener" className="text-white/70 hover:text-[var(--brand-blue)] transition-colors flex-shrink-0"><ExternalIcon /></a>
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
        console.warn('EmailJS not configured. Using mailto fallback. To enable email sending, configure EmailJS environment variables.');
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
              placeholder="Full name"
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
            placeholder="Tell me about your project or just say hello!"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'sending'}
          className={`w-full px-6 py-4 rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2 ${status === 'success'
            ? '!bg-[#22C55E] hover:!bg-[#16A34A] shadow-[#22C55E]/20'
            : '!bg-[var(--brand-blue)] hover:!bg-[var(--brand-blue-600)] shadow-[var(--brand-blue)]/20 hover:shadow-[#6A6AFF]/30'
            }`}
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
                fill="currentColor"
                aria-hidden="true"
              >
                {/* Paper Airplane / Send Icon */}
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6 sm:gap-8 mt-20 sm:mt-12">
          <Reveal delay={0}>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white/90 mb-6">Contact Information</h3>
              <ContactInfoCard
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M17 3a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h10zm-6 8v5m4-5v5" /> {/* Minimal calendar icon */}
                    <rect x="3" y="7" width="18" height="14" rx="4" />
                  </svg>
                }
                title="Book an Appointment"
                content="Schedule a 1:1 on Calendly"
                href="https://calendly.com/haseebshaik00/30min"
              />
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
                href="https://maps.app.goo.gl/nfQHEdRko5vD6gqB8"
                content="Davis, CA (Open to Relocation)"
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
    <footer className="pb-4 sm:pb-6">
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

  const handleMobileLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Reduced offset for less space at top
      const offsetTop = targetId === 'home' ? 0 : targetElement.offsetTop - 60;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });

      // Remove hash from URL after scrolling
      setTimeout(() => {
        window.history.replaceState(null, '', window.location.pathname);
      }, 100);
    }
  };

  return (
    <div className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl supports-[backdrop-filter]:bg-neutral-950/80 border-b transition-all duration-300 ${scrolled ? 'border-white/10 shadow-lg shadow-black/10' : 'border-transparent'} text-white`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 xl:px-16 h-14 sm:h-16 flex items-center justify-between">
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setTimeout(() => window.history.replaceState(null, '', window.location.pathname), 100);
          }}
          className="font-bold tracking-tight text-white hover:text-[var(--brand-blue)] transition-colors text-lg sm:text-xl"
        >
          <b>Shaik Haseeb Ur Rahman</b>
        </a>
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
                onClick={(e) => handleMobileLinkClick(e, link.href)}
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
