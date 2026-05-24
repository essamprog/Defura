import { useRef, useEffect, useState } from "react";
import {
  Video,
  BadgeCheck,
  BarChart3,
  Headphones,
  Smartphone,
  ShieldCheck,
  Zap,
  Globe,
} from "lucide-react";

// ─── Features Data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    id: "video",
    icon: Video,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50",
    borderHover: "hover:border-blue-200",
    title: "HD Video Lessons",
    description:
      "Studio-quality video lectures with subtitles, speed control, and offline download support.",
  },
  {
    id: "cert",
    icon: BadgeCheck,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
    borderHover: "hover:border-emerald-200",
    title: "Verified Certificates",
    description:
      "Earn blockchain-verified certificates recognized by top employers worldwide on LinkedIn.",
  },
  {
    id: "analytics",
    icon: BarChart3,
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
    borderHover: "hover:border-indigo-200",
    title: "Progress Analytics",
    description:
      "Detailed dashboards tracking completion rates, quiz scores, and learning streaks.",
  },
  {
    id: "support",
    icon: Headphones,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
    borderHover: "hover:border-violet-200",
    title: "24/7 Expert Support",
    description:
      "Access live Q&A sessions, community forums, and direct instructor messaging anytime.",
  },
  {
    id: "mobile",
    icon: Smartphone,
    iconColor: "text-sky-600",
    iconBg: "bg-sky-50",
    borderHover: "hover:border-sky-200",
    title: "Mobile-First Learning",
    description:
      "Native iOS and Android apps with offline mode so you learn anywhere, anytime.",
  },
  {
    id: "security",
    icon: ShieldCheck,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50",
    borderHover: "hover:border-rose-200",
    title: "Secure & Private",
    description:
      "Enterprise-grade encryption, GDPR-compliant data handling, and secure payments.",
  },
  {
    id: "speed",
    icon: Zap,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
    borderHover: "hover:border-amber-200",
    title: "Adaptive Learning Paths",
    description:
      "AI-powered recommendations personalize your curriculum based on your goals and pace.",
  },
  {
    id: "global",
    icon: Globe,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50",
    borderHover: "hover:border-teal-200",
    title: "Global Community",
    description:
      "Connect with 52,000+ peers across 80 countries in study groups and coding challenges.",
  },
];

// ─── Single Feature Card ──────────────────────────────────────────────────────
const FeatureCard = ({ feature, visible }) => {
  const Icon = feature.icon;

  return (
    <div
      className={[
        "group bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4",
        "transition-all duration-500 hover:shadow-lg hover:-translate-y-1",
        feature.borderHover,
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDelay: visible ? `${FEATURES.indexOf(feature) * 60}ms` : "0ms" }}
    >
      {/* Icon */}
      <div
        className={[
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          "transition-transform duration-300 group-hover:scale-110",
          feature.iconBg,
        ].join(" ")}
      >
        <Icon className={`w-5 h-5 ${feature.iconColor}`} strokeWidth={2} />
      </div>

      {/* Text */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
          {feature.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

// ─── Section ──────────────────────────────────────────────────────────────────
const Features = () => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-4">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              Why Defura-LMS
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Everything you need to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              accelerate your career
            </span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Built specifically for IT professionals, Defura-LMS combines
            industry-relevant content with the tools to help you learn faster
            and smarter.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} visible={visible} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Features;