import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ValidatedInput";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { requestPhoneOTP, verifyPhoneOTP, requestEmailOTP, verifyEmailOTP } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus, UserCheck, SkipForward, ArrowRight, CheckCircle2, Mail, Phone, ArrowLeft, Loader2, HeartCrack, Scale, Users, Home, Shield, ChevronDown, ChevronUp, Languages, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Language type
type Language = "en" | "si";

// Translations
const translations = {
  en: {
    // Common
    back: "Back",
    continue: "Continue",
    sending: "Sending...",
    verifying: "Verifying...",
    // Choose step
    letsAdd: "Let's add",
    information: "information",
    chooseOption: "Choose the option that applies to you",
    usePreviouslyRegistered: "Use previously registered",
    alreadyRegisteredNoReenter: "Already registered - no need to re-enter details",
    alreadyHaveAccount: "Already have an account",
    wasRegisteredBefore: "was registered before (I have the account number)",
    registerNew: "Register new",
    createNewProfile: "Create a new profile for",
    skip: "Skip",
    cannotAdd: "I cannot add",
    selectReason: "Please select a reason:",
    // Existing step
    enterAccountNumber: "Enter Account Number",
    enterRegistrationNumber: "Enter the registration number provided during previous registration",
    accountNumber: "Account Number",
    enterNumberPlaceholder: "Enter number (e.g., 12345)",
    // Phone step
    phoneOptional: "Phone Number (Optional)",
    verifyPhone: "Verify Phone Number",
    addPhoneOrSkip: "Add a phone number if you have one, or skip to continue",
    sendCodeToNumber: "We'll send a verification code to this number",
    phoneNumber: "Phone Number",
    sendVerificationCode: "Send Verification Code",
    skipPhoneEmailOnly: "Skip phone, continue with email only",
    codeSentTo: "Code sent to",
    enterSixDigitCode: "Enter the 6-digit code",
    verifyAndContinue: "Verify & Continue",
    phoneVerified: "Phone Verified!",
    // Email step
    verifyEmail: "Verify Email Address",
    sendCodeToEmail: "We'll send a verification code to your email",
    emailAddress: "Email Address",
    verifyEmailBtn: "Verify Email",
    emailVerified: "Email Verified!",
    continueToFillDetails: "Continue to Fill Details",
    // Error dialog
    alreadyRegisteredTitle: "Already Registered",
    reference: "Reference",
    close: "Close",
    useThisAccount: "Use This Account",
    // Skip reasons - Father
    fatherDeceasedLabel: "Father is no longer with us",
    fatherDeceasedDesc: "My father has passed away",
    fatherAbsentLabel: "Father is not present",
    fatherAbsentDesc: "Father is not part of family life",
    fatherDivorcedLabel: "Parents are legally separated",
    fatherDivorcedDesc: "Father has no custody or involvement",
    fatherUnknownLabel: "Father information unknown",
    fatherUnknownDesc: "I don't have father's information",
    fatherOtherLabel: "Other reason",
    fatherOtherDesc: "Specify a different reason",
    // Skip reasons - Mother
    motherDeceasedLabel: "Mother is no longer with us",
    motherDeceasedDesc: "My mother has passed away",
    motherAbsentLabel: "Mother is not present",
    motherAbsentDesc: "Mother is not part of family life",
    motherDivorcedLabel: "Parents are legally separated",
    motherDivorcedDesc: "Mother has no custody or involvement",
    motherUnknownLabel: "Mother information unknown",
    motherUnknownDesc: "I don't have mother's information",
    motherOtherLabel: "Other reason",
    motherOtherDesc: "Specify a different reason",
    // Skip reasons - Guardian
    guardianParentsAddedLabel: "Already added parents",
    guardianParentsAddedDesc: "Father and/or mother are the primary caregivers",
    guardianLivingWithParentsLabel: "Living with parents",
    guardianLivingWithParentsDesc: "No separate guardian needed",
    guardianParentIsGuardianLabel: "Parent is my guardian",
    guardianParentIsGuardianDesc: "Father or mother is also my legal guardian",
    guardianOtherLabel: "Other reason",
    guardianOtherDesc: "Specify a different reason",
    // Other reason input
    enterOtherReason: "Please enter your reason",
    otherReasonPlaceholder: "Type your reason here...",
    submitReason: "Submit",
    // Parent types
    father: "father",
    mother: "mother",
    guardian: "guardian",
    Father: "Father",
    Mother: "Mother",
    Guardian: "Guardian",
    // Selection summary
    currentSelection: "Current Selection",
    existingAccount: "Using Existing Account",
    newlyCreated: "Newly Created",
    skippedWith: "Skipped",
    reason: "Reason",
    changeSelection: "Change Selection",
    accountId: "Account ID",
  },
  si: {
    // Common
    back: "ආපසු",
    continue: "ඉදිරියට",
    sending: "යවමින්...",
    verifying: "තහවුරු කරමින්...",
    // Choose step
    letsAdd: "අපි එකතු කරමු",
    information: "තොරතුරු",
    chooseOption: "ඔබට අදාළ විකල්පය තෝරන්න",
    usePreviouslyRegistered: "කලින් ලියාපදිංචි කළ",
    alreadyRegisteredNoReenter: "දැනටමත් ලියාපදිංචියි - නැවත විස්තර ඇතුළත් කිරීම අවශ්‍ය නැත",
    alreadyHaveAccount: "දැනටමත් ගිණුමක් තිබේ",
    wasRegisteredBefore: "කලින් ලියාපදිංචි කර ඇත (මට ගිණුම් අංකය තිබේ)",
    registerNew: "අලුතින් ලියාපදිංචි කරන්න",
    createNewProfile: "සඳහා නව ගිණුමක් සාදන්න",
    skip: "මඟ හරින්න",
    cannotAdd: "මට එකතු කිරීමට නොහැක",
    selectReason: "කරුණාකර හේතුවක් තෝරන්න:",
    // Existing step
    enterAccountNumber: "ගිණුම් අංකය ඇතුළත් කරන්න",
    enterRegistrationNumber: "කලින් ලියාපදිංචියේදී ලබා දුන් ලියාපදිංචි අංකය ඇතුළත් කරන්න",
    accountNumber: "ගිණුම් අංකය",
    enterNumberPlaceholder: "අංකය ඇතුළත් කරන්න (උදා: 12345)",
    // Phone step
    phoneOptional: "දුරකථන අංකය (අත්‍යවශ්‍ය නැත)",
    verifyPhone: "දුරකථන අංකය තහවුරු කරන්න",
    addPhoneOrSkip: "ඔබට දුරකථන අංකයක් තිබේ නම් එකතු කරන්න, නැතිනම් ඉදිරියට යන්න",
    sendCodeToNumber: "අපි මෙම අංකයට තහවුරු කේතයක් යවන්නෙමු",
    phoneNumber: "දුරකථන අංකය",
    sendVerificationCode: "තහවුරු කේතය යවන්න",
    skipPhoneEmailOnly: "දුරකථනය මඟ හැර, ඊමේල් පමණක් භාවිතා කරන්න",
    codeSentTo: "කේතය යවන ලදි",
    enterSixDigitCode: "ඉලක්කම් 6 කේතය ඇතුළත් කරන්න",
    verifyAndContinue: "තහවුරු කර ඉදිරියට යන්න",
    phoneVerified: "දුරකථනය තහවුරු විය!",
    // Email step
    verifyEmail: "ඊමේල් ලිපිනය තහවුරු කරන්න",
    sendCodeToEmail: "අපි ඔබේ ඊමේල් ලිපිනයට තහවුරු කේතයක් යවන්නෙමු",
    emailAddress: "ඊමේල් ලිපිනය",
    verifyEmailBtn: "ඊමේල් තහවුරු කරන්න",
    emailVerified: "ඊමේල් තහවුරු විය!",
    continueToFillDetails: "විස්තර පිරවීමට ඉදිරියට යන්න",
    // Error dialog
    alreadyRegisteredTitle: "දැනටමත් ලියාපදිංචියි",
    reference: "යොමුව",
    close: "වසන්න",
    useThisAccount: "මෙම ගිණුම භාවිතා කරන්න",
    // Skip reasons - Father
    fatherDeceasedLabel: "පියා අප අතර නැත",
    fatherDeceasedDesc: "මගේ පියා අභාවප්‍රාප්ත වී ඇත",
    fatherAbsentLabel: "පියා නොමැත",
    fatherAbsentDesc: "පියා පවුලේ කොටසක් නොවේ",
    fatherDivorcedLabel: "දෙමව්පියන් නීත්‍යානුකූලව වෙන් වී ඇත",
    fatherDivorcedDesc: "පියාට භාරකාරත්වය හෝ සම්බන්ධතාවයක් නැත",
    fatherUnknownLabel: "පියාගේ තොරතුරු නොදනී",
    fatherUnknownDesc: "මට පියාගේ තොරතුරු නැත",
    fatherOtherLabel: "වෙනත් හේතුවක්",
    fatherOtherDesc: "වෙනත් හේතුවක් සඳහන් කරන්න",
    // Skip reasons - Mother
    motherDeceasedLabel: "මව අප අතර නැත",
    motherDeceasedDesc: "මගේ මව අභාවප්‍රාප්ත වී ඇත",
    motherAbsentLabel: "මව නොමැත",
    motherAbsentDesc: "මව පවුලේ කොටසක් නොවේ",
    motherDivorcedLabel: "දෙමව්පියන් නීත්‍යානුකූලව වෙන් වී ඇත",
    motherDivorcedDesc: "මවට භාරකාරත්වය හෝ සම්බන්ධතාවයක් නැත",
    motherUnknownLabel: "මවගේ තොරතුරු නොදනී",
    motherUnknownDesc: "මට මවගේ තොරතුරු නැත",
    motherOtherLabel: "වෙනත් හේතුවක්",
    motherOtherDesc: "වෙනත් හේතුවක් සඳහන් කරන්න",
    // Skip reasons - Guardian
    guardianParentsAddedLabel: "දැනටමත් දෙමව්පියන් එකතු කර ඇත",
    guardianParentsAddedDesc: "පියා සහ/හෝ මව ප්‍රධාන භාරකරුවන් වේ",
    guardianLivingWithParentsLabel: "දෙමව්පියන් සමඟ ජීවත් වේ",
    guardianLivingWithParentsDesc: "වෙනම භාරකරුවෙකු අවශ්‍ය නැත",
    guardianParentIsGuardianLabel: "දෙමාපියෙකු මගේ භාරකරු වේ",
    guardianParentIsGuardianDesc: "පියා හෝ මව මගේ නීතිමය භාරකරු ද වේ",
    guardianOtherLabel: "වෙනත් හේතුවක්",
    guardianOtherDesc: "වෙනත් හේතුවක් සඳහන් කරන්න",
    // Other reason input
    enterOtherReason: "කරුණාකර ඔබගේ හේතුව ඇතුළත් කරන්න",
    otherReasonPlaceholder: "ඔබගේ හේතුව මෙහි ටයිප් කරන්න...",
    submitReason: "ඉදිරිපත් කරන්න",
    // Parent types
    father: "පියා",
    mother: "මව",
    guardian: "භාරකරු",
    Father: "පියා",
    Mother: "මව",
    Guardian: "භාරකරු",
    // Selection summary
    currentSelection: "වත්මන් තේරීම",
    existingAccount: "පවතින ගිණුම භාවිතා කරයි",
    newlyCreated: "අලුතින් සාදන ලදි",
    skippedWith: "මඟ හරින ලදි",
    reason: "හේතුව",
    changeSelection: "තේරීම වෙනස් කරන්න",
    accountId: "ගිණුම් අංකය",
  }
};

