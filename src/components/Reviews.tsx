import { useReviews } from '@/hooks/useGoogleSheets';
import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';

const Reviews = () => {
  const { data: reviews, loading } = useReviews();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (reviews.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % reviews.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={18} 
        className={i < rating ? 'fill-secondary text-secondary' : 'text-muted'} 
      />
    ));
  };

  return (
    <section id="reviews" className="py-24 px-4 bg-primary/5">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Travelers <span className="text-secondary">Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our guests about their unforgettable experiences in Sri Lanka
          </p>
        </div>

        {loading ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-3xl p-8 md:p-12 animate-pulse">
              <div className="h-32 bg-muted rounded mb-6" />
              <div className="h-6 bg-muted rounded w-1/3 mb-2" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="relative">
            {/* Main Review Card */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-3xl p-8 md:p-12 shadow-xl relative overflow-hidden">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 text-secondary/20 w-16 h-16" />
                
                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {renderStars(reviews[currentIndex]?.rating || 5)}
                </div>

                {/* Comment */}
                <blockquote className="text-lg md:text-xl text-foreground mb-8 leading-relaxed relative z-10">
                  "{reviews[currentIndex]?.comment}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground text-lg">
                      {reviews[currentIndex]?.name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Visited: {reviews[currentIndex]?.special_visits_category}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {reviews[currentIndex]?.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            {reviews.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex 
                        ? 'bg-primary w-8' 
                        : 'bg-muted hover:bg-primary/50'
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <p>No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;
