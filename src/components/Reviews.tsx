import { useReviews, useOtherContent } from '@/hooks/useGoogleSheets';
import { Star, Quote, ChevronRight, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

interface ReviewsProps {
  onRefetchRef?: (refetch: () => void) => void;
}

const Reviews = ({ onRefetchRef }: ReviewsProps) => {
  const { data: reviews, loading, refetch } = useReviews();
  const { data: otherContent } = useOtherContent();
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Expose refetch function to parent
  if (onRefetchRef) {
    onRefetchRef(refetch);
  }

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Show items based on config
  const mobileMax = otherContent.in_mobile_max_reviews;
  const desktopMax = otherContent.in_desktop_max_reviews;
  const maxItems = isMobile ? mobileMax : desktopMax;

  const displayedReviews = reviews.slice(0, maxItems);
  const hasMore = reviews.length > maxItems;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={`transition-all duration-300 ${i < rating ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' : 'text-muted/50'}`} 
      />
    ));
  };

  return (
    <section ref={sectionRef} id="reviews" className="py-24 px-4 bg-gradient-to-b from-primary/5 via-background to-primary/5 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4 animate-pulse-glow">
            <Sparkles size={14} className="animate-bounce-gentle" />
            Testimonials
            <Sparkles size={14} className="animate-bounce-gentle" style={{ animationDelay: '0.5s' }} />
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Travelers <span className="text-secondary bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Say</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from our guests about their unforgettable experiences in Sri Lanka
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
                <div className="h-4 bg-muted rounded w-24 mb-4" />
                <div className="h-20 bg-muted rounded mb-4" />
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : displayedReviews.length > 0 ? (
          <div className="relative">
            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayedReviews.map((review, index) => (
                <div 
                  key={index} 
                  className={`group bg-card rounded-2xl p-6 shadow-lg relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:bg-card/80 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                  }`}
                  style={{ 
                    transitionDelay: isVisible ? `${index * 100}ms` : '0ms',
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-500" />
                  
                  {/* Quote Icon */}
                  <Quote className="absolute top-4 right-4 text-secondary/10 w-8 h-8 group-hover:text-secondary/30 group-hover:scale-110 transition-all duration-500" />
                  
                  {/* Decorative corner */}
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-primary/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  
                  {/* Stars with animation */}
                  <div className="flex gap-0.5 mb-3 relative z-10">
                    {renderStars(review.rating || 5)}
                  </div>

                  {/* Comment */}
                  <p className="text-foreground text-sm mb-4 leading-relaxed line-clamp-4 relative z-10 group-hover:text-foreground/90 transition-colors">
                    "{review.comment}"
                  </p>

                  {/* Author */}
                  <div className="mt-auto relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-md group-hover:scale-110 transition-transform duration-300">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">
                          {review.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {review.special_visits_category}
                        </p>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-xs pl-11">
                      {review.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* See More Button */}
            {hasMore && (
              <div className={`text-center mt-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <Link 
                  to="/reviews"
                  className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-1"
                >
                  <span>Read All Reviews</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className={`text-center py-16 transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
              <Quote className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Reviews;