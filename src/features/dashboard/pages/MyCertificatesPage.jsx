import { useState, useEffect } from "react";
import { Award, Download, ExternalLink, Loader2 } from "lucide-react";
import { Badge, Spinner, Button } from "@/components/ui";
import { EmptyState } from "@/components/common";
import { formatDate } from "@/utils";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { useAuthStore } from "@/store";

// Inline SVG brand icon
const LinkedinIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const CATEGORY_COLORS = {
  "Development": "bg-blue-50 text-blue-700",
  "Cloud": "bg-sky-50 text-sky-700",
  "AI & ML": "bg-violet-50 text-violet-700",
  "DevOps": "bg-indigo-50 text-indigo-700",
  "Security": "bg-rose-50 text-rose-700",
};

const CertCard = ({ cert, onView }) => (
  <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
    {/* Certificate visual */}
    <div
      onClick={onView}
      className="bg-slate-900 p-6 relative overflow-hidden cursor-pointer h-40 flex flex-col justify-center"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />

      {/* Decorative Gold Border inner */}
      <div className="absolute inset-2 border border-amber-500/30 rounded-lg pointer-events-none" />

      <div className="relative z-10 text-center">
        <Award className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-90" />
        <p className="text-[9px] text-amber-200/80 uppercase tracking-[0.2em] mb-1 font-semibold">Certificate of Completion</p>
        <p className="text-white font-serif font-bold text-sm leading-snug line-clamp-2 px-4">{cert.title}</p>
      </div>
    </div>

    {/* Info */}
    <div className="p-5 flex flex-col flex-1">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${CATEGORY_COLORS[cert.category] ?? "bg-gray-100 text-gray-600"}`}>
          {cert.category ?? "General"}
        </span>
        <Badge variant="success" size="sm" dot>Verified</Badge>
      </div>

      <div className="space-y-1.5 mb-4 flex-1">
        <p className="text-sm font-bold text-gray-900 line-clamp-2">{cert.title}</p>
        {cert.instructor && <p className="text-xs text-gray-500">By: <span className="font-medium text-gray-700">{cert.instructor}</span></p>}
        {cert.enrolledAt && <p className="text-xs text-gray-500">Issued: <span className="font-medium text-gray-700">{formatDate(cert.enrolledAt)}</span></p>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all duration-200 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" /> View
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const certName = cert.title;
            const orgName = "Defura-LMS Academy";
            const certId = cert._id ?? cert.id ?? "";
            
            const dateObj = cert.enrolledAt ? new Date(cert.enrolledAt) : new Date();
            const issueYear = dateObj.getFullYear();
            const issueMonth = dateObj.getMonth() + 1; // 1-indexed for LinkedIn
            
            const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME` +
              `&name=${encodeURIComponent(certName)}` +
              `&organizationName=${encodeURIComponent(orgName)}` +
              `&certId=${encodeURIComponent(certId)}` +
              `&issueYear=${issueYear}` +
              `&issueMonth=${issueMonth}` +
              `&certUrl=${encodeURIComponent(window.location.origin)}`;
            
            window.open(linkedinUrl, "_blank");
          }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-all duration-200"
        >
          <LinkedinIcon className="w-3.5 h-3.5" /> Share
        </button>
      </div>
    </div>
  </div>
);

