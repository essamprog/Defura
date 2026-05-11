import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost/LMS-React/backend/api/student';

export default function Marketplace() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Mock categories (Fetch from DB in production)
  const categories = [
    { id: 1, name: 'Development' },
    { id: 2, name: 'Business' },
    { id: 3, name: 'Design' }
  ];

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/get_marketplace.php`, {
        params: { q: search, category }
      });
      if (res.data.status) {
        setCourses(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 500); // Debounce search to prevent spamming the backend
    return () => clearTimeout(delayDebounceFn);
  }, [search, category]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-indigo-900 py-20 text-center px-4 shadow-inner">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Expand Your Potential</h1>
        <p className="text-lg md:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">Discover world-class courses designed to accelerate your career and fuel your passion.</p>
        
        {/* Search Bar & Filters */}
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-4">
          <input 
            type="text"
            placeholder="Search for anything..."
            className="flex-1 px-6 py-4 rounded-xl text-lg outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-xl transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select 
            className="px-6 py-4 rounded-xl text-lg outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-xl bg-white text-gray-700 font-medium transition-all"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Skeleton Loader
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="bg-gray-200 h-48 w-full"></div>
                <div className="p-5">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))
          ) : courses.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
              <h3 className="text-2xl font-bold text-gray-700">No courses found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
            </div>
          ) : (
            courses.map(course => (
              <div
                key={course.id}
                onClick={() => navigate(`/preview/${course.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group"
              >
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">No Image</div>
                  )}
                  {course.is_bestseller == 1 && (
                    <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                      Bestseller
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                    {course.total_lessons} Lessons
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{course.level}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={course.title}>
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 truncate">{course.instructor_name}</p>
                  
                  <div className="flex items-center text-sm text-amber-500 mb-4 font-medium">
                    <span className="mr-1">★</span> {course.average_rating} 
                    <span className="text-gray-400 ml-1">({course.total_students} students)</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xl font-extrabold text-gray-900">${course.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
