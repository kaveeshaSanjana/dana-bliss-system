import { useParams, Link } from 'react-router-dom';
import { useSpecialVisits, useReviews } from '@/hooks/useGoogleSheets';
import { ArrowLeft, MapPin, Star, Quote, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewForm from '@/components/ReviewForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const DestinationDetail = () => {
  const { name } = useParams<{ name: string }>();
  const { data: visits, loading: visitsLoading } = useSpecialVisits();
  const { data: allReviews, loading: reviewsLoading, refetch } = useReviews();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Find the destination by name (URL decoded)
  const decodedName = decodeURIComponent(name || '');
  const destination = visits.find(v => v.name.toLowerCase() === decodedName.toLowerCase());

  // Filter reviews for this destination
  const filteredReviews = allReviews.filter(
    review => review.special_visits_category.toLowerCase() === decodedName.toLowerCase()
  );

  // Get all images (cover + additional images)
  const allImages = destination 
    ? [destination.cover_image, ...destination.images].filter(Boolean)
    : [];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Generate varied sizes for masonry effect
  const getImageSize = (index: number) => {
    const patterns = [
      'col-span-2 row-span-2', // Large
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-2', // Tall
      'col-span-2 row-span-1', // Wide
      'col-span-1 row-span-1', // Small
    ];
    return patterns[index % patterns.length];
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={16} 
        className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted/50'} 
      />
    ));
  };

  if (visitsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4">
          <div className="max-w-7xl mx-auto animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8" />
            <div className="h-96 bg-muted rounded-2xl mb-8" />
            <div className="h-8 bg-muted rounded w-1/3 mb-4" />
            <div className="h-24 bg-muted rounded" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-24 px-4 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Destination Not Found</h1>
          <p className="text-muted-foreground mb-8">The destination you're looking for doesn't exist.</p>
          <Link 
            to="/destinations" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft size={20} />
            Back to All Destinations
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Back Link */}
          <Link 
            to="/destinations" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to All Destinations</span>
          </Link>

          {/* Masonry Image Gallery */}
          {allImages.length > 0 && (
            <div className="mb-12">
              <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] gap-3">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => openLightbox(index)}
                    className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 ${getImageSize(index)}`}
                  >
                    <img 
                      src={img}
                      alt={`${destination.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Zoom Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-lg">
                        <ZoomIn className="w-6 h-6 text-foreground" />
                      </div>
                    </div>
                    {/* Image Number */}
                    <div className="absolute bottom-3 left-3 px-2 py-1 bg-background/80 rounded-full text-xs font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {index + 1} / {allImages.length}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Lightbox Dialog */}
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-background/95 backdrop-blur-lg border-none">
              <div className="relative w-full h-[90vh] flex items-center justify-center">
                {/* Close button */}
                <button 
                  onClick={() => setLightboxOpen(false)}
                  className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 hover:bg-background flex items-center justify-center text-foreground shadow-lg transition-all"
                >
                  <X size={20} />
                </button>

                {/* Navigation */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-background/80 hover:bg-background rounded-full flex items-center justify-center text-foreground shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-12 h-12 bg-background/80 hover:bg-background rounded-full flex items-center justify-center text-foreground shadow-lg transition-all hover:scale-110"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Main Image */}
                <img 
                  src={allImages[lightboxIndex]}
                  alt={`${destination.name} - Image ${lightboxIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg animate-scale-in"
                />

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-background/80 rounded-full text-sm font-medium text-foreground">
                  {lightboxIndex + 1} / {allImages.length}
                </div>

                {/* Thumbnails */}
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto pb-2 px-4">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setLightboxIndex(index)}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                        index === lightboxIndex 
                          ? 'ring-2 ring-primary scale-110' 
                          : 'opacity-50 hover:opacity-100'
                      }`}
                    >
                      <img 
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Destination Info */}
          <div className="mb-16">
            <div className="flex items-center gap-2 text-accent mb-3">
              <MapPin size={20} />
              <span className="font-medium">{destination.sub_heading}</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {destination.name}
            </h1>
            
            <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl">
              {destination.description}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-border pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Reviews for {destination.name}
                </h2>
                <p className="text-muted-foreground">
                  {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'} from travelers
                </p>
              </div>
            </div>

            {reviewsLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="bg-card rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded w-24 mb-4" />
                    <div className="h-20 bg-muted rounded mb-4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredReviews.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6 mb-12">
                {filteredReviews.map((review, index) => (
                  <div 
                    key={index}
                    className="group bg-card rounded-xl p-6 shadow-lg relative overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <Quote className="absolute top-4 right-4 text-secondary/10 w-8 h-8" />
                    
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {renderStars(review.rating || 5)}
                    </div>

                    {/* Comment */}
                    <p className="text-foreground mb-4 leading-relaxed">
                      "{review.comment}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{review.name}</p>
                        <p className="text-muted-foreground text-sm">{review.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl mb-12">
                <Quote className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No reviews yet for {destination.name}</p>
                <p className="text-sm text-muted-foreground">Be the first to share your experience!</p>
              </div>
            )}

            {/* Review Form */}
            <div className="bg-card rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Share Your Experience at {destination.name}
              </h3>
              <ReviewForm 
                preselectedCategory={destination.name}
                onSuccess={refetch}
                hideHeader
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DestinationDetail;
