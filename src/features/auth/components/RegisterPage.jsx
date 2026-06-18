import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { ErrorMessage } from "@/components/common";
import { ROUTES } from "@/constants";
import useAuth from "../hooks/useAuth";
import PasswordStrengthBar from "../components/PasswordStrengthBar";
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from "../utils/validation";

// ─── Initial State ────────────────────────────────────────────────────────────
const FIELDS = ["fullName", "email", "password", "confirmPassword"];
const INIT = Object.fromEntries(FIELDS.map((k) => [k, ""]));


// ─── Component ────────────────────────────────────────────────────────────────
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const [fields, setFields] = useState(INIT);
  const [errors, setErrors] = useState(INIT);
  const [touched, setTouched] = useState(INIT);
  const [agreed, setAgreed] = useState(false);
  const [agreedError, setAgreedError] = useState("");

  // ── Validate single field ──────────────────────────────────────────────────
  const validate = (name, value) => {
    switch (name) {
      case "fullName": return validateFullName(value);
      case "email": return validateEmail(value);
      case "password": return validatePassword(value);
      case "confirmPassword":
        return validateConfirmPassword(fields.password, value);
      default: return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearError();
    setFields((prev) => ({ ...prev, [name]: value }));

    // Re-validate confirm password when password changes
    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(value),
        confirmPassword: validateConfirmPassword(value, fields.confirmPassword),
      }));
      return;
    }

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(name, value) }));
  };

  // Form is valid when no error strings remain and all fields filled
  const isFormValid =
    FIELDS.every((k) => fields[k].trim() && !errors[k]) && agreed;

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched = Object.fromEntries(FIELDS.map((k) => [k, true]));
    const allErrors = Object.fromEntries(
      FIELDS.map((k) => [k, validate(k, fields[k])])
    );
    setTouched(allTouched);
    setErrors(allErrors);

    if (!agreed) {
      setAgreedError("You must accept the terms to continue.");
    }

    if (Object.values(allErrors).some(Boolean) || !agreed) return;

    const { confirmPassword, fullName, ...rest } = fields;
    const payload = { ...rest, full_name: fullName };
    const result = await register(payload);
    if (result.success) navigate(ROUTES.DASHBOARD, { replace: true });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-gray-500">
          Join Defura-LMS and start learning today.
        </p>
      </div>


      {/* Server-side error */}
      {error && <ErrorMessage message={error} />}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <Input
          name="fullName"
          type="text"
          size="lg"
          placeholder="Full name"
          autoComplete="name"
          required
          value={fields.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.fullName ? errors.fullName : ""}
          leftIcon={<User className="w-4 h-4" />}
        />

        {/* Email */}
        <Input
          name="email"
          type="email"
          size="lg"
          placeholder="Email address"
          autoComplete="email"
          required
          value={fields.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email ? errors.email : ""}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        {/* Password + strength */}
        <div>
          <Input
            name="password"
            type="password"
            size="lg"
            placeholder="Password"
            autoComplete="new-password"
            required
            value={fields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.password ? errors.password : ""}
            leftIcon={<Lock className="w-4 h-4" />}
          />
          <PasswordStrengthBar password={fields.password} />
        </div>

        {/* Confirm Password */}
        <Input
          name="confirmPassword"
          type="password"
          size="lg"
          placeholder="Confirm password"
          autoComplete="new-password"
          required
          value={fields.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword ? errors.confirmPassword : ""}
          leftIcon={<ShieldCheck className="w-4 h-4" />}
        />

        {/* Terms */}
        <div className="space-y-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setAgreedError("");
              }}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer focus:ring-blue-500 focus:ring-offset-0 shrink-0"
            />
            <span className="text-sm text-gray-600 leading-snug">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-blue-600 hover:underline underline-offset-2"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-blue-600 hover:underline underline-offset-2"
                target="_blank"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {agreedError && (
            <p className="text-xs text-red-500 pr-6">{agreedError}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          fullWidth
          size="lg"
          isLoading={isLoading}
          loadingText="Creating account..."
          rightIcon={!isLoading && <ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          Create Account
        </Button>
      </form>

      {/* Mobile-only Sign In link */}
      <div className="text-center md:hidden pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;