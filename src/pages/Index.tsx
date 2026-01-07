import { useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import SpecialVisits from '@/components/SpecialVisits';
import Reviews from '@/components/Reviews';
import ReviewForm from '@/components/ReviewForm';
import Gallery from '@/components/Gallery';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

const Index = () => {
  const refetchReviewsRef = useRef<(() => void) | null>(null);

  const handleRefetchRef = useCallback((refetch: () => void) => {
    refetchReviewsRef.current = refetch;
  }, []);

  const handleReviewSubmitted = useCallback(() => {
    if (refetchReviewsRef.current) {
      refetchReviewsRef.current();
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <SpecialVisits />
      <Gallery />
      <Reviews onRefetchRef={handleRefetchRef} />
      <ReviewForm onReviewSubmitted={handleReviewSubmitted} />
      <ContactForm />
      <Footer />
    </div>
  );
};

export default Index;