// Separate local storage keys for each parent type (keeps father/mother/guardian data separate)
const STORAGE_KEY_FATHER = "suraksha_registered_father";
const STORAGE_KEY_MOTHER = "suraksha_registered_mother";
const STORAGE_KEY_GUARDIAN = "suraksha_registered_guardian";

// AWS base URL to replace with Suraksha storage URL
const AWS_BASE_URL_PATTERN = /^https?:\/\/[^\/]*\.amazonaws\.com\//;
const SURAKSHA_STORAGE_BASE = "https://storage.suraksha.lk/";

// Helper to transform AWS URL to Suraksha storage URL
const transformImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (AWS_BASE_URL_PATTERN.test(url)) {
    // Extract the relative path after the AWS domain
    const relativePath = url.replace(AWS_BASE_URL_PATTERN, '');
    return `${SURAKSHA_STORAGE_BASE}${relativePath}`;
  }
  // If already a suraksha URL or other URL, return as is
  return url;
};

// Get storage key for parent type
const getStorageKey = (type: "Father" | "Mother" | "Guardian"): string => {
  switch (type) {
    case "Father": return STORAGE_KEY_FATHER;
    case "Mother": return STORAGE_KEY_MOTHER;
    case "Guardian": return STORAGE_KEY_GUARDIAN;
  }
};

