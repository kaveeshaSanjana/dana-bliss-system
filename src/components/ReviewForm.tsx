import { useState, useEffect, useRef } from 'react';
import { Star, Send, Loader2, PartyPopper, PenLine, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useSpecialVisits } from '@/hooks/useGoogleSheets';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Checkbox } from '@/components/ui/checkbox';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwWUdWcAWMrQznpib9F5lVjJQW0Fbh6We4kwDVVO27F4WBFCoIXiG1BzYbF-QSjPWI/exec';

interface ReviewFormData {
  name: string;
  rating: number;
  comment: string;
  special_visits_category: string;
}

interface ReviewFormProps {
  onReviewSubmitted?: () => void;
  preselectedCategory?: string;
  onSuccess?: () => void;
  hideHeader?: boolean;
}

const ReviewForm = ({ onReviewSubmitted, preselectedCategory, onSuccess, hideHeader = false }: ReviewFormProps) => {
  const { data: specialVisits, loading: visitsLoading } = useSpecialVisits();
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    preselectedCategory ? [preselectedCategory] : []
  );
  const [customDestination, setCustomDestination] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [formData, setFormData] = useState<Omit<ReviewFormData, 'special_visits_category'>>({
    name: '',
    rating: 5,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [showThankYou, setShowThankYou] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 }
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 }
    });
    setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { x: 0.5, y: 0.5 }
      });
    }, 200);
  };

  const handleDestinationToggle = (destination: string) => {
    setSelectedDestinations(prev => 
      prev.includes(destination)
        ? prev.filter(d => d !== destination)
        : [...prev, destination]
    );
  };

  const handleAddCustomDestination = () => {
    const trimmed = customDestination.trim();
    if (trimmed && !selectedDestinations.includes(trimmed)) {
      setSelectedDestinations(prev => [...prev, trimmed]);
      setCustomDestination('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveDestination = (destination: string) => {
    setSelectedDestinations(prev => prev.filter(d => d !== destination));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.comment.trim()) {
      toast.error('Please enter your review');
      return;
    }
    if (selectedDestinations.length === 0) {
      toast.error('Please select at least one destination');
      return;
    }

    setSubmitting(true);
    
    try {
      const submitData: ReviewFormData = {
        ...formData,
        special_visits_category: selectedDestinations.join(', ')
      };

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify({ ...submitData, type: 'review' }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      setShowThankYou(true);
      triggerConfetti();
      setFormData({
        name: '',
        rating: 5,
        comment: '',
      });
      setSelectedDestinations([]);
      
      if (onReviewSubmitted) {
        setTimeout(() => {
          onReviewSubmitted();
        }, 2000);
      }
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseThankYou = () => {
    setShowThankYou(false);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => {
      const starValue = i + 1;
      const isFilled = starValue <= (hoveredStar || formData.rating);
      
      return (
        <button
          key={i}
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, rating: starValue }))}
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(0)}
          className="focus:outline-none transition-all duration-300 hover:scale-125 active:scale-95"
        >
          <Star
            size={32}
            className={`transition-all duration-300 drop-shadow-sm ${
              isFilled 
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                : 'text-muted-foreground/40 hover:text-yellow-400/60'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <section ref={sectionRef} id="submit-review" className={hideHeader ? "" : "py-24 px-4 bg-gradient-to-b from-background via-primary/5 to-background overflow-hidden"}>
      <div className={hideHeader ? "" : "max-w-2xl mx-auto"}>
        {/* Section Header */}
        {!hideHeader && (
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/10 text-secondary rounded-full text-sm font-medium mb-4">
              <PenLine size={14} className="animate-bounce-gentle" />
              Share Your Experience
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Write a <span className="text-primary">Review</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Help other travelers by sharing your experience in Sri Lanka
            </p>
          </div>
        )}

        {/* Review Form */}
        <form 
          onSubmit={handleSubmit} 
          className={`group bg-card rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden transition-all duration-700 delay-200 hover:shadow-2xl ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          {/* Name */}
          <div className="mb-6 relative z-10">
            <label htmlFor="reviewer-name" className="block text-sm font-medium text-foreground mb-2">
              Your Name <span className="text-destructive">*</span>
            </label>
            <Input
              id="reviewer-name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-background transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              required
            />
          </div>

          {/* Destinations - Multi-select with checkboxes */}
          {!preselectedCategory && (
            <div className="mb-6 relative z-10">
              <label className="block text-sm font-medium text-foreground mb-3">
                Destinations Visited <span className="text-destructive">*</span>
                <span className="text-muted-foreground font-normal ml-2">(Select multiple)</span>
              </label>
              
              {/* Selected destinations tags */}
              {selectedDestinations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedDestinations.map((dest) => (
                    <span 
                      key={dest} 
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {dest}
                      <button
                        type="button"
                        onClick={() => handleRemoveDestination(dest)}
                        className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Checkbox list */}
              <div className="bg-background rounded-xl p-4 border border-border max-h-48 overflow-y-auto space-y-2">
                {visitsLoading ? (
                  <p className="text-muted-foreground text-sm">Loading destinations...</p>
                ) : (
                  <>
                    {specialVisits.map((visit) => (
                      <label 
                        key={visit.name}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Checkbox
                          checked={selectedDestinations.includes(visit.name)}
                          onCheckedChange={() => handleDestinationToggle(visit.name)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <span className="text-foreground text-sm">{visit.name}</span>
                      </label>
                    ))}
                  </>
                )}
              </div>

              {/* Add Custom Destination */}
              <div className="mt-3">
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter custom destination..."
                      value={customDestination}
                      onChange={(e) => setCustomDestination(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomDestination();
                        }
                      }}
                      className="flex-1 bg-background"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddCustomDestination}
                      disabled={!customDestination.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomDestination('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    <Plus size={16} />
                    Add custom destination
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="mb-6 relative z-10">
            <label className="block text-sm font-medium text-foreground mb-3">
              Your Rating <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-3 p-3 bg-background/50 rounded-xl w-fit">
              {renderStars()}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-8 relative z-10">
            <label htmlFor="review-comment" className="block text-sm font-medium text-foreground mb-2">
              Your Review <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="review-comment"
              placeholder="Share your experience... What did you love about your visit?"
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="bg-background min-h-[120px] resize-none transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
              required
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-semibold relative overflow-hidden group/btn transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="relative z-10 flex items-center justify-center">
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-300" />
                  Submit Review
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </Button>
        </form>

        {/* Thank You Dialog */}
        <Dialog open={showThankYou} onOpenChange={setShowThankYou}>
          <DialogContent className="sm:max-w-md text-center">
            <div className="flex flex-col items-center py-6">
              <div className="relative mb-6 animate-bounce-gentle">
                <PartyPopper className="w-20 h-20 text-yellow-400 drop-shadow-lg" />
                <div className="absolute -top-2 -right-2 animate-float">
                  <span className="text-3xl">🎉</span>
                </div>
                <div className="absolute -top-2 -left-2 animate-float" style={{ animationDelay: '0.5s' }}>
                  <span className="text-3xl">🎊</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Thank You!
              </h3>
              <p className="text-muted-foreground text-lg mb-6">
                Thanks for Giving Review for Us.
              </p>
              <Button 
                onClick={handleCloseThankYou}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 hover:shadow-lg transition-all duration-300"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ReviewForm;