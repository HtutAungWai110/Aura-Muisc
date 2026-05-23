import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const Login = () => {
  const [floatY, setFloatY] = useState(0);

  const onClick = async () => {
    window.location.href = "/api/auth/google";
  };
  useEffect(() => {
    let direction = 1;
    let currentY = 0;
    const animate = () => {
      currentY += 0.05 * direction;
      if (Math.abs(currentY) > 5) direction *= -1;
      setFloatY(currentY);
      requestAnimationFrame(animate);
    };
    const animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-mesh selection:bg-primary selection:text-on-primary text-on-surface font-body-lg">
      {/* Atmospheric Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[120px] rounded-full animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Main Content Wrapper */}
      <main className="relative z-10 w-full max-w-md px-container-padding-mobile md:px-0">
        {/* Branding Header */}
        <div className="text-center mb-12 animate-in fade-in duration-700">
          <div
            className="inline-flex items-center justify-center w-32 h-32 mb-6 glass-panel rounded-3xl neon-glow transition-transform"
            style={{ transform: `translateY(${floatY}px)` }}
          >
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontSize: "80px" }}
            >
              graphic_eq
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tighter mb-2">
            Aura Music
          </h1>
          <p className="font-body-lg text-on-surface-variant/80">
            Electric Sophistication in Every Note
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8 rounded-lg shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10 text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">
              Welcome back to Aura
            </h2>
            <p className="font-body-sm text-on-surface-variant">
              Your sonic sanctuary awaits.
            </p>
          </div>

          <div className="space-y-4">
            {/* Google Sign In Button */}
            <Button
              onClick={onClick}
              variant="outline"
              className="w-full h-14 flex items-center justify-center gap-4 bg-white text-surface font-bold rounded-full hover:bg-white/90 transition-all duration-300 active:scale-95 shadow-lg group border-none"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                ></path>
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                ></path>
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                ></path>
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                ></path>
              </svg>
              <span className="font-title-md">Sign in with Google</span>
            </Button>
          </div>
        </div>

        {/* Visualizer Decoration */}
        <div className="flex items-end justify-center gap-1.5 mt-12 h-16 opacity-30">
          <div
            className="w-1.5 bg-primary rounded-full animate-bounce"
            style={{ height: "40%", animationDuration: "1.2s" }}
          ></div>
          <div
            className="w-1.5 bg-primary-container rounded-full animate-bounce"
            style={{ height: "70%", animationDuration: "0.8s" }}
          ></div>
          <div
            className="w-1.5 bg-secondary rounded-full animate-bounce"
            style={{ height: "100%", animationDuration: "1.5s" }}
          ></div>
          <div
            className="w-1.5 bg-tertiary rounded-full animate-bounce"
            style={{ height: "60%", animationDuration: "1.1s" }}
          ></div>
          <div
            className="w-1.5 bg-primary rounded-full animate-bounce"
            style={{ height: "80%", animationDuration: "0.9s" }}
          ></div>
          <div
            className="w-1.5 bg-secondary-container rounded-full animate-bounce"
            style={{ height: "50%", animationDuration: "1.4s" }}
          ></div>
          <div
            className="w-1.5 bg-primary-fixed rounded-full animate-bounce"
            style={{ height: "90%", animationDuration: "1s" }}
          ></div>
        </div>
      </main>

      {/* Background Artwork Imagery (Bottom Left) */}
      <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] -rotate-12 opacity-20 pointer-events-none hidden lg:block">
        <img
          className="w-full h-full object-cover rounded-xl shadow-2xl"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDWmQy8XiOACZcXCb4R0i7vc9opjnonC_0YX6k2Bdsluo1i_kKqL5UJPB9-NolCGjQy7HBelkAp3PL5WcPFZpMbS9QIUFLPQWp7GNaZ24lZJSo16bQ28EBROnzth062RGLlBR2WG1nJddc6A91ncPH5uUvO0dUfow1iVOy3i1815skyqcc8lNZFifEe5hVEH4XGKCRkZvBZqAd9ZYwah21vRt82lpqg5Nrc1EzqB8OUMHk8VYayHQ0Bb8CUqbtBH2O5EYh1I4oJW00"
          alt="Premium vinyl record"
        />
      </div>

      {/* Background Artwork Imagery (Top Right) */}
      <div className="fixed top-[-100px] right-[-100px] w-[400px] h-[400px] rotate-12 opacity-20 pointer-events-none hidden lg:block">
        <img
          className="w-full h-full object-cover rounded-xl shadow-2xl"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmKlP244EjL3aZQGZ49kTtY4Eajxos7fIQjxGfDUebBmBsgUyQZAQxGaIrdNJvUy1epEK8YZj9AyQLqA5GtIGaatRlzUdirQA6ZP0RdPWnZM7IEzBP3wZg5lqHg-WHq5WHozL-x9iB6kaViGT-pk6_YYFcwME0VY4DKB3kWsuS0ZeYYAjDYnGn7YIUZVOIYCCiQRSkiRt_3iTSHSmgNDW6ZS_HNGdl4XXziKSLIuzAEaabWAGDkLOMo8pUPKXfjAct04AAerWGoRk"
          alt="Abstract sound waves"
        />
      </div>
    </div>
  );
};

export default Login;