export interface RegisteredParent {
  id: string;
  type: "Father" | "Mother" | "Guardian";
  name: string;
  imageUrl?: string;
  timestamp: number;
}

// Helper to get registered parent by type from session storage (more secure than localStorage)
export const getRegisteredParent = (type: "Father" | "Mother" | "Guardian"): RegisteredParent | null => {
  try {
    const key = getStorageKey(type);
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const parent = JSON.parse(stored) as RegisteredParent;
      // Session storage clears on tab close, but still check timestamp for extra safety
      const now = Date.now();
      const oneDayMs = 24 * 60 * 60 * 1000; // Reduced to 1 day for security
      if (now - parent.timestamp < oneDayMs) {
        return parent;
      }
      // Expired, remove it
      sessionStorage.removeItem(key);
    }
  } catch (e) {
    console.error("Error reading session storage:", e);
  }
  return null;
};

// Helper to save a registered parent to session storage (stores separately by type)
export const saveRegisteredParent = (parent: Omit<RegisteredParent, 'timestamp'>) => {
  try {
    const key = getStorageKey(parent.type);
    const parentToSave: RegisteredParent = {
      ...parent,
      imageUrl: transformImageUrl(parent.imageUrl),
      timestamp: Date.now()
    };
    sessionStorage.setItem(key, JSON.stringify(parentToSave));
  } catch (e) {
    console.error("Error saving to session storage:", e);
  }
};

