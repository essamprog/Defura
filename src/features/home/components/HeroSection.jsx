import { useNavigate } from "react-router-dom";
import { ArrowRight, Play, Star, Users, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui";
import { ROUTES } from "@/constants";

// ─── Social proof avatars (placeholder initials) ──────────────────────────────
const AVATARS = [
  { initials: "AJ", color: "bg-blue-500" },
  { initials: "SR", color: "bg-indigo-500" },
  { initials: "MK", color: "bg-violet-500" },
  { initials: "TL", color: "bg-sky-500" },
];



// ─── Tech badge pill ───────────────────────────────────────────────────────────
const TECH_TAGS = [
  "React", "Node.js", "Python", "AWS", "Docker", "TypeScript",
  "Kubernetes", "Machine Learning",
];

// ─── Component ────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gray-950">

      {/* ── Geometric grid background ─────────────────────────── */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,.8) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Radial glow (hero accent) ──────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[30%] w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>



      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4 pb-48">
        <div className="max-w-3xl mx-auto text-center">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
            <span className="text-blue-400 text-xs font-medium tracking-wide uppercase">
              The #1 Platform for IT Graduates
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Master the Skills
            <br />
            <span className="relative inline-block">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
                Industry Demands
              </span>
              {/* Underline accent */}
              <svg
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 300 8"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M2 6 Q75 2 150 5 Q225 8 298 3"
                  stroke="url(#underlineGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="underlineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            EDUManage delivers hands-on IT courses built for the real world.
            From cloud architecture to full-stack development — accelerate your
            career with expert-led learning.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <button
              onClick={() => navigate(ROUTES.REGISTER)}
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-500/35 hover:-translate-y-0.5"
            >
              Get Started — It's Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate(ROUTES.COURSES)}
              className="group inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white text-sm font-medium transition-all duration-200 hover:-translate-y-0.5"
            >
              <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Play className="w-3 h-3 fill-white text-white ml-0.5" />
              </span>
              Watch Demo
            </button>
          </div>

          {/* Social proof strip */}
          <div className="flex items-center justify-center gap-3">
            {/* Stacked avatars */}
            <div className="flex items-center -space-x-2">
              {AVATARS.map((av) => (
                <div
                  key={av.initials}
                  className={`w-8 h-8 rounded-full ${av.color} border-2 border-gray-950 flex items-center justify-center text-xs font-bold text-white shrink-0`}
                >
                  {av.initials}
                </div>
              ))}
            </div>
            <div className="h-5 w-px bg-white/10" />
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-gray-400">
                Trusted by <span className="text-white font-medium">52,000+</span> learners
              </span>
            </div>
          </div>

          {/* Tech tags */}
          <div className="mt-14">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 font-medium">
              Topics covered
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {TECH_TAGS.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/8 text-gray-400 hover:text-gray-200 hover:border-white/20 hover:bg-white/10 transition-all duration-150 cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Wavy Bottom Divider ─────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
        <svg
          className="relative block w-full h-[60px] sm:h-[90px] lg:h-[120px]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            className="fill-gray-50"
            fillOpacity="1"
            d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,229.3C840,256,960,288,1080,282.7C1200,277,1320,235,1380,213.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;