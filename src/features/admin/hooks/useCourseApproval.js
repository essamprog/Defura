import { useState } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";
import { useNotificationsStore } from "@/store";

/**
 * Hook for approving/rejecting courses from admin notifications.
 * Handles loading state and refreshes notifications after action.
 */
const useCourseApproval = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const { fetchNotifications } = useNotificationsStore();

  const approveCourse = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch(
        `${ENDPOINTS.ADMIN.COURSES}?id=${courseId}`,
        { action: "approve" }
      );
      await fetchNotifications();
      return data;
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to approve course");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectCourse = async (courseId) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.patch(
        `${ENDPOINTS.ADMIN.COURSES}?id=${courseId}`,
        { action: "reject" }
      );
      await fetchNotifications();
      return data;
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to reject course");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { approveCourse, rejectCourse, loading, error };
};

export default useCourseApproval;
