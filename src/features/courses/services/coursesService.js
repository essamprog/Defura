// src/features/courses/services/coursesService.js
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const coursesService = {

  /**
   * GET /courses/index.php
   * Supports: page, per_page, search, category, level, sort, max_price
   */
  getAll: (params = {}) =>
    api.get(ENDPOINTS.COURSES.BASE, { params }),

  /**
   * GET /student/get_course_details.php?id=:id
   * (Schema-consistent public course detail endpoint)
   */
  getById: (id) =>
    api.get(ENDPOINTS.COURSES.PUBLIC_DETAIL(id)),

  /**
   * POST /courses/enroll.php?id=:id
   * Body: { order_id } (required for paid courses)
   */
  enroll: (id, orderId = null) =>
    api.post(ENDPOINTS.COURSES.ENROLL(id), orderId ? { order_id: orderId } : {}),

  /**
   * GET /courses/index.php?categories=1
   * Returns category list with course counts
   */
  getCategories: () =>
    api.get(ENDPOINTS.COURSES.CATEGORIES),

  /**
   * POST /instructor/courses.php
   * Create a new course (instructor only)
   */
  createCourse: (data) =>
    api.post(ENDPOINTS.INSTRUCTOR.CREATE_COURSE, data),

  /**
   * PUT /instructor/courses.php?id=:id
   * Update a course (instructor only)
   */
  updateCourse: (id, data) =>
    api.put(ENDPOINTS.INSTRUCTOR.UPDATE_COURSE(id), data),

  /**
   * DELETE /instructor/courses.php?id=:id
   * Archive a course (instructor only)
   */
  deleteCourse: (id) =>
    api.delete(ENDPOINTS.INSTRUCTOR.DELETE_COURSE(id)),

  /**
   * GET /instructor/courses.php
   * Returns instructor's own courses
   */
  getInstructorCourses: (params = {}) =>
    api.get(ENDPOINTS.INSTRUCTOR.COURSES, { params }),

  /**
   * POST /instructor/lessons.php
   * Add a new lesson to a course
   */
  createLesson: (data) =>
    api.post(ENDPOINTS.INSTRUCTOR.LESSONS, data),

  /**
   * GET /instructor/lessons.php?course_id=:id
   * Get curriculum for a course
   */
  getCurriculum: (courseId) =>
    api.get(ENDPOINTS.INSTRUCTOR.LESSONS, { params: { course_id: courseId } }),

  /**
   * POST /student/progress.php
   * Mark a lesson as complete
   * Body: { course_id, lesson_id, watch_time }
   */
  markLessonComplete: (courseId, lessonId, watchTime = 0) =>
    api.post(ENDPOINTS.STUDENT.COMPLETE_LESSON, {
      course_id:  courseId,
      lesson_id:  lessonId,
      watch_time: watchTime,
    }),

  /**
   * GET /student/progress.php?course_id=:id
   * Get lesson-level progress for a course
   */
  getProgress: (courseId) =>
    api.get(ENDPOINTS.STUDENT.PROGRESS, { params: { course_id: courseId } }),
};

export default coursesService;