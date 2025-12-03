import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useUserRole } from "@/hooks/useUserRole";
import learningIllustration from "@/assets/learning-illustration.png";
import surakshaLogo from "@/assets/suraksha-logo.png";
const BACKEND_URL = "http://localhost:8080";
const loginSchema = z.object({
  email: z.string().trim().email({
    message: "Invalid email address"
  }).max(255),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  }).max(100)
});
const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const {
    setUser,
    setBackendUrl,
    setTokens,
    accessToken,
    user
  } = useUserRole();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (accessToken && user) {
      navigate('/dashboard', {
        replace: true
      });
    }
  }, [accessToken, user, navigate]);
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string
    };

    // Validate input
    const result = loginSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      toast.error("Please fix the form errors");
      return;
    }
    try {
      // Store backend URL
      setBackendUrl(BACKEND_URL);

      // Call login API
      const response = await fetch(`${BACKEND_URL}/organization/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Login failed'
        }));
        throw new Error(errorData.message || 'Invalid credentials');
      }
      const responseData = await response.json();

      // Store tokens and user data
      setTokens(responseData.accessToken, responseData.refreshToken);
      setUser(responseData.user);
      toast.success(`Welcome back, ${responseData.user.name}!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile/Tablet - Top Image */}
      <div className="lg:hidden w-full h-56 md:h-64 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 flex items-center justify-center p-6">
        <img src={learningIllustration} alt="Learning" className="h-full w-auto object-contain" />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16 bg-background rounded-t-[3rem] lg:rounded-t-none -mt-8 lg:mt-0 relative z-10 min-h-[calc(100vh-14rem)] md:min-h-[calc(100vh-16rem)] lg:min-h-screen">
        <div className="w-full max-w-xl space-y-6 md:space-y-8">{/* Increased from max-w-md and spacing */}
          {/* Logo and Title - Centered and Bigger */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-4">
              <img src={surakshaLogo} alt="Suraksha OMS" className="h-16 w-16 md:h-20 md:w-20" />
              <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold">Suraksha OMS</h1>
            </div>
          </div>

          {/* Welcome Text - Centered and Smaller */}
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-semibold">Welcome back</h2>
            <p className="text-sm md:text-base text-muted-foreground">Please enter your details</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6 md:space-y-7">
            <div className="space-y-3">
              <Label htmlFor="login-email" className="text-sm md:text-base font-medium">Email address</Label>
              <Input id="login-email" name="email" type="email" placeholder="Enter your email" className="h-14 md:h-16 text-base" required />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-3">
              <Label htmlFor="login-password" className="text-sm md:text-base font-medium">Password</Label>
              <div className="relative">
                <Input id="login-password" name="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="h-14 md:h-16 pr-12 text-base" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked === true)} className="h-5 w-5" />
                <Label htmlFor="remember" className="text-sm md:text-base font-normal cursor-pointer">
                  Remember for 30 days
                </Label>
              </div>
              
            </div>

            <Button type="submit" className="w-full h-14 md:h-16 text-base md:text-lg font-semibold" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            
          </form>
        </div>
      </div>

      {/* Desktop - Right Side Image/Illustration */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 relative overflow-hidden items-center justify-center p-12">
        <img src={learningIllustration} alt="Learning illustration" className="max-w-2xl w-full h-auto object-contain" />
      </div>
    </div>;
};
export default Auth;