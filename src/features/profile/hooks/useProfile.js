import { useState } from "react";
import profileService from "../services/profileService";
import { useAuthStore } from "@/store";

const useProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState(null);
  const [success,   setSuccess]   = useState(false);

  const saveProfile = async (data) => {
    setIsLoading(true); setError(null); setSuccess(false);
    try {
      // const { data: updated } = await profileService.updateProfile(data);
      await new Promise(r => setTimeout(r, 800));
      updateUser(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (payload) => {
    setIsLoading(true); setError(null); setSuccess(false);
    try {
      await profileService.changePassword(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  return { user, saveProfile, changePassword, isLoading, error, success };
};

export default useProfile;