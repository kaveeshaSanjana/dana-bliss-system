import { Button } from "@/components/ui/button";
import { MapPin, Copy, X } from "lucide-react";
import { StoredAddress } from "@/hooks/useAddressInheritance";
import { useState } from "react";

interface AddressSuggestionBannerProps {
  suggestion: StoredAddress | null;
  onApply: (address: StoredAddress) => void;
  currentSource: string;
}

export const AddressSuggestionBanner = ({ 
  suggestion, 
  onApply,
  currentSource 
}: AddressSuggestionBannerProps) => {
  const [dismissed, setDismissed] = useState(false);

  if (!suggestion || dismissed) return null;

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'father': return "Father's";
      case 'mother': return "Mother's";
      case 'guardian': return "Guardian's";
      default: return source;
    }
  };

  const formatAddress = (addr: StoredAddress) => {
    const parts = [
      addr.city,
      addr.district,
      addr.province
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Use {getSourceLabel(suggestion.source)} Address?
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {formatAddress(suggestion)}
            </p>
            {suggestion.sourceName && (
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                From: {suggestion.sourceName}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setDismissed(true)}
            className="h-8 px-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onApply(suggestion)}
            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
          >
            <Copy className="w-3 h-3" />
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
