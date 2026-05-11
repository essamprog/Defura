const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost/LMS-React/backend/api",
  APP_NAME: import.meta.env.VITE_APP_NAME || "EDUManage",
  NODE_ENV: import.meta.env.MODE || "development",
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};

export default env;