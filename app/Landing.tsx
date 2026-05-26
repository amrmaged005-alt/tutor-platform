"use client";

import HeroSection from "./components/landing/HeroSection";
import RecommendationsSection from "./components/landing/RecommendationsSection";
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
    <>
      <HeroSection stats={stats} featuredTutors={featuredTutors} featuredClasses={featuredClasses} />
      <RecommendationsSection />
    </>
  );
}
