import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import api from '@/services/api';

const API_BASE_URL = 'http://localhost/LMS-React/backend/api/student';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const STUDENT_ID = user?.id;
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (STUDENT_ID) fetchMyCourses();
  }, [STUDENT_ID]);

  const fetchMyCourses = async () => {
    try {
      const res = await api.get(`${API_BASE_URL}/get_my_enrollments.php`);
      if (res.data.status) {
        setEnrollments(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600 border-opacity-75"></div>
      </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">My Learning</h1>
            <p className="text-xl text-gray-500 font-medium">Pick up exactly where you left off and track your progress.</p>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white p-16 text-center rounded-3xl shadow-sm border border-dashed border-gray-300">
            <div className="w-24 h-24 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                🎓
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">You haven't enrolled in any courses yet!</h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">Head over to the marketplace to discover world-class courses and start your journey.</p>
            <button
              onClick={() => navigate('/marketplace')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
                Browse Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {enrollments.map(enr => (

              <div key={enr.id} onClick={() => navigate(`/player/${enr.course_id}`)} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                
                {/* Image Section */}
                <div className="h-48 relative overflow-hidden bg-gray-200">
                   {enr.thumbnail_url ? (
                     <img src={enr.thumbnail_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Course" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold tracking-widest uppercase">No Image</div>
                   )}
                   
                   {/* Status Badge */}
                   <div className="absolute top-4 right-4">
                       {enr.progress === 100 ? (
                         <span className="bg-green-500 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md tracking-wider">COMPLETED</span>
                       ) : (
                         <span className="bg-indigo-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wider">IN PROGRESS</span>
                       )}
                   </div>
                   
                   {/* Overlay Play Button */}
                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/95 text-indigo-600 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-all duration-300">
                            <span className="text-2xl ml-1">▶</span>
                        </div>
                   </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {enr.title}
                  </h3>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-3">
                      <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overall Progress</p>
                          <span className="text-2xl font-black text-gray-900">{enr.progress}%</span>
                      </div>
                    </div>
                    {/* Premium Progress Bar */}
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-3 transition-all duration-1000 ease-out rounded-full ${enr.progress === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`} 
                        style={{ width: `${enr.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
