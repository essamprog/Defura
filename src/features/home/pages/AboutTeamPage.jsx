import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

// ─── Team Members Data ────────────────────────────────────────────────────────
const TEAM_MEMBERS = [
  {
    name: "Alex Rivera",
    role: "CEO & Founder",
    image: "/assets/about team/image_1.JPG",
    bio: "Alex leads our overall vision and strategy. With over 15 years of experience in educational technology and software engineering, he is passionate about making high-quality education accessible to learners worldwide.",
  },
  {
    name: "Sarah Jenkins",
    role: "VP of Product",
    image: "/assets/about team/image_2.JPG",
    bio: "Sarah oversees the product roadmap and user experience. She focuses on building engaging, intuitive interfaces that empower students to learn at their own pace and track their progress.",
  },
  {
    name: "David Kross",
    role: "CTO & Co-Founder",
    image: "/assets/about team/image_3.JPG",
    bio: "David architected the core engine of DefuraLMS. He is dedicated to building scalable, high-performance systems and integrating advanced security protocols to protect user data.",
  },
  {
    name: "Elena Rostova",
    role: "Director of Learning Design",
    image: "/assets/about team/image_4.JPG",
    bio: "Elena leads our curriculum team, partnering with world-class instructors to structure courses that are pedagogically sound, highly interactive, and oriented toward practical skills.",
  },
  {
    name: "Marcus Vane",
    role: "UX/UI Design Lead",
    image: "/assets/about team/image_5.JPG",
    bio: "Marcus is the creative mind behind Defura's aesthetic. He believes that beautiful design is key to cognitive engagement, and works to ensure every interaction feels premium and intuitive.",
  },
  {
    name: "Sophia Chen",
    role: "Head of Instructor Success",
    image: "/assets/about team/image_6.JPG",
    bio: "Sophia supports our community of educators, guiding them through course creation, production standards, and curriculum alignment to ensure they have everything they need to succeed.",
  },
  {
    name: "Tariq Mahmood",
    role: "DevOps & Infrastructure Lead",
    image: "/assets/about team/image_7.JPG",
    bio: "Tariq keeps DefuraLMS running smoothly and efficiently. He manages our globally distributed cloud architecture, ensuring 99.9% uptime and lightning-fast load times.",
  },
  {
    name: "Emily Watson",
    role: "Student Success Manager",
    image: "/assets/about team/image_8.JPG",
    bio: "Emily and her team are dedicated to helping our students overcome obstacles. From onboarding support to community moderation, she works to foster a supportive learning environment.",
  },
  {
    name: "Carlos Mendez",
    role: "VP of Growth & Community",
    image: "/assets/about team/image_9.JPG",
    bio: "Carlos drives our student acquisition and community engagement. He is passionate about sharing success stories of learners who transformed their careers through our platform.",
  },
];

