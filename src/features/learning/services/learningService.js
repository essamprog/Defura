import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const learningService = {
  getProgress:    (courseId)           => api.get(ENDPOINTS.LEARNING.PROGRESS(courseId)),
  getLesson:      (courseId, lessonId) => api.get(ENDPOINTS.LEARNING.LESSON(courseId, lessonId)),
  completeLesson: (courseId, lessonId) => api.post(ENDPOINTS.LEARNING.COMPLETE_LESSON(courseId, lessonId)),
  getCertificate: (courseId)           => api.get(ENDPOINTS.LEARNING.CERTIFICATE(courseId)),
};

export default learningService;