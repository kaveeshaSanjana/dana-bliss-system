import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScrollToContact = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Button
      onClick={scrollToContact}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 bg-primary hover:bg-primary/90"
      size="icon"
      aria-label="Contact Us"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
};

export default ScrollToContact;
