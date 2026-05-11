import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight } from "lucide-react";

import { Button }       from "@/components/ui";
import { Input }        from "@/components/ui";
import { ErrorMessage } from "@/components/common";
import { ROUTES }       from "@/constants";
import useAuth          from "../hooks/useAuth";
import SocialAuth       from "../components/SocialAuth";
import {
  validateEmail,
  validatePassword,
} from "../utils/validation";

// ─── Initial State ────────────────────────────────────────────────────────────
const INIT_FIELDS  = { email: "", password: "" };
const INIT_ERRORS  = { email: "", password: "" };
const INIT_TOUCHED = { email: false, password: false };

// ─── Component ────────────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate              = useNavigate();
  const location              = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  const [fields,  setFields]  = useState(INIT_FIELDS);
  const [errors,  setErrors]  = useState(INIT_ERRORS);
  const [touched, setTouched] = useState(INIT_TOUCHED);
  const [remember, setRemember] = useState(false);

  // Where to send user after successful login
  const from = location.state?.from?.pathname ?? ROUTES.DASHBOARD;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const validate = (name, value) => {
    if (name === "email")    return validateEmail(value);
    if (name === "password") return validatePassword(value);
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearError();
    setFields((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  const isFormValid =
    !errors.email &&
    !errors.password &&
    fields.email.trim() &&
    fields.password;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Touch all fields to surface errors
    const allTouched = { email: true, password: true };
    const allErrors  = {
      email:    validate("email",    fields.email),
      password: validate("password", fields.password),
    };

    setTouched(allTouched);
    setErrors(allErrors);

    if (Object.values(allErrors).some(Boolean)) return;

    const result = await login({ ...fields, remember });
    if (result.success) navigate(from, { replace: true });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500">
          Sign in to your EDUManage account to continue.
        </p>
      </div>

      {/* Server-side error */}
      {error && <ErrorMessage message={error} />}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Email */}
        <Input
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={fields.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ""}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        {/* Password */}
        <div className="space-y-1">
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            value={fields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ""}
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <div className="flex justify-end">
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="text-xs text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer select-none group w-fit">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="peer w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer focus:ring-blue-500 focus:ring-offset-0"
            />
          </div>
          <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
            Remember me for 30 days
          </span>
        </label>

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          loadingText="Signing in..."
          disabled={!isFormValid && Object.values(touched).some(Boolean)}
          rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Social */}
      <SocialAuth mode="sign in" />

      {/* Register link */}
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          className="font-semibold text-blue-600 hover:text-blue-700 hover:underline underline-offset-2 transition-colors"
        >
          Create one for free
        </Link>
      </p>
    </div>
  );
};

export default LoginPage;