import { Navbar } from '@/components/layout/navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { StatsBar } from '@/components/landing/stats-bar';
import { TopCategories } from '@/components/landing/top-categories';
import { FeaturedCourses } from '@/components/landing/featured-courses';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';
import { CtaSection } from '@/components/landing/cta-section';
import { Footer } from '@/components/layout/footer';

/** Нүүр хуудас — нийтэд нээлттэй landing page */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <TopCategories />
        <FeaturedCourses />
        <HowItWorks />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