// Helper to clear a specific parent type from session storage
export const clearRegisteredParent = (type: "Father" | "Mother" | "Guardian") => {
  try {
    const key = getStorageKey(type);
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error("Error clearing session storage:", e);
  }
};

// Helper to clear all registered parents from session storage
export const clearAllRegisteredParents = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY_FATHER);
    sessionStorage.removeItem(STORAGE_KEY_MOTHER);
  } catch (e) {
    // Error clearing session storage
  }
};

// Selection data passed from parent for restoration
export interface ParentSelectionData {
  type: "existing" | "created" | "skipped";
  id?: string;
  skipReason?: string;
  name?: string;
  imageUrl?: string;
}

interface ParentExistsFormProps {
  parentType: "Father" | "Mother" | "Guardian";
  onExistingParent: (id: string, phoneNumber: string) => void;
  onNewParent: (phoneNumber: string, email: string) => void;
  onSkip?: (reason?: string) => void;
  canSkip?: boolean;
  isStudentForm?: boolean;
  // For guardian - to check if father/mother were added
  hasFather?: boolean;
  hasMother?: boolean;
  // Previously selected data for restoration
  selectionData?: ParentSelectionData;
  // Callback to reset selection
  onResetSelection?: () => void;
}

type Step = "choose" | "existing" | "new-verify" | "new-email" | "skip-reason";

// Skip reasons for each parent type with translations
const getSkipReasons = (parentType: "Father" | "Mother" | "Guardian", lang: Language, hasFather?: boolean, hasMother?: boolean) => {
  const t = translations[lang];
  
  if (parentType === "Father") {
    return [
      { id: "deceased", icon: HeartCrack, label: t.fatherDeceasedLabel, description: t.fatherDeceasedDesc },
      { id: "absent", icon: Home, label: t.fatherAbsentLabel, description: t.fatherAbsentDesc },
      { id: "divorced", icon: Scale, label: t.fatherDivorcedLabel, description: t.fatherDivorcedDesc },
      { id: "unknown", icon: Users, label: t.fatherUnknownLabel, description: t.fatherUnknownDesc },
      { id: "other", icon: MessageSquare, label: t.fatherOtherLabel, description: t.fatherOtherDesc, isOther: true },
    ];
  }
  
  if (parentType === "Mother") {
    return [
      { id: "deceased", icon: HeartCrack, label: t.motherDeceasedLabel, description: t.motherDeceasedDesc },
      { id: "absent", icon: Home, label: t.motherAbsentLabel, description: t.motherAbsentDesc },
      { id: "divorced", icon: Scale, label: t.motherDivorcedLabel, description: t.motherDivorcedDesc },
      { id: "unknown", icon: Users, label: t.motherUnknownLabel, description: t.motherUnknownDesc },
      { id: "other", icon: MessageSquare, label: t.motherOtherLabel, description: t.motherOtherDesc, isOther: true },
    ];
  }
  
  // Guardian
  return [
    { id: "parents_added", icon: Users, label: t.guardianParentsAddedLabel, description: t.guardianParentsAddedDesc },
    { id: "living_with_parents", icon: Home, label: t.guardianLivingWithParentsLabel, description: t.guardianLivingWithParentsDesc },
    { id: "parent_is_guardian", icon: Shield, label: t.guardianParentIsGuardianLabel, description: t.guardianParentIsGuardianDesc },
    { id: "other", icon: MessageSquare, label: t.guardianOtherLabel, description: t.guardianOtherDesc, isOther: true },
  ];
};

