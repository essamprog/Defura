import { useState, useEffect, useCallback } from "react";
import instructorService from "../services/instructorService";

const useInstructor = () => {
  const [stats,     setStats]     = useState(null);
  const [courses,   setCourses]   = useState([]);
  const [revenue,   setRevenue]   = useState([]);
  const [students,  setStudents]  = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [dashRes, courseRes] = await Promise.all([
          instructorService.getDashboard(),
          instructorService.getCourses(),
        ]);

        const dash = dashRes.data.data;

        setStats({
          // Stat card values — match InstructorDashboardPage
          revenue:    dash.stats.totalEarnings,
          students:   dash.stats.totalStudents,
          courses:    dash.stats.totalCourses,
          avgRating:  dash.stats.avgRating,
        });

        setRevenue(dash.revenue ?? []);

        // Courses come from the paginated courses endpoint
        const courseData = courseRes.data.data ?? [];
        setCourses(courseData);

      } catch (err) {
        setError(
          err.response?.data?.message ?? "Failed to load dashboard data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const deleteCourse = useCallback(async (id) => {
    try {
      await instructorService.deleteCourse(id);
      setCourses((prev) => prev.filter((c) => (c.id ?? c._id) !== id));
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to delete course.");
    }
  }, []);

  const refreshCourses = useCallback(async (params = {}) => {
    try {
      const res = await instructorService.getCourses(params);
      setCourses(res.data.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to refresh courses.");
    }
  }, []);

  return {
    stats,
    courses,
    revenue,
    students,
    isLoading,
    error,
    deleteCourse,
    refreshCourses,
  };
};

export default useInstructor;