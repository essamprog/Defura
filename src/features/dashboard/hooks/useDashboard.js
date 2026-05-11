import { useState, useEffect } from "react";
import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const useDashboard = () => {
  const [stats,          setStats]          = useState(null);
  const [enrolledCourses, setEnrolled]      = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading,      setIsLoading]      = useState(true);
  const [error,          setError]          = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // const { data } = await api.get(ENDPOINTS.INSTRUCTOR.DASHBOARD);
        // setStats(data.stats); setEnrolled(data.courses); setRecentActivity(data.activity);
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        setError(err.response?.data?.message ?? "Failed to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return { stats, enrolledCourses, recentActivity, isLoading, error };
};

export default useDashboard;