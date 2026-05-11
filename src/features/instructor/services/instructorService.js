import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const instructorService = {

  getDashboard: () =>
    api.get(ENDPOINTS.INSTRUCTOR.DASHBOARD),

  getCourses: (params = {}) =>
    api.get(ENDPOINTS.INSTRUCTOR.COURSES, { params }),

  getCourseDetail: (id) =>
    api.get(ENDPOINTS.INSTRUCTOR.COURSE_DETAIL(id)),

  createCourse: (data) =>
    api.post(ENDPOINTS.INSTRUCTOR.CREATE_COURSE, data),

  updateCourse: (id, data) =>
    api.put(ENDPOINTS.INSTRUCTOR.UPDATE_COURSE(id), data),

  deleteCourse: (id) =>
    api.delete(ENDPOINTS.INSTRUCTOR.DELETE_COURSE(id)),

  getStudents: (params = {}) =>
    api.get(ENDPOINTS.INSTRUCTOR.STUDENTS, { params }),

  getFinancials: () =>
    api.get(ENDPOINTS.INSTRUCTOR.FINANCIALS),

  submitWithdrawal: (data) =>
    api.post(ENDPOINTS.INSTRUCTOR.FINANCIALS, data),

  getLessons: (courseId) =>
    api.get(ENDPOINTS.INSTRUCTOR.LESSONS, {
      params: { course_id: courseId },
    }),

  createLesson: (data) =>
    api.post(ENDPOINTS.INSTRUCTOR.LESSONS, data),

  uploadVideo: (file, onProgress) => {
    const form = new FormData();
    form.append("video", file);
    return api.post(ENDPOINTS.INSTRUCTOR.UPLOAD_VIDEO, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) =>
        onProgress?.(Math.round((e.loaded / e.total) * 100)),
    });
  },

  uploadImage: (file) => {
    const form = new FormData();
    form.append("image", file);
    return api.post(ENDPOINTS.INSTRUCTOR.UPLOAD_IMAGE, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default instructorService;