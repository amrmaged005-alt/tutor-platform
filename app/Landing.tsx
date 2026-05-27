"use client";

import { useRef } from "react";
import HeroSection from "./components/landing/HeroSection";
import TrendingSection from "./components/landing/TrendingSection";
import FeaturedTutorsSection from "./components/landing/FeaturedTutorsSection";
import FeaturedClassesSection from "./components/landing/FeaturedClassesSection";
import RecommendationsSection from "./components/landing/RecommendationsSection";
import HowItWorksSection from "./components/landing/HowItWorksSection";
import StatsSection from "./components/landing/StatsSection";
import TestimonialsSection from "./components/landing/TestimonialsSection";
import CTASection from "./components/landing/CTASection";
import ScrollDots from "./components/landing/ScrollDots";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {/* Scroll-snap container. marginTop: -64px offsets the .app-main padding-top so
          this 100vh container starts flush with the viewport top (below the fixed navbar).
          Sections use paddingTop: 72px so content begins beneath the navbar. */}
      <div
        ref={scrollRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          scrollSnapType: "y mandatory",
          scrollBehavior: "smooth",
          marginTop: -64,
        }}
      >
        <HeroSection
          stats={stats}
          featuredTutors={featuredTutors}
          featuredClasses={featuredClasses}
        />
        <TrendingSection />
        <FeaturedTutorsSection />
        <FeaturedClassesSection />
        <RecommendationsSection />
        <HowItWorksSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </div>
      <ScrollDots scrollRef={scrollRef} />
    </>
  );
}
