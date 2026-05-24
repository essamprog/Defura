import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, FileText, ChevronRight, CheckCircle, 
  Clock, AlertTriangle, ArrowRight, LogIn, Award, MapPin 
} from "lucide-react";
import { useAuthStore } from "@/store";
import { ROUTES } from "@/constants";
import api from "@/services/api";
import { Spinner, Button } from "@/components/ui";

const BecomeInstructorPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [appStatus, setAppStatus] = useState(null); // null, 'pending', 'approved', 'rejected'
  const [appDetails, setAppDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form Fields
  const [expertise, setExpertise] = useState("");
  const [experience, setExperience] = useState("1-3 years");
  const [resumeUrl, setResumeUrl] = useState("");

  // Fetch current application status if logged in
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const checkApplication = async () => {
      try {
        setLoading(true);
        const { data: res } = await api.get('/student/apply_instructor.php');
        if (res.success && res.data) {
          setAppStatus(res.data.status);
          setAppDetails(res.data);
        } else {
          setAppStatus(null);
        }
      } catch (err) {
        console.error("Error loading application status:", err);
      } finally {
        setLoading(false);
      }
    };

    // If user is already instructor, direct verification
    if (user?.role === 'instructor' || user?.role === 'admin') {
      setAppStatus('approved');
      setLoading(false);
    } else {
      checkApplication();
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!expertise.trim()) {
      setError("Please specify your area of expertise.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const { data: res } = await api.post('/student/apply_instructor.php', {
        expertise,
        experience,
        resume_url: resumeUrl
      });

      if (res.success) {
        setAppStatus('pending');
        setAppDetails(res.data);
      } else {
        setError(res.message ?? "Failed to submit application.");
      }
    } catch (err) {
      setError(err.response?.data?.message ?? "An error occurred while submitting your application.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 text-slate-650">
        <Spinner size="lg" className="mb-4 text-blue-600" />
        <p className="text-sm text-slate-500">Loading your profile status...</p>
      </div>
    );
  }

  // ─── STATE 1: NOT AUTHENTICATED ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200/80 text-center relative overflow-hidden shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-sm">
            <Award className="w-8 h-8 text-blue-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-3">Join as an Instructor</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Please register an account or log into your existing profile to submit your educator application.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate(ROUTES.LOGIN + "?redirect=/become-instructor")}
              className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={() => navigate(ROUTES.REGISTER + "?redirect=/become-instructor")}
              className="w-full h-12 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-205 transition-all cursor-pointer"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STATE 2: ALREADY AN APPROVED INSTRUCTOR / ADMIN ───────────────────────
  if (appStatus === 'approved' || user?.role === 'instructor' || user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-205 text-center shadow-xl relative">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
            <CheckCircle className="w-8 h-8 text-emerald-600 animate-bounce" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verified Educator Status</h2>
          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-4 bg-emerald-50 px-3 py-1.5 rounded-full inline-block border border-emerald-100">Role: {user?.role}</p>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Your account is already active and verified. You have direct access to your professional workspaces and can upload courses immediately.
          </p>

          <Button
            onClick={() => navigate(user?.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.INSTRUCTOR_DASHBOARD)}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
          >
            Go to My Workspace Dashboard
            <ChevronRight className="w-4 h-4 ml-1 inline" />
          </Button>
        </div>
      </div>
    );
  }

  // ─── STATE 3: PENDING APPLICATION UNDER REVIEW ─────────────────────────────
  if (appStatus === 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 py-20 px-4 sm:px-6 flex items-center justify-center">
        <div className="max-w-lg w-full p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-6 border border-amber-100 shadow-sm">
            <Clock className="w-7 h-7 text-amber-600 animate-pulse" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Application Under Review</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Thank you for applying! Our admin team is currently reviewing your application credentials. You will receive an alert notification as soon as we make a decision.
          </p>

          {/* Submitted Info */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100/80 space-y-3 mb-8">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-200 pb-2">Submitted Profile</h3>
            
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 mb-0.5 font-medium">Taught Domain</p>
                <p className="font-semibold text-slate-850">{appDetails?.expertise}</p>
              </div>
              <div>
                <p className="text-slate-400 mb-0.5 font-medium">Total Experience</p>
                <p className="font-semibold text-slate-850">{appDetails?.experience}</p>
              </div>
              <div className="col-span-2">
                <p className="text-slate-400 mb-0.5 font-medium">Resume/Portfolio Link</p>
                {appDetails?.resume_url ? (
                  <a href={appDetails.resume_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all font-semibold">
                    {appDetails.resume_url}
                  </a>
                ) : (
                  <span className="text-slate-400 italic">Not provided</span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-all border border-slate-205 cursor-pointer shadow-sm"
          >
            Back to Learner Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ─── STATE 4 & 5: NEW APPLICATION OR REJECTED (RE-APPLY) ────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-16 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        
        {/* Rejected alert if they were previously rejected */}
        {appStatus === 'rejected' && (
          <div className="mb-6 p-5 rounded-2xl bg-rose-50 border border-rose-205 text-rose-800 text-sm flex items-start gap-4 shadow-md">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 mb-1">Previous Application Update</p>
              <p className="text-rose-700 leading-relaxed mb-2">
                Your previous application was not approved. Review our requirements regarding clear audio/video structures and try re-submitting with detailed credentials.
              </p>
            </div>
          </div>
        )}

        <div className="p-8 rounded-3xl bg-white border border-slate-205 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-150">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Become a Verified Instructor</h2>
              <p className="text-xs text-slate-500 font-medium">Apply to join and unlock educator privileges.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Expertise Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">What is your core area of expertise?</label>
              <p className="text-xs text-slate-400 font-medium">e.g. Frontend Web Development, AWS Cloud Computing, Python Data Science, Cyber Security</p>
              <input
                type="text"
                required
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                placeholder="Specify taught domain (e.g. React & Laravel Development)"
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {/* Experience Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">How long have you been teaching or working in this field?</label>
              <div className="grid grid-cols-3 gap-3">
                {["1-3 years", "3-5 years", "5+ years"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setExperience(opt)}
                    className={[
                      "h-12 text-sm rounded-xl font-semibold transition-all border shrink-0 cursor-pointer shadow-sm",
                      experience === opt
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-100/50"
                    ].join(" ")}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume/Portfolio URL Field */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">Resume or Professional Profile Link (Optional)</label>
              <p className="text-xs text-slate-400 font-medium">A link to your LinkedIn, GitHub portfolio, or a hosted PDF resume.</p>
              <input
                type="url"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="w-full h-12 px-4 rounded-xl bg-white border border-gray-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              />
            </div>

            {error && (
              <p className="text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-100 p-3.5 rounded-xl">{error}</p>
            )}

            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="h-12 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border border-slate-205 transition-all shrink-0 cursor-pointer shadow-sm"
              >
                Back
              </button>
              
              <Button
                type="submit"
                disabled={submitting}
                className="h-12 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all duration-300 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" /> Submitting Request...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Submit Application <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeInstructorPage;
