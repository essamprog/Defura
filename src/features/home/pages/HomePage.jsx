import { useEffect } from "react";
import {
  Hero,
  Stats,
  Features,
  FeaturedCourses,
  HowItWorks,
  CategorySection,
  Testimonials,
  CTASection,
} from "../components";

/**
 * HomePage
 * Rendered inside <PublicLayout> (Navbar + Footer are provided by the layout).
 * Section order is designed for maximum conversion:
 *   Hero → Stats → FeaturedCourses → Features → Categories → HowItWorks → Testimonials → CTA
 */
const HomePage = () => {
  // Reset scroll position on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen">
      {/* 1. Hook — above the fold, dark hero */}
      <Hero />

      {/* 2. Credibility — platform numbers */}
      <Stats />

      {/* 3. Product — best courses */}
      <FeaturedCourses />

      {/* 4. Value proposition — why us */}
      <Features />

      {/* 5. Discovery — browse by category */}
      <CategorySection />

      {/* 6. Process — how it works */}
      <HowItWorks />

      {/* 7. Social proof — testimonials */}
      <Testimonials />

      {/* 8. Conversion — dual CTA */}
      <CTASection />
    </div>
  );
};

export default HomePage;