import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FormFieldWithErrorProps {
  label: string;
  required?: boolean;
  error?: string;
  maxLength?: number;
  currentLength?: number;
  children: ReactNode;
  className?: string;
  id?: string;
}

export const FormFieldWithError = ({
  label,
  required = false,
  error,
  maxLength,
  currentLength,
  children,
  className,
  id
}: FormFieldWithErrorProps) => {
  return (
    <div className={cn("space-y-2", className)} id={id}>
      <div className="flex items-center justify-between">
        <Label className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {maxLength && (
          <span className={cn(
            "text-xs",
            currentLength && currentLength > maxLength 
              ? "text-destructive" 
              : "text-muted-foreground"
          )}>
            {currentLength || 0}/{maxLength}
          </span>
        )}
      </div>
      <div className={cn(
        "[&>input]:transition-colors [&>input]:duration-200",
        "[&>button]:transition-colors [&>button]:duration-200",
        "[&>textarea]:transition-colors [&>textarea]:duration-200",
        error && "[&>input]:border-destructive [&>input]:ring-destructive/20 [&>input]:ring-2",
        error && "[&>button]:border-destructive [&>button]:ring-destructive/20 [&>button]:ring-2",
        error && "[&>textarea]:border-destructive [&>textarea]:ring-destructive/20 [&>textarea]:ring-2",
        error && "[&_.phone-input-container]:border-destructive [&_.phone-input-container]:ring-destructive/20 [&_.phone-input-container]:ring-2"
      )}>
        {children}
      </div>
      {error && (
        <p className="text-sm text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );
};

// Validation helper functions
export const validateField = (
  value: string | undefined | null,
  rules: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
    email?: boolean;
    phone?: boolean;
    custom?: (value: string) => string | null;
  }
): string | null => {
  const val = value?.toString().trim() || "";
  
  if (rules.required && !val) {
    return "This field is required";
  }
  
  if (val && rules.minLength && val.length < rules.minLength) {
    return `Minimum ${rules.minLength} characters required`;
  }
  
  if (val && rules.maxLength && val.length > rules.maxLength) {
    return `Maximum ${rules.maxLength} characters allowed`;
  }
  
  if (val && rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      return "Please enter a valid email address";
    }
  }
  
  if (val && rules.phone) {
    // Basic phone validation - at least 10 digits
    const digits = val.replace(/\D/g, "");
    if (digits.length < 10) {
      return "Please enter a valid phone number";
    }
  }
  
  if (val && rules.pattern && !rules.pattern.test(val)) {
    return rules.patternMessage || "Invalid format";
  }
  
  if (val && rules.custom) {
    return rules.custom(val);
  }
  
  return null;
};

// Scroll to first error
export const scrollToFirstError = (errors: Record<string, string>) => {
  const firstErrorKey = Object.keys(errors).find(key => errors[key]);
  if (firstErrorKey) {
    const element = document.getElementById(`field-${firstErrorKey}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // Scroll to top if element not found
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
};
