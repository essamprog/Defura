import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { User } from "lucide-react";
import { Navbar, Footer } from "../../components/layout";
import { ROUTES } from "../../constants";

const AuthLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  const [activePath, setActivePath] = useState(path);
  const [iconFade, setIconFade] = useState(true);
  const isFirstRender = useRef(true);

  // Smoothly cross-fade the icon and text at the middle of the slide transition (500ms)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIconFade(false);
    const timeout = setTimeout(() => {
      setActivePath(path);
      setIconFade(true);
    }, 500); // 500ms is exactly half of the 1000ms slide duration
    return () => clearTimeout(timeout);
  }, [path]);

  // Determine contents of the slider banner dynamically based on the delayed activePath
  let bannerTitle = "Welcome Back!";
  let bannerDesc = "Already have an account? Sign in to access your learning portal.";

  if (activePath === ROUTES.LOGIN) {
    bannerTitle = "Hello Friend!";
    bannerDesc = "Don't have an account yet? Register today and start learning.";
  } else if (activePath === ROUTES.FORGOT_PASSWORD || activePath === ROUTES.RESET_PASSWORD) {
    bannerTitle = "Need Help?";
    bannerDesc = "Remember your password? Go back to the sign in page.";
  }

  // Calculate button link instantly on path changes so it is immediately clickable
  const bannerBtnLink = path === ROUTES.LOGIN ? ROUTES.REGISTER : ROUTES.LOGIN;
  const bannerBtnText = path === ROUTES.LOGIN ? "Sign Up" : "Sign In";

  return (
    <div className="auth-layout min-h-screen bg-slate-50 flex flex-col" dir="ltr">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        .auth-title {
          font-family: 'Outfit', sans-serif !important;
          font-weight: 800 !important;
          letter-spacing: -0.02em !important;
        }
      `}</style>
      {/* ── Top Navigation ─────────────────────────────────────── */}
      <Navbar />

      {/* ── Main Content Area ───────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Soft background ambient glowing circles */}
        <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

        {/* Combined Sliding Card */}
        <div className="w-full max-w-5xl h-[620px] bg-white rounded-[32px] shadow-2xl border border-gray-200 overflow-hidden relative flex z-10">

          {/* Sliding Overlay Panel (Left/Right - 50% width) */}
          <div
            className={[
              "hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 md:p-12 flex-col justify-center items-center text-center absolute top-0 bottom-0 h-full transition-all duration-[1000ms] ease-in-out z-20",
              path === ROUTES.LOGIN
                ? "left-[50%] rounded-r-[32px] rounded-l-[128px]"
                : "left-0 rounded-l-[32px] rounded-r-[128px]"
            ].join(" ")}
          >
            {/* Background design elements */}
            <div className="absolute top-[-10%] left-[-10%] w-36 h-36 border border-white/10 rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

            {/* Fading Content Wrapper */}
            <div className={["flex flex-col items-center transition-all duration-300", iconFade ? "opacity-100 scale-100" : "opacity-0 scale-95"].join(" ")}>
              {/* Dynamic Icon/Logo based on active page */}
              {activePath === ROUTES.REGISTER ? (
                /* Person Icon for Registration state */
                <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20 shadow-lg relative z-10 transition-transform duration-300 hover:scale-105">
                  <User className="w-11 h-11 text-white" />
                </div>
              ) : (
                /* Website Logo & Name for Login/other states */
                <div className="flex flex-col items-center mb-6 relative z-10">
                  <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center mb-3 border border-white/20 shadow-lg transition-transform duration-300 hover:scale-105">
                    <img
                      src="/assets/images/Defura_logo.png"
                      alt="DefuraLMS Logo"
                      className="w-18 h-18 object-contain"
                    />
                  </div>
                  <span className="text-xl font-extrabold text-white tracking-tight">
                    Defura<span className="text-blue-200">LMS</span>
                  </span>
                </div>
              )}

              {/* Banner Content */}
              <h2 className="auth-title text-4xl font-extrabold mb-4 tracking-tight relative z-10">
                {bannerTitle}
              </h2>
              <p className="text-blue-100 text-sm leading-relaxed mb-8 max-w-xs relative z-10">
                {bannerDesc}
              </p>
            </div>

            {/* Action Toggle Button (Calculated instantly, not delayed) */}
            <Link
              to={bannerBtnLink}
              className="border-2 border-white/40 hover:bg-white hover:text-blue-600 hover:border-white px-8 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-lg relative z-10"
            >
              {bannerBtnText}
            </Link>
          </div>

          {/* Sliding Form Container (50% width) */}
          <div
            className={[
              "w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white absolute top-0 bottom-0 h-full transition-all duration-[1000ms] ease-in-out z-10",
              path === ROUTES.LOGIN ? "left-0" : "left-0 md:left-[50%]"
            ].join(" ")}
          >
            <Outlet />
          </div>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
};

export default AuthLayout;