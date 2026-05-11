import { useEffect, useRef, useState } from "react";
import { Search, ShoppingCart, PlayCircle, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

// ─── Steps data ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    step: "01",
    icon: Search,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    ringColor: "ring-blue-100",
    lineColor: "from-blue-200 to-indigo-200",
    title: "Find Your Course",
    description:
      "Browse 500+ IT courses filtered by skill level, technology stack, and career goal. Our search makes it easy.",
  },
  {
    step: "02",
    icon: ShoppingCart,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    ringColor: "ring-indigo-100",
    lineColor: "from-indigo-200 to-violet-200",
    title: "Enroll Instantly",
    description:
      "Secure checkout in under 60 seconds. Lifetime access included, with a 30-day money-back guarantee.",
  },
  {
    step: "03",
    icon: PlayCircle,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    ringColor: "ring-violet-100",
    lineColor: "from-violet-200 to-emerald-200",
    title: "Learn at Your Pace",
    description:
      "Watch HD videos, complete hands-on labs, and take quizzes. Access from any device, online or offline.",
  },
  {
    step: "04",
    icon: Award,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    ringColor: "ring-emerald-100",
    lineColor: "",
    title: "Earn & Share",
    description:
      "Complete the course and receive a blockchain-verified certificate. Share it on LinkedIn in one click.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const HowItWorks = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Simple Process
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            From signup to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              certified
            </span>{" "}
            in 4 steps
          </h2>
          <p className="text-gray-500 text-base">
            No complicated setup. No prerequisites. Just log in and start
            learning immediately.
          </p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Horizontal connector line (desktop only) */}
          <div className="hidden md:block absolute top-[52px] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 z-0" />

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className={[
                  "relative z-10 flex flex-col items-center text-center transition-all duration-500",
                  visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                ].join(" ")}
                style={{ transitionDelay: `${index * 120}ms` }}
              >
                {/* Step number badge */}
                <div className="relative mb-5">
                  <div
                    className={[
                      "w-[104px] h-[104px] rounded-full flex flex-col items-center justify-center",
                      "bg-white border-2 border-gray-100 shadow-sm ring-8",
                      step.ringColor,
                    ].join(" ")}
                  >
                    {/* Icon */}
                    <div className={`w-11 h-11 rounded-xl ${step.iconBg} flex items-center justify-center mb-1`}>
                      <Icon className={`w-5 h-5 ${step.iconColor}`} />
                    </div>
                    {/* Step number */}
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest">
                      STEP {step.step}
                    </span>
                  </div>
                </div>

                {/* Text */}
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <button
            onClick={() => navigate(ROUTES.REGISTER)}
            className="group inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
          >
            Start Learning Today
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <p className="mt-3 text-xs text-gray-400">
            No credit card required · Cancel anytime
          </p>
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;