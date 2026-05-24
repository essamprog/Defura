import api from "@/services/api";
import { ENDPOINTS } from "@/services/endpoints";

const profileService = {
  getProfile: () => api.get(ENDPOINTS.USER.PROFILE),

  updateProfile: (data) => api.put(ENDPOINTS.USER.UPDATE_PROFILE, {
    // Send full_name to match the unified backend schema
    full_name: data.full_name ?? data.name,
    email: data.email,
    bio: data.bio,
    website: data.website,
    linkedin: data.linkedin,
    github: data.github,
  }),

  changePassword: (data) => api.patch(ENDPOINTS.USER.CHANGE_PASSWORD, {
    current_password: data.current,
    new_password: data.next,
  }),

  getEnrolled: (params = {}) => api.get(ENDPOINTS.USER.ENROLLED_COURSES, { params }),

  getCertificates: () => api.get(ENDPOINTS.USER.CERTIFICATES),

  uploadAvatar: (file) => {
    // Set Content-Type: undefined so Axios removes the default "application/json"
    // and lets the browser set "multipart/form-data; boundary=..." automatically
    const form = new FormData();
    form.append("avatar", file);
    return api.post(ENDPOINTS.USER.AVATAR, form, {
      headers: { "Content-Type": undefined },
    });
  },
};

export default profileService;