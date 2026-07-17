export const dynamic = 'force-dynamic';
// export const runtime = 'edge';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { ProblemSolution } from '@/components/landing/problem-solution';
import { Features } from '@/components/landing/features';
import { PricingPreview } from '@/components/landing/pricing-preview';
import { Faq } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { LandingLayout } from '@/components/landing/landing-layout';

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/w');
  }

  // Fetch AI Ratings from database for the Hero section
  let avgRating = '0.0';
  try {
    const { data: ratingData, error } = await supabase.rpc('get_average_ai_rating');
    if (ratingData) {
      // Data might be a number or string depending on postgres numeric type mapping
      const num = parseFloat(ratingData);
      if (!isNaN(num)) {
        avgRating = num.toFixed(1);
      }
    } else if (error) {
      console.error('Failed to fetch ratings RPC:', error);
    }
  } catch (error) {
    console.error('Error in ratings fetch:', error);
  }

  return (
    <LandingLayout>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1">
          <Hero avgRating={avgRating} />
          <ProblemSolution />
          <Features />
          <PricingPreview />
          <Faq />
        </main>
        <Footer />
      </div>
    </LandingLayout>
  );
}
