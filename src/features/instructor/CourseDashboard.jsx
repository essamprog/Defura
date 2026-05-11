import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';

const API_BASE_URL = 'http://localhost/LMS-React/backend/api/instructor';

const CourseDashboard = () => {
  const { user } = useAuthStore();
  const INSTRUCTOR_ID = user?.id;
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', level: 'beginner', category_id: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (INSTRUCTOR_ID) fetchCourses();
  }, [INSTRUCTOR_ID]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/get_my_courses.php`, {
        params: { instructor_id: INSTRUCTOR_ID }
      });
      if (response.data.status) {
        setCourses(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to fetch courses. Please check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/create_course.php`, {
        instructor_id: INSTRUCTOR_ID,
        title: newCourse.title,
        level: newCourse.level,
        category_id: newCourse.category_id || null
      });

      if (response.data.status) {
        setIsModalOpen(false);
        setNewCourse({ title: '', level: 'beginner', category_id: '' });
        fetchCourses(); // Refresh the list
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert('Failed to create course.');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const response = await axios.post(`${API_BASE_URL}/delete_course.php`, {
        id: courseId,
        instructor_id: INSTRUCTOR_ID
      });

      if (response.data.status) {
        // Remove from local state instantly for better UX
        setCourses(courses.filter(c => c.id !== courseId));
      } else {
        alert(response.data.message);
      }
    } catch (err) {
      alert('Failed to delete course.');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Manage your curriculum and content</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Create New Course
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">You haven't created any courses yet.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-indigo-600 font-medium hover:text-indigo-800"
          >
            Start your first course
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-40 bg-gray-200 relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                    No Thumbnail
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(course.status)} shadow-sm uppercase tracking-wider`}>
                    {course.status}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate" title={course.title}>
                  {course.title}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <span className="capitalize">{course.level}</span>
                  <span className="mx-2">•</span>
                  <span>{course.total_lessons} Lessons</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <span className="font-bold text-gray-900">
                    ${parseFloat(course.price).toFixed(2)}
                  </span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                <input 
                  type="text" 
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                  placeholder="e.g., Advanced React Patterns"
                  value={newCourse.title}
                  onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
                  value={newCourse.level}
                  onChange={e => setNewCourse({...newCourse, level: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDashboard;