export const ParentExistsForm = ({
  parentType,
  onExistingParent,
  onNewParent,
  onSkip,
  canSkip = true,
  isStudentForm = false,
  hasFather = false,
  hasMother = false,
  selectionData,
  onResetSelection,
}: ParentExistsFormProps) => {
  const [step, setStep] = useState<Step>("choose");
  const [parentId, setParentId] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [selectedSkipReason, setSelectedSkipReason] = useState("");
  const [customOtherReason, setCustomOtherReason] = useState("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [showSkipReasons, setShowSkipReasons] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  
  // Recently registered parent from current session
  const [recentParent, setRecentParent] = useState<RegisteredParent | null>(null);
  
  // OTP states
  const [phoneOTPSent, setPhoneOTPSent] = useState(false);
  const [phoneOTPCode, setPhoneOTPCode] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingPhoneOTP, setSendingPhoneOTP] = useState(false);
  const [verifyingPhoneOTP, setVerifyingPhoneOTP] = useState(false);
  
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [emailOTPCode, setEmailOTPCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingEmailOTP, setSendingEmailOTP] = useState(false);
  const [verifyingEmailOTP, setVerifyingEmailOTP] = useState(false);
  
  // Error dialog states
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorUserId, setErrorUserId] = useState("");

  // Check for recently registered parent of same type on mount
  useEffect(() => {
    const matchingParent = getRegisteredParent(parentType);
    if (matchingParent) {
      setRecentParent(matchingParent);
    }
  }, [parentType]);

  const handleSendPhoneOTP = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    
    setSendingPhoneOTP(true);
    try {
      const response = await requestPhoneOTP(phoneNumber);
      toast.success(response.message);
      setPhoneOTPSent(true);
    } catch (error: any) {
      const message = error?.message || "Failed to send OTP";
      
      if (error?.statusCode === 409) {
        setErrorMessage(message);
        setErrorUserId(error?.userId || '');
        setShowErrorDialog(true);
      } else {
        toast.error(message);
      }
    } finally {
      setSendingPhoneOTP(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (phoneOTPCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    
    setVerifyingPhoneOTP(true);
    try {
      const response = await verifyPhoneOTP(phoneNumber, phoneOTPCode);
      toast.success(response.message);
      setPhoneVerified(true);
      // Auto-advance to email step
      setTimeout(() => setStep("new-email"), 500);
    } catch (error) {
      toast.error("Invalid code. Please try again.");
    } finally {
      setVerifyingPhoneOTP(false);
    }
  };

  const handleSendEmailOTP = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }
    
    setSendingEmailOTP(true);
    try {
      const response = await requestEmailOTP(email);
      toast.success(response.message);
      setEmailOTPSent(true);
    } catch (error: any) {
      const message = error?.message || "Failed to send verification code";
      
      if (error?.statusCode === 409) {
        setErrorMessage(message);
        setErrorUserId(error?.userId || '');
        setShowErrorDialog(true);
      } else {
        toast.error(message);
      }
    } finally {
      setSendingEmailOTP(false);
    }
  };
  
  const handleUseExistingUser = () => {
    setStep("existing");
    setParentId(errorUserId);
    setPhoneNumber("");
    setEmail("");
    setPhoneOTPSent(false);
    setPhoneOTPCode("");
    setPhoneVerified(false);
    setEmailOTPSent(false);
    setEmailOTPCode("");
    setEmailVerified(false);
    setShowErrorDialog(false);
    setErrorMessage("");
    setErrorUserId("");
  };

  const handleVerifyEmailOTP = async () => {
    if (emailOTPCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    
    setVerifyingEmailOTP(true);
    try {
      const response = await verifyEmailOTP(email, emailOTPCode);
      toast.success(response.message);
      setEmailVerified(true);
    } catch (error) {
      toast.error("Invalid code. Please try again.");
    } finally {
      setVerifyingEmailOTP(false);
    }
  };

  const handleContinue = () => {
    onNewParent(phoneNumber, email);
    // Reset form
    setPhoneNumber("");
    setEmail("");
    setStep("choose");
    setPhoneOTPSent(false);
    setPhoneOTPCode("");
    setPhoneVerified(false);
    setEmailOTPSent(false);
    setEmailOTPCode("");
    setEmailVerified(false);
  };

  const handleExistingContinue = () => {
    onExistingParent(parentId, "");
    setParentId("");
    setStep("choose");
  };

  const handleUseRecentParent = () => {
    if (recentParent) {
      onExistingParent(recentParent.id, "");
      setStep("choose");
    }
  };

  const handleBack = () => {
    if (step === "new-email") {
      setStep("new-verify");
    } else if (step === "skip-reason") {
      setStep("choose");
      setSelectedSkipReason("");
    } else {
      setStep("choose");
    }
  };

  const handleSkipWithReason = () => {
    if (onSkip) {
      onSkip();
    }
    setSelectedSkipReason("");
    setStep("choose");
  };

  const handleSkipPhone = () => {
    if (isStudentForm) {
      setStep("new-email");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const skipReasons = getSkipReasons(parentType, language, hasFather, hasMother);
  const t = translations[language];
  
  // Get translated parent type
  const getParentTypeName = (type: "Father" | "Mother" | "Guardian", lowercase = false) => {
    if (lowercase) {
      return type === "Father" ? t.father : type === "Mother" ? t.mother : t.guardian;
    }
    return type === "Father" ? t.Father : type === "Mother" ? t.Mother : t.Guardian;
  };

  return (
    <>
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.alreadyRegisteredTitle}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <div>{errorMessage}</div>
                {errorUserId && errorUserId !== '' && (
                  <div className="font-semibold text-foreground">{t.reference}: {errorUserId}</div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.close}</AlertDialogCancel>
            {errorUserId && errorUserId !== '' && (
              <AlertDialogAction onClick={handleUseExistingUser}>
                {t.useThisAccount}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="space-y-6">
        {/* Language Toggle */}
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setLanguage("en")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                language === "en" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage("si")}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                language === "si" 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              සිංහල
            </button>
          </div>
        </div>

        {/* Selection Summary - shown when there's existing selection data */}
        {selectionData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <Card className={`border-2 ${
              selectionData.type === "skipped" 
                ? "border-muted bg-muted/30" 
                : selectionData.type === "existing" 
                  ? "border-primary bg-primary/5" 
                  : "border-green-500 bg-green-50 dark:bg-green-950"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {selectionData.type === "skipped" ? (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <SkipForward className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ) : selectionData.type === "existing" ? (
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                    ) : (
                      <>
                        {selectionData.imageUrl ? (
                          <img 
                            src={selectionData.imageUrl} 
                            alt={selectionData.name || ""}
                            className="w-10 h-10 rounded-full object-cover border-2 border-green-500/50 shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 ${selectionData.imageUrl ? 'hidden' : ''}`}>
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      </>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background border">
                          {t.currentSelection}
                        </span>
                      </div>
                      {selectionData.type === "skipped" ? (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-muted-foreground">
                            {t.skippedWith} {getParentTypeName(parentType, true)}
                          </p>
                          {selectionData.skipReason && (
                            <p className="text-xs text-muted-foreground">
                              {t.reason}: {(() => {
                                const reason = skipReasons.find(r => r.id === selectionData.skipReason);
                                return reason ? reason.label : selectionData.skipReason;
                              })()}
                            </p>
                          )}
                        </div>
                      ) : selectionData.type === "existing" ? (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-primary">
                            {t.existingAccount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.accountId}: {selectionData.id}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <p className="text-sm font-medium text-green-700 dark:text-green-400">
                            {t.newlyCreated}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectionData.name && <span>{selectionData.name} • </span>}
                            ID: {selectionData.id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {onResetSelection && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onResetSelection}
                      className="shrink-0"
                    >
                      {t.changeSelection}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Choose Option */}
          {step === "choose" && (
            <motion.div
              key="choose"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-semibold mb-2">
                  {t.letsAdd} {getParentTypeName(parentType, true)} {t.information}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t.chooseOption}
                </p>
              </div>

              <div className="grid gap-3">
                {/* Option: Recently Registered (from local storage) */}
                {recentParent && (
                  <Card 
                    className="cursor-pointer border-2 border-green-500 bg-green-50 dark:bg-green-950 hover:border-green-600 transition-all"
                    onClick={handleUseRecentParent}
                  >
                    <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                      {recentParent.imageUrl ? (
                        <img 
                          src={recentParent.imageUrl} 
                          alt={recentParent.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-500/50 shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center shrink-0 ${recentParent.imageUrl ? 'hidden' : ''}`}>
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-base sm:text-lg text-green-700 dark:text-green-400">
                          {t.usePreviouslyRegistered} {getParentTypeName(parentType, true)}
                        </h4>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">
                          {recentParent.name} • ID: {recentParent.id}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t.alreadyRegisteredNoReenter}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-green-600 shrink-0" />
                    </CardContent>
                  </Card>
                )}

                {/* Option: Already Registered */}
                <Card 
                  className="cursor-pointer border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  onClick={() => setStep("existing")}
                >
                  <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base sm:text-lg">{t.alreadyHaveAccount}</h4>
                      <p className="text-sm text-muted-foreground">
                        {getParentTypeName(parentType)} {t.wasRegisteredBefore}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>

                {/* Option: Create New */}
                <Card 
                  className="cursor-pointer border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  onClick={() => setStep("new-verify")}
                >
                  <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                    <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                      <UserPlus className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-base sm:text-lg">{t.registerNew} {getParentTypeName(parentType, true)}</h4>
                      <p className="text-sm text-muted-foreground">
                        {t.createNewProfile} {getParentTypeName(parentType, true)}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>

                {/* Option: Skip with Reasons */}
                {onSkip && canSkip && (
                  <div className="space-y-2">
                    <Card 
                      className="cursor-pointer border-2 border-dashed hover:border-primary/50 hover:bg-primary/5 transition-all"
                      onClick={() => {
                        const newValue = !showSkipReasons;
                        setShowSkipReasons(newValue);
                        if (!newValue) {
                          setShowOtherInput(false);
                          setCustomOtherReason("");
                        }
                      }}
                    >
                      <CardContent className="flex items-center gap-4 p-4 sm:p-6">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <SkipForward className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-base sm:text-lg text-muted-foreground">
                            {t.skip} {getParentTypeName(parentType, true)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {t.cannotAdd} {getParentTypeName(parentType, true)} {t.information}
                          </p>
                        </div>
                        {showSkipReasons ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                        )}
                      </CardContent>
                    </Card>

                    {/* Skip Reason Text Input */}
                    <AnimatePresence>
                      {showSkipReasons && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-4 border-l-2 border-muted ml-6 space-y-3 py-3">
                            <Label className="text-sm text-muted-foreground">
                              {t.enterOtherReason}
                            </Label>
                            <Textarea
                              value={customOtherReason}
                              onChange={(e) => setCustomOtherReason(e.target.value)}
                              placeholder={t.otherReasonPlaceholder}
                              className="min-h-[80px] resize-none"
                              maxLength={200}
                            />
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">
                                {customOtherReason.length}/200
                              </span>
                              <Button
                                size="sm"
                                disabled={!customOtherReason.trim()}
                                onClick={() => {
                                  if (onSkip && customOtherReason.trim()) {
                                    onSkip(customOtherReason.trim());
                                    setCustomOtherReason("");
                                    setShowSkipReasons(false);
                                  }
                                }}
                              >
                                {t.submitReason}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2a: Existing Parent */}
          {step === "existing" && (
            <motion.div
              key="existing"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t.back}
                </Button>
              </div>

              <Card className="border-2 border-primary">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <UserCheck className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>{t.enterAccountNumber} - {getParentTypeName(parentType)}</CardTitle>
                  <CardDescription>
                    {t.enterRegistrationNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="parent-id">{t.accountNumber}</Label>
                    <ValidatedInput
                      id="parent-id"
                      type="number"
                      placeholder={t.enterNumberPlaceholder}
                      value={parentId}
                      onChange={(e) => setParentId(e.target.value)}
                      className="text-center text-lg"
                      onKeyDown={(e) => {
                        if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <Button 
                    onClick={handleExistingContinue} 
                    disabled={!parentId}
                    className="w-full"
                    size="lg"
                  >
                    {t.continue}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2b: Phone Verification */}
          {step === "new-verify" && (
            <motion.div
              key="new-verify"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t.back}
                </Button>
              </div>

              <Card className="border-2 border-primary">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>
                    {isStudentForm ? t.phoneOptional : t.verifyPhone}
                  </CardTitle>
                  <CardDescription>
                    {isStudentForm ? t.addPhoneOrSkip : t.sendCodeToNumber}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!phoneVerified ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="phone">{t.phoneNumber}</Label>
                        <div className="flex gap-2">
                          <PhoneInput
                            id="phone"
                            value={phoneNumber}
                            onChange={setPhoneNumber}
                            disabled={phoneOTPSent}
                            className="flex-1"
                          />
                        </div>
                      </div>

                      {!phoneOTPSent ? (
                        <div className="space-y-3">
                          <Button 
                            onClick={handleSendPhoneOTP}
                            disabled={!phoneNumber || phoneNumber === '+94' || phoneNumber.replace(/\D/g, '').length < 11 || sendingPhoneOTP}
                            className="w-full"
                            size="lg"
                          >
                            {sendingPhoneOTP ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.sending}
                              </>
                            ) : (
                              <>
                                {t.sendVerificationCode}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </>
                            )}
                          </Button>
                          {isStudentForm && (
                            <Button 
                              variant="ghost" 
                              onClick={handleSkipPhone}
                              className="w-full text-muted-foreground"
                            >
                              {t.skipPhoneEmailOnly}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {t.codeSentTo} {phoneNumber}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>{t.enterSixDigitCode}</Label>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={phoneOTPCode}
                                onChange={setPhoneOTPCode}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                          </div>
                          <Button
                            onClick={handleVerifyPhoneOTP}
                            disabled={phoneOTPCode.length !== 6 || verifyingPhoneOTP}
                            className="w-full"
                            size="lg"
                          >
                            {verifyingPhoneOTP ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.verifying}
                              </>
                            ) : (
                              t.verifyAndContinue
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="font-medium text-green-600 dark:text-green-400">{t.phoneVerified}</p>
                      <p className="text-sm text-green-600/80 dark:text-green-400/80">{phoneNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Email Verification */}
          {step === "new-email" && (
            <motion.div
              key="new-email"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  {t.back}
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className={`w-3 h-3 rounded-full ${phoneVerified ? 'bg-green-500' : 'bg-muted'}`} />
                <div className="w-8 h-0.5 bg-muted" />
                <div className={`w-3 h-3 rounded-full ${emailVerified ? 'bg-green-500' : 'bg-primary'}`} />
              </div>

              <Card className="border-2 border-primary">
                <CardHeader className="text-center pb-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>{t.verifyEmail}</CardTitle>
                  <CardDescription>
                    {t.sendCodeToEmail}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!emailVerified ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t.emailAddress}</Label>
                        <ValidatedInput
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={emailOTPSent}
                        />
                      </div>

                      {!emailOTPSent ? (
                        <Button 
                          onClick={handleSendEmailOTP}
                          disabled={!email || sendingEmailOTP}
                          className="w-full"
                          size="lg"
                        >
                          {sendingEmailOTP ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              {t.sending}
                            </>
                          ) : (
                            <>
                              {t.sendVerificationCode}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {t.codeSentTo} {email}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label>{t.enterSixDigitCode}</Label>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={emailOTPCode}
                                onChange={setEmailOTPCode}
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot index={0} />
                                  <InputOTPSlot index={1} />
                                  <InputOTPSlot index={2} />
                                  <InputOTPSlot index={3} />
                                  <InputOTPSlot index={4} />
                                  <InputOTPSlot index={5} />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                          </div>
                          <Button
                            onClick={handleVerifyEmailOTP}
                            disabled={emailOTPCode.length !== 6 || verifyingEmailOTP}
                            className="w-full"
                            size="lg"
                          >
                            {verifyingEmailOTP ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t.verifying}
                              </>
                            ) : (
                              t.verifyEmailBtn
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                        <p className="font-medium text-green-600 dark:text-green-400">{t.emailVerified}</p>
                        <p className="text-sm text-green-600/80 dark:text-green-400/80">{email}</p>
                      </div>
                      <Button 
                        onClick={handleContinue}
                        className="w-full"
                        size="lg"
                      >
                        {t.continueToFillDetails}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};