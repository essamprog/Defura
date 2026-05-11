import { useState, useEffect, useCallback } from "react";
import adminService from "../services/adminService";

const useAdmin = () => {
  const [stats,    setStats]    = useState(null);
  const [users,    setUsers]    = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [monthlyChart, setMonthlyChart] = useState([]);
  const [isLoading,setIsLoading]= useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: res } = await adminService.getDashboard();
        const dash = res.data;

        setStats(dash.stats);
        setOrders(dash.recentOrders ?? []);
        setUsers(dash.recentUsers   ?? []);
        setMonthlyChart(dash.monthlyChart ?? []);
      } catch (err) {
        setError(
          err.response?.data?.message ?? "Failed to load admin dashboard."
        );
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ── Users ─────────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async (params = {}) => {
    try {
      const { data: res } = await adminService.getUsers(params);
      setUsers(res.data ?? []);
      return res;
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to fetch users.");
    }
  }, []);

  const banUser = useCallback(async (id) => {
    await adminService.updateUser(id, { status: "banned" });
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: "banned" } : u))
    );
  }, []);

  const unbanUser = useCallback(async (id) => {
    await adminService.updateUser(id, { status: "active" });
    setUsers((prev) =>
      prev.map((u) => (u._id === id ? { ...u, status: "active" } : u))
    );
  }, []);

  const deleteUser = useCallback(async (id) => {
    await adminService.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u._id !== id));
  }, []);

  return {
    stats,
    users,
    orders,
    monthlyChart,
    isLoading,
    error,
    fetchUsers,
    banUser,
    unbanUser,
    deleteUser,
  };
};

export default useAdmin;