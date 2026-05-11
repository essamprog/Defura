import { useState, useEffect } from "react";
import { Award, Download, ExternalLink, Loader2 } from "lucide-react";

// Inline SVG brand icon (removed from lucide-react v1.x)
const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);
import { Badge, Spinner } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { formatDate } from "@/utils";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const CATEGORY_COLORS = {
  "Development": "bg-blue-50 text-blue-700",
  "Cloud":       "bg-sky-50 text-sky-700",
  "AI & ML":     "bg-violet-50 text-violet-700",
  "DevOps":      "bg-indigo-50 text-indigo-700",
  "Security":    "bg-rose-50 text-rose-700",
};

const CertCard = ({ cert }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
    {/* Certificate visual */}
    <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/5 rounded-full" />
      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
          <Award className="w-5 h-5 text-white" />
        </div>
        <p className="text-[10px] text-blue-200 uppercase tracking-widest mb-1 font-semibold">Certificate of Completion</p>
        <p className="text-white font-bold text-sm leading-snug line-clamp-2">{cert.course ?? cert.title}</p>
      </div>
    </div>

    {/* Info */}
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cert.category] ?? "bg-gray-100 text-gray-600"}`}>
          {cert.category ?? "General"}
        </span>
        <Badge variant="success" size="sm" dot>Verified</Badge>
      </div>

      <div className="space-y-1">
        {cert.instructor && <p className="text-xs text-gray-500">Instructor: <span className="font-medium text-gray-700">{cert.instructor}</span></p>}
        {cert.issuedAt && <p className="text-xs text-gray-500">Issued: <span className="font-medium text-gray-700">{formatDate(cert.issuedAt)}</span></p>}
        {cert.credentialId && <p className="text-[10px] text-gray-400 font-mono">{cert.credentialId}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        <button className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-600 hover:text-white transition-all duration-150">
          <Download className="w-3.5 h-3.5" /> Download
        </button>
        <button className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-lg bg-gray-50 text-gray-600 text-xs font-medium hover:bg-gray-100 transition-all duration-150">
          <LinkedinIcon className="w-3.5 h-3.5" /> Share
        </button>
        <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-all">
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

const MyCertificatesPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(ENDPOINTS.STUDENT.DASHBOARD);
        const payload = res.data ?? res;
        // Certificates come from the dashboard or a future dedicated endpoint
        // The dashboard stats contain `certificates` count; the actual list comes from
        // enrollments with status = 'completed'
        const enrolled = payload.enrolledCourses ?? [];
        const completed = enrolled.filter(c => c.enrollmentStatus === "completed");
        setCerts(completed);
      } catch (err) {
        console.error("Failed to load certificates:", err);
        setCerts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  if (loading) return (
    <div className="flex justify-center py-20">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Certificates</h1>
          <p className="text-sm text-gray-500">{certs.length} certificate{certs.length !== 1 ? "s" : ""} earned</p>
        </div>
      </div>

      {certs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100">
          <EmptyState
            icon={<Award className="w-8 h-8" />}
            title="No certificates yet"
            description="Complete a course to earn your first verified certificate."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {certs.map((cert, i) => <CertCard key={cert._id ?? i} cert={cert} />)}
        </div>
      )}
    </div>
  );
};

export default MyCertificatesPage;