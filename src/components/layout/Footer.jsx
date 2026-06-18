import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { ROUTES } from "../../constants";

// ─── Social SVG Icons (Lucide v1.x removed brand icons) ─────────────────────
const FacebookIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </svg>
);

// ─── Data ────────────────────────────────────────────────────────────────────
const footerLinks = [
  {
    title: "Platform",
    links: [
      { label: "Home", to: ROUTES.HOME },
      { label: "All Courses", to: ROUTES.COURSES },
      { label: "Become an Instructor", to: ROUTES.REGISTER },
      { label: "About", to: "/about" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", to: "/help" },
      { label: "Refund Policy", to: "/refund-policy" },
      { label: "Terms of Use", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
  {
    title: "Contact",
    links: [
      {
        label: "support@Defura.com",
        to: "mailto:support@Defura.com",
        icon: <Mail className="w-3.5 h-3.5 shrink-0" />,
      },
      {
        label: "+20 100 000 0000",
        to: "tel:+201000000000",
        icon: <Phone className="w-3.5 h-3.5 shrink-0" />,
      },
      {
        label: "Cairo, Egypt",
        to: "#",
        icon: <MapPin className="w-3.5 h-3.5 shrink-0" />,
      },
    ],
  },
];

const socialLinks = [
  { icon: <FacebookIcon className="w-4 h-4" />, href: "#", label: "Facebook" },
  { icon: <XIcon className="w-4 h-4" />, href: "#", label: "X (Twitter)" },
  { icon: <InstagramIcon className="w-4 h-4" />, href: "#", label: "Instagram" },
  { icon: <YoutubeIcon className="w-4 h-4" />, href: "#", label: "Youtube" },
];



// ─── Component ────────────────────────────────────────────────────────────────
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400" dir="ltr">


      {/* ── Main Footer ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to={ROUTES.HOME} className="inline-flex items-center gap-2 mb-4">
              <img
                src="/assets/images/Defura_logo.png"
                alt="DefuraLMS Logo"
                className="h-14 w-auto object-contain"
              />
              <span className="text-2xl font-bold text-white">
                Defura<span className="text-blue-400">LMS</span>
              </span>
            </Link>

            <p className="text-sm leading-relaxed text-gray-400 mb-6 max-w-xs">
              A complete learning platform with top courses and instructors to help
              you grow your skills and reach your career goals.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-all duration-200"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="text-white font-semibold text-sm mb-4 pb-2 border-b border-gray-800">
                {section.title}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors duration-150 group"
                    >
                      {link.icon && (
                        <span className="text-blue-500 group-hover:text-blue-400 transition-colors">
                          {link.icon}
                        </span>
                      )}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


      </div>

      {/* ── Bottom Bar ────────────────────────────────────────── */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>
            © {currentYear}{" "}
            <span className="text-gray-400 font-medium">Defura</span>. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-gray-300 transition-colors">
              Terms & Conditions
            </Link>
            <span className="w-px h-3 bg-gray-700" />
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy
            </Link>
            <span className="w-px h-3 bg-gray-700" />
            <Link to="/sitemap" className="hover:text-gray-300 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;