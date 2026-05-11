import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import api from '@/services/api';

const API_BASE_URL = 'http://localhost/LMS-React/backend/api/student';

export default function CoursePlayer() {
  const { id: COURSE_ID } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const STUDENT_ID = user?.id;
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (COURSE_ID && STUDENT_ID) fetchCourseData();
  }, [COURSE_ID, STUDENT_ID]);

  const fetchCourseData = async () => {
    try {
      const res = await api.get(`${API_BASE_URL}/get_course_details.php`, { params: { id: COURSE_ID } });
      if (res.data.status) {
        setCourse(res.data.data);

        // Fetch enrollment progress
        const progRes = await api.get(`${API_BASE_URL}/get_my_enrollments.php`);
        if (progRes.data.status) {
          const enrollment = progRes.data.data.find(e => String(e.course_id) === String(COURSE_ID));
          if (enrollment) setProgress(enrollment.progress);
        }

        // Auto-play first lesson
        const firstSection = res.data.data.curriculum[0];
        if (firstSection && firstSection.lessons.length > 0) {
          handleSelectLesson(firstSection.lessons[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const handleSelectLesson = async (lesson) => {
    setActiveLesson(lesson);
    setVideoUrl(null); // Show loading spinner
    try {
      const { data: res } = await api.get(`/student/get_lesson_video.php`, {
        params: { lesson_id: lesson.id },
      });
      if (res.success) setVideoUrl(res.data.video_path);
      else alert(res.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to load secure video stream.');
    }
  };

  const handleVideoEnd = async () => {
    if (!activeLesson) return;
    try {
      const { data: res } = await api.post(`/student/update_progress.php`, {
        course_id: COURSE_ID,
        lesson_id: activeLesson.id,
      });
      if (res.success) setProgress(res.data.progress);
    } catch (err) {
      console.error('Failed to sync progress with server', err);
    }
  };

  if (loading || !course) return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-500"></div>
      </div>
  );

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      
      {/* Main Video Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Top Navbar inside Player */}
        <div className="p-4 bg-gray-900 border-b border-gray-800 flex justify-between items-center shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">← Back</button>
            <h1 className="text-xl font-bold truncate pr-4 text-gray-100">{course.title}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Progress</span>
            <div className="w-40 bg-gray-800 h-3 rounded-full overflow-hidden shadow-inner">
               <div className="bg-indigo-500 h-3 transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="text-sm font-bold text-indigo-400">{progress}%</span>
          </div>
        </div>
        
        {/* Cinematic Video Container */}
        <div className="flex-1 bg-black flex items-center justify-center p-0 md:p-8">
           {videoUrl ? (
             <video 
               src={videoUrl} 
               controls 
               autoPlay 
               onEnded={handleVideoEnd}
               className="w-full max-h-full rounded-none md:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-gray-800 focus:outline-none"
             ></video>
           ) : (
             <div className="flex flex-col items-center space-y-4">
               <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-gray-400 font-medium tracking-wide">Decrypting Secure Stream...</p>
             </div>
           )}
        </div>
        
        {/* Bottom Details Panel */}
        <div className="p-8 bg-gray-900 border-t border-gray-800 shrink-0">
          <div className="max-w-4xl">
              <h2 className="text-3xl font-extrabold text-white mb-2">{activeLesson?.title || 'Select a lesson to begin'}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400 font-medium">
                  <span>Instructor: {course.instructor_name}</span>
                  <span>•</span>
                  <span>{activeLesson?.duration_minutes || 0} Minutes</span>
              </div>
          </div>
        </div>
      </div>

      {/* Curriculum Sidebar */}
      <div className="w-80 md:w-96 bg-gray-800 h-full border-l border-gray-700 flex flex-col overflow-hidden shrink-0 shadow-2xl z-20">
        <div className="p-6 bg-gray-900 border-b border-gray-700">
            <h3 className="font-extrabold text-lg uppercase tracking-wider text-gray-200">Course Content</h3>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {course.curriculum && course.curriculum.map((section, sIdx) => (
            <div key={section.id} className="border-b border-gray-700 last:border-0">
              <div className="p-4 bg-gray-800/80 font-bold text-gray-300 sticky top-0 backdrop-blur-sm z-10 text-sm">
                Section {sIdx + 1}: {section.title}
              </div>
              <div className="divide-y divide-gray-700/50">
                {section.lessons.map((lesson, lIdx) => {
                  const isActive = activeLesson?.id === lesson.id;
                  return (
                    <div 
                      key={lesson.id} 
                      onClick={() => handleSelectLesson(lesson)}
                      className={`p-4 flex gap-4 cursor-pointer transition-all duration-200 ${isActive ? 'bg-indigo-900/40 border-l-4 border-indigo-500' : 'hover:bg-gray-700/50 border-l-4 border-transparent'}`}
                    >
                      <div className="mt-1">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${isActive ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                          {lIdx + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold leading-snug ${isActive ? 'text-indigo-200' : 'text-gray-300'}`}>{lesson.title}</p>
                        <div className="flex items-center space-x-2 mt-1.5">
                            <span className="text-xs font-medium text-gray-500">▶ {lesson.duration_minutes} min</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
