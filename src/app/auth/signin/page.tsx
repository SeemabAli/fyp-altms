"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, AlertCircle, LogIn } from "lucide-react";
import toast from "react-hot-toast";

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    if (errors.general && (email || password)) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  }, [email, password, errors.general]);

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Password is required";
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return undefined;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res?.error) {
        // ✅ Success toast
        toast.success("Signed in successfully!", { duration: 4000 });

        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        const roleRoutes: Record<string, string> = {
          admin: "/admin/dashboard",
          coordinator: "/coordinator/dashboard",
          faculty: "/faculty/dashboard",
          student: "/student/timetable",
        };

        const redirectUrl =
          roleRoutes[session?.user?.role] || callbackUrl || "/dashboard";

        router.push(redirectUrl);
        router.refresh();
      } else {
        // ❌ Invalid credentials toast
        toast.error("Invalid email or password!", { duration: 4000 });
        setErrors({ general: "Invalid email or password. Please try again." });
      }
    } catch {
      // ⚠️ Unexpected error toast
      toast.error("User not found or unexpected error occurred!", {
        duration: 4000,
      });
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#d89860] opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#493737] opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg ring-4 ring-white/20 overflow-hidden">
              <Image
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/VU_Logo.png/960px-VU_Logo.png"
                alt="VU Logo"
                width={60}
                height={60}
                className="w-3/4 h-auto object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#493737] mb-2">
                Automated Timetable System
              </h1>
              <div className="w-20 h-1 bg-[#d89860] rounded-full mx-auto"></div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-[#493737] to-[#5a4444] text-white px-8 py-8 text-center">
            <LogIn className="w-8 h-8 mx-auto mb-3 text-[#d89860]" />
            <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
            <p className="text-white/80">Sign in to access your dashboard</p>
          </div>

          <div className="px-8 py-8">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                  <span className="text-red-700 text-sm font-medium">
                    {errors.general}
                  </span>
                </div>
              </div>
            )}

            {/* FORM START */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold mb-3 text-[#493737]"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail
                      className={`h-5 w-5 transition-colors ${
                        errors.email
                          ? "text-red-400"
                          : "text-gray-400 group-focus-within:text-[#d89860]"
                      }`}
                    />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:bg-red-50"
                        : "border-gray-200 focus:border-[#d89860] focus:bg-white hover:border-gray-300"
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                {errors.email && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold mb-3 text-[#493737]"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock
                      className={`h-5 w-5 transition-colors ${
                        errors.password
                          ? "text-red-400"
                          : "text-gray-400 group-focus-within:text-[#d89860]"
                      }`}
                    />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => handleBlur("password")}
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:bg-red-50"
                        : "border-gray-200 focus:border-[#d89860] focus:bg-white hover:border-gray-300"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-[#d89860] transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-[#d89860] transition-colors" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="mt-2 flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full bg-gradient-to-r from-[#d89860] to-[#e0a670] hover:from-[#c88850] hover:to-[#d89860] text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-[#d89860]/20"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />
                    Sign In
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 Virtual University of Pakistan. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