const AboutTeamPage = () => {
  const [activeIndex, setActiveIndex] = useState(1); // Start with the second card active (like in the image)
  const [isZoomed, setIsZoomed] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Reset scroll position on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Track window resize to adjust responsive carousel dimensions
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? TEAM_MEMBERS.length - 1 : prev - 1));
    setIsZoomed(true);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === TEAM_MEMBERS.length - 1 ? 0 : prev + 1));
    setIsZoomed(true);
  };

  const handleCardClick = (index) => {
    if (index === activeIndex) {
      setIsZoomed((prev) => !prev);
    } else {
      setActiveIndex(index);
      setIsZoomed(true);
    }
  };

  // Touch handlers for swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped left
      handleNext();
    } else if (diff < -50) {
      // Swiped right
      handlePrev();
    }
  };

  // Calculate layout parameters dynamically based on screen size
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;
  const cardWidth = isMobile ? 260 : isTablet ? 290 : 320;
  const cardHeight = isMobile ? 380 : isTablet ? 420 : 460;
  const gap = isMobile ? 16 : isTablet ? 20 : 28;

  // Center alignment: translate the active card to the middle of the viewport
  const translateOffset = `calc(50vw - ${cardWidth / 2}px - ${activeIndex * (cardWidth + gap)}px)`;

  return (
    <div className="relative min-h-screen bg-[#050714] text-white flex flex-col items-center justify-center py-20 overflow-hidden font-sans select-none">
      
      {/* ── Glowing Background Spots ─────────────────────────────────────────── */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Circular Decorative Orbit Lines ───────────────────────────────────── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] max-w-[1400px] aspect-square pointer-events-none opacity-25">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="500" cy="500" r="180" stroke="url(#gradient-ring-1)" strokeWidth="0.8" strokeDasharray="4 8" />
          <circle cx="500" cy="500" r="300" stroke="url(#gradient-ring-2)" strokeWidth="1.2" />
          <circle cx="500" cy="500" r="420" stroke="url(#gradient-ring-3)" strokeWidth="0.6" strokeDasharray="8 6" />
          
          <defs>
            <linearGradient id="gradient-ring-1" x1="0" y1="0" x2="1000" y2="1000" gradientUnits="userSpaceOnUse">
              <stop stopColor="#2563eb" stopOpacity="0.8"/>
              <stop offset="0.5" stopColor="#4f46e5" stopOpacity="0.2"/>
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0.8"/>
            </linearGradient>
            <linearGradient id="gradient-ring-2" x1="1000" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" stopOpacity="0.4"/>
              <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.1"/>
              <stop offset="1" stopColor="#8b5cf6" stopOpacity="0.4"/>
            </linearGradient>
            <linearGradient id="gradient-ring-3" x1="0" y1="1000" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#60a5fa" stopOpacity="0.2"/>
              <stop offset="1" stopColor="#a78bfa" stopOpacity="0.2"/>
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Header Section ─────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase mb-6 backdrop-blur-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" /> Our Team
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-light text-white tracking-tight leading-tight mb-4 text-balance">
          Partnered with most of the <br />
          <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 block mt-2 py-1">
            top people at each industry
          </span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mt-4 leading-relaxed font-light">
          Meet the dedicated visionaries, engineers, and creators who are building the future of digital learning here at DefuraLMS.
        </p>
      </div>

      {/* ── Carousel Section ───────────────────────────────────────────────── */}
      <div className="relative z-10 w-full overflow-visible flex flex-col items-center">
        
        {/* Viewport Slider Wrapper */}
        <div 
          className="w-full overflow-hidden py-10 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex items-center transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ 
              transform: `translate3d(${translateOffset}, 0, 0)`,
              width: `${TEAM_MEMBERS.length * (cardWidth + gap)}px`
            }}
          >
            {TEAM_MEMBERS.map((member, index) => {
              const isActiveCard = index === activeIndex && isZoomed;
              return (
                <div
                  key={member.name}
                  onClick={() => handleCardClick(index)}
                  className={`relative rounded-3xl overflow-hidden shrink-0 transition-all duration-500 ease-out cursor-pointer group select-none`}
                  style={{
                    width: `${cardWidth}px`,
                    height: `${cardHeight}px`,
                    marginRight: `${gap}px`,
                    transform: isActiveCard ? "scale(1.03)" : "scale(0.92)",
                    boxShadow: isActiveCard 
                      ? "0 20px 40px -15px rgba(37, 99, 235, 0.4), 0 0 20px -5px rgba(124, 58, 237, 0.3)" 
                      : "0 10px 30px -15px rgba(0,0,0,0.7)",
                    border: isActiveCard 
                      ? "2px solid rgba(79, 70, 229, 0.6)" 
                      : "1px solid rgba(255, 255, 255, 0.05)"
                  }}
                >
                  <div className="absolute inset-0 w-full h-full">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                    />
                    
                    {/* Bottom gradient overlay with extra dark contrast */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 via-black/20 to-transparent pt-40 pb-6 px-6 flex flex-col justify-end">
                      <h3 className="text-xl font-bold text-white tracking-wide leading-tight group-hover:text-blue-400 transition-colors duration-300">
                        {member.name}
                      </h3>
                      <p className="text-xs text-gray-300 font-medium tracking-wide mt-1 uppercase">
                        {member.role}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Previous team member"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {/* Custom Indicator Dots */}
          <div className="flex items-center gap-2">
            {TEAM_MEMBERS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveIndex(idx);
                  setIsZoomed(true);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeIndex 
                    ? "w-6 bg-blue-500" 
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            aria-label="Next team member"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Decorative footer details */}
      <div className="relative z-10 text-center mt-20 text-gray-500 text-xs font-mono tracking-widest uppercase">
        DefuraLMS • Creative Team Workspace
      </div>
    </div>
  );
};

export default AboutTeamPage;
