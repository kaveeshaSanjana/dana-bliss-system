import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const EmailHelpSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="text-muted-foreground hover:text-foreground p-0 h-auto font-normal text-sm gap-1"
      >
        <HelpCircle className="w-4 h-4" />
        <span>Don't have a Gmail account?</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>
      
      {isOpen && (
        <div className="mt-3 p-4 bg-muted/50 rounded-lg border border-border/50 space-y-3">
          <p className="text-sm text-muted-foreground">
            Watch this tutorial to learn how to create a Gmail account:
          </p>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/bEwCwKRDpeI?si=8UMWJtjhhCFF4Xo5"
              title="How to create Gmail account"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};
