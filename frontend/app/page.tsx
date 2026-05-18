import Hero from '@/components/Hero';
import SocialProof from '@/components/SocialProof';
import FragranceSelector from '@/components/FragranceSelector';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Quiz from '@/components/Quiz';
import Guarantee from '@/components/Guarantee';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <SocialProof />
      <FragranceSelector />
      <HowItWorks />
      <Testimonials />
      <Quiz />
      <Guarantee />
      <Footer />
    </main>
  );
}
