import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, Award } from "lucide-react";
import api from "@/services/api";
import { ROUTES } from "@/constants";
import { Spinner } from "@/components/ui";

// Reusable InstructorCard Component as requested by the user
const InstructorCard = ({ instructor, onClick }) => {
    const getInitials = (name) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const getAvatarGradient = (name) => {
        const colors = [
            "from-blue-500 to-indigo-600 text-white",
            "from-purple-500 to-pink-600 text-white",
            "from-emerald-500 to-teal-600 text-white",
            "from-rose-500 to-orange-600 text-white",
            "from-amber-500 to-yellow-600 text-white",
        ];
        let sum = 0;
        for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
        return colors[sum % colors.length];
    };

    const initialsGradient = getAvatarGradient(instructor.name);

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-[0_10px_40px_-10px_rgba(124,58,237,0.15)] hover:-translate-y-1 hover:shadow-[0_20px_50px_-10px_rgba(124,58,237,0.25)] transition-all duration-300 cursor-pointer"
        >
            {/* Avatar Container */}
            <div className="relative mb-5">
                {instructor.avatar ? (
                    <img
                        src={instructor.avatar}
                        alt={instructor.name}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                        className="w-35 h-35 rounded-full object-cover border-[3px] border-white shadow-xl bg-white"
                    />
                ) : null}
                <div
                    style={{ display: instructor.avatar ? 'none' : 'flex' }}
                    className={`w-35 h-35 rounded-full bg-gradient-to-br ${initialsGradient} flex items-center justify-center text-4xl font-extrabold tracking-wider border-[3px] border-white shadow-xl`}
                >
                    {getInitials(instructor.name)}
                </div>

                {/* Rating Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-full shadow-md text-xs font-bold flex items-center gap-1 border border-slate-100 whitespace-nowrap">
                    <span className="text-amber-400 text-sm leading-none">★</span> {Number(instructor.average_rating).toFixed(1)}
                </div>
            </div>

            {/* Experience tag */}
            <span className="bg-brand-50 text-brand-600 text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full mb-4">
                {instructor.experience}
            </span>

            {/* Details */}
            <h3 className="text-xl font-bold text-slate-900 mb-1">{instructor.name}</h3>
            <p className="text-sm text-slate-500 mb-8">{instructor.expertise}</p>

            {/* Stats row */}
            <div className="flex w-full justify-center gap-16 mb-8 border-t border-slate-100 pt-6">
                <div>
                    <div className="text-brand-600 font-bold text-lg leading-tight">{instructor.courses_count}</div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Courses</div>
                </div>
                <div>
                    <div className="text-brand-600 font-bold text-lg leading-tight">
                        {instructor.total_students >= 1000
                            ? `${(instructor.total_students / 1000).toFixed(1)}k`
                            : instructor.total_students}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Students</div>
                </div>
            </div>

            {/* Button CTA */}
            <button
                className="w-full py-3.5 rounded-full border-2 border-blue-600 text-blue-600 font-bold text-sm hover:bg-blue-600 hover:text-white transition-colors duration-200"
            >
                View Profile
            </button>
        </div>
    );
};

const InstructorsPage = () => {
    const navigate = useNavigate();
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("students"); // 'students', 'rating', 'courses'

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                setLoading(true);
                const response = await api.get("/courses/instructors.php");
                if (response.data?.success) {
                    setInstructors(response.data.data || []);
                } else {
                    throw new Error(response.data?.message || "Failed to load instructors.");
                }
            } catch (err) {
                console.error("Error fetching instructors:", err);
                setError(err.message || "An error occurred while loading instructors.");
            } finally {
                setLoading(false);
            }
        };

        fetchInstructors();
    }, []);

    // Filter and Sort Instructors
    const filteredInstructors = instructors
        .filter((inst) => {
            const query = searchQuery.toLowerCase();
            return (
                inst.name.toLowerCase().includes(query) ||
                inst.expertise.toLowerCase().includes(query) ||
                inst.bio.toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            if (sortBy === "students") return b.total_students - a.total_students;
            if (sortBy === "rating") return b.average_rating - a.average_rating;
            if (sortBy === "courses") return b.courses_count - a.courses_count;
            return 0;
        });

    // Dynamic Profile Redirection
    const handleRedirect = (inst) => {
        navigate(ROUTES.publicInstructorProfile(inst.id));
    };

    return (
        <div className="min-h-screen bg-slate-50/30 pb-24 font-sans">

            {/* ── Minimal Premium Header ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
                <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                    World-Class Educators
                </h1>
                <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 font-medium leading-relaxed">
                    Learn from industry experts, visionary thinkers, and scholarly masters dedicated to your intellectual growth.
                </p>
            </div>

            {/* ── Clean Filters & Search Bar ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Search Box */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search educators by name, expertise, or keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-11 pl-12 pr-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Sorting selector */}
                    <div className="flex items-center gap-3 justify-between md:justify-end shrink-0">
                        <span className="text-xs sm:text-sm font-semibold text-slate-400">Sort by:</span>
                        <div className="inline-flex rounded-xl border border-slate-100 p-1 bg-slate-50">
                            <button
                                onClick={() => setSortBy("students")}
                                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${sortBy === "students"
                                    ? "bg-white text-brand-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                Students
                            </button>
                            <button
                                onClick={() => setSortBy("rating")}
                                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${sortBy === "rating"
                                    ? "bg-white text-brand-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                Top Rated
                            </button>
                            <button
                                onClick={() => setSortBy("courses")}
                                className={`px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${sortBy === "courses"
                                    ? "bg-white text-brand-600 shadow-sm"
                                    : "text-slate-500 hover:text-slate-800"
                                    }`}
                            >
                                Courses
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Cards Grid ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Spinner className="w-12 h-12 text-brand-600 animate-spin mb-4" />
                        <p className="text-slate-400 font-semibold text-sm">Fetching educators database...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 text-red-600 rounded-3xl p-8 text-center max-w-xl mx-auto shadow-sm">
                        <h3 className="font-bold text-lg mb-2">Something went wrong</h3>
                        <p className="text-sm font-medium mb-5">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md"
                        >
                            Retry Loading
                        </button>
                    </div>
                ) : filteredInstructors.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.01)] max-w-2xl mx-auto px-6">
                        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mb-2">No educators found</h3>
                        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                            We couldn't find any educators matching your search query. Try typing something else!
                        </p>
                        <button
                            onClick={() => setSearchQuery("")}
                            className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md"
                        >
                            Show All Educators
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredInstructors.map((inst) => (
                            <InstructorCard
                                key={inst.id}
                                instructor={inst}
                                onClick={() => handleRedirect(inst)}
                            />
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default InstructorsPage;
