import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Alert from "../../components/Alert";
import SEO from "../../components/SEO";
import { loginAPI } from "../../features/auth/authService";
import { useAuth } from "../../contexts/AuthContext";
import { api, API_BASE_URL } from "../../features/api/api";
import { Navbar } from "../../components/layout/Navbar";
import Logo from "../../components/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();

  useEffect(() => {
    if (!user) return;

    const state = location.state as { from?: string } | null;
    navigate(state?.from || "/home", { replace: true });
  }, [location.state, navigate, user]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isGoogleSuccess = params.get("google") === "success";
    if (!isGoogleSuccess || user) return;

    const syncGoogleLogin = async () => {
      try {
        const res = await api.get("/api/auth/me");
        const userData = res?.data;
        if (!userData) return;

        setUser(userData);
        const redirectTarget = params.get("redirect") === "dashboard" ? "/dashboard" : "/home";
        navigate(redirectTarget, { replace: true });
      } catch (err: any) {
        const message = err?.response?.data?.message || "Google login completed but session sync failed. Please retry.";
        setError(message);
      }
    };

    syncGoogleLogin();
  }, [location.search, navigate, setUser, user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginAPI(email, password);
      setUser(data.user);
      setSuccess("Login successful! Redirecting...");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <Navbar />
      <SEO
        title="Login – Open Source Nepal"
        description="Log in to Open Source Nepal – the launch platform for modern builders. Discover startups, join the community, and launch your next big idea."
        keywords="Open Source Nepal login, startup launch, founder community, launch platform"
        url="/login"
      />

      {/* Subtle radial glow — no loud gradient band */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-50 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-3xl dark:bg-primary/[0.10]" />
      </div>

      <main className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="rounded-2xl border border-border bg-card p-7 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_8px_32px_-16px_rgba(17,35,79,0.12)] sm:p-9">
            {/* Logo & Branding */}
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-5 flex justify-center">
                <Logo size="lg" />
              </div>
              <h1 className="text-[24px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[28px]">
                Welcome back
              </h1>
              <p className="mt-1.5 text-center text-[13px] leading-relaxed text-muted-foreground">
                Sign in to continue to the launch platform
              </p>
            </div>

            {/* Alerts */}
            <Alert message={error} type="error" />
            <Alert message={success} type="success" />

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-[13px] font-semibold text-foreground"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-[13px] font-semibold text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-lg border border-border bg-background pl-10 pr-11 text-[14px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Link
                  to="/forgot-password"
                  className="mt-2 inline-block text-[13px] font-medium text-primary transition-colors hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[12px]">
                <span className="bg-card px-3 font-medium uppercase tracking-wider text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 text-[14px] font-medium text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Register Link */}
            <p className="mt-6 text-center text-[13px] text-muted-foreground">
              New to Open Source Nepal?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary transition-colors hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}