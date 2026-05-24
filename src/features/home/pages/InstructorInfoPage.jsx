import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight, Users, ShieldCheck, Coins, Award, HelpCircle, 
  ChevronDown, BookOpen, MessageSquare, Play, Sparkles, TrendingUp 
} from "lucide-react";
import { ROUTES } from "@/constants";

const InstructorInfoPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { label: "Active Instructors", value: "300+", desc: "World-class industry mentors" },
    { label: "Instructor Share", value: "70%", desc: "Direct payout with no hidden fees" },
    { label: "Learners Worldwide", value: "52,000+", desc: "Hungry for advanced IT skills" },
    { label: "Average Rating", value: "4.8/5", desc: "Top student satisfaction score" }
  ];

  const benefits = [
    {
      icon: <Coins className="w-6 h-6 text-emerald-600" />,
      title: "Monetize Your Knowledge",
      desc: "Earn passive income by teaching what you love. Set your own prices and make money with every single purchase."
    },
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Reach a Global Audience",
      desc: "Connect with tens of thousands of IT professionals and students seeking high-quality training worldwide."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-600" />,
      title: "Build Your Personal Brand",
      desc: "Establish yourself as an authority in the IT industry. Grow your student base, get reviews, and build a stellar profile."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-rose-600" />,
      title: "Complete Intellectual Control",
      desc: "You retain ownership of your content. Create, edit, structure, or hide courses whenever you want."
    }
  ];

  const steps = [
    {
      step: "01",
      title: "Apply in 2 Minutes",
      desc: "Click 'Become an Instructor', select your area of expertise, specify your years of experience, and submit."
    },
    {
      step: "02",
      title: "Build Your Course",
      desc: "Design your curriculum section by section. Upload crystal clear instructional videos and downloadable lesson resources."
    },
    {
      step: "03",
      title: "Publish & Earn",
      desc: "Once verified by admins, your course goes live! Enjoy a generous 70% share of each sale paid directly to your wallet."
    }
  ];

  const faqs = [
    {
      q: "What are the rules and guidelines for uploading courses?",
      a: "Courses must consist of high-quality video lessons structured in distinct sections. Audio must be clear, and explanations must be accurate. Ensure you include coding examples, templates, or PDF resources to assist learners."
    },
    {
      q: "What is the revenue sharing model?",
      a: "Instructors receive a massive 70% commission on all course sales. The platform retains 30% to cover hosting, streaming, payment gateways, marketing, and operational expenses."
    },
    {
      q: "How do I withdraw my earnings?",
      a: "You can request a withdrawal directly from your instructor finance portal once your available balance meets the minimum threshold (100 EGP). We pay out via Paymob, Vodafone Cash, Bank Transfer, or InstaPay."
    },
    {
      q: "Does the platform offer promotional support?",
      a: "Yes! The platform actively markets high-performing courses to its student base via weekly newsletters, homepage features, and social media channels at no extra cost to you."
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased overflow-x-hidden">
      
      {/* ─── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-16 sm:py-32 overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50">
        <div className="absolute inset-0 pointer-events-none">
          {/* Radial ambient glow */}
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-40 bg-blue-100 blur-[130px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[80%] h-[80%] rounded-full opacity-30 bg-indigo-100 blur-[150px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> Shape the future of IT
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight max-w-4xl mx-auto">
            Share your expertise. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Earn at scale as an Educator.
            </span>
          </h1>

          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join the fastest-growing professional IT academy. Publish courses, mentor global talent, and build a rewarding residual income stream.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              onClick={() => navigate(ROUTES.BECOME_INSTRUCTOR)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base transition-all duration-300 hover:shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:-translate-y-0.5"
            >
              Start Teaching Today
              <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#rules"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-350 transition-all font-semibold shadow-sm"
            >
              <Play className="w-4 h-4 fill-slate-700 text-slate-700" />
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* ─── STATS GRID ─────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center p-4 rounded-2xl bg-slate-50/50 border border-slate-100 backdrop-blur-sm">
                <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-1">{s.value}</p>
                <p className="text-sm font-semibold text-blue-600 mb-1">{s.label}</p>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BENEFITS SECTION ────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Why Teach on Our Platform?</h2>
          <p className="text-slate-500 font-medium">Everything you need to turn your industry insights into a profitable online teaching business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white hover:bg-slate-50/50 border border-slate-200/60 hover:border-slate-300 transition-all duration-300 flex items-start gap-5 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                {b.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{b.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS (RULES & PROCESS) ──────────────────────────────────────── */}
      <section id="rules" className="py-24 bg-white border-y border-slate-200/80 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 bg-indigo-500 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Simple Roadmap</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 mb-4">How to Become a Verified Instructor</h2>
            <p className="text-slate-500 font-medium">Start teaching and earning in three simple, structured phases.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="relative p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-slate-350 hover:bg-slate-50/50 transition-all duration-300 group">
                <span className="absolute top-6 right-8 text-5xl font-black text-slate-200 group-hover:text-slate-300/60 transition-colors duration-300 select-none">{s.step}</span>
                <h3 className="text-xl font-bold text-slate-900 mb-3 mt-4">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ACCORDION ───────────────────────────────────────────────────────── */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <HelpCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Frequently Asked Questions</h2>
          <p className="text-slate-500 font-medium">Clear answers to help you start your journey seamlessly.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-300">
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 text-base pr-4">{faq.q}</span>
                  <ChevronDown className={["w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300", isOpen ? "rotate-180 text-blue-600" : ""].join(" ")} />
                </button>
                <div
                  className={["transition-all duration-300 ease-in-out overflow-hidden border-t border-transparent", 
                    isOpen ? "max-h-[300px] p-6 bg-slate-50/30 border-slate-100" : "max-h-0"
                  ].join(" ")}
                >
                  <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── BOTTOM CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 relative overflow-hidden border-t border-slate-200">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full opacity-35 bg-blue-200 blur-[80px]" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full opacity-35 bg-purple-200 blur-[80px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            Ready to teach advanced IT?
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Apply today and start publishing. Guide developers, software engineers, and IT specialists across the Arab world and globally.
          </p>
          <button
            onClick={() => navigate(ROUTES.BECOME_INSTRUCTOR)}
            className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold transition-all hover:scale-105 shadow-lg shadow-blue-900/10"
          >
            Apply to Become an Instructor
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default InstructorInfoPage;
