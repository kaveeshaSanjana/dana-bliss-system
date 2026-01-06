import { useOtherContent } from '@/hooks/useGoogleSheets';
import { ChevronDown, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const Hero = () => {
  const { data: content, loading } = useOtherContent();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));

  // Parse comma-separated values for titles, subtitles, descriptions
  const parseCommaSeparated = (value: string, fallback: string): string[] => {
    const items = value.split(',').map(s => s.trim()).filter(Boolean);
    return items.length > 0 ? items : [fallback];
  };

  const titles = parseCommaSeparated(content['hero_title'] || '', 'Discover Sri Lanka');
  const subtitles = parseCommaSeparated(content['hero_subtitle'] || '', 'The Pearl of the Indian Ocean');
  const descriptions = parseCommaSeparated(content['hero_description'] || '', 'Experience ancient temples, pristine beaches, lush tea plantations, and warm hospitality');
  
  // Parse multiple images from hero_background_images (comma-separated)
  const heroImagesRaw = content['hero_background_images'] || '';
  const heroImages = heroImagesRaw
    .split(',')
    .map((url: string) => url.trim())
    .filter((url: string) => url.length > 0);
  
  // Fallback to single image or default
  const fallbackImage = content['hero_background_image'] || 'https://images.unsplash.com/photo-1586523969764-f4e2b6bc92e6?auto=format&fit=crop&w=1920&q=80';
  const images = heroImages.length > 0 ? heroImages : [fallbackImage];

  // Get current slide's content (cycle through available values)
  const currentTitle = titles[currentSlide % titles.length];
  const currentSubtitle = subtitles[currentSlide % subtitles.length];
  const currentDescription = descriptions[currentSlide % descriptions.length];

  // Preload next image
  useEffect(() => {
    const nextIndex = (currentSlide + 1) % images.length;
    if (!loadedImages.has(nextIndex)) {
      const img = new Image();
      img.src = images[nextIndex];
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(nextIndex));
      };
    }
  }, [currentSlide, images, loadedImages]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 1000);
  }, [currentSlide, isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % images.length);
  }, [currentSlide, images.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + images.length) % images.length);
  }, [currentSlide, images.length, goToSlide]);

  // Auto-play slideshow
  useEffect(() => {
    if (!isPlaying || images.length <= 1) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide, images.length]);

  // Color themes for each slide
  const colorThemes = [
    { accent: 'from-emerald-500/20', glow: 'bg-emerald-400' },
    { accent: 'from-amber-500/20', glow: 'bg-amber-400' },
    { accent: 'from-cyan-500/20', glow: 'bg-cyan-400' },
    { accent: 'from-rose-500/20', glow: 'bg-rose-400' },
    { accent: 'from-violet-500/20', glow: 'bg-violet-400' },
  ];
  
  const currentTheme = colorThemes[currentSlide % colorThemes.length];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Images with Ken Burns Effect */}
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-out ${
            index === currentSlide 
              ? 'opacity-100 scale-100' 
              : 'opacity-0 scale-110'
          }`}
          style={{ zIndex: index === currentSlide ? 1 : 0 }}
        >
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[8000ms] ease-out ${
              index === currentSlide ? 'scale-110' : 'scale-100'
            }`}
            style={{
              backgroundImage: `url('${image}')`,
            }}
          />
          {/* Multi-layer gradient overlay */}
          <div className={`absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/40 to-background transition-all duration-1000`} />
          <div className={`absolute inset-0 bg-gradient-to-r ${currentTheme.accent} to-transparent opacity-50 transition-all duration-1000`} />
        </div>
      ))}

      {/* Animated Particles */}
      <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-secondary/40 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 border-2 border-secondary/30 rounded-full animate-float opacity-50 z-[2]" />
      <div className="absolute bottom-40 right-20 w-24 h-24 border border-secondary/20 rotate-45 animate-float opacity-30 z-[2]" style={{ animationDelay: '1s' }} />
      
      {/* Dynamic glow effect */}
      <div 
        className={`absolute top-1/4 left-1/4 w-96 h-96 ${currentTheme.glow} rounded-full blur-[150px] opacity-20 transition-all duration-1000 z-[2]`}
        style={{ transform: `translate(${currentSlide * 10}%, ${currentSlide * 5}%)` }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Slide Counter */}
        {images.length > 1 && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-primary-foreground/60 text-sm font-mono">
              {String(currentSlide + 1).padStart(2, '0')}
            </span>
            <div className="w-12 h-px bg-primary-foreground/30 relative overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-secondary transition-all duration-[6000ms] ease-linear"
                style={{ width: isPlaying ? '100%' : '0%' }}
                key={currentSlide}
              />
            </div>
            <span className="text-primary-foreground/60 text-sm font-mono">
              {String(images.length).padStart(2, '0')}
            </span>
          </div>
        )}

        <div className="mb-6 overflow-hidden">
          <span 
            className={`inline-block px-4 py-2 bg-secondary/20 backdrop-blur-sm rounded-full text-secondary text-sm font-medium tracking-wider uppercase transition-all duration-700 ${
              isTransitioning ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            Welcome to Paradise
          </span>
        </div>

        <div className="overflow-hidden mb-6">
          <h1 
            className={`text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground leading-tight transition-all duration-700 ${
              isTransitioning ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            {loading ? (
              <span className="animate-shimmer inline-block w-96 h-20 bg-muted rounded" />
            ) : (
              <>
                {currentTitle.split(' ')[0]}{' '}
                <span className="text-secondary bg-gradient-to-r from-secondary via-amber-400 to-secondary bg-clip-text text-transparent bg-[length:200%_100%] animate-shimmer">
                  {currentTitle.split(' ').slice(1).join(' ')}
                </span>
              </>
            )}
          </h1>
        </div>

        <div className="overflow-hidden">
          <p 
            className={`text-xl md:text-2xl text-primary-foreground/90 mb-4 font-light transition-all duration-700 delay-100 ${
              isTransitioning ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            {currentSubtitle}
          </p>
        </div>

        <div className="overflow-hidden">
          <p 
            className={`text-lg text-primary-foreground/70 mb-12 max-w-2xl mx-auto transition-all duration-700 delay-200 ${
              isTransitioning ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
            }`}
          >
            {currentDescription}
          </p>
        </div>

        <div 
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-300 ${
            isTransitioning ? 'translate-y-8 opacity-0' : 'translate-y-0 opacity-100'
          }`}
        >
          <a 
            href="#special-visits" 
            className="group px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105 shadow-lg relative overflow-hidden"
          >
            <span className="relative z-10">Explore Destinations</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </a>
          <a 
            href="#contact" 
            className="px-8 py-4 bg-secondary/20 backdrop-blur-sm text-primary-foreground border border-secondary/50 rounded-full font-medium hover:bg-secondary/30 transition-all hover:border-secondary"
          >
            Plan Your Journey
          </a>
        </div>
      </div>

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          {/* Arrow Navigation */}
          <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={prevSlide}
              disabled={isTransitioning}
              className="group w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/20 hover:border-primary-foreground/40 transition-all disabled:opacity-50"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
            <button
              onClick={nextSlide}
              disabled={isTransitioning}
              className="group w-12 h-12 md:w-14 md:h-14 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/20 hover:border-primary-foreground/40 transition-all disabled:opacity-50"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Dot Indicators & Play/Pause */}
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/70 hover:text-primary-foreground hover:bg-background/20 transition-all"
              aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            
            <div className="flex gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  disabled={isTransitioning}
                  className={`group relative h-3 rounded-full transition-all duration-500 ${
                    index === currentSlide ? 'w-8 bg-secondary' : 'w-3 bg-primary-foreground/30 hover:bg-primary-foreground/50'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  {index === currentSlide && (
                    <span className="absolute inset-0 rounded-full bg-secondary animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Scroll Indicator */}
      <a 
        href="#special-visits" 
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-primary-foreground/60 hover:text-primary-foreground transition-colors z-20 group"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Scroll</span>
          <ChevronDown className="w-8 h-8 animate-bounce" />
        </div>
      </a>
    </section>
  );
};

export default Hero;
