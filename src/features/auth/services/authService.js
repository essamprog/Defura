import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const authService = {
  login: (credentials) =>
    api.post(ENDPOINTS.AUTH.LOGIN, credentials),

  register: (userData) =>
    api.post(ENDPOINTS.AUTH.REGISTER, userData),

  forgotPassword: (email) =>
    api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (token, password) =>
    api.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),

  getMe: () =>
    api.get(ENDPOINTS.AUTH.ME),
};

export default authService;