const MyCertificatesPage = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);
  const [scale, setScale] = useState(1);

  const { user } = useAuthStore();
  const studentName = user?.full_name ?? "Student Name";

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      // We base the scale factor on the screen width minus standard modal padding.
      // The design width of the preview is 900px.
      const containerWidth = Math.min(width - 64, 900);
      if (containerWidth < 900) {
        setScale(containerWidth / 900);
      } else {
        setScale(1);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedCert]);

  useEffect(() => {
    if (selectedCert) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedCert]);

  useEffect(() => {
    const fetchCerts = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(ENDPOINTS.STUDENT.DASHBOARD);
        const payload = res.data ?? res;
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

  const handlePrint = (cert, name) => {
    const printWindow = window.open("", "_blank");
    const dateStr = cert.enrolledAt ? formatDate(cert.enrolledAt) : formatDate(new Date());

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${cert.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
            
            @page {
              size: A4 landscape;
              margin: 0;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              font-family: 'Montserrat', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            
            .certificate-wrapper {
              width: 297mm; /* A4 width */
              height: 210mm; /* A4 height */
              background-color: #ffffff;
              padding: 15mm;
              box-sizing: border-box;
              position: relative;
              overflow: hidden;
            }

            /* Subtle background texture/pattern */
            .certificate-wrapper::before {
              content: "";
              position: absolute;
              inset: 0;
              background-image: repeating-linear-gradient(45deg, #f1f5f9 0, #f1f5f9 1px, transparent 1px, transparent 10px);
              opacity: 0.3;
              z-index: 1;
              pointer-events: none;
            }
            
            /* The Nested Professional Borders */
            .border-outer {
              position: absolute;
              inset: 12mm;
              border: 1px solid #94a3b8;
              z-index: 2;
            }
            
            .border-middle {
              position: absolute;
              inset: 14mm;
              border: 10px solid #0f172a; /* Deep Navy */
              z-index: 2;
            }

            .border-inner {
              position: absolute;
              inset: 18mm;
              border: 2px solid #d97706; /* Rich Gold */
              outline: 1px solid #d97706;
              outline-offset: 2px;
              z-index: 2;
            }

            /* Corner accents for the inner gold border */
            .corner {
              position: absolute;
              width: 15px;
              height: 15px;
              background: #d97706;
              z-index: 3;
            }
            .corner-tl { top: 18mm; left: 18mm; }
            .corner-tr { top: 18mm; right: 18mm; }
            .corner-bl { bottom: 18mm; left: 18mm; }
            .corner-br { bottom: 18mm; right: 18mm; }
            
            .certificate-content {
              position: relative;
              z-index: 10;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
              padding: 10mm 20mm;
              box-sizing: border-box;
            }
            
            .header {
              margin-top: 10px;
              margin-bottom: 25px;
            }
            
            .academy-name {
              font-family: 'Cinzel', serif;
              font-size: 14px;
              color: #b45309;
              letter-spacing: 6px;
              font-weight: 700;
              text-transform: uppercase;
              margin-bottom: 15px;
            }

            .main-title {
              font-family: 'Cinzel', serif;
              font-size: 52px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            
            .presentation-text {
              font-family: 'Playfair Display', serif;
              font-size: 18px;
              color: #475569;
              font-style: italic;
              margin-top: 30px;
              margin-bottom: 15px;
            }
            
            .student-name {
              font-family: 'Playfair Display', Georgia, serif;
              font-size: 52px;
              font-weight: 700;
              font-style: italic;
              color: #0f172a;
              margin: 15px 0 5px 0;
              line-height: 1.2;
            }
            
            .name-underline {
              width: 60%;
              height: 1px;
              background-color: #cbd5e1;
              margin: 0 auto 20px auto;
            }

            .reason-text {
              font-family: 'Montserrat', sans-serif;
              font-size: 14px;
              color: #475569;
              max-width: 700px;
              line-height: 1.8;
            }
            
            .course-title {
              font-family: 'Playfair Display', serif;
              font-size: 32px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 15px;
            }
            
            .footer {
              width: 100%;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              margin-top: auto;
              padding: 0 40px;
              box-sizing: border-box;
            }
            
            .signature-block {
              display: flex;
              flex-direction: column;
              align-items: center;
              width: 200px;
            }
            
            .signature-text {
              font-family: 'Great Vibes', cursive;
              font-size: 36px;
              color: #1e3a8a;
              margin-bottom: -10px;
            }
            
            .signature-line {
              width: 100%;
              border-top: 1px solid #0f172a;
              margin-top: 10px;
              margin-bottom: 8px;
            }
            
            .signature-title {
              font-family: 'Montserrat', sans-serif;
              font-size: 10px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 1.5px;
            }
            
            .seal-container {
              position: relative;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0 20px;
            }
            
            .seal {
              width: 120px;
              height: 120px;
              background: linear-gradient(135deg, #fbbf24 0%, #b45309 50%, #d97706 100%);
              border-radius: 50%;
              box-shadow: 0 4px 15px rgba(0,0,0,0.15), inset 0 0 10px rgba(255,255,255,0.5);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px dashed #fef3c7;
              outline: 6px solid #b45309;
              outline-offset: -10px;
              color: #fff;
              font-family: 'Cinzel', serif;
              text-align: center;
              position: relative;
            }
            
            .seal-text-top {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 1px;
              margin-bottom: 4px;
            }
            
            .seal-icon {
              font-size: 24px;
              line-height: 1;
              margin-bottom: 4px;
            }

            .seal-text-bottom {
              font-size: 9px;
              font-weight: 600;
              letter-spacing: 2px;
            }

            .cert-id {
              position: absolute;
              bottom: 15mm;
              left: 50%;
              transform: translateX(-50%);
              font-family: 'Montserrat', sans-serif;
              font-size: 9px;
              color: #94a3b8;
              letter-spacing: 1px;
              z-index: 10;
            }
          </style>
        </head>
        <body>
          <div class="certificate-wrapper">
            <div class="border-outer"></div>
            <div class="border-middle"></div>
            <div class="border-inner"></div>
            
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>
            
            <div class="certificate-content">
              <div class="header">
                <div class="academy-name">EduManage Online Academy</div>
                <h1 class="main-title">Certificate of Completion</h1>
              </div>
              
              <div class="presentation-text">This certificate is proudly presented to</div>
              
              <h2 class="student-name">${name}</h2>
              <div class="name-underline"></div>
              
              <div class="reason-text">
                For successfully fulfilling the requirements and passing the assessments of the designated program, demonstrating mastery in
              </div>
              
              <div class="course-title">${cert.title}</div>
              
              <div class="footer">
                <div class="signature-block">
                  <div class="signature-text">${cert.instructor ?? "Instructor Name"}</div>
                  <div class="signature-line"></div>
                  <div class="signature-title">Course Instructor</div>
                </div>
                
                <div class="seal-container">
                  <div class="seal">
                    <div class="seal-text-top">OFFICIAL</div>
                    <div class="seal-icon">★</div>
                    <div class="seal-text-bottom">CERTIFIED</div>
                  </div>
                </div>
                
                <div class="signature-block">
                  <div class="signature-text">${dateStr}</div>
                  <div class="signature-line"></div>
                  <div class="signature-title">Date of Issue</div>
                </div>
              </div>
            </div>

            <div class="cert-id">CERTIFICATE ID: CERT-${cert._id ?? cert.id}</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { 
                window.print(); 
                setTimeout(function() { window.close(); }, 500);
              }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Certificates</h1>
          <p className="text-sm text-gray-500 mt-1">{certs.length} official certificate{certs.length !== 1 ? "s" : ""} earned</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : certs.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <EmptyState
              icon={<Award className="w-8 h-8" />}
              title="No certificates yet"
              description="Complete a course to earn your first verified certificate."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {certs.map((cert, i) => (
              <CertCard
                key={cert._id ?? cert.id ?? i}
                cert={cert}
                onView={() => setSelectedCert(cert)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modern Professional Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="bg-gray-100 rounded-xl shadow-2xl max-w-5xl w-full flex flex-col animate-in fade-in zoom-in-95 duration-200 border border-white/10 my-auto">

            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white rounded-t-xl shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Certificate Preview</h3>
                <p className="text-xs text-gray-500 font-medium">Ready for high-quality printing</p>
              </div>
              <button
                onClick={() => setSelectedCert(null)}
                className="text-gray-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Certificate Visual Wrapper */}
            <div
              className="p-6 sm:p-8 overflow-hidden flex justify-center items-center flex-1 bg-gray-50 border-y border-gray-200"
              style={{ minHeight: `${636 * scale + 32}px` }}
            >

              {/* CSS approximation of the Print Version for Preview */}
              <div
                id="certificate-preview-area"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center center",
                  width: "900px",
                  height: "636px",
                  fontFamily: "'Montserrat', sans-serif"
                }}
                className="bg-white relative shadow-lg shrink-0 overflow-hidden box-border flex flex-col items-center select-none transition-transform duration-200"
              >
                <style>
                  {`
                    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
                  `}
                </style>

                {/* Background Texture */}
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>

                {/* Nested Borders */}
                <div className="absolute inset-4 sm:inset-6 border border-slate-300 pointer-events-none"></div>
                <div className="absolute inset-5 sm:inset-8 border-[6px] sm:border-[10px] border-slate-900 pointer-events-none"></div>
                <div className="absolute inset-8 sm:inset-[44px] border border-amber-600 outline outline-1 outline-amber-600 outline-offset-2 pointer-events-none"></div>

                {/* Inner Corner Accents */}
                <div className="absolute top-8 sm:top-[44px] left-8 sm:left-[44px] w-2 h-2 sm:w-3 sm:h-3 bg-amber-600"></div>
                <div className="absolute top-8 sm:top-[44px] right-8 sm:right-[44px] w-2 h-2 sm:w-3 sm:h-3 bg-amber-600"></div>
                <div className="absolute bottom-8 sm:bottom-[44px] left-8 sm:left-[44px] w-2 h-2 sm:w-3 sm:h-3 bg-amber-600"></div>
                <div className="absolute bottom-8 sm:bottom-[44px] right-8 sm:right-[44px] w-2 h-2 sm:w-3 sm:h-3 bg-amber-600"></div>

                {/* Certificate Content Wrapper */}
                <div className="relative z-10 w-full h-full flex flex-col items-center justify-between py-12 sm:py-16 px-16 sm:px-24">

                  {/* Header */}
                  <div className="text-center w-full mt-2">
                    <p className="text-amber-700 tracking-[0.3em] sm:tracking-[0.4em] text-[8px] sm:text-[10px] font-bold uppercase mb-3 sm:mb-5" style={{ fontFamily: "'Cinzel', serif" }}>
                      Defura-LMS Academy
                    </p>
                    <h2 className="text-2xl sm:text-4xl text-slate-900 font-extrabold uppercase tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
                      Certificate of Completion
                    </h2>
                  </div>

                  {/* Body */}
                  <div className="text-center w-full my-4">
                    <p className="italic text-slate-500 text-xs sm:text-sm mb-4 sm:mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
                      This certificate is proudly presented to
                    </p>

                    <div className="inline-block relative">
                      <h3 className="text-4xl sm:text-5xl text-slate-900 font-bold italic mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {studentName}
                      </h3>
                      <div className="w-[120%] h-px bg-slate-300 absolute -bottom-2 -left-[10%]"></div>
                    </div>

                    <p className="text-[10px] sm:text-xs text-slate-600 mt-8 sm:mt-10 max-w-[80%] mx-auto leading-relaxed font-medium">
                      For successfully fulfilling the requirements and passing the assessments of the designated program, demonstrating mastery in
                    </p>

                    <h4 className="text-xl sm:text-2xl text-slate-900 font-bold mt-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                      {selectedCert.title}
                    </h4>
                  </div>

                  {/* Footer (Signatures & Seal) */}
                  <div className="w-full flex justify-between items-end px-4 sm:px-8 mb-4">

                    {/* Left Signature */}
                    <div className="flex flex-col items-center w-32 sm:w-40">
                      <p className="text-xl sm:text-2xl text-slate-800 -mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>
                        {selectedCert.instructor ?? "Instructor"}
                      </p>
                      <div className="w-full h-px bg-slate-800 my-2"></div>
                      <p className="text-[7px] sm:text-[8px] uppercase tracking-widest text-slate-500 font-bold">Course Instructor</p>
                    </div>

                    {/* Center Seal */}
                    <div className="relative flex items-center justify-center">
                      <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-md bg-gradient-to-br from-amber-400 via-amber-600 to-amber-700 outline outline-4 outline-amber-700 outline-offset-[-6px] border border-white border-dashed">
                        <span className="text-[7px] sm:text-[9px] text-white font-bold tracking-widest mt-1" style={{ fontFamily: "'Cinzel', serif" }}>OFFICIAL</span>
                        <span className="text-white text-lg sm:text-xl my-0.5">★</span>
                        <span className="text-[6px] sm:text-[8px] text-white font-bold tracking-widest mb-1" style={{ fontFamily: "'Cinzel', serif" }}>CERTIFIED</span>
                      </div>
                    </div>

                    {/* Right Signature (Date) */}
                    <div className="flex flex-col items-center w-32 sm:w-40">
                      <p className="text-xl sm:text-2xl text-slate-800 -mb-2" style={{ fontFamily: "'Great Vibes', cursive" }}>
                        {formatDate(selectedCert.enrolledAt || new Date())}
                      </p>
                      <div className="w-full h-px bg-slate-800 my-2"></div>
                      <p className="text-[7px] sm:text-[8px] uppercase tracking-widest text-slate-500 font-bold">Date of Issue</p>
                    </div>

                  </div>
                </div>

                {/* Certificate ID */}
                <div className="absolute bottom-4 sm:bottom-6 text-[6px] sm:text-[8px] text-slate-400 tracking-wider">
                  CERTIFICATE ID: CERT-{selectedCert._id ?? selectedCert.id}
                </div>

              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-xl shrink-0">
              <Button variant="outline" onClick={() => setSelectedCert(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => handlePrint(selectedCert, studentName)}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download / Print PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCertificatesPage;