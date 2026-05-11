import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '@/store';

const API_BASE_URL = 'http://localhost/LMS-React/backend/api/instructor';

export default function CurriculumBuilder() {
  const { id: COURSE_ID } = useParams();
  const { user } = useAuthStore();
  const INSTRUCTOR_ID = user?.id;
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState(null); // { type: 'lesson', id: 1, sectionId: 2, orderIndex: 1.0 }
  
  // Video upload state
  const [uploadingLessons, setUploadingLessons] = useState({}); // { lessonId: progress }

  const fileInputRef = useRef(null);
  const [uploadTarget, setUploadTarget] = useState(null); // { lessonId, type }

  useEffect(() => {
    if (COURSE_ID && INSTRUCTOR_ID) fetchCurriculum();
  }, [COURSE_ID, INSTRUCTOR_ID]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/get_curriculum.php`, {
        params: { course_id: COURSE_ID, instructor_id: INSTRUCTOR_ID }
      });
      if (res.data.status) {
        setSections(res.data.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      setError('Failed to load curriculum.');
    } finally {
      setLoading(false);
    }
  };

  // ─── ADD SECTION ───
  const handleAddSection = async () => {
    const title = prompt("Enter Section Title:");
    if (!title) return;
    
    // Default order index calculation
    const nextOrder = sections.length > 0 ? Math.max(...sections.map(s => s.order_index)) + 1.0 : 1.0;

    try {
      const res = await axios.post(`${API_BASE_URL}/save_section.php`, {
        course_id: COURSE_ID,
        title,
        order_index: nextOrder
      });
      if (res.data.status) {
        fetchCurriculum();
      }
    } catch (err) {
      alert("Failed to add section.");
    }
  };

  // ─── ADD LESSON ───
  const handleAddLesson = async (sectionId) => {
    const title = prompt("Enter Lesson Title:");
    if (!title) return;

    const section = sections.find(s => s.id === sectionId);
    const nextOrder = section.lessons.length > 0 ? Math.max(...section.lessons.map(l => l.order_index)) + 1.0 : 1.0;

    try {
      const res = await axios.post(`${API_BASE_URL}/save_lesson.php`, {
        section_id: sectionId,
        title,
        status: 'draft',
        video_status: 'ready',
        order_index: nextOrder
      });
      if (res.data.status) {
        fetchCurriculum();
      }
    } catch (err) {
      alert("Failed to add lesson.");
    }
  };

  // ─── DELETE ───
  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      await axios.post(`${API_BASE_URL}/delete_item.php`, { id, type });
      fetchCurriculum();
    } catch (err) {
      alert(`Failed to delete ${type}.`);
    }
  };

  // ─── REAL FILE UPLOAD LOGIC ───
  const triggerUpload = (lessonId, type) => {
    setUploadTarget({ lessonId, type });
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadTarget) return;

    const { lessonId, type } = uploadTarget;
    setUploadingLessons(prev => ({ ...prev, [lessonId]: 0 }));

    // Optimistically set to processing for video
    if (type === 'video') {
      axios.post(`${API_BASE_URL}/save_lesson.php`, { id: lessonId, video_status: 'processing' });
      const newSec = [...sections];
      newSec.forEach(s => s.lessons.forEach(l => { if(l.id === lessonId) l.video_status = 'processing'; }));
      setSections(newSec);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('course_id', COURSE_ID);
    formData.append('lesson_id', lessonId);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload_media.php`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadingLessons(prev => ({ ...prev, [lessonId]: percentCompleted }));
        }
      });

      if (res.data.status) {
        fetchCurriculum(); // Refresh after successful upload
      } else {
        alert(res.data.message);
        if (type === 'video') {
          // Revert processing status on failure
          axios.post(`${API_BASE_URL}/save_lesson.php`, { id: lessonId, video_status: 'failed' }).then(fetchCurriculum);
        }
      }
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
      if (type === 'video') {
        axios.post(`${API_BASE_URL}/save_lesson.php`, { id: lessonId, video_status: 'failed' }).then(fetchCurriculum);
      }
    } finally {
      setUploadingLessons(prev => {
        const newState = { ...prev };
        delete newState[lessonId];
        return newState;
      });
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ─── DRAG & DROP LOGIC (FLOAT REORDERING) ───
  const handleDragStart = (e, item, type, sectionId) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedItem({ ...item, type, sectionId });
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // necessary to allow dropping
  };

  const handleDropLesson = async (e, targetSectionId, targetLessonIndex) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== 'lesson') return;

    const targetSection = sections.find(s => s.id === targetSectionId);
    let newOrderIndex = 1.0;

    if (targetSection.lessons.length === 0) {
      // Empty section
      newOrderIndex = 1.0;
    } else {
      // Insert logic using Float
      const targetLesson = targetSection.lessons[targetLessonIndex];
      const prevLesson = targetSection.lessons[targetLessonIndex - 1];

      if (!prevLesson) {
        // Dropped at the top
        newOrderIndex = targetLesson.order_index - 1.0;
      } else if (!targetLesson) {
        // Dropped at the very bottom
        newOrderIndex = prevLesson.order_index + 1.0;
      } else {
        // Dropped between two lessons
        newOrderIndex = (prevLesson.order_index + targetLesson.order_index) / 2.0;
      }
    }

    // Optimistic UI update
    const updatedSections = [...sections];
    // Remove from old
    const oldSecIndex = updatedSections.findIndex(s => s.id === draggedItem.sectionId);
    const lessonObj = updatedSections[oldSecIndex].lessons.find(l => l.id === draggedItem.id);
    updatedSections[oldSecIndex].lessons = updatedSections[oldSecIndex].lessons.filter(l => l.id !== draggedItem.id);
    
    // Add to new
    lessonObj.order_index = newOrderIndex;
    lessonObj.section_id = targetSectionId;
    const newSecIndex = updatedSections.findIndex(s => s.id === targetSectionId);
    updatedSections[newSecIndex].lessons.splice(targetLessonIndex, 0, lessonObj);
    updatedSections[newSecIndex].lessons.sort((a,b) => a.order_index - b.order_index);
    setSections(updatedSections);

    // Persist to backend
    try {
      await axios.post(`${API_BASE_URL}/update_order.php`, {
        id: draggedItem.id,
        type: 'lesson',
        new_order_index: newOrderIndex,
        section_id: targetSectionId
      });
    } catch (err) {
      alert("Failed to update lesson order.");
      fetchCurriculum(); // revert
    }
    setDraggedItem(null);
  };

  if (loading) return <div className="p-10 text-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept={uploadTarget?.type === 'video' ? "video/mp4,video/webm" : "application/pdf,application/zip,.zip"} 
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Curriculum Builder</h1>
          <p className="text-gray-500">Drag and drop lessons to reorder them.</p>
        </div>
        <button onClick={handleAddSection} className="bg-gray-900 text-white px-4 py-2 rounded shadow hover:bg-gray-800 font-semibold">
          + New Section
        </button>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            
            {/* SECTION HEADER */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800">
                Section: {section.title}
              </h2>
              <div className="flex space-x-3">
                <button onClick={() => handleAddLesson(section.id)} className="text-sm font-semibold text-blue-600 hover:text-blue-800">
                  + Add Lesson
                </button>
                <button onClick={() => handleDelete(section.id, 'section')} className="text-sm font-semibold text-red-500 hover:text-red-700">
                  Delete
                </button>
              </div>
            </div>

            {/* LESSONS LIST */}
            <div 
              className="p-4 min-h-[50px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDropLesson(e, section.id, section.lessons.length)}
            >
              {section.lessons.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-4 border-2 border-dashed border-gray-100 rounded">
                  Drop a lesson here or click "+ Add Lesson"
                </div>
              ) : (
                <div className="space-y-2">
                  {section.lessons.map((lesson, idx) => {
                    const isUploading = uploadingLessons[lesson.id] !== undefined;
                    const progress = uploadingLessons[lesson.id] || 0;

                    return (
                      <div 
                        key={lesson.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lesson, 'lesson', section.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDropLesson(e, section.id, idx);
                        }}
                        className="bg-white border border-gray-200 p-3 flex flex-col rounded cursor-grab active:cursor-grabbing hover:border-blue-400 transition-colors shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <span className="text-gray-400 cursor-grab">⠿</span>
                            <span className="font-medium text-gray-800">{lesson.title}</span>
                            {lesson.video_status === 'processing' && !isUploading && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Processing Video...</span>
                            )}
                            {lesson.status === 'draft' && (
                              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">Draft</span>
                            )}
                          </div>
                          
                          <div className="flex space-x-3">
                            <button 
                              onClick={() => triggerUpload(lesson.id, 'video')} 
                              className="text-xs font-semibold text-blue-500 hover:text-blue-700"
                            >
                              Upload Video
                            </button>
                            <button 
                              onClick={() => triggerUpload(lesson.id, 'resource')} 
                              className="text-xs font-semibold text-purple-500 hover:text-purple-700"
                            >
                              Add Resource
                            </button>
                            <button 
                              onClick={() => handleDelete(lesson.id, 'lesson')} 
                              className="text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {isUploading && (
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 inline-block">Uploading... {progress}%</span>
                          </div>
                        )}

                        {/* Resources */}
                        {lesson.resources && lesson.resources.length > 0 && (
                          <div className="mt-3 pl-6 border-l-2 border-gray-100">
                            <span className="text-xs font-semibold text-gray-500 uppercase">Resources</span>
                            <div className="mt-1 space-y-1">
                              {lesson.resources.map(res => (
                                <div key={res.id} className="text-sm flex justify-between items-center bg-gray-50 p-1.5 rounded">
                                  <span className="text-gray-600">📎 {res.file_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
