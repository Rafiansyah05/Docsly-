export const dynamic = 'force-dynamic';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { UtilityTool } from '@/components/landing/utility-tool';
import { ProblemSolution } from '@/components/landing/problem-solution';
import { Features } from '@/components/landing/features';
import { Faq } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { LandingLayout } from '@/components/landing/landing-layout';

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  return (
    <LandingLayout>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1">
          <Hero avgRating="5.0" />
          <UtilityTool />
          <ProblemSolution />
          <Features />
          <Faq />
        </main>
        <Footer />
      </div>
    </LandingLayout>
  );
}
