import { useState, useEffect } from 'react';
import { Menu, X, MapPin, Image, Star, Phone, Home, ChevronRight } from 'lucide-react';
import { useOtherContent } from '@/hooks/useGoogleSheets';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { data: content } = useOtherContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const siteName = content['site_name'] || 'Sri Lanka Travels';
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home, isRoute: true },
    { name: 'Destinations', href: isHomePage ? '#special-visits' : '/destinations', icon: MapPin, isRoute: !isHomePage },
    { name: 'Gallery', href: isHomePage ? '#gallery' : '/gallery', icon: Image, isRoute: !isHomePage },
    { name: 'Reviews', href: isHomePage ? '#reviews' : '/reviews', icon: Star, isRoute: !isHomePage },
    { name: 'Contact', href: '#contact', icon: Phone, isRoute: false },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.isRoute) {
      navigate(link.href);
    } else if (link.href.startsWith('#')) {
      if (!isHomePage) {
        // Navigate to home first, then scroll
        navigate('/');
        setTimeout(() => {
          const element = document.querySelector(link.href);
          element?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const element = document.querySelector(link.href);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const isActiveLink = (link: typeof navLinks[0]) => {
    if (link.href === '/') return location.pathname === '/';
    if (link.isRoute) return location.pathname === link.href || location.pathname.startsWith(link.href + '/');
    return false;
  };

  // Determine text color based on scroll and page
  const getTextColor = () => {
    if (isScrolled) return 'text-foreground';
    if (isHomePage) return 'text-primary-foreground';
    return 'text-foreground';
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-xl shadow-lg py-2' 
          : 'bg-gradient-to-b from-foreground/20 to-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                <span className="text-xl">🪷</span>
                <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className={`font-bold text-lg leading-tight transition-colors duration-300 ${getTextColor()}`}>
                  {siteName}
                </span>
                <span className={`text-xs font-medium transition-colors duration-300 ${isScrolled ? 'text-muted-foreground' : isHomePage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  Explore Paradise
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link)}
                  className={`relative px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 group ${
                    isActiveLink(link)
                      ? 'text-primary'
                      : `${getTextColor()} hover:text-primary`
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <link.icon size={16} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                    {link.name}
                  </span>
                  {/* Active/Hover indicator */}
                  <span className={`absolute inset-0 rounded-full transition-all duration-300 ${
                    isActiveLink(link)
                      ? 'bg-primary/10'
                      : 'bg-transparent group-hover:bg-primary/5'
                  }`} />
                  {/* Active dot */}
                  {isActiveLink(link) && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* CTA Button - Desktop */}
            <div className="hidden lg:block">
              <button 
                onClick={() => handleNavClick({ name: 'Contact', href: '#contact', icon: Phone, isRoute: false })}
                className="relative px-6 py-2.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-full font-semibold text-sm shadow-lg hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Book Now
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 hover:bg-primary/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <div className="relative w-6 h-5">
                <span className={`absolute left-0 w-full h-0.5 rounded-full transition-all duration-300 ${getTextColor().replace('text-', 'bg-')} ${
                  isMenuOpen ? 'top-2 rotate-45' : 'top-0'
                }`} />
                <span className={`absolute left-0 top-2 w-full h-0.5 rounded-full transition-all duration-300 ${getTextColor().replace('text-', 'bg-')} ${
                  isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
                }`} />
                <span className={`absolute left-0 w-full h-0.5 rounded-full transition-all duration-300 ${getTextColor().replace('text-', 'bg-')} ${
                  isMenuOpen ? 'top-2 -rotate-45' : 'top-4'
                }`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 z-40 bg-foreground/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 right-0 z-50 h-full w-[85%] max-w-sm bg-background shadow-2xl transition-transform duration-500 ease-out lg:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-lg">🪷</span>
            </div>
            <span className="font-bold text-foreground">{siteName}</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-muted/50 transition-colors"
          >
            <X size={24} className="text-foreground" />
          </button>
        </div>

        {/* Menu Links */}
        <div className="p-5 space-y-2">
          {navLinks.map((link, index) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group ${
                isActiveLink(link)
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-muted/50'
              }`}
              style={{ 
                animationDelay: `${index * 50}ms`,
                animation: isMenuOpen ? 'fade-in 0.3s ease-out forwards' : 'none'
              }}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                isActiveLink(link) ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                <link.icon size={20} />
              </div>
              <div className="flex-1 text-left">
                <span className="font-semibold text-base">{link.name}</span>
              </div>
              <ChevronRight size={18} className={`transition-transform ${isActiveLink(link) ? 'text-primary' : 'text-muted-foreground'} group-hover:translate-x-1`} />
            </button>
          ))}
        </div>

        {/* CTA Button - Mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-5 border-t border-border bg-background">
          <button 
            onClick={() => handleNavClick({ name: 'Contact', href: '#contact', icon: Phone, isRoute: false })}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <Phone size={18} />
            Book Your Trip Now
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
