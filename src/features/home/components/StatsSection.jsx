import { useEffect, useRef, useState } from "react";
import {
  Users,
  BookOpen,
  Award,
  TrendingUp,
} from "lucide-react";

// ─── Stats Data ───────────────────────────────────────────────────────────────
const STATS = [
  {
    id: "learners",
    icon: Users,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    value: 52000,
    suffix: "+",
    display: "52,000+",
    label: "Active Learners",
    description: "Students from 80+ countries",
  },
  {
    id: "courses",
    icon: BookOpen,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    value: 500,
    suffix: "+",
    display: "500+",
    label: "Courses",
    description: "Across 20 IT disciplines",
  },
  {
    id: "completion",
    icon: TrendingUp,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    value: 94,
    suffix: "%",
    display: "94%",
    label: "Completion Rate",
    description: "Industry-leading retention",
  },
  {
    id: "certs",
    icon: Award,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    value: 18400,
    suffix: "+",
    display: "18,400+",
    label: "Certificates Issued",
    description: "Recognized by top employers",
  },
];

// ─── Animated counter hook ────────────────────────────────────────────────────
const useCountUp = (target, duration = 1800, triggered = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!triggered) return;

    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, triggered]);

  return count;
};

// ─── Single stat card ─────────────────────────────────────────────────────────
const StatCard = ({ stat, triggered, index }) => {
  const Icon = stat.icon;
  const raw = useCountUp(stat.value, 1600 + index * 100, triggered);

  // Format number with commas
  const formatted =
    raw >= 1000
      ? raw.toLocaleString() + stat.suffix
      : raw + stat.suffix;

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">

      {/* Subtle background accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-gray-50/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2} />
      </div>

      {/* Number */}
      <p className="text-3xl font-bold text-gray-900 tabular-nums leading-none mb-1">
        {triggered ? formatted : "—"}
      </p>

      {/* Label */}
      <p className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</p>

      {/* Description */}
      <p className="text-xs text-gray-400">{stat.description}</p>
    </div>
  );
};

// ─── Section Component ────────────────────────────────────────────────────────
const Stats = () => {
  const [triggered, setTriggered] = useState(false);
  const sectionRef = useRef(null);

  // Trigger counter animation when section enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              Platform at a Glance
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Numbers that speak for themselves
          </h2>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Thousands of IT professionals trust Defura-LMS to build real-world
            skills and advance their careers.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, index) => (
            <div key={stat.id}>
              <StatCard stat={stat} triggered={triggered} index={index} />
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            "AWS Authorized Training Partner",
            "Microsoft Certified Content",
            "CompTIA Approved Provider",
            "Google Cloud Partner",
          ].map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-2 text-xs text-gray-400 font-medium"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              {badge}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Stats;
