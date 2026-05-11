import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    id: 1,
    name: "James O'Brien",
    role: "Cloud Engineer @ Google",
    avatar: "JO",
    avatarColor: "bg-blue-500",
    rating: 5,
    country: "🇺🇸 United States",
    quote:
      "EDUManage's AWS course was the most practical I've ever taken. Within 3 months I landed a Cloud Engineer role at Google. The hands-on labs made all the difference.",
    course: "AWS Solutions Architect",
  },
  {
    id: 2,
    name: "Fatima Al-Rashid",
    role: "Full-Stack Developer @ Shopify",
    avatar: "FA",
    avatarColor: "bg-violet-500",
    rating: 5,
    country: "🇦🇪 UAE",
    quote:
      "I went from zero coding knowledge to a full-time developer position in 8 months. The React & Node.js course is incredibly well-structured. Worth every penny.",
    course: "Full-Stack Development",
  },
  {
    id: 3,
    name: "Riku Tanaka",
    role: "ML Engineer @ Meta",
    avatar: "RT",
    avatarColor: "bg-emerald-500",
    rating: 5,
    country: "🇯🇵 Japan",
    quote:
      "The ML course covers real industry patterns, not just theory. The instructors are actual practitioners. I completed it while working full-time thanks to the flexible schedule.",
    course: "Machine Learning & AI",
  },
  {
    id: 4,
    name: "Chiara Bianchi",
    role: "DevOps Lead @ Spotify",
    avatar: "CB",
    avatarColor: "bg-sky-500",
    rating: 5,
    country: "🇮🇹 Italy",
    quote:
      "The Kubernetes course is hands-down the best investment I made in my career. Detailed, updated content and the community support is phenomenal.",
    course: "Kubernetes & Docker",
  },
  {
    id: 5,
    name: "Carlos Mendez",
    role: "Security Architect @ Microsoft",
    avatar: "CM",
    avatarColor: "bg-rose-500",
    rating: 5,
    country: "🇲🇽 Mexico",
    quote:
      "The certificate I earned through EDUManage is recognized by my employer. The platform is polished and the content quality is genuinely world-class.",
    course: "Cybersecurity Professional",
  },
  {
    id: 6,
    name: "Amara Diallo",
    role: "Software Engineer @ Netflix",
    avatar: "AD",
    avatarColor: "bg-amber-500",
    rating: 5,
    country: "🇸🇳 Senegal",
    quote:
      "Coming from a non-CS background, EDUManage gave me the structured learning path I needed. The mentorship and community support kept me motivated throughout.",
    course: "Full-Stack Development",
  },
];

// ─── Single testimonial card ──────────────────────────────────────────────────
const TestimonialCard = ({ testimonial, active }) => (
  <div
    className={[
      "bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 transition-all duration-300",
      active ? "shadow-lg border-blue-100 scale-[1.01]" : "shadow-sm",
    ].join(" ")}
  >
    {/* Quote icon */}
    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
      <Quote className="w-4 h-4 text-blue-500" />
    </div>

    {/* Stars */}
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>

    {/* Quote */}
    <p className="text-sm text-gray-600 leading-relaxed flex-1">
      "{testimonial.quote}"
    </p>

    {/* Course tag */}
    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 rounded-full px-2.5 py-0.5 self-start">
      {testimonial.course}
    </span>

    {/* Author */}
    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
      <div
        className={`w-9 h-9 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-xs font-bold text-white shrink-0`}
      >
        {testimonial.avatar}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{testimonial.name}</p>
        <p className="text-xs text-gray-400 truncate">{testimonial.role}</p>
      </div>
      <span className="mr-auto text-sm">{testimonial.country}</span>
    </div>
  </div>
);

// ─── Section ──────────────────────────────────────────────────────────────────
const Testimonials = () => {
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  // 3 cards per page on desktop, 1 on mobile
  const CARDS_PER_PAGE = 3;
  const totalPages = Math.ceil(TESTIMONIALS.length / CARDS_PER_PAGE);
  const currentSlice = TESTIMONIALS.slice(
    page * CARDS_PER_PAGE,
    page * CARDS_PER_PAGE + CARDS_PER_PAGE
  );

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(
      () => setPage((p) => (p + 1) % totalPages),
      6000
    );
    return () => clearInterval(timer);
  }, [totalPages]);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-full px-4 py-1.5 mb-4">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              Student Stories
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Hear from our graduates
          </h2>
          <p className="text-gray-500 text-base">
            Real outcomes from real people. Our learners don't just complete courses — they
            transform their careers.
          </p>
        </div>

        {/* Cards */}
        <div
          className={[
            "grid grid-cols-1 md:grid-cols-3 gap-5 transition-all duration-500",
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
          ].join(" ")}
        >
          {currentSlice.map((t, i) => (
            <TestimonialCard key={t.id} testimonial={t} active={i === 1} />
          ))}
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => (p - 1 + totalPages) % totalPages)}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Previous"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={[
                  "rounded-full transition-all duration-200",
                  i === page
                    ? "bg-blue-600 w-6 h-2"
                    : "bg-gray-200 hover:bg-gray-300 w-2 h-2",
                ].join(" ")}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setPage((p) => (p + 1) % totalPages)}
            className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Next"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;