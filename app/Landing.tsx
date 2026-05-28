import HeroSection from "./components/landing/HeroSection";
import TrendingSection from "./components/landing/TrendingSection";
import FeaturedTutorsSection from "./components/landing/FeaturedTutorsSection";
import FeaturedClassesSection from "./components/landing/FeaturedClassesSection";
import RecommendationsSection from "./components/landing/RecommendationsSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import StatsSection from "./components/landing/StatsSection";
import TestimonialsSection from "./components/landing/TestimonialsSection";
import CTASection from "./components/landing/CTASection";
import type { FeaturedClass, FeaturedTutor, LandingStats } from "./components/landing/LandingData";

export default function Landing({
  stats = { tutors: 20, classes: 50, bookings: 200 },
  featuredTutors = [],
  featuredClasses = [],
}: {
  stats?: LandingStats;
  featuredTutors?: FeaturedTutor[];
  featuredClasses?: FeaturedClass[];
}) {
  return (
    <div style={{ width: "100%" }}>
      <HeroSection stats={stats} featuredTutors={featuredTutors} featuredClasses={featuredClasses} />
      <TrendingSection />
      <FeaturedTutorsSection tutors={featuredTutors} />
      <FeaturedClassesSection classes={featuredClasses} />
      <RecommendationsSection />
      <HowItWorksSection />
      <StatsSection stats={stats} />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